import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Pin, HelpCircle } from "lucide-react";

export type LocationSource = "exif" | "device_gps" | "manual_pin" | "none" | null;

const META: Record<Exclude<LocationSource, null>, {
  label: string;
  className: string;
  Icon: typeof MapPin;
  title: string;
}> = {
  exif: {
    label: "GPS verified",
    className: "bg-[#e7f1ea] text-[#1A3622] border-[#1A3622]/30",
    Icon: MapPin,
    title: "Coordinates read from the photo's own EXIF metadata.",
  },
  device_gps: {
    label: "Device location",
    className: "bg-[#fbedd0] text-[#7a4f0a] border-[#E5A93C]",
    Icon: Navigation,
    title: "Coordinates captured from the browser's geolocation at upload time.",
  },
  manual_pin: {
    label: "Manual pin",
    className: "bg-[#fbedd0] text-[#7a4f0a] border-[#E5A93C]",
    Icon: Pin,
    title: "Coordinates set by dropping a pin on the map.",
  },
  none: {
    label: "Unverified location",
    className: "bg-slate-100 text-slate-600 border-slate-300",
    Icon: HelpCircle,
    title: "No location was recorded with this upload.",
  },
};

interface Props {
  source: LocationSource;
  size?: "sm" | "md";
}

export function LocationSourceBadge({ source, size = "sm" }: Props) {
  const key = (source ?? "none") as Exclude<LocationSource, null>;
  const meta = META[key];
  const Icon = meta.Icon;
  return (
    <Badge
      variant="outline"
      title={meta.title}
      className={`${meta.className} inline-flex items-center gap-1 font-medium ${size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs"}`}
    >
      <Icon className="h-3 w-3" />
      {meta.label}
    </Badge>
  );
}
