import React,{ useState } from 'react'

import './App.css'
import Location from './Location'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="text-red-600">
    <Location/>
    </div>
  )
}

export default App
