/* =========================
   BASIC APP OPEN
========================= */
function openApp(link) {
    window.open(link, "_blank");
}

/* =========================
   CLOCK
========================= */
function updateClock() {
    const now = new Date();

    document.getElementById("clock").innerHTML = `
        ${now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}<br>
        <span style="font-size:12px;">
        ${now.toLocaleDateString([], {month:'short', day:'numeric'})}
        </span>
    `;

    const days = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
    document.getElementById("dayText").textContent = days[now.getDay()];
}
setInterval(updateClock, 1000);
updateClock();

/* =========================
   BACKGROUND SWITCH
========================= */
function setBG(el){
    document.body.style.backgroundImage = el.style.backgroundImage;
}

/* =========================
   SETTINGS TOGGLE
========================= */
function toggleSettings() {
    const overlay = document.getElementById("settingsOverlay");
    if (!overlay) return;

    overlay.style.display = (overlay.style.display === "flex") ? "none" : "flex";
}

/* =========================
   LIBRARY TOGGLE
========================= */
function toggleLibrary() {
    const overlay = document.getElementById("libraryOverlay");
    if (!overlay) return;

    overlay.classList.toggle("open");

    overlay.style.display = overlay.classList.contains("open")
        ? "flex"
        : "none";
}

/* =========================
   PANIC KEY
========================= */
document.addEventListener("keydown",(e)=>{
    if(e.key === "`"){
        window.location.href = "https://centennial.schoology.com/home";
    }
});

/* =========================
   DRAG FROM DOCK
========================= */
document.querySelectorAll(".dock .app").forEach(app => {
    app.setAttribute("draggable", true);
});

document.addEventListener("dragstart", e => {
    const app = e.target.closest(".app");
    if (!app) return;

    e.dataTransfer.setData("name", app.dataset.name || "");
    e.dataTransfer.setData("icon", app.dataset.icon || app.style.backgroundImage || "");
    e.dataTransfer.setData("action", app.getAttribute("onclick") || "");
});

document.body.addEventListener("dragover", e => e.preventDefault());

document.body.addEventListener("drop", e => {
    e.preventDefault();

    const name = e.dataTransfer.getData("name");
    let icon = e.dataTransfer.getData("icon");
    const action = e.dataTransfer.getData("action");

    if (!name) return;

    if (icon && icon.startsWith("url(")) {
        icon = icon.slice(4, -1).replace(/"/g, "");
    }

    createDesktopIcon(name, icon, action, e.clientX, e.clientY);
});

/* =========================
   CREATE DESKTOP ICON
========================= */
function createDesktopIcon(name, icon, action, x, y) {
    const el = document.createElement("div");
    el.className = "desktop-icon";
    el.style.left = x + "px";
    el.style.top = y + "px";

    el.dataset.name = name;
    el.dataset.icon = icon;
    el.dataset.action = action;

    const iconDiv = document.createElement("div");
    iconDiv.className = "icon";
    setIconBackground(iconDiv, icon);

    const label = document.createElement("span");
    label.textContent = name;

    el.appendChild(iconDiv);
    el.appendChild(label);

let moved = false;

el.addEventListener("mousedown", () => {
    moved = false;
});

el.addEventListener("mousemove", () => {
    moved = true;
});

el.addEventListener("mouseup", () => {
    if (!moved && action) {
        eval(action);
    }
});
    document.body.appendChild(el);
    makeDraggable(el);
}

/* =========================
   SAFE ICON HANDLER
========================= */
function setIconBackground(el, icon) {
    if (!icon) return;

    if (icon.startsWith("url(")) {
        el.style.backgroundImage = icon;
    } else {
        el.style.backgroundImage = `url("${icon}")`;
    }

    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
}

/* =========================
   DRAG SYSTEM (STABLE + CLEAN)
========================= */
function makeDraggable(el) {

    if (
        el.classList.contains("library-app") ||
        el.classList.contains("settings-app") ||
        el.id === "settingsIcon"
    ) {
        el.style.pointerEvents = "auto";
        return;
    }

    let offsetX = 0;
    let offsetY = 0;

    const onMouseMove = (e) => {
        el.style.left = (e.clientX - offsetX) + "px";
        el.style.top = (e.clientY - offsetY) + "px";
    };

    const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        el.style.zIndex = 5;

        const dock = document.getElementById("dock");
        if (!dock) return;

        const d = dock.getBoundingClientRect();
        const r = el.getBoundingClientRect();

        const inDock =
            r.left < d.right &&
            r.right > d.left &&
            r.top < d.bottom &&
            r.bottom > d.top;

        if (inDock) {
            el.remove();
        }
    };

    el.addEventListener("mousedown", (e) => {
        e.preventDefault();

        offsetX = e.clientX - el.offsetLeft;
        offsetY = e.clientY - el.offsetTop;

        el.style.zIndex = 9999;

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });
}
/* =========================
   TAB CLOAKING SYSTEM
========================= */

const cloakData = {
    default: {
        title: "Sunset OS",
        icon: "https://cdn-icons-png.flaticon.com/512/25/25694.png"
    },
    google: {
        title: "Google Drive",
        icon: "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png"
    },
    gmail: {
        title: "Gmail",
        icon: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico"
    },
    schoology: {
        title: "Schoology",
        icon: "https://asset-cdn.schoology.com/sites/all/themes/schoology_theme/favicon.ico"
    },
    roblox: {
        title: "Roblox",
        icon: "https://images.rbxcdn.com/076b45a8c5c2b7a1a8fbbd9d7c3c0a66.png"
    }
};

function setCloak(mode) {
    const data = cloakData[mode];
    if (!data) return;

    // Change tab title
    document.title = data.title;

    // Change favicon
    let icon = document.querySelector("link[rel='icon']");
    if (!icon) {
        icon = document.createElement("link");
        icon.rel = "icon";
        document.head.appendChild(icon);
    }
    icon.href = data.icon;
}

/* Optional: default cloak on load */
setCloak("default");
/* =========================
   APP LIBRARY SEARCH FIX
========================= */

function searchApps() {
    const input = document.getElementById("searchApps");
    const filter = input.value.toLowerCase();

    const apps = document.querySelectorAll(".library-item");

    apps.forEach(app => {
        const name = (app.getAttribute("data-name") || "").toLowerCase();

        if (name.includes(filter)) {
            app.style.display = "block";
        } else {
            app.style.display = "none";
        }
    });
}
