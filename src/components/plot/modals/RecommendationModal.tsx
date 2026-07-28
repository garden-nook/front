import React, { useCallback, useEffect, useRef, useState } from "react";
import type { UIBed } from "../../../api";
import type {
  Reason,
  Recommendation,
  RecommendationResponse,
  SearchResult,
} from "../../../api/types/recommendation";
import filterOffSvg from "../../../assets/filter-off.svg";
import filterSvg from "../../../assets/filter.svg";
import ActionButton from "../../UI/ActionButton";
import modalStyles from "./Modals.module.css";
import styles from "./RecommendationModal.module.css";

export interface RecommendationModalProps {
  bed: UIBed;
  initialPlantingDate?: Date;
  onPlant: (cropId: number, date: string) => void;
  onClose: () => void;
  fetchCultures: (
    bedId: string,
    search: string,
    limit: number,
    searchLimit: number,
    disableFilters: boolean,
  ) => Promise<RecommendationResponse>;
}

const getISODate = (date?: Date) => (date || new Date()).toISOString().slice(0, 10);

const RecommendationModal: React.FC<RecommendationModalProps> = ({
  bed,
  initialPlantingDate,
  onClose,
  onPlant,
  fetchCultures,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEnabled, setFilterEnabled] = useState(true);
  const [plantingDate, setPlantingDate] = useState(getISODate(initialPlantingDate));
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[] | undefined>([]);
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null);

  const [tooltip, setTooltip] = useState<{
    cropId: number;
    reasons: Reason[];
    x: number;
    y: number;
  } | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(0);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchCultures(bed.id, searchQuery, 10, 15, !filterEnabled);
      setRecommendations(data.recommendations);
      setSearchResults(data.search_results);
    } catch {
      setRecommendations([]);
      setSearchResults([]);
    }
  }, [bed, searchQuery, filterEnabled, fetchCultures]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadData();
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, filterEnabled, loadData]);

  useEffect(() => {
    setSelectedCropId(null);
  }, [recommendations, searchResults]);

  const showTooltip = (e: React.MouseEvent, cropId: number, reasons: Reason[]) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({
      cropId,
      reasons,
      x: rect.left,
      y: rect.bottom,
    });
  };

  const hideTooltip = () => setTooltip(null);

  const handlePlant = () => {
    if (selectedCropId === null) return;
    onPlant(selectedCropId, plantingDate);
  };

  const renderCard = (
    crop: { crop_id: number; name: string; family_name: string },
    isPositive?: boolean,
    reasons?: Reason[],
  ) => {
    const isSelected = selectedCropId === crop.crop_id;
    const bgClass =
      isPositive === undefined ? styles.searchCard : isPositive ? styles.positive : styles.negative;

    const handleMouseEnter = (e: React.MouseEvent) => {
      if (reasons && reasons.length > 0) showTooltip(e, crop.crop_id, reasons);
    };

    return (
      <div
        key={crop.crop_id}
        className={`${styles.card} ${bgClass} ${isSelected ? styles.selected : ""}`}
        onClick={() => setSelectedCropId(crop.crop_id)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={hideTooltip}
      >
        <div className={styles.cardContent}>
          <span className={styles.cultureName}>{crop.name}</span>
        </div>
      </div>
    );
  };

  const pros = tooltip?.reasons.filter((r) => r.ispositive) ?? [];
  const cons = tooltip?.reasons.filter((r) => !r.ispositive) ?? [];

  return (
    <div
      className={modalStyles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Посадка культуры</h2>
          <ActionButton
            color="red"
            icon="cancel"
            shape="littleSquare"
            title="Закрыть"
            onClick={onClose}
          />
        </div>

        <div className={modalStyles.modalSubtitle}>
          {bed.name} ({bed.width}×{bed.height})
        </div>

        <div className={styles.controls}>
          <div className={`${modalStyles.modalField} ${styles.searchInput}`}>
            <input
              type="text"
              placeholder="Поиск культуры..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div
            className={`${styles.filterToggle} ${filterEnabled ? styles.filterToggleOn : ""}`}
            onClick={() => setFilterEnabled((prev) => !prev)}
            role="switch"
            aria-checked={filterEnabled}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") setFilterEnabled((prev) => !prev);
            }}
          >
            <div className={styles.filterToggleThumb}>
              <img src={filterEnabled ? filterSvg : filterOffSvg} className={styles.filterIcon} />
            </div>
          </div>

          <div className={modalStyles.modalField}>
            <input
              type="date"
              className={modalStyles.dateInput}
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
            />
          </div>
        </div>

        {recommendations.length > 0 && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Рекомендации</h3>
            <div className={styles.grid}>
              {recommendations.map((rec) => renderCard(rec, rec.ispositive, rec.reasons))}
            </div>
          </section>
        )}

        {searchResults && searchResults.length > 0 && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Результаты поиска</h3>
            <div className={styles.grid}>{searchResults.map((res) => renderCard(res))}</div>
          </section>
        )}

        {(!searchResults || searchResults.length === 0) && (
          <div className={styles.empty}>
            {!searchQuery ? "Начните вводить интересующую вас культуру..." : "Ничего не найдено"}
          </div>
        )}

        {tooltip && (
          <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y }}>
            <div className={styles.tooltipContent}>
              {pros.length > 0 && (
                <div>
                  <strong className={styles.prosTitle}>Рекомендуем:</strong>
                  <ul className={styles.reasonList}>
                    {pros.map((r, i) => (
                      <li className={styles.proArg} key={i}>
                        {r.explanation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {cons.length > 0 && (
                <div>
                  <strong className={styles.consTitle}>Не советуем:</strong>
                  <ul className={styles.reasonList}>
                    {cons.map((r, i) => (
                      <li className={styles.conArg} key={i}>
                        {r.explanation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={modalStyles.modalActions}>
          <button type="submit" onClick={handlePlant} className={modalStyles.primary}>
            Посадить
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationModal;
