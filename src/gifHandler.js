// gifHandler.js
// Place in: src/
// Requires: KLIPY_API_KEY in .env
// Get a free key at: https://klipy.com (Partner Panel)


const GIF_CACHE = {}; // in-memory cache to avoid hammering API
const KLIPY_API_KEY = process.env.KLIPY_API_KEY;

// Tags Karelia can express — add/remove as you like
const VALID_TAGS = [
   "happy", "confused", "shocked", "laughing", "agreeing",
  "sassy", "awkward", "excited", "disappointed", "thinking",
  "bye", "hello", "yes", "no", "curious", "sad", "angry",
  "smug", "nervous", "surprised", "proud", "embarrassed", "none","concerned","flustered"
];

/**
 * Fetch a random gif from KLIPY for a given mood tag
 * Returns a gif URL string, or null if none found / tag is "none"
 */

/*async function getGifForTag(tag) {
   console.log('=== getGifForTag called with tag:', tag);
  console.log('=== KLIPY_API_KEY present:', !!process.env.KLIPY_API_KEY);
  console.log('=== tag valid:', VALID_TAGS.includes(tag));
  console.log('=== tag is none:', tag === "none");
  
  if (!tag || tag === "none" || !VALID_TAGS.includes(tag)) return null;
  if (!KLIPY_API_KEY) {
    console.warn("KLIPY_API_KEY not set, skipping gif");
    return null;
  }

  // Return a random cached result if still fresh
  if (GIF_CACHE[tag] && GIF_CACHE[tag].expires > Date.now()) {
    const cached = GIF_CACHE[tag].urls;
    return cached[Math.floor(Math.random() * cached.length)];
  }
*/
async function getGifForTag(tag) {
  console.log('=== getGifForTag called with tag:', tag);
  console.log('=== KLIPY_API_KEY present:', !!process.env.KLIPY_API_KEY);
  console.log('=== tag valid:', VALID_TAGS.includes(tag));
  console.log('=== tag is none:', tag === "none");

  if (!tag || tag === "none" || !VALID_TAGS.includes(tag)) return null;
  if (!KLIPY_API_KEY) {
    console.warn("KLIPY_API_KEY not set, skipping gif");
    return null;
  }

  if (GIF_CACHE[tag] && GIF_CACHE[tag].expires > Date.now()) {
    console.log('=== returning from cache');
    const cached = GIF_CACHE[tag].urls;
    return cached[Math.floor(Math.random() * cached.length)];
  }

  console.log('=== making API request...');
  try {
    const query = encodeURIComponent(tag + " anime reaction");
    const url = `https://api.klipy.com/api/v1/${KLIPY_API_KEY}/gifs/search?q=${query}&limit=10`;
    console.log('=== URL:', url);

    const res = await fetch(url);
    console.log('=== response status:', res.status);

    const data = await res.json();
    console.log('=== data.data type:', typeof data.data);
    console.log('=== results length:', data.data?.results?.length);
    console.log('=== data.data keys:', JSON.stringify(Object.keys(data.data)));
  } catch (err) {
    console.error("=== KLIPY fetch error:", err);
  }

  try {
    const query = encodeURIComponent(tag + " anime reaction"); // tune search flavor here
    const url = `https://api.klipy.com/api/v1/${KLIPY_API_KEY}/gifs/search?q=${query}&limit=10`;

    const res = await fetch(url);

    if (!res.ok) {
      console.error(`KLIPY API error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();

    if (!data.data?.data || data.data.data.length === 0) return null;

    const urls = data.data.data
      .map(r => r.file?.md?.gif?.url || r.file?.hd?.gif?.url || r.file?.sm?.gif?.url)
      .filter(Boolean);

    console.log(`KLIPY urls found: ${urls.length} for tag: ${tag}`);
    if (urls.length === 0) return null;

    // Cache for 10 minutes
    GIF_CACHE[tag] = { urls, expires: Date.now() + 10 * 60 * 1000 };

    return urls[Math.floor(Math.random() * urls.length)];
  } catch (err) {
    console.error("KLIPY API error:", err);
    return null;
  }
}

module.exports = { getGifForTag, VALID_TAGS };