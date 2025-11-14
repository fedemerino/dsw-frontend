import { API_URL } from '@/config';
import axios from 'axios';
import { toast } from 'sonner';

export const getFeaturedListings = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/listings/featured`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch featured listings:', error);
    throw error;
  }
};

export const getPopularDestinations = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/cities/popular`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch popular destinations:', error);
    throw error;
  }
};

export const getPropertyById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/listings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch property details:', error);
    throw error;
  }
};

export const postFavorite = async (listingId) => {
  try {
    const response = await axios.post(`${API_URL}/api/listings/favorites`, {
      listingId,
    });
    return response.data;
  } catch (error) {
    console.error('Error posting favorite:', error);
    throw error;
  }
};

export const getDestinations = async (search) => {
  try {
    console.log('Searching for destinations with query:', search);
    if (search.length < 2) return [];
    const response = await axios.get(`${API_URL}/api/cities`, {
      params: { search },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch destinations:', error);
    throw error;
  }
};

export const getListings = async (filters) => {
  try {
    const response = await axios.get(`${API_URL}/api/listings`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch listings:', error);
    throw error;
  }
};

export const getAmenities = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/amenities`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch amenities:', error);
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/me`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};

export const getRefreshToken = async () => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/refresh`);
    return response.data;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await axios.put(`${API_URL}/api/users/update`, userData);
    return response.data;
  } catch (error) {
    console.error('Failed to update user profile:', error);
    throw error;
  }
};

export const getUserBookingsCount = async (userEmail) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/bookings/user/${userEmail}/count`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user bookings count:', error);
    throw error;
  }
};

export const getUserBookings = async (userEmail) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/bookings/user/${userEmail}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user bookings:', error);
    throw error;
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        'Error al cancelar la reserva. Por favor, intenta nuevamente.'
    );
    throw error;
  }
};

export const getUserFavorites = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/listings/favorites`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user favorites listings:', error);
    throw error;
  }
};

export const getListingBookings = async (listingId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/listings/bookings/${listingId}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch listing bookings:', error);
    return [];
  }
};

export const createBooking = async (bookingData) => {
  try {
    const response = await axios.post(`${API_URL}/api/bookings`, bookingData);
    return response.data;
  } catch (error) {
    console.error('Failed to create booking:', error);
    throw error;
  }
};

export const createListing = async (listingData) => {
  try {
    const response = await axios.post(`${API_URL}/api/listings`, listingData);
    return response.data;
  } catch (error) {
    console.error('Failed to create listing:', error);
    throw error;
  }
};

export const getCities = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/cities`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch cities:', error);
    throw error;
  }
};

export const getPaymentMethods = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/paymentMethods`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch payment methods:', error);
    throw error;
  }
};

export const getImageUploadUrl = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/files/imageUploadUrl`);
    return response.data;
  } catch (error) {
    console.error('Failed to get image upload URL:', error);
    throw error;
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await axios.post(`${API_URL}/api/reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Failed to create review:', error);
    throw error;
  }
};

export const requestNewPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/forgotPassword`, {
      email,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to request new password:', error);
    throw error;
  }
};

export const resetPassword = async (token, newPassword, confirmNewPassword) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/resetPassword`, {
      token,
      newPassword,
      confirmNewPassword,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to reset password:', error);
    throw error;
  }
};

export const getUserListings = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/listings/myListings`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user listings:', error);
    throw error;
  }
};

export const updateListing = async (listingId, listingData) => {
  try {
    const response = await axios.put(`${API_URL}/api/listings/${listingId}`, listingData);
    return response.data;
  } catch (error) {
    console.error('Failed to update listing:', error);
    throw error;
  }
};

export const deleteListing = async (listingId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/listings/${listingId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete listing:', error);
    throw error;
  }
};
