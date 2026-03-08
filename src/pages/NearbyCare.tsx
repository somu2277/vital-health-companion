import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { MapPin, Building2, Stethoscope, Pill, Loader2, Navigation, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { MapPlace } from "@/components/maps/LeafletMap";

const LeafletMap = lazy(() => import("@/components/maps/LeafletMap"));

export default function NearbyCare() {
  const [position, setPosition] = useState<[number, number]>([28.6139, 77.2090]);
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [located, setLocated] = useState(false);

  const fetchNearby = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const radius = 5000;
      const query = `
        [out:json][timeout:15];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lon});
          node["amenity"="clinic"](around:${radius},${lat},${lon});
          node["amenity"="pharmacy"](around:${radius},${lat},${lon});
        );
        out body 50;
      `;
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      const data = await res.json();
      const mapped: MapPlace[] = (data.elements || []).map((el: any) => ({
        id: el.id,
        lat: el.lat,
        lon: el.lon,
        name: el.tags?.name || el.tags?.amenity || "Unknown",
        type: el.tags?.amenity === "hospital" ? "hospital" : el.tags?.amenity === "clinic" ? "clinic" : "pharmacy",
        tags: el.tags || {},
      }));
      setPlaces(mapped);
    } catch {
      toast.error("Failed to fetch nearby facilities");
    } finally {
      setLoading(false);
    }
  }, []);

  const autoDetect = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        setLocated(true);
        fetchNearby(coords[0], coords[1]);
      },
      () => {
        toast.error("Location access denied");
        setLoading(false);
      }
    );
  };

  useEffect(() => { autoDetect(); }, []);

  const filtered = filter === "all" ? places : places.filter(p => p.type === filter);
  const hospitals = places.filter(p => p.type === "hospital");
  const clinics = places.filter(p => p.type === "clinic");
  const pharmacies = places.filter(p => p.type === "pharmacy");

  const PlaceCard = ({ place }: { place: MapPlace }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background hover:bg-accent/30 transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
        place.type === "hospital" ? "bg-destructive/10 text-destructive" :
        place.type === "clinic" ? "bg-primary/10 text-primary" : "bg-primary/10 text-primary"
      }`}>
        {place.type === "hospital" ? <Building2 className="h-4 w-4" /> :
         place.type === "clinic" ? <Stethoscope className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{place.name}</p>
        <p className="text-xs text-muted-foreground capitalize">{place.type}</p>
        {place.tags?.phone && (
          <a href={`tel:${place.tags.phone}`} className="text-xs text-primary flex items-center gap-1 mt-1">
            <Phone className="h-3 w-3" /> {place.tags.phone}
          </a>
        )}
      </div>
      <a href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`} target="_blank" rel="noopener noreferrer"
        className="p-1.5 rounded hover:bg-accent transition-colors shrink-0">
        <Navigation className="h-3.5 w-3.5 text-muted-foreground" />
      </a>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nearby Healthcare</h1>
        <p className="text-muted-foreground">Find hospitals, clinics, and pharmacies near you</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Facilities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Facilities</SelectItem>
            <SelectItem value="hospital">Hospitals</SelectItem>
            <SelectItem value="clinic">Clinics</SelectItem>
            <SelectItem value="pharmacy">Pharmacies</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2" onClick={autoDetect} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          {located ? "Refresh Location" : "Auto Detect"}
        </Button>
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          {located ? `${position[0].toFixed(4)}, ${position[1].toFixed(4)}` : "Detecting location..."}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-border rounded-xl overflow-hidden bg-card min-h-[400px]">
          <Suspense fallback={<div className="h-[400px] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
            <LeafletMap position={position} places={filtered} />
          </Suspense>
        </div>

        <div>
          <Tabs defaultValue="hospitals">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="hospitals" className="gap-1.5 text-xs sm:text-sm">
                <Building2 className="h-3.5 w-3.5" /> Hospitals ({hospitals.length})
              </TabsTrigger>
              <TabsTrigger value="clinics" className="gap-1.5 text-xs sm:text-sm">
                <Stethoscope className="h-3.5 w-3.5" /> Clinics ({clinics.length})
              </TabsTrigger>
              <TabsTrigger value="pharmacies" className="gap-1.5 text-xs sm:text-sm">
                <Pill className="h-3.5 w-3.5" /> Pharmacies ({pharmacies.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="hospitals" className="mt-4 space-y-2 max-h-[340px] overflow-y-auto">
              {hospitals.length > 0 ? hospitals.map(p => <PlaceCard key={p.id} place={p} />) :
                <p className="text-center text-muted-foreground py-8">No hospitals found nearby</p>}
            </TabsContent>
            <TabsContent value="clinics" className="mt-4 space-y-2 max-h-[340px] overflow-y-auto">
              {clinics.length > 0 ? clinics.map(p => <PlaceCard key={p.id} place={p} />) :
                <p className="text-center text-muted-foreground py-8">No clinics found nearby</p>}
            </TabsContent>
            <TabsContent value="pharmacies" className="mt-4 space-y-2 max-h-[340px] overflow-y-auto">
              {pharmacies.length > 0 ? pharmacies.map(p => <PlaceCard key={p.id} place={p} />) :
                <p className="text-center text-muted-foreground py-8">No pharmacies found nearby</p>}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
