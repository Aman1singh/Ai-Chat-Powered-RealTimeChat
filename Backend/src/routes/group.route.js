import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  joinGroup,
  getMyGroups,
  getGroupMessages,
  sendGroupMessage,
  leaveGroup,
  getGroupCode,
  updateGroupCode,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.post("/join", protectRoute, joinGroup);
router.get("/my-groups", protectRoute, getMyGroups);
router.get("/:id/messages", protectRoute, getGroupMessages);
router.post("/:id/messages", protectRoute, sendGroupMessage);
router.post("/:id/leave", protectRoute, leaveGroup);
router.get("/:id/code", protectRoute, getGroupCode);
router.put("/:id/code", protectRoute, updateGroupCode);

export default router;

