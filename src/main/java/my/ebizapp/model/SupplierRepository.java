package my.ebizapp.model;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface SupplierRepository extends CrudRepository<Supplier, Long> {
    List<Supplier> findById(long id);

    List<Supplier> findByUsernameAndPassword(String username, String password);

    List<Customer> findByUsername(String username);

    List<Customer> findByEmail(String email);
}
