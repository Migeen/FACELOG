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

const API_BASE = "http://192.168.1.9:8000/api/v1";

function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const route = useRoute<any>();
  const { employeeId } = route.params;
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('Position your face in the center and tap to capture');
  const [attendanceStatus, setAttendanceStatus] = useState<'clockin' | 'clockout'>('clockin');

  console.log(employeeId);

  const takePicture = async () => {
    setLoading(true);
    setStatusText('Capturing...');
    try {
      if (!cameraRef.current) throw new Error('Camera not ready');
      if(!employeeId) throw new Error('EmployeeId not Found');

      const photo = await cameraRef.current.takePictureAsync({ 
        quality: 0.6, 
        base64: true 
      });
      
      if (!photo?.base64) throw new Error('Capture failed');

      const token = await AsyncStorage.getItem('access_token');

        const formData = new FormData();
    formData.append("employee_id", String(employeeId));
    formData.append("file", {
      uri: photo.uri,
      name: "attendance.jpg",
      type: "image/jpeg",
    } as any);

      const res = await fetch(`${API_BASE}/attendance/clockin`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Attendance error', data);
        Alert.alert('Attendance failed', data?.message || 'Server error');
        setStatusText('Attendance failed. Try again.');
      } else {
        if (data.success) {
          setStatusText(`${attendanceStatus === 'clockin' ? 'Clocked in' : 'Clocked out'} successfully!`);
          Alert.alert('Success', data.message || 'Attendance recorded');
        } else {
          setStatusText('Not recognized. Try again.');
          Alert.alert('Not recognized', data.message || 'Face not matched');
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', (err as Error).message || 'Unknown error');
      setStatusText('Capture failed. Try again.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setStatusText('Position your face in the center and tap to capture');
      }, 3000);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ textAlign: 'center', marginBottom: 16 }}>
          Camera permission is required for attendance
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.front}
        onFacesDetected={onFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.Constants.Mode.fast,
          detectLandmarks: FaceDetector.Constants.Landmarks.all,
          runClassifications: FaceDetector.Constants.Classifications.none,
        }}
      />

      {/* The rest of your overlays, status box, progress bar, toggles remain unchanged */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  camera: { 
    flex: 1 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  faceGuide: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -140 }],
    width: 200,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceOval: {
    width: 200,
    height: 280,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#00FF00',
    backgroundColor: 'transparent',
  },
  overlay: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 8,
    minHeight: 44,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  toggleButton: {
    backgroundColor: 'rgba(0,122,255,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  captureButton: {
    backgroundColor: '#FF3B30',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    backgroundColor: 'rgba(255, 59, 48, 0.5)',
  },
  captureButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CameraScreen;