const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("show");
    menuToggle.innerHTML = navMenu.classList.contains("show") ? "✕" : "☰";
  });
}

const birthDateInput = document.getElementById("birthDate");
const ageInput = document.getElementById("age");
const cancelBtn = document.getElementById("cancelBtn");
const editProfileForm = document.getElementById("editProfileForm");

if (birthDateInput && ageInput) {
  birthDateInput.addEventListener("change", () => {
    const birthDate = new Date(birthDateInput.value);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    ageInput.value = age > 0 ? `${age} سنة` : "";
  });
}

if (editProfileForm) {
  editProfileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("تم حفظ التعديلات بنجاح");
  });
}

if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    window.location.href = "Profile.html";
  });
}