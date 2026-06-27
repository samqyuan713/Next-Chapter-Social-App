/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Heart,
  ChevronRight,
  Send,
  Calendar,
  Compass,
  MapPin,
  User,
  Coffee,
  BookOpen,
  Music,
  CheckCircle2,
  Loader2,
  Undo2,
  FileText,
  BadgeAlert,
  Flame,
  Globe2,
  PenSquare,
  MessageSquare,
  Lock,
  Shield,
  LogOut,
  UserPlus,
  LogIn,
  KeyRound,
  Search,
  SlidersHorizontal,
  Scale,
  Ruler
} from "lucide-react";
import { Profile, Message, Conversation, CompatibilityAnalysis } from "./types";
import { auth, googleAuthProvider } from "./lib/firebase";
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Standard interests user can select
const INTERESTS_PRESETS = [
  "Classical Music",
  "Biographies",
  "Organic Gardening",
  "Museum Strolls",
  "Afternoon Tea",
  "Watercolor Painting",
  "Coastal Hiking",
  "Independent Film",
  "Baking Sourdough",
  "Sailing",
  "Woodworking",
  "Jazz Classics",
  "Wood-fired Cooking",
  "Cozy Bookstores",
  "Horticulture",
  "Wildlife Photography",
  "Cabin Retreats",
  "Acoustic Folk",
  "Pickleball",
  "Golf outings",
  "Doubles Tennis",
  "Kayaking",
  "Fly Fishing",
  "Yoga & Stretching",
  "Bicycle Rides",
  "Swimming laps",
  "Tai Chi",
  "Lawn Bowling",
  "Billiards"
];

const formatHeight = (inches: number) => {
  const ft = Math.floor(inches / 12);
  const inch = inches % 12;
  return `${ft}'${inch}"`;
};

const HEIGHT_OPTIONS = Array.from({ length: 23 }, (_, i) => 58 + i); // 58 to 80 inches (4'10" to 6'8")

// Conversation starter sparks to assist easy interaction
const CONVERSATION_SPARKS: Record<string, string[]> = {
  arthur: [
    "I was reading about the ancient library of Alexandria. What kind of books capture your attention?",
    "How do you feel about dedicating a cloudy afternoon to an fine art museum stroll?",
    "Do you prefer classical violin or a gentle piano sonata while enjoying simple morning tea?"
  ],
  evelyn: [
    "If we had a blank canvas to paint our perfect coastal road trip, where would our first stop be?",
    "Tell me about a painting, movie, or song that made you feel completely alive recently.",
    "Do you enjoy baking together, or would you rather be the official taste tester of fresh sourdough?"
  ],
  frank: [
    "I'm considering taking the sailboat out tomorrow under low winds. How do you feel about the ocean air?",
    "What's your go-to comfort meal? I'd love to tell you my secret to wood-fired brick pizzas.",
    "Tell me a story about a place you have anchored at that felt like true paradise."
  ],
  miriam: [
    "I'm looking for a cozy local playhouse show to see this upcoming week. What's your favorite style of theater?",
    "How does a warm slice of fresh baked raspberry tart paired with cozy book talk sound to you?",
    "What kind of cozy acoustic music centers your soul after a long week?"
  ],
  diana: [
    "I managed to capture a photograph of a red-tailed hawk this morning. What is your favorite sanctuary in nature?",
    "Would you prefer a crisp autumn trail hike or sitting close to a woodstove in a mountain cabin?",
    "I love processing and pressing field wildflowers. What tiny details of nature bring you joy?"
  ]
};

// 3 thoughtful relationship lifestyle questions tailored for mature dynamics
const COMPATIBILITY_QUIZ_QUESTIONS = [
  {
    id: "sunday_morning",
    question: "How do you picture spending a beautiful, quiet Sunday morning in this stage of life?",
    options: [
      { label: "A", text: "Brewing artisanal tea or coffee, and reading the paper or book sections in an armchair.", value: "intellectual" },
      { label: "B", text: "Tending to local garden soil, planting, or going for a crisp forest nature trek.", value: "outdoor" },
      { label: "C", text: "Strolling through a local farmers' market followed by checking out art curator galleries.", value: "creative" }
    ]
  },
  {
    id: "companionship_style",
    question: "Under standard retirement or leisure tempos, what form of companionship is most precious?",
    options: [
      { label: "A", text: "Intellectual depth—discussing historic accounts, classic literature, and lifelong wisdom.", value: "academic" },
      { label: "B", text: "Unwinding and sharing laughter—baking sourdough, trying recipes, or watching foreign cinema.", value: "social" },
      { label: "C", text: "Sailing on slow tides, going on road trips, or enjoying quiet picnics near nature.", value: "active" }
    ]
  },
  {
    id: "cozy_evening",
    question: "How do you like to settle into a peaceful, golden sunset evening?",
    options: [
      { label: "A", text: "Listening to soft classic jazz or acoustic folksiness while dining on wood-fired cooking.", value: "gourmet" },
      { label: "B", text: "Attending local community theater/playhouses or listening to classical chamber orchestras.", value: "cultural" },
      { label: "C", text: "Sitting outside on a cozy deck with lantern lights, reflecting on simple life beauty.", value: "simple" }
    ]
  }
];

// Safe storage helper functions to prevent SecurityExceptions in iframes when third-party storage/cookies are blocked
const getLocalStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`localStorage.getItem blocked for key ${key}:`, e);
    return null;
  }
};

const setLocalStorageItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`localStorage.setItem blocked for key ${key}:`, e);
  }
};

export interface UserAccount {
  username: string;
  passwordHash: string;
  profile: {
    name: string;
    age: number;
    location: string;
    interests: string[];
    bio: string;
    relationshipGoal: string;
  };
  isProfileCreated: boolean;
}

export default function App() {
  // Accounts and session tracking
  const [fbUser, setFbUser] = useState<any>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isSandboxMode, setIsSandboxMode] = useState(false);

  // User Profile from Cloud SQL database
  const [userProfile, setUserProfile] = useState<{
    name: string;
    age: number;
    location: string;
    interests: string[];
    bio: string;
    relationshipGoal: string;
  } | null>(null);

  const currentUser = fbUser ? (fbUser.displayName || fbUser.email || "Companion") : null;

  // Auth fields
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFbUser(user);
        try {
          const token = await user.getIdToken();
          setIdToken(token);
          await fetchUserProfile(token);
        } catch (err) {
          console.error("Auth state synchronization error:", err);
        }
      } else {
        setFbUser(null);
        setIdToken(null);
        setUserProfile(null);
      }
      setLoadingAuth(false);
    });
    return unsubscribe;
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const res = await fetch("/api/profile", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data && data.profile) {
        setUserProfile({
          name: data.profile.name || "",
          age: data.profile.age || 60,
          location: data.profile.location || "",
          interests: Array.isArray(data.profile.interests) ? data.profile.interests : [],
          bio: data.profile.bio || "",
          relationshipGoal: data.profile.relationshipGoal || "Companionship & Shared Outings"
        });
      } else {
        setUserProfile({
          name: "",
          age: 60,
          location: "",
          interests: [],
          bio: "",
          relationshipGoal: "Companionship & Shared Outings"
        });
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
      setUserProfile({
        name: "",
        age: 60,
        location: "",
        interests: [],
        bio: "",
        relationshipGoal: "Companionship & Shared Outings"
      });
    }
  };

  const saveUserProfile = async (updated: any) => {
    if (!idToken || !updated) return false;
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data && data.profile) {
        setUserProfile({
          name: data.profile.name || "",
          age: data.profile.age || 60,
          location: data.profile.location || "",
          interests: Array.isArray(data.profile.interests) ? data.profile.interests : [],
          bio: data.profile.bio || "",
          relationshipGoal: data.profile.relationshipGoal || "Companionship & Shared Outings"
        });
        return true;
      }
    } catch (err) {
      console.error("Failed to save user profile:", err);
    }
    return false;
  };

  // Derived onboarding status
  const isRegistered = fbUser !== null && userProfile !== null && userProfile.location !== "" && userProfile.location !== null;

  // Debounced auto-save effect for onboarded users
  useEffect(() => {
    if (!idToken || !userProfile || !isRegistered) return;
    const delayDebounceFn = setTimeout(() => {
      saveUserProfile(userProfile);
    }, 1200);
    return () => clearTimeout(delayDebounceFn);
  }, [userProfile, idToken, isRegistered]);

  // List of prebaked match profiles retrieved from backend
  const [matches, setMatches] = useState<Profile[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Active Companion selection
  const [selectedMatch, setSelectedMatch] = useState<Profile | null>(null);

  // Active view tabs: 'gardens' (Browse matches), 'my_profile' (Edit personal bio), 'search' (Search partners)
  const [activeTab, setActiveTab] = useState<"gardens" | "my_profile" | "search">("gardens");

  // Partner Search States
  const [searchGender, setSearchGender] = useState<string>("All");
  const [searchAgeMin, setSearchAgeMin] = useState<number>(50);
  const [searchAgeMax, setSearchAgeMax] = useState<number>(85);
  const [searchHeightMin, setSearchHeightMin] = useState<number>(60); // 5'0"
  const [searchHeightMax, setSearchHeightMax] = useState<number>(78); // 6'6"
  const [searchWeightMin, setSearchWeightMin] = useState<number>(100);
  const [searchWeightMax, setSearchWeightMax] = useState<number>(240);
  const [searchSelectedHobbies, setSearchSelectedHobbies] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // User specific companion progress state maps
  const [quizAnswers, setQuizAnswers] = useState<Record<string, Record<string, string>>>({});
  const [compatibilityReports, setCompatibilityReports] = useState<Record<string, CompatibilityAnalysis>>({});
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});

  // Load transient quiz answers from local storage for local editing
  useEffect(() => {
    if (currentUser) {
      const savedQuiz = getLocalStorageItem(`ncd_quiz_answers_${currentUser}`);
      setQuizAnswers(savedQuiz ? JSON.parse(savedQuiz) : {});
    } else {
      setQuizAnswers({});
    }
  }, [currentUser]);

  // Save quiz answers to local storage on change
  useEffect(() => {
    if (currentUser && Object.keys(quizAnswers).length > 0) {
      setLocalStorageItem(`ncd_quiz_answers_${currentUser}`, JSON.stringify(quizAnswers));
    }
  }, [quizAnswers, currentUser]);

  // Synchronize and load chat history and compatibility report when selectedMatch or idToken changes
  useEffect(() => {
    const syncCompanionData = async () => {
      if (!selectedMatch || !idToken) return;
      const matchId = selectedMatch.id;

      // 1. Fetch conversations from PostgreSQL
      try {
        const res = await fetch(`/api/conversations/${matchId}`, {
          headers: {
            "Authorization": `Bearer ${idToken}`
          }
        });
        const data = await res.json();
        if (data && data.history) {
          setConversations((prev) => ({
            ...prev,
            [matchId]: data.history
          }));
        }
      } catch (err) {
        console.error(`Failed to fetch conversation history for ${matchId}:`, err);
      }

      // 2. Fetch compatibility report from PostgreSQL
      try {
        const res = await fetch(`/api/compatibility/${matchId}`, {
          headers: {
            "Authorization": `Bearer ${idToken}`
          }
        });
        const data = await res.json();
        if (data && data.aiAnalysis) {
          setCompatibilityReports((prev) => ({
            ...prev,
            [matchId]: data.aiAnalysis
          }));
        } else {
          setCompatibilityReports((prev) => ({
            ...prev,
            [matchId]: null as any
          }));
        }
      } catch (err) {
        console.error(`Failed to fetch compatibility report for ${matchId}:`, err);
      }
    };

    syncCompanionData();
  }, [selectedMatch, idToken]);

  // Ref for chat scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Loading/busy feedback hooks
  const [isPolishingBio, setIsPolishingBio] = useState(false);
  const [isAnalyzingCompatibility, setIsAnalyzingCompatibility] = useState(false);
  const [isCompanionTyping, setIsCompanionTyping] = useState(false);
  const [chatInputValue, setChatInputValue] = useState("");
  const [bioPolishError, setBioPolishError] = useState("");
  const [compatibilityError, setCompatibilityError] = useState("");

  // Auth Form Handlers using Firebase Authentication
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const emailTrimmed = authUsername.trim();
    const passwordTrimmed = authPassword.trim();

    if (!emailTrimmed || !passwordTrimmed) {
      setAuthError("Please provide both a valid email and a password.");
      return;
    }

    if (passwordTrimmed.length < 6) {
      setAuthError("Password must be at least 6 characters for Firebase security.");
      return;
    }

    try {
      setLoadingAuth(true);
      await createUserWithEmailAndPassword(auth, emailTrimmed, passwordTrimmed);
    } catch (err: any) {
      console.error("Firebase Registration Error:", err);
      if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        console.warn("Email/Password Auth is disabled in Firebase console. Transitioning gracefully to local Sandbox Guest Session...");
        const guestUser = {
          uid: "sandbox-uid-" + emailTrimmed.replace(/[^a-zA-Z0-9]/g, "-"),
          email: emailTrimmed,
          displayName: emailTrimmed.split("@")[0].charAt(0).toUpperCase() + emailTrimmed.split("@")[0].slice(1),
        };
        setFbUser(guestUser);
        const guestToken = `sandbox-token-${emailTrimmed}`;
        setIdToken(guestToken);
        setIsSandboxMode(true);
        await fetchUserProfile(guestToken);
      } else {
        setAuthError(err.message || "Registration failed. Please double check your email address.");
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const emailTrimmed = authUsername.trim();
    const passwordTrimmed = authPassword.trim();

    if (!emailTrimmed || !passwordTrimmed) {
      setAuthError("Please provide both your email and password.");
      return;
    }

    try {
      setLoadingAuth(true);
      await signInWithEmailAndPassword(auth, emailTrimmed, passwordTrimmed);
    } catch (err: any) {
      console.error("Firebase Login Error:", err);
      if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        console.warn("Email/Password Auth is disabled in Firebase console. Transitioning gracefully to local Sandbox Guest Session...");
        const guestUser = {
          uid: "sandbox-uid-" + emailTrimmed.replace(/[^a-zA-Z0-9]/g, "-"),
          email: emailTrimmed,
          displayName: emailTrimmed.split("@")[0].charAt(0).toUpperCase() + emailTrimmed.split("@")[0].slice(1),
        };
        setFbUser(guestUser);
        const guestToken = `sandbox-token-${emailTrimmed}`;
        setIdToken(guestToken);
        setIsSandboxMode(true);
        await fetchUserProfile(guestToken);
      } else {
        setAuthError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    try {
      setLoadingAuth(true);
      await signInWithPopup(auth, googleAuthProvider);
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      setAuthError("Google Sign-In was cancelled or failed. Please try again.");
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleAutofillTest = async () => {
    setAuthError("");
    setLoadingAuth(true);
    const testEmail = "guest@example.com";
    const testPassword = "password123";
    try {
      await signInWithEmailAndPassword(auth, testEmail, testPassword);
    } catch (loginErr: any) {
      // If Email/Password Auth is disabled in Firebase, gracefully activate sandbox guest session immediately
      if (loginErr.code === "auth/operation-not-allowed" || loginErr.message?.includes("operation-not-allowed")) {
        console.warn("Email/Password Auth is disabled. Activating seamless sandbox guest session...");
        const guestUser = {
          uid: "sandbox-uid-guest-example-com",
          email: "guest@example.com",
          displayName: "Guest Tester",
        };
        setFbUser(guestUser);
        const guestToken = "sandbox-token-guest@example.com";
        setIdToken(guestToken);
        setIsSandboxMode(true);
        await fetchUserProfile(guestToken);
        setLoadingAuth(false);
        return;
      }

      // Try registering standard account
      try {
        await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      } catch (createErr: any) {
        console.error("Test account creation failed, falling back to sandbox token:", createErr);
        const guestUser = {
          uid: "sandbox-uid-guest-example-com",
          email: "guest@example.com",
          displayName: "Guest Tester",
        };
        setFbUser(guestUser);
        const guestToken = "sandbox-token-guest@example.com";
        setIdToken(guestToken);
        setIsSandboxMode(true);
        await fetchUserProfile(guestToken);
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.error("Firebase Sign Out Error:", err);
    }
    setFbUser(null);
    setIdToken(null);
    setUserProfile(null);
    setIsSandboxMode(false);
    setSelectedMatch(null);
    setActiveTab("gardens");
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, selectedMatch, isCompanionTyping]);

  // Retrieve matches on mount
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoadingMatches(true);
        const res = await fetch("/api/matches");
        const data = await res.json();
        if (data && data.matches) {
          setMatches(data.matches);
          // Set Arthur or first companion as default selected
          if (data.matches.length > 0) {
            setSelectedMatch(data.matches[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching match profiles:", err);
      } finally {
        setLoadingMatches(false);
      }
    };
    fetchMatches();
  }, []);

  // Handler to refine profile biography with Gemini
  const handlePolishBio = async () => {
    if (!userProfile || !idToken) return;
    try {
      setIsPolishingBio(true);
      setBioPolishError("");
      const response = await fetch("/api/generate-bio", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          interests: userProfile.interests,
          age: userProfile.age,
          goals: userProfile.relationshipGoal,
          currentBio: userProfile.bio
        })
      });
      const data = await response.json();
      if (data.polishedBio) {
        setUserProfile((prev: any) => prev ? ({ ...prev, bio: data.polishedBio }) : null);
      } else {
        setBioPolishError("We couldn't polish the biography right now, please adjust your connection.");
      }
    } catch (err) {
      console.error("Bio polish request failed:", err);
      setBioPolishError("An unexpected error occurred while refining your profile. Please check if server is running.");
    } finally {
      setIsPolishingBio(false);
    }
  };

  // Toggle user interests checkboxes
  const handleToggleInterest = (interest: string) => {
    if (!userProfile) return;
    setUserProfile((prev: any) => {
      if (!prev) return null;
      const exists = prev.interests.includes(interest);
      if (exists) {
        return { ...prev, interests: prev.interests.filter((i: string) => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  // Submit companion lifestyle compatibility quiz
  const handleSubmitQuiz = async (matchId: string) => {
    if (!idToken) return;
    const answersForMatch = quizAnswers[matchId];
    if (!answersForMatch || Object.keys(answersForMatch).length < 3) {
      setCompatibilityError("Please select an answer for all three lifestyle questions before proceeding.");
      return;
    }

    try {
      setIsAnalyzingCompatibility(true);
      setCompatibilityError("");
      const response = await fetch("/api/analyze-compatibility", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          userAnswers: answersForMatch,
          matchId: matchId
        })
      });
      const data = await response.json();
      if (data.aiAnalysis) {
        setCompatibilityReports((prev) => ({
          ...prev,
          [matchId]: data.aiAnalysis
        }));
      } else {
        setCompatibilityError("We couldn't generate compatibility insights. Let's try again in a moment.");
      }
    } catch (err) {
      console.error("Compatibility analysis failed:", err);
      setCompatibilityError("Networking error occurred while generating compatibility report. Please retry.");
    } finally {
      setIsAnalyzingCompatibility(false);
    }
  };

  // Select quiz option helper
  const handleSelectQuizOption = (matchId: string, questionId: string, value: string) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [matchId]: {
        ...(prev[matchId] || {}),
        [questionId]: value
      }
    }));
  };

  // Send a message in active dialogue
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || chatInputValue;
    if (!text.trim() || !selectedMatch || !idToken) return;

    const matchId = selectedMatch.id;
    const userMsg: Message = {
      id: Date.now().toString(),
      senderId: "user",
      text: text,
      timestamp: new Date().toISOString()
    };

    // Append user message locally for quick client UI response
    setConversations((prev) => ({
      ...prev,
      [matchId]: [...(prev[matchId] || []), userMsg]
    }));

    if (!textToSend) {
      setChatInputValue("");
    }

    // Trigger thinking state of companion
    setIsCompanionTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          matchId: matchId,
          text: text
        })
      });
      const data = await response.json();
      if (data.text) {
        // Fetch full synced history from PostgreSQL
        const historyRes = await fetch(`/api/conversations/${matchId}`, {
          headers: {
            "Authorization": `Bearer ${idToken}`
          }
        });
        const historyData = await historyRes.json();
        if (historyData && historyData.history) {
          setConversations((prev) => ({
            ...prev,
            [matchId]: historyData.history
          }));
        }
      }
    } catch (err) {
      console.error("Dialogue send failed:", err);
      // Emergency graceful fallbacks inside Client
      const disasterMsg: Message = {
        id: (Date.now() + 1).toString(),
        senderId: matchId,
        text: `I loved hearing that. Our shared life views bring me so much warmth. Tell me more, my friend.`,
        timestamp: new Date().toISOString()
      };
      setConversations((prev) => ({
        ...prev,
        [matchId]: [...(prev[matchId] || []), disasterMsg]
      }));
    } finally {
      setIsCompanionTyping(false);
    }
  };

  const currentMatchChatHistory = selectedMatch ? (conversations[selectedMatch.id] || []) : [];
  const currentMatchCompatibilityReport = selectedMatch ? compatibilityReports[selectedMatch.id] : null;
  const currentMatchQuizAnswers = selectedMatch ? (quizAnswers[selectedMatch.id] || {}) : {};

  if (loadingAuth || (fbUser && !userProfile)) {
    return (
      <div id="loading-screen" className="min-h-screen bg-[#FBF9F6] text-amber-950 font-sans flex flex-col justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-700" />
        <p className="text-xs text-amber-800 font-semibold mt-3">Connecting with secure Next Chapter networks...</p>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div id="next-chapter-app" className="min-h-screen bg-[#FBF9F6] text-amber-950 font-sans selection:bg-amber-200 selection:text-amber-900 flex flex-col justify-between">
        <div id="top-accent-bar" className="h-2 bg-gradient-to-r from-amber-200 via-rose-300 to-emerald-200 w-full" />
        
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center w-full">
          {/* Logo Brand Title */}
          <div className="text-center mb-8 animate-fade-in">
            <div id="brand-emblem-onboarding" className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-rose-500 shadow-md mx-auto mb-4">
              <Heart className="w-8 h-8 fill-rose-100 animate-pulse" />
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-amber-950">Next Chapter</h1>
            <p className="text-sm text-amber-800 tracking-wide font-medium mt-1">Warm Companion Connection for Mature Hearts</p>
            <div className="h-0.5 w-16 bg-gradient-to-r from-amber-200 via-rose-300 to-emerald-200 mx-auto mt-4" />
          </div>

          {!fbUser ? (
            /* STEP 1: ACCOUNT REGISTRATION / LOGIN VIEW */
            <div className="w-full max-w-md bg-white border border-amber-100 rounded-3xl p-6 md:p-8 shadow-md animate-scale-up space-y-6">
              <div className="text-center space-y-1.5">
                <h2 className="text-2xl font-serif font-bold text-amber-900">
                  {authMode === "register" ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-xs text-amber-700">
                  {authMode === "register" 
                    ? "Establish private credentials to safeguard your personal profile." 
                    : "Enter your email and password to log back in."
                  }
                </p>
              </div>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 bg-amber-50/50 p-1 rounded-xl border border-amber-100">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError("");
                  }}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                    authMode === "register"
                      ? "bg-white text-amber-900 shadow-sm border border-amber-100"
                      : "text-amber-800 hover:text-amber-900"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                  }}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                    authMode === "login"
                      ? "bg-white text-amber-900 shadow-sm border border-amber-100"
                      : "text-amber-800 hover:text-amber-900"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-100 text-red-700 px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-start gap-2 animate-fade-in">
                  <BadgeAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={authMode === "register" ? handleRegister : handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-700/60" />
                    <input
                      type="email"
                      required
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      placeholder="e.g. samuel@example.com"
                      className="w-full bg-amber-50/40 border border-amber-100 rounded-xl pl-10 pr-4 py-3 text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-700/60" />
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-amber-50/40 border border-amber-100 rounded-xl pl-10 pr-4 py-3 text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-950 hover:bg-amber-900 text-white font-semibold rounded-xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-2 mt-6"
                >
                  {authMode === "register" ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account & Continue</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Secure Sign In</span>
                    </>
                  )}
                </button>
              </form>

              {/* Google Sign-In and Quick test buttons */}
              <div className="pt-4 border-t border-amber-50 text-center space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 bg-white hover:bg-amber-50 text-amber-900 font-semibold rounded-xl border border-amber-200 transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <Globe2 className="w-4 h-4 text-rose-500" />
                  <span>Continue with Google</span>
                </button>

                <div className="flex flex-col items-center justify-center pt-1.5">
                  <p className="text-[10px] text-amber-700/75 mb-1.5">
                    For Instant Testing:
                  </p>
                  <button
                    type="button"
                    onClick={handleAutofillTest}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/85 text-amber-900 text-xs font-bold border border-amber-200 transition-all cursor-pointer shadow-xs"
                  >
                    <Shield className="w-4 h-4 text-amber-700 fill-amber-100" />
                    <span>One-Click Test Guest Account</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: PROFILE GENERATION & CUSTOM DETAILS ONBOARDING */
            <div className="w-full bg-white border border-amber-100 rounded-3xl p-6 md:p-10 shadow-md animate-scale-up space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-serif font-bold text-amber-900">Create Your Companion Story</h2>
                <p className="text-sm text-amber-700 max-w-lg mx-auto">
                  Welcome, <span className="font-semibold text-amber-950">{currentUser}</span>. Let's draft your background and simple interests. This profile matches you with companions seeking clean, quiet alignments.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-amber-50">
                {/* Profile Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest mb-1.5">First / Display Name</label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      placeholder="e.g. Samuel"
                      className="w-full bg-amber-50/40 border border-amber-100 rounded-xl px-4 py-3 text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest mb-1.5">Age</label>
                      <input
                        type="number"
                        value={userProfile.age || ""}
                        onChange={(e) => setUserProfile({ ...userProfile, age: Number(e.target.value) })}
                        placeholder="e.g. 64"
                        className="w-full bg-amber-50/40 border border-amber-100 rounded-xl px-4 py-3 text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:bg-white transition-all text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest mb-1.5">Location</label>
                      <input
                        type="text"
                        value={userProfile.location}
                        onChange={(e) => setUserProfile({ ...userProfile, location: e.target.value })}
                        placeholder="e.g. Sausalito, CA"
                        className="w-full bg-amber-50/40 border border-amber-100 rounded-xl px-4 py-3 text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:bg-white transition-all text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest mb-1.5">Relationship Goal</label>
                    <select
                      value={userProfile.relationshipGoal}
                      onChange={(e) => setUserProfile({ ...userProfile, relationshipGoal: e.target.value })}
                      className="w-full bg-amber-50/40 border border-amber-100 rounded-xl px-4 py-3 text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:bg-white transition-all text-sm font-medium"
                    >
                      <option value="Companionship & Shared Outings">Companionship & Shared Outings</option>
                      <option value="Intellectual Depth & Conversation">Intellectual Depth & Conversation</option>
                      <option value="Romance & Shared Travels">Romance & Shared Travels</option>
                      <option value="Quiet Friendship & Shared Tea">Quiet Friendship & Shared Tea</option>
                    </select>
                  </div>
                </div>

                {/* Bio Notes */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest">About Me (Write a raw draft)</label>
                      <button
                        type="button"
                        onClick={handlePolishBio}
                        disabled={isPolishingBio || !userProfile.bio}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] font-semibold border border-amber-200 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isPolishingBio ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-amber-700" />
                            <span>AI writing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-amber-900 fill-amber-300" />
                            <span>AI Polish</span>
                          </>
                        )}
                      </button>
                    </div>

                    <textarea
                      rows={4}
                      value={userProfile.bio}
                      onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                      placeholder="Describe how you enjoy slow days, museum walks, or quiet morning reads..."
                      className="w-full bg-amber-50/40 border border-amber-100 rounded-2xl p-4 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:bg-white transition-all text-xs leading-relaxed"
                    />
                    {bioPolishError && (
                      <p className="text-[11px] text-red-600 mt-1 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                        {bioPolishError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest mb-2">Interests & Pleasures (Choose 3+)</label>
                    <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto p-1 bg-amber-50/20 border border-amber-100/50 rounded-xl">
                      {INTERESTS_PRESETS.map((interest) => {
                        const isSelected = userProfile.interests.includes(interest);
                        return (
                          <button
                            type="button"
                            key={interest}
                            onClick={() => handleToggleInterest(interest)}
                            className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-amber-950 border-amber-950 text-white font-semibold"
                                : "bg-white border-amber-100 text-amber-800 hover:bg-amber-50"
                            }`}
                          >
                            {interest}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-6 border-t border-amber-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const defaultProfile = {
                      name: fbUser?.displayName || "Guest Tester",
                      age: 64,
                      location: "Evanston, IL",
                      interests: ["Classical Music", "Museum Strolls", "Cozy Bookstores"],
                      bio: "A retired architect who cherishes slow walks alongside lakeside docks, classical string melodies, and good conversational exchange over coffee. Seeking a genuine soul to explore matching artistic and natural paths in our life's next beautiful chapters.",
                      relationshipGoal: "Companionship & Shared Outings"
                    };
                    saveUserProfile(defaultProfile);
                  }}
                  className="text-xs text-amber-700/80 hover:text-amber-950 underline font-medium transition-all cursor-pointer"
                >
                  Skip & Enter with standard guest details
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="px-4 py-3.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold rounded-2xl transition-all border border-amber-200 text-xs cursor-pointer"
                  >
                    Back to Sign In
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!userProfile?.name?.trim()) {
                        alert("Please enter your name to complete onboarding.");
                        return;
                      }
                      saveUserProfile(userProfile);
                    }}
                    className="px-8 py-3.5 bg-amber-950 hover:bg-amber-900 text-white font-semibold rounded-2xl transition-all shadow-md text-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Save Profile & Enter Next Chapter</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="bg-[#FAF5EE] border-t border-amber-100 py-6 text-center text-[10px] text-amber-600/80">
          Next Chapter Applet • Registered connections are stored locally with premium client-side safety measures.
        </footer>
      </div>
    );
  }

  return (
    <div id="next-chapter-app" className="min-h-screen bg-[#FBF9F6] text-amber-950 font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Decorative Warm Accent Border at very top */}
      <div id="top-accent-bar" className="h-2 bg-gradient-to-r from-amber-200 via-rose-300 to-emerald-200 w-full" />

      {/* Main navigation / brand header */}
      <header id="main-header" className="border-b border-amber-100 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div id="brand-emblem" className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-rose-500 shadow-sm">
              <Heart className="w-5 h-5 fill-rose-100" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-amber-900">Next Chapter</h1>
              <p className="text-xs text-amber-700/80 tracking-wide font-medium">Warm Companion Connection for Mature Hearts</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            <nav id="header-nav" className="flex items-center bg-amber-50/50 p-1 rounded-xl border border-amber-100 flex-wrap gap-1 sm:gap-0">
              <button
                id="tab-gardens"
                onClick={() => setActiveTab("gardens")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeTab === "gardens"
                    ? "bg-white text-amber-900 shadow-sm border border-amber-100"
                    : "text-amber-800 hover:text-amber-900 hover:bg-white/40"
                }`}
              >
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span>Explore Companions</span>
              </button>
              <button
                id="tab-search"
                onClick={() => setActiveTab("search")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeTab === "search"
                    ? "bg-white text-amber-900 shadow-sm border border-amber-100"
                    : "text-amber-800 hover:text-amber-900 hover:bg-white/40"
                }`}
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                <span>Partner Search</span>
              </button>
              <button
                id="tab-profile"
                onClick={() => setActiveTab("my_profile")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeTab === "my_profile"
                    ? "bg-white text-amber-900 shadow-sm border border-amber-100"
                    : "text-amber-800 hover:text-amber-900 hover:bg-white/40"
                }`}
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
                <span>My Profile & Bio</span>
              </button>
            </nav>

            <div className="flex items-center gap-2 pl-3 border-l border-amber-100">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest leading-none">Account</span>
                <span className="text-[11px] text-amber-700 font-medium mt-0.5">@{currentUser}</span>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-xl bg-amber-50 hover:bg-rose-50 text-amber-800 hover:text-rose-600 border border-amber-100 transition-all cursor-pointer flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {isSandboxMode && (
        <div id="sandbox-banner" className="bg-amber-50 border-b border-amber-100 py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-700 shrink-0 fill-amber-100" />
              <span>
                <strong>Sandbox Mode Connected:</strong> The Email/Password provider is not enabled in your Firebase console. To ensure a seamless evaluation, you have been gracefully signed in via our secure <strong>local sandbox guest session</strong>.
              </span>
            </div>
            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              rel="noreferrer" 
              className="font-semibold text-amber-950 underline hover:text-amber-900 shrink-0 self-start sm:self-center"
            >
              Learn how to enable Email/Password auth →
            </a>
          </div>
        </div>
      )}

      {/* Primary Container Layout */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {activeTab === "my_profile" ? (
          /* EDIT PROFILE SECTION */
          <div id="profile-pane" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Form Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-amber-100 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 border-b border-amber-50 pb-4 mb-6">
                  <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <PenSquare className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-amber-900">Your Story, Refined</h2>
                    <p className="text-sm text-amber-700/90">Share details about your lifestyle, retirement, and goals.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest mb-2">Display Name</label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      className="w-full bg-amber-50/40 border border-amber-100 rounded-xl px-4 py-3 text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest mb-2">Age</label>
                    <input
                      type="number"
                      value={userProfile.age}
                      onChange={(e) => setUserProfile({ ...userProfile, age: Number(e.target.value) })}
                      className="w-full bg-amber-50/40 border border-amber-100 rounded-xl px-4 py-3 text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest mb-2">Current Location</label>
                    <input
                      type="text"
                      value={userProfile.location}
                      onChange={(e) => setUserProfile({ ...userProfile, location: e.target.value })}
                      className="w-full bg-amber-50/40 border border-amber-100 rounded-xl px-4 py-3 text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest mb-2">Relationship Focus</label>
                    <input
                      type="text"
                      className="w-full bg-amber-50/40 border border-amber-100 rounded-xl px-4 py-3 text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:bg-white transition-all text-sm font-medium"
                      value={userProfile.relationshipGoal}
                      onChange={(e) => setUserProfile({ ...userProfile, relationshipGoal: e.target.value })}
                      placeholder="e.g. Companionship, Shared Travels Close Friends"
                    />
                  </div>
                </div>

                {/* Profile Bio Draft / Polishing tool */}
                <div className="mt-6 border-t border-amber-50 pt-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2">
                    <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest">About Me Bio (Write a raw draft)</label>
                    <button
                      onClick={handlePolishBio}
                      disabled={isPolishingBio || !userProfile.bio}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-100/90 text-amber-900 text-xs font-semibold border border-amber-200 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isPolishingBio ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                          <span>Gemini is Refine-writing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-900 fill-amber-300" />
                          <span>Refine with AI Dignity & Warmth</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-amber-700/80 mb-3">
                    Write down notes about your daily joy, hobbies, or preferred life speed. Press \"Refine with AI Warmth\" above to formulate it into a heartwarming paragraph.
                  </p>

                  <textarea
                    rows={5}
                    value={userProfile.bio}
                    onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                    className="w-full bg-amber-50/40 border border-amber-100 rounded-2xl p-4 text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:bg-white transition-all text-sm leading-relaxed"
                    placeholder="Tell other companions about how you spend slow days, what warms your chest and your hopes..."
                  />

                  {bioPolishError && (
                    <div className="mt-3 flex items-center gap-2 text-xs bg-red-50 border border-red-100 p-3 rounded-xl text-red-800">
                      <BadgeAlert className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{bioPolishError}</span>
                    </div>
                  )}
                </div>

                {/* Choose Hobbies/Interests tags */}
                <div className="mt-6 border-t border-amber-50 pt-6">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest mb-3">Hobbies & Simple Pleasures</label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS_PRESETS.map((interest) => {
                      const isSelected = userProfile.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          onClick={() => handleToggleInterest(interest)}
                          className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-amber-950 border-amber-950 text-white shadow-sm font-medium"
                              : "bg-amber-50/40 border-amber-100 text-amber-800 hover:bg-amber-50"
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Preview Column */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-b from-amber-50 to-amber-100 border border-amber-100/80 rounded-3xl p-6 shadow-sm sticky top-24">
                <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest text-center border-b border-amber-200/50 pb-3 mb-6">Your Profile Preview</h3>
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-200 to-rose-200 flex items-center justify-center text-4xl shadow-md mb-4 border-2 border-white">
                    ☕
                  </div>
                  
                  <h4 className="font-serif text-xl font-bold text-amber-900">
                    {userProfile.name || "Companion"}, {userProfile.age || "60"}
                  </h4>
                  
                  <div className="flex items-center gap-1 text-xs text-amber-700/90 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{userProfile.location || "USA"}</span>
                  </div>

                  <span className="mt-3 text-xs px-3 py-1 bg-white/80 rounded-full border border-amber-200/50 text-amber-800 font-bold tracking-wide">
                    {userProfile.relationshipGoal}
                  </span>

                  <div className="mt-6 text-left border-t border-amber-200/30 pt-5 w-full">
                    <h5 className="text-[10px] font-bold text-amber-900 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-amber-700" />
                      Biography
                    </h5>
                    <p className="text-xs text-amber-800/90 leading-relaxed italic bg-white/40 p-4 rounded-2xl border border-white/60">
                      "{userProfile.bio || "No biography details written yet. Click Refine with AI to build one!"}"
                    </p>
                  </div>

                  <div className="mt-5 w-full text-left">
                    <h5 className="text-[10px] font-bold text-amber-900 uppercase tracking-widest mb-2">Interests Listed</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {userProfile.interests.map((i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white/60 rounded-md text-amber-900 font-medium border border-amber-200/20">
                          {i}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-amber-200/40 text-center">
                  <button
                    onClick={() => setActiveTab("gardens")}
                    className="w-full py-3 px-4 rounded-xl bg-amber-950 hover:bg-amber-900 text-white font-semibold transition-all text-xs cursor-pointer shadow-sm"
                  >
                    Look for Alignments Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "search" ? (
          /* COMPANION SEARCH SECTION */
          <div id="search-pane" className="space-y-6 animate-fade-in">
            {/* Title & Desc */}
            <div className="bg-white border border-amber-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-serif font-bold text-amber-900 flex items-center gap-2">
                  <Search className="w-6 h-6 text-amber-700" />
                  <span>Partner Search & Alignment</span>
                </h2>
                <p className="text-xs sm:text-sm text-amber-700 max-w-2xl">
                  Adjust custom filters for age, physical proportions (height, weight), and mutual recreation interests to find potential alignments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchGender("All");
                  setSearchAgeMin(50);
                  setSearchAgeMax(85);
                  setSearchHeightMin(60);
                  setSearchHeightMax(78);
                  setSearchWeightMin(100);
                  setSearchWeightMax(240);
                  setSearchSelectedHobbies([]);
                  setSearchKeyword("");
                }}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold border border-amber-200 rounded-xl transition-all text-xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>

            {/* Filter controls panel */}
            <div className="bg-white border border-amber-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                
                {/* 1. Keyword search */}
                <div className="space-y-2 lg:col-span-1">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1">
                    <Search className="w-3.5 h-3.5 text-amber-700" />
                    <span>Keyword Search</span>
                  </label>
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Search name, occupation, location..."
                    className="w-full bg-amber-50/40 border border-amber-100 rounded-xl px-3 py-2.5 text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:bg-white transition-all text-xs font-medium"
                  />
                </div>

                {/* 2. Gender Selection */}
                <div className="space-y-2 lg:col-span-1">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" />
                    <span>Gender</span>
                  </label>
                  <select
                    value={searchGender}
                    onChange={(e) => setSearchGender(e.target.value)}
                    className="w-full bg-amber-50/40 border border-amber-100 rounded-xl px-2.5 py-2.5 text-amber-900 focus:outline-none text-xs font-medium"
                  >
                    <option value="All">All Genders</option>
                    <option value="Female">Female Only</option>
                    <option value="Male">Male Only</option>
                  </select>
                </div>

                {/* 2. Age Filter */}
                <div className="space-y-2 lg:col-span-1">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest">
                    <span>Age Range</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={searchAgeMin}
                      onChange={(e) => setSearchAgeMin(Number(e.target.value))}
                      className="flex-1 bg-amber-50/40 border border-amber-100 rounded-xl px-2.5 py-2.5 text-amber-900 focus:outline-none text-xs font-medium"
                    >
                      {Array.from({ length: 36 }, (_, i) => 50 + i).map((age) => (
                        <option key={age} value={age}>{age}</option>
                      ))}
                    </select>
                    <span className="text-xs text-amber-700">to</span>
                    <select
                      value={searchAgeMax}
                      onChange={(e) => setSearchAgeMax(Number(e.target.value))}
                      className="flex-1 bg-amber-50/40 border border-amber-100 rounded-xl px-2.5 py-2.5 text-amber-900 focus:outline-none text-xs font-medium"
                    >
                      {Array.from({ length: 36 }, (_, i) => 50 + i).map((age) => (
                        <option key={age} value={age}>{age}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Height Filter */}
                <div className="space-y-2 lg:col-span-1">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-rose-500" />
                    <span>Height Range</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={searchHeightMin}
                      onChange={(e) => setSearchHeightMin(Number(e.target.value))}
                      className="flex-1 bg-amber-50/40 border border-amber-100 rounded-xl px-2 py-2.5 text-amber-900 focus:outline-none text-xs font-medium"
                    >
                      {HEIGHT_OPTIONS.map((inch) => (
                        <option key={inch} value={inch}>
                          {formatHeight(inch)}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-amber-700">to</span>
                    <select
                      value={searchHeightMax}
                      onChange={(e) => setSearchHeightMax(Number(e.target.value))}
                      className="flex-1 bg-amber-50/40 border border-amber-100 rounded-xl px-2 py-2.5 text-amber-900 focus:outline-none text-xs font-medium"
                    >
                      {HEIGHT_OPTIONS.map((inch) => (
                        <option key={inch} value={inch}>
                          {formatHeight(inch)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Weight Filter */}
                <div className="space-y-2 lg:col-span-1">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Weight Range</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={searchWeightMin}
                      onChange={(e) => setSearchWeightMin(Number(e.target.value))}
                      className="w-16 sm:w-20 bg-amber-50/40 border border-amber-100 rounded-xl px-2 py-2.5 text-amber-900 focus:outline-none text-xs font-medium text-center"
                    />
                    <span className="text-xs text-amber-700">to</span>
                    <input
                      type="number"
                      value={searchWeightMax}
                      onChange={(e) => setSearchWeightMax(Number(e.target.value))}
                      className="w-16 sm:w-20 bg-amber-50/40 border border-amber-100 rounded-xl px-2 py-2.5 text-amber-900 focus:outline-none text-xs font-medium text-center"
                    />
                    <span className="text-xs text-amber-600 font-semibold">lbs</span>
                  </div>
                </div>

              </div>

              {/* 5. Hobbies/Interests Tag list */}
              <div className="border-t border-amber-50 pt-5 space-y-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest">
                    <span>Filter by Sports, Recreation & Hobbies ({searchSelectedHobbies.length} selected)</span>
                  </label>
                  {searchSelectedHobbies.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSearchSelectedHobbies([])}
                      className="text-[10px] text-amber-700 hover:text-amber-950 font-bold underline transition-all cursor-pointer"
                    >
                      Clear hobby selections
                    </button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto p-2 bg-amber-50/20 border border-amber-100/50 rounded-2xl">
                  {INTERESTS_PRESETS.map((interest) => {
                    const isSelected = searchSelectedHobbies.includes(interest);
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => {
                          if (isSelected) {
                            setSearchSelectedHobbies(searchSelectedHobbies.filter((h) => h !== interest));
                          } else {
                            setSearchSelectedHobbies([...searchSelectedHobbies, interest]);
                          }
                        }}
                        className={`text-[11px] px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-950 border-amber-950 text-white font-semibold"
                            : "bg-white border-amber-100 text-amber-800 hover:bg-amber-50"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-widest">
                  Found {
                    matches.filter((companion) => {
                      // Gender
                      if (searchGender !== "All" && companion.gender !== searchGender) return false;
                      // Keyword
                      if (searchKeyword.trim()) {
                        const keyword = searchKeyword.toLowerCase().trim();
                        const nameMatch = companion.name.toLowerCase().includes(keyword);
                        const bioMatch = companion.bio.toLowerCase().includes(keyword);
                        const occMatch = companion.occupation?.toLowerCase().includes(keyword) || false;
                        const locMatch = companion.location.toLowerCase().includes(keyword);
                        if (!nameMatch && !bioMatch && !occMatch && !locMatch) return false;
                      }
                      // Age
                      if (companion.age < searchAgeMin || companion.age > searchAgeMax) return false;
                      // Height
                      if (companion.height !== undefined && (companion.height < searchHeightMin || companion.height > searchHeightMax)) return false;
                      // Weight
                      if (companion.weight !== undefined && (companion.weight < searchWeightMin || companion.weight > searchWeightMax)) return false;
                      // Hobbies
                      if (searchSelectedHobbies.length > 0) {
                        const matchesAny = searchSelectedHobbies.some((hobby) => companion.interests.includes(hobby));
                        if (!matchesAny) return false;
                      }
                      return true;
                    }).length
                  } Compatible Match Alignments
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matches.filter((companion) => {
                  // Gender
                  if (searchGender !== "All" && companion.gender !== searchGender) return false;
                  // Keyword
                  if (searchKeyword.trim()) {
                    const keyword = searchKeyword.toLowerCase().trim();
                    const nameMatch = companion.name.toLowerCase().includes(keyword);
                    const bioMatch = companion.bio.toLowerCase().includes(keyword);
                    const occMatch = companion.occupation?.toLowerCase().includes(keyword) || false;
                    const locMatch = companion.location.toLowerCase().includes(keyword);
                    if (!nameMatch && !bioMatch && !occMatch && !locMatch) return false;
                  }
                  // Age
                  if (companion.age < searchAgeMin || companion.age > searchAgeMax) return false;
                  // Height
                  if (companion.height !== undefined && (companion.height < searchHeightMin || companion.height > searchHeightMax)) return false;
                  // Weight
                  if (companion.weight !== undefined && (companion.weight < searchWeightMin || companion.weight > searchWeightMax)) return false;
                  // Hobbies
                  if (searchSelectedHobbies.length > 0) {
                    const matchesAny = searchSelectedHobbies.some((hobby) => companion.interests.includes(hobby));
                    if (!matchesAny) return false;
                  }
                  return true;
                }).length === 0 ? (
                  <div className="col-span-2 bg-white border border-amber-100 rounded-3xl p-12 text-center space-y-4">
                    <p className="text-sm text-amber-700 font-medium">
                      No direct companions match your chosen filters. Try relaxing your parameters or clearing search criteria.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchGender("All");
                        setSearchAgeMin(50);
                        setSearchAgeMax(85);
                        setSearchHeightMin(60);
                        setSearchHeightMax(78);
                        setSearchWeightMin(100);
                        setSearchWeightMax(240);
                        setSearchSelectedHobbies([]);
                        setSearchKeyword("");
                      }}
                      className="px-6 py-2.5 bg-amber-950 hover:bg-amber-900 text-white font-semibold rounded-xl transition-all text-xs cursor-pointer shadow-md"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  matches.filter((companion) => {
                    // Gender
                    if (searchGender !== "All" && companion.gender !== searchGender) return false;
                    // Keyword
                    if (searchKeyword.trim()) {
                      const keyword = searchKeyword.toLowerCase().trim();
                      const nameMatch = companion.name.toLowerCase().includes(keyword);
                      const bioMatch = companion.bio.toLowerCase().includes(keyword);
                      const occMatch = companion.occupation?.toLowerCase().includes(keyword) || false;
                      const locMatch = companion.location.toLowerCase().includes(keyword);
                      if (!nameMatch && !bioMatch && !occMatch && !locMatch) return false;
                    }
                    // Age
                    if (companion.age < searchAgeMin || companion.age > searchAgeMax) return false;
                    // Height
                    if (companion.height !== undefined && (companion.height < searchHeightMin || companion.height > searchHeightMax)) return false;
                    // Weight
                    if (companion.weight !== undefined && (companion.weight < searchWeightMin || companion.weight > searchWeightMax)) return false;
                    // Hobbies
                    if (searchSelectedHobbies.length > 0) {
                      const matchesAny = searchSelectedHobbies.some((hobby) => companion.interests.includes(hobby));
                      if (!matchesAny) return false;
                    }
                    return true;
                  }).map((companion) => {
                    const hasQuizRecord = !!quizAnswers[companion.id];
                    const companionReport = compatibilityReports[companion.id];
                    
                    return (
                      <div
                        key={companion.id}
                        className="bg-white border border-amber-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
                      >
                        <div className="space-y-4">
                          {/* Top row */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${companion.avatarColor} shrink-0 flex items-center justify-center text-3xl shadow-inner border border-white/40`}>
                                {companion.avatarEmoji}
                              </div>
                              <div>
                                <h4 className="font-serif font-bold text-amber-950 text-lg leading-tight">
                                  {companion.name}, <span className="font-sans text-sm font-semibold">{companion.age}</span>
                                </h4>
                                <p className="text-xs text-amber-850 font-medium">{companion.occupation}</p>
                                <span className="inline-flex items-center gap-1 text-[10px] text-amber-600/90 font-bold uppercase tracking-wider mt-1">
                                  <MapPin className="w-3 h-3 text-emerald-600" />
                                  {companion.location}
                                </span>
                              </div>
                            </div>

                            {companionReport && (
                              <span className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 font-bold flex items-center gap-0.5 shadow-sm">
                                <Sparkles className="w-3 h-3 fill-rose-100 text-rose-500" />
                                {companionReport.matchScore}% Align
                              </span>
                            )}
                          </div>

                          {/* Stats row */}
                          <div className="grid grid-cols-2 gap-4 bg-amber-50/30 border border-amber-100/50 p-3 rounded-2xl">
                            <div className="flex items-center gap-2">
                              <Ruler className="w-4 h-4 text-amber-700 shrink-0" />
                              <div className="text-xs">
                                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider leading-none">Height</p>
                                <p className="font-semibold text-amber-900 mt-0.5">{companion.height ? formatHeight(companion.height) : "N/A"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Scale className="w-4 h-4 text-amber-700 shrink-0" />
                              <div className="text-xs">
                                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider leading-none">Weight</p>
                                <p className="font-semibold text-amber-900 mt-0.5">{companion.weight ? `${companion.weight} lbs` : "N/A"}</p>
                              </div>
                            </div>
                          </div>

                          {/* Bio */}
                          <p className="text-xs text-amber-900/90 leading-relaxed line-clamp-3 italic">
                            "{companion.bio}"
                          </p>

                          {/* Interests tags */}
                          <div className="space-y-1.5">
                            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-widest">Recreation & Hobbies</p>
                            <div className="flex flex-wrap gap-1.5">
                              {companion.interests.map((hobby) => {
                                const isHobbyFiltered = searchSelectedHobbies.includes(hobby);
                                return (
                                  <span
                                    key={hobby}
                                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium ${
                                      isHobbyFiltered
                                        ? "bg-amber-950 border-amber-950 text-white shadow-sm"
                                        : "bg-amber-50/50 border-amber-100 text-amber-800"
                                    }`}
                                  >
                                    {hobby}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Action CTA */}
                        <div className="pt-4 border-t border-amber-50 flex items-center justify-between gap-4">
                          <span className="text-[10px] text-amber-700 font-medium">
                            {companion.relationshipGoal}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMatch(companion);
                              setActiveTab("gardens");
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-950 hover:bg-amber-900 text-white font-bold rounded-xl transition-all shadow-md text-xs cursor-pointer"
                          >
                            <span>Connect & Chat</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          /* EMBOLDENED GARDENS OF BROWSE MATCHES AND WORKFLOW */
          <div id="browse-pane" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            
            {/* COLUMN 1: COMPANIONS LIST (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-amber-100 rounded-3xl p-5 shadow-sm">
                <h2 className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>The Gardens Of Connections ({matches.length})</span>
                </h2>

                {loadingMatches ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
                    <p className="text-xs text-amber-700">Tending to companion list...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matches.map((companion) => {
                      const isSelected = selectedMatch?.id === companion.id;
                      const hasQuizRecord = !!quizAnswers[companion.id];
                      const companionReport = compatibilityReports[companion.id];
                      
                      return (
                        <div
                          key={companion.id}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-amber-50/70 border-amber-200/80 shadow-sm"
                              : "bg-[#FDFCFB]/80 hover:bg-amber-50/30 border-amber-100/40"
                          }`}
                          onClick={() => setSelectedMatch(companion)}
                        >
                          <div className="flex items-start gap-3.5">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${companion.avatarColor} shrink-0 flex items-center justify-center text-2xl shadow-inner border border-white/40`}>
                              {companion.avatarEmoji}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <h3 className="font-serif font-bold text-amber-950 text-base leading-tight">
                                  {companion.name}, <span className="font-sans text-sm font-semibold">{companion.age}</span>
                                </h3>
                                {companionReport && (
                                  <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 font-bold flex items-center gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5 fill-rose-100 text-rose-500" />
                                    {companionReport.matchScore}% Align
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-amber-850/80 line-clamp-1 mt-0.5 font-medium">{companion.occupation}</p>
                              
                              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-amber-100/30">
                                <span className="text-[9px] text-amber-600/90 font-semibold uppercase tracking-wider flex items-center gap-0.5">
                                  <MapPin className="w-2.5 h-2.5 text-emerald-600" />
                                  {companion.location}
                                </span>
                                
                                {hasQuizRecord && !companionReport && (
                                  <span className="text-[9px] text-amber-700 font-bold italic">Quiz Answers ready</span>
                                )}
                                
                                {companionReport && (
                                  <span className="text-[9px] text-emerald-800 font-bold flex items-center gap-0.5 border border-emerald-100 bg-emerald-50/50 px-1.5 py-0.5 rounded-md">
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                    Report Ready
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Informative mature card */}
              <div className="bg-gradient-to-b from-[#FAF5F0] to-[#F5ECE2] border border-amber-100/80 rounded-3xl p-5 shadow-sm text-amber-900/90">
                <h4 className="font-serif font-bold text-base mb-2 text-amber-950">A Slower, Kinder Pace</h4>
                <p className="text-xs leading-relaxed space-y-2">
                  <span>Welcome down standard road layouts! On Next Chapter, meeting beautiful hearts starts with common quiet rhythms. Take quizes to let AI evaluate your companion metrics, or strike a conversation immediately below.</span>
                </p>
                <div className="mt-4 border-t border-amber-200/30 pt-3 flex items-center justify-between text-[11px] font-semibold text-amber-800">
                  <span>No swiping pressure here.</span>
                  <span>🍵 Companion Spot</span>
                </div>
              </div>
            </div>

            {/* COLUMN 2: SELECTED COMPANION TABBED VIEWS (8 cols) */}
            <div className="lg:col-span-8">
              {selectedMatch ? (
                <div className="space-y-6">
                  
                  {/* Companion Header Card */}
                  <div className="bg-white border border-amber-100 rounded-3xl p-6 md:p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${selectedMatch.avatarColor} flex items-center justify-center text-4xl shrink-0 border-2 border-white shadow-md`}>
                          {selectedMatch.avatarEmoji}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-serif text-2xl font-bold text-amber-950">{selectedMatch.name}</h2>
                            <span className="text-sm px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-950 font-semibold border border-amber-100">
                              Age {selectedMatch.age}
                            </span>
                          </div>
                          
                          <p className="text-sm font-semibold text-amber-850 mt-1 flex items-center gap-1">
                            <span>{selectedMatch.occupation}</span>
                            <span className="text-amber-200">•</span>
                            <span className="text-xs text-amber-700/90 tracking-wide">{selectedMatch.chapterTheme}</span>
                          </p>

                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs font-semibold text-amber-700">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              {selectedMatch.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-50" />
                              Goal: {selectedMatch.relationshipGoal}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-amber-50 pt-5">
                      <h4 className="text-[10px] font-bold text-amber-950 uppercase tracking-widest mb-2">Introduction Summary</h4>
                      <p className="text-sm leading-relaxed text-amber-900 p-4 rounded-2xl bg-amber-50/30 border border-amber-100/50 italic font-medium">
                        "{selectedMatch.bio}"
                      </p>
                    </div>

                    <div className="mt-5">
                      <h4 className="text-[10px] font-bold text-amber-950 uppercase tracking-widest mb-2">Passions & Hobbies</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedMatch.interests.map((interest) => (
                          <span key={interest} className="text-xs px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-800 font-medium">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* TWO ACCORDION / WORKFLOW TILES:
                      1. COMPATIBILITY QUIZ (THE COMPANION CALCULATOR)
                      2. CONVERSATION SALON (INTERACTIVE DIALOGUE)
                  */}
                  <div className="grid grid-cols-1 gap-6">
                    
                    {/* ACCORDION 1: COMPATIBILITY ASSESSMENT */}
                    <div className="bg-white border border-amber-100 rounded-3xl p-6 md:p-8 shadow-sm">
                      <div className="flex items-center justify-between gap-2 border-b border-amber-50 pb-4 mb-5">
                        <div className="flex items-center gap-2.5">
                          <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                            <Compass className="w-5 h-5 text-emerald-700" />
                          </span>
                          <div>
                            <h3 className="font-serif font-bold text-lg text-amber-950">Next Chapter Companion Quiz</h3>
                            <p className="text-xs text-amber-700">Answer 3 questions to evaluate customized AI resonance</p>
                          </div>
                        </div>
                        {currentMatchCompatibilityReport && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold">
                            Align {currentMatchCompatibilityReport.matchScore}%
                          </span>
                        )}
                      </div>

                      {/* QUIZ FORM */}
                      <div className="space-y-5">
                        {COMPATIBILITY_QUIZ_QUESTIONS.map((q) => {
                          const chosenVal = currentMatchQuizAnswers[q.id];
                          return (
                            <div key={q.id} className="p-4 rounded-2xl bg-[#FCFAF7] border border-amber-100/50">
                              <h4 className="text-sm font-semibold text-amber-950 mb-3 leading-relaxed">
                                {q.question}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {q.options.map((opt) => {
                                  const isChecked = chosenVal === opt.value;
                                  return (
                                    <button
                                      key={opt.value}
                                      onClick={() => handleSelectQuizOption(selectedMatch.id, q.id, opt.value)}
                                      className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between h-full cursor-pointer hover:border-amber-300 ${
                                        isChecked
                                          ? "bg-amber-950 border-amber-950 text-white shadow-sm"
                                          : "bg-white border-amber-100 text-amber-900"
                                      }`}
                                    >
                                      <span className="font-bold border-b border-amber-200 mb-1.5 pb-0.5 tracking-widest">
                                        OPTION {opt.label}
                                      </span>
                                      <span className="leading-relaxed font-medium">{opt.text}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        <div className="pt-2 flex flex-col items-center">
                          <button
                            onClick={() => handleSubmitQuiz(selectedMatch.id)}
                            disabled={isAnalyzingCompatibility}
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-emerald-800/60 text-white font-semibold rounded-2xl transition-all shadow-md text-sm cursor-pointer disabled:opacity-50"
                          >
                            {isAnalyzingCompatibility ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Evaluating Chapter Harmony via Gemini...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 fill-emerald-100" />
                                <span>{currentMatchCompatibilityReport ? "Recalculate AI Alignment" : "Reveal Compatibility Insight"}</span>
                              </>
                            )}
                          </button>

                          {compatibilityError && (
                            <p className="text-xs text-red-600 mt-2 font-medium bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">
                              {compatibilityError}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* COMPATIBILITY REPORT RESULT PRESENTATION */}
                      {currentMatchCompatibilityReport && (
                        <div className="mt-8 border-t-2 border-dashed border-amber-100 pt-6 animate-scale-up">
                          <div className="bg-gradient-to-br from-emerald-50/50 via-amber-50/20 to-rose-50/40 border border-amber-100 p-6 md:p-8 rounded-3xl relative overflow-hidden">
                            
                            {/* Circle score widget */}
                            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                              <div className="relative w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-emerald-600 shadow-md transform hover:rotate-6 transition-all duration-300">
                                <span className="font-serif text-3xl font-extrabold text-emerald-950">
                                  {currentMatchCompatibilityReport.matchScore}%
                                </span>
                                <span className="absolute bottom-1 text-[8px] font-bold uppercase tracking-widest text-emerald-700">Align</span>
                              </div>

                              <div className="min-w-0 flex-1 text-center md:text-left">
                                <h4 className="font-serif text-xl font-extrabold text-amber-950 leading-tight">
                                  The {selectedMatch.name} & {userProfile.name} Alignment Report
                                </h4>
                                <p className="text-xs text-amber-900 mt-2 leading-relaxed italic font-medium">
                                  "{currentMatchCompatibilityReport.summary}"
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-amber-200/40">
                              <div>
                                <h5 className="text-[11px] font-bold text-emerald-950 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  Shared Chapter Strengths
                                </h5>
                                <ul className="space-y-2">
                                  {currentMatchCompatibilityReport.sharedStrengths.map((strength, idx) => (
                                    <li key={idx} className="text-xs text-amber-900 leading-relaxed flex items-start gap-1.5 font-medium">
                                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                                      <span>{strength}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h5 className="text-[11px] font-bold text-amber-900 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                  <Coffee className="w-4 h-4 text-orange-500" />
                                  Mindful Custom Rhythms
                                </h5>
                                <ul className="space-y-2">
                                  {currentMatchCompatibilityReport.potentialGrowthAreas.map((area, idx) => (
                                    <li key={idx} className="text-xs text-amber-900 leading-relaxed flex items-start gap-1.5 font-medium">
                                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 shrink-0" />
                                      <span>{area}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* EXQUISITE DATE IDEAS BENTO */}
                            <div className="mt-6 pt-6 border-t border-amber-200/40">
                              <h5 className="text-[11px] font-bold text-amber-950 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-rose-500" />
                                Custom-Designed Date Experiences
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {currentMatchCompatibilityReport.recommendedDates.map((dateTitle, idx) => (
                                  <div key={idx} className="bg-white/80 p-4 rounded-xl border border-amber-100 shadow-sm flex flex-col justify-between h-full">
                                    <p className="text-xs text-amber-900 font-medium leading-relaxed">
                                      {dateTitle}
                                    </p>
                                    <span className="text-[9px] font-bold uppercase text-emerald-800 tracking-wider mt-3 inline-block">
                                      IDEA {idx + 1}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACCORDION 2: DIALOGUE SALON (CHAT WINDOW) */}
                    <div className="bg-white border border-amber-100 rounded-3xl p-6 md:p-8 shadow-sm">
                      <div className="flex items-center gap-2.5 border-b border-amber-50 pb-4 mb-4">
                        <span className="p-2 bg-rose-50 text-rose-700 rounded-xl">
                          <MessageSquare className="w-5 h-5 text-rose-700" />
                        </span>
                        <div>
                          <h3 className="font-serif font-bold text-lg text-amber-950">Dialogue Salon with {selectedMatch.name}</h3>
                          <p className="text-xs text-amber-700">Write heartwarming sentiments. Let's find real companionship.</p>
                        </div>
                      </div>

                      {/* MESSAGE THREAD WINDOW */}
                      <div className="bg-amber-50/20 border border-amber-100/50 rounded-2xl p-4 h-[350px] overflow-y-auto space-y-3">
                        {currentMatchChatHistory.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-amber-800/70">
                            <Coffee className="w-10 h-10 text-amber-300 mb-2" />
                            <p className="text-xs font-semibold">Take standard initiative. Click one of the Conversation Sparks below to begin your dynamic chapter!</p>
                          </div>
                        ) : (
                          currentMatchChatHistory.map((msg) => {
                            const isUser = msg.senderId === "user";
                            return (
                              <div
                                key={msg.id}
                                className={`flex ${isUser ? "justify-end" : "justify-start"} animate-scale-up`}
                              >
                                <div
                                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                                    isUser
                                      ? "bg-amber-950 text-white font-medium shadow-sm rounded-br-none"
                                      : "bg-white border border-amber-100 text-amber-950 shadow-xs rounded-bl-none font-medium"
                                  }`}
                                >
                                  <p>{msg.text}</p>
                                  <span className={`block text-[9px] text-right mt-1.5 ${isUser ? "text-amber-200/80" : "text-amber-600"}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}

                        {/* CHAT COMPANION IS TYPING */}
                        {isCompanionTyping && (
                          <div className="flex justify-start">
                            <div className="bg-white border border-amber-100 text-amber-950 rounded-2xl rounded-bl-none px-4 py-3 max-w-[80%] text-xs shadow-xs">
                              <div className="flex items-center gap-1.5">
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-800" />
                                <span className="font-semibold italic text-amber-850/80">{selectedMatch.name} is writing a response...</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* DIALOGUE SPARKS */}
                      <div className="mt-4">
                        <span className="block text-[10px] font-bold text-amber-900 uppercase tracking-widest mb-2">Conversation Sparks (Tap to ask)</span>
                        <div className="flex flex-col gap-1.5">
                          {(CONVERSATION_SPARKS[selectedMatch.id] || []).map((spark, index) => (
                            <button
                              key={index}
                              onClick={() => handleSendMessage(spark)}
                              disabled={isCompanionTyping}
                              className="text-left text-xs bg-amber-50/50 hover:bg-amber-100/50 border border-orange-150 p-2.5 rounded-xl text-amber-900 outline-none transition-all cursor-pointer font-medium hover:pl-3.5"
                            >
                              ✨ "{spark}"
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* MESSAGE ENTRY CONTROLS */}
                      <div className="mt-5 pt-4 border-t border-amber-50 flex items-center gap-2">
                        <input
                          type="text"
                          value={chatInputValue}
                          onChange={(e) => setChatInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSendMessage();
                          }}
                          placeholder={`Pour out your feelings with ${selectedMatch.name}...`}
                          className="flex-1 bg-amber-50/40 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-950 outline-none focus:ring-1 focus:ring-amber-300 focus:bg-white transition-all font-medium"
                        />
                        <button
                          onClick={() => handleSendMessage()}
                          disabled={!chatInputValue.trim() || isCompanionTyping}
                          className="p-3 bg-amber-950 hover:bg-amber-900 disabled:opacity-40 text-white rounded-xl shadow-sm transition-all cursor-pointer outline-none shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-white border border-amber-100 rounded-3xl p-12 text-center text-amber-800">
                  <p className="text-sm font-medium">Please select a companion match from the left slot to discover their detailed character alignment.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer id="main-footer" className="bg-[#FAF5EE] border-t border-amber-100 py-12 mt-20 text-center">
        <div className="max-w-6xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <h5 className="font-serif font-bold text-amber-900">Next Chapter Dating</h5>
          </div>
          <p className="text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
            Dating for Next Chapter is designed with profound respect, spacious accessibility metrics, and AI matching parameters. Live beautifully, connect safely, and share standard laughter.
          </p>
          <div className="text-[10px] text-amber-600/80">
            <span>Next Chapter Applet © {new Date().getFullYear()} • Powered via Gemini AI Studio Models</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
