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
import { RNCamera } from 'react-native-camera';
import { CameraView, useCameraPermissions, Camera } from 'expo-camera'; // Updated import
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = "http://192.168.1.9:8000/api/v1";

export default function CameraScreen() {
  const cameraRef = useRef<RNCamera>(null);
  const [permission, requestPermission] = useCameraPermissions();
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

  // Request camera permission on mount
  useEffect(() => {
    (async () => {
      if (!permission) await requestPermission();
    })();
  }, []);

  // Face detection callback
  const onFacesDetected = ({ faces }: { faces: any[] }) => {
    if (!faces || faces.length === 0) {
      faceHistoryRef.current = [];
      setLivenessOk(null);
      setReadyToCaptureCount(0);
      setStatusText('No face detected — align inside the oval');
      return;
    }

    // Choose largest face
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

      const threshold = Math.max(first.width, 20) * 0.08; // 8% of face width
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

  // Capture and send to backend
  const triggerCapture = async () => {
    setLoading(true);
    setStatusText('Capturing...');
    try {
      if (!cameraRef.current) throw new Error('Camera not ready');

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6, base64: true, skipProcessing: true });
      if (!photo?.base64) throw new Error('Capture failed');

      const token = await AsyncStorage.getItem('access_token');

      const res = await fetch(`${API_BASE}/attendance/clockin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          image_base64: photo.base64,
          device_id: 'mobile-device-1',
          liveness_score: livenessOk ? 0.9 : 0.2,
          status: attendanceStatus, // clock-in or clock-out
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

  // Permission screens
  if (!permission || permission.status === 'undetermined') {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (permission.status !== 'granted') {
    return (
      <View style={styles.center}>
        <Text>Camera permission is required.</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={() => requestPermission()}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.camera}
             type={RNCamera.Constants.Type.front}
        onFacesDetected={onFacesDetected}
        faceDetectionMode={RNCamera.Constants.FaceDetection.Mode.fast}
        faceDetectionLandmarks={RNCamera.Constants.FaceDetection.Landmarks.all}
        faceDetectionClassifications={RNCamera.Constants.FaceDetection.Classifications.none}      
      />

      {/* Oval overlay */}
      <View pointerEvents="none" style={styles.overlay}>
        <View style={styles.topShade} />
        <View style={styles.middleRow}>
          <View style={styles.sideShade} />
          <View style={styles.ovalContainer}>
            <View style={[styles.oval, livenessOk === true ? styles.ovalActive : null]} />
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }) as any,
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.sideShade} />
        </View>
        <View style={styles.bottomShade} />
      </View>

      {/* status box */}
      <View style={styles.statusBox}>
        <Text style={styles.statusText}>{statusText}</Text>
        <View style={styles.row}>
          <View
            style={[
              styles.livenessDot,
              livenessOk === true ? styles.dotOk : livenessOk === false ? styles.dotWarn : styles.dotIdle,
            ]}
          />
          <Text style={styles.smallText}>Liveness: {livenessOk === null ? 'checking' : livenessOk ? 'OK' : 'Move head'}</Text>
        </View>
      </View>

      {/* Attendance toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          onPress={() => setAttendanceStatus('clockin')}
          style={[styles.toggleBtn, attendanceStatus === 'clockin' && styles.toggleActive]}
        >
          <Text style={styles.toggleText}>Clock In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setAttendanceStatus('clockout')}
          style={[styles.toggleBtn, attendanceStatus === 'clockout' && styles.toggleActive]}
        >
          <Text style={styles.toggleText}>Clock Out</Text>
        </TouchableOpacity>
      </View>

      {/* manual capture */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.captureBtn} onPress={triggerCapture} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.captureText}>Capture</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'space-between' },
  topShade: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  bottomShade: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  middleRow: { height: 320, flexDirection: 'row', alignItems: 'center' },
  sideShade: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },

  ovalContainer: { width: 300, height: 320, alignItems: 'center', justifyContent: 'center' },
  oval: { width: 260, height: 300, borderRadius: 260 / 2, borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)', backgroundColor: 'transparent' },
  ovalActive: { borderColor: '#10b981' },

  progressContainer: { position: 'absolute', bottom: 18, left: 20, right: 20, height: 6, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 6, overflow: 'hidden' },
  progressBar: { height: 6, backgroundColor: '#10b981' },

  statusBox: { position: 'absolute', left: 16, right: 16, top: 48, padding: 12, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.95)' },
  statusText: { fontWeight: '700', color: '#0f172a' },
  smallText: { color: '#374151', marginLeft: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  livenessDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  dotIdle: { backgroundColor: '#f97316' },
  dotOk: { backgroundColor: '#10b981' },
  dotWarn: { backgroundColor: '#f59e0b' },

  controls: { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' },
  captureBtn: { backgroundColor: '#065f46', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 10 },
  captureText: { color: '#fff', fontWeight: '700' },

  permissionBtn: { marginTop: 12, backgroundColor: '#065f46', padding: 10, borderRadius: 8 },
  permissionBtnText: { color: '#fff', fontWeight: '700' },

  toggleRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, position: 'absolute', bottom: 100, width: '100%' },
  toggleBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, backgroundColor: '#374151', marginHorizontal: 10 },
  toggleActive: { backgroundColor: '#065f46' },
  toggleText: { color: '#fff', fontWeight: '700' },
});