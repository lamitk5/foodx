async function authRequest(
    url,
    options = {}
) {

    const isPublicAuthUrl = url.includes('/api/auth/register') || url.includes('/api/auth/login');
    const token = isPublicAuthUrl ? "" : getToken();

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

    const isAuth = Boolean(data?.accessToken || data?.userId || (getToken() && data?.username));
    authState = {
        authenticated: isAuth,
        userId: data?.userId ?? (isAuth ? authState.userId : null),
        fullName: data?.fullName || data?.username || (isAuth ? authState.fullName : ""),
        email: data?.email || (isAuth ? authState.email : ""),
        role: data?.role || (isAuth ? authState.role : ""),
        avatarUrl: data?.avatarUrl || (isAuth ? authState.avatarUrl : "")
    };
    window.authState = authState;

    if (authState.authenticated) {
        try {
            localStorage.setItem("foodx_user", JSON.stringify(authState));
        } catch (_) {}

        state.userId = authState.userId;
        if (authState.fullName) {
            state.profile.name = authState.fullName;
        }
        if (authState.avatarUrl) {
            state.profile.avatarUrl = authState.avatarUrl;
        }
        saveState();
        renderProfile();
        loadProfileFromApi(false);
        loadFridgeFromApi(false);
        if (typeof loadHomeDashboard === 'function') loadHomeDashboard();
        if (typeof loadSocialFeed === 'function') loadSocialFeed();

        if (typeof initChatForCurrentUser === 'function') {
            initChatForCurrentUser();
        }
    } else {
        try {
            localStorage.removeItem("foodx_user");
        } catch (_) {}

        state.userId = null;
        state.profile = createDefaultState().profile;
        state.fridge = [];
        state.selectedFridgeIds = [];
        saveState();
        renderAll();
        if (typeof loadHomeDashboard === 'function') loadHomeDashboard();
        if (typeof loadSocialFeed === 'function') loadSocialFeed();

        if (typeof resetChatOnLogout === 'function') {
            resetChatOnLogout();
        }
    }

    renderAuthSettings();
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
    const token = getToken();
    if (!token) return false;

    try {
        const data = await authRequest(`${AUTH_API}/me`);
        if (data) {
            applyAuthResponse(data);
            return true;
        }
        return false;
    } catch (error) {
        console.warn(
            "Không kiểm tra được đăng nhập từ server:",
            error
        );

        // Chỉ đăng xuất nếu token thực sự hết hạn hoặc bị từ chối (401, 403)
        const errMsg = String(error?.message || "");
        if (errMsg.includes("401") || errMsg.includes("403") || errMsg.includes("hết hạn") || errMsg.includes("Unauthorized")) {
            setToken("");
            try { localStorage.removeItem("foodx_user"); } catch (_) {}
            authState = {
                authenticated: false,
                userId: null,
                fullName: "",
                email: "",
                role: "",
                avatarUrl: ""
            };
            window.authState = authState;

            if (typeof createDefaultState === 'function' && typeof state !== 'undefined') {
                state.userId = null;
                state.profile = createDefaultState().profile;
                saveState();
                if (typeof renderAvatar === 'function') renderAvatar();
            }

            renderAuthSettings();

            if (showErrorToast) {
                showToast(
                    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
                    "warning"
                );
            }
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
    const username = document.getElementById("registerUsername")?.value.trim();
    const email = document.getElementById("registerEmail")?.value.trim();
    const password = document.getElementById("registerPassword")?.value;
    const confirmPassword = document.getElementById("registerConfirmPassword")?.value;

    if (!fullName || !username || !email || !password || !confirmPassword) {
        restore();
        showToast("Hãy nhập đầy đủ thông tin.", "warning");
        return;
    }

    if (username.length < 3 || username.length > 50) {
        restore();
        showToast("Tên đăng nhập phải từ 3 đến 50 ký tự.", "warning");
        return;
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        restore();
        showToast("Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới hoặc gạch nối.", "warning");
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
                username: username,
                fullName: fullName,
                email: email,
                password: password,
                confirmPassword: confirmPassword
            })
        });

        applyAuthResponse(data);
        showToast(data?.message || "Tạo tài khoản thành công!", "success");

        document.getElementById("registerModal")?.classList.remove("show");
        document.getElementById("registerForm")?.reset();

        /* Hiển thị 3 bước thiết lập hồ sơ dinh dưỡng */
        setTimeout(function () {
            showOnboarding();
        }, 300);
    } catch (error) {
        console.error("Register error:", error);
        showToast(error.message || "Không thể đăng ký tài khoản. Vui lòng kiểm tra lại!", "error");
    } finally {
        restore();
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


// Module window exports
if (typeof window !== 'undefined') window.authRequest = authRequest;
if (typeof window !== 'undefined') window.applyAuthResponse = applyAuthResponse;
if (typeof window !== 'undefined') window.renderAuthSettings = renderAuthSettings;
if (typeof window !== 'undefined') window.loadAuthState = loadAuthState;
if (typeof window !== 'undefined') window.openAuthModal = openAuthModal;
