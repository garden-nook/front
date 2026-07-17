// src/pages/PlotEditor/components/Controls/ViewSwitch.tsx
import React from 'react';
import styles from './ViewSwitch.module.css';

interface ViewSwitchProps {
  view: 'planting' | 'sun';
  onViewChange: (view: 'planting' | 'sun') => void;
}

export const ViewSwitch: React.FC<ViewSwitchProps> = ({ view, onViewChange }) => {
  return (
    <div className={styles.viewSwitch}>
      <button
        className={view === 'planting' ? styles.active : ''}
        onClick={() => onViewChange('planting')}
      >
        🌱 Посадки
      </button>
      <button
        className={view === 'sun' ? styles.active : ''}
        onClick={() => onViewChange('sun')}
      >
        ☀️ Освещение
      </button>
    </div>
  );
};