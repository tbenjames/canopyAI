import logoAsset from "@/assets/canopystride-logo.png.asset.json";

interface AppLogoProps {
  variant?: "full" | "mark";
  className?: string;
}

// Full: wordmark on dark tile (the uploaded PNG is designed for dark backgrounds).
// Mark: just the "//" glyph on a small dark tile — used in the app header.
export function AppLogo({ variant = "full", className }: AppLogoProps) {
  if (variant === "mark") {
    return (
      <span
        className={`grid place-items-center rounded-md bg-black ${className ?? "h-8 w-8"}`}
        aria-hidden="true"
      >
        <img
          src="/favicon.png"
          alt=""
          className="h-5 w-5"
          width={20}
          height={20}
        />
      </span>
    );
  }
  return (
    <img
      src={logoAsset.url}
      alt="CanopyStride AI"
      className={className ?? "h-8 w-auto"}
      width={160}
      height={40}
    />
  );
}
