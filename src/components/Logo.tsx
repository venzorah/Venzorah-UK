import React from "react";
import { images } from "../data/images";

interface LogoProps {
  variant?: "full" | "icon";
  className?: string;
}

export function Logo({ variant = "full", className = "" }: LogoProps) {
  if (variant === "icon") {
    return <img src={images.logoIcon} alt="VenZorah" className={`object-contain ${className}`} />;
  }
  return <img src={images.logoFull} alt="VenZorah — Shop Products and Services" className={`object-contain ${className}`} />;
}