
import express from 'express';
import { generateAiResponse } from '../controllers/ai.controller.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// This route is protected, ensuring only logged-in users can access the AI
router.post("/chat", protectRoute, generateAiResponse);

export default router;