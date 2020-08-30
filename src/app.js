require("dotenv").config();
const app = require("fastify")({ logger: true });

app.register(require("fastify-rate-limit"), {
  max: 100,
  timeWindow: "1 minute",
});

app.register(require("fastify-cors"));

app.register(require("./controllers/Post"), { prefix: "/posts" });
app.register(require("./controllers/Tag"), { prefix: "/tags" });
app.register(require("./controllers/User"), { prefix: "/users" });

app.register(require("./controllers/auth/Post"), { prefix: "/auth/posts" });
app.register(require("./controllers/auth/Tag"), { prefix: "/auth/tags" });
app.register(require("./controllers/auth/User"), { prefix: "/auth/users" });

app.register(require("./controllers/auth/Sudo"), { prefix: "/auth/sudo" });

app.listen(process.env.PORT);
