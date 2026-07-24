// src/api/types/plots.types.ts

export interface Plot {
  plot_id: string;
  name: string;
  area_sq_m: number;
  grid_rows: number;
  grid_cols: number;
  grid_cell_size: number;
  soil_type: number;
  soil_name: string;
}

export interface CreatePlotRequest {
  name: string;
  widthMeters: number;
  heightMeters: number;
  soilTypeID?: number;
}

export interface UpdatePlotRequest {
  name?: string;
  soilTypeID?: number;
}