import { Brush, ChefHat, Drama, Flower2, Hammer, Music, PenTool, Shapes, Amphora } from 'lucide-react'

const STYLES = {
  pottery: { icon: Amphora, from: '#c8763d', to: '#7a3a12' },
  painting: { icon: Brush, from: '#5b8bb0', to: '#2c4a6b' },
  music: { icon: Music, from: '#6d5a9c', to: '#3b2d63' },
  dance: { icon: Drama, from: '#c2456b', to: '#7a1f3f' },
  cooking: { icon: ChefHat, from: '#d39b2a', to: '#8a5a0e' },
  yoga: { icon: Flower2, from: '#5e9a78', to: '#2f5e44' },
  calligraphy: { icon: PenTool, from: '#4a4a4a', to: '#1f1f1f' },
  woodworking: { icon: Hammer, from: '#9a6b44', to: '#5a3a1f' },
}

export function categoryStyle(category = '') {
  return STYLES[category.toLowerCase()] || { icon: Shapes, from: '#b3541e', to: '#6e2f0c' }
}

export default function CategoryArt({ category, height = 150, children }) {
  const { icon: Icon, from, to } = categoryStyle(category)
  return (
    <div className="category-art" style={{ height, background: `linear-gradient(135deg, ${from}, ${to})` }}>
      <Icon className="category-art-icon" size={height * 0.42} strokeWidth={1.3} />
      {children}
    </div>
  )
}
