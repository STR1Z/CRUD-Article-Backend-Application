const { model, Schema } = require("mongoose");
module.exports = model(
  "Post",
  new Schema({
    createdAt: Date,
    updatedAt: Date,
    sortDate: Date,
    isEdited: Boolean,
    visibility: {
      type: String,
      enum: ["all", "tag", "author", "link"],
    },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    priority: Number,
    title: String,
    content: String,
    tag: { type: Schema.Types.ObjectId, ref: "Tag" },
    thumbnailURL: String,
    displayMode: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deleteAgent: { type: Schema.Types.ObjectId, ref: "User" },
  })
);
