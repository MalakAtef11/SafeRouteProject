const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("show");
    menuToggle.innerHTML = navMenu.classList.contains("show") ? "✕" : "☰";
  });
}

const editProfileBtn = document.getElementById("editProfileBtn");
const logoutBtn = document.getElementById("logoutBtn");

if (editProfileBtn) {
  editProfileBtn.addEventListener("click", () => {
    window.location.href = "EditProfile.html";
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    alert("تسجيل الخروج سيتم ربطه بالـ backend لاحقًا");
  });
}