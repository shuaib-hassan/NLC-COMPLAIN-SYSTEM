import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  MoreHorizontal,
  Search,
  ShieldCheck,
  BrainCircuit,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)} years ago`;

  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} months ago`;

  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} days ago`;

  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} hours ago`;

  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} minutes ago`;

  return `${Math.floor(seconds)} seconds ago`;
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, complaintsRes] = await Promise.all([
          axios.get("/api/complaints/admin/stats/overview"),
          axios.get("/api/complaints/admin/all"),
        ]);
        setStats(statsRes.data);
        setRecentActivity(complaintsRes.data.slice(0, 5)); // Get top 5 most recently updated
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            Loading Analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <div className="text-red-500 text-4xl">⚠️</div>
          <p className="text-slate-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Initialize stats with defaults if null
  const summary = stats?.summary || {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  };
  const byCategory = stats?.byCategory || [];
  const byStatus = stats?.byStatus || [];

  const summaryCards = [
    {
      title: "Total Complaints",
      value: summary.total,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: "+12.5%",
      up: true,
    },
    {
      title: "Pending Review",
      value: summary.pending,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      trend: "-2.4%",
      up: false,
    },
    {
      title: "In Progress",
      value: summary.inProgress,
      icon: TrendingUp,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      trend: "+5.1%",
      up: true,
    },
    {
      title: "Resolved Cases",
      value: summary.resolved,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: "+18.2%",
      up: true,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50/50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white p-1 rounded-lg border border-slate-200">
                  <img
                    src="/LOGO.png"
                    alt="NLC Logo"
                    className="h-8 w-8 object-contain"
                  />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Management Console
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {user?.role === "admin"
                  ? "System Overview"
                  : "Department Analytics"}
              </h1>
              <p className="text-slate-500 mt-1 font-medium">
                {user?.role === "admin"
                  ? "Real-time performance metrics for the National Land Commission."
                  : `Performance metrics for the ${user?.department_name || "Department"} team.`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Calendar className="h-4 w-4" /> Last 30 Days
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                <Download className="h-4 w-4" /> Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {summaryCards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`h-12 w-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <card.icon className="h-6 w-6" />
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${card.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                >
                  {card.trend}{" "}
                  {card.up ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {card.value}
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {card.title}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Complaint Distribution
                  </h3>
                  <p className="text-sm text-slate-400 font-medium">
                    Volume of cases across different categories
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-bold text-slate-500">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>{" "}
                    Active Cases
                  </div>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={byCategory}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                        padding: "12px",
                      }}
                      cursor={{ fill: "#f8fafc" }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-900 p-8 rounded-[32px] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 text-emerald-400">
                  <TrendingUp className="h-24 w-24" />
                </div>
                <h4 className="text-xl font-bold mb-2">System Insights</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Based on current trends, we recommend reallocating 2 officers
                  to the{" "}
                  <span className="text-emerald-400 font-bold">
                    Land Dispute
                  </span>{" "}
                  department to handle the 15% surge.
                </p>
                <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/10">
                  View Full AI Report
                </button>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" /> Critical
                  Alerts
                </h4>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-100"
                    >
                      <div className="h-8 w-8 bg-amber-200 text-amber-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-900">
                          SLA Breach Warning
                        </p>
                        <p className="text-[10px] text-amber-700 mt-0.5">
                          Case NLC-82F9 has been pending for 48h.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Charts */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6">
                Status Health
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {byStatus.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "none",
                        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {byStatus.map((entry: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl"
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Recent Activity
                </h3>
                <Link
                  to="/admin/complaints"
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-6">
                {recentActivity.map((activity) => (
                  <Link
                    to={`/admin/complaints/${activity.id}`}
                    key={activity.id}
                    className="flex items-start gap-3 p-2 -m-2 rounded-xl hover:bg-slate-100 transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Case{" "}
                        <span className="font-mono group-hover:text-emerald-600">
                          {activity.tracking_number}
                        </span>{" "}
                        updated
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {timeAgo(activity.updated_at)} · Status:{" "}
                        <span className="font-black capitalize">
                          {activity.status.replace("_", " ")}
                        </span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
