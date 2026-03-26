import DashboardLayout from "../layouts/dashboard_layout.jsx";
import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function ProfessorProject() {
  const [projects, setProjects] = useState([]);
  const [showWizard, setShowWizard] = useState(false);
  const [form, setForm] = useState({
    title: "",
    dept: "",
    program: "",
    cpi: "",
    duration: "",
    teamSize: "",
    skills: "",
    description: "",
  });

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const fetchProjects = () => {
    fetch(`${API_BASE}/api/projects/managed`, { headers: getHeaders() })
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const addProject = async () => {
    if (!form.title || !form.description) return;
    try {
      await fetch(`${API_BASE}/api/projects`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(form),
      });
      fetchProjects();
      setShowWizard(false);
      setForm({
        title: "",
        dept: "",
        program: "",
        cpi: "",
        duration: "",
        teamSize: "",
        skills: "",
        description: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const updateAppStatus = async (appId, newStatus) => {
    try {
      await fetch(`${API_BASE}/api/projects/applications/${appId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      fetchProjects(); // Refresh UI
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 p-6 font-sans">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Project Applications
            </h2>
            <p className="text-slate-500 mt-1">
              Review student applications and manage project details.
            </p>
          </div>
          <button
            onClick={() => setShowWizard(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
          >
            <span className="text-xl">+</span> Create New Project
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {projects.length === 0 && (
            <p className="text-slate-500">No active projects.</p>
          )}
          {projects.map((p) => (
            <ProjectCard
              key={p._id}
              project={p}
              updateAppStatus={updateAppStatus}
            />
          ))}
        </div>

        {/* PROJECT WIZARD MODAL */}
        {showWizard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowWizard(false)}
            ></div>
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Create New Project
                </h2>
                <div className="space-y-5">
                  <div className="group">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Project Title
                    </label>
                    <input
                      name="title"
                      onChange={handleChange}
                      className="modal-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Department
                      </label>
                      <input
                        name="dept"
                        onChange={handleChange}
                        className="modal-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Required Program
                      </label>
                      <input
                        name="program"
                        onChange={handleChange}
                        className="modal-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Min CPI
                      </label>
                      <input
                        name="cpi"
                        type="number"
                        onChange={handleChange}
                        className="modal-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Team Size
                      </label>
                      <input
                        name="teamSize"
                        onChange={handleChange}
                        className="modal-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Required Skills
                    </label>
                    <input
                      name="skills"
                      onChange={handleChange}
                      className="modal-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Duration
                    </label>
                    <input
                      name="duration"
                      onChange={handleChange}
                      className="modal-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Project Description
                    </label>
                    <textarea
                      name="description"
                      rows="3"
                      onChange={handleChange}
                      className="modal-input resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                    <button
                      onClick={() => setShowWizard(false)}
                      className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addProject}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold"
                    >
                      Launch Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`.modal-input { width: 100%; background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 0.75rem; padding: 0.75rem 1rem; outline: none; transition: all 0.2s; font-weight: bold; font-size: 0.875rem;} .modal-input:focus { border-color: #4f46e5; background-color: #fff; }`}</style>
    </DashboardLayout>
  );
}

function ProjectCard({ project, updateAppStatus }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase border border-indigo-100">
              {project.dept}
            </span>
            <h3 className="text-xl font-bold text-slate-800 mt-2">
              {project.title}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase">
              Min. CPI
            </p>
            <p className="text-xl font-black text-indigo-600">{project.cpi}+</p>
          </div>
        </div>
        <p className="text-slate-500 text-sm mb-6">{project.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-50">
          <InfoBlock label="Program" value={project.program} />
          <InfoBlock label="Duration" value={project.duration} />
          <InfoBlock label="Team Size" value={project.teamSize} />
          <InfoBlock label="Skills" value={project.skills} />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-4 flex items-center justify-between group py-2"
        >
          <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-600">
            {isExpanded
              ? "Hide Applicant List"
              : `View Applicants (${project.applicants?.length || 0})`}
          </span>
        </button>
      </div>

      {isExpanded && (
        <div className="bg-slate-50/50 border-t border-slate-100 p-6 pt-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 font-bold uppercase text-[10px]">
                    Roll No
                  </th>
                  <th className="px-5 py-4 font-bold uppercase text-[10px]">
                    Name
                  </th>
                  <th className="px-5 py-4 font-bold uppercase text-[10px]">
                    Branch
                  </th>
                  <th className="px-5 py-4 font-bold uppercase text-[10px]">
                    CPI
                  </th>
                  <th className="px-5 py-4 font-bold uppercase text-[10px] text-center">
                    Resume
                  </th>
                  <th className="px-5 py-4 font-bold uppercase text-[10px] text-center">
                    Actions / Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {project.applicants?.length > 0 ? (
                  project.applicants.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-600">
                        {app.rollNo}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {app.name}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{app.branch}</td>
                      <td className="px-5 py-4 font-bold text-indigo-600">
                        {app.cpi}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <a
                          href={app.resume}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 font-bold hover:underline"
                        >
                          View PDF
                        </a>
                      </td>
                      <td className="px-5 py-4">
                        {app.status === "Pending" ? (
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() =>
                                updateAppStatus(app._id, "Accepted")
                              }
                              className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() =>
                                updateAppStatus(app._id, "Rejected")
                              }
                              className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div
                            className={`text-center font-bold text-xs px-2 py-1 rounded-full ${app.status === "Accepted" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                          >
                            {app.status}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-10 text-center text-slate-400 italic"
                    >
                      No applications received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-1">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}

export default ProfessorProject;
