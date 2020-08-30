const bcrypt = require("bcrypt");
const models = require("../models");

module.exports = async (username, password) => {
  // if (bcrypt.compareSync(new Date().toDateString() + process.env.ADMIN_SECRET, secret))
  if (username === "root" && Boolean(process.env.USING_ROOT) && password === process.env.ROOT_PASS)
    return {
      username: "root",
      _id: "000000000000000000000000",
      canOverview: true,
      canViewLogs: true,
      canManageUsers: true,
      canCensorPosts: true,
      canRenewTokens: true,
      canManageTags: true,
      canPriorityPost: true,
      canPost: false,
      isSuperUser: true,
      firstName: "root",
      lastName: "root",
      roles: ["root"],
    };
  let user = await models.User.findOne({ username });
  if (user && bcrypt.compareSync(password, user.password)) return user;
  throw "Invalid Client";
};
