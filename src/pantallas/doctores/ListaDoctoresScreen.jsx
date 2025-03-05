import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  FlatList,
  Text,
  Heading,
  Avatar,
  Icon,
  Input,
  Pressable,
  Badge,
  Spinner,
  Center,
  Divider,
  useToast,
  Button,
  IconButton,
  Flex,
  Select,
  Spacer,
  useColorModeValue,
  ScrollView,
  SectionList,
  StatusBar,
  Image
} from 'native-base';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import { RefreshControl } from 'react-native';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../servicios/firebase';
import { useFocusEffect } from '@react-navigation/native';

// Sample data for doctors (to avoid Firebase dependency for demonstration)
const sampleDoctores = [
  {
    id: "1",
    nombre: "Dra. Ana García",
    especialidad: "Cardiología",
    valoracion: 4.8,
    numValoraciones: 124,
    destacado: true,
    disponible: true,
    servicios: ["Ecocardiograma", "Holter", "Consulta general"],
    proximasCitas: "Hoy, 14:30"
  },
  {
    id: "2",
    nombre: "Dr. Martín López",
    especialidad: "Dermatología",
    valoracion: 4.5,
    numValoraciones: 98,
    destacado: true,
    disponible: false,
    servicios: ["Biopsias", "Tratamientos láser", "Cirugía dermatológica"],
    proximasCitas: "Mañana, 10:00"
  },
  {
    id: "3",
    nombre: "Dr. Roberto Sánchez",
    especialidad: "Medicina General",
    valoracion: 4.9,
    numValoraciones: 213,
    destacado: true,
    disponible: true,
    servicios: ["Consulta general", "Certificados médicos", "Vacunación"],
    proximasCitas: "Hoy, 16:00"
  },
  {
    id: "4",
    nombre: "Dra. Carolina Martínez",
    especialidad: "Pediatría",
    valoracion: 4.7,
    numValoraciones: 156,
    destacado: false,
    disponible: true,
    servicios: ["Control de niño sano", "Vacunación", "Urgencias pediátricas"],
    proximasCitas: "Hoy, 15:30"
  },
  {
    id: "5",
    nombre: "Dr. Juan Ramírez",
    especialidad: "Traumatología",
    valoracion: 4.6,
    numValoraciones: 78,
    destacado: false,
    disponible: false,
    servicios: ["Fracturas", "Rehabilitación", "Cirugía ortopédica"],
    proximasCitas: "Viernes, 09:00"
  },
  {
    id: "6",
    nombre: "Dra. Lucía Hernández",
    especialidad: "Ginecología",
    valoracion: 4.9,
    numValoraciones: 187,
    destacado: true,
    disponible: true,
    servicios: ["Control prenatal", "Papanicolaou", "Colposcopía"],
    proximasCitas: "Mañana, 11:30"
  },
  {
    id: "7",
    nombre: "Dr. Eduardo Flores",
    especialidad: "Oftalmología",
    valoracion: 4.4,
    numValoraciones: 91,
    destacado: false,
    disponible: true,
    servicios: ["Examen visual", "Cirugía refractiva", "Tratamiento de glaucoma"],
    proximasCitas: "Jueves, 10:00"
  },
  {
    id: "8",
    nombre: "Dra. Sofía Vargas",
    especialidad: "Neurología",
    valoracion: 4.8,
    numValoraciones: 65,
    destacado: false,
    disponible: false,
    servicios: ["Electroencefalograma", "Tratamiento de migrañas", "Estudios del sueño"],
    proximasCitas: "Lunes próximo"
  },
  {
    id: "9",
    nombre: "Dr. Miguel Ángel Rivas",
    especialidad: "Psiquiatría",
    valoracion: 4.7,
    numValoraciones: 113,
    destacado: false,
    disponible: true,
    servicios: ["Terapia", "Diagnóstico", "Tratamiento farmacológico"],
    proximasCitas: "Hoy, 18:00"
  },
  {
    id: "10",
    nombre: "Dra. Patricia González",
    especialidad: "Odontología",
    valoracion: 4.6,
    numValoraciones: 142,
    destacado: true,
    disponible: true,
    servicios: ["Limpieza dental", "Endodoncia", "Ortodoncia"],
    proximasCitas: "Mañana, 09:30"
  }
];

export const ListaDoctoresScreen = ({ navigation }) => {
  const [doctores, setDoctores] = useState([]);
  const [doctoresFiltrados, setDoctoresFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [especialidadFiltro, setEspecialidadFiltro] = useState('');
  const [doctoresDestacados, setDoctoresDestacados] = useState([]);
  
  const toast = useToast();
  
  // Colores para modo claro/oscuro
  const bgColor = useColorModeValue("coolGray.50", "coolGray.900");
  const cardBgColor = useColorModeValue("white", "coolGray.800");
  const textColor = useColorModeValue("coolGray.800", "warmGray.50");
  const accentColor = "#2B6CB0"; // Color primario de la app

  const especialidades = [
    "Todas",
    "Medicina General",
    "Cardiología",
    "Dermatología",
    "Ginecología",
    "Pediatría",
    "Oftalmología",
    "Odontología",
    "Traumatología",
    "Neurología",
    "Psiquiatría"
  ];

  useFocusEffect(
    useCallback(() => {
      cargarDoctores();
    }, [])
  );

  useEffect(() => {
    aplicarFiltros();
  }, [busqueda, especialidadFiltro, doctores]);

  const cargarDoctores = async () => {
    try {
      setLoading(true);
      
      // Usar datos de ejemplo en lugar de Firebase para la demostración
      setDoctores(sampleDoctores);
      
      // Doctores destacados
      const destacados = sampleDoctores.filter(doc => doc.destacado);
      setDoctoresDestacados(destacados.length > 0 ? destacados : sampleDoctores.slice(0, 5));
      
    } catch (error) {
      console.error("Error al cargar doctores:", error);
      toast.show({
        title: "Error",
        description: "No se pudieron cargar los doctores",
        status: "error",
        placement: "top"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarDoctores();
  };

  const aplicarFiltros = () => {
    let resultado = [...doctores];
    
    // Filtrar por búsqueda de texto
    if (busqueda) {
      resultado = resultado.filter(
        doctor => 
          doctor.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
          doctor.especialidad?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    
    // Filtrar por especialidad
    if (especialidadFiltro && especialidadFiltro !== "Todas") {
      resultado = resultado.filter(
        doctor => doctor.especialidad === especialidadFiltro
      );
    }
    
    setDoctoresFiltrados(resultado);
  };

  const verPerfilDoctor = (doctorId) => {
    navigation.navigate('PerfilDoctor', { doctorId });
  };

  const renderEstrellas = (valoracion) => {
    const estrellas = [];
    const val = valoracion || 0;
    
    for (let i = 1; i <= 5; i++) {
      estrellas.push(
        <Icon 
          key={`star-${i}`}
          as={Ionicons} 
          name={i <= val ? "star" : i - 0.5 <= val ? "star-half" : "star-outline"} 
          size="xs" 
          color="amber.500" 
        />
      );
    }
    
    return (
      <HStack space={1}>
        {estrellas}
      </HStack>
    );
  };

  const renderDoctorItem = ({ item }) => (
    <Pressable
      onPress={() => verPerfilDoctor(item.id)}
      mb={3}
    >
      <Box
        bg={cardBgColor}
        rounded="lg"
        shadow={2}
        overflow="hidden"
        p={0}
      >
        <HStack space={3} p={3} alignItems="center">
          <Avatar
            size="md"
            source={item.photoURL ? { uri: item.photoURL } : null}
            bg="primary.600"
          >
            {item.nombre?.charAt(0) || "D"}
          </Avatar>
          
          <VStack flex={1}>
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="sm" maxW="70%">
                {item.nombre || "Doctor"}
              </Heading>
              
              {item.destacado && (
                <Badge
                  colorScheme="amber"
                  variant="solid"
                  rounded="md"
                  _text={{ fontWeight: "bold", fontSize: "2xs" }}
                >
                  DESTACADO
                </Badge>
              )}
            </HStack>
            
            <Text fontSize="xs" color="coolGray.500" mt={0.5}>
              {item.especialidad || "Especialidad no especificada"}
            </Text>
            
            <HStack alignItems="center" space={1} mt={1}>
              {renderEstrellas(item.valoracion)}
              <Text fontSize="xs" color="coolGray.500">
                ({item.numValoraciones || 0})
              </Text>
            </HStack>
            
            {item.proximasCitas && (
              <HStack alignItems="center" space={1} mt={2}>
                <Icon 
                  as={Ionicons} 
                  name="calendar-outline" 
                  size="xs" 
                  color="primary.600" 
                />
                <Text fontSize="xs" color="primary.600">
                  Próxima disponibilidad: {item.proximasCitas}
                </Text>
              </HStack>
            )}
          </VStack>
          
          <IconButton
            icon={<Icon as={Ionicons} name="chevron-forward" />}
            borderRadius="full"
            variant="ghost"
            _icon={{
              color: "coolGray.400"
            }}
          />
        </HStack>
        
        {/* Servicios o etiquetas */}
        {item.servicios && item.servicios.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            p={2}
            bg="coolGray.50"
          >
            <HStack space={2} px={1}>
              {(item.servicios.slice(0, 3)).map((servicio, index) => (
                <Badge
                  key={`service-${index}`}
                  variant="subtle"
                  colorScheme="primary"
                  rounded="full"
                  px={2}
                  py={0.5}
                >
                  {servicio}
                </Badge>
              ))}
              {item.servicios.length > 3 && (
                <Badge 
                  variant="outline" 
                  rounded="full"
                  px={2}
                  py={0.5}
                >
                  +{item.servicios.length - 3} más
                </Badge>
              )}
            </HStack>
          </ScrollView>
        )}
      </Box>
    </Pressable>
  );

  const renderDoctorDestacado = ({ item }) => (
    <Pressable
      onPress={() => verPerfilDoctor(item.id)}
      mr={3}
      w={160}
    >
      <Box
        bg={cardBgColor}
        rounded="lg"
        overflow="hidden"
        shadow={1}
      >
        <Box position="relative">
          <Center w="100%" h={120} bg="primary.100">
            <Avatar
              size="lg"
              source={item.photoURL ? { uri: item.photoURL } : null}
              bg="primary.600"
            >
              {item.nombre?.charAt(0) || "D"}
            </Avatar>
          </Center>
          
          {item.disponible && (
            <Badge
              colorScheme="success"
              rounded="full"
              position="absolute"
              top={2}
              right={2}
              px={2}
              _text={{ fontSize: "2xs" }}
            >
              Disponible hoy
            </Badge>
          )}
        </Box>
        
        <VStack p={3} space={1}>
          <Text fontWeight="bold" numberOfLines={1}>
            {item.nombre || "Doctor"}
          </Text>
          
          <Text fontSize="xs" color="coolGray.500" numberOfLines={1}>
            {item.especialidad || "Especialidad"}
          </Text>
          
          <HStack alignItems="center" space={1} mt={1}>
            {renderEstrellas(item.valoracion)}
          </HStack>
        </VStack>
      </Box>
    </Pressable>
  );

  const renderEncabezado = () => (
    <Box px={4} pt={4} pb={2}>
      <VStack space={4}>
        {/* Encabezado */}
        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="lg" color={textColor}>
            Doctores
          </Heading>
          
          <IconButton
            icon={<Icon as={Ionicons} name="options-outline" size="sm" />}
            borderRadius="full"
            variant="solid"
            bg="primary.600"
            _pressed={{ bg: "primary.700" }}
          />
        </HStack>
        
        {/* Buscador */}
        <Input
          placeholder="Buscar doctor o especialidad"
          variant="filled"
          bg={useColorModeValue("white", "coolGray.800")}
          borderRadius="full"
          py={3}
          px={4}
          InputLeftElement={
            <Icon
              as={Ionicons}
              name="search"
              color="coolGray.400"
              size="sm"
              ml={3}
            />
          }
          value={busqueda}
          onChangeText={setBusqueda}
        />
        
        {/* Filtro por especialidad */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <HStack space={2} py={1}>
            {especialidades.map((esp, index) => (
              <Pressable
                key={`especialidad-${index}`}
                onPress={() => setEspecialidadFiltro(esp === "Todas" ? "" : esp)}
              >
                <Box
                  bg={especialidadFiltro === esp || (esp === "Todas" && !especialidadFiltro) 
                    ? accentColor 
                    : "coolGray.100"}
                  px={4}
                  py={2}
                  rounded="full"
                >
                  <Text
                    color={especialidadFiltro === esp || (esp === "Todas" && !especialidadFiltro)
                      ? "white"
                      : "coolGray.800"}
                    fontWeight="medium"
                    fontSize="sm"
                  >
                    {esp}
                  </Text>
                </Box>
              </Pressable>
            ))}
          </HStack>
        </ScrollView>
        
        {/* Doctores destacados */}
        {doctoresDestacados.length > 0 && (
          <VStack space={3} mt={2}>
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="sm" color={textColor}>
                Doctores destacados
              </Heading>
              <Pressable onPress={() => {}}>
                <Text color="primary.600" fontWeight="medium">
                  Ver todos
                </Text>
              </Pressable>
            </HStack>
            
            <FlatList
              horizontal
              data={doctoresDestacados}
              renderItem={renderDoctorDestacado}
              keyExtractor={item => `destacado-${item.id}`}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <Box w={3} />}
              contentContainerStyle={{ paddingVertical: 8 }}
            />
          </VStack>
        )}
        
        {/* Título de lista principal */}
        <HStack justifyContent="space-between" alignItems="center" mt={2}>
          <Heading size="sm" color={textColor}>
            Todos los doctores
          </Heading>
          <Text color="coolGray.500" fontSize="xs">
            {doctoresFiltrados.length} {doctoresFiltrados.length === 1 ? "doctor" : "doctores"}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );

  if (loading && !refreshing) {
    return (
      <Box flex={1} bg={bgColor} safeArea>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <Center flex={1}>
          <Spinner size="lg" color={accentColor} />
          <Text mt={2} color="coolGray.500">Cargando doctores...</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box flex={1} bg={bgColor} safeArea>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {doctoresFiltrados.length > 0 ? (
        <FlatList
          data={doctoresFiltrados}
          renderItem={renderDoctorItem}
          keyExtractor={(item) => `doctor-${item.id}`}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          ListHeaderComponent={renderEncabezado}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[accentColor]}
            />
          }
        />
      ) : (
        <FlatList
          data={[]}
          ListHeaderComponent={renderEncabezado}
          contentContainerStyle={{ padding: 16, paddingTop: 0, flexGrow: 1 }}
          ListEmptyComponent={
            <Center flex={1} p={10}>
              <Icon
                as={AntDesign}
                name="search1"
                size="5xl"
                color="coolGray.300"
                mb={4}
              />
              <Text color="coolGray.500" textAlign="center" fontSize="md">
                No se encontraron doctores con los criterios de búsqueda.
              </Text>
              <Button
                mt={6}
                leftIcon={<Icon as={Ionicons} name="refresh" size="sm" />}
                onPress={() => {
                  setBusqueda('');
                  setEspecialidadFiltro('');
                }}
              >
                Limpiar filtros
              </Button>
            </Center>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[accentColor]}
            />
          }
        />
      )}
      
      {/* Botón flotante para agendar */}
      <Button
        position="absolute"
        bottom={6}
        right={6}
        size="lg"
        rounded="full"
        bg={accentColor}
        shadow={4}
        _pressed={{ bg: "primary.700" }}
        leftIcon={<Icon as={Ionicons} name="add" size="sm" />}
        onPress={() => navigation.navigate('AgendarCita')}
      >
        Agendar cita
      </Button>
    </Box>
  );
};