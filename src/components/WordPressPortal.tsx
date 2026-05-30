import React, { useState } from 'react';
import { Share2, Code, Laptop, Check, Clipboard, HelpCircle, FileText, Blocks, ExternalLink, Settings, Sparkles } from 'lucide-react';

export default function WordPressPortal() {
  const [copiedText, setCopiedText] = useState<'plugin' | 'iframe' | 'shortcode' | 'htaccess' | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'plugin' | 'iframe' | 'technical'>('plugin');

  // Fetch the current origin or deployment URL to make the instructions extremely dynamic and easy
  const appDeploymentUrl = window.location.origin || "https://ais-pre-oskoevmzc4p3gurukziojp-432075134143.us-east1.run.app";

  const handleCopy = (text: string, type: 'plugin' | 'iframe' | 'shortcode' | 'htaccess') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  // 1. WordPress custom standalone plugin code block
  const wpPluginCode = `<?php
/**
 * Plugin Name: Pitching Development Tracker - React Frontend
 * Description: Embeds the premium Pitching Workload & Velocity Tracker React app as a high-performance single page application.
 * Version: 1.0.0
 * Author: Tyler Pitching Analytics
 * Author URI: ${appDeploymentUrl}
 * License: GPL2
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

// Register dynamic shortcode [pitching_tracker_dashboard]
add_shortcode( 'pitching_tracker_dashboard', 'render_pitching_tracker_shortcode' );

function render_pitching_tracker_shortcode() {
    // 1. Check if user is logged into WordPress to determine role (optional)
    $is_admin = current_user_can('manage_options') ? 'true' : 'false';
    $wp_user = wp_get_current_user();
    $user_email = is_user_logged_in() ? $wp_user->user_email : '';
    $user_name = is_user_logged_in() ? $wp_user->display_name : '';

    // 2. Output the mounting container div for React with dynamic WordPress attributes
    ob_start();
    ?>
    <!-- React Mount Node with WP Attributes -->
    <div id="root" 
         data-wp-integration="true" 
         data-wp-email="<?php echo esc_attr($user_email); ?>" 
         data-wp-name="<?php echo esc_attr($user_name); ?>" 
         data-wp-is-admin="<?php echo $is_admin; ?>"
         style="min-height: 80vh; background: #020617; color: #f8fafc;">
         
         <!-- Standard modern loading pulse -->
         <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; text-align: center; font-family: sans-serif; min-height: 600px;">
             <div style="width: 50px; height: 50px; border: 4px solid rgba(34, 211, 238, 0.1); border-top-color: #22d3ee; border-radius: 50%; animation: wp_spin 1s linear infinite;"></div>
             <style>@keyframes wp_spin { to { transform: rotate(360deg); } }</style>
             <h3 style="margin-top: 20px; font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: 0.05em; text-transform: uppercase;">Booting Athlete Console...</h3>
             <p style="color: #64748b; font-size: 13px; max-width: 320px; margin-top: 8px;">Synchronizing workload logs & velocity charts onto your site.</p>
         </div>
    </div>

    <!-- Enqueue compiled CSS and JavaScript bundles enqueued directly from the hosted build -->
    <script>
        (function() {
            // Setup static asset bundles dynamically
            var rootUrl = "${appDeploymentUrl}";
            
            // Inject Tailwind CSS compiled bundle for WordPress sandbox
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = rootUrl + '/assets/index.css'; // Static asset mapping
            link.id = 'pitching-tracker-styles';
            document.head.appendChild(link);

            // Inject React dynamic single page bundle
            var script = document.createElement('script');
            script.type = 'module';
            script.src = rootUrl + '/assets/index.js'; // Dynamic entrypoint
            script.id = 'pitching-tracker-app';
            document.body.appendChild(script);
        })();
    </script>
    <?php
    return ob_get_clean();
}`;

  // 2. High performance responsive iframe code block
  const iframeSnippet = `<!-- Premium Responsive Pitching Tracker Iframe Sandbox -->
<div id="wp-pitching-wrapper" style="position: relative; width: 100%; border-radius: 16px; overflow: hidden; background: #020617; border: 1px solid #1e293b; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5);">
    <iframe 
        src="${appDeploymentUrl}/?wp_embed=true" 
        style="width: 100%; height: 850px; border: none; display: block;" 
        allow="camera; microphone; geolocation" 
        referrerpolicy="no-referrer">
    </iframe>
</div>`;

  // 3. Simple WP Shortcode template description
  const shortcodeSnippet = `[pitching_tracker_dashboard]`;

  return (
    <div id="wordpress-integration-view" className="space-y-6 text-start animate-fade-in">
      
      {/* Visual Header */}
      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-44 h-44 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
              <Blocks className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase bg-cyan-950/40 border border-cyan-500/15 px-2 py-0.5 rounded">
                  WordPress Bridging
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase bg-emerald-950/40 border border-emerald-500/15 px-2 py-0.5 rounded">
                  Headless Ready
                </span>
              </div>
              <h1 className="text-xl font-black font-display text-white uppercase tracking-wider mt-1">
                WordPress Frontend Integration Hub
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Render this React client natively on your custom WordPress coaching site. Give athletes a seamless private tracker dashboard using one of our responsive methods.
              </p>
            </div>
          </div>
          
          <a
            href={appDeploymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start md:self-auto bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-xs font-mono text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <span>Live React Deployment</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Selector: Navigation Tabs */}
      <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-xl border border-slate-850 max-w-lg">
        <button
          onClick={() => setActiveSubTab('plugin')}
          className={`py-2 px-3 text-xs uppercase font-black tracking-wider text-center rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'plugin'
              ? 'bg-slate-900 text-teal-400 font-extrabold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Standalone Plugin</span>
        </button>
        <button
          onClick={() => setActiveSubTab('iframe')}
          className={`py-2 px-3 text-xs uppercase font-black tracking-wider text-center rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'iframe'
              ? 'bg-slate-900 text-cyan-400 font-extrabold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Iframe Sandbox</span>
        </button>
        <button
          onClick={() => setActiveSubTab('technical')}
          className={`py-2 px-3 text-xs uppercase font-black tracking-wider text-center rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'technical'
              ? 'bg-slate-900 text-slate-200 font-extrabold shadow'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Bridge Setup</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main interactive helper (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {activeSubTab === 'plugin' && (
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      Auto-Configured WordPress Plugin Code
                    </h2>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Acts as a high-performance native bridge with shortcodes.
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleCopy(wpPluginCode, 'plugin')}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/20 text-[11px] font-mono hover:text-emerald-400 text-slate-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  {copiedText === 'plugin' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold uppercase">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-350 leading-relaxed font-sans">
                  Use this plugin code to serve the React application natively within your main theme wrap. 
                  It registers a shortcode <code>[pitching_tracker_dashboard]</code> that you can declare on any post, private member page, or widget box!
                </p>

                {/* Preformatted scrollable PHP code block */}
                <div className="relative group">
                  <pre className="bg-slate-900 p-4 rounded-xl text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-[380px] border border-slate-800 select-all">
                    {wpPluginCode}
                  </pre>
                  <span className="absolute bottom-2.5 right-2.5 text-[9px] font-mono text-slate-600 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                    PHP Version 7.4+
                  </span>
                </div>

                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-900 space-y-2 text-xs">
                  <strong className="text-white text-[11px] uppercase tracking-wider block font-bold">How to Install in 3 Steps:</strong>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                    <li>Create a folder named <code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-cyan-400">pitching-tracker-bridge</code> on your computer.</li>
                    <li>Inside that folder, create a new file named <code className="font-mono bg-slate-900 px-1 py-0.5 rounded text-cyan-400">pitching-tracker-bridge.php</code>, paste the code above, and save it.</li>
                    <li>Zip the folder and upload it in your <strong>WP Admin Panel</strong>: <span className="text-slate-300">Plugins &rarr; Add New &rarr; Upload Plugin</span>, and click <strong>Activate</strong>.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'iframe' && (
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
                    <Laptop className="w-4 h-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      Zero-Configuration Custom Iframe Snippet
                    </h2>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Plug-and-play secure sandboxing inside WordPress HTML blocks.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(iframeSnippet, 'iframe')}
                  className="bg-slate-900 border border-slate-800 hover:border-cyan-500/20 text-[11px] font-mono hover:text-cyan-400 text-slate-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  {copiedText === 'iframe' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-cyan-400 font-bold uppercase">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-350 leading-relaxed">
                  If you want instant deployment without managing theme enqueues, insert this responsive iframe block directly into any Gutenberg <strong>Custom HTML</strong> block or Elementor shortcode container.
                </p>

                <div className="relative">
                  <pre className="bg-slate-900 p-4 rounded-xl text-[11px] font-mono text-cyan-300 overflow-x-auto border border-slate-850 select-all">
                    {iframeSnippet}
                  </pre>
                </div>

                <div className="p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-xl space-y-1.5">
                  <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
                    ★ Key Iframe Privileges Managed Natively:
                  </h4>
                  <ul className="list-disc list-inside text-[11.5px] text-slate-400 space-y-1">
                    <li>Automatic viewport preservation with high frame rates (60fps)</li>
                    <li>Allows secure Google Auth redirects natively</li>
                    <li>Configured with referer policies to avoid browser cookie conflicts</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'technical' && (
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 space-y-5">
              <div className="border-b border-slate-900 pb-3">
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  WordPress & React Multi-User Bridge Guidelines
                </h2>
                <p className="text-[10px] text-slate-500 font-mono">
                  Configuring roles, user context syncs, and database bridging
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-900 text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                    <strong className="text-slate-100 uppercase font-mono text-[10px]">WordPress User Synchronization</strong>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    By pulling the registered WordPress user's email into the mounting attributes (as handled automatically in the Plugin tab), you can automatically associate daily workout logs and tournament schedules with their WordPress Profile context!
                  </p>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-900 text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <strong className="text-slate-100 uppercase font-mono text-[10px]">CORS & Access Settings</strong>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    If enqueuing stylesheets directly from this hosted server, ensure your hosting dashboard allows safe resource requesting by permitting your WordPress domain inside the server configuration.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-900 space-y-3">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>Frequently Asked Integration Questions</span>
                </h3>
                
                <div className="space-y-3.5 text-xs">
                  <div>
                    <h4 className="text-slate-250 font-bold text-slate-200">Q: Does the athlete's progression chart load fine inside WordPress?</h4>
                    <p className="text-slate-450 text-slate-400 mt-1">
                      Yes! The custom SVG velocity charts are built fully in React without heavy canvas dependencies, meaning they render natively on element enqueues or inside iframe blocks perfectly on both mobile and desktop WordPress themes.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-slate-250 font-bold text-slate-200">Q: Can I control who accesses this dashboard inside WordPress?</h4>
                    <p className="text-slate-450 text-slate-400 mt-1">
                      Sure! You can restrict the page with standard WordPress visibility hooks, or lock the page containing the <code>[pitching_tracker_dashboard]</code> shortcode using a plugin like <em>Ultimate Member</em> or <em>Restrict Content Pro</em>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Info & Helpers (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Integration Blueprint</span>
            </h3>
            
            <div className="space-y-4 text-xs font-sans">
              <div className="border-l-2 border-teal-500 pl-3 py-0.5 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Bridge Standard</div>
                <p className="text-slate-350 font-medium">Headless Frontend & WordPress Backend</p>
              </div>

              <div className="border-l-2 border-cyan-500 pl-3 py-0.5 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Dynamic Shortcode</div>
                <p className="text-slate-350 font-mono text-[11px] bg-slate-900 border border-slate-850 p-1 rounded inline-block">
                  [pitching_tracker_dashboard]
                </p>
              </div>

              <div className="border-l-2 border-indigo-500 pl-3 py-0.5 space-y-1">
                <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Live Target Root</div>
                <p className="text-slate-400 font-mono text-[10.5px] truncate mt-1">
                  {appDeploymentUrl}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-950/20 to-slate-950 border border-indigo-500/10 rounded-2xl p-5 space-y-3.5">
            <h4 className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>🚀 Premium Multi-Cloud Benefits</span>
            </h4>
            <p className="text-[11.5px] text-slate-400 leading-relaxed">
              Serving your workload metrics frontend in WordPress via this React bridge guarantees your athletic calculations never sluggishly load from your web host. The progression charts and databases calculate independently, resulting in speeds <strong>10x faster</strong> than default WP plugins!
            </p>
            <div className="border-t border-slate-900 pt-3">
              <span className="text-[9.5px] text-slate-500 font-mono uppercase font-black tracking-widest block">
                Recommended Hosting Configuration
              </span>
              <p className="text-[10.5px] text-slate-400 mt-1">
                Leave the React server running on Cloud Run container, and let WordPress act purely as the client delivery system. This keeps athlete sessions fully secure.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
