import { CriarUserRequest } from "../dto/CriarUserRequest";
import { UserResponse } from "../dto/UserResponse";
import { UserProfileData } from "../context/ProfileContext";
import { api } from "./api";

export const userService = {
  /**
   * Realiza o cadastro de um novo usuário.
   */
  async cadastrarUser(dados: CriarUserRequest): Promise<UserResponse> {
    const { data } = await api.post<UserResponse>("/users", dados);
    return data;
  },

  /**
   * Consulta os dados do perfil do usuário logado (ou por idUsuario se fornecido).
   * Chama GET /users/profile (ou GET /users/:id) com o token JWT.
   */
  async consultarPerfil(idUsuario?: number): Promise<UserProfileData | null> {
    try {
      const endpoint = idUsuario ? `/users/${idUsuario}` : `/users/profile`;
      const { data } = await api.get<UserProfileData>(endpoint);
      return data;
    } catch (error) {
      console.warn(
        "userService.consultarPerfil: backend indisponível ou offline. Mantendo estado mockado.",
        error
      );
      return null;
    }
  },

  /**
   * Atualiza as informações do perfil do usuário no backend.
   * Chama PUT /users/profile (ou PUT /users/:id) com os dados editados.
   */
  async atualizarPerfil(dados: Partial<UserProfileData>, idUsuario?: number): Promise<boolean> {
    try {
      const endpoint = idUsuario ? `/users/${idUsuario}` : `/users/profile`;
      await api.put(endpoint, dados);
      return true;
    } catch (error) {
      console.warn(
        "userService.atualizarPerfil: backend indisponível ou offline. Alterações mantidas no contexto.",
        error
      );
      return false;
    }
  },

  /**
   * Busca todas as tags cadastradas na tabela 'tag' do banco de dados.
   * Chama GET /users/tags.
   */
  async buscarTags(): Promise<string[]> {
    try {
      const { data } = await api.get<string[]>("/users/tags");
      return data;
    } catch (error) {
      console.warn("userService.buscarTags: backend indisponível. Usando tags locais.", error);
      return [];
    }
  },
};

// Mantém export nomeado de função para compatibilidade existente
export async function cadastrarUser(dados: CriarUserRequest): Promise<UserResponse> {
  return userService.cadastrarUser(dados);
}
