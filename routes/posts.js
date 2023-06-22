const express = require("express");
const router = express.Router();
const Post = require("../schemas/post");
const authMiddleware = require("../middlewares/auth-middleware");

//전체 게시글 조회
router.get("/posts", async (req, res) => {
  const post = await Post.find({}, { content: 0 });
  if (!post.length) {
    return res
      .status(404)
      .json({ success: false, msg: "데이터를 불러올 수 없습니다." });
  }
  //정렬하기
  const sortedList = post.sort(function (a, b) {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  res.status(200).json({ success: true, sortedList });
});

//게시글 상세 조회
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const post = await Post.find({ postId });
  if (!post) {
    return res
      .status(404)
      .json({ success: false, msg: "데이터를 불러올 수 없습니다." });
  }

  res.status(200).json({ post });
});

//게시글 생성
router.post("/posts", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const { nickname } = res.locals.user;
  if (!content || !title) {
    return res
      .status(404)
      .json({ success: false, msg: "내용을 추가해 주세요." });
  }

  const maxOrderByPostId = await Post.findOne().sort("-postId").exec();
  const newPostId = maxOrderByPostId ? maxOrderByPostId.postId + 1 : 1;

  Post.create({
    title,
    nickname,
    content,
    postId: newPostId,
  });

  res.status(200).json({ success: true, msg: "게시글이 저장되었습니다." });
});

//게시글 수정
router.put("/post", authMiddleware, async (req, res) => {
  const { postId, title, content } = req.body;
  const { nickname } = res.locals.user;
  if (!content || !title) {
    return res
      .status(404)
      .json({ success: false, msg: "내용이나 제목을 추가해 주세요." });
  }
  try {
    const checkPostId = await Post.findOne({ postId });
    if (checkPostId.nickname !== nickname) {
      return res
        .status(404)
        .json({ success: false, msg: "작성자만 수정 할 수 있습니다." });
    }
  } catch {
    return res
      .status(404)
      .json({ success: false, msg: "게시글을 찾을 수 없습니다." });
  }
  await Post.findOneAndUpdate(
    { postId, nickname },
    { title, content },
    { new: true }
  );
  res.status(200).json({ success: true, msg: "게시글이 수정되었습니다." });
});

//게시글 삭제
router.delete("/post/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { nickname } = res.locals.user;
  try {
    const checkPostId = await Post.findOne({ postId });
    if (checkPostId.nickname !== nickname) {
      return res
        .status(404)
        .json({ success: false, msg: "작성자만 삭제 할 수 있습니다." });
    }
  } catch {
    return res
      .status(404)
      .json({ success: false, msg: "게시글을 찾을 수 없습니다." });
  }
  await Post.findOneAndDelete({ postId, nickname });
  res.status(200).json({ success: true, msg: "게시글이 삭제되었습니다." });
});

module.exports = router;
