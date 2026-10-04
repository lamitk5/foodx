package com.nhom6.foodx.common.client;

/**
 * Đường dẫn API nội bộ giữa các microservice FoodX.
 *
 * <p>Các endpoint dưới {@code /internal/**} <b>không</b> được API Gateway định tuyến
 * (gateway chỉ proxy {@code /api/**}), nên chỉ tồn tại trong mạng nội bộ của cụm service.
 * Chúng yêu cầu header {@code X-Foodx-Internal-Token}. Hằng số ở đây được cả bên cung
 * cấp (controller) và bên tiêu thụ (client) dùng chung nên không thể lệch nhau.</p>
 */
public final class InternalApi {

    private InternalApi() {
    }

    public static final String PREFIX = "/internal";

    // ------------------------------------------------------------------ user-service
    public static final String USERS = PREFIX + "/users";
    public static final String USER_BY_ID = USERS + "/{id}";
    /**
     * Yêu cầu một service xoá toàn bộ dữ liệu của một người dùng trong phạm vi service đó.
     * Dùng khi admin xoá tài khoản: mỗi service tự dọn bảng của mình thay vì user-service
     * chạy {@code DELETE} xuyên qua 5 service khác.
     */
    public static final String USER_DATA_PURGE = USERS + "/{userId}/data";
    public static final String PROFILES = PREFIX + "/profiles";
    public static final String PROFILE_BY_USER_ID = PROFILES + "/{userId}";

    // ------------------------------------------------------------- inventory-service
    public static final String FRIDGE_ITEMS = PREFIX + "/fridge/{userId}/items";
    public static final String FRIDGE_FOOD_NAMES = PREFIX + "/fridge/{userId}/food-names";
    public static final String FRIDGE_CONSUME = PREFIX + "/fridge/{userId}/consume";
    public static final String INGREDIENTS = PREFIX + "/ingredients";
    public static final String INGREDIENT_BY_ID = INGREDIENTS + "/{id}";
    public static final String INGREDIENTS_ENSURE = INGREDIENTS + "/ensure";
    public static final String INGREDIENTS_RESOLVE = INGREDIENTS + "/resolve";

    // -------------------------------------------------------------- recipe-service
    public static final String RECIPES = PREFIX + "/recipes";
    public static final String RECIPE_BY_ID = RECIPES + "/{id}";
    public static final String RECIPES_ENSURE = RECIPES + "/ensure";

    // ------------------------------------------------------------------ ai-service
    public static final String AI_GENERATE = PREFIX + "/ai/generate";
    public static final String AI_PARSE_RECIPE = PREFIX + "/ai/parse-recipe";
    public static final String AI_SCAN_FOOD_IMAGE = PREFIX + "/ai/scan-food-image";
}
