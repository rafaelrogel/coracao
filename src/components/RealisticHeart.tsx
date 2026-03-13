'use client'

import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html, useTexture, Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { useMedicalStore } from '@/store/useMedicalStore'
import { DiagnosisData, ConditionType, ArteryType } from '@/types/medical'

// Detailed artery configuration with anatomical positions
const CORONARY_ARTERIES: Record<string, {
  name: string
  path: THREE.Vector3[]
  radius: number
  color: string
  branches?: { path: THREE.Vector3[]; radius: number }[]
}> = {
  LAD: {
    name: 'Artéria Descendente Anterior',
    path: [
      new THREE.Vector3(-0.15, 0.8, 0.5),
      new THREE.Vector3(-0.2, 0.6, 0.55),
      new THREE.Vector3(-0.25, 0.3, 0.5),
      new THREE.Vector3(-0.3, 0, 0.45),
      new THREE.Vector3(-0.25, -0.4, 0.35),
      new THREE.Vector3(-0.2, -0.7, 0.2),
    ],
    radius: 0.035,
    color: '#c41e3a',
    branches: [
      { path: [new THREE.Vector3(-0.25, 0.3, 0.5), new THREE.Vector3(-0.4, 0.2, 0.4), new THREE.Vector3(-0.5, 0.1, 0.3)], radius: 0.02 },
      { path: [new THREE.Vector3(-0.3, 0, 0.45), new THREE.Vector3(-0.45, -0.1, 0.35)], radius: 0.018 },
    ]
  },
  RCA: {
    name: 'Artéria Coronária Direita',
    path: [
      new THREE.Vector3(0.2, 0.75, 0.4),
      new THREE.Vector3(0.4, 0.5, 0.35),
      new THREE.Vector3(0.5, 0.2, 0.25),
      new THREE.Vector3(0.45, -0.1, 0.15),
      new THREE.Vector3(0.3, -0.4, 0.1),
      new THREE.Vector3(0.1, -0.6, 0.05),
    ],
    radius: 0.035,
    color: '#c41e3a',
    branches: [
      { path: [new THREE.Vector3(0.45, -0.1, 0.15), new THREE.Vector3(0.5, -0.2, 0.0), new THREE.Vector3(0.45, -0.35, -0.1)], radius: 0.02 },
    ]
  },
  LCx: {
    name: 'Artéria Circunflexa',
    path: [
      new THREE.Vector3(-0.15, 0.8, 0.5),
      new THREE.Vector3(-0.3, 0.7, 0.3),
      new THREE.Vector3(-0.45, 0.5, 0.1),
      new THREE.Vector3(-0.5, 0.2, -0.1),
      new THREE.Vector3(-0.45, -0.1, -0.2),
    ],
    radius: 0.03,
    color: '#c41e3a',
  },
  LMCA: {
    name: 'Tronco da Coronária Esquerda',
    path: [
      new THREE.Vector3(0, 0.9, 0.45),
      new THREE.Vector3(-0.1, 0.85, 0.48),
      new THREE.Vector3(-0.15, 0.8, 0.5),
    ],
    radius: 0.045,
    color: '#c41e3a',
  },
}

// Condition visualization configurations
const CONDITION_CONFIG: Record<ConditionType, {
  color: string
  emissive: string
  opacity: number
  roughness: number
  metalness: number
  description: string
}> = {
  stenosis: { color: '#fbbf24', emissive: '#b45309', opacity: 0.9, roughness: 0.3, metalness: 0.1, description: 'Estreitamento da artéria' },
  plaque: { color: '#f5deb3', emissive: '#8b7355', opacity: 0.95, roughness: 0.8, metalness: 0.0, description: 'Acúmulo de gordura na parede' },
  aneurysm: { color: '#dc2626', emissive: '#7f1d1d', opacity: 0.85, roughness: 0.4, metalness: 0.1, description: 'Dilatação anormal da artéria' },
  occlusion: { color: '#1f1f1f', emissive: '#000000', opacity: 0.95, roughness: 0.9, metalness: 0.0, description: 'Bloqueio total da artéria' },
  calcification: { color: '#e8e8e8', emissive: '#a0a0a0', opacity: 1.0, roughness: 0.2, metalness: 0.3, description: 'Depósitos de cálite endurecidos' },
  dissection: { color: '#9333ea', emissive: '#581c87', opacity: 0.9, roughness: 0.5, metalness: 0.1, description: 'Separação das camadas da artéria' },
  thrombus: { color: '#7f1d1d', emissive: '#450a0a', opacity: 0.9, roughness: 0.7, metalness: 0.0, description: 'Coágulo sanguíneo' },
  atheroma: { color: '#ca8a04', emissive: '#713f12', opacity: 0.9, roughness: 0.6, metalness: 0.0, description: 'Placa de gordura e células' },
}

// Create tube geometry from path
function createTubeFromPath(path: THREE.Vector3[], radius: number, segments = 64): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(path)
  return new THREE.TubeGeometry(curve, segments, radius, 16, false)
}

// Realistic heart chambers
function HeartChambers() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      const beat = Math.sin(state.clock.elapsedTime * 1.3)
      const scale = 1 + beat * 0.025
      groupRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Left Ventricle - main pumping chamber */}
      <mesh position={[-0.15, -0.2, 0.15]}>
        <sphereGeometry args={[0.5, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial 
          color="#8b0000" 
          roughness={0.7} 
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Right Ventricle */}
      <mesh position={[0.25, -0.15, 0.2]}>
        <sphereGeometry args={[0.4, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
        <meshStandardMaterial color="#a52a2a" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Left Atrium */}
      <mesh position={[-0.2, 0.5, -0.1]}>
        <sphereGeometry args={[0.35, 64, 64]} />
        <meshStandardMaterial color="#b22222" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Right Atrium */}
      <mesh position={[0.3, 0.45, 0.05]}>
        <sphereGeometry args={[0.32, 64, 64]} />
        <meshStandardMaterial color="#cd5c5c" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Aorta */}
      <mesh position={[0, 0.9, 0.2]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.5, 32]} />
        <meshStandardMaterial color="#dc143c" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Aortic Arch */}
      <mesh position={[0.15, 1.1, 0]} rotation={[0, 0, -0.8]}>
        <torusGeometry args={[0.2, 0.08, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#dc143c" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Pulmonary Artery */}
      <mesh position={[0.15, 0.85, 0.35]} rotation={[-0.3, 0.3, 0.2]}>
        <cylinderGeometry args={[0.08, 0.1, 0.4, 32]} />
        <meshStandardMaterial color="#4169e1" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Superior Vena Cava */}
      <mesh position={[0.35, 0.9, -0.1]} rotation={[0.1, 0, 0.1]}>
        <cylinderGeometry args={[0.07, 0.08, 0.5, 32]} />
        <meshStandardMaterial color="#191970" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Inferior Vena Cava */}
      <mesh position={[0.25, -0.5, -0.15]} rotation={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.09, 0.4, 32]} />
        <meshStandardMaterial color="#191970" roughness={0.5} metalness={0.1} />
      </mesh>

      {/* Heart Apex */}
      <mesh position={[0, -0.75, 0.1]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.25, 0.35, 32]} />
        <meshStandardMaterial color="#8b0000" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Septum indication (visible line) */}
      <mesh position={[0.05, -0.1, 0.3]} rotation={[0, 0.2, 0]}>
        <boxGeometry args={[0.02, 0.8, 0.3]} />
        <meshStandardMaterial color="#600000" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Coronary artery with condition visualization
function CoronaryArtery({ 
  arteryKey, 
  config, 
  diagnosis,
  showCrossSection 
}: { 
  arteryKey: string
  config: typeof CORONARY_ARTERIES[string]
  diagnosis: DiagnosisData | null
  showCrossSection: boolean
}) {
  const isAffected = diagnosis?.artery === arteryKey
  const conditionType = isAffected ? diagnosis.type : null
  const blockage = isAffected ? diagnosis.blockage : 0
  const conditionConfig = conditionType ? CONDITION_CONFIG[conditionType] : null
  
  const tubeRef = useRef<THREE.Mesh>(null)
  const lesionRef = useRef<THREE.Group>(null)

  // Animate lesion
  useFrame((state) => {
    if (lesionRef.current && isAffected) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1
      lesionRef.current.scale.setScalar(pulse)
    }
  })

  // Create artery geometry
  const geometry = useMemo(() => {
    return createTubeFromPath(config.path, config.radius)
  }, [config.path, config.radius])

  // Create branch geometries
  const branchGeometries = useMemo(() => {
    return config.branches?.map(branch => createTubeFromPath(branch.path, branch.radius)) || []
  }, [config.branches])

  // Calculate lesion position (at 40% of artery length)
  const lesionPosition = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(config.path)
    return curve.getPoint(0.4)
  }, [config.path])

  // Create detailed lesion based on condition type
  const renderLesion = () => {
    if (!isAffected || !conditionConfig) return null

    const lesionSize = config.radius * (1.5 + blockage / 100)

    switch (conditionType) {
      case 'plaque':
      case 'atheroma':
        return (
          <group ref={lesionRef} position={lesionPosition}>
            {/* Plaque buildup - multiple irregular shapes */}
            {[...Array(5)].map((_, i) => (
              <mesh 
                key={i} 
                position={[
                  Math.sin(i * 1.2) * config.radius * 0.8,
                  Math.cos(i * 1.2) * config.radius * 0.8,
                  (i - 2) * 0.03
                ]}
                rotation={[Math.random(), Math.random(), Math.random()]}
              >
                <dodecahedronGeometry args={[lesionSize * 0.3 * (0.5 + Math.random() * 0.5), 1]} />
                <meshStandardMaterial 
                  color={conditionConfig.color}
                  roughness={conditionConfig.roughness}
                  metalness={conditionConfig.metalness}
                />
              </mesh>
            ))}
            {/* Fatty core */}
            <mesh>
              <sphereGeometry args={[lesionSize * 0.4, 16, 16]} />
              <meshStandardMaterial 
                color="#f5deb3" 
                roughness={0.9}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        )

      case 'calcification':
        return (
          <group ref={lesionRef} position={lesionPosition}>
            {/* Calcified deposits - white crystalline structures */}
            {[...Array(8)].map((_, i) => (
              <mesh 
                key={i} 
                position={[
                  Math.sin(i * 0.8) * config.radius,
                  Math.cos(i * 0.8) * config.radius,
                  (i - 4) * 0.02
                ]}
              >
                <octahedronGeometry args={[lesionSize * 0.2 * (0.3 + Math.random() * 0.7), 0]} />
                <meshStandardMaterial 
                  color="#f0f0f0"
                  roughness={0.1}
                  metalness={0.4}
                  emissive="#808080"
                  emissiveIntensity={0.2}
                />
              </mesh>
            ))}
          </group>
        )

      case 'thrombus':
        return (
          <group ref={lesionRef} position={lesionPosition}>
            {/* Blood clot - dark red irregular mass */}
            <mesh>
              <sphereGeometry args={[lesionSize * 0.6, 12, 12]} />
              <meshStandardMaterial 
                color="#4a0000"
                roughness={0.9}
                metalness={0}
              />
            </mesh>
            {/* Fibrin strands */}
            {[...Array(6)].map((_, i) => (
              <mesh 
                key={i}
                position={[
                  Math.sin(i) * lesionSize * 0.4,
                  Math.cos(i) * lesionSize * 0.4,
                  0
                ]}
                rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
              >
                <cylinderGeometry args={[0.005, 0.005, lesionSize * 0.8, 4]} />
                <meshStandardMaterial color="#8b0000" roughness={0.8} />
              </mesh>
            ))}
          </group>
        )

      case 'aneurysm':
        return (
          <group ref={lesionRef} position={lesionPosition}>
            {/* Bulging vessel wall */}
            <mesh>
              <sphereGeometry args={[lesionSize * (1 + blockage / 100), 32, 32]} />
              <meshStandardMaterial 
                color="#dc2626"
                roughness={0.4}
                metalness={0.1}
                transparent
                opacity={0.85}
              />
            </mesh>
            {/* Thin wall indication */}
            <mesh>
              <sphereGeometry args={[lesionSize * (1.05 + blockage / 100), 32, 32]} />
              <meshStandardMaterial 
                color="#ff6b6b"
                roughness={0.3}
                transparent
                opacity={0.3}
                side={THREE.BackSide}
              />
            </mesh>
          </group>
        )

      case 'dissection':
        return (
          <group ref={lesionRef} position={lesionPosition}>
            {/* Torn vessel layers */}
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <torusGeometry args={[lesionSize * 0.8, 0.01, 8, 32, Math.PI]} />
              <meshStandardMaterial color="#9333ea" roughness={0.5} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]}>
              <torusGeometry args={[lesionSize * 0.6, 0.01, 8, 32, Math.PI]} />
              <meshStandardMaterial color="#7c3aed" roughness={0.5} />
            </mesh>
            {/* Blood in false lumen */}
            <mesh position={[lesionSize * 0.3, 0, 0]}>
              <sphereGeometry args={[lesionSize * 0.3, 16, 16]} />
              <meshStandardMaterial color="#7f1d1d" roughness={0.7} transparent opacity={0.8} />
            </mesh>
          </group>
        )

      case 'stenosis':
      case 'occlusion':
      default:
        return (
          <group ref={lesionRef} position={lesionPosition}>
            {/* Narrowing ring */}
            <mesh>
              <torusGeometry args={[config.radius * 1.5, config.radius * 0.3 * (blockage / 100 + 0.5), 16, 32]} />
              <meshStandardMaterial 
                color={conditionConfig.color}
                emissive={conditionConfig.emissive}
                emissiveIntensity={0.3}
                roughness={conditionConfig.roughness}
              />
            </mesh>
            {/* Inner obstruction */}
            {blockage > 50 && (
              <mesh>
                <cylinderGeometry args={[config.radius * blockage / 100, config.radius * blockage / 100, 0.05, 16]} />
                <meshStandardMaterial 
                  color={conditionType === 'occlusion' ? '#1a1a1a' : '#8b4513'}
                  roughness={0.9}
                />
              </mesh>
            )}
          </group>
        )
    }
  }

  return (
    <group>
      {/* Main artery */}
      <mesh ref={tubeRef} geometry={geometry}>
        <meshStandardMaterial 
          color={isAffected ? conditionConfig?.color || config.color : config.color}
          roughness={0.5}
          metalness={0.1}
          transparent={isAffected}
          opacity={isAffected ? 0.7 : 1}
        />
      </mesh>

      {/* Branches */}
      {branchGeometries.map((geo, i) => (
        <mesh key={i} geometry={geo}>
          <meshStandardMaterial 
            color={config.color}
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Lesion visualization */}
      {renderLesion()}

      {/* Info tooltip */}
      {isAffected && diagnosis && (
        <Html position={[lesionPosition.x + 0.3, lesionPosition.y + 0.2, lesionPosition.z]}>
          <div className="bg-slate-900/95 border-2 border-red-500 rounded-lg p-3 text-white text-xs min-w-[180px] shadow-xl">
            <div className="font-bold text-red-400 mb-1">{config.name}</div>
            <div className="text-slate-300 mb-2">{conditionConfig?.description}</div>
            <div className="flex justify-between">
              <span>Obstrução:</span>
              <span className="font-bold text-yellow-400">{blockage}%</span>
            </div>
            <div className="flex justify-between">
              <span>Severidade:</span>
              <span className={`font-bold ${
                diagnosis.severity === 'critical' ? 'text-red-500' :
                diagnosis.severity === 'severe' ? 'text-orange-500' :
                diagnosis.severity === 'moderate' ? 'text-yellow-500' : 'text-green-500'
              }`}>
                {diagnosis.severity}
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Cross-section view component
function CrossSectionView({ diagnosis }: { diagnosis: DiagnosisData | null }) {
  if (!diagnosis) return null

  const conditionConfig = CONDITION_CONFIG[diagnosis.type]
  const blockagePercent = diagnosis.blockage / 100

  return (
    <group position={[2, 0, 0]}>
      <Html position={[0, 1, 0]}>
        <div className="text-white text-sm font-bold bg-slate-900/80 px-2 py-1 rounded">
          Corte Transversal
        </div>
      </Html>

      {/* Outer vessel wall */}
      <mesh>
        <ringGeometry args={[0.35, 0.4, 64]} />
        <meshStandardMaterial color="#8b0000" side={THREE.DoubleSide} />
      </mesh>

      {/* Inner vessel wall (intima) */}
      <mesh position={[0, 0, 0.01]}>
        <ringGeometry args={[0.28, 0.35, 64]} />
        <meshStandardMaterial color="#ffc0cb" side={THREE.DoubleSide} />
      </mesh>

      {/* Lumen (blood flow area) */}
      <mesh position={[0, 0, 0.02]}>
        <circleGeometry args={[0.28 * (1 - blockagePercent * 0.8), 64]} />
        <meshStandardMaterial color="#8b0000" side={THREE.DoubleSide} />
      </mesh>

      {/* Plaque/obstruction */}
      {blockagePercent > 0 && (
        <mesh position={[0.1, 0.05, 0.015]} rotation={[0, 0, Math.PI / 6]}>
          <circleGeometry args={[0.15 * blockagePercent + 0.05, 32, 0, Math.PI * 1.5]} />
          <meshStandardMaterial 
            color={conditionConfig.color} 
            side={THREE.DoubleSide}
            roughness={conditionConfig.roughness}
          />
        </mesh>
      )}
    </group>
  )
}

// Camera controller with focus on affected area
function CameraController({ diagnosis }: { diagnosis: DiagnosisData | null }) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)

  useFrame(() => {
    if (diagnosis && controlsRef.current) {
      const arteryConfig = CORONARY_ARTERIES[diagnosis.artery]
      if (arteryConfig) {
        const curve = new THREE.CatmullRomCurve3(arteryConfig.path)
        const targetPoint = curve.getPoint(0.4)
        controlsRef.current.target.lerp(targetPoint, 0.02)
      }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={0.5}
      maxDistance={8}
      autoRotate={!diagnosis}
      autoRotateSpeed={0.3}
      zoomSpeed={1.5}
    />
  )
}

interface RealisticHeartProps {
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void
  className?: string
}

export default function RealisticHeart({ onCanvasReady, className = '' }: RealisticHeartProps) {
  const diagnosis = useMedicalStore((s) => s.diagnosis)
  const [showCrossSection, setShowCrossSection] = useState(false)

  return (
    <div className={`w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => onCanvasReady?.(gl.domElement)}
      >
        <color attach="background" args={['#0a0a1a']} />
        
        {/* Lighting setup for realistic rendering */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-3, 3, -3]} intensity={0.5} color="#ff9999" />
        <pointLight position={[0, 2, 2]} intensity={0.5} color="#ffcccc" />
        <spotLight position={[0, 5, 0]} intensity={0.3} angle={0.5} penumbra={0.5} />

        {/* Heart model */}
        <group rotation={[0.1, 0, 0]}>
          <HeartChambers />
          
          {/* Coronary arteries */}
          {Object.entries(CORONARY_ARTERIES).map(([key, config]) => (
            <CoronaryArtery
              key={key}
              arteryKey={key}
              config={config}
              diagnosis={diagnosis}
              showCrossSection={showCrossSection}
            />
          ))}
        </group>

        {/* Cross-section view */}
        {showCrossSection && <CrossSectionView diagnosis={diagnosis} />}

        {/* Camera controls */}
        <CameraController diagnosis={diagnosis} />

        {/* Environment for reflections */}
        <Environment preset="studio" />
        
        {/* Ground shadow */}
        <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={3} blur={2} />
      </Canvas>

      {/* UI Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setShowCrossSection(!showCrossSection)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            showCrossSection 
              ? 'bg-clinical-accent text-white' 
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          {showCrossSection ? '✓ Corte Transversal' : 'Ver Corte'}
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-xs text-slate-400 bg-slate-900/70 px-3 py-2 rounded-lg">
        <div>🖱️ Arraste para rotacionar</div>
        <div>🔍 Scroll para zoom (aproxime para detalhes)</div>
        <div>👆 Clique duplo para resetar</div>
      </div>

      {/* Diagnosis info overlay */}
      {diagnosis && (
        <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-700 rounded-lg p-3 max-w-xs">
          <div className="text-white font-medium mb-1">
            {CORONARY_ARTERIES[diagnosis.artery]?.name || diagnosis.artery}
          </div>
          <div className="text-slate-400 text-sm">
            {CONDITION_CONFIG[diagnosis.type]?.description}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  diagnosis.blockage > 70 ? 'bg-red-500' :
                  diagnosis.blockage > 50 ? 'bg-orange-500' :
                  diagnosis.blockage > 30 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${diagnosis.blockage}%` }}
              />
            </div>
            <span className="text-white font-bold text-sm">{diagnosis.blockage}%</span>
          </div>
        </div>
      )}
    </div>
  )
}
