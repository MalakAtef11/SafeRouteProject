import { useState, useEffect } from "react";
import logo from "../Login-Register/logo.png";
import "./admindashboard.css";
import {
  getAdminStats,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  getAdminReports,
  deleteAdminReport,
  getAdminSectors,
  createAdminSector,
  updateAdminSector,
  deleteAdminSector,
  createAdminUser,
  getAdminPrompt,
  saveAdminPrompt
} from "../api/adminApi";

// SVGs
const StatsIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ReportsIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const SectorsIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const AIIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a8 8 0 0 0-8 8c0 1.5.4 3 1.2 4.3L4 19l4.7-1.2A8 8 0 1 0 12 2z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [userSearch, setUserSearch] = useState("");
  const [userFilterType, setUserFilterType] = useState("All");
  const [reportSearch, setReportSearch] = useState("");
  const [reportFilterStatus, setReportFilterStatus] = useState("All");

  // Modals state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserCreateMode, setIsUserCreateMode] = useState(false);
  const [sectorModalOpen, setSectorModalOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState(null);

  // AI Prompt State
  const [promptText, setPromptText] = useState("");
  const [savingPrompt, setSavingPrompt] = useState(false);

  // Themes & Lang
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ar');

  const loggedInUserId = localStorage.getItem("userId");
  const userType = localStorage.getItem("userType");

  useEffect(() => {
    // التحقق من صلاحيات المدير
    if (userType !== "Admin") {
      window.location.href = "/login";
      return;
    }
    fetchData();
  }, [userType]);

  useEffect(() => {
    if (dark) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [dark, lang]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const statsRes = await getAdminStats();
      setStats(statsRes);

      const usersRes = await getAdminUsers();
      setUsers(usersRes);

      const reportsRes = await getAdminReports();
      setReports(reportsRes);

      const sectorsRes = await getAdminSectors();
      setSectors(sectorsRes);

      const promptRes = await getAdminPrompt();
      setPromptText(promptRes.prompt);
    } catch (err) {
      setError(lang === "ar" ? "فشل تحميل البيانات" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // User Save/Edit
  const handleEditUserClick = (user) => {
    setSelectedUser({
      ...user,
      birthDate: user.birthDate ? user.birthDate.split("T")[0] : ""
    });
    setIsUserCreateMode(false);
    setUserModalOpen(true);
  };

  const handleAddUserClick = () => {
    setSelectedUser({
      fullName: "",
      email: "",
      passwordHash: "",
      birthDate: "",
      gender: "",
      userType: "Citizen",
      sectorId: null,
      isActive: true,
      isEmailVerified: true,
      role: ""
    });
    setIsUserCreateMode(true);
    setUserModalOpen(true);
  };

  const handleUserSave = async (e) => {
    e.preventDefault();
    try {
      if (isUserCreateMode) {
        const data = { ...selectedUser };
        if (!data.sectorId || data.userType !== "Sector") data.sectorId = null;
        await createAdminUser(data);
      } else {
        const { userId, ...data } = selectedUser;
        if (!data.sectorId || data.userType !== "Sector") data.sectorId = null;
        await updateAdminUser(userId, data);
      }
      setUserModalOpen(false);
      fetchData();
    } catch (err) {
      alert(lang === "ar" ? "خطأ في حفظ المستخدم" : "Error saving user");
    }
  };

  const handleSavePrompt = async (e) => {
    e.preventDefault();
    setSavingPrompt(true);
    try {
      await saveAdminPrompt(promptText);
      alert(lang === "ar" ? "تم حفظ برومبت الـ AI بنجاح!" : "AI prompt saved successfully!");
    } catch (err) {
      alert(lang === "ar" ? "فشل حفظ البرومبت" : "Failed to save prompt");
    } finally {
      setSavingPrompt(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmMsg = lang === "ar" 
      ? "هل أنت متأكد من حذف هذا المستخدم نهائياً؟ سيتم حذف جميع بلاغاته ونشاطاته أيضاً!" 
      : "Are you sure you want to delete this user permanently? All their reports and activities will be deleted too!";
    if (window.confirm(confirmMsg)) {
      try {
        await deleteAdminUser(userId);
        fetchData();
      } catch (err) {
        alert(lang === "ar" ? "فشل حذف المستخدم" : "Failed to delete user");
      }
    }
  };

  // Report Deletion
  const handleDeleteReport = async (reportId) => {
    const confirmMsg = lang === "ar" 
      ? "هل أنت متأكد من حذف هذا البلاغ نهائياً؟" 
      : "Are you sure you want to delete this report permanently?";
    if (window.confirm(confirmMsg)) {
      try {
        await deleteAdminReport(reportId);
        fetchData();
      } catch (err) {
        alert(lang === "ar" ? "فشل حذف البلاغ" : "Failed to delete report");
      }
    }
  };

  // Sector Create/Edit/Delete
  const handleEditSectorClick = (sector) => {
    setSelectedSector(sector);
    setSectorModalOpen(true);
  };

  const handleAddSectorClick = () => {
    setSelectedSector({ sectorName: "", description: "", isActive: true });
    setSectorModalOpen(true);
  };

  const handleSectorSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedSector.sectorID) {
        await updateAdminSector(selectedSector.sectorID, selectedSector);
      } else {
        await createAdminSector(selectedSector);
      }
      setSectorModalOpen(false);
      fetchData();
    } catch (err) {
      alert(lang === "ar" ? "خطأ في حفظ القطاع" : "Error saving sector");
    }
  };

  const handleDeleteSector = async (sectorId) => {
    const confirmMsg = lang === "ar" 
      ? "هل أنت متأكد من حذف هذا القطاع؟ سيتم تحويل الموظفين التابعين له لقطاع غير محدد." 
      : "Are you sure you want to delete this sector? Employees will be set to undefined sector.";
    if (window.confirm(confirmMsg)) {
      try {
        await deleteAdminSector(sectorId);
        fetchData();
      } catch (err) {
        alert(lang === "ar" ? "فشل حذف القطاع" : "Failed to delete sector");
      }
    }
  };

  // Filters
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesType = userFilterType === "All" || u.userType === userFilterType;
    return matchesSearch && matchesType;
  });

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(reportSearch.toLowerCase()) || 
                          r.citizenName.toLowerCase().includes(reportSearch.toLowerCase());
    const matchesStatus = reportFilterStatus === "All" || r.statusCode === reportFilterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <p>{lang === "ar" ? "جاري تحميل لوحة التحكم..." : "Loading dashboard..."}</p>
      </div>
    );
  }

  return (
    <div className="admin-wrapper" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="admin-header">
        <div className="admin-logo">
          <img src={logo} alt="SafeRoute Logo" className="admin-logo-img" />
          <span className="admin-logo-text">Safe<span>Route</span> <small className="admin-badge">SuperAdmin</small></span>
        </div>
        <div className="admin-header-actions">
          <button onClick={() => setDark(!dark)} className="theme-btn">
            <span className="dot"></span>
          </button>
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="lang-btn">
            {lang === "ar" ? "EN" : "AR"}
          </button>
          <button className="admin-btn-logout" onClick={handleLogout}>
            {lang === "ar" ? "تسجيل الخروج" : "Logout"}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="admin-body">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <button 
            className={`sidebar-link ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <StatsIcon />
            <span>{lang === "ar" ? "نظرة عامة" : "Overview"}</span>
          </button>
          <button 
            className={`sidebar-link ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <UsersIcon />
            <span>{lang === "ar" ? "إدارة المستخدمين" : "Users Management"}</span>
          </button>
          <button 
            className={`sidebar-link ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <ReportsIcon />
            <span>{lang === "ar" ? "إدارة البلاغات" : "Reports Management"}</span>
          </button>
          <button 
            className={`sidebar-link ${activeTab === "sectors" ? "active" : ""}`}
            onClick={() => setActiveTab("sectors")}
          >
            <SectorsIcon />
            <span>{lang === "ar" ? "إدارة القطاعات" : "Sectors Management"}</span>
          </button>
          <button 
            className={`sidebar-link ${activeTab === "prompt" ? "active" : ""}`}
            onClick={() => setActiveTab("prompt")}
          >
            <AIIcon />
            <span>{lang === "ar" ? "تعليمات الـ AI" : "AI Prompt Settings"}</span>
          </button>
        </aside>

        {/* Content */}
        <main className="admin-content">
          {error && <div className="admin-error-box">{error}</div>}

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && stats && (
            <div className="tab-pane animate-fade">
              <h2 className="tab-title">{lang === "ar" ? "الإحصائيات العامة" : "General Statistics"}</h2>
              
              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">{lang === "ar" ? "إجمالي المستخدمين" : "Total Users"}</span>
                  <strong className="stat-value">{stats.users.total}</strong>
                  <div className="stat-detail">
                    <span>{lang === "ar" ? "مواطنين:" : "Citizens:"} {stats.users.citizens}</span>
                    <span>{lang === "ar" ? "موظفين:" : "Employees:"} {stats.users.employees}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-label">{lang === "ar" ? "إجمالي البلاغات" : "Total Reports"}</span>
                  <strong className="stat-value">{stats.reports.total}</strong>
                  <div className="stat-detail">
                    <span>{lang === "ar" ? "جديد:" : "New:"} {stats.reports["new"]}</span>
                    <span>{lang === "ar" ? "قيد المعالجة:" : "Processing:"} {stats.reports.processing}</span>
                    <span>{lang === "ar" ? "مكتمل:" : "Resolved:"} {stats.reports.resolved}</span>
                  </div>
                </div>

                <div className="stat-card">
                  <span className="stat-label">{lang === "ar" ? "القطاعات المفعلة" : "Active Sectors"}</span>
                  <strong className="stat-value">{stats.sectors.total}</strong>
                  <span className="stat-footer">{lang === "ar" ? "جميع قطاعات الخدمة" : "All service sectors"}</span>
                </div>
              </div>

              {/* Server Info or Fast Actions */}
              <div className="admin-fast-actions card-glass">
                <h3>{lang === "ar" ? "لوحة تحكم النظام الفائقة" : "System Control Panel"}</h3>
                <p>{lang === "ar" ? "مرحباً بك في لوحة تحكم SuperAdmin. يمكنك إدارة الحسابات، البلاغات والجهات الخدمية بالكامل." : "Welcome to SuperAdmin Dashboard. You have complete authorization over accounts, reports and sectors."}</p>
                <div className="actions-row">
                  <button className="btn-action-primary" onClick={() => setActiveTab("users")}>
                    <UsersIcon /> {lang === "ar" ? "عرض الحسابات" : "View Accounts"}
                  </button>
                  <button className="btn-action-primary" onClick={() => setActiveTab("reports")}>
                    <ReportsIcon /> {lang === "ar" ? "عرض البلاغات" : "View Reports"}
                  </button>
                  <button className="btn-action-primary" onClick={handleAddSectorClick}>
                    <PlusIcon /> {lang === "ar" ? "إضافة قطاع جديد" : "Add Sector"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === "users" && (
            <div className="tab-pane animate-fade">
              <div className="tab-header-row">
                <h2 className="tab-title">{lang === "ar" ? "إدارة المستخدمين" : "Users Management"}</h2>
                
                <div className="filter-controls">
                  <button className="btn-action-primary" onClick={handleAddUserClick}>
                    <PlusIcon /> {lang === "ar" ? "إضافة مستخدم جديد" : "Add New User"}
                  </button>
                  <input 
                    type="text" 
                    placeholder={lang === "ar" ? "بحث بالاسم أو الإيميل..." : "Search name or email..."}
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="admin-search-input"
                  />
                  <select 
                    value={userFilterType} 
                    onChange={(e) => setUserFilterType(e.target.value)}
                    className="admin-select"
                  >
                    <option value="All">{lang === "ar" ? "كل الأنواع" : "All Types"}</option>
                    <option value="Citizen">{lang === "ar" ? "مواطن" : "Citizen"}</option>
                    <option value="Sector">{lang === "ar" ? "موظف قطاع" : "Sector Employee"}</option>
                    <option value="Admin">{lang === "ar" ? "مدير" : "Admin"}</option>
                  </select>
                </div>
              </div>

              <div className="card-glass table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{lang === "ar" ? "الاسم" : "Name"}</th>
                      <th>{lang === "ar" ? "البريد الإلكتروني" : "Email"}</th>
                      <th>{lang === "ar" ? "النوع" : "Type"}</th>
                      <th>{lang === "ar" ? "القطاع" : "Sector"}</th>
                      <th>{lang === "ar" ? "الحالة" : "Status"}</th>
                      <th>{lang === "ar" ? "تأكيد الإيميل" : "Email Verified"}</th>
                      <th>{lang === "ar" ? "تاريخ التسجيل" : "Created At"}</th>
                      <th>{lang === "ar" ? "إجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.userId}>
                        <td><strong>{u.fullName}</strong></td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge-type type-${u.userType.toLowerCase()}`}>
                            {u.userType === "Admin" ? (lang === "ar" ? "مدير" : "Admin") : 
                             u.userType === "Sector" ? (lang === "ar" ? "موظف" : "Sector") : 
                             (lang === "ar" ? "مواطن" : "Citizen")}
                          </span>
                        </td>
                        <td>{u.sectorName || "-"}</td>
                        <td>
                          <span className={`status-dot ${u.isActive ? "active" : "inactive"}`} />
                          {u.isActive ? (lang === "ar" ? "نشط" : "Active") : (lang === "ar" ? "معطل" : "Disabled")}
                        </td>
                        <td>
                          <span className={`verify-badge ${u.isEmailVerified ? "verified" : "unverified"}`}>
                            {u.isEmailVerified ? (lang === "ar" ? "مؤكد" : "Verified") : (lang === "ar" ? "معلق" : "Pending")}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="table-actions">
                            <button className="btn-icon edit" onClick={() => handleEditUserClick(u)}>
                              <EditIcon />
                            </button>
                            {/* لا تدع المدير يحذف نفسه */}
                            {String(u.userId) !== String(loggedInUserId) && (
                              <button className="btn-icon delete" onClick={() => handleDeleteUser(u.userId)}>
                                <TrashIcon />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === "reports" && (
            <div className="tab-pane animate-fade">
              <div className="tab-header-row">
                <h2 className="tab-title">{lang === "ar" ? "إدارة البلاغات" : "Reports Management"}</h2>
                
                <div className="filter-controls">
                  <input 
                    type="text" 
                    placeholder={lang === "ar" ? "بحث بالعنوان أو اسم المواطن..." : "Search title or citizen..."}
                    value={reportSearch}
                    onChange={(e) => setReportSearch(e.target.value)}
                    className="admin-search-input"
                  />
                  <select 
                    value={reportFilterStatus} 
                    onChange={(e) => setReportFilterStatus(e.target.value)}
                    className="admin-select"
                  >
                    <option value="All">{lang === "ar" ? "كل الحالات" : "All Statuses"}</option>
                    <option value="New">{lang === "ar" ? "تم الاستلام" : "New"}</option>
                    <option value="Processing">{lang === "ar" ? "قيد المعالجة" : "Processing"}</option>
                    <option value="Resolved">{lang === "ar" ? "محلولة" : "Resolved"}</option>
                    <option value="Rejected">{lang === "ar" ? "مرفوضة" : "Rejected"}</option>
                  </select>
                </div>
              </div>

              <div className="card-glass table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{lang === "ar" ? "رقم البلاغ" : "ID"}</th>
                      <th>{lang === "ar" ? "العنوان" : "Title"}</th>
                      <th>{lang === "ar" ? "المواطن" : "Citizen"}</th>
                      <th>{lang === "ar" ? "المدينة / الموقع" : "City / Location"}</th>
                      <th>{lang === "ar" ? "الحالة" : "Status"}</th>
                      <th>{lang === "ar" ? "الأهمية" : "Priority"}</th>
                      <th>{lang === "ar" ? "الجهات المختصة" : "Sectors"}</th>
                      <th>{lang === "ar" ? "تاريخ التقديم" : "Submitted At"}</th>
                      <th>{lang === "ar" ? "إجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map(r => (
                      <tr key={r.reportId}>
                        <td><strong>#{r.reportId}</strong></td>
                        <td>{r.title}</td>
                        <td>{r.citizenName}</td>
                        <td>{r.city || "-"} / {r.addressText || "-"}</td>
                        <td>
                          <span className={`status-indicator-badge status-${r.statusCode.toLowerCase()}`}>
                            {r.statusName}
                          </span>
                        </td>
                        <td>
                          <span className={`priority-badge priority-${r.priorityName.toLowerCase() === "high" || r.priorityName === "عالي" ? "high" : "medium"}`}>
                            {r.priorityName}
                          </span>
                        </td>
                        <td>
                          <div className="sectors-list-tags">
                            {r.sectors.map(s => (
                              <span key={s.id} className="sector-tag-mini">{s.name}</span>
                            ))}
                            {r.sectors.length === 0 && "-"}
                          </div>
                        </td>
                        <td>{new Date(r.submittedAt).toLocaleDateString()}</td>
                        <td>
                          <button className="btn-icon delete" onClick={() => handleDeleteReport(r.reportId)}>
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTORS TAB */}
          {activeTab === "sectors" && (
            <div className="tab-pane animate-fade">
              <div className="tab-header-row">
                <h2 className="tab-title">{lang === "ar" ? "إدارة القطاعات الخدمية" : "Sectors Management"}</h2>
                <button className="btn-main-chic" onClick={handleAddSectorClick}>
                  <PlusIcon /> {lang === "ar" ? "إضافة قطاع جديد" : "Add Sector"}
                </button>
              </div>

              <div className="card-glass table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{lang === "ar" ? "رقم القطاع" : "ID"}</th>
                      <th>{lang === "ar" ? "اسم القطاع" : "Name"}</th>
                      <th>{lang === "ar" ? "الوصف" : "Description"}</th>
                      <th>{lang === "ar" ? "الحالة" : "Status"}</th>
                      <th>{lang === "ar" ? "إجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectors.map(s => (
                      <tr key={s.sectorID}>
                        <td><strong>#{s.sectorID}</strong></td>
                        <td><strong>{s.sectorName}</strong></td>
                        <td>{s.description || "-"}</td>
                        <td>
                          <span className={`status-dot ${s.isActive ? "active" : "inactive"}`} />
                          {s.isActive ? (lang === "ar" ? "نشط" : "Active") : (lang === "ar" ? "معطل" : "Disabled")}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="btn-icon edit" onClick={() => handleEditSectorClick(s)}>
                              <EditIcon />
                            </button>
                            <button className="btn-icon delete" onClick={() => handleDeleteSector(s.sectorID)}>
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI PROMPT TAB */}
          {activeTab === "prompt" && (
            <div className="tab-pane animate-fade">
              <h2 className="tab-title">{lang === "ar" ? "تعليمات محرك الذكاء الاصطناعي (AI System Prompt)" : "AI Engine System Instructions"}</h2>
              
              <div className="card-glass p-6">
                <form onSubmit={handleSavePrompt} className="prompt-form">
                  <p className="form-description" style={{ marginBottom: "15px", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                    {lang === "ar" 
                      ? "هنا يمكنك تعديل التعليمات الأساسية التي يعتمد عليها الـ AI لتصنيف البلاغات، تحديد درجة خطورتها وتوجيهها للبلدية أو قطاع الطوارئ المناسب."
                      : "Here you can customize the system instructions used by the AI to analyze, classify, prioritize, and route reports to the appropriate sector or municipality."}
                  </p>
                  
                  <div className="form-group">
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>{lang === "ar" ? "التعليمات البرمجية للـ AI" : "AI System Instructions Prompt"}</label>
                    <textarea 
                      value={promptText} 
                      onChange={(e) => setPromptText(e.target.value)}
                      rows={20}
                      className="admin-textarea"
                      style={{ 
                        width: "100%", 
                        padding: "12px", 
                        borderRadius: "8px", 
                        backgroundColor: "rgba(255,255,255,0.05)", 
                        border: "1px solid rgba(255,255,255,0.1)", 
                        color: "var(--text-color)", 
                        fontFamily: "monospace", 
                        fontSize: "0.9rem",
                        lineHeight: "1.5",
                        resize: "vertical" 
                      }}
                      placeholder={lang === "ar" ? "أدخل تعليمات الـ System Prompt..." : "Enter system prompt instructions..."}
                      required
                    />
                  </div>

                  <div className="modal-actions" style={{ marginTop: "15px" }}>
                    <button type="submit" className="btn-action-primary" disabled={savingPrompt}>
                      {savingPrompt 
                        ? (lang === "ar" ? "جاري الحفظ..." : "Saving...") 
                        : (lang === "ar" ? "حفظ التعديلات" : "Save Prompt")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* USER EDIT MODAL */}
      {userModalOpen && selectedUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal card-glass animate-pop">
            <div className="modal-header">
              <h3>{isUserCreateMode ? (lang === "ar" ? "إضافة مستخدم جديد" : "Create New User") : (lang === "ar" ? "تعديل حساب المستخدم" : "Edit User Account")}</h3>
              <button className="btn-close" onClick={() => setUserModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleUserSave}>
              <div className="form-group">
                <label>{lang === "ar" ? "الاسم الكامل" : "Full Name"}</label>
                <input 
                  type="text" 
                  value={selectedUser.fullName}
                  onChange={(e) => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>{lang === "ar" ? "البريد الإلكتروني" : "Email"}</label>
                <input 
                  type="email" 
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  required
                />
              </div>

              {isUserCreateMode && (
                <div className="form-group">
                  <label>{lang === "ar" ? "كلمة المرور" : "Password"}</label>
                  <input 
                    type="password" 
                    value={selectedUser.passwordHash || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, passwordHash: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>{lang === "ar" ? "الجنس" : "Gender"}</label>
                  <select 
                    value={selectedUser.gender || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, gender: e.target.value })}
                  >
                    <option value="">{lang === "ar" ? "غير محدد" : "Not Specified"}</option>
                    <option value="أنثى">{lang === "ar" ? "أنثى" : "Female"}</option>
                    <option value="ذكر">{lang === "ar" ? "ذكر" : "Male"}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{lang === "ar" ? "تاريخ الميلاد" : "Birth Date"}</label>
                  <input 
                    type="date" 
                    value={selectedUser.birthDate || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, birthDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{lang === "ar" ? "نوع المستخدم" : "User Type"}</label>
                  <select 
                    value={selectedUser.userType}
                    onChange={(e) => setSelectedUser({ ...selectedUser, userType: e.target.value })}
                    required
                  >
                    <option value="Citizen">{lang === "ar" ? "مواطن" : "Citizen"}</option>
                    <option value="Sector">{lang === "ar" ? "موظف قطاع" : "Sector Employee"}</option>
                    <option value="Admin">{lang === "ar" ? "مدير" : "Admin"}</option>
                  </select>
                </div>

                {selectedUser.userType === "Sector" && (
                  <div className="form-group">
                    <label>{lang === "ar" ? "القطاع التابع له" : "Belongs to Sector"}</label>
                    <select 
                      value={selectedUser.sectorId || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, sectorId: e.target.value ? Number(e.target.value) : null })}
                      required={selectedUser.userType === "Sector"}
                    >
                      <option value="">{lang === "ar" ? "اختر القطاع" : "Select Sector"}</option>
                      {sectors.map(s => (
                        <option key={s.sectorID} value={s.sectorID}>{s.sectorName}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="form-row checkbox-row">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={selectedUser.isActive}
                    onChange={(e) => setSelectedUser({ ...selectedUser, isActive: e.target.checked })}
                  />
                  <span>{lang === "ar" ? "الحساب نشط ومفعّل" : "Account Active"}</span>
                </label>

                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={selectedUser.isEmailVerified}
                    onChange={(e) => setSelectedUser({ ...selectedUser, isEmailVerified: e.target.checked })}
                  />
                  <span>{lang === "ar" ? "البريد الإلكتروني مؤكد" : "Email Verified"}</span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setUserModalOpen(false)}>
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button type="submit" className="btn-main-chic">
                  {isUserCreateMode 
                    ? (lang === "ar" ? "إنشاء الحساب" : "Create Account") 
                    : (lang === "ar" ? "حفظ التعديلات" : "Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTOR EDIT/CREATE MODAL */}
      {sectorModalOpen && selectedSector && (
        <div className="admin-modal-overlay">
          <div className="admin-modal card-glass animate-pop">
            <div className="modal-header">
              <h3>
                {selectedSector.sectorID 
                  ? (lang === "ar" ? "تعديل القطاع الخدمي" : "Edit Service Sector") 
                  : (lang === "ar" ? "إضافة قطاع خدمي جديد" : "Add New Service Sector")}
              </h3>
              <button className="btn-close" onClick={() => setSectorModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSectorSave}>
              <div className="form-group">
                <label>{lang === "ar" ? "اسم القطاع" : "Sector Name"}</label>
                <input 
                  type="text" 
                  value={selectedSector.sectorName}
                  onChange={(e) => setSelectedSector({ ...selectedSector, sectorName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>{lang === "ar" ? "الوصف" : "Description"}</label>
                <textarea 
                  value={selectedSector.description || ""}
                  onChange={(e) => setSelectedSector({ ...selectedSector, description: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group checkbox-row">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={selectedSector.isActive}
                    onChange={(e) => setSelectedSector({ ...selectedSector, isActive: e.target.checked })}
                  />
                  <span>{lang === "ar" ? "القطاع نشط" : "Sector Active"}</span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-ghost" onClick={() => setSectorModalOpen(false)}>
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button type="submit" className="btn-main-chic">
                  {lang === "ar" ? "حفظ" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
