import { useAuth } from "@/context/AuthContext";
import { useAuthTheme } from "@/components/auth-screen";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppointmentStatus = "upcoming" | "completed" | "cancelled";

interface Appointment {
  id: string;
  serialNumber: string;
  patientName: string;
  patientAge: number;
  patientBloodGroup: string;
  doctorName: string;
  specialty: string;
  location: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  prescription?: string;
  medicalReport?: string;
  chiefComplaint?: string;
  diagnosis?: string;
  followUpDate?: string;
}

interface BookableDoctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function calcAge(dob: string): number {
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function mapRow(row: any): Appointment {
  return {
    id: row.id,
    serialNumber: row.serial_number,
    patientName: row.patient?.full_name ?? "Unknown",
    patientAge: row.patient?.date_of_birth ? calcAge(row.patient.date_of_birth) : 0,
    patientBloodGroup: row.patient?.blood_group ?? "—",
    doctorName: row.doctor?.full_name ?? "Unknown Doctor",
    specialty: row.doctor?.specialty ?? "General",
    location: row.location,
    date: row.appointment_date,
    time: row.appointment_time,
    status: row.status,
    chiefComplaint: row.chief_complaint ?? undefined,
    diagnosis: row.diagnosis ?? undefined,
    prescription: row.prescription ?? undefined,
    followUpDate: row.follow_up_date ?? undefined,
  };
}

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
];

// ─── Book Appointment Modal ────────────────────────────────────────────────────

interface BookModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  theme: ReturnType<typeof useAuthTheme>;
  userId: string;
  doctors: BookableDoctor[];
  prefillDoctorId?: string;
}

function BookModal({ visible, onClose, onCreated, theme, userId, doctors, prefillDoctorId }: BookModalProps) {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<BookableDoctor | null>(
    prefillDoctorId ? doctors.find((d) => d.id === prefillDoctorId) ?? null : null
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [complaint, setComplaint] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdSerial, setCreatedSerial] = useState("");

  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().slice(0, 10);
  });

  const reset = () => {
    setStep(1);
    setSelectedDoctor(prefillDoctorId ? doctors.find((d) => d.id === prefillDoctorId) ?? null : null);
    setSelectedDate("");
    setSelectedTime("");
    setComplaint("");
    setSubmitting(false);
    setSubmitted(false);
    setCreatedSerial("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    const serial = `APT-${new Date().getFullYear()}-${Date.now().toString(36).slice(-6).toUpperCase()}`;
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        serial_number: serial,
        patient_id: userId,
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        location: selectedDoctor.hospital,
        chief_complaint: complaint || null,
      })
      .select("serial_number")
      .single();
    setSubmitting(false);
    if (error) {
      Alert.alert("Booking failed", error.message);
      return;
    }
    setCreatedSerial(data.serial_number);
    setSubmitted(true);
  };

  const s = bookStyles(theme);

  if (submitted) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        <View style={s.overlay}>
          <View style={s.card}>
            <View style={[s.successIcon, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name="checkmark-circle" size={48} color={theme.success} />
            </View>
            <Text style={[s.successTitle, { color: theme.text }]}>Appointment Booked!</Text>
            <Text style={[s.successMsg, { color: theme.muted }]}>
              Your appointment with {selectedDoctor?.name} on {selectedDate} at {selectedTime} has been confirmed.
            </Text>
            <Text style={[s.serialHint, { color: theme.primary }]}>{createdSerial}</Text>
            <Pressable
              style={[s.primaryBtn, { backgroundColor: theme.primary }]}
              onPress={() => {
                handleClose();
                onCreated();
              }}
            >
              <Text style={s.primaryBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={[s.card, { maxHeight: "90%" }]}>
          {/* Header */}
          <View style={s.modalHeader}>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
            <Text style={[s.modalTitle, { color: theme.text }]}>Book Appointment</Text>
            <Text style={[s.stepLabel, { color: theme.muted }]}>{step}/3</Text>
          </View>

          {/* Step indicator */}
          <View style={s.stepRow}>
            {[1, 2, 3].map((n) => (
              <View
                key={n}
                style={[s.stepDot, { backgroundColor: n <= step ? theme.primary : theme.border }]}
              />
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {step === 1 && (
              <View style={{ gap: 8 }}>
                <Text style={[s.sectionTitle, { color: theme.text }]}>Select Doctor</Text>
                {doctors.length === 0 ? (
                  <Text style={[s.docSub, { color: theme.muted, textAlign: "center", paddingVertical: 24 }]}>
                    No doctors available yet
                  </Text>
                ) : (
                  doctors.map((doc) => (
                    <Pressable
                      key={doc.id}
                      onPress={() => setSelectedDoctor(doc)}
                      style={[
                        s.doctorRow,
                        {
                          backgroundColor: selectedDoctor?.id === doc.id ? theme.primarySoft : theme.cardSoft,
                          borderColor: selectedDoctor?.id === doc.id ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <View style={[s.docAvatar, { backgroundColor: theme.primary }]}>
                        <Text style={s.docAvatarText}>{doc.name.split(" ")[1]?.[0] ?? "D"}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.docName, { color: theme.text }]}>{doc.name}</Text>
                        <Text style={[s.docSub, { color: theme.muted }]}>{doc.specialty}</Text>
                        <Text style={[s.docSub, { color: theme.muted }]}>{doc.hospital}</Text>
                      </View>
                      {selectedDoctor?.id === doc.id && (
                        <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                      )}
                    </Pressable>
                  ))
                )}
              </View>
            )}

            {step === 2 && (
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={[s.sectionTitle, { color: theme.text }]}>Select Date</Text>
                  <View style={{ gap: 8 }}>
                    {dateOptions.map((d) => (
                      <Pressable
                        key={d}
                        onPress={() => setSelectedDate(d)}
                        style={[
                          s.dateChip,
                          {
                            backgroundColor: selectedDate === d ? theme.primarySoft : theme.cardSoft,
                            borderColor: selectedDate === d ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        <Ionicons name="calendar-outline" size={16} color={selectedDate === d ? theme.primary : theme.muted} />
                        <Text style={[s.dateText, { color: selectedDate === d ? theme.primary : theme.text }]}>{d}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View>
                  <Text style={[s.sectionTitle, { color: theme.text }]}>Select Time</Text>
                  <View style={s.timeGrid}>
                    {TIME_SLOTS.map((t) => (
                      <Pressable
                        key={t}
                        onPress={() => setSelectedTime(t)}
                        style={[
                          s.timeChip,
                          {
                            backgroundColor: selectedTime === t ? theme.primary : theme.cardSoft,
                            borderColor: selectedTime === t ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        <Text style={[s.timeText, { color: selectedTime === t ? "#fff" : theme.text }]}>{t}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {step === 3 && (
              <View style={{ gap: 12 }}>
                <Text style={[s.sectionTitle, { color: theme.text }]}>Chief Complaint</Text>
                <View style={[s.textAreaShell, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
                  <TextInput
                    style={[s.textArea, { color: theme.text }]}
                    placeholder="Describe your symptoms or reason for visit..."
                    placeholderTextColor={theme.muted}
                    multiline
                    numberOfLines={4}
                    value={complaint}
                    onChangeText={setComplaint}
                  />
                </View>

                <View style={[s.summaryBox, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
                  <Text style={[s.summaryTitle, { color: theme.muted }]}>BOOKING SUMMARY</Text>
                  <SummaryRow icon="person" label="Doctor" value={selectedDoctor?.name ?? ""} theme={theme} />
                  <SummaryRow icon="medical" label="Specialty" value={selectedDoctor?.specialty ?? ""} theme={theme} />
                  <SummaryRow icon="location" label="Hospital" value={selectedDoctor?.hospital ?? ""} theme={theme} />
                  <SummaryRow icon="calendar" label="Date" value={selectedDate} theme={theme} />
                  <SummaryRow icon="time" label="Time" value={selectedTime} theme={theme} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Navigation */}
          <View style={s.navRow}>
            {step > 1 && (
              <Pressable
                style={[s.secondaryBtn, { borderColor: theme.border }]}
                onPress={() => setStep((p) => p - 1)}
              >
                <Text style={[s.secondaryBtnText, { color: theme.text }]}>Back</Text>
              </Pressable>
            )}
            <Pressable
              style={[
                s.primaryBtn,
                { backgroundColor: theme.primary, flex: 1 },
                step === 2 && (!selectedDate || !selectedTime) && { opacity: 0.5 },
                step === 1 && !selectedDoctor && { opacity: 0.5 },
                submitting && { opacity: 0.6 },
              ]}
              disabled={(step === 1 && !selectedDoctor) || (step === 2 && (!selectedDate || !selectedTime)) || submitting}
              onPress={() => (step < 3 ? setStep((p) => p + 1) : handleConfirm())}
            >
              <Text style={s.primaryBtnText}>
                {step === 3 ? (submitting ? "Booking…" : "Confirm Booking") : "Next"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  theme,
}: {
  icon: string;
  label: string;
  value: string;
  theme: ReturnType<typeof useAuthTheme>;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 }}>
      <Ionicons name={icon as any} size={14} color={theme.muted} />
      <Text style={{ fontSize: 12, color: theme.muted, width: 64 }}>{label}</Text>
      <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text, flex: 1 }}>{value}</Text>
    </View>
  );
}

// ─── Prescription Modal ──────────────────────────────────────────────────────

interface PrescriptionModalProps {
  visible: boolean;
  onClose: () => void;
  appointment: Appointment;
  theme: ReturnType<typeof useAuthTheme>;
  isDoctor: boolean;
  onSave?: (prescription: string, diagnosis: string, followUp: string) => void;
}

function PrescriptionModal({ visible, onClose, appointment, theme, isDoctor, onSave }: PrescriptionModalProps) {
  const [prescText, setPrescText] = useState(appointment.prescription || "");
  const [diagText, setDiagText] = useState(appointment.diagnosis || "");
  const [followUp, setFollowUp] = useState(appointment.followUpDate || "");

  const s = prescStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[s.container, { backgroundColor: theme.background }]}>
        <View style={s.header}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[s.title, { color: theme.text }]}>
            {isDoctor ? "Write Prescription" : "Prescription"}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
          <View style={[s.banner, { backgroundColor: theme.primarySoft, borderColor: theme.primary }]}>
            <Ionicons name="person-circle" size={32} color={theme.primary} />
            <View>
              <Text style={[s.bannerName, { color: theme.primaryDark }]}>{appointment.patientName}</Text>
              <Text style={[s.bannerSub, { color: theme.primary }]}>
                {appointment.patientAge} yrs · Blood {appointment.patientBloodGroup} · {appointment.serialNumber}
              </Text>
            </View>
          </View>

          {appointment.chiefComplaint && (
            <InfoCard label="Chief Complaint" value={appointment.chiefComplaint} theme={theme} icon="chatbubble-outline" />
          )}

          <View style={s.fieldBlock}>
            <Text style={[s.label, { color: theme.muted }]}>DIAGNOSIS</Text>
            {isDoctor ? (
              <View style={[s.inputShell, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
                <TextInput
                  style={[s.input, { color: theme.text }]}
                  value={diagText}
                  onChangeText={setDiagText}
                  placeholder="Enter diagnosis..."
                  placeholderTextColor={theme.muted}
                  multiline
                />
              </View>
            ) : (
              <Text style={[s.value, { color: theme.text }]}>{appointment.diagnosis || "Not provided"}</Text>
            )}
          </View>

          <View style={s.fieldBlock}>
            <Text style={[s.label, { color: theme.muted }]}>MEDICATIONS</Text>
            {isDoctor ? (
              <View style={[s.inputShell, { backgroundColor: theme.cardSoft, borderColor: theme.border, minHeight: 120 }]}>
                <TextInput
                  style={[s.input, { color: theme.text }]}
                  value={prescText}
                  onChangeText={setPrescText}
                  placeholder="e.g. 1. Amoxicillin 500mg — twice daily for 7 days"
                  placeholderTextColor={theme.muted}
                  multiline
                  numberOfLines={6}
                />
              </View>
            ) : (
              <View style={[s.rxBox, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
                <Text style={[s.rxText, { color: theme.text }]}>
                  {appointment.prescription || "No prescription recorded yet."}
                </Text>
              </View>
            )}
          </View>

          <View style={s.fieldBlock}>
            <Text style={[s.label, { color: theme.muted }]}>FOLLOW-UP DATE</Text>
            {isDoctor ? (
              <View style={[s.inputShell, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
                <TextInput
                  style={[s.input, { color: theme.text }]}
                  value={followUp}
                  onChangeText={setFollowUp}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.muted}
                />
              </View>
            ) : (
              <Text style={[s.value, { color: theme.text }]}>
                {appointment.followUpDate || "Not scheduled"}
              </Text>
            )}
          </View>
        </ScrollView>

        {isDoctor && (
          <View style={{ padding: 16 }}>
            <Pressable
              style={[s.saveBtn, { backgroundColor: theme.primary }]}
              onPress={() => {
                onSave?.(prescText, diagText, followUp);
                onClose();
              }}
            >
              <Ionicons name="save-outline" size={18} color="#fff" />
              <Text style={s.saveBtnText}>Save Prescription</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Medical Report Modal ────────────────────────────────────────────────────

function MedicalReportModal({
  visible,
  onClose,
  appointment,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  appointment: Appointment;
  theme: ReturnType<typeof useAuthTheme>;
}) {
  const s = prescStyles(theme);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[s.container, { backgroundColor: theme.background }]}>
        <View style={s.header}>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[s.title, { color: theme.text }]}>Medical Report</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          <View style={[s.banner, { backgroundColor: theme.primarySoft, borderColor: theme.primary }]}>
            <Ionicons name="document-text" size={32} color={theme.primary} />
            <View>
              <Text style={[s.bannerName, { color: theme.primaryDark }]}>{appointment.serialNumber}</Text>
              <Text style={[s.bannerSub, { color: theme.primary }]}>
                {appointment.date} · {appointment.doctorName}
              </Text>
            </View>
          </View>

          <InfoCard label="Diagnosis" value={appointment.diagnosis || "Not recorded"} theme={theme} icon="analytics-outline" />
          <InfoCard label="Chief Complaint" value={appointment.chiefComplaint || "Not recorded"} theme={theme} icon="chatbubble-outline" />

          <View style={s.fieldBlock}>
            <Text style={[s.label, { color: theme.muted }]}>LAB RESULTS & FINDINGS</Text>
            <View style={[s.rxBox, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
              <Text style={[s.rxText, { color: theme.text }]}>
                {appointment.medicalReport || "No medical report available for this appointment."}
              </Text>
            </View>
          </View>

          {appointment.followUpDate && (
            <InfoCard label="Follow-up Scheduled" value={appointment.followUpDate} theme={theme} icon="calendar-outline" />
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Appointment Detail Modal ─────────────────────────────────────────────────

type DetailView = "details" | "prescription" | "report";

function AppointmentDetailModal({
  visible,
  onClose,
  appointment,
  theme,
  isDoctor,
  onCancel,
  onBookAgain,
  onSavePrescription,
}: {
  visible: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  theme: ReturnType<typeof useAuthTheme>;
  isDoctor: boolean;
  onCancel: (id: string) => void;
  onBookAgain: (apt: Appointment) => void;
  onSavePrescription: (id: string, presc: string, diag: string, follow: string) => void;
}) {
  const [view, setView] = useState<DetailView>("details");

  if (!appointment) return null;

  const isUpcoming = appointment.status === "upcoming";
  const isCompleted = appointment.status === "completed";

  const statusColor =
    appointment.status === "upcoming"
      ? theme.primary
      : appointment.status === "completed"
        ? theme.success
        : theme.danger;

  const statusBg =
    appointment.status === "upcoming"
      ? theme.primarySoft
      : appointment.status === "completed"
        ? "#ECFDF5"
        : "#FEF2F2";

  if (view === "prescription") {
    return (
      <PrescriptionModal
        visible={visible}
        onClose={() => setView("details")}
        appointment={appointment}
        theme={theme}
        isDoctor={isDoctor}
        onSave={(p, d, f) => onSavePrescription(appointment.id, p, d, f)}
      />
    );
  }

  if (view === "report") {
    return (
      <MedicalReportModal
        visible={visible}
        onClose={() => setView("details")}
        appointment={appointment}
        theme={theme}
      />
    );
  }

  const s = detailStyles(theme);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[s.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </Pressable>
            <Text style={[s.title, { color: theme.text }]}>Appointment Details</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            <View style={[s.statusBanner, { backgroundColor: statusBg }]}>
              <View style={[s.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[s.statusText, { color: statusColor }]}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Text>
              <Text style={[s.serialText, { color: statusColor }]}>{appointment.serialNumber}</Text>
            </View>

            <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[s.docBadge, { backgroundColor: theme.primary }]}>
                <Ionicons name="person" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.cardTitle, { color: theme.text }]}>{appointment.doctorName}</Text>
                <Text style={[s.cardSub, { color: theme.muted }]}>{appointment.specialty}</Text>
                {isDoctor && (
                  <Text style={[s.cardSub, { color: theme.primary, marginTop: 2 }]}>
                    Patient: {appointment.patientName}
                  </Text>
                )}
              </View>
            </View>

            <View style={[s.infoGrid, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
              <InfoRow icon="location-outline" label="Location" value={appointment.location} theme={theme} />
              <View style={[s.divider, { backgroundColor: theme.border }]} />
              <InfoRow icon="calendar-outline" label="Date" value={appointment.date} theme={theme} />
              <View style={[s.divider, { backgroundColor: theme.border }]} />
              <InfoRow icon="time-outline" label="Time" value={appointment.time} theme={theme} />
            </View>

            <View style={[s.infoGrid, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
              <InfoRow icon="person-outline" label="Patient" value={appointment.patientName} theme={theme} />
              <View style={[s.divider, { backgroundColor: theme.border }]} />
              <InfoRow icon="water-outline" label="Blood Group" value={appointment.patientBloodGroup} theme={theme} />
              <View style={[s.divider, { backgroundColor: theme.border }]} />
              <InfoRow icon="fitness-outline" label="Age" value={`${appointment.patientAge} years`} theme={theme} />
            </View>

            {appointment.chiefComplaint && (
              <View style={[s.infoGrid, { backgroundColor: theme.cardSoft, borderColor: theme.border }]}>
                <InfoRow icon="chatbubble-outline" label="Chief Complaint" value={appointment.chiefComplaint} theme={theme} />
              </View>
            )}

            <Text style={[s.sectionLabel, { color: theme.muted }]}>ACTIONS</Text>
            <View style={{ gap: 10 }}>
              {(isCompleted || isDoctor) && (
                <Pressable
                  style={[s.actionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => setView("prescription")}
                >
                  <View style={[s.actionIcon, { backgroundColor: "#EFF6FF" }]}>
                    <Ionicons name="medkit-outline" size={20} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.actionTitle, { color: theme.text }]}>
                      {isDoctor ? "Write / Edit Prescription" : "View Prescription"}
                    </Text>
                    <Text style={[s.actionSub, { color: theme.muted }]}>
                      {isDoctor ? "Add medications and diagnosis" : "Medications and follow-up details"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.muted} />
                </Pressable>
              )}

              {isCompleted && (
                <Pressable
                  style={[s.actionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => setView("report")}
                >
                  <View style={[s.actionIcon, { backgroundColor: "#F0FDF4" }]}>
                    <Ionicons name="document-text-outline" size={20} color={theme.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.actionTitle, { color: theme.text }]}>Medical Report</Text>
                    <Text style={[s.actionSub, { color: theme.muted }]}>Lab results and clinical findings</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.muted} />
                </Pressable>
              )}

              {!isDoctor && isCompleted && (
                <Pressable
                  style={[s.actionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => {
                    onClose();
                    onBookAgain(appointment);
                  }}
                >
                  <View style={[s.actionIcon, { backgroundColor: "#FFFBEB" }]}>
                    <Ionicons name="refresh-outline" size={20} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.actionTitle, { color: theme.text }]}>Book Another Appointment</Text>
                    <Text style={[s.actionSub, { color: theme.muted }]}>Schedule a follow-up with the same doctor</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.muted} />
                </Pressable>
              )}

              {!isDoctor && isUpcoming && (
                <Pressable
                  style={[s.actionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => Alert.alert("Calling", `Connecting to ${appointment.doctorName}...`)}
                >
                  <View style={[s.actionIcon, { backgroundColor: "#F0FDF4" }]}>
                    <Ionicons name="call-outline" size={20} color={theme.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.actionTitle, { color: theme.text }]}>Call Doctor</Text>
                    <Text style={[s.actionSub, { color: theme.muted }]}>Reach your doctor directly</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.muted} />
                </Pressable>
              )}

              {isUpcoming && (
                <Pressable
                  style={[s.actionBtn, { backgroundColor: "#FFF5F5", borderColor: "#FED7D7" }]}
                  onPress={() => {
                    Alert.alert(
                      "Cancel Appointment",
                      `Cancel your appointment with ${appointment.doctorName} on ${appointment.date}?`,
                      [
                        { text: "Keep it", style: "cancel" },
                        {
                          text: "Yes, Cancel",
                          style: "destructive",
                          onPress: () => {
                            onCancel(appointment.id);
                            onClose();
                          },
                        },
                      ]
                    );
                  }}
                >
                  <View style={[s.actionIcon, { backgroundColor: "#FEF2F2" }]}>
                    <Ionicons name="close-circle-outline" size={20} color={theme.danger} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.actionTitle, { color: theme.danger }]}>Cancel Appointment</Text>
                    <Text style={[s.actionSub, { color: theme.muted }]}>This action cannot be undone</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.danger} />
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function InfoRow({
  icon,
  label,
  value,
  theme,
}: {
  icon: string;
  label: string;
  value: string;
  theme: ReturnType<typeof useAuthTheme>;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 14 }}>
      <Ionicons name={icon as any} size={16} color={theme.muted} />
      <Text style={{ fontSize: 12, color: theme.muted, width: 80 }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: "600", color: theme.text, flex: 1 }}>{value}</Text>
    </View>
  );
}

function InfoCard({
  label,
  value,
  theme,
  icon,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useAuthTheme>;
  icon: string;
}) {
  return (
    <View style={{ borderRadius: 12, borderWidth: 1, padding: 14, backgroundColor: theme.cardSoft, borderColor: theme.border }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Ionicons name={icon as any} size={13} color={theme.muted} />
        <Text style={{ fontSize: 11, fontWeight: "700", color: theme.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 14, color: theme.text, lineHeight: 20 }}>{value}</Text>
    </View>
  );
}

// ─── Doctor Appointment Card ──────────────────────────────────────────────────

function DoctorAppointmentCard({
  appointment,
  theme,
  onView,
}: {
  appointment: Appointment;
  theme: ReturnType<typeof useAuthTheme>;
  onView: () => void;
}) {
  const statusColor =
    appointment.status === "upcoming"
      ? theme.primary
      : appointment.status === "completed"
        ? theme.success
        : theme.danger;

  const statusBg =
    appointment.status === "upcoming"
      ? theme.primarySoft
      : appointment.status === "completed"
        ? "#ECFDF5"
        : "#FEF2F2";

  return (
    <View style={[docCardStyles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={[docCardStyles.patientName, { color: theme.text }]}>{appointment.patientName}</Text>
          <Text style={[docCardStyles.serial, { color: theme.muted }]}>{appointment.serialNumber}</Text>
        </View>
        <View style={[docCardStyles.badge, { backgroundColor: statusBg }]}>
          <Text style={[docCardStyles.badgeText, { color: statusColor }]}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={{ gap: 5, marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="calendar-outline" size={13} color={theme.muted} />
          <Text style={[docCardStyles.meta, { color: theme.muted }]}>{appointment.date} · {appointment.time}</Text>
        </View>
        {appointment.chiefComplaint && (
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
            <Ionicons name="chatbubble-outline" size={13} color={theme.muted} style={{ marginTop: 1 }} />
            <Text style={[docCardStyles.meta, { color: theme.muted, flex: 1 }]} numberOfLines={2}>{appointment.chiefComplaint}</Text>
          </View>
        )}
      </View>

      <Pressable onPress={onView} style={[docCardStyles.viewBtn, { backgroundColor: theme.primary }]}>
        <Text style={docCardStyles.viewBtnText}>View & Manage</Text>
      </Pressable>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AppointmentsScreen() {
  const theme = useAuthTheme();
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor";
  const { bookDoctorId } = useLocalSearchParams<{ bookDoctorId?: string }>();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [bookableDoctors, setBookableDoctors] = useState<BookableDoctor[]>([]);

  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [bookVisible, setBookVisible] = useState(false);
  const [bookAgainDoctorId, setBookAgainDoctorId] = useState<string | undefined>();

  // Track whether we've already consumed the bookDoctorId param
  const handledBookParam = useRef(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setFetchError(null);

    // Fetch appointments — explicit filter + RLS both restrict to own rows
    const apptRes = await supabase
      .from("appointments")
      .select("*")
      .or(`patient_id.eq.${user.id},doctor_id.eq.${user.id}`)
      .order("appointment_date", { ascending: false });

    if (apptRes.error) {
      console.error("appointments fetch error:", apptRes.error);
      setFetchError(apptRes.error.message);
      setLoading(false);
      return;
    }

    const rows = apptRes.data ?? [];

    // Collect unique user IDs to look up in one query
    const userIds = Array.from(
      new Set(rows.flatMap((r: any) => [r.patient_id, r.doctor_id]))
    );

    const [usersRes, docRes] = await Promise.all([
      userIds.length > 0
        ? supabase
            .from("users")
            .select("id, full_name, date_of_birth, blood_group, specialty, institution")
            .in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
      !isDoctor
        ? supabase
            .from("users")
            .select("id, full_name, specialty, institution")
            .eq("role", "doctor")
            .eq("is_active", true)
            .eq("is_verified", true)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const usersMap: Record<string, any> = {};
    for (const u of (usersRes.data ?? []) as any[]) {
      usersMap[u.id] = u;
    }

    setAppointments(
      rows.map((r: any) => mapRow({
        ...r,
        patient: usersMap[r.patient_id] ?? null,
        doctor: usersMap[r.doctor_id] ?? null,
      }))
    );

    if (!isDoctor && docRes.data) {
      setBookableDoctors(
        (docRes.data as any[]).map((d) => ({
          id: d.id,
          name: d.full_name,
          specialty: d.specialty ?? "General",
          hospital: d.institution ?? "—",
        }))
      );
    }

    setLoading(false);
  }, [user, isDoctor]);

  useEffect(() => {
    load();
  }, [load]);

  // Open BookModal pre-filled once doctors list is ready and param is present
  useEffect(() => {
    if (!bookDoctorId || handledBookParam.current || loading || isDoctor) return;
    handledBookParam.current = true;
    setBookAgainDoctorId(bookDoctorId);
    setBookVisible(true);
  }, [bookDoctorId, loading, isDoctor]);

  const filters = ["All", "Upcoming", "Completed", "Cancelled"];

  const filteredAppointments = appointments.filter((apt) => {
    if (selectedFilter === "All") return true;
    return apt.status === selectedFilter.toLowerCase();
  });

  const counts = {
    All: appointments.length,
    Upcoming: appointments.filter((a) => a.status === "upcoming").length,
    Completed: appointments.filter((a) => a.status === "completed").length,
    Cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  const openDetail = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setDetailVisible(true);
  };

  const handleCancel = async (id: string) => {
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" as AppointmentStatus } : a))
    );
  };

  const handleBookAgain = (apt: Appointment) => {
    setBookAgainDoctorId(apt.id);
    setBookVisible(true);
  };

  const handleSavePrescription = async (id: string, presc: string, diag: string, follow: string) => {
    await supabase.from("appointments").update({
      prescription: presc,
      diagnosis: diag,
      follow_up_date: follow || null,
      status: "completed",
    }).eq("id", id);
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, prescription: presc, diagnosis: diag, followUpDate: follow, status: "completed" } : a
      )
    );
    setSelectedAppointment((prev) =>
      prev && prev.id === id
        ? { ...prev, prescription: presc, diagnosis: diag, followUpDate: follow, status: "completed" }
        : prev
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Appointments</Text>
            <Text style={[styles.headerSub, { color: theme.muted }]}>
              {isDoctor ? "Manage your patient appointments" : "Track and manage your visits"}
            </Text>
          </View>
          {!isDoctor && (
            <Pressable
              style={[styles.addBtn, { backgroundColor: theme.primary }]}
              onPress={() => {
                setBookAgainDoctorId(undefined);
                setBookVisible(true);
              }}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addBtnText}>Book</Text>
            </Pressable>
          )}
        </View>

        {/* Stats row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          {(["Upcoming", "Completed", "Cancelled"] as const).map((key) => {
            const color = key === "Upcoming" ? theme.primary : key === "Completed" ? theme.success : theme.danger;
            const bg = key === "Upcoming" ? theme.primarySoft : key === "Completed" ? "#ECFDF5" : "#FEF2F2";
            return (
              <View key={key} style={[styles.statCard, { backgroundColor: bg }]}>
                <Text style={[styles.statNum, { color }]}>{counts[key]}</Text>
                <Text style={[styles.statLabel, { color }]}>{key}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((f) => (
            <Pressable
              key={f}
              onPress={() => setSelectedFilter(f)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: f === selectedFilter ? theme.primary : theme.cardSoft,
                  borderColor: f === selectedFilter ? theme.primary : theme.border,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: f === selectedFilter ? "#fff" : theme.text }]}>{f}</Text>
              <View style={[styles.filterBadge, { backgroundColor: f === selectedFilter ? "rgba(255,255,255,0.25)" : theme.border }]}>
                <Text style={[styles.filterBadgeText, { color: f === selectedFilter ? "#fff" : theme.muted }]}>
                  {counts[f as keyof typeof counts]}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Error banner */}
        {fetchError && (
          <View style={[styles.errorBanner, { backgroundColor: "#FEF2F2", borderColor: "#FED7D7" }]}>
            <Text style={[styles.errorText, { color: theme.danger }]}>Could not load appointments</Text>
            <Pressable onPress={load}>
              <Text style={[styles.retryText, { color: theme.danger }]}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* List */}
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : filteredAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={theme.muted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No appointments</Text>
              <Text style={[styles.emptySub, { color: theme.muted }]}>
                {selectedFilter === "All"
                  ? isDoctor
                    ? "Your patient appointments will appear here"
                    : "Book your first appointment to get started"
                  : `No ${selectedFilter.toLowerCase()} appointments`}
              </Text>
              {!isDoctor && selectedFilter === "All" && (
                <Pressable
                  style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setBookVisible(true)}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Book Appointment</Text>
                </Pressable>
              )}
            </View>
          ) : isDoctor ? (
            filteredAppointments.map((apt) => (
              <DoctorAppointmentCard key={apt.id} appointment={apt} theme={theme} onView={() => openDetail(apt)} />
            ))
          ) : (
            filteredAppointments.map((apt) => (
              <PatientCard key={apt.id} appointment={apt} theme={theme} onView={() => openDetail(apt)} />
            ))
          )}
        </View>
      </ScrollView>

      <AppointmentDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        appointment={selectedAppointment}
        theme={theme}
        isDoctor={isDoctor}
        onCancel={handleCancel}
        onBookAgain={handleBookAgain}
        onSavePrescription={handleSavePrescription}
      />

      <BookModal
        visible={bookVisible}
        onClose={() => setBookVisible(false)}
        onCreated={load}
        theme={theme}
        userId={user?.id ?? ""}
        doctors={bookableDoctors}
        prefillDoctorId={bookAgainDoctorId}
      />
    </SafeAreaView>
  );
}

// ─── Patient Card ─────────────────────────────────────────────────────────────

function PatientCard({
  appointment,
  theme,
  onView,
}: {
  appointment: Appointment;
  theme: ReturnType<typeof useAuthTheme>;
  onView: () => void;
}) {
  const statusColor =
    appointment.status === "upcoming"
      ? theme.primary
      : appointment.status === "completed"
        ? theme.success
        : theme.danger;

  const statusBg =
    appointment.status === "upcoming"
      ? theme.primarySoft
      : appointment.status === "completed"
        ? "#ECFDF5"
        : "#FEF2F2";

  return (
    <View style={[styles.patientCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.cardAccent, { backgroundColor: statusColor }]} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.doctorName, { color: theme.text }]}>{appointment.doctorName}</Text>
            <Text style={[styles.specialty, { color: theme.muted }]}>{appointment.specialty}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusBg }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="location-outline" size={13} color={theme.muted} />
            <Text style={[styles.meta, { color: theme.muted }]} numberOfLines={1}>{appointment.location}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="calendar-outline" size={13} color={theme.muted} />
              <Text style={[styles.meta, { color: theme.muted }]}>{appointment.date}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="time-outline" size={13} color={theme.muted} />
              <Text style={[styles.meta, { color: theme.muted }]}>{appointment.time}</Text>
            </View>
          </View>
        </View>

        <Pressable onPress={onView} style={[styles.viewBtn, { backgroundColor: theme.primary }]}>
          <Text style={styles.viewBtnText}>View Details</Text>
          <Ionicons name="chevron-forward" size={14} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 28, fontWeight: "800" },
  headerSub: { fontSize: 13, marginTop: 2 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  statsRow: { paddingHorizontal: 16, gap: 10, paddingBottom: 16 },
  statCard: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 90,
  },
  statNum: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 16 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: "600" },
  filterBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  filterBadgeText: { fontSize: 11, fontWeight: "700" },
  listContainer: { paddingHorizontal: 16, gap: 12 },
  loadingState: { alignItems: "center", paddingVertical: 60 },
  errorBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, fontWeight: "600" },
  retryText: { fontSize: 13, fontWeight: "700" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", marginTop: 8 },
  emptySub: { fontSize: 13, textAlign: "center", lineHeight: 18 },
  emptyBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  patientCard: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    padding: 14,
    gap: 12,
  },
  cardAccent: { width: 4, borderRadius: 2 },
  doctorName: { fontSize: 16, fontWeight: "700" },
  specialty: { fontSize: 12, marginTop: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  meta: { fontSize: 12 },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  viewBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});

const docCardStyles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 0 },
  patientName: { fontSize: 16, fontWeight: "700" },
  serial: { fontSize: 12, marginTop: 2 },
  meta: { fontSize: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  viewBtn: { paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  viewBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});

const detailStyles = (theme: ReturnType<typeof useAuthTheme>) =>
  StyleSheet.create({
    container: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      paddingBottom: 12,
    },
    title: { fontSize: 18, fontWeight: "700" },
    statusBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      borderRadius: 12,
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: 14, fontWeight: "700", flex: 1 },
    serialText: { fontSize: 12, fontWeight: "600" },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 14,
      borderWidth: 1,
      padding: 14,
    },
    docBadge: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: { fontSize: 16, fontWeight: "700" },
    cardSub: { fontSize: 12, marginTop: 2 },
    infoGrid: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
    divider: { height: 1, marginHorizontal: 14 },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginTop: 4,
    },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 14,
      borderWidth: 1,
      padding: 14,
    },
    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    actionTitle: { fontSize: 14, fontWeight: "700" },
    actionSub: { fontSize: 12, marginTop: 1 },
  });

const prescStyles = (theme: ReturnType<typeof useAuthTheme>) =>
  StyleSheet.create({
    container: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
    },
    title: { fontSize: 18, fontWeight: "700" },
    banner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
    },
    bannerName: { fontSize: 16, fontWeight: "700" },
    bannerSub: { fontSize: 12, marginTop: 2 },
    fieldBlock: { gap: 8 },
    label: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    value: { fontSize: 15, lineHeight: 22 },
    inputShell: { borderRadius: 12, borderWidth: 1, padding: 12 },
    input: { fontSize: 14, lineHeight: 20 },
    rxBox: { borderRadius: 12, borderWidth: 1, padding: 14 },
    rxText: { fontSize: 14, lineHeight: 22 },
    saveBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
    },
    saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  });

const bookStyles = (theme: ReturnType<typeof useAuthTheme>) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: theme.overlay, justifyContent: "flex-end" },
    card: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      paddingBottom: 32,
      gap: 16,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    modalTitle: { fontSize: 18, fontWeight: "700" },
    stepLabel: { fontSize: 12, fontWeight: "600" },
    stepRow: { flexDirection: "row", gap: 6 },
    stepDot: { flex: 1, height: 4, borderRadius: 2 },
    sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
    doctorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
    },
    docAvatar: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    docAvatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    docName: { fontSize: 14, fontWeight: "700" },
    docSub: { fontSize: 12, marginTop: 1 },
    dateChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
    },
    dateText: { fontSize: 14, fontWeight: "600" },
    timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    timeChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      minWidth: "22%",
      alignItems: "center",
    },
    timeText: { fontSize: 12, fontWeight: "600" },
    textAreaShell: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 12,
      minHeight: 100,
    },
    textArea: { fontSize: 14, lineHeight: 20 },
    summaryBox: { borderRadius: 14, borderWidth: 1, padding: 14 },
    summaryTitle: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    navRow: { flexDirection: "row", gap: 10, marginTop: 4 },
    primaryBtn: {
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
    secondaryBtn: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryBtnText: { fontSize: 15, fontWeight: "700" },
    successIcon: {
      width: 72,
      height: 72,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      alignSelf: "center",
    },
    successTitle: { fontSize: 20, fontWeight: "800", textAlign: "center", marginBottom: 8 },
    successMsg: { fontSize: 13, textAlign: "center", lineHeight: 18, marginBottom: 8 },
    serialHint: { fontSize: 14, fontWeight: "700", textAlign: "center", marginBottom: 16 },
  });
