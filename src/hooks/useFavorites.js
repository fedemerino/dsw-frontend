import { useState, useEffect, useCallback } from 'react';
import { getUserFavorites, postFavorite } from '@/lib/api';
import { useAuth } from '@/components/auth/authContext';
import { showAuthRequiredToast } from '@/lib/authHelpers';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to manage user favorites
 * - Loads favorites once when user is authenticated
 * - Keeps them in memory
 * - Provides optimistic updates
 */
export const useFavorites = () => {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load favorites when user is authenticated AND token is available
  useEffect(() => {
    const loadFavorites = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // Wait for token to be available (ensures interceptor is ready)
      if (!token) {
        setFavorites([]);
        return;
      }

      setIsLoading(true);
      try {
        const favoriteListings = await getUserFavorites();
        setFavorites(favoriteListings);
      } catch (error) {
        console.error('Failed to load favorites:', error);
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [token, authLoading]);

  /**
   * Check if a property is in favorites
   */
  const isFavorite = useCallback(
    (listingId) => {
      return favorites.some((listing) => listing.id === listingId);
    },
    [favorites]
  );

  /**
   * Toggle a property in/out of favorites
   * Uses optimistic update (UI first, then server)
   */
  const toggleFavorite = useCallback(
    async (listingId) => {
      if (!isAuthenticated || !user?.email) {
        showAuthRequiredToast('agregar a favoritos', () => navigate('/login'));
        return;
      }

      // Optimistic update
      setFavorites((prev) => {
        if (prev.some((listing) => listing.id === listingId)) {
          return prev.filter((listing) => listing.id !== listingId);
        } else {
          return [...prev, { id: listingId }];
        }
      });

      // Server update
      try {
        await postFavorite(listingId);
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
        // Rollback on error
        setFavorites((prev) => {
          if (prev.some((listing) => listing.id === listingId)) {
            return prev.filter((listing) => listing.id !== listingId);
          } else {
            return [...prev, { id: listingId }];
          }
        });
      }
    },
    [isAuthenticated, user?.email, navigate]
  );

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
  };
};
