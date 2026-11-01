import { useLanguage } from '../../context/LanguageContext'
import { statusMap } from '../../utils/format'
import { Badge } from '.'

export function StatusBadge({ status }: { status: string }) {
  const { tr } = useLanguage()
  const [label, tone] = statusMap[status] ?? [status, 'gray']
  return <Badge tone={tone}>{tr(label)}</Badge>
}
