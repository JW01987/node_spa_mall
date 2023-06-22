const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  postId: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  commentId: {
    type: Number,
    required: true,
    unique: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: new Date(new Date().getTime() + 1000 * 60 * 60 * 9),
  },
});

module.exports = mongoose.model("Comment", commentSchema);
