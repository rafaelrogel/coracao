'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useMedicalStore } from '@/store/useMedicalStore'
import { ArteryType, ArteryConfig, DiagnosisData } from '@/types/medical'

const ARTERY_CONFIG: Record<ArteryType, ArteryConfig> = {
  LAD: {
    id: 'LAD',
    name: 'Artéria Descendente Anterior',
    position: [-0.3, 0.5, 0.4],
    rotation: [0.3, 0, -0.4],
    length: 2.5,
    radius: 0.08,
    color: '#dc2626',
  },
  RCA: {
    id: 'RCA',
    name: 'Artéria Coronária Direita',
    position: [0.5, 0.3, 0.2],
    rotation: [0.2, 0, 0.6],
    length: 2.2,
    radius: 0.08,
    color: '#dc2626',
  },
  LCx: {
    id: 'LCx',
    name: 'Artéria Circunflexa',
    position: [-0.4, 0.2, -0.3],
    rotation: [-0.4, 0.3, -0.3],
    length: 2.0,
    radius: 0.07,
    color: '#dc2626',
  },
  LMCA: {
    id: 'LMCA',
    name: 'Tronco da Coronária Esquerda',
    position: [-0.15, 0.6, 0.1],
    rotation: [0.1, 0, -0.2],
    length: 0.8,
    radius: 0.1,
    color: '#dc2626',
  },
  carotid_left: {
    id: 'carotid_left',
    name: 'Carótida Interna Esquerda',
    position: [-0.4, 1.8, 0],
    rotation: [0, 0, 0.1],
    length: 1.5,
    radius: 0.1,
    color: '#3b82f6',
  },
  carotid_right: {
    id: 'carotid_right',
    name: 'Carótida Interna Direita',
    position: [0.4, 1.8, 0],
    rotation: [0, 0, -0.1],
    length: 1.5,
    radius: 0.1,
    color: '#3b82f6',
  },
}

function Heart() {
  const heartRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (heartRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.03
      heartRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <mesh ref={heartRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial
        color="#b91c1c"
        roughness={0.6}
        metalness={0.1}
      />
    </mesh>
  )
}

function Aorta() {
  return (
    <group position={[0, 0.8, 0]}>
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 1.2, 32]} />
        <meshStandardMaterial color="#ef4444" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.6, 0]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.8, 32]} />
        <meshStandardMaterial color="#ef4444" roughness={0.5} />
      </mesh>
    </group>
  )
}

interface ArteryProps {
  config: ArteryConfig
  diagnosis: DiagnosisData | null
}

function Artery({ config, diagnosis }: ArteryProps) {
  const markerRef = useRef<THREE.Mesh>(null)
  const isAffected = diagnosis?.artery === config.id
  const blockagePercent = isAffected ? diagnosis.blockage : 0

  useFrame((state) => {
    if (markerRef.current && isAffected) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2
      markerRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  const geometry = useMemo(() => {
    if (!isAffected || blockagePercent < 20) {
      return <cylinderGeometry args={[config.radius, config.radius, config.length, 16]} />
    }

    const points: THREE.Vector2[] = []
    const segments = 20
    const blockagePosition = 0.4

    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const y = t * config.length - config.length / 2
      let radius = config.radius

      const distFromBlockage = Math.abs(t - blockagePosition)
      if (distFromBlockage < 0.15) {
        const factor = 1 - (blockagePercent / 100) * (1 - distFromBlockage / 0.15)
        radius *= Math.max(0.2, factor)
      }

      points.push(new THREE.Vector2(radius, y))
    }

    return <latheGeometry args={[points, 16]} />
  }, [isAffected, blockagePercent, config.radius, config.length])

  return (
    <group
      position={config.position}
      rotation={config.rotation}
    >
      <mesh>
        {geometry}
        <meshStandardMaterial
          color={isAffected ? '#fbbf24' : config.color}
          roughness={0.5}
          metalness={0.2}
          transparent={isAffected}
          opacity={isAffected ? 0.85 : 1}
        />
      </mesh>

      {isAffected && (
        <>
          <mesh
            ref={markerRef}
            position={[0, config.length * -0.1, 0]}
          >
            <torusGeometry args={[config.radius * 2, 0.02, 8, 32]} />
            <meshStandardMaterial
              color="#ef4444"
              emissive="#ef4444"
              emissiveIntensity={0.5}
            />
          </mesh>

          <Html
            position={[0.3, 0, 0]}
            distanceFactor={4}
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #3b82f6',
              color: 'white',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            <div>
              <strong>{config.name}</strong>
              <br />
              Obstrução: {blockagePercent}%
            </div>
          </Html>
        </>
      )}
    </group>
  )
}

function VascularSystem() {
  const diagnosis = useMedicalStore((s) => s.diagnosis)

  return (
    <group>
      <Heart />
      <Aorta />
      {Object.values(ARTERY_CONFIG).map((config) => (
        <Artery key={config.id} config={config} diagnosis={diagnosis} />
      ))}
    </group>
  )
}

export default function HeartViewer() {
  return (
    <div className="w-full h-full bg-gradient-to-b from-clinical-navy to-slate-900 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 1, 5], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} />
        <pointLight position={[0, 2, 0]} intensity={0.3} color="#ff6b6b" />

        <VascularSystem />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          autoRotate
          autoRotateSpeed={0.5}
        />

        <Environment preset="studio" />
      </Canvas>

      <div className="absolute bottom-4 left-4 text-xs text-slate-400">
        Arraste para rotacionar | Scroll para zoom
      </div>
    </div>
  )
}
