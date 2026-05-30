import { DailyLog, ThrowingLog, RecoveryLog } from '../types';
import { AlertTriangle, Activity, CheckCircle, Flame, Moon, Compass } from 'lucide-react';

interface WorkloadMeterProps {
  logs: DailyLog[];
  selectedSorenessArea: string;
  setSelectedSorenessArea: (area: any) => void;
}

export default function WorkloadMeter({ logs, selectedSorenessArea, setSelectedSorenessArea }: WorkloadMeterProps) {
  // Extract latest recovery checking
  const recoveryLogs = logs.filter(l => l.logType === 'recovery') as RecoveryLog[];
  const latestRecovery = recoveryLogs[0]; // Sorted descending on backend / API

  // Extract latest throwing logs
  const throwingLogs = logs.filter(l => l.logType === 'throwing') as ThrowingLog[];
  const latestGame = throwingLogs.find(l => l.throwingType === 'Game Appearance');

  // Calculates rolling 7-day pitch load in games
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentGames = throwingLogs.filter(l => {
    return l.throwingType === 'Game Appearance' && new Date(l.date) >= sevenDaysAgo;
  });
  const totalSevenDayGamePitches = recentGames.reduce((acc, curr) => acc + (curr.pitchCount || 0), 0);

  // Soreness rules
  const soreness = latestRecovery?.sorenessLevel || 0;
  const sorenessArea = latestRecovery?.sorenessArea || 'None';
  const fatigue = latestRecovery?.fatigueLevel || 0;
  const sleep = latestRecovery?.sleepQuality || 0;

  let healthStatus: 'Green' | 'Yellow' | 'Red' = 'Green';
  let statusMessage = 'Arm is low-soreness. Proceed as planned.';
  let bgStatusColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';

  if (soreness >= 7) {
    healthStatus = 'Red';
    statusMessage = 'ARM SHUTDOWN RECOMMENDED. HIGH SORENESS / SHARP PAIN ACTIVE.';
    bgStatusColor = 'bg-rose-500/15 border-rose-500/40 text-rose-400 animate-pulse';
  } else if (soreness >= 4) {
    healthStatus = 'Yellow';
    statusMessage = 'ARM FATIGUE MODERATE. Reduce volume and throwing distance immediately.';
    bgStatusColor = 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
  }

  // Draw a custom layout
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 text-teal-400 text-xs font-semibold rounded-full border border-teal-500/20 mb-2 font-display">
            <Compass className="w-3.5 h-3.5" /> WORKLOAD & ARM RECOVERY STATUS
          </span>
          <h3 className="text-lg font-black font-display tracking-tight text-white uppercase">Arm Health Cockpit</h3>
        </div>
      </div>

      {/* Soreness Warning Alert Box */}
      {soreness >= 7 && (
        <div className="mb-6 p-4 rounded-xl border-2 border-red-500 bg-red-950/40 text-red-200">
          <div className="flex gap-3">
            <AlertTriangle className="w-7 h-7 text-red-500 shrink-0 animate-bounce" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-red-400 uppercase tracking-wider">🛑 RED LIGHT DETECTED ({soreness}/10 Soreness in {sorenessArea})</h4>
              <p className="text-xs leading-relaxed text-slate-300 font-sans">
                <strong>CRITICAL WORKLOAD WARNING:</strong> Tyler, you are reporting arm soreness of 7/10 or higher. 
                We are <strong>NOT DIAGNOSING</strong> injuries, but we strictly recommend stopping throwing immediately. 
                Please contact a qualified medical professional, physical therapist, coach, or athletic trainer for guidance! Do not push through this.
              </p>
            </div>
          </div>
        </div>
      )}

      {soreness >= 4 && soreness < 7 && (
        <div className="mb-6 p-4 rounded-xl border border-yellow-500 bg-yellow-950/20 text-yellow-200">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs uppercase tracking-wider">⚠️ YELLOW LIGHT DETECTED ({soreness}/10 Soreness in {sorenessArea})</h4>
              <p className="text-xs text-slate-350 leading-relaxed font-sans">
                Your arm is entering a muscle fatigue stage. We must scale back catch-play distance by 50% and omit bullpen work. Active mobility flushing is recommended.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Core gauges: Soreness, Fatigue, Sleep */}
        <div className="lg:col-span-4 space-y-4">
          {/* Recovery Check Widget */}
          <div className={`p-4 rounded-xl border ${bgStatusColor} flex items-center justify-between`}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Arm Soreness Level</p>
              <p className="text-2xl font-black font-display mt-0.5 flex items-baseline gap-1.5">
                {soreness}/10 <span className="text-xs font-normal text-slate-400 capitalize">({sorenessArea})</span>
              </p>
            </div>
            <div className="p-2 bg-slate-950/40 rounded-lg">
              {healthStatus === 'Green' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : healthStatus === 'Yellow' ? (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500 animate-ping" />
              )}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subjective Fatigue</p>
              <p className="text-2xl font-black text-white font-display mt-0.5">{fatigue}/10</p>
            </div>
            <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  fatigue >= 7 ? 'bg-red-500' : fatigue >= 4 ? 'bg-yellow-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${fatigue * 10}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sleep Quality</p>
              </div>
              <p className="text-2xl font-black text-white font-display mt-0.5">{sleep}/10</p>
            </div>
            <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  sleep >= 7 ? 'bg-emerald-400' : sleep >= 4 ? 'bg-yellow-500' : 'bg-rose-500'
                }`}
                style={{ width: `${sleep * 10}%` }}
              />
            </div>
          </div>

          {/* Rolling Pitch loads */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rolling 7-Day Game Pitches</p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-black text-teal-400 font-display">{totalSevenDayGamePitches}</p>
              <span className="text-xs text-slate-400 font-mono">PITCHES</span>
            </div>
            {latestGame && (
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                Last Outing: {latestGame.pitchCount} pitches on {latestGame.date}
              </p>
            )}
          </div>
        </div>

        {/* Clickable Arm Map */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">ARM SORENESS SENSOR MAP</span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
              Click on an arm hotspot area to immediately set its value in the logging form below.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center my-2 relative">
            {/* Minimalist clickable diagram */}
            <div className="w-full max-w-[200px] aspect-[4/5] bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-inner">
              <h5 className="text-[10px] font-mono text-center text-slate-500 uppercase">Right Thrower (RHP)</h5>
              
              {/* Visual circles to represents joints in a minimalist vector layout & click tracking */}
              <div className="flex-1 flex flex-col items-center justify-around relative">
                
                {/* SHOULDER BUTTON */}
                <button
                  onClick={() => setSelectedSorenessArea('Shoulder')}
                  className={`absolute top-[15%] left-[25%] transition-all duration-200 z-10 p-2.5 rounded-full border flex flex-col items-center justify-center shadow-md ${
                    selectedSorenessArea === 'Shoulder'
                      ? 'bg-amber-500/35 border-amber-400 text-white scale-110 ring-2 ring-amber-400'
                      : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  type="button"
                >
                  <Flame className="w-4 h-4 text-amber-400 mb-0.5" />
                  <span className="text-[8px] font-bold uppercase tracking-wider">SHOULDER</span>
                </button>

                {/* ELBOW BUTTON */}
                <button
                  onClick={() => setSelectedSorenessArea('Elbow')}
                  className={`absolute top-[45%] left-[55%] transition-all duration-200 z-10 p-2.5 rounded-full border flex flex-col items-center justify-center shadow-md ${
                    selectedSorenessArea === 'Elbow'
                      ? 'bg-rose-500/35 border-rose-400 text-white scale-110 ring-2 ring-rose-400'
                      : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  type="button"
                >
                  <Activity className="w-4 h-4 text-rose-400 mb-0.5" />
                  <span className="text-[8px] font-bold uppercase tracking-wider">ELBOW</span>
                </button>

                {/* FOREARM BUTTON */}
                <button
                  onClick={() => setSelectedSorenessArea('Forearm')}
                  className={`absolute top-[75%] left-[35%] transition-all duration-200 z-10 p-2.5 rounded-full border flex flex-col items-center justify-center shadow-md ${
                    selectedSorenessArea === 'Forearm'
                      ? 'bg-indigo-500/35 border-indigo-400 text-white scale-110 ring-2 ring-indigo-400'
                      : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  type="button"
                >
                  <Activity className="w-4 h-4 text-indigo-400 mb-0.5" />
                  <span className="text-[8px] font-bold uppercase tracking-wider">FOREARM</span>
                </button>

                {/* Decorative connecting bones */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                  <line x1="38" y1="28" x2="68" y2="58" stroke="#1e293b" strokeWidth="2.5" strokeDasharray="2" />
                  <line x1="68" y1="58" x2="48" y2="88" stroke="#1e293b" strokeWidth="2.5" strokeDasharray="2" />
                </svg>
              </div>
            </div>

            {/* Clear selection controls */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setSelectedSorenessArea('None')}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  selectedSorenessArea === 'None'
                    ? 'bg-emerald-500/25 border-emerald-500 text-emerald-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                type="button"
              >
                CLEAR (NONE SORE)
              </button>
            </div>
          </div>
        </div>

        {/* Workload Pitch brackets quick-reference cheat sheet */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] text-teal-400 font-extrabold tracking-widest uppercase block mb-1">WORKLOAD REFERENCE CARD</span>
            
            <div className="space-y-2 mt-2">
              <div className="border-l-2 border-emerald-500 pl-2">
                <p className="text-[10px] font-bold text-slate-300">1 - 20 PITCHES IN GAME</p>
                <p className="text-[9px] text-slate-400">Next day: Recovery catch play 60-90 ft, 30-40 throws.</p>
              </div>
              
              <div className="border-l-2 border-yellow-500 pl-2">
                <p className="text-[10px] font-bold text-slate-300">21 - 40 PITCHES IN GAME</p>
                <p className="text-[9px] text-slate-400">Next day: Recovery catch. Day 2: Catch play. Day 3: Available if low soreness.</p>
              </div>

              <div className="border-l-2 border-orange-500 pl-2">
                <p className="text-[10px] font-bold text-slate-300">41 - 60 PITCHES IN GAME</p>
                <p className="text-[9px] text-slate-400">Recovery catch for 2 days. Day 3: Catch play. Day 4: Available or light bullpen.</p>
              </div>

              <div className="border-l-2 border-red-500 pl-2">
                <p className="text-[10px] font-bold text-slate-300">61+ PITCHES (STARTER RESET)</p>
                <p className="text-[9px] text-slate-400">Starter recovery checklist sequence. Strictly no bullpen for 4-5 days.</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/60 text-[9px] text-slate-550 italic leading-snug">
            Soreness limits: 1-3 low (Green), 4-6 moderate (Yellow - reduce vol 50%), 7+ severe (Red - total shutdown).
          </div>
        </div>
      </div>
    </div>
  );
}
