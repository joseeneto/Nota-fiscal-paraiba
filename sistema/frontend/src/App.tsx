import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import NfExtraction from './pages/NfExtraction';
import Contas from './pages/Contas';
import Pessoas from './pages/Pessoas';
import Classificacoes from './pages/Classificacoes';
import RagSearch from './pages/RagSearch';
import { FilePlus2, Banknote, Brain, Users, Tags, ReceiptText } from 'lucide-react';

type Tab = 'contas' | 'pessoas' | 'classificacoes' | 'lancar' | 'rag';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('contas');

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0f1a] flex flex-col">
        {/* Top Nav */}
        <header className="border-b border-gray-800 bg-[#0d1220]/90 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 mr-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg">
                <Banknote className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
                Financeiro<span className="text-emerald-400">NF</span>
              </span>
            </div>

            {/* Tabs */}
            <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('contas')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'contas'
                    ? 'bg-rose-500/10 text-rose-400 shadow-sm border border-rose-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <ReceiptText className="w-4 h-4" />
                Contas
              </button>

              <button
                onClick={() => setActiveTab('pessoas')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'pessoas'
                    ? 'bg-blue-500/10 text-blue-400 shadow-sm border border-blue-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4" />
                Pessoas
              </button>

              <button
                onClick={() => setActiveTab('classificacoes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'classificacoes'
                    ? 'bg-emerald-500/10 text-emerald-400 shadow-sm border border-emerald-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Tags className="w-4 h-4" />
                Classificações
              </button>

              <button
                onClick={() => setActiveTab('lancar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'lancar'
                    ? 'bg-white/10 text-white shadow-sm border border-gray-600'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <FilePlus2 className="w-4 h-4" />
                Lançar NF
              </button>

              <button
                onClick={() => setActiveTab('rag')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'rag'
                    ? 'bg-indigo-500/10 text-indigo-400 shadow-sm border border-indigo-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Brain className="w-4 h-4" />
                Assistente IA
              </button>
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
          {activeTab === 'contas' && <Contas />}
          {activeTab === 'pessoas' && <Pessoas />}
          {activeTab === 'classificacoes' && <Classificacoes />}
          {activeTab === 'lancar' && <NfExtractionWrapper onGoToList={() => setActiveTab('contas')} />}
          {activeTab === 'rag' && <RagSearch />}
        </main>
      </div>
    </BrowserRouter>
  );
}

/** Wraps NfExtraction to fit the new dark layout */
function NfExtractionWrapper({ onGoToList }: { onGoToList: () => void }) {
  return (
    <div className="flex justify-center h-full">
      <NfExtraction onGoToList={onGoToList} />
    </div>
  );
}

export default App;
