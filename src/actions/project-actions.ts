'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import ServerActionException from "../utils/exceptions/action-exception"
import { createCustomer, findCustomerById } from "./customer-actions"
import { createSession, findSessionsByProjectId } from "./session-actions"
import { v2 as cloudinary } from 'cloudinary'
import { TattooProjectObject } from "@/domain/TattooProject"
import { CustomerObject } from "@/domain/Customer"
import { TattooSessionObject } from "@/domain/TattooSession"

interface NewProject {
   references: File[]
   customer: Parameters<typeof createCustomer>[0] & { id?: string }
   sessions: Omit<Parameters<typeof createSession>[0], 'projectId'>[]
}

interface ProjectModel {
   id: string
   customer_id: string
   observations?: string
   images: string[]
   references: string[]
   created_at: string
}

export async function createProject(
   customer: NewProject['customer'],
   sessions: NewProject['sessions'],
   references: NewProject['references']
): Promise<TattooProjectObject> {
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
      imagesUrls = await Promise.all(
         references.map(async (file) => {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            return new Promise<string>((resolve, reject) => {
               cloudinary.uploader
                  .upload_stream(
                     {
                        folder: 'needle',
                        unique_filename: true,
                        public_id: crypto.randomUUID(),
                     },
                     (err, result) => {
                        if (err || !result?.secure_url) return reject(err)
                        resolve(result.secure_url)
                     }
                  )
                  .end(buffer)
            })
         })
      )
   } catch {
      const exception = new ServerActionException('Unexpected error uploading images')
      exception.name = 'unexpected_error'
      throw exception
   }

   const projectResult = await db
      .from('projects')
      .insert({
         customer_id: c.id,
         observations: sessions[0].observations,
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
      sessions.map(async (session) => await createSession({ ...session, projectId: projectResult.data.id }))
   )

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
