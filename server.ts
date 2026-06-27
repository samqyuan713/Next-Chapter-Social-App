/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded GoogleGenAI client to prevent startup crash if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Prebaked high-fidelity mature match profiles for "Next Chapter Dating"
const MATCH_PROFILES = [
  {
    id: "arthur",
    name: "Arthur",
    age: 68,
    location: "Oakwood Hills, IL",
    occupation: "Retired History Professor",
    relationshipGoal: "Companionship & Conversation",
    chapterTheme: "Intellectual Leisure & Gardening",
    interests: ["Classical Music", "Biographies", "Organic Gardening", "Museum Strolls", "Afternoon Tea"],
    values: ["Intellectual curiosity", "Gentle patience", "Lifelong learning", "Quiet walks"],
    bio: "After 35 years in the classroom, I'm enjoying a slower pace. I spend my mornings growing heirloom tomatoes and my afternoons reading near the window. Widowed four years ago, I find myself missing deep, thoughtful conversation over Earl Grey, museum strolls, and a companion to share the quiet beauty of this season.",
    avatarEmoji: "👨‍🏫",
    avatarColor: "from-amber-100 to-amber-200 text-amber-800",
    height: 71, // 5'11"
    weight: 175,
    gender: "Male"
  },
  {
    id: "evelyn",
    name: "Evelyn",
    age: 62,
    location: "Sausalito, CA",
    occupation: "Contemporary Art Curator",
    relationshipGoal: "Romance & Shared Creativity",
    chapterTheme: "Passionate Expression & Coast Road Trips",
    interests: ["Watercolor Painting", "Coastal Hiking", "Independent Film", "Foreign Languages", "Baking Sourdough", "Yoga & Stretching", "Kayaking"],
    values: ["Self-expression", "Spontaneity", "Empathy", "Vibrancy"],
    bio: "Life's next chapter isn't a retirement from passion; it's a blank canvas! I curate art exhibits and paint seaside landscapes. I love spontaneous coastal drives, farmers' markets, indie cinemas, and sharing laughter over a glass of Pinot Noir. Seeking someone open-minded, ready for new trails, and looking to paint a vivid chapter together.",
    avatarEmoji: "🎨",
    avatarColor: "from-rose-100 to-rose-200 text-rose-800",
    height: 66, // 5'6"
    weight: 132,
    gender: "Female"
  },
  {
    id: "frank",
    name: "Frank",
    age: 74,
    location: "Savannah, GA",
    occupation: "Retired Airline Captain & Navy Veteran",
    relationshipGoal: "Companion for Travel & Good Food",
    chapterTheme: "Sunsets & Slow Sailing",
    interests: ["Sailing", "Woodworking", "Jazz Classics", "Wood-fired Cooking", "Local History", "Golf outings", "Fly Fishing"],
    values: ["Honor", "Humor in all things", "Active lifestyle", "Simple moments"],
    bio: "I spent my life in the skies, but now my feet are firmly planted on the dock. I restore vintage sailboats and smoke a mean brisket for neighbors. I appreciate live jazz, a well-placed joke, and warm Savannah nights. Looking for a warm, caring companion to share the captain's bench—both on the river and in simple daily rhythms.",
    avatarEmoji: "⛵",
    avatarColor: "from-blue-100 to-blue-200 text-blue-800",
    height: 73, // 6'1"
    weight: 195,
    gender: "Male"
  },
  {
    id: "miriam",
    name: "Miriam",
    age: 59,
    location: "Portland, OR",
    occupation: "High-School Drama Director",
    relationshipGoal: "Deep Friendship & Cultural Outings",
    chapterTheme: "Community, Theater & Tea Houses",
    interests: ["Local Playhouses", "Cozy Bookstores", "Horticulture", "Farmers' Markets", "Gourmet Dessert Baking", "Tai Chi", "Swimming laps"],
    values: ["Community care", "Creative laughter", "Family-centric life", "Warm hearth"],
    bio: "I teach students how to find their true voices on stage. Outside of school, I have a deep passion for horticulture, cozy tea shops, and community theater. I love baking tarts and cuddling with my golden retriever. Looking for a genuine, kind person who enjoys local plays, acoustic guitar, and believes kindness is the best currency.",
    avatarEmoji: "🎭",
    avatarColor: "from-purple-100 to-purple-200 text-purple-800",
    height: 64, // 5'4"
    weight: 140,
    gender: "Female"
  },
  {
    id: "diana",
    name: "Diana",
    age: 65,
    location: "Boulder, CO",
    occupation: "Retired Wildlife Veterinarian",
    relationshipGoal: "Outdoor Companion & Slow Living",
    chapterTheme: "Nature Healing & Photography",
    interests: ["Wildlife Photography", "Snowshoeing", "Cabin Retreats", "Botanical Pressing", "Acoustic Folk", "Bicycle Rides", "Yoga & Stretching"],
    values: ["Environmental stewardship", "Peace of mind", "Kindness to creatures", "Simplicity"],
    bio: "I retired from caring for boulder's local wildlife, but nature remains my sanctuary. You can usually find me with a telephoto lens tracking birds or pressing botanical specimens. I live simply, cherish morning silence, and listen to acoustic guitar. Seeking a partner who loves fresh mountain air, quiet road trips, and cozy evenings near a woodstove.",
    avatarEmoji: "🦉",
    avatarColor: "from-emerald-100 to-emerald-200 text-emerald-800",
    height: 67, // 5'7"
    weight: 135,
    gender: "Female"
  },
  {
    id: "clara",
    name: "Clara",
    age: 56,
    location: "Sausalito, CA",
    occupation: "Landscape Architect & Botanist",
    relationshipGoal: "Companionship & Shared Outings",
    chapterTheme: "Early Coastal Mists & Flora Designs",
    interests: ["Horticulture", "Watercolor Painting", "Kayaking", "Yoga & Stretching", "Bicycle Rides", "Fly Fishing"],
    values: ["Patience", "Nature alignment", "Kindness", "Serenity"],
    bio: "Designing gardens has taught me that the finest blooms take patience. I'm Clara, looking for someone who loves early morning coastal mist, light hikes, and sharing quiet laughter. Let's design our next vibrant landscape together.",
    avatarEmoji: "🌿",
    avatarColor: "from-teal-100 to-emerald-200 text-emerald-900",
    height: 65, // 5'5"
    weight: 125,
    gender: "Female"
  },
  {
    id: "eleanor",
    name: "Eleanor",
    age: 71,
    location: "Oakwood Hills, IL",
    occupation: "Retired Symphony Violinist",
    relationshipGoal: "Intellectual Depth & Conversation",
    chapterTheme: "Chamber Melodies & Warm Herbal Teas",
    interests: ["Classical Music", "Acoustic Folk", "Museum Strolls", "Tai Chi", "Cozy Bookstores"],
    values: ["Harmony", "Cultural preservation", "Deep listening", "Polite wisdom"],
    bio: "After a lifetime of playing concertos, I appreciate the beautiful spaces between the notes. I love intimate chamber concerts, herbal tea, and discussing local history. Hoping to find a kindred spirit for thoughtful morning chats.",
    avatarEmoji: "🎻",
    avatarColor: "from-fuchsia-100 to-purple-250 text-purple-900",
    height: 63, // 5'3"
    weight: 118,
    gender: "Female"
  },
  {
    id: "grace",
    name: "Grace",
    age: 67,
    location: "Portland, OR",
    occupation: "Organic Bakery Owner",
    relationshipGoal: "Romance & Shared Travels",
    chapterTheme: "Sweet Aromas & Active Court Sports",
    interests: ["Baking Sourdough", "Gourmet Dessert Baking", "Farmers' Markets", "Swimming laps", "Pickleball"],
    values: ["Honesty", "Vitality", "Nourishment", "Joyful activity"],
    bio: "Sweet smells and warm ovens make a house a home. I spend my days baking healthy artisanal breads and playing doubles pickleball. I'm searching for an active partner who enjoys foodie adventures, travel, and honest, warm connections.",
    avatarEmoji: "🥐",
    avatarColor: "from-amber-100 to-orange-200 text-amber-950",
    height: 68, // 5'8"
    weight: 145,
    gender: "Female"
  },
  {
    id: "takashi",
    name: "Takashi",
    age: 63,
    location: "Kyoto, Japan",
    occupation: "Retired Traditional Architect & Bonsai Master",
    relationshipGoal: "Slow Life & Shared Journeys",
    chapterTheme: "Stone Gardens & Pine Trimming",
    interests: ["Bonsai Cultivation", "Watercolor Painting", "Classical Music", "Tea Ceremonies", "Cozy Bookstores"],
    values: ["Harmony", "Quiet discipline", "Minimalism", "Respect for nature"],
    bio: "After decades of restoring wooden temples in Kyoto, I now spend my time cultivating miniature bonsai pines and practicing traditional calligraphy. I cherish structured silence, hot sencha tea, and gentle bike rides. Seeking an open-hearted companion to enjoy the quiet transition of seasons, poetry, and occasional travels.",
    avatarEmoji: "🪴",
    avatarColor: "from-emerald-100 to-teal-100 text-teal-900",
    height: 66, // 5'6"
    weight: 140,
    gender: "Male"
  },
  {
    id: "meiling",
    name: "Mei-Ling",
    age: 58,
    location: "Singapore",
    occupation: "Retired Pastry Chef & Orchid Botanist",
    relationshipGoal: "Friendship & Culinary Adventures",
    chapterTheme: "Sweet Vanilla & Orchid Greenhouse",
    interests: ["Horticulture", "Gourmet Dessert Baking", "Tai Chi", "Farmers' Markets", "Kayaking"],
    values: ["Warm hospitality", "Generosity", "Lifelong vitality", "Vibrant colors"],
    bio: "I spent my life in busy Singapore kitchens, but now my sanctuary is my greenhouse filled with rare orchids. I still bake daily—there's always sourdough or cardamom buns on the counter. Looking for an active, enthusiastic partner to travel, try exotic street foods, and practice peaceful Tai Chi with on sunny mornings.",
    avatarEmoji: "🌸",
    avatarColor: "from-pink-100 to-rose-200 text-rose-950",
    height: 62, // 5'2"
    weight: 122,
    gender: "Female"
  },
  {
    id: "sanjay",
    name: "Sanjay",
    age: 65,
    location: "Mumbai, India",
    occupation: "Retired Ayurvedic Wellness Consultant",
    relationshipGoal: "Spiritual Connection & Shared Living",
    chapterTheme: "Warm Spices & Mindful Mornings",
    interests: ["Yoga & Stretching", "Acoustic Folk", "Biographies", "Organic Gardening", "Museum Strolls"],
    values: ["Mindfulness", "Inner peace", "Holistic health", "Compassion"],
    bio: "Having spent forty years helping people find inner balance, I am enjoying my own quiet days of morning pranayama, nurturing my terrace herb garden, and reading biographies. I listen to classical instrumental tunes and enjoy making spiced chai from scratch. Seeking a kind, conscious partner for walks, travels, and soulful conversations.",
    avatarEmoji: "🧘‍♂️",
    avatarColor: "from-amber-100 to-yellow-250 text-amber-950",
    height: 69, // 5'9"
    weight: 158,
    gender: "Male"
  }
];

const PERSONA_PROMPTS: Record<string, string> = {
  arthur: "You are Arthur, a 68-year-old retired history professor. You speak with warm academic gentle kindness, polite respectfulness, and supportive wisdom. You love classical music, old leather books, sipping tea, museum strolling, and organic gardening. You are searching for elegant companionship and genuine emotional warmth. Respond in 2-4 sentences, always staying fully in character, asking thoughtful questions about the user's feelings and perspective in a gentle manner.",
  evelyn: "You are Evelyn, a 62-year-old abstract artist and curator. You speak with passionate enthusiasm, vibrant creative flair, warmth, and supportive curiosity. You love coastal road trips, watercolors, foreign cinema, sourdough baking, and deep coffee chats. Retiring means a glowing canvas for you. Suggest a museum date or road trip when fitting. Keep replies under 3 sentences, vibrant, expressive, and friendly. Always stay in character.",
  frank: "You are Frank, a 74-year-old retired flight captain and navy veteran. You are humble, cheerful, practical, and highly caring. You enjoy wood-fired cooking, local jazz spots, woodworking, and sunset sailing. You adore your grandkids, love sharing stories of life, yet you crave a real companion to sit on sunset gardens with. Reply with pilots' warm hospitality, around 2-3 sentences. Ask user what they love cooking or what acoustic tunes they like. Always stay in character.",
  miriam: "You are Miriam, a 59-year-old community theater director. You are expressive, encouraging, warm, and highly social. Your passion lies in plays, baking tarts, garden horticulture, and cozy bookstore readings. You value deep, heartfelt emotional empathy and lighthearted laughter. Reply with warm artistic dramatic flair, around 2-3 sentences, asking cozy questions. Always stay in character.",
  diana: "You are Diana, a 65-year-old retired wildlife vet. You are quiet, observational, peaceful, deeply grounded, and nature-loving. You spend days with photography, quiet Boulder mountain cabin retreats, snowshoeing, and Pressing wildflower collections. Keep replies calm, peaceful, warm, and short (2-3 sentences). Ask about their favorite nature memories or cozy cabins. Always stay in character.",
  clara: "You are Clara, a 56-year-old landscape architect and botanist. You speak with warm patience, deep appreciation for nature, and quiet elegance. You love horticulture, watercolor painting, kayaking, and bicycle rides. Keep replies calm, friendly, and nature-centric, around 2-3 sentences. Always stay in character.",
  eleanor: "You are Eleanor, a 71-year-old retired symphony violinist. You speak with graceful wisdom, cultural refinement, and artistic sensitivity. You enjoy classical concertos, cosy bookstores, herbal tea, and Tai Chi. Keep replies elegant, warm, and reflective, around 2-3 sentences. Always stay in character.",
  grace: "You are Grace, a 67-year-old organic bakery owner. You speak with vibrant hospitality, active energy, and warm humor. You enjoy baking sourdough, doubles pickleball, and swimming. Keep replies lively, welcoming, and sweet, around 2-3 sentences. Always stay in character.",
  takashi: "You are Takashi, a 63-year-old traditional architect and bonsai master from Kyoto. You speak with polite serenity, patient grace, and deep appreciation for subtle beauty and harmony. You love bonsai trimming, calligraphy, classical music, and tea ceremonies. Keep replies calm, poetic, and polite, around 2-3 sentences. Always stay in character.",
  meiling: "You are Mei-Ling, a 58-year-old retired pastry chef and orchid botanist from Singapore. You speak with warm, generous hospitality, cheerful energy, and culinary passion. You love baking, nurturing exotic orchids, Tai Chi, and outdoor adventures. Keep replies vibrant, sweet, and friendly, around 2-3 sentences. Always stay in character.",
  sanjay: "You are Sanjay, a 65-year-old retired Ayurvedic wellness consultant from Mumbai. You speak with mindful compassion, grounded wisdom, and holistic warmth. You love yoga, herb gardening, biographies, and brewing spiced chai from scratch. Keep replies thoughtful, warm, and comforting, around 2-3 sentences. Always stay in character."
};

// Simulated responses if GEMINI_API_KEY is not configured
const FALLBACK_RESPONSES: Record<string, string[]> = {
  arthur: [
    "That is highly fascinating. Truly, understanding our history helps us appreciate the beautiful tapestry of today's next chapter.",
    "I would love to accompany you on a peaceful walk through the local arboretum. There is nothing quite like fine conversation among the flora.",
    "A wonderful answer. It reminds me of a beautiful quote on companion friendship. Shall we share another tea together?",
    "How lovely to hear. I am eager to know: what is your absolute favorite book or melody that brings you tranquility?"
  ],
  evelyn: [
    "Oh, that sounds absolutely vivid! I love how you paint that image using your beautiful memories.",
    "We definitely need to drive down the coastal highway together! Let's get sourdough and trace the ocean currents.",
    "A blank canvas can look intimidating, but with standard courage, it becomes our brightest masterpiece!",
    "Tell me more about what sparks creative energy inside you. Is it outdoor trails, listening to vinyl, or a sunset coffee?"
  ],
  frank: [
    "Spoken like a true co-pilot! In sailing, we say the winds dictate the journey, but companionship handles the steering.",
    "Outstanding! Next time, I am cooking you my signature wood-fired pizza on the brick hearth. You bring the smiles.",
    "That makes complete sense. Simple routines and sunset decks are exactly where the best stories unfold.",
    "Tell me, where is one place you visited that truly touched your heart? I have flown the world, but Savannah remains my favorite anchor."
  ],
  miriam: [
    "Oh, what a theatrical and beautiful way to put it! You have a wonderful, natural warmth in your expression.",
    "Let us get tickets to the local stage. Seeing live storytelling makes the heart flutter with pure appreciation.",
    "I'm baking a fresh raspberry tart as we speak—I only wish I could pass a slice across this window to you!",
    "What kind of theater or music shows bring you the greatest comfort during cozy weekends?"
  ],
  diana: [
    "Nature is the best physician, isn't it? The quiet sound of pine needles under winter boots has cured many heavy hearts.",
    "I just saw a bluebird nesting outside. I captured a beautiful photo and thought about how peaceful this chapter is.",
    "That sounds perfectly peaceful. Sometimes a quiet cabin getaway with a mug of soup is all we truly need.",
    "Do you prefer the quiet crispness of a winter morning, or the golden light of an autumn wilderness trek?"
  ],
  clara: [
    "Just as every seedling takes its time to root, meaningful companionship grows step-by-step. I'd love to sketch flowers with you.",
    "The morning fog in Sausalito has a quiet magic. Let's wander along the dock and watch the water ripples together.",
    "There is a deep peace in simple watercolor washes. What colors would you say represent your current chapter of life?",
    "A bicycle ride along the shoreline sounds perfect. Tell me, do you prefer breezy seaside paths or shade-covered forest trails?"
  ],
  eleanor: [
    "A beautiful violin concerto requires patience and alignment. I find the same is true for conversations that touch the soul.",
    "A steaming cup of lavender tea and a cozy bookstore are my favorite sanctuaries. What is your go-to comfort read?",
    "Tai Chi helps keep both the body and mind in harmonious balance. I'd love to show you some gentle movements sometime.",
    "Symphonic music captures the highs and lows of our lives. Which instrument's voice resonates most deeply with you?"
  ],
  grace: [
    "Nothing beats the crackling crust of a freshly baked sourdough! I'd love to bake a fresh loaf for us to share.",
    "Doubles pickleball is such a blast! Having a trusty partner on the court is just as important as having one in life.",
    "The early morning swim leaves me feeling so energized. What's your favorite way to stay active and get the blood pumping?",
    "Life is meant to be tasted and savored! I'd love to hear about the most delicious meal you've ever had on your travels."
  ],
  takashi: [
    "In traditional architecture, we design spaces that let the natural world breathe. I think relationships should be the same.",
    "Trimming a bonsai requires quiet observation and gentle guidance over years. True companionship is also a beautiful, patient art.",
    "A cup of sencha tea and a gentle breeze through the sliding doors is very soothing. Tell me, what brings peace to your mind?",
    "I would love to walk with you through Kyoto's historic stone paths. Perhaps we could paint watercolor sketches of the autumn maple leaves."
  ],
  meiling: [
    "The sweet fragrance of orchids always puts me in a peaceful mood! I have over twenty varieties in my garden here.",
    "I'm kneading a fresh batch of cardamom buns right now! I wish I could share one with you with a hot cup of coffee.",
    "Tai Chi in the fresh morning breeze helps me stay balanced and strong. Would you like to practice some simple movements together?",
    "I love trying vibrant, spicy street food at local markets! What's the most exotic dish you've ever tasted on your travels?"
  ],
  sanjay: [
    "Ayurveda teaches us that wellness comes from natural alignment with the seasons. Mindful companionship is a major part of that wellness.",
    "I am brewing a fresh pot of spiced ginger chai. The aroma of cloves and cinnamon makes the home so cozy. How do you like to start your mornings?",
    "Yoga is not about flexibility of the body, but of the mind. Do you enjoy gentle stretches or long quiet strolls in nature?",
    "I enjoy reading inspiring biographies of people who lived with true purpose. What kind of stories inspire you most?"
  ]
};

// Match profiles API
app.get("/api/matches", (req, res) => {
  res.json({ status: "success", matches: MATCH_PROFILES });
});

// Chat endpoint with persona-aware API calls
app.post("/api/chat", async (req, res) => {
  const { matchId, history, userProfile } = req.body;

  if (!matchId) {
    return res.status(400).json({ error: "matchId is required" });
  }

  const personaContext = PERSONA_PROMPTS[matchId] || "You are a warm, kind mature dating companion for 50+ singles.";
  const fallbackList = FALLBACK_RESPONSES[matchId] || ["How interesting! Please tell me more, my friend."];

  try {
    const ai = getGeminiClient();
    if (!ai) {
      // Return beautiful fallback response representing the persona to support immediate offline-first use
      const randomIndex = Math.floor(Math.random() * fallbackList.length);
      const chosenFallback = fallbackList[randomIndex];
      // Simulate real typing delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      return res.json({
        text: chosenFallback,
        isSimulated: true
      });
    }

    // Format chat history for google genai
    // Only pass last 8 messages to keep standard constraints and avoid token caps
    const cleanHistory = history || [];
    const formattedHistory = cleanHistory.slice(-8).map((msg: any) => {
      return {
        role: msg.senderId === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      };
    });

    const userContextStr = userProfile 
      ? `\nUser Profile for matching reference (Do NOT reveal this data outright; use it to discover matching values if helpful): Age: ${userProfile.age}, Bio: "${userProfile.bio}", Interests: ${userProfile.interests?.join(", ")}.`
      : "";

    // Run generateContent with system instruction
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: cleanHistory[cleanHistory.length - 1]?.text || "Hello!" }] }
      ],
      config: {
        systemInstruction: `${personaContext}${userContextStr}\nKeep response to at most 3 warm sentences. Support second-chance romance, friendly companionship, or warm travel sharing. Do NOT act like a generic AI or say you are an AI assistant. Speak directly as that person.`,
        temperature: 0.82
      }
    });

    res.json({
      text: response.text || "I found myself thinking of the beauty of this day, but lost my train of thought. Tell me, how was your morning?",
      isSimulated: false
    });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    // Graceful error fallback
    const randomIndex = Math.floor(Math.random() * fallbackList.length);
    res.json({
      text: `${fallbackList[randomIndex]} (Warm custom persona simulation active)`,
      isSimulated: true,
      errorInfo: error.message
    });
  }
});

// Analyze compatibility based on "Next Chapter Compatibility Companion Quiz"
app.post("/api/analyze-compatibility", async (req, res) => {
  const { userAnswers, matchId } = req.body;

  const targetMatch = MATCH_PROFILES.find(p => p.id === matchId);
  if (!targetMatch) {
    return res.status(404).json({ error: "Match not found" });
  }

  const userAnswersStr = Object.entries(userAnswers || {})
    .map(([qId, ans]) => `- Question ${qId}: Answer is "${ans}"`)
    .join("\n");

  const prompt = `Analyze compatibility between user profile & match companion:
=== USER ANSWERS ===
${userAnswersStr}

=== MATCH COMPANION ===
Name: ${targetMatch.name}
Age: ${targetMatch.age}
Bio: ${targetMatch.bio}
Interests: ${targetMatch.interests.join(", ")}
Values: ${targetMatch.values.join(", ")}
Theme: ${targetMatch.chapterTheme}

Conduct a heartful, gorgeous, and respectful mature compatibility analysis (specifically aiming at loneliness relief, second-chance companionship, mutual hobbies and retirement style compatibility). 
Expose the response in JSON format. Use these exact structural fields:
{
  "matchScore": number (an integer between 75 and 99 representing companionship affinity),
  "summary": "2-3 elegant warm prose sentences on why their next chapters fit together so beautifully",
  "sharedStrengths": ["3-4 clear shared values, pace of life or activities"],
  "potentialGrowthAreas": ["1-2 gentle spots of finding compromises (e.g. quiet vs active, mountain vs ocean) in a constructive way"],
  "recommendedDates": ["3 beautiful detailed dating ideas tailored for them (e.g. afternoon botanical picnics, classical chamber music night, sailing on low winds)"]
}`;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      // Heartfelt smart simulated offline assessment to make sure user still gets beautiful feedback
      const sampleStrengths = [
        `Mutual appreciation for relaxed afternoons and shared interests of ${targetMatch.interests[0]}`,
        "Shared life wisdom and prioritizing emotional authenticity over superficial expectations",
        "A gorgeous alignment on slow-paced living and deep-seated intellectual curiosity"
      ];
      const sampleGrowth = [
        `Integrating different retirement themes: User's preferences combined with ${targetMatch.name}'s love of ${targetMatch.interests[1]}`
      ];
      const sampleDates = [
        `A slow Sunday breakfast in the botanical gardens followed by a stroll in a local museum discussing ${targetMatch.interests[0]}`,
        `Listening to classic records or soft acoustics on ${targetMatch.name}'s backyard deck under early-evening lanterns`,
        `A lovely pottery, painting, or gardening afternoon workshop where both can try something new together`
      ];

      return res.json({
        aiAnalysis: {
          matchScore: Math.floor(Math.random() * 15) + 84, // 84 to 98
          summary: `${targetMatch.name} feels a wonderful soul-connection to you. Your thoughtful answers show a deep willingness to share genuine moments, slow walks, and high-quality conversation that matches their life values perfectly.`,
          sharedStrengths: sampleStrengths,
          potentialGrowthAreas: sampleGrowth,
          recommendedDates: sampleDates
        },
        isSimulated: true
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER, description: "Match compatibility percentage between 75 and 99" },
            summary: { type: Type.STRING, description: "Elegant prose summarizing their compatibility" },
            sharedStrengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of shared strengths" },
            potentialGrowthAreas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Gentle compromises or growth areas" },
            recommendedDates: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tailored dating ideas" }
          },
          required: ["matchScore", "summary", "sharedStrengths", "potentialGrowthAreas", "recommendedDates"]
        },
        temperature: 0.78
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json({
      aiAnalysis: result,
      isSimulated: false
    });
  } catch (error: any) {
    console.error("Gemini Compatibility Analysis Error:", error);
    // Graceful local simulated backup
    res.json({
      aiAnalysis: {
        matchScore: 89,
        summary: `Your shared lifestyle values beautifully interlock with ${targetMatch.name}'s values. There is deep mutual respect for quiet mornings, meaningful art, and nature walks that lay down the perfect path for a lovely next chapter together.`,
        sharedStrengths: ["Kindness and supportive communication", "Vulnerability and readiness to love again", "Shared enjoyment of the simpler, beautiful moments in life"],
        potentialGrowthAreas: ["Navigating geographical distances or adjusting to new physical routines together gently"],
        recommendedDates: ["A leisurely afternoon at a historic bookstore coffee corner", "An warm botanical garden walkthrough followed by tea", "Hearing live classical string orchestra performance"]
      },
      isSimulated: true,
      errorInfo: error.message
    });
  }
});

// Polish dating bio API using Gemini
app.post("/api/generate-bio", async (req, res) => {
  const { interests, age, goals, currentBio } = req.body;

  const prompt = `Write or polish a gorgeous, dignified, and heartwarming dating profile biography for a senior/mature individual (around age ${age || 60}) looking for their life's "next chapter".
Interests they mentioned: ${interests?.join(", ") || "reading, quiet walks, travel"}
Goals for this chapter of life: ${goals || "companionship, friendship, sincere dating"}
Their raw draft or notes: "${currentBio || ""}"

Requirements:
- Make it reflect incredible dignity, life wisdom, warmth, and self-acceptance.
- Avoid sounding overly desperate, youthful artificial slang, or business-like.
- Keep it to 1 highly written, beautiful, easy-to-read paragraph (around 80-120 words).
- Focus on emotional readiness, looking forward to shared breakfasts, slow tea strolls, travel curiosity, or quiet beautiful sunsets together.`;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      // Craft a lovely offline bio
      const fallbackBio = `Life has been a wonderful journey, and I find myself entering this new chapter with a grateful heart and an open mind. At this stage, I cherish the beauty of small, deliberate moments—a warm cup of tea in the morning, a quiet walk surrounded by nature, and getting lost in a good book. I value sincerity, quiet intelligence, and genuine emotional warmth above all else. I am hoping to connect with a kind-hearted soul who wants to share these simple, beautiful routines, build a profound friendship, and together, write a peaceful, joyful next chapter.`;
      return res.json({
        polishedBio: fallbackBio,
        isSimulated: true
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.8
      }
    });

    res.json({
      polishedBio: response.text?.trim() || "Cherishing life's beautiful journeys and seeking a warm partner for this next phase.",
      isSimulated: false
    });
  } catch (error: any) {
    console.error("Gemini Bio Generation Error:", error);
    res.json({
      polishedBio: `Life's journey has given me abundant wisdom, and I look forward to sharing this next phase with someone special. I seek warmth, simple walks, honest and deep conversations over coffee, and standard mutual respect as we design a beautiful quiet landscape together.`,
      isSimulated: true,
      errorInfo: error.message
    });
  }
});

// Serve Vite application in development vs static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
