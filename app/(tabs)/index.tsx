import { useAuthTheme } from "@/components/auth-screen";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const theme = useAuthTheme();

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

  const doctors = [
    {
      id: 1,
      name: "Dr. Asif",
      specialty: "Cardiologist",
      icon: "favorite",
      color: "#FF6B6B",
    },
    {
      id: 2,
      name: "Dr. Nazrul",
      specialty: "Neurologist",
      icon: "psychology",
      color: "#4ECDC4",
    },
    {
      id: 3,
      name: "Dr. Mujibur",
      specialty: "General",
      icon: "medical-services",
      color: "#1F7AE0",
    },
    {
      id: 4,
      name: "Dr. Ziaur",
      specialty: "Dermatologist",
      icon: "spa",
      color: "#FFD93D",
    },
    {
      id: 5,
      name: "Dr. Ershad",
      specialty: "Surgeon",
      icon: "bloodtype",
      color: "#D8B4FE",
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

  const renderDoctorCard = ({ item }: { item: (typeof doctors)[0] }) => (
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

  const renderCategoryCard = ({ item }: { item: (typeof categories)[0] }) => (
    <View
      style={[
        styles.categoryCard,
        {
          backgroundColor: item.color,
        },
      ]}
    >
      <MaterialIcons name={item.icon as any} size={28} color={item.textColor} />
      <Text
        style={[styles.categoryText, { color: item.textColor }]}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {item.specialty}
      </Text>
    </View>
  );

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
              John Doe
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
            <Text
              style={{ color: theme.primary, fontSize: 12, fontWeight: "600" }}
            >
              See all
            </Text>
          </View>
          <FlatList
            data={doctors}
            renderItem={renderDoctorCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.doctorsContainer}
            scrollEventThrottle={16}
          />
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Specializations
            </Text>
            <Text
              style={{ color: theme.primary, fontSize: 12, fontWeight: "600" }}
            >
              View all
            </Text>
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
            <Text
              style={{ color: theme.primary, fontSize: 12, fontWeight: "600" }}
            >
              View all
            </Text>
          </View>
          <FlatList
            data={hospitals}
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
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
});
