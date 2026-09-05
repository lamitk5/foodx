const catalog = [
    // --- Meat & Seafood ---
    { id: "beef", name: "Thịt bò", type: "Thịt", category: "meat", ingredients: ["Thịt bò"], kcal: 250, quantity: 300, unit: "g", expiryDays: 3, image: "/images/foods/beef.jpg" },
    { id: "pork_belly", name: "Thịt ba chỉ heo", type: "Thịt", category: "meat", ingredients: ["Thịt heo"], kcal: 260, quantity: 400, unit: "g", expiryDays: 4, image: "/images/foods/beef.jpg" },
    { id: "pork_lean", name: "Thịt nạc thăn", type: "Thịt", category: "meat", ingredients: ["Thịt heo"], kcal: 145, quantity: 400, unit: "g", expiryDays: 4, image: "/images/foods/beef.jpg" },
    { id: "chicken", name: "Ức gà", type: "Thịt", category: "meat", ingredients: ["Ức gà"], kcal: 165, quantity: 450, unit: "g", expiryDays: 3, image: "/images/foods/chicken.jpg" },
    { id: "chicken_thigh", name: "Đùi gà", type: "Thịt", category: "meat", ingredients: ["Gà"], kcal: 210, quantity: 500, unit: "g", expiryDays: 3, image: "/images/foods/chicken.jpg" },
    { id: "salmon", name: "Cá hồi", type: "Hải sản", category: "meat", ingredients: ["Cá hồi"], kcal: 208, quantity: 300, unit: "g", expiryDays: 3, image: "/images/foods/salmon.jpg" },
    { id: "shrimp", name: "Tôm tươi", type: "Hải sản", category: "meat", ingredients: ["Tôm"], kcal: 99, quantity: 300, unit: "g", expiryDays: 3, image: "/images/foods/shrimp.jpg" },
    { id: "fish_mackerel", name: "Cá thu / Cá nục", type: "Hải sản", category: "meat", ingredients: ["Cá"], kcal: 180, quantity: 400, unit: "g", expiryDays: 3, image: "/images/foods/placeholder.jpg" },
    { id: "squid", name: "Mực ống", type: "Hải sản", category: "meat", ingredients: ["Mực"], kcal: 92, quantity: 300, unit: "g", expiryDays: 2, image: "/images/foods/placeholder.jpg" },

    // --- Veggies ---
    { id: "water_spinach", name: "Rau muống", type: "Rau", category: "veggie", ingredients: ["Rau muống"], kcal: 25, quantity: 1, unit: "bó", expiryDays: 3, image: "/images/foods/placeholder.jpg" },
    { id: "cabbage_sweet", name: "Rau cải ngọt", type: "Rau", category: "veggie", ingredients: ["Rau cải"], kcal: 22, quantity: 1, unit: "bó", expiryDays: 4, image: "/images/foods/placeholder.jpg" },
    { id: "cabbage", name: "Bắp cải", type: "Rau", category: "veggie", ingredients: ["Bắp cải"], kcal: 25, quantity: 500, unit: "g", expiryDays: 7, image: "/images/foods/placeholder.jpg" },
    { id: "tomato", name: "Cà chua", type: "Rau Củ", category: "veggie", ingredients: ["Cà chua"], kcal: 22, quantity: 4, unit: "quả", expiryDays: 6, image: "/images/foods/tomato.jpg" },
    { id: "broccoli", name: "Bông cải xanh", type: "Rau Củ", category: "veggie", ingredients: ["Bông cải"], kcal: 34, quantity: 250, unit: "g", expiryDays: 5, image: "/images/foods/broccoli.jpg" },
    { id: "carrot", name: "Cà rốt", type: "Củ", category: "veggie", ingredients: ["Cà rốt"], kcal: 41, quantity: 3, unit: "củ", expiryDays: 9, image: "/images/foods/carrot.jpg" },
    { id: "cucumber", name: "Dưa leo", type: "Rau Củ", category: "veggie", ingredients: ["Dưa leo"], kcal: 15, quantity: 3, unit: "quả", expiryDays: 5, image: "/images/foods/placeholder.jpg" },
    { id: "pumpkin", name: "Bí đỏ", type: "Củ", category: "veggie", ingredients: ["Bí đỏ"], kcal: 26, quantity: 400, unit: "g", expiryDays: 14, image: "/images/foods/placeholder.jpg" },
    { id: "mushroom", name: "Nấm đùi gà / Nấm rơm", type: "Nấm", category: "veggie", ingredients: ["Nấm"], kcal: 35, quantity: 200, unit: "g", expiryDays: 4, image: "/images/foods/placeholder.jpg" },

    // --- Egg & Tofu ---
    { id: "egg", name: "Trứng gà", type: "Trứng", category: "egg_tofu", ingredients: ["Trứng"], kcal: 70, quantity: 6, unit: "quả", expiryDays: 14, image: "/images/foods/egg.jpg" },
    { id: "duck_egg", name: "Trứng vịt", type: "Trứng", category: "egg_tofu", ingredients: ["Trứng vịt"], kcal: 130, quantity: 6, unit: "quả", expiryDays: 14, image: "/images/foods/egg.jpg" },
    { id: "tofu", name: "Đậu phụ (đậu hũ)", type: "Đậu", category: "egg_tofu", ingredients: ["Đậu hũ"], kcal: 76, quantity: 2, unit: "bìa", expiryDays: 3, image: "/images/foods/placeholder.jpg" },
    { id: "sausage", name: "Giò lụa / Xúc xích", type: "Chế biến", category: "egg_tofu", ingredients: ["Giò"], kcal: 220, quantity: 250, unit: "g", expiryDays: 7, image: "/images/foods/placeholder.jpg" },

    // --- Dairy ---
    { id: "milk", name: "Sữa tươi", type: "Sữa", category: "dairy", ingredients: ["Sữa"], kcal: 120, quantity: 1, unit: "hộp", expiryDays: 7, image: "/images/foods/milk.jpg" },
    { id: "yogurt", name: "Sữa chua", type: "Sữa", category: "dairy", ingredients: ["Sữa chua"], kcal: 95, quantity: 4, unit: "hộp", expiryDays: 10, image: "/images/foods/yogurt.jpg" },
    { id: "cheese", name: "Phô mai", type: "Bơ sữa", category: "dairy", ingredients: ["Phô mai"], kcal: 402, quantity: 150, unit: "g", expiryDays: 30, image: "/images/foods/placeholder.jpg" },
    { id: "butter", name: "Bơ thực vật / Bơ lạt", type: "Bơ sữa", category: "dairy", ingredients: ["Bơ"], kcal: 717, quantity: 100, unit: "g", expiryDays: 30, image: "/images/foods/placeholder.jpg" },

    // --- Carb & Fruits ---
    { id: "rice", name: "Cơm trắng", type: "Tinh bột", category: "carb", ingredients: ["Cơm"], kcal: 130, quantity: 500, unit: "g", expiryDays: 2, image: "/images/foods/rice.jpg" },
    { id: "potato", name: "Khoai tây", type: "Củ", category: "carb", ingredients: ["Khoai tây"], kcal: 77, quantity: 4, unit: "củ", expiryDays: 14, image: "/images/foods/potato.jpg" },
    { id: "sweet_potato", name: "Khoai lang", type: "Củ", category: "carb", ingredients: ["Khoai lang"], kcal: 86, quantity: 3, unit: "củ", expiryDays: 14, image: "/images/foods/placeholder.jpg" },
    { id: "noodles", name: "Bún tươi / Phở", type: "Tinh bột", category: "carb", ingredients: ["Bún"], kcal: 110, quantity: 500, unit: "g", expiryDays: 2, image: "/images/foods/placeholder.jpg" },
    { id: "bread", name: "Bánh mì", type: "Tinh bột", category: "carb", ingredients: ["Bánh mì"], kcal: 265, quantity: 2, unit: "ổ", expiryDays: 3, image: "/images/foods/placeholder.jpg" },
    { id: "banana", name: "Chuối", type: "Trái Cây", category: "carb", ingredients: ["Chuối"], kcal: 89, quantity: 5, unit: "quả", expiryDays: 5, image: "/images/foods/banana.jpg" },
    { id: "avocado", name: "Quả bơ", type: "Trái Cây", category: "carb", ingredients: ["Bơ"], kcal: 160, quantity: 2, unit: "quả", expiryDays: 4, image: "/images/foods/avocado.jpg" },

    // --- Spices ---
    { id: "shallot", name: "Hành tím / Hành khô", type: "Gia vị", category: "spice", ingredients: ["Hành"], kcal: 40, quantity: 5, unit: "củ", expiryDays: 30, image: "/images/foods/placeholder.jpg" },
    { id: "garlic", name: "Tỏi", type: "Gia vị", category: "spice", ingredients: ["Tỏi"], kcal: 149, quantity: 3, unit: "củ", expiryDays: 45, image: "/images/foods/placeholder.jpg" },
    { id: "ginger", name: "Gừng tươi", type: "Gia vị", category: "spice", ingredients: ["Gừng"], kcal: 80, quantity: 2, unit: "củ", expiryDays: 30, image: "/images/foods/placeholder.jpg" },
    { id: "chili", name: "Ớt cay", type: "Gia vị", category: "spice", ingredients: ["Ớt"], kcal: 40, quantity: 50, unit: "g", expiryDays: 15, image: "/images/foods/placeholder.jpg" }
];


/* =========================================================
   NUTRITION
========================================================= */

const NUTRITION_LIBRARY = {

    egg: {
        protein: 6.3,
        fat: 4.8,
        carb: 0.4,
        benefit:
            "Cân bằng / tăng cơ",
        basis:
            "1 quả",
        components:
            "Protein, chất béo, vitamin B12, choline và nhiều vi chất.",
        note:
            "Nguồn protein tiện lợi và phù hợp nhiều chế độ ăn."
    },

    chicken: {
        protein: 31,
        fat: 3.6,
        carb: 0,
        benefit:
            "Tăng cơ / kiểm soát cân nặng",
        basis:
            "100 g",
        components:
            "Protein cao, ít carbohydrate và lượng chất béo tương đối thấp.",
        note:
            "Thích hợp cho chế độ ăn ưu tiên protein."
    },

    tomato: {
        protein: 0.9,
        fat: 0.2,
        carb: 3.9,
        benefit:
            "Giảm cân / cân bằng",
        basis:
            "100 g",
        components:
            "Nước, carbohydrate, chất xơ, vitamin C và chất chống oxy hóa.",
        note:
            "Mật độ năng lượng thấp."
    },

    broccoli: {
        protein: 2.8,
        fat: 0.4,
        carb: 6.6,
        benefit:
            "Giảm cân / cân bằng",
        basis:
            "100 g",
        components:
            "Chất xơ, vitamin C, vitamin K và protein thực vật.",
        note:
            "Phù hợp để tăng lượng rau và chất xơ."
    },

    milk: {
        protein: 8,
        fat: 5,
        carb: 12,
        benefit:
            "Cân bằng / tăng cân",
        basis:
            "250 ml",
        components:
            "Protein, carbohydrate, chất béo và canxi.",
        note:
            "Có thể bổ sung năng lượng và protein."
    },

    avocado: {
        protein: 2,
        fat: 14.7,
        carb: 8.5,
        benefit:
            "Cân bằng / tăng cân",
        basis:
            "100 g",
        components:
            "Chất béo không bão hòa, chất xơ và kali.",
        note:
            "Có mật độ năng lượng tương đối cao."
    },

    beef: {
        protein: 26,
        fat: 15,
        carb: 0,
        benefit:
            "Tăng cơ / tăng cân",
        basis:
            "100 g",
        components:
            "Protein, sắt, kẽm, vitamin B12 và chất béo.",
        note:
            "Nguồn protein và sắt tốt."
    },

    potato: {
        protein: 2,
        fat: 0.1,
        carb: 17,
        benefit:
            "Cân bằng / bổ sung năng lượng",
        basis:
            "100 g",
        components:
            "Tinh bột, kali, vitamin C và chất xơ.",
        note:
            "Nguồn carbohydrate."
    },

    carrot: {
        protein: 0.9,
        fat: 0.2,
        carb: 10,
        benefit:
            "Giảm cân / cân bằng",
        basis:
            "100 g",
        components:
            "Carbohydrate, chất xơ và beta-carotene.",
        note:
            "Năng lượng thấp."
    },

    yogurt: {
        protein: 5,
        fat: 3,
        carb: 12,
        benefit:
            "Cân bằng",
        basis:
            "1 khẩu phần",
        components:
            "Protein, carbohydrate, canxi và sản phẩm lên men.",
        note:
            "Giá trị thay đổi tùy loại."
    },

    rice: {
        protein: 2.7,
        fat: 0.3,
        carb: 28,
        benefit:
            "Tăng năng lượng / tăng cân",
        basis:
            "100 g cơm chín",
        components:
            "Chủ yếu là carbohydrate và một lượng nhỏ protein.",
        note:
            "Nguồn năng lượng chính."
    },

    banana: {
        protein: 1.1,
        fat: 0.3,
        carb: 23,
        benefit:
            "Bổ sung năng lượng",
        basis:
            "100 g",
        components:
            "Carbohydrate, kali, vitamin B6 và chất xơ.",
        note:
            "Phù hợp cho bữa phụ."
    }

};


/* =========================================================
   RECIPES
========================================================= */

const recipes = [
    {
        "id": 1,
        "name": "Phở bò tái Hà Nội",
        "title": "Phở bò tái Hà Nội",
        "kcal": 480,
        "time": 45,
        "difficulty": "Trung bình",
        "tags": [
            "Bữa sáng",
            "Món nước",
            "Nhiều đạm"
        ],
        "category": "Bữa sáng",
        "ingredients": [
            "Thịt bò tái",
            "Bánh phở tươi",
            "Xương bò",
            "Hành hoa",
            "Ngò gai",
            "Gừng",
            "Hành tây",
            "Hoa hồi",
            "Quế"
        ],
        "image": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1000&q=85",
        "steps": [
            "Ninh xương bò với gừng hành nướng trong 90 phút.",
            "Trụng bánh phở, xếp thịt bò tái mỏng lên trên.",
            "Chan nước dùng sôi sùng sục, rắc hành hoa, ngò gai.",
            "Ăn kèm chanh ớt và quẩy nóng."
        ]
    },
    {
        "id": 2,
        "name": "Bánh mì trứng ốp la bơ tỏi",
        "title": "Bánh mì trứng ốp la bơ tỏi",
        "kcal": 420,
        "time": 10,
        "difficulty": "Dễ",
        "tags": [
            "Bữa sáng",
            "Nhanh gọn"
        ],
        "category": "Bữa sáng",
        "ingredients": [
            "Bánh mì",
            "Trứng gà",
            "Bơ tỏi",
            "Patê",
            "Dưa leo",
            "Ngò rí",
            "Tương ớt"
        ],
        "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=85",
        "steps": [
            "Chiên trứng ốp la lòng đào với chút bơ thơm.",
            "Nướng nóng giòn ổ bánh mì, phết patê và sốt bơ tỏi.",
            "Kẹp trứng, dưa leo, ngò rí và chan nước tương tỏi ớt."
        ]
    },
    {
        "id": 3,
        "name": "Cháo gà xé gừng hành hoa",
        "title": "Cháo gà xé gừng hành hoa",
        "kcal": 380,
        "time": 30,
        "difficulty": "Dễ",
        "tags": [
            "Bữa sáng",
            "Thanh đạm",
            "Dễ tiêu"
        ],
        "category": "Bữa sáng",
        "ingredients": [
            "Ức gà ta",
            "Gạo tẻ",
            "Gừng tươi",
            "Hành hoa",
            "Rau mùi",
            "Tiêu đen"
        ],
        "image": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85",
        "steps": [
            "Gạo tẻ nấu nhừ cùng nước luộc gà trong 30 phút.",
            "Ức gà luộc chín xé sợi, ướp tiêu và nước mắm.",
            "Múc cháo ra tô, cho gà lên, rắc hành ngò, gừng tươi thái chỉ và tiêu."
        ]
    },
    {
        "id": 4,
        "name": "Yến mạch hoa quả hạt chia sữa chua",
        "title": "Yến mạch hoa quả hạt chia sữa chua",
        "kcal": 360,
        "time": 5,
        "difficulty": "Dễ",
        "tags": [
            "Eat clean",
            "Healthy",
            "Bữa sáng"
        ],
        "category": "Bữa sáng",
        "ingredients": [
            "Yến mạch",
            "Sữa chua không đường",
            "Hạt chia",
            "Chuối",
            "Bơ sáp",
            "Dâu tây"
        ],
        "image": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=1000&q=85",
        "steps": [
            "Ngâm 40g yến mạch với 100ml sữa tươi ấm 5 phút.",
            "Trộn cùng 1 hộp sữa chua không đường và 1 thìa hạt chia.",
            "Thêm chuối cắt lát, bơ sáp và dâu tây lên trên, thưởng thức ngay."
        ]
    },
    {
        "id": 5,
        "name": "Hủ tiếu Nam Vang tôm thịt",
        "title": "Hủ tiếu Nam Vang tôm thịt",
        "kcal": 490,
        "time": 35,
        "difficulty": "Trung bình",
        "tags": [
            "Bữa sáng",
            "Món nước"
        ],
        "category": "Bữa sáng",
        "ingredients": [
            "Hủ tiếu dai",
            "Tôm tươi",
            "Thịt heo nạc",
            "Trứng cút",
            "Xương ống",
            "Củ cải trắng",
            "Hẹ lá"
        ],
        "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=85",
        "steps": [
            "Nấu nước dùng từ xương ống và củ cải trắng.",
            "Trụng hủ tiếu dai, xếp tôm luộc, thịt nạc xá xíu, trứng cút.",
            "Chan nước lèo nóng, thêm tỏi phi thơm và hẹ lá."
        ]
    },
    {
        "id": 6,
        "name": "Bún mọc sườn non dọc mùng",
        "title": "Bún mọc sườn non dọc mùng",
        "kcal": 460,
        "time": 40,
        "difficulty": "Trung bình",
        "tags": [
            "Bữa sáng",
            "Món nước"
        ],
        "category": "Bữa sáng",
        "ingredients": [
            "Bún tươi",
            "Sườn non",
            "Giò sống",
            "Mộc nhĩ",
            "Nấm hương",
            "Dọc mùng",
            "Hành hoa"
        ],
        "image": "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=1000&q=85",
        "steps": [
            "Ninh sườn non lấy nước ngọt trong 40 phút.",
            "Quết giò sống với mộc nhĩ nấm hương vo viên thả vào nồi sôi.",
            "Trụng bún, thêm dọc mùng chần giòn, chan nước dùng thơm ngát."
        ]
    },
    {
        "id": 7,
        "name": "Bánh cuốn nóng chả lụa",
        "title": "Bánh cuốn nóng chả lụa",
        "kcal": 410,
        "time": 20,
        "difficulty": "Dễ",
        "tags": [
            "Bữa sáng",
            "Truyền thống"
        ],
        "category": "Bữa sáng",
        "ingredients": [
            "Bột gạo",
            "Thịt heo băm",
            "Mộc nhĩ",
            "Chả lụa",
            "Hành phi",
            "Rau thơm",
            "Nước mắm chua ngọt"
        ],
        "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=85",
        "steps": [
            "Hấp bánh tráng mỏng cuộn nhân thịt băm mộc nhĩ phi thơm.",
            "Xếp bánh ra đĩa, thêm vài lát chả lụa, rắc đầy hành phi.",
            "Chấm cùng nước mắm chua ngọt ấm dịu và rau thơm."
        ]
    },
    {
        "id": 8,
        "name": "Cơm chiên trứng xúc xích kiểu Việt",
        "title": "Cơm chiên trứng xúc xích kiểu Việt",
        "kcal": 430,
        "time": 15,
        "difficulty": "Dễ",
        "tags": [
            "Nhanh gọn",
            "Bữa sáng",
            "Bữa trưa"
        ],
        "category": "Bữa sáng",
        "ingredients": [
            "Cơm nguội",
            "Trứng gà",
            "Xúc xích",
            "Hành hoa",
            "Xì dầu",
            "Tỏi băm"
        ],
        "image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1000&q=85",
        "steps": [
            "Cơm nguội trộn đều với 2 lòng đỏ trứng gà.",
            "Phi thơm tỏi, cho cơm vào đảo lửa lớn đến khi hạt cơm săn tơi.",
            "Thêm xúc xích, hành hoa, nêm xì dầu và tiêu xay."
        ]
    },
    {
        "id": 9,
        "name": "Cơm tấm sườn nướng mật ong",
        "title": "Cơm tấm sườn nướng mật ong",
        "kcal": 680,
        "time": 35,
        "difficulty": "Trung bình",
        "tags": [
            "Bữa trưa",
            "Bữa tối",
            "Nhiều đạm"
        ],
        "category": "Bữa trưa",
        "ingredients": [
            "Gạo tấm",
            "Sườn cốt lết",
            "Mật ong",
            "Sả băm",
            "Dầu hào",
            "Trứng gà",
            "Đồ chua",
            "Mỡ hành"
        ],
        "image": "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85",
        "steps": [
            "Ướp sườn cốt lết với mật ong, dầu hào, sả băm 30 phút rồi nướng than hoặc nồi chiên không dầu.",
            "Xới cơm tấm nóng, đặt sườn nướng, trứng ốp la và đồ chua.",
            "Chan mỡ hành béo ngậy và nước mắm kẹo chua ngọt."
        ]
    },
    {
        "id": 10,
        "name": "Cơm bò lúc lắc khoai tây sốt tiêu",
        "title": "Cơm bò lúc lắc khoai tây sốt tiêu",
        "kcal": 650,
        "time": 25,
        "difficulty": "Trung bình",
        "tags": [
            "Bữa trưa",
            "Bữa tối",
            "Nhiều đạm"
        ],
        "category": "Bữa trưa",
        "ingredients": [
            "Thịt bò thăn",
            "Khoai tây",
            "Ớt chuông",
            "Hành tây",
            "Bơ tỏi",
            "Tiêu đen",
            "Xà lách",
            "Cà chua"
        ],
        "image": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=85",
        "steps": [
            "Bò thăn thái quân cờ, ướp tỏi băm, dầu hào, xì dầu và tiêu đen.",
            "Xào bò lửa lớn trong chảo gang 3 phút cho chín tới mềm mọng.",
            "Ăn kèm cơm trắng nóng, khoai tây chiên vàng và xà lách cà chua."
        ]
    },
    {
        "id": 11,
        "name": "Bún chả Hà Nội nướng than",
        "title": "Bún chả Hà Nội nướng than",
        "kcal": 590,
        "time": 35,
        "difficulty": "Trung bình",
        "tags": [
            "Bữa trưa",
            "Truyền thống"
        ],
        "category": "Bữa trưa",
        "ingredients": [
            "Bún tươi",
            "Thịt ba chỉ",
            "Thịt nạc vai băm",
            "Đu đủ xanh",
            "Cà rốt",
            "Hành khô",
            "Rau sống"
        ],
        "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=85",
        "steps": [
            "Ướp thịt ba chỉ và thịt băm với hành khô, nước hàng, nước mắm rồi nướng xém vàng.",
            "Pha nước chấm ấm vị chua ngọt dịu, thả đu đủ cà rốt giòn.",
            "Ăn cùng bún tươi lá và đĩa rau sống tươi mát."
        ]
    },
    {
        "id": 12,
        "name": "Cơm ức gà áp chảo sốt bơ tỏi & bông cải",
        "title": "Cơm ức gà áp chảo sốt bơ tỏi & bông cải",
        "kcal": 550,
        "time": 20,
        "difficulty": "Dễ",
        "tags": [
            "Eat clean",
            "Nhiều đạm",
            "Healthy"
        ],
        "category": "Bữa trưa",
        "ingredients": [
            "Ức gà",
            "Bông cải xanh",
            "Bơ tỏi",
            "Dầu ô liu",
            "Cơm gạo lứt",
            "Muối tiêu"
        ],
        "image": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=85",
        "steps": [
            "Ức gà khía nhẹ, ướp muối tiêu và dầu ô-liu 10 phút.",
            "Áp chảo mỗi mặt 4-5 phút cho vàng ruộm rồi rưới sốt bơ tỏi.",
            "Ăn kèm cơm gạo lứt (hoặc cơm trắng) và bông cải xanh luộc giòn ngọt."
        ]
    }
];


/* =========================================================
   HERO
========================================================= */

const slides = [

    {
        badge:
            "Food X đồng hành cùng bạn",

        title:
            `Ăn ngon mỗi ngày<br><span>Sống khỏe mỗi ngày</span>`,

        description:
            "Gợi ý món ăn phù hợp với nguyên liệu và mục tiêu dinh dưỡng của riêng bạn.",

        image:
            "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1800&q=90"
    },

    {
        badge:
            "Tận dụng nguyên liệu đang có",

        title:
            `Có gì nấu nấy<br><span>Giảm lãng phí thực phẩm</span>`,

        description:
            "Theo dõi tủ lạnh và ưu tiên những thực phẩm cần sử dụng sớm.",

        image:
            "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1800&q=90"
    },

    {
        badge:
            "Dinh dưỡng cá nhân hóa",

        title:
            `Ăn uống phù hợp<br><span>Riêng cho bạn</span>`,

        description:
            "Food X sử dụng hồ sơ dinh dưỡng để xếp hạng món ăn phù hợp hơn.",

        image:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1800&q=90"
    }

];


/* =========================================================
   STATE
========================================================= */

function createDefaultState() {

    return {

        theme:
            "light",

        userId:
            null,

        profile: {
            name: "Khách",
            avatarUrl: "",
            gender: "male",
            age: 25,
            weight: 60,
            height: 165,
            target: 60,
            activity: 1.2,
            diet: "Cân bằng",
            allergies: "",
            dislikes: ""
        },

        fridge:
            [],

        favorites:
            [],

        shopping:
            [],

        selectedFridgeIds:
            []
    };
}


function loadState() {

    const defaults =
        createDefaultState();

    try {

        const storageKey = typeof STORAGE_KEY !== 'undefined' ? STORAGE_KEY : (typeof window !== 'undefined' && window.STORAGE_KEY ? window.STORAGE_KEY : 'foodXLocalV8');
        const saved =
            localStorage.getItem(
                storageKey
            );

        if (!saved) {
            return defaults;
        }

        const parsed =
            JSON.parse(saved);

        return {

            ...defaults,

            ...parsed,

            profile: {

                ...defaults.profile,

                ...(parsed.profile || {})
            },

            fridge:
                [],

            favorites:
                Array.isArray(
                    parsed.favorites
                )
                    ? parsed.favorites
                    : [],

            shopping:
                Array.isArray(
                    parsed.shopping
                )
                    ? parsed.shopping
                    : [],

            selectedFridgeIds:
                Array.isArray(
                    parsed.selectedFridgeIds
                )
                    ? parsed.selectedFridgeIds
                    : []
        };

    } catch (error) {

        console.error(
            "Lỗi localStorage:",
            error
        );

        return defaults;
    }
}

function saveState() {
    try {
        const storageKey = typeof STORAGE_KEY !== 'undefined' ? STORAGE_KEY : (typeof window !== 'undefined' && window.STORAGE_KEY ? window.STORAGE_KEY : 'foodXLocalV8');
        const currentState = (typeof window !== 'undefined' && window.state) ? window.state : (typeof state !== 'undefined' ? state : null);
        if (currentState) {
            localStorage.setItem(storageKey, JSON.stringify(currentState));
        }
    } catch (e) {
        console.warn("Không thể lưu state vào LocalStorage:", e);
    }
}

// Module window exports
if (typeof window !== 'undefined') window.createDefaultState = createDefaultState;
if (typeof window !== 'undefined') window.loadState = loadState;
if (typeof window !== 'undefined') window.saveState = saveState;
if (typeof window !== 'undefined') window.slides = slides;
if (typeof window !== 'undefined') window.catalog = catalog;
if (typeof window !== 'undefined') window.NUTRITION_LIBRARY = NUTRITION_LIBRARY;
if (typeof window !== 'undefined') window.recipes = recipes;

