import { useAuth } from "../contexts/AuthContext";
import { usePlatform } from "../contexts/PlatformContext";

/** The vendor owned by the signed-in vendor user. Vendor routes are guarded, so this is always set there. */
export function useCurrentVendor() {
  const { user } = useAuth();
  const { vendors, categories } = usePlatform();
  const vendor = vendors.find((v) => v.id === user?.vendorId);
  const category = categories.find((c) => c.id === vendor?.categoryId);
  return { vendor, category, isServiceVendor: category ? category.kind !== "product" : false, user };
}