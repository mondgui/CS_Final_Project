import React from "react";
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
} from "react-native";

type InputProps = TextInputProps & {
  style?: StyleProp<TextStyle>;
};

const DEFAULT_PLACEHOLDER_COLOR = "#6B7280"; // gray-500

export function Input({ style, placeholderTextColor, ...props }: InputProps) {
  return (
    <TextInput
      placeholderTextColor={placeholderTextColor ?? DEFAULT_PLACEHOLDER_COLOR}
      style={[styles.input, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    color: "#111827",
  },
});

