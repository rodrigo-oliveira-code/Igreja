import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/contas-bancarias/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const data = await req.json()

  const conta = await prisma.contaBancaria.update({
    where: { id },
    data: {
      nome: data.nome,
      banco: data.banco,
      agencia: data.agencia || null,
      conta: data.conta,
      tipo: data.tipo,
      saldoAtual: data.saldoAtual,
    },
  })

  return NextResponse.json(conta)
}

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/contas-bancarias/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const data = await req.json()

  const conta = await prisma.contaBancaria.update({
    where: { id },
    data: { ativa: data.ativa },
  })

  return NextResponse.json(conta)
}
