package my.ebizapp.model;

import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * Created by Vance on 4/9/15.
 */
public interface AreaRepository extends CrudRepository<Area, Long> {
    List<Area> findByZipcode(String zipcode);
}
