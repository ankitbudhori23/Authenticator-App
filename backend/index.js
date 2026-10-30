const app = require("./app");
const config = require("./config");
const { connectDB } = require("./db");

const start = async () => {
  try {
    await connectDB();
    const server = app.listen(config.port, () => {
      console.log(
        `Server running in ${config.nodeEnv} on http://localhost:${config.port}`
      );
    });

    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled Rejection:", reason);
      server.close(() => process.exit(1));
    });

    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
