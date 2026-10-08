"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type Patient = {
  _id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  condition: string;
  address: string;
  doctor?: {
    _id: string;
    name: string;
    specialization: string;
  };
  createdAt: string;
};

type Pagination = {
  currentPage: number;
  perPage: number;
  totalPatients: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export default function PatientsPage() {
  const router = useRouter();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    perPage: 10,
    totalPatients: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    condition: "",
    address: "",
  });

  const fetchPatients = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/");
        return;
      }

      const params: Record<string, string | number> = {
        page,
        limit: pagination.perPage,
      };

      if (search.trim()) params.search = search.trim();
      if (condition.trim()) params.condition = condition.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get("/patients", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;

      setPatients(data.patients || []);

      setPagination((prev) => ({
        ...prev,
        ...(data.pagination || {}),
      }));
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
        return;
      }

      setError(
        err.response?.data?.message || "Failed to load patients."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(1);
  }, []);

  const handleSearch = () => {
    fetchPatients(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCondition("");
    setStartDate("");
    setEndDate("");

    setTimeout(() => {
      fetchPatients(1);
    }, 0);
  };

  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient);

    setForm({
      name: patient.name || "",
      age: patient.age?.toString() || "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      email: patient.email || "",
      condition: patient.condition || "",
      address: patient.address || "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingPatient) return;

    try {
      setUpdating(true);

      const token = localStorage.getItem("token");

      await api.put(
        `/patients/${editingPatient._id}`,
        {
          name: form.name,
          age: Number(form.age),
          gender: form.gender,
          phone: form.phone,
          email: form.email,
          condition: form.condition,
          address: form.address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingPatient(null);
      await fetchPatients(pagination.currentPage);
    } catch (err: any) {
      alert(
        err.response?.data?.message || "Failed to update patient."
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPatient) return;

    try {
      setDeleting(true);

      const token = localStorage.getItem("token");

      await api.delete(`/patients/${deletingPatient._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDeletingPatient(null);

      const nextPage =
        patients.length === 1 && pagination.currentPage > 1
          ? pagination.currentPage - 1
          : pagination.currentPage;

      await fetchPatients(nextPage);
    } catch (err: any) {
      alert(
        err.response?.data?.message || "Failed to delete patient."
      );
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
              DT
            </div>

            <div>
              <p className="text-sm font-bold leading-tight text-slate-900">
                DoctorTracker
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Patient Management
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <span>←</span>
            Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {/* Page Intro */}
        <div className="mb-6">
          <div>
            <p className="mb-1 text-sm font-medium text-blue-600">
              Patient Management
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Patients
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
              Manage patient records, search medical information, and
              keep patient data organized.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Total Patients
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {pagination.totalPatients}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
                👥
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Current Results
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {patients.length}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-lg">
                ✓
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Current Page
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {pagination.currentPage}
                  <span className="ml-1 text-sm font-medium text-slate-400">
                    / {pagination.totalPages}
                  </span>
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-lg">
                #
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Search & Filters
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Search by patient information or narrow results by
              condition and date.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Search
              </label>

              <input
                type="text"
                placeholder="Name, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Condition
              </label>

              <input
                type="text"
                placeholder="e.g. Fever"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                From
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                To
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleSearch}
                className="h-10 flex-1 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
              >
                Search
              </button>

              <button
                onClick={clearFilters}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
              !
            </div>

            <div>
              <p className="text-sm font-semibold text-red-800">
                Unable to load patients
              </p>

              <p className="mt-0.5 text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Patient Records
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {pagination.totalPatients} patient
                {pagination.totalPatients !== 1 ? "s" : ""} available
              </p>
            </div>

            <div className="text-xs text-slate-400">
              Page {pagination.currentPage} of{" "}
              {pagination.totalPages}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50/80">
                <tr>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Patient
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Age / Gender
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Condition
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Doctor
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>

                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Added
                  </th>

                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                        <p className="mt-3 text-sm font-medium text-slate-600">
                          Loading patients...
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Please wait a moment
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                          👤
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-slate-900">
                          No patients found
                        </h3>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                          Try changing your search or filter criteria
                          to find patient records.
                        </p>

                        {(search ||
                          condition ||
                          startDate ||
                          endDate) && (
                          <button
                            onClick={clearFilters}
                            className="mt-4 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr
                      key={patient._id}
                      className="group transition hover:bg-slate-50/80"
                    >
                      {/* Patient */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600">
                            {getInitials(patient.name)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {patient.name}
                            </p>

                            <p className="mt-0.5 max-w-[190px] truncate text-xs text-slate-500">
                              {patient.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Age / Gender */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {patient.age} years
                          </p>

                          <span className="mt-1 inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            {patient.gender || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Condition */}
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {patient.condition || "N/A"}
                        </span>
                      </td>

                      {/* Doctor */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {patient.doctor?.name || "N/A"}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {patient.doctor?.specialization ||
                              "No specialization"}
                          </p>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {patient.phone || "N/A"}
                        </p>

                        {patient.email && (
                          <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-400">
                            {patient.email}
                          </p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {formatDate(patient.createdAt)}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(patient)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => setDeletingPatient(patient)}
                            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && patients.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500 sm:text-sm">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {(pagination.currentPage - 1) *
                    pagination.perPage +
                    1}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(
                    pagination.currentPage * pagination.perPage,
                    pagination.totalPatients
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.totalPatients}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  disabled={!pagination.hasPreviousPage}
                  onClick={() =>
                    fetchPatients(pagination.currentPage - 1)
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>

                <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white">
                  {pagination.currentPage}
                </span>

                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() =>
                    fetchPatients(pagination.currentPage + 1)
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Edit Patient
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Update the patient&apos;s information below.
                </p>
              </div>

              <button
                onClick={() => setEditingPatient(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Patient Name
                  </label>

                  <input
                    required
                    placeholder="Patient name"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Age
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="Age"
                    value={form.age}
                    onChange={(e) =>
                      setForm({ ...form, age: e.target.value })
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Gender
                  </label>

                  <select
                    required
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Phone
                  </label>

                  <input
                    required
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Condition
                  </label>

                  <input
                    required
                    placeholder="Patient condition"
                    value={form.condition}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        condition: e.target.value,
                      })
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Address
                </label>

                <textarea
                  placeholder="Patient address"
                  rows={4}
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditingPatient(null)}
                  disabled={updating}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updating ? "Updating..." : "Update Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-lg">
              ⚠️
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Delete Patient?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800">
                {deletingPatient.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setDeletingPatient(null)}
                disabled={deleting}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Patient"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}