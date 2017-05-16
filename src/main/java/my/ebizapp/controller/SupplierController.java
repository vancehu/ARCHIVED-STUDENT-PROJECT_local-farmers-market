//control supplier related requests
package my.ebizapp.controller;

import my.ebizapp.model.*;
import my.ebizapp.responseModel.JsonResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
public class SupplierController {

    @Autowired
    AreaRepository areaRepo;
    @Autowired
    SupplierRepository supplierRepo;
    @Autowired
    TransactRepository transactRepo;
    @Autowired
    CustomerRepository customerRepo;
    @Autowired
    TagRepository cateRepo;
    @Autowired
    ProductRepository productRepo;
    @Autowired
    NotificationRepository notificationRepo;

    public static final int ITEMS_PER_PAGE = 5;

    //login by username and password
    @RequestMapping(value = "/supplier/login", produces = "application/json", method= RequestMethod.POST)
    public JsonResponse supplierLogin(@RequestParam String username, @RequestParam String password, HttpSession session) {
        List<Supplier> result = supplierRepo.findByUsernameAndPassword(username, password);
        if (!result.isEmpty()) {
            session.removeAttribute("customer");
            session.setAttribute("supplier", result.get(0));
            return JsonResponse.createSuccess();
        } else {
            return JsonResponse.createError("invalidLoginInfo");
        }
    }

    //logout and clear session
    @RequestMapping(value = "/supplier/logout", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse supplierLogout(HttpSession session) {
        session.removeAttribute("supplier");
        session.removeAttribute("customer");
        return JsonResponse.createSuccess();
    }

    //register a new supplier
    @RequestMapping(value = "/supplier/register", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse supplierRegister(@RequestParam String username, @RequestParam String password, @RequestParam String fullName,
                                         @RequestParam(required = false) String orgName, @RequestParam String phone, @RequestParam String email,
                                         @RequestParam(required = false) String description, @RequestParam String street,
                                         @RequestParam(required = false) String imgLink, @RequestParam String zipcode) {

        if (!supplierRepo.findByUsername(username).isEmpty()) {
            return JsonResponse.createError("hasUsername");
        }
        if (!supplierRepo.findByEmail(email).isEmpty()) {
            return JsonResponse.createError("hasEmail");
        }
        Area area;
        List<Area> areas = areaRepo.findByZipcode(zipcode);
        if (!areas.isEmpty()) {
            area = areas.get(0);
        } else {
            return JsonResponse.createError("invalidArea");
        }
        supplierRepo.save(new Supplier(username, password, fullName, orgName, phone, email, description, street, imgLink, area));
        return JsonResponse.createSuccess();
    }

    //update current supplier's information
    @RequestMapping(value = "/supplier/update", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse supplierUpdate(@RequestParam(required = false) String fullName, @RequestParam(required = false) String orgName,
                                       @RequestParam(required = false) String phone, @RequestParam(required = false) String street,
                                       @RequestParam(required = false) String description, @RequestParam(required = false) String imgLink,
                                       @RequestParam(required = false) String zipcode, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("supplier") == null) {
            return JsonResponse.createError("notLogged");
        }
        Supplier supplier = supplierRepo.findById(((Supplier) session.getAttribute("supplier")).getId()).get(0);
        if (fullName != null) {
            supplier.setFullName(fullName);
        }
        if (orgName != null) {
            supplier.setOrgName(orgName);
        }
        if (description != null) {
            supplier.setDescription(description);
        }
        if (phone != null) {
            supplier.setPhone(phone);
        }
        if (street != null) {
            supplier.setStreet(street);
        }
        if (imgLink != null) {
            supplier.setImgLink(imgLink);
        }
        if (zipcode != null) {
            supplier.setArea(areaRepo.findByZipcode(zipcode).get(0));
        }
        supplierRepo.save(supplier);
        session.setAttribute("supplier", supplier);
        return JsonResponse.createSuccess();
    }

    //update current user's password (verify old password first)
    @RequestMapping(value = "/supplier/updatePassword", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse supplierUpdatePassword(@RequestParam String oldPassword, @RequestParam String password, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("supplier") == null) {
            return JsonResponse.createError("notLogged");
        }
        Supplier supplier = supplierRepo.findById(((Supplier) session.getAttribute("supplier")).getId()).get(0);
        if (supplier.getPassword().equals(oldPassword)) {
            supplier.setPassword(password);
            return JsonResponse.createSuccess();
        } else {
            return JsonResponse.createError("wrongPassword");
        }
    }

    //get all the orders of current supplier, paged
    @RequestMapping(value = "/supplier/getOrders", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse supplierGetOrders(@RequestParam Integer page, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("supplier") == null) {
            return JsonResponse.createError("notLogged");
        }
        return JsonResponse.createSuccess(transactRepo.findByProduct_SupplierOrderByTimeDesc((Supplier) session.getAttribute("supplier"), new PageRequest(page - 1, 5)));
    }

    //count the orders of current supplier
    @RequestMapping(value = "/supplier/countOrders", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse supplierGetOrder(HttpSession session) {
        //check if user is logged
        if (session.getAttribute("supplier") == null) {
            return JsonResponse.createError("notLogged");
        }
        return JsonResponse.createSuccess(transactRepo.countByProduct_Supplier((Supplier) session.getAttribute("supplier")));
    }

    //get order by id
    @RequestMapping(value = "/supplier/getOrder", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse supplierGetOrder(@RequestParam Long id, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("supplier") == null) {
            return JsonResponse.createError("notLogged");
        }

        List<Transact> transacts = transactRepo.findByIdAndProduct_Supplier(id, (Supplier) session.getAttribute("supplier"));
        if (!transacts.isEmpty()) {
            return JsonResponse.createSuccess(transacts.get(0));
        } else {
            return JsonResponse.createError("invalidOrder");
        }
    }

    //cancel an order
    @RequestMapping(value = "/supplier/cancelOrder", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse supplierCancelOrder(@RequestParam Long id, @RequestParam String cancelReason, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("supplier") == null) {
            return JsonResponse.createError("notLogged");
        }

        List<Transact> transacts = transactRepo.findByIdAndProduct_Supplier(id, (Supplier) session.getAttribute("supplier"));
        if (!transacts.isEmpty()) {
            Transact transact = transacts.get(0);
            //only allow when order is not shipped and not cancelled
            if (!transact.isShipped() && !transact.isCancel()) {
                transact.setCancel(true);
                transact.setCancelByCustomer(false);
                transact.setCancelReason(cancelReason);
                transactRepo.save(transact);
                notificationRepo.save(new Notification(NotificationType.CANCELLED, null, transact.getCustomer(), (Supplier) session.getAttribute("supplier"), true));
                return JsonResponse.createSuccess();
            } else {
                return JsonResponse.createError("invalidStatus");
            }
        } else {
            return JsonResponse.createError("invalidOrder");
        }
    }

    //ship an order
    @RequestMapping(value = "/supplier/shipOrder", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse supplierShipOrder(@RequestParam Long id, @RequestParam String tracking, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("supplier") == null) {
            return JsonResponse.createError("notLogged");
        }

        List<Transact> transacts = transactRepo.findByIdAndProduct_Supplier(id, (Supplier) session.getAttribute("supplier"));
        if (!transacts.isEmpty()) {
            Transact transact = transacts.get(0);
            //only allow when order is not shipped and not cancelled
            if (!transact.isShipped() && !transact.isCancel()) {
                transact.setShipped(true);
                transact.setTracking(tracking);
                transactRepo.save(transact);
                notificationRepo.save(new Notification(NotificationType.SHIPPED, null, transact.getCustomer(), (Supplier) session.getAttribute("supplier"), true));
                return JsonResponse.createSuccess();
            } else {
                return JsonResponse.createError("invalidStatus");
            }
        } else {
            return JsonResponse.createError("invalidOrder");
        }
    }

    //return the number of notifications
    @RequestMapping(value = "/supplier/countNotifications", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse supplierCountNotifications(HttpSession session) {
        //check if user is logged
        if (session.getAttribute("supplier") == null) {
            return JsonResponse.createError("notLogged");
        }

        return JsonResponse.createSuccess(notificationRepo.countBySupplierAndToCustomerFalse((Supplier) session.getAttribute("supplier")));
    }

    //return the notifications, paged
    @RequestMapping(value = "/supplier/getNotifications", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse supplierGetNotifications(@RequestParam(required = false) Integer page, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("supplier") == null) {
            return JsonResponse.createError("notLogged");
        }
        List<Notification> notifications = notificationRepo.findBySupplierAndToCustomerFalseOrderByTimeDesc((Supplier) session.getAttribute("supplier"), new PageRequest(page - 1, ITEMS_PER_PAGE));
        return JsonResponse.createSuccess(notifications);
    }

    //send a message type notification
    @RequestMapping(value = "/supplier/sendMessage", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse supplierSendMessage(@RequestParam String message, @RequestParam Long customerId, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("supplier") == null) {
            return JsonResponse.createError("notLogged");
        }

        List<Customer> customers = customerRepo.findById(customerId);
        if (customers.isEmpty()) {
            return JsonResponse.createError("invalidSupplier");
        } else {
            notificationRepo.save(new Notification(NotificationType.MESSAGE, message, customers.get(0), (Supplier) session.getAttribute("supplier"), true));
            return JsonResponse.createSuccess();
        }


    }

    //mark a notification
    @RequestMapping(value = "/supplier/markNotification", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse supplierMarkNotification(@RequestParam Long id, @RequestParam boolean hasRead, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("supplier") == null) {
            return JsonResponse.createError("notLogged");
        }
        List<Notification> notifications = notificationRepo.findByIdAndSupplier(id, (Supplier) session.getAttribute("supplier"));
        if (!notifications.isEmpty()) {
            Notification notification = notifications.get(0);
            notification.setHasRead(hasRead);
            notificationRepo.save(notification);
            return JsonResponse.createSuccess();
        } else {
            return JsonResponse.createError("invalidNotification");
        }
    }

    //add a product
    @RequestMapping(value = "/supplier/addProduct", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse addProduct(@RequestParam String name, @RequestParam String unitName, @RequestParam Long availableQuantity, @RequestParam BigDecimal currentPrice, @RequestParam BigDecimal currentShippingPrice, @RequestParam(required =
            false) String description, @RequestParam(required = false) String imgLink, @RequestParam(required = false) String tags, HttpSession session) {
        if (session.getAttribute("supplier") == null) {
            return JsonResponse.createError("notLogged");
        }
        ArrayList<Tag> tagsArr = new ArrayList<>();
        if (tags != null && !tags.equals("")) {
            for (String tag : tags.split(",")) {
                tagsArr.add(cateRepo.findById(Long.parseLong(tag)).get(0));
            }
        }
        productRepo.save(new Product((Supplier) session.getAttribute("supplier"), name, unitName, description, availableQuantity, currentPrice, currentShippingPrice, imgLink, tagsArr));
        return JsonResponse.createSuccess();
    }


    //update a product
    @RequestMapping(value = "/supplier/updateProduct", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse updateProduct(@RequestParam Long id, @RequestParam(required = false) String name, @RequestParam(required = false) String unitName, @RequestParam(required = false) Long availableQuantity, @RequestParam(required = false) BigDecimal currentPrice, @RequestParam(required = false) BigDecimal currentShippingPrice, @RequestParam(required =
            false) String description, @RequestParam(required = false) String imgLink, @RequestParam(required = false) String tags, HttpSession session) {
        if (session.getAttribute("supplier") == null) {
            return JsonResponse.createError("notLogged");
        }
        List<Product> products = productRepo.findBySupplierAndId((Supplier) session.getAttribute("supplier"), id);
        if (products.isEmpty()) {
            return JsonResponse.createError("notValid");
        }

        Product product = products.get(0);
        if (name != null) {
            product.setName(name);
        }
        if (unitName != null) {
            product.setUnitName(unitName);
        }
        if (currentPrice != null) {
            product.setCurrentPrice(currentPrice);
        }
        if (currentShippingPrice != null) {
            product.setCurrentShippingPrice(currentShippingPrice);
        }
        if (availableQuantity != null) {
            product.setAvailableQuantity(availableQuantity);
        }
        if (description != null) {
            product.setDescription(description);
        }
        if (imgLink != null) {
            product.setImgLink(imgLink);
        }

        if (tags != null && !tags.equals("")) {
            ArrayList<Tag> tagsArr = new ArrayList<>();
            for (String tag : tags.split(",")) {
                tagsArr.add(cateRepo.findById(Long.parseLong(tag)).get(0));
            }
            product.setTags(tagsArr);
        }
        productRepo.save(product);
        return JsonResponse.createSuccess();
    }

    //count my products
    @RequestMapping(value = "/supplier/countMyProducts", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse countMyProducts(HttpSession session) {
        //check if user is logged
        if (session.getAttribute("supplier") == null) {
            return JsonResponse.createError("notLogged");
        }

        return JsonResponse.createSuccess(productRepo.countBySupplier((Supplier) session.getAttribute("supplier")));
    }

    //get my products, paged
    @RequestMapping(value = "/supplier/getMyProducts", produces = "application/json", method=RequestMethod.POST)
    public JsonResponse supplierGetMyProducts(@RequestParam Integer page, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("supplier") == null) {
            return JsonResponse.createError("notLogged");
        }
        List<Product> products = productRepo.findBySupplier((Supplier) session.getAttribute("supplier"), new PageRequest(page - 1, ITEMS_PER_PAGE));
        return JsonResponse.createSuccess(products);
    }
}