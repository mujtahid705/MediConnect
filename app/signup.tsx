import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  ActionButton,
  AuthField,
  AuthScreen,
  ChoiceChip,
  FeedbackModal,
  InlineNotice,
  useAuthTheme,
} from "@/components/auth-screen";

type Role = "patient" | "doctor";

type PatientCondition = {
  id: string;
  name: string;
  notes: string;
};

type DoctorDegree = {
  id: string;
  title: string;
  institution: string;
};

type Errors = {
  fullName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  bloodGroup?: string;
  nid?: string;
  address?: string;
  password?: string;
  confirmPassword?: string;
  emergencyContact?: string;
  conditions?: string;
  designation?: string;
  specialty?: string;
  institution?: string;
  license?: string;
  degrees?: string;
  idImages?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+]?\d[\d\s()-]{7,}$/;

export default function SignupScreen() {
  const router = useRouter();
  const theme = useAuthTheme();
  const [role, setRole] = useState<Role>("patient");

  // Common fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [nid, setNid] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  // Patient specific
  const [emergencyContact, setEmergencyContact] = useState("");
  const [conditions, setConditions] = useState<PatientCondition[]>([]);
  const [conditionInput, setConditionInput] = useState("");
  const [conditionNotes, setConditionNotes] = useState("");

  // Doctor specific
  const [designation, setDesignation] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [institution, setInstitution] = useState("");
  const [license, setLicense] = useState("");
  const [degrees, setDegrees] = useState<DoctorDegree[]>([]);
  const [degreeInput, setDegreeInput] = useState("");
  const [degreeInstitution, setDegreeInstitution] = useState("");
  const [frontIdUri, setFrontIdUri] = useState<string | null>(null);
  const [backIdUri, setBackIdUri] = useState<string | null>(null);

  const [successVisible, setSuccessVisible] = useState(false);
  const [pendingVisible, setPendingVisible] = useState(false);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const roleCopy = useMemo(
    () => ({
      patient: {
        title: "Patient registration",
        subtitle: "Create your profile with medical history.",
      },
      doctor: {
        title: "Doctor registration",
        subtitle: "Register your account and credentials.",
      },
    }),
    [],
  );

  const fieldErrorSetter = (field: keyof Errors) => () => {
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const validateCommon = (): boolean => {
    const nextErrors: Errors = {};
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) nextErrors.fullName = "Full name is required.";
    if (!cleanEmail) nextErrors.email = "Email is required.";
    else if (!emailPattern.test(cleanEmail))
      nextErrors.email = "Enter a valid email.";

    if (!cleanPhone) nextErrors.phone = "Phone number is required.";
    else if (!phonePattern.test(cleanPhone))
      nextErrors.phone = "Enter a valid phone number.";

    if (!dob) nextErrors.dob = "Date of birth is required.";
    if (!bloodGroup) nextErrors.bloodGroup = "Blood group is required.";
    if (!nid) nextErrors.nid = "NID/ID number is required.";
    if (!address) nextErrors.address = "Address is required.";

    if (!password) nextErrors.password = "Password is required.";
    else if (password.length < 6)
      nextErrors.password = "Password must be at least 6 characters.";

    if (!confirmPassword) nextErrors.confirmPassword = "Confirm your password.";
    else if (confirmPassword !== password)
      nextErrors.confirmPassword = "Passwords do not match.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validatePatient = (): boolean => {
    if (!validateCommon()) return false;

    const nextErrors: Errors = {};
    if (!emergencyContact.trim())
      nextErrors.emergencyContact = "Emergency contact is required.";
    if (conditions.length === 0)
      nextErrors.conditions = "Add at least one medical condition.";

    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validateDoctor = (): boolean => {
    if (!validateCommon()) return false;

    const nextErrors: Errors = {};
    if (!designation.trim())
      nextErrors.designation = "Designation is required.";
    if (!specialty.trim()) nextErrors.specialty = "Specialty is required.";
    if (!institution.trim())
      nextErrors.institution = "Institution is required.";
    if (!license.trim()) nextErrors.license = "License number is required.";
    if (degrees.length === 0) nextErrors.degrees = "Add at least one degree.";
    if (!frontIdUri || !backIdUri)
      nextErrors.idImages = "Upload both front and back ID images.";

    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const pickImage = async (setSide: (uri: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSide(result.assets[0].uri);
    }
  };

  const addCondition = () => {
    if (!conditionInput.trim()) {
      setErrors((current) => ({
        ...current,
        conditions: "Enter condition name.",
      }));
      return;
    }
    setConditions([
      ...conditions,
      {
        id: Date.now().toString(),
        name: conditionInput.trim(),
        notes: conditionNotes.trim(),
      },
    ]);
    setConditionInput("");
    setConditionNotes("");
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  const addDegree = () => {
    if (!degreeInput.trim() || !degreeInstitution.trim()) {
      setErrors((current) => ({
        ...current,
        degrees: "Enter degree and institution.",
      }));
      return;
    }
    setDegrees([
      ...degrees,
      {
        id: Date.now().toString(),
        title: degreeInput.trim(),
        institution: degreeInstitution.trim(),
      },
    ]);
    setDegreeInput("");
    setDegreeInstitution("");
  };

  const removeDegree = (id: string) => {
    setDegrees(degrees.filter((d) => d.id !== id));
  };

  const completePatientSignup = () => {
    setSuccessVisible(false);
    router.replace("/(tabs)");
  };

  const finishDoctorSignup = () => {
    setPendingVisible(false);
    router.replace("/login");
  };

  const submit = () => {
    if (role === "patient") {
      if (!validatePatient()) return;
    } else {
      if (!validateDoctor()) return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (role === "patient") {
        setSuccessVisible(true);
      } else {
        setPendingVisible(true);
      }
    }, 1100);
  };

  const renderPatientSection = () => (
    <>
      <AuthField
        label="Emergency contact"
        value={emergencyContact}
        onChangeText={(text) => {
          setEmergencyContact(text);
          fieldErrorSetter("emergencyContact")();
        }}
        placeholder="Name and phone"
        error={errors.emergencyContact}
      />

      <View style={{ gap: 12 }}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Medical conditions
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.muted }]}>
              Add your known conditions
            </Text>
          </View>
          <Pressable onPress={addCondition}>
            <Text
              style={{ fontSize: 20, color: theme.primary, fontWeight: "800" }}
            >
              +
            </Text>
          </Pressable>
        </View>

        {conditions.map((condition) => (
          <View
            key={condition.id}
            style={[styles.conditionRow, { borderColor: theme.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[{ fontWeight: "700", color: theme.text }]}>
                {condition.name}
              </Text>
              {condition.notes && (
                <Text style={[{ fontSize: 12, color: theme.muted }]}>
                  {condition.notes}
                </Text>
              )}
            </View>
            <Pressable onPress={() => removeCondition(condition.id)}>
              <Text style={{ color: theme.danger, fontSize: 18 }}>−</Text>
            </Pressable>
          </View>
        ))}

        {conditions.length > 0 && (
          <InlineNotice
            icon="checkmark-circle"
            title={`${conditions.length} condition(s) added`}
          />
        )}

        {conditions.length === 0 && (
          <View
            style={[
              styles.conditionInputBlock,
              { backgroundColor: theme.cardSoft, borderColor: theme.border },
            ]}
          >
            <AuthField
              label="Condition name"
              value={conditionInput}
              onChangeText={setConditionInput}
              placeholder="e.g., Asthma, Diabetes"
            />
            <AuthField
              label="Notes (optional)"
              value={conditionNotes}
              onChangeText={setConditionNotes}
              placeholder="Any relevant details"
              multiline
              numberOfLines={2}
            />
          </View>
        )}

        {errors.conditions && (
          <Text style={[styles.fieldError, { color: theme.danger }]}>
            {errors.conditions}
          </Text>
        )}
      </View>
    </>
  );

  const renderDoctorSection = () => (
    <>
      <AuthField
        label="Designation"
        value={designation}
        onChangeText={(text) => {
          setDesignation(text);
          fieldErrorSetter("designation")();
        }}
        placeholder="e.g., Consultant, Doctor, Professor"
        error={errors.designation}
      />

      <AuthField
        label="Specialty"
        value={specialty}
        onChangeText={(text) => {
          setSpecialty(text);
          fieldErrorSetter("specialty")();
        }}
        placeholder="e.g., Cardiology, Pediatrics"
        error={errors.specialty}
      />

      <AuthField
        label="Institution/Hospital"
        value={institution}
        onChangeText={(text) => {
          setInstitution(text);
          fieldErrorSetter("institution")();
        }}
        placeholder="Current institution"
        error={errors.institution}
      />

      <AuthField
        label="License number"
        value={license}
        onChangeText={(text) => {
          setLicense(text);
          fieldErrorSetter("license")();
        }}
        placeholder="Medical license number"
        error={errors.license}
      />

      <View style={{ gap: 12 }}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Degrees
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.muted }]}>
              Add your qualifications
            </Text>
          </View>
          <Pressable onPress={addDegree}>
            <Text
              style={{ fontSize: 20, color: theme.primary, fontWeight: "800" }}
            >
              +
            </Text>
          </Pressable>
        </View>

        {degrees.map((degree) => (
          <View
            key={degree.id}
            style={[styles.degreeRow, { borderColor: theme.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[{ fontWeight: "700", color: theme.text }]}>
                {degree.title}
              </Text>
              <Text style={[{ fontSize: 12, color: theme.muted }]}>
                {degree.institution}
              </Text>
            </View>
            <Pressable onPress={() => removeDegree(degree.id)}>
              <Text style={{ color: theme.danger, fontSize: 18 }}>−</Text>
            </Pressable>
          </View>
        ))}

        {degrees.length === 0 && (
          <View
            style={[
              styles.degreeInputBlock,
              { backgroundColor: theme.cardSoft, borderColor: theme.border },
            ]}
          >
            <AuthField
              label="Degree title"
              value={degreeInput}
              onChangeText={setDegreeInput}
              placeholder="e.g., MBBS, MD"
            />
            <AuthField
              label="Institution"
              value={degreeInstitution}
              onChangeText={setDegreeInstitution}
              placeholder="University or institution"
            />
          </View>
        )}

        {errors.degrees && (
          <Text style={[styles.fieldError, { color: theme.danger }]}>
            {errors.degrees}
          </Text>
        )}
      </View>

      <View style={{ gap: 12 }}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Identity documents
        </Text>
        <Pressable
          onPress={() => pickImage(setFrontIdUri)}
          style={[
            styles.imageUploadButton,
            {
              backgroundColor: frontIdUri ? theme.primarySoft : theme.cardSoft,
              borderColor: frontIdUri ? theme.primary : theme.border,
            },
          ]}
        >
          <Text
            style={[
              { fontSize: 28 },
              { color: frontIdUri ? theme.primary : theme.muted },
            ]}
          >
            📸
          </Text>
          <Text
            style={[
              {
                color: frontIdUri ? theme.primary : theme.muted,
                fontWeight: "600",
              },
            ]}
          >
            {frontIdUri ? "Front uploaded" : "Upload front ID"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => pickImage(setBackIdUri)}
          style={[
            styles.imageUploadButton,
            {
              backgroundColor: backIdUri ? theme.primarySoft : theme.cardSoft,
              borderColor: backIdUri ? theme.primary : theme.border,
            },
          ]}
        >
          <Text
            style={[
              { fontSize: 28 },
              { color: backIdUri ? theme.primary : theme.muted },
            ]}
          >
            📸
          </Text>
          <Text
            style={[
              {
                color: backIdUri ? theme.primary : theme.muted,
                fontWeight: "600",
              },
            ]}
          >
            {backIdUri ? "Back uploaded" : "Upload back ID"}
          </Text>
        </Pressable>

        {errors.idImages && (
          <Text style={[styles.fieldError, { color: theme.danger }]}>
            {errors.idImages}
          </Text>
        )}
      </View>
    </>
  );

  return (
    <AuthScreen
      title={roleCopy[role].title}
      subtitle={roleCopy[role].subtitle}
      footer={
        <View style={{ gap: 10 }}>
          <ActionButton
            title="Create account"
            onPress={submit}
            loading={loading}
          />
          <Pressable onPress={() => router.replace("/login")}>
            <Text
              style={{
                color: "#1F7AE0",
                fontWeight: "600",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              Already have an account?
            </Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.roleRow}>
        <ChoiceChip
          label="Patient"
          selected={role === "patient"}
          onPress={() => setRole("patient")}
        />
        <ChoiceChip
          label="Doctor"
          selected={role === "doctor"}
          onPress={() => setRole("doctor")}
        />
      </View>

      <AuthField
        label="Full name"
        value={fullName}
        onChangeText={(text) => {
          setFullName(text);
          fieldErrorSetter("fullName")();
        }}
        placeholder="Your full name"
        error={errors.fullName}
      />

      <AuthField
        label="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          fieldErrorSetter("email")();
        }}
        placeholder="Email address"
        keyboardType="email-address"
        autoComplete="email"
        error={errors.email}
      />

      <AuthField
        label="Phone"
        value={phone}
        onChangeText={(text) => {
          setPhone(text);
          fieldErrorSetter("phone")();
        }}
        placeholder="Phone number"
        keyboardType="phone-pad"
        autoComplete="tel"
        error={errors.phone}
      />

      <AuthField
        label="Date of birth"
        value={dob}
        onChangeText={(text) => {
          setDob(text);
          fieldErrorSetter("dob")();
        }}
        placeholder="YYYY-MM-DD"
        error={errors.dob}
      />

      <View style={{ gap: 8 }}>
        <Text style={[styles.fieldLabel, { color: theme.text }]}>
          Blood group
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ gap: 8 }}
        >
          {bloodGroups.map((group) => (
            <Pressable
              key={group}
              onPress={() => {
                setBloodGroup(group);
                fieldErrorSetter("bloodGroup")();
              }}
              style={[
                styles.bloodPill,
                {
                  backgroundColor:
                    bloodGroup === group ? theme.primarySoft : theme.cardSoft,
                  borderColor:
                    bloodGroup === group ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={{
                  color: bloodGroup === group ? theme.primaryDark : theme.text,
                  fontWeight: "800",
                }}
              >
                {group}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        {errors.bloodGroup && (
          <Text style={[styles.fieldError, { color: theme.danger }]}>
            {errors.bloodGroup}
          </Text>
        )}
      </View>

      <AuthField
        label="NID/ID number"
        value={nid}
        onChangeText={(text) => {
          setNid(text);
          fieldErrorSetter("nid")();
        }}
        placeholder="National ID or passport"
        error={errors.nid}
      />

      <AuthField
        label="Address"
        value={address}
        onChangeText={(text) => {
          setAddress(text);
          fieldErrorSetter("address")();
        }}
        placeholder="Full address"
        multiline
        numberOfLines={2}
        error={errors.address}
      />

      {role === "patient" ? renderPatientSection() : renderDoctorSection()}

      <AuthField
        label="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          fieldErrorSetter("password")();
        }}
        placeholder="Create a password"
        secureTextEntry
        autoComplete="new-password"
        error={errors.password}
      />

      <AuthField
        label="Confirm password"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          fieldErrorSetter("confirmPassword")();
        }}
        placeholder="Confirm your password"
        secureTextEntry
        autoComplete="new-password"
        error={errors.confirmPassword}
      />

      <FeedbackModal
        visible={successVisible}
        title="Account created"
        message="You can now sign in."
        primaryLabel="Go to dashboard"
        onPrimary={completePatientSignup}
      />

      <FeedbackModal
        visible={pendingVisible}
        tone="warning"
        title="Pending approval"
        message="Your account is awaiting admin approval."
        primaryLabel="Back to login"
        onPrimary={finishDoctorSignup}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  roleRow: {
    flexDirection: "row",
    gap: 12,
  },
  bloodPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  fieldError: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
  },
  conditionInputBlock: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  conditionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  degreeInputBlock: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  degreeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  imageUploadButton: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
