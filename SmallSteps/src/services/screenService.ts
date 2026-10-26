import { DashboardDTOResponse } from "../dto/DashboardResponse";
import { api } from "./api";

export const screenService = {

    async consultarDashboard(idUsuario: number): Promise<DashboardDTOResponse> {
       console.log("enviando");
    const { data } = await api.get<DashboardDTOResponse>(`/screen/dashboard/${idUsuario}`);
        console.log("recebendo");
        console.log(data);
    return data;
}
}
