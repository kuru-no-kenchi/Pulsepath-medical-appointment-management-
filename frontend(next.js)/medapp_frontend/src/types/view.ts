import { Appointment, AppointmentRescheduleRequest } from "./appointment";
import { Assistant, AssistantDoctor } from "./assistant";
import { Doctor } from "./doctor";
import { Patient, PatientDoctorView } from "./patients";

export type DoctorsView =
  | {
      mode: "list";
    }
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      doctor: Doctor;
    }
  | {
      mode: "details";
      doctor: Doctor;
    };

export type AssistantsView =
  | {
      mode: "list";
    }
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      assistant: Assistant;
    }
  | {
      mode: "details";
      assistant: Assistant;
    };

export type PatientsView =
  | {
      mode: "list";
    }
  | {
      mode: "edit";
      patient: Patient;
    }
  | {
      mode: "details";
      patient: Patient;
    };

export type AppointmentsView =
  | {
      mode: "list";
    }
  | {
      mode: "create";
    }
  | {
      mode: "assistant_create";
    }
  | {
      mode: "book";
    }
  | {
      mode: "edit";
      appointment: Appointment;
    }
  | {
      mode: "reschedule";
      appointment: AppointmentRescheduleRequest;
    }
  | {
      mode: "details";
      appointment: Appointment;
    };

export type AssistantDoctorsView =
  | {
      mode: "list";
    }
  | {
      mode: "details";
      doctor: AssistantDoctor;
    };

export type AssistantPatientsView =
  | {
      mode: "list";
    }
  | {
      mode: "details";
      patient: Patient;
    };

export type PatientDoctorsView =
  | {
      mode: "list";
    }
  | {
      mode: "details";
      doctor: PatientDoctorView;
    };
