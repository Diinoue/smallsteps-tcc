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

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
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
  const isDark = useColorScheme() === "dark";
  const textColor = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");
  const borderColor = useThemeColor({}, "border");
  const errorColor = useThemeColor({}, "error");
  const inputBg = isDark ? "#1F2937" : "#FFFFFF";

  return (
    <View>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>

      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.field,
              {
                backgroundColor: inputBg,
                borderColor: error ? errorColor : borderColor,
                color: textColor,
              },
            ]}
            placeholderTextColor={textMuted}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            {...textInputProps}
          />
        )}
      />

      {error && <Text style={[styles.warning, { color: errorColor }]}>{error}</Text>}
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
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 16,
  },
  warning: {
    fontSize: 13,
    marginTop: -12,
    marginBottom: 12,
  },
});
