import { DashboardDTOResponse } from "../dto/DashboardResponse";
import { api } from "./api";

export const screenService = {
  async consultarDashboard(): Promise<DashboardDTOResponse> {
    const { data } = await api.get<DashboardDTOResponse>("/screen/dashboard");
    return data;
  },
};
