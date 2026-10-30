
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import {
  ArrowLeft,
  UserRound,
  Users,
  Phone,
  Mail,
  Building2,
  Stethoscope,
  Plus,
  Trash2,
  LoaderCircle,
  X,
} from "lucide-react";

const initialForm = {
  name: "",
  age: "",
  gender: "Male",
  phone: "",
  email: "",
  condition: "",
};

export default function DoctorDetailsClient() {
  const params = useParams();
  const router = useRouter();

  const doctorId = params.id;

  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  // Fetch Doctor and Patients
  const fetchDoctorDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [doctorResponse, patientResponse] = await Promise.all([
        api.get(`/doctors/${doctorId}`),
        api.get(`/patients/doctor/${doctorId}`),
      ]);

      const doctorData =
        doctorResponse.data.data?.doctor ||
        doctorResponse.data.data ||
        doctorResponse.data.doctor;

      const patientData = patientResponse.data.data;

      setDoctor(doctorData || null);
      setPatients(Array.isArray(patientData) ? patientData : []);
    } catch (error) {
      console.error("Failed to fetch doctor details:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load doctor details."
      );
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  // Fetch on Page Load
  useEffect(() => {
    if (doctorId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchDoctorDetails();
    }
  }, [doctorId, fetchDoctorDetails]);

  // Open Add Patient Modal
  const openAddModal = () => {
    setFormData(initialForm);
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

  // Add Patient
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSaving(true);

      const payload = {
        ...formData,
        age: Number(formData.age),
        doctor: doctorId,
      };

      await api.post("/patients", payload);

      setModalOpen(false);
      setFormData(initialForm);

      await fetchDoctorDetails();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add patient."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete Patient
  const handleDelete = async (patient) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${patient.name}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/patients/${patient._id}`);

      await fetchDoctorDetails();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete patient."
      );
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center gap-3 text-slate-500">
        <LoaderCircle
          size={26}
          className="animate-spin text-blue-600"
        />
        Loading doctor details...
      </div>
    );
  }

  // Doctor Not Found
  if (!doctor) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <Stethoscope
          size={42}
          className="mx-auto text-slate-300"
        />

        <h2 className="mt-4 text-lg font-semibold text-slate-800">
          Doctor not found
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {error || "The requested doctor could not be found."}
        </p>

        <button
          onClick={() => router.back()}
          className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Back to Doctors
          </button>

          <h1 className="text-2xl font-bold text-slate-800">
            Doctor Details
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View doctor information and manage assigned patients.
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

      {/* Error Message */}
      {error && !modalOpen && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
        >
          <p>{error}</p>

          <button
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Doctor Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Stethoscope size={38} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {doctor.name}
            </h2>

            <span className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {doctor.specialization}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <Building2 size={19} className="mt-1 text-slate-400" />

            <div>
              <p className="text-xs text-slate-400">Hospital</p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {doctor.hospital || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone size={19} className="mt-1 text-slate-400" />

            <div>
              <p className="text-xs text-slate-400">Phone</p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {doctor.phone || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail size={19} className="mt-1 text-slate-400" />

            <div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="mt-1 break-all text-sm font-medium text-slate-700">
                {doctor.email || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users size={19} className="mt-1 text-slate-400" />

            <div>
              <p className="text-xs text-slate-400">Total Patients</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {patients.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Users size={21} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-800">
                Assigned Patients
              </h2>

              <p className="text-xs text-slate-500">
                Patients registered under {doctor.name}
              </p>
            </div>
          </div>

          <span className="text-sm font-medium text-slate-500">
            Total: {patients.length}
          </span>
        </div>

        {patients.length === 0 ? (
          <div className="py-16 text-center">
            <UserRound
              size={42}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-3 font-semibold text-slate-700">
              No patients assigned
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Add a patient to this doctor to get started.
            </p>

            <button
              onClick={openAddModal}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={17} />
              Add Patient
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Patient</th>
                  <th className="px-5 py-4 font-medium">
                    Age / Gender
                  </th>
                  <th className="px-5 py-4 font-medium">Phone</th>
                  <th className="px-5 py-4 font-medium">
                    Condition
                  </th>
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

                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDelete(patient)}
                          title="Delete patient"
                          aria-label={`Delete ${patient.name}`}
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
        )}
      </div>

      {/* Add Patient Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Add Patient
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Assign a new patient to {doctor.name}.
                </p>
              </div>

              <button
                onClick={() => {
                  setModalOpen(false);
                  setError("");
                }}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
                >
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Name */}
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setError("");
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  )}
                  {saving ? "Adding..." : "Add Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
