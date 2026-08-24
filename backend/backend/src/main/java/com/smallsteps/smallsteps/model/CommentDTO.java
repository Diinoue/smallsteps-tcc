package com.smallsteps.smallsteps.model;

import java.time.LocalDate;

public class CommentDTO {
    public String description;
    public LocalDate dtStart;
    public String author;
    public int id;

    //comentarios podem ser feitos tanto em eventos quanto em posts
    //fk
    public String post;
    public String event;

}
