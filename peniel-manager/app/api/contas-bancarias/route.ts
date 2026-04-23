import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const ativa = searchParams.get('ativa')

  const contas = await prisma.contaBancaria.findMany({
    where: { ...(ativa !== null && { ativa: ativa === 'true' }) },
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(contas)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()

  const conta = await prisma.contaBancaria.create({
    data: {
      nome: data.nome,
      banco: data.banco,
      agencia: data.agencia || null,
      conta: data.conta,
      tipo: data.tipo,
      saldoAtual: data.saldoAtual || 0,
    },
  })

  return NextResponse.json(conta, { status: 201 })
}
