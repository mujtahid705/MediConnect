import { useAuthTheme } from "@/components/auth-screen";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  icon: string;
  color: string;
  rating: number;
  experience: string;
};

const SPECIALTY_STYLE: Record<string, { icon: string; color: string }> = {
  Cardiology:  { icon: "favorite",         color: "#FF6B6B" },
  Neurology:   { icon: "psychology",       color: "#4ECDC4" },
  Dentistry:   { icon: "medical-services", color: "#FF9E64" },
  Dermatology: { icon: "spa",              color: "#5EBF7F" },
  Orthopedics: { icon: "construction",     color: "#1F7AE0" },
  Pediatrics:  { icon: "child-care",       color: "#E91E63" },
  Psychology:  { icon: "psychology",       color: "#8B5CF6" },
  Surgery:     { icon: "bloodtype",        color: "#C62828" },
  General:     { icon: "medical-services", color: "#1F7AE0" },
};
const FALLBACK_STYLE = { icon: "medical-services", color: "#1F7AE0" };

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const theme = useAuthTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [doctorsModalVisible, setDoctorsModalVisible] = useState(false);
  const [hospitalsModalVisible, setHospitalsModalVisible] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null,
  );

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);

  const loadDoctors = useCallback(async () => {
    setDoctorsLoading(true);
    setDoctorsError(null);
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, specialty")
      .eq("role", "doctor")
      .eq("is_active", true)
      .eq("is_verified", true)
      .order("full_name", { ascending: true });
    if (error) {
      setDoctorsError(error.message);
      setDoctors([]);
    } else {
      setDoctors(
        (data ?? []).map((d) => {
          const style = SPECIALTY_STYLE[d.specialty ?? ""] ?? FALLBACK_STYLE;
          return {
            id: d.id,
            name: d.full_name,
            specialty: d.specialty ?? "General",
            icon: style.icon,
            color: style.color,
            rating: 4.7,
            experience: "—",
          };
        }),
      );
    }
    setDoctorsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadDoctors().then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [loadDoctors]);

  // Promotional cards data
  const promos = [
    {
      id: 1,
      title: "Book a Doctor",
      subtitle: "Get 20% off on first consultation",
      color: "#FF9E64",
      icon: "event-note",
    },
    {
      id: 2,
      title: "Health Records",
      subtitle: "Access your medical history anytime",
      color: "#5EBF7F",
      icon: "description",
    },
    {
      id: 3,
      title: "Lab Tests",
      subtitle: "Home collection available",
      color: "#1F7AE0",
      icon: "science",
    },
    {
      id: 4,
      title: "Medicine Delivery",
      subtitle: "Get medicines at your doorstep",
      color: "#8B5CF6",
      icon: "local-pharmacy",
    },
  ];

  const categories = [
    {
      id: 1,
      specialty: "Cardiology",
      icon: "favorite",
      color: "#FFE5E5",
      textColor: "#FF6B6B",
    },
    {
      id: 2,
      specialty: "Neurology",
      icon: "psychology",
      color: "#E0F7F6",
      textColor: "#4ECDC4",
    },
    {
      id: 3,
      specialty: "Dentistry",
      icon: "tooth",
      color: "#FFF5E5",
      textColor: "#FF9E64",
    },
    {
      id: 4,
      specialty: "Dermatology",
      icon: "spa",
      color: "#E8F5E9",
      textColor: "#5EBF7F",
    },
    {
      id: 5,
      specialty: "Orthopedics",
      icon: "construction",
      color: "#E3F2FD",
      textColor: "#1F7AE0",
    },
    {
      id: 6,
      specialty: "Pediatrics",
      icon: "child-care",
      color: "#FCE4EC",
      textColor: "#E91E63",
    },
    {
      id: 7,
      specialty: "Psychology",
      icon: "psychology",
      color: "#F3E5F5",
      textColor: "#8B5CF6",
    },
    {
      id: 8,
      specialty: "Surgery",
      icon: "bloodtype",
      color: "#FFEBEE",
      textColor: "#C62828",
    },
  ];

  const hospitals = [
    {
      id: 1,
      name: "Evercare Hospital Dhaka",
      address: "Plot 81, Block E, Bashundhara R/A",
      rating: 4.8,
      beds: 450,
      icon: "local-hospital",
      color: "#FF6B6B",
    },
    {
      id: 2,
      name: "United Hospital",
      address: "Plot 15, Road 71, Gulshan 2, Dhaka",
      rating: 4.6,
      beds: 320,
      icon: "local-hospital",
      color: "#4ECDC4",
    },
    {
      id: 3,
      name: "Square Hospital",
      address: "18/F Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath",
      rating: 4.9,
      beds: 280,
      icon: "local-hospital",
      color: "#1F7AE0",
    },
    {
      id: 4,
      name: "Labaid Specialized Hospital",
      address: "House 06, Road 04, Dhanmondi, Dhaka",
      rating: 4.7,
      beds: 400,
      icon: "local-hospital",
      color: "#8B5CF6",
    },
    {
      id: 5,
      name: "Ibn Sina Hospital",
      address: "House 48, Road 9/A, Dhanmondi, Dhaka",
      rating: 4.5,
      beds: 220,
      icon: "local-hospital",
      color: "#5EBF7F",
    },
    {
      id: 6,
      name: "Popular Medical Centre",
      address: "House 16, Road 2, Dhanmondi, Dhaka",
      rating: 4.4,
      beds: 180,
      icon: "local-hospital",
      color: "#FF9E64",
    },
  ];

  const renderPromoCard = ({ item }: { item: (typeof promos)[0] }) => (
    <View
      style={[
        styles.promoCard,
        {
          backgroundColor: item.color,
        },
      ]}
    >
      <View style={styles.promoContent}>
        <Text style={styles.promoTitle}>{item.title}</Text>
        <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
      </View>
      <View style={styles.promoIcon}>
        <MaterialIcons name={item.icon as any} size={32} color="#FFFFFF" />
      </View>
    </View>
  );

  const renderDoctorCard = ({ item }: { item: Doctor }) => (
    <View style={styles.doctorItem}>
      <View style={[styles.doctorAvatar, { backgroundColor: item.color }]}>
        <MaterialIcons name={item.icon as any} size={32} color="#FFFFFF" />
      </View>
      <Text
        style={[styles.doctorName, { color: theme.text }]}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {item.name}
      </Text>
      <Text
        style={[styles.doctorSpecialty, { color: theme.muted }]}
        numberOfLines={1}
      >
        {item.specialty}
      </Text>
    </View>
  );

  const renderCategoryCard = ({ item }: { item: (typeof categories)[0] }) => {
    const count = doctors.filter((d) => d.specialty === item.specialty).length;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.categoryCard,
          { backgroundColor: item.color, opacity: pressed ? 0.75 : 1 },
        ]}
        onPress={() => setSelectedSpecialty(item.specialty)}
      >
        <MaterialIcons name={item.icon as any} size={28} color={item.textColor} />
        <Text
          style={[styles.categoryText, { color: item.textColor }]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {item.specialty}
        </Text>
        <Text style={[styles.categoryCount, { color: item.textColor }]}>
          {doctorsLoading ? "…" : `${count} dr${count !== 1 ? "s" : ""}`}
        </Text>
      </Pressable>
    );
  };

  const renderHospitalCard = ({ item }: { item: (typeof hospitals)[0] }) => (
    <View
      style={[
        styles.hospitalCard,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={[styles.hospitalIcon, { backgroundColor: item.color }]}>
        <MaterialIcons name={item.icon as any} size={28} color="#FFFFFF" />
      </View>
      <View style={styles.hospitalContent}>
        <Text style={[styles.hospitalName, { color: theme.text }]}>
          {item.name}
        </Text>
        <Text
          style={[styles.hospitalAddress, { color: theme.muted }]}
          numberOfLines={1}
        >
          {item.address}
        </Text>
        <View style={styles.hospitalFooter}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={[styles.ratingText, { color: theme.text }]}>
              {item.rating}
            </Text>
          </View>
          <Text style={[styles.bedsText, { color: theme.muted }]}>
            {item.beds} beds
          </Text>
        </View>
      </View>
    </View>
  );

  // Modal doctor row — richer than the horizontal card
  const renderModalDoctorRow = ({ item }: { item: Doctor }) => (
    <View
      style={[
        styles.modalDoctorRow,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={[styles.modalDoctorAvatar, { backgroundColor: item.color }]}>
        <MaterialIcons name={item.icon as any} size={26} color="#FFFFFF" />
      </View>
      <View style={styles.modalDoctorInfo}>
        <Text style={[styles.modalDoctorName, { color: theme.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.modalDoctorSpecialty, { color: theme.muted }]}>
          {item.specialty}
        </Text>
        <View style={styles.modalDoctorMeta}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={[styles.modalMetaText, { color: theme.text }]}>
              {item.rating}
            </Text>
          </View>
          <View style={[styles.expChip, { backgroundColor: theme.cardSoft }]}>
            <Text style={[styles.modalMetaText, { color: theme.muted }]}>
              {item.experience}
            </Text>
          </View>
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.bookBtn,
          { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => {
          router.push(`/(tabs)/appointments?bookDoctorId=${item.id}`);
        }}
      >
        <Text style={styles.bookBtnText}>Book</Text>
      </Pressable>
    </View>
  );

  // Modal hospital row — expanded version of the home card
  const renderModalHospitalRow = ({
    item,
  }: {
    item: (typeof hospitals)[0];
  }) => (
    <View
      style={[
        styles.modalHospitalRow,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={[styles.modalHospitalIcon, { backgroundColor: item.color }]}>
        <MaterialIcons name={item.icon as any} size={30} color="#FFFFFF" />
      </View>
      <View style={styles.hospitalContent}>
        <Text style={[styles.hospitalName, { color: theme.text }]}>
          {item.name}
        </Text>
        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={12} color={theme.muted} />
          <Text
            style={[styles.hospitalAddress, { color: theme.muted, flex: 1 }]}
            numberOfLines={2}
          >
            {item.address}
          </Text>
        </View>
        <View style={styles.hospitalFooter}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={13} color="#FFD700" />
            <Text style={[styles.ratingText, { color: theme.text }]}>
              {item.rating}
            </Text>
          </View>
          <View style={[styles.expChip, { backgroundColor: theme.cardSoft }]}>
            <MaterialIcons name="hotel" size={11} color={theme.muted} />
            <Text style={[styles.modalMetaText, { color: theme.muted }]}>
              {item.beds} beds
            </Text>
          </View>
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.dirBtn,
          {
            backgroundColor: theme.primarySoft,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Ionicons name="navigate-outline" size={18} color={theme.primary} />
      </Pressable>
    </View>
  );

  const specialtyAccent =
    categories.find((c) => c.specialty === selectedSpecialty)?.textColor ??
    theme.primary;

  const filteredDoctors = doctors.filter(
    (d) => d.specialty === selectedSpecialty,
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with greeting */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.muted }]}>
              Welcome back
            </Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {user?.fullName || "User"}
            </Text>
          </View>
          <View
            style={[
              styles.notificationBadge,
              { backgroundColor: theme.danger },
            ]}
          >
            <Ionicons name="notifications" size={20} color="#FFFFFF" />
            <View style={styles.badgeDot} />
          </View>
        </View>

        {/* Promotional Cards Section - Horizontal Scroll */}
        <View style={styles.promoSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Special Offers
          </Text>
          <FlatList
            data={promos}
            renderItem={renderPromoCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promoListContent}
            scrollEventThrottle={16}
          />
        </View>

        {/* Top Doctors Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Top Doctors
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.seeAllBtn,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              onPress={() => setDoctorsModalVisible(true)}
            >
              <Text style={[styles.seeAllText, { color: theme.primary }]}>
                See all
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={theme.primary}
              />
            </Pressable>
          </View>
          {doctorsLoading ? (
            <View style={styles.doctorsPlaceholder}>
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          ) : doctorsError ? (
            <View style={styles.doctorsPlaceholder}>
              <Text style={[styles.doctorsErrorText, { color: theme.danger }]}>
                Could not load doctors
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.retryBtn,
                  { backgroundColor: theme.primarySoft, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={loadDoctors}
              >
                <Text style={[styles.retryBtnText, { color: theme.primary }]}>Retry</Text>
              </Pressable>
            </View>
          ) : doctors.length === 0 ? (
            <View style={styles.doctorsPlaceholder}>
              <Text style={[styles.doctorsErrorText, { color: theme.muted }]}>
                No doctors available yet
              </Text>
            </View>
          ) : (
            <FlatList
              data={doctors.slice(0, 5)}
              renderItem={renderDoctorCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.doctorsContainer}
              scrollEventThrottle={16}
            />
          )}
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Specializations
            </Text>
            <View style={styles.seeAllBtn}>
              <Text style={[styles.seeAllText, { color: theme.muted }]}>
                Tap to filter
              </Text>
            </View>
          </View>
          <FlatList
            data={categories}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={4}
            scrollEnabled={false}
            contentContainerStyle={styles.categoriesGrid}
          />
        </View>

        {/* Hospitals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Nearby Hospitals
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.seeAllBtn,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              onPress={() => setHospitalsModalVisible(true)}
            >
              <Text style={[styles.seeAllText, { color: theme.primary }]}>
                View all
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={theme.primary}
              />
            </Pressable>
          </View>
          <FlatList
            data={hospitals.slice(0, 4)}
            renderItem={renderHospitalCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.hospitalsContainer}
          />
        </View>

        {/* Quick Tips Section */}
        <View
          style={[
            styles.tipsSection,
            { backgroundColor: theme.cardSoft, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.tipsTitle, { color: theme.text }]}>
            Health Tip of the Day
          </Text>
          <Text style={[styles.tipsText, { color: theme.muted }]}>
            Drink at least 8 glasses of water daily to maintain good health and
            hydration.
          </Text>
        </View>
      </ScrollView>

      {/* ── Top Doctors Modal ── */}
      <Modal
        visible={doctorsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDoctorsModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <SafeAreaView
            style={[styles.modalSheet, { backgroundColor: theme.background }]}
          >
            {/* Modal header */}
            <View
              style={[styles.modalHeader, { borderBottomColor: theme.border }]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.closeBtn,
                  {
                    backgroundColor: theme.cardSoft,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => setDoctorsModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={theme.text} />
              </Pressable>
              <View style={styles.modalTitleBlock}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Top Doctors
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.muted }]}>
                  {doctorsLoading
                    ? "Loading…"
                    : `${doctors.length} doctor${doctors.length !== 1 ? "s" : ""} available`}
                </Text>
              </View>
              <View style={styles.closeBtnPlaceholder} />
            </View>
            {/* Doctor list */}
            {doctorsLoading ? (
              <View style={styles.modalLoadingState}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            ) : doctorsError ? (
              <View style={styles.modalLoadingState}>
                <MaterialIcons name="error-outline" size={48} color={theme.danger} />
                <Text style={[styles.emptyText, { color: theme.danger }]}>
                  Could not load doctors
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.retryBtn,
                    { backgroundColor: theme.primarySoft, opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={loadDoctors}
                >
                  <Text style={[styles.retryBtnText, { color: theme.primary }]}>Retry</Text>
                </Pressable>
              </View>
            ) : doctors.length === 0 ? (
              <View style={styles.modalLoadingState}>
                <MaterialIcons name="medical-services" size={56} color={theme.border} />
                <Text style={[styles.emptyText, { color: theme.muted }]}>
                  No doctors available yet
                </Text>
              </View>
            ) : (
              <FlatList
                data={doctors}
                renderItem={renderModalDoctorRow}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.modalListContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </SafeAreaView>
        </View>
      </Modal>

      {/* ── Nearby Hospitals Modal ── */}
      <Modal
        visible={hospitalsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHospitalsModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <SafeAreaView
            style={[styles.modalSheet, { backgroundColor: theme.background }]}
          >
            <View
              style={[styles.modalHeader, { borderBottomColor: theme.border }]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.closeBtn,
                  {
                    backgroundColor: theme.cardSoft,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => setHospitalsModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={theme.text} />
              </Pressable>
              <View style={styles.modalTitleBlock}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Nearby Hospitals
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.muted }]}>
                  {hospitals.length} hospitals found
                </Text>
              </View>
              <View style={styles.closeBtnPlaceholder} />
            </View>
            <FlatList
              data={hospitals}
              renderItem={renderModalHospitalRow}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.modalListContent}
              showsVerticalScrollIndicator={false}
            />
          </SafeAreaView>
        </View>
      </Modal>

      {/* ── Specialization Modal ── */}
      <Modal
        visible={selectedSpecialty !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedSpecialty(null)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <SafeAreaView
            style={[styles.modalSheet, { backgroundColor: theme.background }]}
          >
            <View
              style={[styles.modalHeader, { borderBottomColor: theme.border }]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.closeBtn,
                  {
                    backgroundColor: theme.cardSoft,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
                onPress={() => setSelectedSpecialty(null)}
              >
                <Ionicons name="close" size={22} color={theme.text} />
              </Pressable>
              <View style={styles.modalTitleBlock}>
                <View style={styles.specialtyTitleRow}>
                  <View
                    style={[
                      styles.specialtyDot,
                      { backgroundColor: specialtyAccent },
                    ]}
                  />
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    {selectedSpecialty} Specialists
                  </Text>
                </View>
                <Text style={[styles.modalSubtitle, { color: theme.muted }]}>
                  {doctorsLoading
                    ? "Loading…"
                    : `${filteredDoctors.length} specialist${filteredDoctors.length !== 1 ? "s" : ""} available`}
                </Text>
              </View>
              <View style={styles.closeBtnPlaceholder} />
            </View>
            {doctorsLoading ? (
              <View style={styles.modalLoadingState}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            ) : doctorsError ? (
              <View style={styles.modalLoadingState}>
                <MaterialIcons name="error-outline" size={48} color={theme.danger} />
                <Text style={[styles.emptyText, { color: theme.danger }]}>
                  Could not load doctors
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.retryBtn,
                    { backgroundColor: theme.primarySoft, opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={loadDoctors}
                >
                  <Text style={[styles.retryBtnText, { color: theme.primary }]}>Retry</Text>
                </Pressable>
              </View>
            ) : filteredDoctors.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons
                  name="medical-services"
                  size={56}
                  color={theme.border}
                />
                <Text style={[styles.emptyText, { color: theme.muted }]}>
                  No specialists found
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredDoctors}
                renderItem={renderModalDoctorRow}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.modalListContent}
                showsVerticalScrollIndicator={false}
              />
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  notificationBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badgeDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  promoSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "600",
  },
  promoListContent: {
    paddingRight: 12,
  },
  promoCard: {
    width: (width - 48) * 0.8,
    height: 120,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  promoSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
  },
  promoIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  doctorsContainer: {
    gap: 8,
    paddingRight: 8,
  },
  doctorItem: {
    alignItems: "center",
    marginRight: 8,
  },
  doctorAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  doctorName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    width: 70,
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 10,
    fontWeight: "400",
    textAlign: "center",
    width: 70,
  },
  categoriesGrid: {
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 0,
  },
  categoryCard: {
    width: "23%",
    aspectRatio: 0.9,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 6,
  },
  categoryCount: {
    fontSize: 9,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 2,
    opacity: 0.7,
  },
  hospitalsContainer: {
    gap: 12,
    paddingHorizontal: 0,
  },
  hospitalCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  hospitalIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  hospitalContent: {
    flex: 1,
    gap: 4,
  },
  hospitalName: {
    fontSize: 14,
    fontWeight: "700",
  },
  hospitalAddress: {
    fontSize: 11,
    fontWeight: "400",
  },
  hospitalFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "600",
  },
  bedsText: {
    fontSize: 10,
    fontWeight: "500",
  },
  tipsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  tipsText: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },

  // ── Modal styles ──
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnPlaceholder: {
    width: 40,
  },
  modalTitleBlock: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  specialtyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  specialtyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  modalListContent: {
    padding: 16,
    gap: 12,
  },
  modalDoctorRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  modalDoctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  modalDoctorInfo: {
    flex: 1,
    gap: 4,
  },
  modalDoctorName: {
    fontSize: 15,
    fontWeight: "700",
  },
  modalDoctorSpecialty: {
    fontSize: 12,
    fontWeight: "500",
  },
  modalDoctorMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  modalMetaText: {
    fontSize: 11,
    fontWeight: "500",
  },
  expChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bookBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bookBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  modalHospitalRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  modalHospitalIcon: {
    width: 60,
    height: 60,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
  dirBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
  },
  doctorsPlaceholder: {
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  doctorsErrorText: {
    fontSize: 13,
    fontWeight: "500",
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  modalLoadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
});
