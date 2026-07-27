// src/pages/PlotEditor/components/plot/PlotInfo.tsx
import React, { useState, useRef, useEffect } from 'react';
import styles from './PlotInfo.module.css';
import ActionButton from '../UI/ActionButton';

interface PlotInfoProps {
  plotName: string;
  plotWidth: number;
  plotHeight: number;
  cellSizeMeters: number;
  cols: number;
  rows: number;
  objectsCount: number;
  bedsCount: number;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const PlotInfo: React.FC<PlotInfoProps> = ({
  plotName,
  plotWidth,
  plotHeight,
  cellSizeMeters,
  cols,
  rows,
  objectsCount,
  bedsCount,
  isCollapsed,
  onToggle,
}) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(false);
  const titleRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Проверяем, нужно ли прокручивать текст
  useEffect(() => {
    if (titleRef.current && containerRef.current) {
      const titleWidth = titleRef.current.scrollWidth;
      const containerWidth = containerRef.current.offsetWidth;
      setNeedsScroll(titleWidth > containerWidth);
    }
  }, [plotName]);

  // Запускаем прокрутку при наведении
  const handleMouseEnter = () => {
    if (needsScroll) {
      setIsScrolling(true);
    }
  };

  const handleMouseLeave = () => {
    setIsScrolling(false);
  };

  // Обработчик для всего блока в свернутом состоянии
  const handleCollapsedClick = () => {
    onToggle();
  };

  // Обработчик для кнопки с остановкой распространения
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  return (
    <div className={styles.plotInfoWrapper}>
      <div 
        className={`${styles.plotInfo} ${isCollapsed ? styles.collapsed : ''}`}
      >
        {isCollapsed ? (
          <div 
            className={styles.plotInfoCollapsed}
            onClick={handleCollapsedClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span className={styles.plotInfoTitle}/>
            <div 
              ref={containerRef}
              className={`${styles.plotNameContainer} ${isScrolling ? styles.scrolling : ''}`}
            >
              <span 
                ref={titleRef}
                className={styles.plotName}
              >
                {plotName}
              </span>
            </div>
            <div onClick={handleButtonClick}>
              <ActionButton 
                onClick={() => {}} 
                title="Развернуть"
                icon="add"
                shape="miniCircle"
              />
            </div>
          </div>
        ) : (
          <>
            <div 
              className={styles.plotInfoHeader}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                ref={containerRef}
                className={`${styles.plotNameContainer} ${isScrolling ? styles.scrolling : ''}`}
              >
                <span 
                  ref={titleRef}
                  className={styles.plotName}
                >
                  {plotName}
                </span>
              </div>
              <ActionButton 
                onClick={onToggle}
                title="Свернуть"
                icon="minus"
                shape="miniCircle"
              />
            </div>
            <div className={styles.plotInfoContent}>
              <div className={styles.plotInfoRow}>
                <span className={styles.plotInfoLabel}>Размер:</span>
                <span className={styles.plotInfoValue}>{plotWidth} × {plotHeight} м</span>
              </div>
              <div className={styles.plotInfoRow}>
                <span className={styles.plotInfoLabel}>Площадь:</span>
                <span className={styles.plotInfoValue}>{(plotWidth * plotHeight).toFixed(1)} м²</span>
              </div>
              <div className={styles.plotInfoRow}>
                <span className={styles.plotInfoLabel}>Клетка:</span>
                <span className={styles.plotInfoValue}>{cellSizeMeters} м</span>
              </div>
              <div className={styles.plotInfoRow}>
                <span className={styles.plotInfoLabel}>Сетка:</span>
                <span className={styles.plotInfoValue}>{cols} × {rows}</span>
              </div>
              <div className={styles.plotInfoRow}>
                <span className={styles.plotInfoLabel}>Объектов:</span>
                <span className={styles.plotInfoValue}>{objectsCount}</span>
              </div>
              <div className={styles.plotInfoRow}>
                <span className={styles.plotInfoLabel}>Грядок:</span>
                <span className={styles.plotInfoValue}>{bedsCount}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlotInfo;