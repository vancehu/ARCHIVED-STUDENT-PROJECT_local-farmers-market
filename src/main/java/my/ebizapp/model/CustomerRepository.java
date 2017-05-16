package my.ebizapp.model;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface CustomerRepository extends CrudRepository<Customer, Long> {
    List<Customer> findById(long id);

    List<Customer> findByUsernameAndPassword(String username, String password);

    List<Customer> findByUsername(String username);

    List<Customer> findByEmail(String email);
}
