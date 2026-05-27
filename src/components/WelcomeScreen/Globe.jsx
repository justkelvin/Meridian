import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import earthTexture from '@/assets/2k_earth_daymap.jpg'
import { createSeededRandom } from './random'

// Sparkle particles
function Sparkles({ radius, count = 80 }) {
  const ref = useRef()

  const particles = useMemo(() => {
    const random = createSeededRandom(count * 31 + Math.round(radius * 100))
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const phases = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)
      const r = radius * (1.05 + random() * 0.4)

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      sizes[i] = 0.02 + random() * 0.04
      phases[i] = random() * Math.PI * 2
    }

    return { positions, sizes, phases }
  }, [radius, count])

  useFrame((state) => {
    if (!ref.current) return
    const time = state.clock.elapsedTime

    // Rotate slowly
    ref.current.rotation.y = time * 0.05

    // Twinkle effect via opacity
    const material = ref.current.material
    material.opacity = 0.6 + Math.sin(time * 2) * 0.2
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#ffffff"
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Cute floating hearts/stars around globe
function FloatingShapes({ radius }) {
  const groupRef = useRef()
  
  const shapes = useMemo(() => {
    const random = createSeededRandom(2400 + Math.round(radius * 100))
    const items = []
    for (let i = 0; i < 12; i++) {
      const theta = (i / 12) * Math.PI * 2
      const y = (random() - 0.5) * radius * 1.5
      const r = radius * (1.4 + random() * 0.4)
      items.push({
        position: [r * Math.cos(theta), y, r * Math.sin(theta)],
        scale: 0.08 + random() * 0.08,
        speed: 0.3 + random() * 0.3,
        phase: random() * Math.PI * 2,
        color: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'][Math.floor(random() * 4)]
      })
    }
    return items
  }, [radius])

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime
    groupRef.current.rotation.y = time * 0.1

    groupRef.current.children.forEach((child, i) => {
      const shape = shapes[i]
      // Bobbing motion
      child.position.y = shape.position[1] + Math.sin(time * shape.speed + shape.phase) * 0.3
      // Gentle rotation
      child.rotation.z = Math.sin(time * 0.5 + shape.phase) * 0.3
    })
  })

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <mesh key={i} position={shape.position} scale={shape.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={shape.color}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function Globe({ radius = 3 }) {
  const globeRef = useRef()
  const earthMap = useLoader(THREE.TextureLoader, earthTexture)

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002
    }
  })

  return (
    <group>
      {/* Main globe (rotates) */}
      <group ref={globeRef}>
        {/* Earth texture base */}
        <mesh>
          <sphereGeometry args={[radius * 0.99, 64, 64]} />
          <meshBasicMaterial
            map={earthMap}
          />
        </mesh>

        {/* Subtle color tint overlay */}
        <mesh>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshBasicMaterial
            color="#4ECDC4"
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Sparkle particles */}
      <Sparkles radius={radius} count={100} />

      {/* Floating pastel shapes */}
      <FloatingShapes radius={radius} />
    </group>
  )
}
