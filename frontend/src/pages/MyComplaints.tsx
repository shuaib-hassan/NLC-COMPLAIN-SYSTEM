import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Tag,
  Building2,
  Search,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

const MyComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get("/api/complaints/my");
      setComplaints(res.data);
    } catch (err: any) {
      setError("Failed to load your complaints. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            Loading Your Cases...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50/50 pb-20">
      <div className="bg-white border-b border-slate-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <img
              src="/LOGO.png"
              alt="NLC Logo"
              className="h-12 w-12 object-contain"
            />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Citizen Portal
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            My Complaints
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Track the status and history of your land-related grievances.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 mb-8">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {complaints.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border border-slate-100 shadow-sm">
            <div className="h-20 w-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No complaints found
            </h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              You haven't submitted any complaints yet. If you have a
              land-related grievance, you can lodge it through our portal.
            </p>
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              Submit Your First Complaint <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.map((complaint, idx) => (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(complaint.status)}`}
                    >
                      {complaint.status.replace("-", " ")}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {complaint.tracking_number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {complaint.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">
                    {complaint.description}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Tag className="h-3.5 w-3.5" />
                      <span className="font-medium">{complaint.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="font-medium">
                        {complaint.department_name || "Unassigned"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="font-medium">
                        Submitted{" "}
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/track?tracking_number=${complaint.tracking_number}`}
                  className="w-full py-4 bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all"
                >
                  View Details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyComplaints;
