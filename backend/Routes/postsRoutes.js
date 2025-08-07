import express from "express";
import {
  getAllPosts,
  getPosts,
  updatePosts,
  deletePosts,
  handleLike,
  handleComment,
  approvePost,
  getPostsByStatus,
  rejectPost,
  insertPosts,
} from "../Controllers/PostsController.js";

const postsrouter = express.Router();

postsrouter.get("/", getAllPosts);
postsrouter.post("/", insertPosts);
postsrouter.get("/:id", getPosts);
postsrouter.put("/:id", updatePosts);
postsrouter.delete("/:id", deletePosts);
postsrouter.post("/:postId/like", handleLike);
postsrouter.post("/:postId/comment", handleComment);
postsrouter.get("/status", getPostsByStatus);
postsrouter.put("/:id/approve", approvePost);
postsrouter.put("/:id/reject", rejectPost);

export default postsrouter;
