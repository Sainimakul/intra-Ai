const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await response.json();
  console.log("Available Models:", JSON.stringify(data, null, 2));
}

// listModels();
// ─── Generate AI Response ─────────────────────────────────────────────────────
const generateResponse = async ({
  systemPrompt,
  conversationHistory,
  userMessage,
  botConfig,
}) => {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt, 
    });

    const history = (conversationHistory || []).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;

    return {
      text: response.text(),
      tokensUsed: response.usageMetadata?.totalTokenCount || 0,
    };
  } catch (err) {
    console.error('Gemini error:', err.message);
    throw new Error('AI service temporarily unavailable.');
  }
};

// ─── Build System Prompt with Knowledge Context ───────────────────────────────
const buildSystemPrompt = (bot, knowledgeContext) => {
  let prompt = bot.system_prompt || 'You are a helpful AI assistant.';

  if (knowledgeContext && knowledgeContext.length > 0) {
    prompt += `\n\n=== KNOWLEDGE BASE ===\nUse the following information to answer questions. If the answer isn't in the knowledge base, say so and try to help based on general knowledge.\n\n`;
    prompt += knowledgeContext
      .map(k => `[${k.name}]:\n${k.content}`)
      .join('\n\n---\n\n');
    prompt += '\n\n=== END KNOWLEDGE BASE ===';
  }

  const lengthInstruction = {
    short: 'Keep your responses brief and concise (1-2 sentences when possible).',
    medium: 'Provide clear and moderately detailed responses.',
    long: 'Provide comprehensive, detailed responses.',
  };
  prompt += `\n\n${lengthInstruction[bot.response_length] || lengthInstruction.medium}`;
  prompt += `\nAlways respond in a helpful, professional manner.`;

  return prompt;
};

// ─── Summarize text for training (optional helper) ────────────────────────────
const extractTextForTraining = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(
      'Summarize the key facts from this document for a chatbot knowledge base:\n\n' +
      text.substring(0, 30000)
    );
    return result.response.text();
  } catch (err) {
    console.error('Training extraction error:', err.message);
    return text.substring(0, 50000);
  }
};

module.exports = { generateResponse, buildSystemPrompt, extractTextForTraining };