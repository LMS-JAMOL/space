import { statusMap } from '../../utils/format'
import { Badge } from '.'

export function StatusBadge({ status }: { status: string }) {
  const [label, tone] = statusMap[status] ?? [status, 'gray']
  return <Badge tone={tone}>{label}</Badge>
}
