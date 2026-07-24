// src/pages/PlotEditor/components/plot/Toolbar.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import styles from './Toolbar.module.css';
import { STATIC_LABELS } from '../../hooks/usePlotEditor';
import type { Tool, Subtype, GardenObject, Rect } from '../../api/types/plot.types';
import ActionButton from '../UI/ActionButton';
import AddBedModal from './modals/AddBedModal';

interface ToolbarProps {
  selectedTool: Tool;
  onToolSelect: (tool: Tool) => void;
  selectedSubtype: Subtype;
  onSubtypeSelect: (subtype: Subtype) => void;
  selectedObject: GardenObject | null;
  onClearAll: () => void;
  onAddBed: (name: string, rect: Rect) => void;
  pendingBedRect: Rect | null;
  onPendingBedRectClear: () => void;
  onMenuOpenChange?: (isOpen: boolean) => void;
  isDrawing?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onToolSelect,
  selectedSubtype,
  onSubtypeSelect,
  selectedObject,
  onClearAll,
  onAddBed,
  pendingBedRect,
  onPendingBedRectClear,
  onMenuOpenChange,
  isDrawing = false,
}) => {
  const [showAddBedModal, setShowAddBedModal] = useState(false);
  const [defaultBedName, setDefaultBedName] = useState('');
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const submenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedTool || selectedTool === 'select') {
      onToolSelect('view');
    }
  }, []);

  useEffect(() => {
    if (pendingBedRect) {
      const bedCount = document.querySelectorAll('[data-type="bed"]').length || 0;
      setDefaultBedName(`Грядка ${bedCount + 1}`);
      setShowAddBedModal(true);
    }
  }, [pendingBedRect]);

  // Обработчик открытия/закрытия подменю
  const handleSubmenuToggle = useCallback((isOpen: boolean) => {
    setIsSubmenuOpen(isOpen);
    if (onMenuOpenChange) {
      onMenuOpenChange(isOpen);
    }
  }, [onMenuOpenChange]);

  const isViewOrPlantMode = selectedTool === 'view' || selectedTool === 'plant';
  const isSelectMode = selectedTool === 'select';
  const isAddMode = selectedTool === 'addBed' || selectedTool === 'addStatic';

  const handleAddBedSave = (name: string) => {
    if (pendingBedRect) {
      onAddBed(name, pendingBedRect);
      onPendingBedRectClear();
    }
    setShowAddBedModal(false);
  };

  const handleAddBedModalClose = () => {
    setShowAddBedModal(false);
    onPendingBedRectClear();
  };

  return (
    <>
      <div className={styles.toolbarWrapper}>
        <div className={styles.toolbarRow}>
          <ActionButton
            onClick={() => {
              if (selectedTool === 'view') {
                onToolSelect('plant');
              } else if (selectedTool === 'plant') {
                onToolSelect('view');
              } else {
                onToolSelect('view');
              }
            }}
            title="Просмотр и посадка"
            icon="logo"
            shape="littleCircle"
            color={isViewOrPlantMode ? 'greenLight' : undefined}
          />

          <ActionButton
            onClick={() => onToolSelect('select')}
            title="Редактирование объектов"
            icon="edit"
            shape="littleCircle"
            color={isSelectMode ? 'greenLight' : undefined}
          />

          <div 
            ref={submenuRef}
            className={styles.submenu}
            onMouseEnter={() => {
              // При входе в меню - блокируем canvas
              if (onMenuOpenChange) {
                onMenuOpenChange(true);
              }
            }}
            onMouseLeave={() => {
              // При выходе из меню - разблокируем canvas
              if (onMenuOpenChange) {
                onMenuOpenChange(false);
              }
            }}
          >
            <ActionButton
              onClick={() => {
                if (!isAddMode) {
                  onToolSelect('addBed');
                }
              }}
              title="Добавить объект"
              icon="add"
              shape="littleCircle"
              color={isAddMode ? 'greenLight' : undefined}
            />
            {isAddMode && (
              <div 
                className={styles.submenuItems}
                onMouseEnter={() => {
                  if (onMenuOpenChange) {
                    onMenuOpenChange(true);
                  }
                }}
                onMouseLeave={() => {
                  if (onMenuOpenChange) {
                    onMenuOpenChange(false);
                  }
                }}
              >
                <button
                  className={selectedTool === 'addBed' ? styles.active : ''}
                  onClick={() => {
                    onToolSelect('addBed');
                    onSubtypeSelect('building');
                  }}
                >
                  🌱 Грядка
                </button>
                {(['building', 'tree', 'path', 'water'] as const).map(subtype => (
                  <button
                    key={subtype}
                    className={selectedTool === 'addStatic' && selectedSubtype === subtype ? styles.active : ''}
                    onClick={() => {
                      onToolSelect('addStatic');
                      onSubtypeSelect(subtype);
                    }}
                  >
                    {STATIC_LABELS[subtype]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ActionButton
            onClick={onClearAll}
            title="Удалить все объекты"
            icon="delete"
            shape="littleCircle"
            color="red"
          />
        </div>
      </div>

      <AddBedModal
        open={showAddBedModal}
        onSave={handleAddBedSave}
        onClose={handleAddBedModalClose}
        defaultName={defaultBedName}
      />
    </>
  );
};

export default Toolbar;