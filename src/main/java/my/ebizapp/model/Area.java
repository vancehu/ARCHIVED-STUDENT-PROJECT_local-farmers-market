package my.ebizapp.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;

/**
 * Created by Vance on 4/9/15.
 */
@Entity
public class Area {
    @Id
    @Column(length = 5, unique = true, nullable = false)
    private String zipcode;

    @Column(length = 64, nullable = false)
    private String name;

    Area() {
    }

    public Area(String zipcode, String name) {
        this.zipcode = zipcode;
        this.name = name;
    }

    public String getZipcode() {
        return zipcode;
    }

    public void setZipcode(String zipcode) {
        this.zipcode = zipcode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
