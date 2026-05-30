import React, { useState } from 'react';
import { ScheduleEvent } from '../types';
import { Calendar, Award, Trophy, TrendingUp, Sparkles, Clipboard, Activity, Plus, Trash2, CheckCircle2, ChevronRight, GaugeCircle, HelpCircle } from 'lucide-react';

interface ScheduleTabProps {
  schedule: ScheduleEvent[];
  calendarCsvLine: string;
  onAddScheduleItem: (item: Omit<ScheduleEvent, 'id'>) => Promise<void>;
  onUpdateScheduleItem: (item: ScheduleEvent) => Promise<void>;
  onDeleteScheduleItem: (id: string) => Promise<void>;
}

export default function ScheduleTab({
  schedule,
  calendarCsvLine,
  onAddScheduleItem,
  onUpdateScheduleItem,
  onDeleteScheduleItem
}: ScheduleTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleEvent | null>(null);

  // Form states
  const [date, setDate] = useState('2026-05-29');
  const [eventName, setEventName] = useState('');
  const [status, setStatus] = useState<'Scheduled' | 'Completed'>('Scheduled');
  const [innings, setInnings] = useState(0);
  const [peakVelo, setPeakVelo] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [walks, setWalks] = useState(0);
  const [er, setEr] = useState(0);
  const [ks, setKs] = useState(0);
  const [hits, setHits] = useState(0);
  const [notes, setNotes] = useState('');

  // Local helper to parse the single line CSV calendar items
  const parseCalendarCsv = (csvStr: string) => {
    if (!csvStr || !csvStr.trim()) return [];
    return csvStr.split(',').map(item => {
      const idx = item.indexOf(':');
      if (idx === -1) return { date: '', desc: item.trim() };
      const d = item.slice(0, idx).trim();
      const desc = item.slice(idx + 1).trim();
      return { date: d, desc };
    }).filter(e => e.desc);
  };

  const parsedCalendarEvents = parseCalendarCsv(calendarCsvLine);

  // Calculate cumulative stats for efficiency tracking
  const completedGames = schedule.filter(g => g.status === 'Completed');
  const totalInnings = completedGames.reduce((acc, curr) => acc + (curr.innings || 0), 0);
  const overallEr = completedGames.reduce((acc, curr) => acc + (curr.er || 0), 0);
  const overallKs = completedGames.reduce((acc, curr) => acc + (curr.ks || 0), 0);
  const overallWalks = completedGames.reduce((acc, curr) => acc + (curr.walks || 0), 0);
  const overallHits = completedGames.reduce((acc, curr) => acc + (curr.hits || 0), 0);
  
  // High school game is 7 innings, college is 9. Let's show Standard 9-Inning ERA
  const calculatedEra = totalInnings > 0 ? ((overallEr * 9) / totalInnings).toFixed(2) : '0.00';
  const calculatedWhip = totalInnings > 0 ? ((overallWalks + overallHits) / totalInnings).toFixed(2) : '0.00';
  const kToWalkRatio = overallWalks > 0 ? (overallKs / overallWalks).toFixed(1) : overallKs.toString();
  const maxVelocityOverall = completedGames.length > 0 ? Math.max(...completedGames.map(g => g.peakVelo || 0)) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) return;

    if (editingItem) {
      const updated: ScheduleEvent = {
        ...editingItem,
        date,
        eventName,
        status,
        innings: Number(innings),
        peakVelo: Number(peakVelo),
        strikes: Number(strikes),
        walks: Number(walks),
        er: Number(er),
        ks: Number(ks),
        hits: Number(hits),
        notes
      };
      await onUpdateScheduleItem(updated);
      setEditingItem(null);
    } else {
      const newItem = {
        date,
        eventName,
        status,
        innings: Number(innings),
        peakVelo: Number(peakVelo),
        strikes: Number(strikes),
        walks: Number(walks),
        er: Number(er),
        ks: Number(ks),
        hits: Number(hits),
        notes
      };
      await onAddScheduleItem(newItem);
    }

    // Reset Form
    setEventName('');
    setInnings(0);
    setPeakVelo(0);
    setStrikes(0);
    setWalks(0);
    setEr(0);
    setKs(0);
    setHits(0);
    setNotes('');
    setShowAddForm(false);
  };

  const handleEditClick = (item: ScheduleEvent) => {
    setEditingItem(item);
    setDate(item.date);
    setEventName(item.eventName);
    setStatus(item.status);
    setInnings(item.innings);
    setPeakVelo(item.peakVelo);
    setStrikes(item.strikes);
    setWalks(item.walks);
    setEr(item.er);
    setKs(item.ks);
    setHits(item.hits);
    setNotes(item.notes);
    setShowAddForm(true);
  };

  const handleDeleteClick = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to write-off this schedule item? This operation will mutate the sheet.');
    if (confirmed) {
      await onDeleteScheduleItem(id);
    }
  };

  // Pre-fill defaults for the form if user is updating a scheduled event to completed
  const handleLogGameStats = (item: ScheduleEvent) => {
    setEditingItem(item);
    setDate(item.date);
    setEventName(item.eventName);
    setStatus('Completed');
    setInnings(3.0);
    setPeakVelo(87);
    setStrikes(35);
    setWalks(2);
    setEr(0);
    setKs(5);
    setHits(1);
    setNotes('Relief appearance. FB feeling loose and painting outside edges.');
    setShowAddForm(true);
  };

  // Generate simple vector metrics coordinates for the peak velocity chart
  const velocityPoints = completedGames
    .slice()
    .reverse()
    .map(g => g.peakVelo || 0)
    .filter(v => v > 0);

  return (
    <div className="space-y-6">

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Showcase ERA</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-display text-emerald-400">{calculatedEra}</span>
            <span className="text-xs text-slate-400">runs/9 IP</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 font-mono">Based on {totalInnings.toFixed(1)} frames pitched</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Peak Showcase FB</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-display text-cyan-400">{maxVelocityOverall}</span>
            <span className="text-xs text-slate-400">MPH</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 font-mono">Target benchmark: 90+ MPH</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">WHIP Efficiency</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-display text-yellow-400">{calculatedWhip}</span>
            <span className="text-xs text-slate-400">walks+hits/IP</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 font-mono">Ratio of runners permitted</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">K / Walk Control</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black font-display text-[#aec0ce]">{kToWalkRatio}</span>
            <span className="text-xs text-slate-400">K/BB</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-2 font-mono">{overallKs} Ks vs {overallWalks} walks total</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column Left: Schedule Log List (7 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-black font-display text-white uppercase tracking-tight">
                  Summer Schedule & Game Outcomes
                </h3>
              </div>
              
              <button
                onClick={() => {
                  setEditingItem(null);
                  setEventName('');
                  setShowAddForm(!showAddForm);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-display text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" /> Add Game
              </button>
            </div>

            {/* In-tab Form to Log/Edit Game Performance */}
            {showAddForm && (
              <form onSubmit={handleSubmit} className="bg-slate-950 border border-slate-850 p-4 rounded-xl mb-6 space-y-4">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  {editingItem ? 'Edit Scheduled Event & Stats' : 'Schedule Custom Game Showcase'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-450 uppercase block font-bold mb-1">Target Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-slate-200 p-2 text-xs rounded-xl w-full outline-none"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-450 uppercase block font-bold mb-1">Event/Opponent Title</label>
                    <input
                      type="text"
                      value={eventName}
                      onChange={e => setEventName(e.target.value)}
                      placeholder="e.g. Canes 16U vs PG Select Bulldogs"
                      className="bg-slate-900 border border-slate-800 text-slate-200 p-2 text-xs rounded-xl w-full outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-450 uppercase block font-bold mb-1">Showcase Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 text-slate-200 p-2 text-xs rounded-xl w-full outline-none cursor-pointer"
                    >
                      <option value="Scheduled">Scheduled (Not played yet)</option>
                      <option value="Completed">Completed (Log stats!)</option>
                    </select>
                  </div>

                  {status === 'Completed' && (
                    <>
                      <div>
                        <label className="text-[10px] text-slate-450 uppercase block font-bold mb-1">Innings Pitched</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={innings}
                          onChange={e => setInnings(Number(e.target.value))}
                          className="bg-slate-900 border border-slate-800 text-slate-200 p-2 text-xs rounded-xl w-full outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-450 uppercase block font-bold mb-1">Peak Pitch Velocity (MPH)</label>
                        <input
                          type="number"
                          min="0"
                          max="110"
                          value={peakVelo}
                          onChange={e => setPeakVelo(Number(e.target.value))}
                          className="bg-slate-900 border border-slate-800 text-cyan-400 font-bold p-2 text-xs rounded-xl w-full outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>

                {status === 'Completed' && (
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 space-y-3">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-widest">Pitching Efficiency Metrics</span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div>
                        <label className="text-[9px] text-slate-500 uppercase block font-bold mb-1">Strikes</label>
                        <input
                          type="number"
                          value={strikes}
                          onChange={e => setStrikes(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-800 text-[#aec0ce] p-1.5 text-xs rounded-lg w-full outline-none text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 uppercase block font-bold mb-1">Walks (BB)</label>
                        <input
                          type="number"
                          value={walks}
                          onChange={e => setWalks(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-800 text-[#aec0ce] p-1.5 text-xs rounded-lg w-full outline-none text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 uppercase block font-bold mb-1">Earned Runs</label>
                        <input
                          type="number"
                          value={er}
                          onChange={e => setEr(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-800 text-[#aec0ce] p-1.5 text-xs rounded-lg w-full outline-none text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-500 uppercase block font-bold mb-1">Strikeouts (Ks)</label>
                        <input
                          type="number"
                          value={ks}
                          onChange={e => setKs(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-800 text-[#aec0ce] p-1.5 text-xs rounded-lg w-full outline-none text-center"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[9px] text-slate-500 uppercase block font-bold mb-1">Hits Allowed</label>
                        <input
                          type="number"
                          value={hits}
                          onChange={e => setHits(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-800 text-[#aec0ce] p-1.5 text-xs rounded-lg w-full outline-none text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-slate-450 uppercase block font-bold mb-1">Coaches Remarks & Outing Highlights</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Describe Tyler's zone command, fastball action, secondary spin efficiency & college scouts observation..."
                    rows={2}
                    className="bg-slate-900 border border-slate-800 text-slate-200 p-2 text-xs rounded-xl w-full outline-none font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingItem(null);
                    }}
                    className="px-3.5 py-1.5 text-xs text-slate-450 hover:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-750 text-emerald-400 hover:text-emerald-300 border border-slate-750 font-bold text-xs px-4 py-1.5 rounded-lg cursor-pointer"
                  >
                    {editingItem ? 'Save Updates' : 'Schedule Outing'}
                  </button>
                </div>
              </form>
            )}

            {/* Schedule Data Tables Grid */}
            {schedule.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-sans border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs">No summer tournaments logged in Sheets.</p>
                <p className="text-[10px] text-slate-600 mt-1">Click Add Game above to schedule a pitching appearance!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {schedule.map(item => (
                  <div key={item.id} className="bg-slate-950 border border-slate-850 hover:border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                    
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-extrabold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {item.date}
                        </span>
                        
                        {item.status === 'Completed' ? (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-black uppercase font-display tracking-wider">
                            Completed
                          </span>
                        ) : (
                          <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-black uppercase font-display tracking-wider">
                            Upcoming Scheduled
                          </span>
                        )}

                        {item.status === 'Completed' && item.peakVelo > 0 && (
                          <span className="text-[9px] bg-cyan-950 text-cyan-400 font-mono font-bold px-1.5 py-0.5 rounded">
                            🔥 Max: {item.peakVelo} mph
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-white font-display uppercase tracking-tight pt-1">
                        {item.eventName}
                      </h4>

                      {item.status === 'Completed' ? (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 max-w-xl">
                          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-850 text-center">
                            <span className="text-[8px] text-slate-500 block uppercase font-bold">Innings</span>
                            <span className="text-xs font-bold font-mono text-white">{item.innings}</span>
                          </div>
                          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-850 text-center">
                            <span className="text-[8px] text-slate-500 block uppercase font-bold">Strikes</span>
                            <span className="text-xs font-bold font-mono text-emerald-400">{item.strikes}</span>
                          </div>
                          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-850 text-center">
                            <span className="text-[8px] text-slate-500 block uppercase font-bold">Walks (BB)</span>
                            <span className="text-xs font-bold font-mono text-yellow-500">{item.walks}</span>
                          </div>
                          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-850 text-center">
                            <span className="text-[8px] text-slate-500 block uppercase font-bold">Earned R</span>
                            <span className="text-xs font-bold font-mono text-red-400">{item.er}</span>
                          </div>
                          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-850 text-center">
                            <span className="text-[8px] text-slate-500 block uppercase font-bold">Ks (Strikeout)</span>
                            <span className="text-xs font-bold font-mono text-white">{item.ks}</span>
                          </div>
                          <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-850 text-center">
                            <span className="text-[8px] text-slate-500 block uppercase font-bold">Hits</span>
                            <span className="text-xs font-bold font-mono text-white">{item.hits}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-450 italic mt-1 pb-1">Expected relief session tracking. No pitching metric data is available yet.</p>
                      )}

                      {item.notes && (
                        <p className="text-xs text-[#a0aec0] bg-slate-900/40 p-2 rounded-lg border border-slate-900/60 mt-2 font-sans italic leading-normal">
                          &ldquo;{item.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-900 pt-3 sm:pt-0 gap-2">
                      {item.status === 'Scheduled' && (
                        <button
                          onClick={() => handleLogGameStats(item)}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Log stats
                        </button>
                      )}

                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-1 px-2 hover:bg-slate-900 text-slate-450 hover:text-white rounded text-xs cursor-pointer border border-transparent hover:border-slate-800"
                        >
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          className="p-1 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column Right: Simple parsed Daily Calendar List from CSV Cell (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <Calendar className="w-5 h-5 text-teal-400" />
              <div>
                <h3 className="text-sm font-black font-display text-white uppercase tracking-tight">CSV-Based Daily Calendar</h3>
                <span className="text-[9px] text-[#aec0ce] block font-mono">Parsed live from cell CalendarConfig!A2</span>
              </div>
            </div>

            {parsedCalendarEvents.length === 0 ? (
              <div className="text-center py-10 text-slate-550 border border-slate-800 border-dashed rounded-xl bg-slate-950/20 space-y-1">
                <p className="text-xs font-mono font-bold">CSV calendar cell is empty.</p>
                <p className="text-[10px] leading-snug">Edit the Calendar CSV in the Sheets tab to seed items on Tyler&apos;s daily grid.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {parsedCalendarEvents.map((evt, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-850 p-3 rounded-xl flex items-start gap-2.5 hover:border-slate-800 transition-all">
                    <ChevronRight className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
                    <div>
                      {evt.date && (
                        <span className="text-[9.5px] font-bold text-slate-450 bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded font-mono block w-fit mb-1">
                          {evt.date}
                        </span>
                      )}
                      <p className="text-xs font-bold text-[#fafafa] font-sans leading-tight">
                        {evt.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Simple Peak Velocity Progression SVG graph */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> SHOWCASE FB VELOCITY TREND (MPH)
            </span>
            
            {velocityPoints.length < 2 ? (
              <div className="h-28 flex items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/30 text-[10px] text-slate-650 font-mono uppercase text-center p-4 leading-normal">
                Requires at least 2 completed outings with data to chart velocity progression.
              </div>
            ) : (
              <div className="bg-slate-950 border border-slate-850 p-2 rounded-xl flex flex-col justify-end">
                <div className="h-28 flex items-end justify-between px-2 pt-2 relative">
                  
                  {/* Grid benchmarks guidelines */}
                  <div className="absolute inset-x-0 bottom-1/2 border-t border-slate-850 border-dashed pointer-events-none" />
                  <span className="absolute right-1 top-2 text-[8px] font-mono text-cyan-500 font-bold bg-slate-900 px-1 rounded border border-slate-850">90 mph benchmark</span>

                  {/* Draw customized interactive SVG lines or visual bars */}
                  {velocityPoints.map((v, i) => {
                    const min = 80;
                    const max = 95;
                    const heightPercent = Math.min(100, Math.max(10, ((v - min) / (max - min)) * 100));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative z-10">
                        <div className="text-[9px] text-cyan-400 font-bold font-mono opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4 bg-slate-950 border border-slate-800 px-1 rounded pointer-events-none">{v}</div>
                        
                        {/* Interactive vertical progress nodes */}
                        <div 
                          style={{ height: `${heightPercent}%` }} 
                          className="w-4 bg-gradient-to-t from-cyan-950 to-cyan-400 rounded-lg group-hover:shadow group-hover:shadow-cyan-400/20 group-hover:brightness-110 transition-all duration-300" 
                        />
                        <span className="text-[8px] font-mono text-slate-550 mt-1">G{velocityPoints.length - i}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
