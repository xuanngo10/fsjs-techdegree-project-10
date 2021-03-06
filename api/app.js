"use strict";

// load modules
const express = require("express");
const morgan = require("morgan");
const routes = require("./routes");
const { sequelize, models } = require("./db");
const cors = require("cors");

// Get reference to models
const { User, Course } = models;

(async () => {
  try {
    // Test connection to the database
    console.log("Connection to the database successful!");
    await sequelize.authenticate();

    // Sync models
    console.log("Synchronizing models with database..");
    await sequelize.sync({ force: true });
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => err.message);
      console.err("Validation errors: ", errors);
    } else {
      throw error;
    }
  }
})();

// variable to enable global error logging
const enableGlobalErrorLogging =
  process.env.ENABLE_GLOBAL_ERROR_LOGGING === "true";

// create the Express app
const app = express();

// Enable all cors request
app.use(cors());

// Setup request body JSON parsing
app.use(express.json());

// setup morgan which gives us http request logging
app.use(morgan("dev"));

// TODO setup your api routes here
app.use("/api", routes);

// setup a friendly greeting for the root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the REST API project!",
  });
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: "Route Not Found",
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set("port", process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get("port"), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
