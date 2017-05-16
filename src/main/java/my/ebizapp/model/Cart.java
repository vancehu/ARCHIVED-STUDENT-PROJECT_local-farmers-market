package my.ebizapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
public class Cart {
    @Id
    @GeneratedValue
    private long id;

    @ManyToOne(optional = false)
    private Product product;

    @JsonIgnore
    @ManyToOne(optional = false)
    private Customer customer;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private BigDecimal shippingPrice;

    @Column(nullable = false)
    private long quantity;

    Cart() {
    }

    public Cart(Product product, Customer customer, BigDecimal price, BigDecimal shippingPrice, long quantity) {
        this.product = product;
        this.customer = customer;
        this.price = price;
        this.shippingPrice = shippingPrice;
        this.quantity = quantity;
    }

    public BigDecimal getShippingPrice() {
        return shippingPrice;
    }

    public void setShippingPrice(BigDecimal shippingPrice) {
        this.shippingPrice = shippingPrice;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }


    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public long getQuantity() {
        return quantity;
    }

    public void setQuantity(long quantity) {
        this.quantity = quantity;
    }

}
