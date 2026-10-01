const { readDB, writeDB } = require('../localDB');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateId = () => Math.random().toString(36).substr(2, 9);

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const db = readDB();
    const existingUser = db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    
    if (existingUser) {
      const suggestion = `${username}${Math.floor(100 + Math.random() * 900)}`;
      return res.status(400).json({
        message: `Username "${username}" is already taken. Try "${suggestion}" instead.`
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      _id: generateId(),
      username: username.trim(),
      password: passwordHash,
      watchlist: [] // array of movie objects
    };

    db.users.push(newUser);
    writeDB(db);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        watchlist: newUser.watchlist
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const db = readDB();
    const user = db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({ message: 'No account found with that username.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        watchlist: user.watchlist
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find(u => u._id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Omit password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

