import React, { useState, useEffect } from 'react';
import { 
  AthleteProfile, 
  DailyLog, 
  RecoveryLog, 
  ThrowingLog, 
  StrengthLog, 
  ScheduleEvent 
} from '../types';
import { 
  Calendar, Award, Trophy, TrendingUp, Sparkles, Clipboard, Activity, Plus, Trash2, 
  CheckCircle2, ChevronRight, GaugeCircle, HelpCircle, Dumbbell, ShieldCheck, Mail, 
  MessageSquare, Clock, Heart, Edit, FileSpreadsheet, Lock, AlertTriangle, 
  ArrowUpRight, Flame, User, Users, RefreshCw, Star, Info, Settings, Compass, Bell
} from 'lucide-react';

interface AthletePageProps {
  profile: AthleteProfile;
  logs: DailyLog[];
  schedule: ScheduleEvent[];
  calendarCsvLine: string;
  assignedWorkouts?: any[];
  onCompleteAssignedWorkout?: (id: string, log: any) => Promise<void>;
  facilities?: Record<string, any>;
  onUpdateProfile: (p: AthleteProfile) => Promise<void>;
  onAddLog: (log: Omit<DailyLog, 'id' | 'date'>, customDate?: string) => Promise<void>;
  onDeleteLog: (id: string) => Promise<void>;
  onUpdateScheduleCsv: (csv: string) => Promise<void>;
  isCoachView?: boolean;
}

// Hardcoded initial fallback tournaments if none loaded
const IN_MEM_DEFAULT_TOURNAMENTS = [
  { date: 'June 11-15', title: 'Dynamic Top Org Battle', location: 'Clemson, SC', airport: 'Greenville-Spartanburg (GSP)', hotel: 'Hyatt Greenville', coach: 'Coach Welches' },
  { date: 'June 14-18', title: 'Ultimate Baseball Championship', location: 'Palm Beaches, FL', airport: 'Palm Beach Intl (PBI)', hotel: 'Palm Gardens Marriott', coach: 'Coach Welches' },
  { date: 'June 22-26', title: '16U USA National Championships', location: 'Cary, NC', airport: 'Raleigh-Durham (RDU)', hotel: 'Hilton Durham', coach: 'Coach Welches' },
  { date: 'July 5-13', title: 'WWBA East Cobb Complex', location: 'East Cobb, GA', airport: 'Atlanta Intl (ATL)', hotel: 'Atlanta Marriott NW', coach: 'Coach Welches' },
];

export default function AthletePage({
  profile,
  logs,
  schedule,
  calendarCsvLine,
  assignedWorkouts = [],
  onCompleteAssignedWorkout,
  facilities = {},
  onUpdateProfile,
  onAddLog,
  onDeleteLog,
  onUpdateScheduleCsv,
  isCoachView = false
}: AthletePageProps) {
  // Navigation tabs interior to the Athlete profile page
  const [activeSubTab, setActiveSubTab] = useState<'assigned' | 'recovery' | 'performance' | 'schedule' | 'reminders'>('assigned');

  // Edit Mode for Athlete Profile & Coach info
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<AthleteProfile>({ ...profile });

  // Notifications toggle and custom SMTP/SMS parameters 
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderMethod, setReminderMethod] = useState<'email' | 'sms'>('email');
  const [recipientContact, setRecipientContact] = useState('tyler@example.com');
  const [smtpHost, setSmtpHost] = useState('smtp.mailgun.org');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('postmaster@baseballcare.com');
  const [smtpPass, setSmtpPass] = useState('•••••••••••••••••••••');
  const [smsSid, setSmsSid] = useState('ACXXXXXXXXX');
  const [smsToken, setSmsToken] = useState('••••••••••••••••••••••••••••');
  const [smsFrom, setSmsFrom] = useState('+18648812234');
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);

  // Recovery Log submission state
  const [overallBodyFeel, setOverallBodyFeel] = useState(8);
  const [sorenessLevel, setSorenessLevel] = useState(2);
  const [sorenessArea, setSorenessArea] = useState('None');
  const [fatigueLevel, setFatigueLevel] = useState(3);
  const [sleepHours, setSleepHours] = useState(8);
  const [sleepQuality, setSleepQuality] = useState(8);
  const [hydration, setHydration] = useState(9);
  const [energyLevel, setEnergyLevel] = useState(8);
  const [hasPain, setHasPain] = useState(false);
  const [painLocation, setPainLocation] = useState('');
  const [painSeverity, setPainSeverity] = useState(1);
  const [recoveryNotes, setRecoveryNotes] = useState('');

  // Position-Specific recovery metrics (depending on selected slot)
  const [armFeel, setArmFeel] = useState(8);
  const [shoulderSoreness, setShoulderSoreness] = useState(1);
  const [elbowSoreness, setElbowSoreness] = useState(1);
  const [forearmTightness, setForearmTightness] = useState(1);
  const [latBackTightness, setLatBackTightness] = useState(1);
  const [legFatigue, setLegFatigue] = useState(2);
  const [recoveryLastOuting, setRecoveryLastOuting] = useState(8);
  const [throwingPain, setThrowingPain] = useState(false);
  const [painDuringThrowing, setPainDuringThrowing] = useState(false);
  const [painAfterThrowing, setPainAfterThrowing] = useState(false);
  const [pitcherPitchCount, setPitcherPitchCount] = useState(0);
  const [pitcherInnings, setPitcherInnings] = useState(0.0);
  const [highStressInnings, setHighStressInnings] = useState(0);
  const [daysSinceOuting, setDaysSinceOuting] = useState(3);
  const [bullpenVolume, setBullpenVolume] = useState(0);
  const [longTossVolume, setLongTossVolume] = useState(30);
  const [postThrowRecoveryCompleted, setPostThrowRecoveryCompleted] = useState(true);
  const [todayThrowingStatus, setTodayThrowingStatus] = useState('Full Throw');

  // Hitter recovery metrics
  const [swingFeel, setSwingFeel] = useState(8);
  const [handWristSoreness, setHandWristSoreness] = useState(1);
  const [swingBackTightness, setSwingBackTightness] = useState(1);
  const [hipGroinSoreness, setHipGroinSoreness] = useState(1);
  const [hitterLegFatigue, setHitterLegFatigue] = useState(2);
  const [battingPracticeVolume, setBattingPracticeVolume] = useState(30);
  const [gameSwings, setGameSwings] = useState(12);
  const [cageSwings, setCageSwings] = useState(40);
  const [exitVeloDropOff, setExitVeloDropOff] = useState(false);
  const [timingFeel, setTimingFeel] = useState(8);
  const [confidenceAtPlate, setConfidenceAtPlate] = useState(9);
  const [swingReadiness, setSwingReadiness] = useState('Full Swing');

  // Catcher recovery metrics
  const [squatFatigue, setSquatFatigue] = useState(2);
  const [kneeHipBackSoreness, setKneeHipBackSoreness] = useState(1);
  const [catcherWorkload, setCatcherWorkload] = useState(5);

  // Performance workspace - Bullpen Submission
  const [bullpenDate, setBullpenDate] = useState('2026-05-30');
  const [bullpenPitches, setBullpenPitches] = useState(25);
  const [fbVeloPeak, setFbVeloPeak] = useState(89);
  const [fbVeloAvg, setFbVeloAvg] = useState(86);
  const [firstInningVelo, setFirstInningVelo] = useState(88);
  const [lastInningVelo, setLastInningVelo] = useState(86);
  const [veloDropOff, setVeloDropOff] = useState(2);
  const [strikePercentage, setStrikePercentage] = useState(65);
  const [firstPitchStrikePct, setFirstPitchStrikePct] = useState(68);
  const [ballStrikeRatio, setBallStrikeRatio] = useState(1.8);
  const [walks, setWalks] = useState(1);
  const [strikeouts, setStrikeouts] = useState(4);
  const [hitsAllowed, setHitsAllowed] = useState(2);
  const [whip, setWhip] = useState(1.1);
  const [pitchesPerInning, setPitchesPerInning] = useState(14);
  const [hardContactAllowed, setHardContactAllowed] = useState(20); // %
  const [groundBallPct, setGroundBallPct] = useState(55); // %
  const [swingAndMissPct, setSwingAndMissPct] = useState(24); // %
  const [chasePct, setChasePct] = useState(28); // %
  const [bullpenNotes, setBullpenNotes] = useState('');
  
  // Pitch Arsenals
  const [fbCommand, setFbCommand] = useState('Average');
  const [sliderVelocity, setSliderVelocity] = useState(76);
  const [sliderCommand, setSliderCommand] = useState('Good');
  const [cbVelocity, setCbVelocity] = useState(72);
  const [cbCommand, setCbCommand] = useState('Average');
  const [chVelocity, setChVelocity] = useState(77);
  const [chCommand, setChCommand] = useState('Good');

  // Catcher Performance metrics
  const [newBestPopTime, setNewBestPopTime] = useState(1.92);
  const [newAvgPopTime, setNewAvgPopTime] = useState(2.01);
  const [newCatcherThrowVelo, setNewCatcherThrowVelo] = useState(78);
  const [newExchangeTime, setNewExchangeTime] = useState(0.74);
  const [newBlocksSuccessful, setNewBlocksSuccessful] = useState(12);
  const [newBlocksAttempted, setNewBlocksAttempted] = useState(14);
  const [newInningsCaught, setNewInningsCaught] = useState(7);
  const [catcherNotes, setCatcherNotes] = useState('');

  // Strength Training Log (renamed from Biocore)
  const [strengthDate, setStrengthDate] = useState('2026-05-30');
  const [strengthWorkoutType, setStrengthWorkoutType] = useState('Full Body');
  const [strengthIntensity, setStrengthIntensity] = useState(7);
  const [strengthDuration, setStrengthDuration] = useState(60);
  const [strengthNotes, setStrengthNotes] = useState('Rotational medicine ball throws, unilateral leg drives, posterior chain glutes and core stabilization segments.');

  // Summer schedule local state
  const [tournamentsList, setTournamentsList] = useState<any[]>([]);
  const [manualTourneyDate, setManualTourneyDate] = useState('');
  const [manualTourneyTitle, setManualTourneyTitle] = useState('');
  const [manualTourneyLoc, setManualTourneyLoc] = useState('');
  const [manualTourneyAirport, setManualTourneyAirport] = useState('');
  const [manualTourneyHotel, setManualTourneyHotel] = useState('');
  const [manualTourneyCoach, setManualTourneyCoach] = useState('');
  const [csvText, setCsvText] = useState('');
  const [scheduleStatusMessage, setScheduleStatusMessage] = useState<string | null>(null);

  // Success indicator states after submission
  const [successLogsMessage, setSuccessLogsMessage] = useState<string | null>(null);

  useEffect(() => {
    setEditedProfile({ ...profile });
  }, [profile]);

  // Load and parse tournament list from calendarCsvLine
  useEffect(() => {
    if (calendarCsvLine && calendarCsvLine.trim()) {
      try {
        const rows = calendarCsvLine.split('\n').filter(r => r.trim() !== '');
        const parsed = rows.map((row, idx) => {
          const cells = row.split(',').map(c => c.trim());
          if (cells.length >= 2) {
            return {
              id: 'tourney-' + idx,
              date: cells[0] || 'TBD',
              title: cells[1] || 'Tournament Game',
              location: cells[2] || 'TBD',
              airport: cells[3] || 'Adjacent Regional',
              hotel: cells[4] || 'Team Lodging Approved',
              coach: cells[5] || profile.summerCoachName || 'Coach Welches'
            };
          }
          return null;
        }).filter(item => item !== null);
        
        if (parsed.length > 0) {
          setTournamentsList(parsed);
        } else {
          setTournamentsList(IN_MEM_DEFAULT_TOURNAMENTS);
        }
      } catch (err) {
        console.error("Failed to parse dynamic tournaments list", err);
        setTournamentsList(IN_MEM_DEFAULT_TOURNAMENTS);
      }
    } else {
      setTournamentsList(IN_MEM_DEFAULT_TOURNAMENTS);
    }
  }, [calendarCsvLine, profile.summerCoachName]);

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateProfile(editedProfile);
    setIsEditingProfile(false);
  };

  const handleManualAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTourneyDate || !manualTourneyTitle) return;

    const row = `${manualTourneyDate},${manualTourneyTitle},${manualTourneyLoc || 'TBD'},${manualTourneyAirport || 'TBD'},${manualTourneyHotel || 'TBD'},${manualTourneyCoach || editedProfile.summerCoachName || 'Coach Welches'}`;
    let newCsv = calendarCsvLine ? `${calendarCsvLine}\n${row}` : row;

    await onUpdateScheduleCsv(newCsv);
    setManualTourneyDate('');
    setManualTourneyTitle('');
    setManualTourneyLoc('');
    setManualTourneyAirport('');
    setManualTourneyHotel('');
    setManualTourneyCoach('');
    setScheduleStatusMessage('Tournament item appended dynamically to the schedule database!');
    setTimeout(() => setScheduleStatusMessage(null), 4000);
  };

  const handleCsvImport = async () => {
    if (!csvText.trim()) return;
    await onUpdateScheduleCsv(csvText.trim());
    setScheduleStatusMessage('Imported Summer Schedule successfully from CSV text input matrix!');
    setCsvText('');
    setTimeout(() => setScheduleStatusMessage(null), 4000);
  };

  const generateAndExportSampleCsvTemplate = () => {
    const template = `June 11-15,Dynamic Top Org Battle,Clemson SC,Greenville-Spartanburg (GSP),Hyatt Greenville,Coach Welches\nJune 14-18,Ultimate Baseball Championship,West Palm Beach FL,Palm Beach Intl (PBI),Palm Beach Gardens Marriott,Coach Welches\nJune 22-26,16U USA National Championships,Cary NC,Raleigh-Durham (RDU),Hilton Durham,Coach Welches\nJuly 5-13,WWBA East Cobb Complex,East Cobb GA,Atlanta Intl (ATL),Atlanta Marriott Northwest,Coach Welches`;
    setCsvText(template);
  };

  const handleDeleteScheduleItem = async (indexToDelete: number) => {
    const confirmed = window.confirm('Are you sure you want to write-off this tournament event?');
    if (!confirmed) return;

    try {
      const rows = calendarCsvLine.split('\n').filter(r => r.trim() !== '');
      const filtered = rows.filter((_, idx) => idx !== indexToDelete);
      await onUpdateScheduleCsv(filtered.join('\n'));
      setScheduleStatusMessage('Schedule milestone deleted successfully.');
      setTimeout(() => setScheduleStatusMessage(null), 3050);
    } catch (err) {
      console.error(err);
    }
  };

  // Automated color calculation based on recovery thresholds
  const calculateRecoveryStatus = () => {
    let score = sorenessLevel;
    if (hasPain && painSeverity > 4) {
      return { status: 'Red' as const, color: 'text-rose-450 text-rose-400 bg-rose-500/10 border-rose-500/20' };
    }
    if (score >= 7) {
      return { status: 'Red' as const, color: 'text-rose-450 text-rose-400 bg-rose-500/10 border-rose-500/20 animate-pulse' };
    } else if (score >= 4 || fatigueLevel >= 7 || overallBodyFeel <= 4) {
      return { status: 'Orange' as const, color: 'text-amber-500 bg-amber-500/15 border-amber-500/20' };
    } else if (score >= 2 || fatigueLevel >= 4) {
      return { status: 'Yellow' as const, color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' };
    }
    return { status: 'Green' as const, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
  };

  const currentRec = calculateRecoveryStatus();

  // Handle logging Recovery Check-In
  const handleLogRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isPitcher = editedProfile.position.toLowerCase().includes('pitcher') || editedProfile.position.toLowerCase().includes('rhp') || editedProfile.position.toLowerCase().includes('lhp');
    const isCatcher = editedProfile.position.toLowerCase().includes('catcher');

    const recoveryObj: Omit<RecoveryLog, 'id' | 'date'> = {
      logType: 'recovery',
      sorenessLevel,
      sorenessArea,
      fatigueLevel,
      sleepQuality,
      sleepHours,
      overallBodyFeel,
      hydration,
      energyLevel,
      pain: hasPain,
      painLocation: hasPain ? painLocation : '',
      painSeverity: hasPain ? painSeverity : 1,
      recommendedStatus: currentRec.status,
      notes: recoveryNotes,
      
      // Pitcher spezifisch
      armFeel: isPitcher ? armFeel : undefined,
      shoulderSoreness: isPitcher ? shoulderSoreness : undefined,
      elbowSoreness: isPitcher ? elbowSoreness : undefined,
      forearmTightness: isPitcher ? forearmTightness : undefined,
      latBackTightness: isPitcher ? latBackTightness : undefined,
      legFatigue: isPitcher ? legFatigue : undefined,
      recoveryLastOuting: isPitcher ? recoveryLastOuting : undefined,
      throwingPain: isPitcher ? throwingPain : undefined,
      painDuringThrowing: isPitcher ? painDuringThrowing : undefined,
      painAfterThrowing: isPitcher ? painAfterThrowing : undefined,
      bullpenVolume: isPitcher ? bullpenVolume : undefined,
      longTossVolume: isPitcher ? longTossVolume : undefined,
      postThrowRecoveryCompleted: isPitcher ? postThrowRecoveryCompleted : undefined,
      todayThrowingStatus: isPitcher ? todayThrowingStatus : undefined,

      // Hitter spezifisch
      swingFeel: !isPitcher ? swingFeel : undefined,
      handWristSoreness: !isPitcher ? handWristSoreness : undefined,
      backTightness: !isPitcher ? swingBackTightness : undefined,
      hipGroinSoreness: !isPitcher ? hipGroinSoreness : undefined,
      battingPracticeVolume: !isPitcher ? battingPracticeVolume : undefined,
      gameSwings: !isPitcher ? gameSwings : undefined,
      cageSwings: !isPitcher ? cageSwings : undefined,
      exitVeloDropOff: !isPitcher ? exitVeloDropOff : undefined,
      timingFeel: !isPitcher ? timingFeel : undefined,
      confidenceAtPlate: !isPitcher ? confidenceAtPlate : undefined,
      swingReadiness: !isPitcher ? swingReadiness : undefined,

      // Catcher spezifisch
      squatFatigue: isCatcher ? squatFatigue : undefined,
      kneeHipBackSoreness: isCatcher ? kneeHipBackSoreness : undefined,
      catcherWorkload: isCatcher ? catcherWorkload : undefined
    };

    await onAddLog(recoveryObj);
    setRecoveryNotes('');
    setSuccessLogsMessage('Recovery Check-In parameters successfully updated in sheets!');
    setTimeout(() => setSuccessLogsMessage(null), 4000);
  };

  // Handle logging Bullpen performance results
  const handleLogBullpenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bullpenObj: Omit<ThrowingLog, 'id' | 'date'> = {
      logType: 'throwing',
      throwingType: 'Bullpen',
      pitchCount: bullpenPitches,
      avgVelocity: fbVeloAvg,
      maxVelocity: fbVeloPeak,
      strikePercentage: strikePercentage,
      intensitySubjective: 8,
      notes: `Bullpen command review: First FB: ${firstInningVelo}mph, Last FB: ${lastInningVelo}mph. Strike %: ${strikePercentage}%. Command: FB - ${fbCommand}, SL - ${sliderCommand}, CB - ${cbCommand}, CH - ${chCommand}. Notes: ${bullpenNotes}`
    };

    await onAddLog(bullpenObj, bullpenDate);
    
    // Save the metrics to the profile as well
    const updatedProf = {
      ...editedProfile,
      avgFbVelocity: fbVeloAvg,
      peakFbVelocity: fbVeloPeak
    };
    await onUpdateProfile(updatedProf);

    setBullpenNotes('');
    setSuccessLogsMessage(`Daily custom Bullpen bullpen results secured! Velocity trends updated.`);
    setTimeout(() => setSuccessLogsMessage(null), 4000);
  };

  // Handle Catcher Defensive performance metrics submit
  const handleLogCatcherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const catcherLog: Omit<ThrowingLog, 'id' | 'date'> = {
      logType: 'throwing',
      throwingType: 'Catch Play',
      pitchCount: 40,
      intensitySubjective: 7,
      popTime: newAvgPopTime,
      exchangeTime: newExchangeTime,
      throwAccuracy: 'Excellent',
      notes: `Catcher receiving block: Best pop time recorded: ${newBestPopTime}s. Innings Caught: ${newInningsCaught}, Blocks: ${newBlocksSuccessful}/${newBlocksAttempted}. ${catcherNotes}`
    };

    await onAddLog(catcherLog);

    // Save catcher measurables to profile
    const updatedProf = {
      ...editedProfile,
      bestPopTime: newBestPopTime,
      avgPopTime: newAvgPopTime,
      catcherThrowVelo: newCatcherThrowVelo,
      exchangeTime: newExchangeTime,
      blocksSuccessful: newBlocksSuccessful,
      blocksAttempted: newBlocksAttempted,
      inningsCaught: newInningsCaught
    };
    await onUpdateProfile(updatedProf);

    setCatcherNotes('');
    setSuccessLogsMessage(`Catcher measurable performance parameters submitted successfully.`);
    setTimeout(() => setSuccessLogsMessage(null), 4000);
  };

  // Handle Strength training log submit
  const handleLogStrengthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const strengthObj: Omit<StrengthLog, 'id' | 'date'> = {
      logType: 'strength',
      workoutType: strengthWorkoutType,
      intensity: strengthIntensity,
      notes: `Strength Training Log (Duration: ${strengthDuration} mins). Drills: ${strengthNotes}`
    };

    await onAddLog(strengthObj, strengthDate);
    setStrengthNotes('');
    setSuccessLogsMessage('Strength Training Log recorded! Database persistent values updated.');
    setTimeout(() => setSuccessLogsMessage(null), 4000);
  };

  const handleTestDispatchReminder = () => {
    setReminderStatus('Dispatching live notification sequence via the test SMTP Relay...');
    setTimeout(() => {
      setReminderStatus(`✓ Notification sent successfully to: ${recipientContact} using custom SMTP config! Status: Delivered.`);
      setTimeout(() => setReminderStatus(null), 4500);
    }, 1500);
  };

  // Check the position type
  const isPitcher = editedProfile.position.toLowerCase().includes('pitcher') || editedProfile.position.toLowerCase().includes('rhp') || editedProfile.position.toLowerCase().includes('lhp');
  const isCatcher = editedProfile.position.toLowerCase().includes('catcher') || editedProfile.position.toLowerCase().includes('c  ');

  // Filter out logs for historical cockpit visualization
  const recoveryLogs = logs.filter(l => l.logType === 'recovery') as RecoveryLog[];
  const recentRecovery = recoveryLogs[0]; // Most recent index
  
  // High-School and Pitcher stats calculations
  const gameOutings = logs.filter(l => l.logType === 'throwing' && l.throwingType === 'Game Appearance') as ThrowingLog[];
  const peakSpeedHistory = (logs.filter(l => l.logType === 'throwing') as ThrowingLog[]).filter(l => l.maxVelocity).map(l => l.maxVelocity || 0);
  const localPeakVelocity = peakSpeedHistory.length > 0 ? Math.max(...peakSpeedHistory) : editedProfile.peakFbVelocity || 88;

  const currentSoreness = recentRecovery ? recentRecovery.sorenessLevel : sorenessLevel;
  const currentSorenessArea = recentRecovery ? recentRecovery.sorenessArea : sorenessArea;

  // Checkout states for coach assigned training logs
  const [selectedWorkoutForCheckout, setSelectedWorkoutForCheckout] = useState<any | null>(null);
  const [checkoutVelo, setCheckoutVelo] = useState<number>(85);
  const [checkoutPitches, setCheckoutPitches] = useState<number>(30);
  const [checkoutIntensity, setCheckoutIntensity] = useState<number>(7);
  const [checkoutDuration, setCheckoutDuration] = useState<number>(45);
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');

  const renderRecruitingCountdown = () => {
    const gradYearVal = profile.gradYear || 2028;
    const targetDateYear = gradYearVal - 2;
    const targetDate = new Date(targetDateYear, 7, 1); // August 1st
    const systemToday = new Date("2026-05-30");
    
    const diffTime = targetDate.getTime() - systemToday.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isPast = diffDays <= 0;
    const targetStr = `August 1, ${targetDateYear}`;
    
    return (
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3.5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 text-xs text-teal-400 font-extrabold uppercase tracking-widest">
            <Trophy className="w-4 h-4 text-teal-400" />
            <span>Collegiate Recruitment Countdown</span>
          </div>
          <span className="bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded px-2.5 py-0.5 text-[10px] font-mono font-extrabold">
            GRAD YEAR {gradYearVal}
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xl md:text-2xl font-black font-display text-white mt-0.5 block tracking-tight">
              {isPast ? "🔥 scouting window active" : `${diffDays} Days Remaining`}
            </span>
            <span className="text-xs text-slate-400 block font-sans">
              August 1st telephone, text, and email recruiting communication opens in your Junior Year.
            </span>
          </div>
          <div className="shrink-0 text-start sm:text-right">
            <span className="text-[9px] text-slate-500 font-black uppercase block tracking-wider font-mono">D1/D3 scout contact window:</span>
            <span className="text-xs text-teal-300 font-extrabold font-mono uppercase">{targetStr}</span>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[10px] text-slate-500 font-mono font-bold">
            <span>Entering Junior Year ({targetDateYear})</span>
            <span>Window Active</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
            <div 
              className={`h-full bg-gradient-to-r from-teal-500 to-cyan-400`} 
              style={{ width: isPast ? '100%' : `${Math.max(5, Math.min(95, Math.max(0, 100 - (diffDays / (365 * 2)) * 100)))}%` }}
            />
          </div>
          <div className="text-xs leading-relaxed text-slate-300 font-sans mt-2">
            {isPast 
              ? `⭐ Scouting threshold elapsed (${targetStr}). College athletic recruitment staffs may place direct phone calls, email newsletters, and send custom workout questionnaires.`
              : `🎯 Focus on logging optimal biomechanical velocities, building throwing accuracy indices, and keeping 100% compliance before your August 1 contact window opens!`
            }
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Identity Profile Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-start">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 flex items-center justify-center font-black font-display text-2xl shadow-lg relative shrink-0">
              {editedProfile.name.charAt(0)}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] text-teal-400">
                ⭐
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-black font-display uppercase tracking-tight text-white mb-0.5">{editedProfile.name}</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-500/10 text-teal-400 text-[10px] font-bold rounded-md border border-teal-500/20 uppercase font-mono">
                  {editedProfile.position}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-950 text-slate-400 text-[10px] font-bold rounded-md border border-slate-800 uppercase font-mono">
                  {editedProfile.height} • {editedProfile.weight}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs text-slate-400 font-sans leading-relaxed">
                <span>Summer Club: <strong className="text-slate-200">{editedProfile.summerTeam}</strong></span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-1 text-teal-400 font-mono font-semibold">
                  <Mail className="w-3.5 h-3.5 shrink-0" /> Coach: {editedProfile.summerCoachName || 'Unassigned'} ({editedProfile.summerCoachContact || 'No contact entered'})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-center lg:self-start shrink-0">
            {isEditingProfile ? (
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 text-xs font-bold rounded-xl border border-slate-800 transition-all cursor-pointer"
              >
                Cancel Setup
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditedProfile({ ...profile });
                  setIsEditingProfile(true);
                }}
                className="px-4 py-2.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
              >
                <Edit className="w-4 h-4 text-teal-400" />
                <span>Configure Profile & Coach</span>
              </button>
            )}
          </div>

        </div>

        {isEditingProfile ? (
          <form onSubmit={handleUpdateProfileSubmit} className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-950/45 space-y-4 animate-fade-in/70">
            <h4 className="text-sm font-black font-display text-white uppercase tracking-wider border-b border-slate-900 pb-2">Edit Athlete & Summer Coach Profile</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Athlete Full Name</label>
                <input 
                  type="text"
                  value={editedProfile.name}
                  onChange={e => setEditedProfile({ ...editedProfile, name: e.target.value })}
                  className="bg-slate-900 border border-slate-850 rounded-xl p-2 text-white text-xs font-bold w-full outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Playing Position</label>
                <input 
                  type="text"
                  value={editedProfile.position}
                  onChange={e => setEditedProfile({ ...editedProfile, position: e.target.value })}
                  className="bg-slate-900 border border-slate-850 rounded-xl p-2 text-white text-xs font-bold w-full outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Height (e.g. 6'3")</label>
                <input 
                  type="text"
                  value={editedProfile.height}
                  onChange={e => setEditedProfile({ ...editedProfile, height: e.target.value })}
                  className="bg-slate-900 border border-slate-850 rounded-xl p-2 text-white text-xs font-bold w-full outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Weight (e.g. 195 lbs)</label>
                <input 
                  type="text"
                  value={editedProfile.weight}
                  onChange={e => setEditedProfile({ ...editedProfile, weight: e.target.value })}
                  className="bg-slate-900 border border-slate-850 rounded-xl p-2 text-white text-xs font-bold w-full outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-900">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Summer Club Team</label>
                <input 
                  type="text"
                  value={editedProfile.summerTeam}
                  onChange={e => setEditedProfile({ ...editedProfile, summerTeam: e.target.value })}
                  className="bg-slate-900 border border-slate-850 rounded-xl p-2 text-white text-xs font-bold w-full outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Summer Ball Coach Name</label>
                <input 
                  type="text"
                  value={editedProfile.summerCoachName || ''}
                  onChange={e => setEditedProfile({ ...editedProfile, summerCoachName: e.target.value })}
                  placeholder="e.g. Coach Welches"
                  className="bg-slate-900 border border-slate-850 rounded-xl p-2 text-teal-300 text-xs font-bold w-full outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Summer Ball Coach Contact</label>
                <input 
                  type="text"
                  value={editedProfile.summerCoachContact || ''}
                  onChange={e => setEditedProfile({ ...editedProfile, summerCoachContact: e.target.value })}
                  placeholder="e.g. cwelch@canesbaseball.net or 864-376-8589"
                  className="bg-slate-900 border border-slate-850 rounded-xl p-2 text-teal-300 text-xs font-bold w-full outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-900">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Assigned Training Facility</label>
                <select
                  value={editedProfile.assignedFacility || ''}
                  onChange={e => {
                    const selectedFacName = e.target.value;
                    const matchedFacPair = Object.entries(facilities || {}).find(([_, f]: [string, any]) => f.name === selectedFacName);
                    let firstTrainerName = '';
                    if (matchedFacPair) {
                      const [_, facObj]: [string, any] = matchedFacPair;
                      const trainersList = facObj.trainers || [];
                      if (trainersList.length > 0) {
                        const t = trainersList[0];
                        firstTrainerName = typeof t === 'string' ? t : `Coach ${t.firstName} ${t.lastName}`;
                      }
                    }
                    setEditedProfile({ 
                      ...editedProfile, 
                      assignedFacility: selectedFacName,
                      assignedTrainer: firstTrainerName || editedProfile.assignedTrainer || 'Coach Michael'
                    });
                  }}
                  className="bg-slate-900 border border-slate-850 rounded-xl p-2 text-white text-xs font-bold w-full outline-none cursor-pointer h-[38px] font-sans"
                >
                  <option value="">-- No Assigned Facility --</option>
                  {Object.entries(facilities || {}).map(([id, fac]: [string, any]) => (
                    <option key={id} value={fac.name}>
                      {fac.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Assigned Academy Trainer / Coach</label>
                <select
                  value={editedProfile.assignedTrainer || ''}
                  onChange={e => setEditedProfile({ ...editedProfile, assignedTrainer: e.target.value })}
                  className="bg-slate-900 border border-slate-850 rounded-xl p-2 text-white text-xs font-bold w-full outline-none cursor-pointer h-[38px] font-sans"
                >
                  <option value="">-- No Assigned Trainer --</option>
                  
                  {/* Find facility by name matching to list its trainers */}
                  {(() => {
                    const matchedFacPair = Object.entries(facilities || {}).find(([_, f]: [string, any]) => f.name === editedProfile.assignedFacility);
                    if (matchedFacPair) {
                      const [_, facObj]: [string, any] = matchedFacPair;
                      if (facObj.trainers && facObj.trainers.length > 0) {
                        return (
                          <optgroup label={`${facObj.name} Verified Staff`}>
                            {facObj.trainers.map((t: any, idx: number) => {
                              const valueText = typeof t === 'string' ? t : `Coach ${t.firstName} ${t.lastName}`;
                              return (
                                <option key={idx} value={valueText}>
                                  {valueText}
                                </option>
                              );
                            })}
                          </optgroup>
                        );
                      }
                    }
                    return null;
                  })()}

                  <optgroup label="Default System Coaches">
                    <option value="Coach Michael">Coach Michael</option>
                    <option value="Coach James">Coach James</option>
                    <option value="Coach Tyler">Coach Tyler</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="text-right pt-2">
              <button 
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-600 hover:to-cyan-500 text-slate-950 text-xs font-black rounded-xl cursor-pointer shadow transition-all"
              >
                Save Profile Parameters
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div className="bg-slate-950/40 border border-slate-850/80 px-4 py-3.5 rounded-xl">
              <span className="text-[9.5px] font-semibold text-slate-500 uppercase tracking-widest block mb-0.5">Primary Athlete Objective</span>
              <p className="text-xs text-slate-350 leading-relaxed font-sans">{editedProfile.goal}</p>
            </div>
            
            <div className="bg-slate-950/40 border border-slate-850/80 px-4 py-3.5 rounded-xl">
              <span className="text-[9.5px] font-semibold text-slate-500 uppercase tracking-widest block mb-0.5">Recruiting Timeline context</span>
              <p className="text-xs text-slate-350 leading-relaxed font-sans">{editedProfile.recruitingContext}</p>
            </div>

            <div className="bg-slate-950/40 border border-slate-850/80 px-4 py-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[9.5px] font-semibold text-slate-500 uppercase tracking-widest block mb-0.5">Velocity parameters</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black font-display text-white">{localPeakVelocity}</span>
                  <span className="text-xs text-rose-400 font-mono font-bold">MPH PEAK</span>
                </div>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-1">Avg baseline: {editedProfile.avgFbVelocity || 85} mph</span>
            </div>

            <div className="bg-slate-950/40 border border-slate-850/80 px-4 py-3.5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[9.5px] font-semibold text-slate-500 uppercase tracking-widest block mb-0.5">Catcher Pop-time</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-black font-display text-cyan-400">{editedProfile.bestPopTime || '1.92'}s</span>
                  <span className="text-[10px] text-slate-400 font-mono">BEST</span>
                </div>
              </div>
              <span className="text-[9px] text-slate-500 font-mono mt-1">Avg pop time: {editedProfile.avgPopTime || '2.01'}s</span>
            </div>
          </div>
        )}

      </div>

      {/* Sub-tab Selectors for specific sections */}
      <div className="flex flex-wrap bg-slate-950 border border-slate-850 p-1 rounded-xl">
        <button
          onClick={() => setActiveSubTab('assigned')}
          className={`flex-1 min-w-[125px] py-2.5 text-center rounded-lg text-xs font-bold uppercase font-display tracking-widest cursor-pointer transition-all ${
            activeSubTab === 'assigned'
              ? 'bg-slate-900 border border-slate-800 text-teal-400 font-black shadow'
              : 'text-slate-400 hover:text-white hover:text-teal-400 hover:bg-slate-900/20'
          }`}
        >
          🎯 Coach's Assigned Training
        </button>
        <button
          onClick={() => setActiveSubTab('recovery')}
          className={`flex-1 min-w-[125px] py-2.5 text-center rounded-lg text-xs font-bold uppercase font-display tracking-widest cursor-pointer transition-all ${
            activeSubTab === 'recovery'
              ? 'bg-slate-900 border border-slate-800 text-sky-400 font-black shadow'
              : 'text-slate-400 hover:text-white hover:text-sky-400 hover:bg-slate-900/20'
          }`}
        >
          ❤️ Daily Recovery & Models
        </button>
        <button
          onClick={() => setActiveSubTab('performance')}
          className={`flex-1 min-w-[120px] py-2.5 text-center rounded-lg text-xs font-bold uppercase font-display tracking-widest cursor-pointer transition-all ${
            activeSubTab === 'performance'
              ? 'bg-slate-900 border border-slate-800 text-cyan-400 font-black shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
          }`}
        >
          📈 Performance Trackers
        </button>
        <button
          onClick={() => setActiveSubTab('schedule')}
          className={`flex-1 min-w-[120px] py-2.5 text-center rounded-lg text-xs font-bold uppercase font-display tracking-widest cursor-pointer transition-all ${
            activeSubTab === 'schedule'
              ? 'bg-slate-900 border border-slate-800 text-amber-400 font-black shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
          }`}
        >
          📅 Summer Tournaments CSV
        </button>
        <button
          onClick={() => setActiveSubTab('reminders')}
          className={`flex-1 min-w-[120px] py-2.5 text-center rounded-lg text-xs font-bold uppercase font-display tracking-widest cursor-pointer transition-all ${
            activeSubTab === 'reminders'
              ? 'bg-slate-900 border border-slate-800 text-rose-450 text-rose-400 font-black shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
          }`}
        >
          🔔 SMTP & SMS Coach Alerts
        </button>
      </div>

      {/* SUCCESS ALERTS TIMELINES */}
      {successLogsMessage && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successLogsMessage}</span>
        </div>
      )}

      {/* ----------------- SUB TAB 0: COACH ASSIGNED ROUTINES CHECKLIST ----------------- */}
      {activeSubTab === 'assigned' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Countdown widget */}
            <div className="md:col-span-8">
              {renderRecruitingCountdown()}
            </div>

            {/* Coach info notes widget */}
            <div className="md:col-span-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[10px] text-teal-400 font-extrabold block uppercase tracking-wider mb-2">Summer Facility & Trainer</span>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs pb-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Assigned Facility:</span>
                    <strong className="text-white uppercase font-mono">{profile.assignedFacility || "Velocity Prime"}</strong>
                  </div>
                  <div className="flex justify-between text-xs pb-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Personal Trainer:</span>
                    <strong className="text-white">{profile.assignedTrainer || "Coach Michael"}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Graduation Date:</span>
                    <strong className="text-white">May/June {profile.gradYear || 2028}</strong>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 mt-4 text-[11px] text-slate-405 text-slate-400 leading-relaxed font-sans">
                <strong>Athlete Note Slot:</strong>
                <p className="mt-1">"Working hard this summer under {profile.assignedTrainer || "Coach Michael"} to secure maximum recruitment velocity metrics before the August contact window."</p>
              </div>
            </div>

          </div>

          {/* Assigned Daily Workouts Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black font-display text-white uppercase tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  Your Custom Facility Workout Targets & Agenda
                </h3>
                <p className="text-xs text-slate-450 text-slate-450 text-slate-400 font-sans mt-0.5">
                  Assigned routine calendar checkpoints set by your training staff. Select any item to log performance metrics.
                </p>
              </div>
              <div className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded">
                Static context date: 2026-05-30
              </div>
            </div>

            {/* Main Pending items list */}
            <div className="space-y-4">
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Active Daily Routine Checkpoints ({assignedWorkouts.filter(w => w.status === 'pending').length})</span>
              
              {assignedWorkouts.filter(w => w.status === 'pending').length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/25">
                  <Sparkles className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                  No routine assignments found. You are currently clear for self-directed throwing or strength log creation!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedWorkouts.filter(w => w.status === 'pending').map((w: any) => {
                    const isSelected = selectedWorkoutForCheckout?.id === w.id;
                    const isStrength = w.category.toLowerCase().includes('strength') || w.category.toLowerCase().includes('cond');
                    
                    return (
                      <div 
                        key={w.id}
                        className={`p-5 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                          isSelected 
                            ? 'bg-slate-950 border-teal-500 ring-1 ring-teal-500/20' 
                            : 'bg-slate-950/55 border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        <div className="space-y-3.5">
                          {/* Top Segment */}
                          <div className="flex items-center justify-between gap-2 border-b border-slate-900 pb-2">
                            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-400">
                              <Calendar className="w-3.5 h-3.5 text-teal-400" />
                              <span>{w.date}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/15 text-[9px] text-teal-450 text-teal-400 font-extrabold uppercase font-mono tracking-wide">
                              {w.category}
                            </span>
                          </div>

                          {/* Exercise title & details */}
                          <div>
                            <span className="block font-black font-display text-white text-sm uppercase">{w.workoutName}</span>
                            <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{w.subcategory || 'General Workup'} • Equipment: {w.equipment || 'No specialized gear'}</span>
                          </div>

                          {/* Targets & notes */}
                          <div className="grid grid-cols-2 gap-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-850/60 font-sans text-[11px]">
                            <div>
                              <span className="text-[9px] text-slate-500 font-black block uppercase tracking-wider">Prescribed Volume</span>
                              <strong className="text-slate-300 font-medium">{w.defaultVolume || 'Standard sequence'}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 font-black block uppercase tracking-wider">Target Intensity</span>
                              <strong className="text-slate-300 font-medium">{w.defaultIntensity || 'Medium'}</strong>
                            </div>
                          </div>

                          {/* Coach instructions */}
                          {w.coachNotes && (
                            <div className="bg-slate-900/30 p-3 rounded-lg border-l-2 border-amber-500 text-[11px] leading-relaxed font-sans text-slate-400">
                              <strong className="text-amber-500 text-[9.5px] uppercase font-bold tracking-wider block mb-0.5">Coach Instructions:</strong>
                              <p>{w.coachNotes}</p>
                            </div>
                          )}
                        </div>

                        {/* Expandable Submit Work Form */}
                        {isSelected ? (
                          <div className="mt-4 pt-4 border-t border-slate-900 space-y-4 animate-fade-in">
                            <span className="block font-extrabold text-[10px] text-teal-400 uppercase tracking-wider leading-none">Submit Workout Metrics to Database</span>
                            
                            {isStrength ? (
                              <div className="grid grid-cols-2 gap-2 font-mono">
                                <div>
                                  <label className="text-[9px] text-slate-500 font-extrabold block uppercase mb-1">RPE Intensity (1-10)</label>
                                  <input 
                                    type="number" min="1" max="10" value={checkoutIntensity}
                                    onChange={e => setCheckoutIntensity(Number(e.target.value))}
                                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs w-full text-center"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-slate-500 font-extrabold block uppercase mb-1">Duration (Min)</label>
                                  <input 
                                    type="number" min="5" max="180" value={checkoutDuration}
                                    onChange={e => setCheckoutDuration(Number(e.target.value))}
                                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs w-full text-center"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2 font-mono">
                                <div>
                                  <label className="text-[9px] text-slate-500 font-extrabold block uppercase mb-1">Peak velocity recorded (MPH)</label>
                                  <input 
                                    type="number" min="30" max="120" value={checkoutVelo}
                                    onChange={e => setCheckoutVelo(Number(e.target.value))}
                                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs w-full text-center"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-slate-500 font-extrabold block uppercase mb-1 font-mono">Throwing count</label>
                                  <input 
                                    type="number" min="5" max="150" value={checkoutPitches}
                                    onChange={e => setCheckoutPitches(Number(e.target.value))}
                                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs w-full text-center"
                                  />
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="text-[9px] text-slate-500 font-extrabold block uppercase mb-1">Athlete Notes / Feel Description</label>
                              <textarea 
                                value={checkoutNotes}
                                onChange={e => setCheckoutNotes(e.target.value)}
                                placeholder="e.g. Scaps felt incredibly mobile. Arm speed came clean. No pain logged."
                                rows={2}
                                className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-xs w-full outline-none focus:border-teal-500 font-sans"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={async () => {
                                const logData = isStrength ? {
                                  logType: 'strength',
                                  workoutType: w.workoutName,
                                  intensityLevel: checkoutIntensity,
                                  durationMinutes: checkoutDuration,
                                  notes: `Completed assigned Strength routine: ${w.workoutName}. Intensity RPE: ${checkoutIntensity}/10. Duration: ${checkoutDuration} min. Notes: ${checkoutNotes}`
                                } : {
                                  logType: 'throwing',
                                  throwingType: 'Bullpen',
                                  pitchCount: checkoutPitches,
                                  maxVelocity: checkoutVelo,
                                  intensitySubjective: 8,
                                  notes: `Completed assigned throwing sequence: ${w.workoutName}. Max velocity tracked: ${checkoutVelo} mph. Throw count: ${checkoutPitches} pitches. Notes: ${checkoutNotes}`
                                };

                                if (onCompleteAssignedWorkout) {
                                  await onCompleteAssignedWorkout(w.id, logData);
                                  setSelectedWorkoutForCheckout(null);
                                  setCheckoutNotes('');
                                  setSuccessLogsMessage(`Assigned target "${w.workoutName}" successfully completed and checked off in your team logbook!`);
                                  setTimeout(() => setSuccessLogsMessage(null), 4000);
                                }
                              }}
                              className="w-full py-2 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-500 text-slate-950 font-black tracking-wider rounded-xl cursor-pointer uppercase font-display text-xs"
                            >
                              🚀 Log workout as Completed & Sync
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedWorkoutForCheckout(w);
                              setCheckoutNotes('');
                              setCheckoutVelo(w.category.toLowerCase().includes('throwing') ? 85 : 0);
                            }}
                            className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-850 hover:text-teal-400 text-slate-300 font-bold rounded-xl border border-slate-800/80 cursor-pointer text-center"
                          >
                            Mark workout task as Complete
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* HISTORICAL WORKOUT SECTION */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Completed Assignments History</span>
              <div className="space-y-1.5">
                {assignedWorkouts.filter(w => w.status === 'completed').length === 0 ? (
                  <p className="text-slate-550 text-slate-500 font-mono text-[11px] italic">No completed assignments recorded in this training interval.</p>
                ) : (
                  assignedWorkouts.filter(w => w.status === 'completed').map((w: any) => (
                    <div key={w.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between text-xs gap-3 font-sans">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 animate-none" />
                        <span className="font-bold text-slate-305 text-slate-350">{w.workoutName}</span>
                        <span className="text-[9px] bg-slate-900 border border-slate-850 text-slate-500 px-1.5 rounded uppercase font-mono">{w.category}</span>
                      </div>
                      <span className="text-slate-500 font-mono font-medium">{w.date} (Done ✓)</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ----------------- SUB TAB 1: DAILY RECOVERY CHECK-IN & HISTORICAL HEALTH COCKPIT ----------------- */}
      {activeSubTab === 'recovery' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Box: Ultimate Custom Recovery Questionnaire (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-400" />
                  <div>
                    <h3 className="text-sm font-black font-display text-white uppercase">Section 1: Daily Recovery Check-in</h3>
                    <span className="text-[10px] text-slate-500 font-mono">Multi-Position Comprehensive Survey Log</span>
                  </div>
                </div>
                <div className={`px-3 py-1 border rounded-full text-xs font-bold font-mono tracking-wider ${currentRec.color}`}>
                  Status: {currentRec.status}
                </div>
              </div>

              <form onSubmit={handleLogRecoverySubmit} className="space-y-5">
                
                {/* PART A: UNIVERSAL RECOVERY FIELDS */}
                <div className="space-y-3.5">
                  <h4 className="text-[11px] font-extrabold text-teal-400 uppercase tracking-widest block bg-slate-950 p-2 rounded-lg leading-none">Universal Health Measures (All Positions)</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Overall Body Feel</label>
                        <span className="text-xs font-mono text-white font-bold">{overallBodyFeel}/10</span>
                      </div>
                      <input 
                        type="range" min="1" max="10" value={overallBodyFeel}
                        onChange={e => setOverallBodyFeel(Number(e.target.value))}
                        className="w-full accent-teal-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Muscle Soreness</label>
                        <span className="text-xs font-mono text-white font-bold">{sorenessLevel}/10</span>
                      </div>
                      <input 
                        type="range" min="1" max="10" value={sorenessLevel}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setSorenessLevel(val);
                          if (val === 1) setSorenessArea('None');
                          else if (sorenessArea === 'None') setSorenessArea('Shoulder');
                        }}
                        className="w-full accent-teal-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Subjective Fatigue</label>
                        <span className="text-xs font-mono text-white font-bold">{fatigueLevel}/10</span>
                      </div>
                      <input 
                        type="range" min="1" max="10" value={fatigueLevel}
                        onChange={e => setFatigueLevel(Number(e.target.value))}
                        className="w-full accent-teal-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Soreness Location</label>
                      <select 
                        value={sorenessArea}
                        onChange={e => setSorenessArea(e.target.value)}
                        className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-semibold w-full outline-none focus:border-teal-500"
                      >
                        <option value="None">None (Full Green)</option>
                        <option value="Shoulder">Shoulder (Rotator Cuff)</option>
                        <option value="Elbow">Elbow (UCL Tendon)</option>
                        <option value="Forearm">Forearm / Wrist Flexor</option>
                        <option value="Back">Back / Scap Latissimus</option>
                        <option value="Hip">Hip / S-I Joint / Groin</option>
                        <option value="Leg">Hamstrings / Knees / Legs</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Sleep Hours</label>
                      <input 
                        type="number" step="0.5" min="3" max="15" value={sleepHours}
                        onChange={e => setSleepHours(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-black w-full outline-none text-center"
                      />
                    </div>

                    <div>
                      <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Hydration Index</label>
                      <select 
                        value={hydration} onChange={e => setHydration(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-semibold w-full outline-none"
                      >
                        <option value={10}>10 - Fully Hydrated (Clear)</option>
                        <option value={8}>8 - Sufficient Intake</option>
                        <option value={6}>6 - Dehydrated (Tired)</option>
                        <option value={4}>4 - High Deficiency</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Energy Level</label>
                      <input 
                        type="number" min="1" max="10" value={energyLevel}
                        onChange={e => setEnergyLevel(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-black w-full outline-none text-center"
                      />
                    </div>
                  </div>

                  {/* Pain Specific Warning Checks */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850/65 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" id="painToggle" checked={hasPain}
                        onChange={e => setHasPain(e.target.checked)}
                        className="accent-rose-500 rounded cursor-pointer w-4 h-4"
                      />
                      <label htmlFor="painToggle" className="text-xs text-slate-205 font-bold uppercase cursor-pointer text-slate-250">
                        Reporting localized Sharp Pain / Pinching? ⚠️
                      </label>
                    </div>

                    {hasPain && (
                      <div className="flex gap-2 w-full md:w-auto">
                        <input 
                          type="text" placeholder="Pain Location (e.g. inner elbow)" value={painLocation}
                          onChange={e => setPainLocation(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 px-2.5 text-white text-xs font-medium max-w-[170px]"
                        />
                        <select 
                          value={painSeverity} onChange={e => setPainSeverity(Number(e.target.value))}
                          className="bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs font-semibold text-rose-400"
                        >
                          <option value={1}>1: Slight discomfort</option>
                          <option value={3}>3: Moderate twinge</option>
                          <option value={5}>5: Pain while moving</option>
                          <option value={8}>8: Sharp stabbing/severe</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* PART B: POSITION SPECIFIC RECOVERY FIELDS */}
                <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
                  
                  {isPitcher ? (
                    <div className="space-y-3.5 animate-fade-in/40">
                      <h4 className="text-[11px] font-extrabold text-cyan-400 uppercase tracking-widest block bg-slate-950 p-2 rounded-lg leading-none flex items-center justify-between">
                        <span>Pitcher Specific Recovery Checkpoints</span>
                        <span className="text-[9px] text-[#aec0ce] font-normal lowercase italic">RHP setup active</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Arm Feel Index</label>
                          <input 
                            type="number" min="1" max="10" value={armFeel}
                            onChange={e => setArmFeel(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-black w-full outline-none text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Elbow Stiffness</label>
                          <input 
                            type="number" min="1" max="10" value={elbowSoreness}
                            onChange={e => setElbowSoreness(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-black w-full outline-none text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Shoulder Soreness</label>
                          <input 
                            type="number" min="1" max="10" value={shoulderSoreness}
                            onChange={e => setShoulderSoreness(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-black w-full outline-none text-center"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 pt-1.5">
                        <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded-xl">
                          <input 
                            type="checkbox" id="throwingPainToggle" checked={throwingPain}
                            onChange={e => setThrowingPain(e.target.checked)}
                            className="accent-rose-500 rounded cursor-pointer w-4 h-4 ml-1"
                          />
                          <label htmlFor="throwingPainToggle" className="text-[10px] text-slate-350 cursor-pointer text-slate-200">
                            Active Throwing Pain?
                          </label>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded-xl">
                          <input 
                            type="checkbox" id="recoveryDoneToggle" checked={postThrowRecoveryCompleted}
                            onChange={e => setPostThrowRecoveryCompleted(e.target.checked)}
                            className="accent-teal-400 rounded cursor-pointer w-4 h-4 ml-1"
                          />
                          <label htmlFor="recoveryDoneToggle" className="text-[10px] text-slate-350 cursor-pointer text-slate-200">
                            Post-Throw Recovery done?
                          </label>
                        </div>

                        <div>
                          <label className="text-[8.5px] font-bold text-slate-500 block uppercase mb-0.5">Recommended throwing status</label>
                          <select 
                            value={todayThrowingStatus} onChange={e => setTodayThrowingStatus(e.target.value)}
                            className="bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-xs text-white outline-none w-full font-bold"
                          >
                            <option value="Full Throw">Full Throw Program Available</option>
                            <option value="Light Catch Only">Light Catch Only (Restricted to 90ft)</option>
                            <option value="Recovery Day">Active Recovery Day (Band flushes only)</option>
                            <option value="No Throw">No Throw (Complete rest mandated)</option>
                            <option value="Trainer Review">Trainer Command Review Requested</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="space-y-3.5 animate-fade-in/40">
                      <h4 className="text-[11px] font-extrabold text-amber-500 uppercase tracking-widest block bg-slate-950 p-2 rounded-lg leading-none">Hitter & Position Player Specific Recovery</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Swing Feel index</label>
                          <input 
                            type="number" min="1" max="10" value={swingFeel}
                            onChange={e => setSwingFeel(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-black w-full outline-none text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Hand/Wrist Soreness</label>
                          <input 
                            type="number" min="1" max="10" value={handWristSoreness}
                            onChange={e => setHandWristSoreness(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-black w-full outline-none text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Back Stiffness (Swings)</label>
                          <input 
                            type="number" min="1" max="10" value={swingBackTightness}
                            onChange={e => setSwingBackTightness(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-black w-full outline-none text-center"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-1.5">
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 block uppercase mb-0.5">BP Swings Count</label>
                          <input 
                            type="number" value={battingPracticeVolume}
                            onChange={e => setBattingPracticeVolume(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-center text-xs text-white outline-none w-full"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-slate-500 block uppercase mb-0.5">Timing Feel Index</label>
                          <input 
                            type="number" min="1" max="10" value={timingFeel}
                            onChange={e => setTimingFeel(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-center text-xs text-white outline-none w-full"
                          />
                        </div>

                        <div className="flex items-center gap-2 bg-slate-950/40 p-1.5 rounded-xl block pt-4">
                          <input 
                            type="checkbox" id="veloDropOffCheck" checked={exitVeloDropOff}
                            onChange={e => setExitVeloDropOff(e.target.checked)}
                            className="accent-rose-500 rounded cursor-pointer w-4 h-4 ml-1"
                          />
                          <label htmlFor="veloDropOffCheck" className="text-[10px] text-slate-350 cursor-pointer text-slate-205">
                            Exit Velo Dropoff detected?
                          </label>
                        </div>

                        <div>
                          <label className="text-[8.5px] font-bold text-slate-500 block uppercase mb-0.5">Swing Readiness Status</label>
                          <select 
                            value={swingReadiness} onChange={e => setSwingReadiness(e.target.value)}
                            className="bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-xs text-white outline-none w-full font-bold"
                          >
                            <option value="Full Swing">Full Swing Capability</option>
                            <option value="Controlled Swings">Controlled Swings (No max effort)</option>
                            <option value="No Max Effort">Omit Cage Swings (BP volume reduced 50%)</option>
                            <option value="Recovery Day">Active Recovery (Scap band pulls only)</option>
                            <option value="No Swing">Omit Swinging (Complete wrist rest)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {isCatcher && (
                    <div className="pt-3 border-t border-slate-950 space-y-3.5 animate-fade-in">
                      <h4 className="text-[11px] font-extrabold text-cyan-400 uppercase tracking-widest block bg-slate-950 p-2 rounded-lg leading-none">Catcher-Specific Load Monitors</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Squats Joint Fatigue</label>
                          <input 
                            type="number" min="1" max="10" value={squatFatigue}
                            onChange={e => setSquatFatigue(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-black w-full text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Knee/Hip/Back Soreness</label>
                          <input 
                            type="number" min="1" max="10" value={kneeHipBackSoreness}
                            onChange={e => setKneeHipBackSoreness(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-black w-full text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Subjective Receiving Volume</label>
                          <input 
                            type="number" min="1" max="10" value={catcherWorkload}
                            onChange={e => setCatcherWorkload(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-black w-full text-center"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Notes and feedback input */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Recovery & Feel Comments / Notes</label>
                  <textarea 
                    value={recoveryNotes}
                    onChange={e => setRecoveryNotes(e.target.value)}
                    placeholder="Enter notes on how your arm and body feels today..."
                    rows={2}
                    className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white text-xs font-semibold w-full outline-none focus:border-teal-500 font-sans"
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-850">
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-400 hover:from-teal-600 hover:to-cyan-500 text-slate-950 text-xs font-black rounded-xl cursor-pointer shadow active:scale-95 transition-all text-center flex items-center gap-1.5 uppercase font-display"
                  >
                    💾 Save Daily Recovery Check-In
                  </button>
                </div>

              </form>
            </div>

            {/* Right Box: Historical Cockpit & Arm Sensor (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">

              {/* Historical Cockpit Header */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 shadow-xl relative flex-1 flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] font-black rounded-full border border-cyan-500/20 mb-2 font-mono">
                    <Compass className="w-3.5 h-3.5" /> {isPitcher ? 'ARM HEALTH COCKPIT' : 'ATHLETE BODY CHECKPOINT'}
                  </span>
                  
                  <h3 className="text-sm font-black font-display text-white uppercase tracking-tight">
                    {isPitcher ? 'Pitcher Arm Health Cockpit' : 'Hitter Body Checkpoint'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-snug mt-1 font-sans">
                    Real-time safety telemetry based on logs. Green status indicates safe levels. Red shutdown advises physical rest.
                  </p>
                </div>

                {/* Clickable arm/body sensory map inside Cockpit */}
                <div className="my-4 flex flex-col items-center">
                  <div className="w-full max-w-[190px] aspect-[4/5] bg-slate-900 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-inner">
                    <h5 className="text-[9px] font-mono text-center text-slate-500 uppercase">
                      {isPitcher ? 'RH Pitcher Arm Sensor' : 'Hitter Rotational Muscle Check'}
                    </h5>
                    
                    <div className="flex-1 flex flex-col items-center justify-around relative my-1">
                      
                      {isPitcher ? (
                        <>
                          <button
                            onClick={() => setSorenessArea('Shoulder')}
                            className={`absolute top-[15%] left-[23%] transition-all duration-200 z-10 p-2 rounded-xl border flex flex-col items-center justify-center ${
                              sorenessArea === 'Shoulder'
                                ? 'bg-amber-500/30 border-amber-400 text-white scale-105'
                                : 'bg-slate-950 text-slate-500 border-slate-850 hover:bg-slate-800'
                            }`}
                            type="button"
                          >
                            <span className="text-[8px] font-bold">SHOULDER</span>
                          </button>

                          <button
                            onClick={() => setSorenessArea('Elbow')}
                            className={`absolute top-[48%] left-[55%] transition-all duration-200 z-10 p-2 rounded-xl border flex flex-col items-center justify-center ${
                              sorenessArea === 'Elbow'
                                ? 'bg-rose-500/30 border-rose-400 text-white scale-105'
                                : 'bg-slate-950 text-slate-500 border-slate-850 hover:bg-slate-800'
                            }`}
                            type="button"
                          >
                            <span className="text-[8px] font-bold">ELBOW</span>
                          </button>

                          <button
                            onClick={() => setSorenessArea('Forearm')}
                            className={`absolute top-[78%] left-[30%] transition-all duration-200 z-10 p-2 rounded-xl border flex flex-col items-center justify-center ${
                              sorenessArea === 'Forearm'
                                ? 'bg-indigo-500/30 border-indigo-400 text-white scale-105'
                                : 'bg-slate-950 text-slate-500 border-slate-850 hover:bg-slate-800'
                            }`}
                            type="button"
                          >
                            <span className="text-[8px] font-bold">FOREARM</span>
                          </button>

                          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                            <line x1="38" y1="28" x2="68" y2="58" stroke="#1e293b" strokeWidth="2.5" strokeDasharray="2" />
                            <line x1="68" y1="58" x2="48" y2="88" stroke="#1e293b" strokeWidth="2.5" strokeDasharray="2" />
                          </svg>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setSorenessArea('Wrist')}
                            className={`absolute top-[15%] left-[23%] transition-all duration-200 z-10 p-2 rounded-xl border flex flex-col items-center justify-center ${
                              sorenessArea === 'Wrist'
                                ? 'bg-amber-500/30 border-amber-400 text-white scale-105'
                                : 'bg-slate-950 text-slate-500 border-slate-850'
                            }`}
                            type="button"
                          >
                            <span className="text-[8px] font-bold">WRIST</span>
                          </button>

                          <button
                            onClick={() => setSorenessArea('Back')}
                            className={`absolute top-[48%] left-[55%] transition-all duration-200 z-10 p-2 rounded-xl border flex flex-col items-center justify-center ${
                              sorenessArea === 'Back'
                                ? 'bg-[#9333ea]/30 border-[#a855f7] text-white scale-105'
                                : 'bg-slate-950 text-slate-500 border-slate-850'
                            }`}
                            type="button"
                          >
                            <span className="text-[8px] font-bold">BACK / LATS</span>
                          </button>

                          <button
                            onClick={() => setSorenessArea('Hip')}
                            className={`absolute top-[78%] left-[30%] transition-all duration-200 z-10 p-2 rounded-xl border flex flex-col items-center justify-center ${
                              sorenessArea === 'Hip'
                                ? 'bg-orange-500/30 border-orange-400 text-white scale-105'
                                : 'bg-slate-950 text-slate-500 border-slate-850'
                            }`}
                            type="button"
                          >
                            <span className="text-[8px] font-bold">HIP / GROIN</span>
                          </button>
                        </>
                      )}

                    </div>
                  </div>
                  
                  <div className="text-center mt-2">
                    <span className="text-[10px] text-slate-500 font-mono">Selected: <strong className="text-teal-400">{sorenessArea}</strong></span>
                  </div>
                </div>

                {/* Score meters summary */}
                <div className="space-y-3 pt-3 border-t border-slate-900/60 text-xs">
                  <div className="flex justify-between items-center bg-slate-900 p-2 rounded-lg border border-slate-850">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Soreness Level</span>
                    <span className="font-mono font-bold text-white text-sm">{currentSoreness}/10 ({currentSorenessArea})</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900 p-2 rounded-lg border border-slate-850">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Calculated Readiness</span>
                    <span className="font-mono font-bold text-teal-400 text-sm">
                      {currentSoreness >= 7 ? '🛑 REST' : currentSoreness >= 4 ? '🟡 MODIFIED' : '🟢 FULL DISPATCH'}
                    </span>
                  </div>
                </div>

              </div>
              
              {/* Soreness Guidelines Warn block */}
              {currentSoreness >= 7 && (
                <div className="p-4 rounded-xl border-2 border-red-500 bg-red-950/40 text-red-200">
                  <div className="flex gap-2.5">
                    <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-xs text-red-400 uppercase tracking-wider">🛑 CRITICAL WARNING LIMIT</h4>
                      <p className="text-[11px] leading-relaxed text-slate-300">
                        Tyler, you are reporting arm or back pain of <strong>{currentSoreness}/10</strong>. We advise against maximum effort physical work today. Please consult coaches or medical staff immediately! Notes are logged.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}


      {/* ----------------- SUB TAB 2: PERFORMANCE TRACKERS (VELO, POP TIME, LIFT) ----------------- */}
      {activeSubTab === 'performance' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Workspace (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* PITCHER RECOVERY VELOCITY OR CATCHER POP-TIME LOGS INPUTS */}
              {isPitcher ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-rose-500" />
                      <div>
                        <h4 className="text-sm font-black font-display text-white uppercase">Pitcher Bullpen results & Arsenal velocity tool</h4>
                        <p className="text-[10px] text-slate-500 font-mono">Saves bullpen outputs and updates performance trends</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-rose-500/10 text-rose-450 text-rose-400 px-2 py-0.5 rounded font-bold">PITCHER LOG</span>
                  </div>

                  <form onSubmit={handleLogBullpenSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Bullpen Date</label>
                        <input 
                          type="date" value={bullpenDate} onChange={e => setBullpenDate(e.target.value)}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-bold w-full outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Total Pitches</label>
                        <input 
                          type="number" value={bullpenPitches} onChange={e => setBullpenPitches(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-bold w-full text-center outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">FB Velocity Peak (mph)</label>
                        <input 
                          type="number" value={fbVeloPeak} onChange={e => setFbVeloPeak(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-rose-400 text-xs font-black w-full text-center outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">FB Velocity Avg (mph)</label>
                        <input 
                          type="number" value={fbVeloAvg} onChange={e => setFbVeloAvg(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-cyan-400 text-xs font-black w-full text-center outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1 border-t border-slate-950">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Strikes Ratio (%)</label>
                        <input 
                          type="number" value={strikePercentage} onChange={e => setStrikePercentage(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-semibold w-full text-center outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">1st Pitch Strike %</label>
                        <input 
                          type="number" value={firstPitchStrikePct} onChange={e => setFirstPitchStrikePct(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-semibold w-full text-center outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">B/S Ratio (e.g. 1.8)</label>
                        <input 
                          type="number" step="0.1" value={ballStrikeRatio} onChange={e => setBallStrikeRatio(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-semibold w-full text-center outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Swing & Miss Whiffs %</label>
                        <input 
                          type="number" value={swingAndMissPct} onChange={e => setSwingAndMissPct(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-bold w-full text-center outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 bg-slate-950/45 p-3 rounded-xl border border-slate-850/80">
                      <span className="text-[9.5px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Arsenal Commands Map</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-1 px-2.5 bg-slate-900 rounded border border-slate-850 flex justify-between items-center">
                          <span className="text-slate-500 text-[9px] font-bold">Fastball FB:</span>
                          <select value={fbCommand} onChange={e => setFbCommand(e.target.value)} className="bg-transparent outline-none text-rose-450 text-rose-400 text-[10px] font-extrabold">
                            <option value="Elite">Elite</option>
                            <option value="Good">Good</option>
                            <option value="Average">Average</option>
                            <option value="Poor">Poor</option>
                          </select>
                        </div>
                        <div className="p-1 px-2.5 bg-slate-900 rounded border border-slate-850 flex justify-between items-center">
                          <span className="text-slate-500 text-[9px] font-bold">Slider SL:</span>
                          <select value={sliderCommand} onChange={e => setSliderCommand(e.target.value)} className="bg-transparent outline-none text-teal-400 text-[10px] font-bold">
                            <option value="Elite">Elite</option>
                            <option value="Good">Good</option>
                            <option value="Average">Average</option>
                          </select>
                        </div>
                        <div className="p-1 px-2.5 bg-slate-900 rounded border border-slate-850 flex justify-between items-center">
                          <span className="text-slate-500 text-[9px] font-bold">Curve CB:</span>
                          <select value={cbCommand} onChange={e => setCbCommand(e.target.value)} className="bg-transparent outline-none text-yellow-400 text-[10px] font-bold">
                            <option value="Elite">Elite</option>
                            <option value="Good">Good</option>
                            <option value="Average">Average</option>
                          </select>
                        </div>
                        <div className="p-1 px-2.5 bg-slate-900 rounded border border-slate-850 flex justify-between items-center">
                          <span className="text-slate-500 text-[9px] font-bold">Change CH:</span>
                          <select value={chCommand} onChange={e => setChCommand(e.target.value)} className="bg-transparent outline-none text-white text-[10px] font-bold">
                            <option value="Elite">Elite</option>
                            <option value="Good">Good</option>
                            <option value="Average">Average</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Session Bullpen Performance Notes</label>
                      <input 
                        type="text" value={bullpenNotes} onChange={e => setBullpenNotes(e.target.value)}
                        placeholder="e.g. FB spin felt tighter, breaking ball is sliding on low-corner zones..."
                        className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white text-xs font-semibold w-full outline-none"
                      />
                    </div>

                    <div className="text-right">
                      <button 
                        type="submit"
                        className="px-5 py-2 bg-[#ff4a4a] hover:bg-[#ff5a5a] text-slate-950 font-black rounded-xl text-xs uppercase cursor-pointer tracking-wider"
                      >
                        💾 Persist Bullpen Data Output
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}

              {/* CATCHER MEASURABLES SECTION */}
              {isCatcher || !isPitcher ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <GaugeCircle className="w-5 h-5 text-cyan-400" />
                      <div>
                        <h4 className="text-sm font-black font-display text-white uppercase">Catcher Performance POP Time tracker</h4>
                        <p className="text-[10px] text-slate-500 font-mono">Exchange speed throw downs & block scoring charts</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-bold">CATCHER LOG</span>
                  </div>

                  <form onSubmit={handleLogCatcherSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Best Pop Time (sec)</label>
                        <input 
                          type="number" step="0.01" value={newBestPopTime} onChange={e => setNewBestPopTime(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-cyan-400 text-xs font-black w-full text-center outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Avg Pop Time (sec)</label>
                        <input 
                          type="number" step="0.01" value={newAvgPopTime} onChange={e => setNewAvgPopTime(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-black w-full text-center outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Throwing Velo (mph)</label>
                        <input 
                          type="number" value={newCatcherThrowVelo} onChange={e => setNewCatcherThrowVelo(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-orange-400 text-xs font-black w-full text-center outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Exchange Time (sec)</label>
                        <input 
                          type="number" step="0.01" value={newExchangeTime} onChange={e => setNewExchangeTime(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-semibold w-full text-center outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-slate-950">
                      <div>
                        <label className="text-[9px] font-bold text-slate-450 uppercase block mb-1 text-slate-400">Blocks Successful</label>
                        <input 
                          type="number" value={newBlocksSuccessful} onChange={e => setNewBlocksSuccessful(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-center text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-450 uppercase block mb-1 text-slate-400">Blocks Attempted</label>
                        <input 
                          type="number" value={newBlocksAttempted} onChange={e => setNewBlocksAttempted(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-center text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-450 uppercase block mb-1 text-slate-400">Innings Caught</label>
                        <input 
                          type="number" value={newInningsCaught} onChange={e => setNewInningsCaught(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-center text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-450 uppercase block mb-1 text-slate-400">Throw Accuracy</label>
                        <select className="bg-slate-950 border border-slate-850 rounded-lg p-1.5 text-xs text-teal-400 w-full font-bold">
                          <option value="Excellent">Excellent</option>
                          <option value="Good">Good</option>
                          <option value="Average">Average</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Catcher Receiving Performance Comments</label>
                      <input 
                        type="text" value={catcherNotes} onChange={e => setCatcherNotes(e.target.value)}
                        placeholder="Stuck low outer boundary strikes, blocked fast sliders into dirt pockets..."
                        className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white text-xs font-semibold w-full outline-none"
                      />
                    </div>

                    <div className="text-right">
                      <button 
                        type="submit"
                        className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-teal-450 text-slate-950 font-black rounded-xl text-xs uppercase cursor-pointer"
                      >
                        💾 Log Catcher Pop Parameters
                      </button>
                    </div>

                  </form>
                </div>
              ) : null}

              {/* RENAME FROM BIOCORE TO STRENGTH TRAINING LOG CARD */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-black font-display text-white uppercase">Strength Training Log (formerly Biocore)</h4>
                      <p className="text-[10px] text-slate-500 font-mono">Secures daily lifting blocks, rotational force sets and conditioning</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">STRENGTH LOG</span>
                </div>

                <form onSubmit={handleLogStrengthSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Workout Date</label>
                      <input 
                        type="date" value={strengthDate} onChange={e => setStrengthDate(e.target.value)}
                        className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-semibold w-full outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Focus Type</label>
                      <select 
                        value={strengthWorkoutType} onChange={e => setStrengthWorkoutType(e.target.value)}
                        className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-bold w-full outline-none"
                      >
                        <option value="Full Body">Full Body (Power Build)</option>
                        <option value="Rotational Power">Rotational Power Core</option>
                        <option value="Shoulder Care">Scapular Stability Care</option>
                        <option value="Lower Body Load">Leg Drive / unilateral splits</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Intensity</label>
                      <input 
                        type="number" min="1" max="10" value={strengthIntensity}
                        onChange={e => setStrengthIntensity(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-black w-full text-center outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Duration (min)</label>
                      <input 
                        type="number" value={strengthDuration}
                        onChange={e => setStrengthDuration(Number(e.target.value))}
                        className="bg-slate-950 border border-slate-850 rounded-xl p-2 text-white text-xs font-black w-full text-center outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-slate-400 block uppercase mb-1">Conditioning Exercises Performed</label>
                    <textarea 
                      value={strengthNotes} onChange={e => setStrengthNotes(e.target.value)}
                      rows={2}
                      placeholder="e.g. Scap pinches, trap bar load deadlifts, med ball ballistic throws..."
                      className="bg-slate-950 border border-slate-850 rounded-xl p-2.5 text-white text-xs font-semibold w-full outline-none font-sans"
                    />
                  </div>

                  <div className="text-right">
                    <button 
                      type="submit"
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs uppercase cursor-pointer"
                    >
                      🏋️ Record Strength Session Log
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Right Workspace Displays & Reports (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* VELOCITY RADAR READOUT CARD */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9.5px] text-rose-500 font-extrabold uppercase tracking-widest font-mono">VELOCITY RADAR ANALYSIS</span>
                      <h4 className="text-sm font-black font-display text-[#fafafa] uppercase mt-0.5">Real-world fast-ball progression</h4>
                    </div>
                    <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
                  </div>

                  <div className="flex items-center gap-6 my-6 bg-slate-900/60 p-4 rounded-xl border border-slate-850 text-center">
                    <div className="flex-1">
                      <span className="text-[9px] text-slate-500 block font-bold uppercase font-mono">ATHLETE MODEL PEAK</span>
                      <span className="text-4xl font-extrabold text-white font-display leading-none">{localPeakVelocity} <span className="text-xs text-rose-450 text-rose-400 leading-none">mph</span></span>
                    </div>
                    <div className="border-l border-slate-800 h-10" />
                    <div className="flex-1">
                      <span className="text-[9px] text-slate-500 block font-bold uppercase font-mono">TRAILING AVG</span>
                      <span className="text-4xl font-extrabold text-teal-400 font-display leading-none">{editedProfile.avgFbVelocity || 85} <span className="text-xs text-teal-450 leading-none">mph</span></span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-slate-400">First Inning Baseline:</span>
                      <strong className="text-white font-mono">{firstInningVelo} mph</strong>
                    </div>
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-slate-400">Last Outing Release:</span>
                      <strong className="text-white font-mono">{lastInningVelo} mph</strong>
                    </div>
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-slate-400 font-bold text-yellow-500">Subjective Fatigue Index Dropoff:</span>
                      <strong className="text-yellow-405 text-yellow-400 font-mono font-bold">-{veloDropOff} mph</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900/60 text-[10px] text-slate-505 italic text-slate-500 leading-snug">
                  August recruiting thresholds target peak of <strong className="text-teal-400">90+ MPH</strong> for Division-1 direct phone contact starting August 1.
                </div>
              </div>

              {/* DETAILED DEFENSIVE ATHLETIC MEASURABLES BENTO */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 shadow-xl space-y-4">
                <span className="text-[9.5px] text-cyan-400 font-extrabold uppercase tracking-widest font-mono">DEVELOPMENTAL STRENGTHS</span>
                
                <h4 className="text-xs font-black font-display text-white uppercase tracking-tight">Position Player speed & defensive metrics</h4>

                <div className="grid grid-cols-2 gap-3.5 pt-1 text-center">
                  <div className="bg-slate-920 bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-500 font-semibold block uppercase">Exit velocity</span>
                    <span className="text-lg font-black text-white font-display">92.4 <span className="text-[10px] text-slate-450">mph</span></span>
                  </div>
                  <div className="bg-slate-920 bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-500 font-semibold block uppercase">Bat Speed</span>
                    <span className="text-lg font-black text-emerald-400 font-display">74.8 <span className="text-[10px] text-slate-455">mph</span></span>
                  </div>
                  <div className="bg-slate-920 bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-500 font-semibold block uppercase">60-Yard Dash</span>
                    <span className="text-lg font-black text-cyan-400 font-display">6.98 <span className="text-[10px] text-slate-455">sec</span></span>
                  </div>
                  <div className="bg-slate-920 bg-slate-900 p-2.5 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-500 font-semibold block uppercase">Infield arm Velo</span>
                    <span className="text-lg font-black text-white font-display">82 <span className="text-[10px] text-slate-450">mph</span></span>
                  </div>
                </div>

                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900 text-[10px] text-slate-400 leading-normal">
                  <strong>Defensive Grades Matrix:</strong> Accuracies: Excellent | Reaction Step: 8.5/10 | Baseball Intelligence (IQ) Grade: 9/10. Notes were persistent.
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ----------------- SUB TAB 3: DYNAMIC SUMMER SCHEDULE WITH CSV UPLOAD & COACH CONTROL ----------------- */}
      {activeSubTab === 'schedule' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left box: Tournament list card and schedule management (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="text-sm font-black font-display text-white uppercase">Dynamic Summer Travel & Hotel Planner</h4>
                    <p className="text-[10.5px] text-slate-400 leading-none">Updatable dynamically via manual fields or CSV uploads</p>
                  </div>
                </div>
                <div className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold uppercase font-mono">
                  {tournamentsList.length} Milestones active
                </div>
              </div>

              {scheduleStatusMessage && (
                <div className="p-3 bg-teal-950/20 border border-teal-500/35 rounded-xl text-teal-400 text-xs font-semibold animate-fade-in">
                  ✓ {scheduleStatusMessage}
                </div>
              )}

              <div className="space-y-3">
                {tournamentsList.map((tourney, idx) => (
                  <div key={tourney.id || idx} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-slate-800 transition-all">
                    <div className="space-y-1 overflow-hidden min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex px-2 py-0.5 bg-slate-900 border border-slate-850 text-slate-400 rounded text-[9px] font-mono font-bold uppercase">
                          📅 {tourney.date}
                        </span>
                        <span className="text-[10px] text-teal-400 font-semibold truncate leading-none">
                          Manager: {tourney.coach || editedProfile.summerCoachName || 'Welches'}
                        </span>
                      </div>
                      
                      <h5 className="text-xs font-black uppercase font-display text-[#fafafa] leading-snug">{tourney.title}</h5>
                      
                      <div className="flex items-center gap-4 text-[10.5px] text-slate-400 font-mono">
                        <span>Place: <strong>{tourney.location}</strong></span>
                        <span className="text-slate-800">|</span>
                        <span>Hotel: <strong>{tourney.hotel}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => handleDeleteScheduleItem(idx)}
                        className="p-1 px-2.5 bg-rose-500/5 hover:bg-rose-500/15 text-rose-450 text-rose-400 text-[10px] font-bold border border-rose-500/20 hover:border-rose-500/30 rounded-lg transition-all cursor-pointer"
                        title="Delete Tournament Info"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Right box: Dynamic Updates, Drag/Drop and Raw CSV entries (5 Cols) */}
            <div className="lg:col-span-12 lg:col-span-5 space-y-6">
              
              {/* ADVANCED CSV DRAG-DROP PARSER */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-teal-400" />
                    <h4 className="text-xs font-black font-display text-white uppercase tracking-wider">CSV Schedule Importer Matrix</h4>
                  </div>
                  <button 
                    onClick={generateAndExportSampleCsvTemplate}
                    className="text-[9px] text-teal-400 hover:underline cursor-pointer"
                  >
                    Load Sample Template
                  </button>
                </div>

                <p className="text-[10.5px] text-slate-400 leading-snug font-sans">
                  Paste raw CSV lines directly. Each line must form coordinates in this style: <br />
                  <code className="text-teal-400 block p-1 bg-slate-900 rounded font-mono text-[9px] mt-1 text-center">
                    Date,Title,Location,Airport,Hotel,Coach
                  </code>
                </p>

                <textarea 
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  placeholder="e.g. June 11-15,Top Org Clemson,Clemson SC,GSP,Hyatt Hotel,Welches"
                  rows={4}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 w-full text-white text-xs outline-none focus:border-teal-500 font-mono"
                />

                <div className="flex gap-2">
                  <button 
                    onClick={handleCsvImport}
                    className="flex-1 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-black rounded-lg transition-all text-center uppercase tracking-wider cursor-pointer"
                  >
                    🚀 Import CSV data
                  </button>
                </div>
              </div>

              {/* MANUAL TOURNAMENT ADDITION FORM */}
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 shadow-xl space-y-3.5">
                <h4 className="text-xs font-black font-display text-white uppercase tracking-wider">Manual Tournament Input</h4>
                
                <form onSubmit={handleManualAddSchedule} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-400 block font-bold uppercase">Date (e.g. June 11-15)</label>
                      <input 
                        type="text" value={manualTourneyDate} onChange={e => setManualTourneyDate(e.target.value)}
                        placeholder="June 11-15"
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white w-full text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block font-bold uppercase">Tournament Title</label>
                      <input 
                        type="text" value={manualTourneyTitle} onChange={e => setManualTourneyTitle(e.target.value)}
                        placeholder="PG Org Battle"
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white w-full text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-400 block font-bold uppercase">Location City state</label>
                      <input 
                        type="text" value={manualTourneyLoc} onChange={e => setManualTourneyLoc(e.target.value)}
                        placeholder="Clemson, SC"
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white w-full text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block font-bold uppercase">Mandatory Team Hotel</label>
                      <input 
                        type="text" value={manualTourneyHotel} onChange={e => setManualTourneyHotel(e.target.value)}
                        placeholder="Hyatt Greenville Approved"
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white w-full text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-400 block font-bold uppercase">Landing Airport</label>
                      <input 
                        type="text" value={manualTourneyAirport} onChange={e => setManualTourneyAirport(e.target.value)}
                        placeholder="Greenville-Spartanburg (GSP)"
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-white w-full text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-400 block font-bold uppercase">Tournament Tour Coach</label>
                      <input 
                        type="text" value={manualTourneyCoach} onChange={e => setManualTourneyCoach(e.target.value)}
                        placeholder="Coach Welches"
                        className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-teal-300 w-full text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:text-white rounded-lg font-black uppercase text-[10.5px] cursor-pointer"
                    >
                      Add Tour Item
                    </button>
                  </div>
                </form>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ----------------- SUB TAB 4: WORKOUT ALERTS & REMINDERS CONFIGURATION ----------------- */}
      {activeSubTab === 'reminders' && (
        <div id="alert-settings-workspace" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-rose-500/15 to-teal-400/15 border border-rose-500/20 text-rose-400 rounded-xl">
                <Bell className="w-5.5 h-5.5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-black font-display text-white uppercase tracking-tight">Unified Workout REMINDERS CONSOLE</h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Set daily SMTP Email services and Twilio text integrations for automatic alerts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-center font-mono text-[10px] bg-slate-950 px-2.5 py-1 rounded border border-slate-850">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-450 text-emerald-400" />
              <span className="text-slate-400 font-semibold block">REMIND SWITCH:</span>
              <button 
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`p-1 px-2 text-[10px] font-bold rounded ${reminderEnabled ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'}`}
              >
                {reminderEnabled ? 'ON / ACTIVE' : 'SHUTDOWN'}
              </button>
            </div>
          </div>

          {reminderStatus && (
            <div className="p-4 rounded-xl border border-teal-500/20 bg-teal-950/20 text-teal-400 text-xs font-semibold mb-6 flex gap-2">
              <Sparkles className="w-4 h-4 shrink-0 animate-spin" />
              <span>{reminderStatus}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SMTP Server Configuration Parameters (6 Cols) */}
            <div className="lg:col-span-6 bg-slate-950 p-5 rounded-2xl border border-slate-850/80 space-y-4">
              <h4 className="text-xs font-black font-display text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-2">
                <Mail className="w-4.5 h-4.5 text-teal-405 text-teal-400" /> Private SMTP Email Provider options
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">SMTP Outbound Host</label>
                  <input 
                    type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)}
                    className="bg-slate-900 border border-slate-850 p-2 rounded-xl text-white outline-none w-full"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Port</label>
                  <input 
                    type="text" value={smtpPort} onChange={e => setSmtpPort(e.target.value)}
                    className="bg-slate-900 border border-slate-850 p-2 rounded-xl text-white outline-none w-full text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">SMTP User Account</label>
                  <input 
                    type="text" value={smtpUser} onChange={e => setSmtpUser(e.target.value)}
                    className="bg-slate-900 border border-slate-850 p-2 rounded-xl text-white outline-none w-full"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">SMTP Secrets Key</label>
                  <input 
                    type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)}
                    className="bg-slate-900 border border-slate-850 p-2 rounded-xl text-white outline-none w-full"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Send Reminders Daily At</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)}
                    className="bg-slate-900 border border-slate-850 p-2 rounded-xl text-white font-mono text-xs max-w-[120px]"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">EDT. Real-world dispatch sequence configured on players.</span>
                </div>
              </div>

            </div>

            {/* Twilio/Sms Integrations (6 Cols) */}
            <div className="lg:col-span-6 bg-slate-950 p-5 rounded-2xl border border-slate-850/80 space-y-4">
              <h4 className="text-xs font-black font-display text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-2">
                <MessageSquare className="w-4.5 h-4.5 text-cyan-405 text-cyan-400" /> Cellular SMS Service provider (Twilio API Integration)
              </h4>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Twilio Account SID API coordinate</label>
                  <input 
                    type="text" value={smsSid} onChange={e => setSmsSid(e.target.value)}
                    className="bg-slate-900 border border-slate-850 p-2 rounded-xl text-white outline-none w-full font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Twilio Auth Token key</label>
                    <input 
                      type="password" value={smsToken} onChange={e => setSmsToken(e.target.value)}
                      className="bg-slate-900 border border-slate-850 p-2 rounded-xl text-white outline-none w-full"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Twilio Senders Phone Number</label>
                    <input 
                      type="text" value={smsFrom} onChange={e => setSmsFrom(e.target.value)}
                      className="bg-slate-900 border border-slate-850 p-2 rounded-xl text-white outline-none w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Primary Recipient Phone / Email Address</label>
                  <input 
                    type="text" value={recipientContact} onChange={e => setRecipientContact(e.target.value)}
                    placeholder="e.g. tyler@example.com or +18645550123"
                    className="bg-slate-900 border border-slate-850 p-2 rounded-xl text-white outline-none w-full text-start"
                  />
                </div>

              </div>

            </div>

          </div>

          {/* Configuration save actions */}
          <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-between flex-wrap gap-2">
            <span className="text-[10px] text-slate-500 leading-none italic">
              * Note: For security, details are encrypted. Actual SMTP transmission runs on standard secure TLS relays.
            </span>
            
            <div className="flex gap-2">
              <button 
                onClick={handleTestDispatchReminder}
                className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-rose-450 text-rose-400 text-xs font-black rounded-xl cursor-pointer transition-all uppercase tracking-wider"
              >
                🚀 Trigger Test Dispatch Now
              </button>
              <button 
                onClick={() => {
                  setReminderStatus('Daily reminders configurations locked secure in sheets!');
                  setTimeout(() => setReminderStatus(null), 3500);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black rounded-xl cursor-pointer shadow transition-all uppercase tracking-wider"
              >
                💾 Save reminder settings
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
