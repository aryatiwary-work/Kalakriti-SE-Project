export default function Logo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo-mark">
      <defs>
        <linearGradient id="kk-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2a65a" />
          <stop offset="1" stopColor="#b3541e" />
        </linearGradient>
      </defs>
      <path d="M11 5h10l-1.6 3.2c3.9 1.6 6.6 5.3 6.6 9.6C26 23.4 21.5 27 16 27S6 23.4 6 17.8c0-4.3 2.7-8 6.6-9.6L11 5z" fill="url(#kk-g)" />
      <path d="M9.5 16.5h13M10 20.5h12" stroke="#1a1310" strokeWidth="1.4" strokeLinecap="round" opacity=".55" />
    </svg>
  )
}
