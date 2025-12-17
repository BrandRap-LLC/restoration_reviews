"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Location } from "./LocationSelector";

interface QRCodeDisplayProps {
  location: Location;
}

export function QRCodeDisplay({ location }: QRCodeDisplayProps) {
  // Convert Google Drive view link to direct image link
  const getDirectImageUrl = (driveUrl: string): string => {
    try {
      // Extract file ID from Google Drive URL
      // Format: https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
      const match = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
      return driveUrl;
    } catch {
      return driveUrl;
    }
  };

  const googleQrUrl = getDirectImageUrl(location.googleReviewQrCode);

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">
          Scan QR Code to Leave a Review
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <img src="/images/google-logo.svg" alt="Google" className="w-6 h-6" />
              <p className="text-sm font-semibold text-slate-700">Google Review</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 inline-block">
              <img
                src={googleQrUrl}
                alt="Google Review QR Code"
                className="w-32 h-32 mx-auto"
                onError={(e) => {
                  // Fallback: show link if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <a href="${location.googleReviewUrl}" target="_blank" rel="noopener noreferrer" 
                         class="text-emerald-600 hover:text-emerald-700 underline text-sm">
                        Open Google Review Link
                      </a>
                    `;
                  }
                }}
              />
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-2 w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
            >
              <a
                href={location.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Google Review
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
          </div>

          {location.yelpReviewUrl && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <img src="/images/yelp-logo.svg" alt="Yelp" className="w-16 h-auto" />
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 inline-block">
                <p className="text-xs text-slate-500 py-8">
                  Yelp QR code available in-store
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-2 w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
              >
                <a
                  href={location.yelpReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Yelp Review
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
