import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/escalas/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const data = await req.json()

  const escala = await prisma.escala.update({
    where: { id },
    data: { confirmado: data.confirmado, funcao: data.funcao },
  })

  return NextResponse.json(escala)
}

export async function DELETE(req: NextRequest, ctx: RouteContext<'/api/escalas/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  await prisma.escala.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
