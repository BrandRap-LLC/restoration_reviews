"use client";

import { useState, useMemo } from "react";
import { MapPin, Search } from "lucide-react";
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
  google_review_url: string;
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
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {selectedLocation ? (
              <>
                <p className="text-sm text-emerald-800 font-medium mb-1">
                  {isAutoDetected
                    ? "We've selected the Well Greens location closest to you:"
                    : "Selected location:"}
                </p>
                <p className="font-semibold text-gray-900">
                  {selectedLocation.name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedLocation.address}, {selectedLocation.city},{" "}
                  {selectedLocation.state} {selectedLocation.zip}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                Please select your Well Greens location
              </p>
            )}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="w-full"
        >
          {selectedLocation ? "Change location" : "Select location"}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select Your Well Greens Location</DialogTitle>
            <DialogDescription>
              Choose the store location where you'd like to leave a review
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, city, or ZIP code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleSelectLocation(location)}
                  className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                >
                  <p className="font-semibold text-gray-900">
                    {location.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {location.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    {location.city}, {location.state} {location.zip}
                  </p>
                </button>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                No locations found matching "{searchQuery}"
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
