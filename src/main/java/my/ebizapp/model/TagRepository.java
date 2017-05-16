package my.ebizapp.model;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface TagRepository extends CrudRepository<Tag, Long> {
    @Cacheable
    List<Tag> findById(long id);

}
