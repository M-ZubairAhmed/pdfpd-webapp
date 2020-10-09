const fs = require("fs");

// This file exists to insert env vars in Netlify at build time
fs.writeFileSync(
  "./.env",
  `NODE_ENV=production
API_BASE_URL=${process.env.API_BASE_URL}
FIREBASE_AUTH_DOMAIN=${process.env.FIREBASE_AUTH_DOMAIN}
FIREBASE_PROJECT_URL=${process.env.FIREBASE_PROJECT_URL}
FIREBASE_PROJECT_ID=${process.env.FIREBASE_PROJECT_ID}`
);
