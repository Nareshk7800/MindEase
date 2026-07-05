import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useCheckIn } from "../context/CheckInContext";

type Activity = {
  id: string;
  mood_tag: string;
  activity_text: string;
  duration_minutes: number;
  energy_level_required: number;
  category: string;
};

type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: string;
  emotion?: string;
  selected_activity?: Activity;
  safetyTriggered?: boolean;
  attachedImage?: string; // base64 or object URL of pasted image/file
  feedbackSent?: boolean;
  gameTriggered?: boolean;
  flagged?: boolean; // Hate speech report indicators
};

type Community = {
  name: string;
  members: number;
  description: string;
  joined: boolean;
};

const INITIAL_COMMUNITIES: Community[] = [
  { name: "Workplace Stress", members: 142, description: "Mindful approaches to handling deadlines and work anxiety.", joined: true },
  { name: "Zen Breathing Practice", members: 89, description: "Daily 4-7-8 breathing practice and community check-ins.", joined: false },
  { name: "Grief Support Sanctuary", members: 64, description: "A safe space to share feelings of loss and sadness.", joined: false },
  { name: "Gratitude Journal Swap", members: 118, description: "Sharing moments of joy and positive reinforcement.", joined: false }
];

const SUGGESTION_TIPS = [
  "Try focusing on a single point in the room to help anchor your attention.",
  "Take three slow, deep belly breaths before responding to stressful emails.",
  "Dim your screen lights and disconnect from media 20 minutes before sleeping.",
  "Inhale deeply for 4 seconds, hold for 4 seconds, and exhale fully to calm your mind.",
  "Take a quick 5-minute stretch or walk outside to boost low energy levels.",
  "Write down one thing you are grateful for today, no matter how small."
];

const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Dynamic user data
  const username = user?.username || "Alex";
  const userEmail = user?.email || "alex.peace@sanctuary.com";

  // Navigation states
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & Community states
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [communityModalOpen, setCommunityModalOpen] = useState(false);
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES);
  const [newCommunityName, setNewCommunityName] = useState("");
  const [newCommunityDesc, setNewCommunityDesc] = useState("");

  // active room state: private assistant vs community chat room
  const [activeChatRoom, setActiveChatRoom] = useState<{ type: 'assistant' } | { type: 'community', name: string }>({ type: 'assistant' });

  // Sadness activity suggest permission gate
  const [sadPermissions, setSadPermissions] = useState<Record<string, 'pending' | 'accepted' | 'declined'>>({});

  // Tips cycling states
  const [tipIndex, setTipIndex] = useState(0);
  const [tipCountdown, setTipCountdown] = useState(900); // 15 minutes = 900 seconds

  // File system and paste states
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Assistant states
  const [isListening, setIsListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'en' | 'ta'>('en');
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // 1. Persistent Messages via localStorage - chat context is preserved across page swaps!
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem("equimind_private_chat_history");
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error("Failed to parse private chat history", e);
    }
    return [
      {
        id: "bot-1",
        role: "bot",
        text: "Good morning. I'm here to help you find your center today. Is there something specific on your mind, or would you like to explore a breathing exercise?",
        timestamp: "09:41 AM"
      }
    ];
  });

  // Keep latest suggested activity preserved for Start Session exercises
  const [latestSuggestedActivity, setLatestSuggestedActivity] = useState<Activity | null>(() => {
    try {
      const raw = localStorage.getItem("equimind_latest_suggested_activity");
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return null;
  });

  // Community Chat Messages logs map
  const [communityMessages, setCommunityMessages] = useState<Record<string, Message[]>>({
    "Workplace Stress": [
      { id: "c1", role: "bot", text: "Meera: Hey everyone, feeling so overwhelmed by the end-of-quarter deadlines today...", timestamp: "10:15 AM" },
      { id: "c2", role: "bot", text: "Karthik: Take a slow breath Meera, you've got this. Have you tried the 4-7-8 breathing here?", timestamp: "10:17 AM" },
      { id: "c3", role: "bot", text: "Sneha: Yes, the breathing exercises really help during deadlines! Let's do it together.", timestamp: "10:18 AM" }
    ],
    "Zen Breathing Practice": [
      { id: "c4", role: "bot", text: "Rohit: Just completed my morning 5-minute breathing session. Feeling extremely clear-headed.", timestamp: "08:30 AM" },
      { id: "c5", role: "bot", text: "Meera: Same here Rohit! It keeps me centered for the day ahead.", timestamp: "08:35 AM" }
    ]
  });

  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Zen Game bubble popper states inside bot message
  const [bubbles, setBubbles] = useState<Array<{ id: number; popped: boolean }>>([
    { id: 1, popped: false },
    { id: 2, popped: false },
    { id: 3, popped: false },
    { id: 4, popped: false },
    { id: 5, popped: false },
    { id: 6, popped: false },
    { id: 7, popped: false },
    { id: 8, popped: false }
  ]);
  const [tensionMeter, setTensionMeter] = useState(100);

  // Interactive exercises session modal states (linked to latestSuggestedActivity)
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(4);
  const [isBreathingRunning, setIsBreathingRunning] = useState(false);

  // Custom Journal State within suggested session exercise
  const [modalJournalText, setModalJournalText] = useState("");

  // Write private chat history changes to localStorage
  useEffect(() => {
    localStorage.setItem("equimind_private_chat_history", JSON.stringify(messages));
  }, [messages]);

  // Write latest suggested activity to localStorage
  useEffect(() => {
    if (latestSuggestedActivity) {
      localStorage.setItem("equimind_latest_suggested_activity", JSON.stringify(latestSuggestedActivity));
    }
  }, [latestSuggestedActivity]);

  // 2. Connect Community Room to Real User - Fetch/Post REST Polling updates every 3 seconds!
  useEffect(() => {
    if (activeChatRoom.type !== 'community') return;
    const roomName = activeChatRoom.name;

    const fetchCommunityMessages = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const res = await fetch(`${apiBaseUrl}/api/community/messages?room=${encodeURIComponent(roomName)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCommunityMessages(prev => ({
              ...prev,
              [roomName]: data
            }));
          }
        }
      } catch (err) {
        console.error("Polled community fetch error:", err);
      }
    };

    fetchCommunityMessages(); // initial fetch
    const pollInterval = setInterval(fetchCommunityMessages, 3000); // Poll every 3 seconds
    return () => clearInterval(pollInterval);
  }, [activeChatRoom]);

  // Check speech synthesis support on mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSupported(true);
    }

    // Initialize speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = voiceLang === 'ta' ? 'ta-IN' : 'en-US';

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setUserInput(resultText);
        setIsListening(false);
        showToast(`Captured speech: "${resultText}"`);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [voiceLang]);

  // Adjust speech recognition language configuration
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = voiceLang === 'ta' ? 'ta-IN' : 'en-US';
    }
  }, [voiceLang]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatRoom, communityMessages]);

  // Tips cycling timer (updates index every 15 minutes)
  useEffect(() => {
    const timer = setInterval(() => {
      setTipCountdown((prev) => {
        if (prev <= 1) {
          setTipIndex((prevIndex) => (prevIndex + 1) % SUGGESTION_TIPS.length);
          return 900;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toast manager
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatCountdown = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const getTimestampStr = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  };

  // Text to speech announcer
  const speakResponse = (text: string) => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    
    const cleanedText = text.replace(/[*#_~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = voiceLang === 'ta' ? 'ta-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
    showToast(`Speaking response in ${voiceLang === 'ta' ? 'Tamil 🇮🇳' : 'English 🇬🇧'}`);
  };

  // Handle local clipboard images
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setAttachedImage(event.target.result as string);
              showToast("Pasted image from clipboard.");
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // Access system files
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedImage(event.target.result as string);
          showToast(`Selected file: ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // voice toggles
  const toggleListening = () => {
    if (!recognitionRef.current) {
      showToast("Speech Recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
      showToast(`Listening (${voiceLang === 'ta' ? 'Tamil' : 'English'})...`);
    }
  };

  const [userInput, setUserInput] = useState("");

  // Send message flow
  const handleSendMessage = async () => {
    if ((!userInput.trim() && !attachedImage) || loading) return;

    const userText = userInput;
    const currentAttached = attachedImage;
    const currentTime = getTimestampStr();

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

    // 2. Connect Community Room to Real Users - POST messages to standard REST backend database
    if (activeChatRoom.type === 'community') {
      const roomName = activeChatRoom.name;
      try {
        const response = await fetch(`${apiBaseUrl}/api/community/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room: roomName,
            text: userText,
            username: username,
            timestamp: currentTime
          })
        });

        if (response.ok) {
          const data = await response.json();
          // Update immediately before poll
          setCommunityMessages(prev => ({
            ...prev,
            [roomName]: [...(prev[roomName] || []), data.message]
          }));

          // If the message contains offensive keywords, show toast alert
          if (data.message.flagged) {
            showToast("🚨 Warning: Message flagged for guidelines violation.");
          }
        }
      } catch (err) {
        console.error("Community post error:", err);
      }

      setUserInput("");
      setAttachedImage(null);
      return;
    }

    const tempBotId = `bot-${Date.now()}`;

    // Add user message to Digital Assistant message logs
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: userText,
        attachedImage: currentAttached || undefined,
        timestamp: currentTime
      },
      {
        id: tempBotId,
        role: "bot",
        text: "Typing...",
        timestamp: currentTime
      }
    ]);

    setUserInput("");
    setAttachedImage(null);
    setLoading(true);

    try {
      // Build chat history list to send to backend for LangChain window memory
      const recentHistory = messages.map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const res = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText || "Shared attachment",
          history: recentHistory,
          lang: voiceLang
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.reply || `Request failed (${res.status})`);
      }

      const reply = data?.reply || "I am here to support you.";
      const topEmotion = data?.topEmotion || "neutral";
      const selectedActivity = data?.selected_activity;
      const safetyTriggered = data?.safetyTriggered;
      const flagged = data?.flagged;

      // Check if user is angry or stressed -> trigger embedded zen bubble game!
      const gameTriggered = (topEmotion === 'angry' || topEmotion === 'stressed') && !safetyTriggered;

      // Log latest suggested activity for Start Session action!
      if (selectedActivity && !safetyTriggered) {
        setLatestSuggestedActivity(selectedActivity);
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempBotId
            ? {
                ...msg,
                text: reply,
                emotion: topEmotion,
                selected_activity: selectedActivity,
                safetyTriggered,
                gameTriggered,
                flagged,
                timestamp: getTimestampStr()
              }
            : msg
        )
      );

      // Automatically speak the text reply aloud
      speakResponse(reply);

    } catch (err: any) {
      console.error(err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempBotId
            ? {
                ...msg,
                text: err.message || "Connection timed out. Please try again.",
                timestamp: getTimestampStr()
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Clear private chat history
  const handleClearHistory = () => {
    localStorage.removeItem("equimind_private_chat_history");
    localStorage.removeItem("equimind_latest_suggested_activity");
    setLatestSuggestedActivity(null);
    setMessages([
      {
        id: "bot-init",
        role: "bot",
        text: "Good morning. I've cleared the previous chat context log. How can I help you find calm now?",
        timestamp: getTimestampStr()
      }
    ]);
    showToast("Chat context and logs cleared successfully.");
  };

  // Submit feedback loops to backend
  const handleFeedback = async (messageId: string, activityId: string, mood: string, rating: boolean) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      await fetch(`${apiBaseUrl}/api/chat/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          activity_id: activityId,
          feedback: rating
        })
      });

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, feedbackSent: true } : msg
        )
      );
      showToast("Thank you for your activity feedback!");
    } catch (err) {
      console.error("Feedback error:", err);
      showToast("Logged feedback locally.");
    }
  };

  // Reset zen game popper values
  const handleResetGame = () => {
    setBubbles(bubbles.map(b => ({ ...b, popped: false })));
    setTensionMeter(100);
    showToast("Tension meter reset!");
  };

  // Pop a zen bubble
  const handlePopBubble = (id: number) => {
    setBubbles(prev =>
      prev.map(b => (b.id === id ? { ...b, popped: true } : b))
    );
    setTensionMeter(prev => Math.max(0, prev - 15));
  };

  // Predefined custom quote solver reading active chat keywords
  const getDerivedQuote = () => {
    const allUserTexts = messages
      .filter(m => m.role === "user")
      .map(m => m.text.toLowerCase())
      .join(" ");

    if (allUserTexts.includes("sad") || allUserTexts.includes("down") || allUserTexts.includes("cry") || allUserTexts.includes("alone") || allUserTexts.includes("lonely")) {
      return {
        text: "Tears are words the heart cannot express. Let them flow and heal.",
        author: "Mindful Anthology (Comfort)"
      };
    }
    if (allUserTexts.includes("angry") || allUserTexts.includes("mad") || allUserTexts.includes("annoyed") || allUserTexts.includes("hate")) {
      return {
        text: "For every minute you remain angry, you give up sixty seconds of peace.",
        author: "Mindful Anthology (Patience)"
      };
    }
    if (allUserTexts.includes("stress") || allUserTexts.includes("anxious") || allUserTexts.includes("worry") || allUserTexts.includes("panic") || allUserTexts.includes("overwhelmed")) {
      return {
        text: "Quiet the mind and the soul will speak. Your peace is within you.",
        author: "Mindful Anthology (Peace)"
      };
    }
    if (allUserTexts.includes("happy") || allUserTexts.includes("joy") || allUserTexts.includes("great") || allUserTexts.includes("excited")) {
      return {
        text: "Joy is not in things; it is in us. Celebrate this breath.",
        author: "Mindful Anthology (Joy)"
      };
    }

    return {
      text: "The forest is not merely trees; it is the breath of the world held in a single green leaf.",
      author: "Mindful Anthology"
    };
  };

  const derivedQuote = getDerivedQuote();

  // Create custom community thread
  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunityName.trim()) return;

    const newComm: Community = {
      name: newCommunityName,
      members: 1,
      description: newCommunityDesc || "A custom community space created by you.",
      joined: true
    };

    setCommunities(prev => [...prev, newComm]);
    setCommunityMessages(prev => ({
      ...prev,
      [newComm.name]: [
        { id: `c-init-${Date.now()}`, role: "bot", text: `Welcome to the new ${newComm.name} board! Say hello to start connecting with peer practitioners.`, timestamp: getTimestampStr() }
      ]
    }));

    setNewCommunityName("");
    setNewCommunityDesc("");
    setCommunityModalOpen(false);
    
    // Auto route user directly to their new community chat room!
    setActiveChatRoom({ type: 'community', name: newComm.name });
    showToast(`Board "${newComm.name}" created and loaded!`);
  };

  const toggleJoinCommunity = (name: string) => {
    setCommunities(prev =>
      prev.map(c =>
        c.name === name ? { ...c, joined: !c.joined, members: c.joined ? c.members - 1 : c.members + 1 } : c
      )
    );
    const comm = communities.find(c => c.name === name);
    if (comm) {
      if (!comm.joined) {
        // Automatically switch user to the community chat interface on join!
        setActiveChatRoom({ type: 'community', name });
        showToast(`Joined and navigated to "${name}" community chat room!`);
      } else {
        showToast(`Left community "${name}"`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("equimind_private_chat_history");
      localStorage.removeItem("equimind_latest_suggested_activity");
      await navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // Get active chat logs to show
  const activeRoomMessages = activeChatRoom.type === 'assistant' 
    ? messages 
    : (communityMessages[activeChatRoom.name] || []);

  return (
    <Layout hideNavigation={true}>
      <div className="font-body text-on-surface bg-background min-h-screen relative flex flex-col selection:bg-primary-container selection:text-on-primary-container">
        
        {/* custom styles */}
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

        {/* TopNavBar */}
        <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl flex justify-between items-center px-6 md:px-8 py-4 border-b border-[#ece2ca]/30 shadow-sm shrink-0">
          <div 
            onClick={() => navigate("/home")}
            className="text-xl md:text-2xl font-bold tracking-tighter text-primary font-headline cursor-pointer hover:opacity-85 transition-opacity"
          >
            Ethereal Sanctuary
          </div>
          
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link className={`font-headline tracking-wide text-sm ${isActive('/home') ? 'text-[#3c6a35] font-bold' : 'text-[#373222] hover:opacity-75'} transition-opacity`} to="/home">Dashboard</Link>
            <Link className={`font-headline tracking-wide text-sm ${isActive('/resources') ? 'text-[#3c6a35] font-bold' : 'text-[#373222] hover:opacity-75'} transition-opacity`} to="/resources">Resources</Link>
            <Link className={`font-headline tracking-wide text-sm ${isActive('/wellness') ? 'text-[#3c6a35] font-bold' : 'text-[#373222] hover:opacity-75'} transition-opacity`} to="/wellness">Wellness</Link>
            <Link className={`font-headline tracking-wide text-sm ${isActive('/chat') ? 'text-[#3c6a35] font-bold' : 'text-[#373222] hover:opacity-75'} transition-opacity`} to="/chat">Support</Link>
          </div>

          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileMenuOpen(false); }}
              className="material-symbols-outlined text-[#3c6a35] p-1.5 hover:bg-[#f6edda] rounded-full transition-all scale-95 relative"
            >
              notifications
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#9c4600] rounded-full animate-pulse" />
            </button>

            {/* Profile Avatar Trigger - Configured to check custom profile.jpg in public folder */}
            <div 
              onClick={() => { setProfileMenuOpen(!profileMenuOpen); setNotificationsOpen(false); }}
              className="w-9 h-9 rounded-full bg-surface-container-highest overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#3c6a35]/50 transition-all"
            >
              <img 
                alt="User profile photo" 
                className="w-full h-full object-cover" 
                src="/profile.jpg"
                onError={(e) => {
                  e.currentTarget.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuBrc2LAoW20ki135KRjpS6VXBi7yEQpXR9PZb1620x_SDOJZcrjJvFfjKEBi9rKbOuod2oQO82IpXciBVju1n1-57fEVSa51TJLcvwtnYBJqp0FJ7GfDpt99A9KoD7N8Hmt36qFsb6XOnBQ1_yJKcjltLkgYMB9bGquC9F6Kty2gCmqHM4VcqARRmCxm1mOCf5rrwZsE9X0zAWkA1_h5cpS74mzTFeK0FQyQ804aIoPMW_3YFkvvygBZqizJ33oKfbrmxUyoWpSCLY";
                }}
              />
            </div>

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
          </div>
        </nav>

        {/* SideNavBar Shell */}
        <aside className="fixed left-0 top-0 h-full hidden md:flex flex-col p-5 z-40 bg-[#faeacf] w-60 rounded-r-[2.25rem] shadow-xl shadow-[#373222]/5 pt-20 space-y-6 shrink-0 text-left">
          <div className="px-4 space-y-0.5">
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
            {/* Start Session Button - Triggers the dynamically solved active session exercise! */}
            <button 
              onClick={() => {
                setBreathTimer(4);
                setBreathPhase('Inhale');
                setModalJournalText("");
                setSessionModalOpen(true);
              }}
              className="w-full bg-[#3c6a35] text-[#ebffe0] rounded-full py-3 text-xs font-headline font-bold shadow-md shadow-primary/15 hover:scale-103 transition-transform"
            >
              Start Session
            </button>
          </div>
        </aside>

        {/* Main Content Canvas - Sizing and scrolls updated */}
        <main className="flex-grow md:ml-60 pt-20 px-4 md:px-8 pb-20 md:pb-8 flex flex-col text-left">
          
          {/* Header */}
          <div className="max-w-6xl mx-auto w-full mb-5 shrink-0 mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4.5xl font-headline font-extrabold tracking-tighter text-on-surface mb-0.5">Support Sanctuary</h1>
              <p className="text-on-surface-variant font-body text-xs md:text-sm max-w-xl">
                A gentle space to find clarity. Connect with our mindful assistants or your personal wellness guide.
              </p>
            </div>
            
            {/* Language voice selection toggle */}
            <div className="flex items-center gap-2 bg-[#fbf3e1] px-3.5 py-2 rounded-full border border-[#ece2ca]/30 select-none shadow-2xs">
              <span className="text-[10px] font-bold font-headline text-gray-500 uppercase tracking-widest">Voice:</span>
              <button 
                onClick={() => { setVoiceLang('en'); showToast("Switched speech to English"); }}
                className={`text-[10px] font-headline font-bold px-2 py-0.5 rounded-full transition-colors ${
                  voiceLang === 'en' ? 'bg-[#3c6a35] text-[#ebffe0]' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                English 🇬🇧
              </button>
              <button 
                onClick={() => { setVoiceLang('ta'); showToast("Switched speech to Tamil (தமிழ்)"); }}
                className={`text-[10px] font-headline font-bold px-2 py-0.5 rounded-full transition-colors ${
                  voiceLang === 'ta' ? 'bg-[#3c6a35] text-[#ebffe0]' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                தமிழ் 🇮🇳
              </button>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="max-w-6xl mx-auto w-full flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Chat Interface (8 Cols) - Dedicated layout height to prevent squishing */}
            <section className="lg:col-span-8 flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-[#ece2ca]/30 h-[620px] relative">
              
              {/* Chat Header */}
              <div className="px-6 py-4 flex items-center justify-between bg-[#fbf3e1]/50 border-b border-[#ece2ca]/35 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div>
                    {activeChatRoom.type === 'assistant' ? (
                      <>
                        <div className="flex items-center gap-3.5">
                          <h3 className="font-headline font-bold text-sm text-[#3c6a35] uppercase tracking-wider">Digital Assistant</h3>
                          <button 
                            onClick={handleClearHistory}
                            className="text-[9px] font-headline font-bold px-2.5 py-1 bg-red-50 text-red-700 rounded-full border border-red-200/50 hover:bg-red-100 transition-colors"
                            title="Reset chat memory context"
                          >
                            Clear Memory
                          </button>
                        </div>
                        <p className="text-[10px] text-secondary font-bold flex items-center gap-1.5 mt-0.5 uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping inline-block" />
                          Online
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => { setActiveChatRoom({ type: 'assistant' }); showToast("Returned to private Assistant chat."); }}
                            className="material-symbols-outlined text-[#3c6a35] hover:bg-[#f6edda] p-1 rounded-full text-xs font-bold"
                          >
                            arrow_back
                          </button>
                          <h3 className="font-headline font-bold text-sm text-[#9c4600] uppercase tracking-wider">Community: {activeChatRoom.name}</h3>
                        </div>
                        <p className="text-[9px] text-gray-500 font-headline font-medium mt-0.5">Peer Support Room • Live Collaboration</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Messages Panel */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/10 min-h-0 scrollbar-thin flex flex-col">
                {activeRoomMessages.map((msg, idx) => {
                  const isUser = msg.role === "user";

                  // Check if activity is sad & pending permission gate
                  const isSadActivity = msg.selected_activity && msg.emotion === 'sad';
                  const sadPermissionState = sadPermissions[msg.id] || 'pending';

                  // Only show activity cards for bad emotions (sad, stressed, angry, tired)
                  const isBadMood = msg.emotion === 'sad' || msg.emotion === 'stressed' || msg.emotion === 'angry' || msg.emotion === 'tired';

                  return (
                    <div 
                      key={msg.id || idx} 
                      className={`flex gap-3 max-w-[85%] ${isUser ? "self-end flex-row-reverse" : "self-start text-left"}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                        isUser ? 'bg-[#baeaff]' : 'bg-[#b9eeab]'
                      }`}>
                        <span className="material-symbols-outlined text-sm text-[#3c6a35]">
                          {isUser ? 'person' : 'auto_awesome'}
                        </span>
                      </div>

                      {/* Bubble */}
                      <div className={`rounded-2xl p-4 shadow-2xs relative ${
                        isUser 
                          ? 'bg-[#3c6a35] text-white rounded-tr-none' 
                          : 'bg-[#f6edda]/80 border border-[#ece2ca]/30 text-gray-800 rounded-tl-none'
                      }`}>
                        <p className="leading-relaxed text-xs md:text-sm whitespace-pre-line font-normal text-left">{msg.text}</p>
                        
                        {/* 3. Safety/Abuse Report Flag Warning */}
                        {msg.flagged && (
                          <div className="mt-2 text-[10px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-1.5 font-headline font-bold">
                            <span className="material-symbols-outlined text-xs">warning</span>
                            <span>🚨 Flagged: Message reported for guidelines violation.</span>
                          </div>
                        )}

                        {/* Render attached image thumbnail if exists */}
                        {msg.attachedImage && (
                          <div className="mt-2.5 max-w-[200px] rounded-lg overflow-hidden border border-[#ece2ca]/40 bg-white">
                            <img src={msg.attachedImage} alt="Attachment thumbnail" className="w-full h-auto object-cover max-h-[140px]" />
                          </div>
                        )}

                        {/* Interactive personalized Activity block (Only shown for negative emotions!) */}
                        {!isUser && msg.selected_activity && isBadMood && (
                          <div className="mt-3.5">
                            {/* Permission gate for sadness */}
                            {isSadActivity && sadPermissionState === 'pending' ? (
                              <div className="p-3.5 bg-white border border-[#ece2ca]/50 rounded-xl text-left shadow-xs space-y-3">
                                <p className="text-[11px] font-bold text-gray-700 leading-normal">
                                  Digital Assistant would like to suggest a comforting activity. Are you ready for this suggestion?
                                </p>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => setSadPermissions(prev => ({ ...prev, [msg.id]: 'accepted' }))}
                                    className="bg-[#3c6a35] text-white text-[10px] font-headline font-bold px-4 py-1.5 rounded-full hover:opacity-90 active:scale-95 transition-all"
                                  >
                                    Yes, I'm ready
                                  </button>
                                  <button 
                                    onClick={() => setSadPermissions(prev => ({ ...prev, [msg.id]: 'declined' }))}
                                    className="border border-gray-300 text-gray-600 text-[10px] font-headline font-bold px-3 py-1.5 rounded-full hover:bg-gray-50 active:scale-95 transition-all"
                                  >
                                    Maybe later
                                  </button>
                                </div>
                              </div>
                            ) : isSadActivity && sadPermissionState === 'declined' ? (
                              <p className="text-[10px] text-gray-400 italic">Activity suggestion skipped. Let me know whenever you're ready.</p>
                            ) : (
                              // Render full activity card when permission is accepted OR mood is not sad but bad (stressed, angry, tired)
                              <div className="p-3.5 bg-white border border-[#ece2ca]/50 rounded-xl shadow-xs text-left">
                                <div className="flex items-start justify-between mb-2">
                                  <span className="px-2.5 py-0.5 rounded-full bg-[#ffa26b]/20 text-[#9c4600] text-[8px] font-bold uppercase tracking-wider font-headline">
                                    {msg.selected_activity.category}
                                  </span>
                                  <span className="text-[9px] text-[#827a66] font-medium font-headline">{msg.selected_activity.duration_minutes} min reset</span>
                                </div>
                                <p className="text-xs font-bold text-gray-800 leading-tight mb-3">
                                  {msg.selected_activity.activity_text}
                                </p>

                                {/* Dynamic buttons for exercises/games */}
                                <div className="flex gap-2 items-center">
                                  {(msg.emotion === 'sad' || msg.emotion === 'stressed' || msg.safetyTriggered) && (
                                    <button 
                                      onClick={() => {
                                        setBreathTimer(4);
                                        setBreathPhase('Inhale');
                                        setSessionModalOpen(true);
                                      }}
                                      className="bg-[#3c6a35] text-[#ebffe0] text-[9px] font-headline font-bold px-3 py-1.5 rounded-full hover:opacity-90 active:scale-95 transition-all"
                                    >
                                      Breathe with Sanctuary
                                    </button>
                                  )}

                                  {msg.gameTriggered && (
                                    <button 
                                      onClick={() => {
                                        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, gameTriggered: false } : m));
                                        showToast("Zen game loaded below!");
                                      }}
                                      className="bg-sky-600 text-white text-[9px] font-headline font-bold px-3 py-1.5 rounded-full hover:bg-sky-700 active:scale-95 transition-all"
                                    >
                                      Decompress with MindEase Game
                                    </button>
                                  )}
                                </div>

                                {/* Suggestion Feedback Loop */}
                                <div className="mt-3.5 pt-3.5 border-t border-[#ece2ca]/35 flex items-center justify-between text-2xs select-none">
                                  <span className="text-[#827a66] font-medium">Was this suggestion helpful?</span>
                                  {msg.feedbackSent ? (
                                    <span className="text-[#3c6a35] font-bold flex items-center gap-1">
                                      <span className="material-symbols-outlined text-xs">done</span>
                                      Logged
                                    </span>
                                  ) : (
                                    <div className="flex gap-1.5">
                                      <button 
                                        onClick={() => handleFeedback(msg.id, msg.selected_activity!.id, msg.emotion || "neutral", true)}
                                        className="p-1 hover:bg-[#f6edda] rounded-full transition-colors text-gray-500 hover:text-green-600"
                                        title="Thumbs Up"
                                      >
                                        <span className="material-symbols-outlined text-xs">thumb_up</span>
                                      </button>
                                      <button 
                                        onClick={() => handleFeedback(msg.id, msg.selected_activity!.id, msg.emotion || "neutral", false)}
                                        className="p-1 hover:bg-[#f6edda] rounded-full transition-colors text-gray-500 hover:text-red-600"
                                        title="Thumbs Down"
                                      >
                                        <span className="material-symbols-outlined text-xs">thumb_down</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Embedded Zen Game bubble popper inside bubble if game is active */}
                        {!isUser && msg.gameTriggered && isBadMood && (
                          <div className="mt-4 p-4 bg-[#fbf3e1] border border-[#ece2ca]/50 rounded-xl text-left select-none max-w-sm animate-fadeIn">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-headline font-bold text-xs text-[#3c6a35]">Zen Bubble Popper Game</h4>
                              <button onClick={handleResetGame} className="material-symbols-outlined text-xs text-gray-500 hover:bg-white p-1 rounded-full">refresh</button>
                            </div>
                            
                            <div className="relative h-2 bg-[#ece2ca] rounded-full mb-3 overflow-hidden">
                              <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-400 to-orange-500 rounded-full transition-all duration-300"
                                style={{ width: `${tensionMeter}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[8px] font-bold text-[#827a66] uppercase tracking-wider mb-3">
                              <span>Tension level:</span>
                              <span className={tensionMeter > 0 ? "text-red-600 animate-pulse" : "text-[#3c6a35] font-black"}>
                                {tensionMeter > 0 ? `${tensionMeter}%` : "0% (Fully Calm)"}
                              </span>
                            </div>

                            {tensionMeter > 0 ? (
                              <div className="grid grid-cols-4 gap-2.5 py-1">
                                {bubbles.map(b => (
                                  <button
                                    key={b.id}
                                    disabled={b.popped}
                                    onClick={() => handlePopBubble(b.id)}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                      b.popped 
                                        ? 'bg-gray-300 text-gray-400 scale-90 border-transparent shadow-inner cursor-default' 
                                        : 'bg-gradient-to-br from-indigo-300 to-sky-400 text-white shadow hover:scale-105 active:scale-95 border-2 border-white'
                                    }`}
                                  >
                                    <span className="text-[9px] font-bold">{b.popped ? '💥' : '🫧'}</span>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-2">
                                <p className="text-[10px] text-[#3c6a35] font-bold">✨ Tension fully dissolved. Great job resetting your calm!</p>
                              </div>
                            )}
                          </div>
                        )}

                        {!isUser && (
                          <button 
                            onClick={() => speakResponse(msg.text)}
                            className="absolute -bottom-2.5 -right-2 bg-white hover:bg-[#ebffe0] text-[#3c6a35] p-1 rounded-full shadow border border-gray-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                            title="Speak out loud"
                          >
                            <span className="material-symbols-outlined text-[10px]">volume_up</span>
                          </button>
                        )}

                        <span className={`text-[8px] mt-2 block opacity-50 text-right ${isUser ? 'text-white' : 'text-on-surface-variant'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input with files & voice buttons */}
              <div className="p-4 bg-[#fbf3e1]/50 border-t border-[#ece2ca]/35 shrink-0">
                {attachedImage && (
                  <div className="mb-2.5 flex items-center gap-2.5 bg-white border border-[#ece2ca]/30 rounded-xl p-2 max-w-[180px] relative select-none animate-fadeIn">
                    <img src={attachedImage} alt="Preview attach" className="w-10 h-10 object-cover rounded" />
                    <div className="flex-grow min-w-0">
                      <p className="text-[9px] font-bold text-gray-600 truncate">Attached Image</p>
                      <p className="text-[8px] text-gray-400">Ready to upload</p>
                    </div>
                    <button 
                      onClick={() => setAttachedImage(null)}
                      className="absolute -top-1.5 -right-1.5 bg-red-100 hover:bg-red-200 text-red-700 p-0.5 rounded-full"
                    >
                      <span className="material-symbols-outlined text-[10px] font-black">close</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 bg-white border border-[#ece2ca]/40 rounded-full px-5 py-2 shadow-inner">
                  {/* Access System Files */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-lg"
                    title="Access System Files"
                  >
                    attach_file
                  </button>

                  <input 
                    className="flex-grow bg-transparent border-none focus:outline-none focus:ring-0 text-xs md:text-sm text-on-surface placeholder:text-[#827a66]/50 font-body py-1.5" 
                    placeholder={activeChatRoom.type === 'assistant' ? "Share your thoughts... (Ctrl+V to paste images)" : "Type a message in the community board..."} 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    onPaste={handlePaste}
                    disabled={loading}
                  />

                  {/* voice assistant toggler */}
                  <button 
                    onClick={toggleListening}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                      isListening 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    title={isListening ? "Stop listening" : "Start speaking Tamil/English"}
                  >
                    <span className="material-symbols-outlined text-base">mic</span>
                  </button>

                  {/* Send Button */}
                  <button 
                    onClick={handleSendMessage}
                    disabled={loading || (!userInput.trim() && !attachedImage)}
                    className="w-9 h-9 bg-[#3c6a35] text-[#ebffe0] rounded-full flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all shrink-0 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">send</span>
                  </button>
                </div>
              </div>

            </section>

            {/* Sidebar Contextual Content (4 Cols) */}
            <aside className="lg:col-span-4 flex flex-col gap-6 w-full text-left">
              
              {/* Predefined & Custom Community Board card */}
              <div className="bg-[#fbf3e1]/70 border border-[#ece2ca]/30 rounded-2xl p-5 shadow-2xs flex flex-col shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline font-bold text-base text-on-surface">Community Boards</h3>
                  <span className="material-symbols-outlined text-[#9c4600] text-lg">groups</span>
                </div>
                
                {/* Community Scroll Wrapper fixing the scroll-down overlap issue */}
                <div className="space-y-3 text-left max-h-[220px] overflow-y-auto pr-1.5 scrollbar-thin">
                  {communities.map((comm) => {
                    const isActiveRoom = activeChatRoom.type === 'community' && activeChatRoom.name === comm.name;
                    return (
                      <div 
                        key={comm.name}
                        onClick={() => {
                          if (comm.joined) {
                            setActiveChatRoom({ type: 'community', name: comm.name });
                            showToast(`Switched to community room "${comm.name}"`);
                          } else {
                            showToast(`Join "${comm.name}" community board first!`);
                          }
                        }}
                        className={`p-3 bg-white border rounded-xl flex items-center justify-between gap-2.5 cursor-pointer hover:border-[#3c6a35]/40 transition-colors ${
                          isActiveRoom ? 'ring-2 ring-[#3c6a35]' : 'border-[#ece2ca]/30'
                        }`}
                        title="Click to enter chat room"
                      >
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-[#373222] truncate">{comm.name}</h4>
                          <p className="text-[9px] text-on-surface-variant line-clamp-1 mt-0.5">{comm.description}</p>
                          <p className="text-[8px] font-headline text-secondary mt-1">{comm.members} practitioners</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleJoinCommunity(comm.name);
                          }}
                          className={`text-[9px] font-headline font-bold px-3 py-1.5 rounded-full shrink-0 transition-colors ${
                            comm.joined 
                              ? 'bg-[#b9eeab] text-on-primary-container' 
                              : 'border border-[#3c6a35] text-[#3c6a35] hover:bg-[#b9eeab]/20'
                          }`}
                        >
                          {comm.joined ? 'Joined' : 'Join'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button 
                  onClick={() => setCommunityModalOpen(true)}
                  className="mt-4 w-full py-2.5 bg-[#3c6a35] text-[#ebffe0] rounded-full font-headline font-bold text-xs shadow-md shadow-primary/10 hover:opacity-90 active:scale-95 transition-all"
                >
                  Create Community Board
                </button>
              </div>

              {/* Discussions / Tips Card */}
              <div className="bg-[#fbf3e1]/70 border border-[#ece2ca]/30 rounded-2xl p-5 shadow-2xs flex flex-col shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-headline font-bold text-xs text-on-surface uppercase tracking-wider">MindEase Daily Tip</h3>
                  <button 
                    onClick={() => {
                      setTipIndex((prev) => (prev + 1) % SUGGESTION_TIPS.length);
                      setTipCountdown(900);
                      showToast("Tip refreshed manually!");
                    }}
                    className="material-symbols-outlined text-xs text-gray-500 hover:bg-white p-1 rounded-full"
                    title="Next Tip"
                  >
                    refresh
                  </button>
                </div>
                
                <div className="p-4 bg-white border border-[#ece2ca]/30 rounded-xl shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-bold px-2 py-0.5 bg-[#baeaff]/40 text-[#005971] rounded-full">ENHANCEMENT</span>
                    <span className="text-[8px] font-headline text-[#827a66] font-bold">Auto-updates: {formatCountdown(tipCountdown)}</span>
                  </div>
                  <p className="text-xs text-on-surface font-body leading-relaxed">
                    {SUGGESTION_TIPS[tipIndex]}
                  </p>
                </div>
              </div>

              {/* Daily Wisdom Quote card - Configured to check custom quotes-bg.jpg in public folder */}
              <div className="glass-panel-warm border border-[#ece2ca]/35 rounded-2xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[180px] shrink-0">
                <img 
                  alt="Forest quote background" 
                  className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none" 
                  src="/quotes-bg.jpg"
                  onError={(e) => {
                    e.currentTarget.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuDTx4ZOXE5e7TSWnad1iq249GMNKuF_dq6CNGwieZAZGZP1Z1uSAPgXkL4b8GRTj4nEX2g5jN2Jy-fycm-mAoHkNnIJmWkiBBecCB5ZazDmpXDRvgn0d8U2RagTeR7hvrfb09u4yg32p09caaRo28zn4iIvDg6wZ47y7_MOPRF-Q1lArjijvCN3KDgsfkyeVnXch0AIiUvHiAHkUd0kUpbmnl5m_dUelSnQkTfWGhXHECcoLgs8I-UE-27NvsbbDuUyHfWf_F0xGK0";
                  }}
                />
                <div className="relative z-10 py-1 text-center flex flex-col items-center justify-center">
                  <span className="material-symbols-outlined text-[#9c4600] text-3xl mb-1.5" style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
                  <p className="font-headline italic text-xs md:text-sm text-on-surface mb-3 leading-relaxed px-2 font-medium">
                    "{derivedQuote.text}"
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant font-headline">
                    — {derivedQuote.author}
                  </p>
                </div>
              </div>

            </aside>
          </div>

        </main>
      </div>

      {/* Mobile Navigation */}
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
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: isActive('/chat') ? "'FILL' 1" : "" }}>chat_bubble</span>
          <span className="text-[9px] font-bold font-headline">Support</span>
        </Link>
      </nav>

      {/* --- COMMUNITY MODAL POPUP --- */}
      <AnimatePresence>
        {communityModalOpen && (
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
              className="bg-[#fff8ef] rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative border border-[#ece2ca]/40 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setCommunityModalOpen(false)}
                className="absolute top-4 right-4 material-symbols-outlined text-on-surface-variant hover:bg-[#f6edda] p-1.5 rounded-full transition-colors"
              >
                close
              </button>

              <span className="text-[#9c4600] font-headline font-bold text-[10px] uppercase tracking-widest block mb-1">Mindfulness Hub</span>
              <h3 className="text-2xl font-headline font-extrabold text-[#373222] mb-5">Sanctuary Communities</h3>

              {/* Predefined list */}
              <div className="space-y-3 mb-8">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest text-left">Active Boards</p>
                {communities.map((comm) => (
                  <div key={comm.name} className="p-3.5 bg-white border border-[#ece2ca]/30 rounded-2xl flex items-center justify-between gap-3 text-left">
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-[#373222] truncate">{comm.name}</h4>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">{comm.description}</p>
                    </div>
                    <button
                      onClick={() => toggleJoinCommunity(comm.name)}
                      className={`text-[10px] font-headline font-bold px-3 py-1.5 rounded-full shrink-0 transition-colors ${
                        comm.joined 
                          ? 'bg-[#3c6a35] text-[#ebffe0]' 
                          : 'border border-[#3c6a35] text-[#3c6a35] hover:bg-[#3c6a35]/10'
                      }`}
                    >
                      {comm.joined ? 'Joined' : 'Join Board'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Create new Form */}
              <form onSubmit={handleCreateCommunity} className="border-t border-[#ece2ca]/40 pt-6 text-left">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Create Your Own Board</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface uppercase tracking-wider mb-1">Board Name</label>
                    <input 
                      type="text" 
                      required
                      value={newCommunityName}
                      onChange={(e) => setNewCommunityName(e.target.value)}
                      placeholder="e.g. Anxiety Venting Circle"
                      className="w-full text-xs bg-white border border-[#ece2ca]/60 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-on-surface uppercase tracking-wider mb-1">Purpose / Description</label>
                    <textarea 
                      value={newCommunityDesc}
                      onChange={(e) => setNewCommunityDesc(e.target.value)}
                      placeholder="What is this community board about?"
                      className="w-full text-xs bg-white border border-[#ece2ca]/60 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-primary focus:outline-none min-h-[60px]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#3c6a35] text-[#ebffe0] py-2.5 rounded-full font-headline font-bold text-xs shadow hover:opacity-90 active:scale-95 transition-all"
                  >
                    Create and Publish Board
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- 5. DYNAMIC START SESSION EXERCISE OVERLAY MODAL (Resolves matching exercise based on what AI suggested) --- */}
      <AnimatePresence>
        {sessionModalOpen && (
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
              className="bg-[#fff8ef] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-[#ece2ca]/40 text-left"
            >
              <button 
                onClick={() => { setSessionModalOpen(false); setIsBreathingRunning(false); }}
                className="absolute top-4 right-4 material-symbols-outlined text-on-surface-variant hover:bg-[#f6edda] p-1.5 rounded-full transition-colors"
              >
                close
              </button>

              {/* A. If suggested activity is breathing related or fallback (neutral/none) */}
              {(!latestSuggestedActivity || latestSuggestedActivity.category === 'rest' || latestSuggestedActivity.id.includes('breath') || latestSuggestedActivity.id.includes('meditate') || latestSuggestedActivity.id.includes('grounding')) ? (
                <>
                  <span className="text-[#9c4600] font-headline font-bold text-[10px] uppercase tracking-widest block mb-1">
                    {latestSuggestedActivity ? latestSuggestedActivity.category : "Breathing reset"}
                  </span>
                  <h3 className="text-2xl font-headline font-extrabold text-[#373222] mb-3">
                    {latestSuggestedActivity ? latestSuggestedActivity.activity_text.split(":")[0] : "4-7-8 Breathing Guide"}
                  </h3>
                  <p className="text-on-surface-variant text-xs mb-6 font-body leading-relaxed">
                    {latestSuggestedActivity ? latestSuggestedActivity.activity_text : "Calm your nervous system instantly. Inhale 4s, hold 7s, exhale 8s."}
                  </p>

                  {/* Visualizer */}
                  <div className="h-48 flex flex-col items-center justify-center bg-[#fbf3e1] rounded-2xl p-6 relative overflow-hidden mb-6 border border-[#ece2ca]/30">
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

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsBreathingRunning(!isBreathingRunning)}
                      className={`flex-1 px-5 py-3 rounded-full font-headline font-bold text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 ${
                        isBreathingRunning 
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                          : 'bg-[#3c6a35] text-[#ebffe0] hover:bg-[#305d2a]'
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
                </>
              ) : latestSuggestedActivity.category === 'cognitive' ? (
                // B. If suggested activity is cognitive (e.g. journaling / todo lists)
                <div className="space-y-4">
                  <span className="text-sky-600 font-headline font-bold text-[10px] uppercase tracking-widest block">Cognitive Reflection</span>
                  <h3 className="text-2xl font-headline font-extrabold text-[#373222]">{latestSuggestedActivity.activity_text.split(":")[0]}</h3>
                  <p className="text-on-surface-variant text-xs font-body leading-relaxed">{latestSuggestedActivity.activity_text}</p>
                  
                  <textarea 
                    value={modalJournalText}
                    onChange={(e) => setModalJournalText(e.target.value)}
                    placeholder="Type your reflection notes here..."
                    className="w-full h-32 bg-white border border-[#ece2ca]/60 rounded-xl p-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />

                  <button
                    onClick={() => {
                      if (modalJournalText.trim()) {
                        showToast("Journal entry recorded successfully!");
                        setSessionModalOpen(false);
                        setModalJournalText("");
                      } else {
                        showToast("Please enter a few words first.");
                      }
                    }}
                    className="w-full bg-[#3c6a35] text-[#ebffe0] py-3 rounded-full font-headline font-bold text-xs hover:opacity-90 active:scale-95 transition-all"
                  >
                    Submit Reflection Entry
                  </button>
                </div>
              ) : (
                // C. If suggested activity is physical/movement/other (e.g. stretch, hydration check)
                <div className="space-y-4">
                  <span className="text-amber-600 font-headline font-bold text-[10px] uppercase tracking-widest block">Physical Grounding</span>
                  <h3 className="text-2xl font-headline font-extrabold text-[#373222]">{latestSuggestedActivity.activity_text.split(":")[0]}</h3>
                  <p className="text-on-surface-variant text-xs font-body leading-relaxed">{latestSuggestedActivity.activity_text}</p>

                  <div className="p-4 bg-[#fbf3e1] rounded-2xl border border-[#ece2ca]/40 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <span className="material-symbols-outlined text-[#3c6a35] text-sm">done</span>
                      <span>Release shoulder tension</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <span className="material-symbols-outlined text-[#3c6a35] text-sm">done</span>
                      <span>Drink a full glass of cold water</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                      <span className="material-symbols-outlined text-[#3c6a35] text-sm">done</span>
                      <span>Close eyes and stand up for 60s</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      showToast("Stretching session marked as completed!");
                      setSessionModalOpen(false);
                    }}
                    className="w-full bg-[#3c6a35] text-[#ebffe0] py-3 rounded-full font-headline font-bold text-xs hover:opacity-90 active:scale-95 transition-all"
                  >
                    Mark Activity as Complete
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </Layout>
  );
};

export default ChatPage;
