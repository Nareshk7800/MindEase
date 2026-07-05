import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

interface ResourceItem {
  id: string;
  title: string;
  category: string; // 'Sleep' | 'Focus' | 'Nature' | 'Breathwork'
  tags: string[]; // for category filtering like 'Stress Relief', 'Deep Sleep', etc.
  duration: string;
  image: string;
  description: string;
  type: 'Audio Journey' | 'Interactive' | 'Guided Walk';
  icon: string; // Material Icon string
}

interface ArticleItem {
  id: string;
  title: string;
  category: string; // 'Expert Insight' | 'Lifestyle'
  tags: string[];
  duration: string;
  image: string;
  description: string;
  content: string; // Full text content of the article for reading
}

const ResourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Dynamic user data integration
  const username = user?.username || "Elena";
  const userEmail = user?.email || "elena.peace@sanctuary.com";

  // State Variables
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Resources');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [activeSort, setActiveSort] = useState<'recent' | 'alphabetical'>('recent');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  // Bookmarks
  const [savedPractices, setSavedPractices] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("equimind_saved_practices");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Floating Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio Player State
  const [playingTrack, setPlayingTrack] = useState<{
    title: string;
    category: string;
    duration: string;
    image: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Article Reader Modal State
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);

  // Auto-simulation of playing track progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && playingTrack) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            setToastMessage(`Completed: ${playingTrack.title}`);
            setTimeout(() => setToastMessage(null), 3000);
            return 0;
          }
          return prev + 1; // tick up
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playingTrack]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Safe checks for active paths in side menu
  const isActive = (path: string) => location.pathname === path;

  // Toggle Bookmark Save
  const handleToggleSave = (id: string, title: string) => {
    let nextSaved: string[];
    if (savedPractices.includes(id)) {
      nextSaved = savedPractices.filter(item => item !== id);
      setToastMessage(`Removed "${title}" from Saved Practices`);
    } else {
      nextSaved = [...savedPractices, id];
      setToastMessage(`Saved "${title}" to your Sanctuary practices!`);
    }
    setSavedPractices(nextSaved);
    localStorage.setItem("equimind_saved_practices", JSON.stringify(nextSaved));
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Play Practice trigger
  const handlePlayPractice = (track: { title: string; category: string; duration: string; image: string }) => {
    setPlayingTrack(track);
    setIsPlaying(true);
    setAudioProgress(0);
    setToastMessage(`Now Playing: ${track.title}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Resources Data
  const meditationsData: ResourceItem[] = [
    {
      id: 'med-1',
      title: 'Ocean Breath Release',
      category: 'Sleep',
      tags: ['Stress Relief', 'Deep Sleep', 'Breathwork'],
      duration: '12 min',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6a_eD9LUxXDHOvKYqrybCwG5W0LV01nm5wY9Q60BfE1-wclfLySIZyPJ0KxznrPuyMTJ6bD422yZil5ZsYN-KnyLHbweouPP34qee0Vg225GPphKN2ftb2IDOE8vJFS00CEqSWrXZoT_rLGT4COfNG48TVP2ZoyYC9keXOUxICpU9JaQd6Q_0mCSNdSfL6mQx-iepbC7PUrbbNY-V_gfF_Gl0UD8XXbA4_vTbnAZD1azBCKgSVuHmRNLKuH3Ggr-tZ1LbjraSXxI',
      description: 'Calm your nervous system with rhythmic breathing techniques synchronized with sea sounds.',
      type: 'Audio Journey',
      icon: 'headset'
    },
    {
      id: 'med-2',
      title: 'The Clarity Ritual',
      category: 'Focus',
      tags: ['Stress Relief', 'Mental Focus'],
      duration: '5 min',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHw9clui3pN9JDL8Rtr-8LS8pFHb5PZBZFa8CI-06hkhuXrrL7Mdvm1XkcSMBFDJCWI1_-1KWKD1ywGmlVj4MGiLO1k6JtSxFoUYyD66Z-Tw4KgxKUyRaY-NTrdSmgDqHZ9mwFQuzyVENU-6BPKKS0v5lwPLNxeuQ4BAxAuZsFVvKB1OtxNDwXN5WeUDyq2QgjHEiSW3PtrECCHIx5KbpZmNU7kf8fFGpPy6cexxSepVEpv4kBG6Q-xZvDEu86Cd4cRjzMv4yxU6E',
      description: 'Quick mindfulness session to sharpen your intent before starting your workday.',
      type: 'Interactive',
      icon: 'auto_stories'
    },
    {
      id: 'med-3',
      title: 'Ancestral Woods Walking',
      category: 'Nature',
      tags: ['Mental Focus', 'Breathwork'],
      duration: '25 min',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChnj__kr30FaS4e47qAHmj3xxgWAV2afeHoVQ_MKjU2q9w6IwoPTOwMzV_gkOyCwYzo6OQWwZCnKOORRWd-mgK6KF1631W6ffvhkXt9YbjYikNf3aMjdimkSSyr_TA-CITFHFf-BmgoGSP27Zt3mrhyhk8j2BtMivE5S3ebjEZ5D6IP97Kn8XrXjLOV4UAcHquI7f0MdbXU3D6ARXZBDVeX5kjh0QkHkYPHTc2Q8xH9bFL6ZyYt1Y2jwxNfPOOgtLcrhv4ac3Ftdw',
      description: 'A walking meditation designed to connect your movement with the rhythm of the earth.',
      type: 'Guided Walk',
      icon: 'directions_walk'
    }
  ];

  // Articles Data
  const articlesData: ArticleItem[] = [
    {
      id: 'art-1',
      title: 'The Neurochemistry of Silence',
      category: 'Expert Insight',
      tags: ['Mental Focus', 'Stress Relief'],
      duration: '8 min read',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDh6_F6UyR2ZHx5o3ZzaV81n1hFZetHLHvbjXR8mp8fwu22rJ1ty53Nh7B2mQnQoE6y6gsBPBCKSQ3sGS4xMgVAQADYLmx5vWnyEbO3mlzee3wWOBio5ajfeZxYZ3kWxH96fO7pOPgayl5ExnNw9NUBj4lowdEimXzbaZHfRKNx4md6p2YSf_Wd82iLF1WxGusSDpc_WFFN3jj-7DdN_EiGegm5F87zfNTOdx8_38KUwRIwxuNZeFuLG5NiWfrkBZOvzQAlzUCnOXs',
      description: 'Discover how extended periods of intentional silence can physically reshape the neural pathways of your brain.',
      content: `Extended periods of silence have been shown to hold transformative power over the physical architecture of the brain. Modern neurobiological research reveals that when we disconnect from the persistent sensory inputs of the modern world, our nervous system undergoes a profound state of restoration.

In a landmark 2013 study published in the journal *Brain, Structure and Function*, researchers discovered that exposing adult mice to two hours of silence daily led to significant cell growth in the hippocampus—the brain region critical for learning, emotion regulation, and memory consolidation. 

Furthermore, intentional quiet acts as an internal regulator, lowering cortisol and adrenaline levels while stimulating the parasympathetic nervous system, which in turn reduces blood pressure, slows heart rate, and promotes cellular rejuvenation. Taking just ten minutes of silence twice a day can cultivate a resilient mind, sharpening cognitive focus and emotional balance.`
    },
    {
      id: 'art-2',
      title: 'Space for the Spirit',
      category: 'Lifestyle',
      tags: ['Stress Relief', 'Deep Sleep'],
      duration: '5 min read',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdb1Mcia3T45PZzYwtysmD2OjS93dIBXmmQ22NBbicOhQqzAcQ7ccuRiwuhB7BEWm6WkeNXL2wYtS0FCrU1-oFlNoDORVLxP7Tcc_WgkKDsaf0IJK119kbFZqLqeeCDF02ek3SIPps8NrTzYh8SPlNpAdWRbeEsYRy-silKjsqQfqfrQn0egfxxrNLeCosyW8mA26xyDmKSwOpFpw8kK8wVl34LJ3knbKHykoRMyhUHyazubhVlp8v5_mzqPqd83b59ce02V6JuPg',
      description: 'Practical tips for creating a physical sanctuary in your home, even with limited square footage.',
      content: `Creating a space of quietude at home does not require an entire dedicated room or a high-end minimalist studio. It is about crafting a small visual anchor that alerts your nervous system that it is safe to descend into absolute peace.

First, select a corner or niche in your living space that can be kept relatively free of clutter. Bring in natural elements—a small green plant, a stone, or a smooth wooden tray. Visual harmony is key: try to surround this anchor with soft, neutral organic colors.

Introduce calming sensory cues: a warm, low-wattage dim lamp, a scented candle or drop of essential lavender oil, and a supportive organic cushion. Keep this spot completely device-free. By reserving this physical micro-sanctuary solely for meditation, breathing, or quiet reflection, you create a conditioned positive response: the moment you sit down, your mind will naturally begin to settle.`
    }
  ];

  // Dynamic Filtering Logic
  const filteredMeditations = useMemo(() => {
    return meditationsData.filter(item => {
      // Search text query match
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Category tag match
      let matchesCategory = true;
      if (selectedCategory !== 'All Resources') {
        matchesCategory = item.tags.includes(selectedCategory);
      }

      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (activeSort === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0; // Default order (Recent)
    });
  }, [searchQuery, selectedCategory, activeSort]);

  const filteredArticles = useMemo(() => {
    return articlesData.filter(item => {
      // Search text match
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Category tag match
      let matchesCategory = true;
      if (selectedCategory !== 'All Resources') {
        matchesCategory = item.tags.includes(selectedCategory);
      }

      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (activeSort === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0; // Default order (Recent)
    });
  }, [searchQuery, selectedCategory, activeSort]);

  // Featured Practice Data (The Silent Forest)
  const featuredPractice = {
    title: 'The Silent Forest: A Deep Breath Journey',
    category: 'Breathwork',
    duration: '20 min',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBeQBF1qOrmY3bSMWYE_IpDRERnAe8e3o9-I-xu_pwbqrN0ekX71wn1lVhjKQBHIbiFhf3Xz7h6uMzBNRoo8TDMQl7U3_MIsIYKCrUBc60GSp8UkWyyHT4Wait2EUl2oPfMFKKP8KdVj1DZBAeAShKfjYJ1ivaqCJR2bm3lVa1uKBW3OCITWlKNgN1qSte2DMuI5jCJgb2pCtSHi0mEypBnzO0lujTuI9u17uJtsKUu3qe8uh6VMQdxs0bn7BA1e28YlBTiglb-sI',
    description: 'A curated 20-minute immersive audio experience recorded in the heart of the Redwood National Park.'
  };

  return (
    <Layout hideNavigation backgroundClassName="bg-background selection:bg-primary-container selection:text-on-primary-container">
      <div className="font-body text-on-surface bg-background min-h-screen relative overflow-x-hidden">
        
        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="fixed bottom-24 md:bottom-8 right-6 z-50 bg-primary text-on-primary font-headline font-bold px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 text-sm"
            >
              <span className="material-symbols-outlined text-lg">info</span>
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
            {/* Search Input */}
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#e4d9bf] border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#3c6a35]/25 w-44 lg:w-60 text-[#373222] placeholder-[#655f4c]/70 transition-all font-headline" 
                placeholder="Search peace..." 
                type="text"
              />
            </div>

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
                    onClick={() => { setNotificationsOpen(false); handlePlayPractice(featuredPractice); }}
                    className="flex gap-2 items-start p-2 hover:bg-[#f6edda] rounded-xl cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[#3c6a35] text-md">spa</span>
                    <div>
                      <p className="font-semibold text-on-surface leading-tight">Featured meditation is ready</p>
                      <p className="text-[10px] text-on-surface-variant">Listen to "The Silent Forest" now.</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start p-2 hover:bg-[#f6edda] rounded-xl cursor-pointer">
                    <span className="material-symbols-outlined text-[#0e6781] text-md">bookmark</span>
                    <div>
                      <p className="font-semibold text-on-surface leading-tight">Practice Saved Successfully</p>
                      <p className="text-[10px] text-on-surface-variant">Review your saved practices in the list below.</p>
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
              onClick={() => navigate("/check-in")}
              className="w-full bg-gradient-to-r from-primary to-primary-dim text-on-primary rounded-full py-3 text-xs font-headline font-bold shadow-md shadow-primary/15 hover:scale-103 transition-transform"
            >
              Start Session
            </button>
          </div>
        </aside>

        {/* Main Content Canvas - Aligned to md:ml-60 pt-20 and scaled perfectly */}
        <main className="md:ml-60 pt-20 min-h-screen px-4 md:px-8 pb-20 md:pb-8 max-w-5xl mx-auto">
          
          {/* Featured Content Banner (Editorial Asymmetric Layout - Scaled Down) */}
          <section className="relative rounded-2xl overflow-hidden h-[320px] mb-10 flex items-end shadow-md">
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{ backgroundImage: `url('${featuredPractice.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#110e06]/85 via-transparent to-transparent" />
            <div className="relative p-6 md:p-10 max-w-xl z-10 text-left">
              <span className="bg-[#9c4600] text-[#fff7f5] px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 inline-block font-headline">
                Featured Practice
              </span>
              <h1 className="text-2xl md:text-3.5xl lg:text-4xl font-headline font-extrabold text-white mb-4 leading-tight text-balance">
                {featuredPractice.title}
              </h1>
              <p className="text-white/80 text-xs md:text-sm mb-6 max-w-md font-body">
                {featuredPractice.description}
              </p>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => handlePlayPractice(featuredPractice)}
                  className="bg-[#3c6a35] text-[#ebffe0] px-5 py-2.5 rounded-full font-headline font-bold flex items-center gap-2 hover:bg-[#305d2a] transition-all transform active:scale-95 text-xs shadow-md shadow-[#3c6a35]/20"
                >
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  Begin Journey
                </button>
                <button 
                  onClick={() => handleToggleSave('featured-practice', featuredPractice.title)}
                  className="glass-panel text-white px-5 py-2.5 rounded-full font-headline font-bold hover:bg-white/20 transition-all flex items-center gap-2 active:scale-95 text-xs animate-none"
                >
                  <span className="material-symbols-outlined text-sm">
                    {savedPractices.includes('featured-practice') ? 'bookmark_added' : 'bookmark'}
                  </span>
                  {savedPractices.includes('featured-practice') ? 'Saved' : 'Save Practice'}
                </button>
              </div>
            </div>
          </section>

          {/* Search & Filter Controls */}
          <section className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'All Resources', label: 'All Resources' },
                { value: 'Stress Relief', label: 'Stress Relief' },
                { value: 'Deep Sleep', label: 'Deep Sleep' },
                { value: 'Mental Focus', label: 'Mental Focus' },
                { value: 'Breathwork', label: 'Breathwork' }
              ].map((cat) => {
                const isActiveCat = selectedCategory === cat.value;
                return (
                  <button 
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-5 py-1.5 rounded-full font-headline font-medium text-xs transition-all duration-300 ${
                      isActiveCat 
                        ? 'bg-[#0e6781] text-[#f2faff] shadow-md shadow-[#0e6781]/25' 
                        : 'bg-[#f1e7d2] text-[#373222] hover:bg-[#ece2ca]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-on-surface-variant relative self-end md:self-auto text-xs">
              <span className="text-xs font-label">Sort by:</span>
              <button 
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-0.5 font-bold text-on-surface font-headline focus:outline-none hover:opacity-85"
              >
                {activeSort === 'recent' ? 'Most Recent' : 'Alphabetical'}
                <span className="material-symbols-outlined text-base">expand_more</span>
              </button>

              {sortDropdownOpen && (
                <div className="absolute right-0 top-6 w-36 bg-white border border-[#bab19b]/40 rounded-xl p-1.5 shadow-xl z-30 text-[11px]">
                  <button 
                    onClick={() => { setActiveSort('recent'); setSortDropdownOpen(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-headline font-medium ${activeSort === 'recent' ? 'bg-[#f6edda] text-[#3c6a35]' : 'hover:bg-gray-50'}`}
                  >
                    Most Recent
                  </button>
                  <button 
                    onClick={() => { setActiveSort('alphabetical'); setSortDropdownOpen(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-headline font-medium ${activeSort === 'alphabetical' ? 'bg-[#f6edda] text-[#3c6a35]' : 'hover:bg-gray-50'}`}
                  >
                    Alphabetical
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Categorized Bento Style Grid - Scaled down for visual balance */}
          <div className="space-y-12">
            
            {/* Meditation Category Section */}
            <section className="text-left">
              <div className="flex items-baseline justify-between mb-6 border-b border-[#bab19b]/15 pb-3">
                <h2 className="text-xl md:text-2xl font-headline font-extrabold tracking-tight">Guided Meditations</h2>
                <button 
                  onClick={() => setSelectedCategory('All Resources')} 
                  className="text-[#3c6a35] text-xs font-headline font-bold hover:underline"
                >
                  Explore All
                </button>
              </div>

              {filteredMeditations.length === 0 ? (
                <div className="text-center py-10 bg-white/50 rounded-2xl">
                  <p className="text-on-surface-variant font-headline text-sm">No matching guided meditations found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMeditations.map((med) => (
                    <div 
                      key={med.id} 
                      className="group bg-[#ffffff] rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          alt={med.title} 
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                          src={med.image}
                        />
                        <div className="absolute top-3 left-3 glass-panel px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-[#373222]">schedule</span>
                          <span className="text-[10px] font-headline font-bold text-[#373222]">{med.duration}</span>
                        </div>
                        <button 
                          onClick={() => handleToggleSave(med.id, med.title)}
                          className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-white text-[#3c6a35] active:scale-90 transition-all"
                        >
                          <span className="material-symbols-outlined text-base leading-none">
                            {savedPractices.includes(med.id) ? 'bookmark_added' : 'bookmark'}
                          </span>
                        </button>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[#9c4600] text-[10px] font-headline font-bold uppercase tracking-widest mb-1.5 block">
                            {med.category}
                          </span>
                          <h3 className="text-lg font-headline font-bold mb-2 text-[#373222] group-hover:text-[#3c6a35] transition-colors leading-snug">
                            {med.title}
                          </h3>
                          <p className="text-on-surface-variant text-xs mb-4 line-clamp-2 font-body leading-relaxed">
                            {med.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#ece2ca]/30">
                          <div className="flex items-center gap-1.5">
                            <div className="w-7 h-7 rounded-full bg-[#baeaff] flex items-center justify-center">
                              <span className="material-symbols-outlined text-xs text-[#0e6781]">{med.icon}</span>
                            </div>
                            <span className="text-[10px] font-label font-bold text-on-surface-variant">{med.type}</span>
                          </div>
                          
                          <button 
                            onClick={() => handlePlayPractice(med)}
                            className="w-8 h-8 rounded-full bg-[#b9eeab] text-[#2d5a27] flex items-center justify-center hover:bg-[#3c6a35] hover:text-[#ebffe0] hover:scale-105 active:scale-95 transition-all shadow shadow-[#b9eeab]/20"
                          >
                            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Wellness Wisdom / Articles Section */}
            <section className="text-left">
              <div className="flex items-baseline justify-between mb-6 border-b border-[#bab19b]/15 pb-3">
                <h2 className="text-xl md:text-2xl font-headline font-extrabold tracking-tight">Wellness Wisdom</h2>
                <button 
                  onClick={() => setSelectedCategory('All Resources')} 
                  className="text-[#3c6a35] text-xs font-headline font-bold hover:underline"
                >
                  Read More
                </button>
              </div>

              {filteredArticles.length === 0 ? (
                <div className="text-center py-10 bg-white/50 rounded-2xl">
                  <p className="text-on-surface-variant font-headline text-sm">No matching articles found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredArticles.map((art) => (
                    <div 
                      key={art.id} 
                      className="bg-[#fbf3e1] rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row gap-5 items-center border border-[#bab19b]/15 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative w-full sm:w-40 h-40 rounded-xl overflow-hidden shadow shrink-0">
                        <img 
                          alt={art.title} 
                          className="w-full h-full object-cover" 
                          src={art.image}
                        />
                        <button 
                          onClick={() => handleToggleSave(art.id, art.title)}
                          className="absolute top-2.5 right-2.5 bg-white/80 backdrop-blur-sm p-1.5 rounded-full shadow-sm hover:bg-white text-[#3c6a35] active:scale-90 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm leading-none">
                            {savedPractices.includes(art.id) ? 'bookmark_added' : 'bookmark'}
                          </span>
                        </button>
                      </div>

                      <div className="flex-1 flex flex-col justify-between h-full w-full text-left">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#3c6a35]/15 text-[#3c6a35] text-[9px] px-2 py-0.5 rounded font-headline font-extrabold uppercase tracking-wider">
                              {art.category}
                            </span>
                            <span className="text-on-surface-variant text-[11px] font-label">{art.duration}</span>
                          </div>
                          <h3 className="text-base md:text-lg font-headline font-bold mb-2 text-[#373222] line-clamp-2 leading-snug">
                            {art.title}
                          </h3>
                          <p className="text-on-surface-variant text-xs mb-4 line-clamp-2 font-body leading-relaxed">
                            {art.description}
                          </p>
                        </div>

                        <button 
                          onClick={() => setActiveArticle(art)}
                          className="text-[#3c6a35] text-xs font-headline font-bold flex items-center gap-1 hover:gap-2 transition-all group focus:outline-none"
                        >
                          Read Article
                          <span className="material-symbols-outlined text-base leading-none transform group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>

        {/* Bottom Mobile Navigation (Fixed bottom tab menu bar) */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#fff8ef]/90 backdrop-blur-lg flex justify-around items-center py-3 px-6 z-50 shadow-[0_-10px_25px_rgba(0,0,0,0.05)] border-t border-[#ece2ca]/40">
          <button 
            onClick={() => navigate("/home")}
            className={`flex flex-col items-center gap-1 ${isActive('/home') ? 'text-[#3c6a35] font-bold' : 'text-[#373222]'}`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[10px] font-headline font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => navigate("/resources")}
            className={`flex flex-col items-center gap-1 ${isActive('/resources') ? 'text-[#3c6a35] font-bold' : 'text-[#373222]'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive('/resources') ? "'FILL' 1" : "'FILL' 0" }}>library_books</span>
            <span className="text-[10px] font-headline font-bold">Resources</span>
          </button>
          
          <button 
            onClick={() => navigate("/wellness")}
            className={`flex flex-col items-center gap-1 ${isActive('/wellness') ? 'text-[#3c6a35] font-bold' : 'text-[#373222]'}`}
          >
            <span className="material-symbols-outlined">spa</span>
            <span className="text-[10px] font-headline font-medium">Wellness</span>
          </button>
          
          <button 
            onClick={() => navigate("/chat")}
            className={`flex flex-col items-center gap-1 ${isActive('/chat') ? 'text-[#3c6a35] font-bold' : 'text-[#373222]'}`}
          >
            <span className="material-symbols-outlined">chat_bubble</span>
            <span className="text-[10px] font-headline font-medium">Support</span>
          </button>
        </nav>

        {/* Floating Action Button (FAB) */}
        <button 
          onClick={() => navigate("/check-in")}
          className="fixed right-6 bottom-24 lg:bottom-12 bg-[#3c6a35] text-[#ebffe0] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        </button>

        {/* --- PREMIUM COMPONENT 1: Immersive Slide-up Audio Player --- */}
        <AnimatePresence>
          {playingTrack && (
            <motion.div 
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[400px] bg-[#fff8ef] border border-[#bab19b]/40 rounded-3xl shadow-2xl p-5 z-50 flex flex-col gap-4 text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="bg-[#3c6a35]/15 text-[#3c6a35] text-[10px] px-2.5 py-0.5 rounded-full font-headline font-extrabold uppercase tracking-wider">
                  Listening to Sanctuary
                </span>
                <button 
                  onClick={() => setPlayingTrack(null)}
                  className="material-symbols-outlined text-on-surface-variant hover:text-on-surface scale-90"
                >
                  close
                </button>
              </div>

              {/* Title & Cover info */}
              <div className="flex gap-4 items-center">
                <img 
                  alt="Track Cover" 
                  className="w-14 h-14 rounded-xl object-cover shadow shadow-[#373222]/10" 
                  src={playingTrack.image}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-headline font-bold text-sm text-[#373222] truncate leading-tight">{playingTrack.title}</h4>
                  <p className="text-[11px] text-on-surface-variant font-label mt-1">{playingTrack.category} • {playingTrack.duration}</p>
                </div>
              </div>

              {/* Progress Slider Bar */}
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-[#f1e7d2] rounded-full overflow-hidden relative cursor-pointer">
                  <div 
                    className="h-full bg-gradient-to-r from-[#3c6a35] to-[#b9eeab] rounded-full transition-all duration-300"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-on-surface-variant font-label">
                  <span>{Math.floor((audioProgress / 100) * parseInt(playingTrack.duration))}:00</span>
                  <span>{playingTrack.duration}</span>
                </div>
              </div>

              {/* Controls bar */}
              <div className="flex justify-around items-center">
                <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface scale-95">
                  replay_10
                </button>
                
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-[#3c6a35] text-white flex items-center justify-center hover:scale-105 active:scale-95 shadow shadow-[#3c6a35]/15 transition-transform"
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>

                <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface scale-95">
                  forward_10
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- PREMIUM COMPONENT 2: Immersive Article Reading Overlay Modal --- */}
        <AnimatePresence>
          {activeArticle && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-[#fff8ef] w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] text-left border border-[#ece2ca]"
              >
                {/* Visual Header Image */}
                <div className="relative h-48 w-full">
                  <img 
                    alt={activeArticle.title} 
                    className="w-full h-full object-cover" 
                    src={activeArticle.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#110e06]/85 via-transparent to-transparent" />
                  
                  <button 
                    onClick={() => setActiveArticle(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center shadow transition-colors border border-white/10"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>

                  <div className="absolute bottom-4 left-6 right-6 text-white">
                    <span className="bg-[#b9eeab] text-[#1a4716] text-[9px] px-2.5 py-0.5 rounded-full font-headline font-bold uppercase tracking-widest inline-block mb-1.5">
                      {activeArticle.category}
                    </span>
                    <h2 className="text-xl md:text-2xl font-headline font-extrabold leading-tight">
                      {activeArticle.title}
                    </h2>
                  </div>
                </div>

                {/* Article Body Scrollable pane */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1 text-[#373222] font-body text-sm leading-relaxed space-y-4">
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-label pb-3 border-b border-[#ece2ca]/30">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs leading-none">auto_stories</span>
                      {activeArticle.duration}
                    </span>
                    <button 
                      onClick={() => handleToggleSave(activeArticle.id, activeArticle.title)}
                      className="text-[#3c6a35] font-headline font-bold hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs leading-none">
                        {savedPractices.includes(activeArticle.id) ? 'bookmark_added' : 'bookmark'}
                      </span>
                      {savedPractices.includes(activeArticle.id) ? 'Saved' : 'Bookmark Article'}
                    </button>
                  </div>

                  {activeArticle.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-on-surface">{paragraph}</p>
                  ))}
                </div>

                {/* Footer buttons */}
                <div className="p-4 border-t border-[#ece2ca]/30 bg-[#fbf3e1] flex justify-end gap-2 text-xs">
                  <button 
                    onClick={() => setActiveArticle(null)}
                    className="px-5 py-2 rounded-full font-headline font-bold text-on-surface-variant hover:text-on-surface bg-[#ece2ca]/30 hover:bg-[#ece2ca]/60 transition-colors"
                  >
                    Close Reading
                  </button>
                  <button 
                    onClick={() => {
                      const articleId = activeArticle.id;
                      const articleTitle = activeArticle.title;
                      setActiveArticle(null);
                      handleToggleSave(articleId, articleTitle);
                    }}
                    className="px-5 py-2 rounded-full bg-[#3c6a35] hover:bg-[#305d2a] text-[#ebffe0] font-headline font-bold transition-colors shadow shadow-[#3c6a35]/15"
                  >
                    {savedPractices.includes(activeArticle.id) ? 'Remove Bookmark' : 'Bookmark Practice'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
};

export default ResourcesPage;
