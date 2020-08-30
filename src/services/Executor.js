module.exports = async (command, services) => {
  let args = command.split(" ");

  switch (args[0]) {
    case "clean": {
      console.log(services.Cleaner);
      return await services.Cleaner();
    }
    case "sharpen": {
      return await services.Sharpener();
    }

    case "undo": {
      return await services.TimeMachine(services, args[1]);
    }
  }
};
