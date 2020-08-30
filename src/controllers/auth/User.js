const models = require("../../models");
const services = require("../../services");
const bcrypt = require("bcrypt");

module.exports = async (app, opts) => {
  app.post(
    "/validate",
    {
      schema: {
        body: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
          },
        },
      },
    },
    (req, res) => {
      let { username, password } = req.body;
      services
        .Authenticate(username, password)
        .then((agent) => {
          agent.password = null;
          return agent;
        })
        .then((data) => res.send(data))
        .catch((err) => res.send(Error(err)));
    }
  );
  app.post(
    "/create",
    {
      schema: {
        body: {
          type: "object",
          required: ["username", "password", "_username", "_password", "firstName", "lastName"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
            _username: { type: "string" },
            _password: { type: "string" },
            expiresIn: { type: "string" },
            canOverview: { type: "boolean" },
            canViewLogs: { type: "boolean" },
            canManageUsers: { type: "boolean" },
            canCensorPosts: { type: "boolean" },
            canManageTags: { type: "boolean" },
            canPriorityPost: { type: "boolean" },
            canPost: { type: "boolean" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            avatarURL: { type: "string" },
            description: { type: "string" },
          },
        },
      },
    },
    (req, res) => {
      let {
        username,
        password,
        _username,
        _password,
        firstName,
        lastName,
        avatarURL = "",
        description = "",
        expiresIn = 365,
        canOverview = false,
        canViewLogs = false,
        canManageUsers = false,
        canManageTags = false,
        canPriorityPost = false,
        canPost = false,
        canCensorPosts = false,
      } = req.body;
      if (_username === "root") return res.send(new Error("Username Taken"));
      services
        .Authenticate(username, password)
        .then((agent) => {
          if (!agent.canManageUsers) throw "Access Denied (canManageUsers)";
          return models.User.findOne({ username: _username }).then((doc) => {
            if (doc) throw "Username Taken";
            let now = new Date();
            return models.User.create({
              username: _username,
              password: bcrypt.hashSync(_password, 10),
              firstName,
              lastName,
              avatarURL,
              description,
              createdAt: now,
              expiresAt: new Date().setDate(now.getDate() + expiresIn),
              canOverview,
              canViewLogs,
              canManageTags,
              canManageUsers,
              canPriorityPost,
              canPost,
              canCensorPosts,
            }).then((newUser) => {
              return services.ActionLogger(agent._id, req.hostname, req.ip, "user", "create", { user: newUser._id });
            });
          });
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
          required: ["username", "password", "userId"],
          removeAdditional: true,
          properties: {
            username: { type: "string" },
            password: { type: "string" },
            _username: { type: "string" },
            _password: { type: "string" },
            userId: { type: "string" },
            expiresAt: { type: "string" },
            canOverview: { type: "boolean" },
            canViewLogs: { type: "boolean" },
            canManageUsers: { type: "boolean" },
            canCensorPosts: { type: "boolean" },
            canManageTags: { type: "boolean" },
            canPriorityPost: { type: "boolean" },
            canPost: { type: "boolean" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            avatarURL: { type: "string" },
            description: { type: "string" },
          },
        },
      },
    },
    (req, res) => {
      let { username, password, _username, _password, userId } = req.body;
      if (_username === "root") return res.send(Error("Username Taken"));
      services
        .Authenticate(username, password)
        .then(async (agent) => {
          if (!agent.canManageUsers) throw "Access Denied (canManageUsers)";
          if (await models.User.findOne({ username: _username })) throw "Username Taken";
          let oldUser = await models.User.findOne({ _id: userId, isDeleted: false });
          if (!oldUser) throw "Invalid User";
          delete req.body.username;
          delete req.body.password;
          models.User.findByIdAndUpdate(userId, {
            ...req.body,
            ...(_password ? { password: bcrypt.hashSync(_password, 10) } : {}),
            ...(_username ? { username: _username } : {}),
          }).then();
          return await services.ActionLogger(agent._id, req.hostname, req.ip, "user", "update", { user: oldUser._id }, oldUser);
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
          required: ["username", "password", "userId"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
            userId: { type: "string" },
          },
        },
      },
    },
    (req, res) => {
      let { username, password, userId } = req.body;
      services
        .Authenticate(username, password)
        .then((agent) => {
          if (!agent.canManageUsers) throw "Access Denied (canManageUsers)";
          return models.User.findOneAndUpdate({ _id: userId, isDeleted: false }, { isDeleted: true }).then((user) => {
            if (!user) throw "Invalid User";
            models.Post.updateMany({ author: userId, isDeleted: false }, { deleteAgent: agent._id, isDeleted: true }).then();
            return services.ActionLogger(agent._id, req.hostname, req.ip, "user", "delete", { user: user._id });
          });
        })
        .then((data) => res.send(data))
        .catch((err) => res.send(Error(err)));
    }
  );
};
