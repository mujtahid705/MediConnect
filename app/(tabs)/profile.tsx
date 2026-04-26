import { useAuthTheme } from "@/components/auth-screen";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  full_name: string;
  phone: string;
  date_of_birth: string;
  blood_group: string;
  address: string;
  emergency_contact: string;
  // doctor-only
  specialty: string;
  license: string;
  designation: string;
  institution: string;
}

const EMPTY_PROFILE: ProfileData = {
  full_name: "",
  phone: "",
  date_of_birth: "",
  blood_group: "",
  address: "",
  emergency_contact: "",
  specialty: "",
  license: "",
  designation: "",
  institution: "",
};

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  editable = true,
  theme,
}: {
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  keyboardType?: any;
  multiline?: boolean;
  editable?: boolean;
  theme: ReturnType<typeof useAuthTheme>;
}) {
  return (
    <View style={fieldStyles.block}>
      <Text style={[fieldStyles.label, { color: theme.muted }]}>{label}</Text>
      <View
        style={[
          fieldStyles.shell,
          { backgroundColor: editable ? theme.cardSoft : theme.background, borderColor: theme.border },
        ]}
      >
        <TextInput
          style={[fieldStyles.input, { color: editable ? theme.text : theme.muted }, multiline && fieldStyles.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}
          placeholderTextColor={theme.muted}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          editable={editable}
        />
      </View>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  block: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 5 },
  shell: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: "center",
  },
  input: { fontSize: 14, paddingVertical: 10 },
  multiline: { minHeight: 72, textAlignVertical: "top" },
});

// ─── Edit Profile Modal ───────────────────────────────────────────────────────

function EditProfileModal({
  visible,
  role,
  email,
  initialData,
  onClose,
  onSaved,
  userId,
  theme,
}: {
  visible: boolean;
  role: "patient" | "doctor";
  email: string;
  initialData: ProfileData;
  onClose: () => void;
  onSaved: (updated: ProfileData) => void;
  userId: string;
  theme: ReturnType<typeof useAuthTheme>;
}) {
  const [form, setForm] = useState<ProfileData>(initialData);
  const [saving, setSaving] = useState(false);

  // sync when parent data changes (e.g. first open after fetch)
  useEffect(() => {
    setForm(initialData);
  }, [initialData, visible]);

  const update = (key: keyof ProfileData) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    const payload: Record<string, any> = {
      full_name: form.full_name,
      phone: form.phone,
      date_of_birth: form.date_of_birth || null,
      blood_group: form.blood_group,
      address: form.address,
      emergency_contact: form.emergency_contact || null,
    };
    if (role === "doctor") {
      payload.specialty = form.specialty;
      payload.license = form.license;
      payload.designation = form.designation;
      payload.institution = form.institution;
    }
    const { error } = await supabase.from("users").update(payload).eq("id", userId);
    setSaving(false);
    if (error) {
      Alert.alert("Save failed", error.message);
      return;
    }
    onSaved(form);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[modalStyles.overlay, { backgroundColor: theme.overlay }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={modalStyles.kav}
        >
          <View style={[modalStyles.sheet, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <View style={[modalStyles.handle, { backgroundColor: theme.border }]} />

            <View style={modalStyles.sheetHeader}>
              <View>
                <Text style={[modalStyles.sheetTitle, { color: theme.text }]}>Edit Profile</Text>
                <Text style={[modalStyles.sheetSubtitle, { color: theme.muted }]}>
                  {role === "doctor" ? "Doctor account" : "Patient account"}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={[modalStyles.closeBtn, { backgroundColor: theme.cardSoft }]}
              >
                <Ionicons name="close" size={18} color={theme.muted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={modalStyles.scrollContent}>
              <Text style={[modalStyles.section, { color: theme.primary }]}>Basic Info</Text>

              <Field label="Full Name" value={form.full_name} onChangeText={update("full_name")} theme={theme} />
              <Field label="Email" value={email} editable={false} theme={theme} />
              <Field label="Phone" value={form.phone} onChangeText={update("phone")} keyboardType="phone-pad" theme={theme} />
              <Field label="Date of Birth" value={form.date_of_birth} onChangeText={update("date_of_birth")} placeholder="YYYY-MM-DD" theme={theme} />
              <Field label="Blood Group" value={form.blood_group} onChangeText={update("blood_group")} placeholder="e.g. A+" theme={theme} />
              <Field label="Address" value={form.address} onChangeText={update("address")} multiline theme={theme} />

              {role === "patient" && (
                <>
                  <Text style={[modalStyles.section, { color: theme.primary }]}>Medical Info</Text>
                  <Field label="Emergency Contact" value={form.emergency_contact} onChangeText={update("emergency_contact")} placeholder="Name — Phone" theme={theme} />
                </>
              )}

              {role === "doctor" && (
                <>
                  <Text style={[modalStyles.section, { color: theme.primary }]}>Professional Info</Text>
                  <Field label="Specialty" value={form.specialty} onChangeText={update("specialty")} theme={theme} />
                  <Field label="Designation" value={form.designation} onChangeText={update("designation")} theme={theme} />
                  <Field label="Institution" value={form.institution} onChangeText={update("institution")} theme={theme} />
                  <Field label="License Number" value={form.license} onChangeText={update("license")} theme={theme} />
                </>
              )}
            </ScrollView>

            <View style={[modalStyles.footer, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                style={[modalStyles.saveBtn, { backgroundColor: theme.primary, opacity: saving ? 0.6 : 1 }]}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                )}
                <Text style={modalStyles.saveBtnText}>{saving ? "Saving…" : "Save Changes"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  kav: { justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: "90%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sheetTitle: { fontSize: 20, fontWeight: "800" },
  sheetSubtitle: { fontSize: 12, fontWeight: "500", marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 8 },
  section: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  saveBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const theme = useAuthTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [editVisible, setEditVisible] = useState(false);

  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [profileLoading, setProfileLoading] = useState(true);

  const role = (user?.role === "doctor" ? "doctor" : "patient") as "patient" | "doctor";

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    setProfileLoading(true);
    const { data } = await supabase
      .from("users")
      .select("full_name, phone, date_of_birth, blood_group, address, emergency_contact, specialty, license, designation, institution")
      .eq("id", user.id)
      .single();
    if (data) {
      setProfile({
        full_name: data.full_name ?? "",
        phone: data.phone ?? "",
        date_of_birth: data.date_of_birth ?? "",
        blood_group: data.blood_group ?? "",
        address: data.address ?? "",
        emergency_contact: data.emergency_contact ?? "",
        specialty: data.specialty ?? "",
        license: data.license ?? "",
        designation: data.designation ?? "",
        institution: data.institution ?? "",
      });
    }
    setProfileLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  const displayName = profile.full_name || user?.fullName || "—";
  const displayEmail = user?.email ?? "—";
  const displaySub = role === "doctor"
    ? (profile.specialty || profile.designation || "Doctor")
    : "Patient";

  const profileOptions = [
    { icon: "lock-closed-outline", label: "Security", action: () => {} },
    { icon: "notifications-outline", label: "Notifications", action: () => {} },
    { icon: "help-circle-outline", label: "Help & Support", action: () => {} },
    { icon: "document-text-outline", label: "Terms & Privacy", action: () => {} },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.profileAvatar, { backgroundColor: theme.primary }]}>
            <Ionicons name={role === "doctor" ? "medical" : "person"} size={40} color="#FFFFFF" />
          </View>

          <View style={styles.profileInfo}>
            {profileLoading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <>
                <Text style={[styles.profileName, { color: theme.text }]}>{displayName}</Text>
                <Text style={[styles.profileRole, { color: theme.muted }]}>{displaySub}</Text>
                <Text style={[styles.profileEmail, { color: theme.muted }]}>{displayEmail}</Text>
              </>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setEditVisible(true)}
            style={[styles.editButton, { backgroundColor: theme.primarySoft }]}
          >
            <Ionicons name="pencil" size={16} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        {!profileLoading && (
          <View style={styles.infoSection}>
            {role === "patient" && (
              <>
                <InfoRow icon="call-outline" label="Phone" value={profile.phone || "—"} theme={theme} />
                <InfoRow icon="water-outline" label="Blood Group" value={profile.blood_group || "—"} theme={theme} />
                <InfoRow icon="calendar-outline" label="Date of Birth" value={profile.date_of_birth || "—"} theme={theme} />
                <InfoRow icon="location-outline" label="Address" value={profile.address || "—"} theme={theme} />
                {profile.emergency_contact ? (
                  <InfoRow icon="alert-circle-outline" label="Emergency Contact" value={profile.emergency_contact} theme={theme} />
                ) : null}
              </>
            )}
            {role === "doctor" && (
              <>
                <InfoRow icon="call-outline" label="Phone" value={profile.phone || "—"} theme={theme} />
                <InfoRow icon="medical-outline" label="Specialty" value={profile.specialty || "—"} theme={theme} />
                <InfoRow icon="briefcase-outline" label="Designation" value={profile.designation || "—"} theme={theme} />
                <InfoRow icon="business-outline" label="Institution" value={profile.institution || "—"} theme={theme} />
                <InfoRow icon="card-outline" label="License" value={profile.license || "—"} theme={theme} />
              </>
            )}
          </View>
        )}

        {/* Settings Options */}
        <View style={styles.optionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
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
              <Ionicons name={option.icon as any} size={20} color={theme.primary} />
              <Text style={[styles.optionLabel, { color: theme.text }]}>{option.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={[styles.signOutButton, { backgroundColor: theme.danger }]}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <EditProfileModal
        visible={editVisible}
        role={role}
        email={displayEmail}
        initialData={profile}
        userId={user?.id ?? ""}
        onClose={() => setEditVisible(false)}
        onSaved={(updated) => setProfile(updated)}
        theme={theme}
      />
    </SafeAreaView>
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
    <View style={[infoRowStyles.row, { borderColor: theme.border, backgroundColor: theme.card }]}>
      <View style={[infoRowStyles.iconBox, { backgroundColor: theme.primarySoft }]}>
        <Ionicons name={icon as any} size={16} color={theme.primary} />
      </View>
      <Text style={[infoRowStyles.label, { color: theme.muted }]}>{label}</Text>
      <Text style={[infoRowStyles.value, { color: theme.text }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const infoRowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 12, fontWeight: "600", width: 110 },
  value: { flex: 1, fontSize: 13, fontWeight: "500" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 32, fontWeight: "800" },
  profileCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
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
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  profileRole: { fontSize: 12, fontWeight: "500", marginBottom: 2 },
  profileEmail: { fontSize: 11, fontWeight: "400" },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  infoSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    borderColor: "transparent",
  },
  optionsSection: { marginHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    gap: 12,
  },
  optionLabel: { flex: 1, fontSize: 14, fontWeight: "500" },
  signOutButton: {
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  signOutText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
});
