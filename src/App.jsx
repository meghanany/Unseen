import { useState } from 'react'
import Landing from './components/Landing'
import Upload from './components/Upload'
import Analyzing from './components/Analyzing'
import Results from './components/Results'
import Wardrobe from './components/Wardrobe'
import { detectRegion } from './data/products'

export default function App() {
  const [screen, setScreen] = useState('landing')
  const [region, setRegion] = useState(detectRegion)
  const [imageData, setImageData] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [analysis, setAnalysis] = useState(null)

  const goTo = (s) => setScreen(s)

  const handleUpload = (data, preview) => {
    setImageData(data)
    setImagePreview(preview)
    setScreen('analyzing')
  }

  const handleAnalysis = (result) => {
    setAnalysis(result)
    setScreen('results')
  }

  const reset = () => {
    setScreen('landing')
    setImageData(null)
    setImagePreview(null)
    setAnalysis(null)
  }

  return (
    <div className="app">
      {screen === 'landing' && (
        <Landing onStart={() => goTo('upload')} region={region} setRegion={setRegion} />
      )}
      {screen === 'upload' && (
        <Upload onUpload={handleUpload} onBack={() => goTo('landing')} />
      )}
      {screen === 'analyzing' && (
        <Analyzing imageData={imageData} imagePreview={imagePreview} onDone={handleAnalysis} onError={() => goTo('upload')} />
      )}
      {screen === 'results' && (
        <Results analysis={analysis} imagePreview={imagePreview} region={region} setRegion={setRegion} onReset={reset} onWardrobe={() => goTo('wardrobe')} />
      )}
      {screen === 'wardrobe' && (
        <Wardrobe onBack={() => goTo('results')} onReset={reset} region={region} />
      )}
    </div>
  )
}
