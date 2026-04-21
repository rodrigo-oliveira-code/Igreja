import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const departamento = await prisma.departamento.findUnique({
    where: { id: params.id },
    include: { membros: { include: { membro: true } } },
  })

  if (!departamento) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(departamento)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()

  const departamento = await prisma.departamento.update({
    where: { id: params.id },
    data: {
      nome: data.nome,
      descricao: data.descricao || null,
      cor: data.cor || '#7C3AED',
      liderId: data.liderId || null,
    },
  })

  return NextResponse.json(departamento)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.departamento.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
