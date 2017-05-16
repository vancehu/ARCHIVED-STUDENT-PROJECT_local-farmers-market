package my.ebizapp.model;

import javax.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
public class Transact {
    @Id
    @GeneratedValue
    private long id;

    @ManyToOne(optional = false)
    private Product product;

    @ManyToOne(optional = false)
    private Customer customer;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private BigDecimal shippingPrice;

    @Column(nullable = false)
    private long quantity;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date time = new Date();

    @Column(length = 64, nullable = false)
    private String fullName;

    @Column(length = 64)
    private String orgName;

    @Column(length = 15, nullable = false)
    private String phone;

    @Column(length = 255, nullable = false)
    private String email;

    @Column(length = 255, nullable = false)
    private String street;

    @ManyToOne
    private Area area;

    @Column(nullable = false)
    private boolean shipped = false;

    @Column
    private String tracking;


    @Column(nullable = false)
    private boolean cancel = false;

    @Column(nullable = false)
    private boolean cancelByCustomer = false;

    @Column
    private String cancelReason;


    Transact() {
    }

    public Transact(Product product, Customer customer, BigDecimal price, BigDecimal shippingPrice, long quantity, String fullName, String orgName, String phone, String email, String street, Area area) {
        this.product = product;
        this.customer = customer;
        this.price = price;
        this.shippingPrice = shippingPrice;
        this.quantity = quantity;
        this.fullName = fullName;
        this.orgName = orgName;
        this.phone = phone;
        this.email = email;
        this.street = street;
        this.area = area;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getOrgName() {
        return orgName;
    }

    public void setOrgName(String orgName) {
        this.orgName = orgName;
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

    public Area getArea() {
        return area;
    }

    public void setArea(Area area) {
        this.area = area;
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

    public BigDecimal getShippingPrice() {
        return shippingPrice;
    }

    public void setShippingPrice(BigDecimal shippingPrice) {
        this.shippingPrice = shippingPrice;
    }

    public long getQuantity() {
        return quantity;
    }

    public void setQuantity(long quantity) {
        this.quantity = quantity;
    }

    public Date getTime() {
        return time;
    }

    public void setTime(Date time) {
        this.time = time;
    }

    public boolean isShipped() {
        return shipped;
    }

    public void setShipped(boolean shipped) {
        this.shipped = shipped;
    }

    public String getTracking() {
        return tracking;
    }

    public void setTracking(String tracking) {
        this.tracking = tracking;
    }

    public boolean isCancel() {
        return cancel;
    }

    public void setCancel(boolean cancel) {
        this.cancel = cancel;
    }

    public boolean isCancelByCustomer() {
        return cancelByCustomer;
    }

    public void setCancelByCustomer(boolean cancelByCustomer) {
        this.cancelByCustomer = cancelByCustomer;
    }

    public String getCancelReason() {
        return cancelReason;
    }

    public void setCancelReason(String cancelReason) {
        this.cancelReason = cancelReason;
    }
}
