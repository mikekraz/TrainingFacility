import { useState, useEffect } from 'react';
import { DailyLog, AthleteProfile, CoachPlan, ScheduleEvent } from './types';
import AthleteCard from './components/AthleteCard';
import WorkloadMeter from './components/WorkloadMeter';
import LogForm from './components/LogForm';
import RecentLogs from './components/RecentLogs';
import AirtableExporter from './components/AirtableExporter';
import MarkdownRenderer from './components/MarkdownRenderer';
import GoogleSheetsConfig from './components/GoogleSheetsConfig';
import ScheduleTab from './components/ScheduleTab';
import DrivelineSchedule from './components/DrivelineSchedule';
import WorkoutReminders from './components/WorkoutReminders';
import AthletePage from './components/AthletePage';
import WorkloadCalendar from './components/WorkloadCalendar';
import CoachDashboard from './components/CoachDashboard';
import VelocityChart from './components/VelocityChart';
import WordPressPortal from './components/WordPressPortal';
import FacilityConsole from './components/FacilityConsole';
import { getAccessToken, googleSignIn, logout as authLogout, initAuth } from './lib/firebaseAuth';
import { Sparkles, Calendar, RefreshCw, AlertTriangle, ShieldCheck, FileSpreadsheet, Settings, Trophy, Compass, ShieldAlert, LogIn, LogOut, UserCheck, Layers } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<AthleteProfile>({
    name: "Tyler Krasner",
    position: "RHP (Pitcher Only)",
    height: "6'3\"",
    weight: "190 lbs",
    avgFbVelocity: 85,
    peakFbVelocity: 89,
    summerTeam: "Canes National 16U",
    goal: "Stay healthy and available through summer recruiting tournaments, maintain 85-89 mph, and build toward 87-89 mph average / 90-91+ mph peak by October junior events.",
    recruitingContext: "College search focuses on high Academic D1/D3 baseball. coaches contact block starts August 1st."
  });

  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [calendarCsvLine, setCalendarCsvLine] = useState<string>('');
  const [selectedSorenessArea, setSelectedSorenessArea] = useState<string>('None');
  const [loading, setLoading] = useState(true);
  const [assignedWorkouts, setAssignedWorkouts] = useState<any[]>([]);

  // Sheets Auth states
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);

  // Active Tab state: 'dashboard' | 'schedule' | 'googlesheets' | 'coaches_dashboard' | 'wordpress' | 'facilities' | 'athlete_view'
  const [activeTab, setActiveTab ] = useState<'dashboard' | 'schedule' | 'googlesheets' | 'coaches_dashboard' | 'wordpress' | 'facilities' | 'athlete_view'>('athlete_view');

  // Dynamic Multi-User authentication states
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserPhoto, setCurrentUserPhoto] = useState<string | null>(null);
  const [coachesList, setCoachesList] = useState<string[]>(["michael@fusiontechdesign.com"]);
  const [coachOverride, setCoachOverride] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('2026-05-30'); // System static context date

  // Multi-Tenant facilities states
  const [facilities, setFacilities] = useState<Record<string, any>>({});
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(localStorage.getItem('pitched_facility_tenant_id') || 'velocity-prime');
  const [activeFacilityId, setActiveFacilityId] = useState<string>('velocity-prime');

  // Coach Plan States
  const [coachPlan, setCoachPlan] = useState<CoachPlan | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // Temporary local values for coach calculation inputs
  const [userSoreness, setUserSoreness] = useState(1);
  const [userFatigue, setUserFatigue] = useState(2);
  const [coachInputNotes, setCoachInputNotes] = useState('');
  const [inTournament, setInTournament] = useState(false);

  // Sync sliders to selected soreness area
  useEffect(() => {
    const recoveryLogs = logs.filter(l => l.logType === 'recovery');
    if (recoveryLogs.length > 0) {
      const latest = recoveryLogs[0] as any;
      setUserSoreness(latest.sorenessLevel || 1);
      setUserFatigue(latest.fatigueLevel || 2);
      setSelectedSorenessArea(latest.sorenessArea || 'None');
    }
  }, [logs]);

  // Accent helper for dynamic whitelabel CSS class injection mapping
  const getAccentClass = (type: 'bg' | 'text' | 'border' | 'hoverBg' | 'focusRing' | 'badge' | 'fromGradient' | 'toGradient') => {
    const activeFac = facilities[selectedFacilityId] || { accentColor: 'teal' };
    const color = activeFac.accentColor || 'teal';
    const mapping: Record<string, Record<string, string>> = {
      teal: {
        bg: 'bg-teal-600',
        text: 'text-teal-400',
        border: 'border-teal-500/20',
        hoverBg: 'hover:bg-teal-700',
        focusRing: 'focus:ring-teal-500',
        badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
        fromGradient: 'from-teal-600',
        toGradient: 'to-teal-950'
      },
      indigo: {
        bg: 'bg-indigo-600',
        text: 'text-indigo-400',
        border: 'border-indigo-500/20',
        hoverBg: 'hover:bg-indigo-700',
        focusRing: 'focus:ring-indigo-500',
        badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        fromGradient: 'from-indigo-600',
        toGradient: 'to-indigo-950'
      },
      rose: {
        bg: 'bg-rose-600',
        text: 'text-rose-400',
        border: 'border-rose-500/20',
        hoverBg: 'hover:bg-rose-700',
        focusRing: 'focus:ring-rose-500',
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        fromGradient: 'from-rose-600',
        toGradient: 'to-rose-950'
      },
      amber: {
        bg: 'bg-amber-600',
        text: 'text-amber-400',
        border: 'border-amber-500/20',
        hoverBg: 'hover:bg-amber-700',
        focusRing: 'focus:ring-amber-500',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        fromGradient: 'from-amber-600',
        toGradient: 'to-amber-950'
      }
    };
    return mapping[color]?.[type] || mapping['teal'][type];
  };

  // Auth helper headers for Express player isolation
  const getHeaders = (emailOverride?: string, facilityOverride?: string) => {
    const customHeaders: any = { 'Content-Type': 'application/json' };
    const emailToUse = emailOverride || currentUserEmail;
    if (emailToUse) {
      customHeaders['x-user-email'] = emailToUse;
    }
    if (currentUserName) {
      customHeaders['x-user-name'] = currentUserName;
    }
    customHeaders['x-facility-id'] = facilityOverride || selectedFacilityId;
    return customHeaders;
  };

  // Switch Facility event
  const handleSwitchFacility = async (id: string) => {
    localStorage.setItem('pitched_facility_tenant_id', id);
    setSelectedFacilityId(id);
    setActiveFacilityId(id);
    await loadData(currentUserEmail || undefined, id);
  };

  // Update branding properties
  const handleUpdateFacility = async (id: string, updated: any) => {
    try {
      const resp = await fetch(`/api/facilities/${id}`, {
        method: 'POST',
        headers: getHeaders(currentUserEmail || undefined, id),
        body: JSON.stringify(updated)
      });
      if (resp.ok) {
        const payload = await resp.json();
        if (payload.facilities) {
          setFacilities(payload.facilities);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create new white-labeled facility branding presets
  const handleCreateFacility = async (newFac: any) => {
    try {
      const resp = await fetch('/api/facilities', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newFac)
      });
      if (resp.ok) {
        const payload = await resp.json();
        if (payload.facilities) {
          setFacilities(payload.facilities);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Enroll demo athletes under isolated facility database
  const handleRegisterDemoPlayer = async (email: string, name: string, trainer?: string) => {
    try {
      const resp = await fetch('/api/player/change-facility', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, facilityId: selectedFacilityId, name, assignedTrainer: trainer })
      });
      if (resp.ok) {
        const payload = await resp.json();
        if (payload.facilities) {
          setFacilities(payload.facilities);
        }
        await loadData(email, selectedFacilityId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load profile, logs, schedule, and CSV calendar
  const loadData = async (emailOverride?: string, facilityOverride?: string) => {
    setLoading(true);
    try {
      const token = await getAccessToken();
      const storedSpreadsheetId = spreadsheetId || localStorage.getItem('tyler_pitcher_spreadsheet_id');

      const activeEmail = emailOverride || currentUserEmail;
      const activeFac = facilityOverride || selectedFacilityId;
      const customHeaders = getHeaders(activeEmail, activeFac);

      if (token && storedSpreadsheetId) {
        setSpreadsheetId(storedSpreadsheetId);
        const { fetchSpreadsheetDb } = await import('./lib/sheetsService');
        const db = await fetchSpreadsheetDb(token, storedSpreadsheetId);
        
        setProfile(db.profile);
        setLogs(db.logs);
        setSchedule(db.schedule);
        setCalendarCsvLine(db.calendarCsvLine);
      } else {
        // Fallback local Express fullstack server database with isolated player context
        const resp = await fetch('/api/data', {
          headers: customHeaders
        });
        if (resp.ok) {
          const payload = await resp.json();
          setProfile(payload.profile);
          setLogs(payload.logs || []);
          setSchedule(payload.schedule || []);
          setCalendarCsvLine(payload.calendarCsv || "2026-05-30:Canes Doubleheader Game 1,2026-06-03:Mid-Week Scrimmage");
          setAssignedWorkouts(payload.assignedWorkouts || []);
          if (payload.facilities) {
            setFacilities(payload.facilities);
          }
          if (payload.activeFacilityId) {
            setActiveFacilityId(payload.activeFacilityId);
          }
        }
      }
    } catch (e) {
      console.error("Database loading failed, shifting to local fallback mode.", e);
    } finally {
      setLoading(false);
    }
  };

  // Auth setup and metadata loaders on mount
  useEffect(() => {
    initAuth(
      (user: any) => {
        setCurrentUserEmail(user.email);
        setCurrentUserName(user.displayName);
        setCurrentUserPhoto(user.photoURL);
        loadData(user.email);
      },
      () => {
        setCurrentUserEmail(null);
        setCurrentUserName(null);
        setCurrentUserPhoto(null);
        loadData();
      }
    );

    // Load coach roster emails list
    fetch('/api/coaches')
      .then(res => res.json())
      .then(data => {
        if (data.coaches) {
          setCoachesList(data.coaches);
        }
      })
      .catch(err => console.error(err));
  }, [spreadsheetId]);

  // Sync state loaded directly from google sheets configs
  const handleSyncComplete = (dbData: any) => {
    setProfile(dbData.profile);
    setLogs(dbData.logs);
    setSchedule(dbData.schedule);
    setCalendarCsvLine(dbData.calendarCsvLine);
  };

  // Update AI advice based on current sliders
  const generateNewPlan = async () => {
    setGeneratingPlan(true);
    try {
      const todayString = "2026-05-30"; // Synchronize with dynamic selection
      const resp = await fetch('/api/coach', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          todayDate: todayString,
          soreness: userSoreness,
          sorenessArea: selectedSorenessArea,
          fatigue: userFatigue,
          notes: coachInputNotes,
          inTournament
        })
      });
      if (resp.ok) {
        const payload = await resp.json();
        setCoachPlan(payload);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingPlan(false);
    }
  };

  // Automatically trigger baseline plan calculation on startup or once logs finish fetching
  useEffect(() => {
    if (logs.length > 0 && !coachPlan && !generatingPlan) {
      generateNewPlan();
    }
  }, [logs]);

  // Athlete Profile updates
  const handleUpdateProfile = async (updated: Partial<AthleteProfile>) => {
    const nextProfile = { ...profile, ...updated };
    setProfile(nextProfile);
    try {
      const token = await getAccessToken();
      if (token && spreadsheetId) {
        const { updateProfileInSheet } = await import('./lib/sheetsService');
        await updateProfileInSheet(token, spreadsheetId, nextProfile);
      } else {
        const resp = await fetch('/api/profile', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(updated)
        });
        if (resp.ok) {
          const data = await resp.json();
          setProfile(data.profile);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Append a recovery, throwing or strength training log
  const handleAddLog = async (logData: Omit<DailyLog, 'id' | 'date'>, customDate?: string) => {
    try {
      const token = await getAccessToken();
      const todayString = customDate || "2026-05-30";
      
      if (token && spreadsheetId) {
        const { appendRow } = await import('./lib/sheetsService');
        const logId = (logData as any).logType + '-' + Date.now();
        let rowValues: any[] = [];
        
        if ((logData as any).logType === 'recovery') {
          const rec = logData as any;
          rowValues = [logId, todayString, rec.sorenessLevel, rec.sorenessArea, rec.fatigueLevel, rec.sleepQuality, rec.notes];
          await appendRow(token, spreadsheetId, 'Recovery', rowValues);
        } else if ((logData as any).logType === 'throwing') {
          const th = logData as any;
          rowValues = [logId, todayString, th.throwingType, th.pitchCount, th.targetDistanceFeet || '', th.avgVelocity || '', th.maxVelocity || '', th.intensitySubjective, th.notes];
          await appendRow(token, spreadsheetId, 'Throwing', rowValues);
        } else {
          const str = logData as any;
          rowValues = [logId, todayString, str.workoutType, str.intensity, str.notes];
          await appendRow(token, spreadsheetId, 'Strength', rowValues);
        }
        await loadData();
        setTimeout(() => generateNewPlan(), 350);
      } else {
        const resp = await fetch('/api/logs', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
            date: todayString,
            ...logData
          })
        });
        if (resp.ok) {
          await loadData();
          setTimeout(() => generateNewPlan(), 350);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete log entry
  const handleDeleteLog = async (id: string) => {
    try {
      const token = await getAccessToken();
      if (token && spreadsheetId) {
        const { deleteRowFromSheet } = await import('./lib/sheetsService');
        let tab = 'Recovery';
        if (id.startsWith('throwing-') || id.startsWith('log-')) {
          tab = 'Throwing';
        } else if (id.startsWith('strength-')) {
          tab = 'Strength';
        }
        await deleteRowFromSheet(token, spreadsheetId, tab, id);
        await loadData();
        setTimeout(() => generateNewPlan(), 350);
      } else {
        const resp = await fetch(`/api/logs/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        if (resp.ok) {
          await loadData();
          setTimeout(() => generateNewPlan(), 350);
        }
      }
    } catch (err) {
      console.error(err);
      setLogs(prev => prev.filter(l => l.id !== id));
    }
  };

  // Create an upcoming schedule game outcome or update log
  const handleAddScheduleItem = async (item: Omit<ScheduleEvent, 'id'>) => {
    try {
      const token = await getAccessToken();
      const itemId = 'schedule-' + Date.now();
      const fullItem = { id: itemId, ...item };
      
      if (token && spreadsheetId) {
        const { saveScheduleRowInSheet } = await import('./lib/sheetsService');
        await saveScheduleRowInSheet(token, spreadsheetId, fullItem);
        await loadData();
      } else {
        const resp = await fetch('/api/schedule', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(fullItem)
        });
        if (resp.ok) {
          await loadData();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateScheduleItem = async (item: ScheduleEvent) => {
    try {
      const token = await getAccessToken();
      if (token && spreadsheetId) {
        const { saveScheduleRowInSheet } = await import('./lib/sheetsService');
        await saveScheduleRowInSheet(token, spreadsheetId, item);
        await loadData();
      } else {
        const resp = await fetch('/api/schedule', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(item)
        });
        if (resp.ok) {
          await loadData();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteScheduleItem = async (id: string) => {
    try {
      const token = await getAccessToken();
      if (token && spreadsheetId) {
        const { deleteRowFromSheet } = await import('./lib/sheetsService');
        await deleteRowFromSheet(token, spreadsheetId, 'Schedule', id);
        await loadData();
      } else {
        const resp = await fetch(`/api/schedule/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        if (resp.ok) {
          await loadData();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteAssignedWorkout = async (assignmentId: string, logData: any) => {
    try {
      const resp = await fetch('/api/player/complete-workout', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          athleteEmail: currentUserEmail || "michael@fusiontechdesign.com",
          assignmentId,
          logData
        })
      });
      if (resp.ok) {
        const payload = await resp.json();
        setAssignedWorkouts(payload.assignedWorkouts || []);
        setLogs(payload.logs || []);
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeName = currentUserName || profile.name;
  const activeProfile = { ...profile, name: activeName };

  const isUserCoach = currentUserEmail ? coachesList.map(c => c.toLowerCase().trim()).includes(currentUserEmail.toLowerCase().trim()) : false;
  const showCoachTab = isUserCoach || coachOverride;

  const handleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUserEmail(res.user.email);
        setCurrentUserName(res.user.displayName);
        setCurrentUserPhoto(res.user.photoURL);
        await loadData(res.user.email || undefined);
      }
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await authLogout();
      setCurrentUserEmail(null);
      setCurrentUserName(null);
      setCurrentUserPhoto(null);
      await loadData(undefined);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080b13] via-[#0c1221] to-[#08090f] p-4 md:p-8">
      
      {/* App Header Bar */}
      <header className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-tr ${getAccentClass('fromGradient')} ${getAccentClass('toGradient')} rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg`}>
            ⚾
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black font-display text-white tracking-tight uppercase">
              {facilities[selectedFacilityId]?.logoText || "Summer Workload Advisor"}
            </h1>
            <p className={`text-xs ${getAccentClass('text')} font-semibold font-mono tracking-wide`}>
              {facilities[selectedFacilityId]?.welcomeMessage || "Private Athlete Pitching Coach, Arm Recovery & Recruiting Availability Coordinator"}
            </p>
          </div>
        </div>

        {/* Dynamic Multi-User and Sandbox Controls */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Quick Admin Role Sandbox Override */}
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-850 p-2 rounded-xl text-xs">
            <span className="text-[10px] font-black text-slate-500 font-display uppercase tracking-wider">Reviewer override:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={coachOverride} 
                onChange={(e) => {
                  setCoachOverride(e.target.checked);
                  if (e.target.checked) {
                    setActiveTab('coaches_dashboard');
                  } else {
                    setActiveTab('dashboard');
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-rose-500/40 peer-checked:after:bg-rose-400" />
              <span className="ml-1.5 font-mono text-[9px] text-slate-400 uppercase font-black font-mono">
                {coachOverride ? 'Coach ON' : 'Player ON'}
              </span>
            </label>
          </div>

          {/* Sync status Indicator */}
          {loading ? (
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 font-bold bg-slate-950 px-2.5 py-1.5 rounded">
              <RefreshCw className="w-3 h-3 animate-spin text-teal-450" /> SECURING CLOUD DATA
            </span>
          ) : spreadsheetId ? (
            <span className="text-[9px] px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded font-mono uppercase tracking-wider">
              🟢 GOOGLE SHEETS ACTIVE
            </span>
          ) : (
            <span className="text-[9px] px-2.5 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold rounded font-mono uppercase tracking-wider">
              ⚠️ RUNNING LOCAL FALLBACK
            </span>
          )}

          {/* User auth badge */}
          {currentUserEmail ? (
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 p-1.5 pl-2.5 pr-2 rounded-xl">
              <div className="text-right">
                <span className="block text-[10px] text-slate-300 font-extrabold max-w-[125px] truncate leading-none">
                  {currentUserName || 'Player Session'}
                </span>
                <span className="block text-[8px] text-slate-500 font-mono mt-0.5 max-w-[125px] truncate leading-none">
                  {isUserCoach ? '🏋️ TEAM COACH' : '📋 ATHLETE PROFILE'}
                </span>
              </div>
              {currentUserPhoto ? (
                <img src={currentUserPhoto} referrerPolicy="no-referrer" className="w-7 h-7 rounded-lg border border-slate-700" alt="Avatar" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-450 flex items-center justify-center text-xs font-bold uppercase">
                  {currentUserEmail.charAt(0)}
                </div>
              )}
              <button
                onClick={handleSignOut}
                className="p-1 px-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-405 text-slate-400 hover:text-white rounded-lg cursor-pointer animate-none"
                title="Log Out Session"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-500 text-slate-950 text-xs font-black font-display px-3 py-1.5 py-2 rounded-xl shadow cursor-pointer uppercase tracking-wider active:scale-95 transition-all"
            >
              <LogIn className="w-4 h-4" /> Sign In Google
            </button>
          )}

        </div>
      </header>

      {/* Tabs Command Center */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap bg-slate-950 border border-slate-850 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('athlete_view')}
          className={`flex-1 min-w-[120px] py-3 text-center rounded-lg text-xs font-bold uppercase font-display tracking-widest cursor-pointer transition-all ${
            activeTab === 'athlete_view'
              ? 'bg-slate-900 border border-slate-800 text-teal-400 font-black shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
          }`}
        >
          📋 Athlete Page
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 min-w-[120px] py-3 text-center rounded-lg text-xs font-bold uppercase font-display tracking-widest cursor-pointer transition-all ${
            activeTab === 'dashboard'
              ? 'bg-slate-900 border border-slate-800 text-emerald-400 font-black shadow shadow-emerald-500/5'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
          }`}
        >
          ⚾ Coach Console
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 min-w-[120px] py-3 text-center rounded-lg text-xs font-bold uppercase font-display tracking-widest cursor-pointer transition-all ${
            activeTab === 'schedule'
              ? 'bg-slate-900 border border-slate-800 text-cyan-400 font-black shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
          }`}
        >
          🏆 Summer Tournaments & Stats
        </button>
        <button
          onClick={() => setActiveTab('googlesheets')}
          className={`flex-1 min-w-[120px] py-3 text-center rounded-lg text-xs font-bold uppercase font-display tracking-widest cursor-pointer transition-all ${
            activeTab === 'googlesheets'
              ? 'bg-slate-900 border border-slate-800 text-teal-400 font-black shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
          }`}
        >
          📂 Google Sheets Config {spreadsheetId ? ' (Connected)' : ''}
        </button>
        <button
          onClick={() => setActiveTab('wordpress')}
          className={`flex-1 min-w-[120px] py-3 text-center rounded-lg text-xs font-bold uppercase font-display tracking-widest cursor-pointer transition-all ${
            activeTab === 'wordpress'
              ? 'bg-slate-900 border border-slate-800 text-cyan-400 font-black shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
          }`}
        >
          🔌 WordPress Build
        </button>
        <button
          onClick={() => setActiveTab('facilities')}
          className={`flex-1 min-w-[120px] py-3 text-center rounded-lg text-xs font-bold uppercase font-display tracking-widest cursor-pointer transition-all ${
            activeTab === 'facilities'
              ? `bg-slate-900 border border-slate-800 ${getAccentClass('text')} font-black shadow`
              : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
          }`}
        >
          🏢 White-Label Console
        </button>

        {showCoachTab && (
          <button
            onClick={() => setActiveTab('coaches_dashboard')}
            className={`flex-1 min-w-[150px] py-3 text-center rounded-lg text-xs font-bold uppercase font-display tracking-widest cursor-pointer transition-all border ${
              activeTab === 'coaches_dashboard'
                ? 'bg-rose-950/20 border-rose-500/40 text-rose-400 font-black shadow shadow-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-rose-400 hover:bg-rose-500/5'
            }`}
          >
            🏋️ Coaches Board (Admin)
          </button>
        )}
      </div>

      {/* Persona Delineation Stripe Banner */}
      <div className="max-w-7xl mx-auto mb-6">
        {showCoachTab ? (
          <div className="bg-rose-950/20 border border-rose-500/20 p-3 px-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-rose-400 font-extrabold uppercase tracking-wide">
              <span className="animate-pulse">●</span>
              <span>🏋️ CURRENT ROLE: COACH / TRAINER PORTAL</span>
            </div>
            <p className="text-slate-400 font-sans text-[11px] sm:text-right">
              Full Administrative view. You can create athletes via CSV/Form, assign routines, and review red-flags.
            </p>
          </div>
        ) : (
          <div className="bg-teal-950/20 border border-teal-500/20 p-3 px-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-teal-400 font-extrabold uppercase tracking-wide">
              <span className="animate-pulse">●</span>
              <span>📋 CURRENT ROLE: ATHLETE WORKOUT PORTAL</span>
            </div>
            <p className="text-slate-400 font-sans text-[11px] sm:text-right">
              Athlete self-logging view. View your custom workout calendar assigned by coaches and report recovery metrics.
            </p>
          </div>
        )}
      </div>

      {/* Main Single-View Bento Layout */}
      <main className="max-w-7xl mx-auto space-y-6">
        
        {activeTab === 'athlete_view' && (
          <AthletePage
            profile={activeProfile}
            logs={logs}
            schedule={schedule}
            calendarCsvLine={calendarCsvLine}
            assignedWorkouts={assignedWorkouts}
            onCompleteAssignedWorkout={handleCompleteAssignedWorkout}
            facilities={facilities}
            onUpdateProfile={handleUpdateProfile}
            onAddLog={handleAddLog}
            onDeleteLog={handleDeleteLog}
            onUpdateScheduleCsv={async (newCsv) => {
              setCalendarCsvLine(newCsv);
              const token = await getAccessToken();
              if (token && spreadsheetId) {
                const { saveCalendarCsvInSheet } = await import('./lib/sheetsService');
                await saveCalendarCsvInSheet(token, spreadsheetId, newCsv);
              } else {
                try {
                  const resp = await fetch('/api/schedule/csv', {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({ csv: newCsv })
                  });
                  if (resp.ok) {
                    await loadData();
                  }
                } catch (err) {
                  console.error(err);
                }
              }
            }}
            isCoachView={showCoachTab}
          />
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Athlete Profile horizontally at the top, full width */}
            <AthleteCard profile={activeProfile} onUpdateProfile={handleUpdateProfile} />

            {/* Interactive Training Calendar with dynamic checklist entries */}
            <WorkloadCalendar 
              logs={logs}
              schedule={schedule}
              onAddLog={(log, date) => handleAddLog(log, date)}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onDeleteLog={handleDeleteLog}
            />

            {/* Today's Target Driveline program, Biocore work, and Canes summer schedule */}
            <DrivelineSchedule logs={logs} profile={activeProfile} onAddLog={handleAddLog} />

            {/* Today's Custom Daily Plan generated by Gemini Assistant (Full Width) */}
            <div className="bg-gradient-to-b from-slate-900 to-[#101726] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
                
                {/* Background design accents */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1 px-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold font-display uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> COACH TYLER
                      </div>
                      <h4 className="text-sm font-extrabold text-[#edf2f7] uppercase tracking-wider font-display">TODAY&apos;S WORKLOAD BLUEPRINT</h4>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono font-bold align-middle">
                      📅 TARGET: MAY 29, 2026
                    </div>
                  </div>

                  {/* Input params for instant AI advice updates based on soreness */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-900 mb-6">
                    <div>
                      <label className="text-[9px] text-slate-400 block font-bold uppercase mb-1">Active Soreness</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={userSoreness}
                          onChange={e => {
                            const val = Number(e.target.value);
                            setUserSoreness(val);
                            if (val === 1) setSelectedSorenessArea('None');
                            else if (selectedSorenessArea === 'None') setSelectedSorenessArea('Shoulder');
                          }}
                          className="flex-1 accent-emerald-400 cursor-pointer h-1 bg-slate-800 rounded-lg"
                        />
                        <span className="text-xs font-mono text-emerald-400 font-bold">{userSoreness}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-400 block font-bold uppercase mb-1">Fatigue Exertion</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={userFatigue}
                          onChange={e => setUserFatigue(Number(e.target.value))}
                          className="flex-1 accent-cyan-400 cursor-pointer h-1 bg-slate-800 rounded-lg"
                        />
                        <span className="text-xs font-mono text-cyan-400 font-bold">{userFatigue}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 sm:pt-0 sm:pl-3 justify-center sm:justify-start">
                      <input
                        type="checkbox"
                        id="tourneyCheck"
                        className="accent-emerald-400 rounded focus:ring-emerald-400 w-4 h-4 cursor-pointer"
                        checked={inTournament}
                        onChange={e => setInTournament(e.target.checked)}
                      />
                      <label htmlFor="tourneyCheck" className="text-[10px] text-slate-300 font-bold uppercase cursor-pointer">
                        SUMMER TOURNAMENT ACTIVE
                      </label>
                    </div>
                  </div>

                  {/* Generated Plan Section Container */}
                  {generatingPlan ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                      <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                      <p className="text-xs font-mono uppercase tracking-wider">Coach Tyler AI is calculating safety metrics...</p>
                    </div>
                  ) : coachPlan ? (
                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                      
                      {/* Today's Routine Area */}
                      <div className="p-4 bg-slate-950 border-l-4 border-emerald-500 rounded-xl space-y-2">
                        <MarkdownRenderer text={coachPlan.todayPlan} />
                      </div>

                      {/* Why Rationale Area */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Coaching Rationale & Workload Balance</span>
                        <MarkdownRenderer text={coachPlan.whyThisPlan} />
                      </div>

                      {/* Adjustment Criteria Advice area */}
                      <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1">
                        <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-wider block">Live Injury Mitigation Checkpoint</span>
                        <MarkdownRenderer text={coachPlan.adjustmentRule} />
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-500">
                      <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-slate-705" />
                      Click Generate Coach AI Plan below to request an analysis.
                    </div>
                  )}
                </div>

                {/* Generate Action controls */}
                <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-between flex-wrap gap-2">
                  <p className="text-[10px] text-slate-500 font-mono leading-none italic">
                    {coachPlan?.isAiGenerated ? "🔮 Hyper-personalized analyses generated with Gemini 3.5-Flash" : "📜 Baselines generated locally via athletic rules matrix"}
                  </p>
                  
                  <button
                    onClick={generateNewPlan}
                    disabled={generatingPlan}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer border border-slate-700 active:scale-95"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${generatingPlan ? 'animate-spin' : ''}`} />
                    {generatingPlan ? 'Calculating Plan...' : 'Regenerate Coach Advice'}
                  </button>
                </div>

              </div>

            {/* Middle Segment: Workload gauges & clickable Arm + Input Form layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Workload gauges & Arm Sensory (7Cols) */}
              <div className="lg:col-span-7 h-full">
                <WorkloadMeter
                  logs={logs}
                  selectedSorenessArea={selectedSorenessArea}
                  setSelectedSorenessArea={setSelectedSorenessArea}
                />
              </div>

              {/* Training Logs Input Forms (5Cols) */}
              <div className="lg:col-span-12 lg:col-span-5 h-full">
                <LogForm
                  onAddLog={handleAddLog}
                  selectedSorenessArea={selectedSorenessArea}
                  setSelectedSorenessArea={setSelectedSorenessArea}
                />
              </div>
            </div>

            {/* Daily Automated Workout Notification Settings */}
            <WorkoutReminders />

            {/* Bottom Segment: Recent Logs list */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Recent entries timeline logs (5Cols) */}
              <div className="lg:col-span-5">
                <RecentLogs logs={logs} onDeleteLog={handleDeleteLog} />
              </div>

              {/* Quick CSV fallback exporter & Velocity Tracker (7Cols) */}
              <div className="lg:col-span-7 space-y-6">
                <VelocityChart logs={logs} profile={profile} />
                <AirtableExporter logs={logs} profile={profile} />
              </div>

            </div>

          </div>
        )}

        {activeTab === 'schedule' && (
          <ScheduleTab
            schedule={schedule}
            calendarCsvLine={calendarCsvLine}
            onAddScheduleItem={handleAddScheduleItem}
            onUpdateScheduleItem={handleUpdateScheduleItem}
            onDeleteScheduleItem={handleDeleteScheduleItem}
          />
        )}

        {activeTab === 'googlesheets' && (
          <GoogleSheetsConfig
            onSyncComplete={handleSyncComplete}
            spreadsheetId={spreadsheetId}
            setSpreadsheetId={setSpreadsheetId}
            calendarCsvLine={calendarCsvLine}
            setCalendarCsvLine={setCalendarCsvLine}
          />
        )}

        {activeTab === 'coaches_dashboard' && showCoachTab && (
          <CoachDashboard currentEmail={currentUserEmail} />
        )}

        {activeTab === 'wordpress' && (
          <WordPressPortal />
        )}

        {activeTab === 'facilities' && (
          <FacilityConsole
            facilities={facilities}
            activeFacilityId={selectedFacilityId}
            onSwitchFacility={handleSwitchFacility}
            onUpdateFacility={handleUpdateFacility}
            onCreateFacility={handleCreateFacility}
            onRegisterDemoPlayer={handleRegisterDemoPlayer}
            isCoach={showCoachTab}
            getAccentClass={getAccentClass}
          />
        )}

      </main>

      {/* Safety Legal Footer */}
      <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-850 text-center text-xs text-slate-550 space-y-2">
        <p>
          <strong>Professional Compliance Note:</strong> Tyler Pitching Development Coach is a safety-first athletic workload log system. It is <strong>NOT a medical diagnoses system</strong>. If you feel severe arm pain, swelling, sharp clicking, or arm discomfort 7/10 or higher, cease physical throwing activities immediately and consult with credentialed clinical doctors, professional athletic trainers, or orthopedic doctors.
        </p>
        <p className="text-[10px] font-mono text-slate-600">
          Tyler Krasner Private Coaching Portal © 2026. All rights and development benchmarks reserved.
        </p>
      </footer>

    </div>
  );
}
