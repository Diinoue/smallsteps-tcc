import { StyleSheet, Text, TouchableOpacity } from "react-native";

type ButtonConfirmaProps = {
    onPress: () => void;
    label?: string;
}

export default function ButtonConfirma ({onPress, label = "Confirmar"}: ButtonConfirmaProps) {
    return (

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={onPress}
      >
        <Text style={styles.confirmText}>Confirmar</Text>
      </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
      // botão confirmar
  confirmButton: {
    // marginTop: "auto",
    marginVertical: 40,
    marginBottom: 30,
    // alignSelf: "flex-end",    
    backgroundColor: "#34c759",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
    confirmText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
  },
})