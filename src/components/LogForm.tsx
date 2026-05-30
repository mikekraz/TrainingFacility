import React, { useState, useEffect } from 'react';
import { DailyLog, ThrowingType } from '../types';
import { Clipboard, Heart, Disc, Award, Plus, Calendar, Check } from 'lucide-react';

interface LogFormProps {
  onAddLog: (logData: any) => Promise<void>;
  selectedSorenessArea: string;
  setSelectedSorenessArea: (area: any) => void;
}

export default function LogForm({ onAddLog, selectedSorenessArea, setSelectedSorenessArea }: LogFormProps) {
  const [activeTab, setActiveTab] = useState<'recovery' | 'throwing' | 'strength'>('recovery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Recovery Log fields
  const [sorenessLevel, setSorenessLevel] = useState(1);
  const [fatigueLevel, setFatigueLevel] = useState(2);
  const [sleepQuality, setSleepQuality] = useState(8);
  const [recoveryNotes, setRecoveryNotes] = useState('');

  // Throwing Log fields
  const [throwingType, setThrowingType] = useState<ThrowingType>('Catch Play');
  const [pitchCount, setPitchCount] = useState(40);
  const [targetDistanceFeet, setTargetDistanceFeet] = useState(120);
  const [avgVelocity, setAvgVelocity] = useState(85);
  const [maxVelocity, setMaxVelocity] = useState(89);
  const [intensitySubjective, setIntensitySubjective] = useState(5);
  const [throwingNotes, setThrowingNotes] = useState('');

  // Strength Log fields
  const [workoutType, setWorkoutType] = useState<'Upper Body' | 'Lower Body' | 'Core' | 'Full Body' | 'Arm Care Rotator Cuff' | 'Mobility / Rest'>('Arm Care Rotator Cuff');
  const [strengthIntensity, setStrengthIntensity] = useState(4);
  const [strengthNotes, setStrengthNotes] = useState('');

  // Sync selectedSorenessArea from WorkloadMeter clickable diagram to local form
  useEffect(() => {
    if (selectedSorenessArea === 'None') {
      setSorenessLevel(1);
    } else if (selectedSorenessArea !== '') {
      if (sorenessLevel < 2) {
        setSorenessLevel(4); // Default to a warning intensity if they click a spot
      }
    }
  }, [selectedSorenessArea]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (activeTab === 'recovery') {
        await onAddLog({
          logType: 'recovery',
          sorenessLevel,
          sorenessArea: selectedSorenessArea as any || 'None',
          fatigueLevel,
          sleepQuality,
          notes: recoveryNotes || 'Feeling good. Daily check-in complete.'
        });
        setRecoveryNotes('');
      } else if (activeTab === 'throwing') {
        await onAddLog({
          logType: 'throwing',
          throwingType,
          pitchCount: Number(pitchCount) || 0,
          targetDistanceFeet: throwingType === 'Game Appearance' ? undefined : Number(targetDistanceFeet) || undefined,
          avgVelocity: (throwingType === 'Game Appearance' || throwingType === 'Bullpen') ? Number(avgVelocity) || undefined : undefined,
          maxVelocity: (throwingType === 'Game Appearance' || throwingType === 'Bullpen') ? Number(maxVelocity) || undefined : undefined,
          intensitySubjective,
          notes: throwingNotes || `Executed ${throwingType} training block.`
        });
        setThrowingNotes('');
      } else {
        await onAddLog({
          logType: 'strength',
          workoutType,
          intensity: strengthIntensity,
          notes: strengthNotes || `Completed ${workoutType} fitness routines.`
        });
        setStrengthNotes('');
      }

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 text-violet-400 text-xs font-semibold rounded-full border border-violet-500/20 mb-2 font-display">
            <Clipboard className="w-3.5 h-3.5" /> DAILY WORKLOAD LOGGER
          </span>
          <h3 className="text-lg font-black font-display tracking-tight text-white uppercase">Record Training Matrix</h3>
        </div>

        {/* Form Selector Tabs */}
        <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('recovery')}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'recovery'
                ? 'bg-slate-800 text-teal-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Recovery
          </button>
          <button
            onClick={() => setActiveTab('throwing')}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'throwing'
                ? 'bg-slate-800 text-teal-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Disc className="w-3.5 h-3.5" /> Throwing
          </button>
          <button
            onClick={() => setActiveTab('strength')}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'strength'
                ? 'bg-slate-800 text-teal-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Strength
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* RECOVERY ENTRY TAB */}
        {activeTab === 'recovery' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Soreness Level and Spot Selection */}
              <div className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-300">ARM SORENESS LEVEL</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    sorenessLevel >= 7 ? 'bg-red-500/25 text-red-400' : sorenessLevel >= 4 ? 'bg-yellow-500/25 text-yellow-400' : 'bg-emerald-500/25 text-emerald-400'
                  }`}>
                    {sorenessLevel}/10 ({selectedSorenessArea || 'None'})
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sorenessLevel}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setSorenessLevel(val);
                    if (val === 1) setSelectedSorenessArea('None');
                    else if (selectedSorenessArea === 'None') setSelectedSorenessArea('Shoulder');
                  }}
                  className="w-full accent-emerald-400 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
                />
                
                {/* Soreness spot fast checklist dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">SORENESS LOCATION</label>
                  <select
                    className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 text-xs text-slate-205 py-2 cursor-pointer focus:border-slate-700"
                    value={selectedSorenessArea}
                    onChange={e => setSelectedSorenessArea(e.target.value)}
                  >
                    <option value="None">None (Soreness level 1/10)</option>
                    <option value="Shoulder">Shoulder / Rear Scapula</option>
                    <option value="Elbow">UCL / Elbow Joint Area</option>
                    <option value="Forearm">Flexor-Pronator tendon / Forearm</option>
                  </select>
                </div>
              </div>

              {/* Fatigue and Sleep checks */}
              <div className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-xl space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-300">SUBJECTIVE FATIGUE</span>
                    <span className="font-mono text-cyan-400 font-semibold">{fatigueLevel}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={fatigueLevel}
                    onChange={e => setFatigueLevel(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-300">SLEEP QUALITY</span>
                    <span className="font-mono text-indigo-400 font-semibold">{sleepQuality}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sleepQuality}
                    onChange={e => setSleepQuality(Number(e.target.value))}
                    className="w-full accent-indigo-400 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-330">Daily Physical Observations / Notes</label>
              <textarea
                placeholder="Mention how the arm felt during morning movement, any secondary soreness, stiffness, hydration level, etc."
                className="w-full h-24 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl p-3 text-sm text-slate-200"
                value={recoveryNotes}
                onChange={e => setRecoveryNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* THROWING ENTRY TAB */}
        {activeTab === 'throwing' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Throwing Training Type</label>
                <select
                  value={throwingType}
                  onChange={e => setThrowingType(e.target.value as ThrowingType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="Recovery Catch">Recovery Catch (60-90ft)</option>
                  <option value="Catch Play">Standard Catch Play (120-150ft)</option>
                  <option value="Bullpen">Bullpen Session</option>
                  <option value="Game Appearance">Game Appearance Outing</option>
                  <option value="Off / Rest">No Throwing (Off / Active Recovery)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  {throwingType === 'Game Appearance' ? 'Game Pitch Count' : throwingType === 'Bullpen' ? 'Bullpen Pitch Count' : 'Total Throws Recorded'}
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  value={pitchCount}
                  onChange={e => setPitchCount(Math.max(0, Number(e.target.value)))}
                />
              </div>

              {throwingType !== 'Game Appearance' && throwingType !== 'Off / Rest' ? (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Target Logged Distance (ft)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    value={targetDistanceFeet}
                    onChange={e => setTargetDistanceFeet(Math.max(0, Number(e.target.value)))}
                  />
                </div>
              ) : (throwingType === 'Game Appearance' || throwingType === 'Bullpen') ? (
                <div className="space-y-1 grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block font-bold">AVG FB (mph)</label>
                    <input
                      type="number"
                      min="50"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      value={avgVelocity}
                      onChange={e => setAvgVelocity(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block font-bold">PEAK FB (mph)</label>
                    <input
                      type="number"
                      min="50"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      value={maxVelocity}
                      onChange={e => setMaxVelocity(Number(e.target.value))}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5 self-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Rest Day Status</p>
                  <p className="text-xs text-emerald-400">Arm preservation active.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 p-3 bg-slate-950 border border-slate-850 rounded-xl">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">SUBJECTIVE SESSION INTENSITY</span>
                  <span className="font-mono text-emerald-400 font-bold">{intensitySubjective}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensitySubjective}
                  onChange={e => setIntensitySubjective(Number(e.target.value))}
                  className="w-full accent-emerald-400 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
                />
              </div>

              <div className="space-y-1.5 py-1 text-xs text-slate-400 leading-relaxed font-sans place-self-center">
                Make sure to log games and bullpen parameters exactly! These feed into our Coach core workload alerts to design tomorrow&apos;s recovery programs correctly.
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-310">Throwing Outing Observers Notes</label>
              <textarea
                placeholder="List strike percentages, command of pitches, adjustments, recruiting observers present, etc."
                className="w-full h-24 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl p-3 text-sm text-slate-200"
                value={throwingNotes}
                onChange={e => setThrowingNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* STRENGTH / FITNESS TAB */}
        {activeTab === 'strength' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Workout Focus Category</label>
                <select
                  value={workoutType}
                  onChange={e => setWorkoutType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="Arm Care Rotator Cuff">Rotator Cuff / Scapular Care (Specific)</option>
                  <option value="Upper Body">Upper Body Strength Work</option>
                  <option value="Lower Body">Lower Body / Posterior Chain Work</option>
                  <option value="Core">Core / Rotational Stability Exercises</option>
                  <option value="Full Body">Full Body Athletic Training</option>
                  <option value="Mobility / Rest">Mobility Work and Soft Tissue Flushing</option>
                </select>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-950 border border-slate-850 rounded-xl">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-300">WORKOUT INTENSITY EXERTED</span>
                  <span className="font-mono text-violet-400 font-bold">{strengthIntensity}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={strengthIntensity}
                  onChange={e => setStrengthIntensity(Number(e.target.value))}
                  className="w-full accent-violet-400 bg-slate-800 cursor-pointer h-1.5 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-310">Strength Workout Details & Sets</label>
              <textarea
                placeholder="Detail exercises, weights used, rep ranges, rotator cuff band resistance, etc."
                className="w-full h-24 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl p-3 text-sm text-slate-200"
                value={strengthNotes}
                onChange={e => setStrengthNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
          <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Auto-stamps log date: May 29, 2026
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-xs px-6 py-2.5 rounded-xl uppercase transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/10 focus:ring-2 focus:ring-teal-400/50"
          >
            <Plus className="w-4 h-4 shrink-0" /> {isSubmitting ? 'Recording Log...' : 'Add Active Log'}
          </button>
        </div>
      </form>

      {/* Modern Glowing Success Toast */}
      {showSuccessToast && (
        <div className="absolute bottom-4 right-4 bg-emerald-950 border border-emerald-502/50 text-emerald-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2 shadow-2xl transition-all duration-300 z-50 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Daily plan log captured successfully on server databases.</span>
        </div>
      )}
    </div>
  );
}
