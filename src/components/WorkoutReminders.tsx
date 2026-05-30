import { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Send, 
  AlertCircle, 
  Settings, 
  ShieldCheck, 
  History,
  Smartphone,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface ReminderLog {
  id: string;
  timestamp: string;
  recipient: string;
  recipientType: 'email' | 'sms';
  status: string;
  message: string;
}

interface ReminderSettings {
  isEnabled: boolean;
  recipient: string;
  recipientType: 'email' | 'sms';
  reminderTime: string;
  history: ReminderLog[];
}

export default function WorkoutReminders() {
  const [settings, setSettings] = useState<ReminderSettings>({
    isEnabled: true,
    recipient: 'michael@fusiontechdesign.com',
    recipientType: 'email',
    reminderTime: '09:00',
    history: []
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [sendingTest, setSendingTest] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchSettings = async () => {
    try {
      const resp = await fetch('/api/reminders');
      if (resp.ok) {
        const data = await resp.json();
        setSettings({
          isEnabled: data.isEnabled ?? true,
          recipient: data.recipient || 'michael@fusiontechdesign.com',
          recipientType: data.recipientType || 'email',
          reminderTime: data.reminderTime || '09:00',
          history: data.history || []
        });
      }
    } catch (e) {
      console.error("Failed to load reminders config", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const resp = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isEnabled: settings.isEnabled,
          recipient: settings.recipient,
          recipientType: settings.recipientType,
          reminderTime: settings.reminderTime
        }),
      });

      if (resp.ok) {
        setStatusMessage({ text: 'Daily reminder parameters secured successfully!', type: 'success' });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage({ text: 'Failed to save reminder parameters.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: 'Error communicating with reminder server.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestMessage = async () => {
    setSendingTest(true);
    setStatusMessage(null);
    try {
      const resp = await fetch('/api/reminders/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: settings.recipient,
          recipientType: settings.recipientType,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          setStatusMessage({ 
            text: `Instant workout reminder dispatched to Tyler via ${settings.recipientType.toUpperCase()}! See message content below.`, 
            type: 'success' 
          });
          setSettings(prev => ({
            ...prev,
            history: data.reminders?.history || [data.reminder, ...prev.history]
          }));
          setTimeout(() => setStatusMessage(null), 6000);
        }
      } else {
        setStatusMessage({ text: 'Failed to dispatch test notification.', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: 'Error triggering test notification.', type: 'error' });
    } finally {
      setSendingTest(false);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return isoStr;
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        <Clock className="w-6 h-6 animate-spin text-teal-400 mx-auto mb-2" />
        <span>Loading scheduler engine...</span>
      </div>
    );
  }

  return (
    <div id="workout-reminders-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-emerald-500/15 to-teal-400/15 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Bell className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="text-base font-black font-display text-white uppercase tracking-tight">Tyler's Daily Workout Reminders</h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Automated notifications to remind Tyler to throw, complete physical care, and record statistics.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-center font-mono text-[10px] bg-slate-950 px-2.5 py-1 rounded border border-slate-850">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">STATUS:</span>
          <span className={settings.isEnabled ? 'text-emerald-400 font-extrabold' : 'text-slate-500 font-bold'}>
            {settings.isEnabled ? '● ACTIVE REMINDERS' : '○ SHUTDOWN'}
          </span>
        </div>
      </div>

      {settings.isEnabled && (
        <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-850 text-xs text-slate-300 flex items-center gap-2 mb-6">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>AI Auto-Draft Active:</strong> When reminders are sent, the system parses Tyler's exact customized <strong>Workload Blueprint</strong> to output safe developmental coaching hints.
          </span>
        </div>
      )}

      {statusMessage && (
        <div className={`p-4 rounded-xl border mb-6 flex gap-3 text-xs leading-relaxed animate-fade-in ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-950/20 border-red-500/30 text-red-400'
        }`}>
          <span className="text-sm">{statusMessage.type === 'success' ? '✓' : '⚠'}</span>
          <p>{statusMessage.text}</p>
        </div>
      )}

      {/* Main Form Fields Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Controls Column */}
        <div className="md:col-span-5 space-y-5">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850/80 space-y-4">
            
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-white uppercase block">Enable Reminders</label>
                <span className="text-[10px] text-slate-400 block font-normal text-start">Activate automatic daily logs remind</span>
              </div>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none ${
                  settings.isEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <span className={`absolute top-1 left-1 bg-slate-950 w-4 h-4 rounded-full transition-transform ${
                  settings.isEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Delivery Method Selector */}
            <div className="space-y-1.5 pt-2 border-t border-slate-900">
              <label className="text-[10px] text-slate-400 block font-bold uppercase">Delivery Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, recipientType: 'email' }))}
                  className={`p-2.5 rounded-xl border text-xs font-bold font-display flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    settings.recipientType === 'email'
                      ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                      : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Msg</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, recipientType: 'sms' }))}
                  className={`p-2.5 rounded-xl border text-xs font-bold font-display flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    settings.recipientType === 'sms'
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>SMS Text</span>
                </button>
              </div>
            </div>

            {/* Recipient Input */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 block font-bold uppercase">
                {settings.recipientType === 'email' ? 'Recipient Email Address' : 'Recipient Phone Number'}
              </label>
              <div className="relative">
                <input
                  type={settings.recipientType === 'email' ? 'email' : 'text'}
                  value={settings.recipient}
                  onChange={e => setSettings(prev => ({ ...prev, recipient: e.target.value }))}
                  placeholder={settings.recipientType === 'email' ? 'tyler@example.com' : '(864) 555-0123'}
                  className="bg-slate-900 border border-slate-850 text-white rounded-xl p-2 px-3 w-full text-xs font-medium outline-none focus:border-teal-500 text-start"
                />
              </div>
            </div>

            {/* Daily Send Time picker */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 block font-bold uppercase">Daily Schedule Time</label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="time"
                  value={settings.reminderTime}
                  onChange={e => setSettings(prev => ({ ...prev, reminderTime: e.target.value }))}
                  className="bg-slate-900 border border-slate-850 text-white rounded-xl p-2 px-3 flex-1 text-xs font-bold outline-none font-mono"
                />
                <span className="text-[10px] text-slate-500 font-mono">EDT</span>
              </div>
            </div>

          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex-1 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-emerald-400 hover:text-emerald-300 font-black font-display text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>{saving ? 'Securing Settings...' : '💾 SAVE CONFIGURATION'}</span>
            </button>
            
            <button
              onClick={handleSendTestMessage}
              disabled={sendingTest}
              className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-black font-display text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 shrink-0"
              title="Test immediate reminder delivery"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingTest ? 'Sending Alert...' : '🚀 SEND NOW'}</span>
            </button>
          </div>

        </div>

        {/* History / Logs Column */}
        <div className="md:col-span-7 bg-slate-950 rounded-xl border border-slate-850 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
              <h4 className="text-xs font-black font-display text-slate-300 uppercase tracking-tight flex items-center gap-1.5">
                <History className="w-4 h-4 text-cyan-400" />
                Notification Logs & Delivery History
              </h4>
              <span className="text-[9px] font-mono text-slate-500 uppercase">{settings.history.length} Logs</span>
            </div>

            {settings.history.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <Send className="w-8 h-8 mx-auto text-slate-700 stroke-[1.5]" />
                <p className="text-xs">No notifications dispatched on this session cycle.</p>
                <p className="text-[10px]">Click &ldquo;Send Now&rdquo; to test real-world automated alert content!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[195px] overflow-y-auto pr-1">
                {settings.history.map((log) => (
                  <div key={log.id} className="bg-slate-900/50 rounded-xl p-3 border border-slate-900/80 space-y-1.5 text-start">
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        {log.recipientType === 'email' ? (
                          <Mail className="w-3 h-3 text-teal-400" />
                        ) : (
                          <Smartphone className="w-3 h-3 text-cyan-400" />
                        )}
                        <span className="text-slate-300 font-mono font-bold">{log.recipient}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-400 font-mono font-bold text-[9px] uppercase tracking-wider">{log.status}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-450 text-slate-300 font-sans leading-relaxed">
                      &ldquo;{log.message}&rdquo;
                    </p>

                    <div className="text-[9px] text-slate-500 font-mono flex justify-between pt-1 border-t border-slate-900/40">
                      <span>Ref: {log.id}</span>
                      <span>{formatDate(log.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-900/65 flex items-center justify-between">
            <span className="text-[9px] text-slate-500 leading-tight">
              Reminders loop runs every morning at the scheduled hourly slot.
            </span>
            <span className="text-[9px] text-teal-400 font-bold bg-teal-500/10 px-1.5 py-0.5 rounded uppercase font-mono">
              2026 EDT Config Secure
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
