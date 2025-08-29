// app/Attendance/CameraScreen.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const API_BASE = "http://192.168.1.9:8000/api/v1";

// Add the sendDailySummary function here
const sendDailySummary = async (employeeId: number) => {
  try {
    const lastInStr = await AsyncStorage.getItem(`lastCheckIn-${employeeId}`);
    const lastOutStr = await AsyncStorage.getItem(`lastCheckOut-${employeeId}`);

    if (!lastInStr || !lastOutStr) return; // skip if any time missing

    const lastIn = new Date(Number(lastInStr));
    const lastOut = new Date(Number(lastOutStr));
    const totalMinutes = Math.floor((lastOut.getTime() - lastIn.getTime()) / 60000);

    // Today's date in YYYY-MM-DD
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayDate = `${yyyy}-${mm}-${dd}`;

    // Weekday name
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayWeekday = weekdays[today.getDay()];

    const payload = {
      employee_id: employeeId,
      date: todayDate,
      weekday: todayWeekday,
      last_checkin: lastIn.toISOString(),
      last_checkout: lastOut.toISOString(),
      total_hours_today: totalMinutes / 60, // Convert to hours
    };

    const token = await AsyncStorage.getItem('access_token');
    const res = await fetch(`${API_BASE}/reports/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error('Error sending daily summary', data);
    } else {
      console.log('Daily summary sent successfully');
    }
  } catch (err) {
    console.error('Error sending daily summary', err);
  }
};

function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const route = useRoute<any>();
  const router = useRouter();
  const { employeeId, attendanceStatus } = route.params;
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('Position your face in the center and tap to capture');

  const takePicture = async () => {
    setLoading(true);
    setStatusText('Capturing...');
    try {
      if (!cameraRef.current) throw new Error('Camera not ready');
      if (!employeeId) throw new Error('EmployeeId not Found');

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6, base64: true });
      if (!photo?.base64) throw new Error('Capture failed');

      const token = await AsyncStorage.getItem('access_token');

      const formData = new FormData();
      formData.append("employee_id", String(employeeId));
      formData.append("file", {
        uri: photo.uri,
        name: "attendance.jpg",
        type: "image/jpeg",
      } as any);

      const res = await fetch(`${API_BASE}/attendance/${attendanceStatus}`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        Alert.alert('Attendance failed', data?.message || 'Face not recognized');
        setStatusText('Attendance failed. Try again.');
      } else {
        // Store attendance in AsyncStorage
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (attendanceStatus === 'clockin') {
          await AsyncStorage.setItem(`lastCheckIn-${employeeId}`, String(Date.now()));
        } else {
          await AsyncStorage.setItem(`lastCheckOut-${employeeId}`, String(Date.now()));
          
          // Call sendDailySummary after successful check-out
          sendDailySummary(employeeId);
        }

        Alert.alert('Success', data.message || 'Attendance recorded');
        router.back(); // navigate back to CheckInOutScreen
      }
    } catch (err) {
      Alert.alert('Error', (err as Error).message || 'Unknown error');
      setStatusText('Capture failed. Try again.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setStatusText('Position your face in the center and tap to capture');
      }, 3000);
    }
  };

  // Rest of your component remains the same...
  if (!permission) return (
    <View style={styles.center}>
      <ActivityIndicator />
      <Text style={{ marginTop: 8 }}>Loading camera permissions...</Text>
    </View>
  );

  if (!permission.granted) return (
    <View style={styles.center}>
      <Text style={{ textAlign: 'center', marginBottom: 16 }}>
        Camera permission is required for attendance
      </Text>
      <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
        <Text style={styles.permissionButtonText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="front" />
      <View style={styles.faceGuide}><View style={styles.faceOval} /></View>

      <View style={styles.overlay}>
        <Text style={styles.statusText}>{statusText}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.captureButton, loading && styles.captureButtonDisabled]}
            onPress={takePicture}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : (
              <Text style={styles.captureButtonText}>
                {attendanceStatus === 'clockin' ? 'Clock In' : 'Clock Out'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Your styles remain the same...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permissionButton: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  permissionButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  faceGuide: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -100 }, { translateY: -140 }], width: 200, height: 280, justifyContent: 'center', alignItems: 'center' },
  faceOval: { width: 200, height: 280, borderRadius: 100, borderWidth: 3, borderColor: '#00FF00', backgroundColor: 'transparent' },
  overlay: { position: 'absolute', bottom: 50, left: 20, right: 20, alignItems: 'center' },
  statusText: { color: 'white', fontSize: 16, textAlign: 'center', marginBottom: 20, backgroundColor: 'rgba(0,0,0,0.6)', padding: 12, borderRadius: 8, minHeight: 44 },
  buttonContainer: { width: '100%', alignItems: 'center', gap: 15 },
  captureButton: { backgroundColor: '#FF3B30', width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  captureButtonDisabled: { backgroundColor: 'rgba(255, 59, 48, 0.5)' },
  captureButtonText: { color: 'white', fontSize: 14, fontWeight: '600', textAlign: 'center' },
});

export default CameraScreen;