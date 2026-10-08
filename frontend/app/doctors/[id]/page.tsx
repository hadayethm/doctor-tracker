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

type Patient = {
  _id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  condition: string;
  address: string;
  doctor: string;
  createdAt: string;
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const emptyPatientForm = {
  name: "",
  age: "",
  gender: "",
  phone: "",
  email: "",
  condition: "",
  address: "",
};

export default function DoctorDetailsPage({ params }: Props) {
  const router = useRouter();

  const [doctorId, setDoctorId] = useState("");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add patient
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingPatient, setAddingPatient] = useState(false);
  const [patientError, setPatientError] = useState("");

  // Edit patient
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPatient, setEditingPatient] =
    useState<Patient | null>(null);
  const [updatingPatient, setUpdatingPatient] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete patient
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPatient, setDeletingPatient] =
    useState<Patient | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [patientForm, setPatientForm] = useState(
    emptyPatientForm
  );

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setDoctorId(resolvedParams.id);
    };

    getParams();
  }, [params]);

  const fetchDoctorDetails = async () => {
    if (!doctorId) return;

    try {
      setLoading(true);
      setError("");

      const [doctorResponse, patientsResponse] =
        await Promise.all([
          api.get(`/doctors/${doctorId}`),
          api.get(`/doctors/${doctorId}/patients`),
        ]);

      setDoctor(doctorResponse.data.doctor);
      setPatients(patientsResponse.data.patients || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.replace("/");
        return;
      }

      setError(
        error.response?.data?.message ||
          "Failed to load doctor details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetails();
    }
  }, [doctorId]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/");
    }
  }, [router]);

  // -------------------------
  // Patient form change
  // -------------------------

  const handlePatientChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setPatientForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -------------------------
  // Add patient
  // -------------------------

  const openAddModal = () => {
    setPatientForm(emptyPatientForm);
    setPatientError("");
    setShowAddModal(true);
  };

  const handleAddPatient = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setAddingPatient(true);
      setPatientError("");

      await api.post("/patients", {
        name: patientForm.name,
        age: Number(patientForm.age),
        gender: patientForm.gender,
        phone: patientForm.phone,
        email: patientForm.email,
        condition: patientForm.condition,
        address: patientForm.address,
        doctor: doctorId,
      });

      setPatientForm(emptyPatientForm);
      setShowAddModal(false);

      await fetchDoctorDetails();
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.replace("/");
        return;
      }

      setPatientError(
        error.response?.data?.message ||
          "Failed to add patient."
      );
    } finally {
      setAddingPatient(false);
    }
  };

  // -------------------------
  // Edit patient
  // -------------------------

  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient);

    setPatientForm({
      name: patient.name || "",
      age: patient.age?.toString() || "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      email: patient.email || "",
      condition: patient.condition || "",
      address: patient.address || "",
    });

    setEditError("");
    setShowEditModal(true);
  };

  const handleUpdatePatient = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!editingPatient) return;

    try {
      setUpdatingPatient(true);
      setEditError("");

      await api.put(`/patients/${editingPatient._id}`, {
        name: patientForm.name,
        age: Number(patientForm.age),
        gender: patientForm.gender,
        phone: patientForm.phone,
        email: patientForm.email,
        condition: patientForm.condition,
        address: patientForm.address,
      });

      setShowEditModal(false);
      setEditingPatient(null);
      setPatientForm(emptyPatientForm);

      await fetchDoctorDetails();
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.replace("/");
        return;
      }

      setEditError(
        error.response?.data?.message ||
          "Failed to update patient."
      );
    } finally {
      setUpdatingPatient(false);
    }
  };

  // -------------------------
  // Delete patient
  // -------------------------

  const openDeleteModal = (patient: Patient) => {
    setDeletingPatient(patient);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const handleDeletePatient = async () => {
    if (!deletingPatient) return;

    try {
      setDeleteLoading(true);
      setDeleteError("");

      await api.delete(`/patients/${deletingPatient._id}`);

      setShowDeleteModal(false);
      setDeletingPatient(null);

      await fetchDoctorDetails();
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.replace("/");
        return;
      }

      setDeleteError(
        error.response?.data?.message ||
          "Failed to delete patient."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // -------------------------
  // Loading
  // -------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <main className="lg:ml-64">
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-sm text-slate-500">
              Loading doctor details...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // -------------------------
  // Error
  // -------------------------

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-slate-100">
        <main className="lg:ml-64">
          <div className="p-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm text-red-600">
                {error || "Doctor not found."}
              </p>

              <button
                type="button"
                onClick={() => router.push("/doctors")}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Back to Doctors
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="lg:ml-64">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Doctor Details
            </h1>

            <p className="text-xs text-slate-500">
              View doctor information and patients
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/doctors")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back to Doctors
          </button>
        </header>

        <section className="p-4 sm:p-6">
          {/* Doctor information */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                  {doctor.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {doctor.name}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-blue-600">
                    {doctor.specialization}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {doctor.hospital}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/doctors")}
                className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
              >
                Edit Doctor
              </button>
            </div>

            <div className="mt-6 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Phone
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {doctor.phone}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 break-all text-sm font-medium text-slate-800">
                  {doctor.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Total Patients
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {patients.length}
                </p>
              </div>
            </div>
          </div>

          {/* Patients header */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Patients
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Patients assigned to {doctor.name}
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              + Add Patient
            </button>
          </div>

          {/* Patient list */}
          {patients.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <span className="text-xl text-slate-400">+</span>
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-800">
                No patients yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add the first patient for this doctor.
              </p>

              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Add Patient
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                        Patient
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                        Age
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                        Gender
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                        Condition
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                        Phone
                      </th>

                      <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {patients.map((patient) => (
                      <tr
                        key={patient._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {patient.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {patient.email || "No email"}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {patient.age}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {patient.gender}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                            {patient.condition}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {patient.phone}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(patient)
                              }
                              className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openDeleteModal(patient)
                              }
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
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
          )}
        </section>
      </main>

      {/* ================================= */}
      {/* ADD PATIENT MODAL */}
      {/* ================================= */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add Patient
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Add a new patient for {doctor.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddPatient}>
              <div className="grid gap-5 p-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Patient Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={patientForm.name}
                    onChange={handlePatientChange}
                    required
                    placeholder="Enter patient name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Age
                  </label>

                  <input
                    type="number"
                    name="age"
                    value={patientForm.age}
                    onChange={handlePatientChange}
                    required
                    min="0"
                    placeholder="Enter age"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={patientForm.gender}
                    onChange={handlePatientChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={patientForm.phone}
                    onChange={handlePatientChange}
                    required
                    placeholder="Enter phone number"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={patientForm.email}
                    onChange={handlePatientChange}
                    placeholder="Enter email"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Condition
                  </label>

                  <input
                    type="text"
                    name="condition"
                    value={patientForm.condition}
                    onChange={handlePatientChange}
                    required
                    placeholder="e.g. Fever"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={patientForm.address}
                    onChange={handlePatientChange}
                    rows={3}
                    placeholder="Enter address"
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {patientError && (
                <div className="mx-6 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">
                    {patientError}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={addingPatient}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addingPatient}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {addingPatient ? "Adding..." : "Add Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================= */}
      {/* EDIT PATIENT MODAL */}
      {/* ================================= */}

      {showEditModal && editingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Edit Patient
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Update patient information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdatePatient}>
              <div className="grid gap-5 p-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Patient Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={patientForm.name}
                    onChange={handlePatientChange}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Age
                  </label>

                  <input
                    type="number"
                    name="age"
                    value={patientForm.age}
                    onChange={handlePatientChange}
                    required
                    min="0"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={patientForm.gender}
                    onChange={handlePatientChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={patientForm.phone}
                    onChange={handlePatientChange}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={patientForm.email}
                    onChange={handlePatientChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Condition
                  </label>

                  <input
                    type="text"
                    name="condition"
                    value={patientForm.condition}
                    onChange={handlePatientChange}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={patientForm.address}
                    onChange={handlePatientChange}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {editError && (
                <div className="mx-6 mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">
                    {editError}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={updatingPatient}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updatingPatient}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {updatingPatient
                    ? "Updating..."
                    : "Update Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================= */}
      {/* DELETE PATIENT MODAL */}
      {/* ================================= */}

      {showDeleteModal && deletingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <span className="text-xl text-red-600">!</span>
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                Delete Patient?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-700">
                  {deletingPatient.name}
                </span>
                ? This action cannot be undone.
              </p>

              {deleteError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">
                    {deleteError}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeletePatient}
                disabled={deleteLoading}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete Patient"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}