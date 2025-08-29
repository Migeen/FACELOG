// app/DashboardScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';

type Summary = {
  today_checkins: number;
  today_checkouts: number;
  total_employees: number;
  late_today: number;
  checked_in_time?: string; // e.g. "09:15 AM"
  working_duration?: string; // e.g. "3h 45m"
};

export default function DashboardScreen() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  const route = useRoute<any>();
  const { employeeId } = route.params;
    
  console.log(employeeId);

  useEffect(() => {
    // update clock every minute
    const t = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchSummary();
  }, []);

  async function fetchSummary() {
    setLoading(true);
    try {
      // Replace with actual API call
      // const token = await AsyncStorage.getItem('access_token');
      // const res = await fetch(`${API_BASE}/reports/summary`, { headers: { Authorization: `Bearer ${token}` }});
      // const json = await res.json();

      // Mock data for UI preview
      const json = {
        today_checkins: 4,
        today_checkouts: 2,
        total_employees: 25,
        late_today: 1,
        checked_in_time: '09:15 AM',
        working_duration: '3h 45m',
      };

      setSummary(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleCheckInOut = () => {
    // navigate to camera/check-in screen
    router.push({
      pathname:'/attendance/CameraScreen',
       params: { employeeId },
});
  };

  const handleViewDetails = () => {
    router.push('/attendance');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.dateLine}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
            <View style={styles.timeRow}>
              <Feather name="clock" size={14} color="#374151" />
              <Text style={styles.timeText}>  Current time: {currentTime}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.menuBtn} onPress={() => router.push('/settings')}>
            <Feather name="menu" size={22} color="#064e3b" />
          </TouchableOpacity>
        </View>

        {loading || !summary ? (
          <ActivityIndicator style={{ marginTop: 30 }} />
        ) : (
          <>
            {/* Today's Status */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Today's Status</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Present</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.row}>
                  <View style={styles.iconBoxSuccess}>
                    <MaterialIcons name="check-circle" size={20} color="#065f46" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>Checked in at {summary.checked_in_time}</Text>
                    <Text style={styles.rowSub}>Working for {summary.working_duration}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Check-in */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Quick Check-in</Text>
                <Text style={styles.cardSub}>Use facial recognition to check in/out</Text>
              </View>

              <View style={styles.cardBody}>
                <TouchableOpacity style={styles.primaryBtn} onPress={handleCheckInOut}>
                  <FontAwesome5 name="camera" size={16} color="#fff" />
                  <Text style={styles.primaryBtnText}>  Check In / Out</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* This Week's Overview */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>This Week's Overview</Text>
                <TouchableOpacity style={styles.outlineBtn} onPress={handleViewDetails}>
                  <Text style={styles.outlineBtnText}>View Details</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.cardBody, { paddingTop: 8 }]}>
                <View style={styles.statsRow}>
                  <StatBox label="Days Present" value={`${summary.today_checkins}/5`} icon={<MaterialIcons name="check" size={22} color="#059669" />} />
                  <StatBox label="Total Hours" value={'38h 30m'} icon={<Feather name="clock" size={20} color="#2563eb" />} />
                </View>
                <View style={styles.statsRow}>
                  <StatBox label="Employees" value={`${summary.total_employees}`} icon={<Feather name="users" size={20} color="#4b5563" />} />
                  <StatBox label="Late Today" value={`${summary.late_today}`} icon={<MaterialIcons name="warning" size={20} color="#f59e0b" />} />
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom nav placeholder (optional) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <Feather name="home" size={20} color="#065f46" />
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/Attendance/CameraScreen')}>
          <Feather name="camera" size={20} color="#374151" />
          <Text style={styles.navLabel}>Check In/Out</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() =>  router.push({pathname:'/Attendance/CameraScreen',params: { employeeId }})}>
          <Feather name="clock" size={20} color="#374151" />
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/schedule')}>
          <Feather name="calendar" size={20} color="#374151" />
          <Text style={styles.navLabel}>Schedule</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <View style={styles.statBox}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 16,
    paddingBottom: 120,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  dateLine: { color: '#374151', marginTop: 6 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  timeText: { color: '#374151' },

  menuBtn: { backgroundColor: '#ecfdf5', padding: 8, borderRadius: 10 },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  cardSub: { color: '#6b7280', fontSize: 13 },
  cardBody: { marginTop: 10 },

  statusBadge: { backgroundColor: '#f0fdf4', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  statusBadgeText: { color: '#065f46', fontWeight: '700' },

  row: { flexDirection: 'row', alignItems: 'center' },
  iconBoxSuccess: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },

  rowTitle: { fontWeight: '700', color: '#0f172a' },
  rowSub: { color: '#6b7280' },

  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#065f46', paddingVertical: 12, borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },

  outlineBtn: { borderWidth: 1, borderColor: '#e6e6e6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  outlineBtnText: { color: '#374151', fontWeight: '600' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },

  statBox: { width: '48%', backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, alignItems: 'flex-start' },
  statIcon: { marginBottom: 8, backgroundColor: '#fff', padding: 6, borderRadius: 8 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  statLabel: { color: '#6b7280', marginTop: 6 },

  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 70, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#e6e6e6', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 8 },
  navLabel: { fontSize: 11, color: '#374151', marginTop: 4 },
});
