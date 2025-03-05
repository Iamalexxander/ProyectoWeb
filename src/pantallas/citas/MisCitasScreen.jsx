import React, { useState, useEffect } from 'react';
import { RefreshControl } from 'react-native';
import { 
  Box, 
  FlatList, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Spacer, 
  Badge, 
  Icon, 
  Divider, 
  Center, 
  Spinner,
  useToast,
  IconButton,
  AlertDialog,
  Button,
  Pressable,
  useColorModeValue,
  Avatar,
  Fab
} from 'native-base';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { auth, db } from '../../servicios/firebase';

export const MisCitasScreen = ({ navigation }) => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();
  const onClose = () => setIsOpen(false);
  const cancelRef = React.useRef(null);
  
  // Colores dinámicos
  const bgColor = useColorModeValue("white", "coolGray.800");
  const cardBgColor = useColorModeValue("coolGray.50", "coolGray.700");
  const accentColor = "primary.600";
  const textColor = useColorModeValue("coolGray.800", "warmGray.50");

  const obtenerCitas = async () => {
    try {
      setLoading(true);
      const usuario = auth.currentUser;
      
      if (!usuario) {
        toast.show({
          title: "Error",
          description: "Debes iniciar sesión para ver tus citas",
          status: "error",
          duration: 3000,
          isClosable: true,
          placement: "top"
        });
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "citas"),
        where("idPaciente", "==", usuario.uid),
        orderBy("fecha", "desc")
      );

      const querySnapshot = await getDocs(q);
      const citasData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        citasData.push({
          id: doc.id,
          ...data,
          fecha: data.fecha?.toDate() || new Date()
        });
      });
      
      setCitas(citasData);
    } catch (error) {
      console.error("Error al obtener citas:", error);
      toast.show({
        title: "Error",
        description: "No se pudieron cargar tus citas",
        status: "error",
        duration: 3000,
        isClosable: true,
        placement: "top"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      obtenerCitas();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        obtenerCitas();
      } else {
        setCitas([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    obtenerCitas();
  };

  const cancelarCita = async () => {
    try {
      if (!citaSeleccionada) return;
      
      const citaRef = doc(db, "citas", citaSeleccionada.id);
      await updateDoc(citaRef, {
        estado: "cancelada"
      });
      
      // Actualizar la lista local
      setCitas(prevCitas => 
        prevCitas.map(cita => 
          cita.id === citaSeleccionada.id 
            ? {...cita, estado: "cancelada"} 
            : cita
        )
      );
      
      toast.show({
        title: "Cita cancelada",
        description: "La cita ha sido cancelada correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
        placement: "top"
      });
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
      onClose();
    }
  };

  const mostrarDialogoCancelar = (cita) => {
    setCitaSeleccionada(cita);
    setIsOpen(true);
  };

  const verDetalleCita = (cita) => {
    navigation.navigate('DetalleCita', { cita });
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
    
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    const esMismoDia = (fecha1, fecha2) => {
      return fecha1.getDate() === fecha2.getDate() &&
        fecha1.getMonth() === fecha2.getMonth() &&
        fecha1.getFullYear() === fecha2.getFullYear();
    };
    
    if (esMismoDia(date, hoy)) {
      return `Hoy, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (esMismoDia(date, manana)) {
      return `Mañana, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const renderItem = ({ item }) => (
    <Pressable onPress={() => verDetalleCita(item)}>
      <Box 
        borderBottomWidth="1" 
        borderColor="coolGray.200" 
        pl="4" 
        pr="4" 
        py="4"
        bg={bgColor}
        rounded="xl"
        shadow={2}
        mb={3}
      >
        <HStack space={3} alignItems="center">
          <Avatar
            bg={item.estado === 'confirmada' ? 'success.100' : 
               item.estado === 'pendiente' ? 'amber.100' : 'coolGray.100'}
            size="md"
          >
            <Icon
              as={Ionicons}
              name={item.estado === 'confirmada' ? 'checkmark-circle' : 
                  item.estado === 'pendiente' ? 'time' : 'close-circle'}
              color={item.estado === 'confirmada' ? 'success.600' : 
                   item.estado === 'pendiente' ? 'amber.600' : 'coolGray.400'}
              size="sm"
            />
          </Avatar>

          <VStack flex={1} space={1}>
            <HStack alignItems="center" space={2} mb={1}>
              <Icon 
                as={Ionicons} 
                name="calendar" 
                color={accentColor} 
                size="sm" 
              />
              <Text fontWeight="bold" fontSize="md">
                {formatDate(item.fecha)}
              </Text>
            </HStack>
            
            <HStack alignItems="center" space={2}>
              <Icon 
                as={MaterialIcons} 
                name="local-hospital" 
                color="coolGray.500" 
                size="xs" 
              />
              <Text color="coolGray.500" fontSize="sm">
                {item.especialidad}
              </Text>
            </HStack>
            
            <HStack alignItems="center" space={2} mt={1}>
              <Icon 
                as={Ionicons} 
                name="person" 
                color="coolGray.500" 
                size="xs" 
              />
              <Text color="coolGray.600" fontSize="sm">
                {item.nombreDoctor || "Médico por asignar"}
              </Text>
            </HStack>
          </VStack>
          
          <VStack alignItems="flex-end" space={2}>
            <Badge 
              colorScheme={getBadgeColorScheme(item.estado)} 
              rounded="full" 
              variant="solid"
              px={2}
              py={0.5}
            >
              {item.estado.charAt(0).toUpperCase() + item.estado.slice(1)}
            </Badge>
            
            <HStack space={1} alignItems="center">
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="primary"
                icon={<Icon as={Ionicons} name="information-circle" />}
                onPress={() => verDetalleCita(item)}
              />
              
              {item.estado !== 'cancelada' && (
                <IconButton
                  size="sm"
                  variant="ghost"
                  colorScheme="danger"
                  icon={<Icon as={Ionicons} name="close-circle" />}
                  onPress={() => mostrarDialogoCancelar(item)}
                />
              )}
            </HStack>
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );

  const renderSectionHeader = (fecha) => {
    const hoy = new Date();
    const esFechaFutura = fecha > hoy;
    
    return (
      <HStack 
        bg={esFechaFutura ? "primary.50" : "coolGray.100"} 
        p={2}
        rounded="lg"
        mb={2}
        mt={4}
        alignItems="center"
        space={2}
      >
        <Icon 
          as={Ionicons} 
          name={esFechaFutura ? "calendar" : "time"} 
          color={esFechaFutura ? accentColor : "coolGray.500"} 
          size="sm" 
        />
        <Text 
          color={esFechaFutura ? accentColor : "coolGray.600"} 
          fontWeight="bold"
        >
          {esFechaFutura ? "Próximas Citas" : "Citas Pasadas"}
        </Text>
      </HStack>
    );
  };

  const agruparCitasPorFecha = () => {
    const hoy = new Date();
    
    const citasFuturas = citas.filter(cita => cita.fecha > hoy && cita.estado !== 'cancelada');
    const citasPasadas = citas.filter(cita => cita.fecha <= hoy || cita.estado === 'cancelada');
    
    return (
      <>
        {citasFuturas.length > 0 && renderSectionHeader(new Date(Date.now() + 86400000))}
        {citasPasadas.length > 0 && renderSectionHeader(new Date(Date.now() - 86400000))}
      </>
    );
  };

  if (loading && !refreshing) {
    return (
      <Center flex={1} bg={cardBgColor}>
        <Spinner size="lg" color={accentColor} />
        <Text mt={2} color="coolGray.500">Cargando citas...</Text>
      </Center>
    );
  }

  return (
    <Box flex={1} bg={cardBgColor} safeArea p={4}>
      <VStack space={4} flex={1}>
        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="lg" color={accentColor}>
            Mis Citas
          </Heading>
        </HStack>
        
        <Divider />
        
        {citas.length > 0 ? (
          <FlatList
            data={citas}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#2B6CB0']}
              />
            }
            ListHeaderComponent={
              <Box py={2}>
                {agruparCitasPorFecha()}
              </Box>
            }
          />
        ) : (
          <Center flex={1}>
            <VStack space={5} alignItems="center" p={5}>
              <Icon
                as={Ionicons}
                name="calendar-outline"
                size="6xl"
                color="coolGray.300"
              />
              <Heading size="md" color="coolGray.500" textAlign="center">
                No tienes citas programadas
              </Heading>
              <Text color="coolGray.500" textAlign="center">
                Agenda tu primera cita médica para comenzar a cuidar tu salud
              </Text>
              <Button
                mt={6}
                colorScheme="primary"
                onPress={() => navigation.navigate('AgendarCita')}
                leftIcon={<Icon as={Ionicons} name="add-circle-outline" />}
                size="lg"
                rounded="full"
                shadow={2}
                _text={{ fontWeight: "bold" }}
              >
                Agendar una cita
              </Button>
            </VStack>
          </Center>
        )}
      </VStack>

      {/* Botón flotante para agendar */}
      {citas.length > 0 && (
        <Fab
          position="absolute"
          size="lg"
          icon={<Icon as={Ionicons} name="add" />}
          onPress={() => navigation.navigate('AgendarCita')}
          renderInPortal={false}
          shadow={2}
          colorScheme="primary"
          right={4}
          bottom={6}
        />
      )}

      {/* Diálogo de confirmación para cancelar cita */}
      <AlertDialog 
        leastDestructiveRef={cancelRef} 
        isOpen={isOpen} 
        onClose={onClose}
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
                onPress={onClose}
              >
                Volver
              </Button>
              <Button 
                colorScheme="danger" 
                onPress={cancelarCita}
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