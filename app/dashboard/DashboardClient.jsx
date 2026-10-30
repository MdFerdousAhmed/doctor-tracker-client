"use client";


import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  Stethoscope,
  Users,
  UserRound,
  CalendarDays,
  LoaderCircle,
  Activity,
} from "lucide-react";
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
} from "recharts";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get("/dashboard/stats");
        setStats(response.data.data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load dashboard statistics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoaderCircle className="animate-spin text-blue-600" size={35} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Doctors",
      value: stats?.totalDoctors || 0,
      icon: Stethoscope,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total Patients",
      value: stats?.totalPatients || 0,
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Recent Patients",
      value: stats?.recentPatients || 0,
      icon: UserRound,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Patient Conditions",
      value: stats?.patientsByCondition?.length || 0,
      icon: Activity,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const pieColors = [
    "#2563eb",
    "#16a34a",
    "#9333ea",
    "#ea580c",
    "#0891b2",
    "#db2777",
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
          Dashboard Overview
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Monitor your doctors, patients and medical activities.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {card.title}
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-slate-800">
                    {card.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-4 ${card.color}`}>
                  <Icon size={25} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Patients Per Doctor */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-800">
            Patients Per Doctor
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.patientsPerDoctor || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="doctorName"
                  tick={{ fontSize: 11 }}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="totalPatients"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patients Last 7 Days */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-800">
            Patients Last 7 Days
          </h2>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.patientsLast7Days || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="totalPatients"
                  fill="#16a34a"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Patients by Condition */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-slate-800">
          Patients by Condition
        </h2>

        {stats?.patientsByCondition?.length > 0 ? (
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.patientsByCondition}
                    dataKey="totalPatients"
                    nameKey="condition"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label
                  >
                    {stats.patientsByCondition.map((item, index) => (
                      <Cell
                        key={item.condition}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {stats.patientsByCondition.map((item, index) => (
                <div
                  key={item.condition}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          pieColors[index % pieColors.length],
                      }}
                    />

                    <span className="text-sm text-slate-600">
                      {item.condition}
                    </span>
                  </div>

                  <span className="font-semibold text-slate-800">
                    {item.totalPatients}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="py-10 text-center text-slate-500">
            No patient condition data available.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <CalendarDays size={16} />
        <span>Doctor Tracker Admin Dashboard</span>
      </div>
    </div>
  );
}
