package my.ebizapp.model;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface CartRepository extends CrudRepository<Cart, Long> {
    List<Cart> findById(long id);

    List<Cart> findByCustomer(Customer customer);

    List<Cart> findByProductAndCustomer(Product product, Customer customer);

    List<Cart> findByIdAndCustomer(Long id, Customer customer);

    Long countByCustomer(Customer customer);
}
