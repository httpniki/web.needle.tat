'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import ServerActionException from "../utils/exceptions/action-exception"
import { Currency, SessionStatus, TattooSessionObject } from "@/domain/TattooSession"

interface NewSession {
   projectId: string
   starts_at: Date
   ends_at: Date
   observations?: string
   booking_fee?: number
   price: number
   currency: 'EUR' | 'USD' | 'ARS'
}

interface SessionModel {
   id: string
   project_id: string
   starts_at: Date
   ends_at: Date
   observations: string
   booking_fee: number
   status: SessionStatus
   price: number
   currency: Currency
   created_at: string
}

export async function createSession(newSession: NewSession): Promise<TattooSessionObject> {
   const db = createClient(await cookies())

   if (newSession.starts_at instanceof Date && isNaN(newSession.starts_at.getTime())) {
      const err = new Error('Invalid session starts_at date')
      err.name = 'invalid_date'
      throw err
   }

   if (newSession.ends_at instanceof Date && isNaN(newSession.ends_at.getTime())) {
      const err = new Error('Invalid session ends_at date')
      err.name = 'invalid_date'
      throw err
   }

   const conflicts = await hasSessionConflict(newSession.starts_at, newSession.ends_at)

   if (conflicts.length > 0) {
      const err = new ServerActionException('The session time is already occupied')
      err.name = 'session_time_conflict'
      throw err
   }

   const result = await db
      .from('sessions')
      .insert({
         project_id: newSession.projectId,
         starts_at: newSession.starts_at,
         ends_at: newSession.ends_at,
         observations: newSession.observations,
         price: newSession.price,
         currency: newSession.currency,
         booking_fee: newSession.booking_fee
      })
      .select<string, SessionModel>('*')
      .single()

   if (result.error || !result.data) {
      const err = new Error('Unexpected error creating session')
      err.name = 'unexpected_error'
      throw err
   }

   return {
      id: result.data.id,
      starts_at: result.data.starts_at,
      ends_at: result.data.ends_at,
      observations: result.data.observations,
      status: result.data.status,
      booking_fee: result.data.booking_fee,
      price: result.data.price,
      currency: result.data.currency
   }
}

export async function hasSessionConflict(startsAt: Date, endsAt: Date, excludeSessionId?: string): Promise<TattooSessionObject[]> {
   const db = createClient(await cookies())

   if (isNaN(startsAt.getTime()) || isNaN(endsAt.getTime())) {
      const err = new ServerActionException('Fechas de sesión inválidas para la validación')
      err.name = 'invalid_date'
      throw err
   }

   let query = db
      .from('sessions')
      .select('*')
      .lt('starts_at', endsAt.toISOString()) // El inicio existente debe ser menor al nuevo fin
      .gt('ends_at', startsAt.toISOString()) // El fin existente debe ser mayor al nuevo inicio
      .neq('status', 'CANCELED')

   if (excludeSessionId) query = query.neq('id', excludeSessionId)

   const { data, error } = await query.limit(1)

   if (error) {
      const err = new ServerActionException('Error inesperado al validar la disponibilidad del horario')
      err.name = 'unexpected_error'
      throw err
   }

   return data.map((session) => ({
      id: session.id,
      starts_at: session.starts_at,
      ends_at: session.ends_at,
      booking_fee: session.booking_fee,
      observations: session.observations,
      status: session.status,
      price: session.price,
      currency: session.currency
   }))
}

export default async function findSessionById(id: string): Promise<TattooSessionObject> {
   const db = createClient(await cookies())

   const { data, error } = await db
      .from('sessions')
      .select('*')
      .eq('id', id)

   if (error) {
      const exception = new ServerActionException('Unexpected error finding session')
      exception.name = 'unexpected_error'
      throw exception
   }

   if (!data || data.length === 0) {
      const exception = new ServerActionException('Session not found')
      exception.name = 'session_not_found'
      throw exception
   }

   const session = data[0]

   return {
      id: session.id,
      starts_at: session.starts_at,
      ends_at: session.ends_at,
      observations: session.observations,
      status: session.status,
      price: session.price,
      booking_fee: session.booking_fee,
      currency: session.currency
   }
}

export async function findSessionsByProjectId(projectId: string): Promise<TattooSessionObject[]> {
   const db = createClient(await cookies())

   const { data, error } = await db
      .from('sessions')
      .select('*')
      .eq('project_id', projectId)

   if (error) {
      const exception = new ServerActionException('Unexpected error finding sessions')
      exception.name = 'unexpected_error'
      throw exception
   }

   return data.map((session) => ({
      id: session.id,
      starts_at: session.starts_at,
      ends_at: session.ends_at,
      observations: session.observations,
      status: session.status,
      price: session.price,
      booking_fee: session.booking_fee,
      currency: session.currency
   }))
}
