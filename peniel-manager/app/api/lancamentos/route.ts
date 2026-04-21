import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const mes = searchParams.get('mes')
  const ano = searchParams.get('ano')
  const tipo = searchParams.get('tipo')

  let startDate: Date | undefined
  let endDate: Date | undefined

  if (mes && ano) {
    startDate = new Date(Number(ano), Number(mes) - 1, 1)
    endDate = new Date(Number(ano), Number(mes), 0, 23, 59, 59)
  }

  const lancamentos = await prisma.lancamento.findMany({
    where: {
      ...(startDate && endDate && { data: { gte: startDate, lte: endDate } }),
      ...(tipo && { tipo: tipo as any }),
    },
    orderBy: { data: 'desc' },
  })

  return NextResponse.json(lancamentos)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()

  const lancamento = await prisma.lancamento.create({
    data: {
      tipo: data.tipo,
      categoria: data.categoria,
      valor: data.valor,
      descricao: data.descricao || null,
      data: new Date(data.data),
    },
  })

  return NextResponse.json(lancamento, { status: 201 })
}
