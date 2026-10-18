import React, { useRef, useState, useEffect, useCallback } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import {
  Upload,
  Sparkles,
  Layers,
  RotateCw,
  Eye,
  EyeOff,
  Trash2,
  Camera,
  RotateCcw,
  Palette,
  Info,
  Sliders
} from "lucide-react"
import { generate3DWithTrellis } from "../lib/aiServices"

export type AssetCategory = "dress" | "hairstyle" | "shoes" | "jewelry" | "accessory"

export interface LayeredAsset {
  id: string
  name: string
  category: AssetCategory
  thumbnailUrl: string
  glbUrl?: string
  status: "unprocessed" | "synthesizing" | "loaded" | "error"
  visible: boolean
  // 3D Transform properties
  posX: number
  posY: number
  posZ: number
  scaleX: number
  scaleY: number
  scaleZ: number
  rotX: number
  rotY: number
  rotZ: number
  colorTint: string
}

const PRESET_ASSETS: Omit<LayeredAsset, "id" | "status" | "visible" | "posX" | "posY" | "posZ" | "scaleX" | "scaleY" | "scaleZ" | "rotX" | "rotY" | "rotZ" | "colorTint">[] = [
  {
    name: "Royal Kalidar Anarkali Gown",
    category: "dress",
    thumbnailUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=600",
    glbUrl: "/models/flared_gown.glb"
  },
  {
    name: "Mughal Brocade Sherwani Top",
    category: "dress",
    thumbnailUrl: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=600",
    glbUrl: "/models/sherwani_top.glb"
  },
  {
    name: "Festive Flared Silk Gown",
    category: "dress",
    thumbnailUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=600",
    glbUrl: "/models/flared_gown.glb"
  },
  {
    name: "Embroidered Zari Mojari / Jutti",
    category: "shoes",
    thumbnailUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=600",
    glbUrl: "/models/sample_garment.glb"
  },
  {
    name: "Traditional Mogra Braid / Hair",
    category: "hairstyle",
    thumbnailUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=600",
    glbUrl: "/models/sample_garment.glb"
  },
  {
    name: "Polki Kundan Choker Necklace",
    category: "jewelry",
    thumbnailUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=600",
    glbUrl: "/models/sample_garment.glb"
  }
]

// Melanin & Ethnic Skin Tone Spectrum stops
const SPECTRUM_STOPS = [
  { p: 0, r: 255, g: 255, b: 255, name: "Porcelain White / Toile" },
  { p: 15, r: 250, g: 237, b: 225, name: "Fair Ivory" },
  { p: 30, r: 243, g: 209, b: 184, name: "Warm Wheatish" },
  { p: 45, r: 224, g: 172, b: 105, name: "Golden Dusky" },
  { p: 60, r: 198, g: 139, b: 89, name: "Warm Ochre" },
  { p: 75, r: 141, g: 85, b: 36, name: "Rich Bronze" },
  { p: 90, r: 90, g: 52, b: 32, name: "Deep Mocha" },
  { p: 100, r: 47, g: 23, b: 13, name: "Dark Ebony" }
]

function interpolateSkinSpectrum(val: number): { hex: string; name: string } {
  const clamped = Math.max(0, Math.min(100, val))
  let left = SPECTRUM_STOPS[0]
  let right = SPECTRUM_STOPS[SPECTRUM_STOPS.length - 1]

  for (let i = 0; i < SPECTRUM_STOPS.length - 1; i++) {
    if (clamped >= SPECTRUM_STOPS[i].p && clamped <= SPECTRUM_STOPS[i + 1].p) {
      left = SPECTRUM_STOPS[i]
      right = SPECTRUM_STOPS[i + 1]
      break
    }
  }

  const range = right.p - left.p || 1
  const t = (clamped - left.p) / range
  const r = Math.round(left.r + (right.r - left.r) * t)
  const g = Math.round(left.g + (right.g - left.g) * t)
  const b = Math.round(left.b + (right.b - left.b) * t)

  const toHex = (n: number) => n.toString(16).padStart(2, "0")
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`
  const name = t < 0.5 ? left.name : right.name
  return { hex, name }
}

export default function ThreeModelTester() {
  const mountRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const bodyMeshGroupRef = useRef<THREE.Group | null>(null)
  const loadedMeshesRef = useRef<Map<string, THREE.Group>>(new Map())
  const gridHelperRef = useRef<THREE.GridHelper | null>(null)

  // Environment state — Clean White Background
  const [wireframe, setWireframe] = useState<boolean>(false)
  const [autoRotate, setAutoRotate] = useState<boolean>(false)
  const [showGrid, setShowGrid] = useState<boolean>(true)
  const [bodyLoaded, setBodyLoaded] = useState<boolean>(false)
  const [uniformScale, setUniformScale] = useState<boolean>(true)

  // Continuous Skin Tone Spectrum Scrollbar
  const [spectrumPos, setSpectrumPos] = useState<number>(0) // 0 = White Toile
  const [skinColor, setSkinColor] = useState<string>("#ffffff")
  const [skinShadeName, setSkinShadeName] = useState<string>("Porcelain White / Toile")

  // Multi-Asset Layers state (Starts empty to ensure no stray scraps on initial view!)
  const [layers, setLayers] = useState<LayeredAsset[]>([])
  const [activeLayerId, setActiveLayerId] = useState<string>("")
  const [uploadCategory, setUploadCategory] = useState<AssetCategory>("dress")
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false)
  const [statusMessage, setStatusMessage] = useState<string>(
    "Clean SMPL Human Avatar loaded on white studio floor. Select or upload assets to layer."
  )

  const activeLayer = layers.find((l) => l.id === activeLayerId)

  // Handle Skin Tone Scrollbar Spectrum Change
  const handleSpectrumChange = (newVal: number) => {
    setSpectrumPos(newVal)
    const { hex, name } = interpolateSkinSpectrum(newVal)
    setSkinColor(hex)
    setSkinShadeName(name)
  }

  // Setup Three.js Scene & Clean White Studio Viewport
  useEffect(() => {
    if (!mountRef.current) return
    const container = mountRef.current
    const width = container.clientWidth
    const height = container.clientHeight || 560

    // Scene with Clean Pure White Background
    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#ffffff")
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
    camera.position.set(0, 1.4, 3.2)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    rendererRef.current = renderer
    container.innerHTML = ""
    container.appendChild(renderer.domElement)

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.target.set(0, 0.9, 0)
    controls.minDistance = 0.8
    controls.maxDistance = 6.0
    controls.maxPolarAngle = Math.PI / 2 + 0.05
    controlsRef.current = controls

    // Studio Lighting for White Background
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xfff8f0, 2.2)
    keyLight.position.set(2.5, 4.0, 3.0)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 1024
    keyLight.shadow.mapSize.height = 1024
    keyLight.shadow.bias = -0.0001
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xe8f0f8, 1.2)
    fillLight.position.set(-2.5, 2.5, -2.0)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5)
    rimLight.position.set(0, 4.0, -3.5)
    scene.add(rimLight)

    // Floor Grid tailored for clean white studio
    const grid = new THREE.GridHelper(8, 24, 0xc9513e, 0xdedede)
    grid.position.y = 0
    scene.add(grid)
    gridHelperRef.current = grid

    // Ground Shadow Plane (soft contact shadow on white floor)
    const groundGeo = new THREE.PlaneGeometry(8, 8)
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.12 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // ── Load Authentic GarmentForge SMPL Human Body Avatar ──
    const loader = new GLTFLoader()
    loader.load(
      "/models/human_body.glb",
      (gltf) => {
        const bodyGroup = new THREE.Group()
        const rawScene = gltf.scene

        rawScene.traverse((node: any) => {
          if (node.isMesh) {
            node.castShadow = true
            node.receiveShadow = true
            if (node.geometry) node.geometry.computeVertexNormals()
            node.material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(skinColor),
              roughness: 0.55,
              metalness: 0.02,
              side: THREE.DoubleSide
            })
          }
        })

        // Measure bounding box to center at floor level (feet at y = 0)
        const box = new THREE.Box3().setFromObject(rawScene)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        // Standardize avatar height to ~1.75m
        const targetHeight = 1.75
        const scaleFactor = targetHeight / (size.y || 1.75)
        rawScene.scale.setScalar(scaleFactor)

        // Center on X and Z, set bottom of feet at Y = 0
        rawScene.position.x = -center.x * scaleFactor
        rawScene.position.z = -center.z * scaleFactor
        rawScene.position.y = -box.min.y * scaleFactor

        bodyGroup.add(rawScene)
        scene.add(bodyGroup)
        bodyMeshGroupRef.current = bodyGroup
        setBodyLoaded(true)
      },
      undefined,
      (err) => {
        console.warn("Falling back to procedural mannequin:", err)
      }
    )

    // Animation Loop
    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate
        controlsRef.current.update()
      }
      renderer.render(scene, camera)
    }
    animate()

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return
      const w = container.clientWidth
      const h = container.clientHeight || 560
      cameraRef.current.aspect = w / h
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(w, h)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  // Update skin color and wireframe on constant body mannequin in real-time
  useEffect(() => {
    if (!bodyMeshGroupRef.current) return
    bodyMeshGroupRef.current.traverse((node: any) => {
      if (node.isMesh && node.material) {
        node.material.color = new THREE.Color(skinColor)
        node.material.wireframe = wireframe
        node.material.needsUpdate = true
      }
    })
  }, [skinColor, wireframe])

  // Update floor grid visibility
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid
    }
  }, [showGrid])

  // ── Load / Sync 3D Meshes for all Layers ──
  const syncLayerMesh = useCallback(
    (layer: LayeredAsset) => {
      const scene = sceneRef.current
      if (!scene || !layer.glbUrl) return

      let group = loadedMeshesRef.current.get(layer.id)

      if (group) {
        group.visible = layer.visible
        group.position.set(layer.posX, layer.posY, layer.posZ)
        group.scale.set(layer.scaleX, layer.scaleY, layer.scaleZ)
        group.rotation.set(
          (layer.rotX * Math.PI) / 180,
          (layer.rotY * Math.PI) / 180,
          (layer.rotZ * Math.PI) / 180
        )
        return
      }

      const loader = new GLTFLoader()
      loader.load(
        layer.glbUrl,
        (gltf) => {
          const newGroup = new THREE.Group()
          const raw = gltf.scene

          raw.traverse((n: any) => {
            if (n.isMesh) {
              n.castShadow = true
              n.receiveShadow = true
              if (n.geometry) n.geometry.computeVertexNormals()
              n.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(layer.colorTint || "#c9513e"),
                roughness: 0.5,
                metalness: 0.05,
                side: THREE.DoubleSide,
                wireframe: wireframe
              })
            }
          })

          const box = new THREE.Box3().setFromObject(raw)
          const size = box.getSize(new THREE.Vector3())
          const center = box.getCenter(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z) || 1
          const initialScale = 1.6 / maxDim

          raw.scale.setScalar(initialScale)
          raw.position.sub(center.clone().multiplyScalar(initialScale))
          raw.position.y += 0.85

          newGroup.add(raw)
          newGroup.position.set(layer.posX, layer.posY, layer.posZ)
          newGroup.scale.set(layer.scaleX, layer.scaleY, layer.scaleZ)
          newGroup.rotation.set(
            (layer.rotX * Math.PI) / 180,
            (layer.rotY * Math.PI) / 180,
            (layer.rotZ * Math.PI) / 180
          )
          newGroup.visible = layer.visible

          scene.add(newGroup)
          loadedMeshesRef.current.set(layer.id, newGroup)
        },
        undefined,
        (err) => {
          console.warn(`Failed loading mesh for ${layer.name}:`, err)
        }
      )
    },
    [wireframe]
  )

  useEffect(() => {
    layers.forEach((layer) => {
      syncLayerMesh(layer)
    })
  }, [layers, syncLayerMesh])

  // Handle Layer Transform Updates
  const updateActiveTransform = (key: keyof LayeredAsset, value: number | string | boolean) => {
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id !== activeLayerId) return l
        const updated = { ...l, [key]: value }

        if (
          uniformScale &&
          typeof value === "number" &&
          (key === "scaleX" || key === "scaleY" || key === "scaleZ")
        ) {
          updated.scaleX = value
          updated.scaleY = value
          updated.scaleZ = value
        }

        return updated
      })
    )
  }

  // Handle Send to Trellis API
  const handleSendToTrellis = async (layerId: string) => {
    const target = layers.find((l) => l.id === layerId)
    if (!target) return

    setIsSynthesizing(true)
    setStatusMessage(`Synthesizing 3D mesh for ${target.name} via Trellis O-Voxel manifold...`)

    setLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, status: "synthesizing" } : l))
    )

    try {
      const result = await generate3DWithTrellis(target.thumbnailUrl, target.category)

      const existing = loadedMeshesRef.current.get(layerId)
      if (existing && sceneRef.current) {
        sceneRef.current.remove(existing)
        loadedMeshesRef.current.delete(layerId)
      }

      setLayers((prev) =>
        prev.map((l) =>
          l.id === layerId
            ? {
                ...l,
                glbUrl: result.glbUrl,
                status: "loaded"
              }
            : l
        )
      )
      setStatusMessage(`Trellis mesh loaded successfully for ${target.name}!`)
    } catch (err: any) {
      setStatusMessage(`Trellis generation failed: ${err.message}`)
      setLayers((prev) =>
        prev.map((l) => (l.id === layerId ? { ...l, status: "error" } : l))
      )
    } finally {
      setIsSynthesizing(false)
    }
  }

  // Handle Upload Image from Storage
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string
        const newId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
        const newLayer: LayeredAsset = {
          id: newId,
          name: file.name.replace(/\.[^/.]+$/, ""),
          category: uploadCategory,
          thumbnailUrl: dataUrl,
          status: "unprocessed",
          visible: true,
          posX: 0,
          posY: 0,
          posZ: 0,
          scaleX: 1,
          scaleY: 1,
          scaleZ: 1,
          rotX: 0,
          rotY: 0,
          rotZ: 0,
          colorTint: "#c9513e"
        }
        setLayers((prev) => [...prev, newLayer])
        setActiveLayerId(newId)
        setStatusMessage(`Imported ${file.name}. Click 'Send to Trellis 3D' to synthesize mesh.`)
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ""
  }

  // Add Preset Asset
  const handleAddPreset = (preset: typeof PRESET_ASSETS[0]) => {
    const newId = `preset-${Date.now()}`
    const newLayer: LayeredAsset = {
      id: newId,
      name: preset.name,
      category: preset.category,
      thumbnailUrl: preset.thumbnailUrl,
      glbUrl: preset.glbUrl,
      status: "loaded",
      visible: true,
      posX: 0,
      posY: 0,
      posZ: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      colorTint: "#c9513e"
    }
    setLayers((prev) => [...prev, newLayer])
    setActiveLayerId(newId)
    setStatusMessage(`Loaded preset ${preset.name} into 3D environment.`)
  }

  // Remove Layer
  const handleRemoveLayer = (id: string) => {
    const existing = loadedMeshesRef.current.get(id)
    if (existing && sceneRef.current) {
      sceneRef.current.remove(existing)
      loadedMeshesRef.current.delete(id)
    }
    setLayers((prev) => prev.filter((l) => l.id !== id))
    if (activeLayerId === id && layers.length > 1) {
      const remaining = layers.filter((l) => l.id !== id)
      setActiveLayerId(remaining[0]?.id || "")
    }
  }

  // Take High-Res Viewport Screenshot
  const handleCaptureScreenshot = () => {
    if (!rendererRef.current) return
    const dataUrl = rendererRef.current.domElement.toDataURL("image/png")
    const a = document.createElement("a")
    a.download = `vastrashastra-3d-fit-${Date.now()}.png`
    a.href = dataUrl
    a.click()
  }

  // Reset Active Layer Transforms
  const handleResetTransform = () => {
    updateActiveTransform("posX", 0)
    updateActiveTransform("posY", 0)
    updateActiveTransform("posZ", 0)
    updateActiveTransform("scaleX", 1)
    updateActiveTransform("scaleY", 1)
    updateActiveTransform("scaleZ", 1)
    updateActiveTransform("rotX", 0)
    updateActiveTransform("rotY", 0)
    updateActiveTransform("rotZ", 0)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Guide */}
      <div className="bg-[#172b2b] text-white p-5 rounded-2xl border border-[#28453c] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#e8b547] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Three.js 3D Viewport & Trellis Multi-Asset Lab
          </span>
          <h2 className="text-xl lg:text-2xl font-serif mt-0.5">3D Model Testing Environment</h2>
          <p className="text-xs text-[#cad5cf] mt-1 max-w-2xl">
            Constant GarmentForge human body avatar in clean daylight studio. Upload dress, hairstyle, shoes, or accessories, synthesize them via Trellis 3D, and adjust X, Y, Z translation, scale, and rotation.
          </p>
        </div>

        {/* Viewport Action Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              autoRotate ? "bg-[#e8b547] text-[#172b2b]" : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" /> Turntable
          </button>
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              wireframe ? "bg-[#e8b547] text-[#172b2b]" : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Wireframe
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              showGrid ? "bg-white/20 text-white" : "bg-white/5 text-white/50"
            }`}
          >
            Grid
          </button>
          <button
            onClick={handleCaptureScreenshot}
            className="px-3.5 py-1.5 bg-[#c9513e] hover:bg-[#b04332] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow"
          >
            <Camera className="w-3.5 h-3.5" /> Capture PNG
          </button>
        </div>
      </div>

      {/* Main 3D Stage + Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Viewport on Clean White Floor */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-[#ded8cd] bg-white shadow-lg">
            {/* Three.js Canvas Container with Clean White Background */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing bg-white" />

            {/* Mannequin Fixed Anchor Indicator */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#ded8cd] text-[#172b2b] text-[11px] flex items-center gap-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
              <span>
                Body Avatar: <strong>SMPL GarmentForge (Fixed Anchor)</strong>
              </span>
            </div>

            {/* Status Message Toast */}
            {statusMessage && (
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#ded8cd] text-[#172b2b] text-xs flex items-center justify-between shadow-md">
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#c9513e]" /> {statusMessage}
                </span>
                {isSynthesizing && <span className="animate-spin text-sm text-[#c9513e]">✦</span>}
              </div>
            )}
          </div>

          {/* Quick Presets Tray */}
          <div className="bg-[#fcfaf5] p-4 rounded-xl border border-[#ded8cc]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs uppercase font-bold text-[#888] tracking-wider">
                Quick Preset Assets to Test on Body Model
              </span>
              <span className="text-[11px] text-[#777]">Click to layer into 3D scene</span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
              {PRESET_ASSETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddPreset(p)}
                  className="flex flex-col items-center p-2 rounded-lg border border-[#e4dcce] hover:border-[#c9513e] bg-white hover:bg-[#fffbfa] transition-all group text-left"
                >
                  <img
                    src={p.thumbnailUrl}
                    alt={p.name}
                    className="w-full h-16 object-cover rounded-md group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[10px] font-bold text-[#172b2b] mt-1.5 line-clamp-1">
                    {p.name}
                  </span>
                  <span className="text-[9px] uppercase font-semibold text-[#c9513e]">{p.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Continuous Spectrum Scrollbar & Multi-Asset Controls */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* 1. Continuous Melanin / Skin Tone Spectrum Scrollbar */}
          <div className="bg-[#faf7f0] p-4 rounded-xl border border-[#ded4c3] space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#e5dccf]">
              <span className="text-xs uppercase font-bold text-[#172b2b] tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#c9513e]" /> Body Tone Spectrum Scrollbar
              </span>
              <span className="text-[11px] font-mono font-bold text-[#c9513e]">{skinColor}</span>
            </div>

            {/* Spectrum Slider with Gradient Track */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-[#172b2b]">{skinShadeName}</span>
                <span className="text-[#777] font-mono">{spectrumPos}% Melanin</span>
              </div>

              {/* Continuous Scrollbar Track */}
              <div className="relative py-1">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={spectrumPos}
                  onChange={(e) => handleSpectrumChange(Number(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer border border-[#c5baab]"
                  style={{
                    background:
                      "linear-gradient(to right, #ffffff 0%, #faede1 15%, #f3d2be 30%, #e0ac69 45%, #c68b59 60%, #8d5524 75%, #5a3420 90%, #2f170d 100%)"
                  }}
                />
              </div>

              {/* Color swatch & Custom color picker input */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-[#666]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full border border-black/20 shadow-inner"
                    style={{ backgroundColor: skinColor }}
                  />
                  <span>Slide scrollbar to adjust avatar tone</span>
                </div>

                <label className="flex items-center gap-1 cursor-pointer font-bold text-[#172b2b] hover:text-[#c9513e]">
                  <span>Custom:</span>
                  <input
                    type="color"
                    value={skinColor}
                    onChange={(e) => {
                      setSkinColor(e.target.value)
                      setSkinShadeName("Custom Tone")
                    }}
                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 2. Multi-Asset Layer Tray */}
          <div className="bg-[#faf7f0] p-4 rounded-xl border border-[#ded4c3] space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#e5dccf]">
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#c9513e]" />
                <h3 className="text-xs uppercase font-bold text-[#172b2b]">Multi-Asset Layers ({layers.length})</h3>
              </div>

              {/* Upload Image Trigger */}
              <div className="flex items-center gap-1.5">
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as AssetCategory)}
                  className="text-[10px] font-semibold bg-white border border-[#ded4c3] rounded px-1.5 py-1 text-[#444]"
                >
                  <option value="dress">Dress</option>
                  <option value="hairstyle">Hair</option>
                  <option value="shoes">Shoes</option>
                  <option value="jewelry">Jewelry</option>
                  <option value="accessory">Accessory</option>
                </select>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1 bg-[#172b2b] hover:bg-[#c9513e] text-white text-[11px] font-bold rounded-lg transition-all"
                >
                  <Upload className="w-3 h-3 text-[#e8b547]" /> Upload
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Layer Cards or Empty State */}
            {layers.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#888] space-y-1">
                <p>No layers currently loaded.</p>
                <p className="text-[11px] text-[#aaa]">
                  Pick a preset below or click <strong>Upload</strong> to layer garments and accessories.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                {layers.map((layer) => {
                  const isActive = layer.id === activeLayerId
                  return (
                    <div
                      key={layer.id}
                      onClick={() => setActiveLayerId(layer.id)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        isActive
                          ? "border-[#c9513e] bg-white ring-2 ring-[#c9513e]/20 shadow-sm"
                          : "border-[#e5dccf] bg-[#f5efe4] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={layer.thumbnailUrl}
                          alt={layer.name}
                          className="w-10 h-10 object-cover rounded-md border border-black/10"
                        />
                        <div>
                          <strong className="block font-bold text-[#172b2b] line-clamp-1">{layer.name}</strong>
                          <span className="text-[10px] text-[#777] uppercase font-semibold">{layer.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {layer.status === "unprocessed" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSendToTrellis(layer.id)
                            }}
                            className="px-2 py-1 bg-[#e8b547] hover:bg-[#d4a035] text-[#172b2b] text-[10px] font-bold rounded flex items-center gap-1"
                          >
                            <Sparkles className="w-2.5 h-2.5" /> Trellis
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setLayers((prev) =>
                              prev.map((l) => (l.id === layer.id ? { ...l, visible: !l.visible } : l))
                            )
                          }}
                          className="p-1 text-[#666] hover:text-[#172b2b]"
                        >
                          {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 opacity-40" />}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveLayer(layer.id)
                          }}
                          className="p-1 text-[#999] hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 3. 3D Transform Sliders for Active Layer */}
          {activeLayer && (
            <div className="bg-[#faf7f0] p-4 rounded-xl border border-[#ded4c3] space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#e5dccf]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#c9513e] tracking-wider">
                    Layer 3D Alignment
                  </span>
                  <h4 className="text-xs font-bold text-[#172b2b] line-clamp-1">{activeLayer.name}</h4>
                </div>
                <button
                  onClick={handleResetTransform}
                  className="flex items-center gap-1 text-[11px] text-[#c9513e] font-bold hover:underline"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Position Controls (X, Y, Z) */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#777] tracking-wider block">
                  Position Translation (Axes X / Y / Z)
                </span>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <label className="text-[#888] font-bold block mb-1">Pos X (Left/Right)</label>
                    <input
                      type="range"
                      min={-1.5}
                      max={1.5}
                      step={0.01}
                      value={activeLayer.posX}
                      onChange={(e) => updateActiveTransform("posX", Number(e.target.value))}
                      className="w-full accent-[#c9513e]"
                    />
                    <span className="font-mono text-[#555] block text-center">{activeLayer.posX.toFixed(2)}m</span>
                  </div>

                  <div>
                    <label className="text-[#888] font-bold block mb-1">Pos Y (Up/Down)</label>
                    <input
                      type="range"
                      min={-1.5}
                      max={1.5}
                      step={0.01}
                      value={activeLayer.posY}
                      onChange={(e) => updateActiveTransform("posY", Number(e.target.value))}
                      className="w-full accent-[#c9513e]"
                    />
                    <span className="font-mono text-[#555] block text-center">{activeLayer.posY.toFixed(2)}m</span>
                  </div>

                  <div>
                    <label className="text-[#888] font-bold block mb-1">Pos Z (In/Out)</label>
                    <input
                      type="range"
                      min={-1.5}
                      max={1.5}
                      step={0.01}
                      value={activeLayer.posZ}
                      onChange={(e) => updateActiveTransform("posZ", Number(e.target.value))}
                      className="w-full accent-[#c9513e]"
                    />
                    <span className="font-mono text-[#555] block text-center">{activeLayer.posZ.toFixed(2)}m</span>
                  </div>
                </div>
              </div>

              {/* Scale Controls */}
              <div className="space-y-2 pt-2 border-t border-[#e8dfd2]">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-[#777] tracking-wider">
                    Scale Dimensions (Axes X / Y / Z)
                  </span>
                  <button
                    onClick={() => setUniformScale(!uniformScale)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      uniformScale ? "bg-[#28453c] text-white" : "bg-[#ded4c3] text-[#444]"
                    }`}
                  >
                    {uniformScale ? "Uniform Locked" : "Free Axes"}
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <label className="text-[#888] font-bold block mb-1">Scale X (Width)</label>
                    <input
                      type="range"
                      min={0.2}
                      max={2.5}
                      step={0.02}
                      value={activeLayer.scaleX}
                      onChange={(e) => updateActiveTransform("scaleX", Number(e.target.value))}
                      className="w-full accent-[#c9513e]"
                    />
                    <span className="font-mono text-[#555] block text-center">{activeLayer.scaleX.toFixed(2)}x</span>
                  </div>

                  <div>
                    <label className="text-[#888] font-bold block mb-1">Scale Y (Height)</label>
                    <input
                      type="range"
                      min={0.2}
                      max={2.5}
                      step={0.02}
                      value={activeLayer.scaleY}
                      onChange={(e) => updateActiveTransform("scaleY", Number(e.target.value))}
                      className="w-full accent-[#c9513e]"
                    />
                    <span className="font-mono text-[#555] block text-center">{activeLayer.scaleY.toFixed(2)}x</span>
                  </div>

                  <div>
                    <label className="text-[#888] font-bold block mb-1">Scale Z (Depth)</label>
                    <input
                      type="range"
                      min={0.2}
                      max={2.5}
                      step={0.02}
                      value={activeLayer.scaleZ}
                      onChange={(e) => updateActiveTransform("scaleZ", Number(e.target.value))}
                      className="w-full accent-[#c9513e]"
                    />
                    <span className="font-mono text-[#555] block text-center">{activeLayer.scaleZ.toFixed(2)}x</span>
                  </div>
                </div>
              </div>

              {/* Rotation Controls */}
              <div className="space-y-2 pt-2 border-t border-[#e8dfd2]">
                <span className="text-[10px] uppercase font-bold text-[#777] tracking-wider block">
                  3D Rotation Angles
                </span>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <label className="text-[#888] font-bold block mb-1">Rot X (Pitch)</label>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={2}
                      value={activeLayer.rotX}
                      onChange={(e) => updateActiveTransform("rotX", Number(e.target.value))}
                      className="w-full accent-[#c9513e]"
                    />
                    <span className="font-mono text-[#555] block text-center">{activeLayer.rotX}°</span>
                  </div>

                  <div>
                    <label className="text-[#888] font-bold block mb-1">Rot Y (Yaw)</label>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={2}
                      value={activeLayer.rotY}
                      onChange={(e) => updateActiveTransform("rotY", Number(e.target.value))}
                      className="w-full accent-[#c9513e]"
                    />
                    <span className="font-mono text-[#555] block text-center">{activeLayer.rotY}°</span>
                  </div>

                  <div>
                    <label className="text-[#888] font-bold block mb-1">Rot Z (Roll)</label>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      step={2}
                      value={activeLayer.rotZ}
                      onChange={(e) => updateActiveTransform("rotZ", Number(e.target.value))}
                      className="w-full accent-[#c9513e]"
                    />
                    <span className="font-mono text-[#555] block text-center">{activeLayer.rotZ}°</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
