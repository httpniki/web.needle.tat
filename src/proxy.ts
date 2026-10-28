import { type NextRequest, NextResponse } from 'next/server'

import { updateSession } from '@/lib/supabase/middleware'

export default async function proxy(request: NextRequest) {
   const { response, user } = await updateSession(request)
   const isArtist = user?.app_metadata.role === 'artist'
   const isLoginRoute = request.nextUrl.pathname === '/login'

   if (!isArtist && !isLoginRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.search = ''

      return redirectWithCookies(url, response)
   }

   if (isArtist && isLoginRoute) {
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
   matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
