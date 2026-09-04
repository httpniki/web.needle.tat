'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import ActionException from "../utils/exceptions/action-exception"
import { CustomerType as Customer } from "@/domain/Customer"

interface NewCustomer {
   name: string
   username?: string
   phone_number: string
   email?: string
}

interface CustomerModel {
   id: string
   name: string
   email?: string
   username?: string
   phone_number: string
   created_at: string
}

export async function createCustomer(body: NewCustomer): Promise<Customer> {
   const cookieStore = await cookies()
   const db = createClient(cookieStore)

   const filters: string[] = []

   if (body.email) filters.push(`email.eq.${body.email}`)
   if (body.username) filters.push(`username.eq.${body.username}`)
   if (body.phone_number) filters.push(`phone_number.eq.${body.phone_number}`)
   if (body.name) filters.push(`name.eq.${body.name}`)

   if (filters.length > 0) {
      const result = await db
         .from('customers')
         .select('id, name, username, phone_number, email')
         .or(filters.join(','))

      if (result.error) {
         const err = new ActionException('Unexpected error validating customer')
         err.name = 'unexpected_error'

         throw err
      }

      if (body.email && result.data.some((customer) => customer.email === body.email)) {
         const err = new ActionException('Customer with this email already exists')
         err.name = 'customer_with_email_exists'
         err.data = { email: body.email }

         throw err
      }

      if (body.username && result.data.some((customer) => customer.username === body.username)) {
         const err = new ActionException('Customer with this username already exists')
         err.name = 'customer_with_username_exists'
         err.data = { username: body.username }

         throw err
      }

      if (body.phone_number && result.data.some((customer) => customer.phone_number === body.phone_number)) {
         const err = new ActionException('Customer with this phone number already exists')
         err.name = 'customer_with_phone_number_exists'
         err.data = { phone_number: body.phone_number }
         throw err
      }

      if (body.name && result.data.some((customer) => customer.name === body.name)) {
         const err = new ActionException('Customer with this name already exists')
         err.name = 'customer_with_name_exists'
         err.data = { name: body.name }
         throw err
      }
   }

   const results = await db
      .from('customers')
      .insert(body)
      .select<string, CustomerModel>('*')
      .single()

   if (results.error) {
      const err = new ActionException('Unexpected error creating customer')
      err.name = 'unexpected_error'
      throw err
   }

   return {
      id: results.data.id,
      name: results.data.name,
      username: results.data.username,
      phone_number: results.data.phone_number,
      email: results.data.email
   }
}

export async function findCustomers(q: string): Promise<Customer[]> {
   const db = createClient(await cookies())

   const results = await db
      .from('customers')
      .select<string, CustomerModel>('*')
      .or(`name.imatch.${q},username.imatch.${q},phone_number.imatch.${q},email.imatch.${q}`)

   if (results.error) {
      const err = new ActionException('Unexpected error finding customers')
      err.name = 'unexpected_error'
      throw err
   }

   return results.data.map((customer) => ({
      id: customer.id,
      name: customer.name,
      username: customer.username,
      phone_number: customer.phone_number,
      email: customer.email
   }))
}

export async function findCustomerById(id: string): Promise<Customer> {
   const db = createClient(await cookies())

   const result = await db
      .from('customers')
      .select<string, CustomerModel>('*')
      .eq('id', id)
      .single()

   if (result.error) {
      const err = new ActionException('Unexpected error finding customer')
      err.name = 'unexpected_error'
      throw err
   }

   if (!result.data) {
      const err = new ActionException('Customer not found')
      err.name = 'customer_not_found'
      throw err
   }

   return {
      id: result.data.id,
      name: result.data.name,
      username: result.data.username,
      phone_number: result.data.phone_number,
      email: result.data.email
   }
}

export async function getCustomers(): Promise<Customer[]> {
   const db = createClient(await cookies())

   const results = await db
      .from('customers')
      .select<string, CustomerModel>('*')
      .order('name')

   if (results.error) {
      const err = new ActionException('Unexpected error getting customers')
      err.name = 'unexpected_error'
      throw err
   }

   return results.data.map((customer) => ({
      id: customer.id,
      name: customer.name,
      username: customer.username,
      phone_number: customer.phone_number,
      email: customer.email
   }))
}
