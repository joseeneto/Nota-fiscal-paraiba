import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, CheckCircle2, RefreshCw, AlertCircle, AlertTriangle, Loader2, LayoutList } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api/financeiro';

export default function NfExtraction({ onGoToList }: { onGoToList?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [data, setData] = useState<any>(null);
  const [verificacao, setVerificacao] = useState<any>(null);
  const [confirmacaoStatus, setConfirmacaoStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE}/extrair-nf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const extractedData = response.data;
      setData(extractedData);

      const verifResponse = await axios.post(`${API_BASE}/verificar`, extractedData);
      setVerificacao(verifResponse.data);

    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || 'Ocorreu um erro na extração. Verifique a chave de API e os logs do terminal.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async () => {
    setConfirmacaoStatus('loading');
    setErrorMsg('');
    try {
      await axios.post(`${API_BASE}/confirmar`, data);
      setConfirmacaoStatus('success');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || 'Erro ao confirmar o lançamento.');
      setConfirmacaoStatus('idle');
    }
  };

  const resetForm = () => {
    setFile(null);
    setData(null);
    setVerificacao(null);
    setConfirmacaoStatus('idle');
    setErrorMsg('');
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="bg-[#111827] rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden flex flex-col md:flex-row min-h-[520px]">

        {/* Left Panel - Upload */}
        <div className="w-full md:w-[42%] p-7 border-b md:border-b-0 md:border-r border-gray-700/50 bg-[#0d1220] flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Processar Nota Fiscal</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Importe um PDF de NF para extrair os dados automaticamente via IA e lançar no sistema.
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-7 text-center transition-all duration-200 flex-1 flex flex-col items-center justify-center
              ${file
                ? 'border-emerald-500/60 bg-emerald-500/5'
                : 'border-gray-600 hover:border-gray-400 hover:bg-white/5 cursor-pointer'}`}
          >
            {file ? (
              <div className="flex flex-col items-center">
                <div className="bg-gray-800 p-3 rounded-full shadow-sm mb-3 border border-gray-700">
                  <FileText className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="text-gray-100 font-medium truncate w-full max-w-[200px] text-sm">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  onClick={() => setFile(null)}
                  className="mt-4 text-xs text-red-400 hover:text-red-300 font-semibold transition-colors"
                >
                  Remover Arquivo
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className="w-11 h-11 text-gray-500 mb-3" />
                <p className="text-sm font-medium text-gray-300">Arraste e solte o PDF aqui</p>
                <p className="text-xs text-gray-500 mt-1 mb-3">ou</p>
                <label className="cursor-pointer bg-gray-800 border border-gray-600 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:border-gray-500 transition-all">
                  Procurar Arquivo
                  <input id="file-input" type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
                </label>
              </div>
            )}
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-sm text-red-400 font-medium flex items-start gap-2 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Submit */}
          <button
            id="btn-extrair"
            onClick={handleSubmit}
            disabled={!file || loading}
            className={`w-full mt-5 py-3 px-4 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2 text-sm
              ${!file || loading
                ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-900/40'}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Lendo arquivo e IA...
              </>
            ) : (
              <>Extrair Dados da Nota</>
            )}
          </button>
        </div>

        {/* Right Panel - Result */}
        <div className="w-full md:flex-1 bg-gray-900 flex flex-col items-center justify-center min-h-[400px]">
          {/* Empty state */}
          {!data && !loading && (
            <div className="flex flex-col items-center text-center p-8 opacity-30">
              <FileText className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-base font-bold text-gray-300">Nenhum dado extraído</h3>
              <p className="text-sm text-gray-400 mt-1">O resultado da extração aparecerá aqui.</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-full w-full gap-4">
              <div className="relative">
                <div className="w-14 h-14 border-4 border-gray-800 rounded-full" />
                <div className="w-14 h-14 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0" />
              </div>
              <p className="text-emerald-400 font-semibold text-sm animate-pulse tracking-wide">
                Gemini está lendo a NF...
              </p>
            </div>
          )}

          {/* Data result */}
          {data && !loading && (
            <div className="w-full h-full flex flex-col">
              {/* Result header */}
              <div className="flex items-center justify-between p-4 px-5 border-b border-gray-800 bg-[#0d1520]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white tracking-wide">DADOS EXTRAÍDOS</h3>
                </div>
                <button
                  id="btn-limpar"
                  onClick={resetForm}
                  className="text-xs border border-gray-700 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Nova Nota
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto w-full">

                {/* SUCCESS state */}
                {confirmacaoStatus === 'success' && (
                  <div className="mb-4 bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-5 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <h3 className="text-emerald-400 font-bold text-base">REGISTRO LANÇADO COM SUCESSO!</h3>
                    <p className="text-emerald-200/70 text-sm mt-1 mb-4">Os dados foram persistidos no banco de dados.</p>
                    {onGoToList && (
                      <button
                        id="btn-ir-lista"
                        onClick={onGoToList}
                        className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        <LayoutList className="w-4 h-4" />
                        Ver Lista de Notas
                      </button>
                    )}
                  </div>
                )}

                {/* Verification panel */}
                {verificacao && confirmacaoStatus !== 'success' && (() => {
                  const isDuplicate = verificacao.movimento_duplicado === true;
                  return (
                    <div className={`mb-4 rounded-xl p-4 border ${
                      isDuplicate
                        ? 'bg-red-950/40 border-red-500/50'
                        : 'bg-gray-800/60 border-gray-700/50'
                    }`}>
                      <h4 className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-3 border-b border-gray-700 pb-2">
                        Status no Banco de Dados
                      </h4>

                      {/* Duplicate warning banner */}
                      {isDuplicate && (
                        <div className="flex items-start gap-2.5 bg-red-500/15 border border-red-500/40 rounded-lg px-3 py-2.5 mb-4">
                          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-red-400 font-bold text-xs uppercase tracking-wide">Movimento Duplicado Detectado</p>
                            <p className="text-red-300/80 text-[11px] mt-0.5 leading-relaxed">
                              Já existe um movimento registrado com os mesmos dados (fornecedor, faturado e número de NF). O lançamento foi bloqueado para evitar duplicidade.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Fornecedor</span>
                          <span className="text-sm text-gray-200 font-medium">{data.fornecedor?.razao_social}</span>
                          <span className="text-xs text-gray-500">CNPJ: {data.fornecedor?.cnpj}</span>
                          <span className={`text-xs font-bold mt-0.5 ${verificacao.fornecedor.existe ? 'text-blue-400' : 'text-amber-400'}`}>
                            {verificacao.fornecedor.mensagem}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Faturado</span>
                          <span className="text-sm text-gray-200 font-medium">{data.faturado?.nome_completo}</span>
                          <span className="text-xs text-gray-500">CPF: {data.faturado?.cpf}</span>
                          <span className={`text-xs font-bold mt-0.5 ${verificacao.faturado.existe ? 'text-blue-400' : 'text-amber-400'}`}>
                            {verificacao.faturado.mensagem}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 font-bold uppercase">Despesa</span>
                          <span className="text-sm text-gray-200 font-medium">{data.classificacao_despesa}</span>
                          <span className={`text-xs font-bold mt-0.5 ${verificacao.despesa.existe ? 'text-blue-400' : 'text-amber-400'}`}>
                            {verificacao.despesa.mensagem}
                          </span>
                        </div>
                      </div>

                      <button
                        id="btn-confirmar"
                        onClick={handleConfirmar}
                        disabled={confirmacaoStatus === 'loading' || isDuplicate}
                        title={isDuplicate ? 'Lançamento bloqueado: movimento duplicado' : ''}
                        className={`w-full mt-4 font-bold py-2.5 px-4 rounded-lg transition-all flex justify-center items-center gap-2 text-sm ${
                          isDuplicate
                            ? 'bg-gray-700/60 text-gray-500 cursor-not-allowed border border-gray-700'
                            : confirmacaoStatus === 'loading'
                              ? 'bg-blue-700/50 text-blue-300 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-900/30'
                        }`}
                      >
                        {confirmacaoStatus === 'loading' ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                        ) : isDuplicate ? (
                          <><AlertTriangle className="w-4 h-4" /> LANÇAMENTO BLOQUEADO — DUPLICATA</>
                        ) : (
                          'CONFIRMAR E LANÇAR REGISTRO'
                        )}
                      </button>
                    </div>
                  );
                })()}

                {/* Raw JSON */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Payload Extraído</span>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                    JSON
                  </span>
                </div>
                <pre className="text-emerald-300 text-[11px] font-mono leading-relaxed p-3 rounded-lg bg-gray-950/60 overflow-x-auto border border-gray-800">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
