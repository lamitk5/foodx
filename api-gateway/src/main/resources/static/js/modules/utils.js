/**
 * FoodX module: utils.js
 * Tien ich dung chung: escape HTML, debounce, goi API, toast, trang thai nut bam.
 * Cat tu app.js, van dung bien toan cuc de index.html goi duoc.
 */
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
   HELPER
========================================================= */

function debounce(fn, delay = 200) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
window.debounce = debounce;

function normalize(text = "") {
    return String(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let end;
    if (typeof date === "string" && date.includes("-")) {
        const parts = date.split("T")[0].split("-");
        if (parts.length === 3) {
            end = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        } else {
            end = new Date(date);
        }
    } else {
        end = new Date(date);
    }
    const target = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    return Math.round(
        (target - today) /
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
        if (response.status === 401) {
            if (token) {
                setToken("");
                if (typeof resetChatOnLogout === "function") resetChatOnLogout();
                if (typeof renderAuthSettings === "function") {
                    authState.authenticated = false;
                    renderAuthSettings();
                }
            }
            let errMsg = "Vui lòng đăng nhập để thực hiện tính năng này.";
            try {
                const raw = await response.text();
                const j = JSON.parse(raw);
                if (j && j.message) errMsg = j.message;
            } catch (_) {}
            throw new Error(errMsg);
        }

        let message =
            `HTTP ${response.status}`;

        try {
            const text =
                await response.text();

            if (text) {
                try {
                    const parsedErr = JSON.parse(text);
                    if (parsedErr && parsedErr.message) message = parsedErr.message;
                    else message += ` - ${text}`;
                } catch (_) {
                    message += ` - ${text}`;
                }
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


