// src/pages/PlotEditor/components/Canvas/ZoomControls.tsx
import React from 'react';
import styles from './ZoomControls.module.css';

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  minScale?: number;
  maxScale?: number;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
  minScale = 0.3,
  maxScale = 3,
}) => {
  const percent = Math.round(scale * 100);

  return (
    <div className={styles.zoomControls}>
      <button
        className={styles.zoomButton}
        onClick={onZoomOut}
        disabled={scale <= minScale}
        title="Уменьшить"
      >
        <span className={styles.icon}>−</span>
      </button>

      <button
        className={styles.zoomLevel}
        onClick={onReset}
        title="Сбросить масштаб (100%)"
      >
        {percent}%
      </button>

      <button
        className={styles.zoomButton}
        onClick={onZoomIn}
        disabled={scale >= maxScale}
        title="Увеличить"
      >
        <span className={styles.icon}>+</span>
      </button>
    </div>
  );
};

export default ZoomControls;