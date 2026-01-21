import express from "express";
import { extractProcessModel } from "../ai/extractProcessModel.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
    try {
        const { transcript } = req.body;
        if (!transcript) {
            return res.status(400).json({ error: "Transcript is required" });
        }

        console.log("Analyzing transcript...");
        const model = await extractProcessModel(transcript);
        console.log("Analysis complete.");

        res.json(model);
    } catch (err) {
        console.error("API Error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
