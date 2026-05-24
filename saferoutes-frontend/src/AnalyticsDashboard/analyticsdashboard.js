const userType = localStorage.getItem("userType");
const sectorName = localStorage.getItem("sectorName");

if (userType !== "sector" || !sectorName) {
  window.location.href = "../Login-Register/Login.html";
}

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const logoutLink = document.getElementById("logoutLink");

menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("show");
  menuToggle.innerHTML = navMenu.classList.contains("show") ? "✕" : "☰";
});

const analyticsSectorSubtitle = document.getElementById("analyticsSectorSubtitle");
const analyticsSectorTitle = document.getElementById("analyticsSectorTitle");

if (analyticsSectorSubtitle) {
  analyticsSectorSubtitle.textContent = `إحصائيات ${sectorName}`;
}

if (analyticsSectorTitle) {
  analyticsSectorTitle.textContent = `تحليل بلاغات ${sectorName}`;
}

logoutLink.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("sectorName");
  localStorage.removeItem("userType");
  window.location.href = "../Login-Register/Login.html";
});

function getReports() {
  const savedReports = localStorage.getItem("dashboardReports");
  const allReports = savedReports ? JSON.parse(savedReports) : [];
  return allReports.filter((report) => report.sector === sectorName);
}

function countBy(array, keyGetter) {
  const result = {};
  array.forEach((item) => {
    const key = keyGetter(item);
    result[key] = (result[key] || 0) + 1;
  });
  return result;
}

function renderBarChart(containerId, dataObject) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  const entries = Object.entries(dataObject);

  if (entries.length === 0) {
    container.innerHTML = `
      <div class="bar-item">
        <span>لا توجد بيانات</span>
        <div class="bar"><div class="fill" style="width: 0%"></div></div>
      </div>
    `;
    return;
  }

  const maxValue = Math.max(...entries.map(([, value]) => value));

  entries.forEach(([label, value]) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

    const item = document.createElement("div");
    item.className = "bar-item";
    item.innerHTML = `
      <span>${label} (${value})</span>
      <div class="bar">
        <div class="fill" style="width: ${percentage}%"></div>
      </div>
    `;

    container.appendChild(item);
  });
}

function renderList(containerId, items) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = "لا توجد بيانات";
    container.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    container.appendChild(li);
  });
}

function updateAnalytics() {
  const reports = getReports();

  const total = reports.length;
  const processingCount = reports.filter(
    (r) => r.status === "processing" || r.status === "review"
  ).length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;
  const rejectedCount = reports.filter((r) => r.status === "rejected").length;

  document.getElementById("analyticsTotalReports").textContent = total;
  document.getElementById("analyticsProcessingReports").textContent = processingCount;
  document.getElementById("analyticsResolvedReports").textContent = resolvedCount;
  document.getElementById("analyticsAvgProcessing").textContent =
    total > 0 ? "2.4 يوم" : "0";

  const solvedRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;
  const rejectedRate = total > 0 ? Math.round((rejectedCount / total) * 100) : 0;

  document.getElementById("performanceResponse").textContent =
    total > 0 ? "6 ساعات" : "0";
  document.getElementById("performanceClose").textContent =
    total > 0 ? "2.4 يوم" : "0";
  document.getElementById("performanceSolvedRate").textContent = `${solvedRate}%`;
  document.getElementById("performanceRejectedRate").textContent = `${rejectedRate}%`;

  const statusLabels = {
    new: "جديد",
    review: "قيد المراجعة",
    processing: "قيد المعالجة",
    resolved: "تم الحل",
    rejected: "مرفوض"
  };

  const statusCountsRaw = countBy(reports, (report) => statusLabels[report.status] || report.status);
  renderBarChart("statusChart", statusCountsRaw);

  const cityCounts = countBy(reports, (report) => report.city || "غير محدد");
  renderBarChart("cityChart", cityCounts);

  const typeCounts = countBy(reports, (report) => report.type || "غير محدد");
  renderBarChart("typeChart", typeCounts);

  const topAreas = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([city, count]) => `${city} - ${count} بلاغ`);

  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => `${type} - ${count} بلاغ`);

  renderList("topAreasList", topAreas);
  renderList("topTypesList", topTypes);
}

updateAnalytics();