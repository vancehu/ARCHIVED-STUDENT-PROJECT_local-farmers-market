package my.ebizapp.controller;

import my.ebizapp.responseModel.JsonResponse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.UUID;

//upload image and return url string
@Controller
public class UploadController {

    @RequestMapping(value = "/uploadImg", method = RequestMethod.POST)
    @ResponseBody
    JsonResponse uploadImg(@RequestParam MultipartFile file) throws URISyntaxException {
        try {
            BufferedImage in = ImageIO.read(file.getInputStream());

            File output = new File(UploadController.class.getClassLoader().getResource("resources").toURI().getPath() +
                    "/image/img-" + UUID.randomUUID() + ".jpg");
            output.createNewFile();
            ImageIO.write(in, "jpg", output);
            return JsonResponse.createSuccess(output.getName());
        } catch (IOException e) {
            return JsonResponse.createError("invalidUpload");
        }
    }
}
