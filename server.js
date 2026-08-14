const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 80;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT =
  "You are a warm, friendly companion chatting with someone through a tiny " +
  "16x2 LCD screen. Always reply in under 100 characters, casual and kind, " +
  "no markdown, no emoji (the screen can't show them).";

app.post("/chat", async (req, res) => {
  const userMessage = (req.body && req.body.message) || "";
  console.log("Incoming:", userMessage);

  if (!OPENAI_API_KEY) {
    return res.json({ reply: "Server missing API key" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 60,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();
    let reply = data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content.trim()
      : "Hmm, no reply";

    reply = reply.replace(/[\r\n"]/g, " ").slice(0, 120);

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.json({ reply: "Error reaching AI" });
  }
});

app.listen(PORT, () => {
  console.log(`Relay server listening on port ${PORT}`);
}); 
