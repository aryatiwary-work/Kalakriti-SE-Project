import { useEffect, useRef, useState } from 'react'

// Adds the "in" class once the element scrolls into view (CSS handles the animation).
export function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      el?.classList.add('in')
      return undefined
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in')
          io.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

// Counts from 0 to `target` once, with an ease-out curve.
export function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target == null) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return undefined
    }
    let frame
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])
  return value
}

// Mouse-follow 3D tilt for cards.
export function tiltHandlers(max = 10) {
  return {
    onMouseMove(e) {
      const r = e.currentTarget.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      e.currentTarget.style.setProperty('--rx', `${(-y * max).toFixed(2)}deg`)
      e.currentTarget.style.setProperty('--ry', `${(x * max).toFixed(2)}deg`)
      e.currentTarget.style.setProperty('--mx', `${(x + 0.5) * 100}%`)
      e.currentTarget.style.setProperty('--my', `${(y + 0.5) * 100}%`)
    },
    onMouseLeave(e) {
      e.currentTarget.style.setProperty('--rx', '0deg')
      e.currentTarget.style.setProperty('--ry', '0deg')
    },
  }
}
