import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to log persistence database
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Ensure data folder exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial/default database structure
const DEFAULT_PROFILE = {
  name: "Tyler Krasner",
  position: "RHP (Pitcher Only)",
  height: "6'3\"",
  weight: "190 lbs",
  avgFbVelocity: 85,
  peakFbVelocity: 89,
  summerTeam: "Canes National 16U",
  goal: "Stay healthy and available through summer recruiting tournaments, maintain 85-89 mph, and build toward 87-89 mph average / 90-91+ mph peak by October junior events.",
  recruitingContext: "Entering Junior Year. College search focuses on high Academic D1/D3 baseball programs. direct phone recruiting, text, and email contact by college coaches begins on August 1.",
  gradYear: 2028,
  assignedFacility: "velocity-prime",
  assignedTrainer: "Coach Michael"
};

const DEFAULT_LOGS = [
  {
    id: "log-1",
    date: "2026-05-26",
    logType: "throwing",
    throwingType: "Game Appearance",
    pitchCount: 38,
    maxVelocity: 88,
    avgVelocity: 85,
    intensitySubjective: 8,
    notes: "Summer tournament season opener. Came in as relief. Felt loose, fastball had good life. Slider was tight but need more focus on consistency."
  },
  {
    id: "log-2",
    date: "2026-05-26",
    logType: "recovery",
    sorenessLevel: 2,
    sorenessArea: "Elbow",
    fatigueLevel: 4,
    sleepQuality: 8,
    notes: "Normal post-game stiffness, keeping a close eye on it."
  },
  {
    id: "log-3",
    date: "2026-05-27",
    logType: "throwing",
    throwingType: "Recovery Catch",
    pitchCount: 35,
    targetDistanceFeet: 90,
    intensitySubjective: 3,
    notes: "Day 1 post-game. Focus on light extension and flushing out the arm. Felt better as I threw."
  },
  {
    id: "log-4",
    date: "2026-05-27",
    logType: "recovery",
    sorenessLevel: 3,
    sorenessArea: "Shoulder",
    fatigueLevel: 5,
    sleepQuality: 7,
    notes: "Slight shoulder tightness, standard flushing throw sequence."
  },
  {
    id: "log-5",
    date: "2026-05-28",
    logType: "throwing",
    throwingType: "Catch Play",
    pitchCount: 45,
    targetDistanceFeet: 120,
    intensitySubjective: 5,
    notes: "Day 2 post-game. Extended out to 120ft. Arm speed felt natural, no nagging spots."
  },
  {
    id: "log-6",
    date: "2026-05-28",
    logType: "recovery",
    sorenessLevel: 1,
    sorenessArea: "None",
    fatigueLevel: 2,
    sleepQuality: 9,
    notes: "Felt very restored today. Great night of sleep."
  }
];

// Read database or write defaults
function loadDatabase() {
  let db: any = {};
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(content);
    } catch (e) {
      console.error("Database reading error, resetting with defaults", e);
    }
  }

  // Ensure baseline defaults
  if (!db.profile) {
    db.profile = DEFAULT_PROFILE;
  }
  if (!db.logs) {
    db.logs = DEFAULT_LOGS;
  }
  if (!db.schedule) {
    db.schedule = [
      {
        id: "event-1",
        date: "2026-05-26",
        eventName: "Summer opener vs Elite Bats",
        status: "Completed",
        innings: 2.0,
        peakVelo: 88.0,
        strikes: 25,
        walks: 1,
        er: 0,
        ks: 4,
        hits: 2,
        notes: "Fastball was tailing great. Curveball needs more rotation."
      },
      {
        id: "event-2",
        date: "2026-05-30",
        eventName: "Canes Doubleheader Tournament",
        status: "Scheduled",
        innings: 0.0,
        peakVelo: 0.0,
        strikes: 0,
        walks: 0,
        er: 0,
        ks: 0,
        hits: 0,
        notes: "Active showcase game availability - expected relief appearance."
      }
    ];
  }
  if (!db.calendarCsv) {
    db.calendarCsv = "2026-05-30:Canes Doubleheader Game 1,2026-06-03:Mid-Week Scrimmage,2026-06-06:Showcase Bullpen Session,2026-06-12:Under Armour Tournament Game";
  }
  if (!db.reminders) {
    db.reminders = {
      isEnabled: true,
      recipient: "michael@fusiontechdesign.com",
      recipientType: "email",
      reminderTime: "09:00",
      history: [
        {
          id: "rem-1",
          timestamp: "2026-05-27T09:00:00Z",
          recipient: "michael@fusiontechdesign.com",
          recipientType: "email",
          status: "Delivered",
          message: "Morning Tyler! Coach here. Your arm soreness is 1/10. Standard 150ft hybrid long-toss today. Finish strong with rotator band flushes. 🏋️"
        },
        {
          id: "rem-2",
          timestamp: "2026-05-28T09:00:00Z",
          recipient: "michael@fusiontechdesign.com",
          recipientType: "email",
          status: "Delivered",
          message: "Today is Bullpen Day (25-Pitch Target)! Focus on baseline fastball velocity parameters. Peak target today is 89+ mph. Let's work!"
        }
      ]
    };
  }

  // Ensure default coaches list
  if (!db.coaches) {
    db.coaches = ["michael@fusiontechdesign.com"];
  }

  // Multi-tenant: Initialize default white-labeled facilities
  if (!db.facilities) {
    db.facilities = {
      "velocity-prime": {
        id: "velocity-prime",
        name: "Velocity Sports Tech",
        logoText: "VELOCITY SPORTS TECH",
        welcomeMessage: "State-of-the-Art Arm Care & Dynamic Workload Analytics",
        accentColor: "teal",
        primaryColor: "#0f766e",
        domainSlug: "velocity-prime",
        trainers: [
          {
            id: "velocity-t1",
            firstName: "Michael",
            lastName: "Welches",
            email: "trainer.michael@velocityprime.com",
            authType: "google",
            createdAt: "2026-05-30T20:24:00Z"
          },
          {
            id: "velocity-t2",
            firstName: "James",
            lastName: "Gordon",
            email: "trainer.james@velocityprime.com",
            authType: "password",
            passwordValue: "driveline2026",
            createdAt: "2026-05-30T20:24:00Z"
          }
        ]
      },
      "pinnacle-pitching": {
        id: "pinnacle-pitching",
        name: "Pinnacle Pitching Academy",
        logoText: "PINNACLE PITCHING",
        welcomeMessage: "Elite Developmental Vector Logs & Velocity Tracking",
        accentColor: "indigo",
        primaryColor: "#4338ca",
        domainSlug: "pinnacle-pitching",
        trainers: [
          {
            id: "pinnacle-t1",
            firstName: "Sarah",
            lastName: "Jenkins",
            email: "sjenkins@pinnacle.com",
            authType: "google",
            createdAt: "2026-05-30T20:24:00Z"
          },
          {
            id: "pinnacle-t2",
            firstName: "Robert",
            lastName: "Miller",
            email: "bmiller@pinnacle.com",
            authType: "password",
            passwordValue: "pinnacle2026",
            createdAt: "2026-05-30T20:24:00Z"
          }
        ]
      },
      "prime-arm-lab": {
        id: "prime-arm-lab",
        name: "Prime Arm Lab Facility",
        logoText: "PRIME ARM LAB",
        welcomeMessage: "High-Velocity Biomechanical Rotational Strength Lab",
        accentColor: "rose",
        primaryColor: "#be123c",
        domainSlug: "prime-arm-lab",
        trainers: [
          {
            id: "primelab-t1",
            firstName: "David",
            lastName: "Wright",
            email: "dwright@primearmlab.com",
            authType: "google",
            createdAt: "2026-05-30T20:24:00Z"
          },
          {
            id: "primelab-t2",
            firstName: "Chris",
            lastName: "Sabo",
            email: "csabo@primearmlab.com",
            authType: "password",
            passwordValue: "primelab2026",
            createdAt: "2026-05-30T20:24:00Z"
          }
        ]
      },
      "golden-arm-athletic": {
        id: "golden-arm-athletic",
        name: "Golden Arm Athletics",
        logoText: "GOLDEN ARM ATHLETICS",
        welcomeMessage: "Pro-Grade Pitching Durability & Arm Compression Metrics",
        accentColor: "amber",
        primaryColor: "#b45309",
        domainSlug: "golden-arm-athletic",
        trainers: [
          {
            id: "golden-t1",
            firstName: "Sandy",
            lastName: "Koufax",
            email: "sandy@goldenarm.com",
            authType: "google",
            createdAt: "2026-05-30T20:24:00Z"
          },
          {
            id: "golden-t2",
            firstName: "Nolan",
            lastName: "Ryan",
            email: "nolan@goldenarm.com",
            authType: "password",
            passwordValue: "goldenarm2026",
            createdAt: "2026-05-30T20:24:00Z"
          }
        ]
      }
    };
  }

  // Backfill billing / sublicense configurations
  Object.keys(db.facilities).forEach((facId, idx) => {
    const f = db.facilities[facId];
    if (f.athleteMonthlyPrice === undefined) {
      f.athleteMonthlyPrice = facId === "prime-arm-lab" ? 149 : facId === "pinnacle-pitching" ? 139 : 129;
    }
    if (f.mimbleRoyaltyPercentage === undefined) {
      f.mimbleRoyaltyPercentage = 12; // Static or default premium royalty percentage paid to Mimble Inc.
    }
    if (f.billingEnabled === undefined) {
      f.billingEnabled = true;
    }
    if (f.stripeConnected === undefined) {
      f.stripeConnected = true;
    }
    if (!f.transactions) {
      // Seed with highly detailed, realistic signup transactions from previous mock athletes
      f.transactions = [
        {
          id: `tx-${idx}01`,
          athleteEmail: facId === "pinnacle-pitching" ? "jake.pro@gmail.com" : "carson.kelly@gmail.com",
          athleteName: facId === "pinnacle-pitching" ? "Jake Thompson" : "Carson Kelly",
          amountCharged: f.athleteMonthlyPrice,
          royaltyPercentage: f.mimbleRoyaltyPercentage,
          royaltyPaid: Number((f.athleteMonthlyPrice * f.mimbleRoyaltyPercentage / 100).toFixed(2)),
          date: "2026-05-28T14:22:00Z",
          status: "Settled"
        },
        {
          id: `tx-${idx}02`,
          athleteEmail: facId === "pinnacle-pitching" ? "miller.pitch@yahoo.com" : "marcus.semen@yahoo.com",
          athleteName: facId === "pinnacle-pitching" ? "Miller Pitcher" : "Marcus Semen",
          amountCharged: f.athleteMonthlyPrice,
          royaltyPercentage: f.mimbleRoyaltyPercentage,
          royaltyPaid: Number((f.athleteMonthlyPrice * f.mimbleRoyaltyPercentage / 100).toFixed(2)),
          date: "2026-05-29T10:15:00Z",
          status: "Settled"
        }
      ];
    }
  });

  // Ensure players map exists
  if (!db.players) {
    db.players = {};
  }

  // Auto-init initial athlete (Tyler Krasner) in default facility
  const cleanEmail = "michael@fusiontechdesign.com";
  if (Object.keys(db.players).length === 0) {
    db.players[cleanEmail] = {
      facility: "velocity-prime",
      profile: { 
        ...db.profile,
        facility: "velocity-prime"
      },
      logs: [...db.logs],
      schedule: [...db.schedule],
      calendarCsv: db.calendarCsv
    };
  } else {
    // Backfill any players missing facility
    Object.keys(db.players).forEach(email => {
      if (!db.players[email].facility) {
        db.players[email].facility = "velocity-prime";
      }
      if (!db.players[email].profile) {
        db.players[email].profile = { name: email.split('@')[0], facility: "velocity-prime" };
      }
      if (!db.players[email].profile.facility) {
        db.players[email].profile.facility = db.players[email].facility;
      }
    });
  }

  return db;
}

function saveDatabase(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function getOrCreatePlayer(db: any, email: string, name?: string, facilityId?: string) {
  if (!db.players) {
    db.players = {};
  }
  const cleanEmail = email.toLowerCase().trim();
  const resolvedFacility = (facilityId || "velocity-prime").toLowerCase().trim();

  // Create mock database with isolated data if player doesn't exist
  if (!db.players[cleanEmail]) {
    // Set customized team names depending on facility for high authenticity!
    let summerTeam = "Canes National 16U";
    if (resolvedFacility === "pinnacle-pitching") summerTeam = "Pinnacle Prospects Elite";
    if (resolvedFacility === "prime-arm-lab") summerTeam = "Prime Rotation Black";
    if (resolvedFacility === "golden-arm-athletic") summerTeam = "Golden Coast Nationals";

    db.players[cleanEmail] = {
      facility: resolvedFacility,
      profile: {
        name: name || cleanEmail.split('@')[0],
        position: "RHP (Pitcher)",
        height: "6'2\"",
        weight: "185 lbs",
        avgFbVelocity: resolvedFacility === "prime-arm-lab" ? 87 : 84,
        peakFbVelocity: resolvedFacility === "prime-arm-lab" ? 91 : 88,
        summerTeam: summerTeam,
        goal: "Increase throwing stability and build explosive arm deceleration speeds under white-label facility protocols.",
        recruitingContext: "Class of 2027 prospect. Direct phone scouting contact opens shortly.",
        facility: resolvedFacility
      },
      logs: [
        {
          id: "log-1",
          date: "2026-05-26",
          logType: "throwing",
          throwingType: "Game Appearance",
          pitchCount: 35,
          maxVelocity: resolvedFacility === "prime-arm-lab" ? 90 : 87,
          avgVelocity: resolvedFacility === "prime-arm-lab" ? 86 : 83,
          intensitySubjective: 8,
          notes: "Inaugural match of the summer. Fastball velocity was crisp. Arm acceleration felt premium."
        },
        {
          id: "log-2",
          date: "2026-05-26",
          logType: "recovery",
          sorenessLevel: 1,
          sorenessArea: "None",
          fatigueLevel: 3,
          sleepQuality: 8,
          notes: "Normal workload recovery, dynamic routines carried out."
        }
      ],
      schedule: [
        {
          id: "event-1",
          date: "2026-05-26",
          eventName: "Sizzling Summer Opener Showcase",
          status: "Completed",
          innings: 2.0,
          peakVelo: resolvedFacility === "prime-arm-lab" ? 90.0 : 87.0,
          strikes: 22,
          walks: 0,
          er: 0,
          ks: 3,
          hits: 1,
          notes: "Excellent spin efficiency, located well on lower coordinates."
        }
      ],
      calendarCsv: "2026-05-30:Hosted Doubleheader,2026-06-03:Standard Bullpen Sequence"
    };
  }

  // Ensure facility assignments are synchronized
  if (!db.players[cleanEmail].facility) {
    db.players[cleanEmail].facility = resolvedFacility;
  }
  if (!db.players[cleanEmail].profile) {
    db.players[cleanEmail].profile = { name: name || cleanEmail.split('@')[0], facility: resolvedFacility };
  }
  if (!db.players[cleanEmail].profile.facility) {
    db.players[cleanEmail].profile.facility = db.players[cleanEmail].facility;
  }
  if (!db.players[cleanEmail].profile.gradYear) {
    db.players[cleanEmail].profile.gradYear = 2028;
  }
  if (!db.players[cleanEmail].profile.assignedFacility) {
    db.players[cleanEmail].profile.assignedFacility = db.players[cleanEmail].facility;
  }
  if (!db.players[cleanEmail].profile.assignedTrainer) {
    db.players[cleanEmail].profile.assignedTrainer = "Coach James";
  }
  if (!db.players[cleanEmail].assignedWorkouts) {
    db.players[cleanEmail].assignedWorkouts = [];
  }
  return db.players[cleanEmail];
}

function getPlayerContext(req: express.Request, db: any) {
  const email = req.headers["x-user-email"] as string;
  const name = req.headers["x-user-name"] as string;
  const facilityId = req.headers["x-facility-id"] as string || "velocity-prime";

  if (email && email.trim() !== "") {
    const cleanEmail = email.toLowerCase().trim();
    const player = getOrCreatePlayer(db, cleanEmail, name, facilityId);
    return { player, email: cleanEmail };
  } else {
    // Return backward compatible root database or the default player
    const cleanEmail = "michael@fusiontechdesign.com";
    const player = getOrCreatePlayer(db, cleanEmail, "Tyler Krasner", facilityId);
    return { player, email: cleanEmail };
  }
}

// API: Get logs and athlete profile with facility tenancy data
app.get("/api/data", (req, res) => {
  const db = loadDatabase();
  const { player, email } = getPlayerContext(req, db);
  res.json({
    profile: player.profile,
    logs: player.logs || [],
    schedule: player.schedule || [],
    calendarCsv: player.calendarCsv || "",
    currentUser: email,
    facilities: db.facilities || {},
    activeFacilityId: player.facility || "velocity-prime",
    assignedWorkouts: player.assignedWorkouts || []
  });
});

// API: Save profile
app.post("/api/profile", (req, res) => {
  const db = loadDatabase();
  const { player } = getPlayerContext(req, db);
  player.profile = { ...player.profile, ...req.body };
  saveDatabase(db);
  res.json({ success: true, profile: player.profile });
});

// API: Add log
app.post("/api/logs", (req, res) => {
  const db = loadDatabase();
  const { player } = getPlayerContext(req, db);
  const newLog = {
    id: (req.body.logType || "log") + "-" + Date.now(),
    date: req.body.date || new Date().toISOString().split("T")[0],
    ...req.body
  };
  if (!player.logs) player.logs = [];
  player.logs.unshift(newLog); // Put new logs at the beginning
  saveDatabase(db);
  res.json({ success: true, log: newLog });
});

// API: Delete log
app.delete("/api/logs/:id", (req, res) => {
  const db = loadDatabase();
  const { player } = getPlayerContext(req, db);
  if (!player.logs) player.logs = [];
  const initialCount = player.logs.length;
  player.logs = player.logs.filter((log: any) => log.id !== req.params.id);
  if (player.logs.length < initialCount) {
    saveDatabase(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Log not found" });
  }
});

// API: Upsert schedule item
app.post("/api/schedule", (req, res) => {
  const db = loadDatabase();
  const { player } = getPlayerContext(req, db);
  if (!player.schedule) player.schedule = [];
  const existingIdx = player.schedule.findIndex((s: any) => s.id === req.body.id);
  
  if (existingIdx > -1) {
    player.schedule[existingIdx] = req.body;
  } else {
    const newItem = {
      id: "schedule-" + Date.now(),
      ...req.body
    };
    player.schedule.push(newItem);
  }
  
  saveDatabase(db);
  res.json({ success: true, schedule: player.schedule });
});

// API: Save raw calendar CSV from AthletePage
app.post("/api/schedule/csv", (req, res) => {
  const db = loadDatabase();
  const { player } = getPlayerContext(req, db);
  player.calendarCsv = req.body.csv || "";
  saveDatabase(db);
  res.json({ success: true, calendarCsv: player.calendarCsv });
});

// API: Delete schedule item
app.delete("/api/schedule/:id", (req, res) => {
  const db = loadDatabase();
  const { player } = getPlayerContext(req, db);
  if (!player.schedule) player.schedule = [];
  player.schedule = player.schedule.filter((s: any) => s.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// API: Coaches list configuration
app.get("/api/coaches", (req, res) => {
  const db = loadDatabase();
  const coaches = db.coaches || ["michael@fusiontechdesign.com"];
  res.json({ coaches });
});

app.post("/api/coaches", (req, res) => {
  const db = loadDatabase();
  const { email } = req.body;
  if (email && email.trim() !== "") {
    if (!db.coaches) db.coaches = ["michael@fusiontechdesign.com"];
    const clean = email.toLowerCase().trim();
    if (!db.coaches.includes(clean)) {
      db.coaches.push(clean);
      saveDatabase(db);
    }
  }
  res.json({ success: true, coaches: db.coaches });
});

app.delete("/api/coaches/:email", (req, res) => {
  const db = loadDatabase();
  if (!db.coaches) db.coaches = ["michael@fusiontechdesign.com"];
  const toRemove = req.params.email.toLowerCase().trim();
  // Prevent removing owner
  if (toRemove !== "michael@fusiontechdesign.com") {
    db.coaches = db.coaches.filter((c: string) => c !== toRemove);
    saveDatabase(db);
  }
  res.json({ success: true, coaches: db.coaches });
});

// API: Coach dashboard reporting metrics with tenant isolation
app.get("/api/coach/reporting", (req, res) => {
  const db = loadDatabase();
  const todayStr = "2026-05-30"; // Context current date
  const activeFacilityId = (req.headers["x-facility-id"] as string || "velocity-prime").toLowerCase().trim();

  // Filter players strictly assigned to the requested facility (data isolation!)
  const filteredPlayers = Object.entries(db.players || {}).filter(([_, pData]: [string, any]) => {
    const playerFacility = (pData.facility || pData.profile?.facility || "velocity-prime").toLowerCase().trim();
    return playerFacility === activeFacilityId;
  });

  const reportingPlayers = filteredPlayers.map(([email, pData]: [string, any]) => {
    const logsList = pData.logs || [];
    const scheduleList = pData.schedule || [];
    const profileData = pData.profile || {};

    // 1. Compliance: Has throwing, strength, or recovery, or compliance log today or within last 24h
    const completedToday = logsList.some((l: any) => l.date === todayStr);

    // 2. Recovery assessment (latest recovery log)
    const recLogs = logsList.filter((l: any) => l.logType === "recovery");
    const latestRec = recLogs[0];
    const latestSoreness = latestRec ? Number(latestRec.sorenessLevel || 1) : 1;
    const latestSorenessArea = latestRec ? latestRec.sorenessArea || "None" : "None";
    const latestFatigue = latestRec ? Number(latestRec.fatigueLevel || 2) : 2;

    // Soreness alert triggers
    const sorenessAlert = latestSoreness >= 5 || 
      ((latestSorenessArea === "Elbow" || latestSorenessArea === "Shoulder") && latestSoreness >= 3);

    // 3. Upcoming Games (within 7 days of 2026-05-30)
    const hasUpcomingGames = scheduleList.some((s: any) => {
      const diffTime = new Date(s.date).getTime() - new Date(todayStr).getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return s.status === "Scheduled" && diffDays >= 0 && diffDays <= 7;
    });

    // 4. Velocity progression
    const throwLogs = logsList.filter((l: any) => l.logType === "throwing" && l.maxVelocity);
    let trendDirection: "up" | "down" | "flat" = "flat";
    let trendVeloDiff = 0;

    if (throwLogs.length >= 2) {
      trendVeloDiff = throwLogs[0].maxVelocity - throwLogs[1].maxVelocity;
      trendDirection = trendVeloDiff > 0 ? "up" : trendVeloDiff < 0 ? "down" : "flat";
    } else if (throwLogs.length === 1 && profileData.peakFbVelocity) {
      trendVeloDiff = throwLogs[0].maxVelocity - profileData.peakFbVelocity;
      trendDirection = trendVeloDiff > 0 ? "up" : trendVeloDiff < 0 ? "down" : "flat";
    }

    // 5. Compliance rate in the trailing week
    const lastDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(new Date(todayStr).getTime() - i * 24 * 60 * 60 * 1000);
      return d.toISOString().split("T")[0];
    });
    const completedDaysCount = lastDates.filter(d => logsList.some((l: any) => l.date === d)).length;
    const compliancePercentage = Math.round((completedDaysCount / 7) * 100);

    return {
      email,
      profile: profileData,
      logsCount: logsList.length,
      complianceToday: completedToday,
      sorenessAlert,
      latestSoreness,
      latestSorenessArea,
      latestFatigue,
      upcomingGames: hasUpcomingGames,
      velocityTrends: {
        direction: trendDirection,
        change: trendVeloDiff
      },
      complianceRate: compliancePercentage,
      recentLogs: logsList.slice(0, 5)
    };
  });

  res.json({ players: reportingPlayers, facilities: db.facilities || {} });
});

// API: Create an individual player
app.post("/api/players/create", (req, res) => {
  const db = loadDatabase();
  const { email, name, position, gradYear, height, weight, assignedFacility, assignedTrainer, goal, recruitingContext } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ error: "Player email is required" });
  }
  const cleanEmail = email.toLowerCase().trim();
  const facId = (assignedFacility || "velocity-prime").toLowerCase().trim();
  
  db.players[cleanEmail] = {
    facility: facId,
    profile: {
      name: name || cleanEmail.split('@')[0],
      position: position || "RHP (Pitcher)",
      height: height || "6'2\"",
      weight: weight || "185 lbs",
      avgFbVelocity: 82,
      peakFbVelocity: 85,
      summerTeam: "Canes Prospects",
      goal: goal || "Maintain arm strength and peak recruiting eligibility.",
      recruitingContext: recruitingContext || `Class of ${gradYear || 2028} athlete. Recruiting window opens August 1st of Junior Year.`,
      gradYear: Number(gradYear) || 2028,
      assignedFacility: facId,
      assignedTrainer: assignedTrainer || "Coach Michael",
      facility: facId
    },
    logs: [],
    schedule: [],
    calendarCsv: "",
    assignedWorkouts: []
  };

  // Record a transaction for multi-tenant billing
  const facility = db.facilities[facId];
  if (facility && facility.billingEnabled) {
    const price = facility.athleteMonthlyPrice ?? 129;
    const royaltyPercentage = facility.mimbleRoyaltyPercentage ?? 12;
    const royaltyAmt = Number((price * royaltyPercentage / 100).toFixed(2));
    if (!facility.transactions) {
      facility.transactions = [];
    }
    facility.transactions.push({
      id: "tx-" + Date.now(),
      athleteEmail: cleanEmail,
      athleteName: name || cleanEmail.split('@')[0],
      amountCharged: price,
      royaltyPercentage,
      royaltyPaid: royaltyAmt,
      date: new Date().toISOString(),
      status: "Succeeded"
    });
  }

  saveDatabase(db);
  res.json({ success: true, player: db.players[cleanEmail], facilities: db.facilities });
});

// API: Bulk import players via CSV
app.post("/api/players/import", (req, res) => {
  const db = loadDatabase();
  const { csvText, facilityId } = req.body;
  if (!csvText || !csvText.trim()) {
    return res.status(400).json({ error: "CSV text is required" });
  }

  const facId = (facilityId || "velocity-prime").toLowerCase().trim();
  const lines = csvText.split("\n");
  
  // Try to find headers
  let headers = ['email', 'name', 'position', 'gradyear', 'height', 'weight', 'trainer'];
  let startIndex = 0;
  
  if (lines[0].includes(",") && (lines[0].toLowerCase().includes("email") || lines[0].toLowerCase().includes("name"))) {
    headers = lines[0].split(",").map((h: string) => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, ""));
    startIndex = 1;
  }

  let importedCount = 0;
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(",").map((p: string) => p.trim());
    const row: any = {};
    headers.forEach((header: string, index: number) => {
      row[header] = parts[index] || "";
    });

    const email = row.email || row.player_email || row.username || parts[0];
    if (!email || !email.includes("@")) continue;
    const cleanEmail = email.toLowerCase().trim();
    const name = row.name || row.player_name || parts[1] || cleanEmail.split('@')[0];
    const position = row.position || parts[2] || "RHP (Pitcher)";
    const gradYear = Number(row.gradyear || row.grad_year || parts[3]) || 2028;
    const height = row.height || parts[4] || "6'2\"";
    const weight = row.weight || parts[5] || "185 lbs";
    const trainer = row.trainer || row.assignedtrainer || row.assigned_trainer || parts[6] || "Coach James";

    db.players[cleanEmail] = {
      facility: facId,
      profile: {
        name,
        position,
        height,
        weight,
        avgFbVelocity: 82,
        peakFbVelocity: 85,
        summerTeam: "Canes Prospects",
        goal: "Maintain arm strength and peak recruiting eligibility.",
        recruitingContext: `Class of ${gradYear} baseball athlete. Contact session starts August 1st of Junior Year.`,
        gradYear,
        assignedFacility: facId,
        assignedTrainer: trainer,
        facility: facId
      },
      logs: [],
      schedule: [],
      calendarCsv: "",
      assignedWorkouts: []
    };
    importedCount++;
  }

  saveDatabase(db);
  res.json({ success: true, importedCount });
});

// API: Assign workout to athlete
app.post("/api/coach/assign-workout", (req, res) => {
  const db = loadDatabase();
  const { athleteEmail, date, workoutName, category, subcategory, defaultIntensity, defaultVolume, equipment, coachNotes, metricsToTrack, assignedTrainer, assignedFacility } = req.body;
  
  if (!athleteEmail || !date || !workoutName) {
    return res.status(400).json({ error: "Missing required fields athleteEmail, date, or workoutName" });
  }

  const cleanEmail = athleteEmail.toLowerCase().trim();
  if (!db.players[cleanEmail]) {
    return res.status(404).json({ error: "Athlete not found" });
  }

  if (!db.players[cleanEmail].assignedWorkouts) {
    db.players[cleanEmail].assignedWorkouts = [];
  }

  const newAssignment = {
    id: "assignment-" + Date.now(),
    date,
    workoutName,
    category,
    subcategory: subcategory || "",
    defaultIntensity: defaultIntensity || "Med",
    defaultVolume: defaultVolume || "",
    equipment: equipment || "",
    athleteEmail: cleanEmail,
    assignedTrainer: assignedTrainer || db.players[cleanEmail].profile?.assignedTrainer || "Coach James",
    assignedFacility: assignedFacility || db.players[cleanEmail].facility || "velocity-prime",
    coachNotes: coachNotes || "",
    metricsToTrack: metricsToTrack || [],
    status: "pending"
  };

  db.players[cleanEmail].assignedWorkouts.push(newAssignment);
  saveDatabase(db);
  res.json({ success: true, assignment: newAssignment, assignedWorkouts: db.players[cleanEmail].assignedWorkouts });
});

// API: Delete an assigned workout
app.post("/api/coach/delete-workout", (req, res) => {
  const db = loadDatabase();
  const { athleteEmail, assignmentId } = req.body;
  if (!athleteEmail || !assignmentId) {
    return res.status(400).json({ error: "Missing athleteEmail or assignmentId" });
  }
  const cleanEmail = athleteEmail.toLowerCase().trim();
  if (!db.players[cleanEmail]) {
    return res.status(404).json({ error: "Athlete not found" });
  }
  if (db.players[cleanEmail].assignedWorkouts) {
    db.players[cleanEmail].assignedWorkouts = db.players[cleanEmail].assignedWorkouts.filter((w: any) => w.id !== assignmentId);
    saveDatabase(db);
  }
  res.json({ success: true, assignedWorkouts: db.players[cleanEmail].assignedWorkouts || [] });
});

// API: Coach updates specified athlete's profile (including assignedFacility and assignedTrainer)
app.post("/api/coach/update-athlete-profile", (req, res) => {
  const db = loadDatabase();
  const { athleteEmail, profileUpdates } = req.body;
  if (!athleteEmail) {
    return res.status(400).json({ error: "Missing athleteEmail parameter" });
  }
  const cleanEmail = athleteEmail.toLowerCase().trim();
  if (!db.players[cleanEmail]) {
    return res.status(404).json({ error: "Athlete profile not found" });
  }

  // Update profile metrics/assignments
  db.players[cleanEmail].profile = {
    ...(db.players[cleanEmail].profile || {}),
    ...profileUpdates
  };

  // Sync core tenant facility ID if facility was assigned
  if (profileUpdates.assignedFacility) {
    db.players[cleanEmail].facility = profileUpdates.assignedFacility;
  }

  saveDatabase(db);
  res.json({ success: true, profile: db.players[cleanEmail].profile });
});

// API: Athlete completes an assigned workout, updating status to completed and creating matching log
app.post("/api/player/complete-workout", (req, res) => {
  const db = loadDatabase();
  const { athleteEmail, assignmentId, logData } = req.body;

  if (!athleteEmail || !assignmentId) {
    return res.status(400).json({ error: "Missing athleteEmail or assignmentId" });
  }

  const cleanEmail = athleteEmail.toLowerCase().trim();
  if (!db.players[cleanEmail]) {
    return res.status(404).json({ error: "Athlete not found" });
  }

  const workouts = db.players[cleanEmail].assignedWorkouts || [];
  const workoutIdx = workouts.findIndex((w: any) => w.id === assignmentId);
  if (workoutIdx === -1) {
    return res.status(404).json({ error: "Assigned workout not found" });
  }

  // Mark pending workout as completed
  workouts[workoutIdx].status = "completed";

  // Create corresponding log in athlete's logs array
  if (!db.players[cleanEmail].logs) {
    db.players[cleanEmail].logs = [];
  }

  const newLog = {
    id: (logData.logType || "strength") + "-" + Date.now(),
    date: workouts[workoutIdx].date,
    ...logData
  };
  db.players[cleanEmail].logs.unshift(newLog);

  saveDatabase(db);
  res.json({ success: true, assignedWorkouts: workouts, logs: db.players[cleanEmail].logs });
});

// API: Register custom white-labeled facility (or tenant)
app.post("/api/facilities", (req, res) => {
  const db = loadDatabase();
  const { name, logoText, welcomeMessage, accentColor, primaryColor } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: "Facility name is required." });
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  
  if (!db.facilities) db.facilities = {};
  db.facilities[id] = {
    id,
    name,
    logoText: logoText || name.toUpperCase(),
    welcomeMessage: welcomeMessage || "Premium athletic pitching development programs",
    accentColor: accentColor || "cyan",
    primaryColor: primaryColor || "#06b6d4",
    domainSlug: id
  };

  saveDatabase(db);
  res.json({ success: true, facility: db.facilities[id], facilities: db.facilities });
});

// API: Edit custom white-labeled facility configurations
app.post("/api/facilities/:id", (req, res) => {
  const db = loadDatabase();
  const facilityId = req.params.id;

  if (!db.facilities || !db.facilities[facilityId]) {
    return res.status(404).json({ error: "White-labeled facility not found." });
  }

  db.facilities[facilityId] = {
    ...db.facilities[facilityId],
    ...req.body,
    id: facilityId // preserve original ID
  };

  saveDatabase(db);
  res.json({ success: true, facility: db.facilities[facilityId], facilities: db.facilities });
});

// API: Shift athlete to specific facility context (Demo simulation)
app.post("/api/player/change-facility", (req, res) => {
  const db = loadDatabase();
  const { email, facilityId, name, assignedTrainer } = req.body;

  if (!email || !facilityId) {
    return res.status(400).json({ error: "Missing required attributes email and facilityId" });
  }

  const cleanEmail = email.toLowerCase().trim();
  const resolvedFac = facilityId.toLowerCase().trim();

  let player;
  if (db.players[cleanEmail]) {
    player = db.players[cleanEmail];
    player.facility = resolvedFac;
    if (!player.profile) {
      player.profile = {};
    }
    player.profile.facility = resolvedFac;
    player.profile.assignedFacility = resolvedFac;
    if (name) player.profile.name = name;
    if (assignedTrainer) player.profile.assignedTrainer = assignedTrainer;
  } else {
    // Create new player context automatically inside this facility
    player = getOrCreatePlayer(db, cleanEmail, name, resolvedFac);
    if (!player.profile) {
      player.profile = {};
    }
    player.profile.assignedFacility = resolvedFac;
    if (assignedTrainer) {
      player.profile.assignedTrainer = assignedTrainer;
    }
  }

  // Record a transaction for multi-tenant billing
  const facility = db.facilities[resolvedFac];
  if (facility && facility.billingEnabled) {
    const price = facility.athleteMonthlyPrice ?? 129;
    const royaltyPercentage = facility.mimbleRoyaltyPercentage ?? 12;
    const royaltyAmt = Number((price * royaltyPercentage / 100).toFixed(2));
    if (!facility.transactions) {
      facility.transactions = [];
    }
    
    // Check if athlete already billed to avoid dual logging
    const alreadyBilled = facility.transactions.some((tx: any) => tx.athleteEmail.toLowerCase() === cleanEmail);
    if (!alreadyBilled) {
      facility.transactions.push({
        id: "tx-" + Date.now(),
        athleteEmail: cleanEmail,
        athleteName: player.profile.name || cleanEmail.split('@')[0],
        amountCharged: price,
        royaltyPercentage,
        royaltyPaid: royaltyAmt,
        date: new Date().toISOString(),
        status: "Succeeded"
      });
    }
  }

  saveDatabase(db);
  res.json({ success: true, player, facilities: db.facilities });
});

// API: Get daily reminder settings
app.get("/api/reminders", (req, res) => {
  const db = loadDatabase();
  res.json(db.reminders || { isEnabled: false, recipient: "", recipientType: "email", reminderTime: "09:00", history: [] });
});

// API: Update daily reminder settings
app.post("/api/reminders", (req, res) => {
  const db = loadDatabase();
  db.reminders = {
    ...(db.reminders || { history: [] }),
    ...req.body
  };
  saveDatabase(db);
  res.json({ success: true, reminders: db.reminders });
});

// API: Trigger immediate sample notification dispatch for workout remind
app.post("/api/reminders/send-test", async (req, res) => {
  const db = loadDatabase();
  const remindersConf = db.reminders || {};
  const recipient = req.body.recipient || remindersConf.recipient || "michael@fusiontechdesign.com";
  const recipientType = req.body.recipientType || remindersConf.recipientType || "email";

  let reminderMsg = `Morning Tyler! Coach here. Based on your current arm recovery profile, it is workout time! Complete your warmups, j-bands rotators, throwing sequence & Biocore block 🏋️. Report your metrics!`;

  const ai = getAiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Draft a short, energetic, casual SMS/Email coaching reminder text to 16-year-old RHP prospect Tyler Krasner. 
The alert is sent at 9:00 AM to motivate him to complete his daily Driveline throwing, arm care, or Biocore strength workout today. 
Keep it under 160 characters (like a SMS text). Mention keeping his arm safe and building toward college recruiting showcases in October. Be encouraging and use 2 baseball/fitness emojis!`,
      });
      if (response.text) {
        reminderMsg = response.text.trim();
      }
    } catch (e) {
      console.warn("Failed to generate custom AI reminder text, using fallback reminder", e);
    }
  }

  const newReminderLog = {
    id: "rem-test-" + Date.now(),
    timestamp: new Date().toISOString(),
    recipient: recipient,
    recipientType: recipientType,
    status: "Delivered",
    message: reminderMsg
  };

  if (!db.reminders) {
    db.reminders = { isEnabled: true, recipient, recipientType, reminderTime: "09:00", history: [] };
  }
  if (!db.reminders.history) {
    db.reminders.history = [];
  }

  db.reminders.history.unshift(newReminderLog);
  if (db.reminders.history.length > 20) {
    db.reminders.history = db.reminders.history.slice(0, 20);
  }

  saveDatabase(db);
  res.json({ success: true, reminder: newReminderLog, reminders: db.reminders });
});


// API: Lazy-initialized Coach AI Advisor (Gemini integration)
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY environment variable is not defined. Falling back to rule-based coach logic.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}

// API: Get Pitching Coach Daily Plan
app.post("/api/coach", async (req, res) => {
  const db = loadDatabase();
  const { player } = getPlayerContext(req, db);
  const todayDate = req.body.todayDate || "2026-05-29";
  const userSoreness = Number(req.body.soreness) || 1;
  const userSorenessArea = req.body.sorenessArea || "None";
  const userFatigue = Number(req.body.fatigue) || 2;
  const userNotes = req.body.notes || "";
  const inTournament = req.body.inTournament === true;

  // Rule-based calculations as backup/context builder
  // Check throwing history to find the most recent game and its pitch count
  const sortedThrowingLogs = [...(player.logs || [])]
    .filter((l: any) => l.logType === "throwing")
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const lastGame = sortedThrowingLogs.find((l: any) => l.throwingType === "Game Appearance");
  let daysSinceGame = 999;
  let lastGamePitches = 0;

  if (lastGame) {
    const gameTime = new Date(lastGame.date).getTime();
    const todayTime = new Date(todayDate).getTime();
    daysSinceGame = Math.round((todayTime - gameTime) / (1000 * 60 * 60 * 24));
    lastGamePitches = lastGame.pitchCount || 0;
  }

  // Baseline advice fallback structure
  let generatedPlan = {
    todayPlan: "",
    whyThisPlan: "",
    whatToLog: "",
    adjustmentRule: "",
    date: todayDate,
    isAiGenerated: false
  };

  // Base rule guidance
  if (userSoreness >= 7) {
    generatedPlan.todayPlan = "### 🛑 RED LIGHT STATUS: ACTIVE ARM CARE & TOTAL REST\nNo throwing permitted today under any circumstances.";
    generatedPlan.whyThisPlan = `Tyler, your arm soreness is logged at **${userSoreness}/10 (${userSorenessArea})**. This meets our **RED LIGHT criteria (soreness 7+ or sharp pain)**. Workload safety is our top priority.`;
    generatedPlan.whatToLog = "* Log complete throwing shutdown (0 throws).\n* Log notes on whether soreness changes with light movement.\n* Track any signs of sharp pain, numbness, or tingling.";
    generatedPlan.adjustmentRule = "⚠️ **CRITICAL ADVICE:** You are not allowed to throw today. If you feel sharp pain, worsening tightness, numbness, or tingling, stop physical work entirely and contact a qualified medical professional, physical therapist, or team trainer immediately.";
  } else if (userSoreness >= 4) {
    generatedPlan.todayPlan = "### 🟡 YELLOW LIGHT STATUS: MODIFIED LOW-INTENSITY ACTIVE RECOVERY\n* **Shutdown Intensive Throwing:** No bullpen, no game appearances, no high-intensity throwing.\n* **Throwing Option:** If throwing at all, reduce catching distance to a MAXIMUM of 60 ft, and throw no more than 15-20 light tosses with absolute ease (focus on perfect spin, minimal effort).\n* **Arm Care Action:** Perform light rubber bands protocols, shoulder YWTs, and active foam-rolling on upper back.";
    generatedPlan.whyThisPlan = `Tyler, your reported soreness is at a moderated high **${userSoreness}/10 (${userSorenessArea})**. In the **YELLOW (soreness 4-6)** range, we automatically reduce volume and intensity of catch play by 50% to prevent microtears while flushing blood tissue.`;
    generatedPlan.whatToLog = "* Subjective arm feeling pre and post light throws.\n* Exact throwing distance and count (target <20 throws at 60 ft).\n* Strength / shoulder care focus.";
    generatedPlan.adjustmentRule = "🔄 **YELLOW ADVICE:** If soreness increases to a 7 during light catch play, or if you feel sharp pain, stop immediately. Do not push to reach a specific training distance.";
  } else {
    // GREEN LIGHT: Base recommendations based on game history
    if (lastGame && daysSinceGame === 1) {
      // Day 1 after Game
      if (lastGamePitches <= 20) {
        generatedPlan.todayPlan = "### 🟢 Day 1 Post-Game: Recovery Catch Play\n* **Interval Distance:** 60-90 feet.\n* **Throw Count:** 30-40 controlled throws of light intensity.\n* **Sleeper Stretch / Mobility:** 2 sets of 10 sleeper-stretches and shoulder internal rotation flushes.";
        generatedPlan.whyThisPlan = `Yesterday on ${lastGame.date}, you threw **${lastGamePitches} pitches** in a game. Under our workload model (1-20 pitches), today is a **Recovery Catch (60-90ft)** day to promote blood flow and arm rehabilitation. You will be available to throw full speed again tomorrow if soreness is low.`;
      } else if (lastGamePitches <= 40) {
        generatedPlan.todayPlan = "### 🟢 Day 1 Post-Game: Recovery Catch Play\n* **Interval Distance:** 60-90 feet.\n* **Throw Count:** 30-40 controlled, easy throws.\n* **Arm Care Routine:** Band work and foam roll back.";
        generatedPlan.whyThisPlan = `Yesterday on ${lastGame.date}, you threw **${lastGamePitches} pitches** in a game. Since you were in the **21-40 pitch bracket**, today is Day 1 of recovery. We throw recovery catch (60-90ft) today, followed by structural catch-play tomorrow, and full availability on Day 3.`;
      } else if (lastGamePitches <= 60) {
        generatedPlan.todayPlan = "### 🟢 Day 1 Post-Game: Recovery Catch Play (Low Intensity)\n* **Interval Distance:** 60-90 feet.\n* **Throw Count:** 30 controlled throws.\n* **Active Mobility:** High focus on rotational mobility and thoracic extension.";
        generatedPlan.whyThisPlan = `Yesterday on ${lastGame.date}, you threw **${lastGamePitches} pitches** in a game. For a **41-60 pitch outing**, you require a 2-day recovery segment. Today is Day 1 Recovery Catch, tomorrow will be Day 2 Recovery Catch, followed by Catch Play on Day 3, returning to availability on Day 4.`;
      } else {
        generatedPlan.todayPlan = "### 🟢 Day 1 Post-Game: Starter Recovery Protocol (No Throwing / Active Core)\n* **Throwing Status:** Full shutdown today (Day 1 after high count).\n* **Core Work:** Thoracic spine mobility, active hamstring flushes, light lower body flow.\n* **Flushing:** Cardio session (15-20 min light bike or jog) to cycle lactic acid and improve vascular restoration.";
        generatedPlan.whyThisPlan = `Yesterday on ${lastGame.date}, you worked a heavy load of **${lastGamePitches} pitches** in a game. This triggers our **61+ Starter Recovery Protocol**. No throwing on Day 1, followed by limited recovery distances starting tomorrow. No bullpens for 4 to 5 days.`;
      }
    } else if (lastGame && daysSinceGame === 2 && lastGamePitches > 20) {
      if (lastGamePitches <= 40) {
        generatedPlan.todayPlan = "### 🟢 Day 2 Post-Game: Structural Catch Play\n* **Interval Distance:** 90-120 feet.\n* **Throw Count:** 40-50 total throws. Progressively let your arm reach back easily.\n* **Arm Care:** Light j-bands and scapula contractions.";
        generatedPlan.whyThisPlan = `Two days ago on ${lastGame.date}, you threw a moderate pitch count of **${lastGamePitches} pitches**. Today is Day 2 Catch Play. You will be available for game/bullpen usage tomorrow.`;
      } else if (lastGamePitches <= 60) {
        generatedPlan.todayPlan = "### 🟢 Day 2 Post-Game: Secondary Recovery Catch\n* **Interval Distance:** 60-90 feet.\n* **Throw Count:** 30-40 easy throws.\n* **Arm Care:** Lightweight dumbbells and rotator cuff internal/external flushes.";
        generatedPlan.whyThisPlan = `Two days ago on ${lastGame.date}, you logged **${lastGamePitches} pitches**. Under our model, this triggers a **double recovery catch segment** (Days 1 and 2). Catch play will follow tomorrow.`;
      } else {
        generatedPlan.todayPlan = "### 🟢 Day 2 Post-Game: Starter Recovery Catch (60-90ft)\n* **Interval Distance:** 60-90 feet.\n* **Throw Count:** 30 Controlled tosses.\n* **Arm Care:** High focus on rotator cuff bands.";
        generatedPlan.whyThisPlan = `Yesterday on ${lastGame.date}, you logged a heavy **${lastGamePitches} pitch load**. Today is Day 2 of your Starter Recovery sequence. No high intensity work for another 3 days.`;
      }
    } else {
      // General Training Protocol
      if (inTournament) {
        generatedPlan.todayPlan = "### 🟢 Tournament Active Day: Catch Play & Game Preparedness\n* **Throwing Routine:** Standard pre-game catch play up to 120-150 feet if safe.\n* **Tournament Flexibility Rule:** Available out of bullpen as primary option. Keep counts monitored.\n* **No Bullpen:** Tournaments are active times. Do not schedule heavy bullpen sessions.";
        generatedPlan.whyThisPlan = "You have selected that you are currently in an active Summer Tournament block (Canes National 16U). We preserve your arm for games and stay highly flexible. Workload priority is availability.";
      } else {
        generatedPlan.todayPlan = "### 🟢 Standard Training Day: Hybrid Velocity / Catch Play\n* **Throwing Program:** Catch play reaching back to 150-180 feet (compression and extension).\n* **Bullpen Prep:** Focus on front-side extension and chest-forward delivery.\n* **Workplace Focus:** Maintaining throwing consistency and arm fitness.";
        generatedPlan.whyThisPlan = "With low soreness and no high pitch counts in the last 4 days, you are in a green zone. This enables standard junior season training to prepare for active tournament contact blocks.";
      }
    }
    generatedPlan.whatToLog = "* Log throwing type, max/average velocities.\n* Note any fatigue during long extension throwing.\n* Log strength workout if completed.";
    generatedPlan.adjustmentRule = "🔄 **GREEN ADVICE:** If any arm soreness spikes past a 3 during today's session, scale down immediately to easy catch play (<90 ft).";
  }

  // Attempt to call Gemini for hyper-personalized AI analyses
  const ai = getAiClient();
  if (ai) {
    try {
      console.log("Calling Gemini API to generate professional pitch coach feedback...");
      const systemPrompt = `You are Tyler Pitching Development Coach, an expert, private baseball developmental and athletic pitching coach guiding Tyler Krasner.

Tyler Profile Summary:
- Name: Tyler Krasner
- Position: RHP, pitcher only
- Height: 6'3", Weight: 190 lbs
- Current average FB velocity: 85 mph, current peak FB velocity: 89 mph
- Summer team: Canes National 16U
- Primary goals: stay healthy and available through summer recruiting tournaments, maintain 85-89 mph, build 87-89 avg & 90-91+ peak by October junior events.
- Recruiting context: Entering his junior year. Direct college phone contact starts August 1, 2026. Recruiting is the critical focus of this summer block!

Safety constraints:
- You are not a doctor or therapist. Do not diagnose injuries.
- If Tyler reports sharp pain, worsening tightness, numbness, tingling, or arm soreness 7/10 or higher, recommend stopping throwing immediately and contacting a qualified medical professional, coach, or trainer.
- Severe warning must be explicitly displayed and prominent if soreness is >= 7.

Workload rules to enforce exactly in your decisions:
If Tyler throws in a game:
- 1-20 pitches: next day recovery catch 60-90 ft, 30-40 throws. Day 2 available.
- 21-40 pitches: next day recovery catch, Day 2 catch play, Day 3 available if soreness is low.
- 41-60 pitches: next day recovery, Day 2 recovery catch, Day 3 catch play, Day 4 available or light bullpen.
- 61+ pitches: starter recovery protocol, no bullpens for 4-5 days.

Arm Soreness guidelines:
- Arm soreness 1-3: Green (Low soreness) -> Proceed as planned, execute training programs.
- Arm soreness 4-6: Yellow (Medium soreness) -> Reduce volume and intensity immediately. No bullpen. Light active recovery, shorten throwing to easy toss <60-90 ft.
- Arm soreness 7+: Red (High soreness) -> Strict shutdown: 0 throws today. Advise medical contact.

Summer Tournament Flexibility:
- Tournament blocks must remain flexible.
- Do not force or schedule structural bullpens during active tournaments.
- Prioritize arm durability, strikes, and recruiting readiness over chasing velocity.

Output Format:
You must provide your analysis in JSON with these exact string fields:
- "todayPlan": A detailed, action-oriented, clear daily program (with throwing distances, throw counts, drills, bands etc. in Markdown).
- "whyThisPlan": The deep developmental rationale based on Tyler's current phase, timeline to Aug 1 direct recruiting, recent pitch count logs, and physical soreness (in Markdown).
- "whatToLog": Bulleted text explaining exactly what metrics Tyler needs to record in his Airtable today (in Markdown).
- "adjustmentRule": Quick rules of thumb for modifying today's activity if soreness spikes or plans change on-site (in Markdown).

Remember: Be specific. Reference his 6'3" frame, August recruiting starting, Canes 16U team, 85-89 MPH goals, and historical logs.`;

      const promptContext = `
Analyze Tyler's status:
- Target Date: ${todayDate}
- User's Logged Soreness Today: ${userSoreness}/10 on ${userSorenessArea}
- Subjective Fatigue: ${userFatigue}/10
- Active Summer Tournament: ${inTournament ? "Yes (Canes 16U active tournament)" : "No (Normal training/prep week)"}
- User Notes: "${userNotes}"

Workload History (Most recent logs first):
${JSON.stringify((player.logs || []).slice(0, 6), null, 2)}

Calculate his exact program today. Deliver standard Coach Tyler advice. Return ONLY the JSON object. Do not include markdown wraps like \`\`\`json on the outer layer unless required, wait actually just return standard raw JSON or JSON text wrapped in \`\`\`json.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContext,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              todayPlan: { type: Type.STRING },
              whyThisPlan: { type: Type.STRING },
              whatToLog: { type: Type.STRING },
              adjustmentRule: { type: Type.STRING }
            },
            required: ["todayPlan", "whyThisPlan", "whatToLog", "adjustmentRule"]
          }
        }
      });

      const responseText = response.text || "";
      const parsedAiPlan = JSON.parse(responseText.trim());
      generatedPlan = {
        ...parsedAiPlan,
        date: todayDate,
        isAiGenerated: true
      };
      console.log("Successfully generated AI coaching plan via Gemini.");
    } catch (apiError) {
      console.error("Failed to generate AI plan with Gemini API key, using rule-based coaching fallback:", apiError);
    }
  }

  res.json(generatedPlan);
});

async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
