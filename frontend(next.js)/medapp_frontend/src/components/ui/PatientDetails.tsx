"use client";

import {
  FiArrowLeft,
  FiCalendar,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
  FiPhoneOutgoing,
} from "react-icons/fi";
import { BsGenderFemale, BsGenderMale } from "react-icons/bs";
import { Patient } from "@/types/patients";
import { capitalizeName } from "@/lib/capitalizeName";

interface Props {
  patient: Patient;
  onBack: () => void;
}

export default function DetailsDashboard({ patient, onBack }: Props) {
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

          <p className="text-gray-500 mt-1">#{patient.id}</p>
        </div>

        <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium">
          Active Patient
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
              {patient.gender == "FEMALE" ? "Ms." : "Mr."} {capitalizeName(patient.firstName)}{" "}
              {capitalizeName(patient.lastName)}
            </h2>

            <div className="flex items-center gap-3 mt-2 text-gray-500">
              {patient.gender == "FEMALE" ? (
                <BsGenderFemale className="text-pink-500" />
              ) : (
                <BsGenderMale className="text-blue-500" />
              )}

              <span>{patient.gender}</span>
            </div>
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
              label="Full Name"
              value={`${capitalizeName(patient.firstName)} ${capitalizeName(patient.lastName)}`}
            />

            <InfoRow
              icon={<FiCalendar />}
              label="Date of Birth"
              value={patient.dateOfBirth}
            />

            <InfoRow
              icon={
                patient.gender == "FEMALE" ? (
                  <BsGenderFemale />
                ) : (
                  <BsGenderMale />
                )
              }
              label="Gender"
              value={patient.gender}
            />
          </div>
        </div>

        {/* CONTACT */}

        <div className="bg-white rounded-2xl shadow border p-6">
          <h3 className="text-xl font-semibold mb-5">Contact Information</h3>

          <div className="space-y-5">
            <InfoRow icon={<FiMail />} label="Email" value={patient.email} />

            <InfoRow icon={<FiPhone />} label="Phone" value={patient.phone!} />

            <InfoRow
              icon={<FiMapPin />}
              label="Address"
              value={patient.address}
            />
          </div>
        </div>
      </div>

      {/* EMERGENCY */}

      <div className="bg-white rounded-2xl shadow border p-6">
        <h3 className="text-xl font-semibold mb-5">Emergency Contact</h3>

        <InfoRow
          icon={<FiPhoneOutgoing />}
          label="Emergency Number"
          value={patient.emergencyContact!}
        />
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
