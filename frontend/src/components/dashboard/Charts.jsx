import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'

ChartJS.register(
  ArcElement, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Tooltip, Legend, Filler
)

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#9395a5', font: { family: 'Inter', size: 12 } },
    },
    tooltip: {
      backgroundColor: '#1a1b2e',
      borderColor: '#313244',
      borderWidth: 1,
      titleColor: '#e2e4f0',
      bodyColor: '#9395a5',
      padding: 12,
    },
  },
}

/**
 * Difficulty Donut chart (Easy / Medium / Hard)
 */
export function DifficultyDonut({ easySolved = 0, mediumSolved = 0, hardSolved = 0 }) {
  const total = easySolved + mediumSolved + hardSolved
  const data = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [{
      data: [easySolved, mediumSolved, hardSolved],
      backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
      borderColor: '#0d0e18',
      borderWidth: 3,
      hoverOffset: 6,
    }],
  }
  const options = {
    ...chartDefaults,
    cutout: '75%',
    plugins: {
      ...chartDefaults.plugins,
      legend: { position: 'bottom', labels: chartDefaults.plugins.legend.labels },
    },
  }

  return (
    <div style={{ position: 'relative', height: 220 }}>
      <Doughnut data={data} options={options} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -55%)',
        textAlign: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Solved</div>
      </div>
    </div>
  )
}

/**
 * Platform comparison bar chart
 */
export function PlatformBar({ platformStats = {} }) {
  const platforms = Object.entries(platformStats).filter(([, v]) => v)
  if (platforms.length === 0) return null

  const labels = platforms.map(([p]) => p.charAt(0).toUpperCase() + p.slice(1))
  const data = {
    labels,
    datasets: [
      {
        label: 'Easy',
        data: platforms.map(([, s]) => s.easySolved || 0),
        backgroundColor: 'rgba(34,197,94,0.8)',
        borderRadius: 6,
      },
      {
        label: 'Medium',
        data: platforms.map(([, s]) => s.mediumSolved || 0),
        backgroundColor: 'rgba(245,158,11,0.8)',
        borderRadius: 6,
      },
      {
        label: 'Hard',
        data: platforms.map(([, s]) => s.hardSolved || 0),
        backgroundColor: 'rgba(239,68,68,0.8)',
        borderRadius: 6,
      },
    ],
  }
  const options = {
    ...chartDefaults,
    scales: {
      x: {
        stacked: true,
        ticks: { color: '#9395a5' },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        stacked: true,
        ticks: { color: '#9395a5' },
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
    },
    plugins: {
      ...chartDefaults.plugins,
      legend: { position: 'bottom', labels: chartDefaults.plugins.legend.labels },
    },
  }

  return (
    <div style={{ height: 240 }}>
      <Bar data={data} options={options} />
    </div>
  )
}

/**
 * Progress over time line chart
 */
export function ProgressLine({ snapshots = [] }) {
  if (!snapshots.length) return (
    <div className="empty-state" style={{ padding: '2rem' }}>
      <p>No historical data yet. Refresh stats daily to see trends.</p>
    </div>
  )

  const labels = snapshots.map(s => {
    const d = new Date(s.fetchedAt)
    return `${d.getMonth()+1}/${d.getDate()}`
  })

  const data = {
    labels,
    datasets: [
      {
        label: 'Total Solved',
        data: snapshots.map(s => s.totalSolved),
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 3,
      },
    ],
  }

  const options = {
    ...chartDefaults,
    scales: {
      x: { ticks: { color: '#9395a5' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#9395a5' }, grid: { color: 'rgba(255,255,255,0.04)' }, min: 0 },
    },
    plugins: {
      ...chartDefaults.plugins,
      legend: { position: 'bottom', labels: chartDefaults.plugins.legend.labels },
    },
  }

  return <div style={{ height: 240 }}><Line data={data} options={options} /></div>
}

/**
 * Acceptance rate donut
 */
export function AcceptanceDonut({ acceptanceRate = 0 }) {
  const data = {
    datasets: [{
      data: [acceptanceRate, 100 - acceptanceRate],
      backgroundColor: ['#06b6d4', 'rgba(255,255,255,0.05)'],
      borderWidth: 0,
    }],
  }
  return (
    <div style={{ position: 'relative', height: 140 }}>
      <Doughnut data={data} options={{ ...chartDefaults, cutout: '78%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-2)' }}>{acceptanceRate}%</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Acceptance</div>
      </div>
    </div>
  )
}
