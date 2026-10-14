package com.smallsteps.smallsteps.entity;

import java.io.Serializable;
import java.util.Objects;

public class TagComunidadeId implements Serializable {
    private int idTag;
    private int idComunidade;

    public TagComunidadeId() {}

    public TagComunidadeId(int idTag, int idComunidade) {
        this.idTag = idTag;
        this.idComunidade = idComunidade;
    }

    public int getIdTag() {
        return idTag;
    }

    public void setIdTag(int idTag) {
        this.idTag = idTag;
    }

    public int getIdComunidade() {
        return idComunidade;
    }

    public void setIdComunidade(int idComunidade) {
        this.idComunidade = idComunidade;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TagComunidadeId that = (TagComunidadeId) o;
        return idTag == that.idTag && idComunidade == that.idComunidade;
    }

    @Override
    public int hashCode() {
        return Objects.hash(idTag, idComunidade);
    }
}
