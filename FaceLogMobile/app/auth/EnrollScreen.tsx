import React, { useRef, useState } from "react";
import { useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from '@react-navigation/native';

const API_BASE = "http://192.168.1.9:8000/api/v1";

export default function EnrollScreen() {
    const navigation = useNavigation<any>(); // get navigation instance
  const route = useRoute<any>();
const { employeeId } = route.params;
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);

  const captureAndEnroll = async () => {
    setLoading(true);
    try {
      if (!cameraRef.current) throw new Error("Camera not ready");

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6, base64: true });
      if (!photo?.base64) throw new Error("Capture failed");

      if (!employeeId) throw new Error("Employee ID missing. Please login first.");

      const res = await fetch(`${API_BASE}/enroll/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employee_id: employeeId,  
          image_base64: photo.base64,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Enrollment Failed", data?.message || "Server error");
      } else {
        Alert.alert("Success", data?.message || "Face enrolled successfully!");
        navigation.navigate('Dashboard', { employeeId: employeeId });

      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", (err as Error).message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (!permission || permission.status !== "granted") {
    return (
      <View style={styles.center}>
        <Text>Camera permission required</Text>
        <TouchableOpacity onPress={() => requestPermission()} style={styles.btn}>
          <Text style={{ color: "#fff" }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="front" />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.captureBtn} onPress={captureAndEnroll} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.captureText}>Enroll</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  controls: { position: "absolute", bottom: 30, left: 0, right: 0, alignItems: "center" },
  captureBtn: { backgroundColor: "#065f46", paddingVertical: 12, paddingHorizontal: 32, borderRadius: 10 },
  captureText: { color: "#fff", fontWeight: "700" },
  btn: { backgroundColor: "#065f46", padding: 10, borderRadius: 8, marginTop: 10 },
});
