import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, SafeAreaView, TextInput, Switch } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const BLUE = '#2A7B88';
const LIGHT = '#FAFBFD';
const GRAY = '#7A8CA3';

export default function DailyCheckinScreen() {
  const [fever, setFever] = useState('No');
  const [temperature, setTemperature] = useState('98.6');
  const [breathingIssues, setBreathingIssues] = useState(false);
  const [notes, setNotes] = useState('');

  const symptoms = [
    { id: 1, name: 'Headache', icon: 'sentiment-very-dissatisfied' },
    { id: 2, name: 'Nausea', icon: 'sick' },
    { id: 3, name: 'Fatigue', icon: 'bedtime' },
    { id: 4, name: 'Dizziness', icon: 'blur-on' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.headerAvatar} />
          <Text style={styles.headerTitle}>CareLoop</Text>
        </View>
        <MaterialIcons name="notifications-none" size={24} color="#333" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Daily Check-in</Text>
        <Text style={styles.pageSub}>How are you feeling today, Alex?</Text>

        {/* Current Symptoms */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Symptoms</Text>
          <View style={styles.symptomsGrid}>
            {symptoms.map(s => (
              <TouchableOpacity key={s.id} style={styles.symptomBox}>
                <MaterialIcons name={s.icon as any} size={28} color="#333" style={{ marginBottom: 8 }} />
                <Text style={styles.symptomText}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pain Level */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.cardTitle}>Pain Level</Text>
            <Text style={styles.painValue}>5</Text>
          </View>
          {/* Custom slider visualization */}
          <View style={styles.sliderTrackContainer}>
            <View style={styles.sliderTrackBg} />
            <View style={styles.sliderThumb} />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>No Pain</Text>
            <Text style={styles.sliderLabelText}>Moderate</Text>
            <Text style={styles.sliderLabelText}>Severe</Text>
          </View>
        </View>

        {/* Fever */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fever</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity style={styles.radioOption} onPress={() => setFever('Yes')}>
              <MaterialIcons name={fever === 'Yes' ? 'radio-button-checked' : 'radio-button-unchecked'} size={20} color={fever === 'Yes' ? BLUE : GRAY} />
              <Text style={styles.radioText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.radioOption} onPress={() => setFever('No')}>
              <MaterialIcons name={fever === 'No' ? 'radio-button-checked' : 'radio-button-unchecked'} size={20} color={fever === 'No' ? BLUE : GRAY} />
              <Text style={styles.radioText}>No</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.inputLabel}>Temperature (°F)</Text>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.input} 
              value={temperature} 
              onChangeText={setTemperature}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Breathing Issues */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Breathing Issues</Text>
          <Text style={styles.subText}>Shortness of breath or difficulty breathing?</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Experiencing issues</Text>
            <Switch 
              value={breathingIssues} 
              onValueChange={setBreathingIssues}
              trackColor={{ false: '#E0E0E0', true: '#B2D8DD' }}
              thumbColor={breathingIssues ? BLUE : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notes</Text>
          <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
            <TextInput 
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
              placeholder="How are you managing? Any specific concerns for your doctor?"
              placeholderTextColor={GRAY}
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn}>
          <MaterialIcons name="check-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.submitBtnText}>Submit Check-in</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: LIGHT },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: LIGHT
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: BLUE },
  
  scrollContent: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 26, fontWeight: 'bold', color: '#111' },
  pageSub: { fontSize: 15, color: '#666', marginTop: 4, marginBottom: 20 },
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 16 },
  
  symptomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  symptomBox: { width: '30%', backgroundColor: '#F8F9FB', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F0F2F5' },
  symptomText: { fontSize: 11, fontWeight: '500', color: '#333' },
  
  painValue: { fontSize: 24, fontWeight: 'bold', color: BLUE },
  sliderTrackContainer: { height: 20, justifyContent: 'center', marginVertical: 16, position: 'relative' },
  sliderTrackBg: { height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' },
  sliderThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', borderWidth: 3, borderColor: BLUE, position: 'absolute', left: '50%', marginLeft: -10 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLabelText: { fontSize: 12, color: GRAY, fontWeight: '500' },
  
  radioGroup: { flexDirection: 'row', marginBottom: 20 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  radioText: { marginLeft: 8, fontSize: 14, color: '#111' },
  inputLabel: { fontSize: 12, color: '#111', fontWeight: 'bold', marginBottom: 8 },
  inputContainer: { backgroundColor: '#F8F9FB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 4 },
  input: { fontSize: 16, color: '#111', height: 44 },
  
  subText: { fontSize: 14, color: '#555', marginBottom: 16, lineHeight: 20 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F9FB', padding: 16, borderRadius: 12 },
  switchLabel: { fontSize: 14, fontWeight: '500', color: '#111' },
  
  submitBtn: { backgroundColor: BLUE, borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
