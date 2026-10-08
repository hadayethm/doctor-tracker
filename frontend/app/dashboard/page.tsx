"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type DashboardStats = {
  totalDoctors: number;
  totalPatients: number;
  patientsPerDoctor: {
    doctorId: string;
    doctorName: string;
    specialization: string;
    patientCount: number;
  }[];
  patientsByDate: {
    _id: string;
    count: number;
  }[];
  recentPatients: {
    _id: string;
    name: string;
    condition: string;
    doctor?: {
      name: string;
      specialization: string;
    };
    createdAt: string;
  }[];
};

export default function DashboardPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("Admin");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token) {
      router.replace("/");
      return;
    }

    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserName(parsedUser.name || "Admin");
      } catch {
        setUserName("Admin");
      }
    }

    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard");

        setStats(response.data.stats);
      } catch (error: any) {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          router.replace("/");
          return;
        }

        setError(
          error.response?.data?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.replace("/");
  };

  const handleNavigation = (path: string) => {
    setSidebarOpen(false);
    router.push(path);
  };

  const averagePatients =
    stats && stats.totalDoctors > 0
      ? (stats.totalPatients / stats.totalDoctors).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 lg:shadow-none lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <button
            type="button"
            onClick={() => handleNavigation("/dashboard")}
            className="flex items-center gap-2"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
              DT
            </span>

            <span className="text-lg font-bold tracking-tight text-slate-900">
              Doctor<span className="text-blue-600">Tracker</span>
            </span>
          </button>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 lg:hidden"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 p-4">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          {/* Dashboard */}
          <button
            type="button"
            onClick={() => handleNavigation("/dashboard")}
            className="group flex w-full items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-left text-sm font-semibold text-blue-700 transition"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3h8v4h-8V3zM3 17h8v4H3v-4z"
                />
              </svg>
            </span>

            Dashboard
          </button>

          {/* Doctors */}
          <button
            type="button"
            onClick={() => handleNavigation("/doctors")}
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6"
                />
              </svg>
            </span>

            Doctors
          </button>

          {/* Patients */}
          <button
            type="button"
            onClick={() => handleNavigation("/patients")}
            className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-blue-50 group-hover:text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6"
                />
              </svg>
            </span>

            Patients
          </button>
        </nav>

        {/* Sidebar User */}
        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {userName}
              </p>

              <p className="text-xs text-slate-500">
                Administrator
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
              />
            </svg>

            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              {/* Hamburger */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 lg:hidden"
                aria-label="Open menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Dashboard
                </h2>

                <p className="hidden text-xs text-slate-500 sm:block">
                  Overview of your doctor and patient data
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {userName}
                </p>

                <p className="text-xs text-slate-500">
                  Administrator
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="p-4 sm:p-6">
          {/* Page Intro */}
          <div className="mb-6">
            <p className="text-sm text-slate-500">
              Welcome back,{" "}
              <span className="font-medium text-slate-700">
                {userName}
              </span>
              . Here&apos;s what&apos;s happening today.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                <p className="text-sm text-slate-500">
                  Loading dashboard...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
              {error}
            </div>
          ) : stats ? (
            <>
              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Doctors */}
                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Total Doctors
                      </p>

                      <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        {stats.totalDoctors}
                      </h3>

                      <p className="mt-2 text-xs text-slate-400">
                        Registered doctors
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Patients */}
                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Total Patients
                      </p>

                      <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        {stats.totalPatients}
                      </h3>

                      <p className="mt-2 text-xs text-slate-400">
                        Registered patients
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Average */}
                <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:col-span-2 lg:col-span-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Avg. Patients / Doctor
                      </p>

                      <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        {averagePatients}
                      </h3>

                      <p className="mt-2 text-xs text-slate-400">
                        Current patient ratio
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 17v-2a4 4 0 014-4h5M9 17H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v4M9 17v2m0 0h6m-6 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patients per doctor */}
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Patients per Doctor
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Patient distribution across doctors
                    </p>
                  </div>

                  <span className="hidden rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:block">
                    {stats.patientsPerDoctor.length} doctors
                  </span>
                </div>

                {stats.patientsPerDoctor.length === 0 ? (
                  <p className="p-6 text-sm text-slate-500">
                    No patient data available.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {stats.patientsPerDoctor.map((doctor) => (
                      <div
                        key={doctor.doctorId}
                        className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                            {doctor.doctorName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {doctor.doctorName}
                            </p>

                            <p className="truncate text-sm text-slate-500">
                              {doctor.specialization}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                          {doctor.patientCount}{" "}
                          {doctor.patientCount === 1
                            ? "patient"
                            : "patients"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent patients */}
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Recent Patients
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Latest patient registrations
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigation("/patients")}
                    className="text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    View all →
                  </button>
                </div>

                {stats.recentPatients.length === 0 ? (
                  <p className="p-6 text-sm text-slate-500">
                    No patients available.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {stats.recentPatients.map((patient) => (
                      <div
                        key={patient._id}
                        className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-600">
                            {patient.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {patient.name}
                            </p>

                            <p className="truncate text-sm text-slate-500">
                              {patient.condition || "No condition"}
                            </p>
                          </div>
                        </div>

                        <div className="pl-12 text-left sm:pl-0 sm:text-right">
                          <p className="text-sm font-medium text-slate-700">
                            {patient.doctor?.name ||
                              "Unknown Doctor"}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {new Date(
                              patient.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Patient Activity Chart */}
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900">
                    Patient Activity
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Patients added during the last 7 days
                  </p>
                </div>

                {stats.patientsByDate.length === 0 ? (
                  <div className="flex h-72 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
                    No patient activity available.
                  </div>
                ) : (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={stats.patientsByDate}
                        margin={{
                          top: 5,
                          right: 10,
                          left: -20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="_id"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />

                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow:
                              "0 10px 30px rgba(15, 23, 42, 0.08)",
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={{
                            r: 4,
                            fill: "#2563eb",
                          }}
                          activeDot={{
                            r: 6,
                            fill: "#2563eb",
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}