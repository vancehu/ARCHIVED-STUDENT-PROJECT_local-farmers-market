package my.ebizapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import javax.persistence.*;
import java.util.Date;

/**
 * Created by Vance on 4/11/2015.
 */
@Entity
public class Notification {
    @Id
    @GeneratedValue
    private long id;

    private String body;

    @Column(nullable = false)
    private int type;

    @ManyToOne(optional = false)
    private Customer customer;

    @ManyToOne(optional = false)
    private Supplier supplier;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date time = new Date();

    @Column(nullable = false)
    private boolean toCustomer;

    @Column(nullable = false)
    private boolean hasRead = false;

    Notification() {
    }

    public Notification( int type, String body, Customer customer, Supplier supplier, boolean toCustomer) {
        this.body = body;
        this.type = type;
        this.customer = customer;
        this.supplier = supplier;
        this.toCustomer = toCustomer;
    }

    public int getType() {
        return type;
    }

    public void setType(int type) {
        this.type = type;
    }

    @JsonProperty
    public long getSupplierId() {
        return supplier.getId();
    }

    @JsonProperty
    public long getCustomerId() {
        return customer.getId();
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public Date getTime() {
        return time;
    }

    public void setTime(Date time) {
        this.time = time;
    }

    public boolean isToCustomer() {
        return toCustomer;
    }

    public void setToCustomer(boolean toCustomer) {
        this.toCustomer = toCustomer;
    }

    public boolean isHasRead() {
        return hasRead;
    }

    public void setHasRead(boolean hasRead) {
        this.hasRead = hasRead;
    }
}
