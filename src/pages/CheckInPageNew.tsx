import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import { useCheckIn } from '../context/CheckInContext';
import { useAuth } from '../context/AuthContext';

type EnergyKey = 'Radiant' | 'Calm' | 'Pensive' | 'Restless';

interface EnergyTheme {
  key: EnergyKey;
  label: string;
  icon: string;
  value: number; // 1-5
  energy: number;
  stress: number;
  social: number;
  textColor: string;
  iconColor: string;
  activeColor: string;
  suggestionTitle: string;
  suggestionQuote: string;
}

const ENERGIES: EnergyTheme[] = [
  {
    key: 'Radiant',
    label: 'Radiant',
    icon: 'sentiment_very_satisfied',
    value: 5,
    energy: 5,
    stress: 1,
    social: 4,
    textColor: 'text-amber-600',
    iconColor: 'text-amber-500 bg-amber-50',
    activeColor: 'ring-amber-500 bg-amber-500 text-white',
    suggestionTitle: 'High Energy Flow',
    suggestionQuote: '"Radiance is a powerful current. Channel your vibrant energy to lift others or fuel your passions today."'
  },
  {
    key: 'Calm',
    label: 'Calm',
    icon: 'spa',
    value: 5,
    energy: 3,
    stress: 1,
    social: 3,
    textColor: 'text-[#3c6a35]',
    iconColor: 'text-[#3c6a35] bg-[#ebffe0]',
    activeColor: 'ring-[#3c6a35] bg-[#3c6a35] text-white',
    suggestionTitle: 'Gentle Rhythms',
    suggestionQuote: '"Calm is the cradle of power. Let every breath ground you in the present moment."'
  },
  {
    key: 'Pensive',
    label: 'Pensive',
    icon: 'cloud',
    value: 3,
    energy: 2,
    stress: 2,
    social: 2,
    textColor: 'text-sky-600',
    iconColor: 'text-sky-500 bg-sky-50',
    activeColor: 'ring-sky-500 bg-sky-500 text-white',
    suggestionTitle: 'Mental Grounding',
    suggestionQuote: '"Still waters run deep. Allow your thoughts to settle gently, like sediment in a quiet pool."'
  },
  {
    key: 'Restless',
    label: 'Restless',
    icon: 'bolt',
    value: 2,
    energy: 4,
    stress: 4,
    social: 3,
    textColor: 'text-orange-600',
    iconColor: 'text-orange-500 bg-orange-50',
    activeColor: 'ring-orange-500 bg-orange-500 text-white',
    suggestionTitle: 'Tension Release',
    suggestionQuote: '"Restlessness is energy looking for a path. Release tension slowly through smooth, steady breathing."'
  }
];

const CheckInPageNew: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { addCheckIn } = useCheckIn();

  const isActive = (path: string) => location.pathname === path;

  // Dynamic user details
  const username = user?.username || "Alex";
  const userEmail = user?.email || "alex.peace@sanctuary.com";

  // Menu, Toast, and Modal States
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [breathingModalOpen, setBreathingModalOpen] = useState(false);

  // Check-in flow choices
  const [selectedEnergy, setSelectedEnergy] = useState<EnergyKey>('Calm');
  const [reflectionText, setReflectionText] = useState("");

  // Breathing Guide States (4-7-8 Breathing Overlay)
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [isBreathingRunning, setIsBreathingRunning] = useState(false);

  const activeTheme = ENERGIES.find(e => e.key === selectedEnergy) || ENERGIES[1];

  // Breathing Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBreathingRunning) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
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

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Submit check-in to context & redirect
  const handleFinishCheckIn = () => {
    addCheckIn({
      mood: activeTheme.value,
      energy: activeTheme.energy,
      social: activeTheme.social,
      stress: activeTheme.stress,
      journal: reflectionText.trim()
    });

    showToast("Daily check-in reflection successfully saved!");
    setTimeout(() => {
      navigate('/home');
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <Layout hideNavigation={true}>
      <div className="font-body text-on-surface bg-background min-h-screen relative overflow-x-hidden pb-12 selection:bg-primary-container selection:text-on-primary-container">
        
        {/* CSS custom styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          .glass-panel-warm {
            background: rgba(236, 226, 202, 0.4);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }
        `}} />

        {/* Global Toast */}
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

        {/* TopNavBar Shell - Clean white styling aligned with other redesigned pages */}
        <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl flex justify-between items-center px-6 md:px-8 py-4 border-b border-[#ece2ca]/30 shadow-sm shrink-0">
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
                <div className="space-y-1 text-left">
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
                <div className="space-y-2 text-left">
                  <div 
                    onClick={() => { setNotificationsOpen(false); setBreathingModalOpen(true); setIsBreathingRunning(true); setBreathTimer(4); setBreathPhase('Inhale'); }}
                    className="flex gap-2 items-start p-2 hover:bg-[#f6edda] rounded-xl cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[#3c6a35] text-md">spa</span>
                    <div>
                      <p className="font-semibold text-on-surface leading-tight">Misty breathing is open</p>
                      <p className="text-[10px] text-on-surface-variant">Recommended 10 min session ready.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* SideNavBar Shell (Desktop) - Aligned bg-[#faeacf] and w-60 zoom to match Dashboard sidebar exactly */}
        <aside className="fixed left-0 top-0 h-full hidden md:flex flex-col p-5 z-40 bg-[#faeacf] w-60 rounded-r-[2.25rem] shadow-xl shadow-[#373222]/5 pt-20 space-y-6 shrink-0">
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
              onClick={() => { setBreathingModalOpen(true); setIsBreathingRunning(true); setBreathTimer(4); setBreathPhase('Inhale'); }}
              className="w-full bg-[#3c6a35] text-[#ebffe0] rounded-full py-3 text-xs font-headline font-bold shadow-md shadow-primary/15 hover:scale-103 transition-transform"
            >
              Start Session
            </button>
          </div>
        </aside>

        {/* Main Content Canvas - Aligned to md:ml-60 pt-20 and scaled perfectly */}
        <main className="md:ml-60 pt-20 min-h-screen px-4 md:px-8 pb-20 md:pb-8 max-w-5xl mx-auto flex flex-col justify-between text-left">
          
          {/* Cover Header Banner */}
          <header className="mb-10 relative overflow-hidden rounded-2xl min-h-[220px] flex items-end p-6 md:p-10 shadow-sm border border-[#ece2ca]/20 mt-4 select-none">
            <div className="absolute inset-0 z-0">
              <img 
                alt="Peaceful misty forest cover" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEsmCk1w8_VY5IQbGMEGpAsqIxiTuMMF5Ep9koSf60sjvF-9ATJdn6xafrZJEmBZkU_2vhNTauTksWsWjfbYfolgKfql2EOOhnEDQVe-mkEiFrzRw0ZGnee4V64YmxTgIvhYW-foE12OYK6LXyItYRzk0A1vklDUJLvfYs-284-_LkeHESZe0LgXyMLVBppLAXYvZWOo5y8xpi3Kal2bsMtNbn8vi6hnk42RgWVzG446gT4O3D9E1UVVYNiVnihwUt4IIvfiuGajo"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/35 to-transparent"></div>
            </div>
            <div className="relative z-10 max-w-2xl text-left">
              <span className="text-[#9c4600] font-bold tracking-widest text-[10px] uppercase mb-2 block font-headline">Daily Check-in</span>
              <h1 className="text-3xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight leading-none mb-1">
                How are you <br/><span className="text-[#3c6a35] italic font-medium">feeling</span> today?
              </h1>
            </div>
          </header>

          {/* Interactive Content Pane */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
            
            {/* Mood Selector & Reflection (Left 7 Cols) */}
            <div className="lg:col-span-7 space-y-10">
              
              {/* Energy Selector */}
              <section className="text-left">
                <h2 className="text-lg font-headline font-bold text-on-surface mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#ffa26b] rounded-full"></span>
                  Choose your current energy
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {ENERGIES.map((item) => {
                    const isSelected = selectedEnergy === item.key;
                    return (
                      <button 
                        key={item.key}
                        onClick={() => setSelectedEnergy(item.key)}
                        className={`group p-4 rounded-xl transition-all duration-300 text-center flex flex-col items-center gap-2.5 border border-[#ece2ca]/30 cursor-pointer ${
                          isSelected 
                            ? 'bg-[#ffffff] ring-2 ring-[#3c6a35] shadow-md' 
                            : 'bg-[#fbf3e1]/55 hover:bg-[#fff8ef] hover:shadow-xs'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-[#3c6a35] text-[#ebffe0]' 
                            : item.iconColor
                        }`}>
                          <span className={`material-symbols-outlined text-2xl ${
                            isSelected ? 'fill-current text-[#ebffe0]' : ''
                          }`}>
                            {item.icon}
                          </span>
                        </div>
                        <span className={`font-headline font-bold text-xs ${
                          isSelected ? 'text-[#3c6a35]' : 'text-on-surface-variant'
                        }`}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Reflection texteditor */}
              <section className="space-y-4 text-left">
                <h2 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#0e6781] rounded-full"></span>
                  A moment for reflection
                </h2>
                <div className="relative group">
                  <textarea 
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    className="w-full min-h-[160px] bg-[#e4d9bf]/30 p-6 rounded-xl border border-transparent focus:border-[#3c6a35]/30 focus:ring-2 focus:ring-[#3c6a35]/10 text-on-surface placeholder:text-[#827a66]/50 font-body text-sm md:text-base leading-relaxed shadow-inner focus:outline-none" 
                    placeholder="What is on your heart right now? Write freely..."
                  />
                  <div className="absolute bottom-4 right-5 flex items-center gap-1.5 text-on-surface-variant/40 text-2xs italic font-medium select-none">
                    <span className="material-symbols-outlined text-sm">edit_note</span>
                    Private and secure
                  </div>
                </div>
              </section>

            </div>

            {/* Guided Exercise Card Sidebar (Right 5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Guided rhythms card */}
              <div className="glass-panel-warm p-6 md:p-8 rounded-2xl shadow-sm border border-white/45 text-left">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="px-3 py-0.5 rounded-full bg-[#baeaff] text-[#005971] text-[9px] font-bold uppercase tracking-widest mb-3 inline-block font-headline">Recommended</span>
                    <h3 className="text-2xl font-headline font-extrabold text-on-surface leading-none">{activeTheme.suggestionTitle}</h3>
                    <p className="text-on-surface-variant text-xs mt-1.5 font-body">
                      To deepen your sense of <span className="text-[#3c6a35] font-bold">{selectedEnergy}</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#0e6781]/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#0e6781] text-2xl">air</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Visual interval bar */}
                  <div className="relative h-2 bg-[#ece2ca] rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-[#0e6781] to-[#97defc] rounded-full"></div>
                  </div>
                  
                  {/* Breath durations */}
                  <div className="flex justify-between items-center text-[9px] font-bold font-label uppercase tracking-wider opacity-60">
                    <span>Breath In (4s)</span>
                    <span>Hold (2s)</span>
                    <span>Exhale (6s)</span>
                  </div>
                  
                  {/* Play Action */}
                  <div className="flex flex-col items-center gap-3 py-2">
                    <button 
                      onClick={() => { setBreathingModalOpen(true); setIsBreathingRunning(true); setBreathTimer(4); setBreathPhase('Inhale'); }}
                      className="w-16 h-16 rounded-full bg-[#3c6a35] text-[#ebffe0] flex items-center justify-center shadow-md shadow-[#3c6a35]/25 hover:scale-105 transition-transform"
                    >
                      <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    </button>
                    <span className="text-on-surface-variant font-label text-2xs font-bold uppercase tracking-widest mt-1">5 Minute Exercise</span>
                  </div>
                  
                  {/* Quote footer */}
                  <div className="pt-5 border-t border-on-surface/5">
                    <p className="text-xs font-body italic text-on-surface-variant leading-relaxed">
                      {activeTheme.suggestionQuote}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tip warning card */}
              <div className="bg-[#ffa26b]/15 p-4 rounded-xl flex gap-3 items-center border border-[#ffa26b]/10 text-left">
                <span className="material-symbols-outlined text-[#9c4600] shrink-0">lightbulb</span>
                <p className="text-xs text-[#5d2700] font-medium leading-relaxed">
                  Try focusing on a single point in the room to help anchor your attention.
                </p>
              </div>

            </div>

          </div>

          {/* Bottom Footer Submit */}
          <footer className="py-8 flex flex-col items-center gap-4 border-t border-[#ece2ca]/30 select-none">
            <button 
              onClick={handleFinishCheckIn}
              className="px-10 py-3.5 bg-gradient-to-r from-[#3c6a35] to-[#305d2a] text-[#ebffe0] rounded-full text-base font-headline font-bold shadow-md shadow-[#3c6a35]/20 hover:scale-103 active:scale-95 transition-all"
            >
              Finish My Check-in
            </button>
            <p className="text-on-surface-variant/50 text-2xs font-medium">
              Your reflections are stored in your private Sanctuary History.
            </p>
          </footer>

        </main>
      </div>

      {/* Mobile Navigation - Styled warm and active state matching design image */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#fff8ef]/90 backdrop-blur-lg border-t border-[#ece2ca]/20 px-6 py-2.5 z-50 flex justify-between items-center shrink-0">
        <Link className={`flex flex-col items-center gap-0.5 transition-colors ${isActive('/home') ? 'text-[#3c6a35]' : 'text-on-surface-variant'}`} to="/home">
          <span className="material-symbols-outlined text-xl">dashboard</span>
          <span className="text-[9px] font-bold font-headline">Home</span>
        </Link>
        <Link className={`flex flex-col items-center gap-0.5 transition-colors ${isActive('/resources') ? 'text-[#3c6a35]' : 'text-on-surface-variant'}`} to="/resources">
          <span className="material-symbols-outlined text-xl">library_books</span>
          <span className="text-[9px] font-bold font-headline">Library</span>
        </Link>
        <Link className={`flex flex-col items-center gap-0.5 transition-colors ${isActive('/wellness') ? 'text-[#3c6a35]' : 'text-on-surface-variant'}`} to="/wellness">
          <span className="material-symbols-outlined text-xl">spa</span>
          <span className="text-[9px] font-bold font-headline">Wellness</span>
        </Link>
        <Link className={`flex flex-col items-center gap-0.5 transition-colors ${isActive('/chat') ? 'text-[#3c6a35]' : 'text-on-surface-variant'}`} to="/chat">
          <span className="material-symbols-outlined text-xl">chat_bubble</span>
          <span className="text-[9px] font-bold font-headline">Support</span>
        </Link>
      </nav>

      {/* --- BREATHING EXERCISE OVERLAY MODAL --- */}
      <AnimatePresence>
        {breathingModalOpen && (
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
                onClick={() => { setBreathingModalOpen(false); setIsBreathingRunning(false); }}
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
      </AnimatePresence>

    </Layout>
  );
};

export default CheckInPageNew;
