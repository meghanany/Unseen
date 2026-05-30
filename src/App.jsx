import { useState } from 'react'
import Splash from './components/Splash'
import Chat from './components/Chat'

export default function App() {
  const [screen, setScreen] = useState('splash')

  return (
    <div className="app">
      {screen === 'splash' && (
        <Splash onDone={() => setScreen('chat')} />
      )}
      {screen === 'chat' && (
        <Chat onBack={() => setScreen('splash')} />
      )}
    </div>
  )
}
