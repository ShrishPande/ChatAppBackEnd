const express =  require("express")
const {loginController,registerController, fetchAllUsers} =require("../Controllers/userController")
const { protect } = require("../middleware/authMiddleware")


const Router = express.Router()



Router.post("/login",loginController)
Router.post("/register",registerController)
Router.get("/fetchusers",protect,fetchAllUsers)

module.exports = Router;