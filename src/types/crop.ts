export interface Crop {
  id: string;
  name: string;
  family: string;
  group: string;
  vegetationDays: number;
  soilNeeds: string;
  lightNeeds: string;
  image?: string;
  description?: string; // ← description только здесь, для модалки
  predecessors?: {
    good: string[];
    bad: string[];
  };
  neighbors?: {
    good: string[];
    bad: string[];
  };
  following?: string[];
  feeding?: string;
  enrichment?: string;
}