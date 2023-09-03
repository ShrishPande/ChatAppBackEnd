const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  groupExit,
  fetchGroups,
  addSelfToGroup,
} = require("../Controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const Router = express.Router();

Router.post("/",protect, accessChat);
Router.get("/",protect, fetchChats);
Router.post("/createGroup",protect, createGroupChat);
Router.get("/fetchGroups",protect, fetchGroups);
Router.put("/groupExit",protect, groupExit);
Router.put("/addSelfToGroup",protect,addSelfToGroup)
module.exports = Router;