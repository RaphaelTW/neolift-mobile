import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import { Ionicons } from '@expo/vector-icons';
import type { Exercise } from '@/types';
import { coachProfile, type MotionFamily } from '@/services/exerciseCoach';
import { useApp } from '@/context/AppProvider';
import { Text } from '@/components/Ui';

function limbMaterial(accent: string, secondary = false) {
  return <meshStandardMaterial color={secondary ? '#2A2630' : accent} roughness={0.72} metalness={0.08} />;
}

function BodyRig({ family, equipment, accent, speed, paused, view }: { family: MotionFamily; equipment: string | null; accent: string; speed: number; paused: boolean; view: 'front' | 'side' | 'three-quarter' }) {
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const leftUpper = useRef<THREE.Group>(null);
  const rightUpper = useRef<THREE.Group>(null);
  const leftFore = useRef<THREE.Group>(null);
  const rightFore = useRef<THREE.Group>(null);
  const leftThigh = useRef<THREE.Group>(null);
  const rightThigh = useRef<THREE.Group>(null);
  const leftShin = useRef<THREE.Group>(null);
  const rightShin = useRef<THREE.Group>(null);
  const bar = useRef<THREE.Group>(null);
  const frozenTime = useRef(0);

  const reset = () => {
    const groups = [torso.current, leftUpper.current, rightUpper.current, leftFore.current, rightFore.current, leftThigh.current, rightThigh.current, leftShin.current, rightShin.current];
    groups.forEach(group => group?.rotation.set(0, 0, 0));
    if (root.current) { root.current.position.set(0, -0.9, 0); root.current.rotation.set(0, 0, 0); }
    if (bar.current) { bar.current.position.set(0, 1.12, 0.42); bar.current.rotation.set(0, 0, Math.PI / 2); }
  };

  useFrame((state, delta) => {
    if (!paused) frozenTime.current += delta * speed;
    const t = frozenTime.current;
    const wave = (Math.sin(t * Math.PI) + 1) / 2;
    const swing = Math.sin(t * Math.PI * 2);
    reset();
    const ru = rightUpper.current; const lu = leftUpper.current; const rf = rightFore.current; const lf = leftFore.current;
    const rt = rightThigh.current; const lt = leftThigh.current; const rs = rightShin.current; const ls = leftShin.current;
    const body = torso.current; const base = root.current; const equip = bar.current;
    if (!ru || !lu || !rf || !lf || !rt || !lt || !rs || !ls || !body || !base) return;

    switch (family) {
      case 'squat':
        body.rotation.x = -0.14 * wave; rt.rotation.x = -1.05 * wave; lt.rotation.x = -1.05 * wave; rs.rotation.x = 1.3 * wave; ls.rotation.x = 1.3 * wave; base.position.y = -0.9 - 0.48 * wave; break;
      case 'lunge':
        rt.rotation.x = -0.95 * wave; rs.rotation.x = 1.2 * wave; lt.rotation.x = 0.45 * wave; ls.rotation.x = 0.55 * wave; base.position.y = -0.9 - 0.38 * wave; break;
      case 'hinge':
        body.rotation.x = 0.95 * wave; rt.rotation.x = -0.2 * wave; lt.rotation.x = -0.2 * wave; rs.rotation.x = 0.18 * wave; ls.rotation.x = 0.18 * wave; if (equip) equip.position.y = 0.5 + 0.62 * (1 - wave); break;
      case 'horizontal_press':
        base.rotation.z = Math.PI / 2; base.position.y = -0.25; ru.rotation.z = -1.2 + 0.75 * wave; lu.rotation.z = 1.2 - 0.75 * wave; rf.rotation.z = -1.35 * (1 - wave); lf.rotation.z = 1.35 * (1 - wave); if (equip) { equip.position.set(0.25 + 0.55 * wave, 1.2, 0.1); equip.rotation.z = 0; } break;
      case 'vertical_press':
        ru.rotation.z = -0.45 - 1.1 * wave; lu.rotation.z = 0.45 + 1.1 * wave; rf.rotation.z = -1.0 * (1 - wave); lf.rotation.z = 1.0 * (1 - wave); if (equip) equip.position.y = 1.15 + 1.15 * wave; break;
      case 'horizontal_pull':
        body.rotation.x = 0.48; ru.rotation.x = -0.7 + 0.75 * wave; lu.rotation.x = -0.7 + 0.75 * wave; ru.rotation.z = -0.45; lu.rotation.z = 0.45; rf.rotation.x = -1.25 * wave; lf.rotation.x = -1.25 * wave; break;
      case 'vertical_pull':
        ru.rotation.z = -1.55 + 0.75 * wave; lu.rotation.z = 1.55 - 0.75 * wave; rf.rotation.z = -0.8 * wave; lf.rotation.z = 0.8 * wave; break;
      case 'curl':
        ru.rotation.z = -0.12; lu.rotation.z = 0.12; rf.rotation.x = -2.25 * wave; lf.rotation.x = -2.25 * wave; break;
      case 'triceps':
        ru.rotation.z = -1.45; lu.rotation.z = 1.45; rf.rotation.x = -1.8 + 1.55 * wave; lf.rotation.x = -1.8 + 1.55 * wave; break;
      case 'raise':
        ru.rotation.z = -1.45 * wave; lu.rotation.z = 1.45 * wave; break;
      case 'crunch':
        base.rotation.z = Math.PI / 2; base.position.y = -0.25; body.rotation.x = -0.9 * wave; rt.rotation.x = -0.7; lt.rotation.x = -0.7; rs.rotation.x = 1.2; ls.rotation.x = 1.2; break;
      case 'plank':
        base.rotation.z = Math.PI / 2; base.position.y = -0.45; ru.rotation.z = -0.55; lu.rotation.z = 0.55; rf.rotation.z = -1.0; lf.rotation.z = 1.0; break;
      case 'rotation':
        body.rotation.y = 0.75 * swing; ru.rotation.z = -0.65; lu.rotation.z = 0.65; break;
      case 'calf':
        base.position.y = -0.9 + 0.2 * wave; rt.rotation.x = -0.05; lt.rotation.x = -0.05; break;
      case 'leg_extension':
        base.position.y = -0.72; rt.rotation.x = -1.25; lt.rotation.x = -1.25; rs.rotation.x = 1.35 * (1 - wave); ls.rotation.x = 1.35 * (1 - wave); break;
      case 'leg_curl':
        base.rotation.z = Math.PI / 2; base.position.y = -0.25; rs.rotation.x = 1.65 * wave; ls.rotation.x = 1.65 * wave; break;
      case 'hip_abduction':
        rt.rotation.z = -0.65 * wave; lt.rotation.z = 0.65 * wave; break;
      case 'hip_adduction':
        rt.rotation.z = -0.55 * (1 - wave); lt.rotation.z = 0.55 * (1 - wave); break;
      case 'carry':
        base.position.y = -0.9 + 0.04 * Math.abs(swing); rt.rotation.x = 0.45 * swing; lt.rotation.x = -0.45 * swing; rs.rotation.x = -0.38 * swing; ls.rotation.x = 0.38 * swing; ru.rotation.x = -0.28 * swing; lu.rotation.x = 0.28 * swing; break;
      case 'cardio':
        rt.rotation.x = 0.75 * swing; lt.rotation.x = -0.75 * swing; rs.rotation.x = -0.55 * swing; ls.rotation.x = 0.55 * swing; ru.rotation.x = -0.7 * swing; lu.rotation.x = 0.7 * swing; break;
      case 'olympic':
        body.rotation.x = 0.55 * (1 - wave); rt.rotation.x = -0.55 * (1 - wave); lt.rotation.x = -0.55 * (1 - wave); rs.rotation.x = 0.65 * (1 - wave); ls.rotation.x = 0.65 * (1 - wave); ru.rotation.z = -1.45 * wave; lu.rotation.z = 1.45 * wave; rf.rotation.z = -0.6 * (1 - wave); lf.rotation.z = 0.6 * (1 - wave); base.position.y = -0.9 - 0.22 * (1 - wave); if (equip) equip.position.y = 0.55 + 1.75 * wave; break;
      case 'jump':
        rt.rotation.x = -0.9 * (1 - wave); lt.rotation.x = -0.9 * (1 - wave); rs.rotation.x = 1.0 * (1 - wave); ls.rotation.x = 1.0 * (1 - wave); ru.rotation.x = -0.85 * swing; lu.rotation.x = -0.85 * swing; base.position.y = -0.9 + 0.55 * wave; break;
      case 'stretch':
        body.rotation.x = 0.35 + 0.3 * wave; ru.rotation.z = -0.8; lu.rotation.z = 0.8; rt.rotation.z = -0.25 * wave; lt.rotation.z = 0.25 * wave; break;
      default:
        ru.rotation.x = 0.35 * swing; lu.rotation.x = -0.35 * swing; rt.rotation.x = -0.25 * swing; lt.rotation.x = 0.25 * swing;
    }

    const target = view === 'front' ? 0 : view === 'side' ? -Math.PI / 2 : -0.55;
    base.rotation.y = target;
  });

  const equipmentKind = (equipment || '').toLowerCase();
  const hasBar = equipmentKind.includes('barbell') || equipmentKind.includes('ez') || family === 'squat' || family === 'horizontal_press';
  const hasDumbbells = equipmentKind.includes('dumbbell');

  return <group ref={root} position={[0, -0.9, 0]}>
    <group ref={torso}>
      <mesh position={[0, 1.2, 0]} scale={[0.62, 0.88, 0.34]}><capsuleGeometry args={[0.5, 0.72, 8, 16]} />{limbMaterial(accent)}</mesh>
      <mesh position={[0, 2.23, 0]}><sphereGeometry args={[0.34, 20, 20]} />{limbMaterial('#D8C7F6', true)}</mesh>
      <mesh position={[0, 1.82, 0]} scale={[0.16, 0.22, 0.16]}><cylinderGeometry args={[0.45, 0.45, 1, 12]} />{limbMaterial('#D8C7F6', true)}</mesh>

      <group ref={leftUpper} position={[-0.78, 1.65, 0]}><mesh position={[0, -0.38, 0]}><cylinderGeometry args={[0.13, 0.15, 0.76, 12]} />{limbMaterial(accent)}</mesh><group ref={leftFore} position={[0, -0.76, 0]}><mesh position={[0, -0.34, 0]}><cylinderGeometry args={[0.1, 0.12, 0.68, 12]} />{limbMaterial('#C7B6E8', true)}</mesh><mesh position={[0, -0.72, 0]}><sphereGeometry args={[0.13, 12, 12]} />{limbMaterial('#C7B6E8', true)}</mesh></group></group>
      <group ref={rightUpper} position={[0.78, 1.65, 0]}><mesh position={[0, -0.38, 0]}><cylinderGeometry args={[0.13, 0.15, 0.76, 12]} />{limbMaterial(accent)}</mesh><group ref={rightFore} position={[0, -0.76, 0]}><mesh position={[0, -0.34, 0]}><cylinderGeometry args={[0.1, 0.12, 0.68, 12]} />{limbMaterial('#C7B6E8', true)}</mesh><mesh position={[0, -0.72, 0]}><sphereGeometry args={[0.13, 12, 12]} />{limbMaterial('#C7B6E8', true)}</mesh></group></group>

      <group ref={leftThigh} position={[-0.3, 0.35, 0]}><mesh position={[0, -0.52, 0]}><cylinderGeometry args={[0.17, 0.2, 1.04, 12]} />{limbMaterial(accent)}</mesh><group ref={leftShin} position={[0, -1.04, 0]}><mesh position={[0, -0.48, 0]}><cylinderGeometry args={[0.12, 0.15, 0.96, 12]} />{limbMaterial('#B6A6D2', true)}</mesh><mesh position={[0, -1.01, 0.14]} scale={[0.16, 0.1, 0.35]}><boxGeometry args={[1, 1, 1]} />{limbMaterial('#B6A6D2', true)}</mesh></group></group>
      <group ref={rightThigh} position={[0.3, 0.35, 0]}><mesh position={[0, -0.52, 0]}><cylinderGeometry args={[0.17, 0.2, 1.04, 12]} />{limbMaterial(accent)}</mesh><group ref={rightShin} position={[0, -1.04, 0]}><mesh position={[0, -0.48, 0]}><cylinderGeometry args={[0.12, 0.15, 0.96, 12]} />{limbMaterial('#B6A6D2', true)}</mesh><mesh position={[0, -1.01, 0.14]} scale={[0.16, 0.1, 0.35]}><boxGeometry args={[1, 1, 1]} />{limbMaterial('#B6A6D2', true)}</mesh></group></group>
    </group>

    {hasBar ? <group ref={bar} position={[0, 1.12, 0.42]} rotation={[0, 0, Math.PI / 2]}><mesh><cylinderGeometry args={[0.04, 0.04, 2.6, 12]} /><meshStandardMaterial color="#C8C5CF" metalness={0.7} roughness={0.25} /></mesh><mesh position={[0, 1.02, 0]}><cylinderGeometry args={[0.2, 0.2, 0.15, 16]} /><meshStandardMaterial color="#4A4552" /></mesh><mesh position={[0, -1.02, 0]}><cylinderGeometry args={[0.2, 0.2, 0.15, 16]} /><meshStandardMaterial color="#4A4552" /></mesh></group> : null}
    {hasDumbbells ? <><mesh position={[-0.82, 0.44, 0.1]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.1, 0.1, 0.42, 12]} /><meshStandardMaterial color="#615A69" metalness={0.5} /></mesh><mesh position={[0.82, 0.44, 0.1]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.1, 0.1, 0.42, 12]} /><meshStandardMaterial color="#615A69" metalness={0.5} /></mesh></> : null}
  </group>;
}

export function Exercise3D({ exercise, height = 390 }: { exercise: Exercise; height?: number }) {
  const { colors, isDark } = useApp();
  const profile = useMemo(() => coachProfile(exercise), [exercise]);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [view, setView] = useState<'front' | 'side' | 'three-quarter'>(profile.camera);

  return <View style={[styles.shell, { height, backgroundColor: isDark ? '#09080C' : '#F1ECF8', borderColor: colors.border }]}>
    <Canvas camera={{ position: [0, 1.05, 6.6], fov: 37 }} style={StyleSheet.absoluteFill}>
      <color attach="background" args={[isDark ? '#09080C' : '#F1ECF8']} />
      <ambientLight intensity={1.25} />
      <directionalLight position={[4, 6, 5]} intensity={2.1} color="#E8D8FF" />
      <directionalLight position={[-4, 2, -3]} intensity={1.2} color="#7845B9" />
      <BodyRig family={profile.family} equipment={exercise.equipment} accent={colors.accent} speed={speed} paused={paused} view={view} />
      <gridHelper args={[8, 16, isDark ? '#33253F' : '#CDBAE2', isDark ? '#17131D' : '#E1D7EC']} position={[0, -2.98, 0]} />
    </Canvas>

    <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}><Ionicons name="cube-outline" size={14} color={colors.accent} /><Text style={{ color: colors.accent, fontSize: 10, fontWeight: '900' }}>3D OFFLINE</Text></View>
    <View style={styles.bottomControls}>
      <View style={[styles.controlGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Pressable onPress={() => setPaused(v => !v)} style={styles.control}><Ionicons name={paused ? 'play' : 'pause'} size={18} color={colors.text} /></Pressable>
        <Pressable onPress={() => setSpeed(speed === 0.65 ? 1 : speed === 1 ? 1.45 : 0.65)} style={styles.speed}><Text style={{ fontSize: 11, fontWeight: '900' }}>{speed}x</Text></Pressable>
      </View>
      <View style={[styles.controlGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Pressable onPress={() => setView('front')} style={[styles.viewButton, view === 'front' && { backgroundColor: colors.accentSoft }]}><Text style={{ fontSize: 9, fontWeight: '900', color: view === 'front' ? colors.accent : colors.muted }}>FRENTE</Text></Pressable>
        <Pressable onPress={() => setView('three-quarter')} style={[styles.viewButton, view === 'three-quarter' && { backgroundColor: colors.accentSoft }]}><Text style={{ fontSize: 9, fontWeight: '900', color: view === 'three-quarter' ? colors.accent : colors.muted }}>3/4</Text></Pressable>
        <Pressable onPress={() => setView('side')} style={[styles.viewButton, view === 'side' && { backgroundColor: colors.accentSoft }]}><Text style={{ fontSize: 9, fontWeight: '900', color: view === 'side' ? colors.accent : colors.muted }}>LADO</Text></Pressable>
      </View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  shell: { borderWidth: 1, borderRadius: 26, overflow: 'hidden', position: 'relative' },
  badge: { position: 'absolute', top: 12, left: 12, borderWidth: 1, borderRadius: 999, height: 32, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  bottomControls: { position: 'absolute', bottom: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  controlGroup: { borderWidth: 1, borderRadius: 15, padding: 4, flexDirection: 'row', alignItems: 'center' },
  control: { width: 34, height: 32, alignItems: 'center', justifyContent: 'center' },
  speed: { minWidth: 38, height: 32, alignItems: 'center', justifyContent: 'center' },
  viewButton: { paddingHorizontal: 9, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }
});
