// src/components/plot/ZoomControls.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import ActionButton from "../UI/ActionButton";
import Input from "../UI/Input/Input";
import styles from "./ZoomControls.module.css";

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onScaleChange: (value: number) => void;
  minScale?: number;
  maxScale?: number;
  step?: number;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onScaleChange,
  minScale = 0.5, // 50%
  maxScale = 2, // 200%
}) => {
  // Храним предыдущее валидное значение
  const [inputValue, setInputValue] = useState<string>(String(Math.round(scale * 100)));
  const lastValidValue = useRef<number>(Math.round(scale * 100));

  // Обновляем при изменении scale извне
  useEffect(() => {
    const newPercent = Math.round(scale * 100);
    setInputValue(String(newPercent));
    lastValidValue.current = newPercent;
  }, [scale]);

  // Валидация: проверяем, что значение в диапазоне 50-200
  const isValidValue = (value: number): boolean => {
    return !isNaN(value) && value >= 50 && value <= 200;
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      setInputValue(rawValue);

      // Если поле пустое — ничего не делаем
      if (rawValue === "") return;

      const numValue = parseFloat(rawValue);
      if (!isNaN(numValue) && isValidValue(numValue)) {
        // Валидное значение — обновляем масштаб
        lastValidValue.current = numValue;
        onScaleChange(numValue / 100);
      }
      // Если значение невалидное — просто обновляем отображение, но масштаб не меняем
    },
    [onScaleChange],
  );

  const handleInputBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const numValue = parseFloat(rawValue);

      // Если поле пустое или значение не число — возвращаем последнее валидное
      if (rawValue === "" || isNaN(numValue)) {
        setInputValue(String(lastValidValue.current));
        return;
      }

      // Проверяем валидность
      if (isValidValue(numValue)) {
        // Валидное — обновляем
        lastValidValue.current = numValue;
        onScaleChange(numValue / 100);
      } else {
        // Невалидное — возвращаем последнее валидное
        setInputValue(String(lastValidValue.current));
      }
    },
    [onScaleChange],
  );

  // Обработка Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  }, []);

  // Проверяем, достигнут ли минимум (50%) или максимум (200%)
  const isMinScale = scale <= minScale;
  const isMaxScale = scale >= maxScale;

  return (
    <div className={styles.zoomControls}>
      <ActionButton
        onClick={onZoomOut}
        title="Уменьшить масштаб"
        icon="minus"
        shape="littleSquare"
        disabled={isMinScale}
      />

      <div className={styles.scaleInputWrapper}>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder="100"
          className={styles.scaleInput}
          aria-label="Масштаб в процентах"
        />
        <span className={styles.scalePercent}>%</span>
      </div>

      <ActionButton
        onClick={onZoomIn}
        title="Увеличить масштаб"
        icon="add"
        shape="littleSquare"
        disabled={isMaxScale}
      />
    </div>
  );
};

export default ZoomControls;
