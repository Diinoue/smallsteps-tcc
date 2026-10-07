package com.smallsteps.smallsteps.dto;

import java.time.LocalDate;

public class PostDTO {
    public String description;
    public int id;
    public LocalDate dtStart;
    public String community;
    public String photo;
    public int numComment;

    //fk do usuario
    public String author;
}
