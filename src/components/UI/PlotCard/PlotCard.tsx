import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PlotCard.module.css';

interface PlotCardProps {
  id: string;
  name: string;
  width: number;
  height: number;
  bedsCount: number;
  cropsCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

const PlotCard: React.FC<PlotCardProps> = ({
  id,
  name,
  width,
  height,
  bedsCount,
  cropsCount,
  onEdit,
  onDelete
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.imagePlaceholder} />
      <div className={styles.content}>
        <Link to={`/plot/${id}`} className={styles.title}>
          {name}
        </Link>
        <p className={styles.info}>
          Размер: {width}x{height} · Грядок: {bedsCount} · Культур: {cropsCount}
        </p>
      </div>
      <div className={styles.actions}>
        <button type="button" onClick={onEdit} className={styles.editBtn} title="Редактировать">
          <svg width="18" height="18" fill="none" stroke="#16A34A" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button type="button" onClick={onDelete} className={styles.deleteBtn} title="Удалить">
          <svg width="18" height="18" fill="none" stroke="#DC2626" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PlotCard;