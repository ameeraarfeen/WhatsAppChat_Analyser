
import { useState } from 'react';

function getHeatmapColor(intensity, count) {
  if (count === 0) return '#182820';
  if (intensity <= 0.2) return '#24513A';
  if (intensity <= 0.4) return '#287A4B';
  if (intensity <= 0.6) return '#20A45A';
  if (intensity <= 0.8) return '#25D366';
  return '#8BFFC0';
}

function ActivityHeatmap({ data = [] }) {
  const [tooltip, setTooltip] = useState(null);

  const days = [
    'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const maxCount = Math.max(
    1,
    ...data.map((item) => item.message_count)
  );

  if (!data.length) {
    return <p>No activity data available.</p>;
  }

  function showTooltip(event, day, hour, count) {
    const rect = event.currentTarget.getBoundingClientRect();

    setTooltip({
      day,
      hour,
      count,
      x: Math.min(
        Math.max(rect.left + rect.width / 2, 90),
        window.innerWidth - 90
      ),
      y: Math.max(rect.top - 8, 80),
    });
  }

  return (
    <section
      className="heatmap-card"
      onMouseLeave={() => setTooltip(null)}
    >
      <h2>Activity Heatmap</h2>
      <p className="heatmap-subtitle">
        Discover when your chats are most active.
      </p>

      <div className="heatmap-scroll">
        <div className="heatmap">
          <div className="heatmap-corner" />

          {Array.from({ length: 24 }, (_, hour) => (
            <div className="heatmap-hour" key={hour}>
              {hour % 3 === 0
                ? `${String(hour).padStart(2, '0')}:00`
                : ''}
            </div>
          ))}

          {days.map((day) => (
            <div className="heatmap-row" key={day}>
              <span className="heatmap-day">{day.slice(0, 3)}</span>

              {Array.from({ length: 24 }, (_, hour) => {
                const item = data.find(
                  (entry) => entry.day === day && entry.hour === hour
                );

                const count = item?.message_count ?? 0;
                const intensity = count / maxCount;

                return (
                  <div
                    key={hour}
                    className="heatmap-cell"
                    style={{
                      backgroundColor: getHeatmapColor(intensity, count),
                    }}
                    onMouseEnter={(event) =>
                      showTooltip(event, day, hour, count)
                    }
                    onMouseMove={(event) =>
                      showTooltip(event, day, hour, count)
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="heatmap-legend">
        <span className="legend-title">Activity level</span>

        <div className="legend-scale">
          {[
            { color: '#182820', label: '0' },
            { color: '#24513A', label: 'Low' },
            { color: '#287A4B', label: 'Moderate' },
            { color: '#20A45A', label: 'High' },
            { color: '#25D366', label: 'Very high' },
            { color: '#8BFFC0', label: 'Peak' },
          ].map((item) => (
            <div className="legend-item" key={item.label}>
              <span
                className="legend-swatch"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {tooltip && (
        <div
          className="heatmap-floating-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <strong>{tooltip.day}</strong>
          <br />
          {String(tooltip.hour).padStart(2, '0')}:00
          <br />
          <strong>{tooltip.count.toLocaleString()} messages</strong>
        </div>
      )}
    </section>
  );
}

export default ActivityHeatmap;
