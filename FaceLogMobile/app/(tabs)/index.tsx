import LoginScreen from '../auth/LoginScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../DashboardScreen';
import EnrollScreen from '../auth/EnrollScreen';
import CameraScreen from '../Attendance/CameraScreen';
const Stack = createNativeStackNavigator();

export default function HomeScreen() {
  return (

    <Stack.Navigator initialRouteName="Login"> 
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Enroll" component={EnrollScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
    </Stack.Navigator>
  );
}
