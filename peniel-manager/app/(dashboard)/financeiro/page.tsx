'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface Lancamento {
  id: string
  tipo: 'ENTRADA' | 'SAIDA'
  categoria: string
  valor: number
  descricao?: string
  data: string
}

const CATEGORIAS_ENTRADA = ['Dízimo', 'Oferta', 'Doação', 'Evento', 'Outros']
const CATEGORIAS_SAIDA = ['Aluguel', 'Água/Luz', 'Material', 'Manutenção', 'Missões', 'Salário', 'Outros']

function LancamentoModal({
  lancamento,
  onClose,
  onSave,
}: {
  lancamento: Partial<Lancamento> | null
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState({
    tipo: lancamento?.tipo || 'ENTRADA',
    categoria: lancamento?.categoria || '',
    valor: lancamento?.valor ? String(lancamento.valor) : '',
    descricao: lancamento?.descricao || '',
    data: lancamento?.data ? lancamento.data.split('T')[0] : new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)

  const categorias = form.tipo === 'ENTRADA' ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const method = lancamento?.id ? 'PUT' : 'POST'
    const url = lancamento?.id ? `/api/lancamentos/${lancamento.id}` : '/api/lancamentos'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, valor: parseFloat(form.valor) }),
    })
    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {lancamento?.id ? 'Editar Lançamento' : 'Novo Lançamento'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, tipo: 'ENTRADA', categoria: '' }))}
              className={`py-2 rounded-lg text-sm font-medium border-2 transition-colors ${form.tipo === 'ENTRADA' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, tipo: 'SAIDA', categoria: '' }))}
              className={`py-2 rounded-lg text-sm font-medium border-2 transition-colors ${form.tipo === 'SAIDA' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
            >
              Saída
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
            <select value={form.categoria} onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm">
              <option value="">Selecione...</option>
              {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
              <input type="number" step="0.01" min="0" value={form.valor} onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" placeholder="0,00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input type="date" value={form.data} onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function FinanceiroPage() {
  const now = new Date()
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [ano, setAno] = useState(now.getFullYear())
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ lancamento: Partial<Lancamento> | null } | null>(null)
  const [monthlyData, setMonthlyData] = useState<Array<{ mes: string; entradas: number; saidas: number }>>([])

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/lancamentos?mes=${mes}&ano=${ano}`)
    const data = await res.json()
    setLancamentos(data)
    setLoading(false)
  }

  async function loadChart() {
    const data = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(ano, mes - 1 - (5 - i), 1)
        return fetch(`/api/lancamentos?mes=${d.getMonth() + 1}&ano=${d.getFullYear()}`)
          .then((r) => r.json())
          .then((items: Lancamento[]) => ({
            mes: d.toLocaleString('pt-BR', { month: 'short' }),
            entradas: items.filter((l) => l.tipo === 'ENTRADA').reduce((s, l) => s + Number(l.valor), 0),
            saidas: items.filter((l) => l.tipo === 'SAIDA').reduce((s, l) => s + Number(l.valor), 0),
          }))
      })
    )
    setMonthlyData(data)
  }

  useEffect(() => { load(); loadChart() }, [mes, ano])

  async function handleDelete(id: string) {
    if (!confirm('Excluir lançamento?')) return
    await fetch(`/api/lancamentos/${id}`, { method: 'DELETE' })
    load()
  }

  const entradas = lancamentos.filter((l) => l.tipo === 'ENTRADA').reduce((s, l) => s + Number(l.valor), 0)
  const saidas = lancamentos.filter((l) => l.tipo === 'SAIDA').reduce((s, l) => s + Number(l.valor), 0)
  const saldo = entradas - saidas

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  return (
    <div>
      <Header title="Financeiro" />
      <div className="p-6 space-y-6">
        {/* Filter + Add */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <select value={mes} onChange={(e) => setMes(Number(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none">
              {meses.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
            <select value={ano} onChange={(e) => setAno(Number(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none">
              {[2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={() => setModal({ lancamento: null })} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo Lançamento
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Entradas</p>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(entradas)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Saídas</p>
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(saidas)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Saldo</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${saldo >= 0 ? 'bg-purple-100' : 'bg-orange-100'}`}>
                <DollarSign className={`w-4 h-4 ${saldo >= 0 ? 'text-purple-600' : 'text-orange-600'}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-purple-600' : 'text-orange-600'}`}>{formatCurrency(saldo)}</p>
          </div>
        </div>

        {/* Chart + Table */}
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
                <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saidas" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Lançamentos — {meses[mes - 1]} {ano}
            </h3>
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
              </div>
            ) : lancamentos.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Nenhum lançamento neste período</p>
            ) : (
              <div className="overflow-y-auto max-h-64 divide-y divide-gray-100">
                {lancamentos.map((l) => (
                  <div key={l.id} className="py-3 flex items-center justify-between group">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{l.categoria}</p>
                      <p className="text-xs text-gray-400">{formatDate(l.data)}{l.descricao ? ` · ${l.descricao}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${l.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}`}>
                        {l.tipo === 'ENTRADA' ? '+' : '-'}{formatCurrency(l.valor)}
                      </span>
                      <button onClick={() => handleDelete(l.id)} className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition-opacity">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modal && (
        <LancamentoModal
          lancamento={modal.lancamento}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}
    </div>
  )
}
