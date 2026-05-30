/**
 * Google Sheets API Service Client
 */

export interface GoogleSheetsDb {
  profile: any;
  logs: any[];
  schedule: any[];
  calendarCsvLine: string;
}

// Map sheets to grid coordinates or headers
const HEADERS = {
  Profile: ['Name', 'Position', 'Height', 'Weight', 'Avg FB Velocity', 'Peak FB Velocity', 'Summer Club', 'Goals', 'Recruiting Context'],
  Recovery: ['ID', 'Date', 'Soreness', 'Soreness Area', 'Fatigue', 'Sleep', 'Notes'],
  Throwing: ['ID', 'Date', 'Session Type', 'Throws/Pitches', 'Dist (ft)', 'Avg FB (mph)', 'Peak FB (mph)', 'Intensity', 'Notes'],
  Strength: ['ID', 'Date', 'Workout Type', 'Intensity', 'Notes'],
  Schedule: ['ID', 'Date', 'Event Name', 'Status', 'Innings', 'Peak Velo', 'Strikes', 'Walks', 'ER', 'Ks', 'Hits', 'Notes'],
  CalendarConfig: ['CSV Calendar Line']
};

/**
 * Creates sheet tabs and adds initial column headers to a fresh Spreadsheet
 */
export async function initializeSpreadsheet(accessToken: string, spreadsheetId: string) {
  try {
    // Add columns to each sheet
    const sheets = Object.keys(HEADERS);
    for (const sheetName of sheets) {
      const headers = (HEADERS as any)[sheetName];
      const range = `${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}1`;
      
      // We will perform a PUT to write the headers
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values: [headers]
        })
      });
    }

    // Initialize with a default profile
    const defaultProfile = [
      'Tyler Krasner',
      'RHP (Pitcher Only)',
      "6'3\"",
      '190 lbs',
      '85',
      '89',
      'Canes National 16U',
      'Stay healthy and available through summer recruiting tournaments, maintain 85-89 mph, and build toward 87-89 mph average / 90-91+ mph peak by October junior events.',
      "College search focuses on high Academic D1/D3 baseball. coaches contact block starts August 1st."
    ];
    await writeSheetRange(accessToken, spreadsheetId, 'Profile!A2:I2', [defaultProfile]);

    // Initialize Calendar Config with a single default CSV calendar line
    const defaultCalendarLine = ['2026-05-30:Canes Doubleheader Game 1,2026-06-03:Mid-Week Scrimmage,2026-06-06:Showcase Bullpen Session,2026-06-12:Under Armour Tournament Game,2026-06-20:Elite Velocity Classic'];
    await writeSheetRange(accessToken, spreadsheetId, 'CalendarConfig!A2', [defaultCalendarLine]);

    // Initialize with some default schedule events
    const defaultSchedule = [
      ['event-1', '2026-05-26', 'Summer opener vs Elite Bats', 'Completed', '2.0', '88.0', '25', '1', '0', '4', '2', 'Fastball was tailing great. Curveball needs more rotation.'],
      ['event-2', '2026-05-30', 'Canes Doubleheader Tournament', 'Scheduled', '0.0', '0.0', '0', '0', '0', '0', '0', 'Active showcase game availability - expected relief appearance.']
    ];
    await writeSheetRange(accessToken, spreadsheetId, 'Schedule!A2:L3', defaultSchedule);

  } catch (error) {
    console.error('Error initializing spreadsheet: ', error);
  }
}

/**
 * Creates a brand new spreadsheet in Google Sheets
 */
export async function createNewSpreadsheet(accessToken: string): Promise<string> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: 'Tyler Pitching Coach Database & Scheduler'
      },
      sheets: [
        { properties: { title: 'Profile' } },
        { properties: { title: 'Recovery' } },
        { properties: { title: 'Throwing' } },
        { properties: { title: 'Strength' } },
        { properties: { title: 'Schedule' } },
        { properties: { title: 'CalendarConfig' } }
      ]
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create spreadsheet: ' + response.statusText);
  }

  const result = await response.json();
  const spreadsheetId = result.spreadsheetId;
  
  // Set headers and initial metadata rows
  await initializeSpreadsheet(accessToken, spreadsheetId);
  
  return spreadsheetId;
}

/**
 * Utility to write range raw
 */
async function writeSheetRange(accessToken: string, spreadsheetId: string, range: string, values: any[][]) {
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values })
  });
}

/**
 * Append row to tab
 */
export async function appendRow(accessToken: string, spreadsheetId: string, sheetName: string, rowValues: any[]) {
  const range = `${sheetName}!A:A`;
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [rowValues]
    })
  });
  if (!response.ok) {
    throw new Error(`Failed to append row to ${sheetName}: ${response.statusText}`);
  }
}

/**
 * Loads entire database from a Google Sheets ID
 */
export async function fetchSpreadsheetDb(accessToken: string, spreadsheetId: string): Promise<GoogleSheetsDb> {
  // Fetch values from Profile, Recovery, Throwing, Strength, Schedule, CalendarConfig
  const ranges = ['Profile!A2:I2', 'Recovery!A2:G500', 'Throwing!A2:I500', 'Strength!A2:E500', 'Schedule!A2:L500', 'CalendarConfig!A2'];
  const fetchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${ranges.map(encodeURIComponent).join('&ranges=')}`;

  const response = await fetch(fetchUrl, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch spreadsheet values: ' + response.statusText);
  }

  const data = await response.json();
  const valueRanges = data.valueRanges || [];

  // Parse Profile row
  const profileRow = valueRanges[0]?.values?.[0] || [];
  const profile = {
    name: profileRow[0] || 'Tyler Krasner',
    position: profileRow[1] || 'RHP (Pitcher Only)',
    height: profileRow[2] || "6'3\"",
    weight: profileRow[3] || '190 lbs',
    avgFbVelocity: Number(profileRow[4]) || 85,
    peakFbVelocity: Number(profileRow[5]) || 89,
    summerTeam: profileRow[6] || 'Canes National 16U',
    goal: profileRow[7] || '',
    recruitingContext: profileRow[8] || ''
  };

  // Parse Recovery logs
  const recoveryRows = valueRanges[1]?.values || [];
  const recoveryLogs = recoveryRows.map((row: any) => ({
    id: row[0],
    date: row[1],
    logType: 'recovery',
    sorenessLevel: Number(row[2]) || 1,
    sorenessArea: row[3] || 'None',
    fatigueLevel: Number(row[4]) || 2,
    sleepQuality: Number(row[5]) || 8,
    notes: row[6] || ''
  }));

  // Parse Throwing logs
  const throwingRows = valueRanges[2]?.values || [];
  const throwingLogs = throwingRows.map((row: any) => ({
    id: row[0],
    date: row[1],
    logType: 'throwing',
    throwingType: row[2],
    pitchCount: Number(row[3]) || 0,
    targetDistanceFeet: row[4] ? Number(row[4]) : undefined,
    avgVelocity: row[5] ? Number(row[5]) : undefined,
    maxVelocity: row[6] ? Number(row[6]) : undefined,
    intensitySubjective: Number(row[7]) || 5,
    notes: row[8] || ''
  }));

  // Parse Strength logs
  const strengthRows = valueRanges[3]?.values || [];
  const strengthLogs = strengthRows.map((row: any) => ({
    id: row[0],
    date: row[1],
    logType: 'strength',
    workoutType: row[2],
    intensity: Number(row[3]) || 1,
    notes: row[4] || ''
  }));

  // Parse Schedule row efficiency records
  const scheduleRows = valueRanges[4]?.values || [];
  const schedule = scheduleRows.map((row: any) => ({
    id: row[0],
    date: row[1],
    eventName: row[2],
    status: row[3] || 'Scheduled',
    innings: Number(row[4]) || 0,
    peakVelo: Number(row[5]) || 0,
    strikes: Number(row[6]) || 0,
    walks: Number(row[7]) || 0,
    er: Number(row[8]) || 0,
    ks: Number(row[9]) || 0,
    hits: Number(row[10]) || 0,
    notes: row[11] || ''
  }));

  // Combine logs inside chronological array
  const logs = [...recoveryLogs, ...throwingLogs, ...strengthLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Parsing calendar CSV custom single line
  const calendarCsvLine = valueRanges[5]?.values?.[0]?.[0] || '2026-05-30:Canes Doubleheader Game 1,2026-06-03:Mid-Week Scrimmage';

  return {
    profile,
    logs,
    schedule,
    calendarCsvLine
  };
}

/**
 * Updates the Athlete profile range in the sheet
 */
export async function updateProfileInSheet(accessToken: string, spreadsheetId: string, profile: any) {
  const row = [
    profile.name,
    profile.position,
    profile.height,
    profile.weight,
    profile.avgFbVelocity,
    profile.peakFbVelocity,
    profile.summerTeam,
    profile.goal,
    profile.recruitingContext
  ];
  await writeSheetRange(accessToken, spreadsheetId, 'Profile!A2:I2', [row]);
}

/**
 * Updates the Calendar CSV single line cell config
 */
export async function updateCalendarCsvLineInSheet(accessToken: string, spreadsheetId: string, csvLine: string) {
  await writeSheetRange(accessToken, spreadsheetId, 'CalendarConfig!A2', [[csvLine]]);
}

/**
 * Deletes a row by matching ID column in a specific tab
 * Because Google Sheets REST API does not have indexed query deletion easily,
 * we can fetch the sheet rows, filter out by ID, and write back the entire values!
 * This is robust and fully safe for medium-sized pitching databases.
 */
export async function deleteRowFromSheet(accessToken: string, spreadsheetId: string, sheetName: string, id: string) {
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A:L`;
  const response = await fetch(getUrl, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) return;

  const data = await response.json();
  const rows: any[][] = data.values || [];
  if (rows.length <= 1) return; // Only header exists

  // Filter rows
  const headers = rows[0];
  const filteredBody = rows.slice(1).filter(row => row[0] !== id);
  const newValues = [headers, ...filteredBody];

  // Clear existing cells then write back the new array!
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A:L:clear`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  const range = `${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}${newValues.length}`;
  await writeSheetRange(accessToken, spreadsheetId, range, newValues);
}

/**
 * Updates a schedule row properties inside the sheet
 */
export async function saveScheduleRowInSheet(accessToken: string, spreadsheetId: string, item: any) {
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Schedule!A:L`;
  const response = await fetch(getUrl, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) return;

  const data = await response.json();
  const rows: any[][] = data.values || [];
  if (rows.length <= 1) {
    // Just append row
    const row = [item.id, item.date, item.eventName, item.status, item.innings, item.peakVelo, item.strikes, item.walks, item.er, item.ks, item.hits, item.notes];
    await appendRow(accessToken, spreadsheetId, 'Schedule', row);
    return;
  }

  const headers = rows[0];
  let found = false;
  const newRows = rows.map((row, idx) => {
    if (idx === 0) return row;
    if (row[0] === item.id) {
      found = true;
      return [item.id, item.date, item.eventName, item.status, item.innings, item.peakVelo, item.strikes, item.walks, item.er, item.ks, item.hits, item.notes];
    }
    return row;
  });

  if (!found) {
    newRows.push([item.id, item.date, item.eventName, item.status, item.innings, item.peakVelo, item.strikes, item.walks, item.er, item.ks, item.hits, item.notes]);
  }

  // Clear then write back updated set
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Schedule!A:L:clear`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  const range = `Schedule!A1:L${newRows.length}`;
  await writeSheetRange(accessToken, spreadsheetId, range, newRows);
}

/**
 * Saves raw schedule CSV config inside Google Sheets
 */
export async function saveCalendarCsvInSheet(accessToken: string, spreadsheetId: string, csv: string) {
  await writeSheetRange(accessToken, spreadsheetId, 'CalendarConfig!A2', [[csv]]);
}
