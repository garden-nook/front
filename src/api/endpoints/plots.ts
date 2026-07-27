// src/api/endpoints/plots.ts
import { api } from "../client";
import type { CreatePlotRequest, Plot, UpdatePlotRequest } from "../types/plots.types";

const BASE_URL = "/api/v1/plots";

export async function getPlots(): Promise<Plot[]> {
  const response = await api.get<{ data: Plot[] }>(BASE_URL);
  return response.data.data;
}

export async function createPlot(data: CreatePlotRequest): Promise<string> {
  const response = await api.post<{ data: { id: string } }>(BASE_URL, data);
  return response.data.data.id;
}

export async function updatePlot(id: string, data: UpdatePlotRequest): Promise<void> {
  await api.put(`${BASE_URL}/${id}`, data);
}

export async function deletePlot(id: string): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`);
}
