const models = require("../../models");
const services = require("../../services");
module.exports = async (app) => {
  app.post(
    "/",
    {
      schema: {
        body: {
          type: "object",
          required: ["username", "password"],
          properties: {
            username: { type: "string" },
            password: { type: "string" },
            page: {
              type: "integer",
              minimum: 0,
            },
            size: {
              type: "integer",
              minimum: 0,
              maximum: 100,
            },
          },
        },
      },
    },
    (req, res) => {
      let { username, password, page = 0, size = 50 } = req.body;
      services
        .Authenticate(username, password)
        .then((agent) => {
          if (!agent.canViewLogs) throw "Access Denied (canViewLogs)";
          return models.Action.find()
            .limit(size)
            .skip(page * size)
            .sort({ sortDate: -1 })
            .populate("agent", "-password")
            .exec();
        })
        .then((data) => res.send(data))
        .catch((err) => res.send(err));
    }
  );
};
