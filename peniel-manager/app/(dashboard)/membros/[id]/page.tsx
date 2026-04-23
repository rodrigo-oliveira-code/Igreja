'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/dashboard/Header'
import { ArrowLeft, Edit, Trash2, Save, X } from 'lucide-react'
import { formatDate, STATUS_MEMBRO_LABELS, STATUS_COLORS, TIPO_EVENTO_LABELS } from '@/lib/utils'

interface Membro {
  id: string
  nome: string
  email?: string
  telefone?: string
  status: string
  dataNascimento?: string
  dataIngresso?: string
  endereco?: string
  observacoes?: string
  cpf?: string
  rg?: string
  estadoCivil?: string
  profissao?: string
  naturalidade?: string
  nomePai?: string
  nomeMae?: string
  dataBatismoAguas?: string
  dataOrdenacaoCooperador?: string
  dataOrdenacaoDiacono?: string
  dataOrdenacaoPresbitero?: string
  dataOrdenacaoPastor?: string
  departamentos: Array<{ funcao?: string; departamento: { id: string; nome: string; cor: string } }>
  escalas: Array<{ id: string; funcao: string; confirmado: boolean; evento: { titulo: string; data: string; tipo: string } }>
}

const ESTADO_CIVIL_OPTIONS = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável']

function Field({ label, value, editing, field, type = 'text', form, setForm, options }: {
  label: string
  value?: string | null
  editing: boolean
  field: string
  type?: string
  form: any
  setForm: any
  options?: string[]
}) {
  return (
    <div>
      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
      {editing ? (
        options ? (
          <select
            value={form[field] || ''}
            onChange={(e) => setForm((p: any) => ({ ...p, [field]: e.target.value }))}
            className="input-field"
          >
            <option value="">—</option>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={form[field] || ''}
            onChange={(e) => setForm((p: any) => ({ ...p, [field]: e.target.value }))}
            className="input-field"
          />
        )
      ) : (
        <p className="text-gray-800 text-sm">
          {value ? (type === 'date' ? formatDate(value) : value) : '—'}
        </p>
      )}
    </div>
  )
}

export default function MembroPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [membro, setMembro] = useState<Membro | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/membros/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setMembro(data)
        const dateField = (v?: string) => v ? v.split('T')[0] : ''
        setForm({
          nome: data.nome || '',
          email: data.email || '',
          telefone: data.telefone || '',
          cpf: data.cpf || '',
          rg: data.rg || '',
          estadoCivil: data.estadoCivil || '',
          profissao: data.profissao || '',
          naturalidade: data.naturalidade || '',
          nomePai: data.nomePai || '',
          nomeMae: data.nomeMae || '',
          dataNascimento: dateField(data.dataNascimento),
          dataIngresso: dateField(data.dataIngresso),
          status: data.status || 'ATIVO',
          endereco: data.endereco || '',
          observacoes: data.observacoes || '',
          dataBatismoAguas: dateField(data.dataBatismoAguas),
          dataOrdenacaoCooperador: dateField(data.dataOrdenacaoCooperador),
          dataOrdenacaoDiacono: dateField(data.dataOrdenacaoDiacono),
          dataOrdenacaoPresbitero: dateField(data.dataOrdenacaoPresbitero),
          dataOrdenacaoPastor: dateField(data.dataOrdenacaoPastor),
        })
      })
  }, [id])

  async function handleSave() {
    setLoading(true)
    const res = await fetch(`/api/membros/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const updated = await res.json()
      setMembro((prev) => prev ? { ...prev, ...updated } : prev)
      setEditing(false)
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Deseja excluir este membro?')) return
    await fetch(`/api/membros/${id}`, { method: 'DELETE' })
    router.push('/membros')
  }

  if (!membro) {
    return (
      <div className="p-6">
        <Header title="Perfil do Membro" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      </div>
    )
  }

  const fp = { form, setForm }

  return (
    <div>
      <Header title="Perfil do Membro" />
      <div className="p-6 max-w-5xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/membros" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
                  <Save className="w-4 h-4" /> Salvar
                </button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                  <X className="w-4 h-4" /> Cancelar
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                  <Edit className="w-4 h-4" /> Editar
                </button>
                <button onClick={handleDelete} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                  <Trash2 className="w-4 h-4" /> Excluir
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-2xl font-bold text-purple-600">
                  {membro.nome.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  {editing ? (
                    <input value={form.nome} onChange={(e) => setForm((p: any) => ({ ...p, nome: e.target.value }))} className="input-field text-xl font-bold w-full" />
                  ) : (
                    <h2 className="text-xl font-bold text-gray-900">{membro.nome}</h2>
                  )}
                  {editing ? (
                    <select value={form.status} onChange={(e) => setForm((p: any) => ({ ...p, status: e.target.value }))} className="input-field mt-2 w-40">
                      {Object.entries(STATUS_MEMBRO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${STATUS_COLORS[membro.status]}`}>
                      {STATUS_MEMBRO_LABELS[membro.status]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Dados Pessoais */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Dados Pessoais</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Field label="Email" value={membro.email} field="email" type="email" editing={editing} {...fp} />
                <Field label="Telefone" value={membro.telefone} field="telefone" editing={editing} {...fp} />
                <Field label="CPF" value={membro.cpf} field="cpf" editing={editing} {...fp} />
                <Field label="RG" value={membro.rg} field="rg" editing={editing} {...fp} />
                <Field label="Data de Nascimento" value={membro.dataNascimento} field="dataNascimento" type="date" editing={editing} {...fp} />
                <Field label="Naturalidade" value={membro.naturalidade} field="naturalidade" editing={editing} {...fp} />
                <Field label="Estado Civil" value={membro.estadoCivil} field="estadoCivil" editing={editing} options={ESTADO_CIVIL_OPTIONS} {...fp} />
                <Field label="Profissão" value={membro.profissao} field="profissao" editing={editing} {...fp} />
                <Field label="Nome do Pai" value={membro.nomePai} field="nomePai" editing={editing} {...fp} />
                <Field label="Nome da Mãe" value={membro.nomeMae} field="nomeMae" editing={editing} {...fp} />
                <div className="col-span-2">
                  <Field label="Endereço" value={membro.endereco} field="endereco" editing={editing} {...fp} />
                </div>
              </div>
            </div>

            {/* Dados Eclesiásticos */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Dados Eclesiásticos</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Field label="Data de Ingresso" value={membro.dataIngresso} field="dataIngresso" type="date" editing={editing} {...fp} />
                <Field label="Batismo nas Águas" value={membro.dataBatismoAguas} field="dataBatismoAguas" type="date" editing={editing} {...fp} />
                <Field label="Ordenação — Cooperador" value={membro.dataOrdenacaoCooperador} field="dataOrdenacaoCooperador" type="date" editing={editing} {...fp} />
                <Field label="Ordenação — Diácono" value={membro.dataOrdenacaoDiacono} field="dataOrdenacaoDiacono" type="date" editing={editing} {...fp} />
                <Field label="Ordenação — Presbítero" value={membro.dataOrdenacaoPresbitero} field="dataOrdenacaoPresbitero" type="date" editing={editing} {...fp} />
                <Field label="Ordenação — Pastor" value={membro.dataOrdenacaoPastor} field="dataOrdenacaoPastor" type="date" editing={editing} {...fp} />
              </div>
            </div>

            {/* Observações */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Observações</h3>
              {editing ? (
                <textarea
                  value={form.observacoes}
                  onChange={(e) => setForm((p: any) => ({ ...p, observacoes: e.target.value }))}
                  rows={4}
                  className="input-field resize-none w-full"
                />
              ) : (
                <p className="text-gray-800 text-sm whitespace-pre-wrap">{membro.observacoes || '—'}</p>
              )}
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-6">
            {/* Departments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Departamentos</h3>
              {membro.departamentos.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhum departamento</p>
              ) : (
                <div className="space-y-2">
                  {membro.departamentos.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.departamento.cor }} />
                      <span className="text-sm text-gray-700">{d.departamento.nome}</span>
                      {d.funcao && <span className="text-xs text-gray-400">· {d.funcao}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Scales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-3">Escalas Recentes</h3>
              {membro.escalas.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhuma escala</p>
              ) : (
                <ul className="space-y-2">
                  {membro.escalas.slice(0, 8).map((e) => (
                    <li key={e.id} className="text-sm">
                      <p className="font-medium text-gray-800">{e.evento.titulo}</p>
                      <p className="text-gray-500 text-xs">{formatDate(e.evento.data)} · {e.funcao}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
