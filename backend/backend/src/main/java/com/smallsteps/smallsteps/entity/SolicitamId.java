package com.smallsteps.smallsteps.entity;

import java.io.Serializable;
import java.util.Objects;

public class SolicitamId implements Serializable {
    private int idUsuario;
    private int idComunidade;

    public SolicitamId() {}

    public SolicitamId(int idUsuario, int idComunidade) {
        this.idUsuario = idUsuario;
        this.idComunidade = idComunidade;
    }

    public int getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(int idUsuario) {
        this.idUsuario = idUsuario;
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
        SolicitamId that = (SolicitamId) o;
        return idUsuario == that.idUsuario && idComunidade == that.idComunidade;
    }

    @Override
    public int hashCode() {
        return Objects.hash(idUsuario, idComunidade);
    }
}
