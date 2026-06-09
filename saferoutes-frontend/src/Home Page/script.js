const reports = [
  {
    type: "حفرة",
    location: "قرب الدوار الثالث - عمان",
    status: "قيد المعالجة"
  },
  {
    type: "إشارة تالفة",
    location: "شارع الجامعة - إربد",
    status: "تم الاستلام"
  },
  {
    type: "إنارة ضعيفة",
    location: "الزرقاء الجديدة",
    status: "تم الحل"
  }
];

const reportsList = document.getElementById("reportsList");

reports.forEach(report => {
  const item = document.createElement("div");
  item.classList.add("report-item");

  item.innerHTML = `
    <h4>${report.type}</h4>
    <p>الموقع: ${report.location}</p>
    <p>الحالة: ${report.status}</p>
  `;

  reportsList.appendChild(item);
});

document.getElementById("reportBtn").addEventListener("click", () => {
  alert("الانتقال إلى صفحة أبلغ الآن");
});

document.getElementById("loginBtn").addEventListener("click", () => {
  alert("الانتقال إلى صفحة تسجيل الدخول");
});
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("show");

  if (navMenu.classList.contains("show")) {
    menuToggle.innerHTML = "✕";
  } else {
    menuToggle.innerHTML = "☰";
  }
});