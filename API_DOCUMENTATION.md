# 🍽️ FoodX — Tài Liệu API (đồng bộ với mã nguồn hiện tại)

> Cập nhật theo codebase thực tế (`src/main/java/com/nhom6/foodx/**`).
> Base URL: `http://localhost:8080`. Swagger UI: `/swagger-ui.html`.

---

## 1. Tổng quan

| Mục | Giá trị |
|---|---|
| Định dạng | JSON (`application/json`; upload dùng `multipart/form-data`) |
| Auth | JWT Bearer — header `Authorization: Bearer <token>` (lấy ở `/api/auth/register` hoặc `/login`) |
| Envelope | Mọi endpoint trả về `ApiResponse`: `{ "success": bool, "message": string, "data": ..., "status": int }` |
| Lỗi | HTTP 400/401/403/404/409/429/500 kèm envelope `success=false`; message tiếng Việt, không lộ chi tiết nội bộ |
| Rate limit | 30 yêu cầu/phút/IP (cấu hình `app.rate-limit-per-minute`) áp cho: `/api/ai/**`, `/api/fridge/search-image`, `/api/recipes/search-image`, `/api/fridge/estimate-nutrition`, `/api/upload` → HTTP 429 |
| CORS | Đóng (SPA cùng origin với backend) |

**Xác thực (ví dụ):**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"minhanh","password":"123456"}'
# → data.accessToken dùng cho các request sau:
curl http://localhost:8080/api/fridge -H "Authorization: Bearer <accessToken>"
```

---

## 2. Auth — `/api/auth`

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| POST | `/register` | ❌ | `{username, email, password (6–100 ký tự), fullName?}` → `AuthResponse` + JWT |
| POST | `/login` | ❌ | `{username (hoặc email), password}` → `AuthResponse` + JWT |
| GET | `/me` | ✅ | Thông tin user hiện tại theo token |
| POST | `/change-password` | ✅ | `{oldPassword, newPassword}` — **bắt buộc đúng mật khẩu cũ**, mật khẩu mới phải khác cũ |

`AuthResponse.data`: `{accessToken, tokenType:"Bearer", expiresIn, userId, username, email, role, fullName, avatarUrl}`

---

## 3. Trang chủ — `/api/home` (public)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/home` | `{featuredRecipes (8 món mới nhất), categoryGroups [{category, recipes}] , greeting}` — dữ liệu công khai |

Trang SPA: `GET /` (index.html), `GET /app`, `GET /app.html` (redirect → index.html) — không cần auth.

---

## 4. Nguyên liệu — `/api/ingredients`

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/ingredients` | ❌ | Danh sách catalog nguyên liệu toàn cục |
| GET | `/api/ingredients/{id}` | ❌ | Chi tiết 1 nguyên liệu |
| POST | `/api/ingredients` | ✅ | Thêm nguyên liệu toàn cục |
| PUT | `/api/ingredients/{id}` | ✅ | Cập nhật |
| DELETE | `/api/ingredients/{id}` | ✅ | Xoá |

> ⚠️ Catalog dùng chung, mọi user đăng nhập đều sửa được — cần tách quyền admin khi mở production.

---

## 5. Tủ lạnh — `/api/fridge` (tất cả cần JWT)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/fridge` | Danh sách thực phẩm của user hiện tại |
| POST | `/api/fridge` | Thêm: `{sourceKey?, name, type?, quantity, unit, kcal?, protein?, carb?, fat?, components?, benefit?, imageUrl?, expiresAt? (yyyy-MM-dd), note?, customFood?}` |
| PUT | `/api/fridge/{id}` | Cập nhật thực phẩm (id số) |
| PATCH | `/api/fridge/{id}/quantity` | `?delta=±số` — đổi số lượng (về ≤ 0 thì tự xoá) |
| PATCH | `/api/fridge/{id}/expiry` | `{expiresAt}` — đổi hạn dùng |
| POST | `/api/fridge/merge-duplicates` | Gộp thực phẩm trùng tên + trùng hạn dùng |
| DELETE | `/api/fridge/{id}` | Xoá 1 thực phẩm |
| DELETE | `/api/fridge/all` (hoặc `/clear-all`) | Dọn sạch tủ |
| GET | `/api/fridge/search-image` | `?query=tên món` — tìm ảnh (local/Wikipedia) |
| GET | `/api/fridge/estimate-nutrition` | `?name=...&quantity=100&unit=g` — ước lượng dinh dưỡng |

`FridgeItemResponse` (1 item, mảng `data`): `{id, foodId/sourceKey, name, type, quantity, unit, kcal, protein, carb, fat, imageUrl, expiresAt, note, createdAt, updatedAt}`

---

## 6. Công thức — `/api/recipes`

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/recipes` | ❌ | Danh sách; lọc **một** tiêu chí: `?keyword=`, `?category=`, `?cuisine=` |
| GET | `/api/recipes/{id}` | ❌ | Chi tiết kèm `ingredients[]` |
| GET | `/api/recipes/match` | ✅ | **Món khớp tủ lạnh của user**: `[{recipe, matchedIngredients, totalIngredients, matchPercent}]` (giảm dần theo %) |
| GET | `/api/recipes/saved` | ✅ | Món đã lưu |
| POST | `/api/recipes/{id}/save` | ✅ | Lưu / bỏ lưu (toggle) → `true/false` |
| POST | `/api/recipes` | ✅ | Tạo mới: `{title, description?, instructions?, prepTime?, cookTime?, servings?, cuisine?, category?, kcal?, protein?, carb?, fat?, difficulty?, mealSlots?, imageUrl?, sourceUrl?, ingredients?: [{ingredientName, quantity, unit, note}]}` |
| PUT | `/api/recipes/{id}` | ✅ | Cập nhật (gửi kèm `ingredients` thì thay nguyên liệu) |
| DELETE | `/api/recipes/{id}` | ✅ | Xoá |
| POST | `/api/recipes/import` | ✅ | Import từ text/URL: `{sourceUrl?, text}` — AI parse, regex fallback |
| GET | `/api/recipes/search-image` | ✅ | `?query=` — tìm ảnh món (rate-limited) |

> Ảnh món: seed & món tạo mới ưu tiên ảnh **local** `/images/foods/<slug>.jpg` — không gọi mạng trong vòng đọc/ghi dữ liệu.

---

## 7. Kế hoạch bữa ăn — `/api/plan` (cần JWT)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/plan?start=yyyy-MM-dd&end=yyyy-MM-dd` | Thực đơn trong khoảng ngày |
| GET | `/api/plan?date=...&slot=...` | 1 khung giờ cụ thể |
| POST | `/api/plan` | Đặt món: `{planDate, slot: morning\|lunch\|dinner, recipeId}` |
| DELETE | `/api/plan?date=...&slot=...` | Xoá món khỏi khung giờ |
| POST | `/api/plan/auto?start=...&end=...` | **AI** lên thực đơn 7 ngày × 3 bữa (dùng hồ sơ + tủ lạnh); fallback thuật toán khi AI lỗi |
| POST | `/api/plan/suggest-slot` | `{planDate, slot, prompt?, targetKcal?}` — AI gợi ý món cho 1 khung giờ |
| POST | `/api/plan/estimate-dish` | `{dishName, slot}` — AI ước lượng dinh dưỡng |
| POST | `/api/plan/custom-slot` | `{planDate, slot, title, kcal, protein?, carb?, fat?, description?}` — đặt món tự nhập |

> Ràng buộc unique `(user, planDate, slot)` — đặt lại là ghi đè món cũ.

---

## 8. Đi chợ — `/api/shopping` (cần JWT)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/shopping` | Danh sách mua sắm |
| POST | `/api/shopping` | Thêm: `{name, quantity?, price?, category?}` (quantity dạng text: "500 g", "2 quả") |
| PATCH | `/api/shopping/{id}/toggle` | Tick mua/không mua — **tick "đã mua" tự nạp vào tủ lạnh** (gom trùng, hạn +7 ngày) |
| PATCH | `/api/shopping/{id}` | Sửa món |
| DELETE | `/api/shopping/{id}` | Xoá món |
| DELETE | `/api/shopping/done` | Xoá các món đã mua |
| DELETE | `/api/shopping/all` | Xoá toàn bộ |

---

## 9. Cộng đồng — `/api/social`

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/social/posts` | ❌ | Feed mới nhất (khách xem được) |
| GET | `/api/social/posts/my` | ✅ | Bài của user hiện tại |
| GET | `/api/social/posts/{id}` | ❌ | Chi tiết bài viết |
| POST | `/api/social/posts` | ✅ | Đăng bài: `{title, description?, ingredients?, instructions?, imageUrl?, cookTime?, kcal?, category?}` |
| DELETE | `/api/social/posts/{id}` | ✅ | Xoá bài của mình |
| POST | `/api/social/posts/{id}/like` | ✅ | Like / bỏ like (toggle) |
| GET | `/api/social/posts/{id}/comments` | ❌ | Bình luận của bài |
| POST | `/api/social/posts/{id}/comments` | ✅ | Thêm bình luận |
| DELETE | `/api/social/comments/{id}` | ✅ | Xoá bình luận của mình |

---

## 10. Thống kê & vòng tiêu thụ — `/api/stats` (cần JWT)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/stats` | `{totalCooked, weekCooked, monthCooked, byDay (14 ngày: [{date,kcal}]), topRecipes[5], currentStreak}` |
| POST | `/api/stats/cooked` | `{recipeId, servings?}` — ghi lịch sử nấu (mỗi ngày/món 1 lần — bấm đúp không nhân đôi) và **tự trừ nguyên liệu tủ lạnh theo khẩu phần** (quy đổi g/kg, ml/l; hết thì xoá khỏi tủ) |

---

## 11. Hồ sơ — `/api/profile` (cần JWT)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/profile` | Hồ sơ dinh dưỡng (tự tạo mặc định nếu chưa có) |
| PUT | `/api/profile` | `{name?, gender?, age?, weight?, height?, target?, activity?, diet?, allergies?, dislikes?}` (validate range) |
| POST | `/api/profile/avatar` | Upload avatar — `multipart`, field `avatar` (jpg/png/webp ≤ 5MB) |
| DELETE | `/api/profile/avatar` | Xoá avatar |

---

## 12. Chat AI đa phiên — `/api/chat/sessions` (cần JWT)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/api/chat/sessions` | Danh sách phiên của user |
| POST | `/api/chat/sessions` | Tạo phiên `{title?, mode?: chat\|step}` |
| GET | `/api/chat/sessions/{id}` | Chi tiết phiên + tin nhắn |
| PATCH | `/api/chat/sessions/{id}` | Đổi tên `{title}` |
| DELETE | `/api/chat/sessions/{id}` | Xoá phiên (kèm tin nhắn) |
| POST | `/api/chat/sessions/{id}/messages` | Gửi tin `{message, mode?, availableIngredients?}` → `{reply, steps?, timestamp}` |

> Server **tự nạp bối cảnh**: hồ sơ (chế độ ăn, dị ứng, món ghét) + tủ lạnh + 8 tin nhắn gần nhất của phiên → AI trả lời đúng ngữ cảnh và "nhớ" cuộc trò chuyện. Phiên mới tự đặt tiêu đề từ câu hỏi đầu tiên.

---

## 13. AI trực tiếp — `/api/ai`

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/ai/status` | ❌ | `{mock, provider: groq\|gemini\|mock, message}` |
| POST | `/api/ai/chat` | ✅ | `{message, mode?: chat\|step, availableIngredients?}` — 1 lượt hỏi (không lưu phiên), có bối cảnh server |
| POST | `/api/ai/suggest` | ✅ | `{availableIngredients[], preference?, mealType?, maxSuggestions?}` → suggestions JSON |

> Provider: **Groq** ưu tiên → **Gemini** dự phòng → **Mock** khi chưa cấu hình key hoặc cả hai lỗi. Đặt key qua env `GROQ_API_KEY` / `GEMINI_API_KEY`.

---

## 14. Upload — `/api/upload` (cần JWT)

| Method | Path | Mô tả |
|---|---|---|
| POST | `/api/upload` | `multipart/form-data`, field `file` — chỉ **JPG/PNG/WEBP ≤ 5MB** (từ chối SVG) → `{url: "/uploads/yyyy-MM-dd/<uuid>.<ext>"}` |

File đã upload được phục vụ công khai tại `GET /uploads/**`.

---

## 15. Cấu hình quan trọng

| Key | Mặc định | Ghi chú |
|---|---|---|
| `spring.profiles.active` | `dev` | `dev` = MySQL local; `ai-test` = H2 in-memory; `prod` = schema validate + đọc env |
| `app.jwt.secret` | placeholder | **Prod bắt buộc env `JWT_SECRET`** (≥ 32 bytes) |
| `app.jwt.expiration-ms` | `86400000` | 24h (chưa có refresh token) |
| `app.rate-limit-per-minute` | `30` | Rate limit theo IP (in-memory, 1 tiến trình) |
| `spring.servlet.multipart.*` | 5MB | Upload |

### Ghi chú phát triển
- Database: lược đồ do **JPA `ddl-auto`** sinh từ entity; dữ liệu mẫu do **DataSeeder** seed (profile ≠ `prod`). Các file `db/*.sql` chỉ là tài liệu tham khảo cũ.
- Gợi ý mở rộng: phân trang cho `/api/recipes` & `/api/social/posts`, refresh token, quyền admin cho catalog `ingredients`, OAuth/email verify, web push, barcode scan.
