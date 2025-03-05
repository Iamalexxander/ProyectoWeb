import React, { useState } from 'react';
import { 
  Box, 
  VStack, 
  FormControl, 
  Input, 
  Button, 
  Heading, 
  Icon, 
  HStack, 
  Text, 
  Center, 
  Image, 
  Divider, 
  IconButton,
  Pressable,
  useToast,
  ScrollView
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../servicios/firebase';

export const RegistroScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleRegister = async () => {
    // Validación de campos
    if (!form.nombre || !form.email || !form.password || !form.confirmarPassword) {
      toast.show({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Validar formato de email
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      toast.show({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Validar coincidencia de contraseñas
    if (form.password !== form.confirmarPassword) {
      toast.show({
        title: "Error",
        description: "Las contraseñas no coinciden",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Validar longitud de contraseña
    if (form.password.length < 6) {
      toast.show({
        title: "Contraseña débil",
        description: "La contraseña debe tener al menos 6 caracteres",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // Crear documento del usuario en Firestore
      const userData = {
        nombre: form.nombre,
        email: form.email,
        rol: "paciente",
        createdAt: new Date(),
      };

      await setDoc(doc(db, "usuarios", userCredential.user.uid), userData);
      
      // Mostrar mensaje de éxito
      toast.show({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Navegar a la pantalla de login
      navigation.navigate('Login');
    } catch (error) {
      console.error("Error de registro:", error);
      
      let mensaje = "No se pudo crear la cuenta";
      switch (error.code) {
        case "auth/email-already-in-use":
          mensaje = "Este correo electrónico ya está registrado";
          break;
        case "auth/invalid-email":
          mensaje = "Formato de correo electrónico inválido";
          break;
        case "auth/weak-password":
          mensaje = "La contraseña es muy débil";
          break;
      }
      
      toast.show({
        title: "Error",
        description: mensaje,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} bg="white" safeArea>
      <ScrollView>
        <Center flex={1} px={6} py={6}>
          <VStack space={6} w="100%" maxW="400px">
            {/* Logo y Encabezado */}
            <VStack space={2} alignItems="center" mb={2}>
              <Image 
                source={require('../../../assets/images/logo.png')}
                alt="Logo"
                size="lg"
                resizeMode="contain"
              />
              <Heading size="xl" color="primary.600" textAlign="center">
                MediCitas
              </Heading>
              <Text color="muted.500" textAlign="center">
                Crea tu cuenta para agendar citas médicas
              </Text>
            </VStack>
            
            <Divider />
            
            {/* Formulario de Registro */}
            <VStack space={4} w="100%">
              <Heading size="md" color="coolGray.700">
                Crear Cuenta
              </Heading>
              
              <FormControl isRequired>
                <FormControl.Label _text={{ color: "coolGray.700" }}>
                  Nombre completo
                </FormControl.Label>
                <Input
                  placeholder="Ingresa tu nombre"
                  value={form.nombre}
                  onChangeText={(text) => setForm({ ...form, nombre: text })}
                  size="lg"
                  borderRadius="lg"
                  borderColor="coolGray.300"
                  _focus={{
                    borderColor: "primary.500",
                    backgroundColor: "white",
                  }}
                  InputLeftElement={
                    <Icon
                      as={Ionicons}
                      name="person-outline"
                      size={5}
                      ml={2}
                      color="coolGray.400"
                    />
                  }
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormControl.Label _text={{ color: "coolGray.700" }}>
                  Correo electrónico
                </FormControl.Label>
                <Input
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChangeText={(text) => setForm({ ...form, email: text })}
                  size="lg"
                  borderRadius="lg"
                  borderColor="coolGray.300"
                  _focus={{
                    borderColor: "primary.500",
                    backgroundColor: "white",
                  }}
                  InputLeftElement={
                    <Icon
                      as={Ionicons}
                      name="mail-outline"
                      size={5}
                      ml={2}
                      color="coolGray.400"
                    />
                  }
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormControl.Label _text={{ color: "coolGray.700" }}>
                  Contraseña
                </FormControl.Label>
                <Input
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChangeText={(text) => setForm({ ...form, password: text })}
                  size="lg"
                  borderRadius="lg"
                  borderColor="coolGray.300"
                  type={showPassword ? "text" : "password"}
                  _focus={{
                    borderColor: "primary.500",
                    backgroundColor: "white",
                  }}
                  InputLeftElement={
                    <Icon
                      as={Ionicons}
                      name="lock-closed-outline"
                      size={5}
                      ml={2}
                      color="coolGray.400"
                    />
                  }
                  InputRightElement={
                    <IconButton
                      icon={
                        <Icon
                          as={Ionicons}
                          name={showPassword ? "eye-outline" : "eye-off-outline"}
                          size={5}
                          color="coolGray.400"
                        />
                      }
                      onPress={() => setShowPassword(!showPassword)}
                      variant="unstyled"
                      mr={1}
                    />
                  }
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormControl.Label _text={{ color: "coolGray.700" }}>
                  Confirmar contraseña
                </FormControl.Label>
                <Input
                  placeholder="Repite tu contraseña"
                  value={form.confirmarPassword}
                  onChangeText={(text) => setForm({ ...form, confirmarPassword: text })}
                  size="lg"
                  borderRadius="lg"
                  borderColor="coolGray.300"
                  type={showConfirmPassword ? "text" : "password"}
                  _focus={{
                    borderColor: "primary.500",
                    backgroundColor: "white",
                  }}
                  InputLeftElement={
                    <Icon
                      as={Ionicons}
                      name="lock-closed-outline"
                      size={5}
                      ml={2}
                      color="coolGray.400"
                    />
                  }
                  InputRightElement={
                    <IconButton
                      icon={
                        <Icon
                          as={Ionicons}
                          name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                          size={5}
                          color="coolGray.400"
                        />
                      }
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      variant="unstyled"
                      mr={1}
                    />
                  }
                />
              </FormControl>
              
              <Button
                onPress={handleRegister}
                size="lg"
                borderRadius="lg"
                bg="primary.600"
                _pressed={{ bg: "primary.700" }}
                mt={2}
                isLoading={loading}
                isLoadingText="Creando cuenta"
              >
                Registrarse
              </Button>
            </VStack>
            
            <HStack mt={2} justifyContent="center" space={1}>
              <Text color="coolGray.500">¿Ya tienes una cuenta?</Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text color="primary.600" fontWeight="medium">
                  Inicia sesión
                </Text>
              </Pressable>
            </HStack>
          </VStack>
        </Center>
      </ScrollView>
    </Box>
  );
};