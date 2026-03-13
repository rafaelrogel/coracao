'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import { 
  OrbitControls, 
  Html, 
  Environment, 
  ContactShadows,
  MeshTransmissionMaterial,
  useTexture,
  Caustics,
  MeshDistortMaterial
} from '@react-three/drei'
import * as THREE from 'three'
import { useMedicalStore } from '@/store/useMedicalStore'
import { DiagnosisData, ConditionType } from '@/types/medical'

// Realistic tissue material
function TissueMaterial({ 
  color = '#8b2942', 
  roughness = 0.4,
  metalness = 0.1,
  transmission = 0,
  opacity = 1,
  emissiveIntensity = 0.05
}: {
  color?: string
  roughness?: number
  metalness?: number
  transmission?: number
  opacity?: number
  emissiveIntensity?: number
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      transmission={transmission}
      thickness={0.5}
      clearcoat={0.3}
      clearcoatRoughness={0.4}
      sheen={0.5}
      sheenRoughness={0.5}
      sheenColor="#ff9999"
      transparent={opacity < 1}
      opacity={opacity}
      emissive={color}
      emissiveIntensity={emissiveIntensity}
    />
  )
}

// Create organic shape using subdivision
function createOrganicGeometry(
  baseGeometry: THREE.BufferGeometry,
  noiseScale: number = 0.1,
  noiseIntensity: number = 0.05
): THREE.BufferGeometry {
  const geometry = baseGeometry.clone()
  const positions = geometry.attributes.position
  const vertex = new THREE.Vector3()
  
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i)
    const noise = Math.sin(vertex.x * noiseScale * 10) * 
                  Math.cos(vertex.y * noiseScale * 10) * 
                  Math.sin(vertex.z * noiseScale * 10) * noiseIntensity
    vertex.multiplyScalar(1 + noise)
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }
  
  geometry.computeVertexNormals()
  return geometry
}

// Realistic left ventricle with proper shape
function LeftVentricle({ pulseFactor }: { pulseFactor: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const geometry = useMemo(() => {
    // Create elongated sphere for ventricle shape
    const geo = new THREE.SphereGeometry(0.45, 64, 64)
    geo.scale(0.9, 1.3, 1)
    
    // Add organic irregularity
    const positions = geo.attributes.position
    const vertex = new THREE.Vector3()
    
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i)
      // Add muscle texture bumps
      const noise = Math.sin(vertex.x * 15) * Math.cos(vertex.y * 12) * 0.02 +
                    Math.sin(vertex.z * 18) * 0.015
      vertex.multiplyScalar(1 + noise)
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }
    
    geo.computeVertexNormals()
    return geo
  }, [])

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + pulseFactor * 0.03)
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry} position={[-0.12, -0.25, 0.1]} castShadow receiveShadow>
      <TissueMaterial color="#7a1f3d" roughness={0.5} emissiveIntensity={0.03} />
    </mesh>
  )
}

// Realistic right ventricle (thinner wall, different shape)
function RightVentricle({ pulseFactor }: { pulseFactor: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.38, 64, 64)
    geo.scale(0.85, 1.1, 0.7)
    
    const positions = geo.attributes.position
    const vertex = new THREE.Vector3()
    
    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i)
      const noise = Math.sin(vertex.x * 12) * Math.cos(vertex.y * 15) * 0.025
      vertex.multiplyScalar(1 + noise)
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }
    
    geo.computeVertexNormals()
    return geo
  }, [])

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + pulseFactor * 0.035)
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0.22, -0.18, 0.15]} castShadow receiveShadow>
      <TissueMaterial color="#8b3a5c" roughness={0.45} emissiveIntensity={0.03} />
    </mesh>
  )
}

// Realistic atria
function LeftAtrium({ pulseFactor }: { pulseFactor: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.28, 48, 48)
    geo.scale(1, 0.85, 0.9)
    return createOrganicGeometry(geo, 0.15, 0.03)
  }, [])

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + pulseFactor * 0.02)
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry} position={[-0.18, 0.42, -0.08]} castShadow receiveShadow>
      <TissueMaterial color="#943b5c" roughness={0.4} emissiveIntensity={0.04} />
    </mesh>
  )
}

function RightAtrium({ pulseFactor }: { pulseFactor: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.26, 48, 48)
    geo.scale(1, 0.8, 0.85)
    return createOrganicGeometry(geo, 0.15, 0.03)
  }, [])

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + pulseFactor * 0.02)
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0.25, 0.38, 0]} castShadow receiveShadow>
      <TissueMaterial color="#a04666" roughness={0.4} emissiveIntensity={0.04} />
    </mesh>
  )
}

// Realistic aorta with curve
function Aorta() {
  const geometry = useMemo(() => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.5, 0.15),
      new THREE.Vector3(0, 0.75, 0.18),
      new THREE.Vector3(0.05, 0.95, 0.12),
      new THREE.Vector3(0.2, 1.1, 0),
      new THREE.Vector3(0.35, 1.05, -0.1),
      new THREE.Vector3(0.4, 0.85, -0.15),
    ])
    
    const geo = new THREE.TubeGeometry(path, 64, 0.09, 32, false)
    return createOrganicGeometry(geo, 0.2, 0.02)
  }, [])

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <TissueMaterial color="#c43c5c" roughness={0.35} emissiveIntensity={0.05} />
    </mesh>
  )
}

// Pulmonary artery
function PulmonaryArtery() {
  const geometry = useMemo(() => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, 0.55, 0.25),
      new THREE.Vector3(0.15, 0.75, 0.35),
      new THREE.Vector3(0.1, 0.9, 0.3),
      new THREE.Vector3(-0.05, 1.0, 0.2),
    ])
    
    const geo = new THREE.TubeGeometry(path, 48, 0.065, 24, false)
    return createOrganicGeometry(geo, 0.2, 0.02)
  }, [])

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <TissueMaterial color="#4a5d8a" roughness={0.4} emissiveIntensity={0.03} />
    </mesh>
  )
}

// Superior and Inferior Vena Cava
function VenaCava() {
  const svcGeometry = useMemo(() => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.28, 0.5, -0.05),
      new THREE.Vector3(0.32, 0.75, -0.08),
      new THREE.Vector3(0.3, 0.95, -0.1),
    ])
    return new THREE.TubeGeometry(path, 32, 0.055, 16, false)
  }, [])

  const ivcGeometry = useMemo(() => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.2, -0.35, -0.1),
      new THREE.Vector3(0.22, -0.15, -0.08),
      new THREE.Vector3(0.25, 0.1, -0.05),
    ])
    return new THREE.TubeGeometry(path, 32, 0.06, 16, false)
  }, [])

  return (
    <group>
      <mesh geometry={svcGeometry} castShadow>
        <TissueMaterial color="#3d4a6b" roughness={0.45} />
      </mesh>
      <mesh geometry={ivcGeometry} castShadow>
        <TissueMaterial color="#3d4a6b" roughness={0.45} />
      </mesh>
    </group>
  )
}

// Pulmonary veins
function PulmonaryVeins() {
  const geometries = useMemo(() => {
    const veins = [
      [new THREE.Vector3(-0.35, 0.55, -0.1), new THREE.Vector3(-0.22, 0.48, -0.05)],
      [new THREE.Vector3(-0.38, 0.45, -0.15), new THREE.Vector3(-0.2, 0.4, -0.08)],
      [new THREE.Vector3(-0.32, 0.35, -0.12), new THREE.Vector3(-0.18, 0.35, -0.06)],
      [new THREE.Vector3(-0.35, 0.6, 0.05), new THREE.Vector3(-0.2, 0.45, 0)],
    ]
    
    return veins.map(([start, end]) => {
      const path = new THREE.CatmullRomCurve3([start, end])
      return new THREE.TubeGeometry(path, 16, 0.025, 12, false)
    })
  }, [])

  return (
    <group>
      {geometries.map((geo, i) => (
        <mesh key={i} geometry={geo} castShadow>
          <TissueMaterial color="#8b4a6a" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// Heart apex (bottom point)
function HeartApex({ pulseFactor }: { pulseFactor: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const geometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.22, 0.35, 32)
    geo.rotateX(Math.PI)
    return createOrganicGeometry(geo, 0.15, 0.03)
  }, [])

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + pulseFactor * 0.025)
    }
  })

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0.02, -0.7, 0.08]} castShadow receiveShadow>
      <TissueMaterial color="#6b1a35" roughness={0.55} emissiveIntensity={0.02} />
    </mesh>
  )
}

// Coronary arteries with realistic appearance
function CoronaryArtery({ 
  path, 
  radius = 0.025, 
  color = '#b83c5c',
  isAffected = false,
  diagnosis
}: { 
  path: THREE.Vector3[]
  radius?: number
  color?: string
  isAffected?: boolean
  diagnosis?: DiagnosisData | null
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const lesionRef = useRef<THREE.Group>(null)
  
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(path)
    const geo = new THREE.TubeGeometry(curve, 64, radius, 16, false)
    return createOrganicGeometry(geo, 0.3, 0.01)
  }, [path, radius])

  // Lesion position at 40% of path
  const lesionPosition = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(path)
    return curve.getPoint(0.4)
  }, [path])

  useFrame((state) => {
    if (lesionRef.current && isAffected) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15
      lesionRef.current.scale.setScalar(pulse)
    }
  })

  const renderLesion = () => {
    if (!isAffected || !diagnosis) return null
    
    const blockage = diagnosis.blockage / 100
    const lesionSize = radius * 2

    switch (diagnosis.type) {
      case 'plaque':
      case 'atheroma':
        return (
          <group ref={lesionRef} position={lesionPosition}>
            {/* Fatty plaque deposit */}
            {[...Array(6)].map((_, i) => (
              <mesh 
                key={i}
                position={[
                  Math.sin(i * 1.1) * radius * 1.2,
                  Math.cos(i * 1.1) * radius * 1.2,
                  (i - 3) * 0.015
                ]}
              >
                <sphereGeometry args={[lesionSize * 0.25 * (0.5 + blockage), 12, 12]} />
                <meshPhysicalMaterial 
                  color="#e8d4a8"
                  roughness={0.9}
                  metalness={0}
                  clearcoat={0.2}
                />
              </mesh>
            ))}
            {/* Lipid core */}
            <mesh>
              <sphereGeometry args={[lesionSize * 0.35 * blockage, 16, 16]} />
              <meshPhysicalMaterial color="#f5e6c8" roughness={0.95} transparent opacity={0.9} />
            </mesh>
          </group>
        )

      case 'calcification':
        return (
          <group ref={lesionRef} position={lesionPosition}>
            {[...Array(8)].map((_, i) => (
              <mesh 
                key={i}
                position={[
                  Math.sin(i * 0.8) * radius * 1.5,
                  Math.cos(i * 0.8) * radius * 1.5,
                  (i - 4) * 0.01
                ]}
                rotation={[Math.random(), Math.random(), Math.random()]}
              >
                <octahedronGeometry args={[lesionSize * 0.15 * (0.3 + Math.random() * 0.7), 0]} />
                <meshPhysicalMaterial 
                  color="#f8f8f8"
                  roughness={0.15}
                  metalness={0.4}
                  clearcoat={0.8}
                />
              </mesh>
            ))}
          </group>
        )

      case 'thrombus':
        return (
          <group ref={lesionRef} position={lesionPosition}>
            <mesh>
              <sphereGeometry args={[lesionSize * 0.5 * (0.5 + blockage), 16, 16]} />
              <meshPhysicalMaterial 
                color="#3d0a0a"
                roughness={0.85}
                metalness={0}
                clearcoat={0.1}
              />
            </mesh>
            {/* Fibrin mesh */}
            {[...Array(8)].map((_, i) => (
              <mesh 
                key={i}
                position={[0, 0, 0]}
                rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
              >
                <cylinderGeometry args={[0.003, 0.003, lesionSize * 0.8, 4]} />
                <meshBasicMaterial color="#5a1a1a" />
              </mesh>
            ))}
          </group>
        )

      case 'aneurysm':
        return (
          <group ref={lesionRef} position={lesionPosition}>
            <mesh>
              <sphereGeometry args={[lesionSize * (1.5 + blockage), 32, 32]} />
              <meshPhysicalMaterial 
                color="#a83252"
                roughness={0.35}
                metalness={0.05}
                transparent
                opacity={0.85}
                clearcoat={0.3}
              />
            </mesh>
          </group>
        )

      default: // stenosis, occlusion
        return (
          <group ref={lesionRef} position={lesionPosition}>
            <mesh>
              <torusGeometry args={[radius * 2, radius * 0.5 * blockage, 16, 32]} />
              <meshPhysicalMaterial 
                color="#c9a86c"
                roughness={0.7}
                metalness={0.1}
              />
            </mesh>
            {blockage > 0.5 && (
              <mesh>
                <cylinderGeometry args={[radius * blockage * 0.8, radius * blockage * 0.8, 0.03, 16]} />
                <meshPhysicalMaterial color="#8b6914" roughness={0.9} />
              </mesh>
            )}
          </group>
        )
    }
  }

  return (
    <group>
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial 
          color={isAffected ? '#d4a574' : color}
          roughness={0.4}
          metalness={0.05}
          clearcoat={0.4}
          transparent={isAffected}
          opacity={isAffected ? 0.7 : 1}
        />
      </mesh>
      {renderLesion()}
      
      {/* Info label */}
      {isAffected && diagnosis && (
        <Html position={[lesionPosition.x + 0.15, lesionPosition.y + 0.1, lesionPosition.z + 0.1]}>
          <div className="bg-black/90 border border-red-500/50 rounded-lg px-3 py-2 text-white text-xs shadow-xl backdrop-blur-sm">
            <div className="text-red-400 font-bold">{diagnosis.blockage}% obstrução</div>
            <div className="text-gray-300 capitalize">{diagnosis.type}</div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Fat/connective tissue around heart
function EpicardialFat() {
  return (
    <group>
      {[...Array(5)].map((_, i) => (
        <mesh 
          key={i}
          position={[
            Math.sin(i * 1.2) * 0.4,
            -0.1 + i * 0.08,
            Math.cos(i * 1.2) * 0.35
          ]}
        >
          <sphereGeometry args={[0.08 + Math.random() * 0.04, 12, 12]} />
          <meshPhysicalMaterial 
            color="#f5e6b8"
            roughness={0.8}
            metalness={0}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

// Main heart component
function Heart({ diagnosis }: { diagnosis: DiagnosisData | null }) {
  const groupRef = useRef<THREE.Group>(null)
  const [pulseFactor, setPulseFactor] = useState(0)

  useFrame((state) => {
    const beat = Math.sin(state.clock.elapsedTime * 1.3)
    setPulseFactor(beat * 0.5 + 0.5)
    
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02
    }
  })

  // Coronary artery paths
  const ladPath = [
    new THREE.Vector3(-0.08, 0.45, 0.35),
    new THREE.Vector3(-0.15, 0.3, 0.4),
    new THREE.Vector3(-0.2, 0.1, 0.38),
    new THREE.Vector3(-0.22, -0.15, 0.32),
    new THREE.Vector3(-0.18, -0.4, 0.22),
    new THREE.Vector3(-0.12, -0.55, 0.12),
  ]

  const rcaPath = [
    new THREE.Vector3(0.12, 0.45, 0.3),
    new THREE.Vector3(0.28, 0.35, 0.25),
    new THREE.Vector3(0.38, 0.15, 0.18),
    new THREE.Vector3(0.35, -0.1, 0.1),
    new THREE.Vector3(0.25, -0.35, 0.05),
  ]

  const lcxPath = [
    new THREE.Vector3(-0.08, 0.45, 0.35),
    new THREE.Vector3(-0.2, 0.4, 0.2),
    new THREE.Vector3(-0.35, 0.3, 0.05),
    new THREE.Vector3(-0.4, 0.1, -0.08),
  ]

  return (
    <group ref={groupRef}>
      {/* Main heart structures */}
      <LeftVentricle pulseFactor={pulseFactor} />
      <RightVentricle pulseFactor={pulseFactor} />
      <LeftAtrium pulseFactor={pulseFactor} />
      <RightAtrium pulseFactor={pulseFactor} />
      <HeartApex pulseFactor={pulseFactor} />
      
      {/* Great vessels */}
      <Aorta />
      <PulmonaryArtery />
      <VenaCava />
      <PulmonaryVeins />
      
      {/* Epicardial fat */}
      <EpicardialFat />
      
      {/* Coronary arteries */}
      <CoronaryArtery 
        path={ladPath} 
        radius={0.022}
        isAffected={diagnosis?.artery === 'LAD'}
        diagnosis={diagnosis}
      />
      <CoronaryArtery 
        path={rcaPath} 
        radius={0.022}
        isAffected={diagnosis?.artery === 'RCA'}
        diagnosis={diagnosis}
      />
      <CoronaryArtery 
        path={lcxPath} 
        radius={0.018}
        isAffected={diagnosis?.artery === 'LCx'}
        diagnosis={diagnosis}
      />
      
      {/* Connecting tissue */}
      <mesh position={[0, 0.1, 0.05]}>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshPhysicalMaterial 
          color="#7a2040"
          roughness={0.6}
          metalness={0.05}
          clearcoat={0.2}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}

// Camera controls with zoom to lesion
function CameraController({ diagnosis }: { diagnosis: DiagnosisData | null }) {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()

  useEffect(() => {
    if (diagnosis && controlsRef.current) {
      // Zoom to affected area
      const targetPositions: Record<string, THREE.Vector3> = {
        LAD: new THREE.Vector3(-0.15, 0.1, 0.35),
        RCA: new THREE.Vector3(0.3, 0.1, 0.2),
        LCx: new THREE.Vector3(-0.3, 0.2, 0.1),
      }
      
      const target = targetPositions[diagnosis.artery]
      if (target) {
        controlsRef.current.target.lerp(target, 0.1)
      }
    }
  }, [diagnosis])

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={0.3}
      maxDistance={5}
      autoRotate={!diagnosis}
      autoRotateSpeed={0.3}
      zoomSpeed={1.2}
    />
  )
}

interface AnatomicalHeartProps {
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void
  className?: string
}

export default function AnatomicalHeart({ onCanvasReady, className = '' }: AnatomicalHeartProps) {
  const diagnosis = useMedicalStore((s) => s.diagnosis)
  const [viewMode, setViewMode] = useState<'normal' | 'xray' | 'vessels'>('normal')

  return (
    <div className={`w-full h-full bg-gradient-to-b from-gray-950 via-gray-900 to-black rounded-xl overflow-hidden relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 2], fov: 45 }}
        gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.2
          onCanvasReady?.(gl.domElement)
        }}
        shadows
      >
        <color attach="background" args={['#0a0a0f']} />
        
        {/* Studio lighting for realistic tissue look */}
        <ambientLight intensity={0.2} />
        <directionalLight 
          position={[3, 5, 5]} 
          intensity={1.5} 
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-3, 3, -3]} intensity={0.6} color="#ffcccc" />
        <pointLight position={[0, 2, 2]} intensity={0.4} color="#ff9999" />
        <pointLight position={[0, -1, 1]} intensity={0.2} color="#ff6666" />
        <spotLight 
          position={[0, 4, 0]} 
          intensity={0.5} 
          angle={0.4} 
          penumbra={0.8}
          castShadow
        />
        
        {/* Heart */}
        <Heart diagnosis={diagnosis} />
        
        {/* Camera */}
        <CameraController diagnosis={diagnosis} />
        
        {/* Environment */}
        <Environment preset="studio" />
        
        {/* Ground reflection */}
        <ContactShadows 
          position={[0, -1, 0]} 
          opacity={0.5} 
          scale={3} 
          blur={2}
          far={2}
        />
      </Canvas>

      {/* View mode controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-1 flex flex-col gap-1">
          {(['normal', 'vessels'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                viewMode === mode 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {mode === 'normal' ? 'Normal' : 'Vasos'}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <span>🖱️ Rotacionar</span>
          <span>🔍 Zoom (scroll)</span>
          <span>⌨️ Shift+Arrastar para mover</span>
        </div>
      </div>

      {/* Diagnosis overlay */}
      {diagnosis && (
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm border border-red-500/30 rounded-xl p-4 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-red-400 font-medium text-sm">Lesão Detectada</span>
          </div>
          <div className="text-white font-semibold">{diagnosis.artery}</div>
          <div className="text-gray-400 text-sm capitalize">{diagnosis.type}</div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  diagnosis.blockage > 70 ? 'bg-red-500' :
                  diagnosis.blockage > 50 ? 'bg-orange-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${diagnosis.blockage}%` }}
              />
            </div>
            <span className="text-white font-bold">{diagnosis.blockage}%</span>
          </div>
        </div>
      )}
    </div>
  )
}
