import { CheckCircle, XCircle, Lightbulb, Info } from 'lucide-react'

/**
 * AI-style insights panel
 */
export default function InsightsPanel({ insights }) {
  if (!insights) return null
  const { strengths = [], weaknesses = [], suggestions = [], insights: infoItems = [] } = insights

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {infoItems.map((item, i) => (
        <div key={i} className="insight-card insight-info">
          <Info size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{item}</span>
        </div>
      ))}
      {strengths.map((item, i) => (
        <div key={i} className="insight-card insight-strength">
          <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{item}</span>
        </div>
      ))}
      {weaknesses.map((item, i) => (
        <div key={i} className="insight-card insight-weakness">
          <XCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{item}</span>
        </div>
      ))}
      {suggestions.map((item, i) => (
        <div key={i} className="insight-card insight-suggestion">
          <Lightbulb size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{item}</span>
        </div>
      ))}
    </div>
  )
}
