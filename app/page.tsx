"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2, CheckCircle2, ExternalLink, Leaf, Sparkles, Heart, Star } from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { LocationSelector, type Location } from "@/components/LocationSelector";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { findNearestLocation } from "@/lib/haversine";
import { STORES } from "@/lib/stores";

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
  const [feedback, setFeedback] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFiveStar, setIsFiveStar] = useState(false);

  useEffect(() => {
    loadLocationsAndDetect();
  }, []);

  const loadLocationsAndDetect = async () => {
    try {
      // Load stores from TypeScript constants
      const locationsList: Location[] = STORES.map(store => ({
        id: store.id,
        name: store.name,
        address: store.address,
        city: store.city,
        state: store.state,
        zip: store.zip,
        lat: store.lat,
        lng: store.lng,
        googleReviewUrl: store.googleReviewUrl,
        googleReviewQrCode: store.googleReviewQrCode,
        yelpAccount: store.yelpAccount,
        yelpReviewUrl: store.yelpReviewUrl,
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

  // Auto-show success screen for 5-star reviews
  useEffect(() => {
    if (rating === 5 && selectedLocation) {
      setIsFiveStar(true);
      setIsSuccess(true);
    } else if (rating > 0 && rating < 5) {
      setIsFiveStar(false);
      setIsSuccess(false);
    }
  }, [rating, selectedLocation]);

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

    // 5-star reviews don't need form submission
    if (rating === 5) {
      return;
    }

    // Validate required fields for 1-4 star reviews
    if (!feedback.trim()) {
      setSubmitError("Please provide your feedback");
      return;
    }

    if (!name.trim()) {
      setSubmitError("Please provide your name");
      return;
    }

    if (!phone.trim()) {
      setSubmitError("Please provide your phone number");
      return;
    }

    if (!email.trim()) {
      setSubmitError("Please provide your email");
      return;
    }

    setIsSubmitting(true);

    try {
      // If 1-4 stars, send to webhook
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: selectedLocation.id,
          rating,
          feedback: feedback.trim(),
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          source: locationSource,
          submittedAt: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setIsFiveStar(false);
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

  if (isSuccess && isFiveStar && selectedLocation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/50 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 text-center border-2 border-green-200 relative z-10 transform transition-all duration-500 hover:scale-[1.02]">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.webp"
                alt="Restoration Reviews Logo"
                className="h-16 w-auto"
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Thank You
            </h1>
            <p className="text-slate-600 text-lg">
              We appreciate your 5-star review. It helps us grow and serve our community better.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="text-center mb-4">
              <p className="text-sm text-slate-600 font-medium">
                Please consider leaving us a review on Google or Yelp.
              </p>
            </div>
            <QRCodeDisplay location={selectedLocation} />
            <div className="space-y-3 mt-4">
              <Button
                asChild
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all font-medium text-base h-11"
              >
                <a
                  href={selectedLocation.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
                  Leave a Google Review
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              {selectedLocation.yelpReviewUrl && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 h-11"
                >
                  <a
                    href={selectedLocation.yelpReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Leave a Yelp Review
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              setIsSuccess(false);
              setIsFiveStar(false);
              setRating(0);
              setFeedback("");
              setName("");
              setPhone("");
              setEmail("");
            }}
            className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          >
            Submit Another Review
          </Button>
        </div>
      </div>
    );
  }

  if (isSuccess && !isFiveStar) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/50 via-transparent to-transparent"></div>
        </div>

        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 text-center border-2 border-green-200 relative z-10 transform transition-all duration-500 hover:scale-[1.02]">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.webp"
                alt="Restoration Reviews Logo"
                className="h-16 w-auto"
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Feedback Received
            </h1>
            <p className="text-slate-600 text-lg">
              Thank you for your feedback. We are constantly working to improve our service.
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              setIsSuccess(false);
              setIsFiveStar(false);
              setRating(0);
              setFeedback("");
              setName("");
              setPhone("");
              setEmail("");
            }}
            className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          >
            Submit Another Review
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/40 via-transparent to-transparent"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-emerald-900 px-8 py-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

            <div className="relative text-center">
              <div className="flex items-center justify-center mb-6">
                <img
                  src="/images/logo.webp"
                  alt="Restoration Reviews Logo"
                  className="h-16 w-auto brightness-0 invert opacity-90"
                />
              </div>

              <h1 className="text-3xl font-bold mb-3 tracking-tight">
                Share Your Experience
              </h1>
              <p className="text-emerald-100/80 text-lg max-w-lg mx-auto">
                Your feedback helps us provide the best service to our community.
              </p>
            </div>
          </div>

          <div className="p-8">
            {isLoadingLocation ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-3 text-gray-700 font-medium">
                  Finding your nearest Restoration Reviews location...
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
                    className="w-full mt-3 border-slate-200 text-slate-700 hover:bg-slate-50 h-10"
                  >
                    {isLoadingGPS ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Locating...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 mr-2" />
                        Use my current location
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-semibold mb-3 block text-slate-700">
                      How would you rate your experience? <span className="text-red-500">*</span>
                    </Label>
                    <StarRating
                      rating={rating}
                      onRatingChange={setRating}
                      size="lg"
                    />
                  </div>

                  {rating > 0 && rating < 5 && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="feedback" className="text-sm font-semibold text-slate-700 mb-1.5 block">
                          Your Feedback <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="feedback"
                          placeholder="Please share your experience..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={4}
                          className="mt-1 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-md"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="name" className="text-sm font-semibold text-slate-700 mb-1.5 block">
                          Your Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-md"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 mb-1.5 block">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="mt-1 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-md"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-sm font-semibold text-slate-700 mb-1.5 block">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-md"
                          required
                        />
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
                        className="w-full h-12 text-base bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all font-medium"
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
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 font-medium">
            © {new Date().getFullYear()} Restoration Reviews. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
