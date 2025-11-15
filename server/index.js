import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './database/init.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
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
    
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
      [username, hashedPassword]
    );
    
    res.status(201).json({ message: 'ユーザー登録が完了しました', userId: result.rows[0].id });
  } catch (error) {
    if (error.code === '23505') { // PostgreSQLのUNIQUEエラーコード
      return res.status(400).json({ error: 'このユーザー名は既に使用されています' });
    }
    res.status(500).json({ error: 'ユーザー登録に失敗しました' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが間違っています' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが間違っています' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'データ取得に失敗しました' });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  const { id, name, content, preference } = req.body;

  try {
    await pool.query(
      'INSERT INTO projects (id, user_id, name, content, preference) VALUES ($1, $2, $3, $4, $5)',
      [id, req.user.id, name, content, preference || 0]
    );
    res.status(201).json({ message: '案件を追加しました', id });
  } catch (error) {
    res.status(500).json({ error: '案件の追加に失敗しました' });
  }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { preference, completed } = req.body;

  try {
    await pool.query(
      'UPDATE projects SET preference = $1, completed = $2 WHERE id = $3 AND user_id = $4',
      [preference, completed, id, req.user.id]
    );
    res.json({ message: '案件を更新しました' });
  } catch (error) {
    res.status(500).json({ error: '案件の更新に失敗しました' });
  }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    res.json({ message: '案件を削除しました' });
  } catch (error) {
    res.status(500).json({ error: '案件の削除に失敗しました' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

### 5. **主な変更点**

- `db.run` → `pool.query` (await必須)
- `db.get` → `pool.query` で `result.rows[0]`
- `db.all` → `pool.query` で `result.rows`
- `?` プレースホルダー → `$1, $2, $3...`
- `completed ? 1 : 0` → `completed` (PostgreSQLはBOOLEAN型)

### 6. **ローカルでテスト（オプション）**

PostgreSQLをローカルにインストールしていない場合は、`.env`を以下のように：
```
JWT_SECRET=WIDdFICMMgNKe9DWyCqZxWLQwlbU2Uufmps1BbbazL0=
VITE_API_URL=http://localhost:3001
# DATABASE_URLは本番環境でのみ設定