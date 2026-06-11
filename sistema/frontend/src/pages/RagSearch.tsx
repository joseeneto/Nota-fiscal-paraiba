import { useState } from 'react';
import axios from 'axios';
import { 
  Brain, 
  Send, 
  Cpu, 
  HelpCircle, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  TrendingUp,
  FileText,
  DollarSign
} from 'lucide-react';

interface Fonte {
  id: number;
  texto: string;
  score: number;
  fornecedor: string;
  valor_total: number;
}

interface RagResponse {
  pergunta: string;
  resposta: string;
  tipo_rag: 'simples' | 'embeddings';
  fontes: Fonte[];
}

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/rag` : '/api/financeiro/rag';

export default function RagSearch() {
  const [pergunta, setPergunta] = useState('');
  const [tipoRag, setTipoRag] = useState<'simples' | 'embeddings'>('embeddings');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<RagResponse | null>(null);
  const [error, setError] = useState('');

  const sugestoes = [
    {
      titulo: 'Total de Gastos',
      texto: 'Qual o valor total de todas as contas a pagar lançadas?',
      icon: DollarSign,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
    },
    {
      titulo: 'Parcelas Pendentes',
      texto: 'Quais parcelas estão pendentes de pagamento e seus valores?',
      icon: TrendingUp,
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/5'
    },
    {
      titulo: 'Fornecedor da Maior Nota',
      texto: 'Quem é o fornecedor da nota fiscal de maior valor e qual o valor dela?',
      icon: FileText,
      color: 'text-blue-400 border-blue-500/20 bg-blue-500/5'
    },
    {
      titulo: 'Insumos Agrícolas',
      texto: 'Quais despesas foram classificadas como INSUMOS AGRÍCOLAS?',
      icon: Sparkles,
      color: 'text-purple-400 border-purple-500/20 bg-purple-500/5'
    }
  ];

  const handleSubmit = async (e?: React.FormEvent, perguntaTexto?: string) => {
    if (e) e.preventDefault();
    const queryStr = perguntaTexto || pergunta;
    if (!queryStr.trim()) return;

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await axios.post<RagResponse>(`${API_BASE}/perguntar`, {
        pergunta: queryStr,
        tipo_rag: tipoRag
      });
      setResponse(res.data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Erro ao consultar a IA. Verifique se o backend está ativo e a GEMINI_API_KEY está correta.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSugestaoClick = (texto: string) => {
    setPergunta(texto);
    handleSubmit(undefined, texto);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Intro Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-xl shadow-indigo-500/10 mb-2">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Assistente <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Financeiro RAG</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Faça perguntas em linguagem natural sobre Notas Fiscais, fornecedores, valores, categorias de despesas ou status de parcelas armazenadas no banco de dados.
        </p>
      </div>

      {/* Main RAG Form Container */}
      <div className="bg-[#111827]/80 backdrop-blur-md rounded-2xl border border-gray-800 p-5 sm:p-6 shadow-2xl space-y-6">
        {/* Toggle Mode */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-semibold text-gray-300">Método de Recuperação (RAG)</span>
          </div>
          
          <div className="grid grid-cols-2 p-1 bg-gray-900 rounded-xl border border-gray-800 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setTipoRag('simples')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                tipoRag === 'simples'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              RAG Simples
            </button>
            <button
              type="button"
              onClick={() => setTipoRag('embeddings')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                tipoRag === 'embeddings'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              RAG Embeddings
            </button>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Ex: Quanto gastamos no total com manutenção?"
            disabled={loading}
            className="w-full bg-gray-950 text-white placeholder-gray-500 pl-4 pr-14 py-4 rounded-xl border border-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={loading || !pergunta.trim()}
            className="absolute right-2.5 top-2.5 p-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>

        {/* Suggestion Grid */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> Sugestões de Perguntas
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sugestoes.map((sug) => {
              const IconComp = sug.icon;
              return (
                <button
                  key={sug.titulo}
                  type="button"
                  onClick={() => handleSugestaoClick(sug.texto)}
                  disabled={loading}
                  className={`flex items-start text-left p-3 rounded-xl border transition-all duration-250 group hover:border-indigo-500/40 hover:bg-indigo-500/5 ${sug.color}`}
                >
                  <div className="p-2 rounded-lg bg-black/20 mr-3 mt-0.5 group-hover:scale-110 transition-transform">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white mb-0.5">{sug.titulo}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2">{sug.texto}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 animate-slideUp">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-bold">Falha na Requisição</h4>
            <p className="mt-0.5 text-red-300/90">{error}</p>
          </div>
        </div>
      )}

      {/* Answer & Sources Panel */}
      {response && (
        <div className="space-y-6 animate-slideUp">
          {/* Answer Card */}
          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Brain className="w-32 h-32 text-indigo-400" />
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Resposta Elaborada com Gemini</span>
            </div>

            <div className="prose prose-invert max-w-none text-gray-200 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
              {response.resposta}
            </div>
          </div>

          {/* Sources Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Fontes Recuperadas do Banco ({response.fontes.length})
            </h3>
            
            <div className="space-y-3">
              {response.fontes.map((f, idx) => (
                <div 
                  key={idx} 
                  className="bg-[#111827]/60 border border-gray-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-700 transition-colors"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gray-900 text-gray-300 border border-gray-800">
                        Lançamento #{f.id}
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-[200px]">
                        {f.fornecedor}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        R$ {f.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed font-mono bg-black/10 p-2.5 rounded-lg border border-gray-800/40">
                      {f.texto}
                    </p>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">
                        Relevância
                      </span>
                      <span className={`text-sm font-bold tracking-tight ${
                        response.tipo_rag === 'embeddings' ? 'text-indigo-400' : 'text-blue-400'
                      }`}>
                        {response.tipo_rag === 'embeddings' 
                          ? `${(f.score * 100).toFixed(1)}%` 
                          : `Score ${f.score}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
