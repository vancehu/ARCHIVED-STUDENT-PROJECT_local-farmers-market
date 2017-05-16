//control customer related requests
package my.ebizapp.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import my.ebizapp.model.*;
import my.ebizapp.responseModel.JsonResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.List;

@RestController
public class CustomerController {

    @Autowired
    NotificationRepository notificationRepo;
    @Autowired
    CustomerRepository customerRepo;
    @Autowired
    AreaRepository areaRepo;
    @Autowired
    ProductRepository productRepo;
    @Autowired
    TransactRepository transactRepo;
    @Autowired
    SupplierRepository supplierRepo;
    @Autowired
    CartRepository cartRepo;

    public static final int ITEMS_PER_PAGE = 5;


    //login by username and password
    @RequestMapping(value = "/customer/login", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse customerLogin(@RequestParam String username, @RequestParam String password, HttpSession session) {
        List<Customer> customers = customerRepo.findByUsernameAndPassword(username, password);
        if (!customers.isEmpty()) {
            session.removeAttribute("supplier");
            session.setAttribute("customer", customers.get(0));
            if (session.getAttribute("cartTemporary") != null) {
                ArrayList<CartTemporary> arr = (ArrayList<CartTemporary>) session.getAttribute("cartTemporary");
                for (CartTemporary cartTemp : arr) {
                    Product product = productRepo.findById(cartTemp.getProductId()).get(0);
                    List<Cart> carts = cartRepo.findByProductAndCustomer(product, customers.get(0));
                    if (!carts.isEmpty()) {
                        carts.get(0).setPrice(cartTemp.getPrice());
                        carts.get(0).setQuantity(cartTemp.getQuantity());
                    } else {
                        cartRepo.save(new Cart(product, customers.get(0), cartTemp.getPrice(), cartTemp.getShippingPrice(), cartTemp.getQuantity()));
                    }
                }
            }
            session.setAttribute("cartTemporary", null);
            return JsonResponse.createSuccess();

        } else {
            return JsonResponse.createError("invalidLoginInfo");
        }
    }


    //logout and clear session
    @RequestMapping(value = "/customer/logout", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse customerLogout(HttpSession session) {
        session.removeAttribute("supplier");
        session.removeAttribute("customer");
        return JsonResponse.createSuccess();
    }


    //register a new customer
    @RequestMapping(value = "/customer/register", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse customerRegister(@RequestParam String username, @RequestParam String password, @RequestParam String fullName,
                                         @RequestParam(required = false) String orgName, @RequestParam String phone, @RequestParam String email,
                                         @RequestParam(required = false) String description, @RequestParam String street,
                                         @RequestParam(required = false) String imgLink, @RequestParam String zipcode) {

        if (!customerRepo.findByUsername(username).isEmpty()) {
            return JsonResponse.createError("hasUsername");
        }
        if (!customerRepo.findByEmail(email).isEmpty()) {
            return JsonResponse.createError("hasEmail");
        }
        Area area;
        List<Area> areas = areaRepo.findByZipcode(zipcode);
        if (!areas.isEmpty()) {
            area = areas.get(0);
        } else {
            return JsonResponse.createError("invalidArea");
        }
        customerRepo.save(new Customer(username, password, fullName, orgName, phone, email, description, street, imgLink, area));
        return JsonResponse.createSuccess();
    }

    //update current customer's information
    @RequestMapping(value = "/customer/update", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse customerUpdate(@RequestParam(required = false) String fullName, @RequestParam(required = false) String orgName,
                                       @RequestParam(required = false) String phone, @RequestParam(required = false) String street,
                                       @RequestParam(required = false) String description, @RequestParam(required = false) String imgLink,
                                       @RequestParam(required = false) String zipcode, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("customer") == null) {
            return JsonResponse.createError("notLogged");
        }
        Customer customer = customerRepo.findById(((Customer) session.getAttribute("customer")).getId()).get(0);
        if (fullName != null) {
            customer.setFullName(fullName);
        }
        if (orgName != null) {
            customer.setOrgName(orgName);
        }
        if (description != null) {
            customer.setDescription(description);
        }
        if (phone != null) {
            customer.setPhone(phone);
        }
        if (street != null) {
            customer.setStreet(street);
        }
        if (imgLink != null) {
            customer.setImgLink(imgLink);
        }
        if (zipcode != null) {
            customer.setArea(areaRepo.findByZipcode(zipcode).get(0));
        }
        customerRepo.save(customer);
        session.setAttribute("customer", customer);
        return JsonResponse.createSuccess();
    }

    //update current user's password (verify old password first)
    @RequestMapping(value = "/customer/updatePassword", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse customerUpdatePassword(@RequestParam String oldPassword, @RequestParam String password, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("customer") == null) {
            return JsonResponse.createError("notLogged");
        }
        Customer customer = customerRepo.findById(((Customer) session.getAttribute("customer")).getId()).get(0);
        if (customer.getPassword().equals(oldPassword)) {
            customer.setPassword(password);
            customerRepo.save(customer);
            return JsonResponse.createSuccess();
        } else {
            return JsonResponse.createError("wrongPassword");
        }
    }

    //get all the orders of current customer, paged
    @RequestMapping(value = "/customer/getOrders", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse customerGetOrders(@RequestParam Integer page, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("customer") == null) {
            return JsonResponse.createError("notLogged");
        }
        return JsonResponse.createSuccess(transactRepo.findByCustomerOrderByTimeDesc((Customer) session.getAttribute("customer"), new PageRequest(page - 1, 5)));
    }

    //count the orders of current customer
    @RequestMapping(value = "/customer/countOrders", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse customerGetOrder(HttpSession session) {
        //check if user is logged
        if (session.getAttribute("customer") == null) {
            return JsonResponse.createError("notLogged");
        }
        return JsonResponse.createSuccess(transactRepo.countByCustomer((Customer) session.getAttribute("customer")));
    }

    //get order by id
    @RequestMapping(value = "/customer/getOrder", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse customerGetOrder(@RequestParam Long id, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("customer") == null) {
            return JsonResponse.createError("notLogged");
        }

        List<Transact> transacts = transactRepo.findByIdAndCustomer(id, (Customer) session.getAttribute("customer"));
        if (!transacts.isEmpty()) {
            return JsonResponse.createSuccess(transacts.get(0));
        } else {
            return JsonResponse.createError("invalidOrder");
        }
    }


    //cancel an order
    @RequestMapping(value = "/customer/cancelOrder", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse customerCancelOrder(@RequestParam Long id, @RequestParam String cancelReason, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("customer") == null) {
            return JsonResponse.createError("notLogged");
        }

        List<Transact> transacts = transactRepo.findByIdAndCustomer(id, (Customer) session.getAttribute("customer"));
        if (!transacts.isEmpty()) {
            Transact transact = transacts.get(0);
            //only allow when order is not shipped and not cancelled
            if (!transact.isShipped() && !transact.isCancel()) {
                transact.setCancel(true);
                transact.setCancelByCustomer(true);
                transact.setCancelReason(cancelReason);
                transactRepo.save(transact);
                notificationRepo.save(new Notification(NotificationType.CANCELLED, null, (Customer) session.getAttribute("customer"), transact.getProduct().getSupplier(), false));
                return JsonResponse.createSuccess();
            } else {
                return JsonResponse.createError("invalidStatus");
            }
        } else {
            return JsonResponse.createError("invalidOrder");
        }


    }

    //place a new order
    @RequestMapping(value = "/customer/setOrder", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse customerSetOrder(@RequestParam String fullName, @RequestParam(required = false) String orgName, @RequestParam String phone, @RequestParam String email, @RequestParam String street, @RequestParam String zipcode, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("customer") == null) {
            return JsonResponse.createError("notLogged");
        }
        //check if product exists
        for (Cart cart : cartRepo.findByCustomer((Customer) session.getAttribute("customer"))) {
            //check if quantity is enough
            if (cart.getProduct().getAvailableQuantity() >= cart.getQuantity()) {
                //check if price is matched
                if (cart.getProduct().getCurrentPrice().equals(cart.getPrice()) && cart.getProduct().getCurrentShippingPrice().equals(cart.getShippingPrice())) {
                    //do subtraction
                    Product product = cart.getProduct();
                    product.setAvailableQuantity(product.getAvailableQuantity() - cart.getQuantity());
                    productRepo.save(product);
                    transactRepo.save(new Transact(cart.getProduct(), (Customer) session.getAttribute("customer"), cart.getPrice(), cart.getShippingPrice(), cart.getQuantity(), fullName, orgName, phone, email, street, areaRepo.findByZipcode(zipcode).get(0)));
                    cartRepo.delete(cart);
                    //send notification
                    notificationRepo.save(new Notification(NotificationType.PLACED, null, (Customer) session.getAttribute("customer"), product.getSupplier(), false));
                    return JsonResponse.createSuccess();
                } else {
                    return JsonResponse.createError("priceNotMatched");
                }
            } else {
                return JsonResponse.createError("quantityNotEnough");
            }
        }
        return JsonResponse.createSuccess();
    }

    //return the number of notifications
    @RequestMapping(value = "/customer/countNotifications", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse customerCountNotifications(HttpSession session) {
        //check if user is logged
        if (session.getAttribute("customer") == null) {
            return JsonResponse.createError("notLogged");
        }

        return JsonResponse.createSuccess(notificationRepo.countByCustomerAndToCustomerTrue((Customer) session.getAttribute("customer")));
    }

    //return the notifications, paged
    @RequestMapping(value = "/customer/getNotifications", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse customerGetNotifications(@RequestParam Integer page, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("customer") == null) {
            return JsonResponse.createError("notLogged");
        }
        List<Notification> notifications = notificationRepo.findByCustomerAndToCustomerTrueOrderByTimeDesc((Customer) session.getAttribute("customer"), new PageRequest(page - 1, ITEMS_PER_PAGE));
        return JsonResponse.createSuccess(notifications);
    }

    //send a message type notification
    @RequestMapping(value = "/customer/sendMessage", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse customerSendMessage(@RequestParam String message, @RequestParam Long supplierId, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("customer") == null) {
            return JsonResponse.createError("notLogged");
        }

        List<Supplier> suppliers = supplierRepo.findById(supplierId);
        if (suppliers.isEmpty()) {
            return JsonResponse.createError("invalidSupplier");
        } else {
            notificationRepo.save(new Notification(NotificationType.MESSAGE, message, (Customer) session.getAttribute("customer"), suppliers.get(0), false));
            return JsonResponse.createSuccess();
        }


    }


    //mark a notification
    @RequestMapping(value = "/customer/markNotification", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse customerMarkNotification(@RequestParam Long id, @RequestParam boolean hasRead, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("customer") == null) {
            return JsonResponse.createError("notLogged");
        }
        List<Notification> notifications = notificationRepo.findByIdAndCustomer(id, (Customer) session.getAttribute("customer"));
        if (!notifications.isEmpty()) {
            Notification notification = notifications.get(0);
            notification.setHasRead(hasRead);
            notificationRepo.save(notification);
            return JsonResponse.createSuccess();
        } else {
            return JsonResponse.createError("invalidNotification");
        }
    }

    //count the number of carts
    @RequestMapping(value = "/customer/countCarts", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse countCarts(HttpSession session) {
        //check if user is logged
        if (session.getAttribute("customer") == null) {
            //if not logged then use temporary cart
            if (session.getAttribute("cartTemporary") == null) {
                return JsonResponse.createSuccess(0);
            } else {
                return JsonResponse.createSuccess(((ArrayList<CartTemporary>) session.getAttribute("cartTemporary")).size());
            }
        } else {
            return JsonResponse.createSuccess(cartRepo.countByCustomer((Customer) session.getAttribute("customer")));
        }
    }

    //get carts related to current session
    @RequestMapping(value = "/customer/getCarts", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse getCarts(HttpSession session) {
        //check if user is logged
        if (session.getAttribute("customer") == null) {
            //if not logged then use temporary cart
            return JsonResponse.createSuccess(session.getAttribute("cartTemporary"));
        } else {
            return JsonResponse.createSuccess(cartRepo.findByCustomer((Customer) session.getAttribute("customer")));
        }
    }

    //the cart entry by id
    @RequestMapping(value = "/customer/getCart", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse getCart(@RequestParam Long id, HttpSession session) {
        //check if user is logged
        if (session.getAttribute("customer") == null) {
            //if not logged then use temporary cart
            if (session.getAttribute("cartTemporary") == null) {
                session.setAttribute("cartTemporary", new ArrayList<CartTemporary>());
            }
            ArrayList<CartTemporary> carts = (ArrayList<CartTemporary>) session.getAttribute("cartTemporary");
            for (CartTemporary cart : carts) {
                if (cart.getProductId().equals(id)) {
                    return JsonResponse.createSuccess(cart);
                }
            }
            return JsonResponse.createError("notFound");
        } else {
            List<Cart> carts = cartRepo.findByCustomer((Customer) session.getAttribute("customer"));
            for (Cart cart : carts) {
                if (cart.getProduct().getId() == id) {
                    return JsonResponse.createSuccess(cart);
                }
            }
            return JsonResponse.createError("notFound");
        }
    }

    //update cart entry
    @RequestMapping(value = "/customer/updateCart", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse updateCart(@RequestParam Long id, @RequestParam Long quantity, HttpSession session) throws JsonProcessingException {
        if (quantity == 0) {
            return removeCart(id, session);
        }
        //check if user is logged
        if (session.getAttribute("customer") == null) {
            //if not logged then use temporary cart
            if (session.getAttribute("cartTemporary") == null) {
                session.setAttribute("cartTemporary", new ArrayList<CartTemporary>());
            }
            ArrayList<CartTemporary> arr = (ArrayList<CartTemporary>) session.getAttribute("cartTemporary");
            Product product = productRepo.findById(id).get(0);
            for (CartTemporary cart : arr) {
                if (cart.getProductId().equals(id)) {
                    cart.setPrice(product.getCurrentPrice());
                    cart.setQuantity(quantity);
                    return JsonResponse.createSuccess();
                }
            }
            arr.add(new CartTemporary(id, product.getCurrentPrice(), product.getCurrentShippingPrice(), quantity, new ObjectMapper().valueToTree(product)));
            return JsonResponse.createSuccess();
        } else {
            Product product = productRepo.findById(id).get(0);
            List<Cart> carts = cartRepo.findByProductAndCustomer(product, (Customer) session.getAttribute("customer"));
            if (!carts.isEmpty()) {
                Cart cart = carts.get(0);
                cart.setPrice(product.getCurrentPrice());
                System.out.println("current" + carts.get(0).getQuantity());
                cart.setQuantity(quantity);
                cartRepo.save(cart);

            } else {
                cartRepo.save(new Cart(product, (Customer) session.getAttribute("customer"), product.getCurrentPrice(), product.getCurrentShippingPrice(), quantity));
            }
            return JsonResponse.createSuccess();

        }
    }

    //remove entry from the cart
    @RequestMapping(value = "/customer/removeCart", produces = "application/json", method = RequestMethod.POST)
    public JsonResponse removeCart(@RequestParam Long id, HttpSession session) {
        if (session.getAttribute("customer") == null) {
            if (session.getAttribute("cartTemporary") != null) {
                ArrayList<CartTemporary> arr = (ArrayList<CartTemporary>) session.getAttribute("cartTemporary");
                for (CartTemporary cart : arr) {
                    if (cart.getProductId().equals(id)) {
                        arr.remove(cart);
                        return JsonResponse.createSuccess();
                    }
                }
                return JsonResponse.createError("invalidCart");
            } else {
                return JsonResponse.createError("invalidCart");
            }
        } else {
            List<Cart> carts = cartRepo.findByProductAndCustomer(productRepo.findById(id).get(0), (Customer) session.getAttribute("customer"));
            if (!carts.isEmpty()) {
                cartRepo.delete(carts.get(0));
                return JsonResponse.createSuccess();
            } else {
                return JsonResponse.createError("invalidCart");
            }
        }
    }

}

