const models = require("../models");

module.exports = async () => {
  for (let author of await models.User.find({}).select("_id")) models.Post.countDocuments({ author, isDeleted: false }).then((n) => models.User.findByIdAndUpdate(author, { numberOfPosts: n }));
  for (let tag of await models.Tag.find({}).select("_id")) models.Post.countDocuments({ tag, isDeleted: false }).then((n) => models.Tag.findByIdAndUpdate(tag, { numberOfPosts: n }));
  return "The database has been sharpened...";
};
