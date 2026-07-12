import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'register' | 'reset';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Форма входа
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Форма регистрации
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');

  // Форма восстановления
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginEmail || !loginPassword) {
      setError('Заполните все поля');
      return;
    }

    const success = login(loginEmail, loginPassword);
    if (success) {
      navigate('/');
    } else {
      setError('Неверный email или пароль');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regEmail || !regPassword || !regFirstName || !regLastName) {
      setError('Заполните все поля');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (regPassword.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    const success = register(regEmail, regPassword, regFirstName, regLastName);
    if (success) {
      navigate('/');
    } else {
      setError('Пользователь с таким email уже существует');
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!resetEmail) {
      setError('Введите email');
      return;
    }

    const success = resetPassword(resetEmail);
    if (success) {
      setSuccess('Инструкция по восстановлению пароля отправлена на ваш email');
      setTimeout(() => setMode('login'), 3000);
    } else {
      setError('Пользователь с таким email не найден');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#22C55E',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const linkButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#22C55E',
    fontSize: '13px',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
  };

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
              />
            </div>

            <div style={{ textAlign: 'right' }}>
              <button type="button" onClick={() => setMode('reset')} style={linkButtonStyle}>
                Забыли пароль?
              </button>
            </div>

            <button type="submit" style={buttonStyle}>
              Войти
            </button>

            <div style={{ textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
              Нет аккаунта?{' '}
              <button type="button" onClick={() => setMode('register')} style={linkButtonStyle}>
                Зарегистрироваться
              </button>
            </div>
          </form>
        )}

        {/* Форма регистрации */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                  Имя
                </label>
                <input
                  type="text"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  placeholder="Иван"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                  Фамилия
                </label>
                <input
                  type="text"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  placeholder="Иванов"
                  style={inputStyle}
                />
              </div>
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
                placeholder="Минимум 6 символов"
                style={inputStyle}
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
              />
            </div>

            <button type="submit" style={buttonStyle}>
              Зарегистрироваться
            </button>

            <div style={{ textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
              Уже есть аккаунт?{' '}
              <button type="button" onClick={() => setMode('login')} style={linkButtonStyle}>
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
              />
            </div>

            <button type="submit" style={buttonStyle}>
              Восстановить пароль
            </button>

            <div style={{ textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
              Вспомнили пароль?{' '}
              <button type="button" onClick={() => setMode('login')} style={linkButtonStyle}>
                Войти
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}