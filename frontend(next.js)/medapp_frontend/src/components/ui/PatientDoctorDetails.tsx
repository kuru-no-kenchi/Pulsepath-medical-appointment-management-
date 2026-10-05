"use client";
import { FiArrowLeft, FiMail, FiPhone, FiUser } from "react-icons/fi";
import { FaUserDoctor } from "react-icons/fa6";
import { PatientDoctorView } from "@/types/patients";
import { capitalizeName } from "@/lib/capitalizeName";

interface Props {
  doctor: PatientDoctorView;
  onBack: () => void;
}

export default function DetailsDashboard({ doctor, onBack }: Props) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* HEADER */}

      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={onBack}
            aria-label="Back"
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-900 to-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mb-5"
          >
            <FiArrowLeft aria-hidden="true"/>
            Back
          </button>
          <h1 className="text-3xl font-bold">Patient Details</h1>
        </div>
        <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium">
          Active Doctor
        </span>
      </div>

      {/* PROFILE CARD */}

      <div className="bg-white rounded-2xl shadow border p-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
            <FiUser size={40} className="text-blue-600" />
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              {capitalizeName(doctor.firstName)} {capitalizeName(doctor.lastName)}
            </h2>
          </div>
        </div>
      </div>

      {/* INFORMATION */}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* PERSONAL */}

        <div className="bg-white rounded-2xl shadow border p-6">
          <h3 className="text-xl font-semibold mb-5">Personal Information</h3>

          <div className="space-y-5">
            <InfoRow
              icon={<FiUser />}
              label="First Name"
              value={`${capitalizeName(doctor.firstName)}`}
            />

            <InfoRow
              icon={<FiUser />}
              label="Last Name"
              value={`${capitalizeName(doctor.lastName)}`}
            />
          </div>
        </div>

        {/* CONTACT */}

        <div className="bg-white rounded-2xl shadow border p-6">
          <h3 className="text-xl font-semibold mb-5">Contact Information</h3>

          <div className="space-y-5">
            <InfoRow icon={<FiMail />} label="Email" value={doctor.email} />

            <InfoRow icon={<FiPhone />} label="Phone" value={doctor.phone} />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow border p-6">
          <h3 className="text-xl font-semibold mb-5">Specialty</h3>
          <InfoRow
            icon={<FaUserDoctor />}
            label="Specilty"
            value={doctor.specialty}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between items-center border-b pb-3">
      <div className="flex items-center gap-3 text-gray-500">
        <div className="text-blue-600">{icon}</div>

        <span>{label}</span>
      </div>

      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
