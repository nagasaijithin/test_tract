const express = require("express");

const app = express();

app.use(express.json());

const details = {
  name: "Basic Details API",
  version: "1.0.0",
  description: "A simple Node.js and Express.js REST API",
  author: "API Team",
  status: "ok",
  framework: "Express.js",
  runtime: "Node.js",
  endpoints: [
    { method: "GET", path: "/", description: "Welcome message" },
    { method: "GET", path: "/health", description: "Health check" },
    { method: "GET", path: "/api/details", description: "Basic application details" },
    { method: "GET", path: "/api/details/:id", description: "A single sample record by id" },
  ],
};

const sampleRecords = [
  { id: "1", name: "Ada Lovelace", role: "Mathematician", location: "London" },
  { id: "2", name: "Grace Hopper", role: "Computer Scientist", location: "New York" },
  { id: "3", name: "Alan Turing", role: "Cryptanalyst", location: "Manchester" },
];

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Basic Details REST API",
    docs: "/api/details",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/details", (req, res) => {
  res.json({
    success: true,
    data: details,
    records: sampleRecords,
  });
});

app.get("/api/details/:id", (req, res) => {
  const record = sampleRecords.find((item) => item.id === req.params.id);

  if (!record) {
    return res.status(404).json({
      success: false,
      error: "Record not found",
    });
  }

  res.json({
    success: true,
    data: record,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

module.exports = app;
