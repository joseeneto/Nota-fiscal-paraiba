import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, Loader2, Tags } from 'lucide-react';

interface Classificacao {
  id: number;
  descricao: string;
  tipo: string;
  ativo: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Classificacoes() {
  const [classificacoes, setClassificacoes] = useState<Classificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Classificacao | null>(null);
  const [formData, setFormData] = useState({ descricao: '', tipo: 'DESPESA' });

  const fetchClassificacoes = useCallback(async (busca?: string) => {
    setLoading(true);
    try {
      const url = busca ? `${API_BASE}/classificacoes/?buscar=${encodeURIComponent(busca)}` : `${API_BASE}/classificacoes/`;
      const res = await axios.get(url);
      setClassificacoes(res.data);
    } catch (e: any) {
      console.error('Erro ao buscar classificações.', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClassificacoes();
  }, [fetchClassificacoes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchClassificacoes(searchTerm);
    }
  };

  const handleTodos = () => {
    setSearchTerm('');
    fetchClassificacoes();
  };

  const openModal = (c?: Classificacao) => {
    if (c) {
      setEditingClass(c);
      setFormData({ descricao: c.descricao, tipo: c.tipo });
    } else {
      setEditingClass(null);
      setFormData({ descricao: '', tipo: 'DESPESA' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClass(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await axios.put(`${API_BASE}/classificacoes/${editingClass.id}`, formData);
      } else {
        await axios.post(`${API_BASE}/classificacoes/`, formData);
      }
      closeModal();
      fetchClassificacoes();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Erro ao salvar classificação.';
      alert(msg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este registro? (Exclusão Lógica)')) return;
    try {
      await axios.delete(`${API_BASE}/classificacoes/${id}`);
      handleTodos();
    } catch (e) {
      alert('Erro ao excluir.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1220] rounded-2xl border border-gray-800 p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <Tags className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Classificações</h2>
            <p className="text-sm text-gray-400">Gerencie categorias de Receita e Despesa</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      <div className="flex gap-3 mb-6 relative z-10">
        <form onSubmit={handleSearch} className="flex-1 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por Descrição ou Tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#151b2b] border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors border border-gray-700"
          >
            Buscar
          </button>
        </form>
        <button
          onClick={handleTodos}
          className="px-6 py-3 bg-[#151b2b] hover:bg-gray-800 text-emerald-400 rounded-xl font-semibold transition-colors border border-emerald-500/30"
        >
          TODOS
        </button>
      </div>

      <div className="flex-1 bg-[#151b2b] border border-gray-700/50 rounded-xl overflow-hidden relative z-10">
        <div className="overflow-x-auto h-full custom-scrollbar">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-[#0d1220] text-gray-400 sticky top-0 z-20 border-b border-gray-700/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Descrição</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-right font-semibold tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && classificacoes.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                    Nenhum registro encontrado. Clique em "+ Nova Categoria" para cadastrar.
                  </td>
                </tr>
              )}
              {!loading && classificacoes.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-medium text-gray-200">{c.descricao}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${
                      c.tipo === 'DESPESA' 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {c.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(c)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0d1220] border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">
              {editingClass ? 'Editar Classificação' : 'Nova Classificação'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  value={formData.descricao}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-[#151b2b] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full bg-[#151b2b] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="DESPESA">Despesa</option>
                  <option value="RECEITA">Receita</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 bg-transparent border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
