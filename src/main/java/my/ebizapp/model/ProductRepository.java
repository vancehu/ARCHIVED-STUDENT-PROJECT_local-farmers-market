package my.ebizapp.model;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public interface ProductRepository extends PagingAndSortingRepository<Product, Long> {

    List<Product> findById(Long id);

    List<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<Product> findByTags_IdIn(Collection<Long> ids, Pageable pageable);

    List<Product> findBySupplier(Supplier supplier, Pageable pageable);

    List<Product> findByNameContainingIgnoreCaseAndTags_IdIn(String name,Collection<Long> ids, Pageable pageRequest);

    Long countByNameContaining(String name);

    Long countByTags_IdIn(Collection<Long> ids);

    Long countByNameContainingAndTags_IdIn(String name, Collection<Long> ids);

    Long countBySupplier(Supplier supplier);


    List<Product> findBySupplierAndId(Supplier supplier, Long id);
}
