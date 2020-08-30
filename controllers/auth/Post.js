const models = require("../../models");
const services = require("../../services");

module.exports = async (app, opts) => {
  app.post(
    "/create",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            username: { type: "string" },
            password: { type: "string" },
            title: { type: "string" },
            content: { type: "string" },
            visibility: { type: "string", enum: ["all", "tag", "author", "link"] },
            priority: { type: "integer", minimum: 0, maximum: 7 },
            tag: { type: "string" },
            thumbnailURL: { type: "string" },
            displayMode: { type: "string" },
          },
          additionalProperties: false,
          required: ["username", "password", "title", "content", "tag"],
        },
      },
    },
    (req, res) => {
      let { username, password, title, content, visibility = "all", priority = 0, tag, thumbnailURL = "", displayMode = "default" } = req.body;
      services
        .Authenticate(username, password)
        .then(async (user) => {
          if (!user.canPost) throw "Access Denied (canPost)";
          if (priority > 0 && !user.canPriorityPost) throw "Access Denied (canPriorityPost)";
          if (!(await models.Tag.findOneAndUpdate({ _id: tag, isDeleted: false }, { $inc: { numberOfPosts: 1 } }).catch(() => false))) throw "Invalid Tag";
          models.User.findByIdAndUpdate(user._id, { $inc: { numberOfPosts: 1 } }).then();
          let now = new Date();
          return models.Post.create({
            createdAt: now,
            updatedAt: now,
            sortDate: new Date().setDate(now.getDate() + priority),
            isEdited: false,
            visibility,
            author: user._id,
            priority,
            title,
            content,
            thumbnailURL,
            tag,
            displayMode,
          }).then((doc) => services.ActionLogger(user._id, req.hostname, req.ip, "post", "create", { post: doc._id }));
        })
        .then((data) => res.send(data))
        .catch((err) => res.send(Error(err)));
    }
  );

  app.post(
    "/update",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            username: { type: "string" },
            password: { type: "string" },
            postId: { type: "string" },
            title: { type: "string" },
            content: { type: "string" },
            visibility: { type: "string", enum: ["all", "tag", "author", "link"] },
            priority: { type: "integer", minimum: 0, maximum: 7 },
            tag: { type: "string" },
            thumbnailURL: { type: "string" },
            displayMode: { type: "string" },
          },
          required: ["username", "password", "postId"],
          removeAdditional: true,
        },
      },
    },
    (req, res) => {
      let { username, password, postId, priority, tag } = req.body;
      services
        .Authenticate(username, password)
        .then((user) => {
          return models.Post.findOne({ _id: postId, author: user._id }).then(async (old) => {
            if (!old) throw "Invalid Post";
            if (priority && priority > 0 && !user.canPriorityPost) throw "Access Denied (canPriorityPost)";
            if (tag) {
              if (!(await models.Tag.findByIdAndUpdate(tag, { $inc: { numberOfPosts: 1 } }).catch(() => false))) throw "Invalid Tag";
              models.Tag.findByIdAndUpdate(old.tag, { $inc: { numberOfPosts: -1 } });
            }
            let updatedDoc = models.Post.findByIdAndUpdate(old._id, {
              ...req.body,
              updatedAt: new Date(),
              sortDate: priority ? old.createdAt.setDate(old.createdAt.getDate() + priority) : undefined,
              isEdited: true,
            }).then();
            return await services.ActionLogger(user._id, req.hostname, req.ip, "post", "update", { post: updatedDoc.id }, old);
          });
        })
        .then((data) => res.send(data))
        .catch((err) => res.send(Error(err)));
    }
  );

  app.post(
    "/delete",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            username: { type: "string" },
            password: { type: "string" },
            postId: { type: "string" },
          },
          required: ["username", "password", "postId"],
        },
      },
    },
    (req, res) => {
      let { username, password, postId } = req.body;
      services
        .Authenticate(username, password)
        .then((user) => {
          return models.Post.findOneAndUpdate({ _id: postId, author: user._id, isDeleted: false }, { isDeleted: true }).then((postDoc) => {
            if (!postDoc) throw "Invalid Post";
            models.User.findByIdAndUpdate(user._id, { $inc: { numberOfPosts: -1 } }).then();
            models.Tag.findByIdAndUpdate(postDoc.tag, { $inc: { numberOfPosts: -1 } }).then();
            return services.ActionLogger(user._id, req.hostname, req.ip, "post", "delete", { post: postDoc._id });
          });
        })
        .then((data) => res.send(data))
        .catch((err) => res.send(Error(err)));
    }
  );

  app.post(
    "/censor",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            username: { type: "string" },
            password: { type: "string" },
            postId: { type: "string" },
          },
          required: ["username", "password", "postId"],
        },
      },
    },
    (req, res) => {
      let { username, password, postId } = req.body;
      services
        .Authenticate(username, password)
        .then((user) => {
          if (!user.canCensorPosts) throw "Access Denied (canCensorPosts)";
          return models.Post.findOneAndUpdate({ _id: postId, isDeleted: false }, { isDeleted: true }).then((postDoc) => {
            if (!postDoc) throw "Invalid Post";
            models.User.findByIdAndUpdate(user._id, { $inc: { numberOfPosts: -1 } }).then();
            models.Tag.findByIdAndUpdate(postDoc.tag, { $inc: { numberOfPosts: -1 } }).then();
            return services.ActionLogger(user._id, req.hostname, req.ip, "post", "censor", { post: postDoc._id });
          });
        })
        .then((data) => res.send(data))
        .catch((err) => res.send(Error(err)));
    }
  );
};
