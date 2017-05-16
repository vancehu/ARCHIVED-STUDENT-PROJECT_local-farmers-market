package my.ebizapp.model;

import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.List;

public interface TransactRepository extends PagingAndSortingRepository<Transact, Long> {
    List<Transact> findById(long id);


    List<Transact> findByIdAndCustomer(Long id, Customer customer);

    List<Transact> findByIdAndProduct_Supplier(Long id, Supplier supplier);

    List<Transact> findByProduct_Supplier(Supplier supplier);

    List<Transact> findByCustomerOrderByTimeDesc(Customer customer, Pageable pageable);

    List<Transact> findByProduct_SupplierOrderByTimeDesc(Supplier supplier, Pageable pageable);

    Long countByProduct_Supplier(Supplier supplier);
    Long countByCustomer(Customer customer);


}