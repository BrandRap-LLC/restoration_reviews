export interface StoreLocation {
  id: string;
  name: string;
  gmbName: string;
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

export const STORES: StoreLocation[] = [
  {
    id: "lafayette",
    name: "Restoration Logistics Lafayette",
    gmbName: "Restoration Logistics",
    address: "652 Princeton Pl",
    city: "Lafayette",
    state: "CO",
    zip: "80026",
    lat: 40.0047666,
    lng: -105.1283341,
    googleReviewUrl: "https://g.page/r/CQd42cdal_i-EBM/review",
    googleReviewQrCode: "",
    yelpAccount: "",
    yelpReviewUrl: "",
  },
  {
    id: "fort-collins",
    name: "Restoration Logistics Fort Collins",
    gmbName: "Restoration Logistics",
    address: "312 Flicker Dr",
    city: "Fort Collins",
    state: "CO",
    zip: "80526",
    lat: 40.5503122,
    lng: -105.0818479,
    googleReviewUrl: "https://g.page/r/CVXqnUCZot-qEBM/review",
    googleReviewQrCode: "",
    yelpAccount: "",
    yelpReviewUrl: "",
  },
  {
    id: "centennial",
    name: "Restoration Logistics Centennial",
    gmbName: "Restoration Logistics",
    address: "5798 S Laredo Ct",
    city: "Centennial",
    state: "CO",
    zip: "80015",
    lat: 39.6111941,
    lng: -104.800549,
    googleReviewUrl: "https://g.page/r/CRGJYSbH86J8EBM/review",
    googleReviewQrCode: "",
    yelpAccount: "",
    yelpReviewUrl: "",
  },
  {
    id: "denver",
    name: "Restoration Logistics Denver",
    gmbName: "Restoration Logistics",
    address: "5360 Washington St UNIT D",
    city: "Denver",
    state: "CO",
    zip: "80216",
    lat: 39.7934311,
    lng: -104.9771281,
    googleReviewUrl: "https://g.page/r/CQ6BNL8oCS-_EBM/review",
    googleReviewQrCode: "",
    yelpAccount: "",
    yelpReviewUrl: "",
  },
  {
    id: "boulder",
    name: "Restoration Logistics Boulder",
    gmbName: "Restoration Logistics",
    address: "1800 Commerce St Unit G",
    city: "Boulder",
    state: "CO",
    zip: "80301",
    lat: 40.0181021,
    lng: -105.2316442,
    googleReviewUrl: "https://g.page/r/CVH1yclL-wF8EBM/review",
    googleReviewQrCode: "",
    yelpAccount: "",
    yelpReviewUrl: "",
  },
];
