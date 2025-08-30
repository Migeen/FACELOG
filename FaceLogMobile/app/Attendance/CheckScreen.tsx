// app/Attendance/CheckInOutScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AttendanceStatus = 'checkedin' | 'checkedout' | 'notchecked';
const API_BASE = "http://192.168.1.9:8000/api/v1";


export default function CheckInOutScreen() {
  const router = useRouter();
  const route = useRoute<any>();
  const { employeeId } = route.params;

  const [currentStatus, setCurrentStatus] = useState<AttendanceStatus>('notchecked');
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [lastCheckOut, setLastCheckOut] = useState<string | null>(null);
  const [hoursToday, setHoursToday] = useState<string>('0h 0m');

  // Load attendance from AsyncStorage on screen focus
  useFocusEffect(
    useCallback(() => {
      const fetchAttendance = async () => {
        const lastIn = await AsyncStorage.getItem(`lastCheckIn-${employeeId}`);
        const lastOut = await AsyncStorage.getItem(`lastCheckOut-${employeeId}`);

        setLastCheckIn(lastIn || null);
        setLastCheckOut(lastOut || null);


        if (lastIn && lastOut) {
          const inTime = new Date(Number(lastIn));
          const outTime = new Date(Number(lastOut));

          const diffMinutes = Math.floor((outTime.getTime() - inTime.getTime()) / 60000);
          const hours = Math.floor(diffMinutes / 60);
          const minutes = diffMinutes % 60;
          setHoursToday(`${hours}h ${minutes}m`);
          setLastCheckIn(inTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }));
          setLastCheckOut(outTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }));
        }

        // Set current status
        if (lastOut) setCurrentStatus('checkedout');
        else if (lastIn) setCurrentStatus('checkedin');
        else setCurrentStatus('notchecked');
      };
      fetchAttendance();
    }, [employeeId])
  );

  const sendDailySummary = async () => {
    try {
      const lastInStr = await AsyncStorage.getItem(`lastCheckIn-${employeeId}`);
      const lastOutStr = await AsyncStorage.getItem(`lastCheckOut-${employeeId}`);

      if (!lastInStr || !lastOutStr) return; // skip if any time missing

      const lastIn = new Date(Number(lastInStr));
      const lastOut = new Date(Number(lastOutStr));
      const totalMinutes = Math.floor((lastOut.getTime() - lastIn.getTime()) / 60000);
      const totalHours = totalMinutes / 60;

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
        total_hours_today: totalHours, // send in minutes
      };

      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${API_BASE}/reports/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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



  const handleCamera = (action: 'clockin' | 'clockout') => {
    router.push({
      pathname: '/Attendance/CameraScreen',
      params: { employeeId, attendanceStatus: action },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Current Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusTitle}>Current Status</Text>
            <View style={[
              styles.statusBadge,
              currentStatus === 'checkedin' ? styles.greenBadge : styles.redBadge
            ]}>
              <Text style={styles.statusBadgeText}>
                {currentStatus === 'checkedin' ? 'Checked In' : currentStatus === 'checkedout' ? 'Checked Out' : 'Not Checked'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Check-in</Text>
            <Text style={styles.infoValue}>{lastCheckIn || 'Not checked in today'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Check-out</Text>
            <Text style={styles.infoValue}>{lastCheckOut || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hours Today</Text>
            <Text style={styles.infoValue}>{hoursToday}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Select Action</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.checkInButton]}
              onPress={() => handleCamera('clockin')}
            >
              <Text style={styles.actionButtonText}>Check In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.checkOutButton]}
              onPress={() => handleCamera('clockout')}
            >
              <Text style={styles.actionButtonText}>Check Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f3f4f6' },
  container: { padding: 16, paddingBottom: 50 },
  statusCard: { backgroundColor: '#e0f2fe', borderRadius: 12, padding: 16, marginBottom: 16 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  greenBadge: { backgroundColor: '#10b981' },
  redBadge: { backgroundColor: '#f59e0b' },
  statusBadgeText: { color: 'white', fontWeight: '700' },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  infoLabel: { color: '#374151', fontWeight: '600' },
  infoValue: { color: '#0f172a', fontWeight: '700' },

  actionCard: { backgroundColor: '#e0f2fe', borderRadius: 12, padding: 16 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  actionButton: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginHorizontal: 4 },
  checkInButton: { backgroundColor: '#3b82f6' },
  checkOutButton: { backgroundColor: '#f97316' },
  actionButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
