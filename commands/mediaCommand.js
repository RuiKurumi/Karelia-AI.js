const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

// Initialize Gemini
const googleApiKey = process.env.GOOGLE_API_KEY || process.env.g_apiKey;
const genAI = googleApiKey ? new GoogleGenerativeAI(googleApiKey) : null;

// Function to analyze media
async function analyzeMedia(message, filePath, mimeType = "image/jpeg") {
  if (!genAI) {
    throw new Error("GOOGLE_API_KEY is not configured.");
  }

  try {
    // Read the file as a base64 string
    const fileData = fs.readFileSync(filePath);
    const base64Data = fileData.toString('base64');

    // Prepare the prompt
    const prompt = "Describe this image or GIF in a fun and engaging way.";

    // Send the media to Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent([prompt, { inlineData: { data: base64Data, mimeType } }]);
    const response = result.response.text();

    // Return the analysis result
    return response;
  } catch (error) {
    console.error("Error analyzing media:", error);
    throw new Error("Sorry, I couldn't analyze that media. Please try again.");
  } finally {
    // Clean up: Delete the temporary file
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error("Error deleting temporary media file:", error);
      }
    }
  }
}

// Export the media command
module.exports = {analyzeMedia};
