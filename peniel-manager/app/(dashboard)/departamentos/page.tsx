'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { Plus, Users, Pencil, Trash2 } from 'lucide-react'

interface Departamento {
  id: string
  nome: string
  descricao?: string
  cor: string
  membros: Array<{ membro: { nome: string } }>
}

function DepartamentoModal({
  dept,
  onClose,
  onSave,
}: {
  dept: Partial<Departamento> | null
  onClose: () => void
  onSave: () => void
}) {
  const [form, setForm] = useState({
    nome: dept?.nome || '',
    descricao: dept?.descricao || '',
    cor: dept?.cor || '#7C3AED',
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const method = dept?.id ? 'PUT' : 'POST'
    const url = dept?.id ? `/api/departamentos/${dept.id}` : '/api/departamentos'
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {dept?.id ? 'Editar Departamento' : 'Novo Departamento'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input
              value={form.nome}
              onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.cor}
                onChange={(e) => setForm((p) => ({ ...p, cor: e.target.value }))}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <span className="text-sm text-gray-600">{form.cor}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50">
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

export default function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ dept: Partial<Departamento> | null } | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/departamentos')
    const data = await res.json()
    setDepartamentos(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id: string) {
    if (!confirm('Excluir departamento?')) return
    await fetch(`/api/departamentos/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <Header title="Departamentos" />
      <div className="p-6">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setModal({ dept: null })}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Novo Departamento
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departamentos.map((dept) => (
              <div key={dept.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: dept.cor + '20' }}>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dept.cor }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{dept.nome}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {dept.membros.length} membro(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setModal({ dept })} className="p-1.5 text-gray-400 hover:text-purple-600 rounded">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(dept.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {dept.descricao && <p className="text-sm text-gray-500">{dept.descricao}</p>}
                {dept.membros.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {dept.membros.slice(0, 4).map((m, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {m.membro.nome.split(' ')[0]}
                      </span>
                    ))}
                    {dept.membros.length > 4 && (
                      <span className="text-xs text-gray-400">+{dept.membros.length - 4} mais</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {modal && (
          <DepartamentoModal
            dept={modal.dept}
            onClose={() => setModal(null)}
            onSave={load}
          />
        )}
      </div>
    </div>
  )
}
