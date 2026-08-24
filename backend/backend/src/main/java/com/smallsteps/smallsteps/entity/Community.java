package com.smallsteps.smallsteps.entity;

import java.time.LocalDate;

public class Community {
    private String code;
    private String name;
    private int id;
    private int maxMembers;
    private int memberCount;
    private String photo;
    private LocalDate dtStart;
    //falta tags
    private boolean open;

public Community() {}

public Community(String code, String name, int id, int maxMembers, int memberCount, String photo, LocalDate dtStart,
        boolean open) {
    this.code = code;
    this.name = name;
    this.id = id;
    this.maxMembers = maxMembers;
    this.memberCount = memberCount;
    this.photo = photo;
    this.dtStart = dtStart;
    this.open = open;
}

public String getCode() {
    return code;
}

public void setCode(String code) {
    this.code = code;
}

public String getName() {
    return name;
}

public void setName(String name) {
    this.name = name;
}

public int getId() {
    return id;
}

public void setId(int id) {
    this.id = id;
}

public int getMaxMembers() {
    return maxMembers;
}

public void setMaxMembers(int maxMembers) {
    this.maxMembers = maxMembers;
}

public int getMemberCount() {
    return memberCount;
}

public void setMemberCount(int memberCount) {
    this.memberCount = memberCount;
}

public String getPhoto() {
    return photo;
}

public void setPhoto(String photo) {
    this.photo = photo;
}

public LocalDate getDtStart() {
    return dtStart;
}

public void setDtStart(LocalDate dtStart) {
    this.dtStart = dtStart;
}

public boolean isOpen() {
    return open;
}

public void setOpen(boolean open) {
    this.open = open;
}

}
