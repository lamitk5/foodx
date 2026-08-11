recipe-app/
├── pom.xml                         (quản lý dependency)
├── src/
│   └── main/
│       ├── java/
│       │   └── com/yourdomain/recipeapp/
│       │       ├── RecipeAppApplication.java      (class khởi chạy)
│       │       │
│       │       ├── common/                        (dùng chung toàn project)
│       │       │   ├── config/                   (cấu hình Spring)
│       │       │   │   ├── OpenApiConfig.java
│       │       │   │   └── WebConfig.java
│       │       │   ├── exception/                (xử lý ngoại lệ)
│       │       │   │   └── GlobalExceptionHandler.java
│       │       │   ├── response/                 (chuẩn hóa JSON trả về)
│       │       │   │   └── ApiResponse.java
│       │       │   └── utils/                    (tiện ích)
│       │       │       ├── DateUtils.java
│       │       │       └── StringUtils.java
│       │       │
│       │       ├── auth/                         (Hạnh: đăng nhập, đăng ký, JWT)
│       │       │   ├── controller/
│       │       │   │   └── AuthController.java
│       │       │   ├── dto/
│       │       │   │   ├── LoginRequest.java
│       │       │   │   ├── RegisterRequest.java
│       │       │   │   └── AuthResponse.java
│       │       │   ├── entity/
│       │       │   │   └── User.java
│       │       │   ├── repository/
│       │       │   │   └── UserRepository.java
│       │       │   ├── security/
│       │       │   │   ├── JwtAuthenticationFilter.java
│       │       │   │   ├── JwtTokenProvider.java
│       │       │   │   └── UserDetailsServiceImpl.java
│       │       │   └── service/
│       │       │       ├── AuthService.java
│       │       │       └── CustomUserDetailsService.java
│       │       │
│       │       ├── ingredient/                   (danh mục nguyên liệu chung)
│       │       │   ├── controller/
│       │       │   │   └── IngredientController.java
│       │       │   ├── dto/
│       │       │   │   └── IngredientDto.java
│       │       │   ├── entity/
│       │       │   │   └── Ingredient.java
│       │       │   ├── repository/
│       │       │   │   └── IngredientRepository.java
│       │       │   └── service/
│       │       │       └── IngredientService.java
│       │       │
│       │       ├── fridge/                       (Thảo: tủ lạnh ảo, hạn dùng, shopping list)
│       │       │   ├── controller/
│       │       │   │   ├── FridgeController.java
│       │       │   │   └── ShoppingListController.java
│       │       │   ├── dto/
│       │       │   │   ├── FridgeItemRequest.java
│       │       │   │   ├── FridgeItemResponse.java
│       │       │   │   ├── ShoppingListRequest.java
│       │       │   │   └── ShoppingListResponse.java
│       │       │   ├── entity/
│       │       │   │   ├── FridgeItem.java
│       │       │   │   ├── ShoppingList.java
│       │       │   │   └── ShoppingListItem.java
│       │       │   ├── repository/
│       │       │   │   ├── FridgeItemRepository.java
│       │       │   │   ├── ShoppingListRepository.java
│       │       │   │   └── ShoppingListItemRepository.java
│       │       │   └── service/
│       │       │       ├── FridgeService.java
│       │       │       └── ShoppingListService.java
│       │       │
│       │       ├── recipe/                       (Đăng: công thức, chia sẻ, import từ web)
│       │       │   ├── controller/
│       │       │   │   └── RecipeController.java
│       │       │   ├── dto/
│       │       │   │   ├── RecipeRequest.java
│       │       │   │   ├── RecipeResponse.java
│       │       │   │   └── RecipeImportRequest.java
│       │       │   ├── entity/
│       │       │   │   ├── Recipe.java
│       │       │   │   ├── RecipeIngredient.java
│       │       │   │   └── SavedRecipe.java
│       │       │   ├── repository/
│       │       │   │   ├── RecipeRepository.java
│       │       │   │   ├── RecipeIngredientRepository.java
│       │       │   │   └── SavedRecipeRepository.java
│       │       │   ├── service/
│       │       │   │   ├── RecipeService.java
│       │       │   │   └── ImportRecipeService.java
│       │       │   └── parser/
│       │       │       └── RecipeTextParser.java  (gọi TV4 AI để parse)
│       │       │
│       │       ├── mealplan/                     (TV2: kế hoạch ăn uống, chế độ ăn, dị ứng)
│       │       │   ├── controller/
│       │       │   │   └── MealPlanController.java
│       │       │   ├── dto/
│       │       │   │   ├── MealPlanRequest.java
│       │       │   │   ├── MealPlanResponse.java
│       │       │   │   └── MealPlanItemDto.java
│       │       │   ├── entity/
│       │       │   │   ├── MealPlan.java
│       │       │   │   ├── MealPlanItem.java
│       │       │   │   └── UserAllergy.java
│       │       │   ├── repository/
│       │       │   │   ├── MealPlanRepository.java
│       │       │   │   ├── MealPlanItemRepository.java
│       │       │   │   └── UserAllergyRepository.java
│       │       │   └── service/
│       │       │       ├── MealPlanService.java
│       │       │       └── MealPlanSuggestionService.java (gọi TV4 AI)
│       │       │
│       │       └── ai/                           (Lâm: Gemini API, gợi ý, phân tích)
│       │           ├── controller/
│       │           │   └── AIController.java
│       │           ├── dto/
│       │           │   ├── SuggestRequest.java
│       │           │   ├── SuggestResponse.java
│       │           │   └── GeminiRequest.java
│       │           ├── config/
│       │           │   └── GeminiConfig.java
│       │           ├── service/
│       │           │   ├── GeminiService.java
│       │           │   ├── SuggestionService.java
│       │           │   └── RecipeParserService.java
│       │           └── util/
│       │               └── PromptTemplate.java
│       │
│       └── resources/
│           ├── application.properties           (cấu hình Spring)
│           ├── application-dev.properties        (cho dev)
│           └── application-prod.properties       (cho production)
│
└── README.md