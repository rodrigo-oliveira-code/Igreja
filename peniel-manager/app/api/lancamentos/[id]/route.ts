import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()

  const lancamento = await prisma.lancamento.update({
    where: { id: params.id },
    data: {
      tipo: data.tipo,
      categoria: data.categoria,
      valor: data.valor,
      descricao: data.descricao || null,
      data: new Date(data.data),
    },
  })

  return NextResponse.json(lancamento)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.lancamento.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
