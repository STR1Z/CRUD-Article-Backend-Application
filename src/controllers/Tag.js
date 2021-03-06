const models = require("../models");
const services = require("../services");
module.exports = async (app) => {
  app.get(
    "/search",
    {
      schema: {
        query: {
          match: { type: "string" },
          size: { type: "integer" },
        },
      },
    },
    async (req) => {
      let { match = "", size = 10 } = req.query;
      return await models.Tag.find({ label: { $regex: match, $options: "i" }, isDeleted: false })
        .limit(size)
        .sort("-numberOfPosts")
        .exec();
    }
  );
  app.get("/:id", async (req) => await models.Tag.findOne({ _id: req.params.id, isDeleted: false }));
  app.get(
    "/:id/posts",
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
      return await services.PostGetter.tag(req.params.id, page, size);
    }
  );
  app.get(
    "/most-active",
    {
      schema: {
        query: {
          size: {
            type: "integer",
            minimum: 0,
            maximum: 100,
          },
        },
      },
    },
    async (req) => {
      let { size = 50 } = req.query;
      return await models.Tag.find({ isDeleted: false }).limit(size).sort({ numberOfPosts: -1 }).exec();
    }
  );
};
