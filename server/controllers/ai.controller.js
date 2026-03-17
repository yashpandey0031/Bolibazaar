import axios from "axios";

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const GEMINI_MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
];

const buildPrompt = ({ itemName, itemCategory }) => {
  return `Write a catchy, engaging auction description for a ${itemCategory} item called "${itemName}". Keep it between 45 and 80 words. Mention standout value, condition appeal, and why bidders should act now. Brand: Bolibazaar.`;
};

const fallbackDescription = ({ itemName, itemCategory }) =>
  `Introducing ${itemName}, a standout ${itemCategory} listing on Bolibazaar. This piece offers strong collector appeal with quality and character that make it a smart buy. Bidding is now open, so place your offer early and stay ahead as competition builds.`;

const extractGeminiText = (responseData) => {
  const parts = responseData?.candidates?.[0]?.content?.parts || [];
  const text = parts
    .map((part) => part?.text)
    .filter(Boolean)
    .join("\n")
    .trim();

  return text || null;
};

const generateWithGemini = async (apiKey, prompt) => {
  let lastError = null;
  const modelErrors = [];

  for (const model of GEMINI_MODELS) {
    try {
      const response = await axios.post(
        `${GEMINI_BASE_URL}/${model}:generateContent`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 180,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            key: apiKey,
          },
          timeout: 12000,
        },
      );

      const description = extractGeminiText(response.data);
      if (description) {
        return { description, model };
      }

      lastError = new Error(`Empty Gemini response for model ${model}`);
      modelErrors.push(lastError.message);
    } catch (error) {
      const status = error?.response?.status;
      const details = error?.response?.data?.error?.message || error.message;
      lastError = new Error(
        `Gemini ${model} failed (${status || "n/a"}): ${details}`,
      );
      modelErrors.push(lastError.message);

      // Invalid/unauthorized key errors are terminal and not model-specific.
      if (status === 400 || status === 401 || status === 403) {
        break;
      }
    }
  }

  if (modelErrors.length > 0) {
    throw new Error(modelErrors.join(" | "));
  }

  throw lastError || new Error("Gemini generation failed");
};

const generateWithGroq = async (apiKey, prompt) => {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "mixtral-8x7b-32768",
      messages: [
        { role: "system", content: "You are a helpful auction assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 140,
      temperature: 0.8,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 12000,
    },
  );

  return response.data?.choices?.[0]?.message?.content?.trim() || null;
};

const generateWithOpenAI = async (apiKey, prompt) => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful auction assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 140,
      temperature: 0.8,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 12000,
    },
  );

  return response.data?.choices?.[0]?.message?.content?.trim() || null;
};

export const generateDescription = async (req, res) => {
  const itemName = req.body?.itemName?.trim();
  const itemCategory = req.body?.itemCategory?.trim();

  if (!itemName || !itemCategory) {
    return res.status(400).json({ error: "Missing item name or category" });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const prompt = buildPrompt({ itemName, itemCategory });
  const providerErrors = [];

  if (GEMINI_API_KEY) {
    try {
      const result = await generateWithGemini(GEMINI_API_KEY, prompt);
      return res.json({
        description: result.description,
        provider: "gemini",
        model: result.model,
      });
    } catch (err) {
      providerErrors.push(err.message);
    }
  }

  if (GROQ_API_KEY) {
    try {
      const description = await generateWithGroq(GROQ_API_KEY, prompt);
      if (description) {
        return res.json({ description, provider: "groq" });
      }
      providerErrors.push("Groq returned an empty response");
    } catch (err) {
      providerErrors.push(`Groq failed: ${err.message}`);
    }
  }

  if (OPENAI_API_KEY) {
    try {
      const description = await generateWithOpenAI(OPENAI_API_KEY, prompt);
      if (description) {
        return res.json({ description, provider: "openai" });
      }
      providerErrors.push("OpenAI returned an empty response");
    } catch (err) {
      providerErrors.push(`OpenAI failed: ${err.message}`);
    }
  }

  // Never fail hard here; fall back so create flow works for both user/admin.
  return res.json({
    description: fallbackDescription({ itemName, itemCategory }),
    provider: "fallback",
    warning:
      providerErrors.length > 0
        ? `AI providers unavailable: ${providerErrors.join(" | ")}`
        : "AI provider key not configured",
  });
};
