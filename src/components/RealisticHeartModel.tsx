'use client'

import { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  useGLTF, 
  useFBX,
  Html, 
  Environment, 
  ContactShadows,
  Center,
  Stage,
  PresentationControls
} from '@react-three/drei'
import * as THREE from 'three'
import { useMedicalStore } from '@/store/useMedicalStore'
import { DiagnosisData, ConditionType } from '@/types/medical'

// Supported model paths (will try in order)
const MODEL_PATHS = [
  '/models/heart/scene.gltf',
  '/models/heart/scene.glb', 
  '/models/heart/heart.gltf',
  '/models/heart/heart.glb',
  '/models/heart/heart.fbx',
  '/models/heart/scene.fbx',
]

// Lesion marker positions for each artery (approximate positions on the model)
const ARTERY_POSITIONS: Record<string, THREE.Vector3> = {
  LAD: new THREE.Vector3(-0.3, 0.5, 0.8),
  RCA: new THREE.Vector3(0.5, 0.3, 0.5),
  LCx: new THREE.Vector3(-0.5, 0.3, 0.2),
  LMCA: new THREE.Vector3(-0.1, 0.7, 0.6),
  aorta: new THREE.Vector3(0, 1.2, 0.3),
  pulmonary: new THREE.Vector3(0.2, 1.0, 0.5),
}

const CONDITION_CONFIG: Record<ConditionType, { color: string; emissive: string; label: string }> = {
  stenosis: { color: '#fbbf24', emissive: '#b45309', label: 'Estenose' },
  plaque: { color: '#f5deb3', emissive: '#8b7355', label: 'Placa Ateromatosa' },
  aneurysm: { color: '#dc2626', emissive: '#7f1d1d', label: 'Aneurisma' },
  occlusion: { color: '#1f1f1f', emissive: '#000000', label: 'Oclusão Total' },
  calcification: { color: '#e8e8e8', emissive: '#a0a0a0', label: 'Calcificação' },
  dissection: { color: '#9333ea', emissive: '#581c87', label: 'Dissecção' },
  thrombus: { color: '#7f1d1d', emissive: '#450a0a', label: 'Trombo' },
  atheroma: { color: '#ca8a04', emissive: '#713f12', label: 'Ateroma' },
}

// GLTF Heart model component
function GLTFHeartModel({ path, scale = 7 }: { path: string; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(path)
  const clonedScene = scene.clone()

  // Heartbeat animation
  useFrame((state) => {
    if (groupRef.current) {
      const beat = Math.sin(state.clock.elapsedTime * 1.2)
      const s = 1 + beat * 0.02
      groupRef.current.scale.setScalar(s * scale)
    }
  })

  return (
    <group ref={groupRef}>
      <primitive 
        object={clonedScene} 
        position={[0, 0, 0]}
        rotation={[0, Math.PI, 0]}
      />
    </group>
  )
}

// FBX Heart model component
function FBXHeartModel({ path, scale = 0.01 }: { path: string; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const fbx = useFBX(path)
  const clonedFbx = fbx.clone()

  // Apply materials
  clonedFbx.traverse((child: any) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
      if (!child.material.map) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#8b2942',
          roughness: 0.6,
          metalness: 0.1,
        })
      }
    }
  })

  // Heartbeat animation
  useFrame((state) => {
    if (groupRef.current) {
      const beat = Math.sin(state.clock.elapsedTime * 1.2)
      const s = 1 + beat * 0.02
      groupRef.current.scale.setScalar(s * scale)
    }
  })

  return (
    <group ref={groupRef}>
      <primitive 
        object={clonedFbx} 
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  )
}

// Heart model wrapper that detects format
function HeartModel({ modelPath }: { modelPath: string }) {
  const isFBX = modelPath.toLowerCase().endsWith('.fbx')
  
  if (isFBX) {
    return <FBXHeartModel path={modelPath} />
  }
  return <GLTFHeartModel path={modelPath} />
}

// Lesion marker component
function LesionMarker({ diagnosis }: { diagnosis: DiagnosisData }) {
  const markerRef = useRef<THREE.Group>(null)
  const position = ARTERY_POSITIONS[diagnosis.artery] || new THREE.Vector3(0, 0.5, 0.5)
  const config = CONDITION_CONFIG[diagnosis.type]

  useFrame((state) => {
    if (markerRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.3
      markerRef.current.scale.setScalar(pulse)
    }
  })

  // Different visualizations based on condition
  const renderCondition = () => {
    const baseSize = 0.08

    switch (diagnosis.type) {
      case 'plaque':
      case 'atheroma':
        return (
          <>
            {[...Array(5)].map((_, i) => (
              <mesh 
                key={i}
                position={[
                  Math.sin(i * 1.2) * baseSize,
                  Math.cos(i * 1.2) * baseSize,
                  (i - 2) * 0.02
                ]}
              >
                <dodecahedronGeometry args={[baseSize * 0.4 * (0.5 + Math.random() * 0.5), 1]} />
                <meshStandardMaterial 
                  color={config.color}
                  roughness={0.8}
                  emissive={config.emissive}
                  emissiveIntensity={0.3}
                />
              </mesh>
            ))}
          </>
        )

      case 'calcification':
        return (
          <>
            {[...Array(6)].map((_, i) => (
              <mesh 
                key={i}
                position={[
                  Math.sin(i * 1.0) * baseSize,
                  Math.cos(i * 1.0) * baseSize,
                  (i - 3) * 0.015
                ]}
                rotation={[Math.random(), Math.random(), Math.random()]}
              >
                <octahedronGeometry args={[baseSize * 0.3, 0]} />
                <meshStandardMaterial 
                  color="#ffffff"
                  roughness={0.1}
                  metalness={0.5}
                />
              </mesh>
            ))}
          </>
        )

      case 'thrombus':
        return (
          <>
            <mesh>
              <sphereGeometry args={[baseSize * 1.2, 16, 16]} />
              <meshStandardMaterial 
                color="#3d0a0a"
                roughness={0.9}
              />
            </mesh>
            {[...Array(8)].map((_, i) => (
              <mesh 
                key={i}
                rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
              >
                <cylinderGeometry args={[0.003, 0.003, baseSize * 2, 4]} />
                <meshBasicMaterial color="#5a1a1a" />
              </mesh>
            ))}
          </>
        )

      case 'aneurysm':
        return (
          <mesh>
            <sphereGeometry args={[baseSize * (1.5 + diagnosis.blockage / 100), 32, 32]} />
            <meshStandardMaterial 
              color="#a83252"
              roughness={0.4}
              transparent
              opacity={0.8}
              emissive={config.emissive}
              emissiveIntensity={0.2}
            />
          </mesh>
        )

      case 'dissection':
        return (
          <>
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <torusGeometry args={[baseSize, 0.01, 8, 32, Math.PI * 1.5]} />
              <meshStandardMaterial color="#9333ea" />
            </mesh>
            <mesh position={[baseSize * 0.5, 0, 0]}>
              <sphereGeometry args={[baseSize * 0.4, 12, 12]} />
              <meshStandardMaterial color="#7f1d1d" transparent opacity={0.8} />
            </mesh>
          </>
        )

      default: // stenosis, occlusion
        return (
          <>
            <mesh>
              <torusGeometry args={[baseSize * 1.5, baseSize * 0.3, 16, 32]} />
              <meshStandardMaterial 
                color={config.color}
                emissive={config.emissive}
                emissiveIntensity={0.4}
              />
            </mesh>
            {diagnosis.blockage > 50 && (
              <mesh>
                <cylinderGeometry args={[baseSize * diagnosis.blockage / 100, baseSize * diagnosis.blockage / 100, 0.03, 16]} />
                <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
              </mesh>
            )}
          </>
        )
    }
  }

  return (
    <group position={position}>
      <group ref={markerRef}>
        {renderCondition()}
      </group>
      
      {/* Glow effect */}
      <pointLight color={config.color} intensity={0.5} distance={0.5} />
      
      {/* Info tooltip */}
      <Html position={[0.15, 0.1, 0]} distanceFactor={2}>
        <div className="bg-black/90 border-2 border-red-500 rounded-lg p-3 text-white text-xs min-w-[160px] shadow-2xl backdrop-blur-sm pointer-events-none">
          <div className="text-red-400 font-bold text-sm mb-1">{config.label}</div>
          <div className="text-gray-300">{diagnosis.artery}</div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  diagnosis.blockage > 70 ? 'bg-red-500' :
                  diagnosis.blockage > 50 ? 'bg-orange-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${diagnosis.blockage}%` }}
              />
            </div>
            <span className="font-bold">{diagnosis.blockage}%</span>
          </div>
        </div>
      </Html>
    </group>
  )
}

// Camera controller
function CameraController({ diagnosis }: { diagnosis: DiagnosisData | null }) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    if (diagnosis && controlsRef.current) {
      const targetPosition = ARTERY_POSITIONS[diagnosis.artery]
      if (targetPosition) {
        controlsRef.current.target.lerp(targetPosition, 0.1)
      }
    }
  }, [diagnosis])

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={0.5}
      maxDistance={5}
      autoRotate={!diagnosis}
      autoRotateSpeed={0.5}
      zoomSpeed={1.5}
    />
  )
}

// Loading fallback
function LoadingFallback() {
  return (
    <Html center>
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-white mt-4">Carregando modelo anatomico...</p>
      </div>
    </Html>
  )
}

// Error fallback (when model not found)
function ModelNotFound() {
  return (
    <Html center>
      <div className="text-center max-w-md p-6 bg-slate-900/95 rounded-xl border border-slate-700">
        <div className="text-4xl mb-4">❤️</div>
        <h3 className="text-white font-bold text-lg mb-2">Modelo 3D nao encontrado</h3>
        <p className="text-slate-400 text-sm mb-3">
          Baixe um modelo e coloque em uma destas pastas:
        </p>
        <div className="text-xs bg-slate-800 px-3 py-2 rounded text-left text-green-400 space-y-1">
          <div>public/models/heart/scene.gltf</div>
          <div>public/models/heart/scene.glb</div>
          <div>public/models/heart/heart.fbx</div>
        </div>
        <p className="text-slate-500 text-xs mt-3">Formatos: GLTF, GLB ou FBX</p>
        <div className="flex gap-2 mt-4 justify-center">
          <a 
            href="https://www.get3dmodels.com/anatomy/human-heart/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs"
          >
            Get3DModels
          </a>
          <a 
            href="https://free3d.com/3d-models/heart"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs"
          >
            Free3D
          </a>
          <a 
            href="https://sketchfab.com/3d-models/realistic-human-heart-3f8072336ce94d18b3d0d055a1ece089"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs"
          >
            Sketchfab
          </a>
        </div>
      </div>
    </Html>
  )
}

// Scene content
function SceneContent({ diagnosis }: { diagnosis: DiagnosisData | null }) {
  const [modelPath, setModelPath] = useState<string | null>(null)
  const [modelError, setModelError] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check which model exists
    const checkModels = async () => {
      for (const path of MODEL_PATHS) {
        try {
          const res = await fetch(path, { method: 'HEAD' })
          if (res.ok) {
            setModelPath(path)
            setChecking(false)
            return
          }
        } catch {
          continue
        }
      }
      setModelError(true)
      setChecking(false)
    }
    checkModels()
  }, [])

  if (checking) {
    return <LoadingFallback />
  }

  if (modelError || !modelPath) {
    return <ModelNotFound />
  }

  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <HeartModel modelPath={modelPath} />
        {diagnosis && <LesionMarker diagnosis={diagnosis} />}
      </Suspense>
      <CameraController diagnosis={diagnosis} />
    </>
  )
}

interface RealisticHeartModelProps {
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void
  className?: string
}

export default function RealisticHeartModel({ onCanvasReady, className = '' }: RealisticHeartModelProps) {
  const diagnosis = useMedicalStore((s) => s.diagnosis)

  return (
    <div className={`w-full h-full bg-gradient-to-b from-gray-950 via-slate-900 to-black rounded-xl overflow-hidden relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        gl={{ 
          antialias: true, 
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5
        }}
        shadows
        onCreated={({ gl }) => onCanvasReady?.(gl.domElement)}
      >
        <color attach="background" args={['#0a0a12']} />
        
        {/* Lighting for realistic tissue */}
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1.5} 
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-3, 3, -3]} intensity={0.7} color="#ffcccc" />
        <pointLight position={[0, 2, 2]} intensity={0.5} color="#ff9999" />
        <spotLight 
          position={[0, 5, 0]} 
          intensity={0.5} 
          angle={0.5} 
          penumbra={0.8}
          castShadow
        />

        <SceneContent diagnosis={diagnosis} />

        <Environment preset="studio" />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={4} blur={2.5} />
      </Canvas>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span>🖱️ Rotacionar</span>
          <span>🔍 Zoom</span>
          <span>⇧ Mover</span>
        </div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-600">
        Modelo: neshallads (Sketchfab CC-BY)
      </div>

      {/* Diagnosis info */}
      {diagnosis && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-red-400 font-medium text-sm">Lesao Detectada</span>
          </div>
          <div className="text-white font-semibold">{diagnosis.artery}</div>
          <div className="text-gray-400 text-sm">{CONDITION_CONFIG[diagnosis.type]?.label}</div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Obstrucao</span>
              <span className="text-white font-bold">{diagnosis.blockage}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  diagnosis.blockage > 70 ? 'bg-red-500' :
                  diagnosis.blockage > 50 ? 'bg-orange-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${diagnosis.blockage}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
