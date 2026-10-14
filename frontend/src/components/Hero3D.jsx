import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// A clay pot spinning on a potter's wheel, surrounded by floating craft shapes.
// Follows the pointer, pauses when off-screen and stays still for reduced-motion users.
export default function Hero3D() {
  const mount = useRef(null)

  useEffect(() => {
    const el = mount.current
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      el.classList.add('hero3d-fallback')
      return undefined
    }
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x0c0a09, 9, 22)
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 1.6, 9)

    scene.add(new THREE.HemisphereLight(0xffe2c8, 0x1a0f0a, 0.7))
    const key = new THREE.DirectionalLight(0xffc89a, 2.4)
    key.position.set(4, 6, 5)
    scene.add(key)
    const rim = new THREE.PointLight(0xff6a2a, 40, 20)
    rim.position.set(-4, 2, -3)
    scene.add(rim)

    // Potter's wheel, ring and pot share one stage that slides right on wide screens
    const stage = new THREE.Group()
    scene.add(stage)
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.3, 0.28, 64),
      new THREE.MeshStandardMaterial({ color: 0x2b2420, metalness: 0.6, roughness: 0.35 }),
    )
    wheel.position.y = -1.55
    stage.add(wheel)
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.03, 16, 120),
      new THREE.MeshBasicMaterial({ color: 0xe2733a }),
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = -1.4
    stage.add(ring)

    // Clay pot from a lathe profile
    const profile = [
      [0, 0], [0.75, 0], [0.95, 0.12], [1.25, 0.6], [1.35, 1.1], [1.2, 1.7], [0.82, 2.15],
      [0.62, 2.45], [0.68, 2.75], [0.8, 2.85], [0.74, 2.9], [0.55, 2.62], [0.5, 2.4],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    const pot = new THREE.Mesh(
      new THREE.LatheGeometry(profile, 96),
      new THREE.MeshStandardMaterial({ color: 0xc0602f, roughness: 0.62, metalness: 0.05, side: THREE.DoubleSide }),
    )
    pot.position.y = -1.4
    stage.add(pot)
    // painted bands on the pot
    for (const [y, r] of [[0.7, 1.29], [1.55, 1.25]]) {
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.035, 12, 96),
        new THREE.MeshStandardMaterial({ color: 0xf2c38b, roughness: 0.4, metalness: 0.3 }),
      )
      band.rotation.x = Math.PI / 2
      pot.add(band)
      band.position.set(0, y, 0)
    }

    // Floating craft shapes
    const floaters = []
    const shapes = [
      [new THREE.TorusKnotGeometry(0.42, 0.13, 120, 16), 0xf2a65a, [-3.6, 1.4, -1]],
      [new THREE.IcosahedronGeometry(0.55, 0), 0xe2733a, [5.6, 2.5, -3.5]],
      [new THREE.OctahedronGeometry(0.42, 0), 0xffd7b0, [-3.1, -0.9, 0.6]],
      [new THREE.TorusGeometry(0.42, 0.14, 24, 64), 0xd9894f, [0.9, -2.1, 1.2]],
      [new THREE.DodecahedronGeometry(0.32, 0), 0xb3541e, [-1.9, 2.7, -2.2]],
      [new THREE.SphereGeometry(0.26, 32, 32), 0xffb37a, [1.2, 3.1, -2.5]],
    ]
    for (const [geo, color, [x, y, z]] of shapes) {
      const m = new THREE.Mesh(
        geo,
        new THREE.MeshPhysicalMaterial({ color, roughness: 0.25, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.2 }),
      )
      m.position.set(x, y, z)
      m.userData = { base: y, phase: Math.random() * Math.PI * 2, spin: 0.2 + Math.random() * 0.5 }
      scene.add(m)
      floaters.push(m)
    }
    const wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(5.4, 1),
      new THREE.MeshBasicMaterial({ color: 0xe2733a, wireframe: true, transparent: true, opacity: 0.06 }),
    )
    scene.add(wire)

    // Warm dust
    const count = 700
    const pts = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pts[i * 3] = (Math.random() - 0.5) * 22
      pts[i * 3 + 1] = (Math.random() - 0.5) * 12
      pts[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2
    }
    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.BufferAttribute(pts, 3))
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ color: 0xf2a65a, size: 0.035, transparent: true, opacity: 0.7 }),
    )
    scene.add(dust)

    function resize() {
      const { clientWidth: w, clientHeight: h } = el
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      // keep the pot framed on narrow screens
      camera.position.z = w < 700 ? 12 : 9
      stage.position.x = w >= 960 ? 2.7 : 0
      stage.scale.setScalar(w >= 960 ? 0.86 : 0.9)
      stage.position.y = w >= 960 ? 0.15 : 0
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const pointer = { x: 0, y: 0 }
    const onMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)

    let visible = true
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting })
    io.observe(el)

    const clock = new THREE.Clock()
    let frame
    function draw() {
      const t = clock.getElapsedTime()
      pot.rotation.y = t * 0.6
      wheel.rotation.y = t * 0.6
      wire.rotation.y = t * 0.03
      wire.rotation.x = t * 0.015
      dust.rotation.y = t * 0.01
      for (const m of floaters) {
        m.position.y = m.userData.base + Math.sin(t * 0.9 + m.userData.phase) * 0.25
        m.rotation.x = t * m.userData.spin
        m.rotation.y = t * m.userData.spin * 0.8
      }
      camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.04
      camera.position.y += (1.6 - pointer.y * 0.7 - camera.position.y) * 0.04
      camera.lookAt(0, 0.2, 0)
      renderer.render(scene, camera)
    }
    function loop() {
      frame = requestAnimationFrame(loop)
      if (visible) draw()
    }
    if (still) draw()
    else loop()

    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      scene.traverse((o) => {
        o.geometry?.dispose()
        o.material?.dispose()
      })
      renderer.dispose()
      el.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mount} className="hero3d" aria-hidden="true" />
}
