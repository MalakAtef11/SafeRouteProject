let map;
let marker;

const urlParams = new URLSearchParams(window.location.search);
const reportId = Number(urlParams.get("id"));
const fromPage = urlParams.get("from");

if (fromPage === "dashboard") {
  const userType = localStorage.getItem("userType");
  const sectorName = localStorage.getItem("sectorName");

  if (userType !== "sector" || !sectorName) {
    window.location.href = "../Login-Register/Login.html";
  }
}

const defaultReports = [
  {
    id: 101,
    title: "حفرة في الشارع",
    city: "عمان",
    type: "نص",
    priority: "عالية",
    priorityClass: "priority-high",
    status: "new",
    statusLabel: "جديد",
    statusClass: "status-new",
    assignedTo: "غير مسند",
    note: "لا توجد",
    date: "2026/04/02",
    location: "عمان - الدوار الثالث",
    sector: "البلدية",
    description: "يوجد حفرة كبيرة في الشارع الرئيسي بالقرب من الدوار الثالث، وتسبب خطرًا على السيارات خاصة أثناء الليل.",
    latitude: 31.9539,
    longitude: 35.9106,
    image: "https://via.placeholder.com/600x300?text=Report+Image"
  },
  {
    id: 102,
    title: "إشارة مرور معطلة",
    city: "إربد",
    type: "صورة",
    priority: "متوسطة",
    priorityClass: "priority-medium",
    status: "review",
    statusLabel: "قيد المراجعة",
    statusClass: "status-review",
    assignedTo: "فني إشارات",
    note: "بانتظار فحص ميداني",
    date: "2026/03/30",
    location: "إربد - شارع الجامعة",
    sector: "إدارة السير",
    description: "الإشارة الضوئية لا تعمل منذ يومين مما يسبب ازدحامًا وخطورة على السائقين والمشاة.",
    latitude: 32.5569,
    longitude: 35.8479,
    image: "https://via.placeholder.com/600x300?text=Traffic+Signal"
  },
  {
    id: 103,
    title: "عامود إنارة مائل",
    city: "الزرقاء",
    type: "صوت",
    priority: "عالية",
    priorityClass: "priority-high",
    status: "processing",
    statusLabel: "قيد المعالجة",
    statusClass: "status-processing",
    assignedTo: "فريق الصيانة 1",
    note: "تم إرسال فريق كشف",
    date: "2026/03/28",
    location: "الزرقاء الجديدة",
    sector: "الكهرباء",
    description: "يوجد عامود إنارة مائل بشكل واضح وقد يسبب خطرًا على المارة والسيارات.",
    latitude: 32.0728,
    longitude: 36.0880,
    image: "https://via.placeholder.com/600x300?text=Lighting+Pole"
  },
  {
    id: 104,
    title: "تسرب مياه",
    city: "عمان",
    type: "صورة",
    priority: "منخفضة",
    priorityClass: "priority-low",
    status: "resolved",
    statusLabel: "تم الحل",
    statusClass: "status-resolved",
    assignedTo: "مشرف ميداني",
    note: "أُغلق البلاغ بعد الإصلاح",
    date: "2026/03/20",
    location: "عمان",
    sector: "المياه",
    description: "يوجد تسرب مياه ظاهر بالقرب من الشارع ويحتاج إلى تدخل.",
    latitude: 31.95,
    longitude: 35.91,
    image: "https://via.placeholder.com/600x300?text=Water+Leak"
  },
  {
    id: 105,
    title: "بلاغ غير واضح",
    city: "العقبة",
    type: "نص",
    priority: "منخفضة",
    priorityClass: "priority-low",
    status: "rejected",
    statusLabel: "مرفوض",
    statusClass: "status-rejected",
    assignedTo: "غير مسند",
    note: "المشكلة ليست ضمن اختصاصنا",
    date: "2026/03/18",
    location: "العقبة",
    sector: "إدارة السير",
    description: "البلاغ غير مكتمل ولا يحتوي على تفاصيل كافية.",
    latitude: 29.5319,
    longitude: 35.0061,
    image: "https://via.placeholder.com/600x300?text=Barrier"
  }
];

function getReports() {
  const savedReports = localStorage.getItem("dashboardReports");
  if (savedReports) {
    return JSON.parse(savedReports);
  } else {
    localStorage.setItem("dashboardReports", JSON.stringify(defaultReports));
    return defaultReports;
  }
}

function saveReports(reports) {
  localStorage.setItem("dashboardReports", JSON.stringify(reports));
}

let reports = getReports();
let currentReport = reports.find((report) => report.id === reportId) || reports[0];

/* عناصر تفاصيل البلاغ */
const reportTitle = document.getElementById("reportTitle");
const reportIdText = document.getElementById("reportIdText");
const reportStatus = document.getElementById("reportStatus");
const reportType = document.getElementById("reportType");
const reportDate = document.getElementById("reportDate");
const reportLocation = document.getElementById("reportLocation");
const reportSector = document.getElementById("reportSector");
const reportDescription = document.getElementById("reportDescription");
const reportImage = document.getElementById("reportImage");

function renderReportDetails() {
  reports = getReports();
  currentReport = reports.find((report) => report.id === reportId) || reports[0];

  reportTitle.textContent = currentReport.title;
  reportIdText.textContent = `رقم البلاغ: #${currentReport.id}`;
  reportStatus.textContent = currentReport.statusLabel;
  reportStatus.className = `status ${currentReport.statusClass}`;
  reportType.textContent = currentReport.type;
  reportDate.textContent = currentReport.date;
  reportLocation.textContent = currentReport.location;
  reportSector.textContent = currentReport.sector;
  reportDescription.textContent = currentReport.description;
  reportImage.src = currentReport.image;

  const assignedResult = document.getElementById("assignedResult");
  if (assignedResult) {
    assignedResult.textContent =
      currentReport.assignedTo && currentReport.assignedTo !== "غير مسند"
        ? `تم إسناد البلاغ إلى: ${currentReport.assignedTo}`
        : "لم يتم إسناد هذا البلاغ بعد.";
  }

  const notesList = document.getElementById("notesList");
  if (notesList) {
    notesList.innerHTML = "";

    if (currentReport.note && currentReport.note !== "لا توجد") {
      const noteItem = document.createElement("div");
      noteItem.classList.add("note-item");
      noteItem.textContent = currentReport.note;
      notesList.appendChild(noteItem);
    } else {
      const emptyNote = document.createElement("div");
      emptyNote.classList.add("note-item");
      emptyNote.textContent = "لا توجد ملاحظات داخلية حتى الآن.";
      notesList.appendChild(emptyNote);
    }
  }
}

renderReportDetails();

/* الخريطة */
function initMap() {
  const reportLocationMap = {
    lat: currentReport.latitude,
    lng: currentReport.longitude
  };

  map = new google.maps.Map(document.getElementById("map"), {
    center: reportLocationMap,
    zoom: 15,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });

  marker = new google.maps.Marker({
    position: reportLocationMap,
    map: map,
    title: "موقع البلاغ",
  });
}

/* المنيو */
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("show");
    menuToggle.innerHTML = navMenu.classList.contains("show") ? "✕" : "☰";
  });
}

/* تغيير منيو الصفحة إذا جاي من الداشبورد */
const sectorName = localStorage.getItem("sectorName") || "القطاع";

const detailsLogoSubtitle = document.getElementById("detailsLogoSubtitle");
const navLink1 = document.getElementById("navLink1");
const navLink2 = document.getElementById("navLink2");
const navLink3 = document.getElementById("navLink3");
const navLink4 = document.getElementById("navLink4");
const navLink5 = document.getElementById("navLink5");
const navLink6 = document.getElementById("navLink6");

if (fromPage === "dashboard") {
  if (detailsLogoSubtitle) {
    detailsLogoSubtitle.textContent = `لوحة ${sectorName}`;
  }

  if (navLink1) {
    navLink1.textContent = "لوحة التحكم";
    navLink1.href = "../SectorDashboard/SectorDashboard.html";
    navLink1.style.display = "inline-block";
  }

  if (navLink2) {
    navLink2.textContent = "الإحصائيات";
    navLink2.href = "../AnalyticsDashboard/AnalyticsDashboard.html";
    navLink2.style.display = "inline-block";
  }

  if (navLink3) {
    navLink3.textContent = "تسجيل الخروج";
    navLink3.href = "../Login-Register/Login.html";
    navLink3.style.display = "inline-block";
  }

  if (navLink4) navLink4.style.display = "none";
  if (navLink5) navLink5.style.display = "none";
  if (navLink6) navLink6.style.display = "none";
}

/* زر الرجوع */
const backButton = document.getElementById("backBtn");

if (backButton) {
  backButton.addEventListener("click", () => {
    if (fromPage === "myreports") {
      window.location.href = "../MyReports/MyReports.html";
    } else if (fromPage === "reports") {
      window.location.href = "../Reports/Reports.html";
    } else if (fromPage === "dashboard") {
      window.location.href = "../SectorDashboard/SectorDashboard.html";
    } else {
      window.history.back();
    }
  });
}

/* Sections dashboard only */
const adminActions = document.getElementById("adminActions");
const assignmentSection = document.getElementById("assignmentSection");
const notesSection = document.getElementById("notesSection");

if (fromPage === "dashboard") {
  if (adminActions) adminActions.style.display = "block";
  if (assignmentSection) assignmentSection.style.display = "block";
  if (notesSection) notesSection.style.display = "block";
}

/* تحديث حالة البلاغ */
function updateCurrentReport(data) {
  reports = getReports().map((report) => {
    if (report.id === currentReport.id) {
      return { ...report, ...data };
    }
    return report;
  });

  saveReports(reports);
  renderReportDetails();
}

/* أزرار الإدارة */
const approveBtn = document.getElementById("approveBtn");
const reviewBtn = document.getElementById("reviewBtn");
const rejectBtn = document.getElementById("rejectBtn");
const resolveBtn = document.getElementById("resolveBtn");

if (approveBtn) {
  approveBtn.addEventListener("click", () => {
    updateCurrentReport({
      status: "review",
      statusLabel: "تمت الموافقة",
      statusClass: "status-review"
    });
    alert("تمت الموافقة على البلاغ");
  });
}

if (reviewBtn) {
  reviewBtn.addEventListener("click", () => {
    updateCurrentReport({
      status: "review",
      statusLabel: "قيد المراجعة",
      statusClass: "status-review"
    });
    alert("تم تحديث البلاغ إلى: قيد المراجعة");
  });
}

if (rejectBtn) {
  rejectBtn.addEventListener("click", () => {
    updateCurrentReport({
      status: "rejected",
      statusLabel: "مرفوض",
      statusClass: "status-rejected"
    });
    alert("تم رفض البلاغ");
  });
}

if (resolveBtn) {
  resolveBtn.addEventListener("click", () => {
    updateCurrentReport({
      status: "resolved",
      statusLabel: "تم الحل",
      statusClass: "status-resolved"
    });
    alert("تم تحديث البلاغ إلى: تم الحل");
  });
}

/* إسناد البلاغ */
const assignToSelect = document.getElementById("assignToSelect");
const assignBtn = document.getElementById("assignBtn");

if (assignBtn && assignToSelect) {
  assignBtn.addEventListener("click", () => {
    const selectedValue = assignToSelect.value;

    if (!selectedValue) {
      alert("يرجى اختيار الموظف أو الفريق أولًا");
      return;
    }

    updateCurrentReport({
      assignedTo: selectedValue
    });

    alert(`تم إسناد البلاغ إلى: ${selectedValue}`);
  });
}

/* الملاحظات الداخلية */
const internalNoteInput = document.getElementById("internalNoteInput");
const addNoteBtn = document.getElementById("addNoteBtn");

if (addNoteBtn && internalNoteInput) {
  addNoteBtn.addEventListener("click", () => {
    const noteText = internalNoteInput.value.trim();

    if (!noteText) {
      alert("يرجى كتابة ملاحظة أولًا");
      return;
    }

    updateCurrentReport({
      note: noteText
    });

    internalNoteInput.value = "";
    alert("تمت إضافة الملاحظة الداخلية");
  });
}