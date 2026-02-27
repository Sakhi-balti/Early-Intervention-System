export default function RiskBadge({ category }) {
  const styles = {
    low:    { background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' },
    medium: { background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' },
    high:   { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
  }

  const style = styles[category] || styles.low

  return (
    <span style={{
      ...style,
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      {category === 'high' ? '🔴' : category === 'medium' ? '🟡' : '🟢'} {category}
    </span>
  )
}
