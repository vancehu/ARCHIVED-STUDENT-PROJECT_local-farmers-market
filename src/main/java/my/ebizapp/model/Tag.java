package my.ebizapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.List;

/**
 * Created by Vance on 4/12/2015.
 */
@Entity
public class Tag {
    @Id
    @GeneratedValue
    private long id;

    @Column(nullable = false, length = 64)
    private String name;

    @Column(nullable = false)
    private long parentId;

    @Column(length = 64)
    private String imgLink;

    @JsonIgnore
    @ManyToMany
    private List<Product> products;

    Tag() {
    }

    public Tag(String name, long parentId, String imgLink) {
        this.name = name;
        this.parentId = parentId;
        this.imgLink = imgLink;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getParentId() {
        return parentId;
    }

    public void setParentId(long parentId) {
        this.parentId = parentId;
    }

    public String getImgLink() {
        return imgLink;
    }

    public void setImgLink(String imgLink) {
        this.imgLink = imgLink;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}

