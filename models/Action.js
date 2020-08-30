const { model, Schema } = require("mongoose");
module.exports = model(
  "Action",
  new Schema({
    datetime: Date,
    agent: { type: Schema.Types.ObjectId, ref: "User" },
    hostname: String,
    ip: String,
    target: {
      type: String,
      enum: ["post", "user", "tag"],
    },
    type: {
      type: String,
      enum: ["create", "update", "delete", "censor"],
    },
    tag: { type: Schema.Types.ObjectId, ref: "Tag" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    previous: Object,
  })
);
