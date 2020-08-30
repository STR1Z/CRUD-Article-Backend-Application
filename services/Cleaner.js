const models = require("../models");

module.exports = async () => {
  await models.Post.deleteMany({ isDeleted: true });
  await models.User.deleteMany({ isDeleted: true });
  await models.Tag.deleteMany({ isDeleted: true });
  return "Cleaned the database";
};
