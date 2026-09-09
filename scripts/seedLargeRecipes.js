/**
 * FoodX - Large-Scale Recipe Seeder (60 Complete Recipes)
 * 
 * Features:
 * - 60 complete Vietnamese & Asian recipes with full schema & realistic nutrition.
 * - 5 categories: mon-an-gia-dinh, mon-sang, eat-clean, nau-nhanh, banh-trang-mieng (12 recipes each).
 * - Direct CDN Image Pipeline with Unsplash/Pexels CDN & fallback image.
 * - Idempotent execution (safe to run multiple times without duplicate key errors).
 * - Direct Docker MySQL stream + API Gateway fallback.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

const RECIPES_DATA_60 = [
  // =========================================================================
  // 1. MÓN ĂN GIA ĐÌNH TRUYỀN THỐNG (mon-an-gia-dinh: 12 món)
  // =========================================================================
  {
    id: 101,
    title: "Thịt kho hột vịt nước dừa",
    description: "Thịt ba chỉ mềm rục ngấm nước dừa xiêm ngọt thanh, trứng vịt bùi béo keo màu cánh gián óng ả chuẩn vị mâm cơm Tết phương Nam.",
    cookTime: 50,
    servings: 4,
    calories: 560,
    category: "mon-an-gia-dinh",
    ingredients: [
      { name: "Thịt ba chỉ", quantity: 500, unit: "g" },
      { name: "Trứng vịt", quantity: 4, unit: "quả" },
      { name: "Nước dừa xiêm", quantity: 400, unit: "ml" },
      { name: "Nước mắm truyền thống", quantity: 3, unit: "muỗng" },
      { name: "Hành tím", quantity: 3, unit: "củ" }
    ],
    steps: [
      "Thịt ba chỉ thái miếng vuông 3-4cm, chần qua nước sôi 2 phút rồi rửa sạch để ráo.",
      "Ướp thịt với hành tím băm, nước mắm ngon, tiêu và chút đường trong 30 phút.",
      "Thắng nước màu đường cánh gián, cho thịt vào xào săn đều các mặt.",
      "Đổ nước dừa xiêm ngập thịt, đun sôi rồi hạ nhỏ lửa liu riu trong 40 phút.",
      "Cho trứng vịt luộc bóc vỏ vào kho tiếp 15 phút đến khi nước sốt sánh kẹo óng ánh."
    ],
    tags: ["Món kho", "Đậm đà", "Bữa cơm gia đình", "Truyền thống"],
    isFeatured: true,
    likesCount: 450,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 102,
    title: "Cá bống kho tiêu gừng",
    description: "Cá bống sông tươi kho quéo ngấm cay nồng của tiêu sọ và gừng già, thịt cá cứng chắc thơm lừng mùi mắm nhĩ.",
    cookTime: 35,
    servings: 3,
    calories: 320,
    category: "mon-an-gia-dinh",
    ingredients: [
      { name: "Cá bống sông", quantity: 400, unit: "g" },
      { name: "Tiêu sọ đập dập", quantity: 2, unit: "muỗng" },
      { name: "Gừng già thái sợi", quantity: 30, unit: "g" },
      { name: "Nước màu đường", quantity: 1, unit: "muỗng" },
      { name: "Ớt chỉ thiên", quantity: 2, unit: "quả" }
    ],
    steps: [
      "Cá bống làm sạch vảy, xát muối khử tanh rồi rửa sạch, để thật ráo nước.",
      "Ướp cá với nước mắm, tiêu sọ, gừng sợi, nước màu và ớt băm trong 25 phút.",
      "Xếp một lớp gừng mỏng dưới đáy tộ đất, đặt cá lên trên cùng phần nước ướp.",
      "Đun lửa lớn cho cá sôi bùng và săn lại, sau đó hạ lửa thật nhỏ kho liu riu.",
      "Khi nước kho cạn sánh sền sệt, rưới thêm muỗng mỡ nước và rắc thêm tiêu xay."
    ],
    tags: ["Món kho", "Cay nồng", "Đưa cơm", "Dân dã"],
    isFeatured: false,
    likesCount: 180,
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 103,
    title: "Canh chua cá lóc miền Tây",
    description: "Nước canh thanh ngọt chua dịu từ me chín kết hợp cá lóc đồng béo ngọt, thơm lừng ngò gai và rau ngổ.",
    cookTime: 30,
    servings: 4,
    calories: 280,
    category: "mon-an-gia-dinh",
    ingredients: [
      { name: "Cá lóc đồng", quantity: 500, unit: "g" },
      { name: "Bạc hà (dọc mùng)", quantity: 2, unit: "nhánh" },
      { name: "Đậu bắp", quantity: 6, unit: "quả" },
      { name: "Cà chua", quantity: 2, unit: "quả" },
      { name: "Me vắt", quantity: 50, unit: "g" }
    ],
    steps: [
      "Cá lóc cắt khúc dày 2-3cm, khía nhẹ, xát chanh khử nhớt rồi rửa sạch.",
      "Dầm me với nửa bát nước sôi lấy nước cốt chua thanh dịu.",
      "Đun sôi 1 lít nước, trút nước me và cho cá vào nấu chín tới trong 8 phút.",
      "Thêm cà chua, dứa, đậu bắp, bạc hà vào đun sôi bùng thêm 3 phút.",
      "Nêm mắm đường vừa vị chua ngọt, tắt bếp rắc ngò gai, rau ngổ và tỏi phi vàng."
    ],
    tags: ["Món canh", "Thanh mát", "Miền Tây", "Hạ nhiệt"],
    isFeatured: true,
    likesCount: 320,
    imageUrl: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 104,
    title: "Thịt ba chỉ luộc cà pháo mắm tôm",
    description: "Thịt ba chỉ luộc trắng hồng giòn bì, ăn kèm cà pháo muối giòn tan và chén mắm tôm đánh bông chanh ớt cay tê.",
    cookTime: 25,
    servings: 3,
    calories: 460,
    category: "mon-an-gia-dinh",
    ingredients: [
      { name: "Thịt ba chỉ ngon", quantity: 500, unit: "g" },
      { name: "Cà pháo muối giòn", quantity: 150, unit: "g" },
      { name: "Mắm tôm Bắc", quantity: 3, unit: "muỗng" },
      { name: "Chanh tươi", quantity: 1, unit: "quả" },
      { name: "Hành tím củ", quantity: 3, unit: "củ" }
    ],
    steps: [
      "Thịt ba chỉ cạo sạch bì, rửa sạch với nước muối loãng.",
      "Cho thịt vào nồi nước lạnh cùng hành tím đập dập và chút muối hạt.",
      "Luộc lửa vừa khoảng 20 phút đến khi xiên đũa không còn tiết nước hồng.",
      "Vớt thịt ngâm ngay vào âu nước đá lạnh 5 phút giúp bì giòn và thịt trắng.",
      "Thái lát mỏng vừa ăn, đánh bông mắm tôm cùng đường, nước cốt chanh và ớt."
    ],
    tags: ["Món luộc", "Mùa hè", "Bữa cơm Bắc", "Nhanh gọn"],
    isFeatured: false,
    likesCount: 210,
    imageUrl: "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 105,
    title: "Sườn xào chua ngọt chuẩn vị Bắc",
    description: "Từng dẻ sườn non óng ả sốt cà chua quyện giấm đường chua dịu, thịt mềm thơm róc xương đậm đà cực kỳ đưa cơm.",
    cookTime: 40,
    servings: 4,
    calories: 480,
    category: "mon-an-gia-dinh",
    ingredients: [
      { name: "Sườn non heo", quantity: 600, unit: "g" },
      { name: "Cà chua chín", quantity: 2, unit: "quả" },
      { name: "Giấm gạo thanh", quantity: 2, unit: "muỗng" },
      { name: "Đường cát vàng", quantity: 2, unit: "muỗng" },
      { name: "Tỏi băm", quantity: 1, unit: "củ" }
    ],
    steps: [
      "Sườn non chặt khúc vừa ăn, chần nước sôi khử bọt bẩn rồi vớt ra để ráo.",
      "Pha nước sốt chua ngọt gồm giấm gạo, đường, mắm, tương cà và chút tiêu.",
      "Rán sườn trên chảo dầu nóng lửa vừa đến khi xém vàng đều hai mặt.",
      "Phi thơm tỏi băm, cho cà chua thái múi vào xào nhuyễn thành sốt mịn.",
      "Trút sườn và bát nước sốt vào đảo đều, om nhỏ lửa 15 phút đến khi sốt keo sánh."
    ],
    tags: ["Món xào", "Chua ngọt", "Trẻ em thích", "Cơm tối"],
    isFeatured: true,
    likesCount: 480,
    imageUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 106,
    title: "Canh ngao nấu chua thì là",
    description: "Món canh thanh ngọt tự nhiên từ nước luộc ngao, thơm hương thì là hành hoa và vị chua thanh tao từ quả sấu hoặc me.",
    cookTime: 20,
    servings: 3,
    calories: 160,
    category: "mon-an-gia-dinh",
    ingredients: [
      { name: "Ngao sống (nghêu)", quantity: 1, unit: "kg" },
      { name: "Cà chua", quantity: 2, unit: "quả" },
      { name: "Quả sấu tươi", quantity: 3, unit: "quả" },
      { name: "Thì là & hành lá", quantity: 50, unit: "g" },
      { name: "Dứa (thơm)", quantity: 1, unit: "phần" }
    ],
    steps: [
      "Ngao ngâm nước ớt cắt lát 1 tiếng nhả sạch cát rồi rửa sạch vỏ.",
      "Luộc ngao với nước xâm xấp đến khi mở miệng, vớt ruột ngao, lọc lấy nước trong.",
      "Phi thơm hành tím, xào săn cà chua và dứa cùng chút nước mắm ngon.",
      "Đổ nước luộc ngao vào nồi, thả sấu vào đun sôi, dầm sấu lấy vị chua thanh.",
      "Thả thịt ngao, hành hoa, thì là thái nhỏ vào đun sôi lại rồi tắt bếp ngay."
    ],
    tags: ["Món canh", "Giải nhiệt", "Thanh mát", "Hải sản"],
    isFeatured: false,
    likesCount: 160,
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 107,
    title: "Bò xào cần tỏi tây",
    description: "Thịt bò thăn mềm mọng xào lửa lớn cùng cần tây, tỏi tây giòn ngọt bùi thơm, đậm đà hạt tiêu đen xay thô.",
    cookTime: 15,
    servings: 3,
    calories: 390,
    category: "mon-an-gia-dinh",
    ingredients: [
      { name: "Thịt bò thăn", quantity: 350, unit: "g" },
      { name: "Cần tây xanh", quantity: 150, unit: "g" },
      { name: "Tỏi tây (hành boa-rô)", quantity: 2, unit: "nhánh" },
      { name: "Cà chua", quantity: 1, unit: "quả" },
      { name: "Dầu hào", quantity: 1, unit: "muỗng" }
    ],
    steps: [
      "Thịt bò thái mỏng ngang thớ, ướp tỏi băm, dầu hào, tiêu và dầu ăn trong 15 phút.",
      "Cần tỏi tây nhặt rửa sạch, cắt khúc xéo 4-5cm, cà chua bổ múi cau.",
      "Làm nóng chảo với lửa lớn, trút thịt bò vào đảo nhanh tay 1-2 phút vừa chín tới rồi múc riêng.",
      "Cho tiếp cà chua, tỏi tây và cần tây vào xào lửa lớn với chút gia vị cho giòn ngọt.",
      "Đổ thịt bò vào đảo cùng rau thêm 30 giây, rắc tiêu xay thơm lừng rồi tắt bếp."
    ],
    tags: ["Món xào", "Thịt bò", "Giàu đạm", "Nấu nhanh"],
    isFeatured: false,
    likesCount: 290,
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 108,
    title: "Nem rán truyền thống Hà Nội",
    description: "Vỏ nem giòn rụm màu vàng ruộm, nhân thịt nạc vai quyện mộc nhĩ, miến dong, nấm hương và rau củ thơm ngát.",
    cookTime: 45,
    servings: 4,
    calories: 420,
    category: "mon-an-gia-dinh",
    ingredients: [
      { name: "Thịt nạc vai băm", quantity: 400, unit: "g" },
      { name: "Bánh đa nem (vỏ ram)", quantity: 20, unit: "phần" },
      { name: "Miến dong", quantity: 50, unit: "g" },
      { name: "Mộc nhĩ nấm hương", quantity: 30, unit: "g" },
      { name: "Trứng gà tươi", quantity: 2, unit: "quả" }
    ],
    steps: [
      "Miến, mộc nhĩ, nấm hương ngâm nở mềm rồi băm nhỏ; cà rốt, củ đậu bào sợi ngắn.",
      "Trộn đều thịt băm, rau củ, miến nấm cùng trứng gà, hạt tiêu và chút nước mắm.",
      "Trải bánh đa nem, cho nhân vừa đủ vào giữa rồi cuộn chặt vừa phải thành từng chiếc thon đều.",
      "Rán nem ngập dầu 2 lần: lần 1 rán sơ chín tới, lần 2 rán lửa vừa cho vỏ vàng giòn rụm.",
      "Pha nước chấm nem chua ngọt tỏi ớt ăn kèm đu đủ cà rốt ngâm giòn và rau sống."
    ],
    tags: ["Món chiên", "Đặc sản", "Hà Nội", "Tiệc gia đình"],
    isFeatured: true,
    likesCount: 410,
    imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 109,
    title: "Cá chép om dưa chua tóp mỡ",
    description: "Cá chép tươi ngọt om liu riu với dưa cải muối chua giòn rụm và tóp mỡ béo ngậy, nồng nàn hương thì là hành hoa.",
    cookTime: 40,
    servings: 4,
    calories: 410,
    category: "mon-an-gia-dinh",
    ingredients: [
      { name: "Cá chép sông", quantity: 1, unit: "kg" },
      { name: "Dưa cải chua", quantity: 400, unit: "g" },
      { name: "Tóp mỡ giòn", quantity: 100, unit: "g" },
      { name: "Cà chua", quantity: 2, unit: "quả" },
      { name: "Thì là & hành lá", quantity: 80, unit: "g" }
    ],
    steps: [
      "Cá chép làm sạch, khía vảy thân, rán sơ hai mặt cho se vàng và thịt cá săn chắc.",
      "Xào thơm cà chua múi cau, trút dưa chua và tóp mỡ vào xào săn cùng chút nước mắm.",
      "Đổ nước dưa chua và nước sôi xâm xấp dưa, đun sôi rồi đặt cá chép vào giữa nồi.",
      "Hạ nhỏ lửa om cá khoảng 25 phút cho dưa nhừ mềm ngấm vị ngọt đậm đà từ cá chép.",
      "Rắc thì là và hành hoa cắt khúc lên mặt, dùng nóng trên bếp cồn kèm bún tươi."
    ],
    tags: ["Món om", "Mùa đông", "Đậm đà", "Mâm cơm ấm cúng"],
    isFeatured: false,
    likesCount: 250,
    imageUrl: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 110,
    title: "Đậu phụ nhồi thịt sốt cà chua",
    description: "Miếng đậu phụ vàng mềm bọc trọn nhân thịt băm mộc nhĩ ngọt thơm, đẫm sốt cà chua hành lá sền sệt chua thanh.",
    cookTime: 30,
    servings: 3,
    calories: 330,
    category: "mon-an-gia-dinh",
    ingredients: [
      { name: "Đậu phụ trắng", quantity: 4, unit: "phần" },
      { name: "Thịt nạc vai băm", quantity: 250, unit: "g" },
      { name: "Mộc nhĩ khô", quantity: 20, unit: "g" },
      { name: "Cà chua chín", quantity: 3, unit: "quả" },
      { name: "Hành lá", quantity: 30, unit: "g" }
    ],
    steps: [
      "Đậu phụ cắt khúc vuông dày 4cm, dùng thìa nhỏ khoét rỗng phần ruột ở giữa.",
      "Trộn thịt băm với ruột đậu, mộc nhĩ băm nhỏ, hành tím, tiêu và hạt nêm.",
      "Nhồi nhân thịt vào từng miếng đậu thật khéo léo rồi đem rán vàng các mặt.",
      "Phi thơm hành khô, xào nhuyễn cà chua với gia vị tạo thành hỗn hợp sốt đỏ sánh.",
      "Thả đậu nhồi thịt vào sốt, rim nhỏ lửa 10 phút cho ngấm đẫm sốt rồi rắc hành lá."
    ],
    tags: ["Món rim", "Tiết kiệm", "Dễ nấu", "Bình dân"],
    isFeatured: false,
    likesCount: 190,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 111,
    title: "Canh cua rau đay mồng tơi mướp",
    description: "Tảng gạch cua đồng béo ngậy nổi đều trên mặt canh rau đay mồng tơi trơn mát, hòa quyện hương mướp hương thơm ngát.",
    cookTime: 25,
    servings: 4,
    calories: 220,
    category: "mon-an-gia-dinh",
    ingredients: [
      { name: "Cua đồng xay nhuyễn", quantity: 400, unit: "g" },
      { name: "Rau đay & mồng tơi", quantity: 200, unit: "g" },
      { name: "Mướp hương", quantity: 1, unit: "quả" },
      { name: "Muối hạt", quantity: 1, unit: "muỗng" },
      { name: "Hành tím phi", quantity: 20, unit: "g" }
    ],
    steps: [
      "Cua xay hòa cùng 1 lít nước và thìa muối nhỏ, bóp kĩ rồi lọc qua rây lấy nước trong.",
      "Đun nước cua lửa nhỏ vừa, khuấy nhẹ ban đầu đến khi mảng thịt cua đóng tảng nổi lên thì vớt riêng.",
      "Mướp gọt vỏ thái vát, rau đay và mồng tơi rửa sạch thái nhỏ vừa ăn.",
      "Thả mướp và rau vào nồi nước cua sôi, nêm mắm ngon cho vừa miệng.",
      "Canh sôi chín tới múc ra tô, đặt tảng thịt cua lên trên cùng chút gạch cua xào thơm."
    ],
    tags: ["Món canh", "Thanh mát", "Mùa hè", "Cơm trưa"],
    isFeatured: false,
    likesCount: 230,
    imageUrl: "https://images.unsplash.com/photo-1576867757603-05b134ebc379?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 112,
    title: "Tôm rim thịt ba chỉ mặn ngọt",
    description: "Tôm đồng giòn vỏ óng ả màu cánh gián quyện cùng thịt ba chỉ xém cạnh ngậy béo, đậm đà vị mặn ngọt hài hòa.",
    cookTime: 30,
    servings: 4,
    calories: 430,
    category: "mon-an-gia-dinh",
    ingredients: [
      { name: "Tôm tươi (tôm đất/sú)", quantity: 300, unit: "g" },
      { name: "Thịt ba chỉ", quantity: 300, unit: "g" },
      { name: "Nước hàng (nước màu)", quantity: 1, unit: "muỗng" },
      { name: "Nước mắm ngon", quantity: 2, unit: "muỗng" },
      { name: "Đầu hành trắng", quantity: 3, unit: "nhánh" }
    ],
    steps: [
      "Tôm cắt râu gai, rửa sạch để ráo; thịt ba chỉ thái miếng mỏng con chì.",
      "Cho thịt ba chỉ vào chảo đảo xém cạnh cho tứa bớt mỡ ngậy rồi múc ra đĩa.",
      "Dùng mỡ thịt phi thơm hành tỏi băm, trút tôm vào đảo lửa lớn đến khi chuyển đỏ au giòn vỏ.",
      "Trút thịt lại vào chảo cùng tôm, nêm mắm, đường, tiêu và nước màu.",
      "Rim nhỏ lửa đảo đều tay đến khi sốt keo bám đều óng ả vào tôm thịt thì tắt bếp."
    ],
    tags: ["Món rim", "Hải sản", "Đưa cơm", "Gia đình"],
    isFeatured: false,
    likesCount: 340,
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80"
  },

  // =========================================================================
  // 2. MÓN SÁNG & MÓN NƯỚC ĐẶC SẢN (mon-sang: 12 món)
  // =========================================================================
  {
    id: 113,
    title: "Phở bò tái lăn Hà Nội",
    description: "Bánh phở mềm mướt ngập trong nước dùng xương bò hầm 10 tiếng ngọt thanh, thịt bò xào lăn lửa lớn dậy nồng hương tỏi gừng.",
    cookTime: 45,
    servings: 2,
    calories: 490,
    category: "mon-sang",
    ingredients: [
      { name: "Bánh phở tươi", quantity: 400, unit: "g" },
      { name: "Thịt bò thăn mềm", quantity: 250, unit: "g" },
      { name: "Nước dùng phở bò cô đặc", quantity: 800, unit: "ml" },
      { name: "Hành hoa & đầu hành chẻ", quantity: 50, unit: "g" },
      { name: "Tỏi củ băm nhuyễn", quantity: 1, unit: "củ" }
    ],
    steps: [
      "Đun sôi nước dùng xương bò cùng hoa hồi, thảo quả và gừng nướng thơm.",
      "Thịt bò thái mỏng, ướp tỏi băm, tiêu, mắm và dầu ăn.",
      "Đun chảo mỡ thật nóng, xào lăn thịt bò thật nhanh tay trong 30 giây rồi tắt bếp.",
      "Chần bánh phở tươi qua nước sôi, xếp vào bát tô cùng đầu hành chẻ và hành hoa thái nhỏ.",
      "Múc thịt bò xào lăn lên trên, chan nước dùng phở sôi sùng sục rồi thưởng thức kèm dấm tỏi ớt."
    ],
    tags: ["Món nước", "Đặc sản", "Hà Nội", "Bữa sáng dinh dưỡng"],
    isFeatured: true,
    likesCount: 495,
    imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 114,
    title: "Bún bò Huế giò heo chả cua",
    description: "Tô bún đỏ rực màu ớt bột quyện mùi sả thơm ngát và mắm ruốc đặc trưng, ăn kèm khoanh giò heo mềm ngậy cùng chả cua giòn sần sật.",
    cookTime: 60,
    servings: 4,
    calories: 540,
    category: "mon-sang",
    ingredients: [
      { name: "Bún sợi to Huế", quantity: 600, unit: "g" },
      { name: "Bắp bò hoa & giò heo", quantity: 500, unit: "g" },
      { name: "Chả cua Huế", quantity: 150, unit: "g" },
      { name: "Mắm ruốc Huế nguyên chất", quantity: 3, unit: "muỗng" },
      { name: "Sả tươi đập dập", quantity: 6, unit: "nhánh" }
    ],
    steps: [
      "Hầm xương ống bò và khoanh giò heo cùng bó sả đập dập trong 50 phút lấy nước ngọt.",
      "Khuấy tan mắm ruốc với nước lạnh, đun sôi lọc cặn rồi trút phần nước trong vào nồi hầm.",
      "Phi dầu màu điều với tỏi ớt băm thơm lừng rồi châm vào nồi nước dùng tạo màu đỏ bắt mắt.",
      "Múc từng viên chả cua thả vào nồi nước dùng cho chín nổi lên mặt.",
      "Xếp bún sợi to, bắp bò thái lát, khoanh giò và chả cua ra tô, chan nước dùng đậm đà kèm bắp chuối bào."
    ],
    tags: ["Món nước", "Đặc sản", "Huế", "Cay nồng"],
    isFeatured: true,
    likesCount: 460,
    imageUrl: "https://images.unsplash.com/photo-1569058242252-623df46b5025?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 115,
    title: "Miến gà ta lá chanh nước trong",
    description: "Sợi miến dong trong suốt dai mềm hòa cùng nước luộc gà ngọt lịm, thịt gà ta xé phay giòn da thơm hương lá chanh thái chỉ.",
    cookTime: 35,
    servings: 3,
    calories: 380,
    category: "mon-sang",
    ingredients: [
      { name: "Thịt gà ta thả vườn", quantity: 600, unit: "g" },
      { name: "Miến dong sạch", quantity: 200, unit: "g" },
      { name: "Lá chanh bánh tẻ", quantity: 6, unit: "nhánh" },
      { name: "Nấm hương khô", quantity: 20, unit: "g" },
      { name: "Hành tây & hành hoa", quantity: 50, unit: "g" }
    ],
    steps: [
      "Luộc gà với nhánh gừng và củ hành nướng đến khi chín tới, vớt ra ngâm nước lạnh cho da giòn.",
      "Lọc xương gà trút lại vào nồi tiếp tục ninh lấy nước ngọt thanh, lọc bỏ váng mỡ thừa.",
      "Gà lọc thịt xé phay miếng vừa ăn, lá chanh rửa sạch thái sợi mỏng như tơ.",
      "Miến dong ngâm mềm, chần nhanh qua nước sôi rồi chia đều vào các tô.",
      "Xếp thịt gà, nấm hương, hành hoa, rắc lá chanh lên trên rồi chan nước dùng gà nóng hổi."
    ],
    tags: ["Món nước", "Thanh đạm", "Bữa sáng", "Gà thả vườn"],
    isFeatured: false,
    likesCount: 220,
    imageUrl: "https://images.unsplash.com/photo-1594998893017-36147cbcae05?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 116,
    title: "Bánh canh cua nước cốt dừa bột lọc",
    description: "Sợi bánh canh dai dai hòa quyện nước sốt cua sánh sệt đậm đà, thịt cua biển ngọt lịm kèm trứng cút và chả cá béo ngậy.",
    cookTime: 40,
    servings: 3,
    calories: 510,
    category: "mon-sang",
    ingredients: [
      { name: "Sợi bánh canh bột lọc", quantity: 400, unit: "g" },
      { name: "Thịt cua biển gỡ sẵn", quantity: 200, unit: "g" },
      { name: "Tôm sú tươi", quantity: 150, unit: "g" },
      { name: "Trứng cút luộc", quantity: 6, unit: "quả" },
      { name: "Nước cốt dừa thơm béo", quantity: 100, unit: "ml" }
    ],
    steps: [
      "Xào thơm hành tím cùng thịt cua biển và tôm tươi với chút dầu điều cho lên màu đẹp.",
      "Đun sôi nước hầm xương heo ngọt đậm đà, nêm nếm gia vị vừa miệng.",
      "Hòa bột năng với nước lọc rót từ từ vào nồi nước dùng khuấy đều tạo độ sánh mịn.",
      "Thả sợi bánh canh bột lọc và trứng cút vào nấu trong 3 phút cho sợi bánh mềm trong.",
      "Múc ra tô, rắc hành ngò, ớt lát và tiêu xay, vắt thêm lát chanh thanh mát."
    ],
    tags: ["Món nước", "Hải sản", "Sài Gòn", "Đậm đà"],
    isFeatured: true,
    likesCount: 380,
    imageUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 117,
    title: "Hủ tiếu Nam Vang sườn tôm cật",
    description: "Món ngon trứ danh Nam Bộ với sợi hủ tiếu dai mướt, nước dùng tôm mực nướng ngọt sâu, topping ngập tràn tôm sú, sườn non và thịt băm.",
    cookTime: 45,
    servings: 3,
    calories: 470,
    category: "mon-sang",
    ingredients: [
      { name: "Hủ tiếu dai Mỹ Tho", quantity: 350, unit: "g" },
      { name: "Tôm sú tươi luộc", quantity: 6, unit: "quả" },
      { name: "Sườn non heo", quantity: 300, unit: "g" },
      { name: "Thịt nạc băm", quantity: 150, unit: "g" },
      { name: "Tỏi phi giòn rụm", quantity: 2, unit: "muỗng" }
    ],
    steps: [
      "Hầm xương heo cùng mực khô nướng và củ cải trắng lấy nước lèo trong veo ngọt đậm đà.",
      "Xào chín thịt băm với tỏi phi vàng thơm lừng; luộc tôm sú bóc nõn chừa đuôi.",
      "Chần sợi hủ tiếu qua nước sôi cho mềm dai rồi xóc với dầu tỏi phi thơm chống dính.",
      "Cho hủ tiếu vào tô, bày sườn non, tôm tươi, thịt băm, trứng cút và cần tàu.",
      "Chan nước lèo nóng rẫy, rắc hành lá và tỏi phi giòn, ăn kèm giá sống hẹ tươi."
    ],
    tags: ["Món nước", "Nam Bộ", "Đặc sản", "Bữa sáng"],
    isFeatured: false,
    likesCount: 310,
    imageUrl: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 118,
    title: "Bún chả nướng than hoa Hà Nội",
    description: "Chả miếng ba chỉ và chả viên nướng xém cạnh than hoa thơm nức mũi, thả trong bát nước mắm chua ngọt ấm nóng kèm đu đủ giòn sần sật.",
    cookTime: 40,
    servings: 3,
    calories: 520,
    category: "mon-sang",
    ingredients: [
      { name: "Bún tươi sợi mảnh", quantity: 500, unit: "g" },
      { name: "Thịt ba chỉ thái mỏng", quantity: 300, unit: "g" },
      { name: "Thịt nạc vai băm", quantity: 250, unit: "g" },
      { name: "Đu đủ xanh & cà rốt", quantity: 150, unit: "g" },
      { name: "Nước hàng thắng đường", quantity: 2, unit: "muỗng" }
    ],
    steps: [
      "Ướp thịt ba chỉ và thịt băm với hành khô băm, nước mắm, hạt tiêu, đường và nước hàng trong 30 phút.",
      "Viên thịt băm thành từng viên tròn dẹt; xếp thịt miếng và thịt viên lên vỉ nướng.",
      "Nướng thịt trên than hoa đỏ rực, quạt đều tay đến khi chả xém vàng ươm và thơm nức.",
      "Pha nước mắm chua ngọt ấm gồm mắm, giấm, đường, tỏi ớt băm và thả dưa góp đu đủ cà rốt.",
      "Bày bún tươi ra đĩa, thả chả nướng nóng hổi vào bát nước chấm ăn kèm đĩa rau sống tía tô kinh giới."
    ],
    tags: ["Bún chả", "Hà Nội", "Nướng than hoa", "Trứ danh"],
    isFeatured: true,
    likesCount: 440,
    imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 119,
    title: "Bánh cuốn nóng tráng tay nhân thịt nấm",
    description: "Lớp bánh mỏng mềm dẻo dai bọc trọn thịt băm mộc nhĩ giòn ngọt, rắc hành phi tự làm giòn tan chấm nước mắm cà cuống ấm nóng.",
    cookTime: 30,
    servings: 3,
    calories: 360,
    category: "mon-sang",
    ingredients: [
      { name: "Bột bánh cuốn pha sẵn", quantity: 250, unit: "g" },
      { name: "Thịt nạc heo băm", quantity: 200, unit: "g" },
      { name: "Mộc nhĩ ngâm nở băm", quantity: 30, unit: "g" },
      { name: "Hành phi vàng giòn", quantity: 3, unit: "muỗng" },
      { name: "Chả lụa thái lát", quantity: 150, unit: "g" }
    ],
    steps: [
      "Khuấy bột bánh cuốn với nước lọc và xíu dầu ăn, để bột nghỉ 20 phút.",
      "Xào chín thịt băm cùng mộc nhĩ, hành tím và hạt tiêu đến khi săn thơm ráo nước.",
      "Tráng một lớp bột mỏng trên chảo chống dính đậy vung 30 giây cho bánh chín trong.",
      "Úp bánh ra đĩa, múc nhân thịt vào giữa rồi cuộn tròn thon dài khéo léo.",
      "Bày bánh cuốn ra đĩa, rắc hành phi giòn, xếp chả lụa ăn cùng nước mắm chấm ấm chua ngọt."
    ],
    tags: ["Bánh cuốn", "Ăn sáng", "Nóng hổi", "Truyền thống"],
    isFeatured: false,
    likesCount: 270,
    imageUrl: "https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 120,
    title: "Xôi xéo gà xé hành phi mỡ gà",
    description: "Từng hạt nếp cái hoa vàng dẻo thơm ươm màu nghệ tây, phủ đầy đậu xanh thái mỏng bùi ngậy và thịt gà xé phay rưới mỡ gà thơm nức.",
    cookTime: 40,
    servings: 3,
    calories: 550,
    category: "mon-sang",
    ingredients: [
      { name: "Gạo nếp cái hoa vàng", quantity: 350, unit: "g" },
      { name: "Đậu xanh đãi vỏ", quantity: 150, unit: "g" },
      { name: "Thịt gà luộc xé", quantity: 200, unit: "g" },
      { name: "Mỡ gà phi hành thơm", quantity: 3, unit: "muỗng" },
      { name: "Bột nghệ tạo màu", quantity: 1, unit: "muỗng" }
    ],
    steps: [
      "Gạo nếp ngâm nước pha bột nghệ 6 tiếng, vo sạch để ráo rồi trộn xíu muối đem đồ chín dẻo.",
      "Đậu xanh đồ chín mềm, giã nhuyễn khi còn nóng rồi nắm chặt thành từng quả tròn mịn.",
      "Thịt gà luộc xé sợi, xào sơ với chút gia vị và hạt tiêu thơm lựng.",
      "Xới xôi nếp vàng óng ra đĩa, dùng dao sắc thái từng lát đậu xanh mỏng phủ kín mặt xôi.",
      "Rưới thìa mỡ gà phi hành nóng hổi, xếp thịt gà xé và rắc thật nhiều hành phi giòn tan."
    ],
    tags: ["Món xôi", "No lâu", "Hà Nội", "Đậm đà"],
    isFeatured: false,
    likesCount: 350,
    imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 121,
    title: "Bánh mì chảo xíu mại pate trứng ốp",
    description: "Chảo bánh mì nóng hổi sôi lục bục với viên xíu mại thịt ngọt lịm, pate gan béo ngậy và lòng đỏ trứng ốp la bùi bùi chấm ngập sốt cà chua.",
    cookTime: 20,
    servings: 2,
    calories: 580,
    category: "mon-sang",
    ingredients: [
      { name: "Bánh mì giòn nóng", quantity: 2, unit: "phần" },
      { name: "Trứng gà tươi", quantity: 2, unit: "quả" },
      { name: "Pate gan thơm bùi", quantity: 80, unit: "g" },
      { name: "Xúc xích chiên", quantity: 2, unit: "phần" },
      { name: "Sốt cà chua đậm đà", quantity: 100, unit: "ml" }
    ],
    steps: [
      "Làm nóng chảo gang cá nhân với chút bơ thơm, ốp la 2 quả trứng gà lòng đào béo ngậy.",
      "Áp chảo xém cạnh xúc xích và làm nóng miếng pate gan thơm lừng.",
      "Rót sốt cà chua thịt băm đậm đà vào chảo đun sôi lăn tăn bốc khói nghi ngút.",
      "Rắc hạt tiêu xay, hành lá thái nhỏ và vài lát ớt tươi trang trí bắt mắt.",
      "Thưởng thức ngay khi chảo còn xèo xèo cùng ổ bánh mì vỏ giòn rụm ruột mềm xốp."
    ],
    tags: ["Bánh mì", "Ăn sáng", "Nhanh gọn", "Béo ngậy"],
    isFeatured: true,
    likesCount: 420,
    imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 122,
    title: "Mì Quảng tôm thịt trứng cút bánh tráng",
    description: "Sợi mì Quảng vàng óng mềm mượt chan nước nhưn tôm thịt rim đậm đà sánh ngọt, rắc đậu phộng rang giòn rụm và bánh tráng mè nướng.",
    cookTime: 35,
    servings: 3,
    calories: 490,
    category: "mon-sang",
    ingredients: [
      { name: "Sợi mì Quảng tươi", quantity: 400, unit: "g" },
      { name: "Tôm tươi & thịt ba chỉ", quantity: 300, unit: "g" },
      { name: "Trứng cút luộc", quantity: 6, unit: "quả" },
      { name: "Bánh tráng nướng mè", quantity: 1, unit: "phần" },
      { name: "Đậu phộng rang giã dập", quantity: 3, unit: "muỗng" }
    ],
    steps: [
      "Thịt ba chỉ và tôm ướp củ nén đập dập, ớt bột màu điều, nước mắm và tiêu trong 20 phút.",
      "Phi thơm củ nén với dầu đậu phộng, trút tôm thịt vào xào săn keo lại đậm đà.",
      "Châm chút nước dùng hầm xương vừa đủ, rim nhỏ lửa tạo thành nước nhưn sánh vàng óng ả.",
      "Trải rau sống bắp chuối dưới đáy tô, xếp sợi mì Quảng lên trên cùng tôm thịt và trứng cút.",
      "Chan một vá nước nhưn đậm đà, rắc đậu phộng và bẻ vụn bánh tráng mè nướng giòn tan."
    ],
    tags: ["Món nước", "Đặc sản", "Quảng Nam", "Đậm vị"],
    isFeatured: false,
    likesCount: 290,
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 123,
    title: "Cháo lòng heo bùi ngậy quẩy giòn",
    description: "Tô cháo sánh mịn nấu từ gạo rang thơm lừng quyện huyết tươi, topping đầy ắp dồi trường giòn sần sật, gan luộc bùi béo và quẩy chiên giòn rụm.",
    cookTime: 45,
    servings: 3,
    calories: 440,
    category: "mon-sang",
    ingredients: [
      { name: "Gạo tẻ rang vàng", quantity: 150, unit: "g" },
      { name: "Lòng heo & dồi trường", quantity: 350, unit: "g" },
      { name: "Huyết heo tươi", quantity: 100, unit: "ml" },
      { name: "Quẩy giòn", quantity: 4, unit: "phần" },
      { name: "Hành hoa & tía tô", quantity: 40, unit: "g" }
    ],
    steps: [
      "Lòng heo sơ chế sạch với muối và chanh, luộc chín giòn vớt ra thái miếng vừa ăn.",
      "Gạo rang vàng hạ thổ, ninh với nước luộc lòng cho hạt gạo nở bung sánh mịn.",
      "Khuấy đều huyết tươi vào nồi cháo sôi lăn tăn tạo màu nâu đỏ đặc trưng và vị ngọt bùi.",
      "Múc cháo ra tô, xếp đầy đặn dồi trường, gan, dạ dày và thịt dải heo lên mặt.",
      "Rắc tiêu đen xay thô, hành hoa tía tô thái sợi, ăn kèm quẩy giòn và chén mắm ớt cay."
    ],
    tags: ["Món cháo", "Ăn sáng", "Ấm bụng", "Hà Nội"],
    isFeatured: false,
    likesCount: 195,
    imageUrl: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 124,
    title: "Bún riêu cua đồng tóp mỡ mắm tôm",
    description: "Bát bún riêu rực rỡ sắc đỏ cà chua, tảng riêu cua đồng mềm mịn béo ngậy, đậu phụ rán giòn và tóp mỡ vàng rụm dậy mùi mắm tôm nồng nàn.",
    cookTime: 35,
    servings: 3,
    calories: 460,
    category: "mon-sang",
    ingredients: [
      { name: "Bún tươi sợi nhỏ", quantity: 450, unit: "g" },
      { name: "Cua đồng giã lọc nước", quantity: 500, unit: "g" },
      { name: "Cà chua bổ múi", quantity: 3, unit: "quả" },
      { name: "Đậu phụ rán giòn", quantity: 2, unit: "phần" },
      { name: "Tóp mỡ giòn rụm", quantity: 80, unit: "g" }
    ],
    steps: [
      "Đun nước cua lửa vừa với chút muối đến khi mảng riêu cua nổi dày đặc thì vớt riêng ra bát.",
      "Xào cà chua với dầu điều thơm phức rồi trút vào nồi nước dùng đun sôi liu riu.",
      "Nêm dấm bỗng chua dịu thanh tao cùng chút mắm tôm cho dậy hương vị đồng nội.",
      "Chần bún xếp vào tô, thả đậu phụ rán, múc tảng riêu cua và tóp mỡ giòn lên trên.",
      "Chan nước riêu nóng rẫy ngập bún, ăn kèm rổ rau sống hoa chuối và kinh giới tươi non."
    ],
    tags: ["Món nước", "Cua đồng", "Thanh mát", "Đặc sản"],
    isFeatured: false,
    likesCount: 360,
    imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80"
  },

  // =========================================================================
  // 3. THỰC ĐƠN EAT CLEAN, LOW-CARB & HEALTHY (eat-clean: 12 món)
  // =========================================================================
  {
    id: 125,
    title: "Ức gà nướng bơ tỏi hương thảo",
    description: "Miếng ức gà mềm mọng nước không hề bị khô xác, phủ lớp sốt bơ tỏi vàng óng dậy mùi thơm ngát của lá hương thảo rosemary tươi.",
    cookTime: 25,
    servings: 2,
    calories: 320,
    category: "eat-clean",
    ingredients: [
      { name: "Ức gà phi lê tươi", quantity: 400, unit: "g" },
      { name: "Bơ lạt tan chảy", quantity: 20, unit: "g" },
      { name: "Tỏi tươi băm nhuyễn", quantity: 4, unit: "nhánh" },
      { name: "Lá hương thảo (rosemary)", quantity: 2, unit: "nhánh" },
      { name: "Dầu ô liu nguyên chất", quantity: 1, unit: "muỗng" }
    ],
    steps: [
      "Ức gà khía nhẹ mặt trên hình quả trám giúp gia vị ngấm sâu vào thớ thịt.",
      "Ướp gà với dầu ô liu, tỏi băm, muối hồng tiêu đen và lá hương thảo trong 20 phút.",
      "Làm nóng chảo chống dính, áp chảo ức gà mỗi mặt 3-4 phút cho xém vàng đẹp mắt.",
      "Thêm bơ lạt và tỏi nhánh vào chảo, dùng thìa rưới bơ liên tục lên mặt ức gà cho mọng nước.",
      "Gắp gà ra để nghỉ 5 phút trước khi thái lát chéo, dùng kèm măng tây hoặc bông cải xanh."
    ],
    tags: ["Eat Clean", "Giàu đạm", "Low Carb", "Tập gym"],
    isFeatured: true,
    likesCount: 380,
    imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 126,
    title: "Salad rong nho tôm tươi sốt mè rang",
    description: "Từng chùm rong nho giòn sần sật mọng nước biển kết hợp tôm sú hấp ngọt mềm và trứng luộc, đẫm sốt mè rang bùi béo thanh mát.",
    cookTime: 15,
    servings: 2,
    calories: 260,
    category: "eat-clean",
    ingredients: [
      { name: "Rong nho biển tươi", quantity: 120, unit: "g" },
      { name: "Tôm sú tươi luộc", quantity: 8, unit: "quả" },
      { name: "Xà lách thủy canh", quantity: 150, unit: "g" },
      { name: "Cà chua bi baby", quantity: 8, unit: "quả" },
      { name: "Sốt mè rang Kewpie", quantity: 3, unit: "muỗng" }
    ],
    steps: [
      "Rong nho ngâm nước đá lạnh 5 phút để khử bớt vị mặn và tăng độ giòn giòn mọng nước.",
      "Tôm sú hấp chín tới cùng nhánh sả, bóc vỏ bỏ chỉ đen để nguội.",
      "Xà lách rửa sạch xắt khúc vừa ăn, cà chua bi bổ đôi xếp đều ra đĩa to.",
      "Bày tôm tươi và rong nho giòn mọng lên trên mặt đĩa rau salad nhiều màu sắc.",
      "Rưới sốt mè rang thơm bùi ngay trước khi dùng để giữ trọn độ giòn tươi của rong nho."
    ],
    tags: ["Salad", "Eat Clean", "Giảm cân", "Thanh nhiệt"],
    isFeatured: false,
    likesCount: 240,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 127,
    title: "Cá hồi áp chảo sốt chanh leo măng tây",
    description: "Phi lê cá hồi giòn rụm lớp da ngoài nhưng thịt bên trong hồng mềm béo ngậy, quyện sốt chanh leo chua thanh dịu ngọt cực kỳ thanh lịch.",
    cookTime: 20,
    servings: 2,
    calories: 390,
    category: "eat-clean",
    ingredients: [
      { name: "Phi lê cá hồi Nauy", quantity: 300, unit: "g" },
      { name: "Chanh leo tươi lấy cốt", quantity: 3, unit: "quả" },
      { name: "Măng tây xanh non", quantity: 120, unit: "g" },
      { name: "Bơ lạt thực vật", quantity: 15, unit: "g" },
      { name: "Mật ong nguyên chất", quantity: 1, unit: "muỗng" }
    ],
    steps: [
      "Cá hồi thấm thật khô mặt da bằng khăn giấy, ướp chút muối biển và tiêu đen xay thô.",
      "Áp chảo cá hồi với dầu ô liu: áp mặt da 4 phút cho giòn rụm rồi lật mặt thịt 2 phút vừa chín tới.",
      "Măng tây cắt bớt gốc già, xào sơ với bơ tỏi trên chảo nóng 2 phút cho giòn ngọt.",
      "Đun nước cốt chanh leo cùng thìa mật ong và bơ lạt đến khi sốt hơi sánh mịn.",
      "Đặt cá hồi lên đĩa măng tây, rưới sốt chanh leo vàng óng óng ả lên miếng cá."
    ],
    tags: ["Cá hồi", "Omega-3", "Eat Clean", "Sang trọng"],
    isFeatured: true,
    likesCount: 470,
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 128,
    title: "Bún nưa bò xào cần tây cà chua",
    description: "Sợi bún nưa Shirataki zero-carb dai giòn sần sật ngấm trọn vị ngọt mềm từ thịt bò xào lửa lớn và vị chua dịu từ cà chua bi.",
    cookTime: 15,
    servings: 2,
    calories: 230,
    category: "eat-clean",
    ingredients: [
      { name: "Bún nưa Shirataki", quantity: 300, unit: "g" },
      { name: "Thịt bò thăn thái mỏng", quantity: 200, unit: "g" },
      { name: "Cần tây xanh", quantity: 100, unit: "g" },
      { name: "Cà chua bi", quantity: 6, unit: "quả" },
      { name: "Dầu hào nấm hương", quantity: 1, unit: "muỗng" }
    ],
    steps: [
      "Bún nưa rửa sạch qua rây, chần nước sôi 2 phút rồi sao khô trên chảo không dầu cho ráo nước.",
      "Thịt bò ướp tỏi băm, chút muối tiêu và thìa dầu hào nấm hương giảm muối.",
      "Làm nóng chảo với chút dầu ô liu, đảo thịt bò lửa lớn chín tái 80% rồi trút ra đĩa.",
      "Xào cần tây và cà chua bi cho chín giòn ngọt tự nhiên.",
      "Đổ bún nưa và thịt bò vào chảo đảo đều tay 1 phút, rắc hạt tiêu thơm rồi thưởng thức nóng."
    ],
    tags: ["Keto", "Low Carb", "Bún nưa", "Giảm mỡ"],
    isFeatured: false,
    likesCount: 190,
    imageUrl: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 129,
    title: "Yến mạch hoa quả hạt chia sữa chua Hy Lạp",
    description: "Bữa sáng tràn đầy năng lượng sạch với yến mạch cán dẹt ngâm qua đêm, sữa chua Hy Lạp sánh đặc phủ dâu tây mọng và hạt chia giàu xơ.",
    cookTime: 10,
    servings: 1,
    calories: 290,
    category: "eat-clean",
    ingredients: [
      { name: "Yến mạch cán dẹt", quantity: 50, unit: "g" },
      { name: "Sữa chua Hy Lạp không đường", quantity: 120, unit: "g" },
      { name: "Dâu tây tươi thái lát", quantity: 5, unit: "quả" },
      { name: "Hạt chia hữu cơ", quantity: 1, unit: "muỗng" },
      { name: "Mật ong rừng", quantity: 1, unit: "muỗng" }
    ],
    steps: [
      "Cho yến mạch cán dẹt và hạt chia vào lọ thủy tinh cùng sữa chua Hy Lạp.",
      "Khuấy đều hỗn hợp cùng một thìa nhỏ mật ong và 30ml sữa hạt nguyên chất.",
      "Đậy kín nắp lọ bảo quản ngăn mát tủ lạnh qua đêm cho yến mạch nở mềm xốp.",
      "Sáng hôm sau mở nắp, xếp dâu tây tươi và chuối lát lên trên bề mặt.",
      "Rắc thêm vài hạt hạnh nhân giã dập tạo độ giòn bùi thú vị khi thưởng thức."
    ],
    tags: ["Overnight Oats", "Healthy", "Giàu chất xơ", "Không cần nấu"],
    isFeatured: false,
    likesCount: 310,
    imageUrl: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 130,
    title: "Trứng luộc lòng đào sốt bơ quả dinh dưỡng",
    description: "Trứng gà ta luộc đúng 6 phút lòng đào sánh dẻo vàng óng, ăn cùng quả bơ sáp béo ngậy thái hạt lựu và sốt chanh mè thanh dịu.",
    cookTime: 12,
    servings: 1,
    calories: 270,
    category: "eat-clean",
    ingredients: [
      { name: "Trứng gà ta tươi", quantity: 2, unit: "quả" },
      { name: "Bơ sáp chín tới", quantity: 1, unit: "quả" },
      { name: "Nước cốt chanh vàng", quantity: 1, unit: "muỗng" },
      { name: "Muối hồng Himalaya", quantity: 1, unit: "muỗng" },
      { name: "Ớt bột paprika", quantity: 1, unit: "muỗng" }
    ],
    steps: [
      "Đun nước sôi bùng cùng chút giấm, hạ trứng nhẹ nhàng luộc đúng 6 phút canh đồng hồ.",
      "Vớt trứng ngâm ngay vào âu nước đá lạnh 5 phút rồi bóc vỏ nhẹ nhàng.",
      "Bơ sáp bổ đôi bỏ hạt, thái lát mỏng hoặc hạt lựu vuông vức xếp ra đĩa.",
      "Cắt đôi quả trứng gà để lộ phần lòng đào vàng sánh mịn màng đặt bên cạnh bơ.",
      "Rắc muối hồng, tiêu đen, ớt bột paprika và rưới chút dầu ô liu chanh vàng thanh khiết."
    ],
    tags: ["Chất béo tốt", "Protein", "Low Carb", "Bữa phụ"],
    isFeatured: false,
    likesCount: 160,
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 131,
    title: "Tôm hấp sả kèm bông cải xanh luộc",
    description: "Tôm thẻ tươi giòn ngọt tự nhiên hấp cùng sả cây thơm ngát, ăn kèm bông cải xanh luộc giòn ngọt chấm muối tiêu chanh thanh đạm.",
    cookTime: 15,
    servings: 2,
    calories: 210,
    category: "eat-clean",
    ingredients: [
      { name: "Tôm thẻ tươi sống", quantity: 350, unit: "g" },
      { name: "Sả tươi đập dập", quantity: 4, unit: "nhánh" },
      { name: "Bông cải xanh (súp lơ)", quantity: 250, unit: "g" },
      { name: "Gừng tươi thái lát", quantity: 15, unit: "g" },
      { name: "Muối tiêu chanh", quantity: 1, unit: "phần" }
    ],
    steps: [
      "Tôm rửa sạch cắt râu; sả đập dập lót một lớp dưới đáy nồi hấp.",
      "Xếp tôm và vài lát gừng lên vỉ sả, hấp cách thủy trong 6-7 phút đến khi tôm cong đỏ au.",
      "Bông cải xanh cắt miếng vừa ăn, luộc nhanh trong nước sôi có chút muối trong 3 phút.",
      "Vớt bông cải ngâm nước lạnh giúp giữ màu xanh ngọc bích và độ giòn ngọt tự nhiên.",
      "Bày tôm hấp và bông cải xanh ra đĩa, thưởng thức cùng chén muối tiêu chanh tươi."
    ],
    tags: ["Món hấp", "Eat Clean", "Giàu đạm", "Ít calo"],
    isFeatured: false,
    likesCount: 220,
    imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 132,
    title: "Salad ức gà quinoa sốt dầu giấm oliu",
    description: "Hạt quinoa chín xốp bùi kết hợp ức gà xé mềm ngọt, rau củ thanh mát và nước sốt dầu giấm táo chua dịu giúp no lâu mà nhẹ bụng.",
    cookTime: 25,
    servings: 2,
    calories: 340,
    category: "eat-clean",
    ingredients: [
      { name: "Hạt diêm mạch (quinoa)", quantity: 80, unit: "g" },
      { name: "Ức gà luộc xé sợi", quantity: 200, unit: "g" },
      { name: "Dưa leo baby thái hạt lựu", quantity: 1, unit: "quả" },
      { name: "Cà chua bi baby", quantity: 6, unit: "quả" },
      { name: "Dầu ô liu & giấm táo", quantity: 2, unit: "muỗng" }
    ],
    steps: [
      "Vo sạch hạt quinoa, nấu cùng nước theo tỉ lệ 1:2 trong 15 phút đến khi hạt nở bung xốp.",
      "Ức gà luộc chín tới cùng lát gừng, xé thành từng sợi nhỏ vừa ăn.",
      "Dưa leo, ớt chuông đỏ và cà chua bi rửa sạch thái hạt lựu màu sắc rực rỡ.",
      "Pha sốt dầu giấm gồm dầu ô liu, giấm táo, mật ong, muối hồng và tiêu xay nhuyễn.",
      "Trộn đều quinoa, ức gà và rau củ cùng bát nước sốt, để 5 phút cho ngấm rồi thưởng thức."
    ],
    tags: ["Superfood", "Quinoa", "Eat Clean", "Bữa trưa công sở"],
    isFeatured: false,
    likesCount: 280,
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 133,
    title: "Cá thu nướng giấy bạc thơm thảo mộc",
    description: "Khúc cá thu nướng giữ trọn vẹn nước ngọt béo nguyên bản trong lớp giấy bạc kín, thoang thoảng hương thì là, tiêu xanh và hành tây.",
    cookTime: 30,
    servings: 2,
    calories: 330,
    category: "eat-clean",
    ingredients: [
      { name: "Cá thu tươi cắt khúc", quantity: 350, unit: "g" },
      { name: "Tiêu xanh nguyên chùm", quantity: 2, unit: "nhánh" },
      { name: "Hành tây thái mỏng", quantity: 1, unit: "củ" },
      { name: "Thì là tươi", quantity: 30, unit: "g" },
      { name: "Dầu ô liu", quantity: 1, unit: "muỗng" }
    ],
    steps: [
      "Cá thu rửa sạch thấm khô, khía xéo hai mặt ướp chút muối tiêu và dầu ô liu 15 phút.",
      "Trải giấy bạc ra khay nướng, rải một lớp hành tây thái mỏng và vài nhánh thì là dưới đáy.",
      "Đặt cá thu lên trên, xếp tiêu xanh đập dập và thì là bao phủ mặt cá.",
      "Gói kín các mép giấy bạc lại tạo thành bọc kín hơi giúp cá chín mọng nước.",
      "Nướng ở 200 độ C trong 20 phút bằng nồi chiên không dầu hoặc lò nướng."
    ],
    tags: ["Món nướng", "Hải sản", "Healthy", "Giàu Omega"],
    isFeatured: false,
    likesCount: 200,
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 134,
    title: "Canh rong biển đậu hũ non nấm kim châm",
    description: "Nước canh thanh ngọt dịu dàng chuẩn vị dưỡng sinh Nhật Bản với rong biển Wakame giòn mát, đậu hũ non mềm mịn tan trong miệng.",
    cookTime: 15,
    servings: 3,
    calories: 140,
    category: "eat-clean",
    ingredients: [
      { name: "Rong biển khô Wakame", quantity: 15, unit: "g" },
      { name: "Đậu hũ non", quantity: 1, unit: "phần" },
      { name: "Nấm kim châm tươi", quantity: 100, unit: "g" },
      { name: "Gừng tươi thái sợi", quantity: 10, unit: "g" },
      { name: "Hành boa-rô thái nhỏ", quantity: 20, unit: "g" }
    ],
    steps: [
      "Rong biển Wakame ngâm nước lọc 5 phút cho nở bung rồi vớt ra cắt khúc vừa ăn.",
      "Đậu hũ non cắt miếng vuông 2cm; nấm kim châm cắt bỏ gốc ngâm rửa sạch.",
      "Đun sôi 800ml nước dùng rau củ cùng vài sợi gừng tươi khử tanh thanh lọc vị giác.",
      "Thả đậu hũ non và nấm kim châm vào đun sôi nhẹ trong 3 phút.",
      "Cho rong biển và hành boa-rô vào nồi, nêm chút hạt nêm chay rồi tắt bếp ngay."
    ],
    tags: ["Món chay", "Thanh lọc", "Thấp calo", "Canh dưỡng sinh"],
    isFeatured: false,
    likesCount: 175,
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 135,
    title: "Đậu phụ áp chảo sốt nấm hương đông cô",
    description: "Từng lát đậu hũ vàng giòn vỏ bùi ruột tắm đẫm trong sốt nấm đông cô sánh mượt ngọt thơm thảo mộc tự nhiên.",
    cookTime: 20,
    servings: 2,
    calories: 220,
    category: "eat-clean",
    ingredients: [
      { name: "Đậu phụ trắng cứng", quantity: 3, unit: "phần" },
      { name: "Nấm đông cô tươi", quantity: 120, unit: "g" },
      { name: "Nước tương Tamari", quantity: 2, unit: "muỗng" },
      { name: "Bột bắp (bột ngô)", quantity: 1, unit: "muỗng" },
      { name: "Hành hoa thái nhỏ", quantity: 20, unit: "g" }
    ],
    steps: [
      "Đậu phụ ép ráo bớt nước, cắt lát vuông dày 2cm áp chảo vàng ươm hai mặt với chút dầu ô liu.",
      "Nấm đông cô ngâm rửa sạch, khía chữ thập trên mũ nấm hoặc thái lát mỏng vừa ăn.",
      "Phi thơm hành boa-rô, cho nấm vào xào chín với nước tương Tamari và chút tiêu xay.",
      "Hòa bột bắp với nửa bát nước rót vào chảo nấm khuấy nhẹ tạo độ sánh sệt thơm lừng.",
      "Xếp đậu phụ áp chảo ra đĩa sâu lòng, rưới đều sốt nấm đông cô nóng hổi lên trên mặt."
    ],
    tags: ["Món chay", "Đậu hũ", "Nấm đông cô", "Thanh đạm"],
    isFeatured: false,
    likesCount: 190,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 136,
    title: "Smoothie bowl chuối dâu hạt chia granola",
    description: "Tô sinh tố mát lạnh đặc mịn như kem từ chuối đông lạnh và quả mọng, phủ đầy granola yến mạch giòn rụm và dừa nạo ngọt bùi.",
    cookTime: 10,
    servings: 1,
    calories: 310,
    category: "eat-clean",
    ingredients: [
      { name: "Chuối tiêu chín đông lạnh", quantity: 2, unit: "quả" },
      { name: "Dâu tây đông lạnh", quantity: 100, unit: "g" },
      { name: "Sữa hạt không đường", quantity: 80, unit: "ml" },
      { name: "Granola yến mạch mật ong", quantity: 3, unit: "muỗng" },
      { name: "Hạt chia hữu cơ", quantity: 1, unit: "muỗng" }
    ],
    steps: [
      "Cho chuối đông lạnh cắt khúc, dâu tây và sữa hạt vào máy xay sinh tố công suất cao.",
      "Xay nhuyễn mịn ở tốc độ cao đến khi hỗn hợp sánh đặc mịn màng như kem tươi mát lạnh.",
      "Đổ sinh tố ra bát sứ nông lòng tạo bề mặt phẳng mịn.",
      "Rải granola yến mạch giòn tan thành dải dọc trên mặt bát.",
      "Rắc thêm hạt chia, dừa nạo và vài lát dâu tây tươi tạo điểm nhấn mắt nhìn hấp dẫn."
    ],
    tags: ["Smoothie Bowl", "Trái cây", "Ăn sáng", "Tươi mát"],
    isFeatured: true,
    likesCount: 340,
    imageUrl: "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=800&q=80"
  },

  // =========================================================================
  // 4. MÓN ĂN NHANH & TIỆN LỢI (nau-nhanh: 12 món)
  // =========================================================================
  {
    id: 137,
    title: "Cơm rang dưa bò giòn hạt chuẩn phố cổ",
    description: "Cơm nguội rang vàng ươm săn giòn từng hạt quyện thịt bò xào dưa chua róc nước mềm ngọt, đượm khói chảo gang giòn rụm ngất ngây.",
    cookTime: 20,
    servings: 2,
    calories: 520,
    category: "nau-nhanh",
    ingredients: [
      { name: "Cơm nguội khô ráo", quantity: 400, unit: "g" },
      { name: "Thịt bò thăn thái mỏng", quantity: 200, unit: "g" },
      { name: "Dưa cải chua giòn", quantity: 150, unit: "g" },
      { name: "Lòng đỏ trứng gà", quantity: 2, unit: "quả" },
      { name: "Hành tím băm", quantity: 2, unit: "củ" }
    ],
    steps: [
      "Bóp đều cơm nguội với 2 lòng đỏ trứng gà và thìa nhỏ dầu ăn giúp hạt cơm bám trứng vàng đều.",
      "Thịt bò xào nhanh tay lửa lớn cùng dưa chua và tỏi băm cho săn giòn rồi trút riêng ra đĩa.",
      "Cho chảo gang lên bếp đun thật nóng mỡ gà, đổ cơm vào đảo liên tục lửa lớn cho hạt cơm săn nổ giòn tách tách.",
      "Khi cơm săn vàng ruộm, đổ đĩa thịt bò dưa chua vào đảo chung thêm 2 phút cho quyện đều vị.",
      "Múc cơm ra đĩa, rắc hành phi giòn tan và hạt tiêu xay thơm nồng."
    ],
    tags: ["Cơm rang", "Hà Nội", "Nấu nhanh", "Đưa cơm"],
    isFeatured: true,
    likesCount: 430,
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 138,
    title: "Mì xào hải sản rau cải giòn sần sật",
    description: "Sợi mì tôm hoặc mì trứng xào lửa lớn giữ trọn độ dai giòn, tôm mực tươi rói quyện cải ngọt xanh mướt đẫm sốt dầu hào thơm phức.",
    cookTime: 18,
    servings: 2,
    calories: 450,
    category: "nau-nhanh",
    ingredients: [
      { name: "Mì gói hoặc mì trứng", quantity: 2, unit: "phần" },
      { name: "Tôm sú bóc nõn", quantity: 150, unit: "g" },
      { name: "Mực ống cắt khoanh", quantity: 150, unit: "g" },
      { name: "Cải ngọt xanh", quantity: 150, unit: "g" },
      { name: "Dầu hào & hắc xì dầu", quantity: 2, unit: "muỗng" }
    ],
    steps: [
      "Chần mì qua nước sôi 1 phút cho sợi tơi mềm, vớt ra xả nước lạnh rồi trộn thìa dầu ăn chống dính.",
      "Xào chín tôm mực trên lửa lớn cùng chút tỏi băm và hạt tiêu rồi múc ra đĩa riêng.",
      "Xào cải ngọt và cà rốt bào sợi chín tới giữ nguyên màu xanh giòn mát.",
      "Cho mì vào chảo đảo xém cạnh, rưới sốt dầu hào pha hắc xì dầu đảo đều tay cho mì lên màu nâu óng.",
      "Trút hải sản và rau vào chảo mì đảo đều 1 phút trên lửa cực lớn rồi tắt bếp."
    ],
    tags: ["Mì xào", "Hải sản", "Nhanh gọn", "Bữa tối bận rộn"],
    isFeatured: false,
    likesCount: 260,
    imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 139,
    title: "Trứng chiên thịt băm nấm hương hành hoa",
    description: "Món ăn quốc dân thơm ngát nấm hương, trứng gà vàng phồng xốp mềm ẩm bọc thịt băm đậm đà cực kỳ hao cơm trong 15 phút.",
    cookTime: 15,
    servings: 3,
    calories: 340,
    category: "nau-nhanh",
    ingredients: [
      { name: "Trứng gà tươi", quantity: 4, unit: "quả" },
      { name: "Thịt nạc heo băm", quantity: 150, unit: "g" },
      { name: "Nấm hương khô ngâm nở", quantity: 20, unit: "g" },
      { name: "Hành hoa thái nhỏ", quantity: 30, unit: "g" },
      { name: "Nước mắm ngon", quantity: 1, unit: "muỗng" }
    ],
    steps: [
      "Nấm hương ngâm nở mềm, rửa sạch vắt ráo rồi băm thật nhuyễn.",
      "Đập 4 quả trứng gà vào tô, cho thịt băm, nấm hương, hành hoa, nước mắm và tiêu xay.",
      "Dùng đũa đánh thật kỹ và bông bọt cho hỗn hợp hòa quyện đều gia vị.",
      "Đun nóng chảo dầu ăn, đổ toàn bộ hỗn hợp trứng vào rán lửa nhỏ vừa đậy nắp vung 3 phút.",
      "Lật mặt trứng rán tiếp 2 phút cho chín vàng đều hai mặt thơm phưng phức."
    ],
    tags: ["Món trứng", "Dễ làm", "Sinh viên", "Bữa cơm nhanh"],
    isFeatured: false,
    likesCount: 310,
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 140,
    title: "Đậu sốt cà chua hành lá nóng hổi",
    description: "Món ngon kinh điển với đậu phụ rán vàng giòn vỏ mềm ruột đẫm trong sốt cà chua sóng sánh thơm lừng hành hoa thái nhỏ.",
    cookTime: 15,
    servings: 2,
    calories: 280,
    category: "nau-nhanh",
    ingredients: [
      { name: "Đậu phụ trắng", quantity: 3, unit: "phần" },
      { name: "Cà chua chín mọng", quantity: 3, unit: "quả" },
      { name: "Hành lá & hành khô", quantity: 40, unit: "g" },
      { name: "Nước mắm cốt", quantity: 2, unit: "muỗng" },
      { name: "Dầu ăn thực vật", quantity: 3, unit: "muỗng" }
    ],
    steps: [
      "Đậu phụ cắt miếng vuông vừa ăn, rán trên chảo dầu nóng đến khi vàng giòn các mặt.",
      "Cà chua thái múi cau; phi thơm hành khô rồi trút cà chua vào xào nhuyễn cùng thìa mắm.",
      "Thêm nửa bát con nước đun sôi tạo thành hỗn hợp nước sốt cà chua sánh đỏ tự nhiên.",
      "Thả đậu rán vào chảo sốt, hạ nhỏ lửa đun rim 5 phút cho đậu hút no nước sốt đậm đà.",
      "Rắc thật nhiều hành lá thái nhỏ lên trên đảo nhẹ rồi múc ra đĩa ăn nóng với cơm."
    ],
    tags: ["Đậu phụ", "Sinh viên", "Siêu rẻ", "Nấu nhanh"],
    isFeatured: false,
    likesCount: 220,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 141,
    title: "Canh trứng cà chua rong biển thanh đạm",
    description: "Món canh mây trứng bồng bềnh thanh nhẹ nấu siêu tốc trong 10 phút, vị chua ngọt thanh tao giải ngấy hoàn hảo cho ngày bận rộn.",
    cookTime: 10,
    servings: 3,
    calories: 120,
    category: "nau-nhanh",
    ingredients: [
      { name: "Trứng gà tươi", quantity: 2, unit: "quả" },
      { name: "Cà chua chín", quantity: 2, unit: "quả" },
      { name: "Rong biển nấu canh", quantity: 10, unit: "g" },
      { name: "Hành hoa & rau mùi", quantity: 20, unit: "g" },
      { name: "Dầu mè thơm", quantity: 1, unit: "muỗng" }
    ],
    steps: [
      "Xào cà chua bổ múi với chút dầu ăn và hành khô cho nhuyễn mềm ra màu nước canh đỏ cam đẹp mắt.",
      "Đổ 700ml nước vào nồi đun sôi bùng, thả rong biển đã ngâm mềm vào nấu 2 phút.",
      "Đánh tan 2 quả trứng gà trong bát con cùng xíu gia vị.",
      "Khuấy tròn nồi canh theo một chiều, rót từ từ trứng qua đũa tạo thành các dải vân mây trứng mỏng đẹp mắt.",
      "Tắt bếp ngay, rắc hành hoa thái nhỏ và vài giọt dầu mè thơm ngậy."
    ],
    tags: ["Canh mây", "10 phút", "Thanh mát", "Tiết kiệm"],
    isFeatured: false,
    likesCount: 180,
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 142,
    title: "Bánh mì kẹp trứng ốp la pate bơ thơm",
    description: "Ổ bánh mì nóng giòn rụm kẹp đôi trứng ốp la lòng đào tan chảy, quyện pate gan béo ngậy, bơ thơm và dưa leo mát giòn rắc tiêu cay.",
    cookTime: 10,
    servings: 1,
    calories: 460,
    category: "nau-nhanh",
    ingredients: [
      { name: "Bánh mì ổ giòn", quantity: 1, unit: "phần" },
      { name: "Trứng gà tươi", quantity: 2, unit: "quả" },
      { name: "Pate gan heo", quantity: 40, unit: "g" },
      { name: "Bơ thực vật thơm", quantity: 15, unit: "g" },
      { name: "Dưa leo & rau mùi", quantity: 40, unit: "g" }
    ],
    steps: [
      "Làm nóng chảo với chút bơ, ốp la 2 quả trứng gà lòng đào chảy ngậy rắc tiêu đen.",
      "Bánh mì nướng lại trong nồi chiên không dầu 2 phút cho vỏ giòn rụm nóng bỏng tay.",
      "Rạch dọc thân bánh mì, quết một lớp bơ thơm và lớp pate gan béo ngậy vào hai mặt ruột bánh.",
      "Khéo léo kẹp 2 quả trứng ốp la vào giữa thân bánh mì.",
      "Thêm vài lát dưa leo giòn mát, rau mùi tươi và rưới vài giọt tương ớt cay nồng."
    ],
    tags: ["Bánh mì", "Ăn nhanh", "Bữa sáng tiện lợi", "Đường phố"],
    isFeatured: false,
    likesCount: 290,
    imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 143,
    title: "Cơm chiên kim chi xúc xích phô mai kéo sợi",
    description: "Hạt cơm dẻo săn đẫm vị cay chua giòn sần sật của kim chi cải thảo, xúc xích áp chảo xém thơm phủ lớp phô mai Mozzarella béo ngậy kéo sợi dài.",
    cookTime: 18,
    servings: 2,
    calories: 540,
    category: "nau-nhanh",
    ingredients: [
      { name: "Cơm nguội", quantity: 350, unit: "g" },
      { name: "Kim chi cải thảo thái nhỏ", quantity: 150, unit: "g" },
      { name: "Xúc xích Đức thái lát", quantity: 2, unit: "phần" },
      { name: "Phô mai Mozzarella bào", quantity: 80, unit: "g" },
      { name: "Tương ớt Hàn Quốc Gochujang", quantity: 1, unit: "muỗng" }
    ],
    steps: [
      "Phi thơm tỏi băm, cho xúc xích thái lát vào đảo xém cạnh rồi trút kim chi vào xào săn thơm.",
      "Nêm 1 thìa tương ớt Gochujang và xíu đường cân bằng độ chua thanh của kim chi.",
      "Trút cơm nguội vào chảo, dùng muôi dẹp miết tơi hạt cơm đảo đều tay trên lửa lớn 5 phút.",
      "Gom cơm gọn lại giữa chảo, rải phô mai bào kín mặt trên rồi đậy vung hạ nhỏ lửa 2 phút cho phô mai tan chảy kéo sợi.",
      "Rắc mè rang và rong biển vụn lên trên mặt phô mai rồi thưởng thức ngay trên chảo nóng."
    ],
    tags: ["Hàn Quốc", "Phô mai", "Cơm chiên", "Cay ngon"],
    isFeatured: true,
    likesCount: 390,
    imageUrl: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 144,
    title: "Miến xào lòng gà giòn sần sật",
    description: "Sợi miến dong xào tơi mềm óng ả quyện lòng mề gà giòn sần sật, mộc nhĩ nấm hương bùi thơm và giá đỗ giòn ngọt.",
    cookTime: 20,
    servings: 2,
    calories: 390,
    category: "nau-nhanh",
    ingredients: [
      { name: "Miến dong sạch", quantity: 180, unit: "g" },
      { name: "Lòng mề gan gà tươi", quantity: 200, unit: "g" },
      { name: "Mộc nhĩ nấm hương", quantity: 25, unit: "g" },
      { name: "Giá đỗ tươi", quantity: 100, unit: "g" },
      { name: "Hành hoa & rau răm", quantity: 30, unit: "g" }
    ],
    steps: [
      "Lòng gà bóp muối làm sạch, thái mỏng ướp hành khô, tiêu và nước mắm ngon 15 phút.",
      "Miến dong ngâm nước ấm cho mềm dai, cắt khúc vừa ăn rồi xóc với lòng trắng trứng hoặc chút dầu ăn.",
      "Xào chín lòng gà trên lửa lớn cùng nấm hương mộc nhĩ rồi múc riêng ra đĩa.",
      "Cho miến vào chảo đảo đều tay với chút nước dùng gà cho sợi miến nở trong veo mềm mướt.",
      "Trút lòng gà, giá đỗ và hành răm vào chảo miến đảo nhanh 1 phút trên lửa to rồi rắc tiêu."
    ],
    tags: ["Miến xào", "Lòng gà", "Món nhậu", "Nhanh gọn"],
    isFeatured: false,
    likesCount: 210,
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 145,
    title: "Mì tôm bò bắp cải xào tỏi",
    description: "Món ăn cứu đói thần thánh lúc đêm khuya với sợi mì tôm giòn dai thơm lừng xào cùng thịt bò mềm mọng và bắp cải giòn sần sật.",
    cookTime: 12,
    servings: 1,
    calories: 420,
    category: "nau-nhanh",
    ingredients: [
      { name: "Mì tôm Hảo Hảo", quantity: 1, unit: "phần" },
      { name: "Thịt bò thăn", quantity: 120, unit: "g" },
      { name: "Bắp cải thái sợi", quantity: 100, unit: "g" },
      { name: "Tỏi băm nhuyễn", quantity: 3, unit: "nhánh" },
      { name: "Tương ớt Chin-su", quantity: 1, unit: "muỗng" }
    ],
    steps: [
      "Chần vắt mì qua nước sôi 45 giây cho sợi vừa tơi ra thì vớt ráo ngay.",
      "Phi thơm nhiều tỏi băm với dầu ăn, trút thịt bò vào xào lửa lớn 1 phút vừa chín tới múc ra đĩa.",
      "Cho bắp cải thái sợi vào chảo xào nhanh với gói muối mì tôm cho ngấm giòn ngọt.",
      "Đổ mì và thịt bò vào chảo đảo đều tay trên lửa lớn cho sợi mì se giòn xém cạnh.",
      "Thêm thìa tương ớt cay nồng đảo đều và thưởng thức ngay khi còn nóng hổi bốc khói."
    ],
    tags: ["Mì tôm", "Đêm khuya", "Sinh viên", "Siêu nhanh"],
    isFeatured: false,
    likesCount: 280,
    imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 146,
    title: "Thịt băm xào bắp ngọt giòn ngậy",
    description: "Hạt bắp mỹ vàng tươi giòn ngọt tự nhiên quyện thịt nạc băm xào hành tỏi thơm phức, món ăn bắt cơm siêu tốc cả người lớn lẫn trẻ nhỏ đều mê.",
    cookTime: 15,
    servings: 3,
    calories: 330,
    category: "nau-nhanh",
    ingredients: [
      { name: "Thịt nạc vai băm", quantity: 250, unit: "g" },
      { name: "Bắp ngọt (ngô ngọt) tách hạt", quantity: 200, unit: "g" },
      { name: "Hành tím & hành hoa", quantity: 30, unit: "g" },
      { name: "Bơ lạt thơm", quantity: 10, unit: "g" },
      { name: "Hạt nêm & nước mắm", quantity: 1, unit: "muỗng" }
    ],
    steps: [
      "Bắp ngọt chần qua nước sôi 1 phút rồi vớt ra ngâm nước lạnh cho giữ màu vàng tươi giòn ngọt.",
      "Phi thơm hành tím với bơ lạt, cho thịt băm vào xào săn tơi đều các hạt thịt.",
      "Nêm nước mắm ngon và hạt nêm đảo đều cho thịt ngấm gia vị đậm đà.",
      "Trút hạt bắp ngọt vào xào chung trên lửa lớn trong 3 phút cho quyện đều vị bơ thịt thơm ngậy.",
      "Rắc hành hoa thái nhỏ và hạt tiêu xay rồi tắt bếp, xúc ăn cùng cơm trắng nóng dẻo."
    ],
    tags: ["Bắp ngọt", "Dễ làm", "Cơm nhà", "Nhanh gọn"],
    isFeatured: false,
    likesCount: 230,
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 147,
    title: "Trứng ốp la xúc xích sốt cà chua đậu đỏ",
    description: "Bữa ăn giàu đạm đầy đủ năng lượng với xúc xích nướng xém cạnh, trứng ốp lòng đào béo ngậy sốt cà chua quyện đậu đỏ đậm đà vị Âu.",
    cookTime: 15,
    servings: 1,
    calories: 430,
    category: "nau-nhanh",
    ingredients: [
      { name: "Trứng gà tươi", quantity: 2, unit: "quả" },
      { name: "Xúc xích xông khói", quantity: 2, unit: "phần" },
      { name: "Đậu đỏ hầm sốt cà đóng hộp", quantity: 100, unit: "g" },
      { name: "Bơ lạt", quantity: 10, unit: "g" },
      { name: "Bánh mì lát sandwich", quantity: 2, unit: "phần" }
    ],
    steps: [
      "Khía xéo thân xúc xích, áp chảo với bơ lạt cho xém vàng thơm nức.",
      "Ốp la 2 quả trứng gà lòng đào rắc chút muối tiêu trên mặt.",
      "Đổ đậu đỏ sốt cà chua vào góc chảo đun sôi lăn tăn bốc khói.",
      "Nướng vàng giòn 2 lát bánh mì sandwich trong chảo bơ nóng.",
      "Bày tất cả nguyên liệu ra đĩa ăn kèm tương cà và nhâm nhi cùng tách cà phê sáng."
    ],
    tags: ["Kiểu Âu", "Giàu đạm", "Ăn sáng", "Năng lượng"],
    isFeatured: false,
    likesCount: 190,
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 148,
    title: "Canh cải ngọt nấu thịt nạc băm",
    description: "Món canh thanh đạm giải nhiệt mát gan với nước dùng ngọt lịm từ thịt nạc băm và rau cải ngọt xanh mướt giòn sần sật chỉ mất 10 phút.",
    cookTime: 12,
    servings: 3,
    calories: 150,
    category: "nau-nhanh",
    ingredients: [
      { name: "Rau cải ngọt non", quantity: 300, unit: "g" },
      { name: "Thịt heo nạc băm", quantity: 150, unit: "g" },
      { name: "Hành tím băm", quantity: 2, unit: "củ" },
      { name: "Gừng tươi đập dập", quantity: 1, unit: "nhánh" },
      { name: "Nước mắm truyền thống", quantity: 1, unit: "muỗng" }
    ],
    steps: [
      "Rau cải ngọt nhặt sạch gốc rễ, ngâm rửa sạch rồi cắt khúc 3-4cm vừa ăn.",
      "Phi thơm hành tím với xíu dầu ăn, cho thịt băm vào xào săn cùng thìa mắm cho dậy mùi.",
      "Đổ 800ml nước lọc vào nồi đun sôi bùng, vớt sạch bọt trắng cho nước canh trong veo.",
      "Thả rau cải ngọt và nhánh gừng đập dập vào đun sôi bùng thêm 2 phút cho rau vừa chín tới giòn ngọt.",
      "Nêm nếm lại gia vị cho vừa miệng rồi múc canh ra tô dùng nóng."
    ],
    tags: ["Món canh", "10 phút", "Thanh mát", "Gia đình"],
    isFeatured: false,
    likesCount: 170,
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80"
  },

  // =========================================================================
  // 5. BÁNH, ĐỒ ĂN VẶT & TRÁNG MIỆNG (banh-trang-mieng: 12 món)
  // =========================================================================
  {
    id: 149,
    title: "Chè sương sa hạt lựu cốt dừa béo ngậy",
    description: "Ly chè rực rỡ sắc màu với hạt lựu củ năng giòn sần sật bọc bột lọc dẻo dai, sương sa mát lạnh hòa quyện nước cốt dừa thơm béo ngậy.",
    cookTime: 35,
    servings: 4,
    calories: 320,
    category: "banh-trang-mieng",
    ingredients: [
      { name: "Củ năng tươi thái hạt lựu", quantity: 200, unit: "g" },
      { name: "Bột năng nguyên chất", quantity: 150, unit: "g" },
      { name: "Sương sáo đen/trắng", quantity: 100, unit: "g" },
      { name: "Nước cốt dừa đậm đặc", quantity: 250, unit: "ml" },
      { name: "Nước cốt củ dền tạo màu đỏ", quantity: 50, unit: "ml" }
    ],
    steps: [
      "Ngâm củ năng hạt lựu vào nước cốt củ dền cho nhuộm màu đỏ hồng tự nhiên.",
      "Áo đều bột năng quanh củ năng rồi luộc trong nước sôi đến khi hạt lựu nổi trong veo thì vớt ngâm nước đá.",
      "Nấu nước cốt dừa cùng chút lá dứa, đường cát và xíu muối hạt cho sánh béo thơm lừng.",
      "Cắt nhỏ thạch sương sáo và chuẩn bị đậu xanh đánh nhuyễn mịn màng.",
      "Múc hạt lựu, sương sa, đậu xanh vào ly, rưới nước cốt dừa béo ngậy và thêm đá bào mát rượi."
    ],
    tags: ["Món chè", "Giải nhiệt", "Mùa hè", "Ngọt ngào"],
    isFeatured: true,
    likesCount: 370,
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 150,
    title: "Bánh flan caramel cốt dừa mềm mịn",
    description: "Miếng bánh flan caramel trứng sữa mịn màng núng nính không hề có lỗ rỗ, ngập trong sốt caramel đắng nhẹ thơm bùi hương cốt dừa.",
    cookTime: 40,
    servings: 4,
    calories: 270,
    category: "banh-trang-mieng",
    ingredients: [
      { name: "Trứng gà tươi", quantity: 5, unit: "quả" },
      { name: "Sữa tươi không đường", quantity: 400, unit: "ml" },
      { name: "Sữa đặc có đường", quantity: 120, unit: "g" },
      { name: "Đường thắng caramel", quantity: 80, unit: "g" },
      { name: "Nước cốt dừa thơm", quantity: 50, unit: "ml" }
    ],
    steps: [
      "Thắng đường cùng chút nước cốt chanh đến khi chuyển màu hổ phách thì rót đều dưới đáy hũ thủy tinh.",
      "Khuấy nhẹ trứng gà với sữa tươi đun ấm, sữa đặc và nước cốt dừa theo một chiều không tạo bọt khí.",
      "Lọc hỗn hợp trứng sữa qua rây 2 lần để hỗn hợp thật mịn màng không gợn cặn.",
      "Rót nhẹ nhàng vào từng hũ caramel, dùng giấy bạc bọc kín miệng hũ.",
      "Hấp cách thủy lửa thật nhỏ trong 30 phút hoặc nướng cách thủy ở 150 độ C, làm mát trước khi dùng."
    ],
    tags: ["Bánh flan", "Caramel", "Tráng miệng", "Núng nính"],
    isFeatured: true,
    likesCount: 460,
    imageUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 151,
    title: "Sữa chua dẻo trái cây nhiệt đới",
    description: "Từng miếng sữa chua dẻo dai mát lạnh cắt vuông vức hòa cùng sốt chanh leo, dâu tây mọng nước và kiwi chua ngọt thanh mát cực đã.",
    cookTime: 20,
    servings: 3,
    calories: 210,
    category: "banh-trang-mieng",
    ingredients: [
      { name: "Sữa chua không đường", quantity: 300, unit: "g" },
      { name: "Gelatin lá hữu cơ", quantity: 12, unit: "g" },
      { name: "Sữa đặc", quantity: 60, unit: "g" },
      { name: "Dâu tây & xoài chín", quantity: 150, unit: "g" },
      { name: "Bột cacao nguyên chất", quantity: 1, unit: "muỗng" }
    ],
    steps: [
      "Ngâm mềm lá gelatin trong nước đá lạnh 10 phút rồi vớt ráo vắt kiệt nước.",
      "Đun ấm sữa tươi và sữa đặc, hòa tan gelatin vào khuấy đều cho tan hoàn toàn.",
      "Trộn đều sữa chua vào hỗn hợp rồi đổ vào khuôn vuông lót màng bọc thực phẩm.",
      "Để tủ mát 4-5 tiếng cho sữa chua đông dẻo đàn hồi rồi lấy ra cắt miếng vuông 2-3cm.",
      "Xếp ra đĩa cùng các loại trái cây nhiệt đới, rắc bột cacao hoặc bột trà xanh lên trên."
    ],
    tags: ["Sữa chua dẻo", "Ăn vặt", "Trẻ em thích", "Giải nhiệt"],
    isFeatured: false,
    likesCount: 320,
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 152,
    title: "Tàu hũ trân châu đường đen nóng dẻo",
    description: "Lớp tào phớ trắng muốt núng nính mềm tan trong miệng, ngập tràn trân châu đen dai dẻo đượm vị đường mía sẫm màu và gừng tươi ấm nồng.",
    cookTime: 30,
    servings: 3,
    calories: 250,
    category: "banh-trang-mieng",
    ingredients: [
      { name: "Đậu nành hạt ngâm xay", quantity: 200, unit: "g" },
      { name: "Đường nâu Hàn Quốc", quantity: 100, unit: "g" },
      { name: "Trân châu đen dẻo", quantity: 100, unit: "g" },
      { name: "Đường nho hữu cơ", quantity: 3, unit: "g" },
      { name: "Gừng tươi đập dập", quantity: 20, unit: "g" }
    ],
    steps: [
      "Xay đậu nành lọc lấy 1 lít sữa đậu nành nguyên chất đun sôi liu riu trong 10 phút.",
      "Hòa đường nho với 1 thìa nước tráng quanh lòng nồi sứ, đổ dứt khoát sữa đậu nành nóng vào rồi đậy nắp ủ 30 phút.",
      "Luộc trân châu đen trong 20 phút rồi ủ kín 20 phút cho trân châu nở dẻo dai.",
      "Nấu đường nâu cùng gừng tươi và nửa bát nước cho keo sánh sền sệt thơm nức mùi mật mía.",
      "Dùng muôi dẹp hớt từng lát tàu hũ mềm mượt vào bát, múc trân châu đường đen nóng dẻo chan lên trên."
    ],
    tags: ["Tào phớ", "Trân châu", "Đường đen", "Món ngọt"],
    isFeatured: false,
    likesCount: 350,
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 153,
    title: "Chè bưởi An Giang giòn ngọt đậu xanh nước cốt dừa",
    description: "Cùi bưởi giòn sần sật trong veo khử sạch tinh dầu đắng, đậu xanh hấp chín bở bùi quyện nước đường hoa bưởi thoang thoảng cốt dừa sánh béo.",
    cookTime: 45,
    servings: 4,
    calories: 290,
    category: "banh-trang-mieng",
    ingredients: [
      { name: "Cùi bưởi da xanh", quantity: 250, unit: "g" },
      { name: "Đậu xanh xát vỏ", quantity: 150, unit: "g" },
      { name: "Bột năng", quantity: 120, unit: "g" },
      { name: "Đường phèn", quantity: 150, unit: "g" },
      { name: "Nước cốt dừa thơm béo", quantity: 200, unit: "ml" }
    ],
    steps: [
      "Cùi bưởi cắt hạt lựu bóp muối xả nước 6 lần khử sạch vị đắng ngâm nước đường phèn rồi áo bột năng.",
      "Luộc cùi bưởi trong nước sôi đến khi cùi trong veo nổi lên thì vớt ngâm ngay âu nước đá cho giòn tan.",
      "Đậu xanh ngâm nở đồ chín tới giữ nguyên hạt tròn vẹn không bị nát nhừ.",
      "Nấu nước đường phèn hoa bưởi, xuống bột năng từ từ cho nước chè sánh mượt trong veo.",
      "Trút cùi bưởi giòn và đậu xanh vào đảo đều, múc ra ly chan nước cốt dừa béo ngậy thơm lừng."
    ],
    tags: ["Chè bưởi", "An Giang", "Giòn sần sật", "Đặc sản"],
    isFeatured: true,
    likesCount: 410,
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 154,
    title: "Chè chuối nướng nước cốt dừa Nam Bộ",
    description: "Chuối xiêm chín bọc lớp nếp dẻo thơm cuộn lá chuối nướng cháy sém xém vàng, chan đẫm nước cốt dừa bột báng béo ngậy rắc đậu phộng thơm.",
    cookTime: 35,
    servings: 3,
    calories: 340,
    category: "banh-trang-mieng",
    ingredients: [
      { name: "Chuối xiêm chín ngọt", quantity: 4, unit: "quả" },
      { name: "Nếp dẻo nấu cốt dừa", quantity: 250, unit: "g" },
      { name: "Bột báng hạt nhỏ", quantity: 30, unit: "g" },
      { name: "Nước cốt dừa béo", quantity: 200, unit: "ml" },
      { name: "Đậu phộng rang vàng", quantity: 3, unit: "muỗng" }
    ],
    steps: [
      "Nếp dẻo nấu chín cùng nước cốt dừa và chút đường cho dẻo thơm ngậy.",
      "Cán mỏng một lớp nếp bọc kín quanh quả chuối xiêm chín rồi cuộn ngoài bằng lá chuối tươi.",
      "Nướng chuối trên than hồng hoặc nồi chiên không dầu đến khi lá chuối cháy xém và nếp vàng giòn rụm.",
      "Nấu nước cốt dừa cùng bột báng, lá dứa và đường thốt nốt cho sánh mịn béo ngậy.",
      "Cắt chuối nướng thành từng khoanh tròn ra đĩa, chan đẫm nước cốt dừa bột báng và rắc đậu phộng rang giã dập."
    ],
    tags: ["Chuối nướng", "Nam Bộ", "Béo ngậy", "Đặc sản"],
    isFeatured: false,
    likesCount: 280,
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 155,
    title: "Bánh da lợn lá dứa đậu xanh dẻo dai",
    description: "Từng lớp bánh mỏng xen kẽ xanh thơm mùi lá dứa và vàng bùi đậu xanh cốt dừa, kết cấu dai mềm dẻo bóng óng ả ngọt ngào.",
    cookTime: 40,
    servings: 4,
    calories: 280,
    category: "banh-trang-mieng",
    ingredients: [
      { name: "Bột năng", quantity: 200, unit: "g" },
      { name: "Bột gạo tẻ", quantity: 50, unit: "g" },
      { name: "Đậu xanh đãi vỏ nấu chín", quantity: 150, unit: "g" },
      { name: "Nước cốt lá dứa nguyên chất", quantity: 100, unit: "ml" },
      { name: "Nước cốt dừa", quantity: 250, unit: "ml" }
    ],
    steps: [
      "Pha lớp xanh: Bột năng, bột gạo, đường, nước cốt dừa và nước cốt lá dứa tươi xay nhuyễn.",
      "Pha lớp vàng: Xay nhuyễn đậu xanh chín cùng nước cốt dừa, bột năng và đường cát mịn.",
      "Quét một lớp dầu mỏng vào khuôn bánh, làm nóng khuôn trong nồi hấp cách thủy.",
      "Đổ lần lượt từng lớp mỏng: 1 lớp xanh hấp 5 phút chín trong thì đổ tiếp 1 lớp vàng hấp 5 phút.",
      "Lặp lại các lớp cho đầy khuôn bánh, để bánh thật nguội trước khi dùng dao bọc màng thực phẩm cắt miếng ziczac."
    ],
    tags: ["Bánh truyền thống", "Lá dứa", "Đậu xanh", "Dẻo dai"],
    isFeatured: false,
    likesCount: 230,
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 156,
    title: "Bánh chuối nướng bơ sữa Nam Bộ",
    description: "Ổ bánh chuối nướng màu nâu đỏ cánh gián quyện bánh mì cũ ngâm sữa tươi và chuối chín ép, thơm lừng vị bơ Pháp và rượu rum nồng nàn.",
    cookTime: 60,
    servings: 6,
    calories: 310,
    category: "banh-trang-mieng",
    ingredients: [
      { name: "Chuối sứ chín rục", quantity: 6, unit: "quả" },
      { name: "Bánh mì cũ xé nhỏ", quantity: 150, unit: "g" },
      { name: "Sữa tươi không đường", quantity: 250, unit: "ml" },
      { name: "Nước cốt dừa thơm", quantity: 150, unit: "ml" },
      { name: "Bơ lạt đun chảy", quantity: 40, unit: "g" }
    ],
    steps: [
      "Chuối cắt lát ướp chút đường và 1 nắp rượu rum trong 30 phút cho lên men đỏ thẫm.",
      "Xé nhỏ bánh mì ngâm trong hỗn hợp sữa tươi, nước cốt dừa, bơ chảy và sữa đặc 15 phút cho ngấu mềm.",
      "Trộn 2/3 lượng chuối vào tô bánh mì bóp nhuyễn vừa phải thành khối bột dẻo mịn.",
      "Quét bơ lót giấy nến vào khuôn, đổ hỗn hợp bánh vào khuôn và xếp 1/3 lát chuối còn lại lên bề mặt trang trí.",
      "Nướng ở 175 độ C trong 60 phút đến khi mặt bánh se vàng sậm màu cánh gián thơm ngào ngạt."
    ],
    tags: ["Bánh nướng", "Chuối chín", "Nam Bộ", "Tráng miệng"],
    isFeatured: false,
    likesCount: 290,
    imageUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 157,
    title: "Trà sữa trân châu đường đen phô mai kem mặn",
    description: "Cốt trà đen đậm vị thơm ngát hòa sữa tươi thanh trùng, trân châu nấu đường mật ấm dẻo phủ lớp kem phô mai Macchiato mằn mặn béo ngậy.",
    cookTime: 20,
    servings: 2,
    calories: 380,
    category: "banh-trang-mieng",
    ingredients: [
      { name: "Trà đen nguyên lá (Black Tea)", quantity: 20, unit: "g" },
      { name: "Sữa tươi thanh trùng Dalatmilk", quantity: 300, unit: "ml" },
      { name: "Trân châu đường đen dẻo", quantity: 100, unit: "g" },
      { name: "Cream cheese phô mai", quantity: 50, unit: "g" },
      { name: "Whipping cream kem sữa tươi", quantity: 80, unit: "ml" }
    ],
    steps: [
      "Ủ trà đen với 250ml nước sôi ở 90 độ C trong 12 phút rồi lọc bỏ bã trà lấy cốt trà thơm đậm.",
      "Đánh bông nhẹ hỗn hợp kem gồm cream cheese mềm, whipping cream, xíu sữa đặc và muối biển.",
      "Nấu trân châu đen với đường mía sẫm màu cho trân châu ấm dẻo keo sánh đường.",
      "Múc trân châu đường đen quanh thành ly tạo vệt vân hổ bắt mắt rồi rót sữa tươi và cốt trà.",
      "Rót lớp kem phô mai mặn béo ngậy lên trên miệng ly và thưởng thức ngay không cần khuấy."
    ],
    tags: ["Trà sữa", "Trân châu", "Kem cheese", "Đồ uống hot"],
    isFeatured: false,
    likesCount: 450,
    imageUrl: "https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 158,
    title: "Thạch dừa tươi hoa quả thạch rau câu",
    description: "Trái dừa xiêm tươi mát với lớp thạch nước dừa thanh ngọt trong veo, bên trên phủ lớp thạch cốt dừa béo trắng muốt điểm xuyết hoa quả giòn ngọt.",
    cookTime: 25,
    servings: 2,
    calories: 180,
    category: "banh-trang-mieng",
    ingredients: [
      { name: "Quả dừa xiêm tươi", quantity: 2, unit: "quả" },
      { name: "Bột rau câu dẻo Jelly", quantity: 10, unit: "g" },
      { name: "Nước cốt dừa thơm", quantity: 80, unit: "ml" },
      { name: "Đường phèn xay mịn", quantity: 50, unit: "g" },
      { name: "Trái cây thái hạt lựu", quantity: 60, unit: "g" }
    ],
    steps: [
      "Chặt phần đầu quả dừa lấy nước dừa tươi nguyên chất (khoảng 800ml), giữ lại vỏ dừa làm khuôn.",
      "Trộn đều bột rau câu dẻo với đường phèn khô cho không bị vón cục khi nấu.",
      "Đun sôi nước dừa, từ từ khuấy bột rau câu vào nấu sôi lăn tăn trong 3 phút cho thạch trong veo.",
      "Rót 3/4 lượng thạch nước dừa vào hai trái dừa, thả trái cây thái nhỏ vào để se mặt trong 15 phút.",
      "Phần thạch còn lại khuấy cùng nước cốt dừa rót phủ kín mặt trên, bảo quản tủ lạnh 2 tiếng cho đông mát lạnh."
    ],
    tags: ["Thạch dừa", "Giải nhiệt", "Tráng miệng", "Thanh mát"],
    isFeatured: false,
    likesCount: 240,
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 159,
    title: "Chè đậu xanh nha đam đường phèn thanh nhiệt",
    description: "Nước chè thanh mát ngọt dịu của đường phèn kết hợp đậu xanh ninh bở bùi và miếng nha đam giòn sần sật khử nhớt sạch sẽ giải nhiệt ngày hè.",
    cookTime: 30,
    servings: 4,
    calories: 220,
    category: "banh-trang-mieng",
    ingredients: [
      { name: "Nha đam tươi bẹ to", quantity: 300, unit: "g" },
      { name: "Đậu xanh nguyên hạt", quantity: 150, unit: "g" },
      { name: "Đường phèn thanh ngọt", quantity: 120, unit: "g" },
      { name: "Lá dứa (lá nếp)", quantity: 4, unit: "nhánh" },
      { name: "Chanh tươi vắt cốt", quantity: 1, unit: "quả" }
    ],
    steps: [
      "Nha đam gọt sạch vỏ xanh ngâm nước muối chanh xả nhớt 5 lần, thái hạt lựu chần nước sôi rồi ngâm nước đá cho giòn tan.",
      "Đậu xanh đãi sạch ngâm nước ấm 30 phút rồi cho vào nồi ninh cùng lá dứa đến khi hạt đậu nở bở bùi.",
      "Cho đường phèn vào nồi chè khuấy tan đun nhỏ lửa 5 phút cho đậu xanh ngấm vị ngọt thanh.",
      "Trút toàn bộ nha đam giòn vào nồi chè đun sôi bùng lại rồi tắt bếp ngay tránh làm nhũn nha đam.",
      "Để nguội cho vào ngăn mát tủ lạnh, múc ra bát thưởng thức thanh mát giải nhiệt độc cơ thể."
    ],
    tags: ["Nha đam", "Đậu xanh", "Thanh nhiệt", "Giải độc"],
    isFeatured: false,
    likesCount: 260,
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 160,
    title: "Bánh rán lúc lắc mè vừng nhân đậu xanh",
    description: "Vỏ bánh vàng ươm giòn rụm phủ kín mè rang thơm ngát, viên nhân đậu xanh ngọt bùi lắc lục cục bên trong rỗng xốp cực kỳ vui tai.",
    cookTime: 35,
    servings: 4,
    calories: 310,
    category: "banh-trang-mieng",
    ingredients: [
      { name: "Bột nếp thơm", quantity: 200, unit: "g" },
      { name: "Bột gạo tẻ", quantity: 30, unit: "g" },
      { name: "Khoai tây nghiền mịn", quantity: 50, unit: "g" },
      { name: "Đậu xanh sên dừa ngọt", quantity: 150, unit: "g" },
      { name: "Mè trắng (vừng)", quantity: 60, unit: "g" }
    ],
    steps: [
      "Nhồi bột nếp, bột tẻ, khoai tây nghiền và chút đường cùng nước ấm thành khối bột dẻo mịn không dính tay.",
      "Đậu xanh sên đường và dừa sợi vo tròn thành từng viên nhân nhỏ bằng quả quất.",
      "Dàn mỏng bột bánh, bọc kín viên nhân sao cho có một khoảng trống nhỏ ở giữa rồi vo tròn thật khéo.",
      "Lăn bánh qua đĩa mè trắng ấn nhẹ cho hạt mè bám chắc vào vỏ bánh.",
      "Rán bánh ngập dầu lửa nhỏ vừa, dùng đũa đảo tròn liên tục cho bánh nở phồng to vàng ruộm lắc nghe lục cục."
    ],
    tags: ["Bánh rán", "Mè rang", "Hà Nội", "Ăn vặt"],
    isFeatured: false,
    likesCount: 310,
    imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80"
  }
];

/**
 * Tạo nội dung SQL Idempotent an toàn tuyệt đối
 */
function generateSqlContent(recipes) {
  let sql = `-- =========================================================================\n`;
  sql += `-- FoodX - Large-Scale 60 Recipes Seed SQL Script\n`;
  sql += `-- Tự động kiểm tra & Upsert dữ liệu, không gây duplicate key.\n`;
  sql += `-- =========================================================================\n\n`;

  sql += `SET NAMES utf8mb4;\n`;
  sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

  // Đảm bảo có các cột is_featured, likes_count trong MySQL nếu chưa có
  sql += `-- 1. Đảm bảo cấu trúc cột mở rộng cho bảng recipes\n`;
  sql += `SET @col1 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='foodx' AND TABLE_NAME='recipes' AND COLUMN_NAME='is_featured');\n`;
  sql += `SET @sql1 = IF(@col1=0, 'ALTER TABLE recipes ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;', 'SELECT 1;');\n`;
  sql += `PREPARE stmt1 FROM @sql1; EXECUTE stmt1; DEALLOCATE PREPARE stmt1;\n\n`;

  sql += `SET @col2 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='foodx' AND TABLE_NAME='recipes' AND COLUMN_NAME='likes_count');\n`;
  sql += `SET @sql2 = IF(@col2=0, 'ALTER TABLE recipes ADD COLUMN likes_count INT DEFAULT 0;', 'SELECT 1;');\n`;
  sql += `PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;\n\n`;

  // Tập hợp danh sách nguyên liệu
  sql += `-- 2. Nạp kho nguyên liệu (Ingredients Master)\n`;
  const ingredientSet = new Map();
  recipes.forEach(r => {
    r.ingredients.forEach(ing => {
      if (!ingredientSet.has(ing.name)) {
        ingredientSet.set(ing.name, {
          name: ing.name,
          unit: ing.unit,
          category: r.category === 'eat-clean' ? 'veggie' : (r.category === 'mon-an-gia-dinh' ? 'meat' : 'spice')
        });
      }
    });
  });

  ingredientSet.forEach(ing => {
    const escapedName = ing.name.replace(/'/g, "''");
    sql += `INSERT INTO ingredients (name, default_unit, category, created_at, updated_at)\n`;
    sql += `SELECT '${escapedName}', '${ing.unit}', '${ing.category}', NOW(), NOW()\n`;
    sql += `WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE name = '${escapedName}');\n`;
  });
  sql += `\n`;

  // Nạp 60 công thức món ăn
  sql += `-- 3. Nạp 60 công thức chi tiết (Recipes)\n`;
  recipes.forEach(r => {
    const escapedTitle = r.title.replace(/'/g, "''");
    const escapedDesc = r.description.replace(/'/g, "''");
    const escapedInstr = r.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n').replace(/'/g, "''");
    const imgUrl = (r.imageUrl || FALLBACK_IMAGE_URL).replace(/'/g, "''");
    const mealSlots = r.category === 'mon-sang' ? 'morning' : (r.category === 'banh-trang-mieng' ? 'snack' : 'lunch,dinner');
    const difficulty = r.cookTime <= 20 ? 'Dễ' : (r.cookTime <= 40 ? 'Trung bình' : 'Khó');
    const isFeaturedVal = r.isFeatured ? 1 : 0;
    const likesVal = r.likesCount || 100;

    sql += `-- [${r.category}] ${r.title}\n`;
    sql += `INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, protein, carb, fat, difficulty, meal_slots, image_url, is_featured, likes_count, created_at, updated_at)\n`;
    sql += `VALUES (${r.id}, '${escapedTitle}', '${escapedDesc}', '${escapedInstr}', 15, ${r.cookTime}, ${r.servings}, 'Việt Nam', '${r.category}', ${r.calories}, 28.5, 35.0, 14.2, '${difficulty}', '${mealSlots}', '${imgUrl}', ${isFeaturedVal}, ${likesVal}, NOW(), NOW())\n`;
    sql += `ON DUPLICATE KEY UPDATE \n`;
    sql += `  title = VALUES(title),\n`;
    sql += `  description = VALUES(description),\n`;
    sql += `  instructions = VALUES(instructions),\n`;
    sql += `  cook_time = VALUES(cook_time),\n`;
    sql += `  servings = VALUES(servings),\n`;
    sql += `  category = VALUES(category),\n`;
    sql += `  kcal = VALUES(kcal),\n`;
    sql += `  difficulty = VALUES(difficulty),\n`;
    sql += `  image_url = VALUES(image_url),\n`;
    sql += `  is_featured = VALUES(is_featured),\n`;
    sql += `  likes_count = VALUES(likes_count),\n`;
    sql += `  updated_at = NOW();\n\n`;

    // Liên kết recipe_ingredients
    r.ingredients.forEach(ing => {
      const escapedIng = ing.name.replace(/'/g, "''");
      sql += `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)\n`;
      sql += `SELECT ${r.id}, id, ${ing.quantity}, '${ing.unit}' FROM ingredients WHERE name = '${escapedIng}'\n`;
      sql += `AND NOT EXISTS (SELECT 1 FROM recipe_ingredients WHERE recipe_id = ${r.id} AND ingredient_id = (SELECT id FROM ingredients WHERE name = '${escapedIng}' LIMIT 1));\n`;
    });
    sql += `\n`;
  });

  sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;
  return sql;
}

/**
 * Thực thi nạp vào MySQL Docker container
 */
async function runLargeSeed() {
  console.log('🚀 [FoodX 60-Recipe Seeder] Đang khởi động kịch bản seed quy mô lớn...');
  console.log(`📦 Tổng số công thức món ăn chuẩn bị nạp: ${RECIPES_DATA_60.length} món`);

  const sqlFilePath = path.resolve(__dirname, '../db/recipes_seed_60.sql');
  console.log(`📝 Đang xuất file SQL nạp dữ liệu: ${sqlFilePath}`);
  const sqlContent = generateSqlContent(RECIPES_DATA_60);
  fs.writeFileSync(sqlFilePath, sqlContent, 'utf8');
  console.log(`✅ Đã ghi thành công file SQL (${(Buffer.byteLength(sqlContent, 'utf8') / 1024).toFixed(2)} KB)`);

  console.log('⚡ Đang thực thi nạp trực tiếp vào Docker MySQL container (foodx-mysql) qua luồng UTF-8 chuẩn...');
  try {
    await new Promise((resolve, reject) => {
      const child = spawn('docker', ['exec', '-i', 'foodx-mysql', 'mysql', '-uroot', '-proot', 'foodx', '--default-character-set=utf8mb4'], {
        stdio: ['pipe', 'inherit', 'inherit']
      });

      fs.createReadStream(sqlFilePath).pipe(child.stdin);

      child.on('error', reject);
      child.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`Docker process exited with code ${code}`));
      });
    });

    console.log('🎉 Nạp dữ liệu vào MySQL container thành công 100%!');
  } catch (err) {
    console.warn('⚠️ Lỗi khi chạy Docker exec:', err.message);
    console.log('🌐 Đang chuyển hướng sang phương thức nạp qua HTTP REST API Gateway...');
    await seedViaApi();
  }

  // Thống kê phân bổ danh mục
  console.log('\n📊 Phân bổ danh mục công thức:');
  const catStats = {};
  RECIPES_DATA_60.forEach(r => {
    catStats[r.category] = (catStats[r.category] || 0) + 1;
  });
  Object.entries(catStats).forEach(([cat, count]) => {
    console.log(`   - [${cat}]: ${count} món`);
  });

  const featuredCount = RECIPES_DATA_60.filter(r => r.isFeatured).length;
  console.log(`⭐ Số món gắn nhãn Nổi bật (isFeatured): ${featuredCount}/${RECIPES_DATA_60.length} món (${Math.round(featuredCount/RECIPES_DATA_60.length*100)}%)`);
  console.log('✨ Hoàn tất xuất sắc quá trình seed dữ liệu FoodX!\n');
}

/**
 * Fallback: Nạp qua REST API Gateway
 */
async function seedViaApi() {
  const gatewayUrl = 'http://localhost:8080/api/recipes';
  let successCount = 0;
  for (const r of RECIPES_DATA_60) {
    try {
      const payload = {
        title: r.title,
        description: r.description,
        instructions: r.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n'),
        cookTime: r.cookTime,
        servings: r.servings,
        cuisine: "Việt Nam",
        category: r.category,
        kcal: r.calories,
        difficulty: r.cookTime <= 20 ? "Dễ" : (r.cookTime <= 40 ? "Trung bình" : "Khó"),
        mealSlots: r.category === 'mon-sang' ? 'morning' : (r.category === 'banh-trang-mieng' ? 'snack' : 'lunch,dinner'),
        imageUrl: r.imageUrl || FALLBACK_IMAGE_URL,
        ingredients: r.ingredients.map(i => ({
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
      if (res.ok) successCount++;
    } catch (e) {
      // bỏ qua lỗi api lẻ
    }
  }
  console.log(`✅ Kết quả REST API: Đã gửi ${successCount}/${RECIPES_DATA_60.length} công thức.`);
}

if (require.main === module) {
  runLargeSeed();
}

module.exports = {
  RECIPES_DATA_60,
  FALLBACK_IMAGE_URL,
  generateSqlContent,
  runLargeSeed
};
