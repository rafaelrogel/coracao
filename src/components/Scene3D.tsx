'use client'

import { useRef, useMemo, useCallback, useEffect, useState } from 'react'
import { useMedicalStore } from '@/store/useMedicalStore'
import { ArteryType, ArteryConfig, DiagnosisData, ConditionType } from '@/types/medical'

let Canvas: any = null
let OrbitControls: any = null
let Html: any = null
let Environment: any = null
let useFrame: any = null
let useThree: any = null
let THREE: any = null

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

interface Scene3DProps {
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void
  className?: string
}

export default function Scene3D({ onCanvasReady, className = '' }: Scene3DProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const diagnosis = useMedicalStore((s) => s.diagnosis)
  const isPresentationMode = useMedicalStore((s) => s.isPresentationMode)

  useEffect(() => {
    const loadLibraries = async () => {
      try {
        const [fiberModule, dreiModule, threeModule] = await Promise.all([
          import('@react-three/fiber'),
          import('@react-three/drei'),
          import('three'),
        ])

        Canvas = fiberModule.Canvas
        useFrame = fiberModule.useFrame
        useThree = fiberModule.useThree
        OrbitControls = dreiModule.OrbitControls
        Html = dreiModule.Html
        Environment = dreiModule.Environment
        THREE = threeModule

        setIsLoaded(true)
      } catch (err) {
        console.error('Failed to load 3D libraries:', err)
        setError('Erro ao carregar bibliotecas 3D')
      }
    }

    loadLibraries()
  }, [])

  const handleCreated = useCallback(({ gl }: { gl: any }) => {
    if (onCanvasReady) {
      onCanvasReady(gl.domElement)
    }
  }, [onCanvasReady])

  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-clinical-navy rounded-xl ${className}`}>
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-clinical-navy rounded-xl ${className}`}>
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-clinical-accent border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-400 mt-4">Carregando modelo 3D...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full h-full bg-gradient-to-b from-clinical-navy to-slate-900 rounded-xl overflow-hidden relative ${className}`}>
      <Canvas
        camera={{ position: [0, 1, 5], fov: 45 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        onCreated={handleCreated}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} />
        <pointLight position={[0, 2, 0]} intensity={0.3} color="#ff6b6b" />
        
        <Heart />
        <Aorta diagnosis={diagnosis} />
        {Object.values(ARTERY_CONFIG)
          .filter(c => c.id !== 'aorta' && c.id !== 'pulmonary')
          .map((config) => (
            <Artery key={config.id} config={config} diagnosis={diagnosis} />
          ))}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          autoRotate={!isPresentationMode}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {!isPresentationMode && (
        <div className="absolute bottom-4 left-4 text-xs text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg">
          Arraste para rotacionar | Scroll para zoom
        </div>
      )}

      {isPresentationMode && diagnosis && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm px-8 py-4 rounded-xl border border-clinical-accent max-w-2xl">
          <p className="text-white text-center text-lg">
            {diagnosis.patient_explanation}
          </p>
        </div>
      )}
    </div>
  )
}

function Heart() {
  const heartRef = useRef<any>(null)

  useFrame?.((state: any) => {
    if (heartRef.current) {
      const beat = Math.sin(state.clock.elapsedTime * 1.2)
      const scale = 1 + beat * 0.04
      heartRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group ref={heartRef} position={[0, 0, 0]}>
      <mesh>
        <sphereGeometry args={[0.75, 32, 32]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[-0.3, -0.2, 0.2]} rotation={[0, 0, 0.3]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color="#991b1b" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0.35, -0.15, 0.15]} rotation={[0, 0, -0.2]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[-0.25, 0.5, -0.1]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#dc2626" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0.3, 0.45, 0]}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color="#dc2626" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, -0.7, 0.1]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.35, 0.5, 32]} />
        <meshStandardMaterial color="#991b1b" roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  )
}

function Aorta({ diagnosis }: { diagnosis: DiagnosisData | null }) {
  const isAffected = diagnosis?.artery === 'aorta'

  return (
    <group position={[0, 0.8, 0]}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.18, 1.2, 32]} />
        <meshStandardMaterial 
          color={isAffected ? CONDITION_COLORS[diagnosis.type] : "#ef4444"} 
          roughness={0.5} 
        />
      </mesh>
      <mesh position={[0.3, 0.5, 0]} rotation={[0, 0, -Math.PI / 3]}>
        <cylinderGeometry args={[0.13, 0.15, 0.6, 32]} />
        <meshStandardMaterial color="#ef4444" roughness={0.5} />
      </mesh>
      <mesh position={[0.5, 0.3, 0]} rotation={[0.1, 0, 0.1]}>
        <cylinderGeometry args={[0.12, 0.13, 0.8, 32]} />
        <meshStandardMaterial color="#ef4444" roughness={0.5} />
      </mesh>
    </group>
  )
}

function Artery({ config, diagnosis }: { config: ArteryConfig; diagnosis: DiagnosisData | null }) {
  const isAffected = diagnosis?.artery === config.id
  const blockagePercent = isAffected ? diagnosis.blockage : 0
  const conditionType = isAffected ? diagnosis.type : 'stenosis'
  const markerRef = useRef<any>(null)

  useFrame?.((state: any) => {
    if (markerRef.current && isAffected) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2
      markerRef.current.scale.set(pulse, pulse, pulse)
    }
  })

  return (
    <group position={config.position} rotation={config.rotation}>
      <mesh>
        <cylinderGeometry args={[config.radius, config.radius, config.length, 16]} />
        <meshStandardMaterial
          color={isAffected ? CONDITION_COLORS[conditionType] : config.color}
          roughness={0.5}
          metalness={0.2}
          transparent={isAffected}
          opacity={isAffected ? 0.85 : 1}
        />
      </mesh>

      {isAffected && (
        <mesh ref={markerRef} position={[0, config.length * -0.1, 0]}>
          <torusGeometry args={[config.radius * 2, 0.02, 8, 32]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  )
}
