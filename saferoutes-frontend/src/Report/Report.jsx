import { useEffect, useRef, useState } from "react";
import logo from "../Login-Register/logo.png";
import NotificationBell from "../components/NotificationBell";
import "./report.css";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = "http://localhost:5029/api";

const MicIco = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;
const CamIco = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;
const MapPinIco = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;

const translations = {
  ar: {
    home: "الرئيسية",
    reports: "البلاغات",
    reportNow: "أبلغ الآن",
    myReports: "بلاغاتي",
    profile: "ملفي",
    dashboard: "لوحة التحكم",
    analytics: "الإحصائيات",
    logout: "خروج",
    logoutMenu: "تسجيل الخروج",
    title: "أبلغ عن خطر",
    aiLabel: "SAFEROUTE AI",
    placeholder: "صف المشكلة هنا... وسيقوم الذكاء الاصطناعي بتصنيفها وتوجيهها تلقائياً",
    imgTooltip: "إرفاق صورة",
    micTooltip: "تسجيل صوتي",
    locTooltip: "تحديد موقعي",
    waitingLoc: "بانتظار تحديد الموقع على الخريطة...",
    submitBtn: "إرسال البلاغ الآن",
    submitting: "جاري المعالجة والتحليل...",
    micErr: "يرجى تفعيل المايكروفون",
    audioSuccess: "تم تسجيل الصوت",
    imgSuccess: "تم رفع الصورة",
    locReq: "حدد الموقع على الخريطة أولاً",
    mediaReq: "أضف وصفاً أو صورة أو تسجيلاً للبلاغ",
    locSuccess: "تم تحديد موقعك 📍",
    submitSuccess: "تم إرسال البلاغ بنجاح ✅",
    submitFail: "فشل الإرسال",
    serverErr: "حدث خطأ أثناء الإرسال للسيرفر المحلي",
    footerProj: "مشروع تخرج — جامعة الزيتونة الأردنية",
    footerCopy: "© 2026 جميع الحقوق محفوظة لنظام SafeRoute"
  },
  en: {
    home: "Home",
    reports: "Reports",
    reportNow: "Report Now",
    myReports: "My Reports",
    profile: "Profile",
    dashboard: "Dashboard",
    analytics: "Analytics",
    logout: "Logout",
    logoutMenu: "Log Out",
    title: "Report an Issue",
    aiLabel: "SAFEROUTE AI",
    placeholder: "Describe the issue here... AI will categorize and route it automatically",
    imgTooltip: "Attach Image",
    micTooltip: "Voice Record",
    locTooltip: "Locate Me",
    waitingLoc: "Waiting for location on map...",
    submitBtn: "Submit Report Now",
    submitting: "Processing and Analyzing...",
    micErr: "Please enable your microphone",
    audioSuccess: "Audio recorded",
    imgSuccess: "Image uploaded",
    locReq: "Select a location on the map first",
    mediaReq: "Add a description, image, or recording",
    locSuccess: "Location detected 📍",
    submitSuccess: "Report submitted successfully ✅",
    submitFail: "Submission failed",
    serverErr: "An error occurred while submitting to local server",
    footerProj: "Graduation Project — Al-Zaytoonah University of Jordan",
    footerCopy: "© 2026 All Rights Reserved for SafeRoute System"
  }
};

function Report() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [recording, setRecording] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPos, setSelectedPos] = useState(null);
  const [city, setCity] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [lang, setLang] = useState(localStorage.getItem('lang') || "ar");

  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markerRef = useRef(null);
  const uploadRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const infoWindowRef = useRef(null);

  const userId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType");

  const t = translations[lang];

  useEffect(() => {
    if (!userId) { window.location.href = "/login"; return; }
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    loadGoogleScript();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (dark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [dark, lang]);

  const loadGoogleScript = () => {
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    if (document.getElementById("google-maps-api-script")) {
      const script = document.getElementById("google-maps-api-script");
      script.addEventListener("load", initMap);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-api-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA_S3MTRppCFOzOxG8YprXrUl6sKzPROZY&language=${lang}`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.body.appendChild(script);
  };

  const initMap = () => {
    if (!mapRef.current || !window.google) return;
    const defaultPos = { lat: 31.9539, lng: 35.9106 };
    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultPos, zoom: 14, disableDefaultUI: false, zoomControl: true, streetViewControl: false, mapTypeControl: false, fullscreenControl: true, gestureHandling: 'greedy',
      styles: dark ? [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
      ] : [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
    });
    markerRef.current = new window.google.maps.Marker({
      position: defaultPos, map: googleMapRef.current, draggable: true,
    });

    infoWindowRef.current = new window.google.maps.InfoWindow();

    const geocoder = new window.google.maps.Geocoder();

    const updateLoc = (pos) => {
      const latLng = { lat: pos.lat(), lng: pos.lng() };
      setSelectedPos(latLng);
      geocoder.geocode({ location: latLng }, (res, status) => {
        if (status === "OK" && res[0]) {
          const address = res[0].formatted_address;
          setLocationName(address);

          let extractedCity = "";
          const cityComponent = res[0].address_components.find(c => c.types.includes("locality") || c.types.includes("administrative_area_level_1") || c.types.includes("administrative_area_level_2"));
          if (cityComponent) extractedCity = cityComponent.long_name;
          setCity(extractedCity);

          infoWindowRef.current.setContent(`<div style="color: #1e293b; font-weight: bold; font-family: 'Tajawal', sans-serif; font-size: 14px; text-align: center; padding: 5px;">${address}</div>`);
          infoWindowRef.current.open(googleMapRef.current, markerRef.current);
        } else {
          infoWindowRef.current.close();
        }
      });
    };

    markerRef.current.addListener("dragend", () => updateLoc(markerRef.current.getPosition()));
    googleMapRef.current.addListener("click", (e) => {
      markerRef.current.setPosition(e.latLng); updateLoc(e.latLng);
    });
  };

  // Update map style when theme changes
  useEffect(() => {
    if (googleMapRef.current && window.google) {
      googleMapRef.current.setOptions({
        styles: dark ? [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
        ] : [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
      });
    }
  }, [dark]);

  const toggleRecording = async () => {
    if (recording) { mediaRecorderRef.current.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setRecording(false);
        toast.success(t.audioSuccess);
      };
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch { toast.error(t.micErr); }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) { setImagePreview(URL.createObjectURL(file)); toast.success(t.imgSuccess); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPos) return toast.error(t.locReq);

    if (!description && !recordedAudioBlob && !uploadRef.current?.files[0]) {
      return toast.error(t.mediaReq);
    }

    setSubmitting(true);
    const loader = toast.loading(t.submitting);

    try {
      const formData = new FormData();
      formData.append("citizenUserID", userId);

      // هاد النص رح يروح للـ AI عشان يحلله
      const finalDescription = description.trim() ||
        (recordedAudioBlob ? (lang === "ar" ? "بلاغ صوتي" : "Voice Report") :
          (lang === "ar" ? "بلاغ مصور" : "Image Report"));

      formData.append("Description", finalDescription);
      formData.append("Latitude", selectedPos.lat);
      formData.append("Longitude", selectedPos.lng);

      // إرسال العنوان الكامل
      formData.append("AddressText", locationName || (lang === "ar" ? "موقع محدد" : "Marked location"));

      // 🔥 أهم سطر: تأكدي إن 'city' عم تنبعث صح من المتغير اللي عندك
      // إذا المتغير اسمه 'city' تمام، إذا لأ استخدمي الجزء اللي فيه المحافظة من 'locationName'
      if (city) {
        formData.append("city", city);
      } else if (locationName) {
        formData.append("city", locationName); // الـ AI شاطر ورح يعرف يطول 'عجلون' من العنوان
      }

      // المرفقات بأسمائها الصح في كودك
      if (recordedAudioBlob) formData.append("audio", recordedAudioBlob, "audio.webm");
      if (uploadRef.current?.files[0]) formData.append("image", uploadRef.current.files[0]);

      // الرابط الصاروخي اللي حل مشكلة الـ URI
      // في سطر 288، احذفي كل شي واكتبي هيك:
const myManualUrl = "http://localhost:5029/api/v1/AI/submit-report";
console.log("🔗 Testing URL before fetch:", myManualUrl);

const res = await fetch(myManualUrl, { 
    method: "POST", 
    body: formData 
});

      if (res.ok) {
        toast.dismiss(loader);
        toast.success(t.submitSuccess);
        setTimeout(() => window.location.href = "/my-reports", 1500);
      } else {
        const errorData = await res.text();
        throw new Error(errorData || t.submitFail);
      }
    } catch (err) {
      toast.dismiss(loader);
      // 🔥 نصيحة: اطبعي الـ err كامل بالـ console عشان لو صار فشل تعرفي ليش
      console.error("Full Error Details:", err);
      toast.error(t.serverErr);
    } finally {
      setSubmitting(false);
    }
  };

  const navLinks = userType === "Sector"
    ? [{ href: "/sector-dashboard", label: t.dashboard }, { href: "/analytics", label: t.analytics }]
    : [{ href: "/reports", label: t.reports }, { href: "/report", label: t.reportNow }, { href: "/my-reports", label: t.myReports }, { href: "/profile", label: t.profile }];

  const currentPath = window.location.pathname;
  const goTo = (p) => { window.location.href = p; };
  const handleLogout = () => { localStorage.clear(); goTo("/"); };

  return (
    <div className="report-now-container" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Toaster position="top-center" />

      {/* ── HEADER ── */}
      <header className={`sr-header ${scrolled ? "scrolled" : ""}`}>
        <a className="sr-logo" onClick={() => goTo("/")} style={{ cursor: 'pointer' }}>
          <img src={logo} alt="SafeRoute" className="sr-logo-img" />
          <span className="sr-logo-text">Safe<span>Route</span></span>
        </a>
        <nav className="sr-nav">
          <a href="/" onClick={(e) => { e.preventDefault(); goTo("/"); }}>{t.home}</a>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className={currentPath === l.href ? "active" : ""} onClick={(e) => { e.preventDefault(); goTo(l.href); }}>{l.label}</a>
          ))}
        </nav>
        <div className="sr-header-right">
          <button onClick={() => setDark(!dark)} className="theme-btn"><span className="dot"></span></button>
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">{lang === "ar" ? "EN" : "AR"}</button>
          <div className="sr-bell-box"><NotificationBell userId={userId} /></div>
          {userId && <button className="sr-btn-logout" onClick={handleLogout}>{t.logout}</button>}
          <button className="sr-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="sr-ham-line" /><div className="sr-ham-line" /><div className="sr-ham-line" />
          </button>
        </div>
      </header>

      {/* ── MOBILE NAV ── */}
      <nav className={`sr-mobile-nav ${menuOpen ? "open" : ""}`}>
        <div className="mobile-options-row">
          <button onClick={() => setDark(!dark)} className="theme-btn"><span className="dot"></span></button>
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">{lang === "ar" ? "EN" : "AR"}</button>
        </div>
        <a href="/" onClick={(e) => { e.preventDefault(); goTo("/"); }}>{t.home}</a>
        {navLinks.map(l => <a key={l.href} href={l.href} onClick={(e) => { e.preventDefault(); goTo(l.href); }}>{l.label}</a>)}
        {userId && <button className="sr-btn-logout" style={{ width: '100%', padding: '15px' }} onClick={handleLogout}>{t.logoutMenu}</button>}
      </nav>

      <div className="map-full-bg"><div id="map" ref={mapRef}></div></div>

      <div className="details-scroll-layer interaction-overlay">
        <main className="form-right-stack right-side-stack">
          <div className="notch-card-v2 chic-input-card">
            <div className="notch-label-side">{t.aiLabel}</div>
            <h1 className="title-h1 console-h1">{t.title}</h1>
            <textarea className="ai-textarea" rows="4" placeholder={t.placeholder} value={description} onChange={(e) => setDescription(e.target.value)} />

            {(imagePreview || audioUrl) && (
              <div className="live-preview-box">
                {imagePreview && <img src={imagePreview} style={{ width: '100%', display: 'block' }} alt="Preview" />}
                {audioUrl && <audio src={audioUrl} controls style={{ width: '100%', padding: 10 }} />}
              </div>
            )}

            <div className="media-whatsapp-bar">
              <button type="button" className="tool-icon-btn" onClick={() => uploadRef.current.click()} title={t.imgTooltip}>
                <CamIco />
                <input type="file" ref={uploadRef} hidden accept="image/*" onChange={handleImage} />
              </button>
              <button type="button" className={`tool-icon-btn ${recording ? 'active' : ''}`} onClick={toggleRecording} title={t.micTooltip}><MicIco /></button>
              <button type="button" className="tool-icon-btn" title={t.locTooltip} onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    googleMapRef.current.setCenter(coords);
                    markerRef.current.setPosition(coords);
                    setSelectedPos(coords);
                    new window.google.maps.Geocoder().geocode({ location: coords }, (res) => {
                      if (res && res[0]) {
                        const address = res[0].formatted_address;
                        setLocationName(address);

                        let extractedCity = "";
                        const cityComponent = res[0].address_components.find(c => c.types.includes("locality") || c.types.includes("administrative_area_level_1") || c.types.includes("administrative_area_level_2"));
                        if (cityComponent) extractedCity = cityComponent.long_name;
                        setCity(extractedCity);

                        if (infoWindowRef.current) {
                          infoWindowRef.current.setContent(`<div style="color: #1e293b; font-weight: bold; font-family: 'Tajawal', sans-serif; font-size: 14px; text-align: center; padding: 5px;">${address}</div>`);
                          infoWindowRef.current.open(googleMapRef.current, markerRef.current);
                        }
                      }
                    });
                    toast.success(t.locSuccess);
                  });
                }
              }}><MapPinIco /></button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginTop: 15, fontWeight: 700 }}>
              📍 {locationName || t.waitingLoc}
            </p>

            <button className="btn-modern-main btn-submit-final" onClick={handleSubmit} disabled={submitting} style={{ marginTop: 30 }}>
              {submitting ? t.submitting : t.submitBtn}
            </button>
          </div>
        </main>
      </div>

      <footer className="sr-footer">
        <a className="sr-logo" onClick={() => goTo("/")} style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <img src={logo} alt="SafeRoute" className="sr-logo-img" />
          <span className="sr-logo-text">Safe<span>Route</span></span>
        </a>
        <div style={{ textAlign: lang === "ar" ? "right" : "left" }}>
          <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{t.footerProj}</p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Developed by <strong>Malak Atef</strong></p>
        </div>
        <div className="sr-footer-copy">{t.footerCopy}</div>
      </footer>
    </div>
  );
}

export default Report;