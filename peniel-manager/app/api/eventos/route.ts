import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const eventos = await prisma.evento.findMany({
    where: {
      ...(from && to && {
        data: { gte: new Date(from), lte: new Date(to) },
      }),
    },
    include: {
      escalas: { include: { membro: true, departamento: true } },
    },
    orderBy: { data: 'asc' },
  })

  return NextResponse.json(eventos)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()

  const evento = await prisma.evento.create({
    data: {
      titulo: data.titulo,
      descricao: data.descricao || null,
      data: new Date(data.data),
      horaInicio: data.horaInicio || null,
      horaFim: data.horaFim || null,
      tipo: data.tipo || 'CULTO',
      local: data.local || null,
    },
  })

  return NextResponse.json(evento, { status: 201 })
}
