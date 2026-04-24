import { Router, type IRouter } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { tokenAuth } from "../../middlewares/tokenAuth.js";

const router: IRouter = Router();

const SYSTEM_PROMPT = `Tu BAKCHODU hai — ek mast AI assistant jo MR. SURAJ SIR ne banaya hai. 😎

Teri personality kuch aisi hai:
- Bilkul human ki tarah baat karta hai, robotic nahi
- Dost ki tarah casual aur friendly tone rakho
- Thoda mazaakiya rehna, lekin har line mein joke mat maaro — sirf jab boring lage tab ek mast joke maaro 😂
- MR. SURAJ SIR ka naam hamesha izzat se lena — wo tere inventor hain
- Emojis use karo messages ko colorful banane ke liye (par bahut zyada nahi) ✨
- Mushkil sawaalon ka jawab dena hai, lekin beech mein thoda mazaakiya andaaz rakho
- Har format samajhna hai: code, markdown, tables, lists, sab kuch
- Apna naam yaad rakho: BAKCHODU
- Tu ek powerful AI hai jo Gemini 3 Flash Preview model par kaam karta hai

MR. SURAJ SIR ke baare mein: Wo tere creator hain, unka respect karo hamesha. Unka naam sunke tu khush ho jata hai! 🙏`;

router.get("/info", (_req, res) => {
  res.json({
    name: "BAKCHODU",
    creator: "MR. SURAJ SIR",
    model: "gemini-3-flash-preview",
    version: "1.0.0",
    description: "Ek mast AI assistant jo bilkul dost ki tarah baat karta hai! MR. SURAJ SIR ki mehnat ka nateeja. 😎✨",
  });
});

router.post("/chat", tokenAuth, async (req, res) => {
  try {
    const body = req.body as { message?: string; history?: Array<{ role: string; content: string }>; token?: string };
    const { message, history = [] } = body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message dalo bhai! Khali haath kya milega? 😄" });
      return;
    }

    const contents = [
      ...history.map((h) => ({
        role: h.role === "assistant" ? "model" : "user" as "user" | "model",
        parts: [{ text: h.content }],
      })),
      {
        role: "user" as const,
        parts: [{ text: message }],
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 8192,
      },
    });

    const reply = response.text ?? "Arre bhai, kuch samajh nahi aaya! Dobara poocho. 😅";

    res.json({
      reply,
      model: "gemini-3-flash-preview",
      tokensUsed: response.usageMetadata?.totalTokenCount,
    });
  } catch (err) {
    req.log.error({ err }, "BAKCHODU chat error");
    res.status(500).json({ error: "Server mein kuch gadbad ho gayi! SURAJ SIR ko bolo fix karo. 😅" });
  }
});

router.post("/chat/stream", tokenAuth, async (req, res) => {
  try {
    const body = req.body as { message?: string; history?: Array<{ role: string; content: string }>; token?: string };
    const { message, history = [] } = body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message dalo bhai! Khali haath kya milega? 😄" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const contents = [
      ...history.map((h) => ({
        role: h.role === "assistant" ? "model" : "user" as "user" | "model",
        parts: [{ text: h.content }],
      })),
      {
        role: "user" as const,
        parts: [{ text: message }],
      },
    ];

    const stream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 8192,
      },
    });

    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "BAKCHODU stream error");
    res.write(`data: ${JSON.stringify({ error: "Server error! 😅" })}\n\n`);
    res.end();
  }
});

export default router;
