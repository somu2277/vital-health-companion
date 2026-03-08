import { useState } from "react";
import { MapPin, Building2, Stethoscope, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NearbyCare() {
  const [location, setLocation] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nearby Healthcare</h1>
        <p className="text-muted-foreground">Find hospitals, clinics, and pharmacies near you</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select defaultValue="all">
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
        <input
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Enter city, pincode or address"
          className="flex-1 min-w-[200px] h-10 px-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button>Update Location</Button>
        <Button variant="outline" className="gap-2">
          <MapPin className="h-4 w-4" /> Auto Detect
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 text-primary" />
        <span>Your Location: Enable location services to find nearby facilities</span>
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Map placeholder */}
        <div className="border border-border rounded-xl overflow-hidden bg-card min-h-[400px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Map Integration</p>
            <p className="text-sm mt-1">Requires Leaflet/OpenStreetMap setup</p>
          </div>
        </div>

        {/* Results */}
        <div>
          <Tabs defaultValue="hospitals">
            <TabsList>
              <TabsTrigger value="hospitals" className="gap-2"><Building2 className="h-4 w-4" /> Hospitals</TabsTrigger>
              <TabsTrigger value="clinics" className="gap-2"><Stethoscope className="h-4 w-4" /> Clinics</TabsTrigger>
              <TabsTrigger value="pharmacies" className="gap-2"><Pill className="h-4 w-4" /> Pharmacies</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="mt-6 text-center text-muted-foreground py-12">
            <p>No results found</p>
            <p className="text-sm mt-1">Try updating your location or adjusting filters</p>
          </div>
        </div>
      </div>
    </div>
  );
}
