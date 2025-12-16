export interface Coordinates {
  lat: number;
  lng: number;
}

export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 3959;
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) *
      Math.cos(toRadians(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function findNearestLocation<T extends Coordinates>(
  userLocation: Coordinates,
  locations: T[]
): T | null {
  if (locations.length === 0) return null;

  let nearest = locations[0];
  let minDistance = calculateDistance(userLocation, locations[0]);

  for (let i = 1; i < locations.length; i++) {
    const distance = calculateDistance(userLocation, locations[i]);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = locations[i];
    }
  }

  return nearest;
}
