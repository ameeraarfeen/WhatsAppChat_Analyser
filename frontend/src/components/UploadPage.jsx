
import { useState } from 'react'
import '../App.css'
import whatsappLogo from '../assets/whatsapp.svg'
import MonthlyActivityChart from './MonthlyActivityChart'
import WordCloud from './WordCloud'
import WeekdayActivityChart from './WeekdayActivityChart'
import DailyActivityChart from './DailyActivityChart'
import HourlyActivityChart from './HourlyActivityChart'
import ActivityHeatmap from './ActivityHeatmap';

function UploadPage() {
  const [fileName, setFileName] = useState('No file chosen')
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [selectedUser, setSelectedUser] = useState('Overall')
  const [isLoading, setIsLoading] = useState(false)


  


function handleFileChange(event) {
  const file = event.target.files[0]

  if (!file) {
    setFileName('No file chosen')
    setSelectedFile(null)
    setError('')
    setIsLoading(false)
    return
  }

  if (!file.name.toLowerCase().endsWith('.txt')) {
    setFileName('No file chosen')
    setSelectedFile(null)
    setError('Please select a WhatsApp chat export (.txt file).')
    event.target.value = ''
    return
  }

setSelectedFile(file)
setFileName(file.name)
setSelectedUser('Overall')
setAnalysis(null)
setError('')
}



function handleDrop(event) {
  event.preventDefault()
  setIsDragging(false)

  const file = event.dataTransfer.files[0]

  if (!file) return

  if (!file.name.toLowerCase().endsWith('.txt')) {
    setFileName('No file chosen')
    setSelectedFile(null)
    setError('Please select a WhatsApp chat export (.txt file).')
    return
  }

  setSelectedFile(file)
setFileName(file.name)
setSelectedUser('Overall')
setAnalysis(null)
setError('')
}


async function handleAnalyze(user = "Overall") { 
  if (!selectedFile) {
    setError('Please upload a chat file first.')
    return
  }


  setError('')
  setIsLoading(true)

  const formData = new FormData()

  formData.append('file', selectedFile)
  formData.append('selected_user', user)

  try {
    const response = await fetch('http://127.0.0.1:5000/analyze', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
  console.log('Backend error:', data)
  throw new Error(data.error || 'Upload failed.')
}

setAnalysis(data)

  } catch (err) {
    setError(err.message || 'Could not connect to Flask.')
  }

  finally {
  setIsLoading(false)
}
  console.log("Analyze button clicked!")
}



function handleDragOver(event) {
  event.preventDefault()
  setIsDragging(true)
}

function handleDragLeave() {
  setIsDragging(false)
}

  return (
    <main className="upload-page">
      <header className="topbar">
        <h2>
          <span className="brand-dot">☾</span> WhatsApp Chat Analyzer
        </h2>
        <span className="topbar-note">
          Better Chats. Deeper Insights.
        </span>
      </header>

      <section className="upload-content">
        <h1>
          WhatsApp <span>Chat Analyzer</span>
        </h1>

        <h3 className="subtitle">
          Turn your chats into insights.
        </h3>

        <p className="description">
          Upload your WhatsApp chat export and explore message
          activity, participant statistics, and more. Keep your chats in 24 hour format.
        </p>

        <div
          className={`upload-box ${isDragging ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
>
                    <img
            src={whatsappLogo}
            alt="WhatsApp logo"
            className="upload-icon"
          />

          <strong>Choose your chat file</strong>

          <span className="upload-hint">
            Select or drop a WhatsApp .txt export
          </span>

          <input
            type="file"
            id="chat-file"
            accept=".txt,text/plain"
            hidden
            onChange={handleFileChange}
          />

          <label htmlFor="chat-file" className="file-button">
            Choose File
          </label>

          
<span className="file-name">
  {fileName}
</span>


{selectedFile && (
  <button
    className="analyze-button"
    onClick={() => handleAnalyze()}
    disabled={isLoading}
  >
    {isLoading && (
      <span className="loading-spinner" aria-hidden="true" />
    )}
    {isLoading ? 'Analyzing...' : 'Analyze Chat'}
  </button>
)}


{error && <p className="error-message">{error}</p>}

        </div>

        <p className="privacy-note">
          We are not saving your chats. Your data is safe.
        </p>

        {analysis && (
          <div className="analysis-results">
            <h2>Chat Analysis Results</h2>

            
<div className="participant-filter">
  <label htmlFor="participant-select"></label>

  <select
    id="participant-select"
    value={selectedUser}
    onChange={(event) => {
  const user = event.target.value
  setSelectedUser(user)
  handleAnalyze(user)
}}
  >
    <option value="Overall">Everyone</option>
    {analysis.user_message_percentages?.map((person) => (
      <option key={person.user} value={person.user}>
        {person.user}
      </option>
    ))}
  </select>
</div>


            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Messages</h3>
                <p>{analysis.stats.total_messages.toLocaleString()}</p>
              </div>

              <div className="stat-card">
                <h3>Total Words</h3>
                <p>{analysis.stats.total_words.toLocaleString()}</p>
              </div>

              <div className="stat-card">
                <h3>Media Messages</h3>
                <p>{analysis.stats.media_messages.toLocaleString()}</p>
              </div>

              <div className="stat-card">
                <h3>Total Links</h3>
                <p>{analysis.stats.total_links.toLocaleString()}</p>
              </div>
            </div>
            <MonthlyActivityChart data={analysis.monthly_timeline} />
            <WeekdayActivityChart data={analysis.weekday_activity ?? []} />
            <DailyActivityChart data={analysis.daily_timeline ?? []} />
            <HourlyActivityChart data={analysis.hourly_activity ?? []} />
            <ActivityHeatmap data={analysis.activity_heatmap ?? []} />
<section className="insight-card participant-card">
  <h2>Participant Leaderboard</h2>
  <p>See who contributed most to the conversation</p>

  <div className="participant-list">
    {analysis.user_message_percentages
      ?.slice()
      .sort((a, b) => b.messages - a.messages)
      .map((person, index) => (
        <div className="participant-item" key={person.user}>
          <div className="participant-info">
            <span className="participant-rank">
              {index + 1}
            </span>

            <span className="participant-name">
              {person.user}
            </span>

            <span className="participant-count">
              {person.messages.toLocaleString()} messages
            </span>
          </div>

          <div className="participant-progress">
            <div
              className="participant-progress-fill"
              style={{ width: `${person.percentage}%` }}
            />
          </div>

          <span className="participant-percentage">
            {person.percentage}%
          </span>
        </div>
      ))}
  </div>
</section>


            <div className="insights-grid">
  <section className="insight-card">
    <h2>Most Used Emojis</h2>
    <div className="emoji-list">
      {analysis.top_emojis?.map((item, index) => (
        <div className="emoji-item" key={`${item.emoji}-${index}`}>
          <span className="emoji-symbol">{item.emoji}</span>
          <span className="emoji-count">
            {item.count.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  </section>

  
<section className="insight-card">
  <h2>Most Common Words</h2>
  <p>Words used most frequently in this chat</p>

  <div className="words-list">
    {analysis.common_words?.slice(0, 20).map((item, index) => (
      <div className="word-item" key={`${item.word}-${index}`}>
        {/* <span className="word-rank">{index + 1}</span> */}
        <span className="word-name">{item.word}</span>
        <span className="word-count">
          {item.count.toLocaleString()}
        </span>
      </div>
    ))}
  </div>
</section>


<section className="insight-card word-cloud-card">
  <h2>Word Cloud</h2>
  <p>Words that appear most frequently in your chat</p>
  <WordCloud data={analysis.common_words ?? []} />
</section>


</div>
          </div>
        )}
      </section>

    </main>
  )
}

export default UploadPage
