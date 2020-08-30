const models = require("../models");

const handlers = {
  post: {
    create: async (services, action) => {
      let postDoc = await models.Post.findOneAndUpdate({ _id: action.post, isDeleted: false }, { isDeleted: true });
      if (!postDoc) throw "Invalid Post";
      models.User.findByIdAndUpdate(action.agent, { $inc: { numberOfPosts: -1 } }).then();
      models.Tag.findByIdAndUpdate(postDoc.tag, { $inc: { numberOfPosts: -1 } }).then();
      return await services.ActionLogger("000000000000000000000000", "system", "system", "post", "censor", { post: action.post });
    },
    update: async (services, action) => {
      let oldDoc = await models.Post.findOne({ _id: action.post, isDeleted: false });
      if (!oldDoc) throw "Invalid Post";
      await models.Post.findByIdAndUpdate(action.post, action.previous);
      return await services.ActionLogger("000000000000000000000000", "system", "system", "post", "update", { post: action.post }, oldDoc);
    },
    delete: async (services, action) => {
      let deletedDoc = await models.Post.findOne({ _id: action.post, isDeleted: true });
      if (!deletedDoc) throw "Invalid Post";
      await models.Post.findByIdAndUpdate(action.post, { isDeleted: false });
      return await services.ActionLogger("000000000000000000000000", "system", "system", "post", "create", { post: action.post });
    },
    censor: async (services, action) => {
      return await handlers.post.create(services, action);
    },
  },
  user: {
    create: async (services, action) => {
      let user = await models.User.findOneAndUpdate({ _id: action.user, isDeleted: false }, { isDeleted: true });
      if (!user) throw "Invalid User";
      models.Post.updateMany({ author: action.user, isDeleted: false }, { deleteAgent: "system", isDeleted: true }).then();
      return await services.ActionLogger("000000000000000000000000", "system", "system", "user", "delete", { user: user._id });
    },
    update: async (services, action) => {
      let oldDoc = await models.User.findOne({ _id: action.user, isDeleted: false });
      if (!oldDoc) throw "Invalid User";
      await models.User.findByIdAndUpdate(action.user, actions.previous);
      return await services.ActionLogger("000000000000000000000000", "system", "system", "user", "update", { user: action.user }, oldDoc);
    },
    delete: async (services, action) => {
      let user = await models.User.findOneAndUpdate({ _id: action.user, isDeleted: true }, { isDeleted: false });
      if (!user) throw "Invalid User";
      models.Post.updateMany({ author: action.user, isDeleted: true, deleteAgent: action.agent }, { deleteAgent: null, isDeleted: false }).then();
      return await services.ActionLogger("000000000000000000000000", "system", "system", "user", "create", { user: user._id });
    },
  },
  tag: {
    create: async (services, action) => {
      let tag = await models.Tag.findOneAndUpdate({ _id: action.tag, isDeleted: false }, { isDeleted: true });
      if (!tag) throw "Invalid tag";
      models.Post.updateMany({ tag: action.tag, isDeleted: false }, { deleteAgent: "system", isDeleted: true }).then();
      return await services.ActionLogger("000000000000000000000000", "system", "system", "tag", "delete", { tag: tag._id });
    },
    update: async (services, action) => {
      let oldDoc = await models.Tag.findOne({ _id: action.tag, isDeleted: false });
      if (!oldDoc) throw "Invalid tag";
      await models.Tag.findByIdAndUpdate(action.tag, actions.previous);
      return await services.ActionLogger("000000000000000000000000", "system", "system", "tag", "update", { tag: action.tag }, oldDoc);
    },
    delete: async (services, action) => {
      let tag = await models.Tag.findOneAndUpdate({ _id: action.tag, isDeleted: true }, { isDeleted: false });
      if (!tag) throw "Invalid tag";
      models.Post.updateMany({ tag: action.tag, isDeleted: true, deleteAgent: action.agent }, { deleteAgent: null, isDeleted: false }).then();
      return await services.ActionLogger("000000000000000000000000", "system", "system", "tag", "create", { tag: tag._id });
    },
  },
};

module.exports = async (services, actionId) => {
  let action = await models.Action.findById(actionId);
  if (!action) throw "Invalid Action";
  if (handlers[action.target] && handlers[action.target][action.type]) return await handlers[action.target][action.type](services, action);
  else throw "The Time Machine cannot undo this action...";
};
