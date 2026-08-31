export default function TrophyIcon({ size = 32, color = '#f6e2b8' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="34" rx="13" ry="19" stroke={color} strokeWidth="6" />
      <ellipse cx="84" cy="34" rx="13" ry="19" stroke={color} strokeWidth="6" />
      <circle cx="50" cy="8" r="6" fill={color} />
      <path d="M28 12h44c0 28-8.5 45-22 45S28 40 28 12Z" fill={color} />
      <rect x="44" y="55" width="12" height="20" fill={color} />
      <rect x="31" y="75" width="38" height="8" rx="2" fill={color} />
      <rect x="23" y="83" width="54" height="9" rx="2" fill={color} />
      <rect x="17" y="92" width="66" height="8" rx="2" fill={color} />
    </svg>
  )
}
