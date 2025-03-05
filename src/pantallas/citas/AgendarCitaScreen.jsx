import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  FormControl, 
  Input, 
  Text, 
  Button, 
  Select, 
  TextArea, 
  ScrollView, 
  useToast, 
  Heading, 
  Icon, 
  Divider,
  Spinner,
  Center,
  Pressable,
  Modal,
  useColorModeValue,
  IconButton,
  Badge
} from 'native-base';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../servicios/firebase';

// Sample data for doctors (mismo que en ListaDoctoresScreen)
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

export const AgendarCitaScreen = ({ navigation, route }) => {
  const doctorId = route.params?.doctorId;
  const doctorData = route.params?.doctorData;
  
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [especialidad, setEspecialidad] = useState(doctorData?.especialidad || "");
  const [notas, setNotas] = useState("");
  const [doctores, setDoctores] = useState([]);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(doctorId || "");
  const [loading, setLoading] = useState(false);
  const [loadingDoctores, setLoadingDoctores] = useState(false);
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [mostrarTimePicker, setMostrarTimePicker] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [citaCreada, setCitaCreada] = useState(null);

  // Colores dinámicos
  const bgColor = useColorModeValue("white", "coolGray.800");
  const cardBgColor = useColorModeValue("coolGray.50", "coolGray.700");
  const accentColor = "primary.600";
  const textColor = useColorModeValue("coolGray.800", "warmGray.50");

  const toast = useToast();

  const especialidades = [
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

  useEffect(() => {
    if (especialidad) {
      obtenerDoctores();
    }
  }, [especialidad]);

  useEffect(() => {
    if (doctorId && doctorData) {
      setEspecialidad(doctorData.especialidad || "");
      setDoctorSeleccionado(doctorId);
    }
  }, [doctorId, doctorData]);

  const obtenerDoctores = async () => {
    try {
      setLoadingDoctores(true);
      
      // Si ya tenemos un doctor preseleccionado desde la ruta, mantenerlo
      if (!doctorId) {
        setDoctorSeleccionado("");
      }

      // Filtrar doctores por especialidad usando los datos de muestra
      const doctoresFiltrados = sampleDoctores.filter(
        doctor => doctor.especialidad === especialidad
      );
      
      setDoctores(doctoresFiltrados);
    } catch (error) {
      console.error("Error al obtener doctores:", error);
      toast.show({
        title: "Error",
        description: "No se pudieron cargar los doctores disponibles",
        status: "error",
        duration: 3000,
        isClosable: true,
        placement: "top"
      });
    } finally {
      setLoadingDoctores(false);
    }
  };

  const onChangeFecha = (event, selectedDate) => {
    const currentDate = selectedDate || fecha;
    setMostrarDatePicker(Platform.OS === 'ios');
    setFecha(currentDate);
  };

  const onChangeHora = (event, selectedTime) => {
    const currentTime = selectedTime || hora;
    setMostrarTimePicker(Platform.OS === 'ios');
    setHora(currentTime);
  };

  const crearCita = async () => {
    try {
      if (!especialidad) {
        toast.show({
          title: "Error",
          description: "Selecciona una especialidad",
          status: "error",
          duration: 3000,
          isClosable: true,
          placement: "top"
        });
        return;
      }

      if (!doctorSeleccionado && doctores.length > 0) {
        toast.show({
          title: "Error",
          description: "Selecciona un doctor",
          status: "error",
          duration: 3000,
          isClosable: true,
          placement: "top"
        });
        return;
      }

      setLoading(true);

      // Combinar fecha y hora
      const fechaHora = new Date(fecha);
      fechaHora.setHours(hora.getHours());
      fechaHora.setMinutes(hora.getMinutes());

      // Verificar que la fecha no sea en el pasado
      if (fechaHora < new Date()) {
        toast.show({
          title: "Error",
          description: "No puedes agendar citas en el pasado",
          status: "error",
          duration: 3000,
          isClosable: true,
          placement: "top"
        });
        setLoading(false);
        return;
      }

      // Verificar que el usuario esté autenticado
      const usuario = auth.currentUser;
      if (!usuario) {
        toast.show({
          title: "Error",
          description: "Debes iniciar sesión para agendar una cita",
          status: "error",
          duration: 3000,
          isClosable: true,
          placement: "top"
        });
        setLoading(false);
        return;
      }

      // Obtener el doctor seleccionado
      const doctorInfo = doctores.find(d => d.id === doctorSeleccionado) || doctorData;

      // Crear la cita en Firestore
      const citaData = {
        idPaciente: usuario.uid,
        emailPaciente: usuario.email,
        nombrePaciente: usuario.displayName || "Paciente",
        idDoctor: doctorSeleccionado,
        nombreDoctor: doctorInfo?.nombre || "Doctor por asignar",
        especialidad: especialidad,
        fecha: fechaHora,
        notas: notas,
        estado: "pendiente",
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "citas"), citaData);
      
      // Guardar la cita creada con su ID
      setCitaCreada({
        id: docRef.id,
        ...citaData
      });

      // Mostrar confirmación
      setLoading(false);
      setIsOpen(true);
      
    } catch (error) {
      console.error("Error al agendar cita:", error);
      toast.show({
        title: "Error",
        description: "No se pudo agendar la cita. Intenta de nuevo más tarde.",
        status: "error",
        duration: 3000,
        isClosable: true,
        placement: "top"
      });
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    navigation.navigate("MisCitas");
  };

  const resetForm = () => {
    setFecha(new Date());
    setHora(new Date());
    setEspecialidad("");
    setDoctorSeleccionado("");
    setNotas("");
    setIsOpen(false);
    setCitaCreada(null);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <Box flex={1} bg={cardBgColor} safeArea>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack space={5} p={5}>
          <HStack alignItems="center" space={2}>
            <IconButton
              icon={<Icon as={Ionicons} name="arrow-back" size="sm" color={accentColor} />}
              variant="ghost"
              borderRadius="full"
              onPress={() => navigation.goBack()}
            />
            <Heading size="lg" color={accentColor}>
              Agendar Cita
            </Heading>
          </HStack>
          
          <Divider />
          
          <Box bg={bgColor} rounded="xl" shadow={2} p={5}>
            <VStack space={4}>
              <FormControl isRequired>
                <FormControl.Label _text={{ fontWeight: "bold" }}>
                  <HStack space={2} alignItems="center">
                    <Icon 
                      as={MaterialIcons} 
                      name="local-hospital" 
                      color={accentColor} 
                      size="sm" 
                    />
                    <Text fontWeight="bold">Especialidad</Text>
                  </HStack>
                </FormControl.Label>
                <Select
                  placeholder="Selecciona una especialidad"
                  selectedValue={especialidad}
                  onValueChange={value => setEspecialidad(value)}
                  accessibilityLabel="Elige una especialidad"
                  bg={bgColor}
                  variant="rounded"
                  size="lg"
                  _selectedItem={{
                    bg: "primary.100",
                    endIcon: <Icon as={Ionicons} name="checkmark" size="sm" />
                  }}
                >
                  {especialidades.map((esp) => (
                    <Select.Item key={esp} label={esp} value={esp} />
                  ))}
                </Select>
              </FormControl>
              
              {especialidad && (
                <FormControl>
                  <FormControl.Label _text={{ fontWeight: "bold" }}>
                    <HStack space={2} alignItems="center">
                      <Icon 
                        as={Ionicons} 
                        name="person" 
                        color={accentColor} 
                        size="sm" 
                      />
                      <Text fontWeight="bold">Doctor</Text>
                    </HStack>
                  </FormControl.Label>
                  {loadingDoctores ? (
                    <Center p={2}>
                      <Spinner color={accentColor} />
                    </Center>
                  ) : doctores.length > 0 ? (
                    <Select
                      placeholder="Selecciona un doctor"
                      selectedValue={doctorSeleccionado}
                      onValueChange={value => setDoctorSeleccionado(value)}
                      accessibilityLabel="Elige un doctor"
                      bg={bgColor}
                      variant="rounded"
                      size="lg"
                      _selectedItem={{
                        bg: "primary.100",
                        endIcon: <Icon as={Ionicons} name="checkmark" size="sm" />
                      }}
                      isDisabled={!!doctorId && !!doctorData}
                    >
                      {doctores.map((doctor) => (
                        <Select.Item 
                          key={doctor.id} 
                          label={doctor.nombre} 
                          value={doctor.id} 
                        />
                      ))}
                    </Select>
                  ) : (
                    <Box p={3} bg="coolGray.100" rounded="lg">
                      <HStack space={2} alignItems="center">
                        <Icon 
                          as={Ionicons} 
                          name="information-circle" 
                          color="coolGray.500" 
                          size="sm"
                        />
                        <Text color="coolGray.500" fontSize="sm">
                          No hay doctores disponibles para esta especialidad
                        </Text>
                      </HStack>
                    </Box>
                  )}
                </FormControl>
              )}
            </VStack>
          </Box>
          
          <Box bg={bgColor} rounded="xl" shadow={2} p={5} mt={2}>
            <VStack space={4}>
              <FormControl isRequired>
                <FormControl.Label _text={{ fontWeight: "bold" }}>
                  <HStack space={2} alignItems="center">
                    <Icon 
                      as={Ionicons} 
                      name="calendar" 
                      color={accentColor} 
                      size="sm" 
                    />
                    <Text fontWeight="bold">Fecha</Text>
                  </HStack>
                </FormControl.Label>
                <Pressable
                  onPress={() => setMostrarDatePicker(true)}
                  borderWidth={1}
                  borderColor="coolGray.200"
                  borderRadius="lg"
                  p={4}
                  bg={bgColor}
                >
                  <HStack alignItems="center" justifyContent="space-between">
                    <Text fontSize="md">
                      {formatDate(fecha)}
                    </Text>
                    <Icon as={Ionicons} name="calendar-outline" size="sm" color={accentColor} />
                  </HStack>
                </Pressable>
                {mostrarDatePicker && (
                  <DateTimePicker
                    value={fecha}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onChangeFecha}
                    minimumDate={new Date()}
                  />
                )}
              </FormControl>
              
              <FormControl isRequired>
                <FormControl.Label _text={{ fontWeight: "bold" }}>
                  <HStack space={2} alignItems="center">
                    <Icon 
                      as={Ionicons} 
                      name="time" 
                      color={accentColor} 
                      size="sm" 
                    />
                    <Text fontWeight="bold">Hora</Text>
                  </HStack>
                </FormControl.Label>
                <Pressable
                  onPress={() => setMostrarTimePicker(true)}
                  borderWidth={1}
                  borderColor="coolGray.200"
                  borderRadius="lg"
                  p={4}
                  bg={bgColor}
                >
                  <HStack alignItems="center" justifyContent="space-between">
                    <Text fontSize="md">
                      {formatTime(hora)}
                    </Text>
                    <Icon as={Ionicons} name="time-outline" size="sm" color={accentColor} />
                  </HStack>
                </Pressable>
                {mostrarTimePicker && (
                  <DateTimePicker
                    value={hora}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onChangeHora}
                  />
                )}
              </FormControl>
              
              <FormControl>
                <FormControl.Label _text={{ fontWeight: "bold" }}>
                  <HStack space={2} alignItems="center">
                    <Icon 
                      as={Ionicons} 
                      name="document-text" 
                      color={accentColor} 
                      size="sm" 
                    />
                    <Text fontWeight="bold">Notas adicionales</Text>
                  </HStack>
                </FormControl.Label>
                <TextArea
                  h={20}
                  placeholder="Describe brevemente el motivo de tu cita"
                  value={notas}
                  onChangeText={setNotas}
                  autoCompleteType={undefined}
                  bg={bgColor}
                  borderRadius="lg"
                  fontSize="md"
                />
              </FormControl>
            </VStack>
          </Box>
          
          <VStack space={3} mt={4}>
            <Button
              colorScheme="primary"
              onPress={crearCita}
              isLoading={loading}
              isLoadingText="Agendando cita"
              leftIcon={<Icon as={Ionicons} name="calendar-check-outline" size="sm" />}
              rounded="full"
              shadow={3}
              size="lg"
              _text={{ fontSize: "md", fontWeight: "bold" }}
            >
              Agendar Cita
            </Button>
            
            <Button
              variant="subtle"
              colorScheme="coolGray"
              onPress={() => navigation.goBack()}
              leftIcon={<Icon as={Ionicons} name="arrow-back-outline" size="sm" />}
              rounded="full"
            >
              Cancelar
            </Button>
          </VStack>
        </VStack>
      </ScrollView>

      {/* Modal de confirmación */}
      <Modal isOpen={isOpen} onClose={closeModal}>
        <Modal.Content maxWidth="350" borderRadius="2xl">
          <Modal.CloseButton />
          <Modal.Body p={6}>
            <VStack space={5} alignItems="center">
              <Icon 
                as={Ionicons} 
                name="checkmark-circle" 
                color="success.500" 
                size="5xl" 
              />
              
              <Heading size="md" textAlign="center">
                ¡Cita Agendada!
              </Heading>
              
              <Text textAlign="center" color="coolGray.600">
                Tu cita ha sido agendada exitosamente. Se te notificará cuando el doctor confirme.
              </Text>
              
              <Box bg="coolGray.50" w="full" p={4} rounded="lg">
                <VStack space={2}>
                  <HStack alignItems="center" space={2}>
                    <Icon as={Ionicons} name="medical" color={accentColor} size="sm" />
                    <Text fontWeight="medium">Especialidad:</Text>
                    <Text>{especialidad}</Text>
                  </HStack>
                  
                  <HStack alignItems="center" space={2}>
                    <Icon as={Ionicons} name="calendar" color={accentColor} size="sm" />
                    <Text fontWeight="medium">Fecha:</Text>
                    <Text>{formatDate(fecha)}</Text>
                  </HStack>
                  
                  <HStack alignItems="center" space={2}>
                    <Icon as={Ionicons} name="time" color={accentColor} size="sm" />
                    <Text fontWeight="medium">Hora:</Text>
                    <Text>{formatTime(hora)}</Text>
                  </HStack>
                  
                  {doctorSeleccionado && (doctores.length > 0 || doctorData) && (
                    <HStack alignItems="center" space={2}>
                      <Icon as={Ionicons} name="person" color={accentColor} size="sm" />
                      <Text fontWeight="medium">Doctor:</Text>
                      <Text>
                        {doctorData?.nombre || 
                          (doctores.find(d => d.id === doctorSeleccionado)?.nombre || "")}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Box>
            </VStack>
          </Modal.Body>
          <Modal.Footer borderTopWidth={0} bg="transparent">
            <Button.Group space={2} w="full">
              <Button
                flex={1}
                variant="ghost"
                colorScheme="primary"
                onPress={resetForm}
                rounded="full"
              >
                Agendar otra
              </Button>
              <Button
                flex={1}
                colorScheme="primary"
                onPress={closeModal}
                rounded="full"
              >
                Ver mis citas
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Box>
  );
};