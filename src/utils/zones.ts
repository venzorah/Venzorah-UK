import { approvedZones } from "../data/zones";
import { postcodeDistrict } from "./shipping";

export function zoneForPostcode(postcode: string): "Birmingham" | "Sheffield" | null {
  const district = postcodeDistrict(postcode);
  return approvedZones.find((z) => z.districts.includes(district))?.city ?? null;
}