function SplashScreen({ fadingOut }) {
  return (
    <div className={`fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center ${fadingOut ? "animate-splash-fade-out" : ""}`}>
      <div className="relative flex items-center justify-center">
        <div className="absolute h-32 w-32 rounded-full bg-primary-light animate-pulse-ring" />
        <img
          src="./logo.png"
          alt="Blueswitch logo"
          className="relative h-24 w-24 object-contain animate-splash-logo"
        />
      </div>

      <div className="text-center mt-6 animate-splash-text">
        <h1 className="text-xl font-semibold text-primary">Welcome to</h1>
        <p className="text-2xl font-bold text-ink mt-1">Blueswitch Dynamic Limited</p>
        <p className="text-sm text-muted mt-3">Point of Sale</p>
      </div>

      <div className="relative h-10 w-10 mt-8">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <span
            key={deg}
            className="absolute h-1.5 w-1.5 rounded-full bg-primary animate-dot-chase"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${deg}deg) translate(16px) translate(-50%, -50%)`,
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default SplashScreen
