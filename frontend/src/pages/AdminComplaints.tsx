import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Filter, ChevronRight, Clock, 
  CheckCircle2, AlertCircle, User, MapPin,
  Download, MoreVertical, LayoutGrid, List,
  ArrowUpDown, ShieldCheck, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AdminComplaints: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    axios.get('/api/complaints/admin/all')
      .then(res => setComplaints(res.data))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-100';
      case 'high': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.tracking_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Fetching Complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50/50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-slate-900 p-1.5 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Case Management</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {user?.role === 'admin' ? 'All Complaints' : 'Department Complaints'}
              </h1>
              <p className="text-slate-500 mt-1 font-medium">
                {user?.role === 'admin' 
                  ? 'Review and manage all citizen grievances across the country.' 
                  : `Reviewing grievances assigned to the ${user?.department_name || 'Department'} team.`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                >
                  <List className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                <Download className="h-4 w-4" /> Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, tracking number, or citizen name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium shadow-sm"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-10 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-sm appearance-none shadow-sm cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Complaint Details</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Citizen</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Priority</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Submission Date</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">{c.title}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-wider">{c.tracking_number}</span>
                          <span className="text-[10px] font-bold text-slate-300">•</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.category}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {c.is_anonymous ? (
                          <div className="flex items-center gap-2 text-slate-400">
                            <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center">
                              <ShieldCheck className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">Anonymous</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-700 leading-none">{c.user_name}</div>
                              <div className="text-[10px] font-medium text-slate-400 mt-1">{c.user_email}</div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-lg border", getStatusColor(c.status))}>
                          {c.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn("text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-lg border", getPriorityColor(c.priority))}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-slate-700">{new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        <div className="text-[10px] font-medium text-slate-400 mt-1">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link
                          to={`/admin/complaints/${c.id}`}
                          className="h-10 w-10 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all inline-flex items-center justify-center border border-slate-100"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComplaints.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className={cn("text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-lg border", getStatusColor(c.status))}>
                    {c.status.replace('-', ' ')}
                  </span>
                  <button className="text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">{c.title}</h3>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">{c.tracking_number}</span>
                  <span className="text-[10px] font-bold text-slate-300">•</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.category}</span>
                </div>
                
                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{c.is_anonymous ? 'Anonymous' : c.user_name}</span>
                    </div>
                    <span className={cn("text-[10px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded-md border", getPriorityColor(c.priority))}>
                      {c.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {new Date(c.created_at).toLocaleDateString()}
                    </div>
                    <Link to={`/admin/complaints/${c.id}`} className="text-emerald-600 hover:underline">View Details</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {filteredComplaints.length === 0 && (
          <div className="py-20 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm">
            <div className="h-20 w-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No complaints found</h3>
            <p className="text-slate-400 max-w-xs mx-auto">We couldn't find any complaints matching your current search or filter criteria.</p>
            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="mt-8 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComplaints;
