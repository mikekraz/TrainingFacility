/**
 * Curated Baseball Workout Library based on official Driveline and facility taxonomies.
 * Contains both pitching and hitting exercises categorized by player type, category, subcategory, and level.
 */

export interface WorkoutDbEntry {
  playerType: 'Pitcher' | 'Hitter' | 'Catcher' | 'All';
  level: 'Youth' | 'High School' | 'College' | 'Pro' | 'All';
  trainingPhase?: string;
  category: string;
  subcategory: string;
  workoutName: string;
  sessionTiming: string;
  defaultIntensity: 'Low' | 'Low-Med' | 'Med' | 'Med-High' | 'High' | 'High-Max' | 'Max';
  defaultVolume: string;
  equipment: string;
  metricsToTrack: string[];
  ageEligibilityNotes: string;
  coachNotes: string;
  sourceBasis: string;
}

export const WORKOUT_LIBRARY: WorkoutDbEntry[] = [
  // Pitcher Warm-Up & Prep
  {
    playerType: 'Pitcher',
    level: 'High School',
    trainingPhase: 'All Phases',
    category: 'Warm-Up',
    subcategory: 'Soft Tissue',
    workoutName: 'Foam Roll / Lacrosse Ball Full Body',
    sessionTiming: 'Pre-throw',
    defaultIntensity: 'Low',
    defaultVolume: '10 seconds per pass',
    equipment: 'Foam roller; lacrosse ball',
    metricsToTrack: ['body_feel', 'soreness', 'areas_flagged'],
    ageEligibilityNotes: 'Youth: coach-supervised; HS/College/Pro: progress by readiness',
    coachNotes: 'Use before throwing to prepare tissue and identify soreness.',
    sourceBasis: 'Driveline public throwing/PlyoCare articles'
  },
  {
    playerType: 'Pitcher',
    level: 'High School',
    trainingPhase: 'All Phases',
    category: 'Warm-Up',
    subcategory: 'Dynamic Prep',
    workoutName: 'Dynamic Warm-Up',
    sessionTiming: 'Pre-throw',
    defaultIntensity: 'Low-Med',
    defaultVolume: '8-12 minutes',
    equipment: 'Open space; cones optional',
    metricsToTrack: ['readiness_score', 'movement_quality'],
    ageEligibilityNotes: 'Youth: coach-supervised; HS/College/Pro: progress by readiness',
    coachNotes: 'Increase body temperature before throwing.',
    sourceBasis: 'Driveline public throwing PDF'
  },
  {
    playerType: 'Pitcher',
    level: 'High School',
    trainingPhase: 'All Phases',
    category: 'Pre-Throwing Prep',
    subcategory: 'Band Series',
    workoutName: 'Jaeger Band Series',
    sessionTiming: 'Pre-throw',
    defaultIntensity: 'Low',
    defaultVolume: '10 reps per exercise',
    equipment: 'J-bands or resistance bands',
    metricsToTrack: ['shoulder_readiness', 'arm_feel'],
    ageEligibilityNotes: 'Youth: lower volume; HS/College/Pro: progress by readiness',
    coachNotes: 'Shoulder activation before catch play.',
    sourceBasis: 'Jaeger band routine'
  },
  {
    playerType: 'Pitcher',
    level: 'High School',
    trainingPhase: 'All Phases',
    category: 'Pre-Throwing Prep',
    subcategory: 'Wrist Weights',
    workoutName: 'Wrist Weight Series',
    sessionTiming: 'Pre-throw',
    defaultIntensity: 'Low',
    defaultVolume: '10 reps per exercise',
    equipment: 'Wrist weights',
    metricsToTrack: ['arm_feel', 'forearm_tightness'],
    ageEligibilityNotes: 'HS/College/Pro: progress by readiness',
    coachNotes: 'Scap/shoulder rhythm and arm prep.',
    sourceBasis: 'Driveline public throwing program'
  },
  {
    playerType: 'Pitcher',
    level: 'High School',
    trainingPhase: 'All Phases',
    category: 'Pre-Throwing Prep',
    subcategory: 'Shoulder Tube',
    workoutName: 'Shoulder Tube Series',
    sessionTiming: 'Pre-throw',
    defaultIntensity: 'Low',
    defaultVolume: '10 seconds per exercise',
    equipment: 'Shoulder tube',
    metricsToTrack: ['shoulder_readiness', 'arm_feel'],
    ageEligibilityNotes: 'HS/College/Pro: progress by readiness',
    coachNotes: 'Rhythm and shoulder activation.',
    sourceBasis: '16-week throwing PDF'
  },

  // PlyoCare work
  {
    playerType: 'Pitcher',
    level: 'High School',
    trainingPhase: 'Offseason / Build-Up',
    category: 'PlyoCare Work',
    subcategory: 'Arm Action',
    workoutName: 'Reverse Throws',
    sessionTiming: 'Pre-throw or throwing block',
    defaultIntensity: 'Low-Med',
    defaultVolume: '2-4 sets x 3-10 reps',
    equipment: 'PlyoCare-style balls; wall/net',
    metricsToTrack: ['arm_feel', 'intent', 'throw_quality'],
    ageEligibilityNotes: 'Youth: 1-2 sets; HS+: 2-4 sets',
    coachNotes: 'Always early in routine; decel/reverse pattern.',
    sourceBasis: 'Driveline public articles'
  },
  {
    playerType: 'Pitcher',
    level: 'High School',
    trainingPhase: 'Offseason / Build-Up',
    category: 'PlyoCare Work',
    subcategory: 'Arm Action',
    workoutName: 'Pivot Pickoff Throws',
    sessionTiming: 'Pre-throw or throwing block',
    defaultIntensity: 'Low-Med',
    defaultVolume: '2-4 sets x 3-10 reps',
    equipment: 'PlyoCare-style balls; wall/net',
    metricsToTrack: ['arm_feel', 'intent', 'throw_quality'],
    ageEligibilityNotes: 'Youth: 1-2 sets; HS+: 2-4 sets',
    coachNotes: 'Follow reverse throws; build connection and direction to target.',
    sourceBasis: 'PlyoCare articles'
  },
  {
    playerType: 'Pitcher',
    level: 'High School',
    trainingPhase: 'Offseason / Build-Up',
    category: 'PlyoCare Work',
    subcategory: 'Constraint Drill',
    workoutName: 'Scap Retraction Throws',
    sessionTiming: 'Pre-throw or throwing block',
    defaultIntensity: 'Low-Med',
    defaultVolume: '2-4 sets x 3-10 reps',
    equipment: 'PlyoCare-style balls; wall/net',
    metricsToTrack: ['arm_feel', 'intent', 'velo_if_tracked'],
    ageEligibilityNotes: 'HS/College/Pro level',
    coachNotes: 'Use when athlete needs scap/arm path feel.',
    sourceBasis: 'Driveline throwing PDF'
  },
  {
    playerType: 'Pitcher',
    level: 'High School',
    trainingPhase: 'Offseason / Build-Up',
    category: 'PlyoCare Work',
    subcategory: 'Momentum Drill',
    workoutName: 'Roll-In Throws',
    sessionTiming: 'Pre-throw or throwing block',
    defaultIntensity: 'Med-High',
    defaultVolume: '2-4 sets x 3-10 reps',
    equipment: 'PlyoCare-style balls; wall/net',
    metricsToTrack: ['arm_feel', 'intent', 'velo_if_tracked'],
    ageEligibilityNotes: 'HS/College/Pro: progress by readiness',
    coachNotes: 'Build arm path and body momentum.',
    sourceBasis: 'Driveline PlyoCare work'
  },
  {
    playerType: 'Pitcher',
    level: 'High School',
    trainingPhase: 'Offseason / Build-Up',
    category: 'PlyoCare Work',
    subcategory: 'Rhythm Drill',
    workoutName: 'Rocker Throws',
    sessionTiming: 'Pre-throw or throwing block',
    defaultIntensity: 'Low-Med',
    defaultVolume: '2-4 sets x 3-10 reps',
    equipment: 'PlyoCare-style balls; wall/net',
    metricsToTrack: ['arm_feel', 'intent', 'throw_quality'],
    ageEligibilityNotes: 'HS/College/Pro level',
    coachNotes: 'Lower-half rhythm and trunk timing.',
    sourceBasis: '16-week throwing program'
  },

  // Program Days
  {
    playerType: 'Pitcher',
    level: 'High School',
    trainingPhase: 'Recovery',
    category: 'Throwing Program Day',
    subcategory: 'Day Template',
    workoutName: 'Recovery Day',
    sessionTiming: 'Full session',
    defaultIntensity: 'Low',
    defaultVolume: 'Light programmed volume; track RPE',
    equipment: 'PlyoCare; light catch; bands',
    metricsToTrack: ['arm_feel_pre', 'arm_feel_post', 'RPE', 'recovery_status'],
    ageEligibilityNotes: 'All levels eligibility',
    coachNotes: 'Low-effort day after game/bullpen or high-intent throwing.',
    sourceBasis: 'Driveline 16-week recovery'
  },
  {
    playerType: 'Pitcher',
    level: 'High School',
    trainingPhase: 'Velocity',
    category: 'Throwing Program Day',
    subcategory: 'Day Template',
    workoutName: 'Plyo Velo Day',
    sessionTiming: 'Full session',
    defaultIntensity: 'High',
    defaultVolume: 'Full intent sets per program',
    equipment: 'PlyoCare balls; radar optional',
    metricsToTrack: ['arm_feel_pre', 'arm_feel_post', 'RPE', 'velo', 'throw_count'],
    ageEligibilityNotes: 'Youth: exclude max-intent unless professionally supervised',
    coachNotes: 'High-intent PlyoCare velocity day; careful readiness screen needed.',
    sourceBasis: 'Driveline public velocity protocol'
  },
  {
    playerType: 'Pitcher',
    level: 'High School',
    trainingPhase: 'Skill / Pitch Design',
    category: 'Throwing Program Day',
    subcategory: 'Day Template',
    workoutName: 'Pitch Design Bullpen',
    sessionTiming: 'Full session',
    defaultIntensity: 'Med-High',
    defaultVolume: '20-35 pitches',
    equipment: 'Mound; balls; Rapsodo/TrackMan optional',
    metricsToTrack: ['strike_rate', 'velo', 'spin_rate', 'movement_profile'],
    ageEligibilityNotes: 'HS/College/Pro focus',
    coachNotes: 'Bullpen focused on pitch shapes, grips, and command targets.',
    sourceBasis: 'Pitch design guides'
  },

  // Hitter Warm up & prep
  {
    playerType: 'Hitter',
    level: 'High School',
    trainingPhase: 'All Phases',
    category: 'Warm-Up',
    subcategory: 'Warm-Up',
    workoutName: 'Hitter Dynamic Warm-Up',
    sessionTiming: 'Pre-hit',
    defaultIntensity: 'Low',
    defaultVolume: '5-12 minutes',
    equipment: 'Bands; open space; light bat',
    metricsToTrack: ['body_feel', 'swing_readiness', 'back_tightness'],
    ageEligibilityNotes: 'All ages',
    coachNotes: 'Full body prep before cage/on-field hitting.',
    sourceBasis: 'Hitter development guidelines'
  },
  {
    playerType: 'Hitter',
    level: 'High School',
    trainingPhase: 'All Phases',
    category: 'Warm-Up',
    subcategory: 'Mobility',
    workoutName: 'T-Spine Rotation Prep',
    sessionTiming: 'Pre-hit',
    defaultIntensity: 'Low',
    defaultVolume: '5-10 minutes',
    equipment: 'Bands; open space',
    metricsToTrack: ['body_feel', 'swing_readiness'],
    ageEligibilityNotes: 'All ages',
    coachNotes: 'Improve rotational readiness and upper body separation.',
    sourceBasis: 'Hitter mobility reset'
  },

  // Hitter Bat speed work
  {
    playerType: 'Hitter',
    level: 'High School',
    trainingPhase: 'Offseason / Build-Up / In-Season',
    category: 'Hitting Work',
    subcategory: 'Bat Speed',
    workoutName: 'Overload Bat Speed Swings',
    sessionTiming: 'Hitting block',
    defaultIntensity: 'High',
    defaultVolume: '3-6 rounds x 5-10 swings',
    equipment: 'Overload bat; sensor optional; tee/net',
    metricsToTrack: ['bat_speed', 'exit_velo', 'smash_factor', 'RPE'],
    ageEligibilityNotes: 'Youth: emphasize safe mechanics/control first',
    coachNotes: 'Use heavier bat/implement to build functional strength.',
    sourceBasis: 'Driveline public hitting'
  },
  {
    playerType: 'Hitter',
    level: 'High School',
    trainingPhase: 'Offseason / Build-Up / In-Season',
    category: 'Hitting Work',
    subcategory: 'Bat Speed',
    workoutName: 'Underload Bat Speed Swings',
    sessionTiming: 'Hitting block',
    defaultIntensity: 'High',
    defaultVolume: '3-6 rounds x 5-10 swings',
    equipment: 'Underload bat; sensor optional; tee/net',
    metricsToTrack: ['bat_speed', 'exit_velo', 'smash_factor', 'RPE'],
    ageEligibilityNotes: 'All levels. Maintain proper posture',
    coachNotes: 'Use lighter bat/implement for overspeed intent.',
    sourceBasis: 'Driveline public bat-speed protocol'
  },
  {
    playerType: 'Hitter',
    level: 'High School',
    trainingPhase: 'Offseason / Build-Up / In-Season',
    category: 'Hitting Work',
    subcategory: 'Bat-to-Ball',
    workoutName: 'Smash Factor Tee Drill',
    sessionTiming: 'Hitting block',
    defaultIntensity: 'Med',
    defaultVolume: '3-5 rounds x 8 swings',
    equipment: 'Bat; tee/net; balls',
    metricsToTrack: ['smash_factor', 'barrel_pct', 'exit_velo'],
    ageEligibilityNotes: 'Excellent for all ages',
    coachNotes: 'Measure flush contact and barrel efficiency.',
    sourceBasis: 'Contact quality tax'
  },
  {
    playerType: 'Hitter',
    level: 'High School',
    trainingPhase: 'Offseason / Build-Up / In-Season',
    category: 'Hitting Work',
    subcategory: 'Batted Ball',
    workoutName: 'Launch Angle Window Round',
    sessionTiming: 'Hitting block',
    defaultIntensity: 'Med-High',
    defaultVolume: '4 rounds x 8 swings',
    equipment: 'Bat; tee/net; balls',
    metricsToTrack: ['exit_velo', 'launch_angle', 'barrel_pct'],
    ageEligibilityNotes: 'HS/College/Pro focused',
    coachNotes: 'Train line-drive/fly-ball window to gap territory.',
    sourceBasis: 'Hitter flight analysis'
  },

  // Physical Prep/Strength
  {
    playerType: 'Pitcher',
    level: 'High School',
    trainingPhase: 'Physical Prep',
    category: 'Strength & Conditioning',
    subcategory: 'Strength',
    workoutName: 'Lower Body Strength',
    sessionTiming: 'Lift/conditioning',
    defaultIntensity: 'Med-High',
    defaultVolume: '3-4 sets x 6-8 reps',
    equipment: 'Gym equipment; med balls; bands',
    metricsToTrack: ['RPE', 'load', 'sets', 'reps', 'body_soreness'],
    ageEligibilityNotes: 'Youth: technique/bodyweight first',
    coachNotes: 'Squat/lunge/hinge-based strength for throwing baseline.',
    sourceBasis: 'Baseball physical taxonomy'
  },
  {
    playerType: 'Pitcher',
    level: 'High School',
    trainingPhase: 'Physical Prep',
    category: 'Strength & Conditioning',
    subcategory: 'Power',
    workoutName: 'Rotational Med Ball Throws',
    sessionTiming: 'Lift/conditioning',
    defaultIntensity: 'High',
    defaultVolume: '3 sets x 6 reps per side',
    equipment: 'Medicine balls (4-8 lbs); wall',
    metricsToTrack: ['RPE', 'movement_quality', 'body_feel'],
    ageEligibilityNotes: 'All levels. Instruct hip-shoulder separation',
    coachNotes: 'Build rotational power and sequencing of lower and upper halves.',
    sourceBasis: 'Athletic power research'
  }
];
