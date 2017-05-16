package my.ebizapp.exception;

import my.ebizapp.responseModel.JsonResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by Vance on 4/11/2015.
 */
@Controller
public class ExceptionHandlingController {

    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseBody
    public JsonResponse conflict(DataIntegrityViolationException e) {
        if (e.getCause().getCause().getMessage().contains("duplicate")) {
          return JsonResponse.createError("duplicate");
        }
        else {
            System.out.println(e.getCause().getCause().getMessage());
            return JsonResponse.createError("unexpected");
        }

    }
}

//@ResponseStatus(value = HttpStatus.BAD_REQUEST)
//final class BadRequestException extends RuntimeException {
//    public BadRequestException(String msg) {
//        super(msg);
//    }
//}