package my.ebizapp.model;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.List;

public interface NotificationRepository extends PagingAndSortingRepository<Notification, Long> {

    List<Notification> findByCustomerAndToCustomerTrueOrderByTimeDesc(Customer customer, Pageable pageable);

    List<Notification> findBySupplierAndToCustomerFalseOrderByTimeDesc(Supplier supplier, Pageable pageable);


    List<Notification> findByIdAndCustomer(Long id, Customer customer);

    List<Notification> findByIdAndSupplier(Long id, Supplier supplier);

    Long countByCustomerAndHasReadFalseAndToCustomerTrue(Customer customer);

    Long countBySupplierAndHasReadFalseAndToCustomerFalse(Supplier supplier);

    Long countByCustomerAndToCustomerTrue(Customer customer);

    Long countBySupplierAndToCustomerFalse(Supplier supplier);

}
