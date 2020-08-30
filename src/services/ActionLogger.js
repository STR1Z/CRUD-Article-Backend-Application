const models = require("../models");
const fetch = require("node-fetch");

let hook_urls = process.env.HOOK_URLS.split(" ");

module.exports = async (agent, hostname, ip, target, type, { tag, user, post }, previous = null) => {
  let action = await models.Action.create({
    datetime: new Date(),
    agent,
    hostname,
    ip,
    target,
    type,
    tag,
    user,
    post,
    previous,
  });
  if (process.env.USING_HOOKS)
    for (let url of hook_urls)
      fetch(url, {
        method: "POST",
        body: JSON.stringify(action),
        headers: { "Content-Type": "application/json" },
      });
  return action;
};
