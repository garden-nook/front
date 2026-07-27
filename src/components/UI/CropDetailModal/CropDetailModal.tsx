import React from "react";
import Accordion from "../Accordion/Accordion";
import styles from "./CropDetailModal.module.css";

interface CropDetailModalProps {
  crop: {
    id: string;
    name: string;
    family_name: string;
    vegetation_days_avg: number;
    soil_name: string;
    sun_needs: number;
    image?: string;
    description?: string;
    predecessors?: { good: string[]; bad: string[] };
    neighbors?: { good: string[]; bad: string[] };
    following?: string[];
  };
  onClose: () => void;
}

function mapSunNeeds(value: number): string | null {
  if (value === 1) return "Солнце";
  if (value === 2) return "Полутень";
  if (value === 3) return "Тень";
  return null;
}

const CropDetailModal: React.FC<CropDetailModalProps> = ({ crop, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const getSpecs = () => {
    const result: { label: string; value: string }[] = [];

    const addSpec = (label: string, value: unknown) => {
      if (value === null || value === undefined) return;
      if (typeof value === "string" && value.trim() === "") return;
      if (value === "00") return;
      if (value === "0") return;
      if (value === 0) return;
      if (value === "Не указано") return;
      if (value === "") return;
      result.push({ label, value: String(value) });
    };

    addSpec("Семейство", crop.family_name);
    addSpec("Срок вегетации", crop.vegetation_days_avg ? `${crop.vegetation_days_avg} дн.` : null);
    addSpec("Вид почвы", crop.soil_name);
    addSpec("Освещённость", mapSunNeeds(crop.sun_needs));

    return result;
  };

  const specs = getSpecs();

  const hasPredecessors =
    (crop.predecessors?.good?.length || 0) > 0 || (crop.predecessors?.bad?.length || 0) > 0;
  const hasNeighbors =
    (crop.neighbors?.good?.length || 0) > 0 || (crop.neighbors?.bad?.length || 0) > 0;
  const hasFollowing = (crop.following?.length || 0) > 0;
  const hasAccordions = hasPredecessors || hasNeighbors || hasFollowing;
  const hasDescription = crop.description && crop.description.trim() !== "";

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className={styles.title}>{crop.name}</h2>

        <div className={styles.mainRow}>
          <div className={styles.imageWrapper}>
            {crop.image ? (
              <img src={crop.image} alt={crop.name} className={styles.image} />
            ) : (
              <div className={styles.imagePlaceholder} />
            )}
          </div>
          {hasDescription && <p className={styles.description}>{crop.description}</p>}
        </div>

        {specs.length > 0 && (
          <div className={styles.specsList}>
            {specs.map((spec, index) => (
              <div key={index} className={styles.specRow}>
                <span className={styles.specLabel}>{spec.label}</span>
                <span className={styles.specValue}>{spec.value}</span>
              </div>
            ))}
          </div>
        )}

        {hasAccordions && (
          <div className={styles.accordions}>
            {hasPredecessors && (
              <Accordion
                title="Предшественники"
                content={
                  <div className={styles.accordionContent}>
                    {crop.predecessors?.good && crop.predecessors.good.length > 0 && (
                      <div className={styles.accordionRow}>
                        <span className={styles.accordionLabel}>Хорошие:</span>
                        <span className={styles.accordionValue}>
                          {crop.predecessors.good.join(", ")}
                        </span>
                      </div>
                    )}
                    {crop.predecessors?.bad && crop.predecessors.bad.length > 0 && (
                      <div className={styles.accordionRow}>
                        <span className={styles.accordionLabel}>Плохие:</span>
                        <span className={styles.accordionValue}>
                          {crop.predecessors.bad.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                }
              />
            )}

            {hasNeighbors && (
              <Accordion
                title="Соседи"
                content={
                  <div className={styles.accordionContent}>
                    {crop.neighbors?.good && crop.neighbors.good.length > 0 && (
                      <div className={styles.accordionRow}>
                        <span className={styles.accordionLabel}>Хорошие:</span>
                        <span className={styles.accordionValue}>
                          {crop.neighbors.good.join(", ")}
                        </span>
                      </div>
                    )}
                    {crop.neighbors?.bad && crop.neighbors.bad.length > 0 && (
                      <div className={styles.accordionRow}>
                        <span className={styles.accordionLabel}>Плохие:</span>
                        <span className={styles.accordionValue}>
                          {crop.neighbors.bad.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                }
              />
            )}

            {hasFollowing && (
              <Accordion
                title="Последующие культуры"
                content={
                  <div className={styles.accordionContent}>
                    <div className={styles.accordionRow}>
                      <span className={styles.accordionValue}>
                        {crop.following?.join(", ") || ""}
                      </span>
                    </div>
                  </div>
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CropDetailModal;
