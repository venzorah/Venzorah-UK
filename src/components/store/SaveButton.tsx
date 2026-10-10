import React from "react";
import { HeartIcon } from "lucide-react";
import { toast } from "sonner";
import { useCustomer } from "../../contexts/CustomerContext";

export function SaveButton({ id, name, className = "" }: {id: string;name: string;className?: string;}) {
  const { isSaved, toggleSaved } = useCustomer();
  const saved = isSaved(id);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`}
      onClick={() => {
        const now = toggleSaved(id);
        toast(now ? "Saved to your list" : "Removed from saved");
      }}
      className={`h-9 w-9 rounded-full bg-white/95 border border-line flex items-center justify-center transition-transform duration-150 ease-out active:scale-90 ${className}`}>
      
      <HeartIcon className={`h-4 w-4 transition-colors duration-150 ${saved ? "fill-gold text-gold" : "text-navy"}`} />
    </button>);

}