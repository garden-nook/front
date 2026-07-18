import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'register' | 'reset';

// ============================================================
// API URL (из свагера)
// ============================================================
const API_BASE_URL = 'https://api.dev.192-144-12-78.nip.io';

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Форма входа
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Форма регистрации
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');

  // Форма восстановления
  const [resetEmail, setResetEmail] = useState('');

  // ============================================================
  // 1. ВХОД
  // ============================================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!loginEmail || !loginPassword) {
      setError('Заполните все поля');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const result = await response.json();
      console.log('📦 Ответ от API (логин):', result);

      if (result.success && result.data) {
        // authLogin возвращает void, просто вызываем его
        await authLogin(loginEmail, loginPassword);
        navigate('/');
      } else {
        setError(result.error || 'Неверный email или пароль');
      }
    } catch (err) {
      console.error('❌ Ошибка входа:', err);
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 2. РЕГИСТРАЦИЯ
  // ============================================================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!regEmail || !regPassword || !regDisplayName) {
      setError('Заполните все поля');
      setLoading(false);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (regPassword.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_name: regDisplayName,
          email: regEmail,
          password: regPassword,
        }),
      });

      const result = await response.json();
      console.log('📦 Ответ от API (регистрация):', result);

      if (result.success && result.data) {
        // authLogin возвращает void, просто вызываем его
        await authLogin(regEmail, regPassword);
        navigate('/');
      } else {
        setError(result.error || 'Ошибка регистрации');
      }
    } catch (err) {
      console.error('❌ Ошибка регистрации:', err);
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 3. ВОССТАНОВЛЕНИЕ ПАРОЛЯ
  // ============================================================
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!resetEmail) {
      setError('Введите email');
      setLoading(false);
      return;
    }

    // В свагере нет эндпоинта для восстановления пароля
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess('Инструкции по восстановлению отправлены на ваш email');
    } catch (err) {
      setError('Ошибка при восстановлении пароля');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // СТИЛИ
  // ============================================================
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: loading ? '#9CA3AF' : '#22C55E',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: loading ? 'default' : 'pointer',
    transition: 'background-color 0.2s',
  };

  const linkButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#22C55E',
    fontSize: '13px',
    cursor: loading ? 'default' : 'pointer',
    padding: 0,
    textDecoration: 'underline',
    fontFamily: 'inherit',
    opacity: loading ? 0.5 : 1,
  };

  // ============================================================
  // РЕНДЕРИНГ
  // ============================================================
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F8FAFC',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      }}>
        {/* Логотип */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#DCFCE7',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="32" height="32" fill="none" stroke="#22C55E" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937', margin: '0 0 8px 0' }}>
            Огородный уголок
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            {mode === 'login' && 'Войдите в свой аккаунт'}
            {mode === 'register' && 'Создайте новый аккаунт'}
            {mode === 'reset' && 'Восстановление пароля'}
          </p>
        </div>

        {/* Сообщения об ошибках и успехе */}
        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#DCFCE7',
            color: '#16A34A',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            {success}
          </div>
        )}

        {/* Форма входа */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your@email.com"
                style={inputStyle}
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                Пароль
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                disabled={loading}
              />
            </div>

            <div style={{ textAlign: 'right' }}>
              <button type="button" onClick={() => setMode('reset')} style={linkButtonStyle} disabled={loading}>
                Забыли пароль?
              </button>
            </div>

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? 'Загрузка...' : 'Войти'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
              Нет аккаунта?{' '}
              <button type="button" onClick={() => setMode('register')} style={linkButtonStyle} disabled={loading}>
                Зарегистрироваться
              </button>
            </div>
          </form>
        )}

        {/* Форма регистрации */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                Имя и фамилия
              </label>
              <input
                type="text"
                value={regDisplayName}
                onChange={(e) => setRegDisplayName(e.target.value)}
                placeholder="Иван Иванов"
                style={inputStyle}
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="your@email.com"
                style={inputStyle}
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                Пароль
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Минимум 8 символов"
                style={inputStyle}
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                Подтвердите пароль
              </label>
              <input
                type="password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                disabled={loading}
              />
            </div>

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? 'Загрузка...' : 'Зарегистрироваться'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
              Уже есть аккаунт?{' '}
              <button type="button" onClick={() => setMode('login')} style={linkButtonStyle} disabled={loading}>
                Войти
              </button>
            </div>
          </form>
        )}

        {/* Форма восстановления пароля */}
        {mode === 'reset' && (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="your@email.com"
                style={inputStyle}
                disabled={loading}
              />
            </div>

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? 'Загрузка...' : 'Восстановить пароль'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
              Вспомнили пароль?{' '}
              <button type="button" onClick={() => setMode('login')} style={linkButtonStyle} disabled={loading}>
                Войти
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}