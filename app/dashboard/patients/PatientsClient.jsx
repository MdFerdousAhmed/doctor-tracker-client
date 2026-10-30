
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserRound,
  Phone,
  Mail,
  CalendarDays,
  Stethoscope,
  Activity,
} from "lucide-react";

const initialForm = {
  name: "",
  age: "",
  gender: "Male",
  phone: "",
  email: "",
  condition: "",
  doctor: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function PatientsClient() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [condition, setCondition] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 10,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");

  // Fetch Doctors
  const fetchDoctors = async () => {
    try {
      const response = await api.get("/doctors", {
        params: { limit: 100 },
      });

      const doctorList = response.data.data;

      setDoctors(Array.isArray(doctorList) ? doctorList : []);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    }
  };

  // Fetch Patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/patients", {
        params: {
          search,
          condition,
          startDate,
          endDate,
          page,
          limit: 10,
        },
      });

      const patientList = response.data.data;
      const paginationData = response.data.pagination;

      setPatients(Array.isArray(patientList) ? patientList : []);

      setPagination({
        total: paginationData?.totalPatients ?? 0,
        totalPages: paginationData?.totalPages ?? 1,
        limit: paginationData?.limit ?? 10,
      });
    } catch (error) {
      console.error("Failed to fetch patients:", error);

      setError(
        error.response?.data?.message || "Failed to load patients."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load Doctors
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Load Patients
  useEffect(() => {
    fetchPatients();
  }, [search, condition, startDate, endDate, page]);

  // Open View Modal
  const openViewModal = async (patient) => {
    setSelectedPatient(patient);
    setViewModalOpen(true);
  };

  // Close View Modal
  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedPatient(null);
  };

  // Open Add Modal
  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setError("");
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (patient) => {
    setEditingId(patient._id);

    setFormData({
      name: patient.name || "",
      age: patient.age ?? "",
      gender: patient.gender || "Male",
      phone: patient.phone || "",
      email: patient.email || "",
      condition: patient.condition || "",
      doctor: patient.doctor?._id || patient.doctor || "",
    });

    setError("");
    setModalOpen(true);
  };

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Handle Add / Update Patient
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.doctor) {
      setError("Please select a doctor.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,
        age: Number(formData.age),
      };

      if (editingId) {
        await api.patch(`/patients/${editingId}`, payload);
      } else {
        await api.post("/patients", payload);
      }

      setModalOpen(false);
      setFormData(initialForm);
      setEditingId(null);

      await fetchPatients();
    } catch (error) {
      setError(
        error.response?.data?.message || "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Patient
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this patient?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/patients/${id}`);

      if (selectedPatient?._id === id) {
        closeViewModal();
      }

      await fetchPatients();
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to delete patient."
      );
    }
  };

  // Format Date
  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Patients Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage all registered patients.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Patient
        </button>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search patients..."
              className={`${inputClass} pl-10`}
            />
          </div>

          {/* Condition */}
          <input
            type="text"
            value={condition}
            onChange={(e) => {
              setCondition(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by condition"
            className={inputClass}
          />

          {/* Start Date */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className={`${inputClass} [color-scheme:light]`}
          />

          {/* End Date */}
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className={`${inputClass} [color-scheme:light]`}
          />
        </div>
      </div>

      {/* Patient Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 p-5">
          <Users size={20} className="text-blue-600" />

          <h2 className="font-semibold text-slate-800">
            Patient List
          </h2>

          <span className="ml-auto text-sm text-slate-500">
            Total: {pagination.total}
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <LoaderCircle
              className="animate-spin text-blue-600"
              size={30}
            />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-600">
            {error}
          </div>
        ) : patients.length === 0 ? (
          <div className="py-16 text-center">
            <Users
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium text-slate-600">
              No patients found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Add a patient to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Patient</th>
                  <th className="px-5 py-4 font-medium">Age / Gender</th>
                  <th className="px-5 py-4 font-medium">Phone</th>
                  <th className="px-5 py-4 font-medium">Condition</th>
                  <th className="px-5 py-4 font-medium">Doctor</th>
                  <th className="px-5 py-4 text-right font-medium">
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
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {patient.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        {patient.email || "No email"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {patient.age} / {patient.gender}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {patient.phone}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {patient.condition}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {patient.doctor?.name ||
                        (typeof patient.doctor === "string"
                          ? "Doctor assigned"
                          : "Unknown")}
                    </td>

                    {/* View, Edit, Delete */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openViewModal(patient)}
                          className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                          title="View patient"
                          aria-label="View patient"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() => openEditModal(patient)}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Edit patient"
                          aria-label="Edit patient"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(patient._id)}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                          title="Delete patient"
                          aria-label="Delete patient"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-500">
            Page {page} of {pagination.totalPages}
          </p>

          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((previous) => previous - 1)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((previous) => previous + 1)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* View Patient Details Modal */}
      {viewModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <UserRound size={20} />
                  </div>

                  <h2 className="text-lg font-bold text-slate-800">
                    Patient Details
                  </h2>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Complete patient information.
                </p>
              </div>

              <button
                onClick={closeViewModal}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            {/* Patient Profile */}
            <div className="p-5">
              <div className="mb-6 flex items-center gap-4 rounded-xl bg-blue-50 p-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                  {selectedPatient.name?.charAt(0)?.toUpperCase() || "P"}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {selectedPatient.name}
                  </h3>

                  <p className="text-sm text-slate-500">
                    Patient ID: {selectedPatient._id}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 p-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-400">
                    <UserRound size={17} />
                    <span className="text-xs font-medium uppercase">
                      Age / Gender
                    </span>
                  </div>

                  <p className="font-semibold text-slate-800">
                    {selectedPatient.age} years / {selectedPatient.gender}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 p-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-400">
                    <Phone size={17} />
                    <span className="text-xs font-medium uppercase">
                      Phone
                    </span>
                  </div>

                  <p className="font-semibold text-slate-800">
                    {selectedPatient.phone || "Not available"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 p-4 sm:col-span-2">
                  <div className="mb-2 flex items-center gap-2 text-slate-400">
                    <Mail size={17} />
                    <span className="text-xs font-medium uppercase">
                      Email Address
                    </span>
                  </div>

                  <p className="break-all font-semibold text-slate-800">
                    {selectedPatient.email || "No email provided"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 p-4 sm:col-span-2">
                  <div className="mb-2 flex items-center gap-2 text-slate-400">
                    <Activity size={17} />
                    <span className="text-xs font-medium uppercase">
                      Medical Condition
                    </span>
                  </div>

                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                    {selectedPatient.condition || "Not available"}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-100 p-4 sm:col-span-2">
                  <div className="mb-2 flex items-center gap-2 text-slate-400">
                    <Stethoscope size={17} />
                    <span className="text-xs font-medium uppercase">
                      Assigned Doctor
                    </span>
                  </div>

                  <p className="font-semibold text-slate-800">
                    {selectedPatient.doctor?.name ||
                      (typeof selectedPatient.doctor === "string"
                        ? "Doctor assigned"
                        : "Unknown")}
                  </p>

                  {selectedPatient.doctor?.specialization && (
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedPatient.doctor.specialization}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-100 p-4 sm:col-span-2">
                  <div className="mb-2 flex items-center gap-2 text-slate-400">
                    <CalendarDays size={17} />
                    <span className="text-xs font-medium uppercase">
                      Registration Date
                    </span>
                  </div>

                  <p className="font-semibold text-slate-800">
                    {formatDate(selectedPatient.createdAt)}
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  onClick={closeViewModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    closeViewModal();
                    openEditModal(selectedPatient);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <Pencil size={16} />
                  Edit Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Patient Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingId ? "Edit Patient" : "Add New Patient"}
                </h2>

                <p className="text-sm text-slate-500">
                  Enter patient information below.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Patient Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Patient Name *
                  </label>

                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter patient name"
                    className={inputClass}
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Age *
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter age"
                    className={inputClass}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Gender *
                  </label>

                  <select
                    required
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`${inputClass} [color-scheme:light]`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Phone *
                  </label>

                  <input
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className={inputClass}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    className={inputClass}
                  />
                </div>

                {/* Condition */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Condition *
                  </label>

                  <input
                    required
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    placeholder="e.g. Heart Disease"
                    className={inputClass}
                  />
                </div>

                {/* Doctor */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Assigned Doctor *
                  </label>

                  <select
                    required
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleChange}
                    className={`${inputClass} [color-scheme:light]`}
                  >
                    <option value="">Select a doctor</option>

                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name} — {doctor.specialization}
                      </option>
                    ))}
                  </select>

                  {doctors.length === 0 && (
                    <p className="mt-2 text-xs text-red-500">
                      No doctors available. Please add a doctor first.
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || doctors.length === 0}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving && (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {editingId ? "Update Patient" : "Save Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
