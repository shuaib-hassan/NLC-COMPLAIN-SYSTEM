import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FileText,
  Send,
  AlertCircle,
  CheckCircle2,
  Camera,
  Video,
  Sparkles,
  Loader2,
  MapPin,
  X,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Info,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { analyzeMediaStructured } from "../services/geminiService";

const SubmitComplaint: React.FC = () => {
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
  const [analyzing, setAnalyzing] = useState(false);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaBase64, setMediaBase64] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<any | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      setMediaPreview(reader.result as string);
      setMediaBase64(base64);
      setMediaFile(file);
      const type = file.type.startsWith("image") ? "image" : "video";
      setMediaType(type as any);

      // Auto-analyze with Gemini
      setAnalyzing(true);
      try {
        const analysis = await analyzeMediaStructured(base64, file.type);
        if (analysis) {
          setAiSuggestion(analysis);
        }
      } catch (err) {
        console.error("AI Analysis failed:", err);
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    setFormData((prev) => ({
      ...prev,
      title: aiSuggestion.title || prev.title,
      category: aiSuggestion.category || prev.category,
      priority: aiSuggestion.priority || prev.priority,
      description:
        (prev.description ? prev.description + "\n\n" : "") +
        aiSuggestion.description,
    }));
    setAiSuggestion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/complaints", {
        ...formData,
        media_url: mediaBase64
          ? `data:${mediaFile?.type};base64,${mediaBase64}`
          : null,
        media_type: mediaType || null,
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
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Complaint Submitted!
          </h2>
          <p className="text-slate-500 mb-8">
            Your complaint has been received and is being processed.
          </p>

          <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Tracking Number
            </p>
            <p className="text-4xl font-mono font-bold text-emerald-600 tracking-tighter">
              {success}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate(`/track/${success}`)}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              Track Status <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSuccess(null)}
              className="w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              Submit Another
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
            <ShieldCheck className="h-4 w-4" /> Official NLC Portal
          </div>
          <h1 className="text-6xl font-serif italic font-bold text-slate-900 mb-6">
            Lodge a <span className="text-emerald-600">Complaint.</span>
          </h1>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Our digital portal helps you provide accurate details for faster
            resolution of land-related grievances.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Form Section */}
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

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 space-y-10"
          >
            <div className="space-y-10">
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
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-lg font-medium text-slate-900 placeholder:text-slate-400"
                    placeholder="e.g., Illegal encroachment on Plot 45B"
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
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-lg font-medium text-slate-900 appearance-none"
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
                    Priority Level
                  </label>
                  <div className="relative">
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({ ...formData, priority: e.target.value })
                      }
                      className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all text-lg font-medium text-slate-900 appearance-none"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
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
                <div className="relative">
                  <textarea
                    required
                    rows={8}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all resize-none text-lg font-medium text-slate-900 placeholder:text-slate-400 leading-relaxed"
                    placeholder="Describe the issue in detail, including dates, names, and any previous actions taken..."
                  ></textarea>

                  <AnimatePresence>
                    {analyzing && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10"
                      >
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                            Analysis in Progress
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || analyzing}
                className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-bold text-xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <>
                    Submit Complaint{" "}
                    <Send className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
              <p className="text-center text-slate-400 text-xs mt-6 flex items-center justify-center gap-2">
                <Info className="h-4 w-4" /> All submissions are legally binding
                and recorded.
              </p>
            </div>
          </form>
        </div>

        {/* Sidebar Section */}
        <div className="lg:col-span-4 space-y-10 sticky top-24">
          {/* AI Suggestions Panel */}
          <AnimatePresence>
            {aiSuggestion && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="bg-emerald-600 text-white rounded-[40px] p-10 shadow-2xl shadow-emerald-200 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Sparkles className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="h-6 w-6" />
                    <h3 className="font-bold uppercase tracking-widest text-sm">
                      Smart Suggestions
                    </h3>
                  </div>
                  <div className="space-y-6 mb-10">
                    <div>
                      <p className="text-emerald-100 text-[10px] font-bold uppercase mb-2">
                        Suggested Title
                      </p>
                      <p className="font-bold text-xl leading-tight">
                        {aiSuggestion.title}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-emerald-100 text-[10px] font-bold uppercase mb-2">
                          Category
                        </p>
                        <p className="font-bold">{aiSuggestion.category}</p>
                      </div>
                      <div>
                        <p className="text-emerald-100 text-[10px] font-bold uppercase mb-2">
                          Priority
                        </p>
                        <p className="font-bold capitalize">
                          {aiSuggestion.priority}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={applyAiSuggestion}
                    className="w-full py-4 bg-white text-emerald-600 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 shadow-xl"
                  >
                    Apply Suggestions <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Media Upload */}
          <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <Camera className="h-6 w-6 text-emerald-600" /> Evidence
              </h3>
              <HelpCircle className="h-5 w-5 text-slate-300 cursor-help" />
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[32px] p-10 text-center cursor-pointer transition-all duration-500 group ${
                mediaPreview
                  ? "border-emerald-500 bg-emerald-50/10"
                  : "border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/*"
              />
              {mediaPreview ? (
                <div className="relative group/preview">
                  {mediaType === "image" ? (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-2xl shadow-xl"
                    />
                  ) : (
                    <video
                      src={mediaPreview}
                      className="max-h-64 mx-auto rounded-2xl shadow-xl"
                      controls
                    />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMediaPreview(null);
                      setMediaType(null);
                      setAiSuggestion(null);
                    }}
                    className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-2xl border border-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="p-6 bg-slate-50 rounded-3xl group-hover:bg-emerald-100 transition-colors duration-500">
                    <PlusCircle className="h-10 w-10 text-slate-400 group-hover:text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-700">
                      Upload Evidence
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                      System will analyze your media
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Selection */}
          <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-8">
              <MapPin className="h-6 w-6 text-emerald-600" /> Location
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Address / Landmark
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-slate-700"
                    placeholder="e.g., Nairobi, Upper Hill, Plot 12"
                  />
                  <Globe className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300" />
                </div>
                <p className="text-xs text-slate-400 mt-4 italic leading-relaxed">
                  Please provide as much detail as possible about the location.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitComplaint;
