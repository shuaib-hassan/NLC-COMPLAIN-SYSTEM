import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  ShieldAlert,
  Search,
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  Sparkles,
  MapPin,
  BrainCircuit,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import axios from "axios";
import { motion } from "motion/react";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [resolvedCases, setResolvedCases] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/complaints/admin/stats/overview");
        setResolvedCases(res.data.summary.resolved);
      } catch (error) {
        console.error("Failed to fetch home page stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-white text-emerald-700 text-sm font-bold uppercase tracking-widest mb-10 border border-slate-100 shadow-xl">
                  <img
                    src="/LOGO.png"
                    alt="NLC Logo"
                    className="h-20 w-20 object-contain"
                  />{" "}
                  Official NLC Portal
                </div>
                <h1 className="text-7xl md:text-8xl font-serif italic font-black text-slate-900 leading-[0.85] tracking-tighter mb-8 text-balance">
                  Restoring Trust in{" "}
                  <span className="text-emerald-600">Land</span> Governance.
                </h1>
                <p className="text-xl text-slate-500 max-w-xl mb-10 leading-relaxed font-light">
                  A transparent, digital platform for Kenyans to report
                  grievances, track resolutions, and ensure justice in land
                  administration.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/submit"
                    className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center gap-3 group"
                  >
                    Lodge a Complaint{" "}
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/track"
                    className="px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all"
                  >
                    Track Progress
                  </Link>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative z-10"
              >
                <div className="bg-white p-4 rounded-[40px] shadow-2xl border border-slate-100 rotate-3 hover:rotate-0 transition-transform duration-700">
                  <img
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000"
                    alt="Kenyan Landscape"
                    className="rounded-[32px] w-full aspect-[4/5] object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-10 -left-10 bg-emerald-600 text-white p-8 rounded-[32px] shadow-2xl max-w-[240px] -rotate-6">
                    <Sparkles className="h-8 w-8 mb-4" />
                    <p className="text-lg font-bold leading-tight">
                      Smart Resolution for faster justice.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-100/30 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <p className="text-5xl font-serif italic font-bold text-emerald-400 mb-2">
                {loadingStats ? "0" : resolvedCases}+
              </p>
              <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">
                Resolved Cases
              </p>
            </div>
            <div>
              <p className="text-5xl font-serif italic font-bold text-emerald-400 mb-2">
                0h
              </p>
              <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">
                Avg. Resolution Time
              </p>
            </div>
            <div>
              <p className="text-5xl font-serif italic font-bold text-emerald-400 mb-2">
                100%
              </p>
              <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">
                Secure Submissions
              </p>
            </div>
            <div>
              <p className="text-5xl font-serif italic font-bold text-emerald-400 mb-2">
                24/7
              </p>
              <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">
                Online Support
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/10 skew-x-12 translate-x-1/2" />
      </section>

      {/* Features Grid */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <h2 className="text-5xl font-serif italic font-bold text-slate-900 mb-6">
              A System Built for <span className="text-emerald-600">You.</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              We've combined legal expertise with cutting-edge technology to
              create a platform that is accessible, secure, and efficient.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Secure & Anonymous
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Report sensitive matters without fear. Our platform uses
                end-to-end encryption and anonymous routing to protect your
                identity.
              </p>
            </div>

            <div className="group p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <BrainCircuit className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Automated Analysis
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Upload photos or videos and let our system extract key details,
                categorize your complaint, and suggest priority levels for
                faster processing.
              </p>
            </div>

            <div className="group p-10 bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="h-16 w-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Real-time Tracking
              </h3>
              <p className="text-slate-500 leading-relaxed">
                Stay informed at every step. Receive updates as your complaint
                moves from submission to investigation and final resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="max-w-5xl mx-auto bg-emerald-600 rounded-[60px] p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
          <div className="relative z-10">
            <h2 className="text-5xl md:text-6xl font-serif italic font-bold mb-8 leading-tight">
              Ready to seek{" "}
              <span className="underline decoration-emerald-300 underline-offset-8">
                justice?
              </span>
            </h2>
            <p className="text-emerald-100 text-xl mb-12 max-w-2xl mx-auto font-light">
              Join thousands of Kenyans who have successfully resolved their
              land grievances through our platform.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/submit"
                className="px-12 py-6 bg-white text-emerald-600 rounded-2xl font-bold text-xl hover:bg-emerald-50 transition-all shadow-xl"
              >
                Get Started Now
              </Link>
              <Link
                to="/anonymous"
                className="px-12 py-6 bg-emerald-700 text-white rounded-2xl font-bold text-xl hover:bg-emerald-800 transition-all border border-emerald-500"
              >
                Report Anonymously
              </Link>
            </div>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
        </div>
      </section>
    </div>
  );
};

export default Home;
