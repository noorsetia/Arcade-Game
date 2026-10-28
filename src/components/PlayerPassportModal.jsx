import { useState } from "react";
import {
  Award,
  X,
  Edit2,
  Check,
  Flame,
  User,
  Shield,
  History,
  Lock,
  LogOut,
  LogIn,
  UserPlus,
  Search
} from "lucide-react";
import {
  updatePlayerProfile,
  loginAccount,
  registerAccount,
  logoutAccount,
  GAME_TITLES
} from "../utils/playerStats";
import { arcadeSound } from "../utils/audio";
const AVATAR_OPTIONS = ["\u26A1", "\u{1F680}", "\u{1F451}", "\u{1F4BB}", "\u{1F9E0}", "\u{1F47E}", "\u{1F916}", "\u{1F431}", "\u{1F98A}", "\u{1F409}", "\u{1F3AF}", "\u{1F30C}"];
const RING_COLORS = [
  { id: "cyan", label: "Cyan Pulse", borderClass: "border-cyan-400", shadowClass: "shadow-[0_0_15px_#22d3ee]" },
  { id: "magenta", label: "Magenta Nova", borderClass: "border-fuchsia-400", shadowClass: "shadow-[0_0_15px_#e879f9]" },
  { id: "emerald", label: "Matrix Lime", borderClass: "border-emerald-400", shadowClass: "shadow-[0_0_15px_#34d399]" },
  { id: "gold", label: "Solar Gold", borderClass: "border-amber-400", shadowClass: "shadow-[0_0_15px_#fbbf24]" },
  { id: "indigo", label: "Deep Indigo", borderClass: "border-indigo-400", shadowClass: "shadow-[0_0_15px_#818cf8]" }
];
const TITLE_OPTIONS = [
  "Neural Pathfinder",
  "Overclocked Architect",
  "Ghost in Mainframe",
  "Apex Competitor",
  "Algorithmic Sage",
  "Vector Specialist"
];
export default function PlayerPassportModal({
  stats,
  onUpdateStats,
  onClose,
  onSelectGame
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(stats.playerAccount?.username || stats.playerName);
  const [selectedAvatar, setSelectedAvatar] = useState(stats.playerAccount?.avatar || "\u26A1");
  const [selectedRing, setSelectedRing] = useState(
    stats.playerAccount?.ringColor || "cyan"
  );
  const [selectedTitle, setSelectedTitle] = useState(stats.playerAccount?.title || "Neural Pathfinder");
  const [authMode, setAuthMode] = useState("login");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("all");
  const level = Math.floor(stats.totalXP / 200) + 1;
  const currentLevelXP = stats.totalXP % 200;
  const progressPercent = Math.min(100, Math.round(currentLevelXP / 200 * 100));
  const unlockedCount = stats.achievements.filter((a) => a.unlocked).length;
  const currentRing = RING_COLORS.find((r) => r.id === (stats.playerAccount?.ringColor || "cyan")) || RING_COLORS[0];
  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    const updated = updatePlayerProfile({ username: nameInput.trim() });
    onUpdateStats(updated);
    setEditingName(false);
    arcadeSound.playClick();
  };
  const handleSaveCustomization = () => {
    const updated = updatePlayerProfile({
      avatar: selectedAvatar,
      ringColor: selectedRing,
      title: selectedTitle
    });
    onUpdateStats(updated);
    arcadeSound.playSuccess();
    setActiveTab("overview");
  };
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessMsg("");
    setAuthLoading(true);
    try {
      if (authMode === "register") {
        const res = await registerAccount(authUsername, authPassword);
        if (res.success) {
          arcadeSound.playFanfare();
          setAuthSuccessMsg("Account registered and synced successfully!");
          onUpdateStats(stats);
          setTimeout(() => {
            setActiveTab("overview");
          }, 1e3);
        } else {
          setAuthError(res.error || "Registration failed");
          arcadeSound.playError();
        }
      } else {
        const res = await loginAccount(authUsername, authPassword);
        if (res.success) {
          arcadeSound.playSuccess();
          setAuthSuccessMsg("Welcome back! Cloud profile restored.");
          onUpdateStats(stats);
          setTimeout(() => {
            setActiveTab("overview");
          }, 1e3);
        } else {
          setAuthError(res.error || "Invalid credentials");
          arcadeSound.playError();
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };
  const handleLogout = () => {
    arcadeSound.playClick();
    const updated = logoutAccount();
    onUpdateStats(updated);
    setActiveTab("overview");
  };
  const filteredSessions = (stats.sessions || []).filter((sess) => {
    const matchesFilter = historyFilter === "all" || sess.gameId === historyFilter;
    const query = historySearch.toLowerCase();
    const matchesSearch = sess.gameName.toLowerCase().includes(query) || sess.difficulty.toLowerCase().includes(query) || String(sess.score).includes(query);
    return matchesFilter && matchesSearch;
  });
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-2xl bg-[#09071c] border-2 border-indigo-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-indigo-950/60 overflow-hidden max-h-[92vh] flex flex-col text-white space-y-4">
        {
    /* Ambient glow backdrop */
  }
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {
    /* Top Header */
  }
        <div className="relative flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl bg-black/60 border-2 ${currentRing.borderClass} ${currentRing.shadowClass} flex items-center justify-center text-xl`}>
              {stats.playerAccount?.avatar || "\u26A1"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-white">
                  Pilot Passport
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  LVL {level}
                </span>
                {stats.playerAccount?.isGuest ? <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                    GUEST
                  </span> : <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                    CLOUD SYNCED
                  </span>}
              </div>
              <p className="text-xs font-mono text-indigo-400">
                {stats.playerAccount?.title || "Neural Pathfinder"}
              </p>
            </div>
          </div>

          <button
    onClick={() => {
      arcadeSound.playClick();
      onClose();
    }}
    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
    aria-label="Close Passport"
  >
            <X className="w-5 h-5" />
          </button>
        </div>

        {
    /* Navigation Tabs */
  }
        <div className="flex items-center gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5 text-xs font-semibold overflow-x-auto">
          {[
    { id: "overview", label: "Overview & Stats", icon: User },
    { id: "account", label: "Account & Identity", icon: Shield },
    { id: "history", label: `Game History (${stats.sessions?.length || 0})`, icon: History },
    { id: "achievements", label: `Trophies (${unlockedCount}/${stats.achievements.length})`, icon: Award }
  ].map((tab) => {
    const Icon = tab.icon;
    const active = activeTab === tab.id;
    return <button
      key={tab.id}
      onClick={() => {
        arcadeSound.playClick();
        setActiveTab(tab.id);
      }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${active ? "bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold shadow-md" : "text-white/60 hover:text-white hover:bg-white/5"}`}
    >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>;
  })}
        </div>

        {
    /* Tab 1: Overview & Stats */
  }
        {activeTab === "overview" && <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {
    /* Player Callsign Card */
  }
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-black/60 border-2 ${currentRing.borderClass} ${currentRing.shadowClass} flex items-center justify-center text-2xl`}>
                  {stats.playerAccount?.avatar || "\u26A1"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {editingName ? <div className="flex items-center gap-1.5">
                        <input
    type="text"
    value={nameInput}
    onChange={(e) => setNameInput(e.target.value)}
    maxLength={18}
    className="px-2 py-1 rounded bg-black/60 border border-cyan-400 text-sm font-bold text-white focus:outline-none"
    autoFocus
  />
                        <button
    onClick={handleSaveName}
    className="p-1 rounded bg-emerald-500 text-slate-950"
  >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div> : <>
                        <span className="text-base font-bold text-white">
                          {stats.playerAccount?.username || stats.playerName}
                        </span>
                        <button
    onClick={() => setEditingName(true)}
    className="text-white/40 hover:text-white"
    title="Edit Callsign"
  >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </>}
                  </div>
                  <p className="text-xs font-mono text-cyan-300">
                    {stats.playerAccount?.title || "Neural Pathfinder"}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-white/50 uppercase block">RANK PROGRESS</span>
                <span className="text-xs font-mono font-bold text-indigo-300">
                  {currentLevelXP} / 200 XP to LVL {level + 1}
                </span>
              </div>
            </div>

            {
    /* XP Progress Bar */
  }
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-white/50">
                <span>Level {level}</span>
                <span>{progressPercent}%</span>
                <span>Level {level + 1}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
                <div
    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 transition-all duration-500 shadow-[0_0_10px_#22d3ee]"
    style={{ width: `${progressPercent}%` }}
  />
              </div>
            </div>

            {
    /* Stats Grid */
  }
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <span className="text-[10px] font-mono text-white/50 uppercase block">Total XP</span>
                <span className="text-lg font-black font-mono text-cyan-300">{stats.totalXP}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <span className="text-[10px] font-mono text-white/50 uppercase block">Daily Streak</span>
                <span className="text-lg font-black font-mono text-amber-300 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-300" /> {stats.dailyStreak}d
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <span className="text-[10px] font-mono text-white/50 uppercase block">Games Played</span>
                <span className="text-lg font-black font-mono text-purple-300">{stats.gamesPlayed}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <span className="text-[10px] font-mono text-white/50 uppercase block">Trophies</span>
                <span className="text-lg font-black font-mono text-emerald-300">
                  {unlockedCount}/{stats.achievements.length}
                </span>
              </div>
            </div>

            {
    /* Top High Scores Quick View */
  }
            <div className="space-y-2">
              <span className="text-xs font-mono text-white/60 uppercase tracking-wider block">
                Top Personal Bests
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                {Object.entries(stats.highScores).filter(([_, score]) => score > 0).slice(0, 6).map(([gid, score]) => <div
    key={gid}
    onClick={() => {
      onClose();
      onSelectGame(gid);
    }}
    className="p-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-400/50 cursor-pointer transition-all flex items-center justify-between"
  >
                      <span className="truncate text-white/80">{GAME_TITLES[gid] || gid}:</span>
                      <strong className="text-cyan-300 ml-2">{score}</strong>
                    </div>)}
              </div>
            </div>
          </div>}

        {
    /* Tab 2: Account & Identity */
  }
        {activeTab === "account" && <div className="space-y-5 overflow-y-auto pr-1 flex-1 text-xs">
            {
    /* Account Status Box */
  }
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    {stats.playerAccount?.isGuest ? "Guest Mode Active" : "Cloud Account Synchronized"}
                  </span>
                  <span className="text-[11px] text-white/50 font-mono">
                    {stats.playerAccount?.isGuest ? "Scores and progression are stored locally. Register to secure your stats." : `Authenticated as ${stats.playerAccount?.username}`}
                  </span>
                </div>

                {!stats.playerAccount?.isGuest && <button
    onClick={handleLogout}
    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/30 flex items-center gap-1.5 font-mono"
  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>}
              </div>

              {
    /* Guest to Account Conversion Form */
  }
              {stats.playerAccount?.isGuest && <form onSubmit={handleAuthSubmit} className="pt-2 border-t border-white/10 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <button
    type="button"
    onClick={() => setAuthMode("login")}
    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${authMode === "login" ? "bg-cyan-400 text-slate-950" : "bg-white/5 text-white/60"}`}
  >
                      Login to Existing
                    </button>
                    <button
    type="button"
    onClick={() => setAuthMode("register")}
    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${authMode === "register" ? "bg-cyan-400 text-slate-950" : "bg-white/5 text-white/60"}`}
  >
                      Register New Callsign
                    </button>
                  </div>

                  {authError && <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs">
                      {authError}
                    </div>}

                  {authSuccessMsg && <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs">
                      {authSuccessMsg}
                    </div>}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-white/50 block mb-1">CALLSIGN / USERNAME</label>
                      <input
    type="text"
    value={authUsername}
    onChange={(e) => setAuthUsername(e.target.value)}
    placeholder="e.g. Cyber_Ghost"
    required
    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder:text-white/30 focus:border-cyan-400 focus:outline-none"
  />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-white/50 block mb-1">PASSWORD KEY</label>
                      <input
    type="password"
    value={authPassword}
    onChange={(e) => setAuthPassword(e.target.value)}
    placeholder="••••••••"
    required
    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white placeholder:text-white/30 focus:border-cyan-400 focus:outline-none"
  />
                    </div>
                  </div>

                  <button
    type="submit"
    disabled={authLoading}
    className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
  >
                    {authMode === "register" ? <UserPlus className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
                    <span>{authLoading ? "Authorizing..." : authMode === "register" ? "Register Account" : "Sign In"}</span>
                  </button>
                </form>}
            </div>

            {
    /* Customizer: Avatar, Ring & Title */
  }
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4">
              <span className="text-xs font-bold text-white block">Identity Customizer</span>

              {
    /* Avatar Selector */
  }
              <div>
                <label className="text-[10px] font-mono text-white/50 block mb-1.5">CHOOSE CYBER AVATAR</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((av) => <button
    key={av}
    type="button"
    onClick={() => setSelectedAvatar(av)}
    className={`p-2.5 rounded-xl text-xl transition-all border ${selectedAvatar === av ? "border-cyan-400 bg-cyan-500/20 shadow-[0_0_12px_#22d3ee] scale-105" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
  >
                      {av}
                    </button>)}
                </div>
              </div>

              {
    /* Glowing Ring Color */
  }
              <div>
                <label className="text-[10px] font-mono text-white/50 block mb-1.5">AURA RING RESONANCE</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {RING_COLORS.map((ring) => <button
    key={ring.id}
    type="button"
    onClick={() => setSelectedRing(ring.id)}
    className={`px-2 py-1.5 rounded-xl border text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${selectedRing === ring.id ? `${ring.borderClass} bg-white/10 text-white ${ring.shadowClass}` : "border-white/10 bg-white/5 text-white/60"}`}
  >
                      <span>{ring.label}</span>
                    </button>)}
                </div>
              </div>

              {
    /* Callsign Title */
  }
              <div>
                <label className="text-[10px] font-mono text-white/50 block mb-1.5">TACTICAL TITLE</label>
                <select
    value={selectedTitle}
    onChange={(e) => setSelectedTitle(e.target.value)}
    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
  >
                  {TITLE_OPTIONS.map((t) => <option key={t} value={t} className="bg-slate-900 text-white">
                      {t}
                    </option>)}
                </select>
              </div>

              <button
    type="button"
    onClick={handleSaveCustomization}
    className="w-full py-2.5 rounded-xl font-bold bg-white text-slate-950 hover:bg-cyan-300 transition-colors shadow-md"
  >
                Apply Customizations
              </button>
            </div>
          </div>}

        {
    /* Tab 3: Game History & Telemetry */
  }
        {activeTab === "history" && <div className="space-y-3 overflow-y-auto pr-1 flex-1 text-xs">
            {
    /* Search & Filter Toolbar */
  }
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
    type="text"
    value={historySearch}
    onChange={(e) => setHistorySearch(e.target.value)}
    placeholder="Filter sessions..."
    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none"
  />
              </div>
              <select
    value={historyFilter}
    onChange={(e) => setHistoryFilter(e.target.value)}
    className="px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none"
  >
                <option value="all">All Games</option>
                {Object.keys(GAME_TITLES).map((id) => <option key={id} value={id}>
                    {GAME_TITLES[id]}
                  </option>)}
              </select>
            </div>

            {
    /* Sessions List */
  }
            {filteredSessions.length > 0 ? <div className="space-y-2">
                {filteredSessions.map((s) => <div
    key={s.id}
    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono"
  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-sm">
                        🎮
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-white">{s.gameName}</strong>
                          {s.isNewBest && <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                              NEW BEST
                            </span>}
                        </div>
                        <span className="text-[10px] text-white/40">
                          {new Date(s.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {s.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-cyan-300 font-mono">
                        {s.score.toLocaleString()} PTS
                      </div>
                      <span className="text-[10px] text-indigo-400 font-bold">
                        +{s.xpAwarded} XP
                      </span>
                    </div>
                  </div>)}
              </div> : <div className="text-center py-12 p-6 rounded-2xl bg-white/5 border border-dashed border-white/10 space-y-2">
                <History className="w-8 h-8 text-white/30 mx-auto" />
                <p className="text-xs text-white/50">No session telemetry recorded yet.</p>
              </div>}
          </div>}

        {
    /* Tab 4: Achievements Showcase */
  }
        {activeTab === "achievements" && <div className="space-y-3 overflow-y-auto pr-1 flex-1">
            <div className="flex items-center justify-between text-xs font-mono text-white/60 pb-1">
              <span>{unlockedCount} OF {stats.achievements.length} TROPHIES UNLOCKED</span>
              <span className="text-cyan-300 font-bold">
                {Math.round(unlockedCount / stats.achievements.length * 100)}% COMPLETE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {stats.achievements.map((ach) => <div
    key={ach.id}
    className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${ach.unlocked ? "bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border-purple-500/40 shadow-sm" : "bg-white/[0.02] border-white/5 opacity-50"}`}
  >
                  <div
    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${ach.unlocked ? "bg-purple-500/20 border border-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]" : "bg-white/5 border border-white/10 grayscale"}`}
  >
                    {ach.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                      {ach.unlocked ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3 h-3 text-white/30" />}
                    </div>
                    <p className="text-[11px] text-white/60 leading-tight mt-0.5">{ach.desc}</p>
                    <span className="text-[9px] font-mono text-indigo-400 mt-1 block">
                      GAME: {ach.game.toUpperCase()}
                    </span>
                  </div>
                </div>)}
            </div>
          </div>}
      </div>
    </div>;
}
