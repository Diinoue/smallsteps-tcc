/*
Diogo
FormField
Data: 27/09/2026
Campo de entrada de dados em um formulário

    - Props:
    1) control: O formulário na qual esse campo participa. Geralmente passar control dá boa.
    2) name:  O nome do campo dentro do control na qual esse FormField ocupa. Tem que bater certinho com o nome declarado no schema.
    3) label: Uma string pra indicar o texto que ficará dentro do label. Pode colocar qualquer coisa, ao longo que faça sentido.
    4) Error: Mensagem de erro do zod que será exibida abaixo do campo. As validações já são recebidas pelo schema declarado na tela que usa esse componente.
    5) ...textInputProps: Se tiver mais algum prop que o TextInput usar, pode botar na declaração do FormField de boa.
*/

import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

type FormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: string;
} & TextInputProps;

export default function FormField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  ...textInputProps
}: FormFieldProps<T>) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.field}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            {...textInputProps}
          />
        )}
      />

      {error && <Text style={styles.warning}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  field: {
    borderWidth: 1,
    borderRadius: 6,
    borderColor: "#c5c5c5",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  warning: {
    fontSize: 13,
    color: "#e63946",
    marginTop: -12,
    marginBottom: 12,
  },
});
