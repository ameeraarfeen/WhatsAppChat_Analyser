
import { useState } from 'react'
import '../App.css'
import whatsappLogo from '../assets/whatsapp.svg'

function UploadPage() {
  const [fileName, setFileName] = useState('No file chosen')
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)


function handleFileChange(event) {
  const file = event.target.files[0]

  if (!file) {
    setFileName('No file chosen')
    setSelectedFile(null)
    setError('')
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
  setError('')
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
  onClick={() => alert('Next, we will connect Flask!')}
>
  Analyze Chat
</button>
)}

{error && <p className="error-message">{error}</p>}

        </div>

        <p className="privacy-note">
          We are not saving your chats. Your data is safe.
        </p>
      </section>
    </main>
  )
}

export default UploadPage
