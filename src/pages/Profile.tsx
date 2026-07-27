import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../components/UI/ActionButton";
import Header from "../components/UI/Header/Header";
import Input from "../components/UI/Input/Input";
import { useAuth } from "../contexts/AuthContext";
import { profileStyles as styles } from "../PageStyles/Profile.styles";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [email] = useState(user?.email || "");

  const handleSave = () => {};

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  const displayNameForHeader = user.display_name || "Пользователь";
  const userId = user.id || "user";

  return (
    <div style={styles.page}>
      <Header userId={userId} firstName={displayNameForHeader} />

      <main style={styles.main}>
        <div style={styles.container}>
          <h1 style={styles.title}>Профиль</h1>

          <div style={styles.card}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email</label>
              <Input value={email} onChange={() => {}} placeholder="Email" disabled />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Имя</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Введите имя"
              />
            </div>

            <div style={styles.actionsRow}>
              <ActionButton title="Отмена" shape="text" onClick={() => navigate("/")} />
              <ActionButton
                title="Сохранить"
                color="greenLight"
                shape="text"
                onClick={handleSave}
              />
              <ActionButton title="Выйти" color="red" shape="text" onClick={handleLogout} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
