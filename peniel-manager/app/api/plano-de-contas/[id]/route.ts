import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/plano-de-contas/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const data = await req.json()

  const conta = await prisma.planoDeContas.update({
    where: { id },
    data: {
      codigo: data.codigo,
      nome: data.nome,
      tipo: data.tipo,
      paiId: data.paiId || null,
    },
  })

  return NextResponse.json(conta)
}

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/plano-de-contas/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const data = await req.json()

  const conta = await prisma.planoDeContas.update({
    where: { id },
    data: { ativo: data.ativo },
  })

  return NextResponse.json(conta)
}
