
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function HourlyActivityChart({ data = [] }) {
  if (!data.length) {
    return <p>No hourly activity data available.</p>;
  }

  return (
    <section className="insight-card hourly-chart-card">
      <h2>Hourly Chat Activity</h2>
      <p>Discover when your group is most active throughout the day.</p>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 15, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#294b38"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              tick={{ fill: '#a9b9ae', fontSize: 11 }}
              axisLine={{ stroke: '#294b38' }}
              tickLine={false}
              interval={2}
            />

            <YAxis
              tick={{ fill: '#a9b9ae', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />

            <Tooltip
              cursor={{ fill: '#20392c' }}
              contentStyle={{
                backgroundColor: '#12251b',
                border: '1px solid #294b38',
                borderRadius: 10,
                color: '#f1f7f2',
              }}
              labelStyle={{ color: '#7ce6a0' }}
              formatter={(value) => [value, 'Messages']}
              labelFormatter={(label) => `Hour: ${label}`}
            />

            <Bar
              dataKey="message_count"
              name="Messages"
              fill="#25D366"
              radius={[5, 5, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default HourlyActivityChart;
