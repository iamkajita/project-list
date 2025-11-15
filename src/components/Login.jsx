import React, { useState } from 'react';
import axios from 'axios';
import '../css/Login.css';

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:3001/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/register' : '/login';
      const response = await axios.post(`${API_URL}${endpoint}`, {
        username,
        password
      });

      if (isRegister) {
        setIsRegister(false);
        setError('');
        alert('登録が完了しました。ログインしてください。');
        setPassword('');
      } else {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);
        onLogin(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">
          {isRegister ? 'ユーザー登録' : 'ログイン'}
        </h1>
        <p className="login-subtitle">案件提案システム</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">ユーザー名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="ユーザー名を入力"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="パスワードを入力"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? '処理中...' : (isRegister ? '登録' : 'ログイン')}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="link-button"
          >
            {isRegister
              ? 'すでにアカウントをお持ちですか？ログイン'
              : 'アカウントをお持ちでないですか？登録'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
