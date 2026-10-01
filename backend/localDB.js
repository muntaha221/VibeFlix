const fs = require('fs');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';
const DB_FILE = isProd 
  ? path.join('/tmp', 'database.json') 
  : path.join(__dirname, 'database.json');

const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialDB = path.join(__dirname, 'database.json');
    if (isProd && fs.existsSync(initialDB)) {
      try {
        fs.copyFileSync(initialDB, DB_FILE);
      } catch (e) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], movies: [], reviews: [] }));
      }
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], movies: [], reviews: [] }));
    }
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
};

module.exports = { readDB, writeDB };
