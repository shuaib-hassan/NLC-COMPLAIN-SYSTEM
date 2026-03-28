import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  MapPin,
  Tag,
  Building2,
  MessageSquare,
  Shield,
  ExternalLink,
  FileText,
  Calendar,
  ShieldCheck,
  BrainCircuit,
  Sparkles,
  Play,
  Eye,
  Info,
  Image as ImageIcon,
  Mail,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { analyzeComplaintForAdmin } from "../services/geminiService";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AdminComplaintDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    priority: "",
    admin_notes: "",
    resolution_notes: "",
  });
  const [success, setSuccess] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const handleAiAnalysis = async () => {
    if (!complaint) return;
    setAiAnalyzing(true);
    const analysis = await analyzeComplaintForAdmin({
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
    });
    if (analysis) {
      setAiAnalysis(analysis);
    }
    setAiAnalyzing(false);
  };

  useEffect(() => {
    axios
      .get(`/api/complaints/admin/${id}`)
      .then((res) => {
        setComplaint(res.data);
        setFormData({
          status: res.data.status,
          priority: res.data.priority,
          admin_notes: res.data.admin_notes || "",
          resolution_notes: res.data.resolution_notes || "",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccess(false);

    try {
      await axios.patch(`/api/complaints/admin/${id}/status`, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Failed to update complaint");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            Loading Case Details...
          </p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "resolved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50/50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />{" "}
            Back to Case List
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border",
                    getStatusColor(complaint.status),
                  )}
                >
                  {complaint.status.replace("-", " ")}
                </span>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <Clock className="h-4 w-4" /> Received{" "}
                  {new Date(complaint.created_at).toLocaleDateString()}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                {complaint.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded tracking-widest uppercase">
                  {complaint.tracking_number}
                </span>
                {complaint.is_anonymous && (
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    <ShieldCheck className="h-3 w-3" /> Anonymous Submission
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                <ExternalLink className="h-5 w-5" />
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                <FileText className="h-4 w-4" /> Generate PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Details & Evidence */}
          <div className="lg:col-span-2 space-y-10">
            {/* Case Overview */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-50">
                <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
                  <Info className="h-5 w-5 text-emerald-600" /> Case Overview
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Category
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {complaint.category}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Department
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {complaint.department_name || "Unassigned"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Priority
                    </p>
                    <p className="text-sm font-bold text-slate-900 capitalize">
                      {complaint.priority}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Last Updated
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {new Date(complaint.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-10 space-y-10">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                    Description
                  </h4>
                  <div className="bg-slate-50 p-8 rounded-3xl text-slate-700 leading-relaxed font-medium">
                    {complaint.description}
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                  <div className="h-10 w-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-widest mb-1">
                      Incident Location
                    </h4>
                    <p className="text-sm font-bold text-emerald-700">
                      {complaint.location || "No location coordinates provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Section */}
            {complaint.media_url && (
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" /> Media Evidence
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Type: {complaint.media_type}
                  </span>
                </div>
                <div className="p-10">
                  <div className="relative rounded-3xl overflow-hidden border border-slate-100 bg-slate-900 aspect-video group">
                    {complaint.media_type === "image" ? (
                      <img
                        src={complaint.media_url}
                        alt="Evidence"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <video
                        src={complaint.media_url}
                        className="w-full h-full object-contain"
                        controls
                      />
                    )}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl flex items-center gap-2 font-bold text-slate-900 text-sm">
                        {complaint.media_type === "image" ? (
                          <ImageIcon className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        View Full Size
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-blue-50 rounded-3xl border border-blue-100">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                        <BrainCircuit className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest">
                            AI Analysis Summary
                          </h4>
                          <button
                            onClick={handleAiAnalysis}
                            disabled={aiAnalyzing}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            {aiAnalyzing ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />{" "}
                                Analyzing...
                              </>
                            ) : aiAnalysis ? (
                              <>
                                <RefreshCw className="h-3 w-3" /> Re-analyze
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3 w-3" /> Generate
                                Analysis
                              </>
                            )}
                          </button>
                        </div>
                        {aiAnalysis ? (
                          <div className="text-sm text-blue-700 leading-relaxed font-medium whitespace-pre-wrap">
                            {aiAnalysis}
                          </div>
                        ) : (
                          <p className="text-sm text-blue-600 leading-relaxed font-medium">
                            Click "Generate Analysis" to get AI-powered insights
                            on this complaint case, including severity
                            assessment, recommended actions, and department
                            assignment.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Citizen Info */}
            {!complaint.is_anonymous && (
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
                <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" /> Citizen
                  Information
                </h3>
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-3xl">
                    {complaint.user_name[0]}
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-slate-900">
                      {complaint.user_name}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                        <Mail className="h-4 w-4" /> {complaint.user_email}
                      </div>
                      <span className="text-slate-200">|</span>
                      <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                        Verified Account
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Actions */}
          <div className="space-y-10">
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 sticky top-32">
              <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" /> Update
                Case
              </h3>

              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-sm appearance-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-sm appearance-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Resolution Notes (Public)
                  </label>
                  <textarea
                    rows={5}
                    value={formData.resolution_notes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resolution_notes: e.target.value,
                      })
                    }
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none text-sm font-medium"
                    placeholder="Provide details visible to the citizen..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Internal Notes (Private)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.admin_notes}
                    onChange={(e) =>
                      setFormData({ ...formData, admin_notes: e.target.value })
                    }
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none text-sm font-medium"
                    placeholder="Internal investigation details..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {updating ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      Save Changes <Save className="h-5 w-5" />
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Case updated
                      successfully
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaintDetail;
