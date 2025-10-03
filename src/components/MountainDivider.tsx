export function MountainDivider() {
  return (
    <div className="w-full h-16 flex items-center justify-center">
      <svg 
        width="120" 
        height="40" 
        viewBox="0 0 120 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-gray-200"
      >
        <path 
          d="M0 30 L20 20 L40 25 L60 15 L80 20 L100 10 L120 15 L120 40 L0 40 Z" 
          fill="currentColor"
          opacity="0.3"
        />
        <path 
          d="M0 35 L15 28 L30 32 L45 25 L60 30 L75 22 L90 28 L105 20 L120 25 L120 40 L0 40 Z" 
          fill="currentColor"
          opacity="0.2"
        />
      </svg>
    </div>
  )
}
