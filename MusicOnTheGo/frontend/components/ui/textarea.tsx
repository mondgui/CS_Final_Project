import React from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
} from "react-native";

type TextareaProps = TextInputProps & {
  style?: StyleProp<TextStyle>;
};

const DEFAULT_PLACEHOLDER_COLOR = "#6B7280"; // gray-500

export function Textarea({ style, placeholderTextColor, ...props }: TextareaProps) {
  return (
    <TextInput
      placeholderTextColor={placeholderTextColor ?? DEFAULT_PLACEHOLDER_COLOR}
      style={[styles.textarea, style]}
      multiline
      textAlignVertical="top"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  textarea: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    minHeight: 80,
    color: "#111827",
  },
});

