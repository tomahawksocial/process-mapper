import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import processRoutes from "./routes/process.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/process", processRoutes);

// Serve static files from client directory for easy testing
app.use(express.static("client"));

app.listen(PORT, () => {
    console.log(`🪐 Anti-gravity server floating on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
