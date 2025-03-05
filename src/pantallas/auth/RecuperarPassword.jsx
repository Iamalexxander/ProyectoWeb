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
  Pressable,
  useToast,
  Alert,
  IconButton
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../servicios/firebase';

export const RecuperarPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  const handleRecover = async () => {
    if (!email) {
      toast.show({
        title: "Campo requerido",
        description: "Por favor ingresa tu correo electrónico",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validar formato de email
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.show({
        title: "Email inválido",
        description: "Por favor ingresa un email válido",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      
      // Configuración del correo de recuperación
      const actionCodeSettings = {
        url: "https://proyectoprogra-eaa01.firebaseapp.com/__/auth/action",
        handleCodeInApp: true,
      };

      // Enviar correo de recuperación
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      
      // Marcar como exitoso
      setSuccess(true);
      
    } catch (error) {
      console.error("Error al enviar correo de recuperación:", error);
      
      let mensaje = "No se pudo enviar el correo de recuperación";
      switch (error.code) {
        case "auth/user-not-found":
          mensaje = "No existe una cuenta con este correo electrónico";
          break;
        case "auth/invalid-email":
          mensaje = "Formato de correo electrónico inválido";
          break;
        case "auth/too-many-requests":
          mensaje = "Demasiados intentos. Intenta más tarde";
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
              Recupera el acceso a tu cuenta
            </Text>
          </VStack>
          
          <Divider />
          
          {/* Contenido principal */}
          {!success ? (
            <VStack space={4} w="100%">
              <Heading size="md" color="coolGray.700">
                Recuperar Contraseña
              </Heading>
              
              <Text color="coolGray.600" mb={2}>
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </Text>
              
              <FormControl isRequired>
                <FormControl.Label _text={{ color: "coolGray.700" }}>
                  Correo electrónico
                </FormControl.Label>
                <Input
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChangeText={(text) => setEmail(text)}
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
              
              <Button
                onPress={handleRecover}
                size="lg"
                borderRadius="lg"
                bg="primary.600"
                _pressed={{ bg: "primary.700" }}
                mt={2}
                isLoading={loading}
                isLoadingText="Enviando correo"
                leftIcon={<Icon as={Ionicons} name="mail-outline" size="sm" />}
              >
                Enviar instrucciones
              </Button>
            </VStack>
          ) : (
            <VStack space={4} w="100%" alignItems="center">
              <Icon 
                as={Ionicons} 
                name="checkmark-circle" 
                size="6xl" 
                color="success.500" 
              />
              
              <Heading size="md" color="coolGray.700" textAlign="center">
                Correo enviado
              </Heading>
              
              <Text color="coolGray.600" textAlign="center">
                Hemos enviado las instrucciones de recuperación a:
              </Text>
              
              <Text fontWeight="bold" color="coolGray.800" fontSize="md">
                {email}
              </Text>
              
              <Text color="coolGray.600" textAlign="center" mt={2}>
                Revisa tu bandeja de entrada (y la carpeta de spam) y sigue las instrucciones del correo.
              </Text>
              
              <Button
                onPress={() => navigation.navigate('Login')}
                size="lg"
                borderRadius="lg"
                bg="primary.600"
                _pressed={{ bg: "primary.700" }}
                mt={4}
                w="100%"
                leftIcon={<Icon as={Ionicons} name="arrow-back-outline" size="sm" />}
              >
                Volver a iniciar sesión
              </Button>
            </VStack>
          )}
          
          {!success && (
            <HStack mt={4} justifyContent="center" space={1}>
              <Text color="coolGray.500">¿Recordaste tu contraseña?</Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text color="primary.600" fontWeight="medium">
                  Iniciar sesión
                </Text>
              </Pressable>
            </HStack>
          )}
        </VStack>
      </Center>
      
      {/* Botón para volver en la parte superior */}
      <IconButton
        icon={<Icon as={Ionicons} name="arrow-back" />}
        position="absolute"
        top={6}
        left={4}
        onPress={() => navigation.goBack()}
        borderRadius="full"
        variant="ghost"
      />
    </Box>
  );
};