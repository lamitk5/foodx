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

function debounce(fn, delay = 200) {
    let timer = null;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}
window.debounce = debounce;

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


// Module window exports
if (typeof window !== 'undefined') window.getToken = getToken;
if (typeof window !== 'undefined') window.setToken = setToken;
if (typeof window !== 'undefined') window.normalize = normalize;
if (typeof window !== 'undefined') window.futureDate = futureDate;
if (typeof window !== 'undefined') window.daysLeft = daysLeft;
if (typeof window !== 'undefined') window.formatNumber = formatNumber;
if (typeof window !== 'undefined') window.escapeHTML = escapeHTML;
if (typeof window !== 'undefined') window.setText = setText;
if (typeof window !== 'undefined') window.toDateInputValue = toDateInputValue;
if (typeof window !== 'undefined') window.apiRequest = apiRequest;
