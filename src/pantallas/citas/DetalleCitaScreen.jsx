import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Button, 
  Heading, 
  Icon, 
  Divider, 
  ScrollView, 
  Badge,
  AspectRatio,
  Image,
  Center,
  useToast,
  AlertDialog,
  Spinner,
  useColorModeValue,
  IconButton,
  Pressable
} from 'native-base';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../servicios/firebase';

export const DetalleCitaScreen = ({ route, navigation }) => {
  const { cita } = route.params;
  const [citaActualizada, setCitaActualizada] = useState(cita);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const cancelRef = React.useRef(null);
  const toast = useToast();

  // Colores dinámicos
  const bgColor = useColorModeValue("white", "coolGray.800");
  const cardBgColor = useColorModeValue("coolGray.50", "coolGray.700");
  const accentColor = "primary.600";
  const textColor = useColorModeValue("coolGray.800", "warmGray.50");

  useEffect(() => {
    obtenerDetalleCita();
  }, []);

  useEffect(() => {
    if (cita) {
      setCitaActualizada({
        ...cita,
        fecha: cita.fecha instanceof Date ? cita.fecha : new Date(cita.fecha)
      });
    }
  }, [cita]);

  const obtenerDetalleCita = async () => {
    try {
      setRefreshing(true);
      const citaRef = doc(db, "citas", cita.id);
      const docSnap = await getDoc(citaRef);
      
      if (docSnap.exists()) {
        const citaData = docSnap.data();
        setCitaActualizada({
          id: docSnap.id,
          ...citaData,
          fecha: citaData.fecha?.toDate() || new Date()
        });
      }
    } catch (error) {
      console.error("Error al obtener detalle de cita:", error);
      toast.show({
        title: "Error",
        description: "No se pudo cargar el detalle de la cita",
        status: "error",
        duration: 3000,
        isClosable: true,
        placement: "top"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const cancelarCita = async () => {
    try {
      setLoading(true);
      const citaRef = doc(db, "citas", cita.id);
      await updateDoc(citaRef, {
        estado: "cancelada"
      });
      
      setCitaActualizada(prev => ({
        ...prev,
        estado: "cancelada"
      }));
      
      toast.show({
        title: "Cita cancelada",
        description: "La cita ha sido cancelada correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
        placement: "top"
      });
      
      // Cerrar el diálogo
      setIsOpen(false);
    } catch (error) {
      console.error("Error al cancelar cita:", error);
      toast.show({
        title: "Error",
        description: "No se pudo cancelar la cita",
        status: "error",
        duration: 3000,
        isClosable: true,
        placement: "top"
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmarCancelacion = () => {
    setIsOpen(true);
  };

  const getBadgeColorScheme = (estado) => {
    switch (estado) {
      case 'confirmada':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'cancelada':
        return 'error';
      default:
        return 'info';
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (refreshing) {
    return (
      <Center flex={1} bg={cardBgColor}>
        <Spinner size="lg" color={accentColor} />
        <Text mt={2} color="coolGray.500">Actualizando información...</Text>
      </Center>
    );
  }

  return (
    <Box flex={1} bg={cardBgColor} safeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={4} p={5}>
          <HStack alignItems="center" space={2} mb={2}>
            <IconButton
              icon={<Icon as={Ionicons} name="arrow-back" size="sm" color={accentColor} />}
              variant="ghost"
              borderRadius="full"
              onPress={() => navigation.goBack()}
            />
            <Heading size="lg" color={accentColor}>
              Detalle de Cita
            </Heading>
          </HStack>
          
          {/* Tarjeta de estado */}
          <Box bg={bgColor} rounded="xl" shadow={2} p={5} mb={2}>
            <VStack space={3} alignItems="center">
              <Badge 
                colorScheme={getBadgeColorScheme(citaActualizada.estado)} 
                rounded="full"
                variant="solid"
                px={4}
                py={1.5}
                _text={{ fontSize: "md", fontWeight: "bold" }}
              >
                {citaActualizada.estado.charAt(0).toUpperCase() + citaActualizada.estado.slice(1)}
              </Badge>

              {citaActualizada.estado === 'pendiente' && (
                <HStack space={2} alignItems="center" bg="amber.100" p={3} rounded="lg" w="full">
                  <Icon as={Ionicons} name="information-circle" color="amber.600" size="md" />
                  <Text color="amber.800" fontSize="sm" flex={1}>
                    Tu cita está pendiente de confirmación por parte del doctor.
                  </Text>
                </HStack>
              )}
              
              {citaActualizada.estado === 'confirmada' && (
                <HStack space={2} alignItems="center" bg="green.100" p={3} rounded="lg" w="full">
                  <Icon as={Ionicons} name="checkmark-circle" color="green.600" size="md" />
                  <Text color="green.800" fontSize="sm" flex={1}>
                    Tu cita ha sido confirmada. Por favor, preséntate a tiempo.
                  </Text>
                </HStack>
              )}
              
              {citaActualizada.estado === 'cancelada' && (
                <HStack space={2} alignItems="center" bg="red.100" p={3} rounded="lg" w="full">
                  <Icon as={Ionicons} name="close-circle" color="red.600" size="md" />
                  <Text color="red.800" fontSize="sm" flex={1}>
                    Esta cita ha sido cancelada.
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>
          
          {/* Información principal */}
          <Box bg={bgColor} rounded="xl" shadow={2} p={5}>
            <VStack space={4}>
              <HStack space={3} alignItems="center">
                <Center 
                  bg="primary.100"
                  p={2}
                  rounded="xl"
                >
                  <Icon 
                    as={Ionicons} 
                    name="calendar" 
                    color={accentColor} 
                    size="md" 
                  />
                </Center>
                <VStack>
                  <Text color="coolGray.500" fontSize="sm">Fecha y Hora</Text>
                  <Text fontWeight="bold" fontSize="md">
                    {formatDate(citaActualizada.fecha)}
                  </Text>
                </VStack>
              </HStack>
              
              <Divider />
              
              <HStack space={3} alignItems="center">
                <Center 
                  bg="primary.100"
                  p={2}
                  rounded="xl"
                >
                  <Icon 
                    as={MaterialIcons} 
                    name="local-hospital" 
                    color={accentColor} 
                    size="md" 
                  />
                </Center>
                <VStack>
                  <Text color="coolGray.500" fontSize="sm">Especialidad</Text>
                  <Text fontWeight="bold" fontSize="md">
                    {citaActualizada.especialidad}
                  </Text>
                </VStack>
              </HStack>
              
              <Divider />
              
              <HStack space={3} alignItems="center">
                <Center 
                  bg="primary.100"
                  p={2}
                  rounded="xl"
                >
                  <Icon 
                    as={Ionicons} 
                    name="person" 
                    color={accentColor} 
                    size="md" 
                  />
                </Center>
                <HStack flex={1} space={3} alignItems="center">
                  <AspectRatio ratio={1} width={50}>
                    <Image
                      source={require('../../../assets/images/default-avatar.png')}
                      alt="Doctor"
                      borderRadius="full"
                      fallbackSource={require('../../../assets/images/default-avatar.png')}
                    />
                  </AspectRatio>
                  <VStack>
                    <Text fontWeight="bold" fontSize="md">
                      {citaActualizada.nombreDoctor || "No asignado"}
                    </Text>
                    <Text fontSize="xs" color="coolGray.500">
                      {citaActualizada.especialidad}
                    </Text>
                  </VStack>
                </HStack>
              </HStack>
              
              {citaActualizada.notas && (
                <>
                  <Divider />
                  
                  <HStack space={3} alignItems="center">
                    <Center 
                      bg="primary.100"
                      p={2}
                      rounded="xl"
                    >
                      <Icon 
                        as={Ionicons} 
                        name="document-text" 
                        color={accentColor} 
                        size="md" 
                      />
                    </Center>
                    <VStack flex={1}>
                      <Text color="coolGray.500" fontSize="sm">Notas</Text>
                      <Text fontSize="md">
                        {citaActualizada.notas}
                      </Text>
                    </VStack>
                  </HStack>
                </>
              )}
            </VStack>
          </Box>
          
          {/* Acciones */}
          <Box mt={3}>
            <VStack space={3}>
              {citaActualizada.estado === 'pendiente' && (
                <Button
                  colorScheme="danger"
                  onPress={confirmarCancelacion}
                  leftIcon={<Icon as={Ionicons} name="close-circle" />}
                  isDisabled={loading}
                  size="lg"
                  rounded="full"
                  shadow={2}
                  _text={{ fontWeight: "bold" }}
                >
                  Cancelar Cita
                </Button>
              )}
              
              {citaActualizada.estado === 'confirmada' && (
                <Button
                  colorScheme="primary"
                  onPress={() => {
                    // Aquí podrías implementar la funcionalidad para reprogramar
                    toast.show({
                      title: "Función no disponible",
                      description: "La reprogramación de citas estará disponible próximamente",
                      status: "info",
                      duration: 3000,
                      isClosable: true,
                      placement: "top"
                    });
                  }}
                  leftIcon={<Icon as={Ionicons} name="time" />}
                  size="lg"
                  rounded="full"
                  shadow={2}
                  _text={{ fontWeight: "bold" }}
                >
                  Reprogramar
                </Button>
              )}
              
              {citaActualizada.estado === 'cancelada' && (
                <Button
                  colorScheme="primary"
                  onPress={() => navigation.navigate('AgendarCita')}
                  leftIcon={<Icon as={Ionicons} name="add-circle" />}
                  size="lg"
                  rounded="full"
                  shadow={2}
                  _text={{ fontWeight: "bold" }}
                >
                  Agendar Nueva Cita
                </Button>
              )}
              
              {/* Botón para volver */}
              <Button
                variant="subtle"
                colorScheme="coolGray"
                onPress={() => navigation.goBack()}
                leftIcon={<Icon as={Ionicons} name="arrow-back" />}
                rounded="full"
              >
                Volver a Mis Citas
              </Button>
            </VStack>
          </Box>
          
          {/* Tarjeta de contacto */}
          <Pressable 
            onPress={() => {
              toast.show({
                title: "Función no disponible",
                description: "La comunicación directa con el doctor estará disponible próximamente",
                status: "info",
                duration: 3000,
                isClosable: true,
                placement: "top"
              });
            }}
            mt={2}
            mb={6}
          >
            <Box bg={bgColor} rounded="xl" shadow={2} p={4}>
              <HStack space={3} alignItems="center">
                <Center 
                  bg="primary.100"
                  p={3}
                  rounded="xl"
                >
                  <Icon 
                    as={Ionicons} 
                    name="chatbubble-ellipses" 
                    color={accentColor} 
                    size="md" 
                  />
                </Center>
                <VStack flex={1}>
                  <Text fontWeight="bold" fontSize="md">¿Necesitas contactar al doctor?</Text>
                  <Text color="coolGray.600" fontSize="sm">
                    Toca aquí para enviar un mensaje
                  </Text>
                </VStack>
                <Icon as={Ionicons} name="chevron-forward" color="coolGray.400" />
              </HStack>
            </Box>
          </Pressable>
        </VStack>
      </ScrollView>

      {/* Diálogo de confirmación para cancelar cita */}
      <AlertDialog 
        leastDestructiveRef={cancelRef} 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
      >
        <AlertDialog.Content borderRadius="xl">
          <AlertDialog.CloseButton />
          <AlertDialog.Header borderBottomWidth={0}>Cancelar Cita</AlertDialog.Header>
          <AlertDialog.Body>
            <VStack space={3}>
              <Icon 
                as={Ionicons} 
                name="alert-circle" 
                color="danger.500" 
                size="xl" 
                alignSelf="center"
              />
              <Text>
                ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
              </Text>
            </VStack>
          </AlertDialog.Body>
          <AlertDialog.Footer borderTopWidth={0}>
            <Button.Group space={2}>
              <Button 
                variant="unstyled" 
                colorScheme="coolGray" 
                ref={cancelRef} 
                onPress={() => setIsOpen(false)}
              >
                Volver
              </Button>
              <Button 
                colorScheme="danger" 
                onPress={cancelarCita}
                isLoading={loading}
                isLoadingText="Cancelando"
                rounded="lg"
              >
                Cancelar Cita
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Box>
  );
};