import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  ActionButton,
  AuthField,
  AuthScreen,
  FeedbackModal,
} from "@/components/auth-screen";

type Errors = {
  identifier?: string;
  password?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+]?\d[\d\s()-]{7,}$/;

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [loginSuccessVisible, setLoginSuccessVisible] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);

  const validate = () => {
    const nextErrors: Errors = {};
    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier) {
      nextErrors.identifier = "Enter your email address or phone number.";
    } else if (
      !emailPattern.test(cleanIdentifier) &&
      !phonePattern.test(cleanIdentifier)
    ) {
      nextErrors.identifier = "Use a valid email address or phone number.";
    }

    if (!cleanPassword) {
      nextErrors.password = "Password is required.";
    } else if (cleanPassword.length < 6) {
      nextErrors.password = "Password must contain at least 6 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLoginSuccessVisible(true);
    }, 1100);
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
        label="Email or phone"
        value={identifier}
        onChangeText={(text) => {
          setIdentifier(text);
          if (errors.identifier) {
            setErrors((current) => ({ ...current, identifier: undefined }));
          }
        }}
        placeholder="Email or phone"
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
    </AuthScreen>
  );
}
