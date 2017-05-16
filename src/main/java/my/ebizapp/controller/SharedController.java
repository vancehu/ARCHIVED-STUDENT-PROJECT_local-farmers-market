//control general related requests
package my.ebizapp.controller;

import my.ebizapp.model.*;
import my.ebizapp.responseModel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;

@RestController
public class SharedController {

    @Autowired
    AreaRepository areaRepo;
    @Autowired
    CustomerRepository customerRepo;
    @Autowired
    SupplierRepository supplierRepo;

    @Autowired
    ProductRepository productRepo;
    @Autowired
    ProductRepository productImgRepo;
    @Autowired
    CartRepository cartRepo;
    @Autowired
    TagRepository cateRepo;
    @Autowired
    NotificationRepository notificationRepo;

    public static final int ITEMS_PER_PAGE = 5;

    //get current status (user info and unread count)
    @RequestMapping(value = "/getStatus", produces = "application/json", method= RequestMethod.POST)
    public JsonResponse supplierGetStatus(HttpSession session) {
        Status status = new Status();
        //check if user is logged
        if (session.getAttribute("supplier") != null) {
            status.setUser(session.getAttribute("supplier"));
            status.setIsCustomer(false);
            status.setUnreadCount(notificationRepo.countBySupplierAndHasReadFalseAndToCustomerFalse((Supplier) session.getAttribute("supplier")));
        } else if (session.getAttribute("customer") != null) {
            status.setUser(session.getAttribute("customer"));
            status.setIsCustomer(true);
            status.setUnreadCount(notificationRepo.countByCustomerAndHasReadFalseAndToCustomerTrue((Customer) session.getAttribute("customer")));

        } else {
            status.setIsCustomer(true);
        }
        return JsonResponse.createSuccess(status);
    }

    //get product detail by id
    @RequestMapping(value = "/getProduct", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse getProduct(@RequestParam Long id) {
        List<Product> result = productRepo.findById(id);
        if (!result.isEmpty()) {
            return JsonResponse.createSuccess(result.get(0));
        } else {
            return JsonResponse.createError("invalidProductId");
        }
    }


    //count products by query
    @RequestMapping(value = "/countProducts", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse countProducts(@RequestParam(required = false) String tags, @RequestParam(required = false) String keyword) {
        if (tags == null || tags.equals("")) {
            if (keyword == null || keyword.equals("")) {
                return JsonResponse.createSuccess(productRepo.count());
            } else {
                return JsonResponse.createSuccess(productRepo.countByNameContaining(keyword));
            }
        } else {
            ArrayList<Long> tagIds = new ArrayList<>();
            for (String tag : tags.split(",")) {
                tagIds.add(Long.parseLong(tag));
            }
            if (keyword == null || keyword.equals("")) {
                return JsonResponse.createSuccess(productRepo.countByTags_IdIn(tagIds));
            } else {
                return JsonResponse.createSuccess(productRepo.countByNameContainingAndTags_IdIn(keyword, tagIds));
            }
        }
    }

    //get products by query, paged
    @RequestMapping(value = "/getProducts", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse getProducts(@RequestParam(required = false) String tags, @RequestParam(required = false) String keyword, @RequestParam(required = false) Integer page, @RequestParam(required = false) Integer sort) {
        if (sort == null) {
            sort = 0;
        }
        if (page == null) {
            page = 1;
        }
        PageRequest pageRequest = null;
        switch (sort) {
            case 0:
                pageRequest = new PageRequest(page - 1, ITEMS_PER_PAGE, Sort.Direction.ASC, "name");
                break;
            case 1:
                pageRequest = new PageRequest(page - 1, ITEMS_PER_PAGE, Sort.Direction.DESC, "name");
                break;
            case 2:
                pageRequest = new PageRequest(page - 1, ITEMS_PER_PAGE, Sort.Direction.ASC, "currentPrice");
                break;
            case 3:
                pageRequest = new PageRequest(page - 1, ITEMS_PER_PAGE, Sort.Direction.DESC, "currentPrice");
                break;
            case 4:
                pageRequest = new PageRequest(page - 1, ITEMS_PER_PAGE, Sort.Direction.DESC, "availableQuantity");
                break;
            case 5:
                pageRequest = new PageRequest(page - 1, ITEMS_PER_PAGE, Sort.Direction.ASC, "availableQuantity");
                break;
        }

        List<Product> result = null;
        if (tags == null || tags.equals("")) {
            if (keyword == null || keyword.equals("")) {
                Page<Product> pages = productRepo.findAll(pageRequest);
                result = pages.getContent();
            } else {
                result = productRepo.findByNameContainingIgnoreCase(keyword, pageRequest);
            }
        } else {
            ArrayList<Long> tagIds = new ArrayList<>();
            for (String tag : tags.split(",")) {
                tagIds.add(Long.parseLong(tag));
            }
            if (keyword == null || keyword.equals("")) {
                result = productRepo.findByTags_IdIn(tagIds, pageRequest);
            } else {
                result = productRepo.findByNameContainingIgnoreCaseAndTags_IdIn(keyword, tagIds, pageRequest);
            }
        }
        return JsonResponse.createSuccess(result);

    }


    //get customer info by id
    @RequestMapping(value = "/getCustomer", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse getCustomer(@RequestParam Long id) {

        List<Customer> result = customerRepo.findById(id);
        if (!result.isEmpty()) {
            return JsonResponse.createSuccess(result.get(0));
        } else {
            return JsonResponse.createError("invalidCustomerId");
        }
    }

    //get supplier info by id
    @RequestMapping(value = "/getSupplier", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse getSupplier(@RequestParam Long id) {

        List<Supplier> result = supplierRepo.findById(id);
        if (!result.isEmpty()) {
            return JsonResponse.createSuccess(result.get(0));
        } else {
            return JsonResponse.createError("invalidSupplierId");
        }

    }


    //get list of areas
    @RequestMapping(value = "/getAreas", produces = "application/json")
    public JsonResponse getAreas() {
        return JsonResponse.createSuccess(areaRepo.findAll());
    }

    //get list of tags
    @RequestMapping(value = "/getTags", produces = "application/json")
    public JsonResponse getTags() {
        return JsonResponse.createSuccess(cateRepo.findAll());
    }


}


