const express = require("express");
const UserModel = require("../models/userModel");
const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../Config/generateToken");

const loginController = expressAsyncHandler(async (req, res) => {

  try {
    const { name, password } = req.body;
    const user = await UserModel.findOne({ name });
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid Username or password" });
    }
  }catch(error){
    console.log("Error occurred during login", error);
    return res.status(500).json({message:"Internal Server Error"})
  }
});

const registerController = expressAsyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.send(400);
      throw new Error("All necessary input fields have not been filled");
    }

    const userExit = await UserModel.findOne({ email });
    if (userExit) {
      throw new Error("User already Exists");
    }

    const userNameExist = await UserModel.findOne({ name });

    if (userNameExist) {
      throw new Error("Username already taken");
    }

    const user = await UserModel.create({ name, email, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Registration Error");
    }
  } catch (error) {
    console.log("Error occurred during user registration",error);
    return res.status(500).json({ message: "Internal Servar Error" })
  }
});

const fetchAllUsers = expressAsyncHandler(async (req, res) => {
  try{
  const keyword = req.query.search
    ? {
      $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    }
    : {};

  const users = await UserModel.find(keyword).find({
    _id: { $ne: req.user._id }
  })
  res.status(200).json({users:users});
}catch(error){
  console.log("Error occurred during fetching users", error);
  return res.status(500).json("Internal Server Error");
}
});

module.exports = { loginController, registerController, fetchAllUsers };
