import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { postFavorite } from "./api"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const handleFavoriteToggle = async (
  isFavorite,
  userEmail,
  listingId,
  setIsFavorite
) => {
  try {
    await postFavorite(userEmail, listingId)
    setIsFavorite(!isFavorite)
  } catch (error) {
    console.error("Error toggling favorite:", error)
  }
}
