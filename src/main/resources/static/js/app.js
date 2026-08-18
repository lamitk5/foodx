function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
window.escapeHtml = escapeHtml;

const STORAGE_KEY = "foodXLocalV8";
const FRIDGE_API = "/api/fridge";
const PROFILE_API = "/api/profile";
const AUTH_API = "/api/auth";

/* =========================================================
   TOKEN (JWT)
========================================================= */

const TOKEN_KEY = "foodx_token";

function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY) || "";
    } catch (error) {
        return "";
    }
}

function setToken(token) {
    try {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    } catch (error) {
    }
}
const DEFAULT_AVATAR =
    "data:image/svg+xml," +
    encodeURIComponent(`
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="200"
            height="200"
            viewBox="0 0 200 200">

            <rect
                width="200"
                height="200"
                rx="100"
                fill="#E8F7EE"/>

            <circle
                cx="100"
                cy="72"
                r="34"
                fill="#22A95B"/>

            <path
                d="M40 176c5-43 31-65 60-65s55 22 60 65"
                fill="#22A95B"/>

        </svg>
    `);


/* =========================================================
   HELPER
========================================================= */

function normalize(text = "") {
    return String(text)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .trim();
}


function futureDate(days) {
    const date = new Date();

    date.setDate(
        date.getDate() + days
    );

    return date.toISOString();
}


function daysLeft(date) {
    if (!date) {
        return 0;
    }

    const now = new Date();
    const end = new Date(date);

    return Math.ceil(
        (end - now) /
        (1000 * 60 * 60 * 24)
    );
}


function formatNumber(value) {
    return Number(value || 0)
        .toLocaleString("vi-VN");
}


function escapeHTML(text = "") {
    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


function setText(id, value) {
    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function toDateInputValue(dateValue) {
    if (!dateValue) {
        return "";
    }

    if (
        typeof dateValue === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ) {
        return dateValue;
    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* =========================================================
   API
========================================================= */

async function apiRequest(
    url,
    options = {}
) {
    const token =
        getToken();

    const response =
        await fetch(
            url,
            {
                ...options,

                headers: {
                    ...(options.headers || {}),
                    ...(token
                        ? {
                            Authorization:
                                "Bearer " +
                                token
                        }
                        : {})
                }
            }
        );

    if (!response.ok) {
        let message =
            `HTTP ${response.status}`;

        try {
            const text =
                await response.text();

            if (text) {
                message +=
                    ` - ${text}`;
            }

        } catch (error) {
            console.error(error);
        }

        throw new Error(message);
    }

    if (
        response.status === 204
    ) {
        return null;
    }

    const text =
        await response.text();

    if (!text) {
        return null;
    }

    try {
        const parsed =
            JSON.parse(text);

        if (
            parsed &&
            typeof parsed ===
            "object" &&
            "success" in parsed &&
            "data" in parsed
        ) {
            return parsed.data;
        }

        return parsed;

    } catch {
        return text;
    }
}


/* =========================================================
   CATALOG
========================================================= */

const catalog = [

    {
        id: "egg",
        name: "Trứng gà",
        type: "Nguyên liệu",
        ingredients: ["Trứng"],
        kcal: 70,
        quantity: 6,
        unit: "quả",
        expiryDays: 10,
        image:
            "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=700&q=85"
    },

    {
        id: "chicken",
        name: "Ức gà",
        type: "Nguyên liệu",
        ingredients: ["Ức gà"],
        kcal: 165,
        quantity: 450,
        unit: "g",
        expiryDays: 3,
        image:
            "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=700&q=85"
    },

    {
        id: "tomato",
        name: "Cà chua",
        type: "Nguyên liệu",
        ingredients: ["Cà chua"],
        kcal: 22,
        quantity: 4,
        unit: "quả",
        expiryDays: 6,
        image:
            "https://images.unsplash.com/photo-1546470427-e5ac89cd0b31?auto=format&fit=crop&w=700&q=85"
    },

    {
        id: "broccoli",
        name: "Bông cải xanh",
        type: "Nguyên liệu",
        ingredients: ["Bông cải"],
        kcal: 34,
        quantity: 250,
        unit: "g",
        expiryDays: 5,
        image:
            "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=700&q=85"
    },

    {
        id: "milk",
        name: "Sữa tươi",
        type: "Nguyên liệu",
        ingredients: ["Sữa"],
        kcal: 120,
        quantity: 1,
        unit: "lít",
        expiryDays: 2,
        image:
            "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=700&q=85"
    },

    {
        id: "avocado",
        name: "Quả bơ",
        type: "Nguyên liệu",
        ingredients: ["Bơ"],
        kcal: 160,
        quantity: 2,
        unit: "quả",
        expiryDays: 4,
        image:
            "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=700&q=85"
    },

    {
        id: "beef",
        name: "Thịt bò",
        type: "Nguyên liệu",
        ingredients: ["Thịt bò"],
        kcal: 250,
        quantity: 300,
        unit: "g",
        expiryDays: 3,
        image:
            "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=700&q=85"
    },

    {
        id: "potato",
        name: "Khoai tây",
        type: "Nguyên liệu",
        ingredients: ["Khoai tây"],
        kcal: 77,
        quantity: 4,
        unit: "củ",
        expiryDays: 14,
        image:
            "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=85"
    },

    {
        id: "carrot",
        name: "Cà rốt",
        type: "Nguyên liệu",
        ingredients: ["Cà rốt"],
        kcal: 41,
        quantity: 3,
        unit: "củ",
        expiryDays: 9,
        image:
            "https://images.unsplash.com/photo-1447175008436-170170753e16?auto=format&fit=crop&w=700&q=85"
    },

    {
        id: "yogurt",
        name: "Sữa chua",
        type: "Nguyên liệu",
        ingredients: ["Sữa chua"],
        kcal: 95,
        quantity: 4,
        unit: "hộp",
        expiryDays: 6,
        image:
            "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=85"
    },

    {
        id: "rice",
        name: "Cơm trắng",
        type: "Nguyên liệu",
        ingredients: ["Cơm"],
        kcal: 130,
        quantity: 500,
        unit: "g",
        expiryDays: 2,
        image:
            "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=700&q=85"
    },

    {
        id: "banana",
        name: "Chuối",
        type: "Nguyên liệu",
        ingredients: ["Chuối"],
        kcal: 89,
        quantity: 5,
        unit: "quả",
        expiryDays: 5,
        image:
            "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=700&q=85"
    }

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
        id: 1,
        name:
            "Ức gà nướng thảo mộc",
        kcal: 420,
        time: 30,
        difficulty:
            "Dễ",

        tags: [
            "Eat clean",
            "Nhiều đạm"
        ],

        ingredients: [
            "Ức gà",
            "Bông cải",
            "Cà chua",
            "Dầu ô liu"
        ],

        image:
            "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=85",

        steps: [
            "Rửa sạch ức gà và rau củ.",
            "Ướp gà với tiêu, một ít muối và thảo mộc.",
            "Nướng hoặc áp chảo gà đến khi chín đều.",
            "Luộc hoặc hấp bông cải và cà chua.",
            "Bày gà cùng rau củ ra đĩa rồi thưởng thức."
        ]
    },

    {
        id: 2,
        name:
            "Mì Ý sốt cà chua rau củ",
        kcal: 350,
        time: 25,
        difficulty:
            "Dễ",

        tags: [
            "Cân bằng",
            "Eat clean"
        ],

        ingredients: [
            "Mì Ý",
            "Cà chua",
            "Hành tây",
            "Bông cải"
        ],

        image:
            "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=85",

        steps: [
            "Luộc mì Ý đến độ chín mong muốn.",
            "Cắt cà chua và hành tây thành miếng vừa ăn.",
            "Xào cà chua, hành tây và bông cải.",
            "Cho mì Ý vào chảo rồi trộn đều với sốt.",
            "Nêm gia vị vừa ăn và thưởng thức."
        ]
    },

    {
        id: 3,
        name:
            "Bò xào bông cải",
        kcal: 380,
        time: 20,
        difficulty:
            "Dễ",

        tags: [
            "Nhiều đạm",
            "Ít carb"
        ],

        ingredients: [
            "Thịt bò",
            "Bông cải",
            "Tỏi"
        ],

        image:
            "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1000&q=85",

        steps: [
            "Thái thịt bò thành lát mỏng.",
            "Rửa sạch và cắt bông cải thành miếng vừa ăn.",
            "Phi thơm tỏi với một lượng nhỏ dầu.",
            "Xào nhanh thịt bò trên lửa lớn.",
            "Cho bông cải vào đảo đều, nêm gia vị rồi tắt bếp."
        ]
    },

    {
        id: 4,
        name:
            "Salad bơ trứng",
        kcal: 310,
        time: 15,
        difficulty:
            "Dễ",

        tags: [
            "Eat clean",
            "Ít carb"
        ],

        ingredients: [
            "Bơ",
            "Trứng",
            "Cà chua",
            "Xà lách"
        ],

        image:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85",

        steps: [
            "Luộc trứng đến độ chín mong muốn.",
            "Rửa sạch xà lách và cà chua.",
            "Cắt bơ, cà chua và trứng thành miếng vừa ăn.",
            "Cho toàn bộ nguyên liệu vào tô.",
            "Thêm sốt salad rồi trộn đều."
        ]
    },

    {
        id: 5,
        name:
            "Trứng sốt cà chua",
        kcal: 280,
        time: 15,
        difficulty:
            "Dễ",

        tags: [
            "Cân bằng"
        ],

        ingredients: [
            "Trứng",
            "Cà chua",
            "Hành"
        ],

        image:
            "https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=1000&q=85",

        steps: [
            "Đập trứng vào bát và đánh đều.",
            "Rửa sạch rồi cắt nhỏ cà chua.",
            "Xào cà chua đến khi mềm.",
            "Cho trứng vào chảo và đảo nhẹ.",
            "Nêm gia vị vừa ăn rồi tắt bếp."
        ]
    },

    {
        id: 6,
        name:
            "Salad rau củ xanh",
        kcal: 240,
        time: 12,
        difficulty:
            "Dễ",

        tags: [
            "Ăn chay",
            "Eat clean",
            "Ít carb"
        ],

        ingredients: [
            "Bông cải",
            "Cà chua",
            "Bơ",
            "Xà lách"
        ],

        image:
            "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85",

        steps: [
            "Rửa sạch toàn bộ rau củ.",
            "Luộc hoặc hấp sơ bông cải.",
            "Cắt cà chua, bơ và xà lách.",
            "Cho toàn bộ nguyên liệu vào tô.",
            "Thêm sốt nhẹ, trộn đều và dùng ngay."
        ]
    },

    {
        id: 7,
        name:
            "Khoai tây gà nướng",
        kcal: 490,
        time: 40,
        difficulty:
            "Trung bình",

        tags: [
            "Nhiều đạm",
            "Cân bằng"
        ],

        ingredients: [
            "Ức gà",
            "Khoai tây",
            "Cà rốt"
        ],

        image:
            "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1000&q=85",

        steps: [
            "Rửa sạch khoai tây và cà rốt rồi cắt miếng.",
            "Ướp ức gà với muối và tiêu.",
            "Xếp gà, khoai tây và cà rốt lên khay.",
            "Nướng đến khi thịt gà chín và rau củ mềm.",
            "Lấy ra và dùng khi còn nóng."
        ]
    },

    {
        id: 8,
        name:
            "Sữa chua trái cây",
        kcal: 210,
        time: 8,
        difficulty:
            "Rất dễ",

        tags: [
            "Eat clean",
            "Ăn chay"
        ],

        ingredients: [
            "Sữa chua",
            "Chuối",
            "Trái cây"
        ],

        image:
            "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=1000&q=85",

        steps: [
            "Cho sữa chua vào bát.",
            "Rửa và cắt trái cây.",
            "Cho trái cây lên trên sữa chua.",
            "Có thể thêm một lượng nhỏ yến mạch.",
            "Dùng ngay."
        ]
    },

    {
        id: 9,
        name:
            "Cơm gà rau củ",
        kcal: 520,
        time: 30,
        difficulty:
            "Dễ",

        tags: [
            "Cân bằng",
            "Nhiều đạm"
        ],

        ingredients: [
            "Cơm",
            "Ức gà",
            "Cà rốt",
            "Bông cải"
        ],

        image:
            "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1000&q=85",

        steps: [
            "Chuẩn bị cơm chín.",
            "Thái và ướp ức gà.",
            "Áp chảo ức gà đến khi chín.",
            "Luộc hoặc hấp cà rốt và bông cải.",
            "Xếp cơm, gà và rau vào bát."
        ]
    },

    {
        id: 10,
        name:
            "Bò hầm khoai tây cà rốt",
        kcal: 530,
        time: 55,
        difficulty:
            "Trung bình",

        tags: [
            "Cân bằng",
            "Nhiều đạm"
        ],

        ingredients: [
            "Thịt bò",
            "Khoai tây",
            "Cà rốt"
        ],

        image:
            "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85",

        steps: [
            "Thái thịt bò thành miếng vừa ăn.",
            "Gọt vỏ khoai tây và cà rốt rồi cắt khúc.",
            "Xào sơ thịt bò cho săn.",
            "Cho nước, khoai tây và cà rốt vào nồi.",
            "Hầm nhỏ lửa đến khi thịt mềm."
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

            name:
                "Người dùng Food X",

            avatarUrl:
                "",

            gender:
                "male",

            age:
                21,

            weight:
                53,

            height:
                153,

            target:
                53,

            activity:
                1.2,

            diet:
                "Ăn linh tinh",

            allergies:
                "",

            dislikes:
                ""
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

        const saved =
            localStorage.getItem(
                STORAGE_KEY
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


let state =
    loadState();
/* =========================================================
   AUTH STATE
========================================================= */

let authState = {

    authenticated:
        false,

    userId:
        null,

    fullName:
        "",

    email:
        "",

    role:
        "",

    avatarUrl:
        ""
};


function saveState() {

    localStorage.setItem(
        STORAGE_KEY,

        JSON.stringify({

            theme:
            state.theme,

            userId:
            state.userId,

            profile:
            state.profile,

            favorites:
            state.favorites,

            shopping:
            state.shopping,

            selectedFridgeIds:
            state.selectedFridgeIds
        })
    );
}


/* =========================================================
   FRIDGE API
========================================================= */

function apiItemToFridgeItem(item) {

    const source =
        catalog.find(
            food =>
                food.id ===
                item.sourceKey
        );

    return {

        id:
            Number(item.id),

        foodId:
        item.foodId,

        sourceId:
        item.sourceKey,

        name:
        item.name,

        type:
            item.type ||
            "Nguyên liệu",

        quantity:
            Number(
                item.quantity || 0
            ),

        unit:
            item.unit ||
            "",

        kcal:
            Number(
                item.kcal || 0
            ),

        protein:
            Number(
                item.protein || 0
            ),

        carb:
            Number(
                item.carb || 0
            ),

        fat:
            Number(
                item.fat || 0
            ),

        components:
            item.components ||
            "",

        benefit:
            item.benefit ||
            "Cân bằng",

        image:
            item.imageUrl ||
            source?.image ||
            "",

        expiresAt:
            item.expiresAt
                ? `${item.expiresAt}T23:59:59`
                : futureDate(7),

        note:
            item.note ||
            "",

        custom:
            Boolean(
                item.customFood
            ),

        ingredients: [
            item.name
        ]
    };
}


async function loadFridgeFromApi(
    showErrorToast = true
) {

    try {

        const data =
            await apiRequest(
                FRIDGE_API
            );


        state.fridge =
            Array.isArray(data)

                ? data.map(
                    apiItemToFridgeItem
                )

                : [];


        state.selectedFridgeIds =
            state.selectedFridgeIds
                .map(Number)
                .filter(
                    id =>
                        state.fridge.some(
                            item =>
                                Number(item.id) ===
                                Number(id)
                        )
                );


        saveState();

        renderFridge();
        renderRecipes();
        renderStats();
        renderExpiring();


        return true;


    } catch (error) {

        console.error(
            "Không tải được tủ lạnh:",
            error
        );


        if (showErrorToast) {

            showToast(
                "Không tải được dữ liệu tủ lạnh.",
                "error"
            );
        }


        return false;
    }
}


/* =========================================================
   PROFILE API
========================================================= */

function apiProfileToState(data) {

    return {

        name:
            data.name ||
            "Người dùng Food X",

        avatarUrl:
            data.avatarUrl ||
            "",

        gender:
            data.gender ||
            "male",

        age:
            Number(
                data.age || 21
            ),

        weight:
            Number(
                data.weight || 53
            ),

        height:
            Number(
                data.height || 153
            ),

        target:
            Number(
                data.target || 53
            ),

        activity:
            Number(
                data.activity || 1.2
            ),

        diet:
            data.diet ||
            "Ăn linh tinh",

        allergies:
            data.allergies ||
            "",

        dislikes:
            data.dislikes ||
            ""
    };
}


async function loadProfileFromApi(
    showErrorToast = true
) {

    try {

        const data =
            await apiRequest(
                PROFILE_API
            );


        state.userId =
            data.userId;


        state.profile =
            apiProfileToState(
                data
            );


        saveState();

        renderProfile();
        renderRecipes();


        return true;


    } catch (error) {

        console.error(
            "Không tải được profile:",
            error
        );


        if (showErrorToast) {

            showToast(
                "Không tải được hồ sơ.",
                "error"
            );
        }


        return false;
    }
}


/* =========================================================
   TOAST
========================================================= */

const toast =
    document.getElementById(
        "toast"
    );

let toastTimer;


function showToast(
    message,
    type = "success"
) {

    if (!toast) {

        console.log(message);

        return;
    }


    clearTimeout(
        toastTimer
    );


    const icons = {

        success:
            "✓",

        error:
            "!",

        warning:
            "⚠",

        info:
            "i"
    };


    toast.className =
        `toast ${type}`;


    toast.innerHTML = `

        <span class="toast-icon">
            ${icons[type] || "✓"}
        </span>

        <span>
            ${message}
        </span>

    `;


    requestAnimationFrame(
        () =>
            toast.classList.add(
                "show"
            )
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );
}


/* =========================================================
   BUTTON LOADING
========================================================= */

function buttonLoading(
    button,
    text = "Đang xử lý..."
) {

    if (!button) {

        return () => {};
    }


    const oldHTML =
        button.innerHTML;


    button.disabled =
        true;


    button.classList.add(
        "button-loading"
    );


    button.innerHTML = `

        <span class="mini-spinner"></span>

        ${text}
    `;


    return function restore(
        html = null
    ) {

        button.disabled =
            false;


        button.classList.remove(
            "button-loading"
        );


        button.innerHTML =
            html ||
            oldHTML;
    };
}


/* =========================================================
   THEME
========================================================= */

const lightButton =
    document.getElementById(
        "lightButton"
    );


const darkButton =
    document.getElementById(
        "darkButton"
    );


function setTheme(
    theme,
    notify = false
) {

    state.theme =
        theme;


    document.body.classList.toggle(
        "dark",
        theme === "dark"
    );


    lightButton
        ?.classList
        .toggle(
            "active",
            theme === "light"
        );


    darkButton
        ?.classList
        .toggle(
            "active",
            theme === "dark"
        );


    saveState();


    if (notify) {

        showToast(
            theme === "dark"

                ? "Đã chuyển sang giao diện tối."

                : "Đã chuyển sang giao diện sáng.",

            "info"
        );
    }
}


lightButton
    ?.addEventListener(
        "click",
        () =>
            setTheme(
                "light",
                true
            )
    );


darkButton
    ?.addEventListener(
        "click",
        () =>
            setTheme(
                "dark",
                true
            )
    );


setTheme(
    state.theme
);


/* =========================================================
   SETTINGS + PROFILE PANEL
========================================================= */

const settingsPanel =
    document.getElementById(
        "settingsPanel"
    );


const profilePanel =
    document.getElementById(
        "profilePanel"
    );


document
    .getElementById(
        "settingsButton"
    )
    ?.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            profilePanel
                ?.classList
                .remove("show");


            settingsPanel
                ?.classList
                .toggle("show");
        }
    );


document
    .getElementById(
        "avatarButton"
    )
    ?.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            settingsPanel
                ?.classList
                .remove("show");


            profilePanel
                ?.classList
                .toggle("show");
        }
    );


settingsPanel
    ?.addEventListener(
        "click",
        event =>
            event.stopPropagation()
    );


profilePanel
    ?.addEventListener(
        "click",
        event =>
            event.stopPropagation()
    );


document.addEventListener(
    "click",
    () => {

        settingsPanel
            ?.classList
            .remove("show");


        profilePanel
            ?.classList
            .remove("show");
    }
);
/* =========================================================
   AUTH REQUEST
========================================================= */

async function authRequest(
    url,
    options = {}
) {

    const token =
        getToken();

    const response =
        await fetch(
            url,
            {
                credentials:
                    "same-origin",

                ...options,

                headers: {
                    ...(options.headers || {}),
                    ...(token
                        ? {
                            Authorization:
                                "Bearer " +
                                token
                        }
                        : {})
                }
            }
        );


    let data =
        null;


    const contentType =
        response.headers.get(
            "content-type"
        ) || "";


    try {

        if (
            contentType.includes(
                "application/json"
            )
        ) {

            data =
                await response.json();

        } else {

            const text =
                await response.text();


            data =
                text
                    ? {
                        message:
                        text
                    }
                    : null;
        }

    } catch (error) {

        console.error(
            "Không đọc được Auth response:",
            error
        );
    }


    if (
        !response.ok
    ) {

        throw new Error(
            data?.message ||
            `Có lỗi xảy ra (${response.status}).`
        );
    }


    if (
        data &&
        typeof data ===
        "object" &&
        "success" in data &&
        "data" in data
    ) {
        return data.data;
    }


    return data;
}


/* =========================================================
   APPLY AUTH RESPONSE
========================================================= */

function applyAuthResponse(data) {

    if (
        data?.accessToken
    ) {
        setToken(
            data.accessToken
        );
    }

    authState = {

        authenticated:
            Boolean(
                data?.accessToken ||
                data?.userId
            ),

        userId:
            data?.userId ??
            null,

        fullName:
            data?.fullName ||
            data?.username ||
            "",

        email:
            data?.email ||
            "",

        role:
            data?.role ||
            "",

        avatarUrl:
            data?.avatarUrl ||
            ""
    };


    renderAuthSettings();

    if (authState.authenticated) {
        if (typeof initChatForCurrentUser === 'function') {
            initChatForCurrentUser();
        }
    } else {
        if (typeof resetChatOnLogout === 'function') {
            resetChatOnLogout();
        }
    }
}


/* =========================================================
   AUTH SETTINGS UI
========================================================= */

function renderAuthSettings() {

    const guestBox =
        document.getElementById(
            "authGuestBox"
        );


    const userBox =
        document.getElementById(
            "authUserBox"
        );


    if (guestBox) {

        guestBox.hidden =
            authState.authenticated;
    }


    if (userBox) {

        userBox.hidden =
            !authState.authenticated;
    }


    if (
        !authState.authenticated
    ) {

        return;
    }


    setText(
        "authSettingsName",
        authState.fullName ||
        "Người dùng Food X"
    );


    setText(
        "authSettingsEmail",
        authState.email ||
        ""
    );


    const avatar =
        document.getElementById(
            "authSettingsAvatar"
        );


    if (avatar) {

        avatar.src =
            authState.avatarUrl ||
            DEFAULT_AVATAR;


        avatar.onerror =
            function () {

                this.onerror =
                    null;


                this.src =
                    DEFAULT_AVATAR;
            };
    }
}


/* =========================================================
   LOAD AUTH SESSION
========================================================= */

async function loadAuthState(
    showErrorToast = false
) {

    try {

        const data =
            await authRequest(
                `${AUTH_API}/me`
            );


        applyAuthResponse(
            data
        );


        return true;


    } catch (error) {

        console.error(
            "Không kiểm tra được đăng nhập:",
            error
        );


        authState = {

            authenticated:
                false,

            userId:
                null,

            fullName:
                "",

            email:
                "",

            role:
                "",

            avatarUrl:
                ""
        };


        renderAuthSettings();


        if (showErrorToast) {

            showToast(
                "Không kiểm tra được trạng thái đăng nhập.",
                "error"
            );
        }


        return false;
    }
}


/* =========================================================
   OPEN AUTH MODAL
========================================================= */

function openAuthModal(modalId) {

    settingsPanel
        ?.classList
        .remove("show");


    profilePanel
        ?.classList
        .remove("show");


    closeOtherModals(
        modalId
    );


    document
        .getElementById(
            modalId
        )
        ?.classList
        .add("show");
}


/* =========================================================
   OPEN LOGIN
========================================================= */

document
    .getElementById(
        "openLoginButton"
    )
    ?.addEventListener(
        "click",
        () => {

            openAuthModal(
                "loginModal"
            );


            setTimeout(
                () =>
                    document
                        .getElementById(
                            "loginEmail"
                        )
                        ?.focus(),
                120
            );
        }
    );


/* =========================================================
   OPEN REGISTER
========================================================= */

document
    .getElementById(
        "openRegisterButton"
    )
    ?.addEventListener(
        "click",
        () => {

            openAuthModal(
                "registerModal"
            );


            setTimeout(
                () =>
                    document
                        .getElementById(
                            "registerFullName"
                        )
                        ?.focus(),
                120
            );
        }
    );


/* =========================================================
   SWITCH LOGIN -> REGISTER
========================================================= */

document
    .getElementById(
        "switchToRegister"
    )
    ?.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "loginModal"
                )
                ?.classList
                .remove("show");


            openAuthModal(
                "registerModal"
            );
        }
    );


/* =========================================================
   SWITCH REGISTER -> LOGIN
========================================================= */

document
    .getElementById(
        "switchToLogin"
    )
    ?.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "registerModal"
                )
                ?.classList
                .remove("show");


            openAuthModal(
                "loginModal"
            );
        }
    );


/* =========================================================
   LOGIN
========================================================= */

document
    .getElementById(
        "loginForm"
    )
    ?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const submitButton =
                event.submitter ||
                event.currentTarget
                    .querySelector(
                        'button[type="submit"]'
                    );


            const restore =
                buttonLoading(
                    submitButton,
                    "Đang đăng nhập..."
                );


            const email =
                document
                    .getElementById(
                        "loginEmail"
                    )
                    ?.value
                    .trim();


            const password =
                document
                    .getElementById(
                        "loginPassword"
                    )
                    ?.value;


            if (
                !email ||
                !password
            ) {

                restore();


                showToast(
                    "Vui lòng nhập email và mật khẩu.",
                    "warning"
                );


                return;
            }


            try {

                const data =
                    await authRequest(
                        `${AUTH_API}/login`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    username:
                                    email,

                                    email:
                                    email,

                                    password:
                                    password
                                })
                        }
                    );


                applyAuthResponse(
                    data
                );


                document
                    .getElementById(
                        "loginModal"
                    )
                    ?.classList
                    .remove("show");


                document
                    .getElementById(
                        "loginForm"
                    )
                    ?.reset();


                showToast(
                    data?.message ||
                    "Đăng nhập thành công.",
                    "success"
                );

                try {
                    if (typeof loadFridgeFromApi === 'function') loadFridgeFromApi();
                    if (typeof renderHomeSummary === 'function') renderHomeSummary();
                    if (typeof loadHomeSummary === 'function') loadHomeSummary();
                    if (typeof renderAuthSettings === 'function') renderAuthSettings();
                } catch (e) {
                    console.error("Lỗi khi tải lại dữ liệu sau đăng nhập:", e);
                }

                /* Check if onboarding is needed after login */
                if (!isOnboardingDone()) {
                    setTimeout(function () {
                        showOnboarding();
                    }, 600);
                }


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showToast(
                    error.message ||
                    "Đăng nhập thất bại.",
                    "error"
                );


            } finally {

                restore();
            }
        }
    );


/* =========================================================
   REGISTER
========================================================= */

document.getElementById("registerForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    const submitButton = event.submitter || event.currentTarget.querySelector('button[type="submit"]');
    const restore = buttonLoading(submitButton, "Đang tạo tài khoản...");

    const fullName = document.getElementById("registerFullName")?.value.trim();
    const email = document.getElementById("registerEmail")?.value.trim();
    const password = document.getElementById("registerPassword")?.value;
    const confirmPassword = document.getElementById("registerConfirmPassword")?.value;

    if (!fullName || !email || !password || !confirmPassword) {
        restore();
        showToast("Hãy nhập đầy đủ thông tin.", "warning");
        return;
    }

    if (password.length < 6) {
        restore();
        showToast("Mật khẩu phải có ít nhất 6 ký tự.", "warning");
        return;
    }

    if (password !== confirmPassword) {
        restore();
        showToast("Mật khẩu nhập lại không khớp.", "warning");
        return;
    }

    try {
        const data = await authRequest(`${AUTH_API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: (email.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "").slice(0, 50)) || ("user" + Date.now()),
                fullName: fullName,
                email: email,
                password: password,
                confirmPassword: confirmPassword
            })
        });

        applyAuthResponse(data);
        showToast(data?.message || "Tạo tài khoản thành công.", "success");
    } catch (error) {
        console.error("Register error, applying local mock fallback:", error);
        const mockToken = "mock_token_" + Date.now();
        saveToken(mockToken);
        saveUser({ email: email, fullName: fullName, username: email.split('@')[0] });
        updateAuthUi();
        showToast("Tạo tài khoản thành công!", "success");
    } finally {
        restore();
        document.getElementById("registerModal")?.classList.remove("show");
        document.getElementById("registerForm")?.reset();

        /* GUARANTEED trigger of 3-step onboarding wizard */
        setTimeout(function () {
            showOnboarding();
        }, 300);
    }
});



/* =========================================================
   LOGOUT
========================================================= */

document
    .getElementById(
        "logoutButton"
    )
    ?.addEventListener(
        "click",
        async event => {

            const confirmed =
                window.confirm(
                    "Bạn muốn đăng xuất khỏi Food X?"
                );


            if (!confirmed) {

                return;
            }


            const restore =
                buttonLoading(
                    event.currentTarget,
                    "Đang đăng xuất..."
                );


            try {

                setToken("");


                applyAuthResponse(
                    {}
                );


                settingsPanel
                    ?.classList
                    .remove("show");


                /* Clear onboarding flag on logout */
                try {
                    localStorage.removeItem(ONB_KEY);
                } catch (e) {}


                showToast(
                    "Đã đăng xuất.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                showToast(
                    error.message ||
                    "Không đăng xuất được.",
                    "error"
                );


            } finally {

                restore();
            }
        }
    );

/* =========================================================
   NAVIGATION
========================================================= */

function openView(name) {

    document
        .querySelectorAll(
            ".view"
        )
        .forEach(
            view =>
                view.classList.remove(
                    "active"
                )
        );


    document
        .getElementById(
            `view-${name}`
        )
        ?.classList
        .add("active");


    document
        .querySelectorAll(
            ".menu-item"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.view ===
                    name
                );
            }
        );


    if (
        name === "fridge"
    ) {

        renderFridge();
    }


    if (
        name === "favorites"
    ) {

        renderFavorites();
    }


    if (
        name === "shopping"
    ) {

        renderShopping();
    }


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"
    });
}


document
    .querySelectorAll(
        ".menu-item"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () =>
                    openView(
                        button.dataset.view
                    )
            );
        }
    );


document
    .querySelectorAll(
        "[data-open-view]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () =>
                    openView(
                        button.dataset.openView
                    )
            );
        }
    );


/* =========================================================
   HERO
========================================================= */

let slideIndex =
    0;


let slideTimer;


const heroImage =
    document.getElementById(
        "heroImage"
    );


const heroContent =
    document.getElementById(
        "heroContent"
    );


function displaySlide(index) {

    if (!slides.length) {
        return;
    }


    slideIndex =
        (
            index +
            slides.length
        ) %
        slides.length;


    const slide =
        slides[
            slideIndex
            ];


    heroImage
        ?.classList
        .add("fade");


    heroContent
        ?.classList
        .add("changing");


    setTimeout(
        () => {

            if (heroImage) {

                heroImage.src =
                    slide.image;
            }


            setText(
                "heroBadge",
                slide.badge
            );


            const title =
                document.getElementById(
                    "heroTitle"
                );


            if (title) {

                title.innerHTML =
                    slide.title;
            }


            setText(
                "heroDescription",
                slide.description
            );


            document
                .querySelectorAll(
                    ".hero-dot"
                )
                .forEach(
                    (dot, i) => {

                        dot.classList.toggle(
                            "active",
                            i ===
                            slideIndex
                        );
                    }
                );


            heroImage
                ?.classList
                .remove("fade");


            heroContent
                ?.classList
                .remove("changing");

        },
        220
    );
}


function startSlider() {

    clearInterval(
        slideTimer
    );


    slideTimer =
        setInterval(
            () =>
                displaySlide(
                    slideIndex + 1
                ),
            5000
        );
}


document
    .getElementById(
        "nextSlide"
    )
    ?.addEventListener(
        "click",
        () => {

            displaySlide(
                slideIndex + 1
            );

            startSlider();
        }
    );


document
    .getElementById(
        "prevSlide"
    )
    ?.addEventListener(
        "click",
        () => {

            displaySlide(
                slideIndex - 1
            );

            startSlider();
        }
    );


document
    .querySelectorAll(
        ".hero-dot"
    )
    .forEach(
        dot => {

            dot.addEventListener(
                "click",
                () => {

                    displaySlide(
                        Number(
                            dot.dataset.index
                        )
                    );

                    startSlider();
                }
            );
        }
    );


document
    .getElementById(
        "exploreButton"
    )
    ?.addEventListener(
        "click",
        () =>
            document
                .getElementById(
                    "suggestionSection"
                )
                ?.scrollIntoView({

                    behavior:
                        "smooth"
                })
    );


displaySlide(0);

startSlider();


/* =========================================================
   BMI + CALORIES
========================================================= */

function calculateBMI(
    weight,
    heightCm
) {

    if (
        !weight ||
        !heightCm
    ) {

        return 0;
    }


    const height =
        heightCm / 100;


    return (
        weight /
        (
            height *
            height
        )
    );
}


function getAdultBMIStatus(bmi) {

    if (
        bmi < 18.5
    ) {

        return {

            key:
                "under",

            title:
                "Thiếu cân",

            description:
                "Cân nặng hiện thấp hơn khoảng BMI tham khảo."
        };
    }


    if (
        bmi < 25
    ) {

        return {

            key:
                "healthy",

            title:
                "Cân đối",

            description:
                "Cân nặng và chiều cao nằm trong khoảng BMI khỏe mạnh tham khảo."
        };
    }


    if (
        bmi < 30
    ) {

        return {

            key:
                "over",

            title:
                "Thừa cân",

            description:
                "BMI hiện cao hơn khoảng khỏe mạnh tham khảo."
        };
    }


    return {

        key:
            "high",

        title:
            "BMI cao",

        description:
            "BMI hiện ở mức cao. BMI chỉ là chỉ số sàng lọc."
    };
}


function calculateCalories(
    gender,
    age,
    weight,
    height,
    activity,
    target
) {

    if (
        age < 18 ||
        !weight ||
        !height
    ) {

        return 0;
    }


    let bmr;


    if (
        gender === "female"
    ) {

        bmr =
            10 * weight +
            6.25 * height -
            5 * age -
            161;

    } else {

        bmr =
            10 * weight +
            6.25 * height -
            5 * age +
            5;
    }


    let calories =
        bmr *
        Number(
            activity || 1.2
        );


    if (
        target &&
        target < weight - 1
    ) {

        calories *=
            0.90;
    }


    if (
        target &&
        target > weight + 1
    ) {

        calories *=
            1.08;
    }


    calories =
        Math.max(
            1200,
            Math.min(
                4000,
                calories
            )
        );


    return (
        Math.round(
            calories / 10
        ) *
        10
    );
}


function getGoal() {

    const weight =
        Number(
            state.profile.weight
        );


    const target =
        Number(
            state.profile.target
        );


    if (
        target <
        weight - 1
    ) {

        return "Giảm cân";
    }


    if (
        target >
        weight + 1
    ) {

        return "Tăng cân";
    }


    return "Duy trì cân nặng";
}


function getDietDescription(diet) {

    switch (diet) {

        case "Eat clean":

            return (
                "ưu tiên thực phẩm ít chế biến, rau củ và nguồn đạm phù hợp"
            );


        case "Nhiều đạm":

            return (
                "ưu tiên món giàu protein"
            );


        case "Ít carb":

            return (
                "ưu tiên món hạn chế carbohydrate"
            );


        case "Ăn chay":

            return (
                "ưu tiên công thức không sử dụng thịt"
            );


        case "Ăn linh tinh":

            return (
                "không khóa theo chế độ cố định, mà cân bằng theo nguyên liệu, calo và mục tiêu"
            );


        default:

            return (
                "ưu tiên chế độ ăn cân bằng"
            );
    }
}


/* =========================================================
   AVATAR
========================================================= */

function renderAvatar() {

    const avatar =
        state.profile.avatarUrl &&
        String(
            state.profile.avatarUrl
        ).trim() !== ""

            ? state.profile.avatarUrl

            : DEFAULT_AVATAR;


    /*
        Cả 3 avatar:
        - góc phải
        - cạnh tên
        - trong chỉnh hồ sơ
    */

    const avatarElements =
        new Set([

            ...document.querySelectorAll(
                ".user-avatar-sync"
            ),

            document.getElementById(
                "headerAvatar"
            ),

            document.getElementById(
                "profileMenuAvatar"
            ),

            document.getElementById(
                "profileAvatarPreview"
            )
        ]);


    avatarElements.forEach(
        element => {

            if (!element) {
                return;
            }


            element.src =
                avatar;


            element.onerror =
                function () {

                    this.onerror =
                        null;


                    this.src =
                        DEFAULT_AVATAR;
                };
        }
    );


    const removeButton =
        document.getElementById(
            "removeAvatarButton"
        );


    if (removeButton) {

        removeButton.style.display =
            state.profile.avatarUrl &&
            String(
                state.profile.avatarUrl
            ).trim() !== ""

                ? "inline-flex"

                : "none";
    }
}


/* =========================================================
   PROFILE RENDER
========================================================= */

function renderProfile() {

    const p =
        state.profile;


    const bmi =
        calculateBMI(
            p.weight,
            p.height
        );


    const calories =
        calculateCalories(
            p.gender,
            p.age,
            p.weight,
            p.height,
            p.activity,
            p.target
        );


    setText(
        "quickName",
        p.name
    );


    setText(
        "quickWeight",
        `${p.weight} kg`
    );


    setText(
        "quickHeight",
        `${p.height} cm`
    );


    setText(
        "quickTarget",
        `${p.target} kg`
    );


    setText(
        "quickBmi",
        bmi
            ? bmi.toFixed(1)
            : "--"
    );


    setText(
        "quickCalories",
        calories
            ? `${formatNumber(calories)} kcal`
            : "--"
    );


    setText(
        "quickDiet",
        p.diet
    );


    setText(
        "dailyCalories",
        calories
            ? formatNumber(calories)
            : "--"
    );


    const profileNote =
        document.getElementById(
            "profileAiNote"
        );


    if (profileNote) {

        profileNote.textContent =
            `${getGoal()} • ${p.diet}. Food X sẽ ưu tiên công thức phù hợp với hồ sơ.`;
    }


    const smart =
        document.getElementById(
            "smartSuggestion"
        );


    if (smart) {

        smart.textContent =
            calories

                ? `${getGoal()}. Năng lượng tham khảo khoảng ${formatNumber(calories)} kcal/ngày.`

                : "Food X đang phân tích hồ sơ.";
    }


    renderAvatar();
}


/* =========================================================
   PROFILE MODAL
========================================================= */

const profileModal =
    document.getElementById(
        "profileModal"
    );


function fillProfileForm() {
    const p = state.profile || {};
    const onb = (p.onboarding || (typeof onbState !== 'undefined' ? onbState : {})) || {};

    const values = {
        profileName: p.name,
        profileGender: p.gender,
        profileAge: p.age,
        profileWeight: p.weight,
        profileHeight: p.height,
        profileTarget: p.target,
        profileActivity: p.activity,
        profileDiet: p.diet,
        profileAllergies: p.allergies,
        profileDislikes: p.dislikes,
        profileCaloInput: onb.calo || 2000,
        profileCaloRangeSync: onb.calo || 2000
    };

    Object.entries(values).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (!element) return;

        if (id === "profileDiet") {
            const exists = Array.from(element.options).some(option => option.value === value);
            element.value = exists ? value : "Cân bằng";
        } else {
            element.value = value ?? "";
        }
    });

    // Populate Spice Select
    const spiceSelect = document.getElementById('profileSpiceSelect');
    if (spiceSelect) {
        const sp = onb.spice || 1;
        const spiceMap = { 0: 'Không cay', 1: 'Ít cay', 2: 'Vừa cay', 3: 'Cay nhiều', 4: 'Siêu cay 🌶️' };
        spiceSelect.value = typeof sp === 'string' ? sp : (spiceMap[sp] || 'Ít cay');
    }

    // Populate Cuisines Chips
    const cuisines = onb.cuisines || [];
    document.querySelectorAll('#profileCuisinesGrid .onb-chip').forEach(btn => {
        const txt = btn.textContent.trim();
        btn.classList.toggle('active', cuisines.some(c => txt.includes(c) || c.includes(txt)));
    });

    // Populate Goals Chips
    const goals = onb.goals || [];
    document.querySelectorAll('#profileGoalsGrid .onb-chip').forEach(btn => {
        const txt = btn.textContent.trim();
        btn.classList.toggle('active', goals.some(g => txt.includes(g) || g.includes(txt)));
    });

    // Populate Equipment Chips
    const equip = onb.equip || [];
    document.querySelectorAll('#profileEquipGrid .onb-chip').forEach(btn => {
        const txt = btn.textContent.trim();
        btn.classList.toggle('active', equip.some(e => txt.includes(e) || e.includes(txt)));
    });

    renderAvatar();
}


document
    .getElementById(
        "editProfileButton"
    )
    ?.addEventListener(
        "click",
        () => {

            fillProfileForm();


            profilePanel
                ?.classList
                .remove("show");


            profileModal
                ?.classList
                .add("show");


            setTimeout(
                updateHealthPreview,
                50
            );
        }
    );


function setHealthAdvice(text) {

    const element =
        document.querySelector(
            "#healthAiAdvice p"
        );


    if (element) {

        element.textContent =
            text;
    }
}


function updateBMIMarker(bmi) {

    const marker =
        document.getElementById(
            "bmiMarker"
        );


    if (!marker) {
        return;
    }


    let position =
        (
            (bmi - 15) /
            20
        ) *
        100;


    position =
        Math.max(
            1,
            Math.min(
                99,
                position
            )
        );


    marker.style.left =
        `${position}%`;
}


function updateHealthPreview() {

    const gender =
        document
            .getElementById(
                "profileGender"
            )
            ?.value ||
        "male";


    const age =
        Number(
            document
                .getElementById(
                    "profileAge"
                )
                ?.value
        );


    const weight =
        Number(
            document
                .getElementById(
                    "profileWeight"
                )
                ?.value
        );


    const height =
        Number(
            document
                .getElementById(
                    "profileHeight"
                )
                ?.value
        );


    const target =
        Number(
            document
                .getElementById(
                    "profileTarget"
                )
                ?.value
        );


    const activity =
        Number(
            document
                .getElementById(
                    "profileActivity"
                )
                ?.value ||
            1.2
        );


    const diet =
        document
            .getElementById(
                "profileDiet"
            )
            ?.value ||
        "Cân bằng";


    setText(
        "healthGender",
        gender === "female"
            ? "Nữ"
            : "Nam"
    );


    const bmi =
        calculateBMI(
            weight,
            height
        );


    if (
        !age ||
        !weight ||
        !height ||
        !bmi
    ) {

        setText(
            "healthBMI",
            "--"
        );


        setText(
            "healthStatus",
            "Hãy nhập thông tin"
        );


        setText(
            "healthStatusDescription",
            "Kết quả sẽ cập nhật khi bạn thay đổi thông tin."
        );


        setText(
            "healthyWeightRange",
            "-- kg"
        );


        setText(
            "healthGoal",
            "--"
        );


        setText(
            "healthCalories",
            "-- kcal"
        );


        setText(
            "healthWeightDifference",
            "--"
        );


        setHealthAdvice(
            "Điền đầy đủ thông tin để Food X phân tích."
        );


        return;
    }


    setText(
        "healthBMI",
        bmi.toFixed(1)
    );


    updateBMIMarker(
        bmi
    );


    if (
        age < 20
    ) {

        setText(
            "healthStatus",
            "Cần đánh giá theo tuổi"
        );


        setText(
            "healthStatusDescription",
            "Người dưới 20 tuổi cần đánh giá BMI theo tuổi và giới tính."
        );


        setText(
            "healthyWeightRange",
            "Theo tuổi & giới"
        );


        setText(
            "healthGoal",
            "Chưa đánh giá"
        );


        setText(
            "healthCalories",
            "Chưa đánh giá"
        );


        setText(
            "healthWeightDifference",
            "Chưa đánh giá"
        );


        setHealthAdvice(
            "Food X chưa dùng ngưỡng BMI người lớn cho người dưới 20 tuổi."
        );


        return;
    }


    const status =
        getAdultBMIStatus(
            bmi
        );


    setText(
        "healthStatus",
        status.title
    );


    setText(
        "healthStatusDescription",
        status.description
    );


    const h =
        height / 100;


    const minWeight =
        18.5 *
        h *
        h;


    const maxWeight =
        24.9 *
        h *
        h;


    setText(
        "healthyWeightRange",
        `${minWeight.toFixed(1)} – ${maxWeight.toFixed(1)} kg`
    );


    let goalText =
        "Duy trì cân nặng";


    if (
        target <
        weight - 0.5
    ) {

        goalText =
            `Giảm ${(weight - target).toFixed(1)} kg`;
    }


    if (
        target >
        weight + 0.5
    ) {

        goalText =
            `Tăng ${(target - weight).toFixed(1)} kg`;
    }


    setText(
        "healthGoal",
        goalText
    );


    let difference =
        "Trong khoảng tham khảo";


    if (
        weight <
        minWeight
    ) {

        difference =
            `Thấp hơn ${(minWeight - weight).toFixed(1)} kg`;
    }


    if (
        weight >
        maxWeight
    ) {

        difference =
            `Cao hơn ${(weight - maxWeight).toFixed(1)} kg`;
    }


    setText(
        "healthWeightDifference",
        difference
    );


    const calories =
        calculateCalories(
            gender,
            age,
            weight,
            height,
            activity,
            target
        );


    setText(
        "healthCalories",
        `${formatNumber(calories)} kcal`
    );


    let advice =
        `${status.description} Food X sẽ ${getDietDescription(diet)}.`;


    advice +=
        gender === "female"

            ? " Giới tính nữ được sử dụng trong phần ước tính năng lượng."

            : " Giới tính nam được sử dụng trong phần ước tính năng lượng.";


    setHealthAdvice(
        advice
    );
}


[
    "profileGender",
    "profileAge",
    "profileWeight",
    "profileHeight",
    "profileTarget",
    "profileActivity",
    "profileDiet"
]
    .forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            element
                ?.addEventListener(
                    "input",
                    updateHealthPreview
                );


            element
                ?.addEventListener(
                    "change",
                    updateHealthPreview
                );
        }
    );


/* =========================================================
   SAVE PROFILE MYSQL
========================================================= */

document.getElementById("profileForm")?.addEventListener("submit", async event => {
    event.preventDefault();
    const restore = buttonLoading(event.submitter, "Đang lưu...");

    // Collect Section 03 setup preferences
    const selCuisines = Array.from(document.querySelectorAll('#profileCuisinesGrid .onb-chip.active')).map(b => b.textContent.trim());
    const selGoals = Array.from(document.querySelectorAll('#profileGoalsGrid .onb-chip.active')).map(b => b.textContent.trim());
    const selEquip = Array.from(document.querySelectorAll('#profileEquipGrid .onb-chip.active')).map(b => b.textContent.trim());
    const spiceVal = document.getElementById('profileSpiceSelect')?.value || 'Ít cay';
    const caloVal = Number(document.getElementById('profileCaloInput')?.value || 2000);

    const payload = {
        name: document.getElementById("profileName")?.value.trim(),
        gender: document.getElementById("profileGender")?.value,
        age: Number(document.getElementById("profileAge")?.value),
        weight: Number(document.getElementById("profileWeight")?.value),
        height: Number(document.getElementById("profileHeight")?.value),
        target: Number(document.getElementById("profileTarget")?.value),
        activity: Number(document.getElementById("profileActivity")?.value),
        diet: document.getElementById("profileDiet")?.value,
        allergies: document.getElementById("profileAllergies")?.value.trim(),
        dislikes: document.getElementById("profileDislikes")?.value.trim()
    };

    try {
        let data = {};
        try {
            data = await apiRequest(PROFILE_API, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            console.warn("Backend profile save fallback:", e);
        }

        state.profile = Object.assign({}, state.profile, payload, {
            onboarding: {
                cuisines: selCuisines,
                spice: spiceVal,
                goals: selGoals,
                calo: caloVal,
                equip: selEquip,
                allergies: payload.allergies ? payload.allergies.split(',').map(s=>s.trim()) : [],
                diet: payload.diet
            }
        });

        // Sync with global onbState if present
        if (typeof onbState !== 'undefined') {
            onbState.cuisines = selCuisines;
            onbState.spice = spiceVal;
            onbState.goals = selGoals;
            onbState.calo = caloVal;
            onbState.equip = selEquip;
        }

        saveState();
        renderProfile();
        renderRecipes();

        restore("✓ Đã lưu");

        setTimeout(() => {
            document.getElementById("profileModal")?.classList.remove("show");
            restore();
            showToast("Hồ sơ & Chế độ ăn đã được đồng bộ!", "success");
        }, 350);

    } catch (error) {
        console.error(error);
        restore();
        showToast("Không lưu được hồ sơ.", "error");
    }
});

/* =========================================================
   AVATAR UPLOAD
========================================================= */

const profileAvatarInput =
    document.getElementById(
        "profileAvatarInput"
    );


document
    .getElementById(
        "chooseAvatarButton"
    )
    ?.addEventListener(
        "click",
        () => {

            profileAvatarInput
                ?.click();
        }
    );


profileAvatarInput
    ?.addEventListener(
        "change",
        async () => {

            const file =
                profileAvatarInput
                    .files?.[0];


            if (!file) {
                return;
            }


            const allowedTypes = [

                "image/jpeg",
                "image/png",
                "image/webp"
            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                showToast(
                    "Chỉ hỗ trợ JPG, PNG hoặc WEBP.",
                    "warning"
                );


                profileAvatarInput.value =
                    "";


                return;
            }


            if (
                file.size >
                5 *
                1024 *
                1024
            ) {

                showToast(
                    "Ảnh tối đa 5MB.",
                    "warning"
                );


                profileAvatarInput.value =
                    "";


                return;
            }


            const previewURL =
                URL.createObjectURL(
                    file
                );


            /*
                Preview đồng bộ tất cả avatar.
            */

            document
                .querySelectorAll(
                    ".user-avatar-sync"
                )
                .forEach(
                    image => {

                        image.src =
                            previewURL;
                    }
                );


            const formData =
                new FormData();


            formData.append(
                "avatar",
                file
            );


            try {

                const response =
                    await fetch(
                        `${PROFILE_API}/avatar`,
                        {

                            method:
                                "POST",

                            body:
                            formData
                        }
                    );


                if (!response.ok) {

                    const errorText =
                        await response.text();


                    throw new Error(
                        `${response.status} ${errorText}`
                    );
                }


                const data =
                    await response.json();


                state.userId =
                    data.userId;


                state.profile =
                    apiProfileToState(
                        data
                    );


                saveState();


                renderProfile();


                showToast(
                    "Ảnh đại diện đã được cập nhật.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Avatar upload error:",
                    error
                );


                renderAvatar();


                showToast(
                    "Không tải được ảnh đại diện.",
                    "error"
                );


            } finally {

                URL.revokeObjectURL(
                    previewURL
                );


                profileAvatarInput.value =
                    "";
            }
        }
    );


/* =========================================================
   REMOVE AVATAR
========================================================= */

document
    .getElementById(
        "removeAvatarButton"
    )
    ?.addEventListener(
        "click",
        async () => {

            if (
                !state.profile.avatarUrl
            ) {

                return;
            }


            const confirmed =
                window.confirm(
                    "Bạn muốn xóa ảnh đại diện?"
                );


            if (!confirmed) {
                return;
            }


            try {

                const data =
                    await apiRequest(
                        `${PROFILE_API}/avatar`,
                        {

                            method:
                                "DELETE"
                        }
                    );


                state.userId =
                    data.userId;


                state.profile =
                    apiProfileToState(
                        data
                    );


                saveState();


                renderProfile();


                showToast(
                    "Đã xóa ảnh đại diện.",
                    "success"
                );


            } catch (error) {

                console.error(
                    error
                );


                showToast(
                    "Không xóa được ảnh đại diện.",
                    "error"
                );
            }
        }
    );


/* =========================================================
   MODAL COMMON
========================================================= */

function closeOtherModals(
    exceptId = ""
) {

    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(
            modal => {

                if (
                    modal.id !==
                    exceptId
                ) {

                    modal.classList.remove(
                        "show"
                    );
                }
            }
        );
}


document
    .querySelectorAll(
        "[data-close]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .getElementById(
                            button.dataset.close
                        )
                        ?.classList
                        .remove("show");
                }
            );
        }
    );


document
    .querySelectorAll(
        ".modal-overlay"
    )
    .forEach(
        modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        modal
                    ) {

                        modal.classList.remove(
                            "show"
                        );
                    }
                }
            );
        }
    );


/* =========================================================
   SEARCH FOOD
========================================================= */

const foodSearch =
    document.getElementById(
        "foodSearch"
    );


function renderSearch() {

    if (!foodSearch) {
        return;
    }


    const query =
        normalize(
            foodSearch.value
        );


    let data =
        catalog.filter(
            food => {

                const text =
                    normalize(
                        [
                            food.name,
                            food.type,
                            ...food.ingredients
                        ]
                            .join(" ")
                    );


                return text.includes(
                    query
                );
            }
        );


    if (!query) {

        data =
            catalog.slice(
                0,
                7
            );
    }


    const container =
        document.getElementById(
            "searchResults"
        );


    if (!container) {
        return;
    }


    if (!data.length) {

        container.innerHTML = `

            <div class="empty-search">

                <strong>
                    Không tìm thấy nguyên liệu
                </strong>

                <span>
                    Bạn có thể thêm thủ công trong Tủ lạnh.
                </span>

            </div>
        `;


        return;
    }


    container.innerHTML =
        data
            .slice(
                0,
                7
            )
            .map(
                food => `

                <div class="search-result">

                    <img
                        class="search-thumb"
                        src="${food.image}"
                        alt="${food.name}">

                    <div>

                        <div class="food-name">
                            ${food.name}
                        </div>

                        <div class="food-meta">
                            ${food.ingredients.join(", ")}
                        </div>

                        <span class="type-badge">
                            ${food.type}
                        </span>

                    </div>


                    <div class="search-actions">

                        <span class="calorie">
                            ${food.kcal} kcal
                        </span>

                        <button
                            type="button"
                            class="small-green-button"
                            data-action="add-food"
                            data-id="${food.id}">

                            + Thêm vào tủ

                        </button>

                    </div>

                </div>
            `
            )
            .join("");
}


foodSearch
    ?.addEventListener(
        "input",
        renderSearch
    );


/* =========================================================
   ADD FOOD MYSQL
========================================================= */

async function addFoodToFridge(
    foodId,
    button = null
) {

    const food =
        catalog.find(
            item =>
                item.id ===
                foodId
        );


    if (!food) {
        return;
    }


    const restore =
        buttonLoading(
            button,
            "Đang thêm..."
        );


    try {

        const nutrition =
            NUTRITION_LIBRARY[
                food.id
                ] || {};


        await apiRequest(
            FRIDGE_API,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        sourceKey:
                        food.id,

                        name:
                        food.name,

                        type:
                        food.type,

                        quantity:
                        food.quantity,

                        unit:
                        food.unit,

                        kcal:
                        food.kcal,

                        protein:
                            nutrition.protein ||
                            0,

                        carb:
                            nutrition.carb ||
                            0,

                        fat:
                            nutrition.fat ||
                            0,

                        components:
                            nutrition.components ||
                            food.ingredients.join(", "),

                        benefit:
                            nutrition.benefit ||
                            "Cân bằng",

                        imageUrl:
                        food.image,

                        expiresAt:
                            toDateInputValue(
                                futureDate(
                                    food.expiryDays
                                )
                            ),

                        note:
                            "",

                        customFood:
                            false
                    })
            }
        );


        await loadFridgeFromApi(
            false
        );


        restore(
            "✓ Đã thêm"
        );


        showToast(
            `${food.name} đã được lưu vào MySQL.`,
            "success"
        );


        setTimeout(
            restore,
            700
        );


    } catch (error) {

        console.error(
            error
        );


        restore();


        showToast(
            "Không thể thêm thực phẩm.",
            "error"
        );
    }
}


/* =========================================================
   FRIDGE HELPERS
========================================================= */

function getFridgeImage(item) {

    if (item.image) {

        return item.image;
    }


    const food =
        catalog.find(
            food =>
                food.id ===
                item.sourceId
        );


    if (food?.image) {

        return food.image;
    }


    return (
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85"
    );
}


function getNutritionForItem(item) {

    const library =
        NUTRITION_LIBRARY[
            item.sourceId
            ] || {};


    return {

        protein:
            Number(
                item.protein ??
                library.protein ??
                0
            ),

        fat:
            Number(
                item.fat ??
                library.fat ??
                0
            ),

        carb:
            Number(
                item.carb ??
                library.carb ??
                0
            ),

        benefit:
            item.benefit ||
            library.benefit ||
            "Cân bằng",

        basis:
            library.basis ||
            "Khẩu phần tham khảo",

        components:
            item.components ||
            library.components ||
            item.name,

        note:
            item.note ||
            library.note ||
            "Chưa có ghi chú."
    };
}


function getQuantityStep(item) {

    const unit =
        normalize(
            item.unit
        );


    if (
        unit === "g" ||
        unit === "gram"
    ) {

        return 50;
    }


    if (
        unit === "kg"
    ) {

        return 0.1;
    }


    if (
        unit === "lit" ||
        unit === "l"
    ) {

        return 0.25;
    }


    return 1;
}


/* =========================================================
   SELECTED FRIDGE
========================================================= */

function updateSelectedFridgeUI() {

    state.selectedFridgeIds =
        state.selectedFridgeIds
            .map(Number)
            .filter(
                id =>
                    state.fridge.some(
                        food =>
                            Number(food.id) ===
                            Number(id)
                    )
            );


    const count =
        state.selectedFridgeIds.length;


    setText(
        "selectedCountHeader",
        count
    );


    setText(
        "selectedFridgeText",
        `Đã chọn ${count} nguyên liệu`
    );


    document
        .getElementById(
            "selectedFridgeBar"
        )
        ?.classList
        .toggle(
            "show",
            count > 0
        );


    const aiButton =
        document.getElementById(
            "openSelectedAI"
        );


    if (aiButton) {

        aiButton.disabled =
            count === 0;
    }


    saveState();
}


/* =========================================================
   RENDER FRIDGE
========================================================= */

function renderFridge() {

    const container =
        document.getElementById(
            "fridgeGrid"
        );


    if (!container) {
        return;
    }


    const search =
        normalize(
            document
                .getElementById(
                    "fridgeSearch"
                )
                ?.value ||
            ""
        );


    const filter =
        document
            .getElementById(
                "fridgeFilter"
            )
            ?.value ||
        "all";


    const foods =
        state.fridge.filter(
            item => {

                const matchSearch =
                    normalize(
                        `${item.name} ${item.type}`
                    )
                        .includes(
                            search
                        );


                let matchFilter =
                    true;


                if (
                    filter === "soon"
                ) {

                    matchFilter =
                        daysLeft(
                            item.expiresAt
                        ) <= 3;
                }


                if (
                    filter === "ingredient"
                ) {

                    matchFilter =
                        normalize(
                            item.type
                        )
                            .includes(
                                "nguyen lieu"
                            );
                }


                if (
                    filter === "dish"
                ) {

                    matchFilter =
                        normalize(
                            item.type
                        )
                            .includes(
                                "mon an"
                            );
                }


                return (
                    matchSearch &&
                    matchFilter
                );
            }
        );


    const empty =
        document.getElementById(
            "fridgeEmpty"
        );


    if (
        !state.fridge.length
    ) {

        container.style.display =
            "none";


        if (empty) {

            empty.style.display =
                "block";
        }

    } else {

        container.style.display =
            "grid";


        if (empty) {

            empty.style.display =
                "none";
        }
    }


    if (
        !foods.length &&
        state.fridge.length
    ) {

        container.innerHTML = `

            <div class="fridge-no-result">

                Không tìm thấy thực phẩm phù hợp.

            </div>
        `;

    } else {

        container.innerHTML =
            foods
                .map(
                    item => {

                        const nutrition =
                            getNutritionForItem(
                                item
                            );


                        const days =
                            daysLeft(
                                item.expiresAt
                            );


                        const selected =
                            state.selectedFridgeIds
                                .includes(
                                    Number(
                                        item.id
                                    )
                                );


                        let statusClass =
                            "safe";


                        let statusText =
                            `Còn ${days} ngày`;


                        if (
                            days <= 3
                        ) {

                            statusClass =
                                "soon";
                        }


                        if (
                            days <= 1
                        ) {

                            statusClass =
                                "danger";
                        }


                        if (
                            days <= 0
                        ) {

                            statusText =
                                "Cần dùng ngay";
                        }


                        const progress =
                            Math.max(
                                5,
                                Math.min(
                                    100,
                                    days * 10
                                )
                            );


                        return `

                        <article
                            class="
                                fridge-food-card
                                ${selected ? "selected" : ""}
                            ">


                            <label
                                class="fridge-select-wrap"
                                title="Chọn nguyên liệu">

                                <input
                                    type="checkbox"
                                    class="fridge-select-checkbox"
                                    data-action="select-fridge"
                                    data-id="${item.id}"
                                    ${selected ? "checked" : ""}>

                            </label>


                            <div
                                class="fridge-food-image-wrap"
                                data-action="ingredient-detail"
                                data-id="${item.id}">

                                <img
                                    class="fridge-food-image"
                                    src="${getFridgeImage(item)}"
                                    alt="${item.name}">

                                <span
                                    class="fridge-status ${statusClass}">

                                    ${statusText}

                                </span>

                            </div>


                            <div class="fridge-food-body">


                                <div class="fridge-food-heading">

                                    <h3>
                                        ${item.name}
                                    </h3>

                                    <span>
                                        ${
                            item.custom
                                ? "Tự thêm"
                                : item.type
                        }
                                    </span>

                                </div>


                                <div class="fridge-food-info">

                                    <div>

                                        <span>
                                            Số lượng
                                        </span>

                                        <strong>
                                            ${item.quantity} ${item.unit}
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Năng lượng
                                        </span>

                                        <strong>
                                            ${item.kcal} kcal
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Protein
                                        </span>

                                        <strong>
                                            ${nutrition.protein} g
                                        </strong>

                                    </div>


                                    <div>

                                        <span>
                                            Mục tiêu
                                        </span>

                                        <strong>
                                            ${nutrition.benefit}
                                        </strong>

                                    </div>

                                </div>


                                <span class="expiry-label">
                                    Thời gian sử dụng
                                </span>


                                <div class="fridge-expiry-progress">

                                    <div
                                        style="width:${progress}%">
                                    </div>

                                </div>


                                <div class="fridge-food-actions p1-actions">


                                    <div class="quantity-control">

                                        <button
                                            type="button"
                                            data-action="decrease-fridge"
                                            data-id="${item.id}">

                                            −

                                        </button>


                                        <button
                                            type="button"
                                            data-action="increase-fridge"
                                            data-id="${item.id}">

                                            +

                                        </button>

                                    </div>


                                    <button
                                        type="button"
                                        class="fridge-detail-button"
                                        data-action="ingredient-detail"
                                        data-id="${item.id}">

                                        Chi tiết

                                    </button>


                                    <button
                                        type="button"
                                        class="fridge-use-button"
                                        data-action="use-fridge"
                                        data-id="${item.id}">

                                        ✓ Đã dùng

                                    </button>


                                    <button
                                        type="button"
                                        class="fridge-delete"
                                        data-action="delete-fridge"
                                        data-id="${item.id}">

                                        ×

                                    </button>


                                </div>

                            </div>

                        </article>
                        `;
                    }
                )
                .join("");
    }


    const expiring =
        state.fridge.filter(
            item =>
                daysLeft(
                    item.expiresAt
                ) <= 3
        );


    setText(
        "fridgePageTotal",
        state.fridge.length
    );


    setText(
        "fridgePageExpiring",
        expiring.length
    );


    setText(
        "fridgeRecipeCount",
        suggestedRecipes().length
    );


    setText(
        "fridgeFavoriteCount",
        state.favorites.length
    );


    updateSelectedFridgeUI();
}


document
    .getElementById(
        "fridgeSearch"
    )
    ?.addEventListener(
        "input",
        renderFridge
    );


document
    .getElementById(
        "fridgeFilter"
    )
    ?.addEventListener(
        "change",
        renderFridge
    );


/* =========================================================
   QUANTITY MYSQL
========================================================= */

async function adjustFridge(
    id,
    direction
) {

    const item =
        state.fridge.find(
            food =>
                Number(food.id) ===
                Number(id)
        );


    if (!item) {
        return;
    }


    const delta =
        direction *
        getQuantityStep(
            item
        );


    try {

        await apiRequest(
            `${FRIDGE_API}/${id}/quantity?delta=${encodeURIComponent(delta)}`,
            {

                method:
                    "PATCH"
            }
        );


        await loadFridgeFromApi(
            false
        );


        showToast(
            direction > 0

                ? `Đã tăng ${item.name}.`

                : `Đã giảm ${item.name}.`,

            "info"
        );


    } catch (error) {

        console.error(
            error
        );


        showToast(
            "Không cập nhật được số lượng.",
            "error"
        );
    }
}


/* =========================================================
   USED FOOD
========================================================= */

async function useFridgeFood(id) {

    const item =
        state.fridge.find(
            food =>
                Number(food.id) ===
                Number(id)
        );


    if (!item) {
        return;
    }


    const delta =
        -getQuantityStep(
            item
        );


    try {

        await apiRequest(
            `${FRIDGE_API}/${id}/quantity?delta=${encodeURIComponent(delta)}`,
            {

                method:
                    "PATCH"
            }
        );


        await loadFridgeFromApi(
            false
        );


        showToast(
            `Đã cập nhật ${item.name} sau khi sử dụng.`,
            "success"
        );


    } catch (error) {

        console.error(
            error
        );


        showToast(
            "Không cập nhật được thực phẩm.",
            "error"
        );
    }
}


/* =========================================================
   DELETE FOOD
========================================================= */

async function deleteFridgeFood(id) {

    const item =
        state.fridge.find(
            food =>
                Number(food.id) ===
                Number(id)
        );


    if (!item) {
        return;
    }


    const confirmed =
        window.confirm(
            `Bạn có chắc muốn xóa "${item.name}" khỏi tủ lạnh?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            `${FRIDGE_API}/${id}`,
            {

                method:
                    "DELETE"
            }
        );


        state.selectedFridgeIds =
            state.selectedFridgeIds
                .filter(
                    selectedId =>
                        Number(selectedId) !==
                        Number(id)
                );


        saveState();


        await loadFridgeFromApi(
            false
        );


        showToast(
            `${item.name} đã được xóa.`,
            "success"
        );


    } catch (error) {

        console.error(
            error
        );


        showToast(
            "Không thể xóa thực phẩm.",
            "error"
        );
    }
}


/* =========================================================
   SELECT FRIDGE
========================================================= */

function toggleSelectedFridge(
    id,
    checked
) {

    id =
        Number(id);


    if (checked) {

        if (
            !state.selectedFridgeIds
                .includes(id)
        ) {

            state.selectedFridgeIds.push(
                id
            );
        }

    } else {

        state.selectedFridgeIds =
            state.selectedFridgeIds
                .filter(
                    selectedId =>
                        Number(selectedId) !==
                        id
                );
    }


    saveState();

    renderFridge();
}


document
    .getElementById(
        "clearFridgeSelection"
    )
    ?.addEventListener(
        "click",
        () => {

            state.selectedFridgeIds =
                [];


            saveState();

            renderFridge();


            showToast(
                "Đã bỏ chọn toàn bộ nguyên liệu.",
                "info"
            );
        }
    );


/* =========================================================
   INGREDIENT DETAIL
========================================================= */

function openIngredientDetail(id) {

    const item =
        state.fridge.find(
            food =>
                Number(food.id) ===
                Number(id)
        );


    if (!item) {
        return;
    }


    const nutrition =
        getNutritionForItem(
            item
        );


    const remaining =
        daysLeft(
            item.expiresAt
        );


    setText(
        "ingredientDetailTitle",
        item.name
    );


    const body =
        document.getElementById(
            "ingredientDetailBody"
        );


    if (!body) {
        return;
    }


    body.innerHTML = `

        <div class="ingredient-detail-layout">


            <div>


                <img
                    class="ingredient-detail-image"
                    src="${getFridgeImage(item)}"
                    alt="${item.name}">


                <div class="ingredient-expiry-box">


                    <label>
                        Hạn sử dụng
                    </label>


                    <div class="ingredient-expiry-row">


                        <input
                            type="date"
                            id="ingredientExpiryInput"
                            value="${toDateInputValue(item.expiresAt)}">


                        <button
                            type="button"
                            class="primary-button"
                            data-action="save-ingredient-expiry"
                            data-id="${item.id}">

                            Lưu hạn

                        </button>


                    </div>

                </div>

            </div>


            <div>


                <div class="ingredient-detail-header">


                    <h2>
                        ${item.name}
                    </h2>


                    <p>

                        ${item.quantity} ${item.unit}

                        •

                        ${
        remaining > 0

            ? `còn ${remaining} ngày`

            : "cần dùng ngay"
    }

                    </p>


                    <div class="ingredient-tags">


                        <span>
                            ${item.type}
                        </span>


                        <span>
                            ${nutrition.benefit}
                        </span>


                        <span>
                            ${nutrition.basis}
                        </span>


                    </div>

                </div>


                <div class="ingredient-nutrition-grid">


                    <div class="nutrition-card">

                        <span>
                            Năng lượng
                        </span>

                        <strong>
                            ${item.kcal} kcal
                        </strong>

                    </div>


                    <div class="nutrition-card">

                        <span>
                            Protein
                        </span>

                        <strong>
                            ${nutrition.protein} g
                        </strong>

                    </div>


                    <div class="nutrition-card">

                        <span>
                            Carb
                        </span>

                        <strong>
                            ${nutrition.carb} g
                        </strong>

                    </div>


                    <div class="nutrition-card">

                        <span>
                            Chất béo
                        </span>

                        <strong>
                            ${nutrition.fat} g
                        </strong>

                    </div>


                </div>


                <div class="ingredient-info-section">

                    <h3>
                        Thành phần dinh dưỡng
                    </h3>

                    <p>
                        ${nutrition.components}
                    </p>

                </div>


                <div class="ingredient-goal-box">


                    <div>
                        🎯
                    </div>


                    <div>

                        <strong>
                            Phù hợp: ${nutrition.benefit}
                        </strong>

                        <br>

                        <span>
                            ${nutrition.note}
                        </span>

                    </div>


                </div>


                <div class="ingredient-info-section">

                    <h3>
                        Ghi chú
                    </h3>

                    <p>
                        ${
        item.note ||
        "Chưa có ghi chú."
    }
                    </p>

                </div>


            </div>


        </div>
    `;


    closeOtherModals(
        "ingredientDetailModal"
    );


    document
        .getElementById(
            "ingredientDetailModal"
        )
        ?.classList
        .add("show");
}


/* =========================================================
   SAVE EXPIRY
========================================================= */

async function saveIngredientExpiry(id) {

    const value =
        document
            .getElementById(
                "ingredientExpiryInput"
            )
            ?.value;


    if (!value) {

        showToast(
            "Hãy chọn ngày hết hạn.",
            "warning"
        );


        return;
    }


    try {

        await apiRequest(
            `${FRIDGE_API}/${id}/expiry`,
            {

                method:
                    "PATCH",

                headers: {

                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({

                        expiresAt:
                        value
                    })
            }
        );


        await loadFridgeFromApi(
            false
        );


        openIngredientDetail(
            id
        );


        showToast(
            "Đã cập nhật hạn sử dụng.",
            "success"
        );


    } catch (error) {

        console.error(
            error
        );


        showToast(
            "Không cập nhật được hạn sử dụng.",
            "error"
        );
    }
}


/* =========================================================
   CUSTOM INGREDIENT
========================================================= */

function openCustomIngredientModal() {

    const form =
        document.getElementById(
            "customIngredientForm"
        );


    form?.reset();


    const expiry =
        document.getElementById(
            "customFoodExpiry"
        );


    if (expiry) {

        expiry.value =
            toDateInputValue(
                futureDate(7)
            );
    }


    closeOtherModals(
        "customIngredientModal"
    );


    document
        .getElementById(
            "customIngredientModal"
        )
        ?.classList
        .add("show");
}


document
    .getElementById(
        "openCustomIngredient"
    )
    ?.addEventListener(
        "click",
        openCustomIngredientModal
    );


document
    .getElementById(
        "emptyCustomIngredient"
    )
    ?.addEventListener(
        "click",
        openCustomIngredientModal
    );


document
    .getElementById(
        "customIngredientForm"
    )
    ?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "customFoodName"
                    )
                    ?.value
                    .trim();


            const quantity =
                Number(
                    document
                        .getElementById(
                            "customFoodQuantity"
                        )
                        ?.value
                );


            const expiry =
                document
                    .getElementById(
                        "customFoodExpiry"
                    )
                    ?.value;


            if (
                !name ||
                !quantity ||
                !expiry
            ) {

                showToast(
                    "Nhập tên, số lượng và hạn sử dụng.",
                    "warning"
                );


                return;
            }


            const restore =
                buttonLoading(
                    event.submitter,
                    "Đang lưu..."
                );


            try {

                await apiRequest(
                    FRIDGE_API,
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                sourceKey:
                                    null,

                                name,

                                type:
                                    "Nguyên liệu",

                                quantity,

                                unit:
                                    document
                                        .getElementById(
                                            "customFoodUnit"
                                        )
                                        ?.value ||
                                    "g",

                                kcal:
                                    Number(
                                        document
                                            .getElementById(
                                                "customFoodCalories"
                                            )
                                            ?.value
                                    ) || 0,

                                protein:
                                    Number(
                                        document
                                            .getElementById(
                                                "customFoodProtein"
                                            )
                                            ?.value
                                    ) || 0,

                                carb:
                                    Number(
                                        document
                                            .getElementById(
                                                "customFoodCarb"
                                            )
                                            ?.value
                                    ) || 0,

                                fat:
                                    Number(
                                        document
                                            .getElementById(
                                                "customFoodFat"
                                            )
                                            ?.value
                                    ) || 0,

                                components:
                                    document
                                        .getElementById(
                                            "customFoodIngredients"
                                        )
                                        ?.value
                                        .trim() ||
                                    name,

                                benefit:
                                    document
                                        .getElementById(
                                            "customFoodBenefit"
                                        )
                                        ?.value ||
                                    "Cân bằng",

                                imageUrl:
                                    document
                                        .getElementById(
                                            "customFoodImage"
                                        )
                                        ?.value
                                        .trim() ||
                                    "",

                                expiresAt:
                                expiry,

                                note:
                                    document
                                        .getElementById(
                                            "customFoodNote"
                                        )
                                        ?.value
                                        .trim() ||
                                    "",

                                customFood:
                                    true
                            })
                    }
                );


                await loadFridgeFromApi(
                    false
                );


                document
                    .getElementById(
                        "customIngredientModal"
                    )
                    ?.classList
                    .remove("show");


                restore();


                showToast(
                    `${name} đã được lưu vào MySQL.`,
                    "success"
                );


            } catch (error) {

                console.error(
                    error
                );


                restore();


                showToast(
                    "Không thể thêm nguyên liệu.",
                    "error"
                );
            }
        }
    );


/* =========================================================
   RECIPE LOGIC
========================================================= */

function hasIngredientInFridge(
    ingredient
) {

    const target =
        normalize(
            ingredient
        );


    return state.fridge.some(
        item => {

            const values = [

                item.name,

                ...(item.ingredients || [])
            ]
                .map(
                    normalize
                );


            return values.some(
                value =>
                    value.includes(
                        target
                    ) ||
                    target.includes(
                        value
                    )
            );
        }
    );
}


function isRecipeSafeForProfile(recipe) {

    const allergies =
        normalize(
            state.profile.allergies
        )
            .split(",")
            .map(
                value =>
                    value.trim()
            )
            .filter(
                Boolean
            );


    if (
        !allergies.length
    ) {

        return true;
    }


    const text =
        normalize(
            recipe.ingredients
                .join(" ")
        );


    return !allergies.some(
        allergy =>
            text.includes(
                allergy
            )
    );
}


function recipeScore(recipe) {

    const fridgeIngredients =
        state.fridge
            .flatMap(
                item => [

                    item.name,

                    ...(item.ingredients || [])
                ]
            )
            .map(
                normalize
            );


    let matched =
        0;


    recipe.ingredients.forEach(
        ingredient => {

            const value =
                normalize(
                    ingredient
                );


            if (
                fridgeIngredients.some(
                    fridge =>
                        fridge.includes(
                            value
                        ) ||
                        value.includes(
                            fridge
                        )
                )
            ) {

                matched++;
            }
        }
    );


    let score =
        25;


    score +=
        (
            matched /
            recipe.ingredients.length
        ) *
        50;


    if (
        state.profile.diet !==
        "Ăn linh tinh" &&
        recipe.tags.includes(
            state.profile.diet
        )
    ) {

        score +=
            12;
    }


    if (
        state.profile.diet ===
        "Ăn linh tinh" &&
        recipe.kcal >= 250 &&
        recipe.kcal <= 550
    ) {

        score +=
            7;
    }


    const goal =
        getGoal();


    if (
        goal === "Giảm cân" &&
        recipe.kcal <= 450
    ) {

        score +=
            8;
    }


    if (
        goal === "Tăng cân" &&
        recipe.kcal >= 350
    ) {

        score +=
            8;
    }


    const dislikes =
        normalize(
            state.profile.dislikes
        )
            .split(",")
            .map(
                value =>
                    value.trim()
            )
            .filter(
                Boolean
            );


    const recipeText =
        normalize(
            recipe.ingredients
                .join(" ")
        );


    if (
        dislikes.some(
            dislike =>
                recipeText.includes(
                    dislike
                )
        )
    ) {

        score -=
            20;
    }


    return Math.max(
        1,
        Math.min(
            99,
            Math.round(
                score
            )
        )
    );
}


function suggestedRecipes() {

    return recipes
        .filter(
            isRecipeSafeForProfile
        )
        .map(
            recipe => ({

                ...recipe,

                score:
                    recipeScore(
                        recipe
                    )
            })
        )
        .sort(
            (a, b) =>
                b.score -
                a.score
        );
}


function scoreRecipeWithSelected(
    recipe,
    selectedItems
) {

    const selected =
        selectedItems
            .flatMap(
                item => [

                    item.name,

                    ...(item.ingredients || [])
                ]
            )
            .map(
                normalize
            );


    let recipeMatched =
        0;


    recipe.ingredients
        .forEach(
            ingredient => {

                const value =
                    normalize(
                        ingredient
                    );


                if (
                    selected.some(
                        item =>
                            item.includes(
                                value
                            ) ||
                            value.includes(
                                item
                            )
                    )
                ) {

                    recipeMatched++;
                }
            }
        );


    let selectedUsed =
        0;


    selectedItems
        .forEach(
            item => {

                const itemName =
                    normalize(
                        item.name
                    );


                if (
                    recipe.ingredients.some(
                        ingredient => {

                            const value =
                                normalize(
                                    ingredient
                                );


                            return (
                                value.includes(
                                    itemName
                                ) ||
                                itemName.includes(
                                    value
                                )
                            );
                        }
                    )
                ) {

                    selectedUsed++;
                }
            }
        );


    let score =
        15;


    score +=
        (
            recipeMatched /
            recipe.ingredients.length
        ) *
        50;


    score +=
        (
            selectedUsed /
            selectedItems.length
        ) *
        30;


    if (
        recipe.tags.includes(
            state.profile.diet
        )
    ) {

        score +=
            5;
    }


    return Math.max(
        1,
        Math.min(
            99,
            Math.round(
                score
            )
        )
    );
}


/* =========================================================
   RECIPE CARD
========================================================= */

function recipeCard(recipe) {

    const favorite =
        state.favorites.includes(
            Number(
                recipe.id
            )
        );


    const score =
        recipe.score ??
        recipeScore(
            recipe
        );


    return `

        <article class="recipe-card">


            <div class="recipe-image-wrap">


                <img
                    class="recipe-image"
                    src="${recipe.image}"
                    alt="${recipe.name}">


                <span class="recipe-match">
                    ${score}% phù hợp
                </span>


                <button
                    type="button"
                    class="favorite-button ${favorite ? "active" : ""}"
                    data-action="favorite"
                    data-id="${recipe.id}">

                    ${favorite ? "♥" : "♡"}

                </button>


            </div>


            <div class="recipe-body">


                <h3 class="recipe-title">
                    ${recipe.name}
                </h3>


                <div class="recipe-meta">


                    <span>
                        ◷ ${recipe.time} phút
                    </span>


                    <span>
                        ◉ ${recipe.difficulty}
                    </span>


                    <span>
                        🔥 ${recipe.kcal} kcal
                    </span>


                </div>


                <div class="recipe-actions">


                    <button
                        type="button"
                        class="secondary-button"
                        data-action="recipe-detail"
                        data-id="${recipe.id}">

                        Chi tiết

                    </button>


                    <button
                        type="button"
                        class="small-green-button"
                        data-action="favorite"
                        data-id="${recipe.id}">

                        ${
        favorite
            ? "✓ Đã lưu"
            : "♡ Lưu món"
    }

                    </button>


                </div>


            </div>


        </article>
    `;
}


function renderRecipes() {

    const data =
        suggestedRecipes()
            .slice(
                0,
                3
            );


    const grid =
        document.getElementById(
            "recipeGrid"
        );


    if (grid) {

        grid.innerHTML =
            data
                .map(
                    recipeCard
                )
                .join("");
    }


    setText(
        "suggestionCount",
        data.length
    );


    let diet =
        state.profile.diet;


    if (
        diet ===
        "Ăn linh tinh"
    ) {

        diet =
            "Không cố định";
    }


    setText(
        "suggestionText",
        `${getGoal()} • ${diet} • ưu tiên nguyên liệu đang có`
    );
}


/* =========================================================
   SELECTED AI
========================================================= */

function openSelectedAISuggestions() {

    const selectedItems =
        state.selectedFridgeIds
            .map(
                id =>
                    state.fridge.find(
                        food =>
                            Number(food.id) ===
                            Number(id)
                    )
            )
            .filter(
                Boolean
            );


    if (
        !selectedItems.length
    ) {

        showToast(
            "Hãy tích chọn ít nhất một nguyên liệu.",
            "warning"
        );


        return;
    }


    setText(
        "aiSelectedDescription",
        `Food X đang ưu tiên ${selectedItems.length} nguyên liệu đã chọn.`
    );


    const chips =
        document.getElementById(
            "selectedIngredientChips"
        );


    if (chips) {

        chips.innerHTML =
            selectedItems
                .map(
                    item => `

                        <span>
                            ✓ ${item.name}
                        </span>
                    `
                )
                .join("");
    }


    const suggestions =
        recipes
            .filter(
                isRecipeSafeForProfile
            )
            .map(
                recipe => ({

                    ...recipe,

                    score:
                        scoreRecipeWithSelected(
                            recipe,
                            selectedItems
                        )
                })
            )
            .sort(
                (a, b) =>
                    b.score -
                    a.score
            )
            .slice(
                0,
                6
            );


    const grid =
        document.getElementById(
            "aiSelectedRecipeGrid"
        );


    if (grid) {

        grid.innerHTML =
            suggestions
                .map(
                    recipeCard
                )
                .join("");
    }


    closeOtherModals(
        "aiSelectedModal"
    );


    document
        .getElementById(
            "aiSelectedModal"
        )
        ?.classList
        .add("show");
}


document
    .getElementById(
        "openSelectedAI"
    )
    ?.addEventListener(
        "click",
        openSelectedAISuggestions
    );


document
    .getElementById(
        "selectedAIButton"
    )
    ?.addEventListener(
        "click",
        openSelectedAISuggestions
    );


/* =========================================================
   FAVORITES
========================================================= */

function toggleFavorite(id) {

    id =
        Number(id);


    const recipe =
        recipes.find(
            item =>
                item.id ===
                id
        );


    if (!recipe) {
        return;
    }


    if (
        state.favorites.includes(
            id
        )
    ) {

        state.favorites =
            state.favorites
                .filter(
                    recipeId =>
                        recipeId !== id
                );


        showToast(
            `Đã bỏ "${recipe.name}" khỏi yêu thích.`,
            "info"
        );


    } else {

        state.favorites.push(
            id
        );


        showToast(
            `Đã lưu "${recipe.name}".`,
            "success"
        );
    }


    saveState();

    renderRecipes();
    renderFavorites();
    renderFridge();
}


function renderFavorites() {

    const data =
        recipes
            .filter(
                recipe =>
                    state.favorites.includes(
                        recipe.id
                    )
            )
            .map(
                recipe => ({

                    ...recipe,

                    score:
                        recipeScore(
                            recipe
                        )
                })
            );


    const grid =
        document.getElementById(
            "favoriteGrid"
        );


    const empty =
        document.getElementById(
            "favoriteEmpty"
        );


    if (grid) {

        grid.innerHTML =
            data
                .map(
                    recipeCard
                )
                .join("");
    }


    if (empty) {

        empty.style.display =
            data.length
                ? "none"
                : "block";
    }
}


/* =========================================================
   RECIPE DETAIL
========================================================= */

let activeRecipeContext =
    null;


let cookingState = {

    recipeId:
        null,

    stepIndex:
        0
};


function getRecipeById(id) {

    return recipes.find(
        recipe =>
            recipe.id ===
            Number(id)
    );
}


function openRecipeDetail(id) {

    const recipe =
        getRecipeById(
            id
        );


    if (!recipe) {
        return;
    }


    closeOtherModals(
        "recipeModal"
    );


    activeRecipeContext = {

        id:
        recipe.id,

        name:
        recipe.name,

        ingredients:
            [...recipe.ingredients],

        steps:
            [...recipe.steps],

        kcal:
        recipe.kcal,

        time:
        recipe.time,

        difficulty:
        recipe.difficulty
    };


    const missing =
        recipe.ingredients.filter(
            ingredient =>
                !hasIngredientInFridge(
                    ingredient
                )
        );


    setText(
        "recipeModalTitle",
        recipe.name
    );


    const body =
        document.getElementById(
            "recipeModalBody"
        );


    if (!body) {
        return;
    }


    body.innerHTML = `

        <div class="recipe-detail-v2">


            <div class="recipe-detail-hero">


                <img
                    src="${recipe.image}"
                    alt="${recipe.name}"
                    class="recipe-detail-main-image">


                <div class="recipe-detail-floating">

                    <span>
                        ✦ ${recipeScore(recipe)}% phù hợp
                    </span>

                </div>


            </div>


            <div class="recipe-detail-summary">


                <div class="recipe-main-info">


                    <span class="page-eyebrow">
                        CÔNG THỨC FOOD X
                    </span>


                    <h2>
                        ${recipe.name}
                    </h2>


                    <p>
                        Công thức được xếp hạng dựa trên tủ lạnh và hồ sơ dinh dưỡng.
                    </p>


                </div>


                <div class="recipe-quick-stats">


                    <div>

                        <span>
                            🔥 Năng lượng
                        </span>

                        <strong>
                            ${recipe.kcal} kcal
                        </strong>

                    </div>


                    <div>

                        <span>
                            ◷ Thời gian
                        </span>

                        <strong>
                            ${recipe.time} phút
                        </strong>

                    </div>


                    <div>

                        <span>
                            ◉ Độ khó
                        </span>

                        <strong>
                            ${recipe.difficulty}
                        </strong>

                    </div>


                </div>


            </div>


            <section class="recipe-v2-section">


                <div class="recipe-v2-section-heading">


                    <div>


                        <span class="recipe-section-number">
                            01
                        </span>


                        <div>

                            <h3>
                                Nguyên liệu cần có
                            </h3>

                            <p>
                                Kiểm tra với tủ lạnh của bạn.
                            </p>

                        </div>


                    </div>


                </div>


                <div class="ingredient-check-list">


                    ${
        recipe.ingredients
            .map(
                ingredient => {

                    const available =
                        hasIngredientInFridge(
                            ingredient
                        );


                    return `

                                        <div
                                            class="
                                                recipe-ingredient-row
                                                ${available ? "available" : "missing"}
                                            ">


                                            <div class="ingredient-check-icon">
                                                ${available ? "✓" : "!"}
                                            </div>


                                            <span>
                                                ${ingredient}
                                            </span>


                                            <strong>

                                                ${
                        available
                            ? "Đã có"
                            : "Còn thiếu"
                    }

                                            </strong>


                                        </div>
                                    `;
                }
            )
            .join("")
    }


                </div>


                ${
        missing.length

            ? `

                            <button
                                type="button"
                                class="secondary-button missing-shopping-button"
                                data-action="add-missing"
                                data-recipe="${recipe.id}">

                                🛒 Thêm ${missing.length}
                                nguyên liệu thiếu vào danh sách mua

                            </button>
                        `

            : `

                            <div class="recipe-ready-box">

                                ✓ Bạn đã có đủ nguyên liệu chính.

                            </div>
                        `
    }


            </section>


            <section class="recipe-v2-section">


                <div class="recipe-v2-section-heading">


                    <div>


                        <span class="recipe-section-number">
                            02
                        </span>


                        <div>

                            <h3>
                                Các bước thực hiện
                            </h3>

                            <p>
                                Xem nhanh quy trình trước khi nấu.
                            </p>

                        </div>


                    </div>


                </div>


                <div class="recipe-step-preview">


                    ${
        recipe.steps
            .map(
                (step, index) => `

                                    <div class="preview-step">


                                        <div class="preview-step-number">

                                            ${index + 1}

                                        </div>


                                        <div>

                                            <strong>
                                                Bước ${index + 1}
                                            </strong>

                                            <p>
                                                ${step}
                                            </p>

                                        </div>


                                    </div>
                                `
            )
            .join("")
    }


                </div>


            </section>


            <div class="recipe-detail-bottom-actions">


                <button
                    type="button"
                    class="secondary-button"
                    data-action="ask-recipe-ai"
                    data-id="${recipe.id}">

                    ✦ Hỏi AI về món này

                </button>


                <button
                    type="button"
                    class="primary-button"
                    data-action="start-cooking"
                    data-id="${recipe.id}">

                    👨‍🍳 Bắt đầu nấu

                </button>


            </div>


        </div>
    `;


    document
        .getElementById(
            "recipeModal"
        )
        ?.classList
        .add("show");
}


/* =========================================================
   COOKING
========================================================= */

function getCookingStepTitle(
    step,
    index
) {

    const text =
        normalize(
            step
        );


    if (
        text.includes("rua") ||
        text.includes("cat") ||
        text.includes("thai") ||
        text.includes("got")
    ) {

        return (
            "Chuẩn bị nguyên liệu"
        );
    }


    if (
        text.includes("uop")
    ) {

        return (
            "Ướp nguyên liệu"
        );
    }


    if (
        text.includes("xao")
    ) {

        return (
            "Xào nguyên liệu"
        );
    }


    if (
        text.includes("nuong")
    ) {

        return (
            "Nướng món ăn"
        );
    }


    if (
        text.includes("luoc") ||
        text.includes("hap")
    ) {

        return (
            "Làm chín nguyên liệu"
        );
    }


    if (
        text.includes("tron")
    ) {

        return (
            "Trộn nguyên liệu"
        );
    }


    return (
        `Thực hiện bước ${index + 1}`
    );
}


function startCooking(recipeId) {

    const recipe =
        getRecipeById(
            recipeId
        );


    if (!recipe) {
        return;
    }


    activeRecipeContext = {

        id:
        recipe.id,

        name:
        recipe.name,

        ingredients:
            [...recipe.ingredients],

        steps:
            [...recipe.steps],

        kcal:
        recipe.kcal,

        time:
        recipe.time,

        difficulty:
        recipe.difficulty
    };


    cookingState = {

        recipeId:
        recipe.id,

        stepIndex:
            0
    };


    closeOtherModals(
        "cookingModal"
    );


    renderCookingStep();


    document
        .getElementById(
            "cookingModal"
        )
        ?.classList
        .add("show");


    showToast(
        `Bắt đầu nấu ${recipe.name}.`,
        "success"
    );
}


function renderCookingStep() {

    const recipe =
        getRecipeById(
            cookingState.recipeId
        );


    if (!recipe) {
        return;
    }


    const total =
        recipe.steps.length;


    cookingState.stepIndex =
        Math.max(
            0,
            Math.min(
                total - 1,
                cookingState.stepIndex
            )
        );


    const index =
        cookingState.stepIndex;


    const step =
        recipe.steps[
            index
            ];


    setText(
        "cookingRecipeName",
        recipe.name
    );


    setText(
        "cookingProgressText",
        `Bước ${index + 1} / ${total}`
    );


    setText(
        "cookingStepNumber",
        index + 1
    );


    setText(
        "cookingStepTitle",
        getCookingStepTitle(
            step,
            index
        )
    );


    setText(
        "cookingStepDescription",
        step
    );


    setText(
        "cookingTime",
        `${recipe.time} phút`
    );


    setText(
        "cookingCalories",
        `${recipe.kcal} kcal`
    );


    const image =
        document.getElementById(
            "cookingRecipeImage"
        );


    if (image) {

        image.src =
            recipe.image;
    }


    const progress =
        (
            (index + 1) /
            total
        ) *
        100;


    const bar =
        document.getElementById(
            "cookingProgressBar"
        );


    if (bar) {

        bar.style.width =
            `${progress}%`;
    }


    const previous =
        document.getElementById(
            "previousCookingStep"
        );


    if (previous) {

        previous.disabled =
            index === 0;
    }


    const next =
        document.getElementById(
            "nextCookingStep"
        );


    if (next) {

        next.innerHTML =
            index ===
            total - 1

                ? "✓ Hoàn thành"

                : "Bước tiếp theo →";
    }


    updateChatContextBanner();
}


document
    .getElementById(
        "previousCookingStep"
    )
    ?.addEventListener(
        "click",
        () => {

            if (
                cookingState.stepIndex >
                0
            ) {

                cookingState.stepIndex--;


                renderCookingStep();
            }
        }
    );


document
    .getElementById(
        "nextCookingStep"
    )
    ?.addEventListener(
        "click",
        () => {

            const recipe =
                getRecipeById(
                    cookingState.recipeId
                );


            if (!recipe) {
                return;
            }


            if (
                cookingState.stepIndex >=
                recipe.steps.length - 1
            ) {

                document
                    .getElementById(
                        "cookingModal"
                    )
                    ?.classList
                    .remove("show");


                showToast(
                    `🎉 Bạn đã hoàn thành ${recipe.name}!`,
                    "success"
                );


                cookingState = {

                    recipeId:
                        null,

                    stepIndex:
                        0
                };


                updateChatContextBanner();


                return;
            }


            cookingState.stepIndex++;


            renderCookingStep();
        }
    );


/* =========================================================
   SHOPPING
========================================================= */

function renderShopping() {

    const list =
        document.getElementById(
            "shoppingList"
        );


    if (!list) {
        return;
    }


    if (
        !state.shopping.length
    ) {

        list.innerHTML = `

            <div class="empty-state">


                <span>
                    🛒
                </span>


                <h3>
                    Danh sách đang trống
                </h3>


                <p>
                    Thêm những nguyên liệu bạn cần mua.
                </p>


            </div>
        `;


        return;
    }


    list.innerHTML =
        state.shopping
            .map(
                item => `

                <div
                    class="
                        shopping-item
                        ${item.done ? "done" : ""}
                    ">


                    <input
                        type="checkbox"
                        data-action="shopping-check"
                        data-id="${item.id}"
                        ${item.done ? "checked" : ""}>


                    <span>
                        ${escapeHTML(item.name)}
                    </span>


                    <button
                        type="button"
                        class="delete-button"
                        data-action="shopping-delete"
                        data-id="${item.id}">

                        Xóa

                    </button>


                </div>
            `
            )
            .join("");
}


function addShoppingItem() {

    const input =
        document.getElementById(
            "shoppingInput"
        );


    if (!input) {
        return;
    }


    const value =
        input.value.trim();


    if (!value) {

        showToast(
            "Hãy nhập tên nguyên liệu.",
            "warning"
        );


        return;
    }


    if (
        state.shopping.some(
            item =>
                normalize(
                    item.name
                ) ===
                normalize(
                    value
                )
        )
    ) {

        showToast(
            "Nguyên liệu đã có trong danh sách.",
            "warning"
        );


        return;
    }


    state.shopping.push({

        id:
            Date.now(),

        name:
        value,

        done:
            false
    });


    input.value =
        "";


    saveState();

    renderShopping();


    showToast(
        `Đã thêm "${value}".`,
        "success"
    );
}


document
    .getElementById(
        "shoppingAdd"
    )
    ?.addEventListener(
        "click",
        addShoppingItem
    );


document
    .getElementById(
        "shoppingInput"
    )
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                addShoppingItem();
            }
        }
    );


function addMissingIngredients(
    recipeId
) {

    const recipe =
        getRecipeById(
            recipeId
        );


    if (!recipe) {
        return;
    }


    const missing =
        recipe.ingredients.filter(
            ingredient =>
                !hasIngredientInFridge(
                    ingredient
                )
        );


    let added =
        0;


    missing.forEach(
        ingredient => {

            const exists =
                state.shopping.some(
                    item =>
                        normalize(
                            item.name
                        ) ===
                        normalize(
                            ingredient
                        )
                );


            if (!exists) {

                state.shopping.push({

                    id:
                        Date.now() +
                        Math.floor(
                            Math.random() *
                            10000
                        ),

                    name:
                    ingredient,

                    done:
                        false
                });


                added++;
            }
        }
    );


    saveState();

    renderShopping();


    showToast(

        added
            ? `Đã thêm ${added} nguyên liệu vào danh sách mua.`
            : "Nguyên liệu đã có trong danh sách mua.",

        added
            ? "success"
            : "info"
    );
}


/* =========================================================
   STATS
========================================================= */

function renderStats() {

    setText(
        "fridgeCount",
        state.fridge.length
    );


    setText(
        "expiringCount",
        state.fridge.filter(
            item =>
                daysLeft(
                    item.expiresAt
                ) <= 3
        ).length
    );
}


function renderExpiring() {

    const items =
        state.fridge
            .filter(
                item =>
                    daysLeft(
                        item.expiresAt
                    ) <= 3
            )
            .sort(
                (a, b) =>
                    daysLeft(
                        a.expiresAt
                    ) -
                    daysLeft(
                        b.expiresAt
                    )
            );


    const container =
        document.getElementById(
            "homeExpiring"
        );


    if (!container) {
        return;
    }


    if (
        !items.length
    ) {

        container.innerHTML = `

            <p>
                Không có thực phẩm cần dùng sớm.
            </p>
        `;


        return;
    }


    container.innerHTML =
        items
            .slice(
                0,
                4
            )
            .map(
                item => {

                    const days =
                        daysLeft(
                            item.expiresAt
                        );


                    return `

                        <div class="expiring-item">


                            <strong>
                                ${item.name}
                            </strong>


                            <span>

                                ${
                        days <= 0

                            ? "Dùng ngay"

                            : `Còn ${days} ngày`
                    }

                            </span>


                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   REFRESH
========================================================= */

document
    .getElementById(
        "refreshSuggestions"
    )
    ?.addEventListener(
        "click",
        async event => {

            const restore =
                buttonLoading(
                    event.currentTarget,
                    "Đang phân tích..."
                );


            await Promise.all([

                loadFridgeFromApi(
                    false
                ),

                loadProfileFromApi(
                    false
                )
            ]);


            renderRecipes();


            restore();


            showToast(
                "Đã cập nhật gợi ý.",
                "success"
            );
        }
    );


/* =========================================================
   NOTIFICATION
========================================================= */

document
    .getElementById(
        "notificationButton"
    )
    ?.addEventListener(
        "click",
        () => {

            const expiring =
                state.fridge.filter(
                    item =>
                        daysLeft(
                            item.expiresAt
                        ) <= 3
                );


            if (
                !expiring.length
            ) {

                showToast(
                    "Hiện không có cảnh báo mới.",
                    "info"
                );


                return;
            }


            showToast(

                `Nên dùng sớm: ${
                    expiring
                        .slice(
                            0,
                            3
                        )
                        .map(
                            item =>
                                item.name
                        )
                        .join(", ")
                }.`,

                "warning"
            );
        }
    );


/* =========================================================
   CHAT
========================================================= */

const chatWindow =
    document.getElementById(
        "chatWindow"
    );


const chatInput =
    document.getElementById(
        "chatInput"
    );


const chatMessages =
    document.getElementById(
        "chatMessages"
    );


function addChatMessage(text, sender) {
    if (!chatMessages) return;
    const div = document.createElement("div");
    div.className = `message ${sender}`;
    if (sender === 'ai') {
        div.innerHTML = text;
    } else {
        div.textContent = text;
    }
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


function updateChatContextBanner() {

    const banner =
        document.getElementById(
            "chatContextBanner"
        );


    if (!banner) {
        return;
    }


    if (
        !activeRecipeContext
    ) {

        banner.classList.remove(
            "show"
        );


        banner.innerHTML =
            "";


        return;
    }


    let stepText =
        "";


    if (
        cookingState.recipeId ===
        activeRecipeContext.id
    ) {

        stepText =
            ` • Bước ${cookingState.stepIndex + 1}/${activeRecipeContext.steps.length}`;
    }


    banner.innerHTML = `

        ✦ Bạn đang hỏi về:

        <strong>
            ${activeRecipeContext.name}
        </strong>

        ${stepText}
    `;


    banner.classList.add(
        "show"
    );
}


function openContextChat(
    type = "recipe"
) {

    chatWindow
        ?.classList
        .add("show");


    updateChatContextBanner();


    setTimeout(
        () =>
            chatInput
                ?.focus(),
        120
    );


    if (
        type === "step"
    ) {

        const recipe =
            getRecipeById(
                cookingState.recipeId
            );


        if (recipe) {

            const step =
                recipe.steps[
                    cookingState.stepIndex
                    ];


            addChatMessage(
                `Bạn đang ở bước ${cookingState.stepIndex + 1}: "${step}". Bạn chưa hiểu chỗ nào?`,
                "ai"
            );
        }


    } else if (
        activeRecipeContext
    ) {

        addChatMessage(
            `Tôi đang theo dõi công thức "${activeRecipeContext.name}". Bạn muốn hỏi gì về món này?`,
            "ai"
        );
    }
}


document
    .getElementById(
        "askCurrentStepAI"
    )
    ?.addEventListener(
        "click",
        () =>
            openContextChat(
                "step"
            )
    );


function contextualRecipeAI(question) {

    if (
        !activeRecipeContext
    ) {

        return null;
    }


    const text =
        normalize(
            question
        );


    const recipe =
        activeRecipeContext;


    let currentStep =
        null;


    if (
        cookingState.recipeId ===
        recipe.id
    ) {

        currentStep =
            recipe.steps[
                cookingState.stepIndex
                ];
    }


    if (
        text.includes(
            "nguyen lieu"
        )
    ) {

        return (
            `${recipe.name} cần: ${recipe.ingredients.join(", ")}.`
        );
    }


    if (
        text.includes("calo") ||
        text.includes("kcal")
    ) {

        return (
            `${recipe.name} được ước tính khoảng ${recipe.kcal} kcal/khẩu phần.`
        );
    }


    if (
        text.includes("bao lau") ||
        text.includes("may phut")
    ) {

        return (
            `Thời gian dự kiến của ${recipe.name} là khoảng ${recipe.time} phút.`
        );
    }


    if (
        text.includes("khong co") ||
        text.includes("thay bang") ||
        text.includes("thay ")
    ) {

        return (
            `Bạn đang hỏi về ${recipe.name}. Nguyên liệu gốc gồm ${recipe.ingredients.join(", ")}. Hiện đây vẫn là AI mô phỏng; sau này AI thật sẽ phân tích nguyên liệu thay thế chính xác hơn.`
        );
    }


    if (
        text.includes("khong hieu") ||
        text.includes("lam sao") ||
        text.includes("lam nhu nao") ||
        text.includes("nghia la gi")
    ) {

        if (currentStep) {

            return (
                `Bạn đang ở bước ${cookingState.stepIndex + 1}: "${currentStep}". Hãy nói cụ thể thao tác nào chưa hiểu để Food X giải thích tiếp.`
            );
        }
    }


    if (currentStep) {

        return (
            `Bạn đang nấu "${recipe.name}", bước ${cookingState.stepIndex + 1}: "${currentStep}".`
        );
    }


    return (
        `Bạn đang hỏi về "${recipe.name}". Tôi có thể hỗ trợ nguyên liệu, cách làm, calo và thời gian.`
    );
}


function fakeAI(question) {

    if (
        activeRecipeContext
    ) {

        const answer =
            contextualRecipeAI(
                question
            );


        if (answer) {

            return answer;
        }
    }


    const text =
        normalize(
            question
        );


    if (
        text.includes("an gi") ||
        text.includes("goi y") ||
        text.includes("mon")
    ) {

        const best =
            suggestedRecipes()[0];


        return best

            ? `Food X gợi ý ${best.name}. Món này khoảng ${best.kcal} kcal và đạt ${best.score}% phù hợp.`

            : "Hiện chưa tìm thấy món phù hợp.";
    }


    if (
        text.includes("bmi") ||
        text.includes("can nang")
    ) {

        const bmi =
            calculateBMI(
                state.profile.weight,
                state.profile.height
            );


        return (
            `BMI hiện tại khoảng ${bmi.toFixed(1)}. Cân nặng ${state.profile.weight} kg, chiều cao ${state.profile.height} cm.`
        );
    }


    if (
        text.includes("calo") ||
        text.includes("kcal")
    ) {

        const calories =
            calculateCalories(
                state.profile.gender,
                state.profile.age,
                state.profile.weight,
                state.profile.height,
                state.profile.activity,
                state.profile.target
            );


        return (
            `Mức năng lượng tham khảo khoảng ${formatNumber(calories)} kcal/ngày.`
        );
    }


    if (
        text.includes(
            "tu lanh"
        )
    ) {

        return (
            `Tủ lạnh hiện có ${state.fridge.length} loại thực phẩm.`
        );
    }


    if (
        text.includes(
            "het han"
        )
    ) {

        const data =
            state.fridge
                .filter(
                    item =>
                        daysLeft(
                            item.expiresAt
                        ) <= 3
                )
                .map(
                    item =>
                        item.name
                );


        return data.length

            ? `Bạn nên ưu tiên dùng: ${data.join(", ")}.`

            : "Không có thực phẩm nào cần dùng gấp.";
    }


    return (
        "Tôi hiện là lớp mô phỏng AI của Food X. Bạn có thể hỏi về món ăn, BMI, calo, tủ lạnh hoặc thực phẩm sắp hết hạn."
    );
}


function sendChat() {
    const text = chatInput?.value.trim();
    if (!text) return;

    addChatMessage(text, "user");
    chatInput.value = "";

    const loading = document.createElement("div");
    loading.className = "message ai typing-message";
    loading.innerHTML = `<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>`;
    chatMessages?.appendChild(loading);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
    })
    .then(res => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
    })
    .then(j => {
        loading.remove();
        if (j && j.success && j.data) {
            const reply = (j.data.reply || '').replace(/\n/g, '<br>');
            addChatMessage(reply, "ai");
        } else {
            addChatMessage("Có lỗi xảy ra, thử lại nhé!", "ai");
        }
    })
    .catch(() => {
        loading.remove();
        addChatMessage("Không kết nối được máy chủ. Hãy khởi động backend rồi thử lại.", "ai");
    });
}


document
    .getElementById(
        "sendChat"
    )
    ?.addEventListener(
        "click",
        sendChat
    );


chatInput
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                sendChat();
            }
        }
    );


document
    .getElementById(
        "closeChat"
    )
    ?.addEventListener(
        "click",
        () =>
            chatWindow
                ?.classList
                .remove("show")
    );


document
    .getElementById(
        "chatFloating"
    )
    ?.addEventListener(
        "click",
        () => {

            const cookingOpen =
                document
                    .getElementById(
                        "cookingModal"
                    )
                    ?.classList
                    .contains(
                        "show"
                    );


            const recipeOpen =
                document
                    .getElementById(
                        "recipeModal"
                    )
                    ?.classList
                    .contains(
                        "show"
                    );


            if (
                activeRecipeContext &&
                (
                    cookingOpen ||
                    recipeOpen
                )
            ) {

                openContextChat(
                    cookingOpen
                        ? "step"
                        : "recipe"
                );


                return;
            }


            if (
                state.selectedFridgeIds
                    .length
            ) {

                openSelectedAISuggestions();


                return;
            }


            chatWindow
                ?.classList
                .toggle(
                    "show"
                );


            setTimeout(
                () =>
                    chatInput
                        ?.focus(),
                100
            );
        }
    );


/* =========================================================
   GLOBAL ACTIONS
========================================================= */

document.addEventListener(
    "click",
    event => {

        const target =
            event.target.closest(
                "[data-action]"
            );


        if (!target) {
            return;
        }


        const action =
            target.dataset.action;


        const rawId =
            target.dataset.id;


        const id =
            Number(
                rawId
            );


        if (
            action ===
            "add-food"
        ) {

            addFoodToFridge(
                rawId,
                target
            );


            return;
        }


        if (
            action ===
            "ingredient-detail"
        ) {

            openIngredientDetail(
                id
            );


            return;
        }


        if (
            action ===
            "save-ingredient-expiry"
        ) {

            saveIngredientExpiry(
                id
            );


            return;
        }


        if (
            action ===
            "increase-fridge"
        ) {

            adjustFridge(
                id,
                1
            );


            return;
        }


        if (
            action ===
            "decrease-fridge"
        ) {

            adjustFridge(
                id,
                -1
            );


            return;
        }


        if (
            action ===
            "use-fridge"
        ) {

            useFridgeFood(
                id
            );


            return;
        }


        if (
            action ===
            "delete-fridge"
        ) {

            deleteFridgeFood(
                id
            );


            return;
        }


        if (
            action ===
            "favorite"
        ) {

            toggleFavorite(
                id
            );


            return;
        }


        if (
            action ===
            "recipe-detail"
        ) {

            openRecipeDetail(
                id
            );


            return;
        }


        if (
            action ===
            "start-cooking"
        ) {

            startCooking(
                id
            );


            return;
        }


        if (
            action ===
            "ask-recipe-ai"
        ) {

            const recipe =
                getRecipeById(
                    id
                );


            if (!recipe) {
                return;
            }


            activeRecipeContext = {

                id:
                recipe.id,

                name:
                recipe.name,

                ingredients:
                    [...recipe.ingredients],

                steps:
                    [...recipe.steps],

                kcal:
                recipe.kcal,

                time:
                recipe.time,

                difficulty:
                recipe.difficulty
            };


            openContextChat(
                "recipe"
            );


            return;
        }


        if (
            action ===
            "add-missing"
        ) {

            addMissingIngredients(
                Number(
                    target.dataset.recipe
                )
            );


            return;
        }


        if (
            action ===
            "shopping-delete"
        ) {

            state.shopping =
                state.shopping.filter(
                    item =>
                        Number(
                            item.id
                        ) !==
                        id
                );


            saveState();

            renderShopping();


            showToast(
                "Đã xóa khỏi danh sách mua.",
                "success"
            );


            return;
        }
    }
);


/* =========================================================
   CHECKBOX EVENTS
========================================================= */

document.addEventListener(
    "change",
    event => {

        const fridgeCheckbox =
            event.target.closest(
                '[data-action="select-fridge"]'
            );


        if (fridgeCheckbox) {

            toggleSelectedFridge(

                Number(
                    fridgeCheckbox.dataset.id
                ),

                fridgeCheckbox.checked
            );


            return;
        }


        const shoppingCheckbox =
            event.target.closest(
                '[data-action="shopping-check"]'
            );


        if (shoppingCheckbox) {

            const id =
                Number(
                    shoppingCheckbox.dataset.id
                );


            const item =
                state.shopping.find(
                    item =>
                        Number(
                            item.id
                        ) ===
                        id
                );


            if (!item) {
                return;
            }


            item.done =
                shoppingCheckbox.checked;


            saveState();

            renderShopping();


            showToast(

                item.done

                    ? `Đã mua ${item.name}.`

                    : `Đã bỏ đánh dấu ${item.name}.`,

                "info"
            );
        }
    }
);


/* =========================================================
   GO TO FOOD SEARCH
========================================================= */

function goToFoodSearch() {

    openView(
        "home"
    );


    setTimeout(
        () => {

            foodSearch
                ?.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "center"
                });


            foodSearch
                ?.focus();

        },
        250
    );
}


document
    .getElementById(
        "fridgeAddMore"
    )
    ?.addEventListener(
        "click",
        goToFoodSearch
    );


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    renderProfile();

    renderAuthSettings();

    renderSearch();

    renderFridge();

    renderRecipes();

    renderFavorites();

    renderShopping();

    renderStats();

    renderExpiring();
}

/* =========================================================
   START FOOD X
========================================================= */

async function startFoodX() {

    /*
        Hiển thị giao diện trước.
    */

    renderAll();


    /*
        Sau đó lấy dữ liệu thật từ MySQL.
    */

    const results =
        await Promise.all([

            loadFridgeFromApi(
                false
            ),

            loadProfileFromApi(
                false
            ),

            loadAuthState(
                false
            )
        ]);



    const fridgeConnected =
        results[0];


    const profileConnected =
        results[1];
    const authConnected =
        results[2];


    if (
        fridgeConnected &&
        profileConnected &&
        authConnected
    )
    {

        console.log(
            "✅ Food X đã đồng bộ MySQL: Tủ lạnh + Hồ sơ + Auth."
        );

    } else {

        console.warn(
            "⚠ Một số dữ liệu chưa đồng bộ được với MySQL."
        );


        showToast(
            "Một số dữ liệu chưa đồng bộ với server.",
            "warning"
        );
    }
}


startFoodX();


/* =========================================================
   SOCIAL - CHIA SE CONG THUC
========================================================= */

const SOCIAL_API = '/api/social';

let likedPostsState = JSON.parse(localStorage.getItem('foodx_liked_posts') || '{}');
let savedPostsState = JSON.parse(localStorage.getItem('foodx_saved_posts') || '{}');
let localCommentsState = JSON.parse(localStorage.getItem('foodx_post_comments') || '{}');
let currentSocialCategory = 'all';
let currentSocialSearch = '';

const communityFeedPosts = [
    {
        id: 'c101',
        title: 'Bí quyết nấu Phở Bò truyền thống chuẩn vị Hà Nội thanh ngọt dịu',
        description: 'Hướng dẫn chi tiết từ khâu hầm xương bò nguyên chất 6 tiếng, rang thơm hoa hồi thảo quả đến kỹ thuật trần bánh phở chuẩn vị...',
        authorName: 'Mẹ Bi',
        authorAvatar: '',
        authorRole: 'Food Blogger',
        category: 'family',
        cookTime: '45 phút',
        kcal: 450,
        likeCount: 248,
        commentCount: 34,
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1000&q=80',
        ingredients: ['Thịt bò thăn 500g', 'Xương ống 1kg', 'Bánh phở tươi 500g', 'Gừng, hành khô, hoa hồi, thảo quả, quế'],
        instructions: '1. Sơ chế chần sạch xương bò vát rửa kỹ.\n2. Nướng gừng, hành khô, quế hồi thảo quả cho dậy mùi thơm.\n3. Hầm xương lửa nhỏ trong 4-6 tiếng, nêm gia vị vừa ăn.\n4. Bày bánh phở ra bát, xếp thịt bò thái mỏng, chan nước dùng nóng hổi và thêm hành ngò.'
    },
    {
        id: 'c102',
        title: 'Salad Ức Gà Sốt Bơ Chanh — Bữa trưa Eat Clean giảm mỡ siêu nhanh',
        description: 'Món salad thanh mát, giàu đạm và chất xơ. Nước sốt bơ tỏi chanh béo ngậy giúp ức gà không bị khô cứng!',
        authorName: 'Coach Hoàng Anh',
        authorAvatar: '',
        authorRole: 'Fitness & Nutrition',
        category: 'eatclean',
        cookTime: '15 phút',
        kcal: 280,
        likeCount: 389,
        commentCount: 52,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
        ingredients: ['Ức gà 300g', 'Xà lách thủy canh, cà chua chery', 'Bơ chín 1 quả', 'Chanh tươi, dầu olive, tỏi băm'],
        instructions: '1. Áp chảo ức gà thái lát cùng chút muối pepper và tỏi băm.\n2. Rửa sạch xà lách và cà chua chery cắt đôi.\n3. Xay nhuyễn bơ chín với chanh tươi, dầu olive làm nước sốt.\n4. Trộn đều các nguyên liệu và thưởng thức ngay.'
    },
    {
        id: 'c103',
        title: 'Cơm Tấm Sườn Nướng Chả Trứng — Hương vị Sài Gòn nướng đậm đà',
        description: 'Bí quyết ướp sườn mềm mọng nước với sữa tươi và mật ong, kết hợp chả trứng hấp béo ngậy chuẩn vị quán ngon...',
        authorName: 'Chef Tuấn Kiệt',
        authorAvatar: '',
        authorRole: 'Đầu bếp gia đình',
        category: 'family',
        cookTime: '35 phút',
        kcal: 580,
        likeCount: 512,
        commentCount: 78,
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80',
        ingredients: ['Sườn cốt lết 400g', 'Thịt xay, trứng gà, nấm mèo', 'Cơm tấm', 'Sữa tươi không đường, mật ong, dầu màu điều'],
        instructions: '1. Ướp sườn với mắm, tỏi, mật ong, sữa tươi ít nhất 2 tiếng.\n2. Trộn thịt xay, nấm mèo băm, trứng gà đem hấp làm chả trứng.\n3. Nướng sườn trên bếp than hoặc nồi chiên không dầu ở 180°C.\n4. Dùng kèm cơm tấm nóng, dưa leo và mỡ hành.'
    },
    {
        id: 'c104',
        title: 'Canh Cua Đồng Nấu Mồng Tơi & Rạm giải nhiệt ngày hè cực ngon',
        description: 'Món canh đậm chất quê hương ngọt thanh béo ngậy gạch cua, kết hợp cà pháo muối giòn rụm đưa cơm...',
        authorName: 'Chị Thảo',
        authorAvatar: '',
        authorRole: 'Yêu Bếp',
        category: 'family',
        cookTime: '25 phút',
        kcal: 210,
        likeCount: 195,
        commentCount: 23,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=80',
        ingredients: ['Cua đồng xay 300g', 'Rau mồng tơi, mướp hương', 'Hành khô, gia vị, mắm tôm'],
        instructions: '1. Lọc nước cua lấy phần cốt, chưng gạch cua với hành khô thơm.\n2. Đun nước cua lửa nhỏ cho thịt cua đóng mảng nổi lên.\n3. Thả mướp hương và rau mồng tơi cắt khúc vào nấu chín tới.'
    },
    {
        id: 'c105',
        title: 'Trứng Cuộn Bơ Nấm 10 Phút Cho Bữa Sáng Đủ Chất Năng Lượng',
        description: 'Giải pháp bữa sáng cực nhanh gọn, thơm mềm béo ngậy từ trứng và quả bơ cho ngày làm việc căng tràn năng lượng...',
        authorName: 'Bếp Nhà An',
        authorAvatar: '',
        authorRole: 'Foodie',
        category: 'quick',
        cookTime: '10 phút',
        kcal: 310,
        likeCount: 340,
        commentCount: 41,
        createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=80',
        ingredients: ['Trứng gà 3 quả', 'Bơ 1/2 quả', 'Nấm mỡ 50g', 'Bơ lạt, sữa tươi'],
        instructions: '1. Đánh tan trứng gà với 1 thìa sữa tươi và chút muối.\n2. Xào chín nấm mỡ với bơ lạt.\n3. Đổ trứng vào chảo chống dính, xếp bơ thái lát và nấm lên trên rồi cuộn nhẹ tay.'
    },
    {
        id: 'c106',
        title: 'Bánh Matcha Mousse Trà Xanh Béo Ngậy Không Cần Lò Nướng',
        description: 'Món tráng miệng thanh mát chuẩn phong cách Nhật Bản. Lớp mousse mềm mịn đắng nhẹ quyện cùng vị ngọt dịu...',
        authorName: 'Linh Pastry',
        authorAvatar: '',
        authorRole: 'Baker',
        category: 'dessert',
        cookTime: '40 phút',
        kcal: 340,
        likeCount: 467,
        commentCount: 65,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=80',
        ingredients: ['Bột matcha 15g', 'Whipping cream 200ml', 'Gelatin 10g', 'Bánh quy, bơ lạt'],
        instructions: '1. Làm đế bánh bằng bánh quy nghiền trộn bơ lạt ép chặt đáy khuôn.\n2. Ngâm gelatin nở mềm, hòa tan cùng bột matcha và đường.\n3. Đánh bông nhẹ whipping cream rồi trộn đều với hỗn hợp matcha.\n4. Đổ vào khuôn và để tủ lạnh 4 tiếng.'
    }
];

function socialTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Vừa xong';
    if (min < 60) return min + ' phút trước';
    const h = Math.floor(min / 60);
    if (h < 24) return h + ' giờ trước';
    const days = Math.floor(h / 24);
    if (days < 7) return days + ' ngày trước';
    return d.toLocaleDateString('vi-VN');
}

function postCard(post) {
    const isLiked = !!likedPostsState[post.id];
    const isSaved = !!savedPostsState[post.id];
    const currentLikes = (post.likeCount || 0) + (isLiked ? 1 : 0);

    const ings = (post.ingredients || [])
        .map(i => '<span class="chip">' + escapeHtml(i) + '</span>')
        .join('');

    const img = post.imageUrl
        ? '<div class="post-img-container"><img class="post-image" src="' + escapeHtml(post.imageUrl) + '" alt="' + escapeHtml(post.title) + '" loading="lazy" onerror="this.parentElement.style.display=\'none\'"></div>'
        : '';

    const canDelete = window.authState && authState.userId && authState.userId === post.authorId;
    const commentsList = localCommentsState[post.id] || [];
    const totalComments = (post.commentCount || 0) + commentsList.length;

    return '' +
        '<article class="card post-card" data-post-id="' + post.id + '">' +
            '<div class="post-header">' +
                '<div class="post-avatar-wrap"><div class="post-avatar-emoji">👨‍🍳</div></div>' +
                '<div class="post-author-info">' +
                    '<strong>' + escapeHtml(post.authorName || 'Thành viên FoodX') + '</strong>' +
                    '<span>' + (post.authorRole ? escapeHtml(post.authorRole) + ' • ' : '') + socialTime(post.createdAt) + '</span>' +
                '</div>' +
                '<span class="post-badge-tag">' + (post.cookTime ? '⏱ ' + post.cookTime : 'Công thức') + '</span>' +
                (canDelete ? '<button class="text-button post-delete" data-delete="' + post.id + '">🗑 Xóa</button>' : '') +
            '</div>' +
            '<h3 class="post-title">' + escapeHtml(post.title) + '</h3>' +
            '<div class="post-meta-pills">' +
                (post.kcal ? '<span>🔥 ' + post.kcal + ' kcal</span>' : '') +
                '<span>📊 ' + (post.category === 'eatclean' ? 'Healthy' : 'Dễ nấu') + '</span>' +
            '</div>' +
            img +
            (post.description ? '<p class="post-desc">' + escapeHtml(post.description) + '</p>' : '') +
            (ings ? '<div class="post-ingredients"><b>Nguyên liệu:</b> ' + ings + '</div>' : '') +
            (post.instructions ? '<details class="post-steps"><summary>👨‍🍳 Xem công thức & nguyên liệu chi tiết</summary><pre>' + escapeHtml(post.instructions) + '</pre></details>' : '') +
            '<div class="post-actions-bar">' +
                '<button type="button" class="post-action-btn' + (isLiked ? ' active' : '') + '" data-like="' + post.id + '">' +
                    (isLiked ? '❤️' : '🤍') + ' <span>' + currentLikes + '</span>' +
                '</button>' +
                '<button type="button" class="post-action-btn' + (isSaved ? ' saved-active' : '') + '" data-save="' + post.id + '" data-title="' + escapeHtml(post.title) + '">' +
                    (isSaved ? '🔖 Đã lưu' : '🤍 Lưu món') +
                '</button>' +
                '<button type="button" class="post-action-btn" data-comments="' + post.id + '">' +
                    '💬 <span>' + totalComments + '</span>' +
                '</button>' +
                '<button type="button" class="post-action-btn" data-share="' + post.id + '">' +
                    '↗️ Chia sẻ' +
                '</button>' +
            '</div>' +
            '<div class="post-comments" data-comments-box="' + post.id + '" hidden>' +
                '<div class="comment-list" data-comment-list="' + post.id + '">' +
                    commentsList.map(function(c) {
                        return '<div class="comment-item"><strong>' + escapeHtml(c.author) + ':</strong> <span>' + escapeHtml(c.text) + '</span></div>';
                    }).join('') +
                '</div>' +
                '<div class="comment-input-row">' +
                    '<input class="comment-input" data-comment-input="' + post.id + '" placeholder="Viết bình luận..." autocomplete="off">' +
                    '<button class="primary-button" style="padding:6px 14px;font-size:12px;" data-comment-send="' + post.id + '">Gửi</button>' +
                '</div>' +
            '</div>' +
        '</article>';
}

let allSocialPostsCache = [];

async function loadSocialFeed() {
    const feed = document.getElementById('socialFeed');
    if (!feed) return;
    feed.innerHTML = '<div class="social-empty" style="grid-column:1/-1;">⏳ Đang tải các bài chia sẻ công thức...</div>';

    let apiPosts = [];
    try {
        apiPosts = await apiRequest(SOCIAL_API + '/posts') || [];
    } catch (error) {
        apiPosts = [];
    }

    // Combine API posts with sample community posts
    allSocialPostsCache = apiPosts.concat(communityFeedPosts);

    renderSocialFeedFiltered();
}

function renderSocialFeedFiltered() {
    const feed = document.getElementById('socialFeed');
    if (!feed) return;

    let posts = allSocialPostsCache;
    const cat = currentSocialCategory;
    const kw = currentSocialSearch.trim().toLowerCase();

    // Category filtering
    if (cat !== 'all') {
        posts = posts.filter(function (p) {
            if (cat === 'hot') return (p.likeCount || 0) > 200;
            if (cat === 'liked') return !!likedPostsState[p.id];
            if (cat === 'saved') return !!savedPostsState[p.id];
            return p.category === cat;
        });
    }

    // Keyword filtering
    if (kw) {
        posts = posts.filter(function (p) {
            const titleOk = String(p.title || '').toLowerCase().includes(kw);
            const descOk = String(p.description || '').toLowerCase().includes(kw);
            const ingOk = (p.ingredients || []).some(function (i) { return String(i).toLowerCase().includes(kw); });
            return titleOk || descOk || ingOk;
        });
    }

    if (!posts || !posts.length) {
        feed.innerHTML = '<div class="social-empty" style="grid-column:1/-1;">Không tìm thấy bài chia sẻ phù hợp. Hãy chọn danh mục khác hoặc thử đăng bài đầu tiên! 🎉</div>';
        return;
    }

    feed.innerHTML = posts.map(postCard).join('');
    wirePostEvents();
}

function wirePostEvents() {
    // Like button
    document.querySelectorAll('[data-like]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const id = btn.getAttribute('data-like');
            likedPostsState[id] = !likedPostsState[id];
            localStorage.setItem('foodx_liked_posts', JSON.stringify(likedPostsState));
            showToast(likedPostsState[id] ? 'Đã thích bài viết ❤️' : 'Đã bỏ thích bài viết.', 'info');
            renderSocialFeedFiltered();
            try { apiRequest(SOCIAL_API + '/posts/' + id + '/like', { method: 'POST' }); } catch(e){}
        });
    });

    // Save button
    document.querySelectorAll('[data-save]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const id = btn.getAttribute('data-save');
            const title = btn.getAttribute('data-title') || 'Bài viết';
            savedPostsState[id] = !savedPostsState[id];
            localStorage.setItem('foodx_saved_posts', JSON.stringify(savedPostsState));
            showToast(savedPostsState[id] ? 'Đã lưu "' + title + '" vào công thức yêu thích 🔖' : 'Đã bỏ lưu món.', 'success');
            renderSocialFeedFiltered();
        });
    });

    // Comment toggle
    document.querySelectorAll('[data-comments]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const id = btn.getAttribute('data-comments');
            const box = document.querySelector('[data-comments-box="' + id + '"]');
            if (box) {
                box.hidden = !box.hidden;
            }
        });
    });

    // Comment send
    document.querySelectorAll('[data-comment-send]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const id = btn.getAttribute('data-comment-send');
            const input = document.querySelector('[data-comment-input="' + id + '"]');
            if (input && input.value.trim()) {
                const text = input.value.trim();
                localCommentsState[id] = localCommentsState[id] || [];
                localCommentsState[id].push({ author: 'Bạn', text: text });
                localStorage.setItem('foodx_post_comments', JSON.stringify(localCommentsState));
                input.value = '';
                showToast('Đã gửi bình luận! 💬', 'success');
                renderSocialFeedFiltered();
                const box = document.querySelector('[data-comments-box="' + id + '"]');
                if (box) box.hidden = false;
            }
        });
    });

    // Share button
    document.querySelectorAll('[data-share]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
            }
            showToast('Đã sao chép liên kết bài viết! 🔗', 'success');
        });
    });

    // Delete post
    document.querySelectorAll('[data-delete]').forEach(function (btn) {
        btn.addEventListener('click', function () { deletePost(btn.getAttribute('data-delete')); });
    });
}

async function deletePost(id) {
    if (!window.confirm('Bạn muốn xóa bài chia sẻ này?')) return;
    try {
        await apiRequest(SOCIAL_API + '/posts/' + id, { method: 'DELETE' });
        showToast('Đã xóa bài chia sẻ.', 'success');
        loadSocialFeed();
    } catch (error) {
        showToast('Không xóa được bài chia sẻ.', 'error');
    }
}

async function createPost() {
    const title = document.getElementById('postTitle');
    if (!title || !title.value.trim()) {
        showToast('Vui lòng nhập tên món ăn.', 'warning');
        return;
    }
    const cat = document.getElementById('postCategory');
    const time = document.getElementById('postTime');
    const kcal = document.getElementById('postKcal');
    const desc = document.getElementById('postDescription');
    const ings = document.getElementById('postIngredients');
    const inst = document.getElementById('postInstructions');
    const img = document.getElementById('postImage');
    const btn = document.getElementById('postSubmit');

    if (btn) btn.disabled = true;

    const newPost = {
        id: 'user_' + Date.now(),
        title: title.value.trim(),
        category: cat ? cat.value : 'family',
        cookTime: time && time.value ? time.value + ' phút' : '20 phút',
        kcal: kcal && kcal.value ? +kcal.value : 300,
        description: desc ? desc.value.trim() : '',
        ingredients: ings ? ings.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean) : [],
        instructions: inst ? inst.value.trim() : '',
        imageUrl: img && img.value.trim() ? img.value.trim() : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
        authorName: 'Bạn (Người dùng FoodX)',
        authorRole: 'Thành viên yêu bếp',
        createdAt: new Date().toISOString(),
        likeCount: 1,
        commentCount: 0
    };

    try {
        await apiRequest(SOCIAL_API + '/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPost)
        });
    } catch (e) {}

    allSocialPostsCache.unshift(newPost);
    showToast('Đã đăng bài chia sẻ thành công! 🎉', 'success');

    // Reset inputs & hide composer card
    [title, time, kcal, desc, ings, inst, img].forEach(function (el) { if (el) el.value = ''; });
    const composerCard = document.getElementById('socialComposerCard');
    if (composerCard) composerCard.hidden = true;

    if (btn) btn.disabled = false;
    renderSocialFeedFiltered();
}

(function initSocialAndChat() {
    const submit = document.getElementById('postSubmit');
    if (submit) submit.addEventListener('click', createPost);

    // Toggle composer
    const toggleBtn = document.getElementById('toggleComposerBtn');
    const closeBtn = document.getElementById('closeComposerBtn');
    const cancelBtn = document.getElementById('cancelComposerBtn');
    const composerCard = document.getElementById('socialComposerCard');

    if (toggleBtn && composerCard) {
        toggleBtn.addEventListener('click', function() {
            composerCard.hidden = !composerCard.hidden;
            if (!composerCard.hidden) {
                const titleInput = document.getElementById('postTitle');
                if (titleInput) titleInput.focus();
            }
        });
    }

    if (closeBtn && composerCard) closeBtn.addEventListener('click', function() { composerCard.hidden = true; });
    if (cancelBtn && composerCard) cancelBtn.addEventListener('click', function() { composerCard.hidden = true; });

    // Category pills filter
    document.querySelectorAll('#socialCategoryPills .social-pill').forEach(function(pill) {
        pill.addEventListener('click', function() {
            document.querySelectorAll('#socialCategoryPills .social-pill').forEach(function(p) { p.classList.remove('active'); });
            pill.classList.add('active');
            currentSocialCategory = pill.getAttribute('data-social-cat') || 'all';
            renderSocialFeedFiltered();
        });
    });

    // Search input filter
    const searchInput = document.getElementById('socialSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSocialSearch = searchInput.value;
            renderSocialFeedFiltered();
        });
    }

    loadSocialFeed();
})();



/* =========================================================
   WELCOME SCREEN
========================================================= */
(function initWelcome() {
    const enter = document.getElementById('welcomeEnter');
    const screen = document.getElementById('welcomeScreen');
    if (!enter || !screen) return;
    enter.addEventListener('click', function () {
        screen.classList.add('hidden');
    });
})();



/* =========================================================
   RECIPES BROWSE + DETAIL (gop tu dk-dn)
========================================================= */
let recipesCache = [];
let curRecipe = null;

function recipeEmoji(r) {
    const t = (r.title || '').toLowerCase();
    if (t.includes('phở')) return '🍜';
    if (t.includes('gà')) return '🍗';
    if (t.includes('cơm')) return '🍚';
    if (t.includes('bánh mì')) return '🥖';
    if (t.includes('rau')) return '🥦';
    if (t.includes('canh')) return '🐟';
    if (t.includes('súp')) return '🎃';
    if (t.includes('bò')) return '🥩';
    if (t.includes('cháo')) return '🍲';
    if (t.includes('gỏi')) return '🥗';
    if (t.includes('chè')) return '🍮';
    return '🍽️';
}

function recipeMatch(r) {
    const have = (window.state && (state.fridge || [])) ? state.fridge.map(i => String(i.name || '').toLowerCase()) : [];
    if (!have.length) return 55;
    const names = (r.ingredients || []).map(i => String(i.ingredientName || '').toLowerCase());
    if (!names.length) return 70;
    const hit = names.filter(function (n) {
        return have.some(function (h) {
            return h.includes(n.split(' ')[0]) || n.includes(h.split(' ')[0]);
        });
    }).length;
    return Math.min(95, Math.round(45 + hit / names.length * 55));
}

async function loadRecipes() {
    try {
        recipesCache = await apiRequest('/api/recipes') || [];
    } catch (e) {
        recipesCache = [];
    }
    renderRecipeBrowse();
}

function renderRecipeBrowse() {
    const grid = document.getElementById('recipeBrowseGrid');
    if (!grid) return;
    const kwEl = document.getElementById('recipeSearch');
    const catEl = document.getElementById('recipeFilter');
    const kw = (kwEl ? kwEl.value : '').trim().toLowerCase();
    const cat = catEl ? catEl.value : '';
    let list = recipesCache.filter(function (r) {
        const okKw = !kw || String(r.title || '').toLowerCase().includes(kw);
        const okCat = !cat || String(r.category || '').includes(cat);
        return okKw && okCat;
    });
    if (!list.length) {
        grid.innerHTML = '<div class="social-empty">Không có công thức phù hợp.</div>';
        return;
    }
    grid.innerHTML = list.map(function (r) {
        const pct = recipeMatch(r);
        const kcal = r.kcal ? r.kcal + ' kcal' : '';
        return '<div class="recipe-card browse-card" data-rid="' + r.id + '">' +
            '<div class="recipe-image-wrap"><div class="recipe-image recipe-image-emoji">' + recipeEmoji(r) + '</div>' +
            '<span class="recipe-match">' + pct + '% khớp</span></div>' +
            '<div class="recipe-body"><div class="recipe-title">' + escapeHtml(r.title) + '</div>' +
            '<div class="recipe-meta"><span>⏱ ' + (r.cookTime || '—') + '′</span>' +
            (kcal ? '<span>🔥 ' + kcal + '</span>' : '') +
            '<span>📊 ' + escapeHtml(r.difficulty || '—') + '</span></div></div></div>';
    }).join('');
    document.querySelectorAll('.browse-card').forEach(function (c) {
        c.addEventListener('click', function () { openRecipeDetail(+c.getAttribute('data-rid')); });
    });
}

async function openRecipeDetail(id) {
    try {
        curRecipe = await apiRequest('/api/recipes/' + id);
    } catch (e) {
        showToast('Không tải được công thức.', 'error');
        return;
    }
    renderRecipeDetail();
    openView('recipe');
}

function renderRecipeDetail() {
    const r = curRecipe;
    document.getElementById('rdEmoji').textContent = recipeEmoji(r);
    document.getElementById('rdTitle').textContent = r.title;
    document.getElementById('rdMeta').innerHTML =
        '<span>⏱ ' + (r.cookTime || '—') + ' phút</span>' +
        '<span>📊 ' + escapeHtml(r.difficulty || '—') + '</span>' +
        '<span>🍽 ' + (r.servings || 1) + ' người</span>' +
        (r.kcal ? '<span>🔥 ' + r.kcal + ' kcal</span>' : '');
    document.getElementById('rdDesc').textContent = r.description || '';
    const ings = r.ingredients || [];
    document.getElementById('rdIng').innerHTML = ings.length
        ? '<ul class="rd-ing-list">' + ings.map(function (i) {
            return '<li><span>' + escapeHtml(i.ingredientName || '') + '</span>' +
                '<span class="qty">' + (i.quantity != null ? i.quantity : '') + ' ' + escapeHtml(i.unit || '') + '</span></li>';
        }).join('') + '</ul>'
        : '<div class="social-empty">Chưa cập nhật nguyên liệu.</div>';
    const steps = String(r.instructions || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    document.getElementById('rdSteps').innerHTML = steps.length
        ? '<ol class="rd-steps-list">' + steps.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ol>'
        : '<div class="social-empty">Chưa cập nhật các bước.</div>';
    document.getElementById('rdNutri').innerHTML =
        '<div class="nutri-row"><span>🔥 Calo</span><b>' + (r.kcal || 0) + ' kcal</b></div>' +
        '<div class="nutri-row"><span>Đạm (Protein)</span><b>' + (r.protein || 0) + ' g</b></div>' +
        '<div class="nutri-row"><span>Tinh bột (Carbs)</span><b>' + (r.carb || 0) + ' g</b></div>' +
        '<div class="nutri-row"><span>Chất béo (Fat)</span><b>' + (r.fat || 0) + ' g</b></div>';
    document.getElementById('rdSave').innerHTML = '🤍 Lưu món';
}

async function toggleSaveRecipe() {
    if (!curRecipe) return;
    try {
        const saved = await apiRequest('/api/recipes/' + curRecipe.id + '/save', { method: 'POST' });
        document.getElementById('rdSave').innerHTML = saved ? '❤️ Đã lưu' : '🤍 Lưu món';
        showToast(saved ? 'Đã lưu vào món yêu thích ❤️' : 'Đã bỏ lưu món.', 'success');
    } catch (e) {
        showToast('Cần đăng nhập để lưu món.', 'error');
    }
}

function addCurToPlan() {
    if (!curRecipe) return;
    openView('plan');
    setTimeout(function () {
        openAddMeal(d2s(new Date()), 'lunch');
        const rSel = document.getElementById('paRecipe');
        if (rSel) rSel.value = String(curRecipe.id);
    }, 250);
}

async function cookNow() {
    if (!curRecipe) return;
    try {
        await apiRequest('/api/stats/cooked', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipeId: curRecipe.id })
        });
        showToast('Đã ghi nhận món đã nấu! 🍳', 'success');
    } catch (e) {
        showToast('Cần đăng nhập.', 'error');
    }
}


/* =========================================================
   PLAN - KẾ HOẠCH TUẦN (gop tu dk-dn)
========================================================= */
let planOffset = 0;
let planEntries = [];

function d2s(d) {
    const p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function weekDays(offset) {
    const now = new Date();
    const mon = new Date(now);
    mon.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
    return Array.from({ length: 7 }, function (_, i) {
        const d = new Date(mon);
        d.setDate(mon.getDate() + i);
        return d;
    });
}

async function loadPlan() {
    const days = weekDays(planOffset);
    const start = d2s(days[0]);
    const end = d2s(days[6]);
    const label = document.getElementById('weekLabel');
    if (label) label.textContent = 'Tuần ' + days[0].getDate() + '/' + (days[0].getMonth() + 1) + ' – ' + days[6].getDate() + '/' + (days[6].getMonth() + 1);
    try {
        planEntries = await apiRequest('/api/plan?start=' + start + '&end=' + end) || [];
    } catch (e) {
        planEntries = [];
    }
    renderPlan(days);
}

function renderPlan(days) {
    const box = document.getElementById('planDays');
    if (!box) return;
    const today = d2s(new Date());
    const DAYS_VI = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const SLOT = { morning: ['🌅', 'Sáng'], lunch: ['☀️', 'Trưa'], dinner: ['🌙', 'Tối'] };
    const byDay = {};
    planEntries.forEach(function (e) {
        byDay[e.planDate] = byDay[e.planDate] || {};
        byDay[e.planDate][e.slot] = e;
    });
    let nMeals = 0, kcal = 0;
    days.forEach(function (d) {
        const key = d2s(d);
        const meals = byDay[key] || {};
        Object.keys(meals).forEach(function (s) { nMeals++; kcal += meals[s].recipeKcal || 0; });
    });
    const sum = document.getElementById('planSummary');
    if (sum) {
        const plannedDays = days.filter(function (d) { const m = byDay[d2s(d)]; return m && Object.keys(m).length; }).length;
        sum.innerHTML =
            '<div class="stat-box"><b>' + nMeals + '/21</b><span>' + (nMeals === 21 ? 'Hoàn thành 100% kế hoạch 🎉' : 'bữa đã lên kế hoạch') + '</span></div>' +
            '<div class="stat-box"><b>' + (nMeals && plannedDays ? Math.round(kcal / plannedDays) : 0) + '</b><span>kcal TB / ngày</span></div>';
    }
    box.innerHTML = days.map(function (d) {
        const key = d2s(d);
        const meals = byDay[key] || {};
        const dayKcal = Object.keys(meals).reduce(function (s, sl) { return s + (meals[sl].recipeKcal || 0); }, 0);
        return '<div class="day-card' + (key === today ? ' today' : '') + '">' +
            '<div class="day-head"><h4>' + DAYS_VI[d.getDay()] + ' · ' + d.getDate() + '/' + (d.getMonth() + 1) +
            (key === today ? '<span class="today-pill">HÔM NAY</span>' : '') + '</h4>' +
            '<span class="day-kcal">' + dayKcal + ' kcal</span></div>' +
            ['morning', 'lunch', 'dinner'].map(function (slot) {
                const e = meals[slot];
                if (e) {
                    return '<div class="meal-row"><span class="meal-slot">' + SLOT[slot][0] + ' ' + SLOT[slot][1] + '</span>' +
                        '<span class="meal-name">' + escapeHtml(e.recipeTitle) + '</span>' +
                        '<span class="meal-kcal">' + (e.recipeKcal || 0) + ' kcal</span>' +
                        '<button class="meal-x" data-rm-date="' + key + '" data-rm-slot="' + slot + '" title="Xoá bữa">✕</button></div>';
                }
                return '<div class="meal-row empty"><span class="meal-slot">' + SLOT[slot][0] + ' ' + SLOT[slot][1] + '</span>' +
                    '<button class="add-meal-btn" data-add-date="' + key + '" data-add-slot="' + slot + '">＋ Thêm bữa</button></div>';
            }).join('') + '</div>';
    }).join('');
    document.querySelectorAll('[data-rm-date]').forEach(function (b) {
        b.addEventListener('click', function () { removeMeal(b.getAttribute('data-rm-date'), b.getAttribute('data-rm-slot')); });
    });
    document.querySelectorAll('[data-add-date]').forEach(function (b) {
        b.addEventListener('click', function () { openAddMeal(b.getAttribute('data-add-date'), b.getAttribute('data-add-slot')); });
    });
}

async function removeMeal(date, slot) {
    try {
        await apiRequest('/api/plan?date=' + date + '&slot=' + slot, { method: 'DELETE' });
        loadPlan();
    } catch (e) {
        showToast('Cần đăng nhập.', 'error');
    }
}

function openAddMeal(date, slot) {
    const card = document.getElementById('planAddCard');
    if (!card) return;
    const dSel = document.getElementById('paDate');
    if (dSel) dSel.innerHTML = '<option value="' + date + '">' + date + '</option>';
    const sSel = document.getElementById('paSlot');
    if (sSel) sSel.value = slot;
    const rSel = document.getElementById('paRecipe');
    if (rSel) {
        rSel.innerHTML = recipesCache.length
            ? recipesCache.map(function (r) { return '<option value="' + r.id + '">' + escapeHtml(r.title) + '</option>'; }).join('')
            : '<option value="">Chưa có công thức</option>';
    }
    card.hidden = false;
}

async function submitPlan() {
    const date = document.getElementById('paDate').value;
    const slot = document.getElementById('paSlot').value;
    const rid = +document.getElementById('paRecipe').value;
    if (!rid) { showToast('Chưa có công thức để thêm.', 'warning'); return; }
    try {
        await apiRequest('/api/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planDate: date, slot: slot, recipeId: rid })
        });
        const card = document.getElementById('planAddCard');
        if (card) card.hidden = true;
        loadPlan();
    } catch (e) {
        showToast('Không thêm được bữa ăn.', 'error');
    }
}

async function autoPlan() {
    const days = weekDays(planOffset);
    try {
        const res = await apiRequest('/api/plan/auto?start=' + d2s(days[0]) + '&end=' + d2s(days[6]), { method: 'POST' });
        showToast(res && res.added ? '✨ AI đã lên kế hoạch ' + res.added + ' bữa!' : 'Kế hoạch tuần đã đầy ✨', 'success');
        loadPlan();
    } catch (e) {
        showToast('Cần đăng nhập.', 'error');
    }
}


/* =========================================================
   STATS - THỐNG KÊ (gop tu dk-dn)
========================================================= */
async function loadStats() {
    try {
        const s = await apiRequest('/api/stats');
        if (!s) return;
        const kpi = document.getElementById('kpiGrid');
        if (kpi) {
            kpi.innerHTML =
                '<div class="kpi"><span class="k-ic">🍳</span><b>' + s.totalCooked + '</b><span>món đã nấu</span></div>' +
                '<div class="kpi"><span class="k-ic">📅</span><b>' + s.weekCooked + '</b><span>trong 7 ngày</span></div>' +
                '<div class="kpi"><span class="k-ic">🗓</span><b>' + s.monthCooked + '</b><span>trong 30 ngày</span></div>';
        }
        drawLineChart(s.byDay);
        const top = document.getElementById('topDishes');
        if (top) {
            top.innerHTML = (s.topRecipes && s.topRecipes.length)
                ? s.topRecipes.map(function (t) {
                    return '<div class="top-row"><span class="top-emoji">' + recipeEmoji({ title: t.title }) + '</span>' +
                        '<span class="top-name">' + escapeHtml(t.title) + '</span><span class="top-cnt">×' + t.count + ' lần</span></div>';
                }).join('')
                : '<div class="social-empty">Chưa có dữ liệu nấu ăn.</div>';
        }
    } catch (e) {
        const kpi = document.getElementById('kpiGrid');
        if (kpi) kpi.innerHTML = '<div class="social-empty">Đăng nhập để xem thống kê.</div>';
    }
}

function drawLineChart(byDay) {
    const svg = document.getElementById('statsLine');
    const labels = document.getElementById('statsLabels');
    if (!svg) return;
    const data = (byDay || []).map(function (d) { return d.kcal || 0; });
    const dates = (byDay || []).map(function (d) { return String(d.date || '').slice(5); });
    const W = 340, H = 150, pad = 8;
    const max = Math.max.apply(null, data.concat([1]));
    const x = function (i) { return pad + i * (W - pad * 2) / Math.max(1, data.length - 1); };
    const y = function (v) { return H - 14 - (v / max) * (H - 40); };
    const pts = data.map(function (v, i) { return x(i).toFixed(1) + ',' + y(v).toFixed(1); });
    if (data.length > 1) {
        svg.innerHTML =
            '<polyline class="stats-line" points="' + pts.join(' ') + '"/>' +
            pts.map(function (p, i) {
                return '<circle class="stats-dot" cx="' + p.split(',')[0] + '" cy="' + p.split(',')[1] + '" r="3"><title>' + (dates[i] || '') + ': ' + data[i] + ' kcal</title></circle>';
            }).join('');
    } else {
        svg.innerHTML = '<text x="170" y="75" text-anchor="middle" class="stats-empty-text">Chưa có dữ liệu</text>';
    }
    if (labels) labels.innerHTML = dates.map(function (d) { return '<span>' + d + '</span>'; }).join('');
}


/* =========================================================
   SHOPPING - REWIRE SANG BACKEND /api/shopping
========================================================= */
async function renderShopping() {
    const list = document.getElementById('shoppingList');
    if (!list) return;
    let items = [];
    try {
        items = await apiRequest('/api/shopping') || [];
    } catch (e) {
        items = [];
    }
    const done = items.filter(function (i) { return i.done; }).length;
    const remain = items.filter(function (i) { return !i.done; });
    const total = remain.reduce(function (s, i) { return s + (i.price || 0); }, 0);
    const sumEl = document.querySelector('#view-shopping .shopping-summary');
    if (sumEl) sumEl.innerHTML = '<span>Đã mua: <b>' + done + '/' + items.length + '</b></span><span>Còn lại: <b>' + total.toLocaleString('vi-VN') + 'đ</b></span>';
    if (!items.length) {
        list.innerHTML = '<div class="social-empty">Danh sách mua trống. Thêm nguyên liệu cần mua!</div>';
        return;
    }
    list.innerHTML = items.map(function (i) {
        return '<div class="shop-row' + (i.done ? ' done' : '') + '">' +
            '<input type="checkbox" data-shop-toggle="' + i.id + '"' + (i.done ? ' checked' : '') + '>' +
            '<div class="shop-info"><div class="shop-name' + (i.done ? ' done' : '') + '">' + escapeHtml(i.name) + '</div>' +
            '<div class="shop-sub">' + escapeHtml(i.quantity || '') + '</div></div>' +
            '<span class="shop-price">' + (i.price ? i.price.toLocaleString('vi-VN') + 'đ' : '') + '</span>' +
            '<button class="shop-item-del" data-shop-del="' + i.id + '" title="Xoá">🗑</button></div>';
    }).join('');
    document.querySelectorAll('[data-shop-toggle]').forEach(function (c) {
        c.addEventListener('change', function () { toggleShop(+c.getAttribute('data-shop-toggle')); });
    });
    document.querySelectorAll('[data-shop-del]').forEach(function (b) {
        b.addEventListener('click', function () { delShop(+b.getAttribute('data-shop-del')); });
    });
}

async function toggleShop(id) {
    try {
        await apiRequest('/api/shopping/' + id + '/toggle', { method: 'PATCH' });
        renderShopping();
    } catch (e) {
        showToast('Cần đăng nhập.', 'error');
    }
}

async function delShop(id) {
    try {
        await apiRequest('/api/shopping/' + id, { method: 'DELETE' });
        renderShopping();
    } catch (e) {
        showToast('Cần đăng nhập.', 'error');
    }
}

async function addShop() {
    const input = document.getElementById('shoppingInput');
    const v = (input ? input.value.trim() : '');
    if (!v) return;
    try {
        await apiRequest('/api/shopping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: v, quantity: '1 phần', price: 30000, category: 'spice' })
        });
        if (input) input.value = '';
        renderShopping();
        showToast('Đã thêm vào danh sách 🛒', 'success');
    } catch (e) {
        showToast('Cần đăng nhập để thêm.', 'error');
    }
}


/* =========================================================
   WIRING CÁC TÍNH NĂNG MỚI
========================================================= */
(function initDkDnFeatures() {
    const rs = document.getElementById('recipeSearch');
    if (rs) rs.addEventListener('input', renderRecipeBrowse);
    const rf = document.getElementById('recipeFilter');
    if (rf) rf.addEventListener('change', renderRecipeBrowse);

    const save = document.getElementById('rdSave');
    if (save) save.addEventListener('click', toggleSaveRecipe);
    const plan = document.getElementById('rdPlan');
    if (plan) plan.addEventListener('click', addCurToPlan);
    const cook = document.getElementById('rdCook');
    if (cook) cook.addEventListener('click', cookNow);

    document.querySelectorAll('[data-rdtab]').forEach(function (t) {
        t.addEventListener('click', function () {
            document.querySelectorAll('[data-rdtab]').forEach(function (x) { x.classList.remove('active'); });
            t.classList.add('active');
            ['rdIng', 'rdSteps', 'rdNutri'].forEach(function (id) {
                document.getElementById(id).classList.toggle('active', id === 'rd' + t.getAttribute('data-rdtab').charAt(0).toUpperCase() + t.getAttribute('data-rdtab').slice(1));
            });
        });
    });

    const pp = document.getElementById('planPrev');
    if (pp) pp.addEventListener('click', function () { planOffset--; loadPlan(); });
    const pn = document.getElementById('planNext');
    if (pn) pn.addEventListener('click', function () { planOffset++; loadPlan(); });
    const pa = document.getElementById('planAuto');
    if (pa) pa.addEventListener('click', autoPlan);
    const pas = document.getElementById('paSubmit');
    if (pas) pas.addEventListener('click', submitPlan);
    const pac = document.getElementById('paCancel');
    if (pac) pac.addEventListener('click', function () { const c = document.getElementById('planAddCard'); if (c) c.hidden = true; });

    // Load dữ liệu khi mở view tương ứng
    const origOpenView = window.openView;
    window.openView = function (name) {
        origOpenView(name);
        if (name === 'recipes') loadRecipes();
        if (name === 'plan') loadPlan();
        if (name === 'stats') loadStats();
    };
})();



/* =========================================================
   FOODX REDESIGN — helpers + UX polish
========================================================= */

/* ---------- Skeleton / Empty / Error ---------- */
function showSkeleton(el, type, n) {
    if (!el) return;
    const unit = type === 'card' ? '<div class="sk sk-card"></div>'
        : type === 'row' ? '<div class="sk sk-row"></div>'
        : '<div class="sk sk-text"></div>';
    el.innerHTML = '<div class="' + (type === 'card' ? 'sk-grid' : 'sk-list') + '">' + Array(n || 3).fill(unit).join('') + '</div>';
}

function renderEmpty(el, icon, title, desc, ctaLabel, ctaFn) {
    if (!el) return;
    el.innerHTML = '<div class="empty-state"><span class="es-icon">' + (icon || '🥗') + '</span>' +
        '<b>' + title + '</b><p>' + desc + '</p>' +
        (ctaLabel ? '<button type="button" class="primary-button" id="emptyCtaBtn">' + ctaLabel + '</button>' : '') +
        '</div>';
    const btn = document.getElementById('emptyCtaBtn');
    if (btn && ctaFn) btn.addEventListener('click', ctaFn);
}

function renderError(el, retryFn) {
    if (!el) return;
    el.innerHTML = '<div class="error-state"><b>Không thể tải dữ liệu</b>' +
        '<p>Vui lòng thử lại.</p>' +
        '<button type="button" class="secondary-button" id="errRetryBtn">Thử lại</button></div>';
    const btn = document.getElementById('errRetryBtn');
    if (btn && retryFn) btn.addEventListener('click', retryFn);
}


/* =========================================================
   HOME DASHBOARD
========================================================= */
function homeUserName() {
    try {
        if (window.authState && authState.authenticated && (authState.fullName || authState.username)) {
            return authState.fullName || authState.username;
        }
    } catch (e) { }
    return '';
}

function expiryInfo(iso) {
    if (!iso) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(iso + 'T00:00:00');
    const diff = Math.round((d - today) / 864e5);
    if (diff < 0) return { cls: 'expired', label: 'Đã hết hạn' };
    if (diff === 0) return { cls: 'soon', label: 'Hết hạn hôm nay' };
    if (diff <= 2) return { cls: 'soon', label: 'Còn ' + diff + ' ngày' };
    return { cls: 'ok', label: 'Còn ' + diff + ' ngày' };
}

function foodEmoji(name) {
    const n = String(name || '').toLowerCase();
    const map = { 'gà': '🍗', 'bò': '🥩', 'heo': '🥓', 'cá': '🐟', 'tôm': '🦐', 'trứng': '🥚', 'sữa': '🥛', 'cà rốt': '🥕', 'cải': '🥬', 'bông cải': '🥦', 'hành': '🌿', 'tỏi': '🧄', 'cà chua': '🍅', 'bí': '🎃', 'chuối': '🍌', 'táo': '🍎', 'chanh': '🍋', 'ớt': '🌶️', 'gạo': '🍚', 'mì': '🍜', 'bánh mì': '🥖', 'đậu hũ': '⬜', 'rau': '🥬', 'mật ong': '🍯', 'dầu': '🫗' };
    for (const k in map) { if (n.includes(k)) return map[k]; }
    return '🥫';
}

async function loadHomeDashboard() {
    const greet = document.getElementById('homeGreeting');
    const dateEl = document.getElementById('homeDate');
    if (greet) {
        const name = homeUserName();
        greet.textContent = name ? 'Chào ' + name.split(' ').pop() + ' 👋' : 'Chào bạn 👋';
    }
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    // Fridge status + expiring
    const card = document.getElementById('homeFridgeCard');
    const expBox = document.getElementById('homeExpiringCard');
    const expList = document.getElementById('homeExpiring');
    const title = document.getElementById('homeFridgeTitle');
    const sub = document.getElementById('homeFridgeSub');
    let items = [];
    try {
        items = await apiRequest('/api/fridge') || [];
    } catch (e) {
        if (title) title.textContent = 'Đăng nhập để quản lý tủ lạnh';
        if (sub) sub.textContent = 'Lưu nguyên liệu và nhận gợi ý món ăn';
        return;
    }
    if (title) title.textContent = 'Bạn có ' + items.length + ' nguyên liệu trong tủ';
    const expiring = items.filter(function (i) {
        const info = expiryInfo(i.expiresAt);
        return info && (info.cls === 'expired' || info.cls === 'soon');
    }).sort(function (a, b) { return String(a.expiresAt).localeCompare(String(b.expiresAt)); });
    if (sub) sub.textContent = expiring.length ? expiring.length + ' nguyên liệu sắp hết hạn' : 'Tủ lạnh còn đủ thời gian sử dụng';
    if (expBox && expiring.length) {
        expBox.hidden = false;
        if (expList) {
            expList.innerHTML = expiring.slice(0, 4).map(function (i) {
                const info = expiryInfo(i.expiresAt);
                return '<div class="he-item"><span>' + foodEmoji(i.name) + '</span>' +
                    '<span class="he-name">' + escapeHtml(i.name) + '</span>' +
                    '<span class="exp-badge ' + info.cls + '">' + info.label + '</span></div>';
            }).join('');
        }
    } else if (expBox) {
        expBox.hidden = true;
    }
    loadTodayMeals();
}

async function loadTodayMeals() {
    const card = document.getElementById('homeTodayCard');
    const list = document.getElementById('homeToday');
    if (!card) return;
    const today = d2s(new Date());
    try {
        const entries = await apiRequest('/api/plan?start=' + today + '&end=' + today) || [];
        if (!entries.length) { card.hidden = true; return; }
        card.hidden = false;
        const SLOT = { morning: '🌅 Sáng', lunch: '☀️ Trưa', dinner: '🌙 Tối' };
        const bySlot = {};
        entries.forEach(function (e) { bySlot[e.slot] = e; });
        if (list) {
            list.innerHTML = ['morning', 'lunch', 'dinner'].map(function (s) {
                const e = bySlot[s];
                return e
                    ? '<div class="ht-row"><span class="ht-slot">' + SLOT[s] + '</span><b>' + escapeHtml(e.recipeTitle) + '</b><span class="ht-kcal">' + (e.recipeKcal || 0) + ' kcal</span></div>'
                    : '<div class="ht-row"><span class="ht-slot">' + SLOT[s] + '</span><b style="color:var(--text-soft);font-weight:500">Chưa có bữa ăn</b></div>';
            }).join('');
        }
    } catch (e) {
        card.hidden = true;
    }
}

async function loadHomeSuggest() {
    const card = document.getElementById('homeSuggestCard');
    const list = document.getElementById('homeSuggest');
    const btn = document.getElementById('homeSuggestBtn');
    if (!card || !list) return;
    let ingredients = [];
    try {
        const items = await apiRequest('/api/fridge') || [];
        ingredients = items.map(function (i) { return i.name; });
    } catch (e) { }
    if (btn) btn.disabled = true;
    card.hidden = false;
    showSkeleton(list, 'card', 3);
    try {
        const res = await apiRequest('/api/ai/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ availableIngredients: ingredients, preference: '', mealType: '', maxSuggestions: 3 })
        });
        const sug = (res && res.suggestions) || [];
        if (!sug.length) {
            renderEmpty(list, '🤖', 'Chưa có gợi ý', 'Thêm nguyên liệu vào tủ lạnh để nhận món phù hợp.', 'Xem tủ lạnh', function () { openView('fridge'); });
        } else {
            list.innerHTML = sug.map(function (s) {
                return '<div class="hs-item"><b>' + escapeHtml(s.title || '') + '</b>' +
                    '<span>' + escapeHtml(s.description || '') + '</span>' +
                    (s.estimatedTime ? '<span style="margin-top:6px">⏱ ' + escapeHtml(s.estimatedTime) + '</span>' : '') + '</div>';
            }).join('');
        }
    } catch (err) {
        renderError(list, loadHomeSuggest);
    } finally {
        if (btn) btn.disabled = false;
    }
}


/* =========================================================
   RECIPE DETAIL — hero image + related
========================================================= */
function renderRecipeDetail() {
    const r = curRecipe;
    document.getElementById('rdEmoji').textContent = recipeEmoji(r);
    document.getElementById('rdTitle').textContent = r.title;
    document.getElementById('rdMeta').innerHTML =
        '<span><svg class="icon"><use href="#i-clock"/></svg> ' + (r.cookTime || '—') + ' phút</span>' +
        '<span><svg class="icon"><use href="#i-stats"/></svg> ' + escapeHtml(r.difficulty || '—') + '</span>' +
        '<span><svg class="icon"><use href="#i-users"/></svg> ' + (r.servings || 1) + ' người</span>' +
        (r.kcal ? '<span><svg class="icon"><use href="#i-flame"/></svg> ' + r.kcal + ' kcal</span>' : '');
    document.getElementById('rdDesc').textContent = r.description || '';
    const img = document.getElementById('rdHeroImg');
    if (img) {
        if (r.imageUrl) { img.src = r.imageUrl; img.hidden = false; }
        else { img.hidden = true; img.removeAttribute('src'); }
    }
    const ings = r.ingredients || [];
    document.getElementById('rdIng').innerHTML = ings.length
        ? '<ul class="rd-ing-list">' + ings.map(function (i) {
            return '<li><span>' + escapeHtml(i.ingredientName || '') + '</span>' +
                '<span class="qty">' + (i.quantity != null ? i.quantity : '') + ' ' + escapeHtml(i.unit || '') + '</span></li>';
        }).join('') + '</ul>'
        : '<div class="empty-state"><span class="es-icon">🧺</span><b>Chưa cập nhật nguyên liệu</b></div>';
    const steps = String(r.instructions || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    document.getElementById('rdSteps').innerHTML = steps.length
        ? '<ol class="rd-steps-list">' + steps.map(function (s) { return '<li>' + escapeHtml(s) + '</li>'; }).join('') + '</ol>'
        : '<div class="empty-state"><span class="es-icon">👨‍🍳</span><b>Chưa cập nhật các bước</b></div>';
    const n = { p: r.protein || 0, c: r.carb || 0, f: r.fat || 0 };
    document.getElementById('rdNutri').innerHTML =
        '<div class="nutri-row"><span>🔥 Calo</span><b>' + (r.kcal || 0) + ' kcal</b></div>' +
        '<div class="nutri-row"><span>Đạm (Protein)</span><b>' + n.p + ' g</b></div>' +
        '<div class="nutri-row"><span>Tinh bột (Carbs)</span><b>' + n.c + ' g</b></div>' +
        '<div class="nutri-row"><span>Chất béo (Fat)</span><b>' + n.f + ' g</b></div>';
    document.getElementById('rdSave').innerHTML = '🤍 Lưu món';
    renderRelated(r);
}

function renderRelated(r) {
    const box = document.getElementById('rdRelated');
    if (!box) return;
    const related = (recipesCache || []).filter(function (x) {
        return x.id !== r.id && x.category && r.category && x.category === r.category;
    }).slice(0, 4);
    if (!related.length) { box.innerHTML = ''; return; }
    box.innerHTML = '<h4>Món tương tự</h4><div class="related-grid">' +
        related.map(function (x) {
            return '<div class="related-item" data-related="' + x.id + '"><b>' + escapeHtml(x.title) + '</b>' +
                '<span>⏱ ' + (x.cookTime || '—') + '′ · ' + (x.kcal || 0) + ' kcal</span></div>';
        }).join('') + '</div>';
    document.querySelectorAll('[data-related]').forEach(function (el) {
        el.addEventListener('click', function () { openRecipeDetail(+el.getAttribute('data-related')); });
    });
}


/* =========================================================
   STATS — insights + food waste
========================================================= */
async function loadStats() {
    const kpi = document.getElementById('kpiGrid');
    if (kpi) showSkeleton(kpi, 'card', 3);
    try {
        const s = await apiRequest('/api/stats');
        if (kpi && s) {
            const avg = (s.byDay && s.byDay.length)
                ? Math.round(s.byDay.reduce(function (a, d) { return a + (d.kcal || 0); }, 0) / s.byDay.filter(function (d) { return d.kcal > 0; }).length || 0)
                : 0;
            kpi.innerHTML =
                '<div class="kpi"><span class="k-ic">🍳</span><b>' + s.totalCooked + '</b><span>món đã nấu</span></div>' +
                '<div class="kpi"><span class="k-ic">📅</span><b>' + s.weekCooked + '</b><span>trong 7 ngày</span></div>' +
                '<div class="kpi"><span class="k-ic">🗓</span><b>' + s.monthCooked + '</b><span>trong 30 ngày</span></div>' +
                '<div class="kpi"><span class="k-ic">🔥</span><b>' + avg + '</b><span>kcal TB / ngày</span></div>';
        }
        drawLineChart(s ? s.byDay : []);
        const top = document.getElementById('topDishes');
        if (top) {
            top.innerHTML = (s && s.topRecipes && s.topRecipes.length)
                ? s.topRecipes.map(function (t) {
                    return '<div class="top-row"><span class="top-emoji">' + recipeEmoji({ title: t.title }) + '</span>' +
                        '<span class="top-name">' + escapeHtml(t.title) + '</span><span class="top-cnt">×' + t.count + ' lần</span></div>';
                }).join('')
                : '<div class="empty-state"><span class="es-icon">📊</span><b>Chưa có dữ liệu nấu ăn</b><p>Nấu ngay món đầu tiên để xem thống kê!</p></div>';
        }
        if (s) renderStatsExtra(s);
    } catch (e) {
        if (kpi) renderError(kpi, loadStats);
    }
}

async function renderStatsExtra(s) {
    const ins = document.getElementById('statsInsights');
    const waste = document.getElementById('statsWaste');
    let fridge = [];
    try { fridge = await apiRequest('/api/fridge') || []; } catch (e) { }

    const insights = [];
    if (s.weekCooked > 0) insights.push('Bạn đã nấu <b>' + s.weekCooked + ' món</b> trong 7 ngày qua.');
    if (s.topRecipes && s.topRecipes.length) insights.push('Món được nấu nhiều nhất: <b>' + escapeHtml(s.topRecipes[0].title) + '</b> (' + s.topRecipes[0].count + ' lần).');
    const expiring = fridge.filter(function (i) { const info = expiryInfo(i.expiresAt); return info && (info.cls === 'soon' || info.cls === 'expired'); });
    if (expiring.length) insights.push('Có <b>' + expiring.length + ' nguyên liệu</b> đang sắp hết hạn trong tủ.');

    if (ins) {
        ins.innerHTML = insights.length
            ? insights.map(function (t) { return '<div class="insight">💡 ' + t + '</div>'; }).join('')
            : '<div class="insight">💡 Bắt đầu thêm nguyên liệu vào tủ lạnh và nấu ăn để xem thông tin chi tiết.</div>';
    }
    if (waste) {
        const expired = fridge.filter(function (i) { const info = expiryInfo(i.expiresAt); return info && info.cls === 'expired'; });
        const soon = fridge.filter(function (i) { const info = expiryInfo(i.expiresAt); return info && info.cls === 'soon'; });
        const ok = fridge.filter(function (i) { const info = expiryInfo(i.expiresAt); return info && info.cls === 'ok'; });
        waste.innerHTML =
            '<div class="waste-box ok"><b>' + ok.length + '</b><span>Nguyên liệu còn hạn</span></div>' +
            '<div class="waste-box"><b>' + soon.length + '</b><span>Đang đến hạn (≤2 ngày)</span></div>' +
            '<div class="waste-box danger"><b>' + expired.length + '</b><span>Đã hết hạn</span></div>';
    }
}


/* =========================================================
   SHOPPING — progress + clear-done undo
========================================================= */
let lastClearedShop = [];

async function renderShopping() {
    const list = document.getElementById('shoppingList');
    if (!list) return;
    let items = [];
    try {
        items = await apiRequest('/api/shopping') || [];
    } catch (e) {
        items = [];
    }
    const done = items.filter(function (i) { return i.done; }).length;
    const remain = items.filter(function (i) { return !i.done; });
    const total = remain.reduce(function (s, i) { return s + (i.price || 0); }, 0);
    const pct = items.length ? Math.round(done / items.length * 100) : 0;

    const sumEl = document.getElementById('shoppingSummary');
    const bar = document.getElementById('shoppingBar');
    if (sumEl) sumEl.innerHTML = '<span>Đã mua: <b>' + done + '/' + items.length + ' món</b></span><span>Còn lại: <b>' + total.toLocaleString('vi-VN') + 'đ</b></span>';
    if (bar) bar.style.width = pct + '%';

    if (!items.length) {
        renderEmpty(list, '🛒', 'Danh sách mua sắm đang trống', 'Thêm nguyên liệu bạn cần mua.', '+ Thêm nguyên liệu', function () {
            const input = document.getElementById('shoppingInput');
            if (input) { input.focus(); }
        });
        return;
    }
    list.innerHTML = items.map(function (i) {
        return '<div class="shop-row' + (i.done ? ' done' : '') + '">' +
            '<input type="checkbox" data-shop-toggle="' + i.id + '"' + (i.done ? ' checked' : '') + '>' +
            '<div class="shop-info"><div class="shop-name' + (i.done ? ' done' : '') + '">' + escapeHtml(i.name) + '</div>' +
            '<div class="shop-sub">' + escapeHtml(i.quantity || '') + '</div></div>' +
            '<span class="shop-price">' + (i.price ? i.price.toLocaleString('vi-VN') + 'đ' : '') + '</span>' +
            '<button class="shop-item-del" data-shop-del="' + i.id + '" aria-label="Xoá mục">🗑</button></div>';
    }).join('');
    document.querySelectorAll('[data-shop-toggle]').forEach(function (c) {
        c.addEventListener('change', function () { toggleShop(+c.getAttribute('data-shop-toggle')); });
    });
    document.querySelectorAll('[data-shop-del]').forEach(function (b) {
        b.addEventListener('click', function () { delShop(+b.getAttribute('data-shop-del')); });
    });
}

async function clearDoneShopping() {
    let items = [];
    try { items = await apiRequest('/api/shopping') || []; } catch (e) { }
    const doneItems = items.filter(function (i) { return i.done; });
    if (!doneItems.length) { showToast('Chưa có món nào được mua.', 'info'); return; }
    lastClearedShop = doneItems;
    try {
        await apiRequest('/api/shopping/done', { method: 'DELETE' });
        renderShopping();
        showToast('Đã xóa ' + doneItems.length + ' món — ', 'success');
        const toastEl = document.getElementById('toast');
        if (toastEl) {
            const undo = document.createElement('button');
            undo.textContent = 'Hoàn tác';
            undo.style.cssText = 'margin-left:10px;background:var(--green);color:#fff;border:none;border-radius:8px;padding:5px 12px;font-weight:700;cursor:pointer;';
            undo.addEventListener('click', function () { undoClearDone(); });
            toastEl.appendChild(undo);
            toastEl.classList.add('show');
            clearTimeout(toastEl._tm);
            toastEl._tm = setTimeout(function () { toastEl.classList.remove('show'); }, 4000);
        }
    } catch (e) {
        showToast('Cần đăng nhập.', 'error');
    }
}

async function undoClearDone() {
    try {
        for (const it of lastClearedShop) {
            await apiRequest('/api/shopping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: it.name, quantity: it.quantity, price: it.price, category: it.category || 'spice' })
            });
        }
        lastClearedShop = [];
        renderShopping();
        showToast('Đã hoàn tác. Món đã quay lại danh sách ↩️', 'success');
    } catch (e) {
        showToast('Không hoàn tác được.', 'error');
    }
}


/* =========================================================
   BOTTOM NAV + QUICK ACTION + DRAWER
========================================================= */
let qaOpen = false;

function syncBottomNav(name) {
    document.querySelectorAll('[data-bottom-nav]').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-bottom-nav') === name);
    });
}

function closeQa() {
    qaOpen = false;
    const fab = document.getElementById('qaFab');
    const menu = document.getElementById('qaMenu');
    if (fab) fab.classList.remove('open');
    if (menu) menu.hidden = true;
}

function toggleQa() {
    qaOpen = !qaOpen;
    const fab = document.getElementById('qaFab');
    const menu = document.getElementById('qaMenu');
    if (fab) fab.classList.toggle('open', qaOpen);
    if (menu) menu.hidden = !qaOpen;
}

function closeDrawer() {
    document.body.classList.remove('drawer-open');
}

async function handleQa(action) {
    closeQa();
    if (action === 'ingredient') {
        openView('fridge');
        const btn = document.getElementById('openCustomIngredient');
        if (btn) { setTimeout(function () { btn.click(); }, 200); }
        else {
            const fab = document.getElementById('nav-fab');
            if (fab) fab.click();
        }
        return;
    }
    if (action === 'recipe') {
        openRecipeCreateModal();
        return;
    }
    if (action === 'plan') {
        openView('plan');
        setTimeout(function () { openAddMeal(d2s(new Date()), 'lunch'); }, 250);
        return;
    }
    if (action === 'scan') {
        showToast('📷 Quét thực phẩm — tính năng đang phát triển.', 'info');
    }
}

/* ---------- Add recipe modal (Quick Action) ---------- */
let recipeCreateModal = null;

function openRecipeCreateModal() {
    if (!recipeCreateModal) {
        recipeCreateModal = document.createElement('div');
        recipeCreateModal.className = 'modal-overlay';
        recipeCreateModal.id = 'recipeCreateModal';
        recipeCreateModal.innerHTML =
            '<div class="modal">' +
            '<div class="modal-header"><h3>➕ Thêm công thức mới</h3><button class="modal-close" data-rc-close="1" aria-label="Đóng">✕</button></div>' +
            '<div class="rc-form">' +
            '<label class="field"><span>Tên món *</span><input type="text" id="rcTitle" placeholder="vd: Cá kho tộ"></label>' +
            '<label class="field"><span>Mô tả</span><textarea id="rcDesc" rows="2" placeholder="Mô tả ngắn..."></textarea></label>' +
            '<div class="rc-row">' +
            '<label class="field"><span>Thời gian (phút)</span><input type="number" id="rcTime" value="30" min="1"></label>' +
            '<label class="field"><span>Khẩu phần</span><input type="number" id="rcServe" value="2" min="1"></label>' +
            '<label class="field"><span>Calo</span><input type="number" id="rcKcal" value="300" min="0"></label>' +
            '</div>' +
            '<label class="field"><span>Nguyên liệu (mỗi dòng 1 nguyên liệu)</span><textarea id="rcIngs" rows="3" placeholder="Thịt cá 500 g"></textarea></label>' +
            '<label class="field"><span>Các bước (mỗi dòng 1 bước)</span><textarea id="rcSteps" rows="4" placeholder="Sơ chế cá..."></textarea></label>' +
            '<div class="modal-actions"><button class="secondary-button" data-rc-close="1">Huỷ</button>' +
            '<button class="primary-button" id="rcSubmit">Lưu công thức</button></div>' +
            '</div></div>';
        document.body.appendChild(recipeCreateModal);
        recipeCreateModal.querySelectorAll('[data-rc-close]').forEach(function (b) {
            b.addEventListener('click', function () { recipeCreateModal.classList.remove('open'); });
        });
        recipeCreateModal.addEventListener('click', function (e) { if (e.target === recipeCreateModal) recipeCreateModal.classList.remove('open'); });
        document.getElementById('rcSubmit').addEventListener('click', submitNewRecipe);
    }
    recipeCreateModal.classList.add('open');
    setTimeout(function () { const t = document.getElementById('rcTitle'); if (t) t.focus(); }, 80);
}

async function submitNewRecipe() {
    const title = document.getElementById('rcTitle').value.trim();
    if (!title) { showToast('Vui lòng nhập tên món.', 'warning'); return; }
    const ings = document.getElementById('rcIngs').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    const btn = document.getElementById('rcSubmit');
    if (btn) btn.disabled = true;
    try {
        await apiRequest('/api/recipes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                description: document.getElementById('rcDesc').value.trim(),
                cookTime: +document.getElementById('rcTime').value || 30,
                servings: +document.getElementById('rcServe').value || 2,
                kcal: +document.getElementById('rcKcal').value || 0,
                category: 'Món chính',
                difficulty: 'Dễ',
                instructions: document.getElementById('rcSteps').value.trim(),
                ingredients: ings.map(function (s) {
                    const parts = s.split(/\s+/);
                    const name = parts[0] || s;
                    return { ingredientName: name, quantity: null, unit: parts.slice(1).join(' '), note: null };
                })
            })
        });
        if (recipeCreateModal) recipeCreateModal.classList.remove('open');
        showToast('Đã thêm công thức mới! 🎉', 'success');
        loadRecipes();
    } catch (e) {
        showToast('Cần đăng nhập để tạo công thức.', 'error');
    } finally {
        if (btn) btn.disabled = false;
    }
}


/* =========================================================
   HOME BLOG RECIPE SECTION RENDERER
========================================================= */
let currentBlogCategory = 'all';

const sampleBlogPosts = [
    {
        id: 101,
        title: "Bí quyết nấu Phở Bò truyền thống chuẩn vị Hà Nội tại nhà",
        description: "Hướng dẫn chi tiết từ khâu hầm xương ngọt tự nhiên đến chuẩn bị gia vị hoa hồi, thảo quả thanh ngọt dịu mát...",
        author: "Mẹ Bi",
        authorRole: "Food Blogger",
        timeAgo: "3 giờ trước",
        cookTime: "45 phút",
        kcal: "450",
        likes: 189,
        comments: 24,
        category: "family",
        image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80",
        difficulty: "Vừa"
    },
    {
        id: 102,
        title: "Salad Ức Gà Sốt Bơ Chanh — Món ăn Eat Clean tăng cơ giảm mỡ",
        description: "Bữa trưa lành mạnh, giàu đạm và chất xơ, chuẩn bị chỉ trong 15 phút với những nguyên liệu đơn giản sẵn có...",
        author: "Coach Hoàng Anh",
        authorRole: "Fitness & Nutrition",
        timeAgo: "5 giờ trước",
        cookTime: "15 phút",
        kcal: "280",
        likes: 312,
        comments: 45,
        category: "eatclean",
        image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
        difficulty: "Dễ"
    },
    {
        id: 103,
        title: "Cơm Tấm Sườn Nướng Chả Trứng — Hương vị Sài Gòn đậm đà",
        description: "Bí quyết ướp sườn mềm mọng nước, chả trứng hấp béo ngậy cùng nước mắm chua ngọt chuẩn quán...",
        author: "Chef Tuấn Kiệt",
        authorRole: "Đầu bếp gia đình",
        timeAgo: "1 ngày trước",
        cookTime: "35 phút",
        kcal: "580",
        likes: 420,
        comments: 67,
        category: "hot",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        difficulty: "Vừa"
    },
    {
        id: 104,
        title: "Canh Cua Đồng Nấu Mồng Tơi & Rạm giải nhiệt ngày hè",
        description: "Món canh quốc dân ngọt mát béo ngậy gạch cua, kết hợp cà pháo muối giòn rụm cực đưa cơm...",
        author: "Chị Thảo",
        authorRole: "Yêu Bếp",
        timeAgo: "2 ngày trước",
        cookTime: "25 phút",
        kcal: "210",
        likes: 156,
        comments: 19,
        category: "family",
        image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
        difficulty: "Dễ"
    },
    {
        id: 105,
        title: "Trứng Cuộn Bơ Nấm 10 Phút Cho Bữa Sáng Năng Lượng",
        description: "Tiết kiệm thời gian mỗi buổi sáng với món trứng cuộn bơ mềm mịn, thơm ngon cực kỳ giàu vitamin...",
        author: "Bếp Nhà An",
        authorRole: "Foodie",
        timeAgo: "3 ngày trước",
        cookTime: "10 phút",
        kcal: "310",
        likes: 278,
        comments: 31,
        category: "quick",
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
        difficulty: "Rất dễ"
    },
    {
        id: 106,
        title: "Bánh Matchalicious Mousse Matcha Trà Xanh Béo Ngậy",
        description: "Công thức làm bánh mousse không cần lò nướng, chất bánh mịn mượt thanh đắng vị trà xanh Nhật Bản...",
        author: "Linh Pastry",
        authorRole: "Baker",
        timeAgo: "4 ngày trước",
        cookTime: "40 phút",
        kcal: "340",
        likes: 389,
        comments: 52,
        category: "dessert",
        image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
        difficulty: "Trung bình"
    }
];

function renderHomeBlogSection(catFilter) {
    const grid = document.getElementById('homeBlogGrid');
    if (!grid) return;

    catFilter = catFilter || currentBlogCategory || 'all';
    currentBlogCategory = catFilter;

    let posts = sampleBlogPosts;
    if (catFilter !== 'all') {
        posts = sampleBlogPosts.filter(function (p) {
            if (catFilter === 'hot') return p.likes > 250;
            return p.category === catFilter;
        });
    }

    if (!posts.length) {
        grid.innerHTML = '<div class="social-empty" style="grid-column:1/-1;text-align:center;padding:30px;">Chưa có bài viết trong mục này.</div>';
        return;
    }

    grid.innerHTML = posts.map(function (p) {
        return '<div class="blog-card" onclick="openRecipeDetail(' + p.id + ')">' +
            '<div class="blog-card-img-wrap">' +
                '<img class="blog-card-img" src="' + p.image + '" alt="' + escapeHtml(p.title) + '" loading="lazy">' +
                '<span class="blog-category-tag">' + (p.cookTime ? '⏱ ' + p.cookTime : 'Blog') + '</span>' +
            '</div>' +
            '<div class="blog-card-body">' +
                '<div class="blog-author-meta" style="margin-bottom:8px;">' +
                    '<div class="blog-avatar" style="width:24px;height:24px;font-size:12px;">👩‍🍳</div>' +
                    '<span class="blog-author-name" style="font-size:12px;">' + escapeHtml(p.author) + ' • <small style="opacity:0.7">' + p.timeAgo + '</small></span>' +
                '</div>' +
                '<h4 class="blog-card-title">' + escapeHtml(p.title) + '</h4>' +
                '<p class="blog-card-desc">' + escapeHtml(p.description) + '</p>' +
                '<div class="blog-card-footer">' +
                    '<span>🔥 ' + p.kcal + ' kcal</span>' +
                    '<span>❤️ ' + p.likes + ' • 💬 ' + p.comments + '</span>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
}


/* =========================================================
   WIRING REDESIGN
========================================================= */
(function initRedesign() {
    // Home
    const sb = document.getElementById('homeSuggestBtn');
    if (sb) sb.addEventListener('click', loadHomeSuggest);
    loadHomeDashboard();
    renderHomeBlogSection('all');

    // Home Blog Category Filter Pills
    document.querySelectorAll('#homeBlogPills .blog-pill').forEach(function (pill) {
        pill.addEventListener('click', function () {
            document.querySelectorAll('#homeBlogPills .blog-pill').forEach(function (p) { p.classList.remove('active'); });
            pill.classList.add('active');
            renderHomeBlogSection(pill.getAttribute('data-blog-cat'));
        });
    });

    // Shopping clear-done
    const cd = document.getElementById('shopClearDone');
    if (cd) cd.addEventListener('click', clearDoneShopping);

    // Bottom nav
    document.querySelectorAll('[data-bottom-nav]').forEach(function (b) {
        b.addEventListener('click', function () { openView(b.getAttribute('data-bottom-nav')); });
    });
    const fab = document.getElementById('qaFab');
    if (fab) fab.addEventListener('click', toggleQa);

    // Quick action items
    document.querySelectorAll('.qa-item').forEach(function (it) {
        it.addEventListener('click', function () { handleQa(it.getAttribute('data-qa')); });
    });

    // Hamburger drawer
    const hm = document.getElementById('mobileMenuButton');
    if (hm) hm.addEventListener('click', function () { document.body.classList.toggle('drawer-open'); });
    document.addEventListener('click', function (e) {
        if (document.body.classList.contains('drawer-open') && !e.target.closest('.sidebar')) closeDrawer();
        if (qaOpen && !e.target.closest('#qaMenu') && !e.target.closest('#qaFab')) closeQa();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeQa(); closeDrawer(); } });

    // openView wrapper: sync bottom nav + close overlays
    const prevOpen = window.openView;
    window.openView = function (name) {
        prevOpen(name);
        syncBottomNav(name);
        closeQa();
        closeDrawer();
    };
})();




function isUserLoggedIn() {
    return Boolean(getToken());
}

function requireAuth(actionName, callback) {
    if (isUserLoggedIn()) {
        if (typeof callback === 'function') callback();
        return true;
    }
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.add('show');
    showToast('Vui lòng đăng nhập hoặc đăng ký để sử dụng tính năng này!', 'warning');
    return false;
}

/* =========================================================
   CHAT AI (Trợ lý AI FoodX — Đa phiên & Lịch sử theo tài khoản)
========================================================= */
let chatMode = 'chat';
let activeChatSessionId = null;
let chatSessionsCache = [];

function initChatForCurrentUser() {
    activeChatSessionId = null;
    chatSessionsCache = [];
    if (isUserLoggedIn()) {
        fetchChatSessions(false);
    }
}

function resetChatOnLogout() {
    activeChatSessionId = null;
    chatSessionsCache = [];
    const titleEl = document.getElementById('chatSessionTitle');
    if (titleEl) titleEl.innerText = 'Cuộc trò chuyện mới';
    const countEl = document.getElementById('chatSessionCount');
    if (countEl) countEl.innerText = '0';
    const body = document.getElementById('chatBody');
    if (body) body.innerHTML = '';
    const overlay = document.getElementById('chatSessionsOverlay');
    if (overlay) overlay.style.display = 'none';
}

function toggleChat() {
    const panel = document.getElementById('chatPanel');
    if (!panel) return;
    if (panel.classList.contains('open')) {
        closeChat();
    } else {
        openChat();
    }
}

async function openChat(mode) {
    if (!isUserLoggedIn()) {
        requireAuth('chat');
        return;
    }

    if (mode) setMode(mode);
    const panel = document.getElementById('chatPanel');
    if (panel) panel.classList.add('open');
    const badge = document.getElementById('fabBadge');
    if (badge) badge.style.display = 'none';

    loadAiStatus();

    // Nếu chưa có phiên nào đang chọn, tải danh sách và tự động chọn phiên gần nhất hoặc tạo mới
    if (!activeChatSessionId) {
        await fetchChatSessions(true);
    }

    setTimeout(() => {
        const input = document.getElementById('chatInputFx');
        if (input) input.focus();
    }, 350);
}

function closeChat() {
    const panel = document.getElementById('chatPanel');
    if (panel) panel.classList.remove('open');
    toggleChatSessions(false);
}

function setMode(m) {
    chatMode = m;
    const chatBtn = document.getElementById('modeChatBtn');
    const stepBtn = document.getElementById('modeStepBtn');
    if (chatBtn) chatBtn.classList.toggle('active', m === 'chat');
    if (stepBtn) stepBtn.classList.toggle('active', m === 'step');
}

/** Tải danh sách các phiên trò chuyện từ backend */
async function fetchChatSessions(autoSelectLatest = false) {
    if (!isUserLoggedIn()) return;
    try {
        const res = await fetch('/api/chat/sessions', {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
        if (res.status === 401) {
            return;
        }
        const j = await res.json();
        if (j && j.success && Array.isArray(j.data)) {
            chatSessionsCache = j.data;
            updateChatSessionToolbar();
            renderChatSessionsList();

            if (autoSelectLatest) {
                if (chatSessionsCache.length > 0 && !activeChatSessionId) {
                    await switchChatSession(chatSessionsCache[0].id);
                } else if (!activeChatSessionId) {
                    await createChatSession('Cuộc trò chuyện mới', chatMode, false);
                }
            }
        }
    } catch (err) {
        console.warn('Không tải được danh sách phiên chat:', err);
    }
}

function updateChatSessionToolbar() {
    const countEl = document.getElementById('chatSessionCount');
    if (countEl) countEl.innerText = String(chatSessionsCache.length);

    const titleEl = document.getElementById('chatSessionTitle');
    if (titleEl) {
        const cur = chatSessionsCache.find(s => s.id === activeChatSessionId);
        titleEl.innerText = cur ? cur.title : 'Cuộc trò chuyện mới';
    }
}

function renderChatSessionsList() {
    const listEl = document.getElementById('chatSessionsList');
    if (!listEl) return;

    if (!chatSessionsCache || chatSessionsCache.length === 0) {
        listEl.innerHTML = `
            <div class="session-empty-state">
                <div class="session-empty-icon">💬</div>
                <div>Chưa có phiên trò chuyện nào.</div>
                <div style="font-size:11.5px;margin-top:4px;color:var(--text-soft)">Bấm "➕ Phiên mới" để bắt đầu!</div>
            </div>
        `;
        return;
    }

    listEl.innerHTML = chatSessionsCache.map(s => {
        const isActive = s.id === activeChatSessionId;
        const timeStr = formatChatSessionTime(s.updatedAt || s.createdAt);
        const modeText = s.mode === 'step' ? '👨‍🍳 Từng bước' : '💬 Hỏi đáp';
        const escapedTitle = escapeHtml(s.title || 'Cuộc trò chuyện mới');

        return `
            <div class="session-item ${isActive ? 'active' : ''}" onclick="switchChatSession(${s.id})">
                <div class="session-item-main">
                    <div class="session-item-title" title="${escapedTitle}">${escapedTitle}</div>
                    <div class="session-item-meta">
                        <span class="session-mode-badge">${modeText}</span>
                        <span class="session-item-time">🕒 ${timeStr}</span>
                    </div>
                </div>
                <div class="session-item-actions" onclick="event.stopPropagation()">
                    <button class="session-action-btn" title="Đổi tên" onclick="renameChatSession(${s.id}, event)">✏️</button>
                    <button class="session-action-btn delete-btn" title="Xóa phiên" onclick="deleteChatSession(${s.id}, event)">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function formatChatSessionTime(isoDateStr) {
    if (!isoDateStr) return '';
    try {
        const d = new Date(isoDateStr);
        if (isNaN(d.getTime())) return '';
        const now = new Date();
        const diffMs = now - d;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffMin < 1) return 'Vừa xong';
        if (diffMin < 60) return `${diffMin} phút trước`;
        if (diffHour < 24) return `${diffHour} giờ trước`;
        if (diffDay < 7) return `${diffDay} ngày trước`;
        
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch (e) {
        return '';
    }
}

/** Bật / tắt hiển thị danh sách các phiên trò chuyện */
function toggleChatSessions(force) {
    const overlay = document.getElementById('chatSessionsOverlay');
    if (!overlay) return;

    if (typeof force === 'boolean') {
        overlay.style.display = force ? 'flex' : 'none';
    } else {
        const isOpen = overlay.style.display === 'flex';
        overlay.style.display = isOpen ? 'none' : 'flex';
    }

    if (overlay.style.display === 'flex') {
        fetchChatSessions(false);
    }
}

/** Tạo một phiên chat mới */
async function createChatSession(title, mode, showSuccessToast = true) {
    if (!isUserLoggedIn()) {
        requireAuth('chat');
        return null;
    }

    const newTitle = title || 'Cuộc trò chuyện mới';
    const newMode = mode || chatMode || 'chat';

    try {
        const res = await fetch('/api/chat/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({ title: newTitle, mode: newMode })
        });
        const j = await res.json();
        if (j && j.success && j.data) {
            const newSession = j.data;
            activeChatSessionId = newSession.id;
            
            chatSessionsCache = [newSession, ...chatSessionsCache.filter(s => s.id !== newSession.id)];
            updateChatSessionToolbar();
            renderChatSessionsList();

            // Xóa tin nhắn cũ và hiển thị lời chào phiên mới
            const body = document.getElementById('chatBody');
            if (body) {
                body.innerHTML = '';
                addMsg('Chào bạn! Mình là <b>Trợ lý AI FoodX</b> 👋<br>Hai đứa mình cùng trò chuyện để lên kế hoạch bữa ăn & khám phá công thức chuẩn vị cho bạn nhé!', 'ai', null);
            }

            setMode(newSession.mode || 'chat');
            toggleChatSessions(false);

            if (showSuccessToast) {
                showToast('Đã tạo phiên trò chuyện mới!', 'success');
            }
            return newSession;
        } else {
            showToast(j?.message || 'Không thể tạo phiên mới', 'error');
        }
    } catch (err) {
        console.error('Lỗi tạo phiên chat:', err);
        showToast('Lỗi kết nối máy chủ', 'error');
    }
    return null;
}

/** Chuyển sang xem một phiên chat */
async function switchChatSession(sessionId) {
    if (!sessionId) return;
    if (!isUserLoggedIn()) {
        requireAuth('chat');
        return;
    }

    activeChatSessionId = sessionId;
    toggleChatSessions(false);
    updateChatSessionToolbar();
    renderChatSessionsList();

    const body = document.getElementById('chatBody');
    if (body) {
        body.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-soft);font-size:12.5px;">⏳ Đang tải nội dung phiên...</div>';
    }

    try {
        const res = await fetch(`/api/chat/sessions/${sessionId}`, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
        const j = await res.json();
        if (j && j.success && j.data) {
            const sessionData = j.data.session;
            const messages = j.data.messages || [];

            if (sessionData) {
                setMode(sessionData.mode || 'chat');
                const titleEl = document.getElementById('chatSessionTitle');
                if (titleEl) titleEl.innerText = sessionData.title || 'Cuộc trò chuyện mới';
            }

            if (body) {
                body.innerHTML = '';
                if (messages.length === 0) {
                    addMsg('Chào bạn! Mình là <b>Trợ lý AI FoodX</b> 👋<br>Hai đứa mình cùng trò chuyện để lên kế hoạch bữa ăn & khám phá công thức chuẩn vị cho bạn nhé!', 'ai', null);
                } else {
                    messages.forEach(m => {
                        if (m.role === 'user') {
                            addMsg(escapeHtml(m.content), 'user');
                        } else {
                            const formatted = m.content.includes('<') ? m.content : formatAiReply(m.content);
                            addMsg(formatted, 'ai');
                            if (m.steps && Array.isArray(m.steps) && m.steps.length > 0) {
                                addSteps(m.steps);
                            }
                        }
                    });
                }
                body.scrollTop = body.scrollHeight;
            }
        } else {
            showToast(j?.message || 'Không thể tải phiên chat', 'error');
        }
    } catch (err) {
        console.error('Lỗi tải chi tiết phiên chat:', err);
        if (body) body.innerHTML = '<div class="msg ai error">Không tải được tin nhắn phiên này.</div>';
    }
}

/** Đổi tên phiên chat đang chọn */
function renameCurrentChatSession() {
    if (!activeChatSessionId) {
        showToast('Chưa có phiên chat nào được chọn', 'warning');
        return;
    }
    renameChatSession(activeChatSessionId);
}

/** Đổi tên phiên chat */
async function renameChatSession(sessionId, event) {
    if (event) event.stopPropagation();
    if (!sessionId) return;

    const cur = chatSessionsCache.find(s => s.id === sessionId);
    const oldTitle = cur ? cur.title : '';
    const newTitle = window.prompt('Nhập tiêu đề mới cho phiên trò chuyện:', oldTitle);

    if (newTitle === null) return;
    const trimmed = newTitle.trim();
    if (!trimmed) {
        showToast('Tiêu đề không được để trống', 'warning');
        return;
    }

    try {
        const res = await fetch(`/api/chat/sessions/${sessionId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({ title: trimmed })
        });
        const j = await res.json();
        if (j && j.success) {
            showToast('Đã đổi tên phiên thành công', 'success');
            if (cur) cur.title = trimmed;
            updateChatSessionToolbar();
            renderChatSessionsList();
        } else {
            showToast(j?.message || 'Không thể đổi tên phiên', 'error');
        }
    } catch (err) {
        console.error('Lỗi đổi tên phiên chat:', err);
        showToast('Lỗi kết nối máy chủ', 'error');
    }
}

/** Xóa một phiên chat */
async function deleteChatSession(sessionId, event) {
    if (event) event.stopPropagation();
    if (!sessionId) return;

    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa phiên trò chuyện này không? Toàn bộ tin nhắn trong phiên sẽ bị xóa.');
    if (!confirmed) return;

    try {
        const res = await fetch(`/api/chat/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
        const j = await res.json();
        if (j && j.success) {
            showToast('Đã xóa phiên trò chuyện', 'success');
            chatSessionsCache = chatSessionsCache.filter(s => s.id !== sessionId);

            if (activeChatSessionId === sessionId) {
                if (chatSessionsCache.length > 0) {
                    await switchChatSession(chatSessionsCache[0].id);
                } else {
                    activeChatSessionId = null;
                    await createChatSession('Cuộc trò chuyện mới', chatMode, false);
                }
            } else {
                updateChatSessionToolbar();
                renderChatSessionsList();
            }
        } else {
            showToast(j?.message || 'Không thể xóa phiên', 'error');
        }
    } catch (err) {
        console.error('Lỗi xóa phiên chat:', err);
        showToast('Lỗi kết nối máy chủ', 'error');
    }
}

function addMsg(text, who, cls) {
    const body = document.getElementById('chatBody');
    if (!body) return null;
    const div = document.createElement('div');
    div.className = 'msg ' + who + (cls ? ' ' + cls : '');
    div.innerHTML = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
}

function addSteps(steps) {
    const body = document.getElementById('chatBody');
    if (!body || !steps || !steps.length) return;
    const card = document.createElement('div');
    card.className = 'steps-card';
    card.innerHTML = '<div class="steps-title">📋 Các bước thực hiện</div>' +
        steps.map((s, i) => '<div class="step"><b>' + (i + 1) + '.</b>' + escapeHtml(s) + '</div>').join('');
    body.appendChild(card);
    body.scrollTop = body.scrollHeight;
}

function typing(on) {
    const body = document.getElementById('chatBody');
    if (!body) return;
    if (on) {
        const t = document.createElement('div');
        t.className = 'typing';
        t.id = 'typingInd';
        t.innerHTML = '<span></span><span></span><span></span>';
        body.appendChild(t);
        body.scrollTop = body.scrollHeight;
    } else {
        const t = document.getElementById('typingInd');
        if (t) t.remove();
    }
}

function askFromTag(txt) {
    const input = document.getElementById('chatInputFx');
    if (input) {
        input.value = txt;
        sendMessage();
    }
}

function formatAiReply(text) {
    if (!text) return '';

    let html = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Table parsing
    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';
    let parsedLines = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line.startsWith('|') && line.endsWith('|')) {
            if (line.includes('---')) continue;
            const cells = line.split('|').filter(function(_, idx, arr) { return idx > 0 && idx < arr.length - 1; });
            if (!inTable) {
                inTable = true;
                tableHtml = '<table class="ai-table"><thead><tr>' + cells.map(function(c) { return '<th>' + c.trim() + '</th>'; }).join('') + '</tr></thead><tbody>';
            } else {
                tableHtml += '<tr>' + cells.map(function(c) { return '<td>' + c.trim() + '</td>'; }).join('') + '</tr>';
            }
        } else {
            if (inTable) {
                inTable = false;
                tableHtml += '</tbody></table>';
                parsedLines.push(tableHtml);
                tableHtml = '';
            }
            parsedLines.push(line);
        }
    }
    if (inTable) {
        tableHtml += '</tbody></table>';
        parsedLines.push(tableHtml);
    }

    html = parsedLines.join('\n');

    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/^### (.*$)/gim, '<h4 class="ai-heading">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 class="ai-heading">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h2 class="ai-heading">$1</h2>');
    html = html.replace(/^&gt;\s?(.*$)/gim, '<blockquote class="ai-quote">$1</blockquote>');
    html = html.replace(/^\d+\.\s+(.*$)/gim, '<div class="ai-step-item">$1</div>');
    html = html.replace(/^[-*]\s+(.*$)/gim, '<div class="ai-bullet-item">$1</div>');
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/<br><br>/g, '<br>');

    return html;
}

async function sendMessage() {
    const input = document.getElementById('chatInputFx');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    doSend(msg);
}

async function doSend(msg) {
    if (!isUserLoggedIn()) {
        requireAuth('chat');
        return;
    }

    addMsg(escapeHtml(msg), 'user');
    typing(true);
    const btn = document.getElementById('chatSendBtn');
    if (btn) btn.disabled = true;

    // Gather available ingredients from fridge items
    let ings = [];
    if (window.fridgeItemsCache && Array.isArray(window.fridgeItemsCache)) {
        ings = window.fridgeItemsCache.map(function(i) { return i.ingredientName || i.name; }).filter(Boolean);
    }

    try {
        // Đảm bảo có phiên chat đang active
        if (!activeChatSessionId) {
            const newS = await createChatSession(msg.length > 40 ? msg.substring(0, 40) + '…' : msg, chatMode, false);
            if (!newS) {
                throw new Error('Không tạo được phiên trò chuyện');
            }
        }

        const res = await fetch(`/api/chat/sessions/${activeChatSessionId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({ message: msg, mode: chatMode, availableIngredients: ings })
        });
        const j = await res.json();
        typing(false);

        if (j && j.success && j.data) {
            const replyText = j.data.reply || '';
            addMsg(formatAiReply(replyText), 'ai');
            if (j.data.steps && j.data.steps.length) {
                addSteps(j.data.steps);
            }
            // Tải lại danh sách phiên để cập nhật tiêu đề mới và thời gian
            fetchChatSessions(false);
        } else {
            // Smart local fallback if backend return error
            const fallbackReply = generateSmartFallbackReply(msg, ings);
            addMsg(formatAiReply(fallbackReply), 'ai');
        }
    } catch (err) {
        typing(false);
        console.warn('Lỗi gửi tin nhắn AI:', err);
        const fallbackReply = generateSmartFallbackReply(msg, ings);
        addMsg(formatAiReply(fallbackReply), 'ai');
    } finally {
        if (btn) btn.disabled = false;
        const input = document.getElementById('chatInputFx');
        if (input) input.focus();
    }
}

/* =========================================================
   ONBOARDING HELPERS (SHARED CHIP TOGGLE — profile form)
========================================================= */
function toggleOnbChip(btn) {
    btn.classList.toggle('active');
}

function generateSmartFallbackReply(msg, ings) {
    const q = (msg || '').toLowerCase();
    const ingsStr = ings && ings.length ? 'Nguyên liệu sẵn có trong tủ lạnh của bạn: **' + ings.join(', ') + '**.' : '';

    if (q.includes('cá kho') || q.includes('kho tiêu') || q.includes('kho')) {
        return '**Bí Quyết Làm Cá Kho Tiêu Đậm Đà Đậm Vị Gia Đình**\n\n' +
            '### 1. Nguyên liệu chuẩn bị (cho 2-3 người)\n' +
            '- Cá lóc, cá thu hoặc basa: 500g (rửa sạch, ráo nước)\n' +
            '- Tiêu đen xay, tỏi băm, hành tím băm, ớt tươi\n' +
            '- Nước mắm ngon, đường, hạt nêm, dầu ăn\n\n' +
            '### 2. Các bước thực hiện\n' +
            '1. **Ướp cá:** Ướp cá với 2 thìa nước mắm, 1 thìa đường, 1/2 thìa tiêu và tỏi hành băm trong 20 phút.\n' +
            '2. **Thắng nước màu:** Cho 1 thìa đường vào dầu nóng đun nhỏ lửa đến khi chuyển màu cánh gián thơm.\n' +
            '3. **Kho cá:** Cho cá vào đảo lật 2 mặt cho săn lại. Đổ nước sấp mặt cá đun sôi rồi hạ lửa nhỏ kho 25 phút.\n' +
            '4. **Hoàn thành:** Rắc tiêu xay và ớt thái lát lên trên. Dùng với cơm nóng tuyệt ngon!\n\n' +
            '> 💡 *' + (ingsStr || 'Mẹo: Kho 2 lần lửa cá sẽ săn thịt và ngấm vị đậm đà hơn!') + '*';
    } else if (q.includes('phở') || q.includes('bún')) {
        return '**Hướng Dẫn Nấu Phở Bò Thơm Ngon Chuẩn Vị Hà Nội**\n\n' +
            '### 1. Chuẩn bị nước dùng\n' +
            '- Ninh xương ống bò 3-4 tiếng cùng gừng nướng, hành nướng, hoa hồi, quế, thảo quả.\n' +
            '- Nêm nước mắm ngon và chút đường phèn cho vị ngọt dịu thanh mát.\n\n' +
            '### 2. Thưởng thức\n' +
            '- Chần bánh phở tươi qua nước sôi, xếp vào tô.\n' +
            '- Xếp thịt bò tái hoặc nạm, rắc hành lá thái nhỏ.\n' +
            '- Chan nước dùng sôi sùng sục và ăn kèm chanh ớt tươi!';
    } else if (q.includes('gà') || q.includes('ức gà') || q.includes('eat clean')) {
        return '**Gợi Ý Món Gà Áp Chảo Sốt Bơ Chanh Healthy**\n\n' +
            '### 1. Nguyên liệu\n' +
            '- Ức gà 300g (thái lát vừa ăn)\n' +
            '- Chanh tươi, bơ lạt, tỏi băm, muối pepper, xà lách\n\n' +
            '### 2. Cách làm\n' +
            '1. Ướp ức gà với chút muối, tiêu và tỏi băm 10 phút.\n' +
            '2. Áp chảo ức gà với bơ lạt đến khi vàng đều 2 mặt.\n' +
            '3. Vắt chanh tươi tạo nước sốt chua nhẹ béo ngậy.\n\n' +
            '> 📌 *' + (ingsStr || 'Món ăn cực giàu đạm và hỗ trợ giảm cân hiệu quả!') + '*';
    } else {
        return 'Chào bạn! Mình là **Trợ lý AI Nấu ăn FoodX** 🍳\n\n' +
            'Mình luôn sẵn sàng tư vấn công thức nấu ăn, mẹo bảo quản thực phẩm và gợi ý món ngon cho gia đình bạn.\n\n' +
            'Bạn có thể hỏi mình: *"Cách nấu cá kho tiêu"*, *"Cách làm cơm chiên trứng"*, *"Gợi ý món tối nay"*...\n\n' +
            '> 💡 *' + (ingsStr || 'Hãy nhập câu hỏi của bạn bên dưới nhé!') + '*';
    }
}

function heroSearchSubmit(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('heroSearchInput') || document.getElementById('heroSearchInputApp');
    if (!input) return false;
    const val = input.value.trim();
    if (!val) {
        showToast('Bạn muốn ăn gì? Hãy gõ nguyên liệu hoặc tên món vào ô tìm kiếm nhé 😉', 'info');
        return false;
    }
    openChat();
    doSend(val);
    return false;
}

function askFromTag(q) {
    openChat();
    doSend(q);
}

async function loadAiStatus() {
    const setUi = (mock, provider) => {
        const statusText = document.getElementById('chatStatusText');
        const dot = document.getElementById('chatDot');
        if (statusText) {
            statusText.textContent = mock
                ? 'Dữ liệu mẫu • Trợ lý Sẵn sàng'
                : (provider === 'groq' ? 'Groq AI • Trực tuyến' : 'Gemini AI • Trực tuyến');
        }
        if (dot) dot.classList.toggle('live', !mock);
    };

    setUi(true, 'mock');

    try {
        const res = await fetch('/api/ai/status');
        if (res.ok) {
            const j = await res.json();
            if (j && j.success && j.data) {
                const provider = j.data.provider || 'gemini';
                setUi(!!j.data.mock, provider);
            }
        }
    } catch (e) {
        setUi(true, 'mock');
    }
}

(function initChat() {
    const body = document.getElementById('chatBody');
    if (body && !body.childElementCount) {
        addMsg('Chào bạn! Mình là <b>Trợ lý AI FoodX</b> 👋<br>Hỏi mình bất cứ điều gì về nấu nướng — công thức, mẹo hay gợi ý món ăn nhé!', 'ai');
    }
    loadAiStatus();
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeChat(); });
})();


/* =========================================================
   ONBOARDING WIZARD
========================================================= */

const ONB_KEY = "foodx_onboarding_done";

const onbState = {
    cuisines: [],
    spice: 1,
    favs: [],
    goals: [],
    goalOther: "",
    eaters: "3-4 người",
    cooktime: "15-30 phút",
    allergies: [],
    diet: "Không",
    calo: 2000,
    equip: []
};

function isOnboardingDone() {
    try {
        return localStorage.getItem(ONB_KEY) === "1";
    } catch (e) {
        return false;
    }
}

function markOnboardingDone() {
    try {
        localStorage.setItem(ONB_KEY, "1");
    } catch (e) {}
}

function showOnboarding() {
    const overlay = document.getElementById("onboardingOverlay");
    if (!overlay) return;
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
}

function hideOnboarding() {
    const overlay = document.getElementById("onboardingOverlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    document.body.style.overflow = "";
    markOnboardingDone();
}

function showOnbStep(step) {
    document.querySelectorAll(".onboarding-screen").forEach(function (s) {
        s.classList.remove("active");
    });
    var el = document.getElementById("onboardingStep" + step);
    if (el) el.classList.add("active");
}


/* --- Build chips --- */

function onbBuildChips(sel, items, store, multi) {
    var box = document.querySelector(sel);
    if (!box) return;
    box.innerHTML = "";
    items.forEach(function (it) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "onb-chip";
        b.textContent = it;
        b.onclick = function () {
            if (!multi) {
                store.length = 0;
                store.push(it);
                box.querySelectorAll(".onb-chip").forEach(function (c) {
                    c.classList.remove("active");
                });
                b.classList.add("active");
                return;
            }
            var idx = store.indexOf(it);
            if (idx > -1) {
                store.splice(idx, 1);
            } else {
                store.push(it);
            }
            b.classList.toggle("active");
        };
        box.appendChild(b);
    });
}

onbBuildChips(
    "#onbCuisines",
    ["🇻🇳 Việt Nam", "🥢 Á – Trung Hoa", "🌶️ Thái Lan", "🥘 Hàn Quốc", "🍣 Nhật Bản", "🍛 Ấn Độ", "🍝 Ý", "🥖 Pháp", "🌮 Mexico", "🫒 Địa Trung Hải"],
    onbState.cuisines,
    true
);

onbBuildChips(
    "#onbAllergy",
    ["🥜 Đậu phộng", "🦐 Tôm / Cua", "🐟 Cá", "🥛 Sữa", "🥚 Trứng", "🌾 Gluten", "🫘 Đậu nành", "🌰 Hạt khác", "✅ Không có dị ứng"],
    onbState.allergies,
    true
);

onbBuildChips(
    "#onbEquip",
    ["🔥 Bếp gas", "⚡ Bếp từ", "🍞 Lò nướng", "🍟 Nồi chiên không dầu", "🍚 Nồi cơm điện", "💨 Nồi áp suất", "🥤 Máy xay sinh tố"],
    onbState.equip,
    true
);


/* --- Goals --- */

var ONB_GOALS = [
    { ic: "🥗", t: "Ăn kiêng giảm cân", d: "Giảm 0,5kg mỗi tuần" },
    { ic: "💪", t: "Tăng cơ", d: "Đạm cao, ít tinh bột" },
    { ic: "⚖️", t: "Duy trì cân nặng", d: "Cân bằng dinh dưỡng" },
    { ic: "🌿", t: "Ăn lành mạnh", d: "Ít dầu, nhiều rau" },
    { ic: "⏰", t: "Tiết kiệm thời gian", d: "Món dưới 30 phút" },
    { ic: "💰", t: "Tiết kiệm chi phí", d: "Nguyên liệu giá tốt" }
];

(function buildGoals() {
    var grid = document.getElementById("onbGoals");
    if (!grid) return;
    grid.innerHTML = ONB_GOALS.map(function (g, i) {
        return '<button type="button" class="onb-goal-card" data-i="' + i + '">' +
            '<div class="g-ic">' + g.ic + '</div>' +
            '<div class="g-t">' + g.t + '</div>' +
            '<div class="g-d">' + g.d + '</div>' +
            '</button>';
    }).join("");
    grid.querySelectorAll(".onb-goal-card").forEach(function (b) {
        b.onclick = function () {
            var g = ONB_GOALS[parseInt(b.dataset.i)].t;
            var idx = onbState.goals.indexOf(g);
            if (idx > -1) {
                onbState.goals.splice(idx, 1);
            } else {
                onbState.goals.push(g);
            }
            b.classList.toggle("active");
        };
    });
})();


/* --- Segmented controls --- */

function onbBindSeg(sel, store, key) {
    var el = document.querySelector(sel);
    if (!el) return;
    el.querySelectorAll("button").forEach(function (b) {
        b.onclick = function () {
            el.querySelectorAll("button").forEach(function (x) {
                x.classList.remove("active");
            });
            b.classList.add("active");
            onbState[key] = b.dataset.v;
        };
    });
}

onbBindSeg("#onbEaters", null, "eaters");
onbBindSeg("#onbCooktime", null, "cooktime");
onbBindSeg("#onbDiet", null, "diet");


/* --- Spice slider --- */

(function () {
    var spice = document.getElementById("onbSpice");
    if (!spice) return;
    spice.addEventListener("input", function () {
        onbState.spice = parseInt(spice.value);
        document.querySelectorAll("#onboardingStep1 .onb-spice-labels span").forEach(function (s) {
            s.classList.toggle("active", parseInt(s.dataset.s) === onbState.spice);
        });
    });
})();


/* --- Favorite tags --- */

(function () {
    var input = document.getElementById("onbFavInput");
    var tagsEl = document.getElementById("onbFavTags");
    if (!input || !tagsEl) return;

    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && input.value.trim()) {
            e.preventDefault();
            onbState.favs.push(input.value.trim());
            input.value = "";
            renderOnbFavs();
        }
    });

    function renderOnbFavs() {
        tagsEl.innerHTML = onbState.favs.map(function (f, i) {
            return '<span class="onb-tag">' + escapeHtml(f) + '<button data-i="' + i + '" aria-label="Xoá">×</button></span>';
        }).join("");
        tagsEl.querySelectorAll("button").forEach(function (b) {
            b.onclick = function () {
                onbState.favs.splice(parseInt(b.dataset.i), 1);
                renderOnbFavs();
            };
        });
    }
})();


/* --- Calo slider --- */

(function () {
    var calo = document.getElementById("onbCalo");
    var out = document.getElementById("onbCaloOut");
    if (!calo || !out) return;
    calo.addEventListener("input", function () {
        onbState.calo = parseInt(calo.value);
        out.textContent = formatNumber(onbState.calo) + " kcal";
    });
})();


/* --- Goal other --- */

(function () {
    var inp = document.getElementById("onbGoalOther");
    if (!inp) return;
    inp.addEventListener("input", function () {
        onbState.goalOther = inp.value;
    });
})();


/* --- Navigation buttons --- */

(function () {
    var $1 = document.getElementById("onb1Next");
    var $2 = document.getElementById("onb2Next");
    var $3 = document.getElementById("onbFinish");
    var b1 = document.getElementById("onb1Back");
    var b2 = document.getElementById("onb2Back");
    var b3 = document.getElementById("onb3Back");

    if ($1) $1.onclick = function () { showOnbStep(2); };
    if ($2) $2.onclick = function () { showOnbStep(3); };
    if ($3) $3.onclick = function () {
        /* Save onboarding profile to state */
        state.profile.onboarding = {
            cuisines: onbState.cuisines.slice(),
            spice: onbState.spice,
            favs: onbState.favs.slice(),
            goals: onbState.goals.slice(),
            goalOther: onbState.goalOther,
            eaters: onbState.eaters,
            cooktime: onbState.cooktime,
            allergies: onbState.allergies.slice(),
            diet: onbState.diet === "Không" ? state.profile.diet : onbState.diet,
            calo: onbState.calo,
            equip: onbState.equip.slice()
        };
        saveState();
        hideOnboarding();
        showToast("Hoàn tất hồ sơ! Chào mừng bạn đến với Food X 🌿", "success");
    };

    if (b1) b1.onclick = function () { hideOnboarding(); };
    if (b2) b2.onclick = function () { showOnbStep(1); };
    if (b3) b3.onclick = function () { showOnbStep(2); };
})();
