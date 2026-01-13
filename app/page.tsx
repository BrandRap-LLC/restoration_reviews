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
  const [hasRedirected, setHasRedirected] = useState(false);

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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

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
    setHasRedirected(false);
  };

  // Auto-redirect to Google review page for 5-star reviews
  useEffect(() => {
    if (rating === 5 && selectedLocation && !hasRedirected) {
      // Immediately redirect to Google review page
      window.open(selectedLocation.googleReviewUrl, '_blank', 'noopener,noreferrer');
      setHasRedirected(true);
      // Reset rating after a short delay to show the message
      setTimeout(() => {
        setRating(0);
      }, 500);
    } else if (rating > 0 && rating < 5) {
      setIsFiveStar(false);
      setIsSuccess(false);
      setHasRedirected(false);
    } else if (rating === 0 && hasRedirected) {
      // Keep hasRedirected true when rating is reset to show message
    }
  }, [rating, selectedLocation, hasRedirected]);

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

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          throw new Error(data.error || "Failed to submit review");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      const data = await response.json();

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 text-center border border-slate-200">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-white rounded-xl p-2 sm:p-3 shadow-sm border border-slate-100">
              <img
                src="/images/logo.webp"
                alt="Restoration Logistics Logo"
                className="h-12 sm:h-16 w-auto"
              />
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#274d27] mx-auto mb-3 sm:mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Thank You
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              We appreciate your 5-star review. It helps us grow and serve our community better.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground font-medium">
                Please consider leaving us a review on Google.
              </p>
            </div>
            <QRCodeDisplay location={selectedLocation} />
            <div className="mt-4">
              <Button
                asChild
                className="w-full bg-[#274d27] hover:bg-[#1e3d1e] text-white shadow-sm transition-all font-medium text-base h-11"
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
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsSuccess(false);
                setIsFiveStar(false);
                setHasRedirected(false);
                setRating(0);
                setFeedback("");
                setName("");
                setPhone("");
                setEmail("");
              }}
              className="w-full border-slate-200 text-foreground hover:bg-[#274d27]/10"
            >
              Submit Another Review
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIsSuccess(false);
                setIsFiveStar(false);
                setHasRedirected(false);
                setRating(0);
                setFeedback("");
                setName("");
                setPhone("");
                setEmail("");
                setSelectedLocation(null);
              }}
              className="w-full text-[#274d27]/70 hover:text-[#274d27] hover:bg-[#274d27]/10"
            >
              Submit Another Review for a Different Location
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess && !isFiveStar) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 text-center border border-slate-200">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-white rounded-xl p-2 sm:p-3 shadow-sm border border-slate-100">
              <img
                src="/images/logo.webp"
                alt="Restoration Logistics Logo"
                className="h-12 sm:h-16 w-auto"
              />
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#274d27] mx-auto mb-3 sm:mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Feedback Received
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Thank you for your feedback. We are constantly working to improve our service.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-50 py-6 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-[#274d27] px-4 sm:px-8 py-6 sm:py-10 text-white">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-white rounded-xl p-2 sm:p-3">
                  <img
                    src="/images/logo.webp"
                    alt="Restoration Logistics Logo"
                    className="h-12 sm:h-16 w-auto"
                  />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 tracking-tight">
                Share Your Experience
              </h1>
              <p className="text-white/80 text-base sm:text-lg max-w-lg mx-auto">
                Your feedback helps us provide the best service to our community.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {hasRedirected && rating === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#274d27] mx-auto mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  Thank You!
                </h2>
                <p className="text-muted-foreground mb-6">
                  We've opened the Google review page for you. Thank you for your support!
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setHasRedirected(false);
                      setRating(0);
                      setFeedback("");
                      setName("");
                      setPhone("");
                      setEmail("");
                    }}
                    className="w-full bg-[#274d27] hover:bg-[#1e3d1e] text-white"
                  >
                    Submit Another Review
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setHasRedirected(false);
                      setRating(0);
                      setFeedback("");
                      setName("");
                      setPhone("");
                      setEmail("");
                      setSelectedLocation(null);
                    }}
                    className="w-full text-[#274d27]/70 hover:text-[#274d27] hover:bg-[#274d27]/10"
                  >
                    Submit Another Review for a Different Location
                  </Button>
                </div>
              </div>
            ) : isLoadingLocation ? (
              <div className="flex flex-col sm:flex-row items-center justify-center py-8 sm:py-12 gap-3 sm:gap-0">
                <Loader2 className="w-8 h-8 animate-spin text-[#274d27]" />
                <span className="sm:ml-3 text-foreground font-medium text-center sm:text-left">
                  Finding your nearest Restoration Logistics location...
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
                    locationSource={locationSource}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUseCurrentLocation}
                    disabled={isLoadingGPS}
                    className="w-full mt-3 border-slate-200 text-foreground hover:bg-[#274d27]/10 hover:text-foreground h-10"
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
                    <Label className="text-sm font-semibold mb-3 block text-foreground">
                      How would you rate your experience? <span className="text-red-500">*</span>
                    </Label>
                    {!selectedLocation ? (
                      <p className="text-sm text-muted-foreground">
                        Please select a location above before rating your experience.
                      </p>
                    ) : (
                      <StarRating
                        rating={rating}
                        onRatingChange={setRating}
                        size="lg"
                      />
                    )}
                  </div>

                  {rating > 0 && rating < 5 && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="feedback" className="text-sm font-semibold text-foreground mb-1.5 block">
                          Your Feedback <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="feedback"
                          placeholder="Please share your experience..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={4}
                          className="mt-1 border-slate-200 focus:border-[#274d27] focus:ring-[#274d27] rounded-md"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="name" className="text-sm font-semibold text-foreground mb-1.5 block">
                          Your Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 border-slate-200 focus:border-[#274d27] focus:ring-[#274d27] rounded-md"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-sm font-semibold text-foreground mb-1.5 block">
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(555) 123-4567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="mt-1 border-slate-200 focus:border-[#274d27] focus:ring-[#274d27] rounded-md"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-sm font-semibold text-foreground mb-1.5 block">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1 border-slate-200 focus:border-[#274d27] focus:ring-[#274d27] rounded-md"
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
                        className="w-full h-12 text-base bg-[#274d27] hover:bg-[#1e3d1e] text-white shadow-sm transition-all font-medium"
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
          <p className="text-sm text-[#274d27]/70 font-medium">
            © {new Date().getFullYear()} Restoration Logistics. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
