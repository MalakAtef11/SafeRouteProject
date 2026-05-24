let map;
let marker;
let selectedLatitude = null;
let selectedLongitude = null;

function initMap() {
  const defaultLocation = { lat: 31.9539, lng: 35.9106 };

  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultLocation,
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });

  marker = new google.maps.Marker({
    position: defaultLocation,
    map: map,
    title: "موقعك الحالي",
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

const typeButtons = document.querySelectorAll(".type-btn");
const textField = document.getElementById("textField");
const imageField = document.getElementById("imageField");
const audioField = document.getElementById("audioField");

typeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    typeButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const selectedType = button.getAttribute("data-type");

    textField.classList.remove("active-section");
    imageField.classList.remove("active-section");
    audioField.classList.remove("active-section");

    if (selectedType === "text") {
      textField.classList.add("active-section");
    } else if (selectedType === "image") {
      imageField.classList.add("active-section");
    } else if (selectedType === "audio") {
      audioField.classList.add("active-section");
    }
  });
});

const getLocationBtn = document.getElementById("getLocationBtn");
const locationInput = document.getElementById("location");

if (getLocationBtn && locationInput) {
  getLocationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    locationInput.value = "جاري تحديد الموقع...";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        selectedLatitude = latitude;
        selectedLongitude = longitude;

        locationInput.value = `Latitude: ${latitude.toFixed(5)} , Longitude: ${longitude.toFixed(5)}`;

        const userLocation = { lat: latitude, lng: longitude };

        if (map && marker) {
          map.setCenter(userLocation);
          map.setZoom(16);
          marker.setPosition(userLocation);
        }
      },
      () => {
        locationInput.value = "";
        alert("تعذر الحصول على الموقع الحالي");
      }
    );
  });
}

/* Image handling */
const cameraCapture = document.getElementById("cameraCapture");
const imageUpload = document.getElementById("imageUpload");
const imageFileName = document.getElementById("imageFileName");

if (cameraCapture && imageFileName) {
  cameraCapture.addEventListener("change", () => {
    if (cameraCapture.files.length > 0) {
      imageFileName.textContent = `تم اختيار صورة من الكاميرا: ${cameraCapture.files[0].name}`;
    }
  });
}

if (imageUpload && imageFileName) {
  imageUpload.addEventListener("change", () => {
    if (imageUpload.files.length > 0) {
      imageFileName.textContent = `تم رفع صورة من الجهاز: ${imageUpload.files[0].name}`;
    }
  });
}

/* Audio recording */
let mediaRecorder;
let audioChunks = [];
let recordedAudioBlob = null;

const startRecordBtn = document.getElementById("startRecordBtn");
const stopRecordBtn = document.getElementById("stopRecordBtn");
const recordingStatus = document.getElementById("recordingStatus");
const audioPreview = document.getElementById("audioPreview");

if (startRecordBtn && stopRecordBtn && recordingStatus && audioPreview) {
  startRecordBtn.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        recordedAudioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const audioURL = URL.createObjectURL(recordedAudioBlob);

        audioPreview.src = audioURL;
        audioPreview.style.display = "block";
        recordingStatus.textContent = "تم تسجيل الصوت بنجاح";
      };

      mediaRecorder.start();
      recordingStatus.textContent = "جاري التسجيل...";
      startRecordBtn.disabled = true;
      stopRecordBtn.disabled = false;
    } catch (error) {
      alert("تعذر الوصول إلى الميكروفون");
    }
  });

  stopRecordBtn.addEventListener("click", () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      startRecordBtn.disabled = false;
      stopRecordBtn.disabled = true;
    }
  });
}

/* بيانات افتراضية إذا localStorage فاضي */
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
    sector: "البلدية",
    location: "عمان - الدوار الثالث",
    description: "يوجد حفرة كبيرة في الشارع الرئيسي بالقرب من الدوار الثالث.",
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
    sector: "إدارة السير",
    location: "إربد - شارع الجامعة",
    description: "الإشارة الضوئية لا تعمل.",
    latitude: 32.5569,
    longitude: 35.8479,
    image: "https://via.placeholder.com/600x300?text=Traffic+Signal"
  }
];

function getAllReports() {
  const savedReports = localStorage.getItem("dashboardReports");
  if (savedReports) {
    return JSON.parse(savedReports);
  }

  localStorage.setItem("dashboardReports", JSON.stringify(defaultReports));
  return defaultReports;
}

function saveAllReports(reports) {
  localStorage.setItem("dashboardReports", JSON.stringify(reports));
}

/* AI mock لتحديد القطاع */
function detectSector(description) {
  const text = description.toLowerCase();

  if (
    text.includes("حفرة") ||
    text.includes("شارع") ||
    text.includes("رصيف") ||
    text.includes("حاوية")
  ) {
    return "البلدية";
  }

  if (
    text.includes("إشارة") ||
    text.includes("مرور") ||
    text.includes("دوار") ||
    text.includes("حاجز")
  ) {
    return "إدارة السير";
  }

  if (
    text.includes("إنارة") ||
    text.includes("كهرباء") ||
    text.includes("عامود") ||
    text.includes("لمبة")
  ) {
    return "الكهرباء";
  }

  if (
    text.includes("مياه") ||
    text.includes("تسرب") ||
    text.includes("صرف") ||
    text.includes("منهل")
  ) {
    return "المياه";
  }

  return "البلدية";
}

function detectCityFromLocation(locationText) {
  if (locationText.includes("31.") || locationText.includes("35.")) {
    return "عمان";
  }
  return "غير محدد";
}

const reportForm = document.getElementById("reportForm");

if (reportForm) {
  reportForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const activeType = document.querySelector(".type-btn.active").getAttribute("data-type");
    const description = document.getElementById("description").value.trim();
    const location = locationInput.value;

    if (!location) {
      alert("يرجى تحديد الموقع أولاً");
      return;
    }

    if (activeType === "text" && !description) {
      alert("يرجى كتابة وصف البلاغ");
      return;
    }

    if (
      activeType === "image" &&
      cameraCapture.files.length === 0 &&
      imageUpload.files.length === 0
    ) {
      alert("يرجى التقاط صورة أو رفع صورة");
      return;
    }

    if (activeType === "audio" && !recordedAudioBlob) {
      alert("يرجى تسجيل صوت أولاً");
      return;
    }

    const reports = getAllReports();
    const maxId = reports.length ? Math.max(...reports.map((r) => r.id)) : 100;
    const newId = maxId + 1;

    const finalDescription =
      activeType === "text"
        ? description
        : activeType === "image"
        ? "تم إرسال بلاغ يحتوي على صورة"
        : "تم إرسال بلاغ يحتوي على تسجيل صوتي";

    const detectedSector = detectSector(finalDescription);
    const detectedCity = detectCityFromLocation(location);

    const today = new Date();
    const formattedDate = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;

    const newReport = {
      id: newId,
      title: finalDescription.length > 20 ? finalDescription.substring(0, 20) + "..." : finalDescription,
      city: detectedCity,
      type: activeType === "text" ? "نص" : activeType === "image" ? "صورة" : "صوت",
      priority: "متوسطة",
      priorityClass: "priority-medium",
      status: "new",
      statusLabel: "جديد",
      statusClass: "status-new",
      assignedTo: "غير مسند",
      note: "لا توجد",
      date: formattedDate,
      sector: detectedSector,
      location: location,
      locationText: location,
      description: finalDescription,
      latitude: selectedLatitude || 31.9539,
      longitude: selectedLongitude || 35.9106,
      lat: selectedLatitude || 31.9539,
      lng: selectedLongitude || 35.9106,
      image: "https://via.placeholder.com/600x300?text=New+Report"
    };

    reports.push(newReport);
    saveAllReports(reports);

    alert("تم إرسال البلاغ بنجاح وإضافته إلى النظام");

    reportForm.reset();
    locationInput.value = "";
    imageFileName.textContent = "";
    recordingStatus.textContent = "لم يتم تسجيل أي صوت بعد";
    audioPreview.style.display = "none";
    audioPreview.src = "";
    recordedAudioBlob = null;
    selectedLatitude = null;
    selectedLongitude = null;

    typeButtons.forEach((btn) => btn.classList.remove("active"));
    typeButtons[0].classList.add("active");

    textField.classList.add("active-section");
    imageField.classList.remove("active-section");
    audioField.classList.remove("active-section");

    startRecordBtn.disabled = false;
    stopRecordBtn.disabled = true;

    window.location.href = "../MyReports/MyReports.html";
  });
}