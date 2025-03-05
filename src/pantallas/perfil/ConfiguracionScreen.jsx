import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  ScrollView,
  FormControl,
  Input,
  Button,
  Heading,
  TextArea,
  Select,
  CheckIcon,
  HStack,
  Text,
  useToast,
  IconButton,
  Icon,
  Divider,
  KeyboardAvoidingView,
  Pressable,
  Modal,
  Spinner,
  useColorModeValue
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../servicios/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const ConfiguracionScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    fechaNacimiento: '',
    direccion: '',
    alergias: '',
    enfermedadesCronicas: '',
    tipoSangre: '',
    biografia: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const toast = useToast();

  // Colores dinámicos para modo claro/oscuro
  const bgColor = useColorModeValue("white", "coolGray.800");
  const cardBgColor = useColorModeValue("coolGray.50", "coolGray.700");
  const inputBgColor = useColorModeValue("coolGray.50", "coolGray.700");
  const textColor = useColorModeValue("coolGray.800", "warmGray.50");
  const accentColor = "#2B6CB0"; // Color primario

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Verificar si hay un usuario autenticado
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        navigation.replace('LoginScreen');
        return;
      }

      // Obtener datos actualizados de Firestore
      const userDoc = await getDoc(doc(db, "usuarios", currentUser.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        
        // Inicializar formulario con datos existentes
        setForm({
          nombre: data.nombre || '',
          telefono: data.telefono || '',
          fechaNacimiento: data.fechaNacimiento || '',
          direccion: data.direccion || '',
          alergias: data.alergias ? data.alergias.join(', ') : '',
          enfermedadesCronicas: data.enfermedadesCronicas ? data.enfermedadesCronicas.join(', ') : '',
          tipoSangre: data.tipoSangre || '',
          biografia: data.biografia || ''
        });
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
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

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        toast.show({
          title: "Error",
          description: "No se encontró sesión de usuario",
          status: "error"
        });
        return;
      }
      
      // Validar datos
      if (!form.nombre.trim()) {
        toast.show({
          title: "Información requerida",
          description: "Por favor ingresa tu nombre completo",
          status: "warning"
        });
        setSaving(false);
        return;
      }
      
      // Procesar datos para actualizar
      const updateData = {
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        fechaNacimiento: form.fechaNacimiento.trim(),
        direccion: form.direccion.trim(),
        biografia: form.biografia.trim(),
        tipoSangre: form.tipoSangre,
        // Convertir strings separados por comas a arrays
        alergias: form.alergias ? form.alergias.split(',').map(item => item.trim()).filter(item => item) : [],
        enfermedadesCronicas: form.enfermedadesCronicas ? form.enfermedadesCronicas.split(',').map(item => item.trim()).filter(item => item) : [],
        updatedAt: new Date()
      };
      
      // Actualizar en Firestore
      const userRef = doc(db, "usuarios", currentUser.uid);
      await updateDoc(userRef, updateData);
      
      // Actualizar en AsyncStorage
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const newData = { ...parsedData, ...updateData };
        await AsyncStorage.setItem('userData', JSON.stringify(newData));
      }
      
      toast.show({
        title: "Cambios guardados",
        description: "Tu perfil ha sido actualizado correctamente",
        status: "success",
        duration: 3000
      });
      
      // Volver a la pantalla de perfil
      navigation.goBack();
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      toast.show({
        title: "Error",
        description: "No se pudieron guardar los cambios. Inténtalo de nuevo.",
        status: "error",
        duration: 4000
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (field, value) => {
    setForm(prevForm => ({
      ...prevForm,
      [field]: value
    }));
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    navigation.goBack();
  };

  if (loading) {
    return (
      <Box flex={1} p={4} justifyContent="center" alignItems="center" bg={bgColor}>
        <Heading size="md" mb={4} color={textColor}>Cargando información...</Heading>
        <Spinner size="lg" color={accentColor} />
      </Box>
    );
  }

  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      bg={bgColor}
    >
      <Box flex={1} safeArea bg={bgColor}>
        <Box flexDirection="row" alignItems="center" p={4} borderBottomWidth={1} borderBottomColor="coolGray.200">
          <IconButton
            icon={<Icon as={Ionicons} name="arrow-back" size="sm" color={textColor} />}
            onPress={handleCancel}
            variant="ghost"
            _pressed={{ bg: "coolGray.100" }}
          />
          <Heading size="md" ml={2} color={textColor}>Editar Perfil</Heading>
        </Box>
        
        <ScrollView flex={1} p={4} showsVerticalScrollIndicator={false}>
          <VStack space={5} mb={5}>
            <Heading size="sm" color="coolGray.600">
              Información Personal
            </Heading>
            
            <FormControl isRequired>
              <FormControl.Label _text={{bold: true, color: textColor}}>Nombre completo</FormControl.Label>
              <Input
                placeholder="Tu nombre completo"
                value={form.nombre}
                onChangeText={(value) => handleFormChange('nombre', value)}
                bg={inputBgColor}
                p={3}
                fontSize="md"
                borderRadius="lg"
                _focus={{ borderColor: accentColor, bg: inputBgColor }}
              />
            </FormControl>
            
            <FormControl>
              <FormControl.Label _text={{bold: true, color: textColor}}>Teléfono</FormControl.Label>
              <Input
                placeholder="Tu número de teléfono"
                value={form.telefono}
                onChangeText={(value) => handleFormChange('telefono', value)}
                keyboardType="phone-pad"
                bg={inputBgColor}
                p={3}
                fontSize="md"
                borderRadius="lg"
                _focus={{ borderColor: accentColor, bg: inputBgColor }}
              />
            </FormControl>
            
            <FormControl>
              <FormControl.Label _text={{bold: true, color: textColor}}>Fecha de nacimiento</FormControl.Label>
              <Input
                placeholder="DD/MM/AAAA"
                value={form.fechaNacimiento}
                onChangeText={(value) => handleFormChange('fechaNacimiento', value)}
                bg={inputBgColor}
                p={3}
                fontSize="md"
                borderRadius="lg"
                _focus={{ borderColor: accentColor, bg: inputBgColor }}
              />
              <FormControl.HelperText>
                Formato: DD/MM/AAAA
              </FormControl.HelperText>
            </FormControl>
            
            <FormControl>
              <FormControl.Label _text={{bold: true, color: textColor}}>Dirección</FormControl.Label>
              <TextArea
                placeholder="Tu dirección completa"
                value={form.direccion}
                onChangeText={(value) => handleFormChange('direccion', value)}
                autoCompleteType={undefined}
                bg={inputBgColor}
                p={3}
                fontSize="md"
                borderRadius="lg"
                h={20}
                _focus={{ borderColor: accentColor, bg: inputBgColor }}
              />
            </FormControl>
            
            <FormControl>
              <FormControl.Label _text={{bold: true, color: textColor}}>Biografía</FormControl.Label>
              <TextArea
                placeholder="Cuéntanos sobre ti"
                value={form.biografia}
                onChangeText={(value) => handleFormChange('biografia', value)}
                autoCompleteType={undefined}
                bg={inputBgColor}
                p={3}
                fontSize="md"
                borderRadius="lg"
                h={24}
                _focus={{ borderColor: accentColor, bg: inputBgColor }}
              />
            </FormControl>
            
            <Divider my={2} />
            
            <Heading size="sm" color="coolGray.600" mt={2}>
              Información Médica
            </Heading>
            
            <FormControl>
              <FormControl.Label _text={{bold: true, color: textColor}}>Tipo de sangre</FormControl.Label>
              <Select
                selectedValue={form.tipoSangre}
                accessibilityLabel="Elige tu tipo de sangre"
                placeholder="Selecciona tu tipo de sangre"
                _selectedItem={{
                  bg: "primary.100",
                  endIcon: <CheckIcon size="5" color={accentColor} />
                }}
                onValueChange={(value) => handleFormChange('tipoSangre', value)}
                bg={inputBgColor}
                p={3}
                fontSize="md"
                borderRadius="lg"
                _focus={{ borderColor: accentColor }}
              >
                <Select.Item label="A+" value="A+" />
                <Select.Item label="A-" value="A-" />
                <Select.Item label="B+" value="B+" />
                <Select.Item label="B-" value="B-" />
                <Select.Item label="AB+" value="AB+" />
                <Select.Item label="AB-" value="AB-" />
                <Select.Item label="O+" value="O+" />
                <Select.Item label="O-" value="O-" />
              </Select>
            </FormControl>
            
            <FormControl>
              <FormControl.Label _text={{bold: true, color: textColor}}>Alergias</FormControl.Label>
              <TextArea
                placeholder="Alergias separadas por coma"
                value={form.alergias}
                onChangeText={(value) => handleFormChange('alergias', value)}
                autoCompleteType={undefined}
                bg={inputBgColor}
                p={3}
                fontSize="md"
                borderRadius="lg"
                h={20}
                _focus={{ borderColor: accentColor, bg: inputBgColor }}
              />
              <FormControl.HelperText>
                Ejemplo: Penicilina, Látex, Maní
              </FormControl.HelperText>
            </FormControl>
            
            <FormControl>
              <FormControl.Label _text={{bold: true, color: textColor}}>Enfermedades crónicas</FormControl.Label>
              <TextArea
                placeholder="Enfermedades separadas por coma"
                value={form.enfermedadesCronicas}
                onChangeText={(value) => handleFormChange('enfermedadesCronicas', value)}
                autoCompleteType={undefined}
                bg={inputBgColor}
                p={3}
                fontSize="md"
                borderRadius="lg"
                h={20}
                _focus={{ borderColor: accentColor, bg: inputBgColor }}
              />
              <FormControl.HelperText>
                Ejemplo: Diabetes, Hipertensión, Asma
              </FormControl.HelperText>
            </FormControl>
          </VStack>
        </ScrollView>
        
        <Box p={4} borderTopWidth={1} borderTopColor="coolGray.200">
          <HStack space={3}>
            <Button
              flex={1}
              onPress={handleCancel}
              variant="outline"
              colorScheme="coolGray"
              _text={{ color: "coolGray.600" }}
              borderRadius="lg"
            >
              Cancelar
            </Button>
            <Button
              flex={1}
              onPress={handleSaveChanges}
              bg={accentColor}
              _pressed={{ bg: "primary.700" }}
              isLoading={saving}
              isLoadingText="Guardando"
              borderRadius="lg"
            >
              Guardar
            </Button>
          </HStack>
        </Box>
        
        {/* Modal de confirmación para cancelar */}
        <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)}>
          <Modal.Content maxWidth="90%">
            <Modal.CloseButton />
            <Modal.Header>Descartar cambios</Modal.Header>
            <Modal.Body>
              <Text>¿Estás seguro de que quieres descartar los cambios? Los datos no guardados se perderán.</Text>
            </Modal.Body>
            <Modal.Footer>
              <Button.Group space={2}>
                <Button 
                  variant="ghost" 
                  colorScheme="coolGray" 
                  onPress={() => setShowCancelModal(false)}
                >
                  Seguir editando
                </Button>
                <Button 
                  colorScheme="danger" 
                  onPress={confirmCancel}
                >
                  Descartar
                </Button>
              </Button.Group>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </Box>
    </KeyboardAvoidingView>
  );
};