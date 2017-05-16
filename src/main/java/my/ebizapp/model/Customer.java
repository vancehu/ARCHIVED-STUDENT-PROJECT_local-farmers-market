package my.ebizapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.List;


@Entity
public class Customer {

    @Id
    @GeneratedValue
    private long id;

    @Column(length = 32, nullable = false, unique = true)
    private String username;

    @JsonIgnore
    @Column(length = 255, nullable = false)
    private String password;

    @Column(length = 64, nullable = false)
    private String fullName;

    @Column(length = 64)
    private String orgName;

    @Column(length = 15, nullable = false)
    private String phone;

    @Column(length = 255, nullable = false, unique = true)
    private String email;

    private String description;

    @Column(length = 255, nullable = false)
    private String street;

    @Column(length = 64)
    private String imgLink;

    @ManyToOne
    private Area area;

    @JsonIgnore
    @OneToMany
    private List<Transact> transacts;


    Customer() {
    }


    public Customer(String username, String password, String fullName, String orgName, String phone, String email, String description, String street,
                    String imgLink, Area area) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.orgName = orgName;
        this.phone = phone;
        this.email = email;
        this.description = description;
        this.street = street;
        this.imgLink = imgLink;
        this.area = area;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getOrgName() {
        return orgName;
    }

    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImgLink() {
        return imgLink;
    }

    public void setImgLink(String imgLink) {
        this.imgLink = imgLink;
    }

    public Area getArea() {
        return area;
    }

    public void setArea(Area area) {
        this.area = area;
    }

    public List<Transact> getTransacts() {
        return transacts;
    }

    public void setTransacts(List<Transact> transacts) {
        this.transacts = transacts;
    }
}