import { StyleSheet, Text, TouchableOpacity } from "react-native";

type ButtonConfirmaProps = {
    onPress: () => void;
    label?: string;
    disabled?: boolean;
}

export default function ButtonConfirma ({onPress, label = "Confirmar", disabled = false}: ButtonConfirmaProps) {
    return (
      <TouchableOpacity
        style={[styles.confirmButton, disabled && styles.disabledButton]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={styles.confirmText}>{label}</Text>
      </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  // botão confirmar
  confirmButton: {
    marginVertical: 20,
    marginBottom: 30,
    backgroundColor: "#34c759",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  disabledButton: {
    opacity: 0.6,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
  },
});
