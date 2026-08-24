package com.smallsteps.smallsteps.model;

import java.time.LocalDate;
import java.util.List;

public class UserDTO {
    public int id;
    public String name;
    public String password;
    public String email;
    public String description;
    public int streak;
    public boolean status;
    public LocalDate dtStart;
    public List<String> tags;
}
