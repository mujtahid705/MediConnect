import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  ActionButton,
  AuthField,
  AuthScreen,
  ChoiceChip,
  FeedbackModal,
  InlineNotice,
  useAuthTheme,
} from "@/components/auth-screen";
import { useAuth } from "@/context/AuthContext";
import type { DoctorData, PatientData } from "@/lib/auth-service";

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
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+]?\d[\d\s()-]{7,}$/;

export default function SignupScreen() {
  const router = useRouter();
  const theme = useAuthTheme();
  const {
    signUpAsPatient,
    signUpAsDoctor,
    error: authError,
    clearError,
  } = useAuth();
  const [role, setRole] = useState<Role>("patient");

  // Common fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [dobPickerVisible, setDobPickerVisible] = useState(false);
  const [pickerDay, setPickerDay] = useState(1);
  const [pickerMonth, setPickerMonth] = useState(1);
  const [pickerYear, setPickerYear] = useState(2000);

  // Date picker data
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const daysInMonth = new Date(pickerYear, pickerMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const years = Array.from({ length: 100 }, (_, i) => 2024 - i);

  const confirmDob = () => {
    const d = String(pickerDay).padStart(2, "0");
    const m = String(pickerMonth).padStart(2, "0");
    setDob(`${pickerYear}-${m}-${d}`);
    setErrors((e) => ({ ...e, dob: undefined }));
    setDobPickerVisible(false);
  };
  const [bloodGroup, setBloodGroup] = useState("");
  const [nid, setNid] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

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

    // Auto-flush a pending condition the user typed but didn't explicitly add
    const pendingConditionName = conditionInput.trim();
    let effectiveConditions = conditions;
    if (pendingConditionName) {
      const flushed = {
        id: Date.now().toString(),
        name: pendingConditionName,
        notes: conditionNotes.trim(),
      };
      effectiveConditions = [...conditions, flushed];
      setConditions(effectiveConditions);
      setConditionInput("");
      setConditionNotes("");
    }

    const nextErrors: Errors = {};
    if (!emergencyContact.trim())
      nextErrors.emergencyContact = "Emergency contact is required.";
    if (effectiveConditions.length === 0)
      nextErrors.conditions = "Add at least one medical condition.";

    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validateDoctor = (): boolean => {
    if (!validateCommon()) return false;

    // Auto-flush a pending degree the user typed but didn't explicitly add
    const pendingDegreeTitle = degreeInput.trim();
    const pendingDegreeInst = degreeInstitution.trim();
    let effectiveDegrees = degrees;
    if (pendingDegreeTitle && pendingDegreeInst) {
      const flushed = {
        id: Date.now().toString(),
        title: pendingDegreeTitle,
        institution: pendingDegreeInst,
      };
      effectiveDegrees = [...degrees, flushed];
      setDegrees(effectiveDegrees);
      setDegreeInput("");
      setDegreeInstitution("");
    }

    const nextErrors: Errors = {};
    if (!designation.trim())
      nextErrors.designation = "Designation is required.";
    if (!specialty.trim()) nextErrors.specialty = "Specialty is required.";
    if (!institution.trim())
      nextErrors.institution = "Institution is required.";
    if (!license.trim()) nextErrors.license = "License number is required.";
    if (effectiveDegrees.length === 0)
      nextErrors.degrees = "Add at least one degree.";

    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
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

  const submit = async () => {
    if (role === "patient") {
      if (!validatePatient()) return;

      setLoading(true);
      clearError();

      const patientData: PatientData = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        dateOfBirth: dob.trim(),
        bloodGroup,
        nid: nid.trim(),
        address: address.trim(),
        emergencyContact: emergencyContact.trim(),
        medicalConditions: conditions,
      };

      try {
        await signUpAsPatient(email.trim(), password, patientData);
        setSuccessVisible(true);
      } catch {
        setShowError(true);
      } finally {
        setLoading(false);
      }
    } else {
      if (!validateDoctor()) return;

      setLoading(true);
      clearError();

      const doctorData: DoctorData = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        dateOfBirth: dob.trim(),
        bloodGroup,
        nid: nid.trim(),
        address: address.trim(),
        license: license.trim(),
        designation: designation.trim(),
        specialty: specialty.trim(),
        institution: institution.trim(),
        degrees,
      };

      try {
        await signUpAsDoctor(email.trim(), password, doctorData);
        setPendingVisible(true);
      } catch {
        setShowError(true);
      } finally {
        setLoading(false);
      }
    }
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
        </View>

        {/* Added entries */}
        {conditions.map((condition) => (
          <View
            key={condition.id}
            style={[styles.conditionRow, { borderColor: theme.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", color: theme.text }}>
                {condition.name}
              </Text>
              {condition.notes ? (
                <Text style={{ fontSize: 12, color: theme.muted }}>
                  {condition.notes}
                </Text>
              ) : null}
            </View>
            <Pressable onPress={() => removeCondition(condition.id)}>
              <Text style={{ color: theme.danger, fontSize: 18 }}>−</Text>
            </Pressable>
          </View>
        ))}

        {/* Always-visible input block */}
        <View
          style={[
            styles.conditionInputBlock,
            { backgroundColor: theme.cardSoft, borderColor: theme.border },
          ]}
        >
          <AuthField
            label="Condition name"
            value={conditionInput}
            onChangeText={(t) => {
              setConditionInput(t);
              fieldErrorSetter("conditions")();
            }}
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
          <TouchableOpacity
            onPress={addCondition}
            style={[
              styles.inlineAddBtn,
              {
                backgroundColor: theme.primarySoft,
                borderColor: theme.primary,
              },
            ]}
          >
            <Text
              style={{ color: theme.primary, fontWeight: "700", fontSize: 13 }}
            >
              + Add condition
            </Text>
          </TouchableOpacity>
        </View>

        {conditions.length > 0 && (
          <InlineNotice
            icon="checkmark-circle"
            title={`${conditions.length} condition(s) added`}
          />
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
        </View>

        {/* Added entries */}
        {degrees.map((degree) => (
          <View
            key={degree.id}
            style={[styles.degreeRow, { borderColor: theme.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", color: theme.text }}>
                {degree.title}
              </Text>
              <Text style={{ fontSize: 12, color: theme.muted }}>
                {degree.institution}
              </Text>
            </View>
            <Pressable onPress={() => removeDegree(degree.id)}>
              <Text style={{ color: theme.danger, fontSize: 18 }}>−</Text>
            </Pressable>
          </View>
        ))}

        {/* Always-visible input block */}
        <View
          style={[
            styles.degreeInputBlock,
            { backgroundColor: theme.cardSoft, borderColor: theme.border },
          ]}
        >
          <AuthField
            label="Degree title"
            value={degreeInput}
            onChangeText={(t) => {
              setDegreeInput(t);
              fieldErrorSetter("degrees")();
            }}
            placeholder="e.g., MBBS, MD"
          />
          <AuthField
            label="Institution"
            value={degreeInstitution}
            onChangeText={setDegreeInstitution}
            placeholder="University or institution"
          />
          <TouchableOpacity
            onPress={addDegree}
            style={[
              styles.inlineAddBtn,
              {
                backgroundColor: theme.primarySoft,
                borderColor: theme.primary,
              },
            ]}
          >
            <Text
              style={{ color: theme.primary, fontWeight: "700", fontSize: 13 }}
            >
              + Add degree
            </Text>
          </TouchableOpacity>
        </View>

        {degrees.length > 0 && (
          <InlineNotice
            icon="checkmark-circle"
            title={`${degrees.length} degree(s) added`}
          />
        )}

        {errors.degrees && (
          <Text style={[styles.fieldError, { color: theme.danger }]}>
            {errors.degrees}
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

      <Pressable
        onPress={() => setDobPickerVisible(true)}
        style={[
          styles.dobPressable,
          {
            backgroundColor: theme.cardSoft,
            borderColor: errors.dob ? theme.danger : theme.border,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.dobLabel, { color: theme.muted }]}>
            Date of birth
          </Text>
          <Text
            style={[styles.dobValue, { color: dob ? theme.text : theme.muted }]}
          >
            {dob || "Select date"}
          </Text>
        </View>
        <Text style={{ fontSize: 18 }}>📅</Text>
      </Pressable>
      {errors.dob && (
        <Text style={[styles.fieldError, { color: theme.danger }]}>
          {errors.dob}
        </Text>
      )}

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

      <FeedbackModal
        visible={showError}
        tone="warning"
        title="Signup failed"
        message={
          authError || "An error occurred during signup. Please try again."
        }
        primaryLabel="OK"
        onPrimary={() => {
          setShowError(false);
          clearError();
        }}
      />

      {/* DOB Date Picker Modal */}
      <Modal
        visible={dobPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDobPickerVisible(false)}
      >
        <View style={styles.dobPickerOverlay}>
          <View
            style={[
              styles.dobPickerSheet,
              { backgroundColor: theme.background },
            ]}
          >
            <View
              style={[
                styles.dobPickerHandle,
                { backgroundColor: theme.border },
              ]}
            />
            <View
              style={[
                styles.dobPickerHeader,
                { borderBottomColor: theme.border },
              ]}
            >
              <Text
                style={{ fontWeight: "700", fontSize: 16, color: theme.text }}
              >
                Select Date of Birth
              </Text>
              <Pressable onPress={() => setDobPickerVisible(false)}>
                <Text style={{ color: theme.muted, fontSize: 14 }}>Cancel</Text>
              </Pressable>
            </View>

            <View style={styles.dobPickerColumns}>
              {/* Day */}
              <View style={styles.dobPickerColumn}>
                <Text
                  style={[styles.dobPickerColumnLabel, { color: theme.muted }]}
                >
                  Day
                </Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {days.map((dv) => (
                    <Pressable
                      key={dv}
                      onPress={() => setPickerDay(dv)}
                      style={[
                        styles.dobPickerItem,
                        {
                          backgroundColor:
                            pickerDay === dv
                              ? theme.primarySoft
                              : "transparent",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dobPickerItemText,
                          {
                            color:
                              pickerDay === dv ? theme.primary : theme.text,
                            fontWeight: pickerDay === dv ? "800" : "400",
                          },
                        ]}
                      >
                        {String(dv).padStart(2, "0")}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Month */}
              <View style={styles.dobPickerColumn}>
                <Text
                  style={[styles.dobPickerColumnLabel, { color: theme.muted }]}
                >
                  Month
                </Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {MONTHS.map((mv, idx) => (
                    <Pressable
                      key={mv}
                      onPress={() => setPickerMonth(idx + 1)}
                      style={[
                        styles.dobPickerItem,
                        {
                          backgroundColor:
                            pickerMonth === idx + 1
                              ? theme.primarySoft
                              : "transparent",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dobPickerItemText,
                          {
                            color:
                              pickerMonth === idx + 1
                                ? theme.primary
                                : theme.text,
                            fontWeight: pickerMonth === idx + 1 ? "800" : "400",
                          },
                        ]}
                      >
                        {mv}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Year */}
              <View style={styles.dobPickerColumn}>
                <Text
                  style={[styles.dobPickerColumnLabel, { color: theme.muted }]}
                >
                  Year
                </Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {years.map((yv) => (
                    <Pressable
                      key={yv}
                      onPress={() => setPickerYear(yv)}
                      style={[
                        styles.dobPickerItem,
                        {
                          backgroundColor:
                            pickerYear === yv
                              ? theme.primarySoft
                              : "transparent",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dobPickerItemText,
                          {
                            color:
                              pickerYear === yv ? theme.primary : theme.text,
                            fontWeight: pickerYear === yv ? "800" : "400",
                          },
                        ]}
                      >
                        {yv}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity
              onPress={confirmDob}
              style={[styles.dobConfirmBtn, { backgroundColor: theme.primary }]}
            >
              <Text
                style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}
              >
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  roleRow: {
    flexDirection: "row",
    gap: 12,
  },
  // DOB picker pressable
  dobPressable: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  dobLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  dobValue: {
    fontSize: 14,
    fontWeight: "500",
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
  inlineAddBtn: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
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
  // Date picker modal
  dobPickerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  dobPickerSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  dobPickerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  dobPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dobPickerColumns: {
    flexDirection: "row",
    height: 200,
    marginHorizontal: 16,
    marginTop: 8,
  },
  dobPickerColumn: {
    flex: 1,
    alignItems: "center",
  },
  dobPickerColumnLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  dobPickerItem: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    borderRadius: 8,
  },
  dobPickerItemText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dobConfirmBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
});
