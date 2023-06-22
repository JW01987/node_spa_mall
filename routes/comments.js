const Comment = require("../schemas/comment");
const Post = require("../schemas/post");
const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();

//댓글 생성
router.post("/comments", authMiddleware, async (req, res) => {
  const { content, postId } = req.body;
  const { nickname } = res.locals.user;
  if (!content.length) {
    return res
      .status(404)
      .json({ success: false, msg: "댓글 내용을 입력해주세요" });
  }

  const postIdCheck = await Post.findOne({ postId });
  if (!postIdCheck) {
    return res
      .status(404)
      .json({ success: false, msg: "해당 게시글이 없습니다." });
  }
  const maxOrderByCommentId = await Comment.findOne().sort("-commentId").exec();
  const commentId = maxOrderByCommentId ? maxOrderByCommentId.commentId + 1 : 1;
  Comment.create({
    postId,
    content,
    commentId,
    nickname,
  });
  res.status(200).json({ success: true, msg: "댓글이 등록되었습니다." });
});

//댓글 수정
router.put("/comments", authMiddleware, async (req, res) => {
  const { postId, content, commentId } = req.body;
  const { nickname } = res.locals.user;
  if (!content.length) {
    return res
      .status(404)
      .json({ success: false, msg: "댓글 내용을 입력해주세요." });
  }
  const postIdCheck = await Post.findOne({ postId });
  if (!postIdCheck) {
    return res
      .status(404)
      .json({ success: false, msg: "해당 게시글이 없습니다." });
  }
  try {
    const comment = await Comment.findOne({ commentId });
    if (comment.nickname !== nickname) {
      return res
        .status(404)
        .json({ success: false, msg: "작성자만 수정할 수 있습니다." });
    }
  } catch {
    return res
      .status(404)
      .json({ success: false, msg: "댓글을 찾을 수 없습니다." });
  }

  await Comment.findOneAndUpdate(
    { commentId, postId, nickname },
    { content },
    { new: true }
  );
  res.status(200).json({ success: true, msg: "댓글이 수정되었습니다." });
});

//댓글 삭제
router.delete("/comments/:commentId", authMiddleware, async (req, res) => {
  const { commentId } = req.params;
  const { nickname } = res.locals.user;
  try {
    const comment = await Comment.findOne({ commentId });

    if (comment.nickname !== nickname) {
      return res
        .status(404)
        .json({ success: false, msg: "작성자만 삭제할 수 있습니다." });
    }
  } catch {
    return res
      .status(404)
      .json({ success: false, msg: "댓글을 찾을 수 없습니다." });
  }
  await Comment.findOneAndDelete({ commentId });

  res.status(200).json({ success: true, msg: "댓글이 삭제되었습니다." });
});
module.exports = router;
