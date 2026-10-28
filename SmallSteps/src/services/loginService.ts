import * as SecureStore from 'expo-secure-store';
import { LoginRequest } from "../dto/LoginRequest";
import { LoginResponse } from "../dto/LoginResponse";
import { api } from "./api";

export const loginService = {

// guradar o token da autenticação
    async save(key: string, value: string) {
    await SecureStore.setItemAsync(key, value);
    },

    // gera jwt se login ok
    async logIn (data: LoginRequest): Promise<string> {        
        const response = await api.post<LoginResponse>("/login", data);        
        return response.data.token;
    },

    // teste só pra ver se guardou mesmo
    async getValueFor(key: string) {
    console.log("Keyyy:" + key);
    let result = await SecureStore.getItemAsync(key);
    console.log("Result:" + result);
        if (result) {
            alert("🔐 Token JWT: 🔐 \n" + result);
        } else {
            alert('Sem token.');
        }
    }
}