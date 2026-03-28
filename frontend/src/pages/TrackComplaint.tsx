import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Search,
  Loader2,
  AlertCircle,
  MapPin,
  Clock,
  CheckCircle2,
  FileText,
  User,
  Building2,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const TrackComplaint: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(
    searchParams.get("tracking_number") || "",
  );
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const tn = searchParams.get("tracking_number");
    if (tn) {
      handleTrackByNumber(tn);
    }
  }, [searchParams]);

  const handleTrackByNumber = async (number: string) => {
    setLoading(true);
    setError("");
    setComplaint(null);

    try {
      const res = await axios.get(`/api/complaints/track/${number.trim()}`);
      setComplaint(res.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Complaint not found. Please check the tracking number.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    handleTrackByNumber(trackingNumber);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "resolved":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-amber-600";
      case "low":
        return "text-emerald-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-center mb-8">
        <img
          src="/LOGO.png"
          alt="NLC Logo"
          className="h-24 w-24 object-contain"
        />
      </div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          Track Your Complaint
        </h1>
        <p className="text-slate-500 mt-3 text-lg">
          Enter your tracking number to see the real-time status of your
          grievance.
        </p>
      </div>

      <div className="max-w-xl mx-auto mb-12">
        <form onSubmit={handleTrack} className="relative">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
            placeholder="Enter Tracking Number (e.g., NLC-XXXX)"
            className="w-full pl-12 pr-32 py-5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-lg font-mono"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
          <button
            type="submit"
            disabled={loading || !trackingNumber.trim()}
            className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Track"}
          </button>
        </form>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {complaint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(complaint.status)}`}
                  >
                    {complaint.status.replace("_", " ")}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Submitted on{" "}
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {complaint.title}
                </h2>
              </div>
              <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Tracking Number
                </p>
                <p className="text-xl font-mono font-bold text-slate-700">
                  {complaint.tracking_number}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <FileText className="h-3 w-3" /> Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Category</span>
                      <span className="font-bold text-slate-700">
                        {complaint.category}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Priority</span>
                      <span
                        className={`font-bold capitalize ${getPriorityColor(complaint.priority)}`}
                      >
                        {complaint.priority}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Department</span>
                      <span className="font-bold text-slate-700">
                        {complaint.department_name || "Unassigned"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Location
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {complaint.location || "No location provided"}
                  </p>
                </div>
              </div>

              <div className="p-8 md:col-span-2 bg-slate-50/30">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Description
                </h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap mb-8">
                  {complaint.description}
                </p>

                {complaint.resolution_notes && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-8">
                    <h4 className="text-emerald-800 font-bold text-sm mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Resolution Notes
                    </h4>
                    <p className="text-emerald-700 text-sm leading-relaxed">
                      {complaint.resolution_notes}
                    </p>
                  </div>
                )}

                {complaint.media_url && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Submitted Evidence
                    </h4>
                    <div className="relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-900 aspect-video">
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!complaint && !loading && (
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">
              Real-time Tracking
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Get instant updates on the progress of your case as it moves
              through departments.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Secure & Private</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Your tracking number is the only way to access your complaint
              details publicly.
            </p>
          </div>
          <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Direct Resolution</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              See notes directly from the officers handling your specific land
              matter.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackComplaint;
