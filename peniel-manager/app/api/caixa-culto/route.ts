import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const sessoes = await prisma.cultoSessao.findMany({
    where: { ...(status && { status: status as any }) },
    include: {
      responsavel: { select: { id: true, nome: true } },
      lancamentos: { where: { ativo: true }, select: { valor: true, tipo: true } },
    },
    orderBy: { data: 'desc' },
  })

  return NextResponse.json(sessoes)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const userId = (session.user as any).id

  const sessao = await prisma.cultoSessao.create({
    data: {
      data: new Date(data.data),
      tipoCulto: data.tipoCulto,
      responsavelId: userId,
      saldoInicial: data.saldoInicial || 0,
    },
    include: { responsavel: { select: { id: true, nome: true } } },
  })

  return NextResponse.json(sessao, { status: 201 })
}
