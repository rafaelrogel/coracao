'use client'

import React, { useRef, useMemo, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { useMedicalStore } from '@/store/useMedicalStore'
import { ArteryType, ArteryConfig, DiagnosisData, ConditionType } from '@/types/medical'

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
  aorta: {
    id: 'aorta',
    name: 'Aorta',
    position: [0, 1.0, 0],
    rotation: [0, 0, 0],
    length: 1.8,
    radius: 0.18,
    color: '#ef4444',
  },
  pulmonary: {
    id: 'pulmonary',
    name: 'Artéria Pulmonar',
    position: [0.2, 0.9, 0.3],
    rotation: [0.2, 0.3, 0.2],
    length: 1.2,
    radius: 0.14,
    color: '#8b5cf6',
  },
}

const CONDITION_COLORS: Record<ConditionType, string> = {
  stenosis: '#fbbf24',
  plaque: '#f97316',
  aneurysm: '#ef4444',
  occlusion: '#7f1d1d',
  calcification: '#e5e7eb',
  dissection: '#dc2626',
  thrombus: '#991b1b',
  atheroma: '#ea580c',
}

function Heart() {
  const heartRef = useRef<THREE.Group>(null)
  const leftVentricle = useRef<THREE.Mesh>(null)
  const rightVentricle = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (heartRef.current) {
      const beat = Math.sin(state.clock.elapsedTime * 1.2)
      const scale = 1 + beat * 0.04
      heartRef.current.scale.set(scale, scale, scale)
    }
    if (leftVentricle.current) {
      const beat = Math.sin(state.clock.elapsedTime * 1.2 + 0.2)
      leftVentricle.current.scale.x = 1 + beat * 0.05
    }
    if (rightVentricle.current) {
      const beat = Math.sin(state.clock.elapsedTime * 1.2 + 0.4)
      rightVentricle.current.scale.x = 1 + beat * 0.05
    }
  })

  return (
    <group ref={heartRef} position={[0, 0, 0]}>
      {/* Main heart body */}
      <mesh>
        <sphereGeometry args={[0.75, 32, 32]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.6} metalness={0.1} />
      </mesh>
      
      {/* Left ventricle */}
      <mesh ref={leftVentricle} position={[-0.3, -0.2, 0.2]} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color="#991b1b" roughness={0.6} metalness={0.1} />
      </mesh>
      
      {/* Right ventricle */}
      <mesh ref={rightVentricle} position={[0.35, -0.15, 0.15]} rotation={[0, 0, -0.2]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Left atrium */}
      <mesh position={[-0.25, 0.5, -0.1]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#dc2626" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Right atrium */}
      <mesh position={[0.3, 0.45, 0]}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color="#dc2626" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Apex */}
      <mesh position={[0, -0.7, 0.1]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.35, 0.5, 32]} />
        <meshStandardMaterial color="#991b1b" roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  )
}

function Aorta({ diagnosis }: { diagnosis: DiagnosisData | null }) {
  const isAffected = diagnosis?.artery === 'aorta'
  const aortaRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (aortaRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.02
      aortaRef.current.scale.set(pulse, 1, pulse)
    }
  })

  return (
    <group ref={aortaRef} position={[0, 0.8, 0]}>
      {/* Ascending aorta */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 1.2, 32]} />
        <meshStandardMaterial 
          color={isAffected ? CONDITION_COLORS[diagnosis.type] : "#ef4444"} 
          roughness={0.5} 
        />
      </mesh>
      
      {/* Aortic arch */}
      <mesh position={[0.3, 0.5, 0]} rotation={[0, 0, -Math.PI / 3]}>
        <cylinderGeometry args={[0.13, 0.15, 0.6, 32]} />
        <meshStandardMaterial color="#ef4444" roughness={0.5} />
      </mesh>

      {/* Descending aorta */}
      <mesh position={[0.5, 0.3, 0]} rotation={[0.1, 0, 0.1]}>
        <cylinderGeometry args={[0.12, 0.13, 0.8, 32]} />
        <meshStandardMaterial color="#ef4444" roughness={0.5} />
      </mesh>

      {isAffected && (
        <Html position={[0.5, 0.8, 0]} distanceFactor={4}>
          <div className="bg-slate-900/95 px-3 py-2 rounded-lg border border-red-500 text-white text-xs whitespace-nowrap">
            <strong>Aorta</strong><br />
            {diagnosis.type}: {diagnosis.blockage}%
          </div>
        </Html>
      )}
    </group>
  )
}

interface ConditionVisualizationProps {
  type: ConditionType
  position: [number, number, number]
  severity: number
  radius: number
}

function ConditionVisualization({ type, position, severity, radius }: ConditionVisualizationProps) {
  const ref = useRef<THREE.Mesh>(null)
  const color = CONDITION_COLORS[type]

  useFrame((state) => {
    if (ref.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.15
      ref.current.scale.set(pulse, pulse, pulse)
    }
  })

  const renderCondition = () => {
    switch (type) {
      case 'aneurysm':
        return (
          <mesh ref={ref} position={position}>
            <sphereGeometry args={[radius * 2.5 * (severity / 100 + 0.5), 16, 16]} />
            <meshStandardMaterial 
              color={color} 
              transparent 
              opacity={0.8}
              roughness={0.3}
            />
          </mesh>
        )

      case 'plaque':
      case 'atheroma':
        return (
          <group position={position}>
            <mesh ref={ref}>
              <torusGeometry args={[radius * 1.2, radius * 0.4 * (severity / 100), 8, 16]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
            <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 4, 0, 0]}>
              <torusGeometry args={[radius * 1.1, radius * 0.3 * (severity / 100), 8, 16]} />
              <meshStandardMaterial color={color} roughness={0.7} opacity={0.7} transparent />
            </mesh>
          </group>
        )

      case 'calcification':
        return (
          <group position={position}>
            {[...Array(Math.ceil(severity / 25))].map((_, i) => (
              <mesh 
                key={i} 
                ref={i === 0 ? ref : undefined}
                position={[
                  Math.sin(i * 1.5) * radius * 0.8,
                  Math.cos(i * 1.5) * radius * 0.8,
                  0
                ]}
              >
                <dodecahedronGeometry args={[radius * 0.3, 0]} />
                <meshStandardMaterial color="#e5e7eb" roughness={0.2} metalness={0.3} />
              </mesh>
            ))}
          </group>
        )

      case 'thrombus':
        return (
          <mesh ref={ref} position={position}>
            <sphereGeometry args={[radius * 1.5 * (severity / 100 + 0.3), 12, 12]} />
            <meshStandardMaterial 
              color={color} 
              roughness={0.9}
              transparent
              opacity={0.85}
            />
          </mesh>
        )

      case 'dissection':
        return (
          <group position={position}>
            <mesh ref={ref} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[radius * 3, radius * 0.1, radius * 0.5]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[radius, 0, 0]}>
              <coneGeometry args={[radius * 0.3, radius * 0.6, 8]} />
              <meshStandardMaterial color="#7f1d1d" />
            </mesh>
          </group>
        )

      case 'occlusion':
        return (
          <mesh ref={ref} position={position}>
            <cylinderGeometry args={[radius * 0.9, radius * 0.9, radius * 0.5, 16]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        )

      default: // stenosis
        return (
          <mesh ref={ref} position={position}>
            <torusGeometry args={[radius * 1.5, 0.02, 8, 32]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color}
              emissiveIntensity={0.5}
            />
          </mesh>
        )
    }
  }

  return renderCondition()
}

interface ArteryProps {
  config: ArteryConfig
  diagnosis: DiagnosisData | null
}

function Artery({ config, diagnosis }: ArteryProps) {
  const isAffected = diagnosis?.artery === config.id
  const blockagePercent = isAffected ? diagnosis.blockage : 0
  const conditionType = isAffected ? diagnosis.type : 'stenosis'

  const geometry = useMemo(() => {
    if (!isAffected || blockagePercent < 20) {
      return <cylinderGeometry args={[config.radius, config.radius, config.length, 16]} />
    }

    const points: THREE.Vector2[] = []
    const segments = 30
    const blockagePosition = 0.4

    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const y = t * config.length - config.length / 2
      let radius = config.radius

      if (conditionType === 'aneurysm') {
        const distFromBlockage = Math.abs(t - blockagePosition)
        if (distFromBlockage < 0.2) {
          const factor = 1 + (blockagePercent / 100) * (1 - distFromBlockage / 0.2) * 1.5
          radius *= factor
        }
      } else if (conditionType === 'stenosis' || conditionType === 'occlusion') {
        const distFromBlockage = Math.abs(t - blockagePosition)
        if (distFromBlockage < 0.15) {
          const factor = 1 - (blockagePercent / 100) * (1 - distFromBlockage / 0.15)
          radius *= Math.max(0.1, factor)
        }
      }

      points.push(new THREE.Vector2(radius, y))
    }

    return <latheGeometry args={[points, 16]} />
  }, [isAffected, blockagePercent, conditionType, config.radius, config.length])

  const conditionPosition: [number, number, number] = [0, config.length * -0.1, 0]

  return (
    <group position={config.position} rotation={config.rotation}>
      <mesh>
        {geometry}
        <meshStandardMaterial
          color={isAffected ? CONDITION_COLORS[conditionType] : config.color}
          roughness={0.5}
          metalness={0.2}
          transparent={isAffected}
          opacity={isAffected ? 0.85 : 1}
        />
      </mesh>

      {isAffected && (
        <>
          <ConditionVisualization
            type={conditionType}
            position={conditionPosition}
            severity={blockagePercent}
            radius={config.radius}
          />

          <Html
            position={[0.4, 0, 0]}
            distanceFactor={4}
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              padding: '10px 14px',
              borderRadius: '8px',
              border: `2px solid ${CONDITION_COLORS[conditionType]}`,
              color: 'white',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            <div>
              <strong style={{ color: CONDITION_COLORS[conditionType] }}>{config.name}</strong>
              <br />
              <span style={{ textTransform: 'capitalize' }}>{conditionType}</span>: {blockagePercent}%
              {diagnosis.severity && (
                <><br /><span style={{ opacity: 0.8 }}>Severidade: {diagnosis.severity}</span></>
              )}
            </div>
          </Html>
        </>
      )}
    </group>
  )
}

function PulmonaryArtery({ diagnosis }: { diagnosis: DiagnosisData | null }) {
  const isAffected = diagnosis?.artery === 'pulmonary'
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (ref.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.2 + 0.5) * 0.02
      ref.current.scale.set(pulse, 1, pulse)
    }
  })

  return (
    <group ref={ref} position={[0.15, 0.75, 0.25]}>
      <mesh rotation={[-0.3, 0.2, 0.3]}>
        <cylinderGeometry args={[0.12, 0.14, 0.8, 32]} />
        <meshStandardMaterial 
          color={isAffected ? CONDITION_COLORS[diagnosis.type] : "#8b5cf6"} 
          roughness={0.5} 
        />
      </mesh>
      
      {/* Left branch */}
      <mesh position={[-0.3, 0.35, 0]} rotation={[0, 0, 0.8]}>
        <cylinderGeometry args={[0.08, 0.1, 0.6, 32]} />
        <meshStandardMaterial color="#8b5cf6" roughness={0.5} />
      </mesh>

      {/* Right branch */}
      <mesh position={[0.25, 0.3, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.08, 0.1, 0.5, 32]} />
        <meshStandardMaterial color="#8b5cf6" roughness={0.5} />
      </mesh>

      {isAffected && (
        <Html position={[0.5, 0.5, 0]} distanceFactor={4}>
          <div className="bg-slate-900/95 px-3 py-2 rounded-lg border border-purple-500 text-white text-xs whitespace-nowrap">
            <strong>Artéria Pulmonar</strong><br />
            {diagnosis.type}: {diagnosis.blockage}%
          </div>
        </Html>
      )}
    </group>
  )
}

function VascularSystem() {
  const diagnosis = useMedicalStore((s) => s.diagnosis)

  return (
    <group>
      <Heart />
      <Aorta diagnosis={diagnosis} />
      <PulmonaryArtery diagnosis={diagnosis} />
      {Object.values(ARTERY_CONFIG)
        .filter(c => c.id !== 'aorta' && c.id !== 'pulmonary')
        .map((config) => (
          <Artery key={config.id} config={config} diagnosis={diagnosis} />
        ))}
    </group>
  )
}

function CameraController() {
  const { camera } = useThree()
  const cameraTarget = useMedicalStore((s) => s.cameraTarget)

  useEffect(() => {
    camera.lookAt(...cameraTarget)
  }, [camera, cameraTarget])

  return null
}

interface HeartViewerProps {
  className?: string
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void
}

export default function HeartViewer({ className = '', onCanvasReady }: HeartViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isPresentationMode = useMedicalStore((s) => s.isPresentationMode)
  const diagnosis = useMedicalStore((s) => s.diagnosis)

  const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    if (onCanvasReady) {
      onCanvasReady(gl.domElement)
    }
  }, [onCanvasReady])

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full bg-gradient-to-b from-clinical-navy to-slate-900 rounded-xl overflow-hidden relative ${className}`}
    >
      <Canvas
        camera={{ position: [0, 1, 5], fov: 45 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        onCreated={handleCreated}
      >
        <CameraController />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} />
        <pointLight position={[0, 2, 0]} intensity={0.3} color="#ff6b6b" />
        <spotLight position={[0, 5, 0]} intensity={0.5} angle={0.5} penumbra={0.5} />

        <VascularSystem />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          autoRotate={!isPresentationMode}
          autoRotateSpeed={0.5}
        />

        <Environment preset="studio" />
      </Canvas>

      {!isPresentationMode && (
        <div className="absolute bottom-4 left-4 text-xs text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg">
          Arraste para rotacionar | Scroll para zoom
        </div>
      )}

      {isPresentationMode && diagnosis && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm px-8 py-4 rounded-xl border border-clinical-accent">
          <p className="text-white text-center text-lg">
            {diagnosis.patient_explanation}
          </p>
        </div>
      )}
    </div>
  )
}
