import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Heading,
  ScrollView,
  Button,
  Divider,
  Icon,
  Skeleton,
  Center,
  useToast,
  IconButton,
  AspectRatio,
  Badge,
  Pressable,
  useColorModeValue,
  Menu,
  AlertDialog
} from 'native-base';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '../../servicios/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Platform, Share } from 'react-native';

export const PerfilUsuarioScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const toast = useToast();
  
  // Colores dinámicos para modo claro/oscuro
  const bgColor = useColorModeValue("white", "coolGray.800");
  const textColor = useColorModeValue("coolGray.800", "warmGray.50");
  const cardBgColor = useColorModeValue("coolGray.50", "coolGray.700");
  const accentColor = "#2B6CB0"; // Color primario de la app
  
  useEffect(() => {
    checkAuthStatus();
    
    // Refrescar datos cuando la pantalla obtiene foco
    const unsubscribe = navigation.addListener('focus', () => {
      checkAuthStatus();
    });
    
    return unsubscribe;
  }, [navigation]);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      
      // Verificar si hay un usuario autenticado
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setIsLoggedIn(false);
        setUserData(null);
        setLoading(false);
        return;
      }
      
      setIsLoggedIn(true);
      
      // Obtener datos actualizados de Firestore
      const userDoc = await getDoc(doc(db, "usuarios", currentUser.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        
        // Actualizar almacenamiento local
        await AsyncStorage.setItem('userData', JSON.stringify(data));
      } else {
        // Si no hay documento, usar datos básicos
        const basicData = {
          email: currentUser.email,
          nombre: currentUser.displayName || 'Usuario',
          photoURL: currentUser.photoURL,
        };
        setUserData(basicData);
      }
    } catch (error) {
      console.error('Error al verificar estado de autenticación:', error);
      toast.show({
        title: "Error",
        description: "No se pudieron cargar los datos del perfil",
        status: "error",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    if (!isLoggedIn) {
      toast.show({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para realizar esta acción",
        status: "warning"
      });
      return;
    }
    
    try {
      // Solicitar permisos para acceder a la galería
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        toast.show({
          title: "Permiso denegado",
          description: "Necesitamos permiso para acceder a tu galería",
          status: "warning"
        });
        return;
      }
      
      // Lanzar selector de imágenes
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!pickerResult.canceled) {
        setUploadingImage(true);
        
        // Referencia al archivo en Firebase Storage
        const currentUser = auth.currentUser;
        const storageRef = ref(storage, `usuarios/${currentUser.uid}/profile-pic.jpg`);
        
        // Convertir imagen a blob
        const response = await fetch(pickerResult.assets[0].uri);
        const blob = await response.blob();
        
        // Subir a Firebase Storage
        await uploadBytes(storageRef, blob);
        
        // Obtener URL de la imagen
        const downloadURL = await getDownloadURL(storageRef);
        
        // Actualizar documento del usuario
        await updateDoc(doc(db, "usuarios", currentUser.uid), {
          photoURL: downloadURL
        });
        
        // Recargar datos
        await checkAuthStatus();
        
        toast.show({
          title: "Éxito",
          description: "Imagen de perfil actualizada correctamente",
          status: "success"
        });
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      toast.show({
        title: "Error",
        description: "No se pudo actualizar la imagen de perfil",
        status: "error"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('LoginScreen');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      await AsyncStorage.removeItem('userData');
      setIsLoggedIn(false);
      setUserData(null);
      
      toast.show({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
        status: "success"
      });
      
      // Opcional: redirigir a pantalla de inicio
      // navigation.navigate('Home');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.show({
        title: "Error",
        description: "No se pudo cerrar la sesión. Inténtalo de nuevo.",
        status: "error"
      });
    }
  };

  const compartirPerfil = async () => {
    if (!isLoggedIn) return;
    
    try {
      await Share.share({
        message: `Te comparto mi perfil de salud. Nombre: ${userData?.nombre || 'Usuario'}.`,
        title: "Compartir perfil"
      });
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  if (loading) {
    return (
      <Box flex={1} p={4} bg={bgColor} safeArea>
        <VStack space={4} w="100%">
          <Box position="relative" alignItems="center" mt={6}>
            <Skeleton size="32" rounded="full" />
          </Box>
          <Center>
            <Skeleton h="6" rounded="md" w="40%" />
            <Skeleton h="4" rounded="md" w="30%" mt={2} />
          </Center>
          <Divider my={2} />
          <Skeleton h="20" rounded="md" />
          <Skeleton.Text lines={3} />
          <Skeleton h="20" rounded="md" mt={2} />
        </VStack>
      </Box>
    );
  }

  if (!isLoggedIn) {
    return (
      <Box flex={1} bg={bgColor} safeArea p={4}>
        <VStack space={5} alignItems="center" justifyContent="center" h="100%">
          <Avatar 
            size="2xl" 
            source={require('../../../assets/images/default-avatar.png')} 
            bg="gray.300"
          />
          
          <Heading size="lg" color={textColor} textAlign="center">
            Bienvenido a la App
          </Heading>
          
          <Text color="muted.500" textAlign="center" px={4}>
            Inicia sesión para acceder a tu perfil y gestionar tu información personal y médica
          </Text>
          
          <Button
            w="100%"
            size="lg"
            mt={6}
            bg={accentColor}
            _pressed={{ bg: "primary.700" }}
            borderRadius="lg"
            leftIcon={<Icon as={Ionicons} name="log-in-outline" size="sm" />}
            onPress={handleLogin}
          >
            Iniciar Sesión
          </Button>
          
          <Button
            w="100%"
            variant="outline"
            borderColor={accentColor}
            _text={{ color: accentColor }}
            _pressed={{ bg: "primary.50" }}
            borderRadius="lg"
            leftIcon={<Icon as={Ionicons} name="person-add-outline" size="sm" />}
            onPress={() => navigation.navigate('RegistroScreen')}
            mt={3}
          >
            Registrarse
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box flex={1} bg={bgColor} safeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header con foto y botones de acción */}
        <Box position="relative">
          <AspectRatio ratio={16/9} width="100%">
            <Box bg="primary.100" />
          </AspectRatio>
          
          <Box 
            position="absolute" 
            top={4} 
            right={4} 
            zIndex={1}
          >
            <HStack space={2}>
              <IconButton
                icon={<Icon as={Ionicons} name="share-social" />}
                borderRadius="full"
                bg="white:alpha.70"
                _pressed={{ bg: "white:alpha.90" }}
                onPress={compartirPerfil}
              />
              <Menu trigger={triggerProps => {
                return (
                  <IconButton
                    {...triggerProps}
                    icon={<Icon as={Ionicons} name="ellipsis-vertical" />}
                    borderRadius="full"
                    bg="white:alpha.70"
                    _pressed={{ bg: "white:alpha.90" }}
                  />
                );
              }}>
                <Menu.Item onPress={() => setShowLogoutDialog(true)} leftIcon={<Icon as={Ionicons} name="log-out-outline" size="sm" />}>
                  Cerrar Sesión
                </Menu.Item>
              </Menu>
            </HStack>
          </Box>
          
          <Center 
            position="absolute" 
            bottom={-50} 
            left={0} 
            right={0}
          >
            <Box position="relative">
              <Avatar 
                size="xl"
                source={
                  userData?.photoURL 
                    ? { uri: userData.photoURL } 
                    : require('../../../assets/images/default-avatar.png')
                } 
                borderWidth={4}
                borderColor={bgColor}
                bg={accentColor}
              >
                {userData?.nombre?.charAt(0) || "U"}
              </Avatar>
              <IconButton
                icon={<Icon as={Ionicons} name="camera" size="sm" color="white" />}
                bg={accentColor}
                _pressed={{ bg: "primary.700" }}
                rounded="full"
                position="absolute"
                bottom={0}
                right={0}
                size="sm"
                onPress={handleImageUpload}
                isLoading={uploadingImage}
              />
            </Box>
          </Center>
        </Box>
        
        {/* Información principal */}
        <VStack space={4} p={6} pt={16} mt={8}>
          <VStack alignItems="center" space={1}>
            <Heading size="lg" textAlign="center" color={textColor}>
              {userData?.nombre || 'Usuario'}
            </Heading>
            
            <Text color="muted.500">{userData?.email}</Text>
            
            {userData?.rol && (
              <Badge 
                colorScheme="primary" 
                variant="subtle" 
                rounded="full" 
                px={3} 
                py={1}
                mt={1}
              >
                {userData.rol === 'paciente' ? 'Paciente' : userData.rol === 'doctor' ? 'Doctor' : userData.rol}
              </Badge>
            )}
          </VStack>
          
          {/* Botones de acción rápida */}
          <HStack space={3} mt={4} justifyContent="center">
            <Pressable 
              flex={1} 
              onPress={() => navigation.navigate('ConfiguracionScreen')}
            >
              <Box 
                p={3} 
                bg={cardBgColor} 
                rounded="lg"
                shadow={1}
                alignItems="center"
              >
                <Icon 
                  as={Ionicons} 
                  name="create-outline" 
                  size="md" 
                  color={accentColor}
                  mb={1}
                />
                <Text textAlign="center" fontWeight="medium" color={textColor}>Editar</Text>
              </Box>
            </Pressable>
            
            <Pressable 
              flex={1} 
              onPress={() => navigation.navigate('CambiarPassword')}
            >
              <Box 
                p={3} 
                bg={cardBgColor} 
                rounded="lg"
                shadow={1}
                alignItems="center"
              >
                <Icon 
                  as={Ionicons} 
                  name="shield-outline" 
                  size="md" 
                  color={accentColor}
                  mb={1}
                />
                <Text textAlign="center" fontWeight="medium" color={textColor}>Seguridad</Text>
              </Box>
            </Pressable>
            
            <Pressable 
              flex={1} 
              onPress={() => navigation.navigate('MisCitas')}
            >
              <Box 
                p={3} 
                bg={cardBgColor} 
                rounded="lg"
                shadow={1}
                alignItems="center"
              >
                <Icon 
                  as={Ionicons} 
                  name="calendar-outline" 
                  size="md" 
                  color={accentColor}
                  mb={1}
                />
                <Text textAlign="center" fontWeight="medium" color={textColor}>Citas</Text>
              </Box>
            </Pressable>
          </HStack>
          
          <Divider my={4} />
          
          {/* Información del usuario */}
          <Box
            bg={cardBgColor}
            rounded="xl"
            shadow={2}
            p={4}
          >
            <Heading size="md" mb={4} color={textColor}>Información Personal</Heading>
            
            <VStack space={4}>
              <HStack space={4} alignItems="flex-start">
                <Center 
                  bg="primary.100"
                  p={2}
                  rounded="md"
                >
                  <Icon 
                    as={Ionicons} 
                    name="call-outline" 
                    size="md" 
                    color={accentColor}
                  />
                </Center>
                <VStack flex={1}>
                  <Text fontWeight="bold" fontSize="md" color={textColor}>Teléfono</Text>
                  <Text color="coolGray.600" mt={1}>
                    {userData?.telefono || 'No especificado'}
                  </Text>
                </VStack>
              </HStack>
              
              <HStack space={4} alignItems="flex-start">
                <Center 
                  bg="primary.100"
                  p={2}
                  rounded="md"
                >
                  <Icon 
                    as={Ionicons} 
                    name="calendar-outline" 
                    size="md" 
                    color={accentColor}
                  />
                </Center>
                <VStack flex={1}>
                  <Text fontWeight="bold" fontSize="md" color={textColor}>Fecha de nacimiento</Text>
                  <Text color="coolGray.600" mt={1}>
                    {userData?.fechaNacimiento || 'No especificada'}
                  </Text>
                </VStack>
              </HStack>
              
              <HStack space={4} alignItems="flex-start">
                <Center 
                  bg="primary.100"
                  p={2}
                  rounded="md"
                >
                  <Icon 
                    as={Ionicons} 
                    name="location-outline" 
                    size="md" 
                    color={accentColor}
                  />
                </Center>
                <VStack flex={1}>
                  <Text fontWeight="bold" fontSize="md" color={textColor}>Dirección</Text>
                  <Text color="coolGray.600" mt={1}>
                    {userData?.direccion || 'No especificada'}
                  </Text>
                </VStack>
              </HStack>
              
              {userData?.biografia && (
                <HStack space={4} alignItems="flex-start">
                  <Center 
                    bg="primary.100"
                    p={2}
                    rounded="md"
                  >
                    <Icon 
                      as={Ionicons} 
                      name="person-outline" 
                      size="md" 
                      color={accentColor}
                    />
                  </Center>
                  <VStack flex={1}>
                    <Text fontWeight="bold" fontSize="md" color={textColor}>Biografía</Text>
                    <Text color="coolGray.600" mt={1}>
                      {userData.biografia}
                    </Text>
                  </VStack>
                </HStack>
              )}
            </VStack>
          </Box>
          
          {/* Información médica - Solo para pacientes */}
          {userData?.rol === 'paciente' && (
            <Box
              bg={cardBgColor}
              rounded="xl"
              shadow={2}
              p={4}
              mt={4}
            >
              <Heading size="md" mb={4} color={textColor}>Información Médica</Heading>
              
              <VStack space={4}>
                <HStack space={4} alignItems="flex-start">
                  <Center 
                    bg="primary.100"
                    p={2}
                    rounded="md"
                  >
                    <Icon 
                      as={Ionicons} 
                      name="water-outline" 
                      size="md" 
                      color={accentColor}
                    />
                  </Center>
                  <VStack flex={1}>
                    <Text fontWeight="bold" fontSize="md" color={textColor}>Tipo de sangre</Text>
                    <Text color="coolGray.600" mt={1}>
                      {userData?.tipoSangre || 'No especificado'}
                    </Text>
                  </VStack>
                </HStack>
                
                <HStack space={4} alignItems="flex-start">
                  <Center 
                    bg="primary.100"
                    p={2}
                    rounded="md"
                  >
                    <Icon 
                      as={FontAwesome5} 
                      name="allergies" 
                      size="md" 
                      color={accentColor}
                    />
                  </Center>
                  <VStack flex={1}>
                    <Text fontWeight="bold" fontSize="md" color={textColor}>Alergias</Text>
                    <Text color="coolGray.600" mt={1}>
                      {userData?.alergias?.length > 0 ? userData.alergias.join(', ') : 'Ninguna registrada'}
                    </Text>
                  </VStack>
                </HStack>
                
                <HStack space={4} alignItems="flex-start">
                  <Center 
                    bg="primary.100"
                    p={2}
                    rounded="md"
                  >
                    <Icon 
                      as={FontAwesome5} 
                      name="heartbeat" 
                      size="md" 
                      color={accentColor}
                    />
                  </Center>
                  <VStack flex={1}>
                    <Text fontWeight="bold" fontSize="md" color={textColor}>Enfermedades crónicas</Text>
                    <Text color="coolGray.600" mt={1}>
                      {userData?.enfermedadesCronicas?.length > 0 ? userData.enfermedadesCronicas.join(', ') : 'Ninguna registrada'}
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </Box>
          )}
          
          {/* Botón de editar perfil */}
          <Button
            size="lg"
            mt={6}
            mb={8}
            bg={accentColor}
            shadow={3}
            _pressed={{ bg: "primary.700" }}
            borderRadius="full"
            leftIcon={<Icon as={Ionicons} name="create-outline" size="sm" />}
            onPress={() => navigation.navigate('ConfiguracionScreen')}
          >
            Editar perfil
          </Button>
        </VStack>
      </ScrollView>
      
      {/* Diálogo de confirmación para cerrar sesión */}
      <AlertDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      >
        <AlertDialog.Content>
          <AlertDialog.CloseButton />
          <AlertDialog.Header>Cerrar Sesión</AlertDialog.Header>
          <AlertDialog.Body>
            ¿Estás seguro de que quieres cerrar tu sesión?
          </AlertDialog.Body>
          <AlertDialog.Footer>
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                colorScheme="coolGray"
                onPress={() => setShowLogoutDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                colorScheme="danger"
                onPress={() => {
                  setShowLogoutDialog(false);
                  handleLogout();
                }}
              >
                Cerrar Sesión
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
};