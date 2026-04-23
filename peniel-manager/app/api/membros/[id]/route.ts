import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function parseDate(value: string | undefined | null): Date | null {
  if (!value) return null
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

export async function GET(req: NextRequest, ctx: RouteContext<'/api/membros/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params

  const membro = await prisma.membro.findUnique({
    where: { id },
    include: {
      departamentos: { include: { departamento: true } },
      escalas: {
        include: { evento: true, departamento: true },
        orderBy: { evento: { data: 'desc' } },
        take: 20,
      },
    },
  })

  if (!membro) return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 })
  return NextResponse.json(membro)
}

export async function PUT(req: NextRequest, ctx: RouteContext<'/api/membros/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const data = await req.json()

  const membro = await prisma.membro.update({
    where: { id },
    data: {
      nome: data.nome,
      email: data.email || null,
      telefone: data.telefone || null,
      dataNascimento: parseDate(data.dataNascimento),
      dataIngresso: parseDate(data.dataIngresso),
      status: data.status,
      endereco: data.endereco || null,
      observacoes: data.observacoes || null,
      cpf: data.cpf || null,
      rg: data.rg || null,
      estadoCivil: data.estadoCivil || null,
      profissao: data.profissao || null,
      naturalidade: data.naturalidade || null,
      nomePai: data.nomePai || null,
      nomeMae: data.nomeMae || null,
      dataBatismoAguas: parseDate(data.dataBatismoAguas),
      dataOrdenacaoCooperador: parseDate(data.dataOrdenacaoCooperador),
      dataOrdenacaoDiacono: parseDate(data.dataOrdenacaoDiacono),
      dataOrdenacaoPresbitero: parseDate(data.dataOrdenacaoPresbitero),
      dataOrdenacaoPastor: parseDate(data.dataOrdenacaoPastor),
    },
  })

  return NextResponse.json(membro)
}

export async function DELETE(req: NextRequest, ctx: RouteContext<'/api/membros/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  await prisma.membro.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
