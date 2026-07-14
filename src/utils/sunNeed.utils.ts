import { SUN_NEEDS, type SunNeeds } from "../api/types/crops.types";

// ===== МАППИНГ ДЛЯ UI =====
export const SUN_NEEDS_LABELS: Record<SunNeeds, string> = {
  [SUN_NEEDS.FULL_SUN]: "Светолюбивые",
  [SUN_NEEDS.PARTIAL_SHADE]: "Тенелюбивые",
  [SUN_NEEDS.FULL_SHADE]: "Тенивыносливые",
} as const;

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
export function getSunNeedsLabel(value: SunNeeds): string {
  return SUN_NEEDS_LABELS[value];
}

// ===== ОПЦИИ ДЛЯ SELECT =====
export const SUN_NEEDS_OPTIONS = [
  { value: SUN_NEEDS.FULL_SUN, label: "Светолюбивые" },
  { value: SUN_NEEDS.PARTIAL_SHADE, label: "Тенелюбивые" },
  { value: SUN_NEEDS.FULL_SHADE, label: "Тенивыносливые" },
] as const;
