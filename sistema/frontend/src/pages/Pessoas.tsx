import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, Loader2, Users } from 'lucide-react';

interface Pessoa {
  id: number;
  razao_social: string;
  cnpj_cpf: string;
  tipo: string;
  ativo: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function Pessoas() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPessoa, setEditingPessoa] = useState<Pessoa | null>(null);
  const [formData, setFormData] = useState({ razao_social: '', cnpj_cpf: '', tipo: 'FORNECEDOR' });

  const fetchPessoas = useCallback(async (busca?: string) => {
    setLoading(true);
    try {
      const url = busca ? `${API_BASE}/pessoas/?buscar=${encodeURIComponent(busca)}` : `${API_BASE}/pessoas/`;
      const res = await axios.get(url);
      setPessoas(res.data);
    } catch (e: any) {
      console.error('Erro ao buscar pessoas.', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega todos os registros ao iniciar
  useEffect(() => {
    fetchPessoas();
  }, [fetchPessoas]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchPessoas(searchTerm);
    }
  };

  const handleTodos = () => {
    setSearchTerm('');
    fetchPessoas();
  };

  const openModal = (pessoa?: Pessoa) => {
    if (pessoa) {
      setEditingPessoa(pessoa);
      setFormData({ razao_social: pessoa.razao_social, cnpj_cpf: pessoa.cnpj_cpf, tipo: pessoa.tipo });
    } else {
      setEditingPessoa(null);
      setFormData({ razao_social: '', cnpj_cpf: '', tipo: 'FORNECEDOR' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPessoa(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPessoa) {
        await axios.put(`${API_BASE}/pessoas/${editingPessoa.id}`, formData);
      } else {
        await axios.post(`${API_BASE}/pessoas/`, formData);
      }
      closeModal();
      fetchPessoas(); // recarrega a lista completa após salvar
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Erro ao salvar pessoa.';
      alert(msg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este registro? (Exclusão Lógica)')) return;
    try {
      await axios.delete(`${API_BASE}/pessoas/${id}`);
      handleTodos();
    } catch (e) {
      alert('Erro ao excluir.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1220] rounded-2xl border border-gray-800 p-6 shadow-2xl relative overflow-hidden">
      {/* Bg glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Pessoas</h2>
            <p className="text-sm text-gray-400">Gerencie Fornecedores, Clientes e Faturados</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nova Pessoa
        </button>
      </div>

      <div className="flex gap-3 mb-6 relative z-10">
        <form onSubmit={handleSearch} className="flex-1 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por Razão Social, Documento ou Tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#151b2b] border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
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
          className="px-6 py-3 bg-[#151b2b] hover:bg-gray-800 text-blue-400 rounded-xl font-semibold transition-colors border border-blue-500/30"
        >
          TODOS
        </button>
      </div>

      <div className="flex-1 bg-[#151b2b] border border-gray-700/50 rounded-xl overflow-hidden relative z-10">
        <div className="overflow-x-auto h-full custom-scrollbar">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase bg-[#0d1220] text-gray-400 sticky top-0 z-20 border-b border-gray-700/50">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Razão Social</th>
                <th className="px-6 py-4 font-semibold tracking-wider">CNPJ / CPF</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-right font-semibold tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && pessoas.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    Nenhum registro encontrado. Clique em "+ Nova Pessoa" para cadastrar.
                  </td>
                </tr>
              )}
              {!loading && pessoas.map((pessoa) => (
                <tr key={pessoa.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-medium text-gray-200">{pessoa.razao_social}</td>
                  <td className="px-6 py-4 font-mono text-gray-400">{pessoa.cnpj_cpf}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-800 text-gray-300 text-[10px] uppercase font-bold px-2 py-1 rounded border border-gray-700">
                      {pessoa.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(pessoa)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(pessoa.id)} className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors">
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
              {editingPessoa ? 'Editar Pessoa' : 'Nova Pessoa'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Razão Social / Nome</label>
                <input
                  type="text"
                  required
                  value={formData.razao_social}
                  onChange={e => setFormData({ ...formData, razao_social: e.target.value })}
                  className="w-full bg-[#151b2b] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">CNPJ / CPF</label>
                <input
                  type="text"
                  required
                  value={formData.cnpj_cpf}
                  onChange={e => setFormData({ ...formData, cnpj_cpf: e.target.value })}
                  className="w-full bg-[#151b2b] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full bg-[#151b2b] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="FORNECEDOR">Fornecedor</option>
                  <option value="CLIENTE">Cliente</option>
                  <option value="FATURADO">Faturado</option>
                  <option value="CLIENTE-FORNECEDOR">Cliente e Fornecedor</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 bg-transparent border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all">
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
