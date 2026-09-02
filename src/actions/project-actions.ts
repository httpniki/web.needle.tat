'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import ServerActionException from "../utils/exceptions/action-exception"
import { createCustomer, findCustomerById } from "./customer-actions"
import { createSession } from "./session-actions"
import { v2 as cloudinary } from 'cloudinary'
import { CustomerType } from "@/domain/Customer"
import { TattooSessionType } from "@/domain/TattooSession"
import { TattooProjectType } from "@/domain/TattooProject"

interface NewProject {
   references: File[]
   customer: Parameters<typeof createCustomer>[0] & { id?: string }
   sessions: Omit<Parameters<typeof createSession>[0], 'projectId'>[]
}

interface NewProjectResult {
   project: TattooProjectType
   customer: Awaited<ReturnType<typeof createCustomer>>
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
): Promise<NewProjectResult> {
   const db = createClient(await cookies())
   let c: CustomerType | null = null

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

   const s: TattooSessionType[] = await Promise.all(
      sessions.map(async (session) => await createSession({ ...session, projectId: projectResult.data.id }))
   )

   return {
      project: {
         id: projectResult.data.id,
         customer_id: c.id,
         images: projectResult.data.images,
         references: projectResult.data.references,
         sessions: s
      },
      customer: c
   }
}
