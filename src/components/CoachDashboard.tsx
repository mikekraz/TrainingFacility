import React, { useState, useEffect } from 'react';
import VelocityChart from './VelocityChart';
import { 
  Users, 
  ShieldAlert, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  UserCheck, 
  Award, 
  UserMinus, 
  UserPlus, 
  Plus, 
  Mail, 
  Heart, 
  Clock, 
  ChevronRight, 
  TrendingUp as VeloUp,
  Flame,
  Search,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CoachDashboardProps {
  currentEmail: string | null;
}

interface PlayerReportItem {
  email: string;
  profile: {
    name: string;
    position: string;
    height: string;
    weight: string;
    avgFbVelocity: number;
    peakFbVelocity: number;
    summerTeam: string;
    goal: string;
    recruitingContext: string;
    assignedFacility?: string;
    assignedTrainer?: string;
  };
  logsCount: number;
  complianceToday: boolean;
  sorenessAlert: boolean;
  latestSoreness: number;
  latestSorenessArea: string;
  latestFatigue: number;
  upcomingGames: boolean;
  velocityTrends: {
    direction: 'up' | 'down' | 'flat';
    change: number;
  };
  complianceRate: number;
  recentLogs: any[];
}

export default function CoachDashboard({ currentEmail }: CoachDashboardProps) {
  const [players, setPlayers] = useState<PlayerReportItem[]>([]);
  const [coaches, setCoaches] = useState<string[]>([]);
  const [newCoachEmail, setNewCoachEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerReportItem | null>(null);

  // Facilities data state
  const [facilities, setFacilities] = useState<Record<string, any>>({});

  // Dynamic assignment inputs for the selected player
  const [targetFacilityId, setTargetFacilityId] = useState('');
  const [targetTrainerName, setTargetTrainerName] = useState('');
  const [updatingAssignment, setUpdatingAssignment] = useState(false);

  const [message, setMessage] = useState({ text: '', type: '' });

  // Load roster reporting + coaches administration list
  const loadReports = async () => {
    setLoading(true);
    try {
      const activeFac = localStorage.getItem('pitched_facility_tenant_id') || 'velocity-prime';
      const repResp = await fetch('/api/coach/reporting', {
        headers: {
          'x-facility-id': activeFac,
          'Content-Type': 'application/json'
        }
      });
      if (repResp.ok) {
        const payload = await repResp.json();
        setPlayers(payload.players || []);
        if (payload.facilities) {
          setFacilities(payload.facilities);
        }
        if (payload.players && payload.players.length > 0 && !selectedPlayer) {
          setSelectedPlayer(payload.players[0]);
        }
      }

      const coachResp = await fetch('/api/coaches');
      if (coachResp.ok) {
        const coachPayload = await coachResp.json();
        setCoaches(coachPayload.coaches || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Sync assignment fields whenever a new player is selected
  useEffect(() => {
    if (selectedPlayer) {
      setTargetFacilityId(selectedPlayer.profile.assignedFacility || selectedPlayer.profile.assignedFacility || '');
      setTargetTrainerName(selectedPlayer.profile.assignedTrainer || '');
    }
  }, [selectedPlayer]);

  // Handle assigning athlete to a facility + trainer
  const handleSaveAssignments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;
    setUpdatingAssignment(true);

    try {
      const resp = await fetch('/api/coach/update-athlete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          athleteEmail: selectedPlayer.email,
          profileUpdates: {
            assignedFacility: targetFacilityId,
            assignedTrainer: targetTrainerName
          }
        })
      });

      if (resp.ok) {
        const payload = await resp.json();
        
        // Update locally directly!
        setPlayers(prev => prev.map(p => {
          if (p.email === selectedPlayer.email) {
            return {
              ...p,
              profile: {
                ...p.profile,
                assignedFacility: targetFacilityId,
                assignedTrainer: targetTrainerName
              }
            };
          }
          return p;
        }));

        setSelectedPlayer(prev => {
          if (!prev) return null;
          return {
            ...prev,
            profile: {
              ...prev.profile,
              assignedFacility: targetFacilityId,
              assignedTrainer: targetTrainerName
            }
          };
        });

        setMessage({ 
          text: `Successfully synchronized ${selectedPlayer.profile.name}'s assigned facility and trainer configurations!`, 
          type: 'success' 
        });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      } else {
        setMessage({ text: 'Error updated athlete assignment protocols.', type: 'error' });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Dispatching error. Failed to save assignments.', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } finally {
      setUpdatingAssignment(false);
    }
  };

  const handleAddCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoachEmail.trim()) return;

    try {
      const resp = await fetch('/api/coaches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newCoachEmail })
      });

      if (resp.ok) {
        const payload = await resp.json();
        setCoaches(payload.coaches || []);
        setNewCoachEmail('');
        setMessage({ text: 'Successfully designated coach admin privileges!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveCoach = async (emailToRemove: string) => {
    if (emailToRemove === 'michael@fusiontechdesign.com') {
      alert('Cannot remove the primary team owner coach!');
      return;
    }

    try {
      const resp = await fetch(`/api/coaches/${encodeURIComponent(emailToRemove)}`, {
        method: 'DELETE'
      });

      if (resp.ok) {
        const payload = await resp.json();
        setCoaches(payload.coaches || []);
        setMessage({ text: 'Privilege revoked from designated coach.', type: 'info' });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPlayers = players.filter(p => 
    p.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats summaries
  const totalRoster = players.length;
  const redFlagsCount = players.filter(p => p.sorenessAlert).length;
  const compliantCount = players.filter(p => p.complianceToday).length;
  const compliancePct = totalRoster > 0 ? Math.round((compliantCount / totalRoster) * 100) : 0;
  const gamePrepCount = players.filter(p => p.upcomingGames).length;

  return (
    <div className="space-y-6 text-start" id="coaches-admin-dashboard">
      
      {/* Bento Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1: Total Roster */}
        <div className="bg-slate-905 bg-slate-950 border border-slate-850 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 bg-teal-500/10 border border-teal-555/20 text-teal-400 rounded-xl relative z-10">
            <Users className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <span className="text-xs text-slate-450 text-slate-400 font-bold block uppercase tracking-wider">Athetes Tracked</span>
            <span className="text-2xl font-black font-display text-white mt-0.5 block">{totalRoster}</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Stat 2: RED FLAGS (Health Warns) */}
        <div className="bg-slate-905 bg-slate-950 border border-slate-850 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className={`p-3 rounded-xl border relative z-10 ${
            redFlagsCount > 0 
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' 
              : 'bg-emerald-500/10 border-emerald-555/25 text-emerald-400'
          }`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <span className="text-xs text-slate-450 text-slate-400 font-bold block uppercase tracking-wider">Active Health Alerts</span>
            <span className={`text-2xl font-black font-display mt-0.5 block ${
              redFlagsCount > 0 ? 'text-rose-450 text-rose-400' : 'text-slate-400'
            }`}>{redFlagsCount}</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Stat 3: Today Compliancy */}
        <div className="bg-slate-905 bg-slate-950 border border-slate-850 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 bg-emerald-500/10 border border-emerald-555/20 text-emerald-450 text-emerald-400 rounded-xl relative z-10">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <span className="text-xs text-slate-450 text-slate-400 font-bold block uppercase tracking-wider">Workout Compliance</span>
            <span className="text-2xl font-black font-display text-white mt-0.5 block">
              {compliancePct}% <span className="text-xs text-slate-500 font-mono">({compliantCount}/{totalRoster})</span>
            </span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Stat 4: Upcoming Games */}
        <div className="bg-slate-905 bg-slate-950 border border-slate-850 p-5 rounded-2xl flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 bg-indigo-500/10 border border-indigo-555/20 text-cyan-400 rounded-xl relative z-10">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <span className="text-xs text-slate-450 text-slate-400 font-bold block uppercase tracking-wider">7d Game Preparation</span>
            <span className="text-2xl font-black font-display text-white mt-0.5 block">{gamePrepCount}</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        </div>

      </div>

      {/* Main reporting splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
        
        {/* Left Column: Athletes Roster & trends (7 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-4">
            
            {/* Header controls list */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-4">
              <div>
                <h3 className="text-base font-black font-display text-white uppercase tracking-tight">Active Athletes Performance Roster</h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">Real-time stats, velocity trends and recovery indicators logged by players.</p>
              </div>
              
              {/* Search bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute top-3 left-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Roster search..."
                  className="bg-slate-900 border border-slate-850 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-teal-500 outline-none w-full sm:w-48"
                />
              </div>
            </div>

            {/* Red Flag Health Watch Section */}
            {redFlagsCount > 0 && (
              <div className="p-4 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wide">
                  <Flame className="w-4 h-4 animate-pulse" />
                  <span>CRITICAL ALERT: Health Indicators Flagged ({redFlagsCount})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {players.filter(p => p.sorenessAlert).map(p => (
                    <div key={`alert-${p.email}`} className="bg-slate-900/50 p-2.5 rounded-lg border border-rose-500/10 flex items-center justify-between">
                      <span className="text-slate-300 font-bold">{p.profile.name}</span>
                      <span className="bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase font-mono">
                        {p.latestSorenessArea}: {p.latestSoreness}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Players Table Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    <th className="pb-3">Athlete</th>
                    <th className="pb-3">Today Status</th>
                    <th className="pb-3">Recovery Specs</th>
                    <th className="pb-3">Velo Trends</th>
                    <th className="pb-3 text-right">Compliance (7d)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-xs">
                  {filteredPlayers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">No athletes logged into work database yet.</td>
                    </tr>
                  ) : (
                    filteredPlayers.map(p => {
                      const isSel = selectedPlayer?.email === p.email;
                      
                      // Highlight velocity
                      const velChange = p.velocityTrends.change;
                      const hasVeloTrend = p.velocityTrends.direction !== 'flat';

                      return (
                        <tr 
                          key={p.email} 
                          onClick={() => setSelectedPlayer(p)}
                          className={`hover:bg-slate-900/40 cursor-pointer transition-all ${
                            isSel ? 'bg-teal-500/5 border-l-2 border-teal-500' : ''
                          }`}
                        >
                          <td className="py-4 font-semibold text-[#edf2f7]">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-[#edf2f7] block">{p.profile.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono font-medium block">{p.profile.position} • {p.email}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            {p.complianceToday ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                                ✓ Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-slate-900 text-slate-500 border border-slate-850 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                                No Duty
                              </span>
                            )}
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col gap-0.5">
                              <span className={`font-semibold block ${p.sorenessAlert ? 'text-rose-400 font-black' : 'text-slate-305 text-slate-300'}`}>
                                Soreness: {p.latestSorenessArea} ({p.latestSoreness}/10)
                              </span>
                              <span className="text-[10px] text-slate-500 block">Fatigue Index: {p.latestFatigue}/10</span>
                            </div>
                          </td>
                          <td className="py-4">
                            {p.velocityTrends.direction === 'up' ? (
                              <span className="inline-flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold font-mono text-[10px]">
                                <VeloUp className="w-3 h-3 text-emerald-400 inline" /> +{velChange} MPH
                              </span>
                            ) : p.velocityTrends.direction === 'down' ? (
                              <span className="inline-flex items-center gap-0.5 bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-bold font-mono text-[10px]">
                                <TrendingDown className="w-3 h-3 text-rose-500 inline" /> {velChange} MPH
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 bg-slate-900 text-slate-500 px-2 py-0.5 rounded font-bold font-mono text-[10px]">
                                ▶ Flat
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-right font-mono font-bold text-teal-400">
                            {p.complianceRate}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* Selected Athlete Detail Pane */}
          {selectedPlayer && (
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-2 text-[10px] font-black bg-teal-500/10 rounded text-teal-400 uppercase font-mono tracking-wider">
                    DEEP METRICS
                  </div>
                  <h4 className="text-base font-black font-display text-white">{selectedPlayer.profile.name}&apos;s Athlete Log Record</h4>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  CONTACT SYSTEM: {selectedPlayer.profile.recruitingContext ? 'READY' : 'TBD'}
                </div>
              </div>

              {/* Recruitment & Prospect Notes block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-slate-300">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[10px] text-teal-400 block font-bold uppercase tracking-wider">Development Goals / Summer Target</span>
                  <p className="leading-relaxed font-sans">{selectedPlayer.profile.goal || 'No summer target recorded.'}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[10px] text-indigo-400 block font-bold uppercase tracking-wider">College Recruiting Action / Deadline</span>
                  <p className="leading-relaxed font-sans">{selectedPlayer.profile.recruitingContext || 'August 1st Recruiting telephone window begins soon.'}</p>
                </div>
              </div>

              {/* Facility & Trainer Assignment Block */}
              <div className="bg-slate-900/40 border border-slate-900/90 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h5 className="text-xs font-black font-display text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    Tenancy & Head Pitching Coach Assignments
                  </h5>
                  <span className="text-[9px] text-slate-500 font-mono">ATHLETE PROFILE CORE FIELDS</span>
                </div>

                <form onSubmit={handleSaveAssignments} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Facility Selection */}
                    <div className="space-y-1.5">
                      <label className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider font-extrabold">
                        Assigned White-Label Facility
                      </label>
                      <select
                        value={targetFacilityId}
                        onChange={(e) => {
                          const newFacId = e.target.value;
                          setTargetFacilityId(newFacId);
                          // Auto select first trainer of new facility if exists
                          const newFacObj = facilities[newFacId];
                          const newFacTrainers = newFacObj?.trainers || [];
                          if (newFacTrainers.length > 0) {
                            const firstTrainer = newFacTrainers[0];
                            const firstTrainerName = typeof firstTrainer === 'string' 
                              ? firstTrainer 
                              : `Coach ${firstTrainer.firstName} ${firstTrainer.lastName}`;
                            setTargetTrainerName(firstTrainerName);
                          } else {
                            setTargetTrainerName('Coach James');
                          }
                        }}
                        className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none focus:border-slate-750 transition-all font-sans cursor-pointer h-10"
                      >
                        <option value="">-- Select isolated tenant --</option>
                        {Object.entries(facilities).map(([id, fac]: [string, any]) => (
                          <option key={id} value={id}>
                            {fac.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Trainer Selection */}
                    <div className="space-y-1.5">
                      <label className="block text-[9.5px] font-mono text-slate-400 uppercase tracking-wider font-extrabold">
                        Assigned Athlete Trainer / coach
                      </label>
                      <select
                        value={targetTrainerName}
                        onChange={(e) => setTargetTrainerName(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none focus:border-slate-750 transition-all font-sans cursor-pointer h-10"
                      >
                        <option value="">-- Select certified coach --</option>
                        
                        {/* Render active facility's custom roster if any are configured */}
                        {targetFacilityId && facilities[targetFacilityId]?.trainers && facilities[targetFacilityId].trainers.length > 0 && (
                          <optgroup label={`Staff at ${facilities[targetFacilityId].name}`}>
                            {facilities[targetFacilityId].trainers.map((t: any, idx: number) => {
                              const labelText = typeof t === 'string' 
                                ? t 
                                : `Coach ${t.firstName} ${t.lastName} (${t.email})`;
                              const valueText = typeof t === 'string' 
                                ? t 
                                : `Coach ${t.firstName} ${t.lastName}`;
                              return (
                                <option key={idx} value={valueText}>
                                  {labelText}
                                </option>
                              );
                            })}
                          </optgroup>
                        )}

                        {/* Fallbacks */}
                        <optgroup label="Default Certified Coaches">
                          <option value="Coach Michael">Coach Michael (Roster Owner)</option>
                          <option value="Coach James">Coach James (Performance Lead)</option>
                          <option value="Coach Tyler">Coach Tyler (Workload Specialist)</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 border-t border-slate-900 mt-2">
                    <p className="text-[10px] text-slate-500 leading-normal font-sans max-w-md">
                      Saving assignment maps this athlete&apos;s primary metrics under the custom styled workspace of the facility and designated trainer parameters.
                    </p>
                    
                    <button
                      type="submit"
                      disabled={updatingAssignment}
                      className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-slate-950 font-black tracking-wider uppercase text-xs rounded-xl font-display transition-all cursor-pointer shadow-lg shadow-rose-950/20 shrink-0 self-end"
                    >
                      {updatingAssignment ? "Assigning..." : "Apply Assignments"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Player-specific Velocity Progression Tracker for Coaches */}
              <VelocityChart 
                logs={selectedPlayer.recentLogs}
                profile={{
                  avgFbVelocity: selectedPlayer.profile.avgFbVelocity || 88,
                  peakFbVelocity: selectedPlayer.profile.peakFbVelocity || 92,
                  name: selectedPlayer.profile.name
                }}
                compact={true}
              />

              {/* Trailing activity feed */}
              <div className="space-y-3">
                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wide">Historical logs logged by athlete</span>
                <div className="space-y-2">
                  {selectedPlayer.recentLogs.length === 0 ? (
                    <p className="text-xs text-slate-550 italic font-mono text-center py-4">No logged records available for student profile.</p>
                  ) : (
                    selectedPlayer.recentLogs.map((l: any) => (
                      <div key={l.id} className="bg-slate-900/30 p-3 rounded-lg border border-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-slate-500 font-bold">{l.date}</span>
                          <span className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                            l.logType === 'throwing' 
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/10' 
                              : l.logType === 'strength'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                                : 'bg-slate-800 text-slate-400'
                          }`}>
                            {l.logType}
                          </span>
                        </div>
                        <p className="text-slate-350 text-slate-300 text-slate-start text-xs flex-1 line-clamp-1 truncate" title={l.notes}>
                          {l.notes || (l.logType === 'throwing' ? `Throwing sequence logged (max ${l.maxVelocity || 'TBD'} mph, count ${l.pitchCount || 'TBD'})` : 'No custom description recorded.')}
                        </p>
                        {l.maxVelocity && (
                          <span className="font-bold text-[#edf2f7] bg-slate-900 px-2 py-1 rounded font-mono border border-slate-850 text-end">
                            Peak: {l.maxVelocity} mph
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Roles & Privileges (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Roles Management bento block */}
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-4">
            
            <div className="border-b border-slate-900 pb-3">
              <h4 className="text-sm font-black font-display text-white uppercase tracking-tight flex items-center gap-2">
                <UserCheck className="w-4.5 h-4.5 text-teal-400" />
                Coach Admin Authorities
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">
                Designated coaches can lock/read workout updates, monitor player soreness status, and update summer schedules dynamically.
              </p>
            </div>

            {message.text && (
              <div className={`p-3 rounded-xl border text-xs font-semibold ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-teal-500/10 border-teal-500/20 text-teal-400'
              }`}>
                {message.text}
              </div>
            )}

            {/* Coaches email list */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-550 block font-bold uppercase tracking-wider">Authorized Admins</span>
              
              <div className="space-y-1.5">
                {coaches.map(email => (
                  <div 
                    key={`coach-${email}`} 
                    className="p-3 bg-slate-900 border border-slate-900 hover:border-slate-800 rounded-xl flex items-center justify-between text-xs transition-all"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="text-slate-300 font-semibold font-mono truncate">{email}</span>
                      {email === 'michael@fusiontechdesign.com' && (
                        <span className="text-[8px] bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded font-mono leading-none">
                          FOUNDER
                        </span>
                      )}
                    </div>
                    {email !== 'michael@fusiontechdesign.com' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCoach(email)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-950/80 transition-all cursor-pointer"
                        title="Revoke Admin Permission"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add Coach form */}
            <form onSubmit={handleAddCoach} className="space-y-2 pt-2 border-t border-slate-900">
              <label className="text-[10px] text-slate-550 block font-bold uppercase tracking-wider">Designate New Admin Coach</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newCoachEmail}
                  onChange={e => setNewCoachEmail(e.target.value)}
                  placeholder="coach.name@team.com"
                  required
                  className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 w-full text-xs text-white focus:border-emerald-500 outline-none font-mono"
                />
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 p-2.5 rounded-xl text-slate-950 shrink-0 cursor-pointer text-center font-bold font-display"
                  title="Grant Admin Privileges"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

          </div>

          {/* Useful Coaches Resource Card */}
          <div className="bg-gradient-to-b from-[#101726] to-[#0c101d] border border-slate-850 rounded-2xl p-6 shadow-xl space-y-3">
            <h5 className="text-xs font-black text-emerald-400 font-display uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
              Summer Injury Avoidance Standard
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              As a pitching coach, always ensure athletes resting schedule checks out when their max pitch count spikes over 35 throws in games or high-stress sessions. Direct athletes with shoulder or elbow tightness to avoid high-distance hybrid long-toss until soreness drops safely back below 2/10.
            </p>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 text-[11px] text-slate-400 space-y-2 text-start">
              <span className="font-extrabold uppercase text-slate-500 text-[9px] block">Velocity Watch Criteria</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 bg-emerald-500" />
                <span>Steady Velocity Increases check healthy biomechanics.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Sharp Drop (▼ -2 MPH) indicates latent muscular fatigue.</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
