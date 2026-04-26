import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/* -------- root route -------- */
app.get("/", (req, res) => {
  res.send("Gemini server running");
});

/* -------- generate roadmap -------- */
app.post("/generate-roadmap", async (req, res) => {
  try {
    const { project } = req.body;

    const prompt = `
Create a structured project roadmap.

Title: ${project?.title}
Description: ${project?.description}
Stack: ${project?.stack}
Domain: ${project?.domain}

Include:
- phases
- timeline
- deliverables
- tech suggestions
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No roadmap generated";

    res.json({ roadmap: output });

  } catch (error) {
    console.error("Roadmap Error:", error);
    res.status(500).json({ error: "Failed to generate roadmap" });
  }
});

/* -------- generate PRD -------- */
app.post("/generate-prd", async (req, res) => {
  try {
    const { project } = req.body;

    const prompt = `
Create a Product Requirement Document.

Title: ${project?.title}
Description: ${project?.description}
Stack: ${project?.stack}
Domain: ${project?.domain}

Include:
- overview
- target users
- features
- tech stack
- success metrics
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No PRD generated";

    res.json({ prd: output });

  } catch (error) {
    console.error("PRD Error:", error);
    res.status(500).json({ error: "Failed to generate PRD" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


//this file can also handle the proxy servers when gemini or cluade api dont work
