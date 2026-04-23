import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, ctx: RouteContext<'/api/departamentos/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params

  const departamento = await prisma.departamento.findUnique({
    where: { id },
    include: { membros: { include: { membro: true } } },
  })

  if (!departamento) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(departamento)
}

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/departamentos/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const data = await req.json()

  const departamento = await prisma.departamento.update({
    where: { id },
    data: {
      nome: data.nome,
      descricao: data.descricao || null,
      cor: data.cor || '#7C3AED',
      liderId: data.liderId || null,
    },
  })

  return NextResponse.json(departamento)
}

export async function DELETE(req: NextRequest, ctx: RouteContext<'/api/departamentos/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  await prisma.departamento.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
