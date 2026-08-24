package com.smallsteps.smallsteps.model;

import java.time.LocalDate;

public class EventDTO {
    public String title;
    public String description;

    public String address;

    // dt = dia, time = hora, exemplo: dt 12/12/2012 - 15/12/2012, time 12:30 - 19:00
    public LocalDate dtStart;
    public LocalDate dtEnd;
    public int timeStart;
    public int timeEnd;

    //fk
    public String community;
    public String author;
}
