import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { NativeBaseProvider } from 'native-base';
import { auth } from './src/servicios/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { MisCitasScreen } from './src/pantallas/citas/MisCitasScreen';
import { ListaDoctoresScreen } from './src/pantallas/doctores/ListaDoctoresScreen';
import { PerfilDoctorScreen } from './src/pantallas/doctores/PerfilDoctorScreen';
import { AgendarCitaScreen } from './src/pantallas/citas/AgendarCitaScreen';
import { PerfilUsuarioScreen } from './src/pantallas/perfil/PerfilUsuarioScreen';
import { ConfiguracionScreen } from './src/pantallas/perfil/ConfiguracionScreen';
import { LoginScreen } from './src/pantallas/auth/LoginScreen';
import { RecuperarPassword } from './src/pantallas/auth/RecuperarPassword';
import { RegistroScreen } from './src/pantallas/auth/RegistroScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AuthStack = createStackNavigator();

// Stack Navigator for Auth screens
function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Registro" component={RegistroScreen} />
      <AuthStack.Screen name="RecuperarPassword" component={RecuperarPassword} />
    </AuthStack.Navigator>
  );
}

// Stack Navigator para la sección de Doctores
function DoctoresStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2B6CB0',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ListaDoctores" 
        component={ListaDoctoresScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="PerfilDoctor" 
        component={PerfilDoctorScreen} 
        options={{ title: "Perfil del Doctor" }} 
      />
    </Stack.Navigator>
  );
}

// Stack Navigator for main app with profile screens
function PerfilStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="PerfilUsuario" component={PerfilUsuarioScreen} />
      <Stack.Screen name="ConfiguracionScreen" component={ConfiguracionScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="MainTabs" component={RootTabs} />
      <Stack.Screen name="ConfiguracionScreen" component={ConfiguracionScreen} />
    </Stack.Navigator>
  );
}

function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'MisCitas') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Doctores') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'AgendarCita') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2B6CB0',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
        },
      })}
    >
      <Tab.Screen 
        name="MisCitas" 
        component={MisCitasScreen} 
        options={{ title: "Mis Citas" }} 
      />
      <Tab.Screen 
        name="Doctores" 
        component={DoctoresStack} 
        options={{ title: "Doctores", headerShown: false }} 
      />
      <Tab.Screen 
        name="AgendarCita" 
        component={AgendarCitaScreen} 
        options={{ title: "Agendar" }} 
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilStack} 
        options={{ title: "Mi Perfil" }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Handle user state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  if (initializing) return null;

  return (
    <NativeBaseProvider>
      <NavigationContainer>
        {user ? <MainStack /> : <AuthStackNavigator />}
      </NavigationContainer>
    </NativeBaseProvider>
  );
}