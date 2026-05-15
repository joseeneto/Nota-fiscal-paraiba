import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  Receipt,
  Clock,
  CheckCircle2,
  Tag,
  Calendar,
  DollarSign,
  Layers,
} from 'lucide-react';

interface Parcela {
  id: number;
  identificacao: string;
  data_vencimento: string | null;
  valor_parcela: number;
  status: string;
}

interface Nota {
  id: number;
  tipo: string;
  valor_total: number;
  data_emissao: string | null;
  fornecedor: string;
  fornecedor_doc: string;
  numero_nota: string;
  classificacoes: string[];
  parcelas: Parcela[];
  total_parcelas: number;
  parcelas_pendentes: number;
}

const API_BASE = 'http://localhost:8000/api/financeiro';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDoc(doc: string) {
  if (!doc) return '-';
  const d = doc.replace(/\D/g, '');
  if (d.length === 11) {
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (d.length === 14) {
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return doc;
}

function StatusBadge({ status }: { status: string }) {
  const isOk = status === 'PAGO' || status === 'RECEBIDO';
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
        isOk
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      }`}
    >
      {isOk ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {status}
    </span>
  );
}

function NotaCard({ nota }: { nota: Nota }) {
  const [expanded, setExpanded] = useState(false);
  const allPaid = nota.parcelas_pendentes === 0 && nota.total_parcelas > 0;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        allPaid
          ? 'border-emerald-500/30 bg-[#0d1a14]'
          : 'border-gray-700/50 bg-[#111827]'
      }`}
    >
      {/* Card Header */}
      <button
        className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-white/5 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className={`mt-0.5 p-2 rounded-lg flex-shrink-0 ${allPaid ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
            <Receipt className={`w-4 h-4 ${allPaid ? 'text-emerald-400' : 'text-blue-400'}`} />
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold text-sm truncate">{nota.fornecedor}</span>
              <span className="text-gray-500 text-[11px] font-mono">{formatDoc(nota.fornecedor_doc)}</span>
              <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded font-mono border border-gray-700">NF {nota.numero_nota}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {nota.classificacoes.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {c}
                </span>
              ))}
              {nota.data_emissao && (
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {nota.data_emissao}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-lg font-bold text-white tabular-nums">{formatCurrency(nota.valor_total)}</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500">
              {nota.parcelas_pendentes}/{nota.total_parcelas} pendentes
            </span>
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Parcelas */}
      {expanded && (
        <div className="border-t border-gray-700/50 px-4 pb-4 pt-3">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-3 flex items-center gap-1.5">
            <Layers className="w-3 h-3" /> Parcelas ({nota.total_parcelas})
          </p>
          <div className="space-y-2">
            {nota.parcelas.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2 gap-2"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-mono text-gray-300 truncate">{p.identificacao}</span>
                  {p.data_vencimento && (
                    <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      Venc: {p.data_vencimento}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold text-white tabular-nums">{formatCurrency(p.valor_parcela)}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NotasList() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/notas`);
      setNotas(res.data);
    } catch (e: any) {
      setError('Não foi possível carregar as notas. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotas();
  }, [fetchNotas]);

  const totalGeral = notas.reduce((acc, n) => acc + n.valor_total, 0);
  const totalPendentes = notas.reduce((acc, n) => acc + n.parcelas_pendentes, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header com stats */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-2.5">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Total Lançado</p>
            <p className="text-lg font-bold text-white tabular-nums">{formatCurrency(totalGeral)}</p>
          </div>
          <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-2.5">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Notas</p>
            <p className="text-lg font-bold text-white">{notas.length}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5">
            <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">Parcelas Pendentes</p>
            <p className="text-lg font-bold text-amber-400">{totalPendentes}</p>
          </div>
        </div>

        <button
          onClick={fetchNotas}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-gray-400 border border-gray-700 hover:border-gray-500 hover:text-white px-4 py-2 rounded-lg bg-gray-800/50 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 py-20">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-gray-400 text-sm">Carregando notas...</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && notas.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 py-20 opacity-40">
          <DollarSign className="w-16 h-16 text-gray-500" />
          <h3 className="text-gray-400 font-semibold">Nenhuma nota lançada ainda</h3>
          <p className="text-gray-500 text-sm text-center">
            Use a aba <strong>Lançar Nota</strong> para processar uma nota fiscal.
          </p>
        </div>
      )}

      {!loading && !error && notas.length > 0 && (
        <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          {notas.map((nota) => (
            <NotaCard key={nota.id} nota={nota} />
          ))}
        </div>
      )}
    </div>
  );
}
