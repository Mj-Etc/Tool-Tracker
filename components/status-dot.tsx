type StatusDotProps = {
  outOfStock: number;
  lowStock: number;
};

export function StatusDot({ outOfStock, lowStock }: StatusDotProps) {
  const isCritical = outOfStock > 0 && lowStock > 0;
  
  let pingClass = "animate-ping bg-green-400";
  let pulseClass = "animate-pulse bg-green-400";

  if (isCritical) {
    pingClass = "animate-ping bg-orange-400";
    pulseClass = "animate-pulse bg-orange-400";
  } else if (outOfStock > 0) {
    pingClass = "animate-ping bg-red-400";
    pulseClass = "animate-pulse bg-red-400";
  } else if (lowStock > 0) {
    pingClass = "animate-ping bg-yellow-400";
    pulseClass = "animate-pulse bg-yellow-400";
  }

  return (
    <span className="relative flex size-4">
      <span className={`absolute inline-flex h-full w-full rounded-full ${pingClass}`}></span>
      <span className={`relative inline-flex size-4 rounded-full ${pulseClass}`}></span>
    </span>
  );
}