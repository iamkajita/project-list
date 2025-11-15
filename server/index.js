import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './database/init.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'トークンが無効です' });
    }
    req.user = user;
    next();
  });
};

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'ユーザー名とパスワードは必須です' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'このユーザー名は既に使用されています' });
          }
          return res.status(500).json({ error: 'ユーザー登録に失敗しました' });
        }
        res.status(201).json({ message: 'ユーザー登録が完了しました', userId: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'サーバーエラー' });
    }
    if (!user) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが間違っています' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが間違っています' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username });
  });
});

app.get('/api/projects', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'データ取得に失敗しました' });
      }
      res.json(rows);
    }
  );
});

app.post('/api/projects', authenticateToken, (req, res) => {
  const { id, name, content, preference } = req.body;

  db.run(
    'INSERT INTO projects (id, user_id, name, content, preference) VALUES (?, ?, ?, ?, ?)',
    [id, req.user.id, name, content, preference || 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '案件の追加に失敗しました' });
      }
      res.status(201).json({ message: '案件を追加しました', id });
    }
  );
});

app.put('/api/projects/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { preference, completed } = req.body;

  db.run(
    'UPDATE projects SET preference = ?, completed = ? WHERE id = ? AND user_id = ?',
    [preference, completed ? 1 : 0, id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '案件の更新に失敗しました' });
      }
      res.json({ message: '案件を更新しました' });
    }
  );
});

app.delete('/api/projects/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(
    'DELETE FROM projects WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '案件の削除に失敗しました' });
      }
      res.json({ message: '案件を削除しました' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
