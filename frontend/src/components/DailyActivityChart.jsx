
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function DailyActivityChart({ data = [] }) {
  if (!data.length) {
    return <p>No daily activity data available.</p>;
  }

  return (
    <section className="insight-card daily-chart-card">
      <h2>Daily Chat Activity</h2>
      <p>Track how your group's conversations change over time.</p>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#294b38"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{ fill: '#a9b9ae', fontSize: 11 }}
              axisLine={{ stroke: '#294b38' }}
              tickLine={false}
              minTickGap={30}
              tickFormatter={(value) => value.slice(5)}
            />

            <YAxis
              tick={{ fill: '#a9b9ae', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#12251b',
                border: '1px solid #294b38',
                borderRadius: 10,
                color: '#f1f7f2',
              }}
              labelStyle={{ color: '#7ce6a0' }}
              formatter={(value) => [value, 'Messages']}
              labelFormatter={(label) => `Date: ${label}`}
            />

            <Line
              type="monotone"
              dataKey="message_count"
              name="Messages"
              stroke="#25D366"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#7ce6a0' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default DailyActivityChart;
