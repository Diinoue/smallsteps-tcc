import ButtonConfirma from "@/src/components/ui/ButtonConfirma";
import FormField from "@/src/components/ui/FormField";
import { loginService } from "@/src/services/loginService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { z } from "zod";

const SignInSchema = z.object({
  email: z.email({ error: "Email inválido." }),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres."),
});

type SignInSchema = z.infer<typeof SignInSchema>;

const JWT_KEY = "token";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInSchema>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogIn = async (data: SignInSchema) => {
    try {
      setLoading(true);
      const token = await loginService.logIn(data);
      await loginService.save(JWT_KEY, token);
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Falha no login:", error);
      let msg = "E-mail ou senha incorretos. Verifique suas credenciais.";
      if (!error.response) {
        msg = "Não foi possível conectar ao servidor. Verifique sua conexão e se o backend está em execução.";
      } else if (error.response?.status === 401) {
        msg = "E-mail ou senha incorretos. Verifique suas credenciais.";
      } else if (error.response?.data?.message) {
        msg = error.response.data.message;
      }

      if (Platform.OS === "web") {
        alert(msg);
      } else {
        Alert.alert("Falha no login", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Login</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.fields}>
        <FormField
          control={control}
          name="email"
          label="E-mail"
          error={errors.email?.message}
          placeholder="endereco@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <FormField
          control={control}
          name="password"
          label="Senha:"
          error={errors.password?.message}
          placeholder="A sua senha aqui"
          secureTextEntry
        />
      </View>

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Ainda não possui uma conta?</Text>
        <Link href="/cadastro" style={styles.signUpTextUnd}>
          Cadastre-se!
        </Link>
      </View>

      <ButtonConfirma
        onPress={handleSubmit(handleLogIn)}
        disabled={loading}
        label={loading ? "Entrando..." : "Confirmar"}
      />
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
  signUpContainer: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
  },
  signUpText: {
    color: "#737373",
    fontSize: 13,
  },
  signUpTextUnd: {
    color: "#1f2937",
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
