// src/pages/Test.tsx
import React, { useState } from 'react';
import { authApi } from '../api/endpoints/auth';

export const Test: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const hasToken = !!localStorage.getItem('access_token');

  const log = (type: 'success' | 'error' | 'info', message: string, data?: any) => {
    console.log(`${type.toUpperCase()}:`, message, data || '');
    setResult({ type, message, data });
  };

  const clear = () => {
    setResult(null);
    setError(null);
  };

  const handleError = (err: any): string => err?.message || 'Неизвестная ошибка';

  const withLoading = async (fn: () => Promise<void>) => {
    setLoading(true);
    clear();
    try {
      await fn();
    } catch (err) {
      const message = handleError(err);
      setError(message);
      log('error', `❌ ${message}`, err);
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (!displayName || !email || !password) {
      setError('Заполните все поля');
      return;
    }

    const response = await authApi.register({
      display_name: displayName,
      email,
      password,
    });

    const data = response.data;
    if (data.success && data.data?.user_id) {
      log('success', '✅ Регистрация успешна!', data.data);
    } else {
      throw new Error(data.error || 'Ошибка регистрации');
    }
  };

  const login = async () => {
    if (!email || !password) {
      setError('Введите email и пароль');
      return;
    }

    const response = await authApi.login({ email, password });
    const data = response.data;

    if (data.success && data.data?.access_token) {
      localStorage.setItem('access_token', data.data.access_token);
      log('success', '✅ Вход успешен!', data.data);
    } else {
      throw new Error(data.error || 'Ошибка входа');
    }
  };

  const getProfile = async () => {
    const response = await authApi.getMe();
    const data = response.data;

    if (data.success && data.data?.id) {
      log('success', '✅ Профиль получен!', data.data);
    } else {
      throw new Error(data.error || 'Ошибка получения профиля');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setResult(null);
    setError(null);
    log('info', '🔓 Выход выполнен');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🧪 Тестирование API</h1>

      <div style={styles.fields}>
        <div>
          <h3 style={styles.subtitle}>👤 Пользователь</h3>
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={styles.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.info}>
          <strong>📋 Структура ответов:</strong>
          <ul style={styles.list}>
            <li><strong>Регистрация:</strong> <code>response.data.data.user_id</code></li>
            <li><strong>Вход:</strong> <code>response.data.data.access_token</code></li>
            <li><strong>Профиль:</strong> <code>response.data.data.id</code></li>
          </ul>
          <div style={styles.hint}>
            <strong>ℹ️ Токен автоматически добавляется интерцептором</strong>
          </div>
        </div>
      </div>

      <div style={styles.buttons}>
        <button onClick={() => withLoading(register)} disabled={loading} style={buttonStyle('#22c55e')}>
          {loading ? '⏳' : '📝'} Регистрация
        </button>
        <button onClick={() => withLoading(login)} disabled={loading} style={buttonStyle('#3b82f6')}>
          {loading ? '⏳' : '🔑'} Вход
        </button>
        <button onClick={() => withLoading(getProfile)} disabled={loading} style={buttonStyle('#8b5cf6')}>
          {loading ? '⏳' : '👤'} Профиль
        </button>
        <button onClick={logout} disabled={loading} style={buttonStyle('#ef4444')}>
          🚪 Выход
        </button>
      </div>

      {loading && <div style={styles.status}>⏳ Выполняется запрос...</div>}
      {error && <div style={styles.error}>❌ {error}</div>}

      {result && (
        <div style={{ ...styles.result, ...(result.type === 'success' ? styles.success : styles.fail) }}>
          <div style={styles.resultMessage}>{result.message}</div>
          {result.data && (
            <pre style={styles.json}>{JSON.stringify(result.data, null, 2)}</pre>
          )}
        </div>
      )}

      <div style={{ ...styles.tokenStatus, ...(hasToken ? styles.tokenExists : styles.tokenMissing) }}>
        <strong>🔑 Статус токена:</strong> {hasToken ? '✅ Есть' : '❌ Нет'}
      </div>

      <div style={styles.instructions}>
        <strong>💡 Инструкция:</strong>
        <ol style={styles.instructionsList}>
          <li>Введите данные пользователя (Display Name, Email, Пароль)</li>
          <li>Нажмите <strong>"Регистрация"</strong> — создаст нового пользователя</li>
          <li>Нажмите <strong>"Вход"</strong> — войдет и сохранит токен</li>
          <li>Нажмите <strong>"Профиль"</strong> — получит данные профиля</li>
          <li>Нажмите <strong>"Выход"</strong> — удалит токен</li>
        </ol>
        <p style={styles.consoleHint}>📊 Все результаты также выводятся в консоль (F12)</p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '20px',
    fontFamily: 'system-ui, sans-serif',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '16px',
  },
  fields: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '16px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '6px 8px',
    marginBottom: '6px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  info: {
    padding: '12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    fontSize: '13px',
  },
  list: {
    marginTop: '8px',
    paddingLeft: '20px',
    listStyle: 'disc',
  },
  hint: {
    marginTop: '8px',
    padding: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    fontSize: '12px',
  },
  buttons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '20px',
  },
  status: {
    padding: '12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    marginBottom: '12px',
    textAlign: 'center',
  },
  error: {
    padding: '12px',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    marginBottom: '12px',
  },
  result: {
    padding: '16px',
    border: '1px solid',
    borderRadius: '8px',
    marginBottom: '12px',
  },
  success: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  fail: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  resultMessage: {
    fontWeight: '500',
    marginBottom: '8px',
  },
  json: {
    backgroundColor: '#1f2937',
    color: '#e5e7eb',
    padding: '12px',
    borderRadius: '4px',
    overflow: 'auto',
    maxHeight: '300px',
    fontSize: '12px',
    fontFamily: 'monospace',
    marginTop: '8px',
  },
  tokenStatus: {
    padding: '12px',
    borderRadius: '8px',
    fontSize: '12px',
    marginTop: '12px',
    border: '1px solid',
  },
  tokenExists: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  tokenMissing: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  instructions: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#1e40af',
  },
  instructionsList: {
    marginTop: '4px',
    paddingLeft: '20px',
  },
  consoleHint: {
    marginTop: '8px',
    fontSize: '12px',
  },
};

const buttonStyle = (color: string): React.CSSProperties => ({
  padding: '8px 16px',
  backgroundColor: color,
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'all 0.2s',
});

const style = document.createElement('style');
style.textContent = `
  button:hover:not(:disabled) {
    opacity: 0.9;
    transform: scale(1.02);
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  button:active:not(:disabled) {
    transform: scale(0.98);
  }
`;
document.head.appendChild(style);