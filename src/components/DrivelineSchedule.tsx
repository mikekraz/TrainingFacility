import { useState, useEffect } from 'react';
import { DailyLog, AthleteProfile, ThrowingLog, StrengthLog } from '../types';
import { 
  Dumbbell, 
  Flame, 
  MapPin, 
  CheckCircle, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  ChevronRight, 
  Sparkles, 
  Activity, 
  Briefcase, 
  Plane, 
  Hotel,
  ShieldCheck,
  CheckCircle2,
  Clock,
  LogOut
} from 'lucide-react';

interface DrivelineScheduleProps {
  logs: DailyLog[];
  profile: AthleteProfile;
  onAddLog: (logData: Omit<DailyLog, 'id' | 'date'>) => Promise<void>;
}

// Data from the attached Canes National 16U Summer 2026 Travel & Hotel Sheet PDF
const CANES_TOURNAMENTS = [
  {
    id: 'clemson',
    dates: 'June 11-15',
    title: 'Dynamic Top Org Battle',
    location: 'Clemson, SC',
    airport: 'Greenville-Spartanburg International (GSP)',
    hotel: 'Hyatt Greenville',
    reportDay: 'Wednesday, June 10th (Practice @ TBD)',
    leaveDate: 'Sunday, June 14th After 7pm',
    bookBy: '5/14',
    bg: 'from-orange-500/10 to-purple-500/10',
    border: 'border-orange-550/20',
    colorText: 'text-orange-400'
  },
  {
    id: 'palm-beaches',
    dates: 'June 14-18',
    title: 'Ultimate Baseball Championship',
    location: 'Ballpark of the Palm Beaches - West Palm Beach, FL',
    airport: 'Palm Beach International (PBI)',
    hotel: 'Palm Beach Gardens Marriott',
    reportDay: 'Sunday, June 14th (No Practice)',
    leaveDate: 'Thursday, June 18th (No Flights prior to 7 PM)',
    bookBy: 'Ongoing',
    bg: 'from-blue-500/10 to-teal-500/10',
    border: 'border-blue-550/20',
    colorText: 'text-cyan-400'
  },
  {
    id: 'usa-baseball',
    dates: 'June 22-26',
    title: '16U USA Baseball National Team Championships',
    location: 'Cary, NC',
    airport: 'Raleigh-Durham International (RDU)',
    hotel: 'Hilton Garden Inn Durham Southpoint',
    reportDay: 'Monday, June 22nd by 4 PM (Practice @ TBD)',
    leaveDate: 'Friday, June 26th after 7 PM',
    bookBy: '6/01/2026',
    bg: 'from-red-500/10 to-blue-500/10',
    border: 'border-blue-550/20',
    colorText: 'text-red-400'
  },
  {
    id: 'east-cobb',
    dates: 'July 5-13',
    title: 'WWBA - East Cobb Complex',
    location: 'East Cobb, GA',
    airport: 'Hartsfield-Jackson Atlanta International (ATL)',
    hotel: 'Atlanta Marriott Northwest at Galleria',
    reportDay: 'Sunday, July 5th by 4 PM (Report & Practice)',
    leaveDate: 'Monday, July 13th after 7:00 PM',
    bookBy: '5/01/2026',
    bg: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-555/20',
    colorText: 'text-emerald-400'
  },
  {
    id: 'pg-world-series',
    dates: 'July 15-20',
    title: 'PG 16U World Series',
    location: 'Auburndale, FL - Lake Myrtle Sports Complex',
    airport: 'Orlando International (MCO) - 45 Min Drive',
    hotel: 'Official Team Lodging Check-In',
    reportDay: 'Wednesday, July 15th (Practice @ TBD)',
    leaveDate: 'Monday, July 20th after 7 PM',
    bookBy: '5/01/2026',
    bg: 'from-cyan-500/10 to-indigo-500/10',
    border: 'border-cyan-555/20',
    colorText: 'text-teal-400'
  }
];

export default function DrivelineSchedule({ logs, profile, onAddLog }: DrivelineScheduleProps) {
  const today = new Date('2026-05-29T22:53:37Z');

  // Load interactive step progress from local storage for high user interactivity
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    const saved = localStorage.getItem('tyler_driveline_steps_completed_0529_2026');
    return saved ? JSON.parse(saved) : [];
  });

  // State to track if bullpen was logged in standard throwing logs
  const [bullpenAvgVelo, setBullpenAvgVelo] = useState<number>(86);
  const [bullpenMaxVelo, setBullpenMaxVelo] = useState<number>(89);
  const [bullpenPitches, setBullpenPitches] = useState<number>(25);
  const [bullpenLogged, setBullpenLogged] = useState<boolean>(false);
  const [bullpenSaving, setBullpenSaving] = useState<boolean>(false);

  // Strength Training Log state
  const [strengthLogged, setStrengthLogged] = useState<boolean>(false);
  const [strengthDuration, setStrengthDuration] = useState<number>(60);
  const [strengthNotes, setStrengthNotes] = useState<string>('Scap load, rotational power med-ball slams, single-leg stability splits, and high isometric shoulder holds.');

  useEffect(() => {
    localStorage.setItem('tyler_driveline_steps_completed_0529_2026', JSON.stringify(completedSteps));
  }, [completedSteps]);

  // Sync state with physical log database elements if they were added
  useEffect(() => {
    const todayStr = '2026-05-29';
    const bullpenLogs = logs.filter(l => l.date === todayStr && l.logType === 'throwing' && l.throwingType === 'Bullpen');
    const bLogs = logs.filter(l => l.date === todayStr && l.logType === 'strength');

    if (bullpenLogs.length > 0) {
      setBullpenLogged(true);
      const latestBullpen = bullpenLogs[0] as ThrowingLog;
      if (latestBullpen.avgVelocity) setBullpenAvgVelo(latestBullpen.avgVelocity);
      if (latestBullpen.maxVelocity) setBullpenMaxVelo(latestBullpen.maxVelocity);
      if (latestBullpen.pitchCount) setBullpenPitches(latestBullpen.pitchCount);
    } else {
      setBullpenLogged(false);
    }

    if (bLogs.length > 0) {
      setStrengthLogged(true);
    } else {
      setStrengthLogged(false);
    }
  }, [logs]);

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId) 
        : [...prev, stepId]
    );
  };

  const logBullpen = async () => {
    setBullpenSaving(true);
    try {
      await onAddLog({
        logType: 'throwing',
        throwingType: 'Bullpen',
        pitchCount: bullpenPitches,
        avgVelocity: bullpenAvgVelo,
        maxVelocity: bullpenMaxVelo,
        intensitySubjective: 8,
        notes: `High focus Driveline pre-planned baseline bullpen. FB velocity peak of ${bullpenMaxVelo} mph, average of ${bullpenAvgVelo} mph. Excellent shape on dual-plane breaking balls and tight command in low-quadrants.`
      } as any);
      setBullpenLogged(true);
      // Automatically check off Driveline drill step
      if (!completedSteps.includes('dr-throwing')) {
        setCompletedSteps(prev => [...prev, 'dr-throwing']);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBullpenSaving(false);
    }
  };

  const logStrengthWorkout = async () => {
    try {
      await onAddLog({
        logType: 'strength',
        workoutType: 'Full Body',
        intensity: 8,
        notes: `Strength Training Log session. Exercises included: ${strengthNotes} (Completed in ${strengthDuration} mins, focused on rotational hip acceleration & scapular stiffness).`
      } as any);
      setStrengthLogged(true);
      if (!completedSteps.includes('dr-strength')) {
        setCompletedSteps(prev => [...prev, 'dr-strength']);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // List of high-performance steps designed according to Driveline core routine
  const DRIVELINE_STEPS = [
    {
      id: 'dr-warmup',
      tag: 'Warmup & Activation',
      title: 'J-Bands Active Rotator Protocol',
      desc: '11 elements of arm stabilization (Y-raises, internal/external rotation, scapular pinches) followed by weighted wrist micro-holds.',
      bench: '10-15 Minutes. High control, zero jerky snapping.'
    },
    {
      id: 'dr-plyo',
      tag: 'PlyoCare Drills',
      title: 'Weighted Ball Throw Sequence',
      desc: 'Driveline PlyoCare program: 2 Reverse throws (Blue 450g), 4 Pivot Picks (Red 225g), 4 Roll-Ins (Yellow 150g) focusing on arm-action efficiency.',
      bench: 'Dual-rebounder wall repetitions, focus on clean deceleration.'
    },
    {
      id: 'dr-throwing',
      tag: 'Primary Throw',
      title: '25-Pitch High-Precision Bullpen',
      desc: 'Main throwing event of today. Throwing 25 pitches total to build zone discipline and track speed parameters. Keep shape on secondary spins.',
      bench: 'Target: Avg 85-87 mph, touch 89+ mph.'
    },
    {
      id: 'dr-strength',
      tag: 'Strength Conditioning',
      title: 'Rotational Power & Arm Care stability (Strength Training Log)',
      desc: 'Strength block log: Trap-bar deadlift blocks, dynamic medicine ball throws, scap load mechanics to resist arm drop.',
      bench: '60 minutes intense posture stiffness and core lock.'
    },
    {
      id: 'dr-recovery',
      tag: 'Recovery Protocol',
      title: 'Active Post-Throw Decompression',
      desc: 'Cryo-compression wrappers, standard dynamic arm swings, shoulder range testing, deep cellular hydration and magnesium spray application.',
      bench: 'Do not ignore: prevent localized forearm tight knots.'
    }
  ];

  const overallProgress = Math.round((completedSteps.length / DRIVELINE_STEPS.length) * 100);

  return (
    <div className="space-y-6">
      
      {/* Dynamic Upper Panel: Today's High-Level Strategy & Progress Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Progress Circular Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-widest font-display">
              🔋 TODAY'S COMPLIANCE
            </span>
            <h3 className="text-lg font-black text-white font-display uppercase tracking-tight mt-2 leading-tight">
              Driveline Program Tracker
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Check off your active developmental blocks below to complete today's performance routine.
            </p>
          </div>

          <div className="my-6 flex items-center justify-center gap-6">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="56" cy="56" r="48" className="stroke-slate-950 fill-none stroke-[8]" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="48" 
                  className="stroke-emerald-400 fill-none stroke-[8] transition-all duration-500" 
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - overallProgress / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black font-display text-white">{overallProgress}%</span>
                <span className="text-[8px] text-slate-400 font-mono font-bold tracking-widest">DRIVELINE</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>{completedSteps.length} of {DRIVELINE_STEPS.length} Completed</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1b253b]" />
                <span>{DRIVELINE_STEPS.length - completedSteps.length} Remaining Blocks</span>
              </div>
              <p className="text-[10px] text-emerald-400 font-mono font-bold mt-2 animate-pulse">
                {overallProgress === 100 ? '🔥 Arm completely optimized' : '📈 Progressing workload safety'}
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-850 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-[10px] text-slate-400 leading-normal font-sans">
              Designed around target peak acceleration of <strong className="text-cyan-300">90-91 mph</strong> by Oct Junior Recruiting showcases.
            </span>
          </div>

        </div>

        {/* Detailed High-Performance Routine Steps (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h3 className="text-sm font-black font-display text-[#edf2f7] uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4.5 h-4.5 text-emerald-400" />
              Pre-Planned Daily Blocks & Biomechanics Checkpoint
            </h3>
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">Date: May 29, 2026</span>
          </div>

          <div className="space-y-3">
            {DRIVELINE_STEPS.map((step, idx) => {
              const isDone = completedSteps.includes(step.id);
              return (
                <div 
                  key={step.id} 
                  onClick={() => toggleStep(step.id)}
                  className={`border rounded-xl p-3 flex items-start gap-4 cursor-pointer transition-all ${
                    isDone 
                      ? 'bg-slate-950/40 border-emerald-900/40 text-slate-400' 
                      : 'bg-slate-950 hover:bg-slate-950/90 border-slate-850 hover:border-slate-800 text-white'
                  }`}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 stroke-[3]" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-700 hover:border-cyan-400 transition-colors" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase font-display tracking-wider ${isDone ? 'text-slate-500' : 'text-cyan-400'}`}>
                        {step.tag}
                      </span>
                      {step.id === 'dr-throwing' && (
                        <span className="text-[8px] bg-rose-500/20 text-rose-400 font-mono font-bold px-1.5 rounded uppercase">Bullpen Block</span>
                      )}
                      {step.id === 'dr-biocore' && (
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-400 font-mono font-bold px-1.5 rounded uppercase">Biocore Link</span>
                      )}
                    </div>
                    
                    <h4 className={`text-xs font-black font-display uppercase tracking-tight ${isDone ? 'text-slate-500 line-through' : 'text-white'}`}>
                      {step.title}
                    </h4>
                    
                    <p className="text-xs text-slate-400 leading-snug font-sans">
                      {step.desc}
                    </p>
                    
                    <div className="flex items-center justify-between pt-1 flex-wrap gap-2 text-[9.5px]">
                      <span className="text-slate-500 font-mono">Benchmark: {step.bench}</span>
                      {isDone && (
                        <span className="text-emerald-400 font-mono font-bold uppercase tracking-wider text-[8px]">✓ Completed Block</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Middle Grid: Detailed Logging Actions for Bullpen Today & Biocore Workouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 25-Pitch Bullpen Logger Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="text-sm font-black font-display text-white uppercase tracking-tight">Today's Bullpen Output</h3>
                  <span className="text-[9px] text-slate-400 font-mono">Must log to persist Driveline Velocity trends</span>
                </div>
              </div>
              <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold px-2 py-0.5 rounded uppercase font-display">
                25 Pitch Target
              </span>
            </div>

            {bullpenLogged ? (
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4 text-center my-4">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-1" />
                <h4 className="text-sm font-black font-display text-white uppercase tracking-wide">Bullpen Session Submitted Successfully</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Today's high velocity bullpen is secured in the primary sheets database. Maintained speed control:
                </p>
                <div className="grid grid-cols-3 max-w-xs mx-auto gap-3 py-1.5">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-[8px] text-slate-400 block font-mono">PITCHES</span>
                    <span className="text-lg font-black text-white font-display">{bullpenPitches}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-[8px] text-slate-400 block font-mono">AVG VELO</span>
                    <span className="text-lg font-black text-cyan-400 font-display">{bullpenAvgVelo} <span className="text-[10px]">mph</span></span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-[8px] text-slate-400 block font-mono">PEAK VELO</span>
                    <span className="text-lg font-black text-rose-500 font-display">{bullpenMaxVelo} <span className="text-[10px]">mph</span></span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-mono font-bold leading-none">
                  Logged on May 29, 2026. Keep doing arm swings.
                </p>
              </div>
            ) : (
              <div className="space-y-4 my-2">
                <p className="text-xs text-[#a0aec0] leading-snug">
                  Tyler, did you finish throwing your 25-pitch bullpen? Input today's throwing data below to automatically update the workload trajectory.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">PITCH COUNT</label>
                    <input 
                      type="number"
                      value={bullpenPitches}
                      onChange={e => setBullpenPitches(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 w-full text-center text-xs font-bold outline-none ring-offset-slate-950 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">AVG SPEED (MPH)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={bullpenAvgVelo}
                      onChange={e => setBullpenAvgVelo(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-800 text-cyan-400 rounded-xl p-2.5 w-full text-center text-xs font-bold outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">PEAK FB (MPH)</label>
                    <input 
                      type="number"
                      value={bullpenMaxVelo}
                      onChange={e => setBullpenMaxVelo(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-800 text-rose-500 rounded-xl p-2.5 w-full text-center text-xs font-bold outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                  <div className="flex gap-2">
                    <span className="text-xs font-bold self-start mt-0.5 text-amber-500">⚠</span>
                    <p className="text-[10px] text-slate-400 leading-snug font-sans">
                      Driveline advises: Bullpen throwing logs must be accompanied by active physical warmups. If arm fatigue index exceeds <strong className="text-slate-350">7</strong>, reduce pitch counts by 20% on subsequent cycles.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={logBullpen}
                    disabled={bullpenSaving}
                    className="bg-rose-500 hover:bg-rose-600 text-slate-950 font-black font-display text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow shadow-rose-500/10 active:scale-95 transition-all text-center"
                  >
                    {bullpenSaving ? 'Saving parameters...' : '💾 PERSIST BULLPEN OUTING'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Strength Training Log Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-black font-display text-white uppercase tracking-tight">Strength Training Log</h3>
                  <span className="text-[9px] text-slate-400 font-mono">Rotational Power & Shoulder Stiffness</span>
                </div>
              </div>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2.5 py-0.5 rounded uppercase font-display">
                Strength Active
              </span>
            </div>

            {strengthLogged ? (
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4 text-center my-4">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-1" />
                <h4 className="text-sm font-black font-display text-white uppercase tracking-wide">Strength Session Logged</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Workout added. Rotational power training establishes high mechanical force transmission. Excellent job.
                </p>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 inline-block px-4">
                  <span className="text-[8px] text-slate-400 block font-mono">TOTAL TIME INDUCTION</span>
                  <span className="text-lg font-black text-white font-display">60 <span className="text-xs text-emerald-400">minutes</span></span>
                </div>
                <p className="text-[9px] text-[#aec0ce] font-mono leading-none italic max-w-xs mx-auto">
                  &ldquo;Scap load stability, core rotational slams, hamstring single-leg holds.&rdquo;
                </p>
              </div>
            ) : (
              <div className="space-y-4 my-2">
                <p className="text-xs text-[#a0aec0] leading-snug">
                  You train throughout the summer to build high scapular stiffness, protect the ulnar collateral ligament, and maintain rotational power.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-1">
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">METRIC (MIN)</label>
                    <input 
                      type="number"
                      value={strengthDuration}
                      onChange={e => setStrengthDuration(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 w-full text-center text-xs font-bold outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Active Conditioning Drills Performed</label>
                    <input 
                      type="text"
                      value={strengthNotes}
                      onChange={e => setStrengthNotes(e.target.value)}
                      placeholder="e.g. trap-bar load, med ball slams, crossover arm cords"
                      className="bg-slate-950 border border-slate-800 text-emerald-300 rounded-xl p-2.5 w-full text-xs font-semibold outline-none"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl text-center">
                  <span className="text-[8.5px] font-bold text-slate-400 block uppercase mb-1">Summer Power Development Checklist</span>
                  <p className="text-[10px] text-slate-400 leading-snug max-w-sm mx-auto font-sans">
                    Keep spine aligned. Rotational torque translates directly to fastball acceleration and consistent ball release paths under fatigue.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={logStrengthWorkout}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black font-display text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow shadow-emerald-500/10 active:scale-95 transition-all text-center"
                  >
                    🏋️ REPORT STRENGTH WORKOUT
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summer Travel Road-Map & Hotel Sheet Segment */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-teal-400 to-emerald-400" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5.5 h-5.5 text-amber-400" />
            <div>
              <h3 className="text-base font-black font-display text-white uppercase tracking-tight">Canes National 16U Summer 2026 Travel & Room Planner</h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Official travel milestones parsed from coach sheet. Team hotel is <strong>mandatory</strong>.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-right">
            <span className="text-[9px] text-slate-500 block uppercase font-mono font-bold">Coach Welches Contact</span>
            <span className="text-xs text-cyan-400 font-bold font-mono">cwelch@canesbaseball.net • 864-376-8589</span>
          </div>
        </div>

        {/* Timeline Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {CANES_TOURNAMENTS.map((tourney, idx) => {
            // High school/youth tournaments countdown computation
            const match = tourney.dates.match(/June\s+(\d+)|July\s+(\d+)/);
            let tourneyDateObj = new Date('2026-06-11T00:00:00Z');
            if (tourney.id === 'palm-beaches') tourneyDateObj = new Date('2026-06-14T00:00:00Z');
            if (tourney.id === 'usa-baseball') tourneyDateObj = new Date('2026-06-22T00:00:00Z');
            if (tourney.id === 'east-cobb') tourneyDateObj = new Date('2026-07-05T00:00:00Z');
            if (tourney.id === 'pg-world-series') tourneyDateObj = new Date('2026-07-15T00:00:00Z');

            const msDiff = tourneyDateObj.getTime() - today.getTime();
            const daysToTourney = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));

            return (
              <div 
                key={tourney.id} 
                className={`bg-slate-950 rounded-2xl p-4 flex flex-col justify-between border ${tourney.border} transition-all duration-300 hover:scale-[1.02] hover:border-slate-700`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-slate-500 font-mono font-black">{tourney.dates}</span>
                    <span className={`text-[10px] font-mono font-black border-b px-1 py-0.5 rounded ${tourney.colorText} bg-slate-900 border-slate-800`}>
                      {daysToTourney === 0 ? '🏁 LIVE NOW' : `⏳ ${daysToTourney} DAYS`}
                    </span>
                  </div>

                  <h4 className="text-xs font-black uppercase font-display text-[#fafafa] leading-tight mb-2 min-h-[32px]">
                    {tourney.title}
                  </h4>

                  <span className="text-[9px] text-[#aec0ce] uppercase block font-semibold mb-3 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-405 shrink-0" /> {tourney.location}
                  </span>

                  <div className="space-y-2 border-t border-slate-900 pt-2 text-[10.5px]">
                    <div className="flex items-start gap-1">
                      <Plane className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-550 block font-bold text-[8.5px] uppercase">DESIRED AIRPORT</span>
                        <p className="text-slate-300 leading-tight font-sans text-[10px]">{tourney.airport}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-1">
                      <Hotel className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-550 block font-bold text-[8.5px] uppercase">MANDATORY RESIDENT HOTEL</span>
                        <p className="text-slate-300 leading-tight font-sans text-[10px] font-bold">{tourney.hotel}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900/80 space-y-1.5 text-[9.5px]">
                  <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded border border-slate-900 text-[10px]">
                    <span className="text-slate-500">Report In:</span>
                    <span className="text-slate-200 font-semibold">{tourney.dates.split('-')[0]}</span>
                  </div>
                  <p className="text-slate-400 leading-snug italic font-sans text-[9px]">
                    {tourney.reportDay}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
