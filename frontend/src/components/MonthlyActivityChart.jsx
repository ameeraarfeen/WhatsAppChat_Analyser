
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

function MonthlyActivityChart({ data }) {
  if (!data || data.length === 0) {
    return <p>No monthly activity data available.</p>
  }

  return (
    <div className="monthly-chart">
      <h2>Monthly Activity</h2>
      <p className="chart-description">
        Number of messages sent each month
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            angle={-25}
            textAnchor="end"
            height={65}
          />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="message_count"
            name="Messages"
            fill="#25D366"
            radius={[5, 5, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default MonthlyActivityChart
