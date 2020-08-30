const models = require("../models");
const services = require("../services");
module.exports = async (app) => {
  app.get(
    "/search",
    {
      schema: {
        query: {
          match: {
            type: "string",
          },
          tag: {
            type: "string",
          },
          user: {
            type: "string",
          },
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
    async (req) => {
      let { match = "", page = 0, size = 50, tag, user } = req.query;
      return await services.PostGetter.search(page, size, match, tag, user);
    }
  );
  app.get(
    "/",
    {
      schema: {
        query: {
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
    async (req) => {
      let { page, size } = req.query;
      return await services.PostGetter.all(page, size);
    }
  );
  app.get("/:id", async (req) => await services.PostGetter.one(req.params.id));
};
