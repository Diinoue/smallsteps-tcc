package com.smallsteps.smallsteps.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "tag_comunidade")
@IdClass(TagComunidadeId.class)
public class TagComunidade {

    @Id
    @Column(name = "id_tag")
    private int idTag;

    @Id
    @Column(name = "id_comunidade")
    private int idComunidade;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tag", insertable = false, updatable = false)
    private Tag tag;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_comunidade", insertable = false, updatable = false)
    private Comunidade comunidade;

    public TagComunidade() {}

    public TagComunidade(int idTag, int idComunidade) {
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

    public Tag getTag() {
        return tag;
    }

    public void setTag(Tag tag) {
        this.tag = tag;
        if (tag != null) {
            this.idTag = tag.getId();
        }
    }

    public Comunidade getComunidade() {
        return comunidade;
    }

    public void setComunidade(Comunidade comunidade) {
        this.comunidade = comunidade;
        if (comunidade != null) {
            this.idComunidade = comunidade.getId();
        }
    }
}
