import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function extractProcessModel(transcript) {
  const prompt = `
You are a senior business process analyst.

From the transcript below:
- Identify all business activities
- Identify decisions and outcomes
- Identify which activities occur in which scenarios
- Create a SINGLE master process graph
- Use scenario codes S1, S2, S3... where variants diverge
- The "scenarios" array in the nodes and edges should list ALL scenarios where that node/edge is active.

Return ONLY valid JSON matching this schema:

{
  "nodes": [
    { "id": "string", "label": "string", "scenarios": ["S1", "S2"] }
  ],
  "edges": [
    { "from": "nodeId", "to": "nodeId", "scenarios": ["S1"] }
  ]
}

Rules:
- IDs must be camelCase
- Labels must be business-readable
- Do NOT include explanations
- Do NOT include markdown formatting (no \`\`\`json blocks)

Transcript:
${transcript}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error calling OpenAI:", error); // Log full error object
    if (error.response) {
      console.error("OpenAI Response Data:", error.response.data);
    }

    console.log("⚠️ Falling back to MOCK DATA due to API error.");
    return {
      nodes: [
        { id: "callReceived", label: "Call Received", scenarios: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"] },
        { id: "verifyIdentity", label: "Verify Identity", scenarios: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"] },
        { id: "idVerified", label: "ID Verified", scenarios: ["S1", "S3", "S5", "S6", "S7"] },
        { id: "idFailed", label: "ID Failed", scenarios: ["S2", "S4"] },
        { id: "checkAML", label: "Check AML", scenarios: ["S1", "S2"] },
        { id: "checkFraud", label: "Check Fraud", scenarios: ["S3", "S4"] },
        { id: "closeAccount", label: "Close Account", scenarios: ["S7"] }
      ],
      edges: [
        { from: "callReceived", to: "verifyIdentity", scenarios: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"] },
        { from: "verifyIdentity", to: "idVerified", scenarios: ["S1", "S3", "S5", "S6", "S7"] },
        { from: "verifyIdentity", to: "idFailed", scenarios: ["S2", "S4"] },
        { from: "idVerified", to: "checkAML", scenarios: ["S1", "S2"] },
        { from: "idVerified", to: "checkFraud", scenarios: ["S3", "S4"] },
        { from: "idVerified", to: "closeAccount", scenarios: ["S7"] }
      ]
    };
  }
}
