const express = require("express");

const details = {
  name: "Basic Details API",
  version: "1.0.0",
  description: "A simple Node.js and Express.js REST API with DeepSeek",
  author: "API Team",
  status: "ok",
  framework: "Express.js",
  runtime: "Node.js",
  endpoints: [
    { method: "GET", path: "/", description: "Welcome message" },
    { method: "GET", path: "/health", description: "Health check" },
    { method: "GET", path: "/api/details", description: "Basic application details" },
    { method: "GET", path: "/api/details/:id", description: "A single sample record by id" },
    {
      method: "GET",
      path: "/api/deepseek/details",
      description: "Basic details generated from the DeepSeek prompt",
    },
    {
      method: "POST",
      path: "/api/deepseek/chat",
      description: "Send a prompt to DeepSeek and return JSON data",
    },
  ],
};

const sampleRecords = [
  { id: "1", name: "Ada Lovelace", role: "Mathematician", location: "London" },
  { id: "2", name: "Grace Hopper", role: "Computer Scientist", location: "New York" },
  { id: "3", name: "Alan Turing", role: "Cryptanalyst", location: "Manchester" },
];

function createDetailsRouter() {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.json({
      success: true,
      data: details,
      records: sampleRecords,
    });
  });

  router.get("/:id", (req, res) => {
    const record = sampleRecords.find((item) => item.id === req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }

    return res.json({
      success: true,
      data: record,
    });
  });

  return router;
}

module.exports = {
  createDetailsRouter,
  details,
};
