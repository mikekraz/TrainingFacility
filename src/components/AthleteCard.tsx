import { useState } from 'react';
import { AthleteProfile } from '../types';
import { User, Shield, Target, Calendar, Award, Edit2, Check, RefreshCw } from 'lucide-react';

interface AthleteCardProps {
  profile: AthleteProfile;
  onUpdateProfile: (updated: Partial<AthleteProfile>) => Promise<void>;
}

export default function AthleteCard({ profile, onUpdateProfile }: AthleteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedVal, setEditedVal] = useState<AthleteProfile>({ ...profile });
  const [isSaving, setIsSaving] = useState(false);

  // August 1, 2026 countdown calculation
  const today = new Date('2026-05-29T21:51:43Z'); // Current local time from metadata
  const recruitingStartDate = new Date('2026-08-01T00:00:00Z');
  const daysRemaining = Math.max(0, Math.ceil((recruitingStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateProfile(editedVal);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Visual background gradient stripe top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20 mb-2 font-display">
            <Shield className="w-3.5 h-3.5" /> ATHLETE PROFILE
          </span>
          <h2 className="text-2xl font-black text-white font-display uppercase tracking-tight flex items-center gap-2">
            {profile.name} <span className="text-sm font-normal text-slate-400 capitalize">{profile.position}</span>
          </h2>
        </div>

        <button
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setEditedVal({ ...profile });
              setIsEditing(true);
            }
          }}
          className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-xl transition-all duration-200 ${
            isEditing
              ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20'
              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
          disabled={isSaving}
        >
          {isSaving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : isEditing ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Edit2 className="w-3.5 h-3.5" />
          )}
          {isEditing ? 'Save Profile' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block">Summer Team</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              value={editedVal.summerTeam}
              onChange={e => setEditedVal({ ...editedVal, summerTeam: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block">Height</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              value={editedVal.height}
              onChange={e => setEditedVal({ ...editedVal, height: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block">Weight</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              value={editedVal.weight}
              onChange={e => setEditedVal({ ...editedVal, weight: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block">FB Velocity (Avg - mph)</label>
            <input
              type="number"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              value={editedVal.avgFbVelocity}
              onChange={e => setEditedVal({ ...editedVal, avgFbVelocity: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-slate-400 font-semibold block">FB Velocity (Peak - mph)</label>
            <input
              type="number"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
              value={editedVal.peakFbVelocity}
              onChange={e => setEditedVal({ ...editedVal, peakFbVelocity: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-slate-400 font-semibold block">Primary Goal</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white h-20"
              value={editedVal.goal}
              onChange={e => setEditedVal({ ...editedVal, goal: e.target.value })}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-slate-400 font-semibold block">Recruiting Context</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white h-20"
              value={editedVal.recruitingContext}
              onChange={e => setEditedVal({ ...editedVal, recruitingContext: e.target.value })}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Column 1: Prospect Profile (4 Cols) */}
          <div className="lg:col-span-4 space-y-3 flex flex-col justify-between">
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                <span className="text-[9px] text-[#aec0ce] font-bold font-mono">CLUB: {profile.summerTeam}</span>
                <span className="text-[9px] text-emerald-400 font-extrabold font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">CLASS OF '28 PROSPECT</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-900/55 p-2 rounded-lg border border-slate-850">
                  <span className="text-[9px] text-slate-500 block font-mono uppercase">HEIGHT</span>
                  <span className="text-sm font-black text-teal-400 font-display">{profile.height}</span>
                </div>
                <div className="bg-slate-900/55 p-2 rounded-lg border border-slate-850">
                  <span className="text-[9px] text-slate-500 block font-mono uppercase">WEIGHT</span>
                  <span className="text-sm font-black text-teal-400 font-display">{profile.weight}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/85 rounded-xl p-3 flex gap-2.5">
              <div className="p-1 px-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg self-start text-xs font-black">
                GOAL
              </div>
              <p className="text-[11px] text-slate-350 leading-normal font-sans">
                {profile.goal}
              </p>
            </div>
          </div>

          {/* Column 2: Fastball Velocity Radar (4 Cols) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-slate-950 to-[#0e1423] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[9px] text-rose-400 font-extrabold tracking-widest uppercase block mb-2 font-display flex items-center gap-1">
                🔥 FASTBALL RADAR METRICS
              </span>
              <div className="grid grid-cols-2 divide-x divide-slate-800 pb-3">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400">Average Velocity</span>
                  <p className="text-2xl font-black text-white font-display mt-1">
                    {profile.avgFbVelocity} <span className="text-xs text-emerald-400">mph</span>
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400">Peak Velocity</span>
                  <p className="text-2xl font-black text-rose-500 font-display mt-1">
                    {profile.peakFbVelocity} <span className="text-xs text-rose-400">mph</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Target benchmark progress visual */}
            <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-900 mt-2">
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mb-1">
                <span>Avg: {profile.avgFbVelocity} mph</span>
                <span>Peak: {profile.peakFbVelocity} mph</span>
                <span>Oct Goal: 90+ FB</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (profile.avgFbVelocity / 90) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Column 3: Live Countdown Ticker (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3 justify-between">
            <div className="bg-emerald-950/15 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] text-emerald-400 font-extrabold tracking-widest uppercase font-display flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> RECRUITING TIMER
                </p>
                <p className="text-[11px] text-slate-400 mt-1 leading-tight font-sans">
                  Direct NCAA scout contact rule opens August 1st.
                </p>
              </div>
              <div className="text-right pl-3 shrink-0">
                <span className="block text-2xl font-black text-emerald-400 font-display leading-none">{daysRemaining}</span>
                <span className="text-[8px] text-slate-400 font-mono font-bold block mt-0.5">DAYS REMAINING</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex gap-2.5 items-start">
              <div className="p-1 px-1.5 bg-cyan-500/10 text-cyan-400 rounded-md text-[9px] font-black uppercase font-display select-none">
                CAMPUS
              </div>
              <p className="text-[11px] text-slate-350 leading-normal font-sans">
                {profile.recruitingContext}
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
