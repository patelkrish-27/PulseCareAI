/**
 * Local health resource directory — mocked PHCs, clinics, and emergency contacts
 * for semi-urban/rural India. Replace with real data for your deployment region.
 */

export interface HealthResource {
  id: string;
  name: string;
  type: "PHC" | "CHC" | "District Hospital" | "Private Clinic" | "Emergency";
  address: string;
  phone: string;
  distance: string; // Approximate
  open24h: boolean;
  services: string[];
  lat?: number;
  lng?: number;
}

export const LOCAL_RESOURCES: HealthResource[] = [
  {
    id: "1",
    name: "Primary Health Centre Nanded",
    type: "PHC",
    address: "Nanded Main Road, Maharashtra 431601",
    phone: "02462-255001",
    distance: "1.2 km",
    open24h: false,
    services: ["General OPD", "Maternal Care", "Immunisation", "Lab Tests"],
  },
  {
    id: "2",
    name: "Community Health Centre Biloli",
    type: "CHC",
    address: "Biloli Naka, Nanded, Maharashtra 431702",
    phone: "02466-244012",
    distance: "3.5 km",
    open24h: true,
    services: ["Emergency Care", "Surgery", "Maternity", "Paediatrics"],
  },
  {
    id: "3",
    name: "District Government Hospital",
    type: "District Hospital",
    address: "Hospital Road, Nanded, Maharashtra 431601",
    phone: "02462-251245",
    distance: "5.8 km",
    open24h: true,
    services: ["Emergency", "ICU", "Surgery", "Cardiology", "Dialysis"],
  },
  {
    id: "4",
    name: "Dr. Sharma Diabetic Clinic",
    type: "Private Clinic",
    address: "Shanti Nagar, Nanded 431601",
    phone: "9876543210",
    distance: "0.8 km",
    open24h: false,
    services: ["Diabetes Management", "Hypertension", "Thyroid Care"],
  },
  {
    id: "5",
    name: "Emergency Ambulance (MAHA-ERSS)",
    type: "Emergency",
    address: "Covers entire district",
    phone: "108",
    distance: "On call",
    open24h: true,
    services: ["Emergency Transport", "Basic Life Support"],
  },
  {
    id: "6",
    name: "National Health Helpline",
    type: "Emergency",
    address: "Toll-Free National Line",
    phone: "1800-180-1104",
    distance: "Remote",
    open24h: true,
    services: ["Medical Advice", "Doctor Consultation", "Health Guidance"],
  },
  {
    id: "7",
    name: "PHC Kandhar",
    type: "PHC",
    address: "Kandhar, Nanded, Maharashtra 431714",
    phone: "02460-266100",
    distance: "6.1 km",
    open24h: false,
    services: ["OPD", "Vaccination", "ASHA Worker Support", "TB Care"],
  },
];

export const TRIAGE_LEVEL_RESOURCES: Record<string, HealthResource["type"][]> = {
  HOME_CARE: [],
  CONSULT_48H: ["PHC", "CHC", "Private Clinic"],
  IMMEDIATE_FACILITY: ["CHC", "District Hospital", "Emergency"],
};
