import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Lancamento } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const [
    totalMembrosAtivos,
    eventosNaSemana,
    departamentos,
    lancamentosDoMes,
    proximosEventos,
    ultimosLancamentos,
    aniversariantesDoMes,
  ] = await Promise.all([
    prisma.membro.count({ where: { status: 'ATIVO' } }),
    prisma.evento.count({ where: { data: { gte: startOfWeek, lte: endOfWeek } } }),
    prisma.departamento.count(),
    prisma.lancamento.findMany({
      where: { data: { gte: startOfMonth, lte: endOfMonth } },
    }),
    prisma.evento.findMany({
      where: { data: { gte: now } },
      orderBy: { data: 'asc' },
      take: 5,
      include: { escalas: { include: { membro: true } } },
    }),
    prisma.lancamento.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.membro.findMany({
      where: {
        status: 'ATIVO',
        dataNascimento: { not: null },
      },
      select: { id: true, nome: true, dataNascimento: true, foto: true },
    }),
  ])

  const entradas = lancamentosDoMes
    .filter((l: Lancamento) => l.tipo === 'ENTRADA')
    .reduce((sum: number, l: Lancamento) => sum + Number(l.valor), 0)
  const saidas = lancamentosDoMes
    .filter((l: Lancamento) => l.tipo === 'SAIDA')
    .reduce((sum: number, l: Lancamento) => sum + Number(l.valor), 0)
  const saldo = entradas - saidas

  const aniversariantesFilter = aniversariantesDoMes.filter((m) => {
    if (!m.dataNascimento) return false
    return new Date(m.dataNascimento).getMonth() === now.getMonth()
  })

  const monthlyData = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const endDate = new Date(now.getFullYear(), now.getMonth() - (4 - i), 0, 23, 59, 59)
      return prisma.lancamento.groupBy({
        by: ['tipo'],
        where: { data: { gte: date, lte: endDate } },
        _sum: { valor: true },
      }).then((data) => ({
        mes: date.toLocaleString('pt-BR', { month: 'short' }),
        entradas: Number(data.find((d) => d.tipo === 'ENTRADA')?._sum?.valor ?? 0),
        saidas: Number(data.find((d) => d.tipo === 'SAIDA')?._sum?.valor ?? 0),
      }))
    })
  )

  return NextResponse.json({
    totalMembrosAtivos,
    eventosNaSemana,
    departamentos,
    saldo,
    entradas,
    saidas,
    proximosEventos,
    ultimosLancamentos,
    aniversariantesDoMes: aniversariantesFilter,
    monthlyData,
  })
}
