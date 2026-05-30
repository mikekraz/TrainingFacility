/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AthleteProfile {
  name: string;
  position: string;
  height: string;
  weight: string;
  avgFbVelocity: number;
  peakFbVelocity: number;
  summerTeam: string;
  goal: string;
  recruitingContext: string;
  gradYear?: number;
  assignedFacility?: string;
  assignedTrainer?: string;
  // Summer Ball Coach Info
  summerCoachName?: string;
  summerCoachContact?: string;
  // Position measurables
  bestPopTime?: number;
  avgPopTime?: number;
  catcherThrowVelo?: number;
  exchangeTime?: number;
  blocksSuccessful?: number;
  blocksAttempted?: number;
  inningsCaught?: number;
  exitVelocity?: number;
  batSpeed?: number;
  sixtyYardDash?: number;
  homeToFirst?: number;
  tenYardSplit?: number;
  infieldVelo?: number;
  outfieldVelo?: number;
}

export type LogType = 'recovery' | 'throwing' | 'strength';

export type ThrowingType = 'Recovery Catch' | 'Catch Play' | 'Bullpen' | 'Game Appearance' | 'Off / Rest';

export interface RecoveryLog {
  id: string;
  date: string;
  logType: 'recovery';
  sorenessLevel: number; // 1-10
  sorenessArea: string;
  fatigueLevel: number; // 1-10
  sleepQuality: number; // 1-10
  sleepHours?: number;
  overallBodyFeel?: number; // 1-10
  hydration?: number; // 1-10
  energyLevel?: number; // 1-10
  pain?: boolean;
  painLocation?: string;
  painSeverity?: number; // 1-10
  sessionType?: 'Throwing' | 'Lifting' | 'Speed' | 'Conditioning' | 'Off';
  sessionIntensity?: number; // 1-10
  recommendedStatus?: 'Green' | 'Yellow' | 'Orange' | 'Red';
  notes: string;

  // Pitcher Recovery
  armFeel?: number;
  shoulderSoreness?: number;
  elbowSoreness?: number;
  forearmTightness?: number;
  latBackTightness?: number;
  legFatigue?: number;
  recoveryLastOuting?: number;
  throwingPain?: boolean;
  painDuringThrowing?: boolean;
  painAfterThrowing?: boolean;
  highStressInnings?: number;
  daysSinceLastOuting?: number;
  bullpenVolume?: number;
  longTossVolume?: number;
  postThrowRecoveryCompleted?: boolean;
  todayThrowingStatus?: string;

  // Hitter / Position Player Recovery
  swingFeel?: number;
  handWristSoreness?: number;
  backTightness?: number;
  hipGroinSoreness?: number;
  battingPracticeVolume?: number;
  gameSwings?: number;
  cageSwings?: number;
  exitVeloDropOff?: boolean;
  timingFeel?: number;
  confidenceAtPlate?: number;
  swingReadiness?: string;

  // Catcher-specific Recovery
  squatFatigue?: number;
  kneeHipBackSoreness?: number;
  catcherWorkload?: number;
}

export interface ThrowingLog {
  id: string;
  date: string;
  logType: 'throwing';
  throwingType: ThrowingType;
  pitchCount: number;
  targetDistanceFeet?: number;
  avgVelocity?: number;
  maxVelocity?: number;
  strikePercentage?: number;
  intensitySubjective: number; // 1-10
  notes: string;

  // Catcher throwing details
  popTime?: number;
  exchangeTime?: number;
  throwAccuracy?: 'Excellent' | 'Good' | 'Average' | 'Poor';
}

export interface StrengthLog {
  id: string;
  date: string;
  logType: 'strength';
  workoutType: string;
  intensity: number; // 1-10
  notes: string;
}

export type DailyLog = RecoveryLog | ThrowingLog | StrengthLog;

export interface CoachPlan {
  todayPlan: string;
  whyThisPlan: string;
  whatToLog: string;
  adjustmentRule: string;
  date: string;
  isAiGenerated: boolean;
}

export interface ScheduleEvent {
  id: string;
  date: string;
  eventName: string;
  status: 'Scheduled' | 'Completed';
  innings: number;
  peakVelo: number;
  strikes: number;
  walks: number;
  er: number;
  ks: number;
  hits: number;
  notes: string;
}

export interface AssignedWorkout {
  id: string;
  date: string;
  workoutName: string;
  category: string;
  subcategory: string;
  defaultIntensity: string;
  defaultVolume: string;
  equipment: string;
  athleteEmail: string;
  assignedTrainer: string;
  assignedFacility: string;
  coachNotes: string;
  metricsToTrack: string[];
  status: 'pending' | 'completed';
}

export interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  authType: 'google' | 'password';
  passwordValue?: string;
  createdAt: string;
}

export interface Facility {
  id: string;
  name: string;
  logoText: string;
  welcomeMessage: string;
  accentColor: 'teal' | 'indigo' | 'rose' | 'amber';
  primaryColor: string;
  domainSlug: string;
  trainers?: (string | Trainer)[];
}


