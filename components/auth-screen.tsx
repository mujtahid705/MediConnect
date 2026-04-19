import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { BounceIn, FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

// Theme hook for auth screens
export const useAuthTheme = () => {
  const colorScheme = useColorScheme();

  return useMemo(
    () => ({
      background: colorScheme === "dark" ? "#0F1419" : "#FFFFFF",
      card: colorScheme === "dark" ? "#1A2332" : "#F8FAFC",
      cardSoft: colorScheme === "dark" ? "#242D3D" : "#EFF4F9",
      border: colorScheme === "dark" ? "#2D3E5F" : "#E0E8F1",
      text: colorScheme === "dark" ? "#FFFFFF" : "#0B2338",
      muted: colorScheme === "dark" ? "#8FA3B8" : "#64748B",
      primary: "#1F7AE0",
      primaryDark: "#1551A8",
      primarySoft: "#E0F0FF",
      danger: "#DC2626",
      success: "#10B981",
      overlay: colorScheme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
    }),
    [colorScheme],
  );
};

type AuthScreenProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export const AuthScreen: React.FC<AuthScreenProps> = ({
  title,
  subtitle,
  eyebrow,
  footer,
  children,
}) => {
  const theme = useAuthTheme();

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
            entering={FadeIn.duration(600)}
          >
            <View style={styles.heroBlock}>
              {eyebrow && (
                <Text style={[styles.eyebrow, { color: theme.primary }]}>
                  {eyebrow}
                </Text>
              )}
              <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
              {subtitle && (
                <Text style={[styles.subtitle, { color: theme.muted }]}>
                  {subtitle}
                </Text>
              )}
            </View>

            <View style={styles.content}>{children}</View>

            {footer && <View style={styles.footer}>{footer}</View>}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

type AuthFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoComplete?: any;
  secureTextEntry?: boolean;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
};

export const AuthField: React.FC<AuthFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoComplete,
  secureTextEntry,
  error,
  multiline,
  numberOfLines,
}) => {
  const theme = useAuthTheme();

  return (
    <View style={styles.fieldBlock}>
      <Text style={[styles.fieldLabel, { color: theme.text }]}>{label}</Text>
      <View
        style={[
          styles.fieldShell,
          {
            backgroundColor: theme.cardSoft,
            borderColor: error ? theme.danger : theme.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.fieldInput,
            {
              color: theme.text,
              backgroundColor: "transparent",
            },
          ]}
          placeholderTextColor={theme.muted}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </View>
      {error && (
        <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
      )}
    </View>
  );
};

type ActionButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  secondary?: boolean;
  icon?: any;
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  loading,
  secondary,
  icon,
}) => {
  const theme = useAuthTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: secondary ? theme.cardSoft : theme.primary,
          borderColor: secondary ? theme.border : theme.primary,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.buttonRow}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={secondary ? theme.text : "#FFFFFF"}
          />
        )}
        {icon && !loading && (
          <Ionicons
            name={icon as any}
            size={18}
            color={secondary ? theme.text : "#FFFFFF"}
          />
        )}
        <Text
          style={[
            styles.buttonText,
            {
              color: secondary ? theme.text : "#FFFFFF",
            },
          ]}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
};

type ChoiceChipProps = {
  label: string;
  hint?: string;
  selected: boolean;
  onPress: () => void;
};

export const ChoiceChip: React.FC<ChoiceChipProps> = ({
  label,
  hint,
  selected,
  onPress,
}) => {
  const theme = useAuthTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.choiceChip,
        {
          backgroundColor: selected ? theme.primarySoft : theme.cardSoft,
          borderColor: selected ? theme.primary : theme.border,
        },
      ]}
    >
      <Text
        style={[
          styles.choiceLabel,
          { color: selected ? theme.primaryDark : theme.text },
        ]}
      >
        {label}
      </Text>
      {hint && (
        <Text style={[styles.choiceHint, { color: theme.muted }]}>{hint}</Text>
      )}
    </Pressable>
  );
};

type InlineNoticeProps = {
  icon?: any;
  title: string;
  message?: string;
};

export const InlineNotice: React.FC<InlineNoticeProps> = ({
  icon,
  title,
  message,
}) => {
  const theme = useAuthTheme();

  return (
    <View
      style={[
        styles.notice,
        {
          backgroundColor: theme.primarySoft,
          borderColor: theme.primary,
        },
      ]}
    >
      {icon && <Ionicons name={icon as any} size={20} color={theme.primary} />}
      <View style={styles.noticeCopy}>
        <Text style={[styles.noticeTitle, { color: theme.primaryDark }]}>
          {title}
        </Text>
        {message && (
          <Text style={[styles.noticeMessage, { color: theme.text }]}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );
};

type FeedbackModalProps = {
  visible: boolean;
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  tone?: "success" | "warning" | "info";
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  title,
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  tone = "success",
}) => {
  const theme = useAuthTheme();

  const toneColor =
    tone === "success"
      ? theme.success
      : tone === "warning"
        ? "#F59E0B"
        : theme.primary;
  const toneLight =
    tone === "success" ? "#ECFDF5" : tone === "warning" ? "#FFFBEB" : "#EFF6FF";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
        <Animated.View
          style={styles.modalCard}
          entering={BounceIn.duration(500)}
        >
          <View
            style={[
              styles.modalIcon,
              {
                backgroundColor: toneLight,
              },
            ]}
          >
            <Ionicons
              name={
                tone === "success"
                  ? "checkmark-circle"
                  : tone === "warning"
                    ? "alert-circle"
                    : "information-circle"
              }
              size={40}
              color={toneColor}
            />
          </View>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {title}
          </Text>
          <Text style={[styles.modalMessage, { color: theme.muted }]}>
            {message}
          </Text>
          <View style={styles.modalActions}>
            <ActionButton title={primaryLabel} onPress={onPrimary} />
            {secondaryLabel && onSecondary && (
              <ActionButton
                title={secondaryLabel}
                onPress={onSecondary}
                secondary
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingTop: 32,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    overflow: "hidden",
    shadowColor: "#0B2338",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  heroBlock: {
    marginBottom: 16,
    gap: 6,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    gap: 14,
  },
  footer: {
    marginTop: 16,
  },
  fieldBlock: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  fieldShell: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 14,
    minHeight: 48,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
  },
  button: {
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "800",
  },
  choiceChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  choiceLabel: {
    fontSize: 14,
    fontWeight: "800",
  },
  choiceHint: {
    fontSize: 11,
    lineHeight: 14,
  },
  notice: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  noticeCopy: {
    flex: 1,
    gap: 3,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  noticeMessage: {
    fontSize: 12,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 20,
    padding: 20,
    backgroundColor: "white",
    // Note: This will be set dynamically in component
  },
  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  modalMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalActions: {
    gap: 10,
  },
});
