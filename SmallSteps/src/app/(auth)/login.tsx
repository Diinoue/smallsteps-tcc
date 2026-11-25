import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import ButtonConfirma from "@/src/components/ui/ButtonConfirma";
import FormField from "@/src/components/ui/FormField";
import { useProfile } from "@/src/context/ProfileContext";
import { loginService } from "@/src/services/loginService";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const SignInSchema = z.object({
  email: z.email({ error: "E-mail inválido." }),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
});

type SignInSchema = z.infer<typeof SignInSchema>;

export default function Login() {
  const router = useRouter();
  const { carregarPerfil } = useProfile();
  const [loading, setLoading] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const borderColor = useThemeColor({}, "border");
  const activeColor = useThemeColor({}, "streakActive");

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
      await loginService.logIn(data);
      await carregarPerfil();
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
        Alert.alert("Falha ao entrar", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={[styles.safeArea, { backgroundColor }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={backgroundColor}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Text style={[styles.header, { color: textColor }]}>Entrar</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

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
              label="Senha"
              error={errors.password?.message}
              placeholder="Digite sua senha aqui"
              secureTextEntry
            />
          </View>

          <View style={styles.signUpContainer}>
            <Text style={[styles.signUpText, { color: textSecondary }]}>
              Ainda não possui uma conta?
            </Text>
            <Link
              href="/cadastro"
              style={[styles.signUpTextUnd, { color: activeColor }]}
            >
              Cadastre-se!
            </Link>
          </View>

          <ButtonConfirma
            onPress={handleSubmit(handleLogIn)}
            disabled={loading}
            label={loading ? "Entrando..." : "Confirmar"}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingTop: 32,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // header
  headerContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  header: {
    fontSize: 30,
    fontWeight: "700",
  },

  // linha divisória
  divider: {
    height: 1,
    marginHorizontal: -20, // estica até a borda da tela
    marginBottom: 24,
  },

  // campos
  fields: {},
  signUpContainer: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
  },
  signUpText: {
    fontSize: 13,
  },
  signUpTextUnd: {
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
