import { sopDataset } from "../data/sopDataset.js";

const synonymMap = {
  sabzi: "vegetables",
  veggie: "vegetables",
  gravyy: "gravy",
  gal: "mushy",
  gili: "wet",
  sukhi: "dry",
  khatta: "tangy",
  teekha: "spicy",
  tadka: "saute",
  bhuno: "saute",
  bhunein: "saute",
  aag: "flame",
  tez: "high",
  dhimi: "low",
  platingg: "plating",
  garnishh: "garnish",
  dahi: "curd",
  nimbu: "lemon",
  sirka: "vinegar",
  handi: "handi",
  jalfrezi: "jalfrezi"
};

const intentHints = {
  troubleshooting: ["issue", "problem", "dry", "mushy", "dark", "fix", "hal", "dikkhat"],
  garnish: ["garnish", "plating", "serve", "presentation"],
  consistency: ["consistency", "thick", "semi", "dry", "texture"],
  flame: ["flame", "heat", "high", "low", "toss"],
  ingredients: ["ingredient", "masala", "dahi", "cream", "butter", "gravy"]
};

const tokenize = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

const normalizeTokens = (tokens) => tokens.map((token) => synonymMap[token] || token);

const detectIntent = (tokens) => {
  let bestIntent = null;
  let bestScore = 0;

  Object.entries(intentHints).forEach(([intent, words]) => {
    const score = words.reduce((acc, word) => (tokens.includes(word) ? acc + 1 : acc), 0);
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  });

  return bestIntent;
};

const scoreDocument = (questionTokens, document) => {
  const searchable = `${document.title} ${document.content}`.toLowerCase();
  return questionTokens.reduce((score, token) => (searchable.includes(token) ? score + 2 : score), 0);
};

const pickIntentSection = (content, intent) => {
  const lines = content.split("\n");
  if (!intent) {
    return lines.slice(0, 14).join("\n");
  }

  const markers = {
    troubleshooting: ["TROUBLESHOOTING"],
    garnish: ["GARNISH", "PLATING"],
    consistency: ["FINISHING", "Consistency"],
    flame: ["INITIAL SETUP", "Flame", "Toss"],
    ingredients: ["GRAVY MIX", "MAIN ITEM", "Spices"]
  };

  const keys = markers[intent] || [];
  const startIdx = lines.findIndex((line) =>
    keys.some((key) => line.toLowerCase().includes(key.toLowerCase()))
  );
  if (startIdx === -1) {
    return lines.slice(0, 14).join("\n");
  }
  return lines.slice(startIdx, startIdx + 14).join("\n");
};

export const generateSopAnswer = (question) => {
  const normalizedQuestion = String(question || "").trim();
  if (!normalizedQuestion) {
    return {
      answer: "Please ask a kitchen SOP question to get guidance.",
      citations: []
    };
  }

  const questionTokens = normalizeTokens(tokenize(normalizedQuestion));
  const intent = detectIntent(questionTokens);
  const ranked = sopDataset
    .map((doc) => ({ ...doc, score: scoreDocument(questionTokens, doc) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const fallback = sopDataset[0];
  const target = best?.score > 0 ? best : fallback;
  const shortSnippet = pickIntentSection(target.content, intent);

  return {
    answer: `Based on ${target.title}, here is the guidance:\n\n${shortSnippet}\n\nIf you want, ask a follow-up like: consistency, troubleshooting, garnish, or exact flame timing.`,
    citations: [{ id: target.id, title: target.title }]
  };
};

export const listSops = () => sopDataset.map((item) => ({ id: item.id, title: item.title }));
