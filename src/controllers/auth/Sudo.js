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
            command: { type: "string" },
          },
        },
      },
    },
    (req, res) => {
      let { username, password, command = "" } = req.body;
      services
        .Authenticate(username, password)
        .then((agent) => {
          if (!agent.isSuperUser) throw "Access Denied (isSuperUser)";
          return services.Executor(command, services);
        })
        .then((message) => res.send({ message }))
        .catch((err) => res.send(Error(err)));
    }
  );
};
