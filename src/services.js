require("./services/Database");
module.exports = {
  Executor: require("./services/Executor"),
  Authenticate: require("./services/Authenticate"),
  PostGetter: require("./services/PostGetter"),
  ActionLogger: require("./services/ActionLogger"),
  Cleaner: require("./services/Cleaner"),
  Sharpener: require("./services/Sharpener"),
  TimeMachine: require("./services/TimeMachine"),
};
