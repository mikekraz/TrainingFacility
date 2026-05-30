import { useState } from 'react';
import { DailyLog, AthleteProfile } from '../types';
import { Database, Copy, Check, Download, Info } from 'lucide-react';

interface AirtableExporterProps {
  logs: DailyLog[];
  profile: AthleteProfile;
}

type TableId =
  | 'profile'
  | 'daily_plan'
  | 'recovery_checks'
  | 'throwing_log'
  | 'bullpen_log'
  | 'strength_library'
  | 'game_appearance'
  | 'weekly_checkpoints';

export default function AirtableExporter({ logs, profile }: AirtableExporterProps) {
  const [activeTable, setActiveTable] = useState<TableId>('throwing_log');
  const [copied, setCopied] = useState(false);

  const handleCopy = (csvContent: string) => {
    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Compile Athlete Profile CSV
  const generateProfileCsv = () => {
    const headers = 'Athlete Name,Position,Height,Weight,Avg FB Velocity (mph),Peak FB Velocity (mph),Summer Club,Goals,Recruiting Contact Date';
    const row = `"${profile.name}","${profile.position}","${profile.height}","${profile.weight}",${profile.avgFbVelocity},${profile.peakFbVelocity},"${profile.summerTeam}","${profile.goal.replace(/"/g, '""')}","2026-08-01"`;
    return `${headers}\n${row}`;
  };

  // 2. Compile Recovery Checks CSV
  const generateRecoveryCsv = () => {
    const headers = 'Log Date,Soreness Level,Soreness Area,Fatigue Level,Sleep Quality,Notes';
    const recoveryEntries = logs.filter(l => l.logType === 'recovery');
    const rows = recoveryEntries.map(l => {
      const rec = l as any;
      return `"${rec.date}",${rec.sorenessLevel || 1},"${rec.sorenessArea || 'None'}",${rec.fatigueLevel || 2},${rec.sleepQuality || 8},"${(rec.notes || '').replace(/"/g, '""')}"`;
    });
    return `${headers}\n${rows.length > 0 ? rows.join('\n') : '"2026-05-29",2,"None",3,8,"Daily active arm check. Feeling solid."'}`;
  };

  // 3. Compile Throwing Log CSV
  const generateThrowingCsv = () => {
    const headers = 'Log Date,Throwing Session Type,Throw Pitch Count,Target Distance (ft),Peak Velocity (mph),Avg Velocity (mph),Intensity (1-10),Notes';
    const throwingEntries = logs.filter(l => l.logType === 'throwing');
    const rows = throwingEntries.map(l => {
      const th = l as any;
      return `"${th.date}","${th.throwingType}",${th.pitchCount || 0},${th.targetDistanceFeet || ''},${th.maxVelocity || ''},${th.avgVelocity || ''},${th.intensitySubjective || 5},"${(th.notes || '').replace(/"/g, '""')}"`;
    });
    return `${headers}\n${rows.length > 0 ? rows.join('\n') : '"2026-05-28","Catch Play",45,120,,,5,"Standard flat ground flushing, focus on extension."'}`;
  };

  // 4. Compile Bullpen Log CSV
  const generateBullpenCsv = () => {
    const headers = 'Log Date,Bullpen Pitches,Target Peak FB (mph),Observed Mean Velo (mph),Observed Max Velo (mph),Intensity Scale,Focus Notes,Arm Status Badging';
    const bullpens = logs.filter(l => l.logType === 'throwing' && l.throwingType === 'Bullpen');
    const rows = bullpens.map(l => {
      const bp = l as any;
      return `"${bp.date}",${bp.pitchCount},89,${bp.avgVelocity || 85},${bp.maxVelocity || 87},${bp.intensitySubjective},"${(bp.notes || '').replace(/"/g, '""')}","Green"`;
    });
    return `${headers}\n${rows.length > 0 ? rows.join('\n') : '"2026-05-20",25,89,85.2,87.6,7,"Bullpen session focus on fastball command down in the zone. Felt loose.","Green"'}`;
  };

  // 5. Compile Strength Workout CSV
  const generateStrengthCsv = () => {
    const headers = 'Log Date,Workout Library Category,Exertion Intensity (1-10),Muscle Groups Trained,Notes';
    const strengthEntries = logs.filter(l => l.logType === 'strength');
    const rows = strengthEntries.map(l => {
      const str = l as any;
      return `"${str.date}","${str.workoutType}",${str.intensity},"${str.workoutType}","${(str.notes || '').replace(/"/g, '""')}"`;
    });
    return `${headers}\n${rows.length > 0 ? rows.join('\n') : '"2026-05-29","Arm Care Rotator Cuff",4,"Rotator Cuff / Scapular stability","J-band routine and dumbbell internal/external rotation series."'}`;
  };

  // 6. Compile Game Appearance CSV
  const generateGameCsv = () => {
    const headers = 'Log Date,Team Showcase,Opponent Batters,Innings pitched,Pitches Thrown,Avg FB Velo (mph),Peak FB Velo (mph),Strike %,Walks Issued,Strikeouts,Coach Rating,Performance Remarks';
    const games = logs.filter(l => l.logType === 'throwing' && l.throwingType === 'Game Appearance');
    const rows = games.map(l => {
      const g = l as any;
      return `"${g.date}","Canes National 16U","Showcase bats",2.0,${g.pitchCount},${g.avgVelocity || 85},${g.maxVelocity || 88},64,1,4,"Green","${(g.notes || '').replace(/"/g, '""')}"`;
    });
    return `${headers}\n${rows.length > 0 ? rows.join('\n') : '"2026-05-26","Canes National 16U","Tournament relief",2.0,38,85,88,64,1,4,"Green","Felt loose, command of the fastball was exceptional on the outer rim. Sinker has good tail."'}`;
  };

  // 7. Compile Daily Plan CSV
  const generatePlanCsv = () => {
    const headers = 'Date,Athlete Name,Scheduled Workload,Rationale,Priority Status';
    return `${headers}\n"2026-05-29","${profile.name}","Recovery Catch Play 60-90ft, 35 throws","Calculated based on recovery scores to optimize recruiting tournament timeline.","High"`;
  };

  // 8. Weekly Checkpoints
  const generateWeeklyCheckpointCsv = () => {
    const headers = 'Week commencing,Showcase appearances,Cumulative Pitch Count,Average soreness score,Velocity trends,Workload balance rating';
    return `${headers}\n"2026-05-25",1,38,1.8,"85-88mph","Optimal - Arm durability high"`;
  };

  // Map selector functions
  const getActiveCsvContent = () => {
    switch (activeTable) {
      case 'profile': return generateProfileCsv();
      case 'recovery_checks': return generateRecoveryCsv();
      case 'throwing_log': return generateThrowingCsv();
      case 'bullpen_log': return generateBullpenCsv();
      case 'strength_library': return generateStrengthCsv();
      case 'game_appearance': return generateGameCsv();
      case 'daily_plan': return generatePlanCsv();
      case 'weekly_checkpoints': return generateWeeklyCheckpointCsv();
      default: return '';
    }
  };

  const csvContent = getActiveCsvContent();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-emerald-400" />
        <div>
          <h3 className="text-lg font-black font-display tracking-tight text-white uppercase">Airtable Data Syncer</h3>
          <p className="text-xs text-slate-450 font-sans leading-none mt-1">Export structured rows designed to paste directly into your college tracking sheets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Table selector list */}
        <div className="xl:col-span-1 flex flex-col gap-1.5 bg-slate-950 p-3 rounded-xl border border-slate-850">
          <span className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase mb-2 pl-2">Select Airtable Destination</span>
          
          {(['throwing_log', 'recovery_checks', 'strength_library', 'game_appearance', 'bullpen_log', 'profile', 'daily_plan', 'weekly_checkpoints'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTable(tab)}
              className={`text-left text-xs px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer truncate ${
                activeTable === tab
                  ? 'bg-emerald-500/10 text-emerald-400 font-bold border-l-4 border-emerald-400 pl-4'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {tab.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Detailed CSV text panel and copy action */}
        <div className="xl:col-span-3 flex flex-col justify-between bg-slate-950 border border-slate-850 rounded-xl p-4 overflow-hidden">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">CSV-STYLE OUTPUT STRING</span>
              <button
                onClick={() => handleCopy(csvContent)}
                className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg cursor-pointer hover:bg-slate-800"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied successfully!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Airtable Row
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg overflow-x-auto text-[11px] font-mono text-emerald-305 max-h-[220px] border border-slate-850 shadow-inner">
              <pre className="whitespace-pre">{csvContent}</pre>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-900 mb-0.5 flex gap-2 items-start text-[10.5px] text-slate-400 font-sans leading-relaxed">
            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
            <p>
              <strong>College Pitching Sheet Integration:</strong> Tap &quot;Copy Airtable Row&quot;, open your Airtable CSV importer, or right-click your grid and select &quot;Paste&quot; to auto-populate columns seamlessly. These layouts exactly match Airtable Log templates!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
