/*
cadastro.tsx - Diogo - 29/09/2026
Tela de cadastro de usuários
*/

import ButtonConfirma from "@/src/components/ui/ButtonConfirma"
import FormField from "@/src/components/ui/FormField"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { StyleSheet, Text, View } from "react-native"
import { z } from "zod"

// Schema da validação de senha
const passwordSenha = z
        .string()
        .min(8, "Senha deve ter no mínimo 8 caracteres.")
        .max(20, "Senha deve ter no máximo 20 caracteres.")
        // COMENTADO POR SER CHATO DMS
        // .refine((password) => /[A-Z]/.test(password), {message: "Senha deve ter pelo menos uma letra maiúscula, um número e um símbolo. (@, %, #, &, !)"})
        // .refine((password) => /[0-9]/.test(password), { message: "Senha deve ter pelo menos uma letra maiúscula, um número e um símbolo. (@, %, #, &, !)." })
        // .refine((password) => /[!@#$%^&*]/.test(password), {message: "Senha deve ter pelo menos uma letra maiúscula, um número e um símbolo. (@, %, #, &, !)"});

// Schema de cadastro
const SignUpSchema = z.object({
    nome: z.string()
            .min(1, "Este campo é obrigatório."),
    email: z.email({error: "Email inválido."}),
    password: passwordSenha,
    passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
        message: "As senhas devem ser idênticas.",
        path: ['passwordConfirm'],
    })
    

type SignUpSchema = z.infer<typeof SignUpSchema>

export default function Cadastro () {
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
            passwordConfirm: ""
        }
    });
    const handleSignUp = (data: SignUpSchema) => {
        console.log(data); // TODO: depois colocar a logica pra realizar o cadastro
    }

    return (
        <View style={styles.container}>
             <View style={styles.headerContainer}>
                <Text style={styles.header}>Cadastre-se</Text>
            </View>
                 
            <View style={styles.divider} />
                        
                {/* Campo nome */}
                <FormField
                    control={control}
                    name="nome"
                    label="Nome"
                    error={errors.nome?.message}
                    placeholder="Digite o nome aqui"
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
                    label="E-Senha:"
                    error={errors.password?.message}
                    placeholder="Digite a senha aqui"
                    secureTextEntry
                />

                {/* Campo Confirme a Senha */}
                <FormField
                    control={control}
                    name="passwordConfirm"
                    label="Confirme a Senha:"
                    error={errors.passwordConfirm?.message}
                    placeholder="Digite a senha aqui"
                    secureTextEntry
                />

                {/* Botão pra realizar o cadastro */}
                <ButtonConfirma onPress={handleSubmit(handleSignUp)}/>

        </View>
    )
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

    // linha divisória entre o header e os campos
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: -20, // estica até a borda da tela
    marginBottom: 20,
  },  
})