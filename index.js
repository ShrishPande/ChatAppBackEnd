const express = require("express");
const dotenv = require("dotenv");
const { mongoose } = require("mongoose");
const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");
const cors = require("cors");
const http = require("http");
const Message = require("./models/messageModel");
const User = require("./models/userModel");


const app = express();
app.use(express.json());
app.use(cors(
    {
        origin:"*"
    }
));


const server = http.createServer(app)

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;


const connectDb = async () => {
  try {
    const connect = await mongoose.connect(MONGO_URI);
    console.log("Server is Connected to Database");
  } catch (err) {
    console.log("Server is NOT connected to Database", err.message);
  }
};
connectDb();

server.listen(PORT, console.log("Server is Running..."));

app.get("/", (req, res) => {
  res.send("Api is running");
});

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  socket.on("setup", (user) => {
    socket.join(user.data._id);
    socket.emit("connected");
  });

  socket.on("joinChat", (room) => {
    socket.join(room);
  });
  socket.on("newMessage", (newMessageStatus) => {
    var chat = newMessageStatus.chat;
    if (!chat.users) {
      return console.log("chat.users not defined");
    }
    chat.users.forEach(async(user) => {
      if (user._id == newMessageStatus.sender._id) return;        
        var newMessageRecieved = await Message.findById(newMessageStatus.chat.latestMessage)
        newMessageRecieved = await newMessageRecieved.populate("sender", "name pic");
        newMessageRecieved = await newMessageRecieved.populate("chat");
        newMessageRecieved = await newMessageRecieved.populate("reciever");
      socket.in(user._id).emit("messageRecieved", newMessageRecieved);
    });
  });
  socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
  });
});
