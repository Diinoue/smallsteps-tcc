import ButtonConfirma from "@/src/components/ui/ButtonConfirma";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { z } from "zod";

const SignInSchema = z.object({
  email: z.email("Email invalido."),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres.")
})

type SignInSchema = z.infer<typeof SignInSchema>

export default function Login () {  
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchema>({
      resolver: zodResolver(SignInSchema),
      defaultValues: { email: "", password: "",
      },
  });

  const handleLogIn = (data: SignInSchema) => {
    console.log(data); // depois colocar a logica pra validar o login
  }

return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Login</Text>
      </View>
     
      <View style={styles.divider} />

      <View style={styles.fields}>
        <Text style={styles.label}>E-mail:</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.field}
              placeholder="endereco@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.warning}>{errors.email.message}</Text>
        )}

        <Text style={styles.label}>Senha:</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.field}
              placeholder="Digite a sua senha"
              secureTextEntry
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
        {errors.password && (
          <Text style={styles.warning}>{errors.password.message}</Text>
        )}
      </View>

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Ainda não possui uma conta?</Text>        
        <Link href="/cadastro" push style={styles.signUpTextUnd}>Cadastre-se!</Link>
      </View>

      <ButtonConfirma onPress={handleSubmit(handleLogIn)}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  // header
  headerContainer: {
    alignItems: "center",
    marginBottom: 16,    
  },
  header: {
    color: "#000",
    fontSize: 30,
    fontWeight: "600",
  },

  // linha divisória
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: -20, // estica até a borda da tela
    marginBottom: 20,
  },

  // campos
  fields: {},
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
  signUpContainer: {
  flexDirection: "row",
  gap: 4,
  marginBottom: 12,
},
signUpText: {
  color: "#c0c0c0",
  fontSize: 13,
},
signUpTextUnd: {
  color: "#494949",
  fontSize: 13,
  textDecorationLine: 'underline'
},
});