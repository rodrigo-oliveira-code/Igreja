'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { StatCard } from '@/components/dashboard/StatCard'
import { Users, Calendar, DollarSign, Building2 } from 'lucide-react'
import { formatCurrency, formatDate, TIPO_EVENTO_LABELS } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface DashboardStats {
  totalMembrosAtivos: number
  eventosNaSemana: number
  departamentos: number
  saldo: number
  entradas: number
  saidas: number
  proximosEventos: Array<{ id: string; titulo: string; data: string; tipo: string; local?: string }>
  ultimosLancamentos: Array<{ id: string; tipo: string; categoria: string; valor: number; data: string }>
  aniversariantesDoMes: Array<{ id: string; nome: string; dataNascimento: string }>
  monthlyData: Array<{ mes: string; entradas: number; saidas: number }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <Header title="Dashboard" />
        <div className="mt-6 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Membros Ativos"
            value={stats?.totalMembrosAtivos ?? 0}
            icon={<Users className="w-5 h-5" />}
            description="Total de membros ativos"
            colorClass="bg-purple-500"
          />
          <StatCard
            title="Eventos na Semana"
            value={stats?.eventosNaSemana ?? 0}
            icon={<Calendar className="w-5 h-5" />}
            description="Eventos desta semana"
            colorClass="bg-blue-500"
          />
          <StatCard
            title="Saldo do Mês"
            value={formatCurrency(stats?.saldo ?? 0)}
            icon={<DollarSign className="w-5 h-5" />}
            description={`Entradas: ${formatCurrency(stats?.entradas ?? 0)}`}
            colorClass="bg-green-500"
          />
          <StatCard
            title="Departamentos"
            value={stats?.departamentos ?? 0}
            icon={<Building2 className="w-5 h-5" />}
            description="Departamentos ativos"
            colorClass="bg-orange-500"
          />
        </div>

        {/* Charts + Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Financial Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Financeiro — Últimos 6 meses</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.monthlyData ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(v as number)} />
                <Legend />
                <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Próximos Eventos</h3>
            {stats?.proximosEventos.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhum evento agendado</p>
            ) : (
              <ul className="space-y-3">
                {stats?.proximosEventos.map((evento) => (
                  <li key={evento.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-purple-700 font-bold text-xs leading-none">
                        {new Date(evento.data).getDate()}
                      </span>
                      <span className="text-purple-500 text-xs uppercase">
                        {new Date(evento.data).toLocaleString('pt-BR', { month: 'short' })}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{evento.titulo}</p>
                      <p className="text-xs text-gray-500">{TIPO_EVENTO_LABELS[evento.tipo]}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Últimos Lançamentos</h3>
            {stats?.ultimosLancamentos.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhum lançamento</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {stats?.ultimosLancamentos.map((l) => (
                  <li key={l.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{l.categoria}</p>
                      <p className="text-xs text-gray-500">{formatDate(l.data)}</p>
                    </div>
                    <span className={`text-sm font-semibold ${l.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                      {l.tipo === 'ENTRADA' ? '+' : '-'}{formatCurrency(l.valor)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Birthdays */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Aniversariantes do Mês</h3>
            {stats?.aniversariantesDoMes.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhum aniversariante este mês</p>
            ) : (
              <ul className="space-y-2">
                {stats?.aniversariantesDoMes.map((m) => (
                  <li key={m.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-pink-600 font-semibold text-xs">
                        {m.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{m.nome}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(m.dataNascimento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
