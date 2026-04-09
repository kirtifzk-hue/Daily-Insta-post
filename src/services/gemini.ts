import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// We use the environment variable directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PostContent {
  topic: string;
  headline: string;
  body: string;
  footer: string;
  tags: string[];
  themeColor: string;
  isShortcut?: boolean;
  shortcutAction?: string;
  shortcutKeys?: string[];
}

const TOPICS = [
  "Latest AI Tool",
  "Boost your PC Performance",
  "Excel Shortcut",
  "Photoshop Tip",
  "Windows Desktop Hack",
  "MS Word Trick",
  "After Effects Technique",
  "Tech News",
];

export async function generatePostContent(specificTopic?: string, history: string[] = []): Promise<PostContent> {
  const topic = specificTopic || TOPICS[Math.floor(Math.random() * TOPICS.length)];
  
  const historyPrompt = history.length > 0 
    ? `\nCRITICAL: DO NOT generate any of these previous tips. They have already been used recently:\n${history.map(h => `- ${h}`).join('\n')}\n` 
    : '';
  
  const prompt = `
    You are a social media manager for a tech channel. Create a catchy, concise Instagram portrait post content about: "${topic}".
    ${historyPrompt}
    CRITICAL INSTRUCTION: Ensure the content is completely unique, fresh, and different from typical examples. Provide a new, lesser-known tip, trick, or news item. Do not repeat common advice.
    
    Random seed for uniqueness: ${Date.now()}-${Math.random()}
    
    The content should be educational or informative.
    
    Return ONLY a JSON object with the following structure:
    {
      "topic": "${topic}",
      "headline": "Catchy short headline (max 6 words)",
      "body": "The main tip or news. Keep it punchy and readable. (max 40 words)",
      "footer": "Call to action or extra tiny detail (max 10 words)",
      "tags": ["#tag1", "#tag2", "#tag3"],
      "themeColor": "A hex color code that matches the vibe of this topic (e.g. Excel green #107c41, Word blue #2b579a, Photoshop #31a8ff)",
      "isShortcut": true/false (true if this is a keyboard shortcut tip),
      "shortcutAction": "Short description of what the shortcut does (e.g. 'Total / Sum', 'New Layer', 'Save As')",
      "shortcutKeys": ["Alt", "=", "Ctrl", "C"] (Array of keys to press. Use symbols like '+' only if it's part of the key press sequence, otherwise just list the keys. If not a shortcut, leave empty or null)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 1.2, // Higher temperature for more creative and diverse outputs
      },
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");
    
    return JSON.parse(text) as PostContent;
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
}

export async function generateBackgroundImage(topic: string, headline: string): Promise<string> {
  let visualSubject = "Abstract tech background, geometric lines, dark mode";
  
  const lowerTopic = topic.toLowerCase();
  
  if (lowerTopic.includes("excel")) {
    visualSubject = "3D artistic Microsoft Excel logo, emerald green crystals, spreadsheet grid lines in background, professional finance aesthetic";
  } else if (lowerTopic.includes("word") || lowerTopic.includes("ms word")) {
    visualSubject = "3D artistic Microsoft Word logo, deep blue paper sheets, typography elements, professional document aesthetic";
  } else if (lowerTopic.includes("photoshop")) {
    visualSubject = "Adobe Photoshop logo Ps, creative colorful splash, digital art tools, vibrant blue gradient";
  } else if (lowerTopic.includes("windows")) {
    visualSubject = "Windows 11 logo abstract, glass morphism blue panes, desktop interface elements, clean modern OS vibe";
  } else if (lowerTopic.includes("after effects")) {
    visualSubject = "Adobe After Effects logo Ae, motion blur purple neon, kinetic typography lines, video editing timeline abstract";
  } else if (lowerTopic.includes("ai") || lowerTopic.includes("artificial intelligence")) {
    visualSubject = "Artificial Intelligence brain chip, glowing neural network connections, futuristic cyborg aesthetic, purple and cyan neon";
  } else if (lowerTopic.includes("pc") || lowerTopic.includes("computer")) {
    visualSubject = "High-end gaming PC internal components, RGB lighting, CPU processor macro shot, motherboard circuits";
  }

  const prompt = `
    ${visualSubject}.
    Context: Background for an Instagram Story about "${headline}".
    Style: High quality, 8k, photorealistic 3D render or digital art. 
    Mood: Professional, tech-focused, dark mode aesthetic.
    Composition: Vertical 9:16 aspect ratio. Minimalist enough for text overlay.
    Constraint: No text in the image (except the logo itself if specified). High contrast.
  `;

  try {
    // Using gemini-2.5-flash-image as it is the standard model
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        // gemini-2.5-flash-image does not support imageConfig with aspectRatio/imageSize in the same way as 3.1
        // It returns a 1:1 image by default usually, but let's try to request it if possible or just accept what we get.
        // The documentation says "Do not set responseMimeType" and "Do not set responseSchema".
        // It doesn't explicitly say imageConfig is forbidden for 2.5, but 3.1 supports more options.
        // We will try without specific config first to ensure it works, or minimal config.
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    // If no image found, return empty string to trigger fallback
    return "";
  } catch (error) {
    console.error("Error generating image:", error);
    // Return empty string to trigger fallback gradient in UI
    return ""; 
  }
}
