import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Редактирование профиля
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState<string | null>(null);

  // Смена пароля
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Загружаем аватар при монтировании и при изменении user
  useEffect(() => {
    if (user?.id) {
      const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
      if (savedAvatar) {
        setAvatar(savedAvatar);
      }
    }
  }, [user?.id]);

  // Обновляем данные формы при изменении user
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    }
  }, [user]);

  const handleSaveProfile = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Заполните все поля');
      return;
    }

    updateProfile(firstName, lastName, email);
    setIsEditing(false);
    setSuccess('Профиль успешно обновлён');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCancelEdit = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEmail(user?.email || '');
    setIsEditing(false);
    setError('');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер файла не должен превышать 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatar(base64);
        if (user?.id) {
          localStorage.setItem(`avatar_${user.id}`, base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPassword || !newPassword) {
      setPasswordError('Заполните все поля');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Новый пароль должен содержать минимум 6 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    const success = changePassword(oldPassword, newPassword);
    if (success) {
      setPasswordSuccess('Пароль успешно изменён');
      setIsChangingPassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } else {
      setPasswordError('Неверный текущий пароль');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const buttonPrimaryStyle = {
    padding: '10px 20px',
    backgroundColor: '#22C55E',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  };

  const buttonSecondaryStyle = {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '2px solid #22C55E' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>
            Огородный уголок
          </h1>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link to="/" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
              Мои участки
            </Link>
            <Link to="/catalog" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
              Каталог культур
            </Link>
            <Link to="/tasks" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'none' }}>
              Задачи
            </Link>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <Avatar 
                userId={user.id} 
                firstName={user.firstName} 
                size={32}
              />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F2937', marginBottom: '24px' }}>
          Профиль
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '20px',
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
            marginBottom: '20px',
          }}>
            {success}
          </div>
        )}

        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Основная информация */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '24px' }}>
              {/* Аватар */}
              <div style={{ position: 'relative' }}>
                <div
                  onClick={handleAvatarClick}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: avatar ? '#E5E7EB' : '#22C55E',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    border: '3px solid white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  {avatar ? (
                    <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '36px', fontWeight: 600, color: 'white' }}>
                      {user.firstName?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <div
                  onClick={handleAvatarClick}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#22C55E',
                    border: '3px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>

              {/* Имя и email */}
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#1F2937', margin: '0 0 4px 0' }}>
                  {user.firstName} {user.lastName}
                </h3>
                <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>{user.email}</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '24px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', margin: '0 0 16px 0' }}>
                Личная информация
              </h4>

              {isEditing ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                        Имя
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                        Фамилия
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={handleSaveProfile} style={buttonPrimaryStyle}>
                      Сохранить
                    </button>
                    <button type="button" onClick={handleCancelEdit} style={buttonSecondaryStyle}>
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'grid', gap: '12px', flex: 1 }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280', minWidth: '100px' }}>Имя:</span>
                      <span style={{ fontSize: '14px', color: '#1F2937' }}>{user.firstName}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280', minWidth: '100px' }}>Фамилия:</span>
                      <span style={{ fontSize: '14px', color: '#1F2937' }}>{user.lastName}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280', minWidth: '100px' }}>Email:</span>
                      <span style={{ fontSize: '14px', color: '#1F2937' }}>{user.email}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsEditing(true)} style={buttonSecondaryStyle}>
                    Редактировать
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Смена пароля */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', margin: '0 0 16px 0' }}>
              Безопасность
            </h4>

            {passwordError && (
              <div style={{
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '12px',
              }}>
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div style={{
                backgroundColor: '#DCFCE7',
                color: '#16A34A',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '12px',
              }}>
                {passwordSuccess}
              </div>
            )}

            {isChangingPassword ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                    Текущий пароль
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                    Новый пароль
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                    Подтвердите новый пароль
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={handleChangePassword} style={buttonPrimaryStyle}>
                    Изменить пароль
                  </button>
                  <button type="button" onClick={() => {
                    setIsChangingPassword(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }} style={buttonSecondaryStyle}>
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setIsChangingPassword(true)} style={buttonSecondaryStyle}>
                Изменить пароль
              </button>
            )}
          </div>

          {/* Выход */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                ...buttonSecondaryStyle,
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                border: '1px solid #FECACA',
                width: '100%',
              }}
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}