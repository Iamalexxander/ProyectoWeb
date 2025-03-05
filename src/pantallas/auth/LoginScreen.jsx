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
  useToast
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../servicios/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LoginScreen = ({ navigation }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      toast.show({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      
      // Iniciar sesión con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // Obtener datos del usuario desde Firestore
      const userDoc = await getDoc(doc(db, "usuarios", userCredential.user.uid));

      if (!userDoc.exists()) {
        // Si no existe un documento de usuario, crearlo con datos básicos
        try {
          await setDoc(doc(db, "usuarios", userCredential.user.uid), {
            email: form.email,
            rol: "paciente",
            createdAt: new Date(),
          });
        } catch (error) {
          console.error("Error al crear documento de usuario:", error);
        }
      }
      
      // Guardar información de sesión
      const userData = userDoc.exists() ? userDoc.data() : { email: form.email, rol: "paciente" };
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      // Mostrar mensaje de éxito
      toast.show({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Redirigir a la pantalla principal (la navegación se manejará en el componente padre)
      // La navegación estará gestionada por el NavigationContainer en App.js
    } catch (error) {
      console.error("Error de inicio de sesión:", error);
      
      let mensaje = "No se pudo iniciar sesión";
      switch (error.code) {
        case "auth/user-not-found":
          mensaje = "No existe una cuenta con este correo electrónico";
          break;
        case "auth/wrong-password":
          mensaje = "Contraseña incorrecta";
          break;
        case "auth/invalid-email":
          mensaje = "Formato de correo electrónico inválido";
          break;
        case "auth/too-many-requests":
          mensaje = "Demasiados intentos fallidos. Intenta más tarde";
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
      <Center flex={1} px={6}>
        <VStack space={6} w="100%" maxW="400px">
          {/* Logo y Encabezado */}
          <VStack space={2} alignItems="center" mb={4}>
            <Image 
              source={require('../../../assets/images/logo.png')}
              alt="Logo"
              size="xl"
              resizeMode="contain"
            />
            <Heading size="xl" color="primary.600" textAlign="center">
              MediCitas
            </Heading>
            <Text color="muted.500" textAlign="center">
              Gestiona tus citas médicas de forma sencilla
            </Text>
          </VStack>
          
          <Divider />
          
          {/* Formulario de Login */}
          <VStack space={4} w="100%">
            <Heading size="md" color="coolGray.700">
              Iniciar Sesión
            </Heading>
            
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
                placeholder="Contraseña"
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
            
            <Pressable onPress={() => navigation.navigate('RecuperarPassword')}>
              <Text color="primary.600" fontSize="sm" textAlign="right" mb={1}>
                ¿Olvidaste tu contraseña?
              </Text>
            </Pressable>
            
            <Button
              onPress={handleLogin}
              size="lg"
              borderRadius="lg"
              bg="primary.600"
              _pressed={{ bg: "primary.700" }}
              isLoading={loading}
              isLoadingText="Iniciando sesión"
            >
              Iniciar Sesión
            </Button>
          </VStack>
          
          <HStack mt={4} justifyContent="center" space={1}>
            <Text color="coolGray.500">¿No tienes una cuenta?</Text>
            <Pressable onPress={() => navigation.navigate('Registro')}>
              <Text color="primary.600" fontWeight="medium">
                Regístrate
              </Text>
            </Pressable>
          </HStack>
        </VStack>
      </Center>
    </Box>
  );
};