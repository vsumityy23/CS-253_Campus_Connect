import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Calendar,
  Users,
  UploadCloud,
  Plus,
  Search,
  FileSpreadsheet,
  Trash2,
  ArrowLeft,
  UserPlus,
  GraduationCap,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  UserCog,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import DashboardLayout from "../layouts/dashboard_layout";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);
  const [courseForm, setCourseForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    daysOfWeek: [],
  });

  const [manualEmail, setManualEmail] = useState("");
  const [coInstructorEmail, setCoInstructorEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadSummary, setUploadSummary] = useState(null);
  const fileInputRef = useRef(null);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const showMessage = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/courses/managed`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      setCourses(data);
      if (selectedCourse)
        setSelectedCourse(data.find((c) => c._id === selectedCourse._id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (courseForm.daysOfWeek.length === 0)
      return showMessage("Select at least one day.", "error");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/courses`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(courseForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      showMessage("Course and sessions created!");
      setShowCreate(false);
      setCourseForm({ name: "", startDate: "", endDate: "", daysOfWeek: [] });
      fetchCourses();
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!manualEmail.endsWith("@iitk.ac.in"))
      return showMessage("Must be an IITK email", "error");
    try {
      const res = await fetch(
        `${API_BASE}/api/courses/${selectedCourse._id}/students/manual`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ email: manualEmail }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      showMessage("Student enrolled!");
      setManualEmail("");
      fetchCourses();
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadSummary(null);
    setShowSkipped(false);
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${API_BASE}/api/courses/${selectedCourse._id}/students/upload`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: formData,
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      setUploadSummary(data.summary);
      showMessage(`Processed: ${data.summary.added} added.`);
      fetchCourses();
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddCoInstructor = async (e) => {
    e.preventDefault();
    if (!coInstructorEmail.endsWith("@iitk.ac.in"))
      return showMessage("Must be an IITK email", "error");
    try {
      const res = await fetch(
        `${API_BASE}/api/courses/${selectedCourse._id}/co-instructors`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ email: coInstructorEmail }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      showMessage("Co-instructor added!");
      setCoInstructorEmail("");
      fetchCourses();
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this course and all its sessions?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/courses/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete");
      showMessage("Course deleted", "success");
      fetchCourses();
    } catch (err) {
      showMessage(err.message, "error");
    }
  };

  const filteredStudents =
    selectedCourse?.students?.filter((s) =>
      s.email.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-5rem)] font-sans relative">
        {toast && (
          <div
            className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-top-4 fade-in duration-300 ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}
          >
            {toast.type === "error" ? (
              <AlertCircle size={20} />
            ) : (
              <CheckCircle2 size={20} />
            )}
            <p className="text-sm font-bold">{toast.msg}</p>
          </div>
        )}

        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-in fade-in duration-500">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <BookOpen className="text-indigo-600" size={32} />
              Course Management
            </h1>
            <p className="text-slate-500 font-medium mt-1 ml-11">
              Create, configure, and manage your class rosters.
            </p>
          </div>
          {!selectedCourse && (
            <button
              onClick={() => setShowCreate(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 active:scale-95"
            >
              <Plus size={18} strokeWidth={3} /> New Course
            </button>
          )}
        </div>

        {!selectedCourse && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {courses.length === 0 && (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-slate-300">
                <BookOpen size={40} className="text-indigo-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-900">
                  No courses yet
                </h3>
                <button
                  onClick={() => setShowCreate(true)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold"
                >
                  Create First Course
                </button>
              </div>
            )}
            {courses.map((c) => (
              <div
                key={c._id}
                onClick={() => setSelectedCourse(c)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 cursor-pointer transition-all overflow-hidden group flex flex-col"
              >
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 w-full"></div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-extrabold text-slate-900 line-clamp-1">
                      {c.name}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(e, c._id)}
                      className="text-slate-300 hover:text-red-500 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="space-y-3 mt-auto">
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <Users size={16} /> {c.students.length} Enrolled Members
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <Calendar size={16} />{" "}
                      <span className="truncate">
                        {c.daysOfWeek.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center text-sm font-bold text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                  Manage Course{" "}
                  <ChevronRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCourse && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <button
              onClick={() => {
                setSelectedCourse(null);
                setUploadSummary(null);
              }}
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-6 group transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:border-indigo-200 shadow-sm">
                <ArrowLeft size={16} />
              </div>
              Back to all courses
            </button>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 flex flex-col lg:flex-row justify-between lg:items-center gap-4 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
                  {selectedCourse.name}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-indigo-500" />{" "}
                    {new Date(selectedCourse.startDate).toLocaleDateString()} —{" "}
                    {new Date(selectedCourse.endDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={16} className="text-emerald-500" />{" "}
                    {selectedCourse.students.length} Enrolled
                  </span>
                </div>
              </div>
              <div className="relative z-10 flex flex-wrap gap-2">
                {selectedCourse.daysOfWeek.map((d) => (
                  <span
                    key={d}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider"
                  >
                    {d.slice(0, 3)}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="space-y-6">
                {/* MANUAL ADD */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <UserPlus size={20} />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      Add Student
                    </h3>
                  </div>
                  <form onSubmit={handleManualAdd} className="space-y-3">
                    <input
                      type="email"
                      required
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      placeholder="student@iitk.ac.in"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-slate-700"
                    />
                    <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-colors shadow-md">
                      Enroll Student
                    </button>
                  </form>
                </div>

                {/* BULK UPLOAD */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                      <FileSpreadsheet size={20} />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      Bulk Upload
                    </h3>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleExcelUpload}
                    accept=".xlsx"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current.click()}
                    disabled={loading}
                    className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 p-6 rounded-xl font-bold flex flex-col items-center gap-3 transition-all group"
                  >
                    <UploadCloud
                      size={28}
                      className={
                        loading ? "animate-bounce text-emerald-500" : ""
                      }
                    />
                    {loading ? "Processing..." : "Select Excel File"}
                  </button>

                  {uploadSummary && (
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-in zoom-in-95">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black text-emerald-600 uppercase">
                          Success
                        </span>
                        <span className="font-bold text-slate-900">
                          {uploadSummary.added} Added
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-red-500 uppercase">
                          Skipped
                        </span>
                        <span className="font-bold text-slate-900">
                          {uploadSummary.skipped} Failed
                        </span>
                      </div>
                      {uploadSummary.skipped > 0 && (
                        <button
                          onClick={() => setShowSkipped(!showSkipped)}
                          className="mt-3 w-full py-2 bg-white rounded-lg text-xs text-indigo-600 font-bold flex items-center justify-center gap-1 border border-slate-100 shadow-sm"
                        >
                          {showSkipped ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}{" "}
                          View Error Report
                        </button>
                      )}
                      {showSkipped && (
                        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar bg-slate-50 p-2 rounded-xl border border-slate-200">
                          {uploadSummary.skippedEmails.map((item, idx) => {
                            // Robust data check: handles both strings and objects
                            const email =
                              typeof item === "object" ? item.email : item;
                            const reason =
                              typeof item === "object"
                                ? item.reason
                                : "Duplicate or Not Found";

                            return (
                              <div
                                key={idx}
                                className="bg-white p-3 rounded-xl border border-red-100 shadow-sm animate-in slide-in-from-top-2"
                              >
                                {/* We use text-slate-900 to FORCE visibility against white bg */}
                                <p className="font-black text-slate-900 text-[12px] truncate block">
                                  {email || "Unknown Email"}
                                </p>
                                <p className="text-red-600 font-bold text-[10px] uppercase mt-1 flex items-center gap-1">
                                  <AlertCircle size={10} className="shrink-0" />
                                  <span>{reason}</span>
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* CO-INSTRUCTORS */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                      <UserCog size={20} />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      Co-Instructors
                    </h3>
                  </div>
                  <div className="space-y-2 mb-4">
                    {selectedCourse.coInstructors.map((co) => (
                      <div
                        key={co._id}
                        className="text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 font-bold text-slate-700 truncate"
                      >
                        {co.email}
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={handleAddCoInstructor}
                    className="flex flex-col gap-3"
                  >
                    <input
                      type="email"
                      required
                      value={coInstructorEmail}
                      onChange={(e) => setCoInstructorEmail(e.target.value)}
                      placeholder="prof@iitk.ac.in"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-purple-500 text-sm font-medium"
                    />
                    <button className="bg-purple-100 text-purple-700 py-2.5 rounded-xl font-bold text-sm">
                      Add Co-Instructor
                    </button>
                  </form>
                </div>
              </div>

              {/* ROSTER TABLE (EMAIL ONLY) */}
              <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[800px] overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <GraduationCap size={20} />
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      Enrolled Roster
                    </h3>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Search emails..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-black text-xs text-slate-500 uppercase tracking-widest">
                          Student Email ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td className="p-8 text-center text-slate-400 font-medium">
                            No members found.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((s) => (
                          <tr
                            key={s._id}
                            className="hover:bg-indigo-50/50 transition-colors"
                          >
                            <td className="px-6 py-4 font-bold text-slate-700">
                              {s.email}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CREATE MODAL */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <BookOpen size={20} className="text-indigo-600" /> Create New
                  Course
                </h2>
                <button
                  onClick={() => setShowCreate(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-6">
                <input
                  type="text"
                  required
                  placeholder="Course Code & Name (e.g. CS253)"
                  value={courseForm.name}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, name: e.target.value })
                  }
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    required
                    value={courseForm.startDate}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                  />
                  <input
                    type="date"
                    required
                    value={courseForm.endDate}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, endDate: e.target.value })
                    }
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() =>
                        setCourseForm((p) => ({
                          ...p,
                          daysOfWeek: p.daysOfWeek.includes(day)
                            ? p.daysOfWeek.filter((d) => d !== day)
                            : [...p.daysOfWeek, day],
                        }))
                      }
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${courseForm.daysOfWeek.includes(day) ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"}`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 px-4 py-3.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95"
                  >
                    {loading ? "Generating..." : "Save Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
