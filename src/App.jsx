import React, { Suspense, useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import "./App.css"

// 🔥 IMPORT YOUR EXISTING 3D FILE
import AnniversaryScene from "./AnniversaryScene.jsx" 

export default function App() {
  const [step, setStep] = useState(0)

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <Page key="door">
            <Door onNext={() => setStep(1)} />
          </Page>
        )}
        {step === 1 && (
          <Page key="scratch">
            <Scratch onNext={() => setStep(2)} />
          </Page>
        )}
        {step === 2 && (
          <Page key="welcome">
            <Welcome onNext={() => setStep(3)} />
          </Page>
        )}
        {step === 3 && (
          <Page key="main">
            <Suspense fallback={<Loader />}>
              <AnniversaryScene />
            </Suspense>
          </Page>
        )}
      </AnimatePresence>
    </div>
  )
}

// 🎬 PAGE TRANSITION with modern easing
function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      className="page"
    >
      {children}
    </motion.div>
  )
}

// 🚪 MODERN DOOR with 3D effect
function Door({ onNext }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      const timer = setTimeout(onNext, 800)
      return () => clearTimeout(timer)
    }
  }, [open, onNext])

  return (
    <div className="center">
      <motion.div
        className={`door ${open ? "open" : ""}`}
        onClick={() => !open && setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="door-emoji">💖</span>
        <div className="door-knob"></div>
      </motion.div>
      {!open && (
        <motion.p 
          className="instruction"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Tap the door to open
        </motion.p>
      )}
    </div>
  )
}

// ✨ MODERN SCRATCH with realistic scratching
function Scratch({ onNext }) {
  const [revealed, setRevealed] = useState(false)
  const [scratchProgress, setScratchProgress] = useState(0)
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const isScratching = useRef(false)
  const lastPoint = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctxRef.current = ctx

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (!container) return
      
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      
      // Draw scratch cover
      drawScratchCover()
    }

    const drawScratchCover = () => {
      const ctx = ctxRef.current
      if (!ctx) return
      
      // Create gradient scratch surface
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#888')
      gradient.addColorStop(0.5, '#aaa')
      gradient.addColorStop(1, '#777')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Add pattern overlay
      ctx.globalCompositeOperation = 'source-over'
      for (let i = 0; i < 200; i++) {
        ctx.fillStyle = `rgba(100, 100, 100, ${Math.random() * 0.3})`
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          2, 2
        )
      }
      
      // Draw scratch text
      ctx.font = `bold ${Math.min(24, canvas.width / 8)}px "Arial"`
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('✨ SCRATCH HERE ✨', canvas.width / 2, canvas.height / 2)
      
      ctx.font = `${Math.min(40, canvas.width / 6)}px "Arial"`
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.fillText('🖐️', canvas.width / 2, canvas.height / 1.6)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  const getCoordinates = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    let clientX, clientY
    
    if (e.touches) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    let x = (clientX - rect.left) * scaleX
    let y = (clientY - rect.top) * scaleY
    
    x = Math.max(0, Math.min(canvas.width, x))
    y = Math.max(0, Math.min(canvas.height, y))
    
    return { x, y }
  }

  const scratch = (x, y, radius) => {
    const ctx = ctxRef.current
    if (!ctx || revealed) return

    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
    
    // Add random smaller scratches for realistic effect
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2
      const offsetX = Math.cos(angle) * radius * 0.5
      const offsetY = Math.sin(angle) * radius * 0.5
      ctx.beginPath()
      ctx.arc(x + offsetX, y + offsetY, radius * 0.4, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.globalCompositeOperation = 'source-over'
    
    // Calculate scratch progress
    checkScratchProgress()
  }

  const scratchLine = (from, to, radius) => {
    const ctx = ctxRef.current
    if (!ctx || revealed) return
    
    const distance = Math.hypot(to.x - from.x, to.y - from.y)
    const steps = Math.max(5, Math.floor(distance / 5))
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = from.x + (to.x - from.x) * t
      const y = from.y + (to.y - from.y) * t
      
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
      
      // Add random scattered scratches along the line
      if (Math.random() > 0.7) {
        ctx.beginPath()
        ctx.arc(
          x + (Math.random() - 0.5) * radius,
          y + (Math.random() - 0.5) * radius,
          radius * 0.6,
          0, Math.PI * 2
        )
        ctx.fill()
      }
    }
    
    ctx.globalCompositeOperation = 'source-over'
  }

  const checkScratchProgress = () => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!ctx) return
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let transparentPixels = 0
    const totalPixels = imageData.data.length / 4
    
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 128) {
        transparentPixels++
      }
    }
    
    const progress = (transparentPixels / totalPixels) * 100
    setScratchProgress(Math.min(100, progress))
    
    // Reveal when 40% is scratched
    if (progress >= 40 && !revealed) {
      setRevealed(true)
    }
  }

  const handleStart = (e) => {
    e.preventDefault()
    if (revealed) return
    
    isScratching.current = true
    const coords = getCoordinates(e)
    lastPoint.current = coords
    scratch(coords.x, coords.y, 20)
  }

  const handleMove = (e) => {
    e.preventDefault()
    if (!isScratching.current || revealed) return
    
    const coords = getCoordinates(e)
    const distance = Math.hypot(coords.x - lastPoint.current.x, coords.y - lastPoint.current.y)
    
    if (distance > 2) {
      scratchLine(lastPoint.current, coords, 18)
      lastPoint.current = coords
    }
  }

  const handleEnd = (e) => {
    e.preventDefault()
    isScratching.current = false
  }

  // Add touch and mouse events
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.addEventListener('touchstart', handleStart)
    canvas.addEventListener('touchmove', handleMove)
    canvas.addEventListener('touchend', handleEnd)
    canvas.addEventListener('touchcancel', handleEnd)
    
    canvas.addEventListener('mousedown', handleStart)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)

    return () => {
      canvas.removeEventListener('touchstart', handleStart)
      canvas.removeEventListener('touchmove', handleMove)
      canvas.removeEventListener('touchend', handleEnd)
      canvas.removeEventListener('touchcancel', handleEnd)
      
      canvas.removeEventListener('mousedown', handleStart)
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
    }
  }, [revealed])

  return (
    <div className="center">
      <div className="scratch-container">
        <div className="scratch-card">
          <div className="scratch-message" style={{ opacity: revealed ? 1 : 0.5 }}>
            <div className="message-content">
              <span className="heart-big">💖</span>
              <h3>Happy Anniversary</h3>
              <p>My love for you grows every day</p>
            </div>
          </div>
          
          <canvas
            ref={canvasRef}
            className="scratch-canvas"
            style={{ opacity: revealed ? 0 : 1 }}
          />
          
          {!revealed && (
            <div className="scratch-instruction">
              <span>👇 Scratch with finger or mouse 👇</span>
              <div className="scratch-progress">
                <div 
                  className="scratch-progress-bar" 
                  style={{ width: `${scratchProgress}%` }}
                />
              </div>
              <span className="scratch-percent">{Math.floor(scratchProgress)}%</span>
            </div>
          )}
        </div>
        
        <AnimatePresence>
          {revealed && (
            <motion.button 
              className="btn btn-reveal"
              onClick={onNext}
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue to Surprise 🎁
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// 🐰 3D INTERACTIVE WELCOME with mouse-following bunny
function Welcome({ onNext }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hover, setHover] = useState(false)
  const [hearts, setHearts] = useState([])

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40
      const y = (e.clientY / window.innerHeight - 0.5) * 40
      setPos({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Floating hearts effect
  useEffect(() => {
    const interval = setInterval(() => {
      setHearts(prev => [...prev, { id: Date.now(), x: Math.random() * 100 }])
      setTimeout(() => {
        setHearts(prev => prev.slice(1))
      }, 3000)
    }, 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="center">
      {/* Floating hearts background */}
      {hearts.map(heart => (
        <motion.div
          key={heart.id}
          className="floating-heart"
          initial={{ left: `${heart.x}%`, bottom: -50, opacity: 1, scale: 0.5 }}
          animate={{ bottom: "100vh", opacity: 0, scale: 1.5 }}
          transition={{ duration: 3, ease: "linear" }}
        >
          💖
        </motion.div>
      ))}
      
      {/* 3D Interactive Bunny */}
      <div
        className="bunny-wrapper"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <img
          src="/images/bunny.png"
          className="bunny"
          alt="cute bunny"
          style={{
            transform: `
              translate(${pos.x}px, ${pos.y}px)
              rotateX(${pos.y / 2}deg)
              rotateY(${pos.x / 2}deg)
              scale(${hover ? 1.1 : 1})
            `
          }}
        />
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        Welcome to our story 💕
      </motion.h1>
      
      <motion.p
        className="subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Move your mouse to interact with the bunny
      </motion.p>
      
      <motion.button 
        className="btn btn-glow"
        onClick={onNext}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.9, type: "spring" }}
        whileHover={{ scale: 1.05, boxShadow: "0 0 25px #ff4d88" }}
        whileTap={{ scale: 0.95 }}
      >
        Start Journey
      </motion.button>
    </div>
  )
}


function Loader() {
  return (
    <div className="center">
      <div className="loader">
        <div className="heart-loader">💖</div>
        <div className="heart-loader">💗</div>
        <div className="heart-loader">💓</div>
      </div>
      <motion.h2
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Loading magic...
      </motion.h2>
    </div>
  )
}