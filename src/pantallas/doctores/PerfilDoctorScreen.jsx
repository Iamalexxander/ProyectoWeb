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
  Spinner,
  Center,
  Badge,
  useToast,
  Pressable,
  IconButton,
  useColorModeValue,
  Flex,
  Spacer,
  AspectRatio,
  Image,
  Stack,
  FlatList,
} from 'native-base';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { Platform, Share } from 'react-native';

// Sample doctor data
const sampleDoctores = [
  {
    id: "1",
    nombre: "Dra. Ana García",
    titulo: "Dra.",
    especialidad: "Cardiología",
    valoracion: 4.8,
    numValoraciones: 124,
    destacado: true,
    disponible: true,
    servicios: ["Ecocardiograma", "Holter", "Consulta general"],
    proximasCitas: "Hoy, 14:30",
    formacion: "Universidad Nacional de Medicina (2008-2014)",
    experiencia: "8+ años en cardiología intervencionista y diagnóstica",
    licencia: "No. CMN-12345 - Colegio Médico Nacional",
    sobreMi: "Especialista en diagnóstico y tratamiento de enfermedades cardiovasculares. Mi enfoque es preventivo y educativo, brindando atención personalizada a cada paciente.",
    direccion: "Centro Médico Especialistas - Av. Principal #123, Ciudad",
    horarios: {
      "Lunes": "9:00 AM - 5:00 PM",
      "Martes": "9:00 AM - 5:00 PM",
      "Miércoles": "9:00 AM - 5:00 PM",
      "Jueves": "9:00 AM - 5:00 PM",
      "Viernes": "9:00 AM - 3:00 PM",
      "Sábado": "9:00 AM - 12:00 PM",
      "Domingo": "No disponible"
    }
  },
  {
    id: "2",
    nombre: "Dr. Martín López",
    titulo: "Dr.",
    especialidad: "Dermatología",
    valoracion: 4.5,
    numValoraciones: 98,
    destacado: true,
    disponible: false,
    servicios: ["Biopsias", "Tratamientos láser", "Cirugía dermatológica"],
    proximasCitas: "Mañana, 10:00",
    formacion: "Universidad Autónoma de Medicina (2005-2011)",
    experiencia: "10+ años en dermatología clínica y estética",
    licencia: "No. CMD-54321 - Colegio Médico Nacional",
    sobreMi: "Dermatólogo especializado en tratamientos contra el acné, dermatitis y procedimientos estéticos mínimamente invasivos. Mi objetivo es ayudar a mis pacientes a tener una piel saludable y radiante.",
    direccion: "Instituto Dermatológico - Calle Central #45, Ciudad",
    horarios: {
      "Lunes": "8:00 AM - 4:00 PM",
      "Martes": "8:00 AM - 4:00 PM",
      "Miércoles": "No disponible",
      "Jueves": "8:00 AM - 4:00 PM",
      "Viernes": "8:00 AM - 2:00 PM",
      "Sábado": "8:00 AM - 12:00 PM",
      "Domingo": "No disponible"
    }
  }
];

// Sample reviews data
const sampleResenas = [
  {
    id: "r1",
    doctorId: "1",
    nombrePaciente: "Laura Morales",
    valoracion: 5,
    comentario: "Excelente atención, muy profesional y amable. Me explicó detalladamente mi condición y las opciones de tratamiento.",
    fecha: { toDate: () => new Date(2024, 2, 15) }
  },
  {
    id: "r2",
    doctorId: "1",
    nombrePaciente: "Carlos Ruiz",
    valoracion: 4,
    comentario: "Buen médico, aunque tuve que esperar un poco más de lo esperado. El diagnóstico fue acertado.",
    fecha: { toDate: () => new Date(2024, 1, 28) }
  },
  {
    id: "r3",
    doctorId: "2",
    nombrePaciente: "María Jiménez",
    valoracion: 5,
    comentario: "El mejor dermatólogo que he visitado. Resolvió mi problema en la primera consulta después de varios intentos fallidos con otros médicos.",
    fecha: { toDate: () => new Date(2024, 2, 10) }
  }
];

export const PerfilDoctorScreen = ({ route, navigation }) => {
  const { doctorId } = route.params;
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resenas, setResenas] = useState([]);
  const [loadingResenas, setLoadingResenas] = useState(false);
  const [mostrarTodasResenas, setMostrarTodasResenas] = useState(false);
  const toast = useToast();
  
  // Colores dinámicos para modo claro/oscuro
  const bgColor = useColorModeValue("white", "coolGray.800");
  const textColor = useColorModeValue("coolGray.800", "warmGray.50");
  const cardBgColor = useColorModeValue("warmGray.50", "coolGray.700");
  const accentColor = "#2B6CB0"; // Color primario de la app

  useEffect(() => {
    cargarDatosDoctor();
  }, [doctorId]);
  
  useEffect(() => {
    if (doctorData) {
      cargarResenas();
    }
  }, [doctorData, mostrarTodasResenas]);

  const cargarDatosDoctor = async () => {
    try {
      setLoading(true);
      
      // En lugar de Firebase, usar datos de ejemplo
      const doctor = sampleDoctores.find(doc => doc.id === doctorId);
      
      if (doctor) {
        setDoctorData(doctor);
      } else {
        toast.show({
          title: "Error",
          description: "No se encontró información del doctor",
          status: "error",
          placement: "top"
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error al cargar datos del doctor:", error);
      toast.show({
        title: "Error",
        description: "No se pudo cargar la información del doctor",
        status: "error",
        placement: "top"
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarResenas = async () => {
    try {
      setLoadingResenas(true);
      
      // Filtrar reseñas del doctor actual
      const resenasDoctor = sampleResenas.filter(resena => resena.doctorId === doctorId);
      const resenasAMostrar = mostrarTodasResenas ? resenasDoctor : resenasDoctor.slice(0, 3);
      
      setResenas(resenasAMostrar);
    } catch (error) {
      console.error("Error al cargar reseñas:", error);
    } finally {
      setLoadingResenas(false);
    }
  };

  const compartirPerfil = async () => {
    try {
      await Share.share({
        message: `Te recomiendo al Dr. ${doctorData?.nombre || 'Profesional'}, especialista en ${doctorData?.especialidad || 'medicina'}. ¡Agenda tu cita ahora!`,
        title: `Dr. ${doctorData?.nombre || 'Profesional'}`
      });
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  const handleAgendarCita = () => {
    navigation.navigate('AgendarCita', { doctorId: doctorId, doctorData });
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

  if (loading) {
    return (
      <Center flex={1} bg={bgColor}>
        <Spinner size="lg" color={accentColor} />
        <Text mt={2} color="coolGray.500">Cargando información del doctor...</Text>
      </Center>
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
            left={4} 
            zIndex={1}
          >
            <IconButton
              icon={<Icon as={Ionicons} name="arrow-back" />}
              borderRadius="full"
              bg="white:alpha.70"
              _pressed={{ bg: "white:alpha.90" }}
              onPress={() => navigation.goBack()}
            />
          </Box>
          
          <Box 
            position="absolute" 
            top={4} 
            right={4} 
            zIndex={1}
          >
            <IconButton
              icon={<Icon as={Ionicons} name="share-social" />}
              borderRadius="full"
              bg="white:alpha.70"
              _pressed={{ bg: "white:alpha.90" }}
              onPress={compartirPerfil}
            />
          </Box>
          
          <Center 
            position="absolute" 
            bottom={-50} 
            left={0} 
            right={0}
          >
            <Avatar 
              size="xl"
              source={doctorData?.photoURL ? { uri: doctorData.photoURL } : null} 
              borderWidth={4}
              borderColor={bgColor}
              background={accentColor}
            >
              {doctorData?.nombre?.charAt(0) || "D"}
            </Avatar>
          </Center>
        </Box>
        
        {/* Información principal */}
        <VStack space={4} p={6} pt={16} mt={8}>
          <VStack alignItems="center" space={1}>
            <Heading size="lg" textAlign="center">
              {doctorData?.titulo || 'Dr.'} {doctorData?.nombre || 'Profesional de la Salud'}
            </Heading>
            
            <Badge 
              colorScheme="primary" 
              variant="solid"
              rounded="full" 
              px={3} 
              py={1}
              _text={{ fontWeight: "medium" }}
            >
              {doctorData?.especialidad || 'Médico General'}
            </Badge>
            
            {doctorData?.valoracion && (
              <HStack alignItems="center" space={2} mt={2}>
                {renderEstrellas(doctorData.valoracion)}
                <Text fontSize="md" fontWeight="medium" color={textColor}>
                  {doctorData.valoracion.toFixed(1)} ({doctorData.numValoraciones || 0})
                </Text>
              </HStack>
            )}
          </VStack>
          
          {/* Tarjetas de información rápida */}
          <HStack space={3} mt={4} justifyContent="center">
            <Pressable 
              flex={1} 
              onPress={() => {/* Acción de contacto */}}
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
                  name="call" 
                  size="md" 
                  color={accentColor}
                  mb={1}
                />
                <Text textAlign="center" fontWeight="medium">Contactar</Text>
              </Box>
            </Pressable>
            
            <Pressable 
              flex={1} 
              onPress={handleAgendarCita}
            >
              <Box 
                p={3} 
                bg={accentColor} 
                rounded="lg"
                shadow={1}
                alignItems="center"
              >
                <Icon 
                  as={Ionicons} 
                  name="calendar" 
                  size="md" 
                  color="white"
                  mb={1}
                />
                <Text textAlign="center" fontWeight="medium" color="white">Agendar</Text>
              </Box>
            </Pressable>
            
            <Pressable 
              flex={1} 
              onPress={() => {/* Acción de favorito */}}
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
                  name="heart-outline" 
                  size="md" 
                  color={accentColor}
                  mb={1}
                />
                <Text textAlign="center" fontWeight="medium">Favorito</Text>
              </Box>
            </Pressable>
          </HStack>
          
          <Divider my={4} />
          
          {/* Información profesional */}
          <Box
            bg={cardBgColor}
            rounded="xl"
            shadow={2}
            p={4}
          >
            <Heading size="md" mb={4}>Información profesional</Heading>
            
            <VStack space={4}>
              <HStack space={4} alignItems="flex-start">
                <Center 
                  bg="primary.100"
                  p={2}
                  rounded="md"
                >
                  <Icon 
                    as={FontAwesome5} 
                    name="graduation-cap" 
                    size="md" 
                    color={accentColor}
                  />
                </Center>
                <VStack flex={1}>
                  <Text fontWeight="bold" fontSize="md">Formación</Text>
                  <Text color="coolGray.600" mt={1}>
                    {doctorData?.formacion || 'Universidad Nacional de Medicina (2005-2011)'}
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
                    name="briefcase" 
                    size="md" 
                    color={accentColor}
                  />
                </Center>
                <VStack flex={1}>
                  <Text fontWeight="bold" fontSize="md">Experiencia</Text>
                  <Text color="coolGray.600" mt={1}>
                    {doctorData?.experiencia || '10+ años de experiencia profesional en hospitales públicos y clínicas privadas'}
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
                    as={MaterialIcons} 
                    name="verified-user" 
                    size="md" 
                    color={accentColor}
                  />
                </Center>
                <VStack flex={1}>
                  <Text fontWeight="bold" fontSize="md">Licencia Médica</Text>
                  <Text color="coolGray.600" mt={1}>
                    {doctorData?.licencia || 'No. 12345678 - Colegio Médico Nacional'}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </Box>
          
          {/* Sobre mí */}
          <Box
            bg={cardBgColor}
            rounded="xl"
            shadow={2}
            p={4}
            mt={4}
          >
            <Heading size="md" mb={3}>Sobre mí</Heading>
            <Text color="coolGray.600" lineHeight="lg">
              {doctorData?.sobreMi || 'Soy un profesional comprometido con el bienestar de mis pacientes, dedicando tiempo a escuchar sus necesidades y brindando un tratamiento integral. Mi objetivo es asegurar que cada paciente reciba la mejor atención médica posible, combinando conocimientos actualizados con un trato humano y cálido.'}
            </Text>
          </Box>
          
          {/* Horarios y disponibilidad */}
          {doctorData?.horarios && (
            <Box
              bg={cardBgColor}
              rounded="xl"
              shadow={2}
              p={4}
              mt={4}
            >
              <Heading size="md" mb={4}>Horarios de atención</Heading>
              <VStack space={2} divider={<Divider />}>
                {Object.entries(doctorData.horarios).map(([dia, horario], index) => (
                  <HStack key={`horario-${index}`} justifyContent="space-between" py={1}>
                    <Text fontWeight="medium">{dia}</Text>
                    <Text
                      color={horario.includes("No disponible") ? "gray.400" : "coolGray.600"}
                    >
                      {horario}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}
          
          {/* Reseñas de pacientes */}
          <Box
            bg={cardBgColor}
            rounded="xl"
            shadow={2}
            p={4}
            mt={4}
          >
            <HStack justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="md">Opiniones de pacientes</Heading>
              {resenas.length > 0 && (
                <Pressable onPress={() => setMostrarTodasResenas(!mostrarTodasResenas)}>
                  <Text color={accentColor} fontWeight="medium">
                    {mostrarTodasResenas ? "Ver menos" : "Ver todas"}
                  </Text>
                </Pressable>
              )}
            </HStack>
            
            {loadingResenas ? (
              <Center p={4}>
                <Spinner color={accentColor} />
              </Center>
            ) : resenas.length > 0 ? (
              <VStack space={3} divider={<Divider />}>
                {resenas.map((resena, index) => (
                  <Box key={`resena-${index}`}>
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack space={2} alignItems="center">
                        <Avatar 
                          size="sm" 
                          bg="primary.200"
                        >
                          {resena.nombrePaciente?.charAt(0) || "P"}
                        </Avatar>
                        <Text fontWeight="medium">{resena.nombrePaciente || "Paciente anónimo"}</Text>
                      </HStack>
                      <Text fontSize="xs" color="coolGray.500">
                        {resena.fecha ? new Date(resena.fecha.toDate()).toLocaleDateString() : ""}
                      </Text>
                    </HStack>
                    
                    <HStack space={1} mt={1} mb={2}>
                      {renderEstrellas(resena.valoracion)}
                    </HStack>
                    
                    <Text color="coolGray.600">
                      {resena.comentario || "Excelente profesional, muy recomendado."}
                    </Text>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Center p={4}>
                <Text color="coolGray.500" textAlign="center">
                  Este doctor aún no tiene reseñas.
                </Text>
              </Center>
            )}
          </Box>
          
          {/* Especialidades y servicios */}
          <Box
            bg={cardBgColor}
            rounded="xl"
            shadow={2}
            p={4}
            mt={4}
          >
            <Heading size="md" mb={4}>Servicios ofrecidos</Heading>
            
            <VStack space={2}>
              {(doctorData?.servicios || [
                "Consulta general",
                "Seguimiento de tratamientos",
                "Revisión de exámenes",
                "Certificados médicos",
                "Recetas médicas"
              ]).map((servicio, index) => (
                <HStack key={`servicio-${index}`} space={2} alignItems="center">
                  <Icon 
                    as={Ionicons} 
                    name="checkmark-circle" 
                    size="sm" 
                    color={accentColor}
                  />
                  <Text>{servicio}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
          
          {/* Ubicación */}
          <Box
            bg={cardBgColor}
            rounded="xl"
            shadow={2}
            p={4}
            mt={4}
            mb={6}
          >
            <Heading size="md" mb={3}>Ubicación</Heading>
            
            <Box 
              rounded="md" 
              h={180} 
              bg="gray.300" 
              mb={3} 
              justifyContent="center"
              alignItems="center"
            >
              <Icon 
                as={Ionicons}
                name="map"
                size="4xl"
                color="gray.400"
              />
            </Box>
            
            <Text color="coolGray.600">
              {doctorData?.direccion || "Centro Médico Especializado - Av. Principal #123, Ciudad"}
            </Text>
          </Box>
          
          {/* Botón de agendar cita */}
          <Button
            size="lg"
            mt={2}
            mb={8}
            bg={accentColor}
            shadow={3}
            _pressed={{ bg: "primary.700" }}
            borderRadius="full"
            leftIcon={<Icon as={Ionicons} name="calendar-outline" size="sm" />}
            onPress={handleAgendarCita}
          >
            Agendar cita ahora
          </Button>
        </VStack>
      </ScrollView>
    </Box>
  );
};