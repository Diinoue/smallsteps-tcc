package com.smallsteps.smallsteps.dto;

import java.time.LocalDate;
import java.util.List;

public class CommunityDTO {
    public String name;
    public int id;
    public int maxMembers;
    public int memberCount;
    public String photo;
    public LocalDate dtStart;
    public List<String> tags;

    // open = true grupo aparece nas pesquisas; open = false grupo aparece apenas por codigo de convite 
    public boolean open;

    //codigo de convite
    public String code;
}
