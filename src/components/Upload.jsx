import { useState, useRef } from 'react'

export default function Upload({ onUpload, onBack }) {
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const cameraRef = useRef(null)

  const processFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WEBP, or screenshot)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large. Please use an image under 10MB.')
      return
    }
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target.result
      const base64 = dataUrl.split(',')[1]
      const mediaType = file.type || 'image/jpeg'
      setPreview(dataUrl)
      setTimeout(() => onUpload({ base64, mediaType }, dataUrl), 600)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    processFile(e.dataTransfer.files[0])
  }

  const handleChange = (e) => processFile(e.target.files[0])

  return (
    <div style={styles.container}>
      {/* Nav */}
      <div style={styles.nav}>
        <button style={styles.back} onClick={onBack}>← Back</button>
        <span style={styles.logo}>UNSEEN</span>
        <span style={{ width: 60 }} />
      </div>

      <div style={styles.content}>
        <div style={styles.titleGroup}>
          <p style={styles.eyebrow}>Step 1 of 1</p>
          <h2 style={styles.title}>Upload your outfit</h2>
          <p style={styles.subtitle}>Screenshot, flat lay, or hanger shot — any works.</p>
        </div>

        {/* Drop zone */}
        <div
          style={{
            ...styles.dropzone,
            ...(dragging ? styles.dropzoneDrag : {}),
            ...(preview ? styles.dropzonePreview : {}),
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !preview && inputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Outfit preview" style={styles.previewImg} />
          ) : (
            <div style={styles.dropContent}>
              <div style={styles.uploadIcon}>↑</div>
              <p style={styles.dropTitle}>Drop your outfit here</p>
              <p style={styles.dropSub}>or tap to browse photos</p>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleChange}
        />

        {error && <p style={styles.error}>{error}</p>}

        {/* Tips */}
        <div style={styles.tips}>
          <p style={styles.tipsTitle}>What works great</p>
          <div style={styles.tipsList}>
            {[
              ['📱', 'Screenshot from Myntra, ASOS, or any shopping app'],
              ['👗', 'Flat lay on your bed or a flat surface'],
              ['🪝', 'Outfit on a hanger'],
              ['🔒', 'No need to wear it — privacy protected'],
            ].map(([icon, text]) => (
              <div key={text} style={styles.tip}>
                <span style={styles.tipIcon}>{icon}</span>
                <span style={styles.tipText}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {!preview && (
          <div style={styles.btnRow}>
            <button style={styles.browseBtn} onClick={() => inputRef.current?.click()}>
              📁 GALLERY
            </button>
            <button style={styles.cameraBtn} onClick={() => cameraRef.current?.click()}>
              📷 TAKE PHOTO
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
  },
  back: { fontSize: '13px', color: 'var(--text-3)', width: 60 },
  logo: {
    fontFamily: 'var(--font-serif)',
    fontSize: '20px',
    fontWeight: '600',
    letterSpacing: '6px',
    color: 'var(--text)',
  },
  content: {
    flex: 1,
    padding: '28px 24px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  titleGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  eyebrow: {
    fontSize: '10px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    fontWeight: '600',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '32px',
    fontWeight: '300',
    color: 'var(--text)',
    textTransform: 'uppercase',
    letterSpacing: '-0.5px',
  },
  subtitle: { fontSize: '13px', color: 'var(--text-3)' },
  dropzone: {
    border: '1.5px dashed var(--border-light)',
    borderRadius: 'var(--radius)',
    minHeight: '220px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    background: 'var(--surface)',
    transition: 'border-color var(--transition), background var(--transition)',
    overflow: 'hidden',
  },
  dropzoneDrag: {
    borderColor: 'var(--accent)',
    background: 'var(--accent-dim)',
  },
  dropzonePreview: {
    border: '1.5px solid var(--accent)',
    cursor: 'default',
    minHeight: '280px',
  },
  dropContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '32px',
  },
  uploadIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'var(--accent-dim)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    color: 'var(--accent)',
  },
  dropTitle: { fontSize: '15px', color: 'var(--text)', fontWeight: '500' },
  dropSub: { fontSize: '13px', color: 'var(--text-3)' },
  previewImg: { width: '100%', height: '100%', objectFit: 'contain', maxHeight: '400px' },
  error: {
    fontSize: '13px',
    color: 'var(--red)',
    background: 'rgba(192,57,43,0.06)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid rgba(192,57,43,0.15)',
  },
  tips: {
    background: 'var(--surface)',
    borderRadius: 'var(--radius)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    border: '1px solid var(--border)',
  },
  tipsTitle: {
    fontSize: '10px',
    color: 'var(--text-3)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  tipsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  tip: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  tipIcon: { fontSize: '15px', flexShrink: 0, marginTop: '1px' },
  tipText: { fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.5' },
  btnRow: {
    display: 'flex',
    gap: '10px',
  },
  browseBtn: {
    flex: 1,
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: '0',
    padding: '18px 12px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '2px',
    cursor: 'pointer',
  },
  cameraBtn: {
    flex: 1,
    background: 'var(--surface)',
    color: 'var(--text)',
    border: '1.5px solid var(--border-light)',
    borderRadius: '0',
    padding: '18px 12px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '2px',
    cursor: 'pointer',
  },
}
