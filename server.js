const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();ء
});

const TOKEN = "EAAG4ruOYX88BRqoRvKRkpfZBXdD86BdZAf0Ok5cnPqhlYIParezilicGZAhbo8FSz5imTLMbpqv9WuX0eH0kMradA3yDZCgjpPLLZBGgYatZBHfZBvZC2KOq3akizCpY6X92ovIjiY7QInp4X8daFvG8Xy3EPzyrv3ZCEHSwr6OFZBjbYZAgWr9XbBRX8IRfCo27SjXjwZC02N3t8RsVd3BpBCKANpnuHHdguKay";
const MY_PAGE_ID = "100064721886898";

let seenComments = new Set();
let newComments = [];
let monitoredPages = [];

// ── POLL competitor pages every 2 minutes ──
async function pollPage(pageId) {
  try {
    const posts = await axios.get(
      `https://graph.facebook.com/v19.0/${pageId}/posts`,
      { params: { fields: "id,message,created_time", limit: 5, access_token: TOKEN } }
    );
    for (const post of posts.data.data || []) {
      const comments = await axios.get(
        `https://graph.facebook.com/v19.0/${post.id}/comments`,
        { params: { fields: "id,from,message,created_time", limit: 10, access_token: TOKEN } }
      );
      for (const c of comments.data.data || []) {
        if (!seenComments.has(c.id)) {
          seenComments.add(c.id);
          newComments.unshift({
            id: c.id,
            user: c.from?.name || "مجهول",
            text: c.message,
            post: post.message?.slice(0, 80),
            pageId,
            time: Date.now(),
            sent: false,
          });
          if (newComments.length > 100) newComments.pop();
          console.log(`✅ New comment from ${c.from?.name}: ${c.message}`);
        }
      }
    }
  } catch (e) {
    console.error("Poll error:", e.response?.data || e.message);
  }
}

function startPolling() {
  setInterval(() => {
    monitoredPages.forEach(p => pollPage(p.id));
  }, 2 * 60 * 1000);
}
startPolling();

// ── SEND MESSAGE ──
async function sendMessage(userId, name, template) {
  const text = template.replace("{name}", name);
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/me/messages`,
      { recipient: { id: userId }, message: { text }, messaging_type: "RESPONSE" },
      { params: { access_token: TOKEN } }
    );
    return true;
  } catch (e) {
    console.error("Send error:", e.response?.data);
    return false;
  }
}

// ── ROUTES ──
app.get("/", (req, res) => res.json({ status: "dangal backend running 🇮🇶" }));

app.get("/comments", (req, res) => res.json(newComments));

app.post("/send", async (req, res) => {
  const { commentId, userId, userName, template } = req.body;
  const ok = await sendMessage(userId, userName, template || "أهلاً {name}! 👋 لدينا عرض خاص لك ✨");
  if (ok) {
    newComments = newComments.map(c => c.id === commentId ? { ...c, sent: true } : c);
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.post("/pages", (req, res) => {
  const { pages } = req.body;
  monitoredPages = pages || [];
  // Poll immediately
  monitoredPages.forEach(p => pollPage(p.id));
  res.json({ success: true, monitoring: monitoredPages.length });
});

app.get("/poll/:pageId", async (req, res) => {
  await pollPage(req.params.pageId);
  res.json({ success: true, comments: newComments.length });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`dangal server on port ${PORT}`));
