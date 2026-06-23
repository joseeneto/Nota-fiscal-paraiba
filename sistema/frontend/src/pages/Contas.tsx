import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Loader2, Edit2, Trash2, Receipt, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface Parcela {
  id: number;
  identificacao: string;
  data_vencimento: string | null;
  valor_parcela: number;
  status: string;
}

interface Conta {
  id: number;
  tipo: string;
  valor_total: number;
  data_emissao: string | null;
  fornecedor: string;
  fornecedor_doc: string;
  faturado: string;
  faturado_doc: string;
  numero_nota: string;
  classificacoes: string[];
  parcelas: Parcela[];
  total_parcelas: number;
  parcelas_pendentes: number;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api/financeiro';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function Contas() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [sortCol, setSortCol] = useState<keyof Conta | 'fornecedor'>('id');
  const [sortDesc, setSortDesc] = useState(true);

  const fetchContas = useCallback(async (busca?: string) => {
    setLoading(true);
    try {
      const url = busca ? `${API_BASE}/notas?buscar=${encodeURIComponent(busca)}` : `${API_BASE}/notas`;
      const res = await axios.get(url);
      setContas(res.data);
    } catch (e: any) {
      console.error('Erro ao buscar contas.', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tabela vazia no início
  useEffect(() => {
    setContas([]);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchContas(searchTerm);
    }
  };

  const handleTodos = () => {
    setSearchTerm('');
    setDataInicio('');
    setDataFim('');
    fetchContas();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir esta conta (Exclusão Lógica)?')) return;
    try {
      await axios.delete(`${API_BASE}/notas/${id}`);
      handleTodos();
    } catch (e) {
      alert('Erro ao excluir conta.');
    }
  };

  const handleEdit = (id: number) => {
    alert(`A edição da conta #${id} será implementada em modal avançado devido às relações (Parcelas, etc).`);
  };

  const handleSort = (col: keyof Conta | 'fornecedor') => {
    if (sortCol === col) {
      setSortDesc(!sortDesc);
    } else {
      setSortCol(col);
      setSortDesc(false);
    }
  };

  const parseDateStr = (dateStr: string | null) => {
    if (!dateStr) return 0;
    const [d, m, y] = dateStr.split('/');
    return new Date(Number(y), Number(m) - 1, Number(d)).getTime();
  };

  const filteredContas = contas.filter(c => {
    if (!dataInicio && !dataFim) return true;
    const cTime = parseDateStr(c.data_emissao);
    if (!cTime) return false;
    
    if (dataInicio) {
      const [y, m, d] = dataInicio.split('-');
      const minLocal = new Date(Number(y), Number(m) - 1, Number(d)).getTime();
      if (cTime < minLocal) return false;
    }
    if (dataFim) {
      const [y, m, d] = dataFim.split('-');
      const maxLocal = new Date(Number(y), Number(m) - 1, Number(d)).getTime();
      if (cTime > maxLocal) return false;
    }
    return true;
  });

  const sortedContas = [...filteredContas].sort((a, b) => {
    if (sortCol === 'data_emissao') {
      const valA = parseDateStr(a.data_emissao);
      const valB = parseDateStr(b.data_emissao);
      return sortDesc ? valB - valA : valA - valB;
    }
    const valA = a[sortCol] ?? '';
    const valB = b[sortCol] ?? '';
    if (valA < valB) return sortDesc ? 1 : -1;
    if (valA > valB) return sortDesc ? -1 : 1;
    return 0;
  });

  return (
    <div className="flex flex-col h-full bg-[#0d1220] rounded-2xl border border-gray-800 p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
            <Receipt className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Contas (Notas Fiscais)</h2>
            <p className="text-sm text-gray-400">Gerenciamento financeiro de Contas a Pagar e Receber</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-6 relative z-10">
        <form onSubmit={handleSearch} className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por Fornecedor, Documento ou Tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#151b2b] border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
            />
          </div>
          
          {/* Filtros de Data */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-[#151b2b] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all text-sm"
              title="Data Início"
            />
            <span className="text-gray-500">até</span>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-[#151b2b] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all text-sm"
              title="Data Fim"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors border border-gray-700"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={handleTodos}
            className="px-6 py-3 bg-[#151b2b] hover:bg-gray-800 text-rose-400 rounded-xl font-semibold transition-colors border border-rose-500/30 whitespace-nowrap"
          >
            TODOS
          </button>
        </form>
      </div>

      <div className="flex-1 bg-[#151b2b] border border-gray-700/50 rounded-xl overflow-hidden relative z-10">
        <div className="overflow-auto h-full custom-scrollbar">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-[#0d1220] text-gray-400 sticky top-0 z-20 border-b border-gray-700/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('id')}>ID {sortCol === 'id' && (sortDesc ? '↓' : '↑')}</th>
                <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('fornecedor')}>Fornecedor / Faturado {sortCol === 'fornecedor' && (sortDesc ? '↓' : '↑')}</th>
                <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('data_emissao')}>Data Emissão {sortCol === 'data_emissao' && (sortDesc ? '↓' : '↑')}</th>
                <th className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('valor_total')}>Valor Total {sortCol === 'valor_total' && (sortDesc ? '↓' : '↑')}</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 text-right font-semibold tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 text-rose-500 animate-spin mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && sortedContas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    Nenhum registro encontrado. Use a busca ou clique em TODOS.
                  </td>
                </tr>
              )}
              {!loading && sortedContas.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-gray-500 font-mono">#{c.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-200 truncate max-w-[200px]" title={c.fornecedor}>{c.fornecedor}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{c.fornecedor_doc}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {c.data_emissao}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-white tabular-nums">
                    {formatCurrency(c.valor_total)}
                    <div className={`text-[10px] uppercase font-bold mt-1 ${c.tipo === 'APAGAR' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {c.tipo}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {c.parcelas_pendentes === 0 && c.total_parcelas > 0 ? (
                        <span className="inline-flex items-center gap-1 w-max px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] uppercase font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Concluído
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 w-max px-2 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] uppercase font-bold">
                          <Clock className="w-3 h-3" /> {c.parcelas_pendentes}/{c.total_parcelas} Pendentes
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(c.id)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Editar Conta">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors" title="Excluir Lógicamente">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
