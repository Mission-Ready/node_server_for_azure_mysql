const path = require("path");
// Load variables from the .env next to this file into process.env
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const mysql = require("mysql2");
const fs = require("fs");
const cors = require("cors");
const app = express();
app.use(cors()); // allow requests from all frontend.

//========== CONFIG CHECK ============//
// Stop straight away if a variable is missing or still has a <your-...> placeholder.
const requiredEnv = ["MYSQL_HOST", "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_DATABASE"];
const badEnv = requiredEnv.filter(
  (name) => !process.env[name] || process.env[name].includes("<your-")
);
if (badEnv.length > 0) {
  console.error(`❌ Missing or placeholder values for: ${badEnv.join(", ")}`);
  console.error("   Running locally? Copy .env.example to .env and fill in your values,");
  console.error("   then press Ctrl+C and run npm run dev again.");
  console.error("   On Azure? Add them under App Service > Settings > Environment variables.");
  process.exit(1);
}

// Create a connection pool to the database
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306, // 3306 is the standard MySQL port
  ssl: { ca: fs.readFileSync(path.join(__dirname, "DigiCertGlobalRootCA.crt.pem")) },
  decimalNumbers: true, // return DECIMAL values (e.g. from SUM()) as numbers, not strings
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

//========== DATABASE CHECK ============//
// Run one query at startup so connection problems show up in the terminal now,
// not later as an "Internal Server Error" in the browser.
const errorHints = {
  ETIMEDOUT: "Azure's firewall is blocking your IP. Add it under your MySQL server > Networking.",
  ENOTFOUND: "MYSQL_HOST is wrong. Use your full server name once, e.g. my-server.mysql.database.azure.com.",
  ECONNREFUSED: "Nothing is accepting connections at MYSQL_HOST. Check the server name.",
  ER_ACCESS_DENIED_ERROR: "MYSQL_USER or MYSQL_PASSWORD is wrong.",
  ER_BAD_DB_ERROR: "The database doesn't exist. Import world.sql with MySQL Workbench.",
  ER_NO_SUCH_TABLE: "The country table doesn't exist. Import world.sql with MySQL Workbench.",
};

pool.query("SELECT 1 FROM country LIMIT 1", (err) => {
  if (err) {
    console.error(`❌ Database check failed (${err.code})`);
    if (err.message) console.error(`   ${err.message}`);
    console.error(`   ${errorHints[err.code] || "See Troubleshooting in README.md."}`);
    console.error("   Fix it, then press Ctrl+C and run npm run dev again.");
    return;
  }
  console.log(`✅ Connected to MySQL database "${process.env.MYSQL_DATABASE}"`);
});

//========== ENDPOINTS ============//

// Root endpoint: returns all countries
app.get("/", (req, res) => {
  console.log("GET / endpoint was hit 🎯");
  pool.query("SELECT * FROM country", (err, results) => {
    if (err) {
      console.error("Error fetching countries:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.json(results);
  });
});

// Get a list of countries that belong to Oceania
app.get("/oceania", (req, res) => {
  console.log("GET /oceania endpoint was hit 🎯");
  const query = `
    SELECT Name, LifeExpectancy 
    FROM country 
    WHERE Continent = 'Oceania' 
    ORDER BY LifeExpectancy DESC 
    LIMIT 10;
  `;
  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching Oceania countries:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.json(results);
  });
});

// Show information about a specific country by its name
app.get("/country/:countryname", (req, res) => {
  console.log(`GET /country/${req.params.countryname} endpoint was hit 🎯`);
  const { countryname } = req.params;

  // query() fills in the ? safely, just like execute(). We use query() here because
  // execute() returns FLOAT columns with extra digits (LifeExpectancy 77.80000305175781).
  const query = "SELECT * FROM country WHERE Name = ?";
  pool.query(query, [countryname], (err, results) => {
    if (err) {
      console.error(`Error fetching details for ${countryname}:`, err);
      return res.status(500).send("Internal Server Error");
    }
    if (results.length === 0) {
      return res.status(404).json({ error: `No country named "${countryname}"` });
    }
    res.json(results);
  });
});

// Find the total population of a continent
app.get("/population/:continent", (req, res) => {
  console.log(`GET /population/${req.params.continent} endpoint was hit 🎯`);
  const { continent } = req.params;

  const query = `
    SELECT Continent, SUM(Population) AS TotalPopulation
    FROM country
    WHERE Continent = ?
    GROUP BY Continent;
  `;
  pool.execute(query, [continent], (err, results) => {
    if (err) {
      console.error(`Error fetching population for ${continent}:`, err);
      return res.status(500).send("Internal Server Error");
    }
    if (results.length === 0) {
      return res.status(404).json({ error: `No continent named "${continent}"` });
    }
    res.json(results[0]);
  });
});

//========== PORT ============//
/**
  App Service sets the environment variable PORT in the Node.js container, 
  and forwards the incoming requests to your container at that port number. 
  
  To receive the requests, your app should listen to that port using process.env.PORT. 
 */
const PORT = process.env.PORT || 4000;

app
  .listen(PORT, () => {
    console.log(`Server is live at http://localhost:${PORT}`);
  })
  .on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `❌ Port ${PORT} is already in use. Stop the other server (Ctrl+C in its terminal) or change PORT in .env.`
      );
    } else {
      console.error("Server Error:", error);
    }
  });
