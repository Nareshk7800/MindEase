import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useCheckIn } from '../context/CheckInContext';

interface Recommendation {
  id: string;
  title: string;
  duration: string;
  tag: string;
  description: string;
  category: string;
  image: string;
}

const WellnessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { checkIns } = useCheckIn();

  // Navigation active state checker
  const isActive = (path: string) => location.pathname === path;

  // Dynamic user data integration
  const username = user?.username || "Alex";
  const userEmail = user?.email || "alex.peace@sanctuary.com";

  // Modal and Sync states
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedText, setLastSyncedText] = useState("Last synced 2m ago");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active exercises states
  const [activeModal, setActiveModal] = useState<'breathing' | 'yoga' | 'meditation' | 'journal' | null>(null);
  
  // Interactive Breathing Exercise State
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [isBreathingRunning, setIsBreathingRunning] = useState(false);

  // Interactive Yoga Flow State
  const [yogaPoseIndex, setYogaPoseIndex] = useState(0);
  const [yogaTimer, setYogaTimer] = useState(30);
  const [isYogaRunning, setIsYogaRunning] = useState(false);
  
  const yogaPoses = [
    { title: "Child's Pose", instruction: "Rest your hips back on your heels, extend arms forward, and rest your forehead on the floor." },
    { title: "Cat-Cow Stretch", instruction: "On all fours, arch your back towards the ceiling, then dip your belly towards the floor." },
    { title: "Downward-Facing Dog", instruction: "Press hands down, lift hips up and back, creating an inverted V-shape. Relax your neck." },
    { title: "Cobra Pose", instruction: "Lie on your stomach, hands under shoulders, and gently lift your chest while keeping hips grounded." }
  ];

  // Interactive Meditation Soundscape State
  const [isMeditationPlaying, setIsMeditationPlaying] = useState(false);
  const [meditationProgress, setMeditationProgress] = useState(35); // percentage

  // Interactive Gratitude Journal State
  const [gratitude1, setGratitude1] = useState("");
  const [gratitude2, setGratitude2] = useState("");
  const [gratitude3, setGratitude3] = useState("");

  // Calculate streak from checkIns context or fallback to 14
  const calculateStreak = () => {
    if (!checkIns || checkIns.length === 0) return 0;
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

    uniqueDays.sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const latest = uniqueDays[0];
    if (!latest) return 0;

    latest.setHours(0, 0, 0, 0);

    if (latest.getTime() !== today.getTime() && latest.getTime() !== yesterday.getTime()) {
      return 0;
    }

    streak = 1;
    let expected = new Date(latest);

    for (let i = 1; i < uniqueDays.length; i++) {
      const curr = uniqueDays[i];
      curr.setHours(0, 0, 0, 0);

      const nextExpected = new Date(expected);
      nextExpected.setDate(nextExpected.getDate() - 1);

      if (curr.getTime() === nextExpected.getTime()) {
        streak++;
        expected = curr;
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak() || 14;

  // Handle Wearable Synchronization
  const handleSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setLastSyncedText("Syncing and analyzing data...");
    
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncedText("Connected • Last synced just now");
      showToast("Wearable health metrics successfully updated!");
    }, 1500);
  };

  // Helper to show custom bottom-right toast message
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Logout routine
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // Handle Breathing Exercise timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathingRunning) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            // Transition phase
            if (breathPhase === 'Inhale') {
              setBreathPhase('Hold');
              return 7;
            } else if (breathPhase === 'Hold') {
              setBreathPhase('Exhale');
              return 8;
            } else {
              setBreathPhase('Inhale');
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingRunning, breathPhase]);

  // Handle Yoga Exercise timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isYogaRunning) {
      interval = setInterval(() => {
        setYogaTimer((prev) => {
          if (prev <= 1) {
            // Next pose
            setYogaPoseIndex((prevIndex) => {
              const nextIndex = prevIndex + 1;
              if (nextIndex >= yogaPoses.length) {
                setIsYogaRunning(false);
                showToast("Splendid job! You finished your solar yoga flow.");
                return 0;
              }
              return nextIndex;
            });
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isYogaRunning, yogaPoseIndex]);

  // Save Journal Entry
  const handleSaveJournal = () => {
    if (!gratitude1.trim() && !gratitude2.trim() && !gratitude3.trim()) {
      showToast("Please fill in at least one reflection item.");
      return;
    }
    showToast("Journal reflection entry saved successfully!");
    setGratitude1("");
    setGratitude2("");
    setGratitude3("");
    setActiveModal(null);
  };

  return (
    <Layout hideNavigation={true}>
      <div className="font-body text-on-surface bg-background min-h-screen relative overflow-x-hidden pb-12 selection:bg-primary-container selection:text-on-primary-container">
        
        {/* CSS Custom Keyframe Animation Hooks */}
        <style dangerouslySetInnerHTML={{ __html: `
          .glass-card-warm {
            background: rgba(236, 226, 202, 0.4);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .delay-1 { animation-delay: 0.05s; animation-fill-mode: both; }
          .delay-2 { animation-delay: 0.1s; animation-fill-mode: both; }
          .delay-3 { animation-delay: 0.15s; animation-fill-mode: both; }
          .delay-4 { animation-delay: 0.2s; animation-fill-mode: both; }
          .delay-5 { animation-delay: 0.25s; animation-fill-mode: both; }
        `}} />

        {/* Global Toast Message Banner */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="fixed bottom-24 md:bottom-8 right-6 z-50 bg-[#3c6a35] text-[#ebffe0] font-headline font-bold px-6 py-3 rounded-full shadow-2xl flex items-center gap-2.5 text-sm"
            >
              <span className="material-symbols-outlined text-lg">check_circle</span>
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TopNavBar Shell - Clean White Background */}
        <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl flex justify-between items-center px-6 md:px-8 py-4 border-b border-[#ece2ca]/30 shadow-sm">
          <div 
            onClick={() => navigate("/home")}
            className="text-xl md:text-2xl font-bold tracking-tighter text-[#3c6a35] dark:text-[#b9eeab] font-headline cursor-pointer hover:opacity-85 transition-opacity"
          >
            Ethereal Sanctuary
          </div>
          
          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-8">
            <Link className={`font-headline tracking-wide text-sm ${isActive('/home') ? 'text-[#3c6a35] font-bold' : 'text-[#373222] hover:opacity-75'} transition-opacity`} to="/home">Dashboard</Link>
            <Link className={`font-headline tracking-wide text-sm ${isActive('/resources') ? 'text-[#3c6a35] font-bold' : 'text-[#373222] hover:opacity-75'} transition-opacity`} to="/resources">Resources</Link>
            <Link className={`font-headline tracking-wide text-sm ${isActive('/wellness') ? 'text-[#3c6a35] font-bold' : 'text-[#373222] hover:opacity-75'} transition-opacity`} to="/wellness">Wellness</Link>
            <Link className={`font-headline tracking-wide text-sm ${isActive('/chat') ? 'text-[#3c6a35] font-bold' : 'text-[#373222] hover:opacity-75'} transition-opacity`} to="/chat">Support</Link>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Notifications Button */}
            <button 
              onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileMenuOpen(false); }}
              className="material-symbols-outlined text-[#3c6a35] p-1.5 hover:bg-[#f6edda] rounded-full transition-all scale-95 relative"
            >
              notifications
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#9c4600] rounded-full animate-pulse" />
            </button>

            {/* Profile Avatar */}
            <div 
              onClick={() => { setProfileMenuOpen(!profileMenuOpen); setNotificationsOpen(false); }}
              className="w-9 h-9 rounded-full bg-surface-container-highest overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#3c6a35]/50 transition-all"
            >
              <img 
                alt="User profile photo" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrc2LAoW20ki135KRjpS6VXBi7yEQpXR9PZb1620x_SDOJZcrjJvFfjKEBi9rKbOuod2oQO82IpXciBVju1n1-57fEVSa51TJLcvwtnYBJqp0FJ7GfDpt99A9KoD7N8Hmt36qFsb6XOnBQ1_yJKcjltLkgYMB9bGquC9F6Kty2gCmqHM4VcqARRmCxm1mOCf5rrwZsE9X0zAWkA1_h5cpS74mzTFeK0FQyQ804aIoPMW_3YFkvvygBZqizJ33oKfbrmxUyoWpSCLY"
              />
            </div>

            {/* Profile Menu Dropdown */}
            {profileMenuOpen && (
              <div className="absolute right-0 top-12 w-56 bg-[#ffffff] border border-[#bab19b]/40 rounded-2xl p-3 shadow-2xl z-50 text-xs">
                <div className="pb-2.5 mb-2.5 border-b border-[#bab19b]/25">
                  <p className="font-headline font-bold text-[#3c6a35]">{username}</p>
                  <p className="text-[10px] text-on-surface-variant truncate">{userEmail}</p>
                </div>
                <div className="space-y-1">
                  <button 
                    onClick={() => { setProfileMenuOpen(false); navigate("/check-in"); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#f6edda] rounded-xl flex items-center gap-2 transition-colors font-headline"
                  >
                    <span className="material-symbols-outlined text-sm">self_improvement</span>
                    Check-in Session
                  </button>
                  <button 
                    onClick={() => { setProfileMenuOpen(false); navigate("/chat"); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#f6edda] rounded-xl flex items-center gap-2 transition-colors font-headline"
                  >
                    <span className="material-symbols-outlined text-sm">chat_bubble</span>
                    Sound & Talk Therapy
                  </button>
                  <button 
                    onClick={() => { setProfileMenuOpen(false); void handleLogout(); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-red-50 text-red-700 rounded-xl flex items-center gap-2 transition-colors font-headline font-semibold"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-8 top-12 w-72 bg-[#ffffff] border border-[#bab19b]/40 rounded-2xl p-3 shadow-2xl z-50 text-xs">
                <h4 className="font-headline font-bold text-[#3c6a35] mb-2">Sanctuary Alerts</h4>
                <div className="space-y-2">
                  <div 
                    onClick={() => { setNotificationsOpen(false); setActiveModal('breathing'); setIsBreathingRunning(true); }}
                    className="flex gap-2 items-start p-2 hover:bg-[#f6edda] rounded-xl cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[#3c6a35] text-md">spa</span>
                    <div>
                      <p className="font-semibold text-on-surface leading-tight">Time for daily breathing</p>
                      <p className="text-[10px] text-on-surface-variant">Recommended 10 min session is ready.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start p-2 hover:bg-[#f6edda] rounded-xl cursor-pointer">
                    <span className="material-symbols-outlined text-[#0e6781] text-md">chat_bubble</span>
                    <div>
                      <p className="font-semibold text-on-surface leading-tight">AI Companion Recommendations</p>
                      <p className="text-[10px] text-on-surface-variant">Based on your mood log from yesterday.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* SideNavBar Shell (Desktop) - Aligned bg-[#faeacf] and w-60 zoom to match Dashboard sidebar exactly */}
        <aside className="fixed left-0 top-0 h-full hidden md:flex flex-col p-5 z-40 bg-[#faeacf] w-60 rounded-r-[2.25rem] shadow-xl shadow-[#373222]/5 pt-20 space-y-6">
          <div className="px-4 space-y-0.5 text-left">
            <p className="text-primary font-headline font-bold text-xs tracking-widest uppercase">Welcome back</p>
            <h2 className="text-lg font-extrabold text-[#3c6a35] font-headline">Find your calm</h2>
          </div>
          
          <nav className="flex-1 space-y-1.5">
            <Link 
              className={`flex items-center gap-3.5 px-5 py-2.5 rounded-full transition-all text-sm ${
                isActive('/home') 
                  ? 'bg-gradient-to-r from-[#3c6a35] to-[#b9eeab] text-white shadow-md shadow-[#3c6a35]/10 translate-x-0.5' 
                  : 'text-[#373222] hover:bg-[#fae1bc]'
              }`} 
              to="/home"
            >
              <span className="material-symbols-outlined text-md">dashboard</span>
              <span className="font-headline font-medium">Dashboard</span>
            </Link>
            
            <Link 
              className={`flex items-center gap-3.5 px-5 py-2.5 rounded-full transition-all text-sm ${
                isActive('/resources') 
                  ? 'bg-gradient-to-r from-[#3c6a35] to-[#b9eeab] text-white shadow-md shadow-[#3c6a35]/10 translate-x-0.5' 
                  : 'text-[#373222] hover:bg-[#fae1bc]'
              }`} 
              to="/resources"
            >
              <span className="material-symbols-outlined text-md">library_books</span>
              <span className="font-headline font-medium">Resources</span>
            </Link>
            
            <Link 
              className={`flex items-center gap-3.5 px-5 py-2.5 rounded-full transition-all text-sm ${
                isActive('/wellness') 
                  ? 'bg-gradient-to-r from-[#3c6a35] to-[#b9eeab] text-white shadow-md shadow-[#3c6a35]/10 translate-x-0.5' 
                  : 'text-[#373222] hover:bg-[#fae1bc]'
              }`} 
              to="/wellness"
            >
              <span className="material-symbols-outlined text-md">spa</span>
              <span className="font-headline font-medium">Wellness</span>
            </Link>
            
            <Link 
              className={`flex items-center gap-3.5 px-5 py-2.5 rounded-full transition-all text-sm ${
                isActive('/chat') 
                  ? 'bg-gradient-to-r from-[#3c6a35] to-[#b9eeab] text-white shadow-md shadow-[#3c6a35]/10 translate-x-0.5' 
                  : 'text-[#373222] hover:bg-[#fae1bc]'
              }`} 
              to="/chat"
            >
              <span className="material-symbols-outlined text-md">chat_bubble</span>
              <span className="font-headline font-medium">Support</span>
            </Link>
          </nav>
          
          <div className="mt-auto px-2 pb-2">
            <button 
              onClick={() => { setActiveModal('breathing'); setIsBreathingRunning(true); setBreathTimer(4); setBreathPhase('Inhale'); }}
              className="w-full bg-[#3c6a35] text-[#ebffe0] rounded-full py-3 text-xs font-headline font-bold shadow-md shadow-primary/15 hover:scale-103 transition-transform"
            >
              Start Session
            </button>
          </div>
        </aside>

        {/* Main Content Canvas - Aligned to md:ml-60 pt-20 and scaled perfectly */}
        <main className="md:ml-60 pt-20 min-h-screen px-4 md:px-8 pb-20 md:pb-8 max-w-5xl mx-auto text-left">
          
          {/* Header Section */}
          <header className="mb-10 max-w-5xl animate-fade-in-up mt-6">
            <span className="text-[#9c4600] font-label text-xs font-bold tracking-widest uppercase mb-1 block">Personal Sanctuary</span>
            <h1 className="text-4xl md:text-5.5xl font-headline font-extrabold text-on-surface tracking-tight leading-none">
              Your Vitality <span className="text-[#3c6a35] italic font-medium">Pulse</span>
            </h1>
            <p className="text-on-surface-variant text-sm mt-3 max-w-xl font-body">
              Reflecting your journey towards inner peace and physical harmony. Your wearable data is synced and analyzed for today.
            </p>
          </header>

          {/* Metrics Bento Grid */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Sleep analysis card (large) */}
            <div className="md:col-span-2 rounded-2xl bg-[#fbf3e1] dark:bg-[#1c1b17] p-6 relative overflow-hidden group transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/5 animate-fade-in-up delay-1">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[#0e6781] group-hover:rotate-12 transition-transform duration-300 text-lg">bedtime</span>
                    <span className="font-label font-bold text-[11px] text-on-surface-variant tracking-wider">SLEEP ANALYSIS</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-headline font-extrabold text-[#373222] dark:text-[#ffffff]">7h 42m</span>
                    <span className="text-[#3c6a35] text-xs font-bold font-headline">+12% from avg</span>
                  </div>
                </div>
                
                {/* Visual Chart - Smooth rounded bars */}
                <div className="mt-6 flex gap-2.5 items-end h-28 max-w-md">
                  <div className="w-full bg-[#b9eeab]/30 rounded-full h-10 hover:bg-[#b9eeab]/50 transition-all cursor-pointer"></div>
                  <div className="w-full bg-[#b9eeab]/30 rounded-full h-16 hover:bg-[#b9eeab]/50 transition-all cursor-pointer"></div>
                  <div className="w-full bg-[#b9eeab]/30 rounded-full h-22 hover:bg-[#b9eeab]/50 transition-all cursor-pointer"></div>
                  <div className="w-full bg-[#b9eeab] rounded-full h-26 hover:brightness-105 transition-all cursor-pointer"></div>
                  <div className="w-full bg-[#b9eeab]/30 rounded-full h-14 hover:bg-[#b9eeab]/50 transition-all cursor-pointer"></div>
                  <div className="w-full bg-[#b9eeab]/30 rounded-full h-20 hover:bg-[#b9eeab]/50 transition-all cursor-pointer"></div>
                  <div className="w-full bg-[#b9eeab]/30 rounded-full h-12 hover:bg-[#b9eeab]/50 transition-all cursor-pointer"></div>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#3c6a35]/5 rounded-full blur-3xl group-hover:bg-[#3c6a35]/15 transition-all duration-700"></div>
            </div>

            {/* Focus score card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-[#ece2ca]/40 flex flex-col justify-between group transition-all duration-300 hover:scale-[1.01] hover:shadow-lg animate-fade-in-up delay-2">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#9c4600] group-hover:scale-110 transition-transform text-lg">psychology</span>
                  <span className="font-label font-bold text-[11px] text-on-surface-variant tracking-wider">FOCUS SCORE</span>
                </div>
                <div className="relative w-28 h-28 mx-auto my-3">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-[#ece2ca]/50" cx="56" cy="56" fill="transparent" r="50" stroke="currentColor" strokeWidth="6"></circle>
                    <circle className="text-[#9c4600]" cx="56" cy="56" fill="transparent" r="50" stroke="currentColor" strokeDasharray="314.1" strokeDashoffset="47.1" strokeLinecap="round" strokeWidth="6"></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-headline font-extrabold text-[#373222]">85</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-on-surface-variant text-[11px] mt-2 leading-relaxed">
                Deep focus achieved for 4 hours today.
              </p>
            </div>

            {/* Steps / Movement card */}
            <div className="rounded-2xl bg-[#baeaff]/15 p-6 border border-[#0e6781]/10 flex flex-col justify-between group transition-all duration-300 hover:scale-[1.01] hover:shadow-lg animate-fade-in-up delay-3">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#0e6781] group-hover:translate-x-0.5 transition-transform text-lg">directions_run</span>
                    <span className="font-label font-bold text-[11px] text-on-surface-variant tracking-wider uppercase">Movement</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-[#0e6781] transition-colors text-lg cursor-default">watch</span>
                </div>
                <h3 className="text-3xl font-headline font-extrabold text-[#373222] my-1">8,432</h3>
                <p className="text-on-surface-variant text-xs">Steps today</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#ece2ca]/20">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-on-surface-variant">Goal: 10,000</span>
                  <span className="text-[#0e6781]">84%</span>
                </div>
                <div className="w-full bg-[#ece2ca]/60 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-[#0e6781] h-full rounded-full w-[84%]" style={{ transition: "width 1s ease" }}></div>
                </div>
              </div>
            </div>

            {/* Streak card (wide) */}
            <div className="md:col-span-2 rounded-2xl bg-[#110e06] p-6 text-white flex items-center justify-between relative overflow-hidden group transition-all duration-300 hover:scale-[1.01] hover:shadow-xl animate-fade-in-up delay-4">
              <div className="relative z-10 text-left">
                <h3 className="text-xl font-headline font-extrabold mb-1">{currentStreak} Day Zen Streak</h3>
                <p className="text-white/60 text-xs mb-4 max-w-sm">
                  You're in the top 5% of mindful practitioners this month.
                </p>
                
                {/* Streak dots */}
                <div className="flex gap-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                    const isCompleted = idx < 6; // First 6 completed
                    return (
                      <div 
                        key={idx} 
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs hover:scale-105 transition-transform cursor-default ${
                          isCompleted 
                            ? idx === 5 
                              ? 'bg-[#b9eeab] text-[#3c6a35]' 
                              : 'bg-[#3c6a35] text-[#ebffe0]' 
                            : 'border border-white/20 text-white/40'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="hidden md:block relative z-10 text-right pr-2">
                <span className="text-5xl md:text-6xl font-headline font-black text-[#b9eeab] block group-hover:scale-105 transition-transform duration-500">
                  {currentStreak}
                </span>
                <p className="font-label tracking-widest text-[9px] text-white/40 uppercase">Days Consistent</p>
              </div>

              <div className="absolute right-0 top-0 w-full h-full opacity-10 pointer-events-none group-hover:scale-[1.03] transition-transform duration-700">
                <img 
                  alt="Abstract zen pattern" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDArIAh0IrMFiwYlN3xIy-aiVtCXaO-TZ5r2nZ5QufRCBspthegVRNCJ2Ls32aYk3Dt2-DOIp92j7PiKbndof98JgR6YQlk5pWiKAPrnGYRCqNWW0U6sfq56MEfG4amt9N5wTyiC2lrdvtLj1Doca_KplghKSNBsVk1P3I-fYAx2zR5glg8X9zgf123huQP4vnKngjXdukVTzd3SALhBtSxJr425vocP-_IhjTMMK79M883Nfdu7dTOGUZZnEU9ivj32SgiQOmeoWQ"
                />
              </div>
            </div>
          </section>

          {/* Recommendations Header */}
          <section className="mb-8 animate-fade-in-up delay-5">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-headline font-extrabold text-on-surface">Curated for Your State</h2>
                <p className="text-on-surface-variant text-xs mt-1">Based on your low sleep and high focus today.</p>
              </div>
              <button 
                onClick={() => navigate("/resources")}
                className="text-[#3c6a35] text-xs font-headline font-bold hover:underline transition-all active:scale-95 flex items-center gap-0.5"
              >
                View All
                <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
              </button>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Rec Card 1 */}
              <div 
                onClick={() => { setActiveModal('yoga'); setIsYogaRunning(true); setYogaTimer(30); setYogaPoseIndex(0); }} 
                className="group cursor-pointer text-left"
              >
                <div className="relative h-48 rounded-xl overflow-hidden mb-3.5 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-0.5">
                  <img 
                    alt="Yoga session" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfibNZGAzpQ-6JtSFFz8zhaAjEJwlNoJUolCAb1mX5SgkbmlTpIbBoxKOTd8aL4Dq8Ef1SklL_cih7nDBVLj8EecfQNr2iOoebhUn_S4H7Hp02SDSTODhQH0X3liouGiyy2Cg_5Wsbo9-o5BQOw9mnC-8G3XWPL6P1jnohsC1gloa6bT98tUIJrd3gL9vgupo3p6W0kR_7nXUB05lXWuPs1U393lpeRtY0om7qupjvU_N2OGrUPEJIvsVrKKK4CrUFD-O0z7zTCus"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                    <span className="bg-[#baeaff]/80 backdrop-blur-md text-[#005971] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest font-headline">Recharge</span>
                  </div>
                </div>
                <h3 className="text-base font-headline font-bold text-[#373222] group-hover:text-[#3c6a35] transition-colors leading-tight">Afternoon Solar Flow</h3>
                <p className="text-on-surface-variant text-[11px] mt-1 font-body">15 min • Gentle movement to boost energy</p>
              </div>

              {/* Rec Card 2 */}
              <div 
                onClick={() => { setActiveModal('meditation'); setIsMeditationPlaying(true); setMeditationProgress(35); }} 
                className="group cursor-pointer text-left"
              >
                <div className="relative h-48 rounded-xl overflow-hidden mb-3.5 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-0.5">
                  <img 
                    alt="Meditation scene" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzeCrG_WecVKS9l6cnt0-XZnBeBVw8_yGTsBsKWeP8_w9Gjiq-ePqkOrHALDp7qgbPpYmem4MWe1KVkUvkARu30ZLNygCwvFf1riiQJ8-dFXlbSpmImkr3JMc_Nn20aOgOC5CqSKHIwfIHRWbwZaqUJ8V6E3o3uo_Qu_Da3aiai84KhoIyRXz9gvB3D-6_Tp7iXYKqzxk4LgrDOFu4jnsOK0ugfV8u5sSoNLtMVGSJT8UGWTgFa0PW2nm85rGqnInqK4uOUNJXDD4"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                    <span className="bg-[#ffa26b]/80 backdrop-blur-md text-[#5d2700] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest font-headline">Restorative</span>
                  </div>
                </div>
                <h3 className="text-base font-headline font-bold text-[#373222] group-hover:text-[#3c6a35] transition-colors leading-tight">Deep Forest Resonance</h3>
                <p className="text-on-surface-variant text-[11px] mt-1 font-body">20 min • Soundscape for cognitive rest</p>
              </div>

              {/* Rec Card 3 */}
              <div 
                onClick={() => { setActiveModal('journal'); setGratitude1(""); setGratitude2(""); setGratitude3(""); }} 
                className="group cursor-pointer text-left"
              >
                <div className="relative h-48 rounded-xl overflow-hidden mb-3.5 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:-translate-y-0.5">
                  <img 
                    alt="Journaling" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB152zmG9_OAm4s3LNDbjinTft9pp2RFAHiuBqtuMGy9QIFsTVVmG6BtudDAAGjL-4gpc4pCKd8ANRpiJRi-nWNTg6vTuQSk5ruYAmO8jmfANBhF_zoX45BN7DkZ27k3aMXyyiaaR9Eh8flbQi1rTgsOXcrXQJPeIEklZp_iKTs2uewtq7necn0U5gB7ar8873ghmyBbDjDgwqE3k_KTN_Hf6b2g5oU-x484Fhgu1EYAMhZ2huZ9mDLjCfa0AwSv-EJB_d4GpYohHM"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                    <span className="bg-[#b9eeab]/80 backdrop-blur-md text-[#2d5a27] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest font-headline">Mindset</span>
                  </div>
                </div>
                <h3 className="text-base font-headline font-bold text-[#373222] group-hover:text-[#3c6a35] transition-colors leading-tight">Clarity Reflection</h3>
                <p className="text-on-surface-variant text-[11px] mt-1 font-body">10 min • Guided journaling for focus</p>
              </div>
            </div>
          </section>

          {/* Wearable Device status */}
          <section className="bg-[#f1e7d2] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in-up delay-5 border border-[#ece2ca]/50 shadow-sm text-left">
            <div className="flex items-center gap-5 group">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow group-hover:rotate-6 transition-transform duration-300">
                <span className={`material-symbols-outlined text-3xl text-[#0e6781] ${isSyncing ? 'animate-spin' : ''}`}>watch</span>
              </div>
              <div className="text-left">
                <h4 className="text-lg font-headline font-extrabold text-on-surface">Oura Ring Gen 3</h4>
                <p className="text-on-surface-variant text-xs flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full bg-[#3c6a35] ${isSyncing ? 'animate-ping' : ''}`} />
                  {lastSyncedText}
                </p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => showToast("Oura device configuration page is loaded (simulation).")}
                className="flex-1 md:flex-none border border-[#bab19b] px-5 py-2.5 rounded-full font-headline font-bold text-xs hover:bg-[#fff8ef] transition-all active:scale-95 duration-300"
              >
                Manage Device
              </button>
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="flex-1 md:flex-none bg-[#0e6781] text-[#f2faff] px-5 py-2.5 rounded-full font-headline font-bold text-xs hover:opacity-90 shadow-md shadow-[#0e6781]/15 transition-all active:scale-95 duration-300"
              >
                {isSyncing ? "Syncing..." : "Sync Now"}
              </button>
            </div>
          </section>

        </main>
      </div>

      {/* Mobile Navigation - Styled warm and active state matching design image */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#fff8ef]/90 backdrop-blur-lg border-t border-[#ece2ca]/20 px-6 py-2.5 z-50 flex justify-between items-center">
        <Link className={`flex flex-col items-center gap-0.5 transition-colors ${isActive('/home') ? 'text-[#3c6a35]' : 'text-on-surface-variant'}`} to="/home">
          <span className="material-symbols-outlined text-xl">dashboard</span>
          <span className="text-[9px] font-bold font-headline">Home</span>
        </Link>
        <Link className={`flex flex-col items-center gap-0.5 transition-colors ${isActive('/resources') ? 'text-[#3c6a35]' : 'text-on-surface-variant'}`} to="/resources">
          <span className="material-symbols-outlined text-xl">library_books</span>
          <span className="text-[9px] font-bold font-headline">Library</span>
        </Link>
        <Link className={`flex flex-col items-center gap-0.5 transition-colors ${isActive('/wellness') ? 'text-[#3c6a35]' : 'text-on-surface-variant'}`} to="/wellness">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: isActive('/wellness') ? "'FILL' 1" : "" }}>spa</span>
          <span className="text-[9px] font-bold font-headline">Wellness</span>
        </Link>
        <Link className={`flex flex-col items-center gap-0.5 transition-colors ${isActive('/chat') ? 'text-[#3c6a35]' : 'text-on-surface-variant'}`} to="/chat">
          <span className="material-symbols-outlined text-xl">chat_bubble</span>
          <span className="text-[9px] font-bold font-headline">Support</span>
        </Link>
      </nav>

      {/* --- INTERACTIVE WELLNESS MODALS --- */}
      <AnimatePresence>
        
        {/* 1. Breathing Exercise Modal */}
        {activeModal === 'breathing' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#110e06]/75 backdrop-blur-md text-left"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#fff8ef] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-[#ece2ca]/40"
            >
              <button 
                onClick={() => { setActiveModal(null); setIsBreathingRunning(false); }}
                className="absolute top-4 right-4 material-symbols-outlined text-on-surface-variant hover:bg-[#f6edda] p-1.5 rounded-full transition-colors"
              >
                close
              </button>
              
              <span className="text-[#9c4600] font-headline font-bold text-[10px] uppercase tracking-widest block mb-1">Breathing reset</span>
              <h3 className="text-2xl font-headline font-extrabold text-[#373222] mb-3">4-7-8 Breathing Guide</h3>
              <p className="text-on-surface-variant text-xs mb-6 font-body leading-relaxed">
                Calm your nervous system instantly. Inhale 4s, hold 7s, exhale 8s.
              </p>

              {/* Breathing Visualizer */}
              <div className="h-56 flex flex-col items-center justify-center bg-[#fbf3e1] rounded-2xl p-6 relative overflow-hidden mb-6 border border-[#ece2ca]/30">
                <motion.div 
                  animate={
                    isBreathingRunning 
                      ? breathPhase === 'Inhale' 
                        ? { scale: 1.5, opacity: 0.75 }
                        : breathPhase === 'Hold' 
                          ? { scale: 1.5, opacity: 0.9 }
                          : { scale: 1.0, opacity: 0.4 }
                      : { scale: 1.0, opacity: 0.4 }
                  }
                  transition={{ duration: breathPhase === 'Inhale' ? 4 : breathPhase === 'Hold' ? 7 : 8, ease: "easeInOut" }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-[#3c6a35] to-[#b9eeab] absolute shadow-lg"
                />
                
                <div className="z-10 text-center">
                  <p className="text-xs uppercase tracking-widest text-[#3c6a35] font-bold mb-1 font-headline">
                    {isBreathingRunning ? breathPhase : "Ready"}
                  </p>
                  <p className="text-3xl font-headline font-black text-[#373222]">
                    {isBreathingRunning ? `${breathTimer}s` : "4-7-8"}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsBreathingRunning(!isBreathingRunning)}
                  className={`flex-1 px-5 py-3 rounded-full font-headline font-bold text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 ${
                    isBreathingRunning 
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 shadow-amber-100/10' 
                      : 'bg-[#3c6a35] text-[#ebffe0] hover:bg-[#305d2a] shadow-[#3c6a35]/15'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {isBreathingRunning ? 'pause' : 'play_arrow'}
                  </span>
                  {isBreathingRunning ? 'Pause Session' : 'Begin Practice'}
                </button>
                
                <button
                  onClick={() => {
                    setIsBreathingRunning(false);
                    setBreathTimer(4);
                    setBreathPhase('Inhale');
                  }}
                  className="border border-[#bab19b] px-4 py-3 rounded-full text-[#373222] hover:bg-[#f6edda] transition-all text-xs font-bold font-headline active:scale-95"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 2. Yoga Flow Modal */}
        {activeModal === 'yoga' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#110e06]/75 backdrop-blur-md text-left"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#fff8ef] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-[#ece2ca]/40"
            >
              <button 
                onClick={() => { setActiveModal(null); setIsYogaRunning(false); }}
                className="absolute top-4 right-4 material-symbols-outlined text-on-surface-variant hover:bg-[#f6edda] p-1.5 rounded-full transition-colors"
              >
                close
              </button>
              
              <span className="text-[#0e6781] font-headline font-bold text-[10px] uppercase tracking-widest block mb-1">Stretching routine</span>
              <h3 className="text-2xl font-headline font-extrabold text-[#373222] mb-1">Afternoon Solar Flow</h3>
              <p className="text-on-surface-variant text-xs mb-5 font-body">
                Pose {yogaPoseIndex + 1} of {yogaPoses.length} • Stretch gently and focus on your alignment
              </p>

              {/* Current Pose Guide */}
              <div className="bg-[#fbf3e1] rounded-2xl p-5 border border-[#ece2ca]/30 mb-6 text-center">
                <div className="w-14 h-14 rounded-full bg-[#baeaff] text-[#0e6781] flex items-center justify-center mx-auto mb-3.5">
                  <span className="material-symbols-outlined text-2xl animate-pulse">spa</span>
                </div>
                <h4 className="text-lg font-headline font-extrabold text-[#373222] mb-1.5">{yogaPoses[yogaPoseIndex].title}</h4>
                <p className="text-on-surface-variant text-xs font-body leading-relaxed max-w-xs mx-auto mb-4">
                  {yogaPoses[yogaPoseIndex].instruction}
                </p>
                
                {/* Timer Bar */}
                <div className="w-full bg-[#ece2ca]/60 h-1 rounded-full overflow-hidden mb-2 max-w-xs mx-auto">
                  <div 
                    className="bg-[#0e6781] h-full rounded-full transition-all duration-1000"
                    style={{ width: `${(yogaTimer / 30) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-[#0e6781]">{yogaTimer} seconds remaining</span>
              </div>

              {/* Controls */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => setIsYogaRunning(!isYogaRunning)}
                  className={`flex-1 px-5 py-3 rounded-full font-headline font-bold text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 ${
                    isYogaRunning 
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                      : 'bg-[#0e6781] text-[#f2faff] hover:bg-[#04647d]'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {isYogaRunning ? 'pause' : 'play_arrow'}
                  </span>
                  {isYogaRunning ? 'Pause Pose' : 'Begin Stretch'}
                </button>
                
                <button
                  onClick={() => {
                    const next = (yogaPoseIndex + 1) % yogaPoses.length;
                    setYogaPoseIndex(next);
                    setYogaTimer(30);
                  }}
                  className="border border-[#bab19b] px-4 py-3 rounded-full text-[#373222] hover:bg-[#f6edda] transition-all text-xs font-bold font-headline active:scale-95"
                >
                  Skip
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 3. Meditation / Soundscape Player Modal */}
        {activeModal === 'meditation' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#110e06]/75 backdrop-blur-md text-left"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#fff8ef] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-[#ece2ca]/40"
            >
              <button 
                onClick={() => { setActiveModal(null); setIsMeditationPlaying(false); }}
                className="absolute top-4 right-4 material-symbols-outlined text-on-surface-variant hover:bg-[#f6edda] p-1.5 rounded-full transition-colors"
              >
                close
              </button>
              
              <span className="text-[#9c4600] font-headline font-bold text-[10px] uppercase tracking-widest block mb-1">Sound therapy</span>
              <h3 className="text-2xl font-headline font-extrabold text-[#373222] mb-4">Deep Forest Resonance</h3>

              {/* Sound Player Screen */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] mb-5 shadow-inner">
                <img 
                  alt="Soundscape forest background"
                  className="w-full h-full object-cover brightness-75 transition-all duration-[3000ms]"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzeCrG_WecVKS9l6cnt0-XZnBeBVw8_yGTsBsKWeP8_w9Gjiq-ePqkOrHALDp7qgbPpYmem4MWe1KVkUvkARu30ZLNygCwvFf1riiQJ8-dFXlbSpmImkr3JMc_Nn20aOgOC5CqSKHIwfIHRWbwZaqUJ8V6E3o3uo_Qu_Da3aiai84KhoIyRXz9gvB3D-6_Tp7iXYKqzxk4LgrDOFu4jnsOK0ugfV8u5sSoNLtMVGSJT8UGWTgFa0PW2nm85rGqnInqK4uOUNJXDD4"
                />
                <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-4">
                  {/* Bouncing Audio Bars */}
                  {isMeditationPlaying && (
                    <div className="flex gap-1.5 items-end justify-center h-12 mb-2">
                      <div className="w-1 bg-[#ffa26b] h-6 animate-pulse rounded-full" />
                      <div className="w-1 bg-[#ffa26b] h-10 animate-pulse rounded-full" style={{ animationDelay: "0.2s" }} />
                      <div className="w-1 bg-[#ffa26b] h-8 animate-pulse rounded-full" style={{ animationDelay: "0.4s" }} />
                      <div className="w-1 bg-[#ffa26b] h-4 animate-pulse rounded-full" style={{ animationDelay: "0.1s" }} />
                      <div className="w-1 bg-[#ffa26b] h-11 animate-pulse rounded-full" style={{ animationDelay: "0.3s" }} />
                      <div className="w-1 bg-[#ffa26b] h-5 animate-pulse rounded-full" style={{ animationDelay: "0.5s" }} />
                    </div>
                  )}
                  <p className="text-white text-2xs font-semibold text-center uppercase tracking-widest text-[#ffa26b] mb-1">Acoustic restorative stream</p>
                  <p className="text-white text-xs font-headline font-bold text-center">Binaural alpha waves (8Hz) & gentle forest wind</p>
                </div>
              </div>

              {/* Audio progress bar */}
              <div className="mb-6">
                <input 
                  type="range" 
                  min="0" 
                  max="100"
                  value={meditationProgress} 
                  onChange={(e) => setMeditationProgress(Number(e.target.value))}
                  className="w-full accent-[#9c4600] h-1 bg-[#ece2ca] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant mt-1.5 font-bold">
                  <span>07:22</span>
                  <span>20:00</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-6">
                <button 
                  onClick={() => showToast("Previous track simulation triggered.")}
                  className="material-symbols-outlined text-2xl text-on-surface-variant hover:text-[#373222] transition-colors p-1"
                >
                  skip_previous
                </button>
                
                <button
                  onClick={() => setIsMeditationPlaying(!isMeditationPlaying)}
                  className="w-14 h-14 rounded-full bg-[#9c4600] text-white flex items-center justify-center shadow-lg shadow-[#9c4600]/25 hover:scale-105 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isMeditationPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                <button 
                  onClick={() => showToast("Next track simulation triggered.")}
                  className="material-symbols-outlined text-2xl text-on-surface-variant hover:text-[#373222] transition-colors p-1"
                >
                  skip_next
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 4. Gratitude Journal Modal */}
        {activeModal === 'journal' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#110e06]/75 backdrop-blur-md text-left"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#fff8ef] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-[#ece2ca]/40"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 material-symbols-outlined text-on-surface-variant hover:bg-[#f6edda] p-1.5 rounded-full transition-colors"
              >
                close
              </button>
              
              <span className="text-[#3c6a35] font-headline font-bold text-[10px] uppercase tracking-widest block mb-1">Clarity reflection</span>
              <h3 className="text-2xl font-headline font-extrabold text-[#373222] mb-2">Guided Journaling</h3>
              <p className="text-on-surface-variant text-xs mb-5 font-body leading-relaxed">
                Reflecting on gratitude is a direct path to mental clarity. Capture three comforting highlights from today.
              </p>

              {/* Gratitude prompts inputs */}
              <div className="space-y-3.5 mb-6">
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant mb-1 font-label">1. Something that made you smile:</label>
                  <input 
                    type="text" 
                    value={gratitude1}
                    onChange={(e) => setGratitude1(e.target.value)}
                    placeholder="A fresh cup of tea, a warm message..." 
                    className="w-full text-xs bg-[#f6edda]/50 border border-[#bab19b]/35 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#3c6a35]/50 text-[#373222] font-body"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant mb-1 font-label">2. Someone you appreciate:</label>
                  <input 
                    type="text" 
                    value={gratitude2}
                    onChange={(e) => setGratitude2(e.target.value)}
                    placeholder="A colleague, an old friend, myself..." 
                    className="w-full text-xs bg-[#f6edda]/50 border border-[#bab19b]/35 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#3c6a35]/50 text-[#373222] font-body"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant mb-1 font-label">3. A small achievement:</label>
                  <input 
                    type="text" 
                    value={gratitude3}
                    onChange={(e) => setGratitude3(e.target.value)}
                    placeholder="Finished an assignment, took a brisk walk..." 
                    className="w-full text-xs bg-[#f6edda]/50 border border-[#bab19b]/35 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#3c6a35]/50 text-[#373222] font-body"
                  />
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveJournal}
                className="w-full bg-[#3c6a35] text-[#ebffe0] py-3.5 rounded-full font-headline font-bold text-xs hover:bg-[#305d2a] shadow-md shadow-[#3c6a35]/15 transition-all active:scale-98"
              >
                Save Reflection
              </button>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </Layout>
  );
};

export default WellnessPage;
