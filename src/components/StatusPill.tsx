import type { MatchStatus } from '../types'

const LABELS: Record<MatchStatus, string> = {
  scheduled: 'Scheduled',
  in_progress: 'Live',
  completed: 'Completed',
}

export default function StatusPill({ status }: { status: MatchStatus }) {
  return <span className={`pill pill-${status}`}>{status === 'in_progress' ? '● Live' : LABELS[status]}</span>
}
