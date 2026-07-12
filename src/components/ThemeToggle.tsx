import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: colors.bgSecondary,
        border: `1px solid ${colors.border}`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        color: colors.textPrimary,
        fontSize: '18px',
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}