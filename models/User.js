const { model, Schema } = require("mongoose");
module.exports = model(
  "User",
  new Schema({
    username: String,
    password: String,
    createdAt: Date,
    expiresAt: Date,
    canOverview: Boolean,
    canViewLogs: Boolean,
    canManageUsers: Boolean,
    canCensorPosts: Boolean,
    canManageTags: Boolean,
    canPriorityPost: Boolean,
    canPost: Boolean,
    numberOfPosts: {
      type: Number,
      default: 0,
    },
    firstName: String,
    lastName: String,
    roles: [String],
    avatarURL: String,
    description: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isSuperUser: {
      type: Boolean,
      default: false,
    },
  })
);
