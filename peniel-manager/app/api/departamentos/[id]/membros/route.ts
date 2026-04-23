import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, ctx: RouteContext<'/api/departamentos/[id]/membros'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const { membroId, funcao } = await req.json()

  const membroDepto = await prisma.membroDepto.upsert({
    where: { membroId_departamentoId: { membroId, departamentoId: id } },
    update: { funcao },
    create: { membroId, departamentoId: id, funcao },
  })

  return NextResponse.json(membroDepto, { status: 201 })
}

export async function DELETE(req: NextRequest, ctx: RouteContext<'/api/departamentos/[id]/membros'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const { membroId } = await req.json()

  await prisma.membroDepto.delete({
    where: { membroId_departamentoId: { membroId, departamentoId: id } },
  })

  return NextResponse.json({ success: true })
}
