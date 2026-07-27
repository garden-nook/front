import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/endpoints/auth";
import logoIcon from "../assets/logo.svg";
import { useAuth } from "../contexts/AuthContext";
import { loginStyles as styles } from "../PageStyles/Login.styles";

type AuthMode = "login" | "register";

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regDisplayName, setRegDisplayName] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!loginEmail || !loginPassword) {
      setError("Заполните все поля");
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.login({
        email: loginEmail,
        password: loginPassword,
      });

      const data = response.data;

      if (data.success && data.data?.access_token) {
        await authLogin(loginEmail, loginPassword);
        navigate("/");
      } else {
        setError(data.error || "Неверный email или пароль");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!regEmail || !regPassword || !regDisplayName) {
      setError("Заполните все поля");
      setLoading(false);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError("Пароли не совпадают");
      setLoading(false);
      return;
    }

    if (regPassword.length < 8) {
      setError("Пароль должен содержать минимум 8 символов");
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.register({
        display_name: regDisplayName,
        email: regEmail,
        password: regPassword,
      });

      const data = response.data;

      if (data.success && data.data?.user_id) {
        await authLogin(regEmail, regPassword);
        navigate("/");
      } else {
        setError(data.error || "Ошибка регистрации");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: loading ? "#9CA3AF" : "#22C55E",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: loading ? "default" : "pointer",
    transition: "background-color 0.2s",
  };

  const linkButtonStyle = {
    background: "none",
    border: "none",
    color: "#22C55E",
    fontSize: "13px",
    cursor: loading ? "default" : "pointer",
    padding: 0,
    textDecoration: "underline",
    fontFamily: "inherit",
    opacity: loading ? 0.5 : 1,
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoWrapper}>
          <div style={styles.logoRow}>
            <img src={logoIcon} alt="Огородный уголок" style={styles.logoImage} />
            <h1 style={styles.title}>Огородный уголок</h1>
          </div>
          <p style={styles.subtitle}>
            {mode === "login" && "Войдите в свой аккаунт"}
            {mode === "register" && "Создайте новый аккаунт"}
          </p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {mode === "login" && (
          <form onSubmit={handleLogin} style={styles.form}>
            <div>
              <label style={styles.label}>Email</label>
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
              <label style={styles.label}>Пароль</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                disabled={loading}
              />
            </div>

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? "Загрузка..." : "Войти"}
            </button>

            <div style={styles.switchMode}>
              Нет аккаунта?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                style={linkButtonStyle}
                disabled={loading}
              >
                Зарегистрироваться
              </button>
            </div>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleRegister} style={styles.form}>
            <div>
              <label style={styles.label}>Имя и фамилия</label>
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
              <label style={styles.label}>Email</label>
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
              <label style={styles.label}>Пароль</label>
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
              <label style={styles.label}>Подтвердите пароль</label>
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
              {loading ? "Загрузка..." : "Зарегистрироваться"}
            </button>

            <div style={styles.switchMode}>
              Уже есть аккаунт?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                style={linkButtonStyle}
                disabled={loading}
              >
                Войти
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
