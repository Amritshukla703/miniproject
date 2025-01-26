const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/miniproject");
const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  age: Number,
  email: String,
  password: String,
  post: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
});

const user = mongoose.model("user", userSchema);

module.exports = user;
