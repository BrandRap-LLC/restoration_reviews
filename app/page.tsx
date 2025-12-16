"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2, CheckCircle2, ExternalLink, Leaf } from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { LocationSelector, type Location } from "@/components/LocationSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { findNearestLocation } from "@/lib/haversine";

type LocationSource = "ip" | "gps" | "manual";

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [locationSource, setLocationSource] = useState<LocationSource>("ip");
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [googleReviewUrl, setGoogleReviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadLocationsAndDetect();
  }, []);

  const loadLocationsAndDetect = async () => {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name");

      if (error) throw error;

      const locationsList = data.map((loc) => ({
        id: loc.id,
        name: loc.name,
        address: loc.address,
        city: loc.city,
        state: loc.state,
        zip: loc.zip,
        lat: parseFloat(loc.lat),
        lng: parseFloat(loc.lng),
        google_review_url: loc.google_review_url,
      }));

      setLocations(locationsList);

      const response = await fetch("/api/geolocate");
      const geoData = await response.json();

      const nearest = findNearestLocation(
        { lat: geoData.lat, lng: geoData.lng },
        locationsList
      );

      if (nearest) {
        setSelectedLocation(nearest);
        setIsAutoDetected(true);
        setLocationSource("ip");
      } else {
        setSelectedLocation(locationsList[0] || null);
      }
    } catch (error) {
      console.error("Error loading locations:", error);
      setLocationError("Unable to detect your location. Please select manually.");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleUseCurrentLocation = () => {
    setIsLoadingGPS(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoadingGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        const nearest = findNearestLocation(userCoords, locations);

        if (nearest) {
          setSelectedLocation(nearest);
          setLocationSource("gps");
          setIsAutoDetected(true);
        }

        setIsLoadingGPS(false);
      },
      (error) => {
        console.error("GPS error:", error);
        setLocationError(
          "Unable to access your location. Please check your browser permissions or select manually."
        );
        setIsLoadingGPS(false);
      },
      {
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setLocationSource("manual");
    setIsAutoDetected(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedLocation) {
      setSubmitError("Please select a location");
      return;
    }

    if (rating === 0) {
      setSubmitError("Please select a star rating");
      return;
    }

    if (!review.trim()) {
      setSubmitError("Please write a review");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: selectedLocation.id,
          rating,
          title,
          review,
          name,
          email,
          source: locationSource,
          submittedAt: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setGoogleReviewUrl(selectedLocation.google_review_url);
      setIsSuccess(true);
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit review"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && googleReviewUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center border border-emerald-100">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-emerald-800">Well Greens</h2>
                <p className="text-xs text-emerald-600 tracking-wide">NATURAL WELLNESS</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thank You!
            </h1>
            <p className="text-gray-600 text-lg">
              Your feedback helps us serve you better and build a healthier community together.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
            <p className="text-sm text-emerald-800 mb-4 font-medium">
              Love your experience? Share it publicly on Google to help others discover the Well Greens difference.
            </p>
            <Button
              asChild
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Leave a Google Review
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setIsSuccess(false);
              setRating(0);
              setTitle("");
              setReview("");
              setName("");
              setEmail("");
              setGoogleReviewUrl(null);
            }}
            className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            Submit Another Review
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-emerald-100">
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 px-8 py-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Leaf className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Well Greens</h2>
                  <p className="text-emerald-100 text-sm tracking-wider">NATURAL WELLNESS</p>
                </div>
              </div>

              <h1 className="text-4xl font-bold mb-3 leading-tight">
                Share Your Experience
              </h1>
              <p className="text-emerald-50 text-lg leading-relaxed">
                Your feedback helps us continue providing quality natural wellness products and exceptional service to our community.
              </p>
            </div>
          </div>

          <div className="p-8">
            {isLoadingLocation ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <span className="ml-3 text-gray-600">
                  Finding your nearest Well Greens location...
                </span>
              </div>
            ) : (
              <>
                {locationError && (
                  <Alert className="mb-6 border-amber-200 bg-amber-50">
                    <AlertDescription className="text-amber-800">
                      {locationError}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mb-8">
                  <LocationSelector
                    locations={locations}
                    selectedLocation={selectedLocation}
                    onLocationSelect={handleLocationSelect}
                    isAutoDetected={isAutoDetected}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUseCurrentLocation}
                    disabled={isLoadingGPS}
                    className="w-full mt-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    {isLoadingGPS ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Getting your location...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 mr-2" />
                        Use my current location
                      </>
                    )}
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block text-gray-800">
                      How would you rate your experience? <span className="text-red-500">*</span>
                    </Label>
                    <StarRating
                      rating={rating}
                      onRatingChange={setRating}
                      size="lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="title" className="text-base font-semibold text-gray-800">
                      Review Title (Optional)
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="Sum up your experience"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="review" className="text-base font-semibold text-gray-800">
                      Your Review <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="review"
                      placeholder="Tell us about your experience at Well Greens..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      rows={5}
                      className="mt-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="name" className="text-base font-semibold text-gray-800">
                      Your Name (Optional)
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-base font-semibold text-gray-800">
                      Email (Optional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-2 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Your email is only used for verification and is never displayed publicly.
                    </p>
                  </div>

                  {submitError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">
                        {submitError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedLocation}
                    className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Well Greens. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
