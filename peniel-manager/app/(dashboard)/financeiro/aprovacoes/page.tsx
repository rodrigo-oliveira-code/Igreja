'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { CheckCircle, XCircle, RotateCcw, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Lancamento {
  id: string
  tipo: string
  valor: number
  descricao: string | null
  data: string
  status: string
  contaPlano: { codigo: string; nome: string } | null
  departamento: { nome: string } | null
  fornecedor: { nome: string } | null
  criadoPor: { nome: string } | null
  aprovacoes: Array<{
    id: string
    acao: string
    justificativa: string | null
    dataAcao: string
    aprovador: { nome: string }
  }>
}

function AcaoModal({
  lancamento,
  acao,
  onClose,
  onSave,
}: {
  lancamento: Lancamento
  acao: 'APROVADO' | 'REJEITADO' | 'DEVOLVIDO'
  onClose: () => void
  onSave: () => void
}) {
  const [justificativa, setJustificativa] = useState('')
  const [loading, setLoading] = useState(false)

  const requerJustificativa = acao !== 'APROVADO'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (requerJustificativa && !justificativa.trim()) return
    setLoading(true)
    await fetch(`/api/lancamentos/${lancamento.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao, justificativa: justificativa || null }),
    })
    onSave()
    onClose()
  }

  const acaoConfig = {
    APROVADO: { label: 'Aprovar', cls: 'bg-green-600 hover:bg-green-700', icon: CheckCircle },
    REJEITADO: { label: 'Rejeitar', cls: 'bg-red-600 hover:bg-red-700', icon: XCircle },
    DEVOLVIDO: { label: 'Devolver', cls: 'bg-orange-600 hover:bg-orange-700', icon: RotateCcw },
  }[acao]

  const Icon = acaoConfig.icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon className={`w-6 h-6 ${acao === 'APROVADO' ? 'text-green-600' : acao === 'REJEITADO' ? 'text-red-600' : 'text-orange-600'}`} />
          <h2 className="text-lg font-semibold text-gray-800">{acaoConfig.label} Despesa</h2>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Valor</span>
            <span className="text-sm font-semibold text-gray-900">{formatCurrency(lancamento.valor)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Conta</span>
            <span className="text-sm text-gray-900">
              {lancamento.contaPlano ? `${lancamento.contaPlano.codigo} — ${lancamento.contaPlano.nome}` : '—'}
            </span>
          </div>
          {lancamento.fornecedor && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Fornecedor</span>
              <span className="text-sm text-gray-900">{lancamento.fornecedor.nome}</span>
            </div>
          )}
          {lancamento.descricao && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Descrição</span>
              <span className="text-sm text-gray-900">{lancamento.descricao}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justificativa {requerJustificativa ? '*' : '(opcional)'}
            </label>
            <textarea
              required={requerJustificativa}
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              rows={3}
              placeholder={acao === 'REJEITADO' ? 'Motivo da rejeição...' : acao === 'DEVOLVIDO' ? 'O que precisa ser ajustado...' : 'Observação (opcional)...'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50 ${acaoConfig.cls}`}
            >
              {loading ? 'Processando...' : acaoConfig.label}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AprovacoesPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ lancamento: Lancamento; acao: 'APROVADO' | 'REJEITADO' | 'DEVOLVIDO' } | null>(null)
  const [filtroStatus, setFiltroStatus] = useState('PENDENTE')

  async function load() {
    setLoading(true)
    const q = new URLSearchParams({ tipo: 'DESPESA', ativo: 'true' })
    if (filtroStatus) q.set('status', filtroStatus)
    const res = await fetch(`/api/lancamentos?${q}`)
    const data = await res.json()
    setLancamentos(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [filtroStatus])

  const acaoCfg = [
    { acao: 'APROVADO' as const, label: 'Aprovar', icon: CheckCircle, cls: 'text-green-600 hover:bg-green-50' },
    { acao: 'REJEITADO' as const, label: 'Rejeitar', icon: XCircle, cls: 'text-red-600 hover:bg-red-50' },
    { acao: 'DEVOLVIDO' as const, label: 'Devolver', icon: RotateCcw, cls: 'text-orange-600 hover:bg-orange-50' },
  ]

  return (
    <div>
      <Header title="Financeiro" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Aprovação de Despesas</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Fila de despesas aguardando aprovação
            </p>
          </div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="PENDENTE">Pendentes</option>
            <option value="APROVADO">Aprovadas</option>
            <option value="REJEITADO">Rejeitadas</option>
            <option value="">Todas</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        ) : lancamentos.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <p className="text-gray-500 text-sm">
              {filtroStatus === 'PENDENTE' ? 'Nenhuma despesa aguardando aprovação' : 'Nenhum registro encontrado'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lancamentos.map((l) => (
              <div
                key={l.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-lg font-bold text-red-600">{formatCurrency(l.valor)}</span>
                      {l.status === 'PENDENTE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                          <AlertCircle className="w-3 h-3" /> Pendente
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      {l.contaPlano ? `${l.contaPlano.codigo} — ${l.contaPlano.nome}` : '—'}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>{formatDate(l.data)}</span>
                      {l.fornecedor && <span>Fornecedor: {l.fornecedor.nome}</span>}
                      {l.departamento && <span>Depto: {l.departamento.nome}</span>}
                      {l.criadoPor && <span>Solicitante: {l.criadoPor.nome}</span>}
                      {l.descricao && <span>{l.descricao}</span>}
                    </div>

                    {l.aprovacoes.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {l.aprovacoes.map((a) => (
                          <div key={a.id} className="text-xs text-gray-500 flex items-center gap-2">
                            <span className={`font-medium ${a.acao === 'APROVADO' ? 'text-green-600' : a.acao === 'REJEITADO' ? 'text-red-600' : 'text-orange-600'}`}>
                              {a.acao === 'APROVADO' ? 'Aprovado' : a.acao === 'REJEITADO' ? 'Rejeitado' : 'Devolvido'}
                            </span>
                            <span>por {a.aprovador.nome}</span>
                            {a.justificativa && <span>— {a.justificativa}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {l.status === 'PENDENTE' && (
                    <div className="flex gap-2 flex-shrink-0">
                      {acaoCfg.map(({ acao, label, icon: Icon, cls }) => (
                        <button
                          key={acao}
                          onClick={() => setModal({ lancamento: l, acao })}
                          title={label}
                          className={`p-2 rounded-lg transition-colors ${cls}`}
                        >
                          <Icon className="w-5 h-5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <AcaoModal
          lancamento={modal.lancamento}
          acao={modal.acao}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}
    </div>
  )
}
