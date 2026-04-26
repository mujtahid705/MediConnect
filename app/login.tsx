import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  ActionButton,
  AuthField,
  AuthScreen,
  FeedbackModal,
} from "@/components/auth-screen";
import { useAuth } from "@/context/AuthContext";

type Errors = {
  identifier?: string;
  password?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, error: authError, clearError } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [loginSuccessVisible, setLoginSuccessVisible] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [showError, setShowError] = useState(false);

  const validate = () => {
    const nextErrors: Errors = {};
    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier) {
      nextErrors.identifier = "Enter your email address.";
    } else if (!emailPattern.test(cleanIdentifier)) {
      nextErrors.identifier = "Please enter a valid email address.";
    }

    if (!cleanPassword) {
      nextErrors.password = "Password is required.";
    } else if (cleanPassword.length < 6) {
      nextErrors.password = "Password must contain at least 6 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      clearError();
      await signIn(identifier.trim(), password);
      setLoginSuccessVisible(true);
    } catch (err) {
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const continueToDashboard = () => {
    setLoginSuccessVisible(false);
    router.replace("/(tabs)");
  };

  return (
    <AuthScreen
      title="Sign in"
      subtitle="Enter your email and password."
      footer={
        <View style={{ gap: 10 }}>
          <ActionButton title="Sign in" onPress={submit} loading={loading} />
          <View
            style={{ flexDirection: "row", justifyContent: "center", gap: 20 }}
          >
            <Pressable onPress={() => router.push("/signup")}>
              <Text
                style={{ color: "#1F7AE0", fontWeight: "600", fontSize: 13 }}
              >
                New account
              </Text>
            </Pressable>
            <Pressable onPress={() => setForgotPasswordVisible(true)}>
              <Text
                style={{ color: "#1F7AE0", fontWeight: "600", fontSize: 13 }}
              >
                Forgot?
              </Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <AuthField
        label="Email"
        value={identifier}
        onChangeText={(text) => {
          setIdentifier(text);
          if (errors.identifier) {
            setErrors((current) => ({ ...current, identifier: undefined }));
          }
        }}
        placeholder="your.email@example.com"
        keyboardType="email-address"
        autoComplete="email"
        error={errors.identifier}
      />

      <AuthField
        label="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) {
            setErrors((current) => ({ ...current, password: undefined }));
          }
        }}
        placeholder="Enter your password"
        secureTextEntry
        autoComplete="password"
        error={errors.password}
      />

      <FeedbackModal
        visible={loginSuccessVisible}
        title="Welcome"
        message="Continue to your dashboard."
        primaryLabel="Continue"
        onPrimary={continueToDashboard}
      />

      <FeedbackModal
        visible={forgotPasswordVisible}
        tone="info"
        title="Password reset"
        message="Password recovery will be available soon."
        primaryLabel="OK"
        onPrimary={() => setForgotPasswordVisible(false)}
      />

      <FeedbackModal
        visible={showError}
        tone="warning"
        title="Login failed"
        message={
          authError || "An error occurred during login. Please try again."
        }
        primaryLabel="OK"
        onPrimary={() => {
          setShowError(false);
          clearError();
        }}
      />
    </AuthScreen>
  );
}
