import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const evento = await prisma.evento.findUnique({
    where: { id: params.id },
    include: { escalas: { include: { membro: true, departamento: true } } },
  })

  if (!evento) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(evento)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()

  const evento = await prisma.evento.update({
    where: { id: params.id },
    data: {
      titulo: data.titulo,
      descricao: data.descricao || null,
      data: new Date(data.data),
      horaInicio: data.horaInicio || null,
      horaFim: data.horaFim || null,
      tipo: data.tipo,
      local: data.local || null,
    },
  })

  return NextResponse.json(evento)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.evento.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
