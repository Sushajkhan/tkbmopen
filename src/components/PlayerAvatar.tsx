import type { Player } from '../types'

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export default function PlayerAvatar({
  player,
  size = 40,
}: {
  player: Pick<Player, 'name' | 'image_url'>
  size?: number
}) {
  const style = { width: size, height: size, fontSize: size * 0.38 }
  if (player.image_url) {
    return <img className="avatar" src={player.image_url} alt={player.name} style={style} />
  }
  return (
    <div className="avatar" style={style}>
      {initials(player.name)}
    </div>
  )
}
