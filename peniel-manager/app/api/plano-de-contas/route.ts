import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo')
  const ativo = searchParams.get('ativo')

  const contas = await prisma.planoDeContas.findMany({
    where: {
      ...(tipo && { tipo: tipo as any }),
      ...(ativo !== null && { ativo: ativo === 'true' }),
    },
    orderBy: { codigo: 'asc' },
  })

  return NextResponse.json(contas)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()

  const conta = await prisma.planoDeContas.create({
    data: {
      codigo: data.codigo,
      nome: data.nome,
      tipo: data.tipo,
      paiId: data.paiId || null,
    },
  })

  return NextResponse.json(conta, { status: 201 })
}
