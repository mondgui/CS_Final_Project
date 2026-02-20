import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WAVE_R = 160;

export default function ChooseRole() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Option B: Bold gradient (Duolingo-style — saturated, energetic) */}
      <LinearGradient
        colors={['#FF8A65', '#FF6A5C', '#E85A4F']}
        style={styles.header}
      />

      {/* White panel with wavy top + bold shadow */}
      <View style={styles.panel} pointerEvents="box-none">
        {/* Symmetric wave: same top offset so left and right match */}
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

            {/* Chunky, bold cards (Duolingo-style) */}
            <TouchableOpacity
              style={[styles.roleCard, styles.roleCardStudent]}
              onPress={() => router.push('/register-student')}
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
              onPress={() => router.push('/register-teacher')}
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

            <TouchableOpacity onPress={() => router.back()} style={styles.backWrap}>
              <Text style={styles.backText}>Back</Text>
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
});
