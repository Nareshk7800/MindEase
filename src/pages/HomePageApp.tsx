import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useCheckIn } from "../context/CheckInContext";

const HomePageApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { checkIns, getRecentCheckIns } = useCheckIn();

  // Dynamic user data integration
  const username = user?.username || "Elena";
  const userEmail = user?.email || "elena.peace@sanctuary.com";
  
  // Calculate dynamic check-in stats backward in time
  const calculateStreak = () => {
    if (!checkIns || checkIns.length === 0) return 0;
    
    // Parse dates and filter unique calendar days
    const uniqueDays = Array.from(
      new Set(
        checkIns.map(c => {
          const d = new Date(c.date);
          return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        })
      )
    ).map(dateStr => {
      const [y, m, d] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, d);
    });

    // Sort descending (latest first)
    uniqueDays.sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const latest = uniqueDays[0];
    if (!latest) return 0;

    latest.setHours(0, 0, 0, 0);

    // If latest checkin is neither today nor yesterday, streak is broken
    if (latest.getTime() !== today.getTime() && latest.getTime() !== yesterday.getTime()) {
      return 0;
    }

    streak = 1;
    let expected = new Date(latest);

    for (let i = 1; i < uniqueDays.length; i++) {
      const curr = uniqueDays[i];
      curr.setHours(0, 0, 0, 0);

      // check if it is exactly expected - 1 day
      const nextExpected = new Date(expected);
      nextExpected.setDate(nextExpected.getDate() - 1);

      if (curr.getTime() === nextExpected.getTime()) {
        streak++;
        expected = curr;
      } else {
        break; // streak is broken
      }
    }
    return streak;
  };

  // State for completions of meditations tracked locally
  const [completionsCount, setCompletionsCount] = useState(() => {
    try {
      const saved = localStorage.getItem("equimind_meditations_count");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const consecutiveDays = calculateStreak() || 12; // Realistic dynamic streak or fallback to 12
  const totalMinutes = completionsCount * 15; // Each completed meditation session counts for 15 minutes
  const sessionsCount = (checkIns?.length || 0) + completionsCount; // Dynamic total sessions (check-ins + meditations)

  // Focus Flow State values calculated dynamically from check-in data averages
  const getSerenity = () => {
    if (!checkIns || checkIns.length === 0) return 85;
    const totalMood = checkIns.reduce((sum, c) => sum + c.mood, 0);
    const totalStress = checkIns.reduce((sum, c) => sum + c.stress, 0);
    const avgMood = totalMood / checkIns.length;
    const avgStress = totalStress / checkIns.length;
    // Mood gives 60% weight, Stress (inverted) gives 40% weight
    return Math.round((avgMood / 5) * 60 + ((5 - avgStress) / 4) * 40);
  };

  const getFocus = () => {
    if (!checkIns || checkIns.length === 0) return 62;
    const totalEnergy = checkIns.reduce((sum, c) => sum + c.energy, 0);
    const totalStress = checkIns.reduce((sum, c) => sum + c.stress, 0);
    const avgEnergy = totalEnergy / checkIns.length;
    const avgStress = totalStress / checkIns.length;
    // Energy gives 70% weight, Stress (inverted) gives 30% weight
    return Math.round((avgEnergy / 5) * 70 + ((5 - avgStress) / 4) * 30);
  };

  const getVitality = () => {
    if (!checkIns || checkIns.length === 0) return 45;
    const totalEnergy = checkIns.reduce((sum, c) => sum + c.energy, 0);
    const totalSocial = checkIns.reduce((sum, c) => sum + c.social, 0);
    const avgEnergy = totalEnergy / checkIns.length;
    const avgSocial = totalSocial / checkIns.length;
    // Average of energy and social scores
    return Math.round(((avgEnergy / 5) * 50) + ((avgSocial / 5) * 50));
  };

  const serenityVal = getSerenity();
  const focusVal = getFocus();
  const vitalityVal = getVitality();

  // Interactive Checklist and complete states
  const [isReflectionCompleted, setIsReflectionCompleted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleMarkReflection = () => {
    if (!isReflectionCompleted) {
      const nextCount = completionsCount + 1;
      setCompletionsCount(nextCount);
      localStorage.setItem("equimind_meditations_count", String(nextCount));
      setIsReflectionCompleted(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      setIsReflectionCompleted(false);
      const nextCount = Math.max(0, completionsCount - 1);
      setCompletionsCount(nextCount);
      localStorage.setItem("equimind_meditations_count", String(nextCount));
    }
  };

  const handleBeginMeditation = () => {
    const nextCount = completionsCount + 1;
    setCompletionsCount(nextCount);
    localStorage.setItem("equimind_meditations_count", String(nextCount));
    navigate("/chat");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Safe checks for active paths
  const isActive = (path: string) => location.pathname === path;

  return (
    <Layout hideNavigation backgroundClassName="bg-background selection:bg-primary-container selection:text-on-primary-container">
      <div className="font-body text-on-surface bg-background min-h-screen relative overflow-x-hidden">
        
        {/* Floating Toast Notification */}
        {showToast && (
          <div className="fixed bottom-20 md:bottom-8 right-6 z-50 bg-primary text-on-primary font-headline font-bold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 text-sm animate-bounce">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <span>Reflection marked as complete! Well done.</span>
          </div>
        )}
 
        {/* TopNavBar - Refined with links completely removed */}
        <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl flex justify-between items-center px-6 py-3.5 border-b border-outline-variant/10">
          <div 
            onClick={() => navigate("/home")}
            className="text-xl font-bold tracking-tighter text-primary font-headline cursor-pointer hover:opacity-85 transition-opacity"
          >
            Ethereal Sanctuary
          </div>
 
          <div className="flex items-center gap-3.5 relative">
            {/* Notifications Button */}
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="material-symbols-outlined text-primary p-1.5 hover:bg-surface-container rounded-full transition-all scale-90 relative"
            >
              notifications
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-tertiary rounded-full animate-ping" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-tertiary rounded-full" />
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-10 top-11 w-72 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-3.5 shadow-2xl z-50 text-xs">
                <h4 className="font-headline font-bold text-primary mb-2">Recent Alerts</h4>
                <div className="space-y-2.5">
                  <div className="flex gap-2 items-start p-1.5 hover:bg-surface-container rounded-xl cursor-pointer">
                    <span className="material-symbols-outlined text-primary text-md">spa</span>
                    <div>
                      <p className="font-semibold text-on-surface leading-tight">Time for daily breathing</p>
                      <p className="text-[11px] text-on-surface-variant">Recommended 10 min session is ready.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start p-1.5 hover:bg-surface-container rounded-xl cursor-pointer">
                    <span className="material-symbols-outlined text-secondary text-md">chat_bubble</span>
                    <div>
                      <p className="font-semibold text-on-surface leading-tight">AI Assistant has recommendations</p>
                      <p className="text-[11px] text-on-surface-variant">Based on your mood log from yesterday.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Avatar Trigger */}
            <div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full bg-surface-container-highest overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/45 transition-all relative"
            >
              <img 
                alt="User profile photo" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLeLRwahZyD3Eu2vsl6ihTHUdpeiKUhb6lrvSoeHpFb0C3vETPwsaHbVngnJaCLFCRVM3oVs6iyZKGeXZsUx7GLSLNFQiYwk7NBK_oDCjWiCWgoLybCaroJ9hT0fm_6pLtKtceehQrXBtMB_dqHCcvYd8NC3zIiUX2j0JkzEgJ0RdcDuSpWbjUZTxJ-uGhQpfzEocdIeEby5iMvyFTKUUB_iT0-lz6RYGA6d2E_iPkR5e5M0DXdSr5dvmI1Ifu2wdmGRJkhjBYiMU"
              />
            </div>

            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-11 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-3 shadow-2xl z-50 text-xs">
                <div className="pb-2.5 mb-2.5 border-b border-outline-variant/20">
                  <p className="font-headline font-bold text-primary">{username}</p>
                  <p className="text-[10px] text-on-surface-variant truncate">{userEmail}</p>
                </div>
                <div className="space-y-1">
                  <button 
                    onClick={() => { setShowProfileMenu(false); navigate("/check-in"); }}
                    className="w-full text-left px-2 py-1.5 text-xs text-on-surface hover:bg-surface-container rounded-xl flex items-center gap-2.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-md">self_improvement</span>
                    Check-in Session
                  </button>
                  <button 
                    onClick={() => { setShowProfileMenu(false); navigate("/chat"); }}
                    className="w-full text-left px-2 py-1.5 text-xs text-on-surface hover:bg-surface-container rounded-xl flex items-center gap-2.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-md">chat_bubble</span>
                    Sound & Talk Therapy
                  </button>
                  <button 
                    onClick={() => { setShowProfileMenu(false); void handleLogout(); }}
                    className="w-full text-left px-2 py-1.5 text-xs text-error hover:bg-error-container/10 rounded-xl flex items-center gap-2.5 transition-colors font-semibold"
                  >
                    <span className="material-symbols-outlined text-md">logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* SideNavBar - Refined with muted light orange background and w-60 zoom structure */}
        <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 bg-[#faeacf] flex-col p-5 z-40 rounded-r-[2.25rem] shadow-xl shadow-[#373222]/5 pt-20 space-y-6">
          <div className="px-4 space-y-0.5">
            <p className="text-primary font-headline font-bold text-xs tracking-widest uppercase">Welcome back</p>
            <h2 className="text-lg font-extrabold text-primary font-headline">Find your calm</h2>
          </div>
          
          <nav className="flex-1 space-y-1.5">
            <Link 
              to="/home" 
              className={`flex items-center gap-3.5 rounded-full px-5 py-2.5 transition-all text-sm ${
                isActive("/home")
                  ? "bg-gradient-to-r from-[#3c6a35] to-[#b9eeab] text-white shadow-md shadow-primary/10 translate-x-0.5"
                  : "text-[#373222] hover:bg-[#fae1bc] rounded-full"
              }`}
            >
              <span className="material-symbols-outlined text-md">dashboard</span>
              <span className="font-headline font-medium">Dashboard</span>
            </Link>
            
            <Link 
              to="/resources" 
              className={`flex items-center gap-3.5 rounded-full px-5 py-2.5 transition-all text-sm ${
                isActive("/resources")
                  ? "bg-gradient-to-r from-[#3c6a35] to-[#b9eeab] text-white shadow-md shadow-primary/10 translate-x-0.5"
                  : "text-[#373222] hover:bg-[#fae1bc]"
              }`}
            >
              <span className="material-symbols-outlined text-md">library_books</span>
              <span className="font-headline font-medium">Resources</span>
            </Link>
            
            <Link 
              to="/wellness" 
              className={`flex items-center gap-3.5 rounded-full px-5 py-2.5 transition-all text-sm ${
                isActive("/wellness")
                  ? "bg-gradient-to-r from-[#3c6a35] to-[#b9eeab] text-white shadow-md shadow-primary/10 translate-x-0.5"
                  : "text-[#373222] hover:bg-[#fae1bc]"
              }`}
            >
              <span className="material-symbols-outlined text-md">spa</span>
              <span className="font-headline font-medium">Wellness</span>
            </Link>
            
            <Link 
              to="/chat" 
              className={`flex items-center gap-3.5 rounded-full px-5 py-2.5 transition-all text-sm ${
                isActive("/chat")
                  ? "bg-gradient-to-r from-[#3c6a35] to-[#b9eeab] text-white shadow-md shadow-primary/10 translate-x-0.5"
                  : "text-[#373222] hover:bg-[#fae1bc]"
              }`}
            >
              <span className="material-symbols-outlined text-md">chat_bubble</span>
              <span className="font-headline font-medium">Support</span>
            </Link>
          </nav>
          
          <div className="mt-auto px-2 pb-2">
            <button 
              onClick={() => navigate("/check-in")}
              className="w-full bg-gradient-to-r from-primary to-primary-dim text-on-primary rounded-full py-3 text-xs font-headline font-bold shadow-md shadow-primary/15 hover:scale-103 transition-transform"
            >
              Start Session
            </button>
          </div>
        </aside>

        {/* Main Content - Shifted w-60 margins and 80% zoomed layout styling */}
        <main className="md:ml-60 pt-20 min-h-screen px-4 md:px-8 pb-20 md:pb-8">
          
          {/* Hero / Greeting - Sized down by 20% */}
          <header className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4.5xl font-headline font-extrabold tracking-tighter text-on-surface">
                Good Morning, {username}
              </h1>
              <p className="text-on-surface-variant text-sm max-w-sm">
                You've maintained your tranquility for <span className="text-primary font-bold">{consecutiveDays} consecutive days</span>. Your journey continues here.
              </p>
            </div>
            
            <div className="flex gap-3">
              <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm flex flex-col items-center justify-center min-w-[100px]">
                <span className="text-2xl font-bold text-secondary">{totalMinutes}</span>
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Minutes</span>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-lg shadow-sm flex flex-col items-center justify-center min-w-[100px]">
                <span className="text-2xl font-bold text-tertiary">{sessionsCount}</span>
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Sessions</span>
              </div>
            </div>
          </header>

          {/* Bento Grid Layout - Sized down by 20% */}
          <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Featured: Daily Recommendation (6 columns) */}
            <div className="md:col-span-7 group relative overflow-hidden rounded-lg min-h-[280px] md:min-h-auto aspect-[16/10] md:aspect-auto flex flex-col justify-end p-6 text-white shadow-sm">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                style={{ 
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAaoLnAJUq4CE30c1oqiJzpIbg-IKo2Xf_9AppQs1Qzpb6nROLBUTkBHmivEYoH3Ye_JofUitwnRNO8mAin8KhXeBRzGb7qN6oOIUcTtuaDG-zHWgPJc_JXKiMSoj94xqu5gWbYsUWkH5goVyLqMvOAJOztzKM6JWZjvnSmJIkYUZuhucjrX3zJZeTjrap7pYp6bhgP3SYV0H6UjJD_4zhhNJumhBM1Kj3fILUePXEsHzYl_wkso2UYWwiwJ5NGJQ-vmEVWjFC1pMU')" 
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              
              <div className="relative z-10 space-y-3">
                <span className="bg-tertiary text-on-tertiary px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block">
                  Recommended for You
                </span>
                <h3 className="text-2xl md:text-3.5xl font-headline font-extrabold leading-tight">
                  Awakening the <br/>Inner Forest
                </h3>
                <p className="text-white/85 text-xs max-w-xs">A 15-minute sensory journey designed to ground your morning energy.</p>
                <button 
                  onClick={handleBeginMeditation}
                  className="mt-2.5 flex items-center gap-2 bg-white text-on-surface rounded-full px-6 py-2.5 text-xs font-bold hover:bg-primary-container hover:text-on-primary-container transition-all shadow hover:shadow-md"
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  Begin Meditation
                </button>
              </div>
            </div>

            {/* Mood Summary (5 columns) */}
            <div className="md:col-span-5 bg-surface-container-low rounded-lg p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-xl font-headline font-bold mb-1">Focus Flow</h3>
                <p className="text-on-surface-variant text-xs mb-6">Your emotional landscape this week.</p>
                
                <div className="space-y-4.5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Serenity</span>
                      <span className="text-primary">{serenityVal}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${serenityVal}%` }} />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Focus</span>
                      <span className="text-secondary">{focusVal}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full transition-all duration-1000" style={{ width: `${focusVal}%` }} />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Vitality</span>
                      <span className="text-tertiary">{vitalityVal}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-tertiary rounded-full transition-all duration-1000" style={{ width: `${vitalityVal}%` }} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex items-center gap-3 p-3.5 glass-panel-warm rounded-lg">
                <span className="material-symbols-outlined text-tertiary text-2xl shrink-0">lightbulb</span>
                <p className="text-xs font-medium leading-tight">
                  Your peak focus time is usually <span className="font-bold">7:30 AM</span>. Try your session then!
                </p>
              </div>
            </div>

            {/* Recent Activity (12 columns - Grid of cards) */}
            <div className="md:col-span-12 mt-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-headline font-extrabold tracking-tight">Return to the Path</h3>
                <button 
                  onClick={() => navigate("/wellness")}
                  className="text-primary text-xs font-bold hover:underline flex items-center gap-0.5 group"
                >
                  View Library
                  <span className="material-symbols-outlined text-[10px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Card 1 */}
                <div onClick={() => navigate("/wellness")} className="group cursor-pointer">
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-2.5 shadow-sm">
                    <img 
                      alt="Yoga session" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAA5dTmsyrAjL9ZYF5Tg6sB2ihmZXGj7KJiNVssZmyluCW58Cxhl0egpADOtRp4lVrR2ci-BkPHuUydLb82PJsrJ-8Bs7fHR2gp_4QR8f9aN908qD22ojCL2pV1Ie5GRvNgvFajbyt3qscVvim-uWJkW-Yqs5_mYcfoZ40bkjjaXuACD0DZhgoOlLoLPdYrt_ZQd8I5pxlp5Ar21WTvYo6EtGcB4HIcIeRADc4V2-7g5N1_ITxfa-fftTgkBqqIgFffOu83jQriPU"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest">12 Min</div>
                  </div>
                  <h4 className="font-headline font-bold text-sm group-hover:text-primary transition-colors">Gentle Morning Yoga</h4>
                  <p className="text-on-surface-variant text-[11px]">Flow through stillness</p>
                </div>

                {/* Card 2 */}
                <div onClick={() => navigate("/wellness")} className="group cursor-pointer">
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-2.5 shadow-sm">
                    <img 
                      alt="Forest scene" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU8kG6iT8MlwEvMYznEbI3wGRAdOJUiAV8rSINTOHGIB2RslLIkqjIXjNVO2082bj7gO16vJGCvxUP0UYC-mXc-FH84hL74oUKZn9ilKKgN-tI_7np65GHEtI6sVgbmP-lIqD2QcP6fWNljn390nxRl4FLff_T3b6fy8cXOewuzaAh3nIzjOywFJTItEl08c7se_gg6PLnOnemmNuamEl16h4RDxC7oaBsjc2tvDyKAlO4BW-V567XMZs-E4tTEAuLpgQuTQicaQ"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest">20 Min</div>
                  </div>
                  <h4 className="font-headline font-bold text-sm group-hover:text-primary transition-colors">Woodland Breathing</h4>
                  <p className="text-on-surface-variant text-[11px]">Deep organic respiration</p>
                </div>

                {/* Card 3 */}
                <div onClick={() => navigate("/wellness")} className="group cursor-pointer">
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-2.5 shadow-sm">
                    <img 
                      alt="Ocean waves" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCO0LZh58g0Teweq_i-uyLgXF_RBMqhucw4I8ovy5oepa8o3BMPy9bVk51nQi2zSvw1_NlWnbl__1NQXX5EXsiAAbAgkSZQWLTXCNUeFKc-sfphpSMUNVQu_M6My14Zlmny9ZiT4JyRvxhVtASSZ6qiuzsRd3nbcDquum_belmegONVaxFyucoXEx4cnmFu5VkfuJgYne-q1WI3IN-h_VGnoTzVXhEWhWq6m9N4w7vQamuo6GrlrXFWkUNueyoxUL-gPR58UmVa7Ws"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest">10 Min</div>
                  </div>
                  <h4 className="font-headline font-bold text-sm group-hover:text-primary transition-colors">Oceanic Drift</h4>
                  <p className="text-on-surface-variant text-[11px]">Sleep preparation</p>
                </div>

                {/* Card 4 */}
                <div onClick={() => navigate("/wellness")} className="group cursor-pointer">
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-2.5 shadow-sm">
                    <img 
                      alt="Mountain sunset" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpojOSZaSNjVAmJQhMNmcPaVfsS0I23jmWv4cVgkmh9woXXLXZVXXHIuJvUkoOcPh6N4hyTuXcahZ92puiQXQaENFYtUEheqiZJlAFz4ODZO8GQPmkprX5wVhXudXUmW_M-D1KWEx9GeSMHBI8ZHLP9074ZuLib76v6bvCLzg2mroS2W_aG3h1GDsuZ0UZvHvaewB0Ml1P40cKIjG6ENoRA6zdUb1IwPx1wvxUNqu_mE8jGvisvpNL9IdQy_Dn0O88DXVZjr8umZY"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest">15 Min</div>
                  </div>
                  <h4 className="font-headline font-bold text-sm group-hover:text-primary transition-colors">Peak Clarity</h4>
                  <p className="text-on-surface-variant text-[11px]">Focus and determination</p>
                </div>
              </div>
            </div>

            {/* Daily Task Inset - Sized down by 20% */}
            <div className="md:col-span-12 mt-8 mb-4 bg-surface-container rounded-lg p-5 md:p-7 flex flex-col md:flex-row items-center gap-4 md:gap-8 relative overflow-hidden shadow-inner">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
              <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center shrink-0 shadow">
                <span className="material-symbols-outlined text-on-secondary-container text-2xl">self_improvement</span>
              </div>
              
              <div className="flex-1 space-y-1 text-center md:text-left">
                <h3 className="text-xl font-headline font-extrabold tracking-tight">Today's Reflection</h3>
                <p className="text-on-surface-variant text-sm">
                  "The forest does not rush, yet everything is accomplished." Take 3 minutes to sit without distraction after lunch today.
                </p>
              </div>
              
              <div className="shrink-0">
                <button 
                  onClick={handleMarkReflection}
                  className={`rounded-full px-8 py-3.5 text-xs font-headline font-bold shadow-md transition-all active:scale-95 ${
                    isReflectionCompleted
                      ? "bg-primary-dim text-primary-fixed shadow-inner scale-95 opacity-90"
                      : "bg-primary text-on-primary shadow-primary/10 hover:bg-primary-dim"
                  }`}
                >
                  {isReflectionCompleted ? "Reflection Complete ✓" : "Mark as Complete"}
                </button>
              </div>
            </div>
          </section>
        </main>


        
      </div>
    </Layout>
  );
};

export default HomePageApp;
