'use server'

import { cookies } from 'next/headers'

import { CustomerObject } from '@/domain/Customer'
import { TattooProjectObject } from '@/domain/TattooProject'
import { TattooSessionObject } from '@/domain/TattooSession'
import { deleteFromCloudinary } from '@/lib/cloudinary/delete'
import { uploadFile } from '@/lib/cloudinary/upload'
import { createClient } from '@/lib/supabase/server'

import ServerActionException from '../utils/exceptions/action-exception'
import { createCustomer, findCustomerById } from './customer-actions'
import { createSession, findSessionsByProjectId } from './session-actions'

interface ProjectModel {
   id: number
   customer_id: string
   observations?: string
   images: string[]
   references: string[]
   created_at: string
}

export async function createProject(project: TattooProjectObject): Promise<TattooProjectObject> {
   const db = createClient(await cookies())
   let c: CustomerObject | null = null

   if (project.customer.id) c = await findCustomerById(project.customer.id)
   if (!project.customer.id) c = await createCustomer(project.customer)

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

   return {
      id: projectResult.data.id,
      customer: c,
      images: projectResult.data.images,
      references: projectResult.data.references.map((url) => ({ url })),
      sessions: s
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

   const projects: TattooProjectObject[] = await Promise.all(data.map(async (project) => {
      const [customer, sessions] = await Promise.all([
         await findCustomerById(project.customer_id),
         await findSessionsByProjectId(project.id)
      ])

      return {
         id: project.id,
         customer: customer,
         images: project.images,
         references: project.references.map((url) => ({ url })),
         sessions: sessions,
         observations: project.observations
      }
   }))

   return projects
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
   const customer = await findCustomerById(projectResult.data.customer_id)

   return {
      id: projectResult.data.id,
      images: projectResult.data.images,
      references: projectResult.data.references.map((url) => ({ url })),
      sessions: sessions.map((s) => ({
         id: s.id,
         starts_at: s.starts_at,
         ends_at: s.ends_at,
         observations: s.observations,
         status: s.status,
         booking_fee: s.booking_fee,
         price: s.price,
         currency: s.currency
      })),
      customer: {
         id: customer.id,
         username: customer.username,
         email: customer.email,
         name: customer.name,
         phone_number: customer.phone_number,
      },
      observations: projectResult.data.observations
   }
}

export interface UpdateProjectParams {
   observations?: string
   addImages?: File[]
   removeImages?: string[]
   addReferences?: File[]
   removeReferences?: string[]
}

export async function updateProject(id: ProjectModel['id'], data: UpdateProjectParams): Promise<TattooProjectObject> {
   const db = createClient(await cookies())
   const currentProject = await getProject({ projectId: String(id) })

   const payload: Partial<ProjectModel> = {}
   const urlsToDelete: string[] = []

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
