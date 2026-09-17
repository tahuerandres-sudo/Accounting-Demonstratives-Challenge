import React, { useState, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  Hash, 
  ArrowRight, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Calculator, 
  ShieldCheck,
  Headphones,
  Layers,
  Volume2,
  RotateCcw,
  Play,
  Download,
  CheckCircle,
  Clock,
  Calendar,
  Flame,
  FileCheck,
  History,
  Check,
  Circle
} from 'lucide-react';
import { ApprenticeData, ActivitiesStatusSummary } from '../types';

interface ActiveSessionInfo {
  activity: 'activity1' | 'activity2';
  summary: string;
  details: string;
}

interface WelcomeScreenProps {
  initialData: ApprenticeData;
  activeSession?: ActiveSessionInfo | null;
  activitiesStatus: ActivitiesStatusSummary;
  timeWorkedFormatted?: string;
  timeWorkedSeconds?: number;
  onDownloadCertificate: (record?: any) => void;
  onResumeSession?: () => void;
  onResetSession?: () => void;
  onStartActivity1: (data: ApprenticeData) => void;
  onStartActivity2: (data: ApprenticeData) => void;
  onOpenGrammar: () => void;
  onOpenHistory?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  initialData,
  activeSession,
  activitiesStatus,
  timeWorkedFormatted = '0 min 0 seg',
  timeWorkedSeconds = 0,
  onDownloadCertificate,
  onResumeSession,
  onResetSession,
  onStartActivity1,
  onStartActivity2,
  onOpenGrammar,
  onOpenHistory,
}) => {
  const [fullName, setFullName] = useState(initialData.fullName || '');
  const [program, setProgram] = useState(
    initialData.program || 'Gestión Contable y de Información Financiera'
  );
  const [ficha, setFicha] = useState(initialData.ficha || '');
  const [selectedActivity, setSelectedActivity] = useState<'activity1' | 'activity2'>(
    activeSession?.activity || 'activity1'
  );
  const [isDownloadingCert, setIsDownloadingCert] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; ficha?: string }>({});

  // Sync with initialData changes (e.g. if loaded from storage asynchronously)
  useEffect(() => {
    if (initialData.fullName && !fullName) setFullName(initialData.fullName);
    if (initialData.ficha && !ficha) setFicha(initialData.ficha);
    if (initialData.program && !program) setProgram(initialData.program);
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: { fullName?: string; ficha?: string } = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'Por favor ingresa tu nombre completo.';
    }
    if (!ficha.trim()) {
      newErrors.ficha = 'Por favor ingresa el número de tu ficha de formación.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const getFormData = (): ApprenticeData => ({
    fullName: fullName.trim(),
    program: program.trim() || 'Gestión Contable y de Información Financiera',
    ficha: ficha.trim(),
  });

  const handleLaunch = (activity: 'activity1' | 'activity2') => {
    if (!validate()) return;
    const data = getFormData();
    if (activity === 'activity1') {
      onStartActivity1(data);
    } else {
      onStartActivity2(data);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLaunch(selectedActivity);
  };

  // Single Consolidated Certificate Download Handler
  const handleDownloadConsolidated = async () => {
    setIsDownloadingCert(true);
    try {
      const currentApprentice = getFormData();
      await onDownloadCertificate({
        apprenticeName: currentApprentice.fullName || initialData.fullName || 'Aprendiz SENA',
        ficha: currentApprentice.ficha || initialData.ficha || 'Gestión Contable',
        program: currentApprentice.program || initialData.program || 'Gestión Contable y de Información Financiera',
      });
    } finally {
      setIsDownloadingCert(false);
    }
  };

  // Activity 1 & 2 completion metrics
  const act1Completed = activitiesStatus.activity1.isCompleted;
  const act2Completed = activitiesStatus.activity2.isCompleted;
  const completedCount = (act1Completed ? 1 : 0) + (act2Completed ? 1 : 0);
  const totalPercent = Math.round((completedCount / 2) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fadeIn space-y-8" id="screen-welcome">
      {/* Hero Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> SENA • Centro de Servicios Financieros
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Accounting English{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Demonstratives Modules
          </span>
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
          Plataforma de aprendizaje y certificación para aprendices contables. Domina <strong>THIS, THAT, THESE y THOSE</strong> mediante retos fotográficos y comprensión auditiva de frases contables sencillas (máx. 5 palabras).
        </p>
      </div>

      {/* ESTADO DE ACTIVIDADES DEL APRENDIZ (HECHAS VS PENDIENTES) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden" id="card-activities-status-tracker">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header of Activities Tracker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Estado de Actividades
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {completedCount} de 2 Actividades Realizadas
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">
                ¿Qué actividades has hecho y cuáles tienes pendientes?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Supera ambas actividades para obtener tus certificados de aptitud bilingüe en inglés contable.
              </p>
            </div>

            {/* Overall Progress Gauge */}
            <div className="sm:text-right shrink-0 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 min-w-[200px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Progreso Global
              </span>
              <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                {totalPercent}%
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mt-2 border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-700 rounded-full"
                  style={{ width: `${Math.max(totalPercent, 5)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1.5">
                {completedCount === 2 
                  ? '🎉 ¡Ambas actividades completadas!' 
                  : completedCount === 1 
                  ? '⚡ 1 completada, 1 pendiente' 
                  : '⏳ 2 actividades pendientes por realizar'}
              </span>
            </div>
          </div>

          {/* BANNER / CARD: CERTIFICADO ÚNICO CONSOLIDADO (SOLAMENTE 1 CERTIFICADO CON TODOS LOS DATOS) */}
          <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-2 border-amber-500/50 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    CERTIFICADO ÚNICO CONSOLIDADO SENA
                  </span>
                  <span className="text-xs text-slate-400">
                    • Ambas actividades en un solo documento oficial
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Certificado de Aptitud Bilingüe en Inglés Contable
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Solamente se emite un certificado oficial que consolida los resultados de las <strong>dos actividades</strong>, el <strong>tiempo trabajado</strong>, las <strong>actividades realizadas</strong> y las <strong>actividades pendientes</strong>.
                </p>
              </div>

              {/* Botón Único de Descarga */}
              <button
                type="button"
                id="btn-download-consolidated-certificate"
                onClick={handleDownloadConsolidated}
                disabled={isDownloadingCert}
                className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 shrink-0"
                title="Descargar el Certificado Consolidado Oficial con ambas actividades"
              >
                <Download className={`w-4 h-4 ${isDownloadingCert ? 'animate-bounce' : ''}`} />
                <span>{isDownloadingCert ? 'Generando PDF Consolidado...' : 'Descargar Certificado Consolidado 📜'}</span>
              </button>
            </div>

            {/* Ficha Resumen de Datos que van en el Certificado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-amber-500/20 text-xs">
              {/* 1. Nombre del Aprendiz */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  1. Nombre del Aprendiz
                </span>
                <span className="font-extrabold text-white truncate block text-xs">
                  {fullName || initialData.fullName || 'Aprendiz SENA'}
                </span>
              </div>

              {/* 2. Tiempo Trabajado */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" /> 2. Tiempo Trabajado
                </span>
                <span className="font-mono font-extrabold text-cyan-300 block text-xs">
                  {timeWorkedFormatted || '0 min 0 seg'}
                </span>
              </div>

              {/* 3. Actividades Realizadas */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" /> 3. Realizadas ({completedCount}/2)
                </span>
                <div className="text-[11px] font-semibold text-emerald-300 space-y-0.5 truncate">
                  {act1Completed && act2Completed ? (
                    <span>Ambas: Fotos 30 + Audio 20</span>
                  ) : act1Completed ? (
                    <span>Actividad 1 (Reto Fotos)</span>
                  ) : act2Completed ? (
                    <span>Actividad 2 (Audio 20)</span>
                  ) : (
                    <span className="text-slate-400 font-normal">0 realizadas aún</span>
                  )}
                </div>
              </div>

              {/* 4. Actividades No Realizadas */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider flex items-center gap-1">
                  <Circle className="w-3 h-3 text-amber-400" /> 4. No Realizadas ({2 - completedCount}/2)
                </span>
                <div className="text-[11px] font-semibold text-amber-300 space-y-0.5 truncate">
                  {2 - completedCount === 0 ? (
                    <span className="text-emerald-400">¡Ninguna pendiente! (100%)</span>
                  ) : !act1Completed && !act2Completed ? (
                    <span>Act. 1 y Act. 2 pendientes</span>
                  ) : !act1Completed ? (
                    <span>Actividad 1 pendiente</span>
                  ) : (
                    <span>Actividad 2 pendiente</span>
                  )}
                </div>
              </div>

              {/* 5. Fecha y Programa */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5 sm:col-span-2 lg:col-span-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> 5. Fecha y Programa
                </span>
                <span className="font-semibold text-slate-200 truncate block text-[11px]">
                  {new Date().toLocaleDateString('es-CO')} • {ficha || initialData.ficha || 'Gestión Contable'}
                </span>
              </div>
            </div>
          </div>

          {/* Cards: Activity 1 and Activity 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ACTIVITY 1 STATUS CARD */}
            <div className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 ${
              act1Completed 
                ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-950/20' 
                : activitiesStatus.activity1.inProgress 
                ? 'bg-amber-950/20 border-amber-500/40 shadow-md' 
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}>
              <div className="space-y-3">
                {/* Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Activity 1 • Fotos 30
                  </span>
                  {act1Completed ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-[11px] flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      HECHA / COMPLETADA
                    </span>
                  ) : activitiesStatus.activity1.inProgress ? (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-[11px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      EN PROGRESO ({activitiesStatus.activity1.streakAchieved}/30)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-bold text-[11px] flex items-center gap-1">
                      <Circle className="w-3 h-3 text-slate-500" />
                      NO REALIZADA (PENDIENTE)
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Reto de Fotografías Contables
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Identifica el pronombre demostrativo correcto (THIS, THAT, THESE, THOSE) según la foto del objeto contable y su distancia. Requiere <strong>30 aciertos consecutivos in a row</strong>.
                  </p>
                </div>

                {/* Score & Progress Details */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  {act1Completed ? (
                    <>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Puntuación lograda:</span>
                        <strong className="text-emerald-400 font-bold">
                          {activitiesStatus.activity1.score || 100} / 100 pts
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Racha final aprobada:</span>
                        <strong className="text-amber-400 font-bold flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-amber-400" /> 30 de 30 in a row
                        </strong>
                      </div>
                      {activitiesStatus.activity1.date && (
                        <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                          <span>Fecha de aprobación:</span>
                          <span className="font-mono">{activitiesStatus.activity1.date}</span>
                        </div>
                      )}
                    </>
                  ) : activitiesStatus.activity1.inProgress ? (
                    <div className="space-y-1 text-slate-300">
                      <div className="flex items-center justify-between">
                        <span>Racha actual alcanzada:</span>
                        <strong className="text-amber-400 font-bold">
                          {activitiesStatus.activity1.streakAchieved} / 30
                        </strong>
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        Faltan {30 - (activitiesStatus.activity1.streakAchieved || 0)} aciertos seguidos para aprobar el reto.
                      </span>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Aún no has iniciado esta actividad. ¡Ponte a prueba!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Activity 1 */}
              <div className="pt-2 border-t border-slate-800/80">
                {/* Start / Continue / Retry Button */}
                <button
                  type="button"
                  id="btn-launch-act1-status"
                  onClick={() => handleLaunch('activity1')}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-md"
                >
                  <Layers className="w-4 h-4" />
                  <span>
                    {act1Completed 
                      ? 'Repetir Reto de Fotos 🔄' 
                      : activitiesStatus.activity1.inProgress 
                      ? 'Continuar Reto de Fotos 🚀' 
                      : 'Iniciar Reto de Fotos 🚀'}
                  </span>
                </button>
              </div>
            </div>

            {/* ACTIVITY 2 STATUS CARD */}
            <div className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 ${
              act2Completed 
                ? 'bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-950/20' 
                : activitiesStatus.activity2.inProgress 
                ? 'bg-amber-950/20 border-amber-500/40 shadow-md' 
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}>
              <div className="space-y-3">
                {/* Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Headphones className="w-4 h-4" /> Activity 2 • Audio 20
                  </span>
                  {act2Completed ? (
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-extrabold text-[11px] flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                      HECHA / COMPLETADA
                    </span>
                  ) : activitiesStatus.activity2.inProgress ? (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-[11px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      EN PROGRESO ({activitiesStatus.activity2.completedSentences}/20)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-bold text-[11px] flex items-center gap-1">
                      <Circle className="w-3 h-3 text-slate-500" />
                      NO REALIZADA (PENDIENTE)
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Audio &amp; Sentence Builder (Máx. 5 palabras)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Escucha el audio nativo en inglés y ordena las palabras. Ahora con <strong>frases sencillas de máximo 5 palabras</strong> sobre facturas, saldos, auditoría y libros contables.
                  </p>
                </div>

                {/* Score & Progress Details */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                  {act2Completed ? (
                    <>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Frases armadas:</span>
                        <strong className="text-cyan-400 font-bold">
                          20 de 20 Frases
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Precisión en primer intento:</span>
                        <strong className="text-emerald-400 font-bold">
                          {activitiesStatus.activity2.percentage || 100}%
                        </strong>
                      </div>
                      {activitiesStatus.activity2.date && (
                        <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                          <span>Fecha de finalización:</span>
                          <span className="font-mono">{activitiesStatus.activity2.date}</span>
                        </div>
                      )}
                    </>
                  ) : activitiesStatus.activity2.inProgress ? (
                    <div className="space-y-1 text-slate-300">
                      <div className="flex items-center justify-between">
                        <span>Frases completadas:</span>
                        <strong className="text-cyan-400 font-bold">
                          {activitiesStatus.activity2.completedSentences} de 20
                        </strong>
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        Faltan {20 - (activitiesStatus.activity2.completedSentences || 0)} frases cortas para finalizar.
                      </span>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Aún no has iniciado esta actividad. ¡Escucha y construye!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Activity 2 */}
              <div className="pt-2 border-t border-slate-800/80">
                {/* Start / Continue / Retry Button */}
                <button
                  type="button"
                  id="btn-launch-act2-status"
                  onClick={() => handleLaunch('activity2')}
                  className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-md"
                >
                  <Headphones className="w-4 h-4" />
                  <span>
                    {act2Completed 
                      ? 'Practicar Activity 2 de Nuevo 🎧' 
                      : activitiesStatus.activity2.inProgress 
                      ? 'Continuar Activity 2 🎧' 
                      : 'Iniciar Activity 2 🎧'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Apprentice Registration Form & Options */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Registration Form (Left) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-950/50 backdrop-blur-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Datos del Aprendiz para los Certificados</h2>
              <p className="text-xs text-slate-400">Verifica o actualiza tu nombre y ficha antes de generar tus certificados</p>
            </div>
          </div>

          {/* Active Session in Progress Alert */}
          {activeSession && onResumeSession && (
            <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/70 border-2 border-emerald-500/50 rounded-xl p-4 shadow-lg shadow-emerald-500/10 space-y-3 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0 mt-0.5">
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    Sesión guardada en progreso
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {activeSession.summary}
                  </h4>
                  <p className="text-xs text-slate-300">
                    {activeSession.details}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  id="btn-resume-session"
                  onClick={onResumeSession}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Continuar donde quedé</span>
                </button>

                {onResetSession && (
                  <button
                    type="button"
                    onClick={onResetSession}
                    className="py-2.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                    title="Descartar el progreso actual y comenzar desde el inicio"
                  >
                    <span>Reiniciar</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" id="form-apprentice-data">
            {/* Full Name */}
            <div>
              <label 
                htmlFor="input-fullName"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                Nombre Completo del Aprendiz *
              </label>
              <input
                id="input-fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                }}
                placeholder="Ej. Carlos Andrés Mendoza Ruiz"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition ${
                  errors.fullName
                    ? 'border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20'
                }`}
              />
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Training Program */}
            <div>
              <label 
                htmlFor="input-program"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                Programa de Formación *
              </label>
              <input
                id="input-program"
                type="text"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="Ej. Gestión Contable y de Información Financiera"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
              />
            </div>

            {/* Ficha */}
            <div>
              <label 
                htmlFor="input-ficha"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5"
              >
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                Número de Ficha SENA *
              </label>
              <input
                id="input-ficha"
                type="text"
                value={ficha}
                onChange={(e) => {
                  setFicha(e.target.value);
                  if (errors.ficha) setErrors({ ...errors, ficha: undefined });
                }}
                placeholder="Ej. 2873491"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-800/90 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition ${
                  errors.ficha
                    ? 'border-rose-500 focus:ring-rose-500/30'
                    : 'border-slate-700 focus:border-amber-500 focus:ring-amber-500/20'
                }`}
              />
              {errors.ficha && (
                <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                  {errors.ficha}
                </p>
              )}
            </div>

            {/* Select Target Activity */}
            <div className="pt-2">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Selecciona la actividad a realizar:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option Activity 1 */}
                <div 
                  onClick={() => setSelectedActivity('activity1')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedActivity === 'activity1'
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-850/60 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" /> Activity 1
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full ${act1Completed ? 'bg-emerald-400 ring-2 ring-emerald-400/40' : 'bg-slate-600'}`} />
                    </div>
                    <h3 className="text-sm font-bold text-white">Reto de Fotografías</h3>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Identifica THIS, THAT, THESE o THOSE según fotos de documentos. <strong>30 seguidas in a row</strong>.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-emerald-300 font-semibold flex items-center justify-between">
                    <span>✓ 100 fotos contables</span>
                    {act1Completed && <span className="text-emerald-400 font-bold">✓ Completada</span>}
                  </div>
                </div>

                {/* Option Activity 2 */}
                <div 
                  onClick={() => setSelectedActivity('activity2')}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedActivity === 'activity2'
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-850/60 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                        <Headphones className="w-3.5 h-3.5" /> Activity 2
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full ${act2Completed ? 'bg-cyan-400 ring-2 ring-cyan-400/40' : 'bg-slate-600'}`} />
                    </div>
                    <h3 className="text-sm font-bold text-white">Audio &amp; Sentence Builder</h3>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Escucha y arma <strong>20 frases sencillas de máx. 5 palabras</strong> sobre temas contables.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-cyan-300 font-semibold flex items-center justify-between">
                    <span>✓ Frases de 4-5 palabras</span>
                    {act2Completed && <span className="text-cyan-400 font-bold">✓ Completada</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Launch Buttons */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                id="btn-start-activity-1"
                onClick={() => handleLaunch('activity1')}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>INICIAR ACTIVITY 1 🚀</span>
              </button>

              <button
                type="button"
                id="btn-start-activity-2"
                onClick={() => handleLaunch('activity2')}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Headphones className="w-4 h-4" />
                <span>INICIAR ACTIVITY 2 🎧</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Tus datos y avance se guardan automáticamente para emitir tus certificados oficiales.</span>
            </div>
          </form>
        </div>

        {/* Demonstratives Reference & Grammar Table (Right) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Demonstratives Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-300 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                Guía Rápida de Pronombres
              </h3>
              <button
                type="button"
                onClick={onOpenGrammar}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
              >
                Ver matriz completa
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                  <strong className="text-blue-300 font-mono text-sm">THIS</strong>
                </div>
                <span className="text-slate-300">Singular + Cerca (este / esta)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <strong className="text-emerald-300 font-mono text-sm">THAT</strong>
                </div>
                <span className="text-slate-300">Singular + Lejos (ese / aquel)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <strong className="text-amber-300 font-mono text-sm">THESE</strong>
                </div>
                <span className="text-slate-300">Plural + Cerca (estos / estas)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/40">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
                  <strong className="text-purple-300 font-mono text-sm">THOSE</strong>
                </div>
                <span className="text-slate-300">Plural + Lejos (esos / aquellos)</span>
              </div>
            </div>

            {/* Direct History Modal Launcher */}
            {onOpenHistory && (
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onOpenHistory}
                  className="w-full py-2 px-3 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ver Historial de Intentos Guardados</span>
                </button>
              </div>
            )}
          </div>

          {/* Certificate teaser card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 rounded-2xl p-5 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Award className="w-4 h-4" />
              <span>Certificados Oficiales PDF Disponibles</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              La opción para descargar tu certificado en PDF está <strong>permanentemente habilitada</strong>. Puedes generarlo desde las tarjetas de actividad arriba, en la pantalla de resultados o en el historial de intentos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
