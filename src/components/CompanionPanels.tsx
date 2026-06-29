import React, { useRef, useEffect, useState } from "react";
import { 
  Compass, Search, MessageSquare, Coffee, BookOpen, Heart, MapPin, 
  Sparkles, Ruler, Scale, ChevronRight, Send, Loader2, CheckCircle2, 
  SlidersHorizontal, User, Disc, Volume2, Play, Pause, Music, Save, Trash2, Plus
} from "lucide-react";
import { Profile, Message, CompatibilityAnalysis } from "../types";

// Constant presets matching App.tsx
const INTERESTS_PRESETS = [
  "Sourdough Baking", "Watercolor Painting", "Organic Gardening",
  "Classical Music", "Sailing & Boating", "Vintage Literature",
  "Couples Travel", "Chai & Conversations", "Book Clubs & Literature",
  "Pickleball & Tennis", "Hiking & Nature Walks", "Creative Writing",
  "Art History & Museums", "Acoustic Guitar", "Mindful Yoga & Tea"
];

const HEIGHT_OPTIONS = Array.from({ length: 25 }, (_, i) => 54 + i); // 4'6" to 6'6"

function formatHeight(inches: number): string {
  const ft = Math.floor(inches / 12);
  const inch = inches % 12;
  return `${ft}'${inch}"`;
}

// Sparks mapping matching App.tsx
const CONVERSATION_SPARKS: Record<string, string[]> = {
  "companion-arthur": [
    "What is your absolute favorite piece of literature to read on a slow rainy afternoon?",
    "I would love to hear your favorite story or memory from your teaching years.",
    "Which cozy local spot in Sausalito is your favorite place to unwind?"
  ],
  "companion-evelyn": [
    "Could you describe the most beautiful sunset you've ever painted?",
    "What does a perfect quiet morning of watercolors look like to you?",
    "Where is your favorite scenic nature view around Northern California?"
  ],
  "companion-sanjay": [
    "What is your favorite blend of tea for peaceful morning reflection?",
    "I'd love to hear how you integrate mindfulness and gratitude into daily retired life.",
    "What are some of your favorite local garden paths to walk on?"
  ],
  "companion-eleanor": [
    "Which piece of music brings you the most profound sense of comfort or nostalgia?",
    "If we were to co-write a story, what era or setting would you choose?",
    "What is the most beautiful coastal town you've visited on your travels?"
  ]
};

// Component 1: Discovery Compass
interface DiscoveryCompassProps {
  matches: Profile[];
  compatibilityReports: Record<string, CompatibilityAnalysis>;
  searchKeyword: string;
  setSearchKeyword: (val: string) => void;
  searchGender: string;
  setSearchGender: (val: string) => void;
  searchAgeMin: number;
  setSearchAgeMin: (val: number) => void;
  searchAgeMax: number;
  setSearchAgeMax: (val: number) => void;
  searchHeightMin: number;
  setSearchHeightMin: (val: number) => void;
  searchHeightMax: number;
  setSearchHeightMax: (val: number) => void;
  searchWeightMin: number;
  setSearchWeightMin: (val: number) => void;
  searchWeightMax: number;
  setSearchWeightMax: (val: number) => void;
  searchSelectedHobbies: string[];
  setSearchSelectedHobbies: (val: string[]) => void;
  compassFocus: string;
  setCompassFocus: (val: string) => void;
  setSelectedMatch: (profile: Profile) => void;
  setActiveTab: (tab: string) => void;
}

export const DiscoveryCompassPanel: React.FC<DiscoveryCompassProps> = ({
  matches,
  compatibilityReports,
  searchKeyword,
  setSearchKeyword,
  searchGender,
  setSearchGender,
  searchAgeMin,
  setSearchAgeMin,
  searchAgeMax,
  setSearchAgeMax,
  searchHeightMin,
  setSearchHeightMin,
  searchHeightMax,
  setSearchHeightMax,
  searchWeightMin,
  setSearchWeightMin,
  searchWeightMax,
  setSearchWeightMax,
  searchSelectedHobbies,
  setSearchSelectedHobbies,
  compassFocus,
  setCompassFocus,
  setSelectedMatch,
  setActiveTab
}) => {
  const filteredCompanions = matches.filter((companion) => {
    if (searchGender !== "All" && companion.gender !== searchGender) return false;
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      const nameMatch = companion.name.toLowerCase().includes(keyword);
      const bioMatch = companion.bio.toLowerCase().includes(keyword);
      const occMatch = companion.occupation?.toLowerCase().includes(keyword) || false;
      const locMatch = companion.location.toLowerCase().includes(keyword);
      if (!nameMatch && !bioMatch && !occMatch && !locMatch) return false;
    }
    if (companion.age < searchAgeMin || companion.age > searchAgeMax) return false;
    if (companion.height !== undefined && (companion.height < searchHeightMin || companion.height > searchHeightMax)) return false;
    if (companion.weight !== undefined && (companion.weight < searchWeightMin || companion.weight > searchWeightMax)) return false;
    if (searchSelectedHobbies.length > 0) {
      const matchesAny = searchSelectedHobbies.some((hobby) => companion.interests.includes(hobby));
      if (!matchesAny) return false;
    }
    return true;
  });

  const handleReset = () => {
    setSearchGender("All");
    setSearchAgeMin(35);
    setSearchAgeMax(85);
    setSearchHeightMin(60);
    setSearchHeightMax(78);
    setSearchWeightMin(100);
    setSearchWeightMax(240);
    setSearchSelectedHobbies([]);
    setSearchKeyword("");
    setCompassFocus("all");
  };

  return (
    <div id="compass-pane" className="space-y-6 animate-fade-in">
      <div className="bg-white border border-amber-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-serif font-bold text-amber-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600 animate-pulse" />
            <span>Discovery Compass</span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-700 max-w-2xl">
            Filter by physical metrics, recreation interests, or use our visual Alignment Dial to tune in on companion cores.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold border border-amber-200 rounded-xl transition-all text-xs cursor-pointer"
        >
          Reset All Filters
        </button>
      </div>

      <div className="bg-gradient-to-br from-emerald-50/60 via-amber-50/30 to-orange-50/40 border border-amber-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="font-serif text-lg font-bold text-amber-950 flex items-center justify-center gap-2">
            <Compass className="w-5 h-5 text-emerald-700" />
            <span>The Alignment Dial</span>
          </h3>
          <p className="text-xs text-amber-850 font-medium leading-relaxed">
            Click an alignment direction on the compass to automatically tune your discovery focus toward specific companion values.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => {
              setCompassFocus("all");
              setSearchKeyword("");
              setSearchSelectedHobbies([]);
            }}
            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
              compassFocus === "all"
                ? "bg-amber-950 border-amber-950 text-white font-bold shadow-md"
                : "bg-white border-amber-100 text-amber-900 hover:bg-amber-50/50"
            }`}
          >
            <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Center</span>
            <span className="text-xs">All Connections</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCompassFocus("intellectual");
              setSearchKeyword("professor");
              setSearchSelectedHobbies(["Book Clubs & Literature", "Creative Writing", "Art History & Museums"]);
            }}
            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
              compassFocus === "intellectual"
                ? "bg-amber-950 border-amber-950 text-white font-bold shadow-md"
                : "bg-white border-amber-100 text-amber-900 hover:bg-amber-50/50"
            }`}
          >
            <span className="block text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1">North 🧭</span>
            <span className="text-xs">Intellectual Depth</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCompassFocus("sports");
              setSearchKeyword("captain");
              setSearchSelectedHobbies(["Sailing & Boating", "Hiking & Nature Walks", "Pickleball & Tennis"]);
            }}
            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
              compassFocus === "sports"
                ? "bg-amber-950 border-amber-950 text-white font-bold shadow-md"
                : "bg-white border-amber-100 text-amber-900 hover:bg-amber-50/50"
            }`}
          >
            <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">East 🧭</span>
            <span className="text-xs">Sports & Outings</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCompassFocus("cozy");
              setSearchKeyword("wellness");
              setSearchSelectedHobbies(["Sourdough Baking", "Organic Gardening", "Chai & Conversations"]);
            }}
            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
              compassFocus === "cozy"
                ? "bg-amber-950 border-amber-950 text-white font-bold shadow-md"
                : "bg-white border-amber-100 text-amber-900 hover:bg-amber-50/50"
            }`}
          >
            <span className="block text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-1">South 🧭</span>
            <span className="text-xs">Cozy Quietude</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCompassFocus("romance");
              setSearchKeyword("designer");
              setSearchSelectedHobbies(["Watercolor Painting", "Sailing & Boating", "Couples Travel"]);
            }}
            className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
              compassFocus === "romance"
                ? "bg-amber-950 border-amber-950 text-white font-bold shadow-md"
                : "bg-white border-amber-100 text-amber-900 hover:bg-amber-50/50"
            }`}
          >
            <span className="block text-[10px] font-bold uppercase tracking-widest text-purple-600 mb-1">West 🧭</span>
            <span className="text-xs">Romance & Travel</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="space-y-2 lg:col-span-1">
            <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-amber-700" />
              <span>Keyword Search</span>
            </label>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search name, occupation..."
              className="w-full bg-amber-50/40 border border-amber-100 rounded-xl px-3 py-2.5 text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:bg-white transition-all text-xs font-medium"
            />
          </div>

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
                {Array.from({ length: 51 }, (_, i) => 35 + i).map((age) => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
              <span className="text-xs text-amber-700">to</span>
              <select
                value={searchAgeMax}
                onChange={(e) => setSearchAgeMax(Number(e.target.value))}
                className="flex-1 bg-amber-50/40 border border-amber-100 rounded-xl px-2.5 py-2.5 text-amber-900 focus:outline-none text-xs font-medium"
              >
                {Array.from({ length: 51 }, (_, i) => 35 + i).map((age) => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 lg:col-span-1">
            <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-rose-500" />
              <span>Height Range</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                value={searchHeightMin}
                onChange={(e) => setSearchHeightMin(Number(e.target.value))}
                className="flex-1 bg-amber-50/40 border border-amber-100 rounded-xl px-2 py-2 text-amber-900 focus:outline-none text-xs font-medium"
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
                className="flex-1 bg-amber-50/40 border border-amber-100 rounded-xl px-2 py-2 text-amber-900 focus:outline-none text-xs font-medium"
              >
                {HEIGHT_OPTIONS.map((inch) => (
                  <option key={inch} value={inch}>
                    {formatHeight(inch)}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
              <span className="text-xs text-emerald-600 font-semibold">lbs</span>
            </div>
          </div>
        </div>

        <div className="border-t border-amber-50 pt-5 space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest">
              <span>Filter by Sports, Recreation & Hobbies ({searchSelectedHobbies.length} selected)</span>
            </label>
            {searchSelectedHobbies.length > 0 && (
              <button
                type="button"
                onClick={() => setSearchSelectedHobbies([])}
                className="text-[10px] text-amber-700 hover:text-amber-950 font-bold underline transition-all cursor-pointer bg-transparent border-none"
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

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-amber-900 uppercase tracking-widest px-2">
          Found {filteredCompanions.length} Compatible Match Alignments
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCompanions.length === 0 ? (
            <div className="col-span-2 bg-white border border-amber-100 rounded-3xl p-12 text-center space-y-4">
              <p className="text-sm text-amber-700 font-medium">
                No direct companions match your chosen filters. Try relaxing your parameters or clearing search criteria.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 bg-amber-950 hover:bg-amber-900 text-white font-semibold rounded-xl transition-all text-xs cursor-pointer shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredCompanions.map((companion) => {
              const companionReport = compatibilityReports[companion.id];
              return (
                <div
                  key={companion.id}
                  className="bg-white border border-amber-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
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

                    <p className="text-xs text-amber-900/90 leading-relaxed line-clamp-3 italic">
                      "{companion.bio}"
                    </p>

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
  );
};


// Component 2: Community Cafe
interface CafePost {
  id: string;
  senderId: string;
  senderName: string;
  avatarColor?: string;
  avatarEmoji: string;
  text: string;
  timestamp: string;
  likes: number;
  likedByMe: boolean;
  replies: {
    id: string;
    senderName: string;
    avatarEmoji: string;
    text: string;
  }[];
}

interface CommunityCafeProps {
  cafePosts: CafePost[];
  newPostText: string;
  setNewPostText: (val: string) => void;
  isCommentReplying: boolean;
  handleLikePost: (postId: string) => void;
  handleCreatePost: () => void;
}

export const CommunityCafePanel: React.FC<CommunityCafeProps> = ({
  cafePosts,
  newPostText,
  setNewPostText,
  isCommentReplying,
  handleLikePost,
  handleCreatePost
}) => {
  return (
    <div id="cafe-pane" className="space-y-6 animate-fade-in">
      <div className="bg-white border border-amber-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-serif font-bold text-amber-900 flex items-center gap-2">
            <Coffee className="w-6 h-6 text-orange-500" />
            <span>Community Cafe</span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-700 max-w-2xl">
            A peaceful common lounge to share quiet life snapshots, recipe outcomes, morning views, and daily wisdom.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FCFAF7] border border-amber-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-950 text-white rounded-full flex items-center justify-center font-bold text-xs">
                ☕
              </div>
              <h3 className="font-serif font-bold text-base text-amber-950">Share a Quiet Thought</h3>
            </div>

            <p className="text-xs text-amber-700 leading-relaxed">
              Write standard daily sentiments—from backyard birds to favorite teacups. Other companions can immediately view and respond.
            </p>

            <div className="space-y-3">
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Drinking spiced tea and watching the garden birds..."
                className="w-full h-28 bg-white border border-amber-100 rounded-2xl p-3 text-xs text-amber-950 outline-none focus:ring-1 focus:ring-amber-300 transition-all font-medium resize-none"
              />

              <button
                type="button"
                onClick={handleCreatePost}
                disabled={!newPostText.trim() || isCommentReplying}
                className="w-full py-2.5 bg-amber-950 hover:bg-amber-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Post to Cafe Lounge
              </button>
            </div>
          </div>

          <div className="bg-amber-50/20 border border-amber-100 rounded-3xl p-6 space-y-3 text-amber-900">
            <h4 className="font-serif font-bold text-sm text-amber-950">Cafe Etiquette</h4>
            <p className="text-[11px] leading-relaxed text-amber-800 font-medium">
              Next Chapter lounge fosters high mutual respect. Savor the peaceful, slow-reading conversations and warm morning reflections.
            </p>
            <p className="text-[10px] text-emerald-700 font-bold">
              ● Lounge active and warm
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          {cafePosts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-amber-100 rounded-3xl p-6 shadow-xs hover:shadow-sm transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${post.avatarColor || "from-amber-100 to-rose-100"} flex items-center justify-center text-xl shadow-inner border border-white`}>
                    {post.avatarEmoji}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-amber-950 text-sm">{post.senderName}</h4>
                    <span className="text-[10px] text-amber-600/90 font-medium">
                      {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleLikePost(post.id)}
                  className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    post.likedByMe
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : "bg-white border-amber-100 text-amber-800 hover:bg-amber-50"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${post.likedByMe ? "fill-rose-500 text-rose-500" : ""}`} />
                  <span>{post.likes} Likes</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed pl-1 font-medium">
                {post.text}
              </p>

              {post.replies.length > 0 && (
                <div className="mt-4 pt-4 border-t border-amber-50 space-y-3 pl-4 md:pl-8">
                  {post.replies.map((reply: any) => (
                    <div
                      key={reply.id}
                      className="bg-amber-50/20 border border-amber-100/40 p-3 rounded-2xl flex items-start gap-2.5 animate-scale-up"
                    >
                      <span className="text-lg shrink-0">{reply.avatarEmoji}</span>
                      <div className="text-xs space-y-0.5">
                        <h5 className="font-bold text-amber-950">{reply.senderName}</h5>
                        <p className="text-amber-900/90 leading-relaxed font-medium">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isCommentReplying && cafePosts[0].id === post.id && (
                <div className="mt-4 pt-4 border-t border-amber-50 pl-4 md:pl-8 flex items-center gap-2 text-xs italic text-amber-700/80 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-800" />
                  <span>A companion is drafting a warm reply...</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// Component 3: Conversation Center
interface ConversationCenterProps {
  matches: Profile[];
  conversations: Record<string, Message[]>;
  compatibilityReports: Record<string, CompatibilityAnalysis>;
  selectedMatch: Profile | null;
  setSelectedMatch: (p: Profile) => void;
  idToken: string | null;
  currentUser: string | null;
  isCompanionTyping: boolean;
  chatInputValue: string;
  setChatInputValue: (val: string) => void;
  handleSendMessage: (textToSend?: string) => void;
  setActiveTab: (tab: string) => void;
}

export const ConversationCenterPanel: React.FC<ConversationCenterProps> = ({
  matches,
  conversations,
  compatibilityReports,
  selectedMatch,
  setSelectedMatch,
  idToken,
  currentUser,
  isCompanionTyping,
  chatInputValue,
  setChatInputValue,
  handleSendMessage,
  setActiveTab
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentMatchChatHistory = selectedMatch ? (conversations[selectedMatch.id] || []) : [];
  const [conversationMode, setConversationMode] = useState<"chat" | "melody">("chat");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMatchChatHistory, isCompanionTyping]);

  // Reset conversationMode to chat when the selected match changes
  useEffect(() => {
    setConversationMode("chat");
  }, [selectedMatch?.id]);

  return (
    <div id="conversations-pane" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white border border-amber-100 rounded-3xl p-5 shadow-sm">
          <h2 className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-rose-600" />
            <span>Conversation Inbox ({matches.length})</span>
          </h2>

          <div className="space-y-2.5 max-h-[550px] overflow-y-auto">
            {matches.map((companion) => {
              const isSelected = selectedMatch?.id === companion.id;
              const history = conversations[companion.id] || [];
              const lastMsg = history[history.length - 1];
              const companionReport = compatibilityReports[companion.id];

              return (
                <div
                  key={companion.id}
                  onClick={() => setSelectedMatch(companion)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-amber-50/70 border-amber-200/80 shadow-xs"
                      : "bg-[#FDFCFB]/80 hover:bg-amber-50/20 border-amber-100/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${companion.avatarColor} shrink-0 flex items-center justify-center text-xl border border-white shadow-inner`}>
                      {companion.avatarEmoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-serif font-bold text-amber-950 text-sm leading-none truncate">
                          {companion.name}, <span className="font-sans text-xs font-semibold">{companion.age}</span>
                        </h4>
                        {companionReport && (
                          <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold">
                            {companionReport.matchScore}%
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-amber-900 font-medium truncate mt-1">
                        {lastMsg ? lastMsg.text : companion.relationshipGoal}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#FAF5EE] border border-amber-100/80 rounded-3xl p-5 shadow-sm text-amber-900/95 space-y-2">
          <h4 className="font-serif font-bold text-sm text-amber-950">Mindful Dialogue</h4>
          <p className="text-[11px] leading-relaxed font-medium">
            Deep connections take root when we ask about personal values, morning rituals, and favorite book chapters. Use the Sparks below to enrich your dialogue!
          </p>
        </div>
      </div>

      <div className="lg:col-span-8">
        {selectedMatch ? (
          <div className="bg-white border border-amber-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-amber-50 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${selectedMatch.avatarColor} flex items-center justify-center text-2xl shadow-inner border border-white`}>
                  {selectedMatch.avatarEmoji}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-amber-950 text-lg leading-tight">Dialogue with {selectedMatch.name}</h3>
                  <p className="text-[11px] font-semibold text-amber-700">{selectedMatch.occupation} • {selectedMatch.location}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("gardens")}
                className="text-xs text-amber-950 hover:text-amber-800 font-bold hover:underline transition-all cursor-pointer flex items-center gap-1 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl"
              >
                <User className="w-3.5 h-3.5 text-rose-500" />
                <span>View Companion Details</span>
              </button>
            </div>

            {/* Pill tabs for Chat vs Melody Lounge */}
            <div className="flex gap-2 border-b border-amber-50/60 pb-3 -mt-2">
              <button
                type="button"
                onClick={() => setConversationMode("chat")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                  conversationMode === "chat"
                    ? "bg-amber-950 text-white border-amber-950 shadow-sm"
                    : "bg-[#FCFAF7] hover:bg-amber-50 border-amber-100 text-amber-900"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Dialogue Center</span>
              </button>
              <button
                type="button"
                onClick={() => setConversationMode("melody")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                  conversationMode === "melody"
                    ? "bg-amber-950 text-white border-amber-950 shadow-sm animate-pulse-subtle"
                    : "bg-[#FCFAF7] hover:bg-amber-50 border-amber-100 text-amber-900"
                }`}
              >
                <Disc className="w-3.5 h-3.5 text-rose-500" />
                <span>Melody & Vinyl Lounge</span>
              </button>
            </div>

            {conversationMode === "chat" ? (
              <div className="space-y-6">
                <div className="bg-amber-50/25 border border-amber-100/40 rounded-2xl p-4 h-[380px] overflow-y-auto space-y-3.5">
                  {currentMatchChatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center text-amber-800/70 space-y-2">
                      <Coffee className="w-9 h-9 text-amber-300 animate-pulse" />
                      <p className="text-xs font-semibold max-w-sm leading-relaxed">
                        Click one of the custom Conversation Sparks below to instantly begin your quiet dating alignment dialogue!
                      </p>
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
                            className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
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

                  {isCompanionTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-amber-100 text-amber-950 rounded-2xl rounded-bl-none px-4 py-3 max-w-[75%] text-xs shadow-xs">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-800" />
                          <span className="font-semibold italic text-amber-850/80">{selectedMatch.name} is formulating a response...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-amber-950 uppercase tracking-widest">Conversation Sparks (Tap to ask)</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(CONVERSATION_SPARKS[selectedMatch.id] || []).map((spark, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(spark)}
                        disabled={isCompanionTyping}
                        className="text-left text-xs bg-[#FCFAF7] hover:bg-amber-50 border border-amber-100 p-2.5 rounded-xl text-amber-900 outline-none transition-all cursor-pointer font-medium hover:pl-3.5"
                      >
                        ✨ "{spark}"
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-amber-50 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInputValue}
                    onChange={(e) => setChatInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                    placeholder={`Draft a warm response to ${selectedMatch.name}...`}
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
            ) : (
              <MelodyVinylLounge 
                selectedMatch={selectedMatch}
                idToken={idToken}
                currentUser={currentUser}
              />
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-white border border-amber-100 rounded-3xl p-12 text-center text-amber-800">
            <p className="text-sm font-medium">Please select a companion from the inbox thread to begin your central dialogue.</p>
          </div>
        )}
      </div>
    </div>
  );
};


// Component 4: Storyroom
interface SavedStory {
  id: string;
  authorName: string;
  authorEmoji: string;
  scenario: string;
  text: string;
  timestamp: string;
}

interface StoryroomProps {
  matches: Profile[];
  storyAuthorId: string;
  setStoryAuthorId: (val: string) => void;
  storyPrompt: string;
  setStoryPrompt: (val: string) => void;
  storyCustomPrompt: string;
  setStoryCustomPrompt: (val: string) => void;
  isGeneratingStory: boolean;
  generatedStory: string;
  storyCollection: SavedStory[];
  savedStorySuccess: boolean;
  handleGenerateStory: () => void;
  handleSaveStoryToMemories: () => void;
  handleDeleteSavedStory: (id: string) => void;
}

export const StoryroomPanel: React.FC<StoryroomProps> = ({
  matches,
  storyAuthorId,
  setStoryAuthorId,
  storyPrompt,
  setStoryPrompt,
  storyCustomPrompt,
  setStoryCustomPrompt,
  isGeneratingStory,
  generatedStory,
  storyCollection,
  savedStorySuccess,
  handleGenerateStory,
  handleSaveStoryToMemories,
  handleDeleteSavedStory
}) => {
  return (
    <div id="storyroom-pane" className="space-y-8 animate-fade-in">
      <div className="bg-white border border-amber-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-serif font-bold text-amber-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600 animate-pulse" />
            <span>Storyroom</span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-700 max-w-2xl">
            Collaborate with your selected companion to draft a romantic, heartwarming narrative scene about a future dream date or a quiet shared memory using Gemini.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="font-serif font-bold text-base text-amber-950 pb-2 border-b border-amber-50">Configure Narrative Settings</h3>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest">Co-Author Companion</label>
              <select
                value={storyAuthorId}
                onChange={(e) => setStoryAuthorId(e.target.value)}
                className="w-full bg-amber-50/40 border border-amber-100 rounded-xl px-3 py-2.5 text-amber-950 font-semibold focus:outline-none text-xs"
              >
                {matches.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.avatarEmoji} {m.name} ({m.occupation})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest">Select Narrative Setting</label>
              <select
                value={storyPrompt}
                onChange={(e) => setStoryPrompt(e.target.value)}
                className="w-full bg-amber-50/40 border border-amber-100 rounded-xl px-3 py-2.5 text-amber-950 font-semibold focus:outline-none text-xs"
              >
                <option value="A peaceful autumn stroll in a coastal town sharing deep childhood memories.">A peaceful autumn stroll in Sausalito</option>
                <option value="Sailing into the golden twilight of a calm ocean, feeling the salty breeze.">Sailing into the golden twilight</option>
                <option value="Growing an organic winter greenhouse together, nurturing rare orchids.">Nurturing a winter greenhouse together</option>
                <option value="A cozy rainy day in a quiet independent bookstore, sharing poetry over coffee.">Cozy rainy day in a quiet bookstore</option>
                <option value="custom">Create Your Own Custom Scenario...</option>
              </select>
            </div>

            {storyPrompt === "custom" && (
              <div className="space-y-2 animate-scale-up">
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest">Custom Scenario Draft</label>
                <textarea
                  value={storyCustomPrompt}
                  onChange={(e) => setStoryCustomPrompt(e.target.value)}
                  placeholder="e.g., Cooking wood-fired sourdough pizzas in a brick oven during a warm summer evening..."
                  className="w-full h-24 bg-amber-50/20 border border-amber-100 rounded-xl p-3 text-xs text-amber-950 focus:outline-none font-medium resize-none"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerateStory}
              disabled={isGeneratingStory || (storyPrompt === "custom" && !storyCustomPrompt.trim())}
              className="w-full py-3.5 bg-blue-700 hover:bg-blue-600 disabled:bg-blue-800/40 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              {isGeneratingStory ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Weaving Your Shared Story...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-blue-100" />
                  <span>Co-Write Story via Gemini</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#FAF5EE] border border-amber-100/70 rounded-3xl p-6 text-amber-900 space-y-2">
            <h4 className="font-serif font-bold text-sm text-amber-950">Why We Co-Write</h4>
            <p className="text-[11px] leading-relaxed text-amber-850 font-medium">
              Shared narratives allow mature hearts to explore compatibility, travel expectations, and mutual humor without pressure. Your generated story will be written in highly refined third-person. Save it to build a co-authored memories library.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {isGeneratingStory ? (
            <div className="bg-white border border-amber-100 rounded-3xl p-12 flex flex-col justify-center items-center text-center space-y-4 min-h-[300px]">
              <div className="w-16 h-16 rounded-full border-4 border-dashed border-blue-500 animate-spin flex items-center justify-center text-2xl">
                📖
              </div>
              <div>
                <h4 className="font-serif font-bold text-amber-950 text-base">Weaving the Golden Threads</h4>
                <p className="text-xs text-amber-700 max-w-sm mt-1 leading-relaxed">
                  Gemini is crafting a cozy, dignified story tailored specifically to your profile details and selected scenario. One moment...
                </p>
              </div>
            </div>
          ) : generatedStory ? (
            <div className="bg-gradient-to-b from-[#FFFDF9] to-[#F7EFE4] border border-amber-200 p-8 rounded-3xl shadow-md space-y-6 animate-scale-up">
              <div className="flex justify-between items-center border-b border-amber-200/50 pb-3">
                <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 fill-blue-100 text-blue-500" />
                  Co-Authored Narrative Scene
                </span>
                <span className="text-xs font-serif font-semibold italic text-amber-800">Chapter draft</span>
              </div>

              <div className="space-y-4">
                {generatedStory.split("\n\n").map((para, idx) => (
                  <p key={idx} className="font-serif text-sm sm:text-base leading-relaxed text-amber-950 text-justify indent-4">
                    {para}
                  </p>
                ))}
              </div>

              <div className="border-t border-amber-200/50 pt-5 flex flex-wrap gap-2 justify-between items-center">
                <button
                  type="button"
                  onClick={handleSaveStoryToMemories}
                  disabled={savedStorySuccess}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border-none ${
                    savedStorySuccess
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-amber-950 hover:bg-amber-900 text-white"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{savedStorySuccess ? "Saved to Memories!" : "Save to Memories Library"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedStory);
                    alert("Story copied to your clipboard!");
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Copy Story Text
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-amber-100 rounded-3xl p-12 flex flex-col justify-center items-center text-center space-y-4 min-h-[300px]">
              <span className="text-4xl">✒️</span>
              <div>
                <h4 className="font-serif font-bold text-amber-950 text-base">Your Narrative Canvas is Blank</h4>
                <p className="text-xs text-amber-700 max-w-sm mt-1 leading-relaxed">
                  Configure your settings on the left sidebar and click "Co-Write" to reveal custom-tailored creative matching stories!
                </p>
              </div>
            </div>
          )}

          <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-amber-950 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-800" />
              <span>Our Co-authored Memories Bookshelf ({storyCollection.length})</span>
            </h3>

            {storyCollection.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-amber-50 rounded-2xl text-center">
                <p className="text-xs text-amber-700 font-medium">Your bookshelf is empty. Write and save stories above to build a beautiful collection!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {storyCollection.map((st) => (
                  <div
                    key={st.id}
                    className="bg-amber-50/20 border border-amber-100/50 p-5 rounded-2xl space-y-3 relative text-left"
                  >
                    <button
                      type="button"
                      onClick={() => handleDeleteSavedStory(st.id)}
                      className="absolute top-4 right-4 text-xs text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer transition-all bg-transparent border-none"
                    >
                      Remove
                    </button>

                    <div className="space-y-1">
                      <span className="text-[10px] bg-white border border-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                        Co-authored with {st.authorEmoji} {st.authorName}
                      </span>
                      <p className="text-[11px] text-amber-800 font-semibold italic mt-1.5">Setting: "{st.scenario}"</p>
                    </div>

                    <p className="font-serif text-xs text-amber-950 leading-relaxed text-justify whitespace-pre-wrap">
                      {st.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// Component 5: Melody & Vinyl Lounge
interface MelodyVinylLoungeProps {
  selectedMatch: Profile;
  idToken: string | null;
  currentUser: string | null;
}

export const MelodyVinylLounge: React.FC<MelodyVinylLoungeProps> = ({
  selectedMatch,
  idToken,
  currentUser
}) => {
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [mood, setMood] = useState<string>("Serene");
  const [instrument, setInstrument] = useState<string>("Warm Piano");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [activeBeat, setActiveBeat] = useState<number>(0);

  // Loaded Vinyl Record State
  const [currentVinyl, setCurrentVinyl] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(75);
  const [volume, setVolume] = useState<number>(0.6);
  const [savedVinyls, setSavedVinyls] = useState<any[]>([]);

  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const vinylCrackleRef = useRef<AudioBufferSourceNode | null>(null);
  const crackleGainRef = useRef<GainNode | null>(null);
  const mainGainRef = useRef<GainNode | null>(null);
  const sequencerTimerRef = useRef<any>(null);
  const sequencerStepRef = useRef<number>(0);

  // Synchronize Live Web Audio Variable parameters
  const bpmRef = useRef<number>(75);
  const volumeRef = useRef<number>(0.6);
  const instrumentRef = useRef<string>("Warm Piano");
  const currentVinylRef = useRef<any>(null);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    volumeRef.current = volume;
    if (mainGainRef.current && audioCtxRef.current) {
      mainGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  useEffect(() => {
    instrumentRef.current = instrument;
  }, [instrument]);

  useEffect(() => {
    currentVinylRef.current = currentVinyl;
  }, [currentVinyl]);

  // Load Saved Singles from LocalStorage
  useEffect(() => {
    if (currentUser) {
      try {
        const saved = localStorage.getItem(`ncd_vinyls_${currentUser}`);
        if (saved) {
          setSavedVinyls(JSON.parse(saved));
        } else {
          setSavedVinyls([]);
        }
      } catch (err) {
        console.error("Failed to load saved vinyls:", err);
      }
    }
  }, [currentUser]);

  // Handle saving to collection
  const handleSaveVinyl = () => {
    if (!currentVinyl || !currentUser) return;
    try {
      const isAlreadySaved = savedVinyls.some(v => v.id === currentVinyl.id);
      if (isAlreadySaved) return;

      const updated = [currentVinyl, ...savedVinyls];
      setSavedVinyls(updated);
      localStorage.setItem(`ncd_vinyls_${currentUser}`, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save vinyl:", err);
    }
  };

  // Handle deleting from collection
  const handleDeleteVinyl = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    try {
      const updated = savedVinyls.filter(v => v.id !== id);
      setSavedVinyls(updated);
      localStorage.setItem(`ncd_vinyls_${currentUser}`, JSON.stringify(updated));
      
      if (currentVinyl?.id === id) {
        handleStopAudio();
        setCurrentVinyl(null);
      }
    } catch (err) {
      console.error("Failed to delete vinyl:", err);
    }
  };

  // Web Audio synthesis - play single note with rich synthesizer
  const playNote = (audioCtx: AudioContext, frequency: number, duration: number, instType: string) => {
    if (!audioCtx || audioCtx.state === "suspended") return;
    
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filterNode = audioCtx.createBiquadFilter();

    osc.connect(filterNode);
    filterNode.connect(gainNode);
    
    // Connect to main master gain node rather than direct destination to enforce volume controls
    if (mainGainRef.current) {
      gainNode.connect(mainGainRef.current);
    } else {
      gainNode.connect(audioCtx.destination);
    }

    // Cozy feedback delay loop (simulated Reverb)
    const delayNode = audioCtx.createDelay();
    delayNode.delayTime.value = 0.35; // 350ms echo
    const delayGain = audioCtx.createGain();
    delayGain.gain.value = 0.28; // 28% feedback decay

    filterNode.connect(delayNode);
    delayNode.connect(delayGain);
    if (mainGainRef.current) {
      delayGain.connect(mainGainRef.current);
    } else {
      delayGain.connect(audioCtx.destination);
    }
    delayGain.connect(delayNode); // feedback!

    if (instType === "Warm Piano") {
      osc.type = "triangle";
      filterNode.type = "lowpass";
      filterNode.frequency.setValueAtTime(800, now);
      filterNode.frequency.exponentialRampToValueAtTime(300, now + duration);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.04); // soft strike
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    } else if (instType === "Cosy Acoustic") {
      osc.type = "triangle";
      filterNode.type = "highpass";
      filterNode.frequency.setValueAtTime(150, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.015); // sharp pluck
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);
    } else if (instType === "Velvet Rhodes") {
      osc.type = "sine";
      
      // Rhodes mallet overtone
      const mallet = audioCtx.createOscillator();
      const malletGain = audioCtx.createGain();
      mallet.type = "triangle";
      mallet.frequency.setValueAtTime(frequency * 3, now);
      mallet.connect(malletGain);
      
      if (mainGainRef.current) {
        malletGain.connect(mainGainRef.current);
      } else {
        malletGain.connect(audioCtx.destination);
      }

      malletGain.gain.setValueAtTime(0.06, now);
      malletGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      mallet.start(now);
      mallet.stop(now + 0.2);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.35, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.3);
    } else { // Ambient Pad
      osc.type = "sine";
      filterNode.type = "lowpass";
      filterNode.frequency.setValueAtTime(450, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.6); // very slow fade-in
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.6);
    }

    osc.frequency.setValueAtTime(frequency, now);
    osc.start(now);
    osc.stop(now + duration * 1.8);
  };

  // Preset Scales matching backend Key output
  const SCALE_KEYS: Record<string, { roots: number[]; notes: number[] }> = {
    "A Minor Pentatonic": {
      roots: [110.00, 130.81, 146.83, 164.81], // A2, C3, D3, E3
      notes: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]
    },
    "C Major Pentatonic": {
      roots: [130.81, 146.83, 164.81, 196.00], // C3, D3, E3, G3
      notes: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99]
    },
    "G Major Pentatonic": {
      roots: [98.00, 110.00, 123.47, 146.83], // G2, A2, B2, D3
      notes: [196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00, 493.88, 587.33]
    },
    "E Minor Pentatonic": {
      roots: [82.41, 98.00, 110.00, 123.47], // E2, G2, A2, B2
      notes: [164.81, 196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00, 493.88]
    },
    "D Minor Pentatonic": {
      roots: [146.83, 174.61, 196.00, 220.00], // D3, F3, G3, A3
      notes: [293.66, 349.23, 392.00, 440.00, 523.25, 587.33, 698.46, 783.99, 880.00]
    }
  };

  // Start the procedurally generated ambient music sequencer loop
  const handleStartAudio = async (vinylToPlay: any) => {
    if (!vinylToPlay) return;

    try {
      // 1. Create or Resume AudioContext
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      // 2. Stop existing sequencer/loops if running
      handleStopAudio();

      // 3. Set up master controls
      mainGainRef.current = audioCtx.createGain();
      mainGainRef.current.gain.setValueAtTime(volumeRef.current, audioCtx.currentTime);
      mainGainRef.current.connect(audioCtx.destination);

      // 4. Synthesize Physical Vinyl Hiss & Crackle procedurally
      const sampleRate = audioCtx.sampleRate;
      const bufferSize = sampleRate * 2; // 2 seconds of loop
      const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // base quiet cozy white-noise hiss
        const hiss = (Math.random() * 2 - 1) * 0.004;
        // retro dynamic pop dust crackles
        let pop = 0;
        if (Math.random() < 0.00015) {
          pop = (Math.random() * 2 - 1) * 0.15;
        }
        data[i] = hiss + pop;
      }

      const crackleNode = audioCtx.createBufferSource();
      crackleNode.buffer = buffer;
      crackleNode.loop = true;

      crackleGainRef.current = audioCtx.createGain();
      crackleGainRef.current.gain.setValueAtTime(0.18, audioCtx.currentTime); // pleasant volume

      crackleNode.connect(crackleGainRef.current);
      crackleGainRef.current.connect(mainGainRef.current);
      crackleNode.start();
      vinylCrackleRef.current = crackleNode;

      // 5. Start scheduling the sequencer notes
      setIsPlaying(true);
      sequencerStepRef.current = 0;

      const scheduleNextStep = () => {
        const activeVinyl = currentVinylRef.current || vinylToPlay;
        const scaleKey = activeVinyl?.melodyKey || "A Minor Pentatonic";
        const map = SCALE_KEYS[scaleKey] || SCALE_KEYS["A Minor Pentatonic"];
        const currentBpm = bpmRef.current;
        const currentInstrument = instrumentRef.current;
        const secondsPerBeat = 60 / currentBpm;

        const currentStep = sequencerStepRef.current;

        // Visual equalizer jumps
        setActiveBeat((prev) => (prev + 1) % 6);

        // Root bass note on beat 0 and beat 8 of 16-step cycle
        if (currentStep % 8 === 0) {
          const rootIdx = Math.floor(currentStep / 8) % map.roots.length;
          playNote(audioCtx, map.roots[rootIdx], secondsPerBeat * 3, currentInstrument);
        }

        // Ambient melody note (75% probability on beat steps, 25% on other odd steps)
        const isOdd = currentStep % 2 !== 0;
        const playProb = isOdd ? 0.25 : 0.75;
        if (Math.random() < playProb) {
          const noteIdx = Math.floor(Math.random() * map.notes.length);
          playNote(audioCtx, map.notes[noteIdx], secondsPerBeat * 1.1, currentInstrument);
        }

        // Increment step
        sequencerStepRef.current = (currentStep + 1) % 16;

        // Schedule next step recursively based on dynamic BPM
        sequencerTimerRef.current = setTimeout(scheduleNextStep, secondsPerBeat * 500); // 8th note speed (secondsPerBeat * 500ms)
      };

      scheduleNextStep();
    } catch (err) {
      console.error("Failed to start Web Audio synthesis:", err);
    }
  };

  const handleStopAudio = () => {
    setIsPlaying(false);
    if (sequencerTimerRef.current) {
      clearTimeout(sequencerTimerRef.current);
      sequencerTimerRef.current = null;
    }
    if (vinylCrackleRef.current) {
      try {
        vinylCrackleRef.current.stop();
      } catch (e) {}
      vinylCrackleRef.current = null;
    }
    crackleGainRef.current = null;
    mainGainRef.current = null;
  };

  // Toggle Play / Pause
  const handleTogglePlay = async () => {
    if (isPlaying) {
      handleStopAudio();
    } else {
      if (currentVinyl) {
        await handleStartAudio(currentVinyl);
      }
    }
  };

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      handleStopAudio();
    };
  }, []);

  // Co-create Action
  const handleCoCreateVinyl = async () => {
    if (!idToken) return;
    try {
      setIsGenerating(true);
      setGenerationError(null);
      handleStopAudio();

      const messages = [
        "Sweeping the mahogany record shelves...",
        "Dusting the antique copper needle...",
        `${selectedMatch.name} is humming a soft chord progression...`,
        "Co-writing the nostalgic acoustic verses...",
        "Formulating the perfect pentatonic scale..."
      ];

      let msgIndex = 0;
      setStatusMessage(messages[0]);
      const statusInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        setStatusMessage(messages[msgIndex]);
      }, 2000);

      const res = await fetch("/api/generate-melody", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          companionId: selectedMatch.id,
          userPrompt: userPrompt,
          mood: mood,
          instrument: instrument,
          userName: currentUser || "Companion",
          userAge: 60
        })
      });

      clearInterval(statusInterval);
      const data = await res.json();

      if (data && data.title) {
        const newVinyl = {
          id: `vinyl_${Date.now()}`,
          companionId: selectedMatch.id,
          companionName: selectedMatch.name,
          companionEmoji: selectedMatch.avatarEmoji,
          title: data.title,
          lyrics: data.lyrics,
          linerNotes: data.linerNotes,
          recommendedBpm: data.recommendedBpm || 75,
          melodyKey: data.melodyKey || "A Minor Pentatonic",
          coverGradient: data.coverGradient || ["#0f172a", "#334155"],
          instrument: instrument,
          timestamp: new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
        };

        setCurrentVinyl(newVinyl);
        setBpm(newVinyl.recommendedBpm);
        setUserPrompt(""); // Clear input

        // Automatically start playing the newly generated single!
        setTimeout(() => {
          handleStartAudio(newVinyl);
        }, 300);
      } else {
        throw new Error("Invalid response schema from generator");
      }
    } catch (err: any) {
      console.error("Vinyl co-creation failed:", err);
      setGenerationError(err.message || "Something went wrong while generating the vinyl single.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Load a Saved Single on the Turntable
  const handleLoadSavedVinyl = async (vinyl: any) => {
    handleStopAudio();
    setCurrentVinyl(vinyl);
    setBpm(vinyl.recommendedBpm);
    setInstrument(vinyl.instrument || "Warm Piano");
    
    // Automatically spin & play!
    setTimeout(() => {
      handleStartAudio(vinyl);
    }, 300);
  };

  // Preset Inspirations list
  const INSPIRATION_PRESETS = [
    "First slow coffee in the harbor café",
    "Sailing into the amber sunset together",
    "A quiet rainy afternoon reading poetry",
    "Walking through the whispering coastal forest",
    "Sharing stories under a canopy of stars"
  ];

  return (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Physical Turntable Player */}
        <div className="xl:col-span-5 flex flex-col items-center">
          <div className="w-full bg-[#1C1917] border-4 border-[#2E2A27] rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center">
            
            {/* Turntable Gold Ring Border */}
            <div className="absolute top-2 left-2 right-2 h-1 bg-[#D97706]/10 rounded-full" />
            
            {/* 1. Vintage Turntable Deck */}
            <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-[#141210] border-8 border-[#2E2A27] shadow-inner relative flex items-center justify-center">
              
              {/* Brushed metal circles inside turntable */}
              <div className="absolute inset-4 rounded-full border border-stone-800/40" />
              <div className="absolute inset-10 rounded-full border border-stone-800/40" />
              <div className="absolute inset-16 rounded-full border border-stone-800/40 animate-pulse" />

              {/* SPINNING VINYL RECORD */}
              <div 
                className={`w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-stone-900 shadow-2xl relative flex items-center justify-center border-4 border-stone-950 select-none ${
                  isPlaying ? "animate-[spin_4s_linear_infinite]" : "transition-transform duration-700"
                }`}
              >
                {/* Vinyl Grooves (radial lines simulated with gradients) */}
                <div className="absolute inset-2 rounded-full border border-stone-800/30" />
                <div className="absolute inset-6 rounded-full border border-stone-800/30" />
                <div className="absolute inset-10 rounded-full border border-stone-800/30" />
                <div className="absolute inset-14 rounded-full border border-stone-800/30" />
                <div className="absolute inset-20 rounded-full border border-stone-800/30" />

                {/* Central Record Label colored with Gradient */}
                <div 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl shadow-md border-2 border-stone-950 relative overflow-hidden transition-all duration-500"
                  style={{
                    background: currentVinyl 
                      ? `linear-gradient(135deg, ${currentVinyl.coverGradient[0]}, ${currentVinyl.coverGradient[1]})`
                      : "linear-gradient(135deg, #444, #222)"
                  }}
                >
                  {/* Dynamic center sticker content */}
                  <span className="drop-shadow-sm select-none z-10 animate-pulse-subtle">
                    {currentVinyl ? currentVinyl.companionEmoji : "💿"}
                  </span>
                  
                  {/* Outer circle of the label sticker */}
                  <div className="absolute inset-1 rounded-full border border-white/20" />
                </div>

                {/* Record Center Pin spindle hole */}
                <div className="absolute w-2 h-2 rounded-full bg-[#1C1917] border border-stone-700 z-20" />
              </div>

              {/* TONEARM / NEEDLE (Swivels onto record when playing) */}
              <div 
                className="absolute top-4 right-4 w-28 h-32 origin-top-right transition-transform duration-700 ease-out z-30 select-none pointer-events-none"
                style={{
                  transform: isPlaying ? "rotate(24deg)" : "rotate(0deg)"
                }}
              >
                {/* Arm metallic body line */}
                <svg className="w-full h-full" viewBox="0 0 100 120" fill="none">
                  <path d="M90,10 L70,30 L55,70 L40,110" stroke="#78716c" strokeWidth="4" strokeLinecap="round" />
                  {/* Pivot joint */}
                  <circle cx="90" cy="10" r="12" fill="#444" stroke="#666" strokeWidth="2" />
                  <circle cx="90" cy="10" r="4" fill="#a8a29e" />
                  {/* Cartridge headshell weight */}
                  <rect x="30" y="102" width="20" height="12" rx="2" transform="rotate(-15 30 102)" fill="#1c1917" stroke="#444" />
                  <circle cx="40" cy="108" r="2" fill="#ef4444" />
                </svg>
              </div>
            </div>

            {/* Equalizer Visualizer Bars */}
            <div className="flex items-end gap-1.5 h-8 mt-5 select-none">
              {Array.from({ length: 8 }).map((_, i) => {
                const heightClass = isPlaying 
                  ? [
                      "h-3 animate-[pulse_1.2s_infinite]", 
                      "h-7 animate-[pulse_0.8s_infinite_0.1s]", 
                      "h-5 animate-[pulse_1.5s_infinite_0.2s]", 
                      "h-8 animate-[pulse_0.6s_infinite_0.3s]", 
                      "h-4 animate-[pulse_1s_infinite_0.15s]", 
                      "h-6 animate-[pulse_0.9s_infinite_0.25s]",
                      "h-3 animate-[pulse_1.3s_infinite_0.05s]",
                      "h-5 animate-[pulse_0.7s_infinite_0.4s]"
                    ][i % 8]
                  : "h-1";
                return (
                  <div 
                    key={i} 
                    className={`w-1.5 bg-gradient-to-t from-rose-500 to-amber-400 rounded-full transition-all duration-300 ${heightClass}`} 
                  />
                );
              })}
            </div>

            {/* Status Information Display */}
            <div className="w-full text-center mt-4">
              <p className="text-[10px] font-mono font-semibold text-[#D97706] tracking-widest uppercase">
                {isPlaying ? "● PLAYING SINGLE" : "■ SYSTEM STANDBY"}
              </p>
              <h4 className="font-serif font-bold text-stone-100 text-sm truncate mt-1 max-w-[220px] mx-auto">
                {currentVinyl ? currentVinyl.title : "No Record Loaded"}
              </h4>
              <p className="text-[10px] text-stone-400 font-medium mt-0.5">
                {currentVinyl ? `Artist: ${currentVinyl.companionName} & You` : "Generate a custom single to spin!"}
              </p>
            </div>

            {/* Playback Controls and Volume sliders */}
            <div className="w-full grid grid-cols-1 gap-4 mt-5 border-t border-stone-800 pt-4">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleTogglePlay}
                  disabled={!currentVinyl}
                  className="p-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:hover:bg-amber-500 text-stone-950 rounded-full transition-all shadow-md flex items-center justify-center cursor-pointer outline-none shrink-0"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-stone-950" /> : <Play className="w-5 h-5 fill-stone-950 ml-0.5" />}
                </button>

                <div className="bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-16 accent-amber-500 h-1 bg-stone-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#141210] border border-stone-800 rounded-xl p-2.5 space-y-1.5">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Tempo (BPM)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="60"
                      max="120"
                      value={bpm}
                      onChange={(e) => setBpm(Number(e.target.value))}
                      className="flex-1 accent-amber-500 h-1 bg-stone-700 rounded-lg cursor-pointer"
                    />
                    <span className="font-mono text-[10px] font-semibold text-amber-500 min-w-[20px]">{bpm}</span>
                  </div>
                </div>

                <div className="bg-[#141210] border border-stone-800 rounded-xl p-2.5 space-y-1">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Instrument</span>
                  <select
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value)}
                    className="w-full bg-stone-900 text-stone-200 border border-stone-800 rounded-lg py-1 px-1.5 text-[10px] focus:outline-none font-medium"
                  >
                    <option value="Warm Piano">Warm Piano</option>
                    <option value="Cosy Acoustic">Cozy Acoustic</option>
                    <option value="Velvet Rhodes">Velvet Rhodes</option>
                    <option value="Ambient Pad">Ambient Pad</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Quick instructions */}
          <div className="mt-4 text-center">
            <span className="text-[10px] text-amber-900 font-bold bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
              🔊 Synthesized live using Web Audio API & Vinyl Hiss
            </span>
          </div>
        </div>

        {/* Right Column: Workstation & Co-Creation Panel */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="font-serif font-bold text-base text-amber-950 pb-2 border-b border-amber-50">Co-Composer Workstation</h3>
            
            <div className="space-y-4">
              {/* Vibe Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest">Select Musical Mood</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {["Serene", "Warm", "Mellow", "Nostalgic", "Playful"].map((m) => {
                    const isSel = mood === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMood(m)}
                        className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer outline-none ${
                          isSel
                            ? "bg-amber-950 text-white border-amber-950 shadow-xs"
                            : "bg-[#FCFAF7] border-amber-100 text-amber-900 hover:bg-amber-50/50"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Theme Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest">Single Theme / Inspiration</label>
                <div className="relative">
                  <input
                    type="text"
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder={`Compose a memory theme... e.g. "Sunset walk in Sausalito"`}
                    className="w-full bg-amber-50/40 border border-amber-100 rounded-xl pl-3.5 pr-10 py-3 text-xs text-amber-950 outline-none focus:ring-1 focus:ring-amber-300 focus:bg-white transition-all font-medium placeholder-amber-800/40"
                  />
                  <Sparkles className="w-4 h-4 text-rose-500 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Inspiration Presets */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-amber-900 uppercase tracking-wider">Inspiration Seeds (Tap to insert)</span>
                <div className="flex flex-wrap gap-1.5">
                  {INSPIRATION_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setUserPrompt(preset)}
                      className="text-left text-[10px] bg-amber-50/20 hover:bg-amber-50 border border-amber-100/40 px-2.5 py-1.5 rounded-lg text-amber-900 outline-none transition-all cursor-pointer font-medium"
                    >
                      ✨ "{preset}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Error block */}
              {generationError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-800 text-xs font-medium">
                  ⚠️ {generationError}
                </div>
              )}

              {/* Generation Button */}
              <button
                type="button"
                onClick={handleCoCreateVinyl}
                disabled={isGenerating}
                className="w-full py-3.5 bg-amber-950 hover:bg-amber-900 disabled:opacity-60 text-white rounded-xl shadow-md font-bold text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 outline-none"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{statusMessage}</span>
                  </>
                ) : (
                  <>
                    <Music className="w-4 h-4 text-rose-400" />
                    <span>Co-Create Ambient Single with {selectedMatch.name}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Co-created Single Details Card */}
          {currentVinyl && (
            <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-sm space-y-4 animate-scale-up">
              <div className="flex items-start justify-between border-b border-amber-50 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-100 font-bold px-2 py-0.5 rounded-md">
                    📀 Co-Authored Record Single
                  </span>
                  <h4 className="font-serif font-bold text-lg text-amber-950 mt-1">{currentVinyl.title}</h4>
                  <p className="text-xs text-amber-700 font-semibold">
                    Composers: {currentVinyl.companionEmoji} {currentVinyl.companionName} & You • Key: {currentVinyl.melodyKey}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveVinyl}
                  disabled={savedVinyls.some(v => v.id === currentVinyl.id)}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-50 disabled:text-emerald-700 disabled:border-emerald-150 border border-transparent disabled:opacity-100 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 outline-none"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savedVinyls.some(v => v.id === currentVinyl.id) ? "Saved to Library" : "Save Single"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                {/* Poetry Lyrics */}
                <div className="bg-[#FAF8F5] border border-amber-50 rounded-2xl p-4 space-y-2">
                  <h5 className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block border-b border-amber-100/60 pb-1.5">Verse / Lyrics</h5>
                  <p className="font-serif text-xs text-amber-950 leading-relaxed italic whitespace-pre-line text-center py-2">
                    "{currentVinyl.lyrics}"
                  </p>
                </div>

                {/* Liner Notes */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-[#b45309] uppercase tracking-wider block pb-1 border-b border-amber-100/30">Liner Notes (Co-Artist Insight)</h5>
                  <p className="text-xs text-amber-900/95 leading-relaxed font-medium">
                    {currentVinyl.linerNotes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HORIZONTAL GALLERY: Saved Singles Library */}
      <div className="bg-white border border-amber-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-amber-50">
          <Disc className="w-5 h-5 text-amber-900 animate-[spin_5s_linear_infinite]" />
          <h3 className="font-serif font-bold text-base text-amber-950">Your Saved Singles Library ({savedVinyls.length})</h3>
        </div>

        {savedVinyls.length === 0 ? (
          <div className="p-8 text-center text-amber-800/60 bg-amber-50/10 border border-dashed border-amber-100 rounded-2xl flex flex-col items-center justify-center gap-1.5">
            <Music className="w-8 h-8 text-amber-200" />
            <p className="text-xs font-semibold">Your shelf is quiet. Co-create a single above to save your first memory disc!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {savedVinyls.map((v) => {
              const isCurrent = currentVinyl?.id === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => handleLoadSavedVinyl(v)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative overflow-hidden group flex items-center gap-3.5 ${
                    isCurrent
                      ? "bg-amber-50/50 border-amber-200/80 shadow-xs"
                      : "bg-[#FCFAF7]/50 hover:bg-amber-50/20 border-amber-100/40"
                  }`}
                >
                  {/* Miniature album jacket */}
                  <div 
                    className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center text-xl shadow-md border border-stone-800/10 relative transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${v.coverGradient[0]}, ${v.coverGradient[1]})`
                    }}
                  >
                    <span className="drop-shadow-sm select-none z-10">{v.companionEmoji}</span>
                    <div className="absolute inset-0.5 rounded-lg border border-white/10" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-serif font-bold text-amber-950 text-xs truncate leading-tight">
                      {v.title}
                    </h4>
                    <p className="text-[10px] text-amber-700 font-medium truncate mt-0.5">
                      with {v.companionName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] font-mono text-amber-800 bg-amber-50 px-1 py-0.2 rounded font-semibold">{v.melodyKey.split(" ")[0]} key</span>
                      <span className="text-[9px] text-amber-600 font-semibold">{v.timestamp}</span>
                    </div>
                  </div>

                  {/* Remove disc button */}
                  <button
                    onClick={(e) => handleDeleteVinyl(v.id, e)}
                    className="opacity-0 group-hover:opacity-100 absolute top-2.5 right-2.5 text-stone-400 hover:text-red-500 hover:scale-105 transition-all p-1 bg-white border border-stone-100 rounded-lg shadow-sm cursor-pointer outline-none shrink-0"
                    title="Remove single from library"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

