package my.ebizapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
public class Product {

    @Id
    @GeneratedValue
    private long id;

    @ManyToOne
    private Supplier supplier;

    @Column(nullable = false, length = 32)
    private String name;

    @Column(nullable = false, length = 32)
    private String unitName;

    private String description;

    @Column(nullable = false)
    private long availableQuantity;

    @Column(nullable = false)
    private BigDecimal currentPrice;

    @Column(nullable = false)
    private BigDecimal currentShippingPrice;

    @Column(length = 64)
    private String imgLink;

    @ManyToMany
    private List<Tag> tags;

    @JsonIgnore
    @OneToMany
    private List<Transact> transacts;

    Product() {
    }

    public Product(Supplier supplier, String name, String unitName, String description, long availableQuantity, BigDecimal currentPrice, BigDecimal currentShippingPrice, String imgLink, List<Tag> tags) {
        this.supplier = supplier;
        this.name = name;
        this.unitName = unitName;
        this.description = description;
        this.availableQuantity = availableQuantity;
        this.currentPrice = currentPrice;
        this.currentShippingPrice = currentShippingPrice;
        this.imgLink = imgLink;
        this.tags = tags;
    }

    public String getUnitName() {
        return unitName;
    }

    public void setUnitName(String unitName) {
        this.unitName = unitName;
    }

    public BigDecimal getCurrentShippingPrice() {
        return currentShippingPrice;
    }

    public void setCurrentShippingPrice(BigDecimal currentShippingPrice) {
        this.currentShippingPrice = currentShippingPrice;
    }

    public String getImgLink() {
        return imgLink;
    }

    public void setImgLink(String imgLink) {
        this.imgLink = imgLink;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public long getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(long availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }

    public List<Tag> getTags() {
        return tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }

    public List<Transact> getTransacts() {
        return transacts;
    }

    public void setTransacts(List<Transact> transacts) {
        this.transacts = transacts;
    }

}
