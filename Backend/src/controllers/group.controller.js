import bcrypt from "bcryptjs";
import Group from "../models/group.model.js";
import GroupMessage from "../models/groupMessage.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

export const createGroup = async (req, res) => {
  try {
    const { name, passkey } = req.body;
    const creatorId = req.user._id;

    if (!name || !passkey) {
      return res.status(400).json({ message: "Group name and passkey are required" });
    }

    if (passkey.length < 4) {
      return res.status(400).json({ message: "Passkey must be at least 4 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPasskey = await bcrypt.hash(passkey, salt);

    const newGroup = new Group({
      name,
      passkey: hashedPasskey,
      creatorId,
      members: [creatorId],
      codeContent: "",
      language: "javascript",
    });

    await newGroup.save();

    const populatedGroup = await Group.findById(newGroup._id).populate("members", "-password");

    res.status(201).json(populatedGroup);
  } catch (error) {
    console.log("Error in createGroup controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { groupId, passkey } = req.body;
    const userId = req.user._id;

    if (!groupId || !passkey) {
      return res.status(400).json({ message: "Group ID and passkey are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.members.includes(userId)) {
      const populatedGroup = await Group.findById(group._id).populate("members", "-password");
      return res.status(200).json(populatedGroup);
    }

    const isPasskeyCorrect = await bcrypt.compare(passkey, group.passkey);
    if (!isPasskeyCorrect) {
      return res.status(400).json({ message: "Incorrect passkey" });
    }

    group.members.push(userId);
    await group.save();

    const populatedGroup = await Group.findById(group._id).populate("members", "-password");
    res.status(200).json(populatedGroup);
  } catch (error) {
    console.log("Error in joinGroup controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: { $in: [userId] } })
      .populate("members", "-password")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.log("Error in getMyGroups controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { id: groupId } = req.params;

    const messages = await GroupMessage.find({ groupId })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getGroupMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: groupId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new GroupMessage({
      groupId,
      senderId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const populatedMessage = await GroupMessage.findById(newMessage._id)
      .populate("senderId", "fullName profilePic");

    io.to(`group_${groupId}`).emit("newGroupMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.log("Error in sendGroupMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.members = group.members.filter((m) => m.toString() !== userId.toString());
    await group.save();

    const roomName = `group_${groupId}`;
    const room = io.sockets.adapter.rooms.get(roomName);
    const activeMembers = room ? room.size : 0;

    if (activeMembers === 0 && group.members.length === 0) {
      await GroupMessage.deleteMany({ groupId });
      await Group.findByIdAndDelete(groupId);
      io.emit("groupDeleted", groupId);
      return res.status(200).json({ message: "Left and group deleted" });
    }

    io.to(roomName).emit("memberLeft", { groupId, userId });
    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    console.log("Error in leaveGroup controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroupCode = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.map((m) => m.toString()).includes(userId.toString())) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    res.status(200).json({ codeContent: group.codeContent, language: group.language });
  } catch (error) {
    console.log("Error in getGroupCode controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateGroupCode = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { codeContent } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.map((m) => m.toString()).includes(userId.toString())) {
      return res.status(403).json({ message: "You are not a member of this group" });
    }

    group.codeContent = codeContent || "";
    await group.save();

    res.status(200).json({ codeContent: group.codeContent });
  } catch (error) {
    console.log("Error in updateGroupCode controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

