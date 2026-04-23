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
  const status = searchParams.get('status')
  const ativo = searchParams.get('ativo')
  const cultoSessaoId = searchParams.get('cultoSessaoId')

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
      ...(status && { status: status as any }),
      ...(ativo !== null && { ativo: ativo === 'true' }),
      ...(cultoSessaoId && { cultoSessaoId }),
    },
    include: {
      contaPlano: { select: { id: true, codigo: true, nome: true } },
      departamento: { select: { id: true, nome: true } },
      contaBancaria: { select: { id: true, nome: true, banco: true } },
      fornecedor: { select: { id: true, nome: true } },
      membro: { select: { id: true, nome: true } },
      criadoPor: { select: { id: true, nome: true } },
    },
    orderBy: { data: 'desc' },
  })

  return NextResponse.json(lancamentos)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const userId = (session.user as any).id

  const lancamento = await prisma.lancamento.create({
    data: {
      tipo: data.tipo,
      categoria: data.categoria || null,
      valor: data.valor,
      descricao: data.descricao || null,
      data: new Date(data.data),
      contaPlanoId: data.contaPlanoId || null,
      departamentoId: data.departamentoId || null,
      contaBancariaId: data.contaBancariaId || null,
      fornecedorId: data.fornecedorId || null,
      formaPagamento: data.formaPagamento || null,
      membroId: data.membroId || null,
      cultoSessaoId: data.cultoSessaoId || null,
      status: data.status || 'APROVADO',
      criadoPorId: userId,
    },
    include: {
      contaPlano: { select: { id: true, codigo: true, nome: true } },
      departamento: { select: { id: true, nome: true } },
      contaBancaria: { select: { id: true, nome: true, banco: true } },
      fornecedor: { select: { id: true, nome: true } },
      membro: { select: { id: true, nome: true } },
    },
  })

  return NextResponse.json(lancamento, { status: 201 })
}
