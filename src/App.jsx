import React, { Suspense, useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, Scroll, Float, Html, Sparkles, MeshTransmissionMaterial, useTexture, useScroll, Text } from '@react-three/drei'
import * as THREE from 'three'

// 1. DYNAMIC BACKGROUND - Smooth gradient transitions
function DynamicBackground() {
  const scroll = useScroll()
  useFrame(() => {
    const s = Math.min(1, Math.max(0, scroll.offset * 1.2))
    const c1 = new THREE.Color('#fff0f5')
    const c2 = new THREE.Color('#fce4ec')
    const c3 = new THREE.Color('#f3e0f0')
    const c4 = new THREE.Color('#ffe4e9')

    let color = c1
    if (s < 0.4) color = c1.clone().lerp(c2, s / 0.4)
    else if (s < 0.7) color = c2.clone().lerp(c3, (s - 0.4) / 0.3)
    else color = c3.clone().lerp(c4, (s - 0.7) / 0.3)

    const bg = document.getElementById('bg-container')
    if (bg) bg.style.background = `radial-gradient(circle at 50% 40%, #ffffff 0%, ${color.getStyle()} 100%)`
  })
  return null
}

// 2. Custom 3D Text - Improved rendering
function Simple3DText({ text, position, color = '#e85d8f', fontSize = 0.5, yOffset = 0, visible = true }) {
  if (!visible) return null
  
  const canvas = useMemo(() => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = 1024
    canvas.height = 256
    context.fillStyle = 'rgba(0,0,0,0)'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.font = `600 ${fontSize * 70}px "Georgia", "Times New Roman", serif`
    context.fillStyle = color
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.shadowBlur = 0
    context.fillText(text, canvas.width / 2, canvas.height / 2)
    return canvas
  }, [text, color, fontSize])

  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [canvas])

  const width = fontSize * 4.2
  const height = fontSize * 1.3

  return (
    <mesh position={[position[0], position[1] + yOffset, position[2]]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} transparent side={THREE.DoubleSide} emissive={color} emissiveIntensity={0.15} />
    </mesh>
  )
}

// 3. PHOTO FRAMES - Enhanced with better animations
function PhotoFrame({ url, yPos, index }) {
  const texture = useTexture(url)
  const { width } = useThree((state) => state.viewport)
  const groupRef = useRef()
  const frameRef = useRef()
  const scroll = useScroll()
  const timeRef = useRef(0)
  
  const baseScale = Math.min(width * 0.55, 3.8)
  const frameWidth = baseScale
  const frameHeight = baseScale * 1.25

  useFrame(() => {
    timeRef.current += 0.016
    if (frameRef.current && scroll) {
      const scrollOffset = scroll.offset
      const targetY = yPos
      const distance = Math.abs(scrollOffset * 38 - targetY)
      
      // Gentle hover animation when in view
      if (distance < 4.5) {
        const scale = 1 + Math.sin(timeRef.current * 3.5) * 0.012
        frameRef.current.scale.setScalar(scale)
      } else {
        frameRef.current.scale.setScalar(1)
      }
    }
  })

  if (!texture) return null

  const rotationZ = index % 2 === 0 ? 0.025 : -0.025

  return (
    <group ref={groupRef} position={[0, yPos, 0]}>
      <Float speed={0.9} rotationIntensity={0.15} floatIntensity={0.4}>
        <group ref={frameRef} rotation={[0, 0, rotationZ]}>
          {/* Outer decorative frame */}
          <mesh position={[0, 0, -0.06]}>
            <planeGeometry args={[frameWidth + 0.16, frameHeight + 0.16]} />
            <meshStandardMaterial color="#f0d5e5" roughness={0.4} metalness={0.15} emissive="#ffccdd" emissiveIntensity={0.08} />
          </mesh>
          
          {/* White mat border */}
          <mesh position={[0, 0, -0.03]}>
            <planeGeometry args={[frameWidth + 0.1, frameHeight + 0.1]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.05} />
          </mesh>
          
          {/* Photo */}
          <mesh>
            <planeGeometry args={[frameWidth, frameHeight]} />
            <meshStandardMaterial map={texture} roughness={0.2} metalness={0.08} />
          </mesh>

          {/* Glass reflection overlay */}
          <mesh position={[0, 0, 0.04]}>
            <planeGeometry args={[frameWidth - 0.06, frameHeight - 0.06]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.08} metalness={0.95} roughness={0.05} />
          </mesh>
        </group>
      </Float>
    </group>
  )
}

// 4. FLOATING HEARTS - More vibrant
function FloatingHearts() {
  const heartShape = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0.25)
    shape.bezierCurveTo(0, 0.25, 0, 0, 0.25, 0)
    shape.bezierCurveTo(0.5, 0, 0.5, 0.25, 0.5, 0.25)
    shape.bezierCurveTo(0.5, 0.5, 0.25, 0.75, 0, 1)
    shape.bezierCurveTo(-0.25, 0.75, -0.5, 0.5, -0.5, 0.25)
    shape.bezierCurveTo(-0.5, 0.25, -0.5, 0, -0.25, 0)
    shape.bezierCurveTo(0, 0, 0, 0.25, 0, 0.25)
    return shape
  }, [])

  const hearts = useMemo(() => {
    const colors = ['#ff69b4', '#ff88bb', '#ff99cc', '#ffaadd', '#ff66aa']
    return Array.from({ length: 24 }).map(() => ({
      x: (Math.random() - 0.5) * 14,
      y: (Math.random() - 0.5) * 20 - 2,
      z: (Math.random() - 0.5) * 6 - 1,
      scale: 0.08 + Math.random() * 0.12,
      speed: 0.4 + Math.random() * 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotSpeed: 0.5 + Math.random() * 1,
    }))
  }, [])

  return (
    <group>
      {hearts.map((heart, i) => (
        <Float key={i} speed={heart.speed} floatIntensity={1.3} position={[heart.x, heart.y, heart.z]} rotationIntensity={0.3}>
          <mesh scale={[heart.scale, heart.scale, heart.scale]} rotation={[0, 0, Math.sin(i) * 0.5]}>
            <shapeGeometry args={[heartShape]} />
            <meshStandardMaterial color={heart.color} emissive={heart.color} emissiveIntensity={0.35} transparent opacity={0.7} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

// 5. HEART BURST ON SCROLL - New feature
function HeartBurstSystem() {
  const scroll = useScroll()
  const [bursts, setBursts] = useState([])
  const lastOffsetRef = useRef(0)
  const burstIdRef = useRef(0)

  useEffect(() => {
    const checkScroll = () => {
      const currentOffset = scroll.offset
      // Trigger burst when scrolling past certain thresholds
      const thresholds = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9]
      for (const threshold of thresholds) {
        if (lastOffsetRef.current < threshold && currentOffset >= threshold) {
          const id = burstIdRef.current++
          setBursts(prev => [...prev, { id, x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 2 + 1, z: (Math.random() - 0.5) * 2 }])
          setTimeout(() => {
            setBursts(prev => prev.filter(b => b.id !== id))
          }, 1500)
        }
      }
      lastOffsetRef.current = currentOffset
    }
    
    const interval = setInterval(checkScroll, 100)
    return () => clearInterval(interval)
  }, [scroll])

  return (
    <group>
      {bursts.map(burst => (
        <HeartBurst key={burst.id} position={[burst.x, burst.y, burst.z]} />
      ))}
    </group>
  )
}

function HeartBurst({ position }) {
  const particleCount = 40
  const pointsRef = useRef()
  const lifeRef = useRef(1)
  
  const positions = useMemo(() => {
    const pos = []
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2
      const radius = 0.3 + Math.random() * 0.5
      pos.push(
        Math.cos(angle) * radius + (Math.random() - 0.5) * 0.2,
        Math.sin(angle) * radius + (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.5
      )
    }
    return new Float32Array(pos)
  }, [])

  useFrame(() => {
    if (pointsRef.current) {
      lifeRef.current -= 0.03
      const opacity = Math.max(0, lifeRef.current)
      pointsRef.current.material.opacity = opacity
      pointsRef.current.scale.setScalar(1 + (1 - lifeRef.current) * 2)
      if (lifeRef.current <= 0 && pointsRef.current.parent) {
        pointsRef.current.parent.remove(pointsRef.current)
      }
    }
  })

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ff3366" size={0.07} transparent opacity={0.9} blending={THREE.AdditiveBlending} />
    </points>
  )
}

// 6. SCROLL POPUP TEXT - Smooth transitions
function ScrollPopupText() {
  const scroll = useScroll()
  const [activeIndex, setActiveIndex] = useState(-1)

  useFrame(() => {
    const offset = scroll.offset
    if (offset > 0.08 && offset < 0.18) setActiveIndex(0)
    else if (offset > 0.22 && offset < 0.32) setActiveIndex(1)
    else if (offset > 0.38 && offset < 0.48) setActiveIndex(2)
    else if (offset > 0.52 && offset < 0.62) setActiveIndex(3)
    else if (offset > 0.68 && offset < 0.78) setActiveIndex(4)
    else setActiveIndex(-1)
  })

  const popups = [
    { text: "✨ MAGICAL MOMENT ✨", y: 1.8, color: "#ff69b4" },
    { text: "💕 TRUE LOVE 💕", y: 0.8, color: "#ff3388" },
    { text: "🌟 FOREVER STARTS HERE 🌟", y: -0.2, color: "#ffaa44" },
    { text: "💖 ENDLESS JOY 💖", y: -1.2, color: "#ff6b9d" },
    { text: "⭐ HAPPY ANNIVERSARY ⭐", y: -2.2, color: "#ff4488" }
  ]

  if (activeIndex === -1) return null

  return (
    <Float position={[0, popups[activeIndex]?.y || 0, 1.8]} speed={2.2} floatIntensity={0.7}>
      <Simple3DText 
        text={popups[activeIndex]?.text || ""} 
        position={[0, 0, 0]} 
        color={popups[activeIndex]?.color || "#ff69b4"} 
        fontSize={0.32}
        visible={true}
      />
    </Float>
  )
}

// 7. ROTATING DECORATIVE RING - Elegant
function DecorativeRing() {
  const ringRef = useRef()
  const scroll = useScroll()

  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.006
      ringRef.current.rotation.x = scroll.offset * Math.PI * 0.5 + Math.sin(Date.now() * 0.0003) * 0.2
    }
  })

  return (
    <Float position={[0, -30, 0]} speed={0.6} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={ringRef}>
        <torusKnotGeometry args={[1.15, 0.16, 200, 28, 3, 4]} />
        <MeshTransmissionMaterial 
          color="#ff88bb" 
          thickness={0.55} 
          roughness={0.25}
          metalness={0.85}
          clearcoat={1}
          transparent
          opacity={0.82}
          ior={1.45}
        />
      </mesh>
    </Float>
  )
}

// 8. FLOATING PARTICLES - Sparkle effect
function FloatingParticles() {
  const particlesRef = useRef()
  const particleCount = 120
  
  const positions = useMemo(() => {
    const pos = []
    const colors = []
    for (let i = 0; i < particleCount; i++) {
      pos.push(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 22 - 2,
        (Math.random() - 0.5) * 10 - 2
      )
      colors.push(Math.random() * 0.5 + 0.5)
    }
    return { pos: new Float32Array(pos), colors: new Float32Array(colors) }
  }, [])

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0015
      particlesRef.current.rotation.x = Math.sin(Date.now() * 0.0002) * 0.1
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.pos, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffaacc" size={0.055} transparent opacity={0.45} blending={THREE.AdditiveBlending} />
    </points>
  )
}

// 9. MAIN SCENE
function Scene() {
  // Using reliable placeholder images - replace with your actual image paths
  const imageUrls = [
    "/src/assets/image1.jpg",
    "/src/assets/image2.jpg",
    "/src/assets/image3.jpg",
    "/src/assets/image4.jpg",
  ]
  
  return (
    <ScrollControls pages={6.2} damping={0.2} distance={1.2}>
      <DynamicBackground />
      <Sparkles count={80} scale={18} size={0.45} speed={0.35} color="#ffbbdd" opacity={0.5} />
      <FloatingHearts />
      <FloatingParticles />
      <ScrollPopupText />
      <HeartBurstSystem />

      <Scroll>
        {/* Main Title */}
        <Float position={[0, 2.8, 0]} speed={1.3} floatIntensity={0.5}>
          <Simple3DText text="💖 Vikki &amp; Sona 💖" position={[0, 0, 0]} color="#e85d8f" fontSize={0.58} />
        </Float>

        {/* Photos - Balanced vertical spacing */}
        <PhotoFrame url={imageUrls[0]} yPos={-5.8} index={0} />
        <PhotoFrame url={imageUrls[1]} yPos={-11.5} index={1} />
        <PhotoFrame url={imageUrls[2]} yPos={-17.2} index={2} />
        <PhotoFrame url={imageUrls[3]} yPos={-22.9} index={3} />

        {/* Decorative Ring */}
        <DecorativeRing />
      </Scroll>

      {/* HTML Overlay - Modern card design */}
      <Scroll html style={{ width: '100%', pointerEvents: 'none' }}>
        <div className="scroll-content">
          <div className="section section-1">
            <div className="card quote-card">
              <p className="quote-text">Every love story is beautiful, but ours is my favorite.</p>
              <span className="emoji-float">❤️</span>
            </div>
          </div>

          <div className="section section-2">
            <div className="card caption-card left-card">
              <p className="caption-text">✨ The moment I knew you were special ✨</p>
              <span className="sparkle-icon">✨</span>
            </div>
          </div>

          <div className="section section-3">
            <div className="card quote-card small">
              <p className="quote-small">"You make my world brighter every single day"</p>
              <span className="heart-beat-icon">💗</span>
            </div>
          </div>

          <div className="section section-4">
            <div className="card caption-card right-card">
              <p className="caption-text">🎁 Every day with you is a precious gift 🎁</p>
              <span className="gift-icon">🎁</span>
            </div>
          </div>

          <div className="section section-5">
            <div className="card quote-card">
              <p className="quote-text">"In a world full of trends, I want to remain a classic with you."</p>
              <span className="stars-icon">⭐⭐⭐</span>
            </div>
          </div>

          <div className="section section-6">
            <div className="card caption-card left-card">
              <p className="caption-text">🌹 My favorite place is right next to you 🌹</p>
              <span className="rose-icon">🌹</span>
            </div>
          </div>

          <div className="section section-7">
            <div className="card caption-card right-card">
              <p className="caption-text">💫 You make every ordinary day extraordinary 💫</p>
              <span className="sparkle-icon">🌟</span>
            </div>
          </div>

          <div className="section section-8">
            <div className="card caption-card center-card">
              <p className="caption-text">📸 Every moment with you is a treasure 💖</p>
            </div>
          </div>

          <div className="section section-9">
            <div className="card closing-card">
              <p className="couple-heart">Happy Anniversary</p>
              <p className="forever-text">Forever and always...</p>
            </div>
          </div>
        </div>
      </Scroll>
    </ScrollControls>
  )
}

export default function App() {
  return (
    <div id="bg-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#fff0f5' }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          font-family: 'Georgia', 'Times New Roman', 'Segoe UI', serif;
        }

        ::-webkit-scrollbar {
          display: none;
        }

        .scroll-content {
          width: 100%;
          position: relative;
        }

        .section {
          position: absolute;
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 0 1.5rem;
          left: 0;
          animation: fadeInUp 0.7s cubic-bezier(0.2, 0.9, 0.4, 1.1) forwards;
          opacity: 0;
        }

        /* Vertical spacing */
        .section-1 { top: 8vh; animation-delay: 0.1s; }
        .section-2 { top: 36vh; animation-delay: 0.15s; }
        .section-3 { top: 78vh; animation-delay: 0.2s; }
        .section-4 { top: 112vh; animation-delay: 0.25s; }
        .section-5 { top: 155vh; animation-delay: 0.3s; }
        .section-6 { top: 188vh; animation-delay: 0.35s; }
        .section-7 { top: 220vh; animation-delay: 0.4s; }
        .section-8 { top: 252vh; animation-delay: 0.45s; }
        .section-9 { top: 320vh; animation-delay: 0.5s; }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card {
          backdrop-filter: blur(14px);
          border-radius: 2rem;
          position: relative;
          transition: all 0.3s ease;
        }

        .quote-card {
          background: rgba(255, 245, 250, 0.82);
          padding: 1rem 1.6rem;
          max-width: 85%;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.7);
        }

        .quote-card.small {
          padding: 0.7rem 1.3rem;
          background: rgba(255, 255, 255, 0.88);
        }

        .caption-card {
          background: rgba(255, 250, 240, 0.92);
          backdrop-filter: blur(10px);
          border-radius: 1.5rem;
          padding: 0.6rem 1.2rem;
          max-width: 75%;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          border-left: 3px solid #ff99bb;
        }

        .left-card {
          align-self: flex-start;
          margin-right: auto;
        }

        .right-card {
          align-self: flex-end;
          margin-left: auto;
          border-left: none;
          border-right: 3px solid #ff99bb;
        }

        .center-card {
          align-self: center;
          text-align: center;
          border-left: none;
          border-bottom: 3px solid #ff99bb;
          border-radius: 1.5rem;
        }

        .closing-card {
          text-align: center;
          background: rgba(255, 240, 245, 0.94);
          backdrop-filter: blur(18px);
          border-radius: 2.8rem;
          padding: 1.8rem 1.5rem;
          width: 90%;
          max-width: 340px;
          box-shadow: 0 25px 45px rgba(0,0,0,0.12);
          border: 1px solid rgba(255,255,255,0.7);
        }

        .quote-text {
          font-size: 1.1rem;
          color: #a04060;
          line-height: 1.4;
          font-style: italic;
          font-weight: 500;
        }

        .quote-small {
          font-size: 0.9rem;
          color: #c06080;
          font-style: italic;
        }

        .caption-text {
          font-size: 0.85rem;
          color: #805060;
          font-weight: 500;
        }

        .anniversary-title {
          color: #d84c7a;
          font-size: 1.6rem;
          font-family: 'Georgia', serif;
          margin-bottom: 0.4rem;
          letter-spacing: -0.3px;
        }

        .couple-heart {
          font-size: 1rem;
          color: #e85d8f;
          margin: 0.6rem 0;
          font-weight: 500;
        }

        .forever-text {
          font-size: 0.8rem;
          color: #a06070;
          font-style: italic;
        }

        /* Floating icons */
        .emoji-float, .sparkle-icon, .heart-beat-icon, .gift-icon, .stars-icon, .rose-icon, .confetti-burst {
          position: absolute;
          font-size: 1.3rem;
          animation: gentleFloat 2.2s infinite ease;
        }

        .emoji-float { top: -12px; right: -10px; animation-duration: 1.8s; }
        .sparkle-icon { bottom: -12px; left: -10px; animation: spinSlow 3s linear infinite; }
        .heart-beat-icon { top: -12px; left: -10px; animation: heartbeat 1s ease-in-out infinite; }
        .gift-icon { bottom: -14px; right: -10px; animation: gentleFloat 1.6s infinite; }
        .stars-icon { top: -14px; left: 50%; transform: translateX(-50%); animation: spinSlow 4s linear infinite; font-size: 1rem; }
        .rose-icon { top: -12px; right: -10px; animation: gentleFloat 1.7s infinite; }
        .confetti-burst { font-size: 1.6rem; margin-top: 0.8rem; animation: spinSlow 2s linear infinite; position: relative; top: auto; left: auto; }

        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (min-width: 768px) {
          .quote-text { font-size: 1.3rem; }
          .caption-text { font-size: 0.95rem; }
          .anniversary-title { font-size: 1.9rem; }
          .quote-card { max-width: 65%; padding: 1.3rem 1.8rem; }
          .caption-card { max-width: 65%; }
        }
      `}</style>

      <Canvas 
        camera={{ position: [0, 0, 8.5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.1} />
        <pointLight position={[5, 5, 5]} intensity={1.3} />
        <pointLight position={[-3, 2, 4]} intensity={0.7} color="#ffaaee" />
        <pointLight position={[2, 4, 3]} intensity={0.5} color="#ff88cc" />
        <directionalLight position={[0, 3, 2]} intensity={0.9} />
        
        <Suspense fallback={
          <Html center>
            <div style={{ background: 'rgba(255,235,245,0.95)', padding: '1rem 2rem', borderRadius: '2rem', color: '#d84c7a', fontWeight: 'bold', backdropFilter: 'blur(8px)' }}>
              💖 Loading precious memories...
            </div>
          </Html>
        }>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}