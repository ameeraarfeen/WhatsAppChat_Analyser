
function WordCloud({ data = [] }) {
  const words = data
    .filter((item) => item.word && item.count > 0)
    .slice(0, 20);

  if (!words.length) {
    return <p>No word data available.</p>;
  }

  const maxCount = Math.max(...words.map((word) => word.count));

  return (
    <div className="word-cloud-container">
      {words.map((word, index) => {
        const size = 14 + (word.count / maxCount) * 20;

        return (
          <span
            key={`${word.word}-${index}`}
            className="cloud-word"
            style={{
              fontSize: `${size}px`,
              opacity: 0.65 + (word.count / maxCount) * 0.35,
            }}
            title={`${word.count.toLocaleString()} uses`}
          >
            {word.word}
          </span>
        );
      })}
    </div>
  );
}

export default WordCloud;
