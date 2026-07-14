import React, { useId } from 'react';
import styles from './Select.module.css'

export interface SelectOption<T = any> {
  value: T;
  label: string;
}

interface SelectProps<T> {
  value?: T | null;
  onChange: (value: T | null ) => void;
  options: readonly SelectOption<T>[];
  placeholder?: string;
  label?: string;
  showAll?: boolean;
  className?: string; 
}

export function Select<T>({
  value,
  onChange,
  options,
  placeholder = 'Выберите значение',
  label,
  showAll = false,
}: SelectProps<T>) {
  const id = useId();
  const isSelected = value !== undefined && value !== null;
    // Формируем опции с добавлением "Все"
  const allOptions = showAll 
    ? [{ value: null as T, label: placeholder }, ...options]
    : options;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = allOptions.find(
      opt => String(opt.value) === e.target.value
    )?.value;
    
    if (selectedValue !== undefined) {
      onChange(selectedValue);
    }
  };

  return (
    <div className={styles.container}>
      <select
        id={id}
        value={isSelected ? String(value) : ''}
        onChange={handleChange}
        className={styles.select}
      >
        {placeholder && (
          <option value="" >
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option 
            key={String(option.value)} 
            value={String(option.value)}
          >
            {option.label}
          </option>
        ))}
      </select>

    </div>
  );
}