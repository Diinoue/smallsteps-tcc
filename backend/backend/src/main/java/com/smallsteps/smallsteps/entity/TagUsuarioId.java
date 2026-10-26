package com.smallsteps.smallsteps.entity;

import java.io.Serializable;
import java.util.Objects;

public class TagUsuarioId implements Serializable {
    private int idTag;
    private int idUsuario;

    public TagUsuarioId() {}

    public TagUsuarioId(int idTag, int idUsuario) {
        this.idTag = idTag;
        this.idUsuario = idUsuario;
    }

    public int getIdTag() {
        return idTag;
    }

    public void setIdTag(int idTag) {
        this.idTag = idTag;
    }

    public int getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(int idUsuario) {
        this.idUsuario = idUsuario;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TagUsuarioId that = (TagUsuarioId) o;
        return idTag == that.idTag && idUsuario == that.idUsuario;
    }

    @Override
    public int hashCode() {
        return Objects.hash(idTag, idUsuario);
    }
}
