import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Shield,
  Send,
  AlertCircle,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Video,
  X,
  BrainCircuit,
  Sparkles,
  MapPin,
  Loader2,
  Info,
  Globe,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { analyzeMediaStructured } from "../services/geminiService";

const AnonymousComplaint: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    department_id: "",
    location: "",
    priority: "medium",
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [media, setMedia] = useState<{
    file: File;
    preview: string;
    base64: string;
    type: "image" | "video";
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const navigate = useNavigate();

  const categories = [
    "Land Dispute",
    "Illegal Acquisition",
    "Boundary Dispute",
    "Service Delay",
    "Staff Misconduct",
    "Valuation Issue",
    "Other",
  ];

  useEffect(() => {
    axios.get("/api/departments").then((res) => setDepartments(res.data));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = file.type.startsWith("image/") ? "image" : "video";
    const preview = URL.createObjectURL(file);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(",")[1];
      setMedia({ file, preview, base64: base64Data, type });

      // AI Analysis
      setIsAnalyzing(true);
      try {
        const suggestions = await analyzeMediaStructured(base64Data, file.type);
        if (suggestions) {
          setAiSuggestions(suggestions);
        }
      } catch (err) {
        console.error("AI Analysis failed:", err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const applySuggestions = () => {
    if (!aiSuggestions) return;
    setFormData((prev) => ({
      ...prev,
      title: aiSuggestions.suggestedTitle || prev.title,
      category: aiSuggestions.suggestedCategory || prev.category,
      priority: aiSuggestions.suggestedPriority || prev.priority,
      description: aiSuggestions.keyIssues?.join("\n") || prev.description,
    }));
    setAiSuggestions(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/complaints/anonymous", {
        ...formData,
        media_url: media
          ? `data:${media.file.type};base64,${media.base64}`
          : null,
        media_type: media?.type || null,
      });
      setSuccess(res.data.tracking_number);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[32px] shadow-2xl border border-slate-100 p-10 text-center"
        >
          <div className="h-20 w-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
            Submission Successful!
          </h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Your anonymous complaint has been recorded. <br />
            <span className="font-bold text-slate-900">
              Please save this tracking number
            </span>{" "}
            to monitor progress:
          </p>
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 mb-10 group cursor-pointer hover:border-emerald-300 transition-colors">
            <span className="text-3xl font-mono font-black text-emerald-600 tracking-widest">
              {success}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/track")}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              Track Status
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-4 bg-white text-slate-500 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-8">
            <img
              src="/LOGO.png"
              alt="NLC Logo"
              className="h-24 w-24 object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-8 border border-emerald-100">
            <Shield className="h-4 w-4" /> Anonymous Portal
          </div>
          <h1 className="text-6xl font-serif italic font-bold text-slate-900 mb-6">
            Report a <span className="text-emerald-600">Grievance.</span>
          </h1>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Your identity is protected by end-to-end encryption. Use our digital
            tools to ensure your report is accurate and actionable.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-8 space-y-12">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-3xl flex items-center gap-4 shadow-sm"
            >
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Media Upload Section */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-10 border-b border-slate-50">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <ImageIcon className="h-6 w-6 text-emerald-600" /> Media
                  Evidence
                </h3>
                <p className="text-slate-400 mt-2">
                  Upload photos or videos of the incident for automated
                  analysis.
                </p>
              </div>
              <div className="p-10">
                {!media ? (
                  <label className="relative group cursor-pointer block">
                    <div className="border-2 border-dashed border-slate-200 rounded-[32px] p-16 text-center group-hover:border-emerald-400 group-hover:bg-emerald-50/30 transition-all duration-500">
                      <div className="h-20 w-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:text-emerald-500 transition-all duration-500">
                        <Upload className="h-10 w-10" />
                      </div>
                      <p className="text-xl text-slate-900 font-bold">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-slate-400 mt-2">
                        PNG, JPG or MP4 (max 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="relative rounded-[32px] overflow-hidden border border-slate-200 aspect-video bg-slate-900 shadow-2xl">
                    {media.type === "image" ? (
                      <img
                        src={media.preview}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <video
                        src={media.preview}
                        className="w-full h-full object-contain"
                        controls
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMedia(null);
                        setAiSuggestions(null);
                      }}
                      className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur rounded-2xl text-slate-900 hover:bg-white transition-all shadow-xl"
                    >
                      <X className="h-6 w-6" />
                    </button>

                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                        <Loader2 className="h-12 w-12 animate-spin mb-6 text-emerald-400" />
                        <p className="font-bold tracking-[0.2em] uppercase text-xs">
                          System is analyzing media...
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <AnimatePresence>
                  {aiSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="mt-8 p-8 bg-emerald-50 rounded-[32px] border border-emerald-100 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <BrainCircuit className="h-24 w-24 text-emerald-600" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <Sparkles className="h-6 w-6 text-emerald-600" />
                          <h4 className="text-xl font-bold text-emerald-900">
                            Insights Available
                          </h4>
                        </div>
                        <p className="text-emerald-700 mb-6 leading-relaxed">
                          We've analyzed your media and can automatically fill
                          in the title, category, and key issues for you.
                        </p>
                        <button
                          type="button"
                          onClick={applySuggestions}
                          className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
                        >
                          Apply Suggestions
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Form Details */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Complaint Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-lg"
                    placeholder="e.g., Illegal fencing on plot 45B"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium appearance-none text-lg"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ArrowRight className="h-5 w-5 text-slate-400 rotate-90" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Department (Optional)
                  </label>
                  <div className="relative">
                    <select
                      value={formData.department_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          department_id: e.target.value,
                        })
                      }
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium appearance-none text-lg"
                    >
                      <option value="">Auto-assign</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ArrowRight className="h-5 w-5 text-slate-400 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                  Detailed Description
                </label>
                <textarea
                  required
                  rows={8}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium resize-none text-lg leading-relaxed"
                  placeholder="Provide as much detail as possible about the incident..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-bold text-xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 disabled:opacity-70 group"
              >
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <>
                    Submit Anonymous Complaint{" "}
                    <Send className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar - Location & Info */}
        <div className="lg:col-span-4 space-y-10 sticky top-24">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-8">
              <MapPin className="h-6 w-6 text-emerald-600" /> Incident Location
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Location Details
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                    placeholder="e.g., Nairobi, Upper Hill, Plot 12"
                  />
                  <Globe className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300" />
                </div>
                <p className="text-xs text-slate-400 mt-4 italic leading-relaxed">
                  Provide a descriptive address or landmark if exact coordinates
                  are unknown.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-600 rounded-[40px] p-10 text-white shadow-2xl shadow-emerald-200 relative overflow-hidden">
            <div className="relative z-10">
              <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                <Info className="h-8 w-8" />
              </div>
              <h4 className="text-2xl font-bold mb-6">Why Anonymous?</h4>
              <p className="text-emerald-100 leading-relaxed mb-8 font-light">
                We understand that some matters are sensitive. Anonymous
                reporting allows you to voice concerns without fear of
                retaliation.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-4 text-sm font-bold">
                  <div className="h-2 w-2 bg-emerald-300 rounded-full" /> No IP
                  tracking
                </li>
                <li className="flex items-center gap-4 text-sm font-bold">
                  <div className="h-2 w-2 bg-emerald-300 rounded-full" /> No
                  identity logs
                </li>
                <li className="flex items-center gap-4 text-sm font-bold">
                  <div className="h-2 w-2 bg-emerald-300 rounded-full" />{" "}
                  Encrypted submission
                </li>
              </ul>
            </div>
            {/* Decorative Circle */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnonymousComplaint;
