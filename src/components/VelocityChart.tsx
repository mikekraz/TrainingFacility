import React, { useState } from 'react';
import { DailyLog, AthleteProfile } from '../types';
import { TrendingUp, Award, Flame, Zap, PlusCircle } from 'lucide-react';

interface VelocityChartProps {
  logs: DailyLog[];
  profile?: {
    avgFbVelocity: number;
    peakFbVelocity: number;
    name: string;
  };
  compact?: boolean;
}

export default function VelocityChart({ logs, profile, compact = false }: VelocityChartProps) {
  // 1. Extract and sort throwing logs with logged velocities
  const velocityLogs = logs
    .filter(l => l.logType === 'throwing')
    .map(l => {
      const tl = l as any;
      return {
        id: tl.id,
        date: tl.date,
        maxVelocity: tl.maxVelocity !== undefined ? tl.maxVelocity : 0,
        avgVelocity: tl.avgVelocity !== undefined ? tl.avgVelocity : 0,
        throwingType: tl.throwingType || 'Catch Play',
      };
    })
    .filter(item => item.maxVelocity > 0 || item.avgVelocity > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Baselines from profile or defaults
  const profilePeak = profile?.peakFbVelocity || 92;
  const profileAvg = profile?.avgFbVelocity || 88;

  // Chart layout dimensions
  const width = 600;
  const height = compact ? 150 : 250;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  // Render placeholders if no velocity data points exist
  const hasData = velocityLogs.length > 0;
  
  // Use logged actuals or a nice interactive guide if empty
  const displayLogs = hasData 
    ? velocityLogs 
    : [
        { date: '2026-05-15', maxVelocity: profileAvg - 3, avgVelocity: profileAvg - 6, throwingType: 'Catch Play' },
        { date: '2026-05-20', maxVelocity: profileAvg, avgVelocity: profileAvg - 3, throwingType: 'Bullpen' },
        { date: '2026-05-25', maxVelocity: profilePeak - 1, avgVelocity: profileAvg, throwingType: 'Bullpen' },
        { date: '2026-05-30', maxVelocity: profilePeak + 1, avgVelocity: profileAvg + 1, throwingType: 'Game Appearance' }
      ];

  // Dynamic Min and Max values for custom sizing
  const maxVal = Math.max(
    ...displayLogs.map(d => Math.max(d.maxVelocity, d.avgVelocity)),
    profilePeak
  ) + 3;

  const minVal = Math.max(
    40,
    Math.min(
      ...displayLogs.map(d => Math.min(d.avgVelocity, d.maxVelocity || 40)),
      profileAvg
    ) - 5
  );

  const valueRange = maxVal - minVal;

  // Coordinate mapping functions
  const getX = (index: number) => {
    if (displayLogs.length <= 1) return paddingLeft + (width - paddingLeft - paddingRight) / 2;
    return paddingLeft + (index / (displayLogs.length - 1)) * (width - paddingLeft - paddingRight);
  };

  const getY = (val: number) => {
    const chartHeight = height - paddingTop - paddingBottom;
    return height - paddingBottom - ((val - minVal) / valueRange) * chartHeight;
  };

  // Build SVG path strings
  let maxPath = '';
  let avgPath = '';
  
  displayLogs.forEach((item, index) => {
    const x = getX(index);
    const yMax = getY(item.maxVelocity);
    const yAvg = getY(item.avgVelocity);
    
    if (index === 0) {
      maxPath = `M ${x} ${yMax}`;
      avgPath = `M ${x} ${yAvg}`;
    } else {
      maxPath += ` L ${x} ${yMax}`;
      avgPath += ` L ${x} ${yAvg}`;
    }
  });

  const getDayFormat = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length >= 3) {
        return `${parts[1]}/${parts[2]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div id="velocity-tracker-panel" className="bg-slate-950 border border-slate-850 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      {!hasData && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
          <TrendingUp className="w-9 h-9 text-cyan-400 animate-pulse mb-3" />
          <h5 className="text-sm font-extrabold text-white uppercase tracking-wider">No Velocity Actuals Recorded</h5>
          <p className="text-xs text-slate-400 max-w-[280px] mt-1.5 leading-relaxed font-sans">
            Please manually log a <strong>Throwing/Bullpen session</strong> on the calendar with Peak Velocity numbers to initialize the progression chart.
          </p>
          <div className="mt-4 bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[10px] text-slate-400 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>Click any day on calendar &rarr; Tab Detail &rarr; Detailed Workout Logger</span>
          </div>
        </div>
      )}

      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 rounded-lg">
            <Flame className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-xs font-black font-display text-white uppercase tracking-wider">
              {profile?.name ? `${profile.name}'s Velocity Tracker` : 'Fastball Velocity Pulse'}
            </h4>
            <p className="text-[10px] text-slate-500 font-mono">
              Live progression of Fastball Maximum & Average speeds (MPH)
            </p>
          </div>
        </div>

        {hasData && (
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-slate-400 font-bold uppercase">Peak</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-450" />
              <span className="text-slate-400 font-bold uppercase">Avg</span>
            </div>
          </div>
        )}
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          {/* Y-Axis Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const gridVal = Math.round(minVal + ratio * valueRange);
            const y = getY(gridVal);
            return (
              <g key={`grid-${i}`} className="opacity-20">
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="#475569" 
                  strokeDasharray="4 4" 
                  strokeWidth="1"
                />
                <text 
                  x={paddingLeft - 8} 
                  y={y + 4} 
                  fill="#94a3b8" 
                  fontSize="10" 
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* Dotted Target Baseline lines using profile values if available */}
          <line
            x1={paddingLeft}
            y1={getY(profilePeak)}
            x2={width - paddingRight}
            y2={getY(profilePeak)}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="opacity-40"
          />
          <text
            x={width - paddingRight - 4}
            y={getY(profilePeak) - 4}
            fill="#f87171"
            fontSize="8"
            fontWeight="black"
            fontFamily="monospace"
            textAnchor="end"
            className="opacity-70"
          >
            PEAK BASELINE ({profilePeak} MPH)
          </text>

          <line
            x1={paddingLeft}
            y1={getY(profileAvg)}
            x2={width - paddingRight}
            y2={getY(profileAvg)}
            stroke="#eab308"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="opacity-40"
          />
          <text
            x={width - paddingRight - 4}
            y={getY(profileAvg) - 4}
            fill="#facc15"
            fontSize="8"
            fontWeight="black"
            fontFamily="monospace"
            textAnchor="end"
            className="opacity-70"
          >
            AVG BASELINE ({profileAvg} MPH)
          </text>

          {/* Connected Curves Line - Max Velocity (Cyan Gradient) */}
          <path 
            d={maxPath} 
            fill="none" 
            stroke="url(#cyanGlow)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* Connected Curves Line - Avg Velocity (Emerald Gradient) */}
          <path 
            d={avgPath} 
            fill="none" 
            stroke="url(#emeraldGlow)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="opacity-85"
          />

          {/* Data Points Markers */}
          {displayLogs.map((item, index) => {
            const x = getX(index);
            const yMax = getY(item.maxVelocity);
            const yAvg = getY(item.avgVelocity);
            const isHovered = hoveredPoint === index;

            return (
              <g 
                key={`point-${index}`}
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                {/* Max interactive handle */}
                {isHovered && (
                  <circle cx={x} cy={yMax} r="10" fill="#22d3ee" className="opacity-20 animate-ping" />
                )}
                <circle 
                  cx={x} 
                  cy={yMax} 
                  r={isHovered ? "6" : "4.5"} 
                  fill="#020617" 
                  stroke="#22d3ee" 
                  strokeWidth="2.5" 
                />
                
                {/* Max Value above node */}
                <text 
                  x={x} 
                  y={yMax - 8} 
                  fill="#ffffff" 
                  fontSize={isHovered ? "11" : "10"} 
                  fontWeight="black" 
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="filter drop-shadow-md"
                >
                  {item.maxVelocity}
                </text>

                {/* Avg interactive handle */}
                <circle 
                  cx={x} 
                  cy={yAvg} 
                  r={isHovered ? "5" : "3.5"} 
                  fill="#020617" 
                  stroke="#10b981" 
                  strokeWidth="2" 
                />

                {/* Date Label on Bottom X axis */}
                <text 
                  x={x} 
                  y={height - 8} 
                  fill={isHovered ? "#38bdf8" : "#64748b"} 
                  fontSize="9" 
                  fontWeight={isHovered ? "black" : "bold"}
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {getDayFormat(item.date)}
                </text>
              </g>
            );
          })}

          {/* Definitions for beautiful glow gradients */}
          <defs>
            <linearGradient id="cyanGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="emeraldGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#047857" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>

        {/* Dynamic Tooltip overlay on hover */}
        {hoveredPoint !== null && (
          <div className="absolute top-[5px] left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700/60 p-2.5 rounded-xl text-[11px] space-y-1 shadow-2xl z-30 pointer-events-none min-w-[170px] text-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 mb-1 bg-slate-950 p-1 rounded">
              <span className="font-mono text-cyan-400 font-extrabold">{displayLogs[hoveredPoint].date}</span>
              <span className="text-[9px] bg-slate-900 text-slate-400 px-1 py-0.5 rounded font-black font-display uppercase">
                {displayLogs[hoveredPoint].throwingType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-450 text-slate-400">Peak Fastball:</span>
              <span className="font-mono font-bold text-white text-right">{displayLogs[hoveredPoint].maxVelocity} MPH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-450 text-slate-400">Average Fastball:</span>
              <span className="font-mono font-bold text-slate-300 text-right">{displayLogs[hoveredPoint].avgVelocity} MPH</span>
            </div>
            {hasData ? (
              <div className="text-[9px] text-teal-450 font-medium text-emerald-400 pt-0.5 text-center bg-emerald-500/5 rounded font-mono uppercase tracking-tight">
                ✓ VERIFIED DATA POINT
              </div>
            ) : (
              <div className="text-[9.5px] text-yellow-500 pt-0.5 text-center font-bold font-mono">
                ⚠ DEMO PLACEHOLDER
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trailing summary helper stats */}
      {hasData && (
        <div className="grid grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-slate-900 text-center">
          <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-900">
            <span className="text-[9px] text-slate-400 block font-bold uppercase">Max Summer Velo</span>
            <span className="text-sm font-black font-mono text-cyan-400">
              {Math.max(...velocityLogs.map(v => v.maxVelocity))} <span className="text-[10px] text-slate-550">MPH</span>
            </span>
          </div>
          <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-900">
            <span className="text-[9px] text-slate-400 block font-bold uppercase">Current Average</span>
            <span className="text-sm font-black font-mono text-emerald-400">
              {Math.round(velocityLogs.reduce((acc, curr) => acc + curr.avgVelocity, 0) / velocityLogs.length)} <span className="text-[10px] text-slate-550 font-medium">MPH</span>
            </span>
          </div>
          <div className="bg-slate-900/50 p-2 rounded-xl border border-slate-900">
            <span className="text-[9px] text-slate-400 block font-bold uppercase">Logged Sessions</span>
            <span className="text-sm font-black font-mono text-slate-305 text-slate-300">
              {velocityLogs.length} <span className="text-[10px] text-slate-550">times</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
