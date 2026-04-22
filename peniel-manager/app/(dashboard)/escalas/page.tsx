'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Plus, Check, X, Trash2 } from 'lucide-react'
import { formatDate, TIPO_EVENTO_LABELS } from '@/lib/utils'

interface Evento {
  id: string
  titulo: string
  data: string
  tipo: string
}

interface Membro {
  id: string
  nome: string
}

interface Escala {
  id: string
  funcao: string
  confirmado: boolean
  membro: { id: string; nome: string }
  evento: { id: string; titulo: string; data: string; tipo: string }
  departamento?: { nome: string; cor: string }
}

export default function EscalasPage() {
  const [escalas, setEscalas] = useState<Escala[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [membros, setMembros] = useState<Membro[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ eventoId: '', membroId: '', funcao: '', confirmado: false })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const [escRes, evRes, mRes] = await Promise.all([
      fetch('/api/escalas'),
      fetch('/api/eventos'),
      fetch('/api/membros'),
    ])
    const [escData, evData, mData] = await Promise.all([escRes.json(), evRes.json(), mRes.json()])
    setEscalas(escData)
    setEventos(evData)
    setMembros(mData)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/escalas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ eventoId: '', membroId: '', funcao: '', confirmado: false })
    setShowForm(false)
    await load()
    setSaving(false)
  }

  async function toggleConfirmado(escala: Escala) {
    await fetch(`/api/escalas/${escala.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmado: !escala.confirmado, funcao: escala.funcao }),
    })
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover da escala?')) return
    await fetch(`/api/escalas/${id}`, { method: 'DELETE' })
    load()
  }

  const escalasByEvento = escalas.reduce<Record<string, Escala[]>>((acc, e) => {
    const key = e.evento.id
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  return (
    <div>
      <Header title="Escalas" />
      <div className="p-6">
        <div className="flex justify-end mb-6">
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> Adicionar à Escala
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Nova Escala</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <select value={form.eventoId} onChange={(e) => setForm((p) => ({ ...p, eventoId: e.target.value }))} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                <option value="">Selecionar Evento</option>
                {eventos.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.titulo} — {new Date(ev.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</option>
                ))}
              </select>
              <select value={form.membroId} onChange={(e) => setForm((p) => ({ ...p, membroId: e.target.value }))} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                <option value="">Selecionar Membro</option>
                {membros.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
              <input placeholder="Função (ex: Louvor, Som)" value={form.funcao} onChange={(e) => setForm((p) => ({ ...p, funcao: e.target.value }))} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              <button type="submit" disabled={saving} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
                {saving ? 'Salvando...' : 'Adicionar'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        ) : Object.keys(escalasByEvento).length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-16 text-center text-gray-400">
            Nenhuma escala cadastrada
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(escalasByEvento).map(([eventoId, escs]) => {
              const evento = escs[0].evento
              return (
                <div key={eventoId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
                    <h3 className="font-semibold text-purple-800">{evento.titulo}</h3>
                    <p className="text-sm text-purple-600">{new Date(evento.data).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })} · {TIPO_EVENTO_LABELS[evento.tipo]}</p>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-6 py-2 font-medium text-gray-600">Membro</th>
                        <th className="text-left px-6 py-2 font-medium text-gray-600">Função</th>
                        <th className="text-left px-6 py-2 font-medium text-gray-600">Confirmado</th>
                        <th className="px-6 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {escs.map((esc) => (
                        <tr key={esc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 font-medium text-gray-800">{esc.membro.nome}</td>
                          <td className="px-6 py-3 text-gray-600">{esc.funcao}</td>
                          <td className="px-6 py-3">
                            <button onClick={() => toggleConfirmado(esc)} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${esc.confirmado ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                              {esc.confirmado ? <><Check className="w-3 h-3" /> Confirmado</> : <><X className="w-3 h-3" /> Pendente</>}
                            </button>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button onClick={() => handleDelete(esc.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
