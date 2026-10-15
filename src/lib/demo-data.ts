// Sample data for the clickable demo. Not real people.
export const BRAND = "Bright Path Tutors";

export const disciplines = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Amharic"] as const;

export type Tutor = {
  id: string;
  name: string;
  disciplines: string[];
  gradeBand: "4–8" | "9–12";
  rating: number;
  sessions: number;
  priceEtb: number;
  bio: string;
  verified: boolean;
};

export const tutors: Tutor[] = [
  { id: "t1", name: "Dawit Mekonnen", disciplines: ["Mathematics", "Physics"], gradeBand: "9–12", rating: 4.9, sessions: 312, priceEtb: 450, bio: "AAU engineering graduate. 6 years preparing students for the national exam.", verified: true },
  { id: "t2", name: "Selamawit Tesfaye", disciplines: ["English"], gradeBand: "4–8", rating: 4.8, sessions: 198, priceEtb: 350, bio: "TEFL certified. Patient, structured reading and writing lessons.", verified: true },
  { id: "t3", name: "Yonas Girma", disciplines: ["Chemistry", "Biology"], gradeBand: "9–12", rating: 4.7, sessions: 141, priceEtb: 400, bio: "Pharmacy graduate. Makes chemistry visual and practical.", verified: true },
  { id: "t4", name: "Hiwot Alemu", disciplines: ["Mathematics"], gradeBand: "4–8", rating: 4.9, sessions: 260, priceEtb: 300, bio: "Primary maths specialist. Builds confidence step by step.", verified: true },
  { id: "t5", name: "Bereket Haile", disciplines: ["Physics"], gradeBand: "9–12", rating: 4.6, sessions: 87, priceEtb: 420, bio: "Physics teacher at a private secondary school in Bole.", verified: true },
  { id: "t6", name: "Meron Assefa", disciplines: ["Amharic", "English"], gradeBand: "4–8", rating: 4.8, sessions: 175, priceEtb: 320, bio: "Bilingual language tutor focused on comprehension and essays.", verified: true },
];

export const testimonials = [
  { name: "Almaz K.", role: "Parent, Bole", text: "For the first time I can see whether my son actually attended and what he learned. The weekly Telegram summary is gold." },
  { name: "Ruth T.", role: "Grade 11 student", text: "Dawit explained physics in a way my school never did. My exam result went from 58 to 81." },
  { name: "Samuel G.", role: "Parent of two", text: "Paying through the platform means no awkward cash conversations, and I get a receipt every time." },
];

export const upcomingSessions = [
  { id: "s1", subject: "Mathematics", tutor: "Dawit Mekonnen", student: "Ruth Kebede", when: "Today, 16:00", duration: 60, link: "meet.google.com/abc-defg-hij", status: "Paid" },
  { id: "s2", subject: "English", tutor: "Selamawit Tesfaye", student: "Nahom Kebede", when: "Tomorrow, 17:30", duration: 45, link: "meet.google.com/klm-nopq-rst", status: "Paid" },
  { id: "s3", subject: "Physics", tutor: "Dawit Mekonnen", student: "Ruth Kebede", when: "Thu, 16:00", duration: 60, link: "meet.google.com/uvw-xyz-123", status: "Awaiting payment" },
];

export const applications = [
  { id: "a1", name: "Kalkidan Wolde", discipline: "Chemistry", experience: "4 years", checks: { degree: true, experience: true, references: true, background: false }, submitted: "2 days ago" },
  { id: "a2", name: "Abel Tadesse", discipline: "Mathematics", experience: "7 years", checks: { degree: true, experience: true, references: true, background: true }, submitted: "3 days ago" },
  { id: "a3", name: "Liya Mulugeta", discipline: "Biology", experience: "2 years", checks: { degree: true, experience: false, references: true, background: false }, submitted: "5 days ago" },
];

export const payments = [
  { id: "p1", parent: "Almaz Kebede", tutor: "Dawit Mekonnen", amount: 1800, method: "Telebirr", status: "Confirmed", date: "Oct 12" },
  { id: "p2", parent: "Samuel Girma", tutor: "Hiwot Alemu", amount: 1200, method: "CBE Birr", status: "Pending review", date: "Oct 13" },
  { id: "p3", parent: "Tigist Bekele", tutor: "Yonas Girma", amount: 1600, method: "Bank transfer", status: "Disputed", date: "Oct 13" },
  { id: "p4", parent: "Almaz Kebede", tutor: "Selamawit Tesfaye", amount: 1400, method: "Telebirr", status: "Confirmed", date: "Oct 14" },
];

export const children = [
  { name: "Ruth Kebede", grade: 11, band: "9–12", attendance: 92, avgScore: 81, trend: [58, 64, 70, 74, 78, 81], subjects: ["Mathematics", "Physics"] },
  { name: "Nahom Kebede", grade: 6, band: "4–8", attendance: 85, avgScore: 74, trend: [66, 68, 71, 70, 73, 74], subjects: ["English"] },
];

export const sessionNotes = [
  { date: "Oct 12", subject: "Mathematics", attended: true, score: 84, note: "Quadratic equations mastered. Next: inequalities." },
  { date: "Oct 9", subject: "Physics", attended: true, score: 78, note: "Good on kinematics; revise free-fall problems." },
  { date: "Oct 5", subject: "Mathematics", attended: false, score: null, note: "Missed — rescheduled to Oct 7." },
];

export const COMMISSION = 0.2;
