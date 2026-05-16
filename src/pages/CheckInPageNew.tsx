import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCheckIn } from '../context/CheckInContext';

type MoodKey = 'Calm' | 'Energetic' | 'Anxious' | 'Thoughtful';

type MoodTheme = {
  key: MoodKey;
  label: string;
  value: number; // 1-5
  energy: number;
  stress: number;
  primary: string;
  secondary: string;
  tertiary: string;
  neutral: string;
  cardBg: string;
  selectedBg: string;
  selectedBorder: string;
  buttonBg: string;
  buttonText: string;
  heading: string;
};

const PALETTE = {
  primaryGreen: '#2D6A4F',
  secondaryPurple: '#7B2CBF',
  tertiaryYellow: '#FFD166',
  neutralBlack: '#121212',
  pageBg: '#F6F3EE',
};

const MOODS: MoodTheme[] = [
  {
    key: 'Calm',
    label: 'Calm',
    value: 5,
    energy: 3,
    stress: 2,
    primary: PALETTE.primaryGreen,
    secondary: PALETTE.secondaryPurple,
    tertiary: PALETTE.tertiaryYellow,
    neutral: PALETTE.neutralBlack,
    cardBg: '#CFF6E6',
    selectedBg: '#2D6A4F',
    selectedBorder: '#2D6A4F',
    buttonBg: '#2D6A4F',
    buttonText: '#FFFFFF',
    heading: '#2D6A4F',
  },
  {
    key: 'Energetic',
    label: 'Energertic',
    value: 4,
    energy: 5,
    stress: 3,
    primary: PALETTE.tertiaryYellow,
    secondary: PALETTE.secondaryPurple,
    tertiary: PALETTE.primaryGreen,
    neutral: PALETTE.neutralBlack,
    cardBg: '#FFF1C7',
    selectedBg: '#FFD166',
    selectedBorder: '#FFD166',
    buttonBg: '#121212',
    buttonText: '#FFFFFF',
    heading: '#121212',
  },
  {
    key: 'Anxious',
    label: 'Anxious',
    value: 2,
    energy: 2,
    stress: 5,
    primary: PALETTE.secondaryPurple,
    secondary: PALETTE.primaryGreen,
    tertiary: PALETTE.tertiaryYellow,
    neutral: PALETTE.neutralBlack,
    cardBg: '#F3D7FF',
    selectedBg: '#7B2CBF',
    selectedBorder: '#7B2CBF',
    buttonBg: '#7B2CBF',
    buttonText: '#FFFFFF',
    heading: '#7B2CBF',
  },
  {
    key: 'Thoughtful',
    label: 'Thoughtful',
    value: 3,
    energy: 3,
    stress: 3,
    primary: PALETTE.secondaryPurple,
    secondary: PALETTE.primaryGreen,
    tertiary: PALETTE.tertiaryYellow,
    neutral: PALETTE.neutralBlack,
    cardBg: '#E9D5FF',
    selectedBg: '#7B2CBF',
    selectedBorder: '#7B2CBF',
    buttonBg: '#7B2CBF',
    buttonText: '#FFFFFF',
    heading: '#7B2CBF',
  },
];

type Suggestion = { title: string; desc: string; chip: string };

function keywordTags(why: string) {
  const text = why.toLowerCase();
  const tags: string[] = [];

  const add = (t: string) => {
    if (!tags.includes(t)) tags.push(t);
  };

  if (/(sleep|tired|rest)/.test(text)) add('sleep');
  if (/(work|study|deadline|school)/.test(text)) add('pressure');
  if (/(family|friend|social)/.test(text)) add('social');
  if (/(anxious|anxiety|worry|panic|nervous|afraid)/.test(text)) add('anxiety');
  if (/(stress|stressed|overwhelm)/.test(text)) add('stress');
  if (/(sad|down|depress)/.test(text)) add('low');
  if (/(angry|mad|irritat)/.test(text)) add('anger');
  if (/(grateful|gratitude|good|great|happy)/.test(text)) add('positive');

  return tags;
}

function deriveSuggestions(mood: MoodKey, why: string): {
  reflectiveTip: string;
  suggestions: Suggestion[];
} {
  const tags = keywordTags(why);

  const reflectiveByMood: Record<MoodKey, string> = {
    Calm: 'Take a moment to notice what helped you feel steady today. Then do one small action that keeps that calm going.',
    Energetic:
      'Your energy can be a superpower. Channel it into something meaningful (even if it is small) to avoid burning out later.',
    Anxious:
      'Anxiety often signals that something feels uncertain. Try grounding first, then name the one thing you can do next.',
    Thoughtful:
      'Being thoughtful is a strength. Notice patterns in what is on your mind, and choose one gentle step forward.',
  };

  const focusPool: Record<string, Suggestion[]> = {
    breathing: [
      { title: 'Breathing Reset', desc: 'Inhale 4, hold 2, exhale 6. Repeat 3 times.', chip: 'Sanctuary' },
      { title: 'Body Scan', desc: 'Relax your jaw, shoulders, and hands for 60 seconds.', chip: 'Focus' },
    ],
    sleep: [
      { title: 'Sleep Wind-Down', desc: 'Dim lights + avoid screens 20 minutes before bed.', chip: 'Focus' },
      { title: 'Comfort Routine', desc: 'Pick one soothing habit you can do nightly.', chip: 'Sanctuary' },
    ],
    pressure: [
      { title: 'One-Task Plan', desc: 'Write the smallest next step for your biggest task.', chip: 'Focus' },
      { title: 'Time Bound', desc: 'Set a 15-minute timer. Stop when it ends.', chip: 'Insights' },
    ],
    anxiety: [
      { title: 'Grounding 5-4-3-2-1', desc: 'Name 5 things you see, 4 you feel, etc.', chip: 'Sanctuary' },
      { title: 'Worry Container', desc: 'Write the worry. Then write one realistic response.', chip: 'Insights' },
    ],
    stress: [
      { title: 'Stress Release', desc: 'Try a quick stretch or walk for 5 minutes.', chip: 'Sanctuary' },
      { title: 'Gentle Boundaries', desc: 'Choose one thing you will say "not now" to.', chip: 'Insights' },
    ],
    social: [
      { title: 'Reach Out', desc: 'Send one message to someone safe. Keep it short.', chip: 'Focus' },
      { title: 'Connection Check', desc: 'What kind of support do you need right now?', chip: 'Insights' },
    ],
    low: [
      { title: 'Small Light', desc: 'Pick one tiny thing that makes tomorrow slightly easier.', chip: 'Focus' },
      { title: 'Self-Compassion', desc: 'Talk to yourself like you would to a friend.', chip: 'Sanctuary' },
    ],
    anger: [
      { title: 'Pause Button', desc: 'Before reacting, take 3 slow breaths.', chip: 'Focus' },
      { title: 'Name the Need', desc: 'Anger often protects something important. What is it?', chip: 'Insights' },
    ],
    positive: [
      { title: 'Lock It In', desc: 'Write what went well so you can repeat it later.', chip: 'Insights' },
      { title: 'Gratitude Ripple', desc: 'Share a kind thought with someone today.', chip: 'Sanctuary' },
    ],
  };

  // Decide which pools to use.
  const chosenKeys = new Set<string>();
  if (!why.trim()) {
    chosenKeys.add('breathing');
  }

  for (const t of tags) {
    if (t === 'sleep') chosenKeys.add('sleep');
    if (t === 'pressure') chosenKeys.add('pressure');
    if (t === 'social') chosenKeys.add('social');
    if (t === 'anxiety') chosenKeys.add('anxiety');
    if (t === 'stress') chosenKeys.add('stress');
    if (t === 'low') chosenKeys.add('low');
    if (t === 'anger') chosenKeys.add('anger');
    if (t === 'positive') chosenKeys.add('positive');
  }

  // Mood fallback
  if (mood === 'Calm') chosenKeys.add('breathing');
  if (mood === 'Energetic') chosenKeys.add('pressure');
  if (mood === 'Anxious') chosenKeys.add('anxiety');
  if (mood === 'Thoughtful') chosenKeys.add('sleep');

  const suggestionList: Suggestion[] = [];
  for (const k of chosenKeys) {
    const bucket =
      focusPool[k === 'breathing' ? 'breathing' : k] || focusPool['breathing'];
    suggestionList.push(...bucket.slice(0, 2));
  }

  // De-dupe by title and return top 3
  const seen = new Set<string>();
  const unique = suggestionList.filter(s => {
    if (seen.has(s.title)) return false;
    seen.add(s.title);
    return true;
  });

  return {
    reflectiveTip: reflectiveByMood[mood],
    suggestions: unique.slice(0, 3),
  };
}

const CheckInPageNew: React.FC = () => {
  const navigate = useNavigate();
  const { addCheckIn } = useCheckIn();

  const [mood, setMood] = useState<MoodKey | null>(null);
  const [why, setWhy] = useState('');
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'SANCTUARY' | 'FOCUS' | 'INSIGHTS' | 'PROFILE'>('INSIGHTS');

  const selectedTheme = useMemo(() => {
    return MOODS.find(m => m.key === mood) || null;
  }, [mood]);

  const derived = useMemo(() => {
    if (!mood) return null;
    return deriveSuggestions(mood, why);
  }, [mood, why]);

  const handleSave = () => {
    if (!mood) return;

    const theme = MOODS.find(m => m.key === mood)!;
    addCheckIn({
      mood: theme.value,
      energy: theme.energy,
      social: 3,
      stress: theme.stress,
      journal: why.trim(),
    });

    setSaved(true);
    setActiveTab('INSIGHTS');
  };

  return (
    <Layout>
      <div
        className="w-full min-h-[calc(100vh-80px)] pb-24"
        style={{
          backgroundColor: PALETTE.pageBg,
        }}
      >
        <div className="max-w-md mx-auto px-4 pt-6">
          {!saved && !mood && (
            <>
              <div className="text-2xl font-bold" style={{ color: PALETTE.neutralBlack }}>
                How are you feeling, <span style={{ color: PALETTE.primaryGreen }}>Alex?</span>
              </div>
              <p className="mt-2 text-sm text-[#374151]">
                Take a moment to check in with yourself.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-4">
                {MOODS.map(m => {
                  return (
                    <button
                      key={m.key}
                      onClick={() => setMood(m.key)}
                      style={{
                        background: m.cardBg,
                        border: `1px solid rgba(0,0,0,0.06)`,
                        borderRadius: 14,
                        padding: 18,
                        textAlign: 'center',
                        cursor: 'pointer',
                        color: m.neutral,
                      }}
                      aria-label={`Select mood: ${m.label}`}
                    >
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{m.label}</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {!saved && mood && (
            <>
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm font-semibold text-[#374151]">Selected</div>
                <button
                  onClick={() => {
                    setMood(null);
                    setWhy('');
                  }}
                  className="text-sm underline text-[#6B7280]"
                >
                  Change
                </button>
              </div>

              <div className="mt-3 text-2xl font-bold" style={{ color: selectedTheme?.heading }}>
                {mood === 'Anxious' ? 'Anxious' : mood}
              </div>

              <div className="mt-3">
                <div className="font-semibold text-[#111827]">Why do you feel this way?</div>
                <textarea
                  value={why}
                  onChange={e => setWhy(e.target.value)}
                  placeholder="Write down your thoughts."
                  className="mt-2 w-full h-24 rounded-xl border border-[#E5E7EB] px-4 py-3 bg-white/80"
                />
                <div className="flex justify-end mt-1 text-xs text-[#9CA3AF]">Optional</div>
              </div>

              <button
                onClick={handleSave}
                style={{
                  marginTop: 22,
                  width: '100%',
                  background: selectedTheme?.buttonBg,
                  color: selectedTheme?.buttonText,
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Save Entry
              </button>

              <button
                onClick={() => {
                  navigate('/');
                }}
                className="mt-3 text-center w-full text-sm text-[#6B7280]"
              >
                Maybe later
              </button>
            </>
          )}

          {saved && mood && derived && (
            <>
              <div className="mt-6 text-2xl font-bold text-[#111827]">Reflective Tip</div>

              <div
                className="mt-4 w-full h-28 rounded-2xl"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${
                    selectedTheme?.selectedBorder
                  } 0%, ${PALETTE.tertiaryYellow} 100%)`,
                }}
              />

              <p className="mt-3 text-sm text-[#374151]">{derived.reflectiveTip}</p>

              <div className="mt-6">
                <div className="text-xs font-bold tracking-wide text-[#6B7280] uppercase">
                  Suggested for you
                </div>
                <div className="mt-3 space-y-3">
                  {derived.suggestions.map(s => (
                    <div
                      key={s.title}
                      className="rounded-2xl bg-white/80 border border-[#E5E7EB] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-[#111827]">{s.title}</div>
                        <div
                          className="text-xs font-semibold rounded-full px-3 py-1"
                          style={{
                            background: selectedTheme?.cardBg,
                            color: PALETTE.neutralBlack,
                          }}
                        >
                          {s.chip}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-[#4B5563]">{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom tabs (like your screenshot) */}
        {saved && mood && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
            <div className="flex items-center justify-around max-w-md mx-auto px-2 py-2">
              {(['SANCTUARY', 'FOCUS', 'INSIGHTS', 'PROFILE'] as const).map(t => {
                const active = t === activeTab;
                return (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className="flex flex-col items-center gap-1"
                    style={{
                      color: active ? selectedTheme?.selectedBorder : '#6B7280',
                      fontWeight: active ? 800 : 600,
                      fontSize: 10,
                      letterSpacing: 0.3,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 10 }}>{t}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CheckInPageNew;

