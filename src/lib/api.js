import { API_URL } from '@/config';

export const getFeaturedListings = async () => {
  const response = await fetch(`${API_URL}/api/listings/featured`);
  if (!response.ok) {
    throw new Error('Failed to fetch featured listings');
  }
  const data = await response.json();
  return data;
};

export const getPopularDestinations = async () => {
  const response = await fetch(`${API_URL}/api/cities/popular`);
  if (!response.ok) {
    throw new Error('Failed to fetch popular destinations');
  }
  const data = await response.json();
  return data;
};

export const getPropertyById = async (id) => {
  const response = await fetch(`${API_URL}/api/listings/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch property details');
  }
  const data = await response.json();
  return data;
};

export const getReviewsByPropertyId = async (propertyId) => {
  const response = await fetch(`${API_URL}/api/listings/${propertyId}/reviews`);
  if (!response.ok) {
    throw new Error('Failed to fetch property reviews');
  }
  const data = await response.json();
  return data;
};
