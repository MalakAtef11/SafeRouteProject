let map;
let markers = [];

const defaultReports = [
  {
    id: 101,
    title: "حفرة في الشارع",
    city: "عمان",
    locationText: "عمان - الدوار الثالث",
    status: "new",
    statusLabel: "جديد",
    statusClass: "status-new",
    type: "نص",
    date: "2026/04/02",
    lat: 31.9539,
    lng: 35.9106,
    sector: "البلدية"
  },
  {
    id: 102,
    title: "إشارة مرور معطلة",
    city: "إربد",
    locationText: "إربد - شارع الجامعة",
    status: "review",
    statusLabel: "قيد المراجعة",
    statusClass: "status-review",
    type: "صورة",
    date: "2026/03/30",
    lat: 32.5569,
    lng: 35.8479,
    sector: "إدارة السير"
  },
  {
    id: 103,
    title: "عامود إنارة مائل",
    city: "الزرقاء",
    locationText: "الزرقاء الجديدة",
    status: "processing",
    statusLabel: "قيد المعالجة",
    statusClass: "status-processing",
    type: "صوت",
    date: "2026/03/28",
    lat: 32.0728,
    lng: 36.0880,
    sector: "الكهرباء"
  },
  {
    id: 104,
    title: "تسرب مياه",
    city: "عمان",
    locationText: "عمان",
    status: "resolved",
    statusLabel: "تم الحل",
    statusClass: "status-resolved",
    type: "صورة",
    date: "2026/03/20",
    lat: 31.95,
    lng: 35.91,
    sector: "المياه"
  },
  {
    id: 105,
    title: "بلاغ غير واضح",
    city: "العقبة",
    locationText: "العقبة",
    status: "rejected",
    statusLabel: "مرفوض",
    statusClass: "status-rejected",
    type: "نص",
    date: "2026/03/18",
    lat: 29.5319,
    lng: 35.0061,
    sector: "إدارة السير"
  },
  {
    id: 106,
    title: "تسرب من خط مياه",
    city: "الزرقاء",
    locationText: "الزرقاء",
    status: "new",
    statusLabel: "جديد",
    statusClass: "status-new",
    type: "صورة",
    date: "2026/04/04",
    lat: 32.0728,
    lng: 36.0880,
    sector: "المياه"
  },
  {
    id: 107,
    title: "إنارة شارع لا تعمل",
    city: "عمان",
    locationText: "عمان",
    status: "processing",
    statusLabel: "قيد المعالجة",
    statusClass: "status-processing",
    type: "نص",
    date: "2026/04/01",
    lat: 31.9632,
    lng: 35.9304,
    sector: "الكهرباء"
  },
  {
    id: 108,
    title: "دوار يحتاج إعادة تنظيم",
    city: "إربد",
    locationText: "إربد",
    status: "review",
    statusLabel: "قيد المراجعة",
    statusClass: "status-review",
    type: "نص",
    date: "2026/04/03",
    lat: 32.5556,
    lng: 35.8500,
    sector: "إدارة السير"
  }
];

function getReports() {
  const savedReports = localStorage.getItem("dashboardReports");

  if (!savedReports) {
    localStorage.setItem("dashboardReports", JSON.stringify(defaultReports));
    return defaultReports;
  }

  const parsedReports = JSON.parse(savedReports);
  const hasInvalidData = parsedReports.some((report) => !report.sector);

  if (hasInvalidData) {
    localStorage.setItem("dashboardReports", JSON.stringify(defaultReports));
    return defaultReports;
  }

  return parsedReports;
}

let reportsData = getReports();

function initMap() {
  const centerLocation = { lat: 31.9539, lng: 35.9106 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: centerLocation,
    zoom: 8,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });

  renderMarkers(reportsData);
}

function renderMarkers(data) {
  if (!map) return;

  markers.forEach((marker) => marker.setMap(null));
  markers = [];

  data.forEach((report) => {
    const marker = new google.maps.Marker({
      position: { lat: report.lat, lng: report.lng },
      map,
      title: report.title,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="font-family: Arial; direction: rtl;"><strong>${report.title}</strong><br>${report.locationText}<br>${report.statusLabel}</div>`,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    markers.push(marker);
  });
}

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("show");
    menuToggle.innerHTML = navMenu.classList.contains("show") ? "✕" : "☰";
  });
}

const reportsList = document.getElementById("reportsList");
const reportsCount = document.getElementById("reportsCount");

function renderReportsList(filter = "all", customData = null) {
  reportsData = getReports();

  let sourceData = customData || reportsData;

  const filteredReports =
    filter === "all"
      ? sourceData
      : sourceData.filter((report) => report.status === filter);

  reportsList.innerHTML = "";
  reportsCount.textContent = `${filteredReports.length} بلاغات`;

  if (filteredReports.length === 0) {
    reportsList.innerHTML = `
      <div class="report-card">
        <div class="report-card-top">
          <div>
            <h4>لا توجد نتائج</h4>
            <p>لم يتم العثور على بلاغات مطابقة.</p>
          </div>
        </div>
      </div>
    `;
    renderMarkers([]);
    return;
  }

  filteredReports.forEach((report) => {
    const card = document.createElement("div");
    card.className = "report-card";
    card.setAttribute("data-status", report.status);

    card.innerHTML = `
      <div class="report-card-top">
        <div>
          <h4>${report.title}</h4>
          <p>${report.locationText}</p>
        </div>
        <span class="status ${report.statusClass}">${report.statusLabel}</span>
      </div>

      <div class="report-meta">
        <span>النوع: ${report.type}</span>
        <span>التاريخ: ${report.date}</span>
        <span>القطاع: ${report.sector}</span>
      </div>

      <button class="details-btn" data-id="${report.id}">عرض التفاصيل</button>
    `;

    reportsList.appendChild(card);
  });

  bindDetailsButtons();
  renderMarkers(filteredReports);
}

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const filter = button.getAttribute("data-filter");
    renderReportsList(filter);
  });
});

function bindDetailsButtons() {
  const detailsButtons = document.querySelectorAll(".details-btn");

  detailsButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const reportId = button.getAttribute("data-id");
      window.location.href = `../ReportDetails/ReportDetails.html?id=${reportId}&from=reports`;
    });
  });
}

const myLocationBtn = document.getElementById("myLocationBtn");

if (myLocationBtn) {
  myLocationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (map) {
          map.setCenter(userLocation);
          map.setZoom(15);

          new google.maps.Marker({
            position: userLocation,
            map,
            title: "موقعك الحالي",
          });
        }
      },
      () => {
        alert("تعذر الحصول على موقعك الحالي");
      }
    );
  });
}

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

if (searchBtn && searchInput) {
  searchBtn.addEventListener("click", () => {
    const value = searchInput.value.trim();

    if (!value) {
      alert("اكتب اسم موقع أو مدينة للبحث");
      return;
    }

    const matchedReports = getReports().filter((report) =>
      report.city.includes(value) ||
      report.locationText.includes(value) ||
      report.title.includes(value)
    );

    filterButtons.forEach((btn) => btn.classList.remove("active"));
    renderReportsList("all", matchedReports);
  });
}

renderReportsList();