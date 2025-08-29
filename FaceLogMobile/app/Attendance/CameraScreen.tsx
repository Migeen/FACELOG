import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = "http://192.168.1.9:8000/api/v1";

export default function CameraScreen() {
  const cameraRef = useRef<any>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [livenessOk, setLivenessOk] = useState<boolean | null>(null);
  const [statusText, setStatusText] = useState('Align your face inside the oval');
  const faceHistoryRef = useRef<Array<{ x: number; y: number; width: number; height: number; t: number }>>([]);
  const [readyToCaptureCount, setReadyToCaptureCount] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const [attendanceStatus, setAttendanceStatus] = useState<'clockin' | 'clockout'>('clockin');

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progress, {
      toValue: Math.min(readyToCaptureCount / 3, 1),
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [readyToCaptureCount]);

  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const onFacesDetected = ({ faces }: { faces: any[] }) => {
    if (!faces || faces.length === 0) {
      faceHistoryRef.current = [];
      setLivenessOk(null);
      setReadyToCaptureCount(0);
      setStatusText('No face detected — align inside the oval');
      return;
    }

    const face = faces.reduce((p, c) => (c.bounds.size.width > p.bounds.size.width ? c : p), faces[0]);
    const { origin, size } = face.bounds;
    const faceCenterX = origin.x + size.width / 2;
    const faceCenterY = origin.y + size.height / 2;
    const now = Date.now();

    faceHistoryRef.current.push({ x: faceCenterX, y: faceCenterY, width: size.width, height: size.height, t: now });
    faceHistoryRef.current = faceHistoryRef.current.filter((item) => now - item.t <= 1500);

    setStatusText('Face detected. Checking liveness...');

    const history = faceHistoryRef.current;
    if (history.length >= 3) {
      const first = history[0];
      const last = history[history.length - 1];
      const dx = Math.abs(last.x - first.x);
      const dy = Math.abs(last.y - first.y);
      const movement = Math.hypot(dx, dy);
      const threshold = Math.max(first.width, 20) * 0.08;

      if (movement >= threshold) {
        setLivenessOk(true);
        setStatusText('Liveness confirmed. Capturing shortly...');
        setReadyToCaptureCount((prev) => Math.min(prev + 1, 3));
      } else {
        setLivenessOk(false);
        setStatusText('Please move your head slightly for liveness');
        setReadyToCaptureCount(0);
      }
    } else {
      setLivenessOk(null);
      setStatusText('Hold steady... making liveness check');
      setReadyToCaptureCount(0);
    }

    if (readyToCaptureCount >= 3 && !loading) {
      triggerCapture();
    }
  };

  const triggerCapture = async () => {
    setLoading(true);
    setStatusText('Capturing...');
    try {
      if (!cameraRef.current) throw new Error('Camera not ready');

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6, base64: true });
      if (!photo?.base64) throw new Error('Capture failed');

      const token = await AsyncStorage.getItem('access_token');

      const res = await fetch(`${API_BASE}/attendance/${attendanceStatus}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          image_base64: photo.base64,
          device_id: 'mobile-device-1',
          liveness_score: livenessOk ? 0.9 : 0.2,
          status: attendanceStatus,
        }),
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
      setReadyToCaptureCount(0);
      faceHistoryRef.current = [];
      setLivenessOk(null);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>Camera permission is required.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type="front"
      />

      {/* The rest of your overlays, status box, progress bar, toggles remain unchanged */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
