-- =============================================================
-- FoodX - Database Schema
-- Hệ thống Quản Lý Ẩm Thực
-- Tương thích: H2 (default dev) & các DB quan hệ phổ biến
-- =============================================================

-- Xóa bảng theo thứ tự phụ thuộc (FK) nếu chạy lại
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_sessions;
DROP TABLE IF EXISTS user_allergies;
DROP TABLE IF EXISTS meal_plan_items;
DROP TABLE IF EXISTS meal_plans;
DROP TABLE IF EXISTS saved_recipes;
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS shopping_list_items;
DROP TABLE IF EXISTS shopping_lists;
DROP TABLE IF EXISTS fridge_items;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS users;

-- =============================================================
-- 1. users : Người dùng (Auth)
-- =============================================================
CREATE TABLE users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100),
    role        VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 2. ingredients : Danh mục nguyên liệu chung (Ingredient)
-- =============================================================
CREATE TABLE ingredients (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    name               VARCHAR(100) NOT NULL,
    default_unit       VARCHAR(20),
    category           VARCHAR(50),
    calories_per_unit  DOUBLE,
    description        VARCHAR(500),
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 3. fridge_items : Nguyên liệu trong tủ lạnh ảo (Fridge)
-- =============================================================
CREATE TABLE fridge_items (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT,
    name        VARCHAR(100) NOT NULL,
    category    VARCHAR(50),
    quantity    DOUBLE       NOT NULL,
    unit        VARCHAR(20),
    image_url   VARCHAR(255),
    note        VARCHAR(500),
    expiry_date DATE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fridge_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_fridge_user_category ON fridge_items(user_id, category);
CREATE INDEX idx_fridge_expiry       ON fridge_items(expiry_date);

-- =============================================================
-- 4. shopping_lists : Danh sách mua sắm (Fridge)
-- =============================================================
CREATE TABLE shopping_lists (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT,
    name        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shoppinglist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================
-- 5. shopping_list_items : Mục trong danh sách mua sắm (Fridge)
-- =============================================================
CREATE TABLE shopping_list_items (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    shopping_list_id  BIGINT NOT NULL,
    ingredient_name   VARCHAR(100) NOT NULL,
    quantity          DOUBLE,
    unit              VARCHAR(20),
    bought            BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_slitem_list FOREIGN KEY (shopping_list_id)
        REFERENCES shopping_lists(id) ON DELETE CASCADE
);
CREATE INDEX idx_slitem_list ON shopping_list_items(shopping_list_id);

-- =============================================================
-- 6. recipes : Công thức nấu ăn (Recipe)
-- =============================================================
CREATE TABLE recipes (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT,
    title         VARCHAR(200) NOT NULL,
    description   TEXT,
    instructions  TEXT,
    prep_time     INT,
    cook_time     INT,
    servings      INT,
    cuisine       VARCHAR(50),
    category      VARCHAR(50),
    image_url     VARCHAR(255),
    source_url    VARCHAR(255),
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recipe_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_recipe_category ON recipes(category, cuisine);

-- =============================================================
-- 7. recipe_ingredients : Nguyên liệu của công thức (Recipe)
-- =============================================================
CREATE TABLE recipe_ingredients (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id         BIGINT NOT NULL,
    ingredient_name   VARCHAR(100) NOT NULL,
    quantity          DOUBLE,
    unit              VARCHAR(20),
    note              VARCHAR(200),
    CONSTRAINT fk_recipe_ingredient FOREIGN KEY (recipe_id)
        REFERENCES recipes(id) ON DELETE CASCADE
);
CREATE INDEX idx_recipe_ing ON recipe_ingredients(recipe_id);

-- =============================================================
-- 8. saved_recipes : Công thức đã lưu / yêu thích (Recipe)
-- =============================================================
CREATE TABLE saved_recipes (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    recipe_id   BIGINT NOT NULL,
    saved_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_user   FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    CONSTRAINT fk_saved_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT uq_saved       UNIQUE (user_id, recipe_id)
);
CREATE INDEX idx_saved_user ON saved_recipes(user_id);

-- =============================================================
-- 9. meal_plans : Kế hoạch ăn uống (Mealplan)
-- =============================================================
CREATE TABLE meal_plans (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    note        VARCHAR(500),
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mealplan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================
-- 10. meal_plan_items : Mục trong kế hoạch (Mealplan)
-- =============================================================
CREATE TABLE meal_plan_items (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    meal_plan_id   BIGINT NOT NULL,
    recipe_id      BIGINT,
    day_number     INT NOT NULL,
    meal_type      VARCHAR(20) NOT NULL,   -- SANG / TRUA / TOI
    portions       INT,
    CONSTRAINT fk_mpitem_plan   FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id) ON DELETE CASCADE,
    CONSTRAINT fk_mpitem_recipe FOREIGN KEY (recipe_id)    REFERENCES recipes(id)    ON DELETE SET NULL
);
CREATE INDEX idx_mpitem_plan ON meal_plan_items(meal_plan_id);

-- =============================================================
-- 11. user_allergies : Dị ứng của người dùng (Mealplan)
-- =============================================================
CREATE TABLE user_allergies (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT NOT NULL,
    ingredient_id     BIGINT NOT NULL,
    CONSTRAINT fk_allergy_user       FOREIGN KEY (user_id)       REFERENCES users(id)      ON DELETE CASCADE,
    CONSTRAINT fk_allergy_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    CONSTRAINT uq_allergy UNIQUE (user_id, ingredient_id)
);
CREATE INDEX idx_allergy_user ON user_allergies(user_id);

-- =============================================================
-- 12. chat_sessions : Phiên trò chuyện AI theo tài khoản (Chat)
-- =============================================================
CREATE TABLE chat_sessions (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    title       VARCHAR(150) NOT NULL DEFAULT 'Cuộc trò chuyện mới',
    mode        VARCHAR(20)  NOT NULL DEFAULT 'chat',   -- chat / step
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chatsession_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_chatsession_user ON chat_sessions(user_id, updated_at);

-- =============================================================
-- 13. chat_messages : Tin nhắn trong phiên trò chuyện (Chat)
-- =============================================================
CREATE TABLE chat_messages (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id  BIGINT NOT NULL,
    role        VARCHAR(20) NOT NULL,                    -- user / assistant
    content     TEXT NOT NULL,
    steps       TEXT,                                    -- JSON danh sách bước (nếu chế độ step)
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chatmsg_session FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);
CREATE INDEX idx_chatmsg_session ON chat_messages(session_id, created_at);
