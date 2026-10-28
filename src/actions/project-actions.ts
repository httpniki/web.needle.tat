'use server'

import { cookies } from 'next/headers'

import { CustomerObject } from '@/domain/Customer'
import { TattooProjectObject } from '@/domain/TattooProject'
import { TattooSessionObject } from '@/domain/TattooSession'
import { requireArtist } from '@/lib/auth'
import { deleteFromCloudinary } from '@/lib/cloudinary/delete'
import { uploadFile } from '@/lib/cloudinary/upload'
import { createClient } from '@/lib/supabase/server'

import ServerActionException from '../utils/exceptions/action-exception'
import { createCustomer, findCustomerById } from './customer-actions'
import { createSession, findSessionsByProjectId } from './session-actions'

interface ProjectModel {
   id: number
   customer_id: number
   observations?: string
   project_name: string
   body_part: string
   images: string[]
   references: string[]
   created_at: string
}

interface CreateProjectParams {
   customer: CustomerObject
   project: TattooProjectObject
}

export async function createProject({ customer, project }: CreateProjectParams): Promise<{
   customer: CustomerObject
   project: TattooProjectObject
}> {
   await requireArtist()

   const db = createClient(await cookies())
   let c: CustomerObject | null = null

   if (customer.id) c = await findCustomerById(customer.id)
   if (!customer.id) c = await createCustomer(customer)

   if (!c) {
      const exception = new ServerActionException('Unexpected error')
      exception.name = 'unexpected_error'
      throw exception
   }

   let imagesUrls: string[] = []

   try {
      imagesUrls = await Promise.all(project.references.map(async (r) => {
         if (!r.file) throw new Error(`No se encontró el archivo ${r.url}`)
         return await uploadFile(r.file)
      }))
   } catch (error) {
      const exception = new ServerActionException('Unexpected error uploading images')
      exception.name = 'unexpected_error'
      console.error(error)
      throw exception
   }

   const projectResult = await db
      .from('projects')
      .insert({
         customer_id: c.id,
         observations: project.observations,
         project_name: project.projectName,
         body_part: project.bodyPart,
         images: [],
         references: imagesUrls
      })
      .select<string, ProjectModel>('*')
      .single()

   if (projectResult.error || !projectResult.data) {
      const exception = new ServerActionException('Unexpected error creating project')
      exception.name = 'unexpected_error'
      throw exception
   }

   const s: TattooSessionObject[] = await Promise.all(
      project.sessions.map(async ({ id: _id, ...session }) => await createSession({ ...session, projectId: projectResult.data.id }))
   )
      .catch(async (error) => {
         await db
            .from('projects')
            .delete()
            .eq('id', projectResult.data.id)

         throw error
      })

   const createdProject: TattooProjectObject = {
      id: projectResult.data.id,
      projectName: projectResult.data.project_name,
      bodyPart: projectResult.data.body_part,
      images: projectResult.data.images,
      references: projectResult.data.references.map((url) => ({ url })),
      sessions: s,
      observations: projectResult.data.observations
   }

   return {
      customer: {
         ...c,
         tattooProjects: await getProjectsByCustomerId(c.id)
      },
      project: createdProject
   }
}

export async function getProjects(): Promise<TattooProjectObject[]> {
   const db = createClient(await cookies())

   const { data, error } = await db
      .from('projects')
      .select<string, ProjectModel>('*')
      .order('created_at', { ascending: false })

   if (error) {
      const exception = new ServerActionException('Unexpected error getting projects')
      exception.name = 'unexpected_error'
      throw exception
   }

   return Promise.all(data.map(async (project) => {
      const sessions = await findSessionsByProjectId(project.id)

      return {
         id: project.id,
         images: project.images,
         projectName: project.project_name,
         bodyPart: project.body_part,
         references: project.references.map((url) => ({ url })),
         sessions,
         observations: project.observations
      }
   }))
}

export async function getProjectsByCustomerId(customerId: number): Promise<TattooProjectObject[]> {
   const db = createClient(await cookies())

   const { data, error } = await db
      .from('projects')
      .select<string, ProjectModel>('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

   if (error) {
      const exception = new ServerActionException('Unexpected error getting projects')
      exception.name = 'unexpected_error'
      throw exception
   }

   return Promise.all(data.map(async (project) => {
      const sessions = await findSessionsByProjectId(project.id)

      return {
         id: project.id,
         images: project.images,
         projectName: project.project_name,
         bodyPart: project.body_part,
         references: project.references.map((url) => ({ url })),
         sessions,
         observations: project.observations
      }
   }))
}

interface GetProjectOptions {
   projectId?: string
}

export async function getProject({ projectId }: GetProjectOptions): Promise<TattooProjectObject> {
   const db = createClient(await cookies())

   const projectResult = await db
      .from('projects')
      .select<string, ProjectModel>('*')
      .eq('id', projectId)
      .single()

   if (projectResult.error || !projectResult.data) {
      const exception = new ServerActionException('Unexpected error getting project')
      exception.name = 'unexpected_error'
      throw exception
   }

   const sessions = await findSessionsByProjectId(projectResult.data.id)

   return {
      id: projectResult.data.id,
      images: projectResult.data.images,
      projectName: projectResult.data.project_name,
      bodyPart: projectResult.data.body_part,
      references: projectResult.data.references.map((url) => ({ url })),
      sessions,
      observations: projectResult.data.observations
   }
}

export interface UpdateProjectParams {
   projectName?: string
   observations?: string
   addImages?: File[]
   removeImages?: string[]
   addReferences?: File[]
   removeReferences?: string[]
}

export async function updateProject(id: ProjectModel['id'], data: UpdateProjectParams): Promise<TattooProjectObject> {
   await requireArtist()

   const db = createClient(await cookies())
   const currentProject = await getProject({ projectId: String(id) })

   const payload: Partial<ProjectModel> = {}
   const urlsToDelete: string[] = []

   if (data.projectName !== undefined && data.projectName !== currentProject.projectName) {
      payload.project_name = data.projectName
   }

   if (data.observations !== undefined && data.observations !== currentProject.observations) {
      payload.observations = data.observations
   }

   const hasImageRemovals = !!(data.removeImages && data.removeImages.length > 0)
   const hasImageAdditions = !!(data.addImages && data.addImages.length > 0)

   if (hasImageRemovals || hasImageAdditions) {
      const removeSet = new Set(data.removeImages)

      let updatedImages = currentProject.images
         .filter((url) => {
            if (removeSet.has(url)) { urlsToDelete.push(url); return false }
            return true
         })

      if (hasImageAdditions && data.addImages) {
         const filesToUpload = data.addImages.filter((item): item is File => item instanceof File)
         const newUploadedUrls = await Promise.all(filesToUpload.map((file) => uploadFile(file)))

         updatedImages = [...updatedImages, ...newUploadedUrls]
      }

      payload.images = updatedImages
   }

   const hasRefRemovals = !!(data.removeReferences && data.removeReferences.length > 0)
   const hasRefAdditions = !!(data.addReferences && data.addReferences.length > 0)

   if (hasRefRemovals || hasRefAdditions) {
      const removeSet = new Set(data.removeReferences ?? [])
      const currentRefUrls = currentProject.references.map((r) => (typeof r === 'string' ? r : r.url))

      let updatedReferences = currentRefUrls.filter((url) => {
         if (removeSet.has(url)) { urlsToDelete.push(url); return false }
         return true
      })

      if (hasRefAdditions && data.addReferences) {
         const filesToUpload = data.addReferences.filter((item): item is File => item instanceof File)
         const newUploadedUrls = await Promise.all(filesToUpload.map((file) => uploadFile(file)))
         updatedReferences = [...updatedReferences, ...newUploadedUrls]
      }

      payload.references = updatedReferences
   }

   if (Object.keys(payload).length === 0) {
      const err = new ServerActionException('No se detectaron cambios con respecto al estado actual del proyecto')
      err.name = 'no_changes'
      throw err
   }

   const { data: _result, error } = await db
      .from('projects')
      .update(payload)
      .eq('id', id)

   if (error) {
      const err = new ServerActionException('Error inesperado al actualizar el proyecto')
      err.name = 'unexpected_error'
      throw err
   }

   if (urlsToDelete.length > 0) await Promise.allSettled(urlsToDelete.map((url) => deleteFromCloudinary(url)))

   return await getProject({ projectId: String(id) })
}
