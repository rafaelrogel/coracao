'use client'

import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMedicalStore } from '@/store/useMedicalStore'
import { ArteryType, ArteryConfig, DiagnosisData, ConditionType } from '@/types/medical'
import * as THREE from 'three'

const ARTERY_CONFIG: Record<ArteryType, ArteryConfig> = {
  LAD: { id: 'LAD', name: 'Artéria Descendente Anterior', position: [-0.3, 0.5, 0.4], rotation: [0.3, 0, -0.4], length: 2.5, radius: 0.08, color: '#dc2626' },
  RCA: { id: 'RCA', name: 'Artéria Coronária Direita', position: [0.5, 0.3, 0.2], rotation: [0.2, 0, 0.6], length: 2.2, radius: 0.08, color: '#dc2626' },
  LCx: { id: 'LCx', name: 'Artéria Circunflexa', position: [-0.4, 0.2, -0.3], rotation: [-0.4, 0.3, -0.3], length: 2.0, radius: 0.07, color: '#dc2626' },
  LMCA: { id: 'LMCA', name: 'Tronco da Coronária Esquerda', position: [-0.15, 0.6, 0.1], rotation: [0.1, 0, -0.2], length: 0.8, radius: 0.1, color: '#dc2626' },
  carotid_left: { id: 'carotid_left', name: 'Carótida Esquerda', position: [-0.4, 1.8, 0], rotation: [0, 0, 0.1], length: 1.5, radius: 0.1, color: '#3b82f6' },
  carotid_right: { id: 'carotid_right', name: 'Carótida Direita', position: [0.4, 1.8, 0], rotation: [0, 0, -0.1], length: 1.5, radius: 0.1, color: '#3b82f6' },
  aorta: { id: 'aorta', name: 'Aorta', position: [0, 1.0, 0], rotation: [0, 0, 0], length: 1.8, radius: 0.18, color: '#ef4444' },
  pulmonary: { id: 'pulmonary', name: 'Artéria Pulmonar', position: [0.2, 0.9, 0.3], rotation: [0.2, 0.3, 0.2], length: 1.2, radius: 0.14, color: '#8b5cf6' },
}

const CONDITION_COLORS: Record<ConditionType, string> = {
  stenosis: '#fbbf24', plaque: '#f97316', aneurysm: '#ef4444', occlusion: '#7f1d1d',
  calcification: '#e5e7eb', dissection: '#dc2626', thrombus: '#991b1b', atheroma: '#ea580c',
}

function Heart() {
  const ref = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (ref.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.04
      ref.current.scale.setScalar(scale)
    }
  })

  return (
    <group ref={ref}>
      <mesh><sphereGeometry args={[0.75, 32, 32]} /><meshStandardMaterial color="#b91c1c" /></mesh>
      <mesh position={[-0.3, -0.2, 0.2]}><sphereGeometry args={[0.45, 32, 32]} /><meshStandardMaterial color="#991b1b" /></mesh>
      <mesh position={[0.35, -0.15, 0.15]}><sphereGeometry args={[0.4, 32, 32]} /><meshStandardMaterial color="#b91c1c" /></mesh>
      <mesh position={[-0.25, 0.5, -0.1]}><sphereGeometry args={[0.35, 32, 32]} /><meshStandardMaterial color="#dc2626" /></mesh>
      <mesh position={[0.3, 0.45, 0]}><sphereGeometry args={[0.32, 32, 32]} /><meshStandardMaterial color="#dc2626" /></mesh>
      <mesh position={[0, -0.7, 0.1]}><coneGeometry args={[0.35, 0.5, 32]} /><meshStandardMaterial color="#991b1b" /></mesh>
    </group>
  )
}

function Aorta() {
  return (
    <group position={[0, 0.8, 0]}>
      <mesh><cylinderGeometry args={[0.15, 0.18, 1.2, 32]} /><meshStandardMaterial color="#ef4444" /></mesh>
      <mesh position={[0.3, 0.5, 0]} rotation={[0, 0, -Math.PI / 3]}><cylinderGeometry args={[0.13, 0.15, 0.6, 32]} /><meshStandardMaterial color="#ef4444" /></mesh>
    </group>
  )
}

function Artery({ config, diagnosis }: { config: ArteryConfig; diagnosis: DiagnosisData | null }) {
  const isAffected = diagnosis?.artery === config.id
  const markerRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (markerRef.current && isAffected) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.3
      markerRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group position={config.position} rotation={config.rotation}>
      <mesh>
        <cylinderGeometry args={[config.radius, config.radius, config.length, 16]} />
        <meshStandardMaterial 
          color={isAffected ? CONDITION_COLORS[diagnosis!.type] : config.color} 
          transparent={isAffected}
          opacity={isAffected ? 0.8 : 1}
        />
      </mesh>
      {isAffected && (
        <mesh ref={markerRef} position={[0, -config.length * 0.1, 0]}>
          <torusGeometry args={[config.radius * 2.5, 0.03, 8, 32]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
        </mesh>
      )}
    </group>
  )
}

function Scene() {
  const diagnosis = useMedicalStore((s) => s.diagnosis)
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} />
      <Heart />
      <Aorta />
      {Object.values(ARTERY_CONFIG)
        .filter(c => c.id !== 'aorta' && c.id !== 'pulmonary')
        .map((config) => <Artery key={config.id} config={config} diagnosis={diagnosis} />)}
      <OrbitControls autoRotate autoRotateSpeed={0.5} minDistance={2} maxDistance={10} />
    </>
  )
}

interface Scene3DProps {
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void
  className?: string
}

export default function Scene3D({ onCanvasReady, className = '' }: Scene3DProps) {
  const diagnosis = useMedicalStore((s) => s.diagnosis)

  return (
    <div className={`w-full h-full bg-gradient-to-b from-clinical-navy to-slate-900 rounded-xl overflow-hidden relative ${className}`}>
      <Canvas
        camera={{ position: [0, 1, 5], fov: 45 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => onCanvasReady?.(gl.domElement)}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      
      <div className="absolute bottom-4 left-4 text-xs text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg">
        Arraste para rotacionar | Scroll para zoom
      </div>

      {diagnosis && (
        <div className="absolute top-4 left-4 bg-slate-900/90 px-4 py-2 rounded-lg border border-slate-700">
          <p className="text-white text-sm font-medium">{diagnosis.artery}: {diagnosis.blockage}%</p>
        </div>
      )}
    </div>
  )
}
