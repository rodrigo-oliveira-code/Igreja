export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/membros/:path*',
    '/departamentos/:path*',
    '/eventos/:path*',
    '/escalas/:path*',
    '/financeiro/:path*',
    '/configuracoes/:path*',
  ],
}
