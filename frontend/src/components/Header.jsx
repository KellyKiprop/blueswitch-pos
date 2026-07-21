import { useState, useEffect } from "react"

function Header({ cashierName, onAdminClick, onOrdersClick, onEndShift }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="./logo.png" alt="Blueswitch logo" className="h-10 w-10 object-contain" />
        <div>
          <h1 className="text-lg font-semibold text-primary">Blueswitch POS</h1>
          <p className="text-xs text-muted">Blueswitch Dynamic Limited</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-ink">{cashierName || "Cashier"}</p>
          <p className="text-xs text-muted tabular-nums">
            {time.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <button
          onClick={onOrdersClick}
          className="text-xs text-muted hover:text-primary border border-gray-200 hover:border-primary rounded-lg px-3 py-1.5"
        >
          Orders
        </button>
        <button
          onClick={onAdminClick}
          className="text-xs text-muted hover:text-primary border border-gray-200 hover:border-primary rounded-lg px-3 py-1.5"
        >
          Admin
        </button>
        <button
          onClick={onEndShift}
          className="text-xs text-muted hover:text-red-500 border border-gray-200 hover:border-red-300 rounded-lg px-3 py-1.5"
        >
          End shift
        </button>
      </div>
    </header>
  )
}

export default Header
