/*
cadastro.tsx - Diogo - 29/09/2026
Tela de cadastro de usuários
*/

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import ButtonConfirma from "@/src/components/ui/ButtonConfirma";
import FormField from "@/src/components/ui/FormField";
import { cadastrarUser } from "@/src/services/userService";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
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

// Schema da validação de senha
const passwordSenha = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres.")
  .max(20, "A senha deve ter no máximo 20 caracteres.");

// Schema de cadastro
export const SignUpSchema = z
  .object({
    nome: z.string().min(1, "Este campo é obrigatório."),
    email: z.email({ error: "E-mail inválido." }),
    password: passwordSenha,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "As senhas devem ser idênticas.",
    path: ["passwordConfirm"],
  });

type SignUpSchema = z.infer<typeof SignUpSchema>;

export default function Cadastro() {
  const router = useRouter();
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
  } = useForm<SignUpSchema>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      nome: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const handleSignUp = async (data: SignUpSchema) => {
    try {
      setLoading(true);
      await cadastrarUser({
        name: data.nome,
        email: data.email,
        password: data.password,
      });

      if (Platform.OS === "web") {
        alert("Conta criada com sucesso! Entre para continuar.");
        router.replace("/(auth)/login");
      } else {
        Alert.alert(
          "Sucesso",
          "Conta criada com sucesso! Entre para continuar.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(auth)/login"),
            },
          ],
          { cancelable: false }
        );
      }
    } catch (erro) {
      let mensagem = "Erro ao realizar o cadastro. Tente novamente mais tarde.";
      if (axios.isAxiosError(erro)) {
        console.log("Status de erro:", erro.response?.status);
        console.log("Detalhes do erro:", erro.response?.data);

        if (typeof erro.response?.data === "string") {
          mensagem = erro.response.data;
        } else if (erro.response?.data?.message) {
          mensagem = erro.response.data.message;
        } else if (erro.response?.data?.error) {
          mensagem = erro.response.data.error;
        }
      }

      if (Platform.OS === "web") {
        alert(mensagem);
      } else {
        Alert.alert("Erro no cadastro", mensagem);
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
            <Text style={[styles.header, { color: textColor }]}>Cadastre-se</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          {/* Campo nome */}
          <FormField
            control={control}
            name="nome"
            label="Nome"
            error={errors.nome?.message}
            placeholder="Digite seu nome aqui"
          />

          {/* Campo email */}
          <FormField
            control={control}
            name="email"
            label="E-mail"
            error={errors.email?.message}
            placeholder="endereco@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* Campo Senha */}
          <FormField
            control={control}
            name="password"
            label="Senha"
            error={errors.password?.message}
            placeholder="Digite sua senha aqui"
            secureTextEntry
          />

          {/* Campo Confirme a Senha */}
          <FormField
            control={control}
            name="passwordConfirm"
            label="Confirme a senha"
            error={errors.passwordConfirm?.message}
            placeholder="Digite sua senha novamente"
            secureTextEntry
          />

          <View style={styles.loginLinkContainer}>
            <Text style={[styles.loginText, { color: textSecondary }]}>
              Já possui uma conta?
            </Text>
            <Link
              href="/login"
              replace
              style={[styles.loginTextUnd, { color: activeColor }]}
            >
              Entrar!
            </Link>
          </View>

          {/* Botão pra realizar o cadastro */}
          <ButtonConfirma
            onPress={handleSubmit(handleSignUp)}
            disabled={loading}
            label={loading ? "Cadastrando..." : "Confirmar"}
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

  // linha divisória entre o header e os campos
  divider: {
    height: 1,
    marginHorizontal: -20, // estica até a borda da tela
    marginBottom: 24,
  },

  loginLinkContainer: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
  },
  loginText: {
    fontSize: 13,
  },
  loginTextUnd: {
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
