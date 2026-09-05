import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (lat: number, lng: number) => void;
  initialCenter?: [number, number];
}

// Freetown default
const DEFAULT_CENTER: [number, number] = [8.4844, -13.2344];

export function LocationPicker({ open, onOpenChange, onPick, initialCenter = DEFAULT_CENTER }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    // Initialise once the dialog content is mounted
    const timer = setTimeout(() => {
      if (!ref.current || mapRef.current) return;
      const map = L.map(ref.current, { scrollWheelZoom: true }).setView(initialCenter, 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setPicked({ lat, lng });
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }
      });
      mapRef.current = map;
    }, 50);
    return () => clearTimeout(timer);
  }, [open, initialCenter]);

  useEffect(() => {
    if (!open) {
      // Reset on close
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
      setPicked(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Drop a pin on the plot</DialogTitle>
          <DialogDescription>
            Click anywhere on the map to mark where this photo was captured.
          </DialogDescription>
        </DialogHeader>
        <div ref={ref} style={{ height: 380, width: "100%", borderRadius: 12, overflow: "hidden" }} />
        {picked && (
          <p className="text-xs text-muted-foreground tabular-nums">
            Selected: {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)}
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!picked}
            onClick={() => {
              if (picked) {
                onPick(picked.lat, picked.lng);
                onOpenChange(false);
              }
            }}
            className="bg-[#1A3622] hover:bg-[#1A3622]/90"
          >
            Use this location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
