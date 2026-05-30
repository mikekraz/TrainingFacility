import { DailyLog } from '../types';
import { Trash2, Heart, Disc, Award, CornerDownRight, TrendingUp } from 'lucide-react';

interface RecentLogsProps {
  logs: DailyLog[];
  onDeleteLog: (id: string) => Promise<void>;
}

export default function RecentLogs({ logs, onDeleteLog }: RecentLogsProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 font-sans">
        <TrendingUp className="w-8 h-8 mx-auto text-slate-600 mb-2" />
        No training entries logged. Use the workout logger to populate items.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-full max-h-[600px] overflow-hidden">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-display mb-1 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-400" /> Recent Activity Stream
        </h4>
        <p className="text-xs text-slate-500 font-sans leading-none">Scrollable timeline of active pitching data logs.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {logs.map(log => {
          let badgeColor = '';
          let icon = null;
          let labelText = '';
          let subDetails = '';

          if (log.logType === 'recovery') {
            const level = log.sorenessLevel || 1;
            badgeColor = level >= 7 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : level >= 4 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            icon = <Heart className="w-3.5 h-3.5 shrink-0" />;
            labelText = `Recovery Check: Soreness ${level}/10`;
            subDetails = `Fatigue: ${log.fatigueLevel}/10 | Sleep: ${log.sleepQuality}/10 | Spot: ${log.sorenessArea || 'None'}`;
          } else if (log.logType === 'throwing') {
            const type = log.throwingType;
            badgeColor = type === 'Game Appearance' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-extrabold' : type === 'Bullpen' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-slate-800 text-slate-300 border-slate-700';
            icon = <Disc className="w-3.5 h-3.5 shrink-0" />;
            labelText = `${type}`;
            const countLabel = type === 'Game Appearance' || type === 'Bullpen' ? 'Pitches' : 'Throws';
            subDetails = `${log.pitchCount} ${countLabel} @ Intensity ${log.intensitySubjective}/10`;
            if (log.targetDistanceFeet) {
              subDetails += ` | Dist: ${log.targetDistanceFeet} ft`;
            }
            if (log.maxVelocity) {
              subDetails += ` | Peak: ${log.maxVelocity} mph (avg ${log.avgVelocity || 85})`;
            }
          } else {
            badgeColor = 'bg-violet-505/10 text-violet-300 border-slate-705 bg-slate-950 p-2.5';
            icon = <Award className="w-3.5 h-3.5 shrink-0" />;
            labelText = `Strength: ${log.workoutType}`;
            subDetails = `Intensity: ${log.intensity}/10`;
          }

          return (
            <div
              key={log.id}
              className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between gap-4 group transition-all duration-200 hover:border-slate-800/80"
            >
              <div className="space-y-1 overflow-hidden min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] uppercase font-bold font-display ${badgeColor}`}>
                    {icon} {labelText}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold shrink-0">{log.date}</span>
                </div>

                <p className="text-xs font-semibold text-slate-300 mt-1 truncate font-mono">{subDetails}</p>

                {log.notes && (
                  <div className="flex items-start gap-1 font-sans text-[11px] text-slate-400 leading-normal pl-1.5 border-l border-slate-800 mt-1">
                    <CornerDownRight className="w-2.5 h-2.5 text-slate-600 mt-0.5 shrink-0" />
                    <span className="truncate">{log.notes}</span>
                  </div>
                )}
              </div>

              {/* Delete record */}
              <button
                onClick={() => onDeleteLog(log.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all shrink-0 cursor-pointer"
                title="Delete Training Entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
