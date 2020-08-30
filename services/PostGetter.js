const models = require("../models");

const fetchPost = async (filter, page = 0, size = 50) =>
  await models.Post.find(filter)
    .limit(size)
    .skip(page * size)
    .sort({ sortDate: -1 })
    .populate("author", "-password -username")
    .populate("tag")
    .exec();

module.exports = {
  all: (page, size) => fetchPost({ visibility: "all", isDeleted: false }, page, size),
  tag: (tag, page, size) => fetchPost({ tag, $or: [{ visibility: "tag" }, { visibility: "all" }], isDeleted: false }, page, size),
  user: (author, page, size) => fetchPost({ author, $or: [{ visibility: "tag" }, { visibility: "all" }, { visibility: "author" }], isDeleted: false }, page, size),
  one: (postId) =>
    fetchPost({ _id: postId, $or: [{ visibility: "tag" }, { visibility: "all" }, { visibility: "author" }, { visibility: "link" }], isDeleted: false }, 0, 1).then((arr) => {
      if (arr.length == 0) throw Error("Invalid Post");
      return arr[0];
    }),
  search: (page, size, match, tag, user) =>
    fetchPost({ isDeleted: false, ...(match ? { title: { $regex: match, $options: "i" } } : {}), ...(user ? { user } : {}), ...(tag ? { tag } : {}) }, page, size),
};
