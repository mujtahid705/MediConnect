import { useAuthTheme } from "@/components/auth-screen";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AppointmentsScreen() {
  const theme = useAuthTheme();
  const [selectedFilter, setSelectedFilter] = useState("Upcoming");
  const [selectedAppointment, setSelectedAppointment] = useState<
    (typeof appointments)[0] | null
  >(null);
  const [modalVisible, setModalVisible] = useState(false);

  const appointments = [
    {
      id: 1,
      serialNumber: "APT-2026-001",
      doctorName: "Dr. Asif",
      specialty: "Cardiologist",
      location: "Evercare Hospital Dhaka",
      date: "2026-04-25",
      time: "10:00 AM",
      status: "upcoming",
    },
    {
      id: 2,
      serialNumber: "APT-2026-002",
      doctorName: "Dr. Nazrul",
      specialty: "Neurologist",
      location: "United Hospital",
      date: "2026-04-22",
      time: "2:30 PM",
      status: "upcoming",
    },
    {
      id: 3,
      serialNumber: "APT-2026-003",
      doctorName: "Dr. Mujibur",
      specialty: "General Physician",
      location: "Square Hospital",
      date: "2026-04-20",
      time: "11:00 AM",
      status: "completed",
    },
  ];

  const filteredAppointments = appointments.filter((apt) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Upcoming") return apt.status === "upcoming";
    if (selectedFilter === "Completed") return apt.status === "completed";
    return true;
  });

  const getStatusColor = (status: string) => {
    return status === "upcoming" ? theme.primary : theme.muted;
  };

  const openModal = (appointment: (typeof appointments)[0]) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAppointment(null);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Appointments
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {["All", "Upcoming", "Completed"].map((filter) => (
            <Pressable
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    filter === selectedFilter ? theme.primary : theme.cardSoft,
                  borderColor:
                    filter === selectedFilter ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: filter === selectedFilter ? "#FFFFFF" : theme.text,
                  },
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Appointments List */}
        <View style={styles.appointmentsContainer}>
          {filteredAppointments.map((appointment) => (
            <View
              key={appointment.id}
              style={[
                styles.appointmentCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.appointmentContent}>
                <View style={styles.appointmentHeader}>
                  <View>
                    <Text style={[styles.doctorName, { color: theme.text }]}>
                      {appointment.doctorName}
                    </Text>
                    <Text style={[styles.specialty, { color: theme.muted }]}>
                      {appointment.specialty}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          appointment.status === "upcoming"
                            ? theme.primarySoft
                            : theme.cardSoft,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: getStatusColor(appointment.status),
                        },
                      ]}
                    >
                      {appointment.status === "upcoming"
                        ? "Upcoming"
                        : "Completed"}
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={theme.muted}
                    />
                    <Text style={[styles.detailText, { color: theme.text }]}>
                      {appointment.location}
                    </Text>
                  </View>
                </View>

                <View style={styles.appointmentDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={theme.muted}
                    />
                    <Text style={[styles.detailText, { color: theme.text }]}>
                      {appointment.date}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={theme.muted}
                    />
                    <Text style={[styles.detailText, { color: theme.text }]}>
                      {appointment.time}
                    </Text>
                  </View>
                </View>
              </View>

              <Pressable
                onPress={() => openModal(appointment)}
                style={[styles.viewButton, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.viewButtonText}>View</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal for appointment details */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <SafeAreaView
          style={[styles.modalContainer, { backgroundColor: theme.background }]}
        >
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {selectedAppointment && (
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Pressable onPress={closeModal}>
                    <Ionicons name="close" size={28} color={theme.text} />
                  </Pressable>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    Appointment Details
                  </Text>
                  <View style={{ width: 28 }} />
                </View>

                {/* Serial Number */}
                <View
                  style={[
                    styles.detailSection,
                    {
                      backgroundColor: theme.cardSoft,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.detailLabel, { color: theme.muted }]}>
                    Serial Number
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {selectedAppointment.serialNumber}
                  </Text>
                </View>

                {/* Doctor Info */}
                <View
                  style={[
                    styles.detailSection,
                    {
                      backgroundColor: theme.cardSoft,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.detailLabel, { color: theme.muted }]}>
                    Doctor
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {selectedAppointment.doctorName}
                  </Text>
                  <Text style={[styles.detailSubtext, { color: theme.muted }]}>
                    {selectedAppointment.specialty}
                  </Text>
                </View>

                {/* Location */}
                <View
                  style={[
                    styles.detailSection,
                    {
                      backgroundColor: theme.cardSoft,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.detailLabel, { color: theme.muted }]}>
                    Location
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.text }]}>
                    {selectedAppointment.location}
                  </Text>
                </View>

                {/* Date & Time */}
                <View style={styles.rowContainer}>
                  <View
                    style={[
                      styles.detailSection,
                      {
                        flex: 1,
                        backgroundColor: theme.cardSoft,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.detailLabel, { color: theme.muted }]}>
                      Date
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {selectedAppointment.date}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.detailSection,
                      {
                        flex: 1,
                        backgroundColor: theme.cardSoft,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.detailLabel, { color: theme.muted }]}>
                      Time
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {selectedAppointment.time}
                    </Text>
                  </View>
                </View>

                {/* Status */}
                <View
                  style={[
                    styles.detailSection,
                    {
                      backgroundColor: theme.cardSoft,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.detailLabel, { color: theme.muted }]}>
                    Status
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: getStatusColor(selectedAppointment.status),
                      },
                    ]}
                  >
                    {selectedAppointment.status === "upcoming"
                      ? "Upcoming"
                      : "Completed"}
                  </Text>
                </View>

                {/* Call Button */}
                {selectedAppointment.status === "upcoming" && (
                  <Pressable
                    style={[
                      styles.callButton,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <Ionicons name="call" size={20} color="#FFFFFF" />
                    <Text style={styles.callButtonText}>Call Doctor</Text>
                  </Pressable>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
  },
  appointmentsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  appointmentCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  appointmentContent: {
    gap: 12,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  specialty: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  appointmentDetails: {
    flexDirection: "row",
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    fontWeight: "500",
  },
  viewButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  detailSection: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  detailSubtext: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  callButton: {
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  callButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
