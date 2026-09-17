import React, { useEffect, useState } from 'react';
import { X, Award, User, RefreshCw, Calendar, CheckCircle, XCircle, Download } from 'lucide-react';
import { AttemptResult } from '../types';
import { downloadAnyCertificatePdf } from '../utils/pdfGenerator';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<AttemptResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history');
      if (!res.ok) throw new Error('Error al conectar con la base de datos');
      const data = await res.json();
      if (data.records) {
        setHistory(data.records);
      }
    } catch (err: any) {
      console.warn('Could not load history from server:', err);
      // Fallback: check localStorage
      const local = localStorage.getItem('accounting_challenge_history');
      if (local) {
        try {
          setHistory(JSON.parse(local));
        } catch {
          setHistory([]);
        }
      } else {
        setError('No se pudo cargar el historial del servidor');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (record: any) => {
    const recId = record.id || `${record.timestamp}`;
    setDownloadingId(recId);
    try {
      await downloadAnyCertificatePdf(record);
    } catch (err) {
      console.error('Error downloading certificate from history:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-white overflow-hidden max-h-[90vh] flex flex-col"
        id="modal-history-records"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Historial de Intentos</h3>
              <p className="text-xs text-slate-400">Registros almacenados en la base de datos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition disabled:opacity-50"
              title="Recargar historial"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {loading && history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
              <p className="text-sm">Consultando registros...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2 bg-slate-800/40 rounded-xl border border-slate-800">
              <User className="w-8 h-8 mx-auto text-slate-500" />
              <p className="text-sm font-medium">Aún no hay intentos registrados en la base de datos.</p>
              <p className="text-xs text-slate-500">Completa un reto para guardar el primer certificado y resultado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record: any, index) => {
                const isAct2 = record.activityType === 'activity2';

                return (
                  <div
                    key={record.id || index}
                    className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-600 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">
                          {record.apprenticeName}
                        </span>
                        <span className="text-[11px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                          Ficha: {record.ficha}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded font-semibold border ${
                          isAct2
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {isAct2 ? 'Activity 2 • Audio 20' : 'Activity 1 • Reto Fotos 30'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-md">
                        {record.program}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" /> {record.date}
                        </span>
                        {isAct2 ? (
                          <span className="flex items-center gap-1 text-cyan-400">
                            <CheckCircle className="w-3 h-3" /> 20/20 frases armadas
                          </span>
                        ) : (
                          <>
                            <span className="flex items-center gap-1 text-emerald-400">
                              <CheckCircle className="w-3 h-3" /> {record.correctAnswers} correctas
                            </span>
                            <span className="flex items-center gap-1 text-rose-400">
                              <XCircle className="w-3 h-3" /> {record.incorrectAnswers} incorrectas
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700/50 gap-2">
                      <div className="text-left sm:text-right">
                        <span className={`text-lg font-black ${isAct2 ? 'text-cyan-400' : 'text-emerald-400'}`}>
                          {record.score} <span className="text-xs font-normal text-slate-400">{isAct2 ? '/ 20' : '/ 100'}</span>
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 block">
                          {record.percentage}% {isAct2 ? 'Precisión inicial' : 'Aciertos'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownload(record)}
                        disabled={downloadingId === (record.id || `${record.timestamp}`)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                        title="Descargar Certificado Oficial en PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>
                          {downloadingId === (record.id || `${record.timestamp}`) ? 'Generando...' : 'Certificado PDF'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Total de registros: <strong className="text-slate-200">{history.length}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
