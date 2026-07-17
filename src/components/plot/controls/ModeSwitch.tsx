// src/pages/PlotEditor/components/Controls/ModeSwitch.tsx
import React from 'react';
import styles from './ModeSwitch.module.css';

interface ModeSwitchProps {
  mode: 'view' | 'planting' | 'edit';
  onModeChange: (mode: 'view' | 'planting' | 'edit') => void;
}

export const ModeSwitch: React.FC<ModeSwitchProps> = ({ mode, onModeChange }) => {
  return (
    <div className={styles.modeSwitch}>
      <button
        className={mode === 'view' ? styles.active : ''}
        onClick={() => onModeChange('view')}
      >
        👁️ Просмотр
      </button>
      <button
        className={mode === 'planting' ? styles.active : ''}
        onClick={() => onModeChange('planting')}
      >
        🌱 Посадка
      </button>
      <button
        className={mode === 'edit' ? styles.active : ''}
        onClick={() => onModeChange('edit')}
      >
        ✏️ Редактирование
      </button>
    </div>
  );
};