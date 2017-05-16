package my.ebizapp.model;

import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;

public class CartTemporary {

    private Long productId;

    //lazy fetch fix
    private JsonNode product;

    private BigDecimal price;

    private BigDecimal shippingPrice;

    private long quantity;


    public CartTemporary(Long productId, BigDecimal price, BigDecimal shippingPrice, long quantity, JsonNode product) {
        this.productId = productId;
        this.price = price;
        this.shippingPrice = shippingPrice;
        this.quantity = quantity;
        this.product = product;
    }

    public BigDecimal getShippingPrice() {
        return shippingPrice;
    }

    public void setShippingPrice(BigDecimal shippingPrice) {
        this.shippingPrice = shippingPrice;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long product) {
        this.productId = product;
    }

    public JsonNode getProduct() {
        return product;
    }

    public void setProduct(JsonNode product) {
        this.product = product;
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
