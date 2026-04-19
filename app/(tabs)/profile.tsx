import { useAuthTheme } from "@/components/auth-screen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const theme = useAuthTheme();
  const router = useRouter();

  const profileOptions = [
    { icon: "person-outline", label: "Personal Info", action: () => {} },
    { icon: "lock-closed-outline", label: "Security", action: () => {} },
    { icon: "notifications-outline", label: "Notifications", action: () => {} },
    {
      icon: "help-circle-outline",
      label: "Help & Support",
      action: () => {},
    },
    {
      icon: "document-text-outline",
      label: "Terms & Privacy",
      action: () => {},
    },
  ];

  const handleSignOut = () => {
    router.replace("/login");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Profile
          </Text>
        </View>

        {/* Profile Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[styles.profileAvatar, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text }]}>
              John Doe
            </Text>
            <Text style={[styles.profileRole, { color: theme.muted }]}>
              Patient
            </Text>
            <Text style={[styles.profileEmail, { color: theme.muted }]}>
              john@example.com
            </Text>
          </View>

          <View
            style={[styles.editButton, { backgroundColor: theme.primarySoft }]}
          >
            <Ionicons name="pencil" size={16} color={theme.primary} />
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View
            style={[
              styles.statItem,
              {
                backgroundColor: theme.cardSoft,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.statNumber, { color: theme.primary }]}>
              12
            </Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>
              Completed
            </Text>
          </View>
          <View
            style={[
              styles.statItem,
              {
                backgroundColor: theme.cardSoft,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.statNumber, { color: theme.primaryDark }]}>
              2
            </Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>
              Upcoming
            </Text>
          </View>
          <View
            style={[
              styles.statItem,
              {
                backgroundColor: theme.cardSoft,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={[styles.statNumber, { color: theme.success }]}>
              18
            </Text>
            <Text style={[styles.statLabel, { color: theme.text }]}>
              Records
            </Text>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.optionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Settings
          </Text>
          {profileOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={option.action}
              style={[
                styles.optionItem,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderBottomWidth: index < profileOptions.length - 1 ? 1 : 0,
                },
              ]}
            >
              <Ionicons
                name={option.icon as any}
                size={20}
                color={theme.primary}
              />
              <Text style={[styles.optionLabel, { color: theme.text }]}>
                {option.label}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={theme.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={[styles.signOutButton, { backgroundColor: theme.danger }]}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
  profileCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    alignItems: "center",
    gap: 12,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 11,
    fontWeight: "400",
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statsSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 8,
  },
  statItem: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  optionsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 12,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  signOutButton: {
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
