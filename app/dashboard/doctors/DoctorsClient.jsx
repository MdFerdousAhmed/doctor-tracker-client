"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Stethoscope,
  LoaderCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

const initialForm = {
  name: "",
  specialization: "",
  hospital: "",
  phone: "",
  email: "",
};

export default function DoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    limit: 10,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/doctors", {
        params: {
          search,
          page,
          limit: 10,
        },
      });

      const result = response.data.data;

      setDoctors(Array.isArray(result) ? result : []);

      setPagination({
        total: response.data.pagination?.totalDoctors ?? 0,
        totalPages: response.data.pagination?.totalPages ?? 1,
        limit: response.data.pagination?.limit ?? 10,
      });
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchDoctors]);

  const openAddModal = () => {
    setEditingDoctor(null);
    setFormData(initialForm);
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      hospital: doctor.hospital || "",
      phone: doctor.phone || "",
      email: doctor.email || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingDoctor) {
        await api.patch(`/doctors/${editingDoctor._id}`, formData);
      } else {
        await api.post("/doctors", formData);
      }

      setModalOpen(false);
      setFormData(initialForm);
      setEditingDoctor(null);

      if (!editingDoctor && page !== 1) {
        setPage(1);
      } else {
        await fetchDoctors();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save doctor.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (doctor) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${doctor.name}?`,
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/doctors/${doctor._id}`);

      if (doctors.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        await fetchDoctors();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete doctor.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Doctors Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage doctors and their information.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={19} />
          Add Doctor
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search doctors..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>

          <button onClick={() => setError("")} aria-label="Dismiss error">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">
            <LoaderCircle className="animate-spin" size={22} />
            Loading doctors...
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
            <Stethoscope size={42} className="text-slate-300" />

            <h3 className="mt-4 font-semibold text-slate-700">
              No doctors found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add a doctor or try another search.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Specialization</th>
                    <th className="px-6 py-4">Hospital</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {doctors.map((doctor) => (
                    <tr
                      key={doctor._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">
                          {doctor.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {doctor.email}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                          {doctor.specialization}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {doctor.hospital || "—"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {doctor.phone}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              router.push(`/dashboard/doctors/${doctor._id}`)
                            }
                            aria-label={`View ${doctor.name}`}
                            title="View Details"
                            className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            onClick={() => openEditModal(doctor)}
                            aria-label={`Edit ${doctor.name}`}
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => handleDelete(doctor)}
                            aria-label={`Delete ${doctor.name}`}
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
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

            <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
              <p className="text-sm text-slate-500">
                Total doctors:{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.total}
                </span>
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setPage((current) => current - 1)}
                  disabled={page <= 1}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                  Previous
                </button>

                <span className="text-sm text-slate-600">
                  Page {page} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => setPage((current) => current + 1)}
                  disabled={page >= pagination.totalPages}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-modal-title"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2
                  id="doctor-modal-title"
                  className="text-xl font-bold text-slate-800"
                >
                  {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the doctor's information below.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: "name", label: "Full Name", required: true },
                {
                  name: "specialization",
                  label: "Specialization",
                  required: true,
                },
                { name: "hospital", label: "Hospital", required: false },
                { name: "phone", label: "Phone", required: true },
                { name: "email", label: "Email", required: true },
              ].map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    {field.label}
                  </label>

                  <input
                    id={field.name}
                    name={field.name}
                    type={field.name === "email" ? "email" : "text"}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.required}
                    maxLength={field.name === "hospital" ? 200 : 100}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ))}

              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setError("");
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle size={17} className="animate-spin" />
                  )}

                  {editingDoctor ? "Save Changes" : "Add Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
