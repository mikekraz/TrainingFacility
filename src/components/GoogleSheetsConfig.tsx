import { useState, useEffect } from 'react';
import { googleSignIn, logout, getUserEmail, getAccessToken } from '../lib/firebaseAuth';
import { createNewSpreadsheet, updateCalendarCsvLineInSheet, fetchSpreadsheetDb } from '../lib/sheetsService';
import { Database, Link, RefreshCw, LogOut, LogIn, Check, Info, FileSpreadsheet, Key, AlertCircle } from 'lucide-react';


interface GoogleSheetsConfigProps {
  onSyncComplete: (db: any) => void;
  spreadsheetId: string | null;
  setSpreadsheetId: (id: string | null) => void;
  calendarCsvLine: string;
  setCalendarCsvLine: (csv: string) => void;
}

export default function GoogleSheetsConfig({
  onSyncComplete,
  spreadsheetId,
  setSpreadsheetId,
  calendarCsvLine,
  setCalendarCsvLine
}: GoogleSheetsConfigProps) {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [manualId, setManualId] = useState('');

  useEffect(() => {
    // Check if we already have an active session cached
    getAccessToken().then(tok => {
      if (tok) {
        setToken(tok);
        const email = getUserEmail();
        setUser({ email });
      }
    });

    const storedId = localStorage.getItem('tyler_pitcher_spreadsheet_id');
    if (storedId && !spreadsheetId) {
      setSpreadsheetId(storedId);
    }
  }, []);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setToken(res.accessToken);
        setUser(res.user);
        
        // Auto-refresh sheet if ID exists
        const storedId = localStorage.getItem('tyler_pitcher_spreadsheet_id') || spreadsheetId;
        if (storedId) {
          triggerSheetLoad(res.accessToken, storedId);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
      setToken(null);
      setSpreadsheetId(null);
      localStorage.removeItem('tyler_pitcher_spreadsheet_id');
      setSuccess('Logged out successfully. Falling back to local Express server database.');
    } catch (err: any) {
      setError(err?.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  const triggerSheetLoad = async (accessToken: string, id: string) => {
    setLoading(true);
    setError(null);
    try {
      const db = await fetchSpreadsheetDb(accessToken, id);
      onSyncComplete(db);
      setSpreadsheetId(id);
      localStorage.setItem('tyler_pitcher_spreadsheet_id', id);
      setCalendarCsvLine(db.calendarCsvLine);
      setSuccess('Successfully loaded and synced all pitching logs from Google Sheets!');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      console.error(err);
      setError('Could not fetch data sheets from spreadsheet. Please verify file sharing and columns are valid.');
    } finally {
      setLoading(false);
    }
  };

  // Create a brand spreadsheet
  const handleCreateSheet = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const id = await createNewSpreadsheet(token);
      setSpreadsheetId(id);
      localStorage.setItem('tyler_pitcher_spreadsheet_id', id);
      await triggerSheetLoad(token, id);
      setSuccess('Created and initialized "Tyler Pitching Coach Database & Scheduler" in your Google Sheets!');
    } catch (err: any) {
      setError(err?.message || 'Spreadsheet creation failed');
    } finally {
      setLoading(false);
    }
  };

  // Connect existing manual spreadsheet ID
  const handleConnectSheet = () => {
    if (!token || !manualId.trim()) return;
    // Extract ID if a URL is pasted
    let id = manualId.trim();
    if (id.includes('/d/')) {
      const parts = id.split('/d/');
      if (parts[1]) {
        id = parts[1].split('/')[0];
      }
    }
    triggerSheetLoad(token, id);
  };

  const handleSaveCalendarConfig = async () => {
    if (!token || !spreadsheetId) return;
    setLoading(true);
    setError(null);
    try {
      await updateCalendarCsvLineInSheet(token, spreadsheetId, calendarCsvLine);
      // Trigger a reload to sync profile
      await triggerSheetLoad(token, spreadsheetId);
      setSuccess('Updated calendar config line directly inside your Google Sheet config tab!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError('Failed to update calendar configuration in Google Sheet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black font-display tracking-tight text-white uppercase">
              Google Sheets Live cloud integration
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Switch the database storage directly to your personal Google Spreadsheet
            </p>
          </div>
        </div>

        {/* Auth Button Indicator */}
        <div>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-950 font-mono text-emerald-400 border border-emerald-500/10 px-2.5 py-1 rounded-xl">
                Active: {user.email}
              </span>
              <button
                onClick={handleLogout}
                disabled={loading}
                className="text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-400/10 px-3 py-1 rounded-lg border border-red-500/10 cursor-pointer active:scale-95 transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              disabled={loading}
              className="gsi-material-button text-xs font-bold font-display px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-750 text-white hover:text-emerald-300 rounded-xl transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              Sign in with Google to Connect Sheets
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2 font-mono">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main integration options */}
      {!user ? (
        <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl text-center space-y-3">
          <Database className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-350 uppercase tracking-wide">Sheets Integration Inactive</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            By default, Tyler Pitching dev coach stores logs locally on our custom sandboxed state, but logs will reset if the container recreates. Log in with your Google Account above to switch fully to Google Sheets with zero complex backend configurations!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Setup Spreadsheet (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* If no sheet, show quick create */}
            {!spreadsheetId ? (
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">Configure Spreadsheet Target</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Initialize a fresh formatted database with structured tabs automatically, or bind an existing sheet.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleCreateSheet}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-display text-xs p-3 rounded-xl shadow-lg shadow-emerald-500/5 transition-all text-center cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    CREATE NEW DB SPREADSHEET
                  </button>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-mono text-slate-600">OR CONNECT EXACT URL</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase block font-bold">Pastable Spreadsheet Link or ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualId}
                      onChange={e => setManualId(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                      className="bg-slate-900 border border-slate-800 text-slate-200 p-2 text-xs rounded-xl flex-1 outline-none focus:border-slate-700"
                    />
                    <button
                      onClick={handleConnectSheet}
                      disabled={loading || !manualId}
                      className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs px-4 rounded-xl cursor-pointer"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 p-5 rounded-xl border border-emerald-505 border-emerald-950 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded uppercase tracking-wider mb-2">
                      CONNECTED & ACTIVE
                    </span>
                    <h4 className="text-sm font-black text-white font-display uppercase tracking-tight">
                      Tyler Pitching Coach Database
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mt-1 break-all">
                      ID: {spreadsheetId}
                    </p>
                  </div>

                  <a
                    href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-900 text-slate-300 hover:text-emerald-400 rounded-xl hover:bg-slate-800 border border-slate-800 flex items-center justify-center shadow-md transition-all self-start"
                    title="Open Google Sheet directly"
                  >
                    <Link className="w-4 h-4" />
                  </a>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => triggerSheetLoad(token!, spreadsheetId!)}
                    disabled={loading}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-250 border border-slate-800 hover:text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
                    Forced Sync / Reload Values
                  </button>

                  <button
                    onClick={() => {
                      setSpreadsheetId(null);
                      localStorage.removeItem('tyler_pitcher_spreadsheet_id');
                    }}
                    className="text-slate-500 hover:text-slate-350 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
                  >
                    Disconnect Sheet
                  </button>
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex gap-2.5 items-start text-xs text-slate-400 leading-relaxed">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p>
                  <strong>How local storage operates:</strong> When a sheet is loaded, we download tabs corresponding to: <code className="text-emerald-400">Profile</code>, <code className="text-emerald-400">Recovery</code>, <code className="text-emerald-400">Throwing</code>, <code className="text-emerald-400">Strength</code>, <code className="text-emerald-450">Schedule</code>, and <code className="text-emerald-400">CalendarConfig</code>. Writing logs immediately updates your sheet tabs!
                </p>
              </div>
            </div>

          </div>

          {/* Right: Daily Calendar CSV Configuration Cell (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4">
            <div>
              <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">Spreadsheet Calendar String</h4>
              <p className="text-[11px] text-slate-450 font-sans leading-relaxed mt-1">
                Have a location to have a daily calendar of schedule checkpoints that can be updated on a single line as a CSV list in Sheets.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-slate-400 block font-black uppercase">Calendar CSV Config (Sheet cell A2)</label>
              <textarea
                value={calendarCsvLine}
                onChange={e => setCalendarCsvLine(e.target.value)}
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 text-[#aec0ce] p-2.5 text-xs rounded-xl font-mono outline-none focus:border-slate-700 leading-relaxed"
                placeholder="2026-05-30:Canes Doubleheader,2026-06-03:Rest Day,2026-06-05:Showcase"
              />
              <span className="text-[10px] text-slate-500 block leading-tight font-sans">
                Syntax: <code className="text-teal-400">YYYY-MM-DD:Description,YYYY-MM-DD:Description</code>
              </span>
            </div>

            <div>
              <button
                onClick={handleSaveCalendarConfig}
                disabled={loading || !spreadsheetId}
                className="w-full bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-slate-700 hover:text-emerald-300 font-bold text-xs p-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Save Calendar Config to Sheet
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
