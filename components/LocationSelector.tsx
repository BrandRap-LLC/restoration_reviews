"use client";

import { useState, useMemo } from "react";
import { MapPin, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  googleReviewUrl: string;
  googleReviewQrCode: string;
  yelpAccount: string;
  yelpReviewUrl: string;
}

interface LocationSelectorProps {
  locations: Location[];
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
  isAutoDetected?: boolean;
}

export function LocationSelector({
  locations,
  selectedLocation,
  onLocationSelect,
  isAutoDetected = false,
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations;

    const query = searchQuery.toLowerCase();
    return locations.filter(
      (location) =>
        location.name.toLowerCase().includes(query) ||
        location.city.toLowerCase().includes(query) ||
        location.address.toLowerCase().includes(query) ||
        location.zip.includes(query)
    );
  }, [locations, searchQuery]);

  const handleSelectLocation = (location: Location) => {
    onLocationSelect(location);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            {selectedLocation ? (
              <>
                <p className="text-sm text-primary font-semibold mb-1 flex items-center gap-1">
                  {isAutoDetected ? (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Nearest location found
                    </>
                  ) : (
                    "Selected location:"
                  )}
                </p>
                <p className="font-bold text-foreground text-base mb-1">
                  {selectedLocation.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedLocation.address}, {selectedLocation.city},{" "}
                  {selectedLocation.state} {selectedLocation.zip}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground font-medium">
                Please select your Restoration Logistics location
              </p>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="w-full border-slate-200 text-foreground hover:bg-[#274d27]/10 hover:text-foreground font-medium h-10"
        >
          {selectedLocation ? "Change location" : "Select location"}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Select Location
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose the store location where you'd like to leave a review
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, city, or ZIP code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-200 focus:border-[#274d27] focus:ring-[#274d27] rounded-md h-11"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleSelectLocation(location)}
                  className="w-full text-left p-4 rounded-lg border border-slate-200 hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-base mb-0.5">
                        {location.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {location.address}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {location.city}, {location.state} {location.zip}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-base font-medium">
                  No locations found matching "{searchQuery}"
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
