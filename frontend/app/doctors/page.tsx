"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
};

type Pagination = {
  currentPage: number;
  perPage: number;
  totalDoctors: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

const emptyForm = {
  name: "",
  specialization: "",
  hospital: "",
  phone: "",
  email: "",
};

export default function DoctorsPage() {
  const router = useRouter();

  // =========================
  // Doctor List
  // =========================

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [pagination, setPagination] =
    useState<Pagination | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // Add Doctor
  // =========================

  const [showAddDoctor, setShowAddDoctor] =
    useState(false);

  const [addFormData, setAddFormData] =
    useState(emptyForm);

  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // =========================
  // Edit Doctor
  // =========================

  const [showEditDoctor, setShowEditDoctor] =
    useState(false);

  const [editingDoctorId, setEditingDoctorId] =
    useState("");

  const [editFormData, setEditFormData] =
    useState(emptyForm);

  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // =========================
  // Delete Doctor
  // =========================

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deletingDoctor, setDeletingDoctor] =
    useState<Doctor | null>(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [deleteError, setDeleteError] = useState("");

  // =========================
  // Fetch Doctors
  // =========================

  const fetchDoctors = async (
    currentPage: number,
    searchValue: string
  ) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/doctors", {
        params: {
          search: searchValue,
          page: currentPage,
          limit: 10,
        },
      });

      setDoctors(response.data.doctors);
      setPagination(response.data.pagination);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.replace("/");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to load doctors."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    fetchDoctors(page, search);
  }, [page, router]);

  // =========================
  // Search
  // =========================

  const handleSearch = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setPage(1);
    fetchDoctors(1, search);
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);

    fetchDoctors(1, "");
  };

  // =========================
  // Add Doctor
  // =========================

  const handleOpenAddDoctor = () => {
    setAddFormData(emptyForm);
    setAddError("");
    setShowAddDoctor(true);
  };

  const handleCloseAddDoctor = () => {
    if (addLoading) return;

    setShowAddDoctor(false);
    setAddError("");
  };

  const handleAddDoctor = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setAddLoading(true);
      setAddError("");

      await api.post("/doctors", {
        name: addFormData.name.trim(),
        specialization:
          addFormData.specialization.trim(),
        hospital: addFormData.hospital.trim(),
        phone: addFormData.phone.trim(),
        email: addFormData.email.trim(),
      });

      setShowAddDoctor(false);
      setAddFormData(emptyForm);

      await fetchDoctors(page, search);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.replace("/");
        return;
      }

      setAddError(
        error.response?.data?.message ||
          "Failed to create doctor."
      );
    } finally {
      setAddLoading(false);
    }
  };

  // =========================
  // Edit Doctor
  // =========================

  const handleOpenEditDoctor = (doctor: Doctor) => {
    setEditingDoctorId(doctor._id);

    setEditFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      phone: doctor.phone,
      email: doctor.email,
    });

    setEditError("");
    setShowEditDoctor(true);
  };

  const handleCloseEditDoctor = () => {
    if (editLoading) return;

    setShowEditDoctor(false);
    setEditError("");
    setEditingDoctorId("");
  };

  const handleUpdateDoctor = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setEditLoading(true);
      setEditError("");

      await api.put(
        `/doctors/${editingDoctorId}`,
        {
          name: editFormData.name.trim(),
          specialization:
            editFormData.specialization.trim(),
          hospital: editFormData.hospital.trim(),
          phone: editFormData.phone.trim(),
          email: editFormData.email.trim(),
        }
      );

      setShowEditDoctor(false);
      setEditingDoctorId("");

      await fetchDoctors(page, search);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.replace("/");
        return;
      }

      setEditError(
        error.response?.data?.message ||
          "Failed to update doctor."
      );
    } finally {
      setEditLoading(false);
    }
  };

  // =========================
  // Delete Doctor
  // =========================

  const handleOpenDeleteModal = (doctor: Doctor) => {
    setDeletingDoctor(doctor);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    if (deleteLoading) return;

    setShowDeleteModal(false);
    setDeletingDoctor(null);
    setDeleteError("");
  };

  const handleDeleteDoctor = async () => {
    if (!deletingDoctor) return;

    try {
      setDeleteLoading(true);
      setDeleteError("");

      await api.delete(
        `/doctors/${deletingDoctor._id}`
      );

      setShowDeleteModal(false);
      setDeletingDoctor(null);

      if (doctors.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await fetchDoctors(page, search);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.replace("/");
        return;
      }

      setDeleteError(
        error.response?.data?.message ||
          "Failed to delete doctor."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // =========================
  // Reusable Form Fields
  // =========================

  const renderDoctorForm = (
    formData: typeof emptyForm,
    setFormData: React.Dispatch<
      React.SetStateAction<typeof emptyForm>
    >,
    isEdit = false
  ) => {
    return (
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Doctor Name
          </label>

          <input
            type="text"
            value={formData.name}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            placeholder="Enter doctor name"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        {/* Specialization */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Specialization
          </label>

          <input
            type="text"
            value={formData.specialization}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                specialization: event.target.value,
              }))
            }
            placeholder="e.g. Cardiologist"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        {/* Hospital */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Hospital
          </label>

          <input
            type="text"
            value={formData.hospital}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                hospital: event.target.value,
              }))
            }
            placeholder="Enter hospital name"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Phone
          </label>

          <input
            type="tel"
            value={formData.phone}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                phone: event.target.value,
              }))
            }
            placeholder="Enter phone number"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>

          <input
            type="email"
            value={formData.email}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            placeholder="doctor@example.com"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        {isEdit && null}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="lg:ml-4">

        {/* =========================
            Header
        ========================= */}

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Doctors
              </h1>

              <span className="hidden rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 sm:inline-flex">
                Management
              </span>
            </div>

            <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
              Manage doctors and their information
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          >
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
                d="M3 12l9-9 9 9M5 10v10h14V10M9 20v-6h6v6"
              />
            </svg>

            <span className="hidden sm:inline">
              Dashboard
            </span>
          </button>
        </header>

        <section className="p-4 sm:p-6">

          {/* =========================
              Page Intro
          ========================= */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Doctor List
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View, search and manage all registered doctors.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddDoctor}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
            >
              <span className="text-lg leading-none">
                +
              </span>
              Add Doctor
            </button>
          </div>

          {/* =========================
              Search Card
          ========================= */}

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />
                  <path
                    strokeLinecap="round"
                    d="m20 20-4-4"
                  />
                </svg>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Search Doctors
                </p>

                <p className="text-xs text-slate-500">
                  Search by name, specialization or hospital
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-3 md:flex-row"
            >
              <div className="relative flex-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />
                  <path
                    strokeLinecap="round"
                    d="m20 20-4-4"
                  />
                </svg>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search doctors..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
              >
                Search
              </button>

              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* =========================
              Stats Bar
          ========================= */}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <p className="text-sm font-medium text-slate-600">
                {pagination?.totalDoctors || 0} doctors registered
              </p>
            </div>

            {pagination && (
              <p className="text-xs text-slate-400">
                Showing{" "}
                {doctors.length} of{" "}
                {pagination.totalDoctors}
              </p>
            )}
          </div>

          {/* =========================
              Loading / Error / Empty
          ========================= */}

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
              <div className="flex flex-col items-center justify-center">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                <p className="mt-4 text-sm font-medium text-slate-600">
                  Loading doctors...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Please wait a moment
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                  !
                </div>

                <div>
                  <p className="font-semibold text-red-800">
                    Something went wrong
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.7}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6"
                  />
                </svg>
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-900">
                No doctors found
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                {search
                  ? "Try changing your search keywords or clear the search."
                  : "Start by adding your first doctor to the system."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={handleOpenAddDoctor}
                  className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  + Add Doctor
                </button>
              )}
            </div>
          ) : (
            <>
              {/* =========================
                  Doctor Table
              ========================= */}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px] text-left">
                    <thead className="border-b border-slate-200 bg-slate-50/80">
                      <tr>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Doctor
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Specialization
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Hospital
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Phone
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Email
                        </th>

                        <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {doctors.map((doctor) => (
                        <tr
                          key={doctor._id}
                          className="group transition hover:bg-slate-50/80"
                        >
                          {/* Doctor */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                                {doctor.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {doctor.name}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  Doctor
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Specialization */}
                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                              {doctor.specialization}
                            </span>
                          </td>

                          {/* Hospital */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 shrink-0 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={1.8}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3 21h18M5 21V6a2 2 0 012-2h10a2 2 0 012 2v15M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"
                                />
                              </svg>

                              <span className="max-w-[200px] truncate text-sm text-slate-600">
                                {doctor.hospital}
                              </span>
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {doctor.phone}
                          </td>

                          {/* Email */}
                          <td className="px-6 py-4">
                            <span className="block max-w-[210px] truncate text-sm text-slate-600">
                              {doctor.email}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {/* View */}
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/doctors/${doctor._id}`
                                  )
                                }
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                              >
                                View
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenEditDoctor(
                                    doctor
                                  )
                                }
                                className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:border-blue-200 hover:bg-blue-100"
                              >
                                Edit
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenDeleteModal(
                                    doctor
                                  )
                                }
                                className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* =========================
                  Pagination
              ========================= */}

              {pagination &&
                pagination.totalPages > 1 && (
                  <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      Page{" "}
                      <span className="font-semibold text-slate-900">
                        {pagination.currentPage}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-slate-900">
                        {pagination.totalPages}
                      </span>
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setPage(
                            (current) => current - 1
                          )
                        }
                        disabled={
                          !pagination.hasPreviousPage
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
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
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>

                        Previous
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setPage(
                            (current) => current + 1
                          )
                        }
                        disabled={
                          !pagination.hasNextPage
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next

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
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
            </>
          )}
        </section>
      </main>

      {/* =========================
          Add Doctor Modal
      ========================= */}

      {showAddDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
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

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Add Doctor
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Add a new doctor to your system
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseAddDoctor}
                disabled={addLoading}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleAddDoctor}
              className="p-5 sm:p-6"
            >
              {renderDoctorForm(
                addFormData,
                setAddFormData
              )}

              {addError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {addError}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseAddDoctor}
                  disabled={addLoading}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addLoading}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addLoading
                    ? "Saving..."
                    : "Save Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          Edit Doctor Modal
      ========================= */}

      {showEditDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
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
                      d="M16.862 4.487l1.651-1.651a2.1 2.1 0 013 3l-1.651 1.651M16.862 4.487L7.5 13.849 7 17l3.151-.5 9.362-9.362M16.862 4.487l2.651 2.651"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Edit Doctor
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Update doctor information
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseEditDoctor}
                disabled={editLoading}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleUpdateDoctor}
              className="p-5 sm:p-6"
            >
              {renderDoctorForm(
                editFormData,
                setEditFormData
              )}

              {editError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {editError}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseEditDoctor}
                  disabled={editLoading}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editLoading}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editLoading
                    ? "Updating..."
                    : "Update Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          Delete Modal
      ========================= */}

      {showDeleteModal && deletingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v4M12 17h.01M10.29 3.86l-8.1 14a2 2 0 001.73 3h16.16a2 2 0 001.73-3l-8.1-14a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Delete Doctor?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-800">
                  {deletingDoctor.name}
                </span>
                ?
              </p>

              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v4M12 17h.01"
                    />
                  </svg>

                  <p className="text-sm leading-5 text-red-600">
                    Warning: deleting this doctor will
                    also delete all patients associated
                    with this doctor.
                  </p>
                </div>
              </div>

              {deleteError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {deleteError}
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  disabled={deleteLoading}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteDoctor}
                  disabled={deleteLoading}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleteLoading
                    ? "Deleting..."
                    : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}