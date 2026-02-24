// Single role-selection screen: role cards always go to register; "Explore as a guest" is the only way to dashboards.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { clearAuth } from '../lib/auth';

const PANEL_WAVE_R = 160;

export function RoleSelectionScreen() {
  const router = useRouter();

  const goToRegisterStudent = () => router.push('/register-student');
  const goToRegisterTeacher = () => router.push('/register-teacher');

  const goToStudentDashboard = () => {
    clearAuth().then(() => router.push('/(student)/dashboard'));
  };
  const goToTeacherDashboard = () => {
    clearAuth().then(() => router.push('/(teacher)/dashboard'));
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF8A65', '#FF6A5C', '#E85A4F']}
        style={styles.header}
      />

      <View style={styles.panel} pointerEvents="box-none">
        <View style={styles.panelWaveWrap}>
          <View
            style={[
              styles.panelWaveBump,
              {
                width: PANEL_WAVE_R * 2,
                height: PANEL_WAVE_R * 2,
                borderRadius: PANEL_WAVE_R,
                left: -PANEL_WAVE_R * 0.5,
                top: -PANEL_WAVE_R * 0.65,
              },
            ]}
          />
          <View
            style={[
              styles.panelWaveBump,
              {
                width: PANEL_WAVE_R * 2,
                height: PANEL_WAVE_R * 2,
                borderRadius: PANEL_WAVE_R,
                right: -PANEL_WAVE_R * 0.5,
                left: undefined,
                top: -PANEL_WAVE_R * 0.65,
              },
            ]}
          />
        </View>

        <View style={styles.panelBody}>
          <View style={styles.panelContent}>
            <Text style={styles.title}>Welcome to MusicOnTheGo</Text>
            <Text style={styles.subtitle}>Choose your role to continue</Text>

            <TouchableOpacity
              style={[styles.roleCard, styles.roleCardStudent]}
              onPress={goToRegisterStudent}
              activeOpacity={0.85}
            >
              <View style={styles.cardIconWrap}>
                <Ionicons name="school-outline" size={32} color="#FFF" />
              </View>
              <View style={styles.roleCardText}>
                <View style={styles.roleTitleRow}>
                  <Text style={styles.roleTitle}>I'm a Student</Text>
                  <View style={styles.notesRow}>
                    <Ionicons name="musical-note" size={14} color="#FF6A5C" style={styles.noteIcon} />
                    <Ionicons name="musical-notes" size={14} color="#FF6A5C" style={styles.noteIcon} />
                  </View>
                </View>
                <Text style={styles.roleDescription}>
                  Find your music teacher and book music lessons
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, styles.roleCardTeacher]}
              onPress={goToRegisterTeacher}
              activeOpacity={0.85}
            >
              <View style={[styles.cardIconWrap, styles.cardIconTeacher]}>
                <Ionicons name="musical-notes-outline" size={32} color="#FFF" />
              </View>
              <View style={styles.roleCardText}>
                <View style={styles.roleTitleRow}>
                  <Text style={styles.roleTitle}>I'm a Music Teacher</Text>
                  <View style={styles.notesRow}>
                    <Ionicons name="musical-note" size={14} color="#E85A4F" style={styles.noteIcon} />
                    <Ionicons name="musical-notes" size={14} color="#E85A4F" style={styles.noteIcon} />
                  </View>
                </View>
                <Text style={styles.roleDescription}>
                  Meet students, teach music and manage bookings
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.guestExploreSection}>
              <Text style={styles.guestExploreTitle}>Explore as a guest</Text>
              <Text style={styles.guestExploreSubtitle}>
                No account needed. You can create one anytime.
              </Text>
              <View style={styles.guestExploreButtonsRow}>
                <TouchableOpacity
                  style={[styles.guestExploreButton, styles.guestExploreButtonStudent]}
                  onPress={goToStudentDashboard}
                  activeOpacity={0.85}
                >
                  <Ionicons name="school-outline" size={18} color="#FF6A5C" />
                  <Text style={styles.guestExploreButtonText}>Student</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.guestExploreButton, styles.guestExploreButtonTeacher]}
                  onPress={goToTeacherDashboard}
                  activeOpacity={0.85}
                >
                  <Ionicons name="musical-notes-outline" size={18} color="#E85A4F" />
                  <Text style={styles.guestExploreButtonText}>Teacher</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={() => router.back()} style={styles.backWrap}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={styles.loginLinkWrap}
            >
              <Text style={styles.loginLinkText}>Already have an account? </Text>
              <Text style={styles.loginLinkBold}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '44%',
    minHeight: 300,
  },
  panel: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '24%',
    maxHeight: '62%',
    borderRadius: 28,
    overflow: 'visible',
    ...Platform.select({
      web: {
        boxShadow: '0 16px 48px rgba(232, 90, 79, 0.2), 0 8px 24px rgba(0,0,0,0.12)',
      } as any,
      default: {
        shadowColor: '#E85A4F',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 28,
        elevation: 16,
      },
    }),
  },
  panelWaveWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: PANEL_WAVE_R * 0.6,
    overflow: 'visible',
  },
  panelWaveBump: {
    position: 'absolute',
    backgroundColor: '#FFF',
  },
  panelBody: {
    marginTop: PANEL_WAVE_R * 0.35,
    backgroundColor: '#FFF',
    borderRadius: 28,
    overflow: 'hidden',
  },
  panelContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 26,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    color: '#2D2D2D',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 24,
    fontWeight: '500',
  },
  guestExploreSection: {
    marginTop: 6,
    marginBottom: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFF5F3',
    borderWidth: 1,
    borderColor: '#FFE0D6',
  },
  guestExploreTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2D2D2D',
    marginBottom: 4,
    textAlign: 'center',
  },
  guestExploreSubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
  },
  guestExploreButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  guestExploreButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: '#FFF',
  },
  guestExploreButtonStudent: {
    borderColor: '#FF6A5C',
  },
  guestExploreButtonTeacher: {
    borderColor: '#E85A4F',
  },
  guestExploreButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2D2D2D',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 22,
    marginBottom: 18,
    borderWidth: 3,
  },
  roleCardStudent: {
    backgroundColor: '#FFF',
    borderColor: '#FF6A5C',
    ...Platform.select({
      web: { boxShadow: '0 6px 20px rgba(255, 106, 92, 0.25)' } as any,
      default: {
        shadowColor: '#FF6A5C',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
        elevation: 8,
      },
    }),
  },
  roleCardTeacher: {
    backgroundColor: '#FFF',
    borderColor: '#E85A4F',
    ...Platform.select({
      web: { boxShadow: '0 6px 20px rgba(232, 90, 79, 0.3)' } as any,
      default: {
        shadowColor: '#E85A4F',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
        elevation: 8,
      },
    }),
  },
  cardIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6A5C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconTeacher: {
    backgroundColor: '#E85A4F',
  },
  roleCardText: {
    flex: 1,
    marginLeft: 18,
    minWidth: 0,
    paddingRight: 8,
  },
  roleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  noteIcon: {
    marginLeft: 4,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2D2D',
  },
  roleDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  backWrap: {
    alignSelf: 'center',
    marginTop: 22,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  backText: {
    fontSize: 17,
    color: '#FF6A5C',
    fontWeight: '700',
  },
  loginLinkWrap: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  loginLinkText: {
    fontSize: 15,
    color: '#555',
  },
  loginLinkBold: {
    fontSize: 15,
    color: '#FF6A5C',
    fontWeight: '700',
  },
});
