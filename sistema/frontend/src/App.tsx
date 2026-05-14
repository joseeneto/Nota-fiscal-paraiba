import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import NfExtraction from './pages/NfExtraction';
import NotasList from './pages/NotasList';
import { LayoutList, FilePlus2, Banknote } from 'lucide-react';

type Tab = 'lista' | 'lancar';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('lista');

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0f1a] flex flex-col">
        {/* Top Nav */}
        <header className="border-b border-gray-800 bg-[#0d1220]/90 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-16">
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
            <nav className="flex items-center gap-1">
              <button
                id="tab-lista"
                onClick={() => setActiveTab('lista')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'lista'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <LayoutList className="w-4 h-4" />
                Lista de Notas
              </button>

              <button
                id="tab-lancar"
                onClick={() => setActiveTab('lancar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'lancar'
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <FilePlus2 className="w-4 h-4" />
                Lançar Nota
              </button>
            </nav>

            {/* Active tab indicator */}
            <div className="ml-auto">
              <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border ${
                activeTab === 'lista'
                  ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                  : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
              }`}>
                {activeTab === 'lista' ? 'Visualização' : 'Importação via IA'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
          {activeTab === 'lista' && <NotasList />}
          {activeTab === 'lancar' && <NfExtractionWrapper onGoToList={() => setActiveTab('lista')} />}
        </main>
      </div>
    </BrowserRouter>
  );
}

/** Wraps NfExtraction to fit the new dark layout */
function NfExtractionWrapper({ onGoToList }: { onGoToList: () => void }) {
  return (
    <div className="flex justify-center">
      <NfExtraction onGoToList={onGoToList} />
    </div>
  );
}


export default App;
