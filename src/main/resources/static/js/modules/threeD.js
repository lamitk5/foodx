/**
 * FoodX 3D Spatial & Motion Engine
 * - 3D Tilt Cards with Dynamic Specular Lighting
 * - 3D Depth View Transitions
 * - Interactive 3D Canvas
 * - Parallax 3D Badges
 */

let threeDInitialized = false;
let heroAnimId = null;

export function init3DFeatures() {
    if (threeDInitialized) return;
    threeDInitialized = true;

    init3DTiltObserver();
    init3DHeroParallax();
    init3DHeroScene();
}

/**
 * 1. 3D Tilt on Cards with Dynamic Specular Glare
 */
export function init3DTilt(element) {
    if (!element || element.dataset.tilt3dBound) return;
    element.dataset.tilt3dBound = "true";
    element.classList.add("card-3d");

    // Create glare overlay if not exists
    let glare = element.querySelector(".card-3d-glare");
    if (!glare) {
        glare = document.createElement("div");
        glare.className = "card-3d-glare";
        element.appendChild(glare);
    }

    let isHovered = false;
    let rafId = null;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    function update() {
        if (!isHovered) {
            // Return to origin smoothly
            currentX += (0 - currentX) * 0.15;
            currentY += (0 - currentY) * 0.15;
            if (Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1) {
                element.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)";
                if (glare) glare.style.opacity = "0";
                rafId = null;
                return;
            }
        } else {
            currentX += (targetX - currentX) * 0.2;
            currentY += (targetY - currentY) * 0.2;
        }

        const rotX = (-currentY * 9).toFixed(2);
        const rotY = (currentX * 9).toFixed(2);
        element.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;

        if (glare) {
            const glareX = ((currentX + 1) * 50).toFixed(1);
            const glareY = ((currentY + 1) * 50).toFixed(1);
            glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.3) 0%, transparent 65%)`;
            glare.style.opacity = "1";
        }

        rafId = requestAnimationFrame(update);
    }

    element.addEventListener("mouseenter", () => {
        isHovered = true;
        if (!rafId) rafId = requestAnimationFrame(update);
    });

    element.addEventListener("mousemove", (e) => {
        const rect = element.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        targetX = (x - 0.5) * 2; // -1 to 1
        targetY = (y - 0.5) * 2;
        if (!rafId) rafId = requestAnimationFrame(update);
    });

    element.addEventListener("mouseleave", () => {
        isHovered = false;
        targetX = 0;
        targetY = 0;
    });
}

/**
 * Automatically bind 3D Tilt to cards across the app using MutationObserver
 */
function init3DTiltObserver() {
    const cardSelectors = ".recipe-card, .fridge-food-card, .catalog-card, .blog-featured-card, .dash-card, .srm-card";

    function scanAndBind() {
        document.querySelectorAll(cardSelectors).forEach(card => {
            init3DTilt(card);
        });
    }

    scanAndBind();

    // Observe newly rendered cards (after API requests or tab switches)
    const observer = new MutationObserver(() => {
        scanAndBind();
    });

    const mainContainer = document.querySelector(".main") || document.body;
    observer.observe(mainContainer, { childList: true, subtree: true });
}

/**
 * 2. 3D Depth View Transition
 */
export function trigger3DViewTransition(targetViewEl) {
    if (!targetViewEl) return;
    targetViewEl.classList.remove("view-enter-3d");
    void targetViewEl.offsetWidth; // Force reflow
    targetViewEl.classList.add("view-enter-3d");

    setTimeout(() => {
        targetViewEl.classList.remove("view-enter-3d");
    }, 550);
}

/**
 * 3. Hero Parallax 3D Badges
 */
function init3DHeroParallax() {
    const heroWrap = document.querySelector(".slogan-hero-clean") || document.querySelector(".home-dash");
    if (!heroWrap) return;

    heroWrap.addEventListener("mousemove", (e) => {
        const rect = heroWrap.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        const badges = heroWrap.querySelectorAll(".floating-3d-badge");
        badges.forEach((b, idx) => {
            const depth = (idx + 1) * 14;
            const moveX = (x * depth).toFixed(1);
            const moveY = (y * depth).toFixed(1);
            b.style.transform = `translate3d(${moveX}px, ${moveY}px, ${30 + depth}px)`;
        });
    });

    heroWrap.addEventListener("mouseleave", () => {
        const badges = heroWrap.querySelectorAll(".floating-3d-badge");
        badges.forEach(b => {
            b.style.transform = "";
        });
    });
}

/**
 * 4. Interactive 3D Canvas in Hero (Pure WebGL / Procedural 3D Bowl)
 * Lightweight, zero external dependencies required, renders 60fps rotating gourmet bowl with lighting
 */
function init3DHeroScene() {
    const container = document.getElementById("hero3dContainer");
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.className = "hero-3d-canvas";
    container.innerHTML = "";
    container.appendChild(canvas);

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
        // Fallback to 2D stylized 3D graphics
        render2D3DFallback(canvas);
        return;
    }

    let width = (canvas.width = container.clientWidth || 300);
    let height = (canvas.height = container.clientHeight || 280);
    gl.viewport(0, 0, width, height);

    // Simple 3D procedural shader for ambient food bowl with light reflection
    const vsSource = `
        attribute vec3 aPosition;
        attribute vec3 aNormal;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
            vNormal = aNormal;
            vPosition = aPosition;
            gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
        }
    `;

    const fsSource = `
        precision mediump float;
        varying vec3 vNormal;
        varying vec3 vPosition;
        uniform vec3 uLightPos;
        uniform vec3 uColor;
        void main() {
            vec3 N = normalize(vNormal);
            vec3 L = normalize(uLightPos - vPosition);
            float diff = max(dot(N, L), 0.25);
            vec3 viewDir = vec3(0.0, 0.0, 1.0);
            vec3 reflectDir = reflect(-L, N);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0) * 0.4;
            vec3 col = uColor * diff + vec3(spec);
            gl_FragColor = vec4(col, 1.0);
        }
    `;

    function createShader(type, source) {
        const s = gl.createShader(type);
        gl.shaderSource(s, source);
        gl.compileShader(s);
        return s;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, createShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(prog, createShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Create 3D Cylinder / Bowl Mesh
    const segments = 32;
    const positions = [];
    const normals = [];

    // Outer bowl
    for (let i = 0; i < segments; i++) {
        const theta1 = (i / segments) * Math.PI * 2;
        const theta2 = ((i + 1) / segments) * Math.PI * 2;

        const x1 = Math.cos(theta1), z1 = Math.sin(theta1);
        const x2 = Math.cos(theta2), z2 = Math.sin(theta2);

        // Top rim
        positions.push(0, -0.1, 0, x1 * 0.85, 0.45, z1 * 0.85, x2 * 0.85, 0.45, z2 * 0.85);
        normals.push(0, 1, 0, x1, 0.6, z1, x2, 0.6, z2);

        // Base
        positions.push(x1 * 0.4, -0.45, z1 * 0.4, x2 * 0.4, -0.45, z2 * 0.4, x1 * 0.85, 0.45, z1 * 0.85);
        normals.push(x1, 0.2, z1, x2, 0.2, z2, x1, 0.6, z1);
        positions.push(x2 * 0.4, -0.45, z2 * 0.4, x2 * 0.85, 0.45, z2 * 0.85, x1 * 0.85, 0.45, z1 * 0.85);
        normals.push(x2, 0.2, z2, x2, 0.6, z2, x1, 0.6, z1);
    }

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const normBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, "aPosition");
    const aNorm = gl.getAttribLocation(prog, "aNormal");
    const uMVP = gl.getUniformLocation(prog, "uModelViewMatrix");
    const uProj = gl.getUniformLocation(prog, "uProjectionMatrix");
    const uLight = gl.getUniformLocation(prog, "uLightPos");
    const uColor = gl.getUniformLocation(prog, "uColor");

    gl.enable(gl.DEPTH_TEST);

    let angleY = 0;
    let targetAngleY = 0;
    let angleX = 0.25;
    let targetAngleX = 0.25;
    let isDragging = false;
    let startX = 0, startY = 0;

    container.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
    });

    window.addEventListener("mouseup", () => isDragging = false);

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) {
            const rect = container.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                const normX = (e.clientX - rect.left) / rect.width - 0.5;
                const normY = (e.clientY - rect.top) / rect.height - 0.5;
                targetAngleY += normX * 0.05;
                targetAngleX = 0.25 + normY * 0.2;
            }
            return;
        }
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        startX = e.clientX;
        startY = e.clientY;
        targetAngleY += dx * 0.015;
        targetAngleX = Math.max(-0.2, Math.min(0.7, targetAngleX + dy * 0.015));
    });

    function render(time) {
        if (!document.getElementById("hero3dContainer")) {
            return;
        }

        // Only animate if Home view is active
        const homeView = document.getElementById("view-home");
        if (homeView && homeView.classList.contains("active")) {
            angleY += (targetAngleY - angleY) * 0.08 + 0.005; // Continuous gentle rotation
            angleX += (targetAngleX - angleX) * 0.08;

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Simple Perspective & ModelView matrix
            const aspect = width / height;
            const fov = 45 * Math.PI / 180;
            const f = 1.0 / Math.tan(fov / 2);
            const projMat = [
                f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, -1.02, -1,
                0, 0, -0.4, 0
            ];

            // Rotate matrix
            const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
            const cosX = Math.cos(angleX), sinX = Math.sin(angleX);

            const mvMat = [
                cosY, sinX * sinY, -cosX * sinY, 0,
                0, cosX, sinX, 0,
                sinY, -sinX * cosY, cosX * cosY, 0,
                0, -0.1, -2.6, 1
            ];

            gl.uniformMatrix4fv(uProj, false, new Float32Array(projMat));
            gl.uniformMatrix4fv(uMVP, false, new Float32Array(mvMat));
            gl.uniform3f(uLight, 2.0, 3.0, 2.0);

            // Draw Emerald Green Ceramic Bowl
            gl.uniform3f(uColor, 0.06, 0.72, 0.50);

            gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
            gl.enableVertexAttribArray(aPos);
            gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
            gl.enableVertexAttribArray(aNorm);
            gl.vertexAttribPointer(aNorm, 3, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, positions.length / 3);
        }

        heroAnimId = requestAnimationFrame(render);
    }

    heroAnimId = requestAnimationFrame(render);
}

function render2D3DFallback(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "64px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🥗", canvas.width / 2, canvas.height / 2);
}

// Window bindings for seamless global access
if (typeof window !== "undefined") {
    window.init3DFeatures = init3DFeatures;
    window.init3DTilt = init3DTilt;
    window.trigger3DViewTransition = trigger3DViewTransition;
}
