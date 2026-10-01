const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], movies: [], reviews: [] }));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
};

module.exports = { readDB, writeDB };
