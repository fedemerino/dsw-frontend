import { API_URL } from "@/config"
import axios from "axios"

export const getFeaturedListings = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/listings/featured`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch featured listings:", error)
    throw error
  }
}

export const getPopularDestinations = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/cities/popular`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch popular destinations:", error)
    throw error
  }
}

export const getPropertyById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/listings/${id}`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch property details:", error)
    throw error
  }
}

export const postFavorite = async (userEmail, listingId) => {
  try {
    const response = await axios.post("/api/listings/favorites", {
      userEmail,
      listingId,
    })
    return response.data
  } catch (error) {
    console.error("Error posting favorite:", error)
    throw error
  }
}

export const getDestinations = async (search) => {
  try {
    console.log("Searching for destinations with query:", search)
    if (search.length < 2) return []
    const response = await axios.get(`${API_URL}/api/cities`, {
      params: { search },
    })
    return response.data
  } catch (error) {
    console.error("Failed to fetch destinations:", error)
    throw error
  }
}

export const getListings = async (filters) => {
  try {
    const response = await axios.get(`${API_URL}/api/listings`, {
      params: filters,
    })
    return response.data
  } catch (error) {
    console.error("Failed to fetch listings:", error)
    throw error
  }
}

export const getAmenities = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/amenities`)
    return response.data
  } catch (error) {
    console.error("Failed to fetch amenities:", error)
    throw error
  }
}
