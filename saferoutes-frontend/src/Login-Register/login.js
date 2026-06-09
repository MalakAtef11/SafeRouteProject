const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

/* Tabs Switch */
if (loginTab && registerTab && loginForm && registerForm) {
  loginTab.addEventListener("click", () => {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.classList.add("active-form");
    registerForm.classList.remove("active-form");
  });

  registerTab.addEventListener("click", () => {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm.classList.add("active-form");
    loginForm.classList.remove("active-form");
  });
}

/* Menu Toggle */
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("show");
    menuToggle.innerHTML = navMenu.classList.contains("show") ? "✕" : "☰";
  });
}

/* Login Logic */
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
      alert("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    /* Accounts */
    const sectorAccounts = {
      "municipality@safroute.com": "البلدية",
      "traffic@safroute.com": "إدارة السير",
      "electricity@safroute.com": "الكهرباء",
      "water@safroute.com": "المياه"
    };

    if (sectorAccounts[email] && password === "123456") {
      localStorage.setItem("userType", "sector");
      localStorage.setItem("sectorName", sectorAccounts[email]);
      window.location.href = "../SectorDashboard/SectorDashboard.html";
      return;
    }

    /* Normal User */
    localStorage.setItem("userType", "normal");
    localStorage.removeItem("sectorName");
    window.location.href = "../Home Page/Home.html";
  });
}

/* Register Logic */
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    alert("تم إنشاء الحساب بنجاح");

    localStorage.setItem("userType", "normal");
    localStorage.removeItem("sectorName");

    window.location.href = "../Home Page/Home.html";
  });
}