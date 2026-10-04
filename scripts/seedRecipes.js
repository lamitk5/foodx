/**
 * FoodX - Script Seed Dữ liệu Công thức Món ăn (30 Recipes)
 * 
 * Cách chạy:
 *   node scripts/seedRecipes.js
 * 
 * Tính năng:
 *   - Tự động kiểm tra trùng lặp (Idempotent), không bao giờ bị duplicate key.
 *   - Nạp dữ liệu qua API Gateway (http://localhost:8080/api/recipes) hoặc trực tiếp vào MySQL container.
 *   - Tích hợp URL ảnh Unsplash chất lượng cao theo keyword tiếng Anh.
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RECIPES_DATA = [
  // =========================================================
  // 1. MÓN ĂN GIA ĐÌNH (category: "family")
  // =========================================================
  {
    title: "Thịt kho tàu nước dừa",
    description: "Thịt ba chỉ mềm rục ngấm nước dừa xiêm ngọt thanh, trứng vịt bùi ngậy keo màu cánh gián óng ả chuẩn vị mâm cơm Tết.",
    cookTime: 45,
    servings: 4,
    calories: 560,
    category: "family",
    ingredients: [
      { name: "Thịt ba chỉ", quantity: 500, unit: "g" },
      { name: "Trứng vịt", quantity: 4, unit: "quả" },
      { name: "Nước dừa xiêm", quantity: 400, unit: "ml" }
    ],
    steps: [
      "Thịt ba chỉ thái vuông 3-4cm, chần qua nước sôi 2 phút rồi vớt ra để ráo.",
      "Ướp thịt với hành tỏi băm, nước mắm ngon, tiêu và chút đường trong 30 phút.",
      "Thắng nước màu cánh gián, cho thịt vào xào săn đều các mặt.",
      "Đổ nước dừa tươi ngập thịt, đun sôi rồi hạ lửa liu riu trong 40 phút.",
      "Cho trứng vịt luộc bóc vỏ vào kho thêm 15 phút đến khi nước thịt sánh kẹo óng ả."
    ],
    tags: ["Gia đình", "Món kho", "Đậm đà", "Bữa tối"],
    englishKeyword: "braised-pork-belly",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Gà kho gừng sả ớt",
    description: "Miếng thịt gà ta săn chắc đậm đà thơm cay nồng nàn vị gừng tươi và sả phi, cực kỳ đưa cơm trong những ngày mưa lạnh.",
    cookTime: 30,
    servings: 4,
    calories: 420,
    category: "family",
    ingredients: [
      { name: "Thịt gà ta", quantity: 600, unit: "g" },
      { name: "Gừng tươi", quantity: 40, unit: "g" },
      { name: "Sả băm", quantity: 30, unit: "g" }
    ],
    steps: [
      "Gà chặt miếng vừa ăn, xát muối gừng khử mùi rồi rửa sạch để ráo.",
      "Ướp gà với gừng thái chỉ, nước mắm, hạt nêm, tiêu trong 20 phút.",
      "Phi thơm sả băm và gừng còn lại với chút dầu ăn đến khi dậy mùi thơm.",
      "Cho thịt gà vào xào lửa lớn cho săn chắc các mặt.",
      "Thêm chút nước lọc, hạ lửa nhỏ kho liu riu 20 phút cho gà mềm ngấm vị cay ấm."
    ],
    tags: ["Gia đình", "Món kho", "Cay ấm", "Bữa trưa"],
    englishKeyword: "ginger-chicken",
    imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Canh sườn non nấu sấu chua",
    description: "Bát canh sườn chua thanh tao ngọt lịm đặc trưng mùa hè miền Bắc, nước dùng trong vắt điểm xuyết cà chua và hành mùi.",
    cookTime: 35,
    servings: 4,
    calories: 310,
    category: "family",
    ingredients: [
      { name: "Sườn non heo", quantity: 500, unit: "g" },
      { name: "Quả sấu tươi", quantity: 5, unit: "quả" },
      { name: "Cà chua", quantity: 2, unit: "quả" }
    ],
    steps: [
      "Sườn non chặt khúc 3cm, chần nước sôi rửa sạch bọt bẩn.",
      "Phi thơm hành tím xào sơ cà chua và sườn, nêm gia vị vừa miệng.",
      "Cho 1.2 lít nước vào đun sôi, hạ lửa hầm sườn trong 25 phút.",
      "Thả sấu cạo vỏ vào nấu chín mềm, dầm sấu lấy vị chua thanh dịu.",
      "Rắc hành hoa mùi tàu thái nhỏ, tắt bếp và múc ra tô thưởng thức nóng."
    ],
    tags: ["Gia đình", "Canh chua", "Thanh mát", "Mùa hè"],
    englishKeyword: "pork-rib-soup",
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Cá chẽm hấp xì dầu hành gừng",
    description: "Thịt cá ngọt mềm mọng nước, quyện cùng sốt xì dầu sánh thơm mùi gừng hành và dầu mè, giữ trọn vẹn dinh dưỡng.",
    cookTime: 25,
    servings: 3,
    calories: 340,
    category: "family",
    ingredients: [
      { name: "Cá chẽm tươi", quantity: 700, unit: "g" },
      { name: "Hành lá", quantity: 50, unit: "g" },
      { name: "Gừng tươi", quantity: 30, unit: "g" }
    ],
    steps: [
      "Cá làm sạch, khía vảy rồng hai bên thân cá, xát gừng rượu khử tanh.",
      "Xếp gừng thái sợi và đầu hành lá vào đĩa lót dưới đáy và nhét vào bụng cá.",
      "Đặt cá vào xửng hấp chín tới trong 15 phút.",
      "Nấu hỗn hợp xì dầu, dầu hào, đường, nước dùng cho sôi rồi rưới đều lên cá.",
      "Rải hành lá thái sợi lên trên, đun 1 muôi dầu ăn nóng già dội lên hành dậy mùi thơm."
    ],
    tags: ["Gia đình", "Món hấp", "Thanh đạm", "Bổ dưỡng"],
    englishKeyword: "steamed-fish-soy-sauce",
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Bò xào cần tỏi tây",
    description: "Thịt bò thăn thái mỏng xào lửa lớn giữ nguyên độ mềm mọng ngọt tự nhiên, quyện cùng cần tây tỏi tây thơm nức giòn ngọt.",
    cookTime: 15,
    servings: 3,
    calories: 380,
    category: "family",
    ingredients: [
      { name: "Thịt bò thăn", quantity: 350, unit: "g" },
      { name: "Cần tây", quantity: 150, unit: "g" },
      { name: "Tỏi tây", quantity: 100, unit: "g" }
    ],
    steps: [
      "Thịt bò thái lát mỏng ngang thớ, ướp tỏi băm, dầu hào, tiêu và 1 thìa dầu ăn cho mềm.",
      "Cần tây, tỏi tây rửa sạch cắt khúc 4cm; cà chua bổ múi cau.",
      "Đun nóng chảo dầu, phi thơm tỏi rồi xào bò lửa lớn 2 phút vừa chín tới, trút ra đĩa.",
      "Xào nhanh cần tây, tỏi tây và cà chua cho chín giòn.",
      "Trút thịt bò vào đảo nhanh tay 30 giây cho hòa quyện, rắc tiêu thơm rồi tắt bếp."
    ],
    tags: ["Gia đình", "Món xào", "Nhanh gọn", "Bổ máu"],
    englishKeyword: "stir-fried-beef-celery",
    imageUrl: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Tôm rim mặn ngọt hành tỏi",
    description: "Tôm rim đỏ au vỏ bóng bẩy giòn thơm, sốt mặn ngọt keo quánh đậm đà ăn cùng cơm trắng nóng hổi vét sạch nồi cơm.",
    cookTime: 20,
    servings: 3,
    calories: 290,
    category: "family",
    ingredients: [
      { name: "Tôm sú tươi", quantity: 400, unit: "g" },
      { name: "Tỏi", quantity: 20, unit: "g" },
      { name: "Hành tím", quantity: 20, unit: "g" }
    ],
    steps: [
      "Tôm cắt râu gai, rửa sạch để ráo nước.",
      "Cho đường vào chảo đảo nhỏ lửa cho tan chảy chuyển màu cánh gián.",
      "Phi thơm hành tỏi băm, cho tôm vào đảo đều trên lửa lớn cho tôm cong lại ửng đỏ.",
      "Nêm nước mắm ngon, tiêu và chút nước, hạ lửa vừa rim cho sốt áo quanh thân tôm.",
      "Khi sốt sệt keo bám bóng bẩy vào từng con tôm, rắc hành hoa rồi dọn ra đĩa."
    ],
    tags: ["Gia đình", "Món rim", "Đậm đà", "Đưa cơm"],
    englishKeyword: "caramelized-shrimp",
    imageUrl: "https://images.unsplash.com/photo-1559742811-822873691df8?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Canh cua mồng tơi rau đay mướp hương",
    description: "Bát canh cua gạch đóng tảng thơm lừng, rau đay mồng tơi thanh mát quyện cùng hương mướp ngọt lành giải nhiệt ngày hè.",
    cookTime: 25,
    servings: 4,
    calories: 180,
    category: "family",
    ingredients: [
      { name: "Cua đồng xay", quantity: 350, unit: "g" },
      { name: "Rau mồng tơi", quantity: 150, unit: "g" },
      { name: "Mướp hương", quantity: 1, unit: "quả" }
    ],
    steps: [
      "Cua đồng hòa với nước, lọc qua rây 2-3 lần lấy nước cốt gạch cua.",
      "Đun nồi nước cua trên lửa vừa, thêm xíu muối, khuấy nhẹ cho thịt cua kết mảng nổi lên mặt.",
      "Cho mướp thái vát và rau mồng tơi, rau đay thái nhỏ vào nồi nước cua sôi.",
      "Nêm gia vị và xíu mắm tôm cho dậy hương vị đồng quê đặc trưng.",
      "Cho phần thịt cua trở lại nồi, tắt bếp, ăn kèm cơm trắng và cà pháo muối giòn."
    ],
    tags: ["Gia đình", "Canh thanh mát", "Mùa hè", "Truyền thống"],
    englishKeyword: "crab-spinach-soup",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Thịt ba chỉ luộc cà pháo mắm tôm",
    description: "Thịt ba chỉ luộc trắng mềm da giòn sần sật, chấm bát mắm tôm đánh bông quất ớt ăn kèm cà pháo giòn rụm dân dã tuyệt đỉnh.",
    cookTime: 25,
    servings: 4,
    calories: 460,
    category: "family",
    ingredients: [
      { name: "Thịt ba chỉ", quantity: 500, unit: "g" },
      { name: "Mắm tôm ngon", quantity: 50, unit: "ml" },
      { name: "Hành tím", quantity: 3, unit: "củ" }
    ],
    steps: [
      "Rửa sạch thịt ba chỉ, buộc chỉ định hình miếng thịt cho đẹp mắt.",
      "Cho thịt vào nồi luộc cùng hành tím và gừng đập dập trong 20 phút.",
      "Vớt thịt ngâm ngay vào âu nước đá lạnh 5 phút để da giòn thịt trắng.",
      "Thái thịt thành từng lát mỏng đều tay bày ra đĩa cùng rau thơm.",
      "Đánh bông mắm tôm với đường, quất, ớt tươi, chấm kèm cà pháo giòn rụm."
    ],
    tags: ["Gia đình", "Món luộc", "Dân dã", "Bữa trưa"],
    englishKeyword: "boiled-pork-belly",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80"
  },

  // =========================================================
  // 2. MÓN SÁNG / ĂN NHANH (category: "breakfast")
  // =========================================================
  {
    title: "Phở bò tái nạm Hà Nội",
    description: "Tô phở nước dùng trong veo thơm mùi hoa hồi thảo quả, bánh phở mềm mướt quyện thịt bò tươi ngọt đậm đà danh bất hư truyền.",
    cookTime: 45,
    servings: 2,
    calories: 480,
    category: "breakfast",
    ingredients: [
      { name: "Bánh phở tươi", quantity: 400, unit: "g" },
      { name: "Thịt bò thăn", quantity: 200, unit: "g" },
      { name: "Bắp bò hoa", quantity: 150, unit: "g" }
    ],
    steps: [
      "Ninh xương bò cùng gừng hành nướng cháy vỏ và hoa hồi thảo quả lấy nước dùng trong veo.",
      "Thái mỏng thịt bò tái đập dập nhẹ; nạm bò chín thái lát mỏng.",
      "Trụng bánh phở qua nước sôi, xếp vào tô lớn.",
      "Bày thịt tái, nạm bò, hành hoa chẻ và ngò gai lên bề mặt phở.",
      "Chan nước dùng sôi sùng sục làm chín thịt bò, ăn kèm chanh ớt và quẩy nóng."
    ],
    tags: ["Ăn sáng", "Phở", "Đặc sản Hà Nội", "Năng lượng"],
    englishKeyword: "vietnamese-beef-pho",
    imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Bún chả que tre Hà Nội",
    description: "Chả miếng và chả viên nướng xém cạnh thơm phức ngập trong bát nước mắm đu đủ chua ngọt, ăn kèm bún lá và rau thơm tươi non.",
    cookTime: 35,
    servings: 2,
    calories: 580,
    category: "breakfast",
    ingredients: [
      { name: "Bún tươi", quantity: 500, unit: "g" },
      { name: "Thịt ba chỉ", quantity: 250, unit: "g" },
      { name: "Thịt nạc vai xay", quantity: 250, unit: "g" }
    ],
    steps: [
      "Thịt ba chỉ thái lát mỏng; thịt nạc vai xay viên tròn dẹt.",
      "Ướp thịt với hành khô băm, nước hàng đường thắng, nước mắm, tiêu trong 30 phút.",
      "Kẹp thịt nướng than hoa hoặc nồi chiên không dầu ở 180°C cho xém vàng thơm nức.",
      "Pha nước chấm ấm vị chua ngọt dịu, thả đu đủ cà rốt giòn.",
      "Thả chả nóng vào bát nước chấm, dùng kèm đĩa bún tươi và rau sống."
    ],
    tags: ["Ăn sáng", "Bún chả", "Đặc sản", "Bữa trưa"],
    englishKeyword: "bun-cha-vietnam",
    imageUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Bánh mì kẹp xá xíu pate trứng",
    description: "Ổ bánh mì giòn tan ngập tràn patê béo ngậy, thịt xá xíu thơm lừng, trứng ốp la lòng đào và dưa góp thanh mát tuyệt hảo.",
    cookTime: 15,
    servings: 2,
    calories: 460,
    category: "breakfast",
    ingredients: [
      { name: "Bánh mì giòn", quantity: 2, unit: "ổ" },
      { name: "Trứng gà tươi", quantity: 2, unit: "quả" },
      { name: "Thịt ba chỉ", quantity: 150, unit: "g" }
    ],
    steps: [
      "Nướng nóng giòn vỏ bánh mì trong chảo hoặc lò nướng 2 phút.",
      "Rạch dọc thân bánh, phết đều một lớp patê và sốt bơ mayonnaise thơm lừng.",
      "Xếp thịt xá xíu thái lát mỏng và trứng ốp la lòng đào vào trong bánh.",
      "Thêm dưa leo thái lát, đồ chua cà rốt và vài cọng ngò rí tươi.",
      "Rưới chút sốt tương ớt đậm đà, kẹp lại thưởng thức ngay khi vỏ còn giòn tan."
    ],
    tags: ["Ăn sáng", "Bánh mì", "Tiện lợi", "Nhanh gọn"],
    englishKeyword: "vietnamese-banh-mi",
    imageUrl: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Cơm tấm sườn bì chả Sài Gòn",
    description: "Hạt tấm dẻo thơm, sườn cốt lết nướng mật ong sả tỏi đậm đà, bì giòn bùi thính gạo và chả trứng hấp vàng óng mỡ hành thơm phức.",
    cookTime: 40,
    servings: 2,
    calories: 680,
    category: "breakfast",
    ingredients: [
      { name: "Gạo tấm thơm", quantity: 300, unit: "g" },
      { name: "Thịt ba chỉ", quantity: 300, unit: "g" },
      { name: "Trứng gà tươi", quantity: 2, unit: "quả" }
    ],
    steps: [
      "Nấu cơm tấm chín dẻo bằng xửng hấp hoặc nồi cơm điện.",
      "Sườn cốt lết ướp sả tỏi băm, mật ong, dầu hào, nước tương rồi nướng vàng đều 2 mặt.",
      "Hấp chín chả trứng thịt mộc nhĩ, quét lòng đỏ trứng lên mặt cho vàng óng.",
      "Xới cơm tấm ra đĩa, xếp sườn nướng, bì thính và lát chả trứng.",
      "Rưới mỡ hành bóng bẩy lên trên, ăn kèm dưa leo, cà chua và nước mắm kẹo ớt băm."
    ],
    tags: ["Ăn sáng", "Cơm tấm", "Đặc sản Sài Gòn", "Bữa trưa"],
    englishKeyword: "broken-rice-pork-chop",
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Bún bò Huế giò heo bắp hoa",
    description: "Nước dùng cay nồng thơm lừng hương sả và mắm ruốc Huế đặc trưng, sợi bún to dai quyện bắp bò hoa giòn ngọt và móng giò béo mềm.",
    cookTime: 50,
    servings: 2,
    calories: 610,
    category: "breakfast",
    ingredients: [
      { name: "Bún tươi", quantity: 400, unit: "g" },
      { name: "Bắp bò hoa", quantity: 200, unit: "g" },
      { name: "Móng giò heo", quantity: 250, unit: "g" },
      { name: "Mắm ruốc Huế", quantity: 20, unit: "g" }
    ],
    steps: [
      "Hầm xương ống và giò heo với sả đập dập lấy nước ngọt thanh trong 40 phút.",
      "Hòa mắm ruốc với nước lạnh lọc lấy nước trong cho vào nồi nước dùng dậy mùi thơm.",
      "Bắp bò cuộn tròn luộc chín tới, vớt ra ngâm đá rồi thái lát mỏng to bản.",
      "Phi màu điều với sa tế tạo màu đỏ cam lóng lánh thơm cay rưới vào nước lèo.",
      "Trụng bún sợi to vào tô, xếp thịt bắp bò, giò heo, chan nước lèo cay nồng kèm hoa chuối bào."
    ],
    tags: ["Ăn sáng", "Bún bò Huế", "Đậm đà", "Cay nồng"],
    englishKeyword: "spicy-beef-noodle-soup",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Bánh cuốn nóng nhân thịt mộc nhĩ",
    description: "Lớp bánh mỏng mềm mướt cuộn nhân thịt nạc băm xào mộc nhĩ nấm hương thơm nức, rắc ngập hành phi giòn tan chấm mắm chua ngọt ấm dịu.",
    cookTime: 25,
    servings: 2,
    calories: 410,
    category: "breakfast",
    ingredients: [
      { name: "Bột bánh cuốn", quantity: 200, unit: "g" },
      { name: "Thịt nạc vai xay", quantity: 150, unit: "g" },
      { name: "Nấm hương mộc nhĩ", quantity: 30, unit: "g" }
    ],
    steps: [
      "Xào thịt nạc băm với mộc nhĩ nấm hương băm nhỏ, nêm hạt nêm và tiêu thơm lừng làm nhân.",
      "Tráng lớp bột mỏng trên chảo chống dính đậy nắp 45 giây cho bánh chín trong.",
      "Trút bánh ra đĩa thoa dầu, múc nhân thịt vào giữa cuộn tròn đều tay.",
      "Cắt bánh thành khúc vừa ăn, xếp chả lụa thái lát xung quanh.",
      "Rắc thật nhiều hành phi vàng giòn lên trên, chấm cùng nước mắm chua ngọt ấm dịu."
    ],
    tags: ["Ăn sáng", "Bánh cuốn", "Thanh nhẹ", "Truyền thống"],
    englishKeyword: "steamed-rice-rolls",
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Xôi xéo gà nấm mỡ hành",
    description: "Hạt nếp vàng óng dẻo quánh, từng lát đậu xanh bùi béo mỏng tang tan trong miệng quyện cùng thịt gà xé xào nấm và mỡ hành ngậy thơm.",
    cookTime: 35,
    servings: 2,
    calories: 590,
    category: "breakfast",
    ingredients: [
      { name: "Gạo nếp cái hoa vàng", quantity: 300, unit: "g" },
      { name: "Đậu xanh xát vỏ", quantity: 100, unit: "g" },
      { name: "Thịt gà ta", quantity: 150, unit: "g" }
    ],
    steps: [
      "Gạo nếp ngâm nước nghệ cho vàng óng, đồ xôi hai lửa cho hạt nếp căng bóng dẻo quánh.",
      "Đậu xanh đồ chín mềm, giã nhuyễn nắm thành quả tròn đặc khi còn nóng.",
      "Thịt gà xé xào cùng nấm hương thơm lừng với chút nước mắm tiêu.",
      "Xới xôi vàng ra đĩa, dùng dao gọt từng lát đậu xanh mỏng phủ kín mặt xôi.",
      "Thêm gà nấm xào, rưới một muỗng mỡ gà thơm ngậy và rắc đầy hành phi giòn tan."
    ],
    tags: ["Ăn sáng", "Xôi xéo", "Dẻo thơm", "Ấm bụng"],
    englishKeyword: "sticky-rice-chicken",
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Cháo sườn sụn quẩy giòn ruốc thịt",
    description: "Tô cháo sánh mịn như lụa từ bột gạo tẻ xay, ngọt lịm nước hầm sườn sụn giòn sần sật, ăn cùng quẩy nóng giòn rụm và ruốc bông thơm nức.",
    cookTime: 30,
    servings: 2,
    calories: 420,
    category: "breakfast",
    ingredients: [
      { name: "Sườn non heo", quantity: 250, unit: "g" },
      { name: "Gạo tấm thơm", quantity: 150, unit: "g" }
    ],
    steps: [
      "Sườn sụn chặt miếng nhỏ băm nhỏ, xào sơ với nước mắm cho ngấm đậm đà.",
      "Khuấy đều bột gạo với nước ninh sườn trên lửa nhỏ, đảo đều tay liên tục để cháo mịn mượt.",
      "Khi cháo sánh mượt trong veo, cho sườn sụn vào nấu thêm 10 phút cho sụn giòn sần sật.",
      "Múc cháo nóng hổi ra bát tô trắng tinh khôi.",
      "Cắt quẩy giòn rụm lên trên, thêm ruốc thịt thơm, rắc tiêu bắc thơm nồng và chút ớt bột."
    ],
    tags: ["Ăn sáng", "Cháo sườn", "Mịn màng", "Ấm áp"],
    englishKeyword: "pork-rib-porridge",
    imageUrl: "https://images.unsplash.com/photo-1588767763785-5b437cbb5a4a?w=800&auto=format&fit=crop&q=80"
  },

  // =========================================================
  // 3. EAT CLEAN & HEALTHY (category: "eatclean")
  // =========================================================
  {
    title: "Ức gà áp chảo sốt bơ tỏi & bông cải xanh",
    description: "Thực đơn tăng cơ giảm mỡ kinh điển: Ức gà áp chảo vàng óng mọng nước không hề khô bã, sốt bơ tỏi thơm ngậy kèm bông cải xanh thanh mát.",
    cookTime: 20,
    servings: 1,
    calories: 420,
    category: "eatclean",
    ingredients: [
      { name: "Ức gà fillet", quantity: 250, unit: "g" },
      { name: "Bông cải xanh", quantity: 150, unit: "g" }
    ],
    steps: [
      "Ức gà khía vát nhẹ, ướp muối hồng, tiêu đen, tỏi băm và chút dầu ô-liu trong 10 phút.",
      "Bông cải xanh chần nhanh qua nước sôi có chút muối rồi ngâm nước đá giữ độ giòn xanh.",
      "Áp chảo ức gà mỗi mặt 5 phút trên lửa vừa cho vàng giòn bên ngoài, mọng nước bên trong.",
      "Thêm 1 thìa bơ thực vật nhỏ và tỏi băm vào chảo rưới đều lên miếng gà dậy mùi thơm.",
      "Cắt gà thành lát dày vừa ăn, bày ra đĩa cùng rau củ luộc thanh ngọt tự nhiên."
    ],
    tags: ["Eat Clean", "Ức gà", "Tăng cơ", "Ít calo"],
    englishKeyword: "grilled-chicken-breast",
    imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Salad cá hồi áp chảo sốt mè rang",
    description: "Phi lê cá hồi Nauy da giòn thịt mềm mọng nước kết hợp xà lách tươi giòn, bơ sáp béo bùi và sốt mè rang thơm lừng chuẩn phong cách Healthy.",
    cookTime: 15,
    servings: 1,
    calories: 450,
    category: "eatclean",
    ingredients: [
      { name: "Phi lê cá hồi Nauy", quantity: 180, unit: "g" },
      { name: "Cà chua bi", quantity: 80, unit: "g" }
    ],
    steps: [
      "Cá hồi ướp xíu muối và tiêu xay 5 phút, áp chảo phần da cho giòn rụm trong 3 phút, lật mặt thịt 2 phút.",
      "Rau xà lách rửa sạch vẩy ráo nước cắt khúc vừa ăn; cà chua bi bổ đôi, bơ sáp thái lát mỏng.",
      "Xếp toàn bộ rau củ tươi mát vào âu lớn sâu lòng.",
      "Đặt miếng cá hồi áp chảo vàng óng thơm nức lên chính giữa đĩa salad.",
      "Rưới sốt mè rang mè rang béo bùi lên salad trước khi thưởng thức."
    ],
    tags: ["Eat Clean", "Cá hồi", "Omega 3", "Đẹp da"],
    englishKeyword: "salmon-salad",
    imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Bún gạo lứt xào ức gà nấm đùi gà",
    description: "Sợi bún gạo lứt dai ngon giàu chất xơ hòa quyện với ức gà xào mềm ngọt, nấm đùi gà giòn dai và cải xanh thanh mát không ngấy dầu mỡ.",
    cookTime: 20,
    servings: 1,
    calories: 390,
    category: "eatclean",
    ingredients: [
      { name: "Bún gạo lứt", quantity: 100, unit: "g" },
      { name: "Ức gà fillet", quantity: 120, unit: "g" },
      { name: "Nấm đùi gà", quantity: 80, unit: "g" }
    ],
    steps: [
      "Bún gạo lứt ngâm nước ấm 10 phút rồi luộc 3 phút, vớt ra xả nước lạnh trộn chút dầu mè.",
      "Ức gà thái con chì ướp nước tương và tiêu xay; nấm đùi gà thái lát vừa ăn.",
      "Phi thơm tỏi xào ức gà chín săn, trút nấm đùi gà vào xào lửa lớn 2 phút.",
      "Cho bún gạo lứt vào chảo đảo đều cùng sốt tương tamari cho sợi bún ngấm đều màu nâu óng.",
      "Rắc hành ngò và tiêu xay thơm lừng, dùng nóng cho bữa trưa lành mạnh tràn đầy năng lượng."
    ],
    tags: ["Eat Clean", "Gạo lứt", "Giảm mỡ", "Thuần khiết"],
    englishKeyword: "brown-rice-noodles",
    imageUrl: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Gỏi cuốn tôm thịt chấm sốt tương đậu phộng",
    description: "Món cuốn thanh khiết đẹp mắt với tôm đỏ au, thịt luộc mỏng và rau sống tươi mát qua lớp bánh tráng trong veo, chấm tương bơ lạc thơm bùi.",
    cookTime: 25,
    servings: 2,
    calories: 360,
    category: "eatclean",
    ingredients: [
      { name: "Tôm sú tươi", quantity: 200, unit: "g" },
      { name: "Thịt ba chỉ", quantity: 150, unit: "g" },
      { name: "Bún tươi", quantity: 150, unit: "g" }
    ],
    steps: [
      "Tôm sú luộc chín bóc vỏ chẻ đôi sống lưng; thịt ba chỉ luộc thái lát mỏng.",
      "Làm ẩm bánh tráng bằng khăn ướt sạch, trải lên mặt phẳng đĩa.",
      "Xếp lần lượt xà lách, rau thơm, bún tươi và thịt ba chỉ vào 1/3 mép bánh tráng.",
      "Cuộn chặt một vòng, xếp tôm đỏ au và nhánh hẹ dài thò ra ngoài mép bánh.",
      "Gập hai bên mép cuộn tròn chặt tay, chấm cùng sốt tương bơ đậu phộng ngọt bùi rắc lạc rang."
    ],
    tags: ["Eat Clean", "Gỏi cuốn", "Thanh mát", "Không dầu mỡ"],
    englishKeyword: "fresh-spring-rolls",
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Cháo yến mạch tôm tươi rong biển",
    description: "Bát cháo yến mạch sánh mịn ngọt thanh nước tôm tươi kết hợp rong biển bổ dưỡng giàu i-ốt và canxi, tốt cho hệ tiêu hóa và vóc dáng.",
    cookTime: 15,
    servings: 1,
    calories: 330,
    category: "eatclean",
    ingredients: [
      { name: "Yến mạch cán dẹt", quantity: 60, unit: "g" },
      { name: "Tôm sú tươi", quantity: 120, unit: "g" },
      { name: "Rong biển khô", quantity: 10, unit: "g" }
    ],
    steps: [
      "Tôm bóc vỏ băm nhỏ, ướp chút hạt tiêu và hành tím băm.",
      "Rong biển ngâm nở mềm trong nước lạnh 5 phút rồi cắt nhỏ.",
      "Đun sôi 350ml nước lọc, cho tôm vào nấu chín ngọt nước.",
      "Trút yến mạch cán dẹt vào khuấy đều trên lửa nhỏ 5 phút đến khi sánh mịn.",
      "Thả rong biển vào nấu thêm 1 phút, rưới vài giọt dầu mè thơm lừng rồi tắt bếp múc ra tô."
    ],
    tags: ["Eat Clean", "Yến mạch", "Giàu canxi", "Dễ tiêu"],
    englishKeyword: "oatmeal-shrimp-porridge",
    imageUrl: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Đậu hũ non sốt cà chua nấm đông cô",
    description: "Món ăn thuần chay thanh tịnh với đậu hũ non béo mềm tan trong miệng, quyện cùng sốt cà chua tươi mọng và nấm đông cô thơm sâu lắng.",
    cookTime: 15,
    servings: 2,
    calories: 280,
    category: "eatclean",
    ingredients: [
      { name: "Đậu hũ non", quantity: 2, unit: "hộp" },
      { name: "Nấm đông cô", quantity: 80, unit: "g" }
    ],
    steps: [
      "Đậu hũ non cắt miếng vuông 3cm, trần sơ qua nước ấm rồi xếp ra đĩa sâu lòng.",
      "Nấm đông cô khía chữ thập trên mũ nấm; cà chua băm nhuyễn bỏ hạt.",
      "Phi thơm hành, cho cà chua vào đảo nhuyễn tạo màu đỏ tự nhiên đẹp mắt.",
      "Thêm nấm đông cô, nước tương và chút nước đun sôi sền sệt 5 phút.",
      "Hòa xíu bột bắp cho sốt sánh bóng, rưới đều lên đĩa đậu hũ non thanh mát béo ngậy."
    ],
    tags: ["Eat Clean", "Ăn chay", "Thanh đạm", "Ít calo"],
    englishKeyword: "tofu-tomato-mushroom",
    imageUrl: "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Bò cuộn măng tây nướng sốt tiêu đen",
    description: "Thịt ba chỉ bò Mỹ mềm béo cuộn trọn măng tây xanh giòn ngọt tự nhiên, nướng xém vàng rưới sốt tiêu đen cay nồng thơm quyến rũ.",
    cookTime: 20,
    servings: 2,
    calories: 440,
    category: "eatclean",
    ingredients: [
      { name: "Bò ba chỉ Mỹ", quantity: 300, unit: "g" },
      { name: "Măng tây tươi", quantity: 200, unit: "g" }
    ],
    steps: [
      "Măng tây cắt bỏ gốc già, rửa sạch chần sơ nước sôi 1 phút ngâm đá giữ màu xanh biếc.",
      "Trải từng dải thịt bò mỏng ra đĩa, đặt 2-3 cọng măng tây vào cuộn tròn chặt tay.",
      "Quết một lớp dầu ô-liu mỏng và sốt tiêu đen đậm đà lên các cuộn bò măng tây.",
      "Nướng bằng nồi chiên không dầu ở 190°C trong 8 phút cho thịt bò xém vàng thơm nức.",
      "Bày ra đĩa rắc chút tiêu sọ xay, thưởng thức nóng giòn ngọt thanh ngọt tự nhiên."
    ],
    tags: ["Eat Clean", "Bò cuộn", "Giàu đạm", "Bữa tối"],
    englishKeyword: "beef-wrapped-asparagus",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80"
  },

  // =========================================================
  // 4. BÁNH & MÓN ĂN VẶT / TRÁNG MIỆNG (category: "dessert")
  // =========================================================
  {
    title: "Chè bưởi An Giang cốt dừa béo ngậy",
    description: "Cùi bưởi giòn sần sật trong veo không chút đắng, đỗ xanh bở tơi ngập trong nước đường phèn sánh dẻo thơm ngát tinh dầu bưởi cốt dừa béo.",
    cookTime: 40,
    servings: 4,
    calories: 320,
    category: "dessert",
    ingredients: [
      { name: "Cùi bưởi da xanh", quantity: 200, unit: "g" },
      { name: "Đậu xanh xát vỏ", quantity: 150, unit: "g" },
      { name: "Nước cốt dừa", quantity: 200, unit: "ml" }
    ],
    steps: [
      "Cùi bưởi gọt sạch vỏ xanh xắt hạt lựu, bóp muối xả nước 5 lần khử đắng rồi luộc sơ vắt ráo.",
      "Ướp cùi bưởi với đường rồi áo đều một lớp bột năng dày đem luộc chín trong veo giòn sần sật.",
      "Đậu xanh ngâm nở đồ chín mềm tơi nguyên hạt.",
      "Nấu sôi nước đường phèn, hòa bột năng cho chè sánh trong rồi trút cùi bưởi và đậu xanh vào khuấy nhẹ.",
      "Múc chè ra ly, thêm đá viên, chan nước cốt dừa béo ngậy và vài giọt tinh dầu hoa bưởi ngát hương."
    ],
    tags: ["Tráng miệng", "Chè bưởi", "Ngọt ngào", "Giải nhiệt"],
    englishKeyword: "pomelo-sweet-soup",
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Bánh chuối nướng cốt dừa kiểu Nam Bộ",
    description: "Bánh chuối nướng đỏ rượu vang thơm nức mùi nước cốt dừa và bơ lạt, dẻo mềm béo ngậy chuẩn vị tráng miệng nức tiếng miền Tây.",
    cookTime: 45,
    servings: 4,
    calories: 350,
    category: "dessert",
    ingredients: [
      { name: "Chuối sứ chín", quantity: 6, unit: "quả" },
      { name: "Nước cốt dừa", quantity: 250, unit: "ml" },
      { name: "Bánh mì giòn", quantity: 3, unit: "ổ" }
    ],
    steps: [
      "Chuối sứ thái lát mỏng ướp 2 thìa đường và chút rượu rum cho lên màu đỏ vang.",
      "Bánh mì xé nhỏ trộn cùng nước cốt dừa, sữa đặc, bơ tan chảy và 2/3 phần chuối dầm nhuyễn.",
      "Thoa bơ chống dính khuôn bánh, trút hỗn hợp bột chuối bánh mì vào dàn phẳng mặt.",
      "Xếp các lát chuối còn lại lên bề mặt bánh thành hình hoa đẹp mắt.",
      "Nướng ở 175°C trong 45 phút đến khi mặt bánh chín vàng nâu thơm phức mùi dừa chuối."
    ],
    tags: ["Tráng miệng", "Bánh chuối", "Béo ngậy", "Miền Nam"],
    englishKeyword: "banana-cake",
    imageUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Trà sữa Thái xanh thạch phô mai",
    description: "Vị trà Thái xanh chát nhẹ thơm nồng hòa quyện cùng sữa tươi béo ngọt, nhấn nhá những viên thạch phô mai giòn ngậy mát rượi.",
    cookTime: 20,
    servings: 2,
    calories: 290,
    category: "dessert",
    ingredients: [
      { name: "Sữa tươi không đường", quantity: 200, unit: "ml" },
      { name: "Sữa đặc", quantity: 80, unit: "ml" }
    ],
    steps: [
      "Hãm trà Thái xanh với 500ml nước sôi 10 phút, lọc bỏ bã lấy nước cốt trà xanh mát.",
      "Cắt phô mai thành viên vuông nhỏ xếp vào khay làm thạch.",
      "Nấu bột rau câu với đường cho trong suốt rồi đổ ngập viên phô mai, để nguội cho thạch đông giòn.",
      "Khuấy đều nước cốt trà với sữa đặc và sữa tươi cho ra màu xanh ngọc bích tuyệt đẹp.",
      "Cho đá viên vào ly, rót trà sữa thơm lừng và thả các viên thạch phô mai béo ngậy lên trên."
    ],
    tags: ["Đồ uống", "Trà sữa", "Mát lạnh", "Ăn vặt"],
    englishKeyword: "thai-green-tea",
    imageUrl: "https://images.unsplash.com/photo-1558857563-b37d1a580665?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Tào phớ hoa nhài nước đường gừng",
    description: "Lát tào phớ trắng muốt mềm mượt tan trên đầu lưỡi, ngập trong nước đường hoa mai ấm nồng vị gừng thơm ngát hương hoa nhài thanh khiết.",
    cookTime: 25,
    servings: 3,
    calories: 210,
    category: "dessert",
    ingredients: [
      { name: "Đậu nành hạt", quantity: 250, unit: "g" },
      { name: "Gừng tươi", quantity: 25, unit: "g" }
    ],
    steps: [
      "Đậu nành xay mịn vắt lấy nước cốt sữa đậu nành đặc, đun sôi nhỏ lửa hớt bọt kỹ.",
      "Hòa đường nho với 1 thìa nước lạnh tráng quanh đáy âu, đổ dứt khoát sữa đậu nành nóng vào ủ 30 phút thành tào phớ mịn màng.",
      "Nấu đường hoa mai với nước lọc và gừng thái sợi cho sánh thơm mùi mật mía.",
      "Thả hoa nhài tươi vào nước đường gừng khi vừa tắt bếp để giữ trọn vẹn hương thơm thanh khiết.",
      "Dùng muôi mỏng hớt từng lát tào phớ mềm mượt như lụa ra bát, chan nước đường gừng hoa nhài thơm ngát."
    ],
    tags: ["Tráng miệng", "Tào phớ", "Thanh mát", "Hà Nội"],
    englishKeyword: "tofu-pudding-ginger-syrup",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Bánh flan caramel trứng sữa mịn màng",
    description: "Bánh flan núng nính mềm mịn không rỗ mặt, thơm nức mùi trứng sữa tươi hòa cùng lớp caramel màu hổ phách đắng ngọt quyến rũ.",
    cookTime: 35,
    servings: 4,
    calories: 260,
    category: "dessert",
    ingredients: [
      { name: "Trứng gà tươi", quantity: 5, unit: "quả" },
      { name: "Sữa tươi không đường", quantity: 400, unit: "ml" },
      { name: "Sữa đặc", quantity: 120, unit: "ml" }
    ],
    steps: [
      "Thắng đường với chút nước đến khi chuyển màu cánh gián hổ phách, tráng đều một lớp mỏng đáy hũ flan.",
      "Đun ấm sữa tươi cùng sữa đặc khuấy tan (không để sôi).",
      "Đánh tan trứng nhẹ tay không tạo bọt khí, từ từ rót sữa ấm vào khuấy đều rồi lọc qua rây 2 lần cho mịn lụa.",
      "Rót hỗn hợp trứng sữa vào hũ caramel, đậy nắp hoặc bọc giấy bạc.",
      "Hấp cách thủy trên lửa nhỏ nhất trong 30 phút đến khi bánh đông mịn màng, làm lạnh trước khi thưởng thức cùng cà phê đá."
    ],
    tags: ["Tráng miệng", "Bánh flan", "Béo ngậy", "Mềm mịn"],
    englishKeyword: "creme-caramel-flan",
    imageUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Chè hạt sen long nhãn thanh mát",
    description: "Món tráng miệng cung đình quý phái: Hạt sen bở bùi lồng khéo léo trong cùi long nhãn giòn ngọt, chan nước đường phèn thơm thoang thoảng hoa bưởi.",
    cookTime: 30,
    servings: 3,
    calories: 230,
    category: "dessert",
    ingredients: [
      { name: "Hạt sen tươi", quantity: 200, unit: "g" },
      { name: "Long nhãn Hưng Yên", quantity: 150, unit: "g" }
    ],
    steps: [
      "Hạt sen thông tâm, rửa sạch hấp chín tới cho bở tơi nguyên hạt không bị nát.",
      "Lồng từng hạt sen chín bùi vào trong cùi quả long nhãn giòn ngọt óng ả.",
      "Đun sôi nước với đường phèn đến khi tan hoàn toàn nước trong veo thanh dịu.",
      "Thả sen lồng nhãn vào nồi nước đường đun sôi lăn tăn 3 phút cho ngấm vị ngọt thanh.",
      "Tắt bếp nhỏ vài giọt tinh dầu hoa bưởi, để nguội thêm đá viên thưởng thức món tráng miệng cung đình quý phái."
    ],
    tags: ["Tráng miệng", "Chè sen", "Thanh mát", "An thần"],
    englishKeyword: "lotus-seed-longan-soup",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80"
  },
  {
    title: "Bánh rán lúc lắc mè đen nhân đậu xanh",
    description: "Vỏ bánh nếp chiên vàng giòn rụm phủ đầy mè thơm phức, bên trong rỗng ruột chứa viên nhân đậu xanh ngọt bùi lúc lắc vui tai.",
    cookTime: 30,
    servings: 4,
    calories: 310,
    category: "dessert",
    ingredients: [
      { name: "Bột nếp", quantity: 250, unit: "g" },
      { name: "Đậu xanh xát vỏ", quantity: 150, unit: "g" }
    ],
    steps: [
      "Bột nếp nhồi với nước ấm và chút đường thành khối bột dẻo mịn không dính tay.",
      "Đậu xanh vo viên tròn làm nhân; chia bột bọc kín viên nhân vo tròn đều.",
      "Lăn bánh qua vừng trắng mè đen cho bám đều quanh vỏ bánh.",
      "Thả bánh vào chảo dầu ấm, chiên lửa nhỏ lăn tròn đều tay đến khi bánh phồng to vỏ giòn rụm vàng ruộm.",
      "Vớt bánh ra giấy thấm dầu, khi lắc nhẹ nghe tiếng viên nhân lúc lắc vui tai bên trong."
    ],
    tags: ["Ăn vặt", "Bánh rán", "Giòn tan", "Tuổi thơ"],
    englishKeyword: "sesame-balls",
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80"
  }
];

/**
 * Hàm lấy ảnh Unsplash tự động theo từ khóa tiếng Anh hoặc fallback API
 */
function getAutoImageUrl(recipe) {
  if (recipe.imageUrl && recipe.imageUrl.startsWith('http')) {
    return recipe.imageUrl;
  }
  const kw = recipe.englishKeyword || 'vietnamese-food';
  return `https://source.unsplash.com/featured/800x600/?vietnamese-food,${encodeURIComponent(kw)}`;
}

/**
 * Thực thi nạp dữ liệu vào Database
 */
async function runSeed() {
  console.log('🚀 [FoodX Seeder] Bắt đầu nạp dữ liệu công thức món ăn...');
  console.log(`📦 Tổng số công thức chuẩn bị nạp: ${RECIPES_DATA.length} món`);

  const sqlPath = path.resolve(__dirname, '../db/recipes_seed.sql');

  // Phương án 1: Nếu có Docker MySQL đang chạy, nạp trực tiếp qua SQL file (nhanh nhất & chính xác nhất)
  if (fs.existsSync(sqlPath)) {
    try {
      console.log('⚡ Đang thực thi nạp dữ liệu vào MySQL container (foodx-mysql)...');
      await new Promise((resolve, reject) => {
        const child = spawn('docker', ['exec', '-i', 'foodx-mysql', 'mysql', '-uroot', '-proot', 'foodx', '--default-character-set=utf8mb4'], {
          stdio: ['pipe', 'inherit', 'inherit']
        });
        fs.createReadStream(sqlPath).pipe(child.stdin);
        child.on('error', reject);
        child.on('close', code => code === 0 ? resolve() : reject(new Error(`Process exited with code ${code}`)));
      });
      console.log('✅ Đã nạp thành công 30 công thức vào database MySQL!');
    } catch (e) {
      console.warn('⚠️ Không thể chạy trực tiếp qua Docker exec, thử gửi qua HTTP API Gateway...', e.message);
      await seedViaApi();
    }
  } else {
    await seedViaApi();
  }

  console.log('\n📊 Phân bổ danh mục công thức:');
  const countByCat = RECIPES_DATA.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});
  Object.entries(countByCat).forEach(([cat, count]) => {
    console.log(`   - [${cat}]: ${count} món`);
  });
  console.log('🎉 Hoàn tất quá trình seed dữ liệu FoodX!\n');
}

/**
 * Phương án 2: Nạp qua REST API Gateway
 */
async function seedViaApi() {
  const gatewayUrl = 'http://localhost:8080/api/recipes';
  console.log(`🌐 Đang gọi REST API: ${gatewayUrl}`);

  let added = 0;
  let skipped = 0;

  for (const recipe of RECIPES_DATA) {
    try {
      const payload = {
        title: recipe.title,
        description: recipe.description,
        instructions: recipe.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n'),
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        cuisine: "Việt Nam",
        category: recipe.category,
        kcal: recipe.calories,
        difficulty: recipe.cookTime <= 20 ? "Dễ" : (recipe.cookTime <= 35 ? "Trung bình" : "Khó"),
        mealSlots: recipe.category === 'breakfast' ? 'morning' : (recipe.category === 'dessert' ? 'snack' : 'lunch,dinner'),
        imageUrl: getAutoImageUrl(recipe),
        ingredients: recipe.ingredients.map(i => ({
          ingredientName: i.name,
          quantity: i.quantity,
          unit: i.unit
        }))
      };

      const res = await fetch(gatewayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        added++;
        console.log(`   + [Thêm mới] ${recipe.title}`);
      } else {
        skipped++;
        console.log(`   ~ [Bỏ qua/Trùng] ${recipe.title}`);
      }
    } catch (err) {
      console.warn(`   x [Lỗi API] ${recipe.title}:`, err.message);
    }
  }

  console.log(`\n✅ Kết quả API: Đã thêm ${added} món, bỏ qua ${skipped} món.`);
}

if (require.main === module) {
  runSeed();
}

module.exports = { RECIPES_DATA, runSeed, getAutoImageUrl };
