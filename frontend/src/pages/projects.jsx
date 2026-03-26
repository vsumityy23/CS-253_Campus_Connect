import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/dashboard_layout";
import {
  Search,
  Clock,
  Award,
  User,
  Code2,
  X,
  Briefcase,
  CheckCircle,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [myApplications, setMyApplications] = useState([]); // Stores { projectId: status }
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    rollNo: "",
    name: "",
    branch: "",
    cpi: "",
    resume: "",
    sop: "",
  });

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    // Fetch all open projects
    fetch(`${API_BASE}/api/projects`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch(console.error);

    // Fetch my application statuses
    fetch(`${API_BASE}/api/projects/my-applications`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => {
        const appMap = {};
        data.forEach((app) => {
          appMap[app.project] = app.status;
        });
        setMyApplications(appMap);
      })
      .catch(console.error);
  }, []);

  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skills.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${API_BASE}/api/projects/${selectedProject._id}/apply`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(applicationForm),
        },
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.msg);

      setToastMessage("Application sent successfully!");
      setTimeout(() => setToastMessage(null), 3000);

      // Update local status instantly
      setMyApplications({
        ...myApplications,
        [selectedProject._id]: "Pending",
      });
      setSelectedProject(null);
      setApplicationForm({
        rollNo: "",
        name: "",
        branch: "",
        cpi: "",
        resume: "",
        sop: "",
      });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in relative pb-10">
        {toastMessage && (
          <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-[100]">
            <CheckCircle size={24} />
            <div>
              <p className="text-sm font-black uppercase text-emerald-200">
                Success
              </p>
              <p className="font-bold">{toastMessage}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Project Board
            </h2>
            <p className="text-slate-500 mt-1">
              Discover and apply to cutting-edge research opportunities.
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by title or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium text-sm"
            />
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const status = myApplications[project._id];

              return (
                <div
                  key={project._id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col"
                >
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase w-fit mb-4 border border-indigo-100">
                    {project.dept}
                  </span>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 flex-1">
                    {project.description}
                  </p>

                  <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <User size={16} className="text-indigo-500" />{" "}
                      <span>{project.professor?.name || "Faculty"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Award size={16} className="text-indigo-500" />{" "}
                      <span>
                        Min CPI:{" "}
                        <span className="font-bold">{project.cpi}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock size={16} className="text-indigo-500" />{" "}
                      <span>{project.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Code2 size={16} className="text-indigo-500 min-w-max" />{" "}
                      <span className="truncate">{project.skills}</span>
                    </div>
                  </div>

                  {status ? (
                    <div
                      className={`w-full py-3 rounded-xl font-bold text-center border-2 ${status === "Accepted" ? "bg-emerald-50 border-emerald-200 text-emerald-600" : status === "Rejected" ? "bg-red-50 border-red-200 text-red-600" : "bg-blue-50 border-blue-200 text-blue-600"}`}
                    >
                      Status: {status}
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Briefcase size={18} /> Review & Apply
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <h3 className="text-lg font-bold text-slate-700">
              No projects found
            </h3>
          </div>
        )}

        {/* MODAL (With Scroll Fix) */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedProject(null)}
            ></div>
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedProject.title}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Application for{" "}
                    {selectedProject.professor?.name || "Professor"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleApply} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase">
                      Roll No *
                    </label>
                    <input
                      type="text"
                      required
                      name="rollNo"
                      value={applicationForm.rollNo}
                      onChange={(e) =>
                        setApplicationForm({
                          ...applicationForm,
                          rollNo: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={applicationForm.name}
                      onChange={(e) =>
                        setApplicationForm({
                          ...applicationForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase">
                      Branch *
                    </label>
                    <input
                      type="text"
                      required
                      name="branch"
                      value={applicationForm.branch}
                      onChange={(e) =>
                        setApplicationForm({
                          ...applicationForm,
                          branch: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase">
                      Current CPI *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      name="cpi"
                      value={applicationForm.cpi}
                      onChange={(e) =>
                        setApplicationForm({
                          ...applicationForm,
                          cpi: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase">
                    Resume Link (URL) *
                  </label>
                  <input
                    type="url"
                    required
                    name="resume"
                    value={applicationForm.resume}
                    onChange={(e) =>
                      setApplicationForm({
                        ...applicationForm,
                        resume: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase">
                    Statement of Purpose
                  </label>
                  <textarea
                    name="sop"
                    value={applicationForm.sop}
                    onChange={(e) =>
                      setApplicationForm({
                        ...applicationForm,
                        sop: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 resize-none h-24 text-sm font-medium"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className="flex-1 px-4 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg"
                  >
                    Submit Application
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

export default Projects;
