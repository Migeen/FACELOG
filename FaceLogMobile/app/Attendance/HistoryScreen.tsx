import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

const attendanceSummary = {
  presentDays: 15,
  lateDays: 2,
  totalHours: '156h 10m',
  attendanceRate: '75%',
  avgCheckIn: '09:08 AM',
  avgCheckOut: '05:52 PM',
};

const dailyRecords = [
  { id: '1', date: 'Mon, Jan 15', time: '09:00 AM - 06:00 PM', hours: '8h 0m', status: 'Present' },
  { id: '2', date: 'Sun, Jan 14', time: '09:15 AM - 06:15 PM', hours: '8h 0m', status: 'Late', note: 'Traffic delay' },
  { id: '3', date: 'Sat, Jan 13', time: '08:45 AM - 05:45 PM', hours: '8h 0m', status: 'Present' },
  { id: '4', date: 'Fri, Jan 12', time: '09:30 AM - 04:30 PM', hours: '6h 0m', status: 'Partial', note: 'Left early - doctor appointment' },
  { id: '5', date: 'Thu, Jan 11', time: '-- - --', hours: '0h 0m', status: 'Absent', note: 'Sick leave' },
  { id: '6', date: 'Wed, Jan 10', time: '09:00 AM - 06:00 PM', hours: '8h 0m', status: 'Present' },
  { id: '7', date: 'Tue, Jan 9', time: '08:55 AM - 06:05 PM', hours: '8h 10m', status: 'Present' },
  { id: '8', date: 'Mon, Jan 8', time: '09:20 AM - 06:20 PM', hours: '8h 0m', status: 'Late' },
];

const statusColors = {
  Present: '#4CAF50',
  Late: '#FF9800',
  Partial: '#FFC107',
  Absent: '#F44336',
};

const HistoryScreen = () => {
  const [timePeriod, setTimePeriod] = useState('Month');

  const renderRecord = ({ item }) => (
    <View style={styles.recordCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.recordDate}>{item.date}</Text>
        {item.note && <Text style={styles.note}>{item.note}</Text>}
        <Text style={styles.recordTime}>{item.time}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.hours}>{item.hours}</Text>
        <Text style={[styles.status, { color: statusColors[item.status] }]}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Attendance History</Text>
      <Text style={styles.subHeader}>View your attendance records and statistics</Text>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>Export</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Time Period Selector */}
      <View style={styles.timePeriodRow}>
        {['Week', 'Month', 'Quarter'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.timeBtn,
              timePeriod === period && styles.timeBtnActive,
            ]}
            onPress={() => setTimePeriod(period)}
          >
            <Text
              style={[
                styles.timeText,
                timePeriod === period && styles.timeTextActive,
              ]}
            >
              {period}
            </Text>
          </TouchableOpacity>
        ))}
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
      <FlatList
        data={dailyRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderRecord}
        scrollEnabled={false} // Disable FlatList scroll inside ScrollView
      />

      {/* Load More */}
      <TouchableOpacity style={styles.loadMoreBtn}>
        <Text style={styles.loadMoreText}>Load More Records</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subHeader: { fontSize: 14, color: '#666', marginBottom: 16 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  actionBtn: { backgroundColor: '#065f46', padding: 10, borderRadius: 8, flex: 0.48 },
  actionText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  timePeriodRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  timeBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#e0e0e0' },
  timeBtnActive: { backgroundColor: '#065f46' },
  timeText: { color: '#333', fontWeight: 'bold' },
  timeTextActive: { color: '#fff' },
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
  loadMoreBtn: { marginTop: 12, padding: 12, backgroundColor: '#e0e0e0', borderRadius: 8, alignItems: 'center' },
  loadMoreText: { color: '#333', fontWeight: 'bold' },
});

export default HistoryScreen;