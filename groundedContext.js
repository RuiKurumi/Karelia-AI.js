const Groq = require('groq-sdk');

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const MODEL = 'llama-3.3-70b-versatile';

const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const groundingCache = new Map();

const SIMPLE_PATTERNS = [
  /^[0-9+\-*/(). ]+$/, // math
  /^(hi|hello|hey|yo)$/i,
  /^how are you/i,
  /^tell me a joke/i,
  /^good (morning|afternoon|evening)/i
];

const SEARCH_DELAY_MS = 2000;
let lastSearchTime = 0;

async function needsGrounding(userInput) {
  if (!groq) return false;

  const text = userInput.trim();

  // Skip obvious non-grounded queries
  if (
    text.length < 12 ||
    SIMPLE_PATTERNS.some(pattern => pattern.test(text))
  ) {
    console.log("[GROUNDING] skipped obvious non-grounded query");
    return false;
  }

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `
Reply "yes" only if answering accurately requires recent or changing information such as:
- news
- weather
- sports scores
- stock prices
- elections
- recent events
- programming and software development
- scientific and technical knowledge
- engineering topics
- medical information
- legal or regulatory topics
- current office holders
- historical facts
- comparisons between established technologies
- timeless explanations
- military equipment comparisons

Reply "no" for:
- casual conversation
- jokes and humor
- creative writing
- roleplay
- fictional scenarios
- emotional support
- subjective opinions
- greetings
- questions about your own personality

Reply only yes or no.
`
      },
      {
        role: 'user',
        content: userInput
      }
    ],
    max_tokens: 5
  });

  const answer = completion.choices[0]?.message?.content
    ?.trim()
    .toLowerCase();

  console.log(`[GROUNDING] needs grounding: ${answer}`);

  return answer === 'yes';
}

async function fetchSearchContext(userInput) {
  // Cache first
  const cached = getCached(userInput);

  if (cached) {
    return cached;
  }

  // Rate limit
  const now = Date.now();

  if (now - lastSearchTime < SEARCH_DELAY_MS) {
    console.log("[GROUNDING] search throttled");
    return null;
  }

  lastSearchTime = now;

  // API key check
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    console.warn("[GROUNDING] Serper API key not set");
    return null;
  }

  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: userInput,
        num: 3
      })
    });

    if (!res.ok) {
      console.error("[GROUNDING] Serper error:", res.status);
      console.error(await res.text());
      return null;
    }

    // Parse Serper response
    const data = await res.json();

    console.log(
      "[GROUNDING] Serper organic results:",
      data.organic?.length ?? 0
    );

    if (!data.organic?.length) {
      console.log("[GROUNDING] no organic results");
      return null;
    }

    // Build compact context
    const context = data.organic
      .slice(0, 3)
      .map((item, i) => {
        const title = item.title ?? "Untitled";
        const snippet = item.snippet ?? "No snippet available.";

        return `[${i + 1}] ${title}: ${snippet}`;
      })
      .join("\n");

    // Cache successful results
    setCached(userInput, context);

    console.log(
      `[GROUNDING] context fetched (${Math.min(
        data.organic.length,
        3
      )} results)`
    );

    return context;

  } catch (err) {
    console.error("[GROUNDING] fetch error:", err);
    return null;
  }
}

async function getGroundingContext(userInput) {
  const needs = await needsGrounding(userInput);

  if (!needs) {
    return null;
  }

  const context = await fetchSearchContext(userInput);

  if (!context) {
    console.log("[GROUNDING] falling back to model knowledge");
  }

  return context;
}

function normalizeQuery(query) {
  return query.trim().toLowerCase();
}

function getCached(query) {
  const key = normalizeQuery(query);

  const cached = groundingCache.get(key);

  if (!cached) {
    return null;
  }

  if (Date.now() - cached.timestamp > CACHE_TTL) {
    groundingCache.delete(key);
    return null;
  }

  console.log("[GROUNDING] cache hit");

  return cached.context;
}

function setCached(query, context) {
  groundingCache.set(normalizeQuery(query), {
    context,
    timestamp: Date.now()
  });
}

module.exports = { getGroundingContext };