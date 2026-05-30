import { useState, useEffect } from 'react';
import { DailyLog, ScheduleEvent, ThrowingLog, StrengthLog } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Trophy, 
  MapPin, 
  AlertTriangle,
  History,
  Activity,
  Award,
  CheckSquare,
  Square,
  Trash2
} from 'lucide-react';

interface WorkloadCalendarProps {
  logs: DailyLog[];
  schedule: ScheduleEvent[];
  onAddLog: (log: Omit<DailyLog, 'id' | 'date'>, date: string) => Promise<void>;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onDeleteLog?: (id: string) => Promise<void>;
}

export default function WorkloadCalendar({
  logs,
  schedule,
  onAddLog,
  selectedDate,
  setSelectedDate,
  onDeleteLog
}: WorkloadCalendarProps) {
  
  // Year & Month control
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // May is 4, June is 5 in 0-indexed JS, but let's use 1-indexed for simple calculations (5 = May, 6 = June)

  const [checklist, setChecklist] = useState({
    warmup: false,
    throwing: false,
    strength: false,
    mobility: false,
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // States for manual detailed logger tab
  const [logFormTab, setLogFormTab] = useState<'checklist' | 'manual'>('checklist');
  const [customLogType, setCustomLogType] = useState<'throwing' | 'strength' | 'recovery'>('throwing');
  
  // Custom throwing fields
  const [throwingType, setThrowingType] = useState<'Recovery Catch' | 'Catch Play' | 'Bullpen' | 'Game Appearance' | 'Off / Rest'>('Catch Play');
  const [pitchCount, setPitchCount] = useState<number>(35);
  const [targetDistanceFeet, setTargetDistanceFeet] = useState<number>(120);
  const [avgVelocity, setAvgVelocity] = useState<number>(85);
  const [maxVelocity, setMaxVelocity] = useState<number>(90);
  const [strikePercentage, setStrikePercentage] = useState<number>(60);
  const [throwingIntensity, setThrowingIntensity] = useState<number>(6);
  const [throwingNotes, setThrowingNotes] = useState<string>('');

  // Custom strength fields
  const [workoutType, setWorkoutType] = useState<'Upper Body' | 'Lower Body' | 'Core' | 'Full Body' | 'Arm Care Rotator Cuff' | 'Mobility / Rest'>('Full Body');
  const [strengthIntensity, setStrengthIntensity] = useState<number>(7);
  const [strengthNotes, setStrengthNotes] = useState<string>('');

  // Custom recovery fields
  const [sorenessLevel, setSorenessLevel] = useState<number>(2);
  const [sorenessArea, setSorenessArea] = useState<'Shoulder' | 'Elbow' | 'Forearm' | 'None'>('None');
  const [fatigueLevel, setFatigueLevel] = useState<number>(3);
  const [sleepQuality, setSleepQuality] = useState<number>(8);
  const [recoveryNotes, setRecoveryNotes] = useState<string>('');

  const [savingCustom, setSavingCustom] = useState(false);
  const [customSuccessMessage, setCustomSuccessMessage] = useState('');

  const handleSubmitCustomLog = async () => {
    setSavingCustom(true);
    setCustomSuccessMessage('');
    try {
      if (customLogType === 'throwing') {
        await onAddLog({
          logType: 'throwing',
          throwingType,
          pitchCount: Number(pitchCount) || 35,
          targetDistanceFeet: Number(targetDistanceFeet) || 120,
          avgVelocity: Number(avgVelocity) || undefined,
          maxVelocity: Number(maxVelocity) || undefined,
          strikePercentage: Number(strikePercentage) || undefined,
          intensitySubjective: Number(throwingIntensity) || 6,
          notes: throwingNotes || `Logged custom throwing ${throwingType} session.`
        } as any, selectedDate);
      } else if (customLogType === 'strength') {
        await onAddLog({
          logType: 'strength',
          workoutType,
          intensity: Number(strengthIntensity) || 7,
          notes: strengthNotes || `Logged custom strength ${workoutType} session.`
        } as any, selectedDate);
      } else if (customLogType === 'recovery') {
        await onAddLog({
          logType: 'recovery',
          sorenessLevel: Number(sorenessLevel) || 2,
          sorenessArea,
          fatigueLevel: Number(fatigueLevel) || 3,
          sleepQuality: Number(sleepQuality) || 8,
          notes: recoveryNotes || 'Logged custom recovery assessment.'
        } as any, selectedDate);
      }
      setCustomSuccessMessage('Activity successfully saved to calendar context!');
      // Clear specific notes text fields to reset
      setThrowingNotes('');
      setStrengthNotes('');
      setRecoveryNotes('');
    } catch (e) {
      console.error(e);
    } finally {
      setSavingCustom(false);
    }
  };

  // Load calendar CSV data as fallbacks
  const travelDays = [
    { date: '2026-06-11', label: 'Dynamic Top Org Battle (Clemson)' },
    { date: '2026-06-12', label: 'Tournament Game 1 @ Clemson' },
    { date: '2026-06-13', label: 'Tournament Game 2 @ Clemson' },
    { date: '2026-06-14', label: 'Ultimate Championship (Palm Beaches)' },
    { date: '2026-06-15', label: 'Tournament Round @ Florida' },
    { date: '2026-06-22', label: 'National USA Baseball (Cary, NC)' }
  ];

  // Helper: check if a date is completed (has any throwing, strength, or compliance log)
  const isDateCompleted = (dateStr: string) => {
    return logs.some(l => l.date === dateStr);
  };

  // Get what's happening on a date
  const getDateEvent = (dateStr: string) => {
    // 1. Check schedule
    const event = schedule.find(s => s.date === dateStr);
    if (event) return { type: 'game', label: event.eventName, status: event.status };

    // 2. Check travel schedule
    const travel = travelDays.find(t => t.date === dateStr);
    if (travel) return { type: 'travel', label: travel.label, status: 'Scheduled' };

    return null;
  };

  // Generate calendar days for specified month (1-indexed May=5, June=6)
  const getDaysInMonth = (year: number, month: number) => {
    const jsMonth = month - 1; // 0-indexed
    const firstDayIndex = new Date(year, jsMonth, 1).getDay(); // Sun=0, Mon=1...
    const totalDays = new Date(year, jsMonth + 1, 0).getDate();
    
    const days = [];
    
    // Padding for previous month days
    const prevMonthTotalDays = new Date(year, jsMonth, 0).getDate();
    const paddingCount = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Mon-indexed Mon=0
    for (let i = paddingCount - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const prevMonthNum = month === 1 ? 12 : month - 1;
      const prevYearNum = month === 1 ? year - 1 : year;
      const dateStr = `${prevYearNum}-${String(prevMonthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({ dayNum, isCurrentMonth: false, dateStr });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNum: i, isCurrentMonth: true, dateStr });
    }

    // Padding for next month
    const nextPaddingCount = 42 - days.length; // standard 6x7 grid
    for (let i = 1; i <= nextPaddingCount; i++) {
      const nextMonthNum = month === 12 ? 1 : month + 1;
      const nextYearNum = month === 12 ? year + 1 : year;
      const dateStr = `${nextYearNum}-${String(nextMonthNum).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dayNum: i, isCurrentMonth: false, dateStr });
    }

    return days;
  };

  const handleMonthPrev = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleMonthNext = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Sync checklist state when selected date changes
  useEffect(() => {
    const dateLogs = logs.filter(l => l.date === selectedDate);
    if (dateLogs.length > 0) {
      const hasThrowing = dateLogs.some(l => l.logType === 'throwing');
      const hasStrength = dateLogs.some(l => l.logType === 'strength');
      const hasRecovery = dateLogs.some(l => l.logType === 'recovery');
      
      setChecklist({
        warmup: hasRecovery || hasThrowing,
        throwing: hasThrowing,
        strength: hasStrength,
        mobility: hasRecovery,
        notes: dateLogs[0].notes || ''
      });
      setSuccess(true);
    } else {
      setChecklist({
        warmup: false,
        throwing: false,
        strength: false,
        mobility: false,
        notes: ''
      });
      setSuccess(false);
    }
  }, [selectedDate, logs]);

  const handleSubmitChecklist = async () => {
    setSubmitting(true);
    try {
      // 1. Log throwing activity if checked
      if (checklist.throwing) {
        await onAddLog({
          logType: 'throwing',
          throwingType: 'Catch Play',
          pitchCount: 35,
          targetDistanceFeet: 150,
          intensitySubjective: 6,
          notes: checklist.notes || 'Catch play reachback sequence completed under the calendar tracking plan.'
        } as any, selectedDate);
      }

      // 2. Log strength activity if checked
      if (checklist.strength) {
        await onAddLog({
          logType: 'strength',
          workoutType: 'Full Body',
          intensity: 7,
          notes: 'Biocore rotational power conditioning logged on calendar coordinator.'
        } as any, selectedDate);
      }

      // 3. Log recovery if others are omitted but warmup was done
      if (checklist.warmup && !checklist.throwing && !checklist.strength) {
        await onAddLog({
          logType: 'recovery',
          sorenessLevel: 2,
          sorenessArea: 'None',
          fatigueLevel: 3,
          sleepQuality: 8,
          notes: 'Light warmup sequence and soft-tissue flushing completed.'
        } as any, selectedDate);
      }

      // Fallback: If nothing was checked but clicked submit, record a default compliance log
      if (!checklist.warmup && !checklist.throwing && !checklist.strength && !checklist.mobility) {
        await onAddLog({
          logType: 'recovery',
          sorenessLevel: 1,
          sorenessArea: 'None',
          fatigueLevel: 2,
          sleepQuality: 8,
          notes: checklist.notes || 'Training requirements fulfilled and verified.'
        } as any, selectedDate);
      }

      setSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const getDayLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const isToday = (dateStr: string) => {
    return dateStr === '2026-05-30'; // Static baseline context date
  };

  const activeDays = getDaysInMonth(currentYear, currentMonth);

  // Month labels
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div id="interactive-workload-calendar" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-teal-500/25 to-cyan-500/25 border border-teal-500/30 text-teal-450 rounded-xl">
            <CalendarIcon className="w-5.5 h-5.5 text-teal-400" />
          </div>
          <div>
            <h3 className="text-base font-black font-display text-white uppercase tracking-tight">Interactive Training Calendar</h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Click any calendar day to plan upcoming starts, log completions, or review past session metrics.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] bg-slate-950 px-2.5 py-1 rounded border border-slate-850">
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-slate-400">SELECTDATE:</span>
          <span className="text-teal-400 font-extrabold">{selectedDate}</span>
        </div>
      </div>

      {/* Layout Split: Left Calendar Grid, Right workout panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Monthly Calendar View */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Calendar Header / Month Toggle */}
          <div className="flex items-center justify-between bg-slate-950 border border-slate-850 p-3 rounded-xl">
            <h4 className="text-sm font-black font-display text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              {monthNames[currentMonth - 1]} {currentYear}
            </h4>
            <div className="flex items-center gap-1">
              <button
                onClick={handleMonthPrev}
                className="p-1.5 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentYear(2026);
                  setCurrentMonth(5); // Reset to baseline May
                  setSelectedDate('2026-05-30');
                }}
                className="text-[10px] font-black font-display px-2 py-1 bg-slate-900 rounded border border-slate-800 text-teal-400 hover:text-white cursor-pointer"
              >
                TODAY
              </button>
              <button
                onClick={handleMonthNext}
                className="p-1.5 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] uppercase font-black font-display text-slate-500 tracking-wider">
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
            <div>Sun</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {activeDays.map((day, idx) => {
              const isSel = selectedDate === day.dateStr;
              const hasLogs = isDateCompleted(day.dateStr);
              const customEvt = getDateEvent(day.dateStr);
              const isTodayCell = isToday(day.dateStr);

              return (
                <button
                  key={`${day.dateStr}-${idx}`}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`min-h-[50px] sm:min-h-[64px] rounded-xl p-1 px-1.5 flex flex-col justify-between items-start text-left cursor-pointer border transition-all relative ${
                    isSel 
                      ? 'bg-teal-500/10 border-teal-400 text-white shadow-md shadow-teal-500/5' 
                      : isTodayCell 
                        ? 'bg-slate-950 border-emerald-500/30 text-emerald-450 hover:bg-slate-900'
                        : day.isCurrentMonth
                          ? 'bg-slate-950/60 border-slate-850 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                          : 'bg-slate-900/10 border-slate-900/40 text-slate-600 hover:bg-slate-900/20'
                  }`}
                >
                  {/* Top Line: Day Num and Compliance tick */}
                  <div className="w-full flex justify-between items-center">
                    <span className={`text-[10px] font-mono leading-none ${
                      isSel ? 'font-black text-teal-400' : isTodayCell ? 'font-black text-emerald-400' : 'font-semibold'
                    }`}>
                      {day.dayNum}
                    </span>
                    {hasLogs ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/40" title="Workout logged" />
                    ) : isTodayCell ? (
                      <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" title="Duty Active" />
                    ) : null}
                  </div>

                  {/* Event indicator labels */}
                  <div className="w-full mt-1">
                    {customEvt && (
                      <div className={`p-0.5 rounded text-[8px] leading-none mb-0.5 font-bold text-center truncate ${
                        customEvt.type === 'game' 
                          ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-rose-400 font-extrabold uppercase' 
                          : 'bg-indigo-500/10 border border-indigo-500/20 text-cyan-400 uppercase'
                      }`}>
                        {customEvt.type === 'game' ? '🏆 GAME' : '✈ TRAVEL'}
                      </div>
                    )}
                    {day.dateStr === '2026-06-06' && (
                      <div className="p-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded text-[7px] leading-none text-center font-bold font-mono">
                        🔥 BULLPEN
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Guide Legend */}
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-500 bg-slate-950/50 p-2.5 rounded-xl border border-slate-850/60 mt-1">
            <span className="font-bold">LEGEND:</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-450 bg-emerald-500" />
              <span>Completed Log</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              <span>Today&apos;s Focus</span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/10 text-[9px] text-rose-450 font-bold border border-rose-500/10 uppercase">
              🏆 Game Day
            </div>
          </div>
        </div>

        {/* Right Column: Date Specific Status & Workout reporters */}
        <div className="lg:col-span-5 bg-slate-950 rounded-xl border border-slate-850/90 p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-5">
            {/* Header Area info */}
            <div className="border-b border-slate-905 border-slate-900 pb-3 text-start">
              <span className="text-[9px] font-black font-display text-teal-400 uppercase tracking-widest block font-bold">
                SESSION DETAIL REPORT
              </span>
              <h4 className="text-sm font-black font-display text-[#edf2f7] mt-0.5">
                {getDayLabel(selectedDate)}
              </h4>
              {isToday(selectedDate) && (
                <span className="inline-block mt-1 text-[8px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  ★ ACTIVE TASK TODAY (2026-05-30)
                </span>
              )}
            </div>

            {/* Task plan direction context */}
            <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900 text-start space-y-1.5">
              <span className="text-[9px] text-slate-500 block font-bold uppercase">Pre-Planned Workload Targets</span>
              {getDateEvent(selectedDate) ? (
                <div className="p-2 bg-rose-950/15 border border-rose-500/10 rounded-lg text-xs font-sans text-rose-300">
                  🏆 <strong>{getDateEvent(selectedDate)?.label}</strong>
                </div>
              ) : (
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  {selectedDate === '2026-06-06' ? (
                    <span>🔥 Showcase Bullpen Prep. Log fastball velocities and pitches to record progressions.</span>
                  ) : (
                    <span>🏋️ Standard developmental program. Complete throw counts, arm flushes, and posture conditioning.</span>
                  )}
                </p>
              )}
            </div>

            {/* Selector: Quick checklist compliance vs Manual detailed logger */}
            <div className="grid grid-cols-2 bg-slate-900/60 p-1 rounded-xl border border-slate-850/80">
              <button
                type="button"
                onClick={() => setLogFormTab('checklist')}
                className={`py-2 text-[10px] uppercase font-black tracking-wider text-center rounded-lg cursor-pointer transition-all ${
                  logFormTab === 'checklist'
                    ? 'bg-slate-950 text-teal-400 font-extrabold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📋 Checklist
              </button>
              <button
                type="button"
                onClick={() => setLogFormTab('manual')}
                className={`py-2 text-[10px] uppercase font-black tracking-wider text-center rounded-lg cursor-pointer transition-all ${
                  logFormTab === 'manual'
                    ? 'bg-slate-950 text-cyan-400 font-extrabold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚙ Custom Workout
              </button>
            </div>

            {logFormTab === 'checklist' ? (
              /* TAB 1: QUICK COMPLIANCE CHECKLIST CHECKER */
              <div className="space-y-4">
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wide text-start">
                  Quick Checklist compliance
                </span>

                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    type="button"
                    onClick={() => !success && setChecklist(prev => ({ ...prev, warmup: !prev.warmup }))}
                    disabled={success}
                    className={`p-2.5 rounded-lg border text-xs text-start font-semibold flex items-center justify-between transition-all ${
                      checklist.warmup
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-200'
                        : 'bg-slate-900 border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${checklist.warmup ? 'border-emerald-450 bg-emerald-500/10' : 'border-slate-700'}`}>
                        {checklist.warmup && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      </div>
                      <span>J-Bands Pitchers Warmups</span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500">15m</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => !success && setChecklist(prev => ({ ...prev, throwing: !prev.throwing }))}
                    disabled={success}
                    className={`p-2.5 rounded-lg border text-xs text-start font-semibold flex items-center justify-between transition-all ${
                      checklist.throwing
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-200'
                        : 'bg-slate-900 border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${checklist.throwing ? 'border-emerald-450 bg-emerald-500/10' : 'border-slate-700'}`}>
                        {checklist.throwing && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      </div>
                      <span>Throwing Catch-Play Sequence</span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500">30m</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => !success && setChecklist(prev => ({ ...prev, strength: !prev.strength }))}
                    disabled={success}
                    className={`p-2.5 rounded-lg border text-xs text-start font-semibold flex items-center justify-between transition-all ${
                      checklist.strength
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-200'
                        : 'bg-slate-900 border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${checklist.strength ? 'border-emerald-450 bg-emerald-500/10' : 'border-slate-700'}`}>
                        {checklist.strength && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      </div>
                      <span>Post-Throw Biocore posturals</span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500">60m</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => !success && setChecklist(prev => ({ ...prev, mobility: !prev.mobility }))}
                    disabled={success}
                    className={`p-2.5 rounded-lg border text-xs text-start font-semibold flex items-center justify-between transition-all ${
                      checklist.mobility
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-200'
                        : 'bg-slate-900 border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${checklist.mobility ? 'border-emerald-450 bg-emerald-500/10' : 'border-slate-700'}`}>
                        {checklist.mobility && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      </div>
                      <span>Sleeper Stretch Flushes</span>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500">10m</span>
                  </button>
                </div>

                {!success && (
                  <div className="space-y-1 text-start">
                    <label className="text-[9px] text-slate-405 text-slate-400 block uppercase font-bold">Session Notes</label>
                    <textarea
                      value={checklist.notes}
                      onChange={e => setChecklist(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Comment on arm status, tightness areas..."
                      className="bg-slate-900 border border-slate-850 rounded-lg p-2 w-full text-xs text-white min-h-[50px] font-sans focus:border-teal-500 outline-none text-start"
                    />
                  </div>
                )}

                <div className="pt-2">
                  {success ? (
                    <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-center text-emerald-400 font-bold text-[10px] uppercase">
                      ✓ EXERCISES COMPLIANT & RECORDED
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitChecklist}
                      disabled={submitting}
                      className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 text-teal-400 font-extrabold text-[10px] tracking-widest uppercase py-2.5 rounded-lg cursor-pointer hover:border-teal-500/30 transition-all"
                    >
                      {submitting ? 'LOGGING COMPLIANCE...' : '💾 SUBMIT EXERCISES'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* TAB 2: DETAILED MANUAL WORKOUT ENTERER */
              <div className="space-y-3.5 text-start">
                {/* Form Log Type toggler */}
                <div className="flex gap-1.5 bg-slate-900/60 p-0.5 rounded-lg border border-slate-900 text-[9.5px]">
                  {['throwing', 'strength', 'recovery'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCustomLogType(t as any)}
                      className={`flex-1 py-1 rounded capitalize font-bold transition-all cursor-pointer ${
                        customLogType === t
                          ? 'bg-slate-950 text-cyan-400 font-black'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Sub Success Label */}
                {customSuccessMessage && (
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10.5px] font-bold rounded-lg text-center">
                    {customSuccessMessage}
                  </div>
                )}

                {/* THROWING DETAILED SUBFORM */}
                {customLogType === 'throwing' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 text-slate-400 uppercase font-bold block">Session Type</label>
                        <select
                          value={throwingType}
                          onChange={e => setThrowingType(e.target.value as any)}
                          className="w-full bg-slate-900 text-white text-[11px] font-medium border border-slate-850 p-1.5 rounded-lg focus:border-cyan-500 outline-none"
                        >
                          <option value="Catch Play">Catch Play</option>
                          <option value="Bullpen">Bullpen Practice</option>
                          <option value="Game Appearance">Game Outing</option>
                          <option value="Recovery Catch">Recovery Toss</option>
                          <option value="Off / Rest">Off Day / rest</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 text-slate-400 uppercase font-bold block">Pitches/Throws</label>
                        <input
                          type="number"
                          value={pitchCount}
                          onChange={e => setPitchCount(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-slate-900 border border-slate-850 p-1 px-2.5 rounded-lg text-[11px] text-white font-mono focus:border-cyan-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Peak & Average Velocities (The critical tracking fields for the Line Chart!) */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-cyan-400 uppercase font-black block">Peak Fastball (mph)</label>
                        <input
                          type="number"
                          value={maxVelocity || ''}
                          placeholder="e.g. 92"
                          onChange={e => setMaxVelocity(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-cyan-500/20 p-1.5 px-2.5 rounded-lg text-xs text-white font-extrabold font-mono focus:border-cyan-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-emerald-400 uppercase font-black block">Avg Fastball (mph)</label>
                        <input
                          type="number"
                          value={avgVelocity || ''}
                          placeholder="e.g. 88"
                          onChange={e => setAvgVelocity(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-emerald-500/20 p-1.5 px-2.5 rounded-lg text-xs text-white font-extrabold font-mono focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 text-slate-400 uppercase font-bold block">Max Distance (Feet)</label>
                        <input
                          type="number"
                          value={targetDistanceFeet}
                          onChange={e => setTargetDistanceFeet(Math.max(0, Number(e.target.value)))}
                          className="w-full bg-slate-900 border border-slate-850 p-1 px-2 rounded-lg text-[11px] text-white font-mono focus:border-cyan-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 text-slate-400 uppercase font-bold block">Strike Rate (%)</label>
                        <input
                          type="number"
                          value={strikePercentage}
                          onChange={e => setStrikePercentage(Math.max(0, Math.min(100, Number(e.target.value))))}
                          className="w-full bg-slate-900 border border-slate-850 p-1 px-2 rounded-lg text-[11px] text-white font-mono focus:border-cyan-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-400 uppercase font-bold">
                        <span>Perceived intensity</span>
                        <span className="font-mono text-cyan-400 font-extrabold">{throwingIntensity}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={throwingIntensity}
                        onChange={e => setThrowingIntensity(Number(e.target.value))}
                        className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-405 text-slate-400 block uppercase font-bold">Throwing Notes</label>
                      <textarea
                        value={throwingNotes}
                        onChange={e => setThrowingNotes(e.target.value)}
                        placeholder="Bullpen sequence, fastball drop observations..."
                        className="bg-slate-900 border border-slate-850 rounded-lg p-2.5 w-full text-xs text-white min-h-[44px] max-h-[70px] outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}

                {/* STRENGTH DETAILED SUBFORM */}
                {customLogType === 'strength' && (
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-450 text-slate-400 uppercase font-bold block">Workout Division</label>
                      <select
                        value={workoutType}
                        onChange={e => setWorkoutType(e.target.value as any)}
                        className="w-full bg-slate-900 text-white text-[11px] font-medium border border-slate-850 p-1.5 rounded-lg focus:border-cyan-500 outline-none"
                      >
                        <option value="Full Body">Full Body Conditioning</option>
                        <option value="Upper Body">Upper Body Posturals</option>
                        <option value="Lower Body">Lower Body Rotational Pow</option>
                        <option value="Core">Core Bracing Power</option>
                        <option value="Arm Care Rotator Cuff">Arm Care Rotator Cuff</option>
                        <option value="Mobility / Rest">Mobility & Rest Stretch</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-slate-400 uppercase font-bold">
                        <span>Workout Intensity</span>
                        <span className="font-mono text-cyan-400 font-extrabold">{strengthIntensity}/10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={strengthIntensity}
                        onChange={e => setStrengthIntensity(Number(e.target.value))}
                        className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-405 text-slate-400 block uppercase font-bold">Workout Exercises Completed</label>
                      <textarea
                        value={strengthNotes}
                        onChange={e => setStrengthNotes(e.target.value)}
                        placeholder="e.g. Medicine ball side slams 3x10, DB scaption repetitions..."
                        className="bg-slate-900 border border-slate-850 rounded-lg p-2.5 w-full text-xs text-white min-h-[50px] outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}

                {/* RECOVERY DETAILED SUBFORM */}
                {customLogType === 'recovery' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-450 uppercase font-bold">
                          <span>Soreness Level</span>
                          <span className="font-mono text-rose-455 text-rose-400">{sorenessLevel}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={sorenessLevel}
                          onChange={e => setSorenessLevel(Number(e.target.value))}
                          className="w-full accent-rose-400 bg-slate-800 rounded cursor-pointer h-1"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-450 text-slate-400 uppercase font-bold block">Soreness Location</label>
                        <select
                          value={sorenessArea}
                          onChange={e => setSorenessArea(e.target.value as any)}
                          className="w-full bg-slate-900 text-white text-[11px] font-semibold border border-slate-850 p-1.5 rounded-lg outline-none"
                        >
                          <option value="None">None (Perfect 🟢)</option>
                          <option value="Shoulder">Shoulder Cuff (Tight 🔴)</option>
                          <option value="Elbow">Elbow Tendon (Tight 🔴)</option>
                          <option value="Forearm">Forearm Flexor (Stiff 🟡)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-450 uppercase font-bold">
                          <span>Fatigue Index</span>
                          <span className="font-mono text-yellow-455 text-yellow-400 font-extrabold">{fatigueLevel}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={fatigueLevel}
                          onChange={e => setFatigueLevel(Number(e.target.value))}
                          className="w-full accent-yellow-400 bg-slate-800 rounded cursor-pointer h-1"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-450 uppercase font-bold">
                          <span>Sleep Index</span>
                          <span className="font-mono text-teal-400 font-extrabold">{sleepQuality}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={sleepQuality}
                          onChange={e => setSleepQuality(Number(e.target.value))}
                          className="w-full accent-teal-400 bg-slate-800 rounded cursor-pointer h-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-405 text-slate-400 block uppercase font-bold">Recovery Notes</label>
                      <textarea
                        value={recoveryNotes}
                        onChange={e => setRecoveryNotes(e.target.value)}
                        placeholder="Flushes performed, sleep quality details..."
                        className="bg-slate-900 border border-slate-850 rounded-lg p-2 w-full text-xs text-white min-h-[44px] outlining-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmitCustomLog}
                  disabled={savingCustom}
                  className="w-full bg-gradient-to-r from-cyan-555 from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-slate-950 font-black font-display text-[10px] uppercase tracking-widest py-2.5 rounded-lg cursor-pointer transform hover:scale-[1.01] active:scale-95 transition-all text-center"
                >
                  {savingCustom ? 'SAVING WORKOUT DETAILS...' : '💾 RECORD DETAILED WORKOUT'}
                </button>
              </div>
            )}
          </div>

          {/* DYNAMIC LIST: LOGGED ACTIVITIES ON THIS SELECTED DATE */}
          <div className="mt-5 pt-4 border-t border-slate-900 text-start space-y-2">
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">
              Workouts Logged On This Date
            </span>

            {logs.filter(l => l.date === selectedDate).length === 0 ? (
              <p className="text-[10px] text-slate-600 italic font-mono py-1.5 text-center">
                No custom activities registered yet on this day.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {logs.filter(l => l.date === selectedDate).map((eachLog) => {
                  return (
                    <div
                      key={eachLog.id}
                      className="bg-slate-900/50 hover:bg-slate-900 border border-slate-850/60 p-2.5 rounded-lg flex items-center justify-between gap-3 text-[10.5px] transition-all"
                    >
                      <div className="min-w-0 pr-1.5 text-start">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded leading-none ${
                            eachLog.logType === 'throwing'
                              ? 'bg-cyan-500/10 text-cyan-400'
                              : eachLog.logType === 'strength'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-slate-800 text-slate-350'
                          }`}>
                            {eachLog.logType}
                          </span>
                          {eachLog.logType === 'throwing' && (
                            <span className="font-bold text-slate-300">
                              {(eachLog as any).throwingType || 'Catch'}
                            </span>
                          )}
                          {eachLog.logType === 'strength' && (
                            <span className="font-bold text-slate-300">
                              {(eachLog as any).workoutType || 'Strength'}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-450 text-[10px] text-slate-400 mt-1 truncate font-mono">
                          {eachLog.logType === 'throwing' ? (
                            <span>
                              {(eachLog as any).pitchCount || 0} Pitches
                              { (eachLog as any).maxVelocity ? ` • Peak: ${(eachLog as any).maxVelocity} mph` : '' }
                              { (eachLog as any).avgVelocity ? ` • Avg: ${(eachLog as any).avgVelocity} mph` : '' }
                            </span>
                          ) : eachLog.logType === 'strength' ? (
                            <span>Intensity: {(eachLog as any).intensity || 5}/10</span>
                          ) : (
                            <span>Soreness: {(eachLog as any).sorenessLevel || 1}/10</span>
                          )}
                        </p>
                      </div>

                      {onDeleteLog && (
                        <button
                          type="button"
                          onClick={() => onDeleteLog(eachLog.id)}
                          className="text-slate-505 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 flex-shrink-0 cursor-pointer transition-all"
                          title="Delete workout entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
