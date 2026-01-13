"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Location } from "./LocationSelector";

interface QRCodeDisplayProps {
  location: Location;
}

export function QRCodeDisplay({ location }: QRCodeDisplayProps) {
  // Generate QR code from Google review URL
  const generateQRCodeUrl = (url: string): string => {
    // Use QR Server API to generate QR code
    const encodedUrl = encodeURIComponent(url);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
  };

  const qrCodeUrl = generateQRCodeUrl(location.googleReviewUrl);

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
          Scan QR Code to Leave a Review
        </h3>
        <div className="flex justify-center">
          <div className="text-center max-w-xs">
            <div className="flex items-center justify-center gap-2 mb-4">
              <img src="/images/google-logo.svg" alt="Google" className="w-6 h-6" />
              <p className="text-sm font-semibold text-foreground">Google Review</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 inline-block mb-4">
              <img
                src={qrCodeUrl}
                alt="Google Review QR Code"
                className="w-48 h-48 mx-auto"
                onError={(e) => {
                  // Fallback: show link if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <a href="${location.googleReviewUrl}" target="_blank" rel="noopener noreferrer" 
                         class="text-primary hover:text-primary/80 underline text-sm">
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
              className="w-full border-slate-200 text-foreground hover:bg-slate-100 hover:text-foreground font-medium"
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
        </div>
      </div>
    </div>
  );
}
