
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function WeekdayActivityChart({ data = [] }) {
  if (!data.length) {
    return <p>No weekday activity data available.</p>;
  }

  return (
    <section className="insight-card weekday-chart-card">
      <h2>Weekly Chat Activity</h2>
      <p>Discover which days your group chats the most.</p>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#294b38"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tick={{ fill: '#a9b9ae', fontSize: 12 }}
              axisLine={{ stroke: '#294b38' }}
              tickLine={false}
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
              formatter={(value) => [value, 'Messages']}
            />

            <Bar
              dataKey="message_count"
              name="Messages"
              fill="#25D366"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default WeekdayActivityChart;
