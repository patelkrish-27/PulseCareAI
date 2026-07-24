export const mockUser = {
  name: "Rohit patel",
  age: 68,
  bloodType: "O+",
  weight: "72 kg",
  height: "175 cm",
  avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
};

export const healthSummary = {
  bloodPressure: "120/80",
  heartRate: 72,
  bloodSugar: 105,
  steps: 4500,
  sleep: "7h 15m",
};

export const medications = [
  { id: "1", name: "Lisinopril", dosage: "10mg", time: "08:00 AM", taken: true },
  { id: "2", name: "Metformin", dosage: "500mg", time: "01:00 PM", taken: false },
  { id: "3", name: "Atorvastatin", dosage: "20mg", time: "08:00 PM", taken: false },
];

export const recentActivities = [
  { id: "1", type: "log", title: "Blood Pressure Recorded", time: "2 hours ago", value: "118/79 mmHg" },
  { id: "2", type: "medication", title: "Lisinopril Taken", time: "4 hours ago", value: "10mg" },
  { id: "3", type: "appointment", title: "Dr. Smith Visit", time: "Yesterday", value: "Cardiology" },
];

export const weeklyReportData = [
  { day: "Mon", systolic: 120, diastolic: 80, sugar: 100 },
  { day: "Tue", systolic: 122, diastolic: 81, sugar: 105 },
  { day: "Wed", systolic: 118, diastolic: 79, sugar: 98 },
  { day: "Thu", systolic: 121, diastolic: 82, sugar: 102 },
  { day: "Fri", systolic: 119, diastolic: 80, sugar: 99 },
  { day: "Sat", systolic: 125, diastolic: 84, sugar: 110 },
  { day: "Sun", systolic: 120, diastolic: 80, sugar: 105 },
];

export const chatHistory = [
  { id: "1", role: "assistant", content: "Hello Robert, how are you feeling today?" },
  { id: "2", role: "user", content: "I have a slight headache and my blood pressure is a bit high." },
  { id: "3", role: "assistant", content: "I'm sorry to hear that. Could you please tell me your current blood pressure reading?" },
];
