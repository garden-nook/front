import React, { useEffect, useRef } from "react";
import { type Rect, STATIC_LABELS, type Subtype, type Tool } from "../../api/types/plot.types";
import ActionButton from "../UI/ActionButton";
import styles from "./Toolbar.module.css";

interface ToolbarProps {
  selectedTool: Tool;
  onToolSelect: (tool: Tool) => void;
  selectedSubtype: Subtype;
  onSubtypeSelect: (subtype: Subtype) => void;
  onClearAll: () => void;
  onAddBed: (defaultName: string) => void; // Изменено: теперь просто открывает модалку
  pendingBedRect: Rect | null;
  onMenuOpenChange?: (isOpen: boolean) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onToolSelect,
  selectedSubtype,
  onSubtypeSelect,
  onClearAll,
  onAddBed,
  pendingBedRect,
  onMenuOpenChange,
}) => {
  const submenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedTool) {
      onToolSelect("view");
    }
  }, [onToolSelect, selectedTool]);

  // При появлении pendingBedRect открываем модалку
  useEffect(() => {
    if (pendingBedRect) {
      onAddBed(`Грядка `);
    }
  }, [pendingBedRect, onAddBed]);

  const isViewOrPlantMode = selectedTool === "view" || selectedTool === "plant";
  const isSelectMode = selectedTool === "select";
  const isAddMode = selectedTool === "addBed" || selectedTool === "addStatic";

  return (
    <div className={styles.toolbarWrapper}>
      <div className={styles.toolbarRow}>
        <ActionButton
          onClick={() => {
            if (selectedTool === "view") {
              onToolSelect("plant");
            } else if (selectedTool === "plant") {
              onToolSelect("view");
            } else {
              onToolSelect("view");
            }
          }}
          title="Просмотр и посадка"
          icon="logo"
          shape="littleCircle"
          color={isViewOrPlantMode ? "greenLight" : undefined}
        />

        <ActionButton
          onClick={() => onToolSelect("select")}
          title="Редактирование объектов"
          icon="edit"
          shape="littleCircle"
          color={isSelectMode ? "greenLight" : undefined}
        />

        <div
          ref={submenuRef}
          className={styles.submenu}
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
          <ActionButton
            onClick={() => {
              if (!isAddMode) {
                onToolSelect("addBed");
              }
            }}
            title="Добавить объект"
            icon="add"
            shape="littleCircle"
            color={isAddMode ? "greenLight" : undefined}
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
                className={selectedTool === "addBed" ? styles.active : ""}
                onClick={() => {
                  onToolSelect("addBed");
                  onSubtypeSelect("building");
                }}
              >
                Грядка
              </button>
              {(["building", "tree", "path", "water"] as const).map((subtype) => (
                <button
                  key={subtype}
                  className={
                    selectedTool === "addStatic" && selectedSubtype === subtype ? styles.active : ""
                  }
                  onClick={() => {
                    onToolSelect("addStatic");
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
  );
};

export default Toolbar;
