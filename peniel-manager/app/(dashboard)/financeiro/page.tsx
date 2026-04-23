'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { TrendingUp, TrendingDown, DollarSign, BookOpen, Building2, Users, Clock, ListChecks } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import Link from 'next/link'

interface Lancamento {
  id: string
  tipo: 'RECEITA' | 'DESPESA' | 'TRANSFERENCIA'
  categoria: string | null
  valor: number
  descricao: string | null
  data: string
  status: string
  contaPlano?: { nome: string; codigo: string } | null
}

interface DashStats {
  entradas: number
  saidas: number
  saldo: number
  monthlyData: Array<{ mes: string; entradas: number; saidas: number }>
  ultimosLancamentos: Lancamento[]
}

const PIE_COLORS = ['#7C3AED', '#2563EB', '#16A34A', '#EA580C', '#DB2777', '#0891B2']

const atalhos = [
  { href: '/financeiro/receitas', label: 'Lançar Receita', icon: TrendingUp, color: 'bg-green-100 text-green-700' },
  { href: '/financeiro/despesas', label: 'Lançar Despesa', icon: TrendingDown, color: 'bg-red-100 text-red-700' },
  { href: '/financeiro/caixa-culto', label: 'Caixa de Culto', icon: Clock, color: 'bg-purple-100 text-purple-700' },
  { href: '/financeiro/aprovacoes', label: 'Aprovações', icon: ListChecks, color: 'bg-orange-100 text-orange-700' },
  { href: '/financeiro/plano-de-contas', label: 'Plano de Contas', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
  { href: '/financeiro/contas-bancarias', label: 'Contas Bancárias', icon: Building2, color: 'bg-teal-100 text-teal-700' },
]

export default function FinanceiroPage() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<Array<{ mes: string; entradas: number; saidas: number }>>([])

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/lancamentos?mes=${mes}&ano=${ano}&ativo=true`)
    const data = await res.json()
    setLancamentos(data)
    setLoading(false)
  }

  async function loadChart() {
    const data = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(ano, mes - 1 - (5 - i), 1)
        return fetch(`/api/lancamentos?mes=${d.getMonth() + 1}&ano=${d.getFullYear()}&ativo=true`)
          .then((r) => r.json())
          .then((items: Lancamento[]) => ({
            mes: d.toLocaleString('pt-BR', { month: 'short' }),
            entradas: items.filter((l) => l.tipo === 'RECEITA').reduce((s, l) => s + Number(l.valor), 0),
            saidas: items.filter((l) => l.tipo === 'DESPESA').reduce((s, l) => s + Number(l.valor), 0),
          }))
      })
    )
    setMonthlyData(data)
  }

  useEffect(() => {
    load()
    loadChart()
  }, [mes, ano])

  const entradas = lancamentos.filter((l) => l.tipo === 'RECEITA').reduce((s, l) => s + Number(l.valor), 0)
  const saidas = lancamentos.filter((l) => l.tipo === 'DESPESA').reduce((s, l) => s + Number(l.valor), 0)
  const saldo = entradas - saidas

  // Receitas por categoria para o gráfico de pizza
  const receitasPorCat = lancamentos
    .filter((l) => l.tipo === 'RECEITA')
    .reduce<Record<string, number>>((acc, l) => {
      const key = l.contaPlano?.nome || l.categoria || 'Outros'
      acc[key] = (acc[key] || 0) + Number(l.valor)
      return acc
    }, {})
  const pieData = Object.entries(receitasPorCat).map(([name, value]) => ({ name, value }))

  const pendentes = lancamentos.filter((l) => l.status === 'PENDENTE').length

  return (
    <div>
      <Header title="Financeiro" />
      <div className="p-6 space-y-6">
        {/* Filtro de período */}
        <div className="flex items-center gap-3">
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          >
            {meses.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          >
            {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {pendentes > 0 && (
            <Link href="/financeiro/aprovacoes" className="flex items-center gap-2 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors">
              <ListChecks className="w-4 h-4" />
              {pendentes} pendente{pendentes !== 1 ? 's' : ''} de aprovação
            </Link>
          )}
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Receitas</p>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(entradas)}</p>
            <p className="text-xs text-gray-400 mt-1">{meses[mes - 1]} {ano}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Despesas</p>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(saidas)}</p>
            <p className="text-xs text-gray-400 mt-1">{meses[mes - 1]} {ano}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Saldo</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${saldo >= 0 ? 'bg-purple-100' : 'bg-orange-100'}`}>
                <DollarSign className={`w-4 h-4 ${saldo >= 0 ? 'text-purple-600' : 'text-orange-600'}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-purple-600' : 'text-orange-600'}`}>{formatCurrency(saldo)}</p>
            <p className="text-xs text-gray-400 mt-1">{meses[mes - 1]} {ano}</p>
          </div>
        </div>

        {/* Atalhos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {atalhos.map((a) => {
            const Icon = a.icon
            return (
              <Link
                key={a.href}
                href={a.href}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-gray-700 leading-tight">{a.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Comparativo 6 meses</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v as number)} />
                <Legend />
                <Bar dataKey="entradas" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saidas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Receitas por categoria</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v as number)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                Sem receitas no período
              </div>
            )}
          </div>
        </div>

        {/* Últimos lançamentos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Lançamentos — {meses[mes - 1]} {ano}</h3>
            <div className="flex gap-2">
              <Link href="/financeiro/receitas" className="text-xs text-green-600 hover:underline">Ver receitas</Link>
              <span className="text-gray-300">|</span>
              <Link href="/financeiro/despesas" className="text-xs text-red-600 hover:underline">Ver despesas</Link>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          ) : lancamentos.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Nenhum lançamento neste período</p>
          ) : (
            <div className="overflow-y-auto max-h-72 divide-y divide-gray-100">
              {lancamentos.slice(0, 10).map((l) => (
                <div key={l.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {l.contaPlano?.nome || l.categoria || '—'}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(l.data)}{l.descricao ? ` · ${l.descricao}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={l.status} />
                    <span className={`text-sm font-semibold ${l.tipo === 'RECEITA' ? 'text-green-600' : l.tipo === 'DESPESA' ? 'text-red-600' : 'text-blue-600'}`}>
                      {l.tipo === 'RECEITA' ? '+' : l.tipo === 'DESPESA' ? '-' : '↔'}{formatCurrency(l.valor)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    RASCUNHO: { label: 'Rascunho', cls: 'bg-gray-100 text-gray-600' },
    PENDENTE: { label: 'Pendente', cls: 'bg-orange-100 text-orange-700' },
    APROVADO: { label: 'Aprovado', cls: 'bg-green-100 text-green-700' },
    PAGO: { label: 'Pago', cls: 'bg-blue-100 text-blue-700' },
    REJEITADO: { label: 'Rejeitado', cls: 'bg-red-100 text-red-700' },
  }
  const { label, cls } = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600' }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{label}</span>
}
