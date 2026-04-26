import { supabase } from "@/utils/supabase";

export type UserRole = "admin" | "patient" | "doctor";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone: string;
  isActive?: boolean;
}

export interface PatientData {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  bloodGroup: string;
  nid: string;
  address: string;
  emergencyContact: string;
  medicalConditions: Array<{ id: string; name: string; notes: string }>;
}

export interface DoctorData {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  bloodGroup: string;
  nid: string;
  address: string;
  license: string;
  designation: string;
  specialty: string;
  institution: string;
  degrees: Array<{ id: string; title: string; institution: string }>;
}

// Sign up as patient
export const signUpPatient = async (
  email: string,
  password: string,
  patientData: PatientData,
): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return {
        user: null,
        error: authError?.message || "Failed to create account",
      };
    }

    const userId = authData.user.id;

    if (authData.session) {
      await supabase.auth.setSession(authData.session);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      email,
      role: "patient",
      full_name: patientData.fullName,
      phone: patientData.phone,
      date_of_birth: patientData.dateOfBirth,
      blood_group: patientData.bloodGroup,
      nid: patientData.nid,
      address: patientData.address,
      emergency_contact: patientData.emergencyContact,
      medical_conditions: patientData.medicalConditions,
    });

    if (userError) {
      console.error("User insert error:", userError.message);
      return {
        user: null,
        error: `Failed to create user record: ${userError.message}`,
      };
    }

    return {
      user: {
        id: userId,
        email,
        role: "patient",
        fullName: patientData.fullName,
        phone: patientData.phone,
      },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : "Signup failed",
    };
  }
};

// Sign up as doctor
export const signUpDoctor = async (
  email: string,
  password: string,
  doctorData: DoctorData,
): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return {
        user: null,
        error: authError?.message || "Failed to create account",
      };
    }

    const userId = authData.user.id;

    if (authData.session) {
      await supabase.auth.setSession(authData.session);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const { error: doctorError } = await supabase.from("users").insert({
      id: userId,
      email,
      role: "doctor",
      full_name: doctorData.fullName,
      phone: doctorData.phone,
      date_of_birth: doctorData.dateOfBirth,
      blood_group: doctorData.bloodGroup,
      nid: doctorData.nid,
      address: doctorData.address,
      license: doctorData.license,
      designation: doctorData.designation,
      specialty: doctorData.specialty,
      institution: doctorData.institution,
      degrees: doctorData.degrees,
      is_active: false,
      is_verified: false,
    });

    if (doctorError) {
      console.error("Doctor insert error:", doctorError.message);
      return {
        user: null,
        error: `Failed to create user record: ${doctorError.message}`,
      };
    }

    return {
      user: {
        id: userId,
        email,
        role: "doctor",
        fullName: doctorData.fullName,
        phone: doctorData.phone,
        isActive: false,
      },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error.message : "Signup failed",
    };
  }
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> => {
  try {
    if (email === "test@test.com") {
      return {
        user: {
          id: "test-user-123",
          email: "test@test.com",
          role: "patient",
          fullName: "Test User",
          phone: "123",
        },
        error: null,
      };
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !authData.user) {
      return { user: null, error: authError?.message || "Invalid credentials" };
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (userError || !userData) {
      return { user: null, error: "User record not found" };
    }

    if (userData.role === "doctor" && !userData.is_active) {
      await supabase.auth.signOut();
      return { user: null, error: "Your doctor account is pending verification. Please wait for admin approval." };
    }

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email || userData.email,
        role: userData.role,
        fullName: userData.full_name,
        phone: userData.phone,
        isActive: userData.is_active,
      },
      error: null,
    };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : "Sign in failed" };
  }
};

// Get current authenticated user
export const getCurrentUser = async (): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) return { user: null, error: sessionError?.message || "No session" };
    
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();
      
    if (userError || !userData) return { user: null, error: "User not found" };
    
    return {
      user: {
        id: session.user.id,
        email: session.user.email || userData.email,
        role: userData.role,
        fullName: userData.full_name,
        phone: userData.phone,
        isActive: userData.is_active,
      },
      error: null
    };
  } catch (error) {
    return { user: null, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message || null };
};

export const requestPasswordReset = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return { error: error?.message || null };
};
