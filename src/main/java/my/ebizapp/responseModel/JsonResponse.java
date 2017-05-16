package my.ebizapp.responseModel;

public class JsonResponse {
    private String status;
    private Object payload;

    public JsonResponse(String status, Object payload) {
        this.status = status;
        this.payload = payload;
    }
    public static JsonResponse createSuccess(Object payload){
        return new JsonResponse("success", payload);
    }
    public static JsonResponse createSuccess(){
        return createSuccess(null);
    }
    public static JsonResponse createError(String status, Object payload){
        return new JsonResponse(status, payload);
    }
    public static JsonResponse createError(String status){
        return createError(status, null);
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Object getPayload() {
        return payload;
    }

    public void setPayload(Object payload) {
        this.payload = payload;
    }
}
