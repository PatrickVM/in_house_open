#!/usr/bin/env node
/*
  Generates public/firebase-messaging-sw.js from the template by injecting
  NEXT_PUBLIC_FIREBASE_* env vars. Run via npm scripts (predev/prebuild).
*/

const fs = require("fs");
const path = require("path");

// Load env from .env.local if present (dev) and .env
try {
  require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });
  require("dotenv").config();
} catch (_) {}

const requiredVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const optionalVars = ["NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"];

const templatePath = path.resolve(
  __dirname,
  "../public/firebase-messaging-sw.js.template"
);
const outPath = path.resolve(__dirname, "../public/firebase-messaging-sw.js");

if (!fs.existsSync(templatePath)) {
  console.error("Template not found at", templatePath);
  process.exit(1);
}

let template = fs.readFileSync(templatePath, "utf8");

// Validate required
const missing = requiredVars.filter(
  (k) => !process.env[k] || process.env[k].trim() === ""
);
if (missing.length > 0) {
  console.error("Missing required Firebase env vars:", missing.join(", "));
  process.exit(1);
}

// Replace placeholders
const replacements = {
  __FIREBASE_API_KEY__: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  __FIREBASE_AUTH_DOMAIN__: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  __FIREBASE_PROJECT_ID__: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  __FIREBASE_STORAGE_BUCKET__: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  __FIREBASE_MESSAGING_SENDER_ID__:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  __FIREBASE_APP_ID__: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  __FIREBASE_MEASUREMENT_ID__:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

for (const [token, value] of Object.entries(replacements)) {
  template = template.split(token).join(value);
}

// If measurementId is empty, remove the line to avoid empty string config
if (!replacements.__FIREBASE_MEASUREMENT_ID__) {
  template = template.replace(/\n\s*measurementId: ".*"\n/, "\n");
}

fs.writeFileSync(outPath, template, { encoding: "utf8" });
console.log("Generated", path.relative(process.cwd(), outPath));
