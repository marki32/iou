import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, SearchResult, GroundingChunk } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes an image using Gemini 3 Pro Preview.
 * Focuses on identifying the object and identifying a search query for it.
 */
export const analyzeImage = async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: `Identify the main subject of this image. 
            
            Start with a # Header (Markdown H1) that names the subject clearly and concisely.
            Follow with a clear, detailed description in Markdown. Use bullet points for key features.
            
            At the very end of your response, on a new line, output exactly "SEARCH_QUERY: " followed by the best single short Google Search query to find up-to-date real-time info (like price, news, or specs) about this specific subject.`,
          },
        ],
      },
      config: {
        systemInstruction: "You are a helpful visual identification assistant. Your output should be clean Markdown.",
      }
    });

    const fullText = response.text || "Could not analyze image.";
    
    // Parse out the search query if it exists
    const splitParts = fullText.split('SEARCH_QUERY:');
    const description = splitParts[0].trim();
    const searchQuery = splitParts.length > 1 ? splitParts[1].trim() : undefined;

    return {
      text: description,
      searchQuery: searchQuery
    };
  } catch (error) {
    console.error("Error identifying image:", error);
    throw error;
  }
};

/**
 * Performs a Google Search using Gemini 2.5 Flash Grounding.
 */
export const searchWeb = async (query: string): Promise<SearchResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find detailed, up-to-date information about: ${query}. Summarize the key facts, prices, or news found.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
    
    const sources = groundingChunks
      ?.map(chunk => chunk.web)
      .filter((web): web is { uri: string; title: string } => !!web) || [];

    // Deduplicate sources by URI
    const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());

    return {
      text: response.text || "No results found.",
      sources: uniqueSources,
    };
  } catch (error) {
    console.error("Error searching web:", error);
    throw error;
  }
};