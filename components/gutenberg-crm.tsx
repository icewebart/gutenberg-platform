import { TabInterface } from "./tab-interface"
import { StoreInterface } from "./store/store-interface"

const GutenbergCRM = () => {
  const renderContent = (tab: string) => {
    switch (tab) {
      case "home":
        return <div>Home Tab Content</div>
      case "store":
        return <StoreInterface />
      default:
        return <div>Default Tab Content</div>
    }
  }

  return (
    <div>
      <TabInterface />
      {renderContent("store")}
    </div>
  )
}

export default GutenbergCRM
