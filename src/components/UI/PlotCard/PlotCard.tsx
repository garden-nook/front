import React from "react";
import { Link } from "react-router-dom";
import type { Plot } from "../../../api";
import ActionButton from "../ActionButton";
import styles from "./PlotCard.module.css";

interface PlotCardProps {
  plot: Plot;
  onEdit: () => void;
  onDelete: () => void;
}

const PlotCard: React.FC<PlotCardProps> = ({ plot, onEdit, onDelete }) => {
  return (
    <div className={styles.card}>
      <div className={styles.imagePlaceholder} />
      <div className={styles.content}>
        <Link to={`/plot/${plot.plot_id}`} className={styles.title}>
          {plot.name}
        </Link>
        <p className={styles.info}>
          Размер: {plot.grid_cols}x{plot.grid_rows} Грядок: {plot.bed_count} Культур:{" "}
          {plot.crop_count}
        </p>
      </div>
      <div className={styles.actions}>
        <ActionButton icon="edit" color="greenLight" shape="littleSquare" onClick={onEdit} />
        <ActionButton icon="delete" color="red" shape="littleSquare" onClick={onDelete} />
      </div>
    </div>
  );
};

export default PlotCard;
