const { model, Schema } = require("mongoose");
module.exports = model(
  "Tag",
  new Schema({
    label: String,
    textColor: String,
    backgroundColor: String,
    description: String,
    numberOfPosts: Number,
    bannerURL: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  })
);
