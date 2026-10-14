import { CriarUserRequest } from "../dto/CriarUserRequest";
import { UserResponse } from "../dto/UserResponse";
import { api } from "./api";

export async function cadastrarUser(dados: CriarUserRequest): Promise<UserResponse> {
    const { data } = await api.post<UserResponse>("/users", dados);
    return data;
}