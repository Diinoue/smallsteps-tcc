package com.smallsteps.smallsteps.dto;

import java.time.format.DateTimeFormatter;
import com.smallsteps.smallsteps.entity.Comentario;

public class ComentarioResponseDTO {
    private int id;
    private Integer idPost;
    private Integer idEvento;
    private String conteudo;
    private String createdAt;
    private ComentarioAuthorDTO author;

    public static class ComentarioAuthorDTO {
        private int id;
        private String name;
        private String avatarUrl;

        public ComentarioAuthorDTO() {}

        public ComentarioAuthorDTO(int id, String name, String avatarUrl) {
            this.id = id;
            this.name = name;
            this.avatarUrl = avatarUrl;
        }

        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }

    public ComentarioResponseDTO() {}

    public ComentarioResponseDTO(Comentario c) {
        this.id = c.getId();
        this.idPost = c.getPost() != null ? c.getPost().getId() : null;
        this.idEvento = c.getEvento() != null ? c.getEvento().getId() : null;
        this.conteudo = c.getConteudo();
        if (c.getDtCriacao() != null) {
            this.createdAt = c.getDtCriacao().format(DateTimeFormatter.ofPattern("dd/MM/yy"));
        } else {
            this.createdAt = "";
        }
        if (c.getUsuario() != null) {
            this.author = new ComentarioAuthorDTO(
                c.getUsuario().getId(),
                c.getUsuario().getNome(),
                c.getUsuario().getFoto()
            );
        } else {
            this.author = new ComentarioAuthorDTO(0, "Membro", null);
        }
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public Integer getIdPost() { return idPost; }
    public void setIdPost(Integer idPost) { this.idPost = idPost; }
    public Integer getIdEvento() { return idEvento; }
    public void setIdEvento(Integer idEvento) { this.idEvento = idEvento; }
    public String getConteudo() { return conteudo; }
    public void setConteudo(String conteudo) { this.conteudo = conteudo; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public ComentarioAuthorDTO getAuthor() { return author; }
    public void setAuthor(ComentarioAuthorDTO author) { this.author = author; }
}
