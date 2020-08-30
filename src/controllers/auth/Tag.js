const models = require("../../models");
const services = require("../../services");
module.exports = async (app) => {
  app.post(
    "/create",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            username: { type: "string" },
            password: { type: "string" },
            label: { type: "string" },
            textColor: { type: "string" },
            backgroundColor: { type: "string" },
            description: { type: "string" },
            bannerURL: { type: "string" },
          },
          required: ["username", "password", "label"],
        },
      },
    },
    (req, res) => {
      let { username, password, label, textColor = "black", backgroundColor = "lightgrey", description = "", bannerURL = "" } = req.body;
      services
        .Authenticate(username, password)
        .then((user) => {
          if (!user.canManageTags) throw "Access Denied (canManageTags)";
          return models.Tag.create({
            label,
            textColor,
            backgroundColor,
            description,
            numberOfPosts: 0,
            bannerURL,
          }).then((newTag) => services.ActionLogger(user._id, req.hostname, req.ip, "tag", "create", { tag: newTag.id }));
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
            tagId: { type: "string" },
            label: { type: "string" },
            textColor: { type: "string" },
            backgroundColor: { type: "string" },
            description: { type: "string" },
            bannerURL: { type: "string" },
          },
          required: ["username", "password", "tagId"],
          removeAdditional: true,
        },
      },
    },
    (req, res) => {
      let { username, password, tagId } = req.body;
      services
        .Authenticate(username, password)
        .then(async (agent) => {
          if (!agent.canManageTags) throw "Access Denied (canManageTags)";
          let oldTag = await models.Tag.findById(tagId);
          if (!oldTag) throw "Invalid Tag";
          models.Tag.findOneAndUpdate({ _id: tagId, isDeleted: false }, { ...req.body }).then();
          return await services.ActionLogger(agent._id, req.hostname, req.ip, "tag", "update", { tag: tagId }, oldTag);
        })
        .then((doc) => res.send(doc))
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
            tagId: { type: "string" },
          },
          required: ["username", "password", "tagId"],
        },
      },
    },
    (req, res) => {
      let { username, password, tagId } = req.body;
      services
        .Authenticate(username, password)
        .then((agent) => {
          if (!agent.canManageTags) throw "Access Denied (canManageTags)";
          return models.Tag.findOneAndUpdate({ _id: tagId, isDeleted: false }, { isDeleted: true }).then((tag) => {
            if (!tag) throw "Invalid Tag";
            models.Post.updateMany({ tag: tagId, isDeleted: false }, { deleteAgent: agent._id, isDeleted: true }).then();
            return services.ActionLogger(agent._id, req.hostname, req.ip, "tag", "delete", { tag: tagId });
          });
        })
        .then((data) => res.send(data))
        .catch((err) => res.send(Error(err)));
    }
  );
};
