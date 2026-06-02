import { useEffect, useState, useCallback } from 'react'
import { panelManager } from './core/PanelManager'
import { Button } from './components'
import './panels'

function App() {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    return panelManager.subscribe(() => forceUpdate((n) => n + 1))
  }, [])

  const panels = panelManager.getAllPanels()
  const visiblePanels = panelManager.getVisiblePanels()

  const handleToggle = useCallback((id: string) => {
    panelManager.toggle(id)
  }, [])

  return (
    <div className="app">
      <h1>Web Panel</h1>
      <div className="panel-toolbar">
        {panels.map((panel) => (
          <Button
            key={panel.id}
            variant={panelManager.isVisible(panel.id) ? 'primary' : 'secondary'}
            onClick={() => handleToggle(panel.id)}
          >
            {panel.id}
          </Button>
        ))}
      </div>
      <div className="panel-container">
        {visiblePanels.map((props) => {
          const config = panelManager.getPanelConfig(props.id)
          if (!config) return null
          const Component = config.component
          return <Component key={props.id} {...props} />
        })}
      </div>
    </div>
  )
}

export default App
