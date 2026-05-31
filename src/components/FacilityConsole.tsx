import { useState, FormEvent, useEffect } from 'react';
import { ShieldCheck, Palette, Sparkles, Building2, UserPlus, RefreshCw, Layers, Check, Globe, UserCheck, Edit2, Trash2, Key, Mail, Lock, CreditCard, Percent, TrendingUp, Coins, Users, Settings2, ExternalLink } from 'lucide-react';
import { Facility, Trainer } from '../types';

interface FacilityConsoleProps {
  facilities: Record<string, Facility>;
  activeFacilityId: string;
  onSwitchFacility: (id: string) => void;
  onUpdateFacility: (id: string, updated: Partial<Facility>) => Promise<void>;
  onCreateFacility: (newFac: Omit<Facility, 'id'>) => Promise<void>;
  onRegisterDemoPlayer: (email: string, name: string, trainer?: string) => Promise<void>;
  isCoach: boolean;
  getAccentClass: (type: 'bg' | 'text' | 'border' | 'hoverBg' | 'focusRing' | 'badge') => string;
}

export default function FacilityConsole({
  facilities,
  activeFacilityId,
  onSwitchFacility,
  onUpdateFacility,
  onCreateFacility,
  onRegisterDemoPlayer,
  isCoach,
  getAccentClass
}: FacilityConsoleProps) {
  const activeFacility = facilities[activeFacilityId] || {
    id: activeFacilityId,
    name: "Velocity Sports Tech",
    logoText: "VELOCITY SPORTS TECH",
    welcomeMessage: "State-of-the-Art Arm Care & Dynamic Workload Analytics",
    accentColor: "teal" as const,
    primaryColor: "#0f766e",
    domainSlug: "velocity-prime"
  };

  // State for branding form
  const [name, setName] = useState(activeFacility.name);
  const [logoText, setLogoText] = useState(activeFacility.logoText);
  const [welcomeMessage, setWelcomeMessage] = useState(activeFacility.welcomeMessage);
  const [accentColor, setAccentColor] = useState<any>(activeFacility.accentColor);
  const [primaryColor, setPrimaryColor] = useState(activeFacility.primaryColor);

  // State for billing and sublicense configuration
  const [athleteMonthlyPrice, setAthleteMonthlyPrice] = useState((activeFacility as any).athleteMonthlyPrice ?? 129);
  const [mimbleRoyaltyPercentage, setMimbleRoyaltyPercentage] = useState((activeFacility as any).mimbleRoyaltyPercentage ?? 12);
  const [billingEnabled, setBillingEnabled] = useState((activeFacility as any).billingEnabled ?? true);
  const [stripeConnected, setStripeConnected] = useState((activeFacility as any).stripeConnected ?? true);
  const [savingBilling, setSavingBilling] = useState(false);

  // Sync inputs when active facility changes
  useEffect(() => {
    setName(activeFacility.name);
    setLogoText(activeFacility.logoText || "");
    setWelcomeMessage(activeFacility.welcomeMessage || "");
    setAccentColor(activeFacility.accentColor || "teal");
    setPrimaryColor(activeFacility.primaryColor || "#0f766e");
    setAthleteMonthlyPrice((activeFacility as any).athleteMonthlyPrice ?? 129);
    setMimbleRoyaltyPercentage((activeFacility as any).mimbleRoyaltyPercentage ?? 12);
    setBillingEnabled((activeFacility as any).billingEnabled ?? true);
    setStripeConnected((activeFacility as any).stripeConnected ?? true);
  }, [activeFacilityId, activeFacility]);

  // State for registering new facilities
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFacName, setNewFacName] = useState('');
  const [newFacWelcome, setNewFacWelcome] = useState('');
  const [newFacAccent, setNewFacAccent] = useState<any>('indigo');

  // State for adding athlete to current facility
  const [newPlayerEmail, setNewPlayerEmail] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerTrainer, setNewPlayerTrainer] = useState('');

  // Form states for creating a new trainer
  const [trainerFirstName, setTrainerFirstName] = useState('');
  const [trainerLastName, setTrainerLastName] = useState('');
  const [trainerEmail, setTrainerEmail] = useState('');
  const [trainerAuthType, setTrainerAuthType] = useState<'google' | 'password'>('google');
  const [trainerPassword, setTrainerPassword] = useState('');

  // States for editing an existing trainer
  const [editingTrainerId, setEditingTrainerId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAuthType, setEditAuthType] = useState<'google' | 'password'>('google');
  const [editPassword, setEditPassword] = useState('');

  // Status indicators
  const [submittingBrand, setSubmittingBrand] = useState(false);
  const [submittingPlayer, setSubmittingPlayer] = useState(false);
  const [submittingFacility, setSubmittingFacility] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  const triggerMessage = (text: string, type: 'success' | 'error') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage({ text: '', type: '' }), 4000);
  };

  const handleSaveBranding = async (e: FormEvent) => {
    e.preventDefault();
    setSubmittingBrand(true);
    try {
      await onUpdateFacility(activeFacilityId, {
        name,
        logoText,
        welcomeMessage,
        accentColor,
        primaryColor
      });
      triggerMessage("Premium white-label branding configurations updated!", "success");
    } catch (err) {
      triggerMessage("Failed to update tenant configuration.", "error");
    } finally {
      setSubmittingBrand(false);
    }
  };

  const handleSaveBilling = async (e: FormEvent) => {
    e.preventDefault();
    setSavingBilling(true);
    try {
      await onUpdateFacility(activeFacilityId, {
        athleteMonthlyPrice: Number(athleteMonthlyPrice),
        mimbleRoyaltyPercentage: Number(mimbleRoyaltyPercentage),
        billingEnabled,
        stripeConnected
      });
      triggerMessage("White-label payment settings & sublicense royalty policies updated!", "success");
    } catch (err) {
      triggerMessage("Failed to update white-label payment configurations.", "error");
    } finally {
      setSavingBilling(false);
    }
  };

  const handleCreateFacility = async (e: FormEvent) => {
    e.preventDefault();
    if (!newFacName.trim()) return;
    setSubmittingFacility(true);
    try {
      await onCreateFacility({
        name: newFacName,
        logoText: newFacName.toUpperCase(),
        welcomeMessage: newFacWelcome || "Elite Performance & Dynamic Development",
        accentColor: newFacAccent,
        primaryColor: newFacAccent === 'indigo' ? '#4338ca' : newFacAccent === 'rose' ? '#be123c' : newFacAccent === 'amber' ? '#b45309' : '#0f766e',
        domainSlug: newFacName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      });
      setNewFacName('');
      setNewFacWelcome('');
      setShowCreateForm(false);
      triggerMessage("New tenant facility registered successfully!", "success");
    } catch (err) {
      triggerMessage("Failed to create new facility.", "error");
    } finally {
      setSubmittingFacility(false);
    }
  };

  const handleRegisterPlayer = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPlayerEmail.trim() || !newPlayerName.trim()) return;
    setSubmittingPlayer(true);
    try {
      await onRegisterDemoPlayer(newPlayerEmail, newPlayerName, newPlayerTrainer || undefined);
      setNewPlayerEmail('');
      setNewPlayerName('');
      setNewPlayerTrainer('');
      triggerMessage(`Athlete ${newPlayerName} added and assigned to isolated tenant ${activeFacility.name}!`, "success");
    } catch (err) {
      triggerMessage("Failed to associate athlete to facility.", "error");
    } finally {
      setSubmittingPlayer(false);
    }
  };

  return (
    <div className="space-y-8" id="facility-console-panel">
      {/* Intro info card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden" id="white-label-header">
        <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none">
          <Layers size={320} className="text-white" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs tracking-wider uppercase font-mono">
              <ShieldCheck className={getAccentClass('text')} size={16} />
              <span>Multi-Tenant Enterprise</span>
            </div>
            <h1 className="text-2xl font-bold font-sans text-white tracking-tight">
              White-Label Settings & Tenant Administration
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Construct distinct isolated spaces for external sporting clubs, schools, or trainers. Each facility gets structured isolation, unique sub-identities, and custom accent styles.
            </p>
          </div>
          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getAccentClass('badge')}`}>
              <Globe size={12} strokeWidth={2.5} />
              White-Labeling Active
            </span>
          </div>
        </div>

        {actionMessage.text && (
          <div className={`mt-4 p-3 rounded-lg border text-xs font-mono transition-all duration-300 ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-950/40 border-rose-500/30 text-rose-400'
          }`} id="action-status-msg">
            {actionMessage.text}
          </div>
        )}
      </div>

      {/* Tenancy overview selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="tenancy-columns-wrapper">
        <div className="lg:col-span-1 space-y-6" id="facility-swapper-section">
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="text-sm font-semibold text-slate-300 font-mono flex items-center gap-2">
                <Building2 size={16} className={getAccentClass('text')} />
                Switch Facilities
              </h2>
              <span className="text-slate-500 text-[10px] font-mono leading-none">DEMO MODE</span>
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed">
              Click any tenant block below to immediately load their private database and experience their customized brand style instantly:
            </p>

            <div className="space-y-3 pt-2">
              {Object.entries(facilities).map(([id, fac]) => {
                const isActive = id === activeFacilityId;
                const activeBorder = isActive 
                  ? `border-2 ${getAccentClass('border')}` 
                  : 'border border-slate-900 hover:border-slate-800';
                
                return (
                  <button
                    key={id}
                    id={`btn-facility-${id}`}
                    onClick={() => {
                      onSwitchFacility(id);
                      setName(fac.name);
                      setLogoText(fac.logoText);
                      setWelcomeMessage(fac.welcomeMessage);
                      setAccentColor(fac.accentColor);
                      setPrimaryColor(fac.primaryColor);
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all ${activeBorder} bg-slate-900/50 relative overflow-hidden`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-xs text-slate-500 font-mono tracking-wider block uppercase">
                          Slug: {fac.id}
                        </span>
                        <h3 className="text-sm font-bold text-slate-200">{fac.name}</h3>
                        <p className="text-slate-400 text-[11px] font-sans truncate max-w-[200px]">
                          "{fac.welcomeMessage}"
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: fac.primaryColor }}></span>
                        {isActive && <Check size={14} className={getAccentClass('text')} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Create new facility button slider trigger */}
            {!showCreateForm ? (
              <button
                id="btn-trigger-create-facility"
                onClick={() => setShowCreateForm(true)}
                className="w-full mt-2 py-2 border border-dashed border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles size={14} />
                Provision New Brand
              </button>
            ) : (
              <form onSubmit={handleCreateFacility} className="border border-slate-900 rounded-lg p-3 space-y-3 bg-slate-900/20">
                <h4 className="text-xs font-semibold text-slate-300 font-mono">Create New White-Label Demo</h4>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block font-mono mb-1">Academy Name</label>
                  <input
                    type="text"
                    value={newFacName}
                    onChange={(e) => setNewFacName(e.target.value)}
                    placeholder="e.g. Driveline West"
                    className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded p-1.5 focus:outline-none focus:border-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block font-mono mb-1">Welcome Slogan</label>
                  <input
                    type="text"
                    value={newFacWelcome}
                    onChange={(e) => setNewFacWelcome(e.target.value)}
                    placeholder="e.g. Real-time elite biomechanics metrics"
                    className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded p-1.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase block font-mono mb-1">Accent Theme Hue</label>
                  <select
                    value={newFacAccent}
                    onChange={(e) => setNewFacAccent(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-400 rounded p-1.5 focus:outline-none"
                  >
                    <option value="teal">Teal (Modern/Clean)</option>
                    <option value="indigo">Indigo (Sleek/Tech-Forward)</option>
                    <option value="rose">Rose (Aggressive/Performance)</option>
                    <option value="amber">Amber (Premium/Classy)</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submittingFacility}
                    className="flex-1 py-1 px-2 bg-slate-800 text-white hover:bg-slate-700 rounded text-xs font-semibold"
                  >
                    {submittingFacility ? 'Creating...' : 'Provision'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="py-1 px-2 bg-slate-950 hover:bg-slate-900 text-slate-500 rounded text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Brand visual builder editor */}
        <div className="lg:col-span-2 space-y-6" id="facility-brand-editor-panel">
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="text-sm font-semibold text-slate-300 font-mono flex items-center gap-2">
                <Palette size={16} className={getAccentClass('text')} />
                Tenant Custom Design Editor ({activeFacility.name})
              </h2>
              <span className="text-xs text-slate-500 font-mono">{activeFacilityId}</span>
            </div>

            <form onSubmit={handleSaveBranding} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-mono" htmlFor="fac-edit-name">White-Label Product Name</label>
                  <input
                    id="fac-edit-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm bg-slate-900/50 border border-slate-800 text-slate-100 rounded-lg p-2.5 focus:outline-none focus:border-slate-700 transition-all font-sans"
                    required
                  />
                  <p className="text-[10px] text-slate-500 font-sans">Used in page footers and meta information files.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-mono" htmlFor="fac-edit-logo">Navbar Logo text Block</label>
                  <input
                    id="fac-edit-logo"
                    type="text"
                    value={logoText}
                    onChange={(e) => setLogoText(e.target.value)}
                    className="w-full text-sm bg-slate-900/50 border border-slate-800 text-slate-100 rounded-lg p-2.5 focus:outline-none focus:border-slate-700 transition-all font-mono"
                    required
                  />
                  <p className="text-[10px] text-slate-500 font-sans">Upper banner logo text displayed at top left corners.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-mono" htmlFor="fac-edit-slogan">App Landing Welcome Headline</label>
                <input
                  id="fac-edit-slogan"
                  type="text"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  className="w-full text-sm bg-slate-900/50 border border-slate-800 text-slate-100 rounded-lg p-2.5 focus:outline-none focus:border-slate-700 transition-all"
                  required
                />
                <p className="text-[10px] text-slate-500 font-sans">Headline displaying at the top of an athlete's home dashboard.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 font-mono block">Accent Color Swatch</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: 'teal', label: 'Teal', bg: 'bg-teal-500' },
                      { key: 'indigo', label: 'Indigo', bg: 'bg-indigo-500' },
                      { key: 'rose', label: 'Rose', bg: 'bg-rose-500' },
                      { key: 'amber', label: 'Amber', bg: 'bg-amber-500' }
                    ].map((col) => (
                      <button
                        key={col.key}
                        type="button"
                        onClick={() => setAccentColor(col.key as any)}
                        className={`p-3 rounded-lg flex flex-col items-center gap-1.5 text-[10px] font-mono border transition-all ${
                          accentColor === col.key 
                            ? 'border-slate-400 bg-slate-900 text-white' 
                            : 'border-slate-900 bg-slate-900/20 text-slate-500 hover:border-slate-800'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${col.bg}`}></span>
                        <span>{col.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-mono" htmlFor="fac-edit-hex">Primary Color Hex Overlay</label>
                  <div className="flex gap-2">
                    <input
                      id="fac-edit-hex"
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-2/3 text-sm bg-slate-900/50 border border-slate-800 text-slate-100 rounded-lg p-2.5 focus:outline-none focus:border-slate-700 font-mono"
                      required
                    />
                    <div className="w-1/3 rounded-lg border border-slate-800 flex items-center justify-center p-2.5 bg-slate-900" style={{ borderColor: primaryColor }}>
                      <span className="w-5 h-5 rounded-full" style={{ backgroundColor: primaryColor }}></span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans">Used for fine-tuned branding and specific hex parameters.</p>
                </div>
              </div>

              <div className="border-t border-slate-900 pt-5 flex justify-end">
                <button
                  type="submit"
                  id="btn-save-branding-submit"
                  disabled={submittingBrand}
                  className={`px-5 py-2.5 rounded-lg text-xs font-semibold text-white ${getAccentClass('bg')} ${getAccentClass('hoverBg')} focus:outline-none focus:ring-2 ${getAccentClass('focusRing')} transition-all flex items-center gap-2`}
                >
                  {submittingBrand ? (
                    <>
                      <RefreshCw className="animate-spin" size={14} />
                      Applying Branding...
                    </>
                  ) : (
                    <>
                      <Palette size={14} />
                      Save brand Branding Configuration
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Roster player creator for this facility */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="text-sm font-semibold text-slate-300 font-mono flex items-center gap-2">
                <UserPlus size={16} className={getAccentClass('text')} />
                Register Isolated Roster Athlete ({activeFacility.name})
              </h2>
              <span className="text-[10px] text-emerald-400 font-mono tracking-wider">TENANT SECURE</span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Register a new athlete strictly under the <strong className="text-slate-200">{activeFacility.name}</strong> tenant segment. This athlete will be assigned to this facility ID and will be invisible to all other academies or facilities on the platform.
            </p>

            <form onSubmit={handleRegisterPlayer} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-mono" htmlFor="athl-reg-name">Athlete Full Name</label>
                <input
                  id="athl-reg-name"
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="e.g. Carson Kelly"
                  className="w-full text-xs bg-slate-900 border border-slate-850 text-slate-200 rounded-lg p-2 focus:outline-none focus:border-slate-700"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-mono" htmlFor="athl-reg-email">Athlete Login Email</label>
                <input
                  id="athl-reg-email"
                  type="email"
                  value={newPlayerEmail}
                  onChange={(e) => setNewPlayerEmail(e.target.value)}
                  placeholder="carson@academy.com"
                  className="w-full text-xs bg-slate-900 border border-slate-850 text-slate-200 rounded-lg p-2 focus:outline-none focus:border-slate-700"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-mono" htmlFor="athl-reg-trainer">Assign Coach / Trainer</label>
                <select
                  id="athl-reg-trainer"
                  value={newPlayerTrainer}
                  onChange={(e) => setNewPlayerTrainer(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-850 text-slate-200 rounded-lg p-2 focus:outline-none focus:border-slate-700 h-[34px] cursor-pointer font-sans"
                >
                  <option value="">-- Choose Coach / Trainer --</option>
                  {activeFacility.trainers && activeFacility.trainers.length > 0 && (
                    <optgroup label={`${activeFacility.name} Staff`}>
                      {activeFacility.trainers.map((t: any, idx: number) => {
                        const valueText = typeof t === 'string' ? t : `Coach ${t.firstName} ${t.lastName}`;
                        return (
                          <option key={idx} value={valueText}>
                            {valueText}
                          </option>
                        );
                      })}
                    </optgroup>
                  )}
                  <optgroup label="Default System Staff">
                    <option value="Coach Michael">Coach Michael (Performance Lead)</option>
                    <option value="Coach James">Coach James (Workload Analyst)</option>
                    <option value="Coach Tyler">Coach Tyler (Driveline Specialist)</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  id="btn-register-athlete-submit"
                  disabled={submittingPlayer}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold text-white ${getAccentClass('bg')} ${getAccentClass('hoverBg')} transition-all flex items-center justify-center gap-1.5`}
                >
                  {submittingPlayer ? 'Assigning...' : 'Provision Athlete Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Sublicense & Whitelabeled Pricing Model Card */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 space-y-6" id="whitelabel-sublicense-hub">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="text-sm font-semibold text-slate-300 font-mono flex items-center gap-2">
                <CreditCard size={16} className={getAccentClass('text')} />
                White-Label Subscription & Mimble, Inc. Sublicense Hub
              </h2>
              <span className="text-[10px] text-amber-400 font-mono tracking-wider">MIMBLE PARTNER PORTAL</span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Set customized registration fees for athletic clients joining <strong className="text-slate-200">{activeFacility.name}</strong>. Mimble, Inc. distributes sublicense privileges under a secure royalty split structure (defaulting to 12.0%). When new pitchers or hitters are provisioned above, credit charges flow into this audit trail instantly.
            </p>

            {/* Financial Ledger KPIs */}
            {(() => {
              const transactions = (activeFacility as any).transactions || [];
              const totalSignups = transactions.length;
              const grossRevenue = transactions.reduce((sum: number, tx: any) => sum + (tx.amountCharged || 0), 0);
              const mimbleRoyaltyTotal = transactions.reduce((sum: number, tx: any) => sum + (tx.royaltyPaid || 0), 0);
              const netEarnings = grossRevenue - mimbleRoyaltyTotal;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="billing-ledger-kpis">
                  {/* Gross Revenue KPI */}
                  <div className="bg-slate-900/45 border border-slate-900 rounded-xl p-4 space-y-2 relative overflow-hidden">
                    <div className="absolute right-2 bottom-2 text-slate-950 opacity-10 animate-pulse">
                      <TrendingUp size={64} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Customer Gross Revenue</span>
                    <h3 className="text-xl font-bold text-white font-mono flex items-baseline gap-1">
                      ${grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-[10.5px] text-slate-500 font-normal font-sans">USD</span>
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-400 font-mono">
                      <span>● ACTIVE CHARGES ({totalSignups})</span>
                    </div>
                  </div>

                  {/* Mimble Inc Sublicense Fee KPI */}
                  <div className="bg-slate-900/45 border border-slate-900 rounded-xl p-4 space-y-2 relative overflow-hidden">
                    <div className="absolute right-2 bottom-2 text-slate-950 opacity-10">
                      <Percent size={64} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Mimble, Inc Sublicense Split</span>
                    <h3 className="text-xl font-bold font-mono text-amber-400 flex items-baseline gap-1">
                      -${mimbleRoyaltyTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-[10.5px] text-amber-500 font-normal font-sans">USD</span>
                    </h3>
                    <div className="flex items-center gap-1 text-[10.5px] text-slate-500 font-mono">
                      <span>Rate: {mimbleRoyaltyPercentage}% Sublicense Cut</span>
                    </div>
                  </div>

                  {/* Net Profit KPI */}
                  <div className="bg-slate-900/45 border border-slate-900 rounded-xl p-4 space-y-2 relative overflow-hidden">
                    <div className="absolute right-2 bottom-2 text-slate-950 opacity-10">
                      <Coins size={64} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Facility Net Income</span>
                    <h3 className="text-xl font-bold font-mono text-emerald-400 flex items-baseline gap-1">
                      ${netEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-[10.5px] text-emerald-500 font-normal font-sans">USD</span>
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-mono">
                      <span>Keep {100 - mimbleRoyaltyPercentage}% of Athlete Flow</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Interactive Billing & Royalty Config Controls Form */}
            <form onSubmit={handleSaveBilling} className="bg-slate-900/25 border border-slate-900 rounded-xl p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Sliders Block */}
                <div className="space-y-4">
                  {/* Price Setting */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Athlete Subscription Price (USD)
                      </label>
                      <span className="text-xs font-bold text-emerald-400 font-mono font-black bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                        ${athleteMonthlyPrice} / month
                      </span>
                    </div>
                    <input
                      type="range"
                      min="49"
                      max="299"
                      step="5"
                      value={athleteMonthlyPrice}
                      onChange={(e) => setAthleteMonthlyPrice(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500 font-sans">
                      Standard pricing charged automatically to the student athlete profile upon platform onboarding.
                    </p>
                  </div>

                  {/* Royalty Split slider simulation */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Mimble, Inc. Sublicense Royalty Rate
                      </label>
                      <span className="text-xs font-bold text-amber-400 font-mono font-black bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/50">
                        {mimbleRoyaltyPercentage}% rate
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="1"
                      value={mimbleRoyaltyPercentage}
                      onChange={(e) => setMimbleRoyaltyPercentage(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-slate-500 font-sans">
                      Standard contractual sublicense fee allocated to Mimble, Inc per corporate agreement.
                    </p>
                  </div>
                </div>

                {/* Gateway Toggles block */}
                <div className="space-y-4 pt-1 bg-slate-950/60 p-4 border border-slate-900 rounded-xl">
                  {/* Hook stripe toggle */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5 max-w-xs">
                      <span className="text-[11px] font-bold text-slate-300 block font-mono">Simulate Stripe Payments</span>
                      <p className="text-[10px] text-slate-500 font-sans">
                        Authorize automated credit card charges directly to the athlete&apos;s balance.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={stripeConnected} 
                        onChange={(e) => setStripeConnected(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500/80"></div>
                    </label>
                  </div>

                  {/* Billing switch toggle */}
                  <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-900">
                    <div className="space-y-0.5 max-w-xs">
                      <span className="text-[11px] font-bold text-slate-300 block font-mono">Platform Billing Process</span>
                      <p className="text-[10px] text-slate-500 font-sans">
                        Toggles actual sublicense royalty logging and transaction recording on the platform.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={billingEnabled} 
                        onChange={(e) => setBillingEnabled(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500/80"></div>
                    </label>
                  </div>
                </div>

              </div>

              {/* Form submit button */}
              <div className="border-t border-slate-900 pt-3 flex justify-between items-center gap-4">
                <span className="text-[10px] text-slate-500 font-sans leading-relaxed">
                  Saving updates propagates athletic client pricing to the platform ledger instantly, adjusting the corporate royalty outflow.
                </span>
                
                <button
                  type="submit"
                  disabled={savingBilling}
                  className={`px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black tracking-widest uppercase rounded-lg transition-all flex items-center gap-1.5 shrink-0`}
                >
                  {savingBilling ? (
                    <>
                      <RefreshCw className="animate-spin" size={12} />
                      Syncing Policies...
                    </>
                  ) : (
                    <>
                      <Settings2 size={12} />
                      Apply Sublicense Policies
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Audited Signup Transaction Ledger (Ledger List) */}
            <div className="space-y-3 bg-slate-900/10 border border-slate-900 rounded-xl p-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-[10.5px] font-mono text-slate-400 font-black uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Corporate Sublicense Split Log Ledger
                </span>
                <span className="text-[9px] text-slate-500 font-mono">LEDGER ID: MIMBLE_AUDIT_LNK_01</span>
              </div>

              {(() => {
                const transactions = (activeFacility as any).transactions || [];
                if (transactions.length === 0) {
                  return (
                    <div className="text-center py-6 text-xs text-slate-550 italic font-sans">
                      No customer signup credit card events processed yet under this tenant.
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-900/60 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                          <th className="py-2 text-[10px] font-black font-mono">Date / Time</th>
                          <th className="py-2 text-[10px] font-black font-mono">Client Athlete</th>
                          <th className="py-2 text-[10px] font-black font-mono text-right">Charged Fee</th>
                          <th className="py-2 text-[10px] font-black font-mono text-right">Mimble royalty ({mimbleRoyaltyPercentage}%)</th>
                          <th className="py-2 text-[10px] font-black font-mono text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="font-sans">
                        {transactions.slice().reverse().map((tx: any, i: number) => {
                          const dateObj = new Date(tx.date);
                          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                          // Recalculate based on currently active slider percentage to demonstrate interactive high-fidelity simulation!
                          const activeRoyaltyPercentage = mimbleRoyaltyPercentage;
                          const activeRoyaltyAmount = Number((tx.amountCharged * activeRoyaltyPercentage / 100).toFixed(2));

                          return (
                            <tr key={tx.id || i} className="border-b border-slate-900/40 last:border-b-0 hover:bg-slate-900/20 transition-all font-sans text-xs">
                              <td className="py-2.5 text-slate-400 font-mono text-[10.5px] font-semibold">{formattedDate}</td>
                              <td className="py-2.5">
                                <div className="font-semibold text-slate-200">{tx.athleteName}</div>
                                <div className="text-[10px] text-slate-500 font-mono leading-none">{tx.athleteEmail}</div>
                              </td>
                              <td className="py-2.5 text-right font-mono font-bold text-slate-200">
                                ${tx.amountCharged?.toFixed(2)}
                              </td>
                              <td className="py-2.5 text-right font-mono text-amber-400 font-bold">
                                -${activeRoyaltyAmount.toFixed(2)}
                              </td>
                              <td className="py-2.5 text-center">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-950 border border-emerald-500/20 text-emerald-400 font-mono leading-none">
                                  <Check size={9} />
                                  {tx.status || 'Settled'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

          </div>

          {/* Designate Facility Coaches & Trainers section */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 space-y-5" id="facility-trainers-roster">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <h2 className="text-sm font-semibold text-slate-300 font-mono flex items-center gap-2">
                <UserCheck size={16} className={getAccentClass('text')} />
                Manage Facility Trainers & Credentials ({activeFacility.name})
              </h2>
              <span className="text-[10px] text-teal-400 font-mono tracking-wider">SECURE STAFF ROSTER</span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Provision, update, or de-authorize professional trainers and pitching coaches for <strong className="text-slate-200">{activeFacility.name}</strong>. Certified staff members are managed locally by each facility, including their Google OAuth or classic password configurations.
            </p>

            {/* Existing Trainers Roster Grid */}
            <div className="space-y-4 pt-1">
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider font-mono">
                Active Certified Staff ({ (activeFacility.trainers || []).length })
              </span>

              {(!activeFacility.trainers || activeFacility.trainers.length === 0) ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/10 font-sans">
                  No active trainer profiles exist. Use the form below to register your first trainer!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(activeFacility.trainers || []).map((t: string | Trainer, idx: number) => {
                    const trainerId = typeof t === 'string' ? `legacy-${idx}` : t.id;
                    const firstName = typeof t === 'string' ? t.split(' ')[0] || 'Coach' : t.firstName;
                    const lastName = typeof t === 'string' ? t.split(' ').slice(1).join(' ') || 'Trainer' : t.lastName;
                    const email = typeof t === 'string' ? `${firstName.toLowerCase()}@facility.com` : t.email;
                    const authType = typeof t === 'string' ? 'google' : t.authType;
                    const passwordValue = typeof t === 'string' ? '' : t.passwordValue || '';

                    const isEditing = editingTrainerId === trainerId;

                    return (
                      <div 
                        key={trainerId} 
                        className={`p-4 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                          isEditing 
                            ? 'bg-slate-900 border-teal-500 shadow-teal-950/15' 
                            : 'bg-slate-900/40 border-slate-900 hover:border-slate-800'
                        }`}
                      >
                        {isEditing ? (
                          /* Interstitial Editing Form Context */
                          <div className="space-y-3.5">
                            <span className="text-[9px] text-teal-400 font-bold uppercase tracking-wider block border-b border-slate-800 pb-1.5 font-mono">
                              Edit Trainer File
                            </span>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] text-slate-500 block uppercase font-mono mb-0.5">First Name</label>
                                <input 
                                  type="text" 
                                  value={editFirstName} 
                                  onChange={e => setEditFirstName(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded p-1.5 font-sans text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-slate-500 block uppercase font-mono mb-0.5">Last Name</label>
                                <input 
                                  type="text" 
                                  value={editLastName} 
                                  onChange={e => setEditLastName(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded p-1.5 font-sans text-white focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[9px] text-slate-500 block uppercase font-mono mb-0.5">Email Address</label>
                              <input 
                                type="email" 
                                value={editEmail} 
                                onChange={e => setEditEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 text-xs rounded p-1.5 font-sans text-white focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[9px] text-slate-500 block uppercase font-mono mb-1">Auth Credentials</label>
                              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-0.5 rounded border border-slate-850">
                                <button
                                  type="button"
                                  onClick={() => setEditAuthType('google')}
                                  className={`py-1 text-[10px] text-center font-bold font-mono rounded select-none cursor-pointer ${
                                    editAuthType === 'google' ? 'bg-slate-800 text-teal-400' : 'text-slate-500'
                                  }`}
                                >
                                  Google Auth
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditAuthType('password')}
                                  className={`py-1 text-[10px] text-center font-bold font-mono rounded select-none cursor-pointer ${
                                    editAuthType === 'password' ? 'bg-slate-800 text-rose-450 text-rose-400' : 'text-slate-500'
                                  }`}
                                >
                                  Password
                                </button>
                              </div>
                            </div>

                            {editAuthType === 'password' && (
                              <div className="animate-fade-in/60">
                                <label className="text-[9px] text-slate-500 block uppercase font-mono mb-0.5 font-mono">Trainer Password</label>
                                <input 
                                  type="text" 
                                  value={editPassword} 
                                  onChange={e => setEditPassword(e.target.value)}
                                  placeholder="e.g. secretPass"
                                  className="w-full bg-slate-950 border border-slate-800 text-xs rounded p-1.5 font-mono text-white focus:outline-none"
                                />
                              </div>
                            )}

                            <div className="flex gap-2 pt-1 border-t border-slate-800">
                              <button
                                type="button"
                                onClick={async () => {
                                  // Save edited trainer callback
                                  if (!editFirstName.trim() || !editLastName.trim() || !editEmail.trim()) {
                                    triggerMessage("All fields are required.", "error");
                                    return;
                                  }
                                  const updatedTrainers = (activeFacility.trainers || []).map((origT: any, oIdx: number) => {
                                    const origId = typeof origT === 'string' ? `legacy-${oIdx}` : origT.id;
                                    if (origId === trainerId) {
                                      return {
                                        id: trainerId.startsWith('legacy') ? "trainer-" + Date.now() : trainerId,
                                        firstName: editFirstName.trim(),
                                        lastName: editLastName.trim(),
                                        email: editEmail.trim().toLowerCase(),
                                        authType: editAuthType,
                                        passwordValue: editAuthType === 'password' ? editPassword : '',
                                        createdAt: typeof origT === 'string' ? new Date().toISOString() : origT.createdAt
                                      };
                                    }
                                    return origT;
                                  });
                                  await onUpdateFacility(activeFacilityId, { trainers: updatedTrainers });
                                  setEditingTrainerId(null);
                                  triggerMessage(`Successfully updated trainer ${editFirstName}!`, "success");
                                }}
                                className="flex-1 py-1 px-2.5 bg-teal-500 text-slate-950 hover:bg-teal-400 font-bold font-sans rounded transition-all cursor-pointer text-center"
                              >
                                Save Changes
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingTrainerId(null)}
                                className="py-1 px-2.5 bg-slate-950 hover:bg-slate-850 text-slate-400 font-medium font-sans rounded border border-slate-800 transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Static Trainer Cards Representation */
                          <div className="flex flex-col justify-between h-full space-y-4">
                            <div className="space-y-2">
                              {/* Header & Auth Badge */}
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[9px] bg-slate-950 border border-slate-850 text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                                  {firstName[0]}{lastName[0]} Staff
                                </span>
                                
                                {authType === 'google' ? (
                                  <span className="flex items-center gap-1 text-[9px] text-teal-400 font-extrabold uppercase font-mono bg-teal-950/40 px-1.5 py-0.5 rounded border border-teal-900/60">
                                    <Globe size={10} className="text-teal-400 animate-pulse" />
                                    Google Auth
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[9px] text-rose-400 font-extrabold uppercase font-mono bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-900/60">
                                    <Lock size={10} className="text-rose-450" />
                                    Password Sec.
                                  </span>
                                )}
                              </div>

                              {/* Trainer Details */}
                              <div>
                                <span className="block font-black font-sans text-white text-sm uppercase leading-tight">
                                  {firstName} {lastName}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-mono mt-1 break-all truncate">
                                  {email}
                                </span>
                                {authType === 'password' && passwordValue && (
                                  <span className="text-[9px] text-slate-500 block font-mono mt-1">
                                    Key: <span className="text-slate-300 bg-slate-950/70 border border-slate-900 px-1.5 py-0.5 rounded font-mono select-all font-mono">{passwordValue}</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions bar */}
                            <div className="pt-2 border-t border-slate-905 border-slate-900 flex justify-between gap-2 text-slate-400">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTrainerId(trainerId);
                                  setEditFirstName(firstName);
                                  setEditLastName(lastName);
                                  setEditEmail(email);
                                  setEditAuthType(authType as any);
                                  setEditPassword(passwordValue);
                                }}
                                className="hover:text-white font-bold font-sans flex items-center gap-1.5 transition-all text-[11px] p-0.5 cursor-pointer"
                              >
                                <Edit2 size={11} />
                                <span>Edit Detail</span>
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  const updatedTrainers = (activeFacility.trainers || []).filter((origT: any, oIdx: number) => {
                                    const origId = typeof origT === 'string' ? `legacy-${oIdx}` : origT.id;
                                    return origId !== trainerId;
                                  });
                                  await onUpdateFacility(activeFacilityId, { trainers: updatedTrainers });
                                  triggerMessage(`Revoked access credentials of ${firstName} ${lastName}`, "success");
                                }}
                                className="text-slate-500 hover:text-rose-400 font-bold font-sans flex items-center gap-1 transition-all text-[11px] p-0.5 cursor-pointer"
                              >
                                <Trash2 size={11} className="text-slate-500 shrink-0" />
                                <span>De-Authorize</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Form to Register and Authorized New Professional Trainer */}
            <div className="pt-4 border-t border-slate-900 space-y-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono font-semibold">
                <UserCheck size={14} className={getAccentClass('text')} />
                <span>Configure & Onboard New Staff Trainer</span>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!trainerFirstName.trim() || !trainerLastName.trim() || !trainerEmail.trim()) {
                    triggerMessage("Please fill in first name, last name, and email fields.", "error");
                    return;
                  }

                  const emailLower = trainerEmail.trim().toLowerCase();
                  const currentList = activeFacility.trainers || [];
                  const exists = currentList.some((origT: any) => {
                    const matchEmail = typeof origT === 'string' ? `${origT.split(' ')[0].toLowerCase()}@facility.com` : origT.email;
                    return matchEmail.toLowerCase() === emailLower;
                  });

                  if (exists) {
                    triggerMessage(`A trainer with email ${emailLower} already exists in this facility.`, "error");
                    return;
                  }

                  const newTrainerObj: Trainer = {
                    id: "trainer-" + Date.now(),
                    firstName: trainerFirstName.trim(),
                    lastName: trainerLastName.trim(),
                    email: emailLower,
                    authType: trainerAuthType,
                    passwordValue: trainerAuthType === 'password' ? trainerPassword : '',
                    createdAt: new Date().toISOString()
                  };

                  const updatedList = [...currentList, newTrainerObj];
                  await onUpdateFacility(activeFacilityId, { trainers: updatedList });

                  // Reset inputs
                  setTrainerFirstName('');
                  setTrainerLastName('');
                  setTrainerEmail('');
                  setTrainerAuthType('google');
                  setTrainerPassword('');
                  triggerMessage(`Successfully registered ${newTrainerObj.firstName} ${newTrainerObj.lastName}!`, "success");
                }} 
                className="space-y-4 bg-slate-900/15 p-4 rounded-xl border border-slate-900"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">First Name</label>
                    <input
                      type="text"
                      value={trainerFirstName}
                      onChange={(e) => setTrainerFirstName(e.target.value)}
                      placeholder="e.g. Stephen"
                      className="w-full text-xs bg-slate-900 border border-slate-850 text-white rounded-lg p-2 focus:outline-none focus:border-slate-700 font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">Last Name</label>
                    <input
                      type="text"
                      value={trainerLastName}
                      onChange={(e) => setTrainerLastName(e.target.value)}
                      placeholder="e.g. Curry"
                      className="w-full text-xs bg-slate-900 border border-slate-850 text-white rounded-lg p-2 focus:outline-none focus:border-slate-700 font-sans"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">Professional Email</label>
                    <input
                      type="email"
                      value={trainerEmail}
                      onChange={(e) => setTrainerEmail(e.target.value)}
                      placeholder="e.g. stephen.coach@facility.com"
                      className="w-full text-xs bg-slate-900 border border-slate-850 text-white rounded-lg p-2 focus:outline-none focus:border-slate-700 font-sans"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  {/* Auth Type selection */}
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-slate-400 font-mono block mb-1.5">Authorized Credentials Type</label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-850">
                      <button
                        type="button"
                        onClick={() => setTrainerAuthType('google')}
                        className={`py-2 text-xs font-bold text-center rounded-lg transition-all cursor-pointer font-sans select-none flex items-center justify-center gap-1.5 ${
                          trainerAuthType === 'google' 
                            ? `${getAccentClass('bg')} text-slate-950 font-black` 
                            : 'bg-transparent text-slate-450 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Globe size={13} />
                        <span>Google Sign-In (OAuth)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTrainerAuthType('password')}
                        className={`py-2 text-xs font-bold text-center rounded-lg transition-all cursor-pointer font-sans select-none flex items-center justify-center gap-1.5 ${
                          trainerAuthType === 'password' 
                            ? 'bg-rose-500 text-slate-950 font-black' 
                            : 'bg-transparent text-slate-450 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Lock size={13} />
                        <span>Symmetric Password</span>
                      </button>
                    </div>
                  </div>

                  {/* Password Input (shown conditionally) */}
                  <div>
                    {trainerAuthType === 'password' ? (
                      <div className="space-y-1.5 animate-fade-in/70">
                        <label className="text-[10px] text-slate-400 font-mono block">Setup Password</label>
                        <input
                          type="text"
                          value={trainerPassword}
                          onChange={(e) => setTrainerPassword(e.target.value)}
                          placeholder="e.g. trainerPass26"
                          className="w-full text-xs bg-slate-900 border border-slate-850 text-white rounded-lg p-2 focus:outline-none focus:border-slate-700 font-mono"
                          required={trainerAuthType === 'password'}
                        />
                      </div>
                    ) : (
                      <div className="text-slate-500 text-[10px] pb-3 text-center sm:text-left leading-normal font-sans pt-1">
                        🔒 On Google login, automatic, zero-password cloud authorization is configured.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-black tracking-widest uppercase text-white ${getAccentClass('bg')} ${getAccentClass('hoverBg')} transition-all flex items-center justify-center gap-1.5 cursor-pointer font-display`}
                  >
                    <UserPlus size={14} />
                    <span>Authorize and Sync Roster Trainer</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
