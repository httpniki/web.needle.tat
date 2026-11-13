import { type NextRequest, NextResponse } from 'next/server'

import { hasAppAccess } from '@/lib/roles'
import { updateSession } from '@/lib/supabase/middleware'

export default async function proxy(request: NextRequest) {
   const { response, user } = await updateSession(request)
   const hasAccess = hasAppAccess(user?.app_metadata.role)
   const isLoginRoute = request.nextUrl.pathname === '/login'
   const isPasswordSetupRoute = request.nextUrl.pathname === '/auth/set-password'
   const needsPasswordSetup = hasAccess && user?.app_metadata.password_set === false

   if (needsPasswordSetup && isPasswordSetupRoute === false) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/set-password'
      url.search = ''

      return redirectWithCookies(url, response)
   }

   if (hasAccess && isPasswordSetupRoute && needsPasswordSetup === false) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.search = ''

      return redirectWithCookies(url, response)
   }

   if (!hasAccess && !isLoginRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.search = ''

      return redirectWithCookies(url, response)
   }

   if (hasAccess && isLoginRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.search = ''

      return redirectWithCookies(url, response)
   }

   return response
}

function redirectWithCookies(url: URL, response: NextResponse) {
   const redirectResponse = NextResponse.redirect(url)

   response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie))

   return redirectResponse
}

export const config = {
   matcher: ['/((?!api|auth/confirm|_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
