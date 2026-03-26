// src/pages/CourseViewer.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Clock,
  Lock,
} from "lucide-react";
import DashboardLayout from "../layouts/dashboard_layout";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function CourseViewer() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const role = JSON.parse(localStorage.getItem("user"))?.role || "Student";
  const fetchUrl =
    role === "Professor" ? "/api/courses/managed" : "/api/courses/enrolled";

  // --- Date Math for Locking ---
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day comparison

  useEffect(() => {
    fetch(`${API_BASE}${fetchUrl}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [fetchUrl]);

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    try {
      const res = await fetch(
        `${API_BASE}/api/courses/${course._id}/sessions`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-5rem)] font-sans">
        {selectedCourse ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <button
              onClick={() => setSelectedCourse(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-6 group transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:border-indigo-200 shadow-sm">
                <ArrowLeft size={16} />
              </div>
              Back to My Courses
            </button>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
              <div className="relative z-10">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                  {selectedCourse.name}
                </h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-500" /> Class
                  Sessions & Schedule
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sessions.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500 font-medium bg-white rounded-xl border border-dashed border-slate-300">
                  No sessions generated for this course yet.
                </div>
              ) : (
                sessions.map((session, index) => {
                  const dateObj = new Date(session.date);
                  // Compare session date to today
                  const sessionMidnight = new Date(session.date);
                  sessionMidnight.setHours(0, 0, 0, 0);
                  const isFuture = sessionMidnight > today;

                  return (
                    <div
                      key={session._id}
                      onClick={() => {
                        if (!isFuture)
                          navigate(`/sessions/${session._id}`, {
                            state: { courseId: selectedCourse._id },
                          });
                      }}
                      className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between transition-all group 
                        ${isFuture ? "opacity-60 cursor-not-allowed border-slate-100 grayscale-[50%]" : "hover:shadow-md hover:border-indigo-300 cursor-pointer border-slate-200"}`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold border 
                          ${isFuture ? "bg-slate-50 text-slate-400 border-slate-200" : "bg-indigo-50 text-indigo-600 border-indigo-100"}`}
                        >
                          <span className="text-[10px] uppercase tracking-wider">
                            {dateObj.toLocaleString("en-US", {
                              weekday: "short",
                            })}
                          </span>
                          <span className="text-xl leading-none mt-0.5">
                            {dateObj.getDate()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-lg">
                            Lecture {index + 1}
                          </h4>
                          <p className="text-xs font-medium text-slate-500">
                            {dateObj.toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors 
                        ${isFuture ? "bg-slate-100" : "bg-slate-50 group-hover:bg-indigo-100"}`}
                      >
                        {isFuture ? (
                          <Lock size={16} className="text-slate-400" />
                        ) : (
                          <ChevronRight
                            size={18}
                            className="text-slate-400 group-hover:text-indigo-600"
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          // ... Keep your existing Default View (Course List) here exactly as it was ...
          <div className="animate-in fade-in duration-500">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <BookOpen className="text-indigo-600" size={32} /> My Courses
              </h1>
              <p className="text-slate-500 font-medium mt-1 ml-11">
                Select a course to view its schedule and sessions.
              </p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => handleSelectCourse(c)}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 cursor-pointer transition-all group"
                  >
                    <h3 className="text-xl font-extrabold text-slate-900 line-clamp-1 mb-4">
                      {c.name}
                    </h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Calendar size={16} />
                        </div>{" "}
                        <span className="truncate">
                          {c.daysOfWeek.join(", ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Clock size={16} />
                        </div>{" "}
                        <span>
                          {new Date(c.startDate).toLocaleDateString()} -{" "}
                          {new Date(c.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold text-indigo-600 pt-4 border-t border-slate-100">
                      View Schedule{" "}
                      <ChevronRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
