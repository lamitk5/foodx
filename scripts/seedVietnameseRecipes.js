/**
 * FoodX - Seed Script: Bảng dữ liệu chuẩn xác 10 món ăn Việt Nam & URL ảnh CDN trực tiếp
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const RECIPE_COPY = {
  'Phở bò tái Hà Nội': {
    description: 'Tô phở nước dùng trong, thơm hoa hồi và gừng nướng, thịt bò tái mềm với bánh phở dai.',
    instructions: '1. Ninh xương bò với gừng nướng, hành khô, hoa hồi và thảo quả 3–4 giờ.\\n2. Nêm muối, nước mắm, đường phèn cho nước dùng trong ngọt.\\n3. Trụng bánh phở, xếp thịt bò tái và hành lá.\\n4. Chan nước dùng thật nóng rồi thưởng thức.'
  },
  'Cơm chiên trứng kiểu Việt': {
    description: 'Món cơm chiên nhanh gọn với trứng, hành tím và cơm nguội.',
    instructions: '1. Đánh tan trứng với một chút nước mắm.\\n2. Phi thơm hành tím và tỏi.\\n3. Đổ trứng vào xào sơ, cho cơm nguội đảo đều.\\n4. Nêm lại rồi tắt bếp, dọn ra đĩa.'
  },
  'Gà kho gừng sả ớt': {
    description: 'Gà kho đậm đà với gừng, sả và ớt, thơm cùng cơm nóng.',
    instructions: '1. Ướp gà với nước mắm, gừng, sả, ớt và tiêu.\\n2. Phi thơm gừng và sả, cho gà vào đảo săn.\\n3. Kho lửa nhỏ đến khi nước sệt.\\n4. Nêm lại rồi dọn ra đĩa.'
  },
  'Thịt kho tàu nước dừa': {
    description: 'Thịt ba chỉ kho nước dừa và trứng, màu cánh gián, mềm và đậm vị.',
    instructions: '1. Luộc sơ thịt rồi cắt miếng vừa ăn.\\n2. Kho thịt với nước dừa, nước mắm và đường đến khi lên màu.\\n3. Cho trứng luộc vào kho thêm 15 phút.\\n4. Nêm lại cho mặn ngọt vừa ăn.'
  },
  'Bún chả Hà Nội': {
    description: 'Chả thịt nướng thơm, ăn với bún và nước mắm chua ngọt.',
    instructions: '1. Ướp thịt ba chỉ và thịt nạc với nước mắm, đường, tỏi.\\n2. Nướng hoặc áp chảo đến khi vàng cạnh.\\n3. Pha nước chấm chua ngọt, thêm đu đủ cà rốt.\\n4. Ăn kèm bún tươi và rau sống.'
  },
  'Nem rán truyền thống': {
    description: 'Nem thịt băm rau củ, vỏ giòn, chấm nước mắm chua ngọt.',
    instructions: '1. Trộn thịt băm, miến, mộc nhĩ, cà rốt và gia vị.\\n2. Cuốn nem thật chặt.\\n3. Chiên vàng đều hai mặt.\\n4. Ăn nóng với rau sống và nước chấm.'
  },
  'Cá hồi áp chảo măng tây': {
    description: 'Bữa tối healthy với cá hồi áp chảo và măng tây giòn.',
    instructions: '1. Ướp cá hồi với muối, tiêu và chanh.\\n2. Áp chảo cá mỗi mặt 3–4 phút.\\n3. Xào măng tây với một ít dầu và tỏi.\\n4. Dọn cá cùng măng tây khi còn nóng.'
  },
  'Salad ức gà sốt mè rang': {
    description: 'Ức gà áp chảo ăn kèm rau xanh và sốt mè rang thanh nhẹ.',
    instructions: '1. Ướp ức gà với muối, tiêu.\\n2. Áp chảo chín tới, thái lát.\\n3. Trộn rau với sốt mè rang.\\n4. Xếp gà lên salad và dùng ngay.'
  },
  'Bánh mì kẹp pate thịt nướng': {
    description: 'Bánh mì giòn kẹp pate, thịt nướng, đồ chua và rau thơm.',
    instructions: '1. Nướng bánh mì cho vỏ giòn.\\n2. Phết pate, xếp thịt nướng.\\n3. Thêm đồ chua, dưa leo và rau mùi.\\n4. Chan ít nước sốt rồi thưởng thức.'
  },
  'Canh chua cá lóc miền Nam': {
    description: 'Canh chua thanh với cá lóc, cà chua, dứa và rau thơm.',
    instructions: '1. Xào sơ cà chua và dứa cho ra nước.\\n2. Thêm nước, nêm me, nước mắm, đường.\\n3. Cho cá lóc vào nấu chín tới.\\n4. Tắt bếp, cho rau thơm và ớt.'
  }
};

const VIETNAMESE_RECIPES = [
  {
    id: "rec-01",
    title: "Phở bò tái Hà Nội",
    category: "mon-sang",
    cookTime: 45,
    calories: 450,
    imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-02",
    title: "Cơm chiên trứng kiểu Việt",
    category: "nau-nhanh",
    cookTime: 15,
    calories: 380,
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-03",
    title: "Gà kho gừng sả ớt",
    category: "mon-an-gia-dinh",
    cookTime: 30,
    calories: 420,
    imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-04",
    title: "Thịt kho tàu nước dừa",
    category: "mon-an-gia-dinh",
    cookTime: 50,
    calories: 520,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-05",
    title: "Bún chả Hà Nội",
    category: "mon-sang",
    cookTime: 40,
    calories: 480,
    imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-06",
    title: "Nem rán truyền thống",
    category: "mon-an-gia-dinh",
    cookTime: 35,
    calories: 410,
    imageUrl: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-07",
    title: "Cá hồi áp chảo măng tây",
    category: "eat-clean",
    cookTime: 20,
    calories: 360,
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-08",
    title: "Salad ức gà sốt mè rang",
    category: "eat-clean",
    cookTime: 15,
    calories: 290,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-09",
    title: "Bánh mì kẹp pate thịt nướng",
    category: "nau-nhanh",
    cookTime: 10,
    calories: 350,
    imageUrl: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rec-10",
    title: "Canh chua cá lóc miền Nam",
    category: "mon-an-gia-dinh",
    cookTime: 30,
    calories: 310,
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80"
  }
];

async function applyToDatabase() {
  console.log('🚀 [FoodX] Cập nhật bảng dữ liệu 10 món ăn Việt Nam chuẩn vào Database...');
  
  let sql = 'SET NAMES utf8mb4;\n';
  VIETNAMESE_RECIPES.forEach((r, idx) => {
    const numId = idx + 1;
    const titleEsc = r.title.replace(/'/g, "''");
    const imgEsc = r.imageUrl.replace(/'/g, "''");
    
    // Ghi đè chính xác theo numId (1-10) và cập nhật nếu có bản ghi cùng tên
    const copy = RECIPE_COPY[r.title] || {
      description: 'Món ăn truyền thống thơm ngon đậm đà bản sắc ẩm thực Việt Nam.',
      instructions: '1. Chuẩn bị nguyên liệu tươi ngon.\\n2. Nấu chín theo thời gian tiêu chuẩn.\\n3. Thưởng thức nóng.'
    };
    const descEsc = copy.description.replace(/'/g, "''");
    const stepsEsc = copy.instructions.replace(/'/g, "''");
    sql += `UPDATE recipes SET title='${titleEsc}', description='${descEsc}', instructions='${stepsEsc}', image_url='${imgEsc}', category='${r.category}', cook_time=${r.cookTime}, kcal=${r.calories} WHERE id=${numId};\n`;
    sql += `UPDATE recipes SET description='${descEsc}', instructions='${stepsEsc}', image_url='${imgEsc}', category='${r.category}', cook_time=${r.cookTime}, kcal=${r.calories} WHERE title='${titleEsc}';\n`;
    sql += `INSERT INTO recipes (id, title, description, instructions, prep_time, cook_time, servings, cuisine, category, kcal, difficulty, image_url, created_at, updated_at)\n`;
    sql += `SELECT ${numId}, '${titleEsc}', '${descEsc}', '${stepsEsc}', 10, ${r.cookTime}, 3, 'Việt Nam', '${r.category}', ${r.calories}, '${r.cookTime <= 20 ? 'Dễ' : 'Trung bình'}', '${imgEsc}', NOW(), NOW()\n`;
    sql += `WHERE NOT EXISTS (SELECT 1 FROM recipes WHERE id=${numId});\n\n`;
  });

  const tempSqlPath = path.resolve(__dirname, '../db/temp_update_10_vietnamese.sql');
  fs.writeFileSync(tempSqlPath, sql, 'utf8');

  try {
    await new Promise((resolve, reject) => {
      const child = spawn('docker', ['exec', '-i', 'foodx-mysql', 'mysql', '-uroot', '-proot', 'foodx', '--default-character-set=utf8mb4'], {
        stdio: ['pipe', 'inherit', 'inherit']
      });
      fs.createReadStream(tempSqlPath).pipe(child.stdin);
      child.on('error', reject);
      child.on('close', code => code === 0 ? resolve() : reject(new Error(`Exit code ${code}`)));
    });
    console.log('✅ Đã cập nhật thành công 10 món ăn Việt Nam & liên kết ảnh CDN vào MySQL database!');
  } catch (err) {
    console.warn('⚠️ Lỗi kết nối Docker MySQL:', err.message);
  } finally {
    if (fs.existsSync(tempSqlPath)) fs.unlinkSync(tempSqlPath);
  }
}

if (require.main === module) {
  applyToDatabase();
}

module.exports = { VIETNAMESE_RECIPES, applyToDatabase };
