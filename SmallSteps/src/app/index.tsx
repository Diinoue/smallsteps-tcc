import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { z } from "zod";

const SignInSchema = z.object({
  email: z.email("Email invalido."),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres.")
})

type SignInSchema = z.infer<typeof SignInSchema>

export default function Index () {  
  const {control, handleSubmit, formState: {errors}} = useForm<SignInSchema>({
      resolver: zodResolver(SignInSchema),
      defaultValues: { email: "",
                       password: "",
      },
  })

  const handleLogIn = (data: SignInSchema) => {
    console.log(data);
  }

  return (
  <View style={styles.container}>
    <View style={styles.headerContainer}>
      <Text style={styles.header}>Login</Text>
    </View>
    
    <View style={styles.fields}>
      {/* <TextInput
      style={styles.field}
      placeholder="seuemail@aqui.com"
      />
      <TextInput
      style={styles.field}
      placeholder="Senha"
      /> */}

    <Text style={styles.label}>E-mail:</Text>
      <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value}}) => (
            <TextInput
              style={styles.field}
              placeholder="endereco@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )
        } 
        />
      {errors.email && (            
              <Text style={styles.warning}>{errors.email.message}</Text>            
      )}


      <Text style={styles.label}>Senha:</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value}}) => (
            <TextInput
              style={styles.field}
              placeholder="Digite a sua senha"
              secureTextEntry
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )
        } 
        />

        {errors.password && (            
              <Text style={styles.warning}>{errors.password.message}</Text>            
      )}

        <Button
          title="Entrar"
          onPress={handleSubmit(handleLogIn)}
          />

    </View>
        
    

  </View>
  );
}

const styles = StyleSheet.create({
    container: {
      marginVertical: 60,      
    },

    // header
    headerContainer: {
      alignItems: 'center',
      textAlign: 'center',
      marginBottom: 40
      
    },
    header: {
        color: '#000',
        fontSize: 45,                
    },

    // fields
    fields: {

    },
    field: {
      marginVertical: 10,
      marginHorizontal: 20,
      borderWidth: 1,
      borderRadius: 6,
      borderColor: "#c5c5c5"
    },
    label: {
      fontSize: 22
    },
    warning: {
      fontSize: 15,
      borderColor: 'red',
      color: '#e63946',
    }
})