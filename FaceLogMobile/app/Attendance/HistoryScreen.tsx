import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = "http://192.168.1.9:8000/api/v1";

const statusColors = {
  Present: '#4CAF50',
  Late: '#FF9800',
  Partial: '#FFC107',
  Absent: '#F44336',
  default: '#9E9E9E', // Fallback color for unknown statuses
};

const HistoryScreen = () => {
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [attendanceSummary, setAttendanceSummary] = useState({
    presentDays: 0,
    lateDays: 0,
    totalHours: '0h 0m',
    attendanceRate: '0%',
    avgCheckIn: '--:-- --',
    avgCheckOut: '--:-- --',
  });
  const [dailyRecords, setDailyRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch employeeId
  useEffect(() => {
    const fetchEmployeeId = async () => {
      try {
        console.log('Fetching employeeId...');
        const idString = await AsyncStorage.getItem('employeeId');
        console.log('Retrieved employeeId:', idString);
        
        if (idString) {
          const parsedId = parseInt(idString);
          setEmployeeId(parsedId);
        }
      } catch (error) {
        console.error('Error fetching employee ID:', error);
      }
    };
    
    fetchEmployeeId();
  }, []);

  // Fetch data when dependencies change
  useEffect(() => {
    console.log('useEffect triggered - employeeId:', employeeId);
    if (employeeId) {
      console.log('Calling fetchData...');
      fetchData();
    }
  }, [employeeId, selectedYear, selectedMonth]);

  const fetchData = useCallback(async () => {
    console.log('fetchData called with employeeId:', employeeId);
    if (!employeeId) {
      console.log('No employeeId, returning early');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Loading started, fetching real data...');
      
      // Fetch monthly overview (no authentication headers)
      const overviewResponse = await fetch(
        `${API_BASE}/reports/employee/${employeeId}/monthly-overview?year=${selectedYear}&month=${selectedMonth}`
      );
      
      if (!overviewResponse.ok) {
        throw new Error(`HTTP error! status: ${overviewResponse.status}`);
      }
      
      const overviewData = await overviewResponse.json();
      console.log('Overview data:', overviewData);
      
      // Fetch daily records (no authentication headers)
      const recordsResponse = await fetch(
        `${API_BASE}/reports/employee/${employeeId}/daily-records?year=${selectedYear}&month=${selectedMonth}`
      );
      
      if (!recordsResponse.ok) {
        throw new Error(`HTTP error! status: ${recordsResponse.status}`);
      }
      
      const recordsData = await recordsResponse.json();
      console.log('Records data:', recordsData);
      
      // Update state with real data
      setAttendanceSummary({
        presentDays: overviewData.present_days || 0,
        lateDays: overviewData.late_days || 0,
        totalHours: overviewData.total_hours_formatted || '0h 0m',
        attendanceRate: `${overviewData.attendance_rate || 0}%`,
        avgCheckIn: overviewData.average_checkin || '--:-- --',
        avgCheckOut: overviewData.average_checkout || '--:-- --',
      });
      
      setDailyRecords(recordsData || []);
      
    } catch (error) {
      console.error('Error in fetchData:', error);
      Alert.alert('Error', 'Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
      console.log('Data loading completed');
    }
  }, [employeeId, selectedYear, selectedMonth]);

  const getStatusColor = (status: string) => {
    return statusColors[status] || statusColors.default;
  };

  const renderRecord = ({ item }) => {
    // Add defensive checks for all item properties
    const status = item?.status || 'Unknown';
    const date = item?.date || 'No date';
    const time_range = item?.time_range || '--:-- -- - --:-- --';
    const hours = item?.hours || '0h 0m';
    const notes = item?.notes;

    return (
      <View style={styles.recordCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.recordDate}>{date}</Text>
          {notes && <Text style={styles.note}>{notes}</Text>}
          <Text style={styles.recordTime}>{time_range}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.hours}>{hours}</Text>
          <Text style={[styles.status, { color: getStatusColor(status) }]}>
            {status}
          </Text>
        </View>
      </View>
    );
  };

  const handleMonthChange = (increment: number) => {
    let newMonth = selectedMonth + increment;
    let newYear = selectedYear;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#065f46" />
        <Text style={styles.loadingText}>Loading attendance data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Attendance History</Text>
      <Text style={styles.subHeader}>View your attendance records and statistics</Text>

      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => handleMonthChange(-1)}>
          <Text style={styles.monthNavButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={() => handleMonthChange(1)}>
          <Text style={styles.monthNavButton}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Monthly Overview */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Monthly Overview</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{attendanceSummary.presentDays}</Text>
            <Text style={styles.summaryLabel}>Present Days</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{attendanceSummary.lateDays}</Text>
            <Text style={styles.summaryLabel}>Late Days</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{attendanceSummary.totalHours}</Text>
            <Text style={styles.summaryLabel}>Total Hours</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{attendanceSummary.attendanceRate}</Text>
            <Text style={styles.summaryLabel}>Attendance Rate</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{attendanceSummary.avgCheckIn}</Text>
            <Text style={styles.summaryLabel}>Average Check-in</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{attendanceSummary.avgCheckOut}</Text>
            <Text style={styles.summaryLabel}>Average Check-out</Text>
          </View>
        </View>
      </View>

      {/* Daily Records */}
      <Text style={styles.dailyHeader}>Daily Records</Text>
      {dailyRecords.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No records found for this month</Text>
        </View>
      ) : (
        <FlatList
          data={dailyRecords}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderRecord}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subHeader: { fontSize: 14, color: '#666', marginBottom: 16 },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  monthNavButton: { fontSize: 20, fontWeight: 'bold', color: '#065f46' },
  monthText: { fontSize: 16, fontWeight: 'bold' },
  summaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20 },
  summaryTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryNumber: { fontSize: 18, fontWeight: 'bold' },
  summaryLabel: { fontSize: 12, color: '#666', textAlign: 'center' },
  dailyHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  recordCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row' },
  recordDate: { fontWeight: 'bold', fontSize: 14, marginBottom: 2 },
  note: { fontSize: 12, color: '#FF9800', marginBottom: 2 },
  recordTime: { fontSize: 12, color: '#666' },
  hours: { fontWeight: 'bold', fontSize: 14 },
  status: { fontWeight: 'bold', marginTop: 4 },
  emptyState: { padding: 20, alignItems: 'center', backgroundColor: '#fff', borderRadius: 12 },
  emptyStateText: { color: '#666' },
});

export default HistoryScreen;
