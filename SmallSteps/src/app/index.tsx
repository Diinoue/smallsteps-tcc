import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";

type FormSignUp = {
  email: string,
  password: string
}

export default function Index () {  
  const {control, handleSubmit} = {} = useForm<FormSignUp>({
      defaultValues: { email: "",
                       password: "",
      },
  })

  const onSubmit = (data: FormSignUp) => {
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
    }
})