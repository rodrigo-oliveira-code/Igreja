'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/dashboard/Header'
import { Plus, Calendar, MapPin, Clock, Pencil, Trash2 } from 'lucide-react'
import { formatDate, TIPO_EVENTO_LABELS } from '@/lib/utils'

interface Evento {
  id: string
  titulo: string
  descricao?: string
  data: string
  horaInicio?: string
  horaFim?: string
  tipo: string
  local?: string
  escalas: Array<{ id: string }>
}

const TIPO_COLORS: Record<string, string> = {
  CULTO: 'bg-purple-100 text-purple-700',
  ENSAIO: 'bg-blue-100 text-blue-700',
  REUNIAO: 'bg-yellow-100 text-yellow-700',
  CELULA: 'bg-green-100 text-green-700',
  CONFERENCIA: 'bg-red-100 text-red-700',
  OUTRO: 'bg-gray-100 text-gray-700',
}

function EventoModal({
  evento,
  onClose,
  onSave,
}: {
  evento: Partial<Evento> | null
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState({
    titulo: evento?.titulo || '',
    descricao: evento?.descricao || '',
    data: evento?.data ? evento.data.split('T')[0] : '',
    horaInicio: evento?.horaInicio || '',
    horaFim: evento?.horaFim || '',
    tipo: evento?.tipo || 'CULTO',
    local: evento?.local || '',
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const method = evento?.id ? 'PUT' : 'POST'
    const url = evento?.id ? `/api/eventos/${evento.id}` : '/api/eventos'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    onSave()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {evento?.id ? 'Editar Evento' : 'Novo Evento'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input value={form.titulo} onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input type="date" value={form.data} onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm">
                {Object.entries(TIPO_EVENTO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora Início</label>
              <input type="time" value={form.horaInicio} onChange={(e) => setForm((p) => ({ ...p, horaInicio: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fim</label>
              <input type="time" value={form.horaFim} onChange={(e) => setForm((p) => ({ ...p, horaFim: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
            <input value={form.local} onChange={(e) => setForm((p) => ({ ...p, local: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ evento: Partial<Evento> | null } | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/eventos')
    const data = await res.json()
    setEventos(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Excluir evento?')) return
    await fetch(`/api/eventos/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <Header title="Eventos" />
      <div className="p-6">
        <div className="flex justify-end mb-6">
          <button onClick={() => setModal({ evento: null })} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo Evento
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        ) : (
          <div className="space-y-3">
            {eventos.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-16 text-center text-gray-400">
                Nenhum evento cadastrado
              </div>
            ) : (
              eventos.map((evento) => (
                <div key={evento.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-purple-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-purple-700 font-bold text-lg leading-none">
                        {new Date(evento.data).getUTCDate()}
                      </span>
                      <span className="text-purple-500 text-xs uppercase">
                        {new Date(evento.data).toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' })}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{evento.titulo}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPO_COLORS[evento.tipo]}`}>
                          {TIPO_EVENTO_LABELS[evento.tipo]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {(evento.horaInicio || evento.horaFim) && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {evento.horaInicio}{evento.horaFim && ` - ${evento.horaFim}`}
                          </span>
                        )}
                        {evento.local && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {evento.local}
                          </span>
                        )}
                        <span>{evento.escalas.length} na escala</span>
                      </div>
                      {evento.descricao && <p className="text-sm text-gray-400 mt-1">{evento.descricao}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setModal({ evento })} className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(evento.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {modal && (
          <EventoModal
            evento={modal.evento}
            onClose={() => setModal(null)}
            onSave={load}
          />
        )}
      </div>
    </div>
  )
}
