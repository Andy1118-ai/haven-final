import { useState } from 'react';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';

interface Booking {
  id: string;
  therapistId: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  type: 'INDIVIDUAL' | 'GROUP' | 'EMERGENCY';
  notes?: string;
  therapist: {
    id: string;
    name: string;
    specialization: string[];
    avatar?: string;
  };
}

interface BookingsState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
}

export function useBookings() {
  const { getAuthHeader } = useAuth();
  const { scheduleBookingReminders, cancelReminders } = useNotifications();
  const [state, setState] = useState<BookingsState>({
    bookings: [],
    isLoading: false,
    error: null,
  });

  const fetchBookings = async (params?: { status?: string; startDate?: string; endDate?: string }) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);

      const response = await fetch(`/api/bookings?${queryParams.toString()}`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      setState({
        bookings: data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch bookings',
      }));
    }
  };

  const createBooking = async (bookingData: {
    therapistId: string;
    startTime: string;
    endTime: string;
    type: 'INDIVIDUAL' | 'GROUP' | 'EMERGENCY';
    notes?: string;
  }) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // Schedule notifications for the new booking
      await scheduleBookingReminders({
        id: data.id,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        therapistName: data.therapist.name,
        type: data.type,
      });

      setState(prev => ({
        bookings: [data, ...prev.bookings],
        isLoading: false,
        error: null,
      }));

      return data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create booking',
      }));
      throw error;
    }
  };

  const updateBooking = async (
    id: string,
    updates: { status?: string; notes?: string }
  ) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ id, ...updates }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking');
      }

      // If booking is cancelled, cancel all notifications
      if (updates.status === 'CANCELLED') {
        await cancelReminders(id);
      }

      setState(prev => ({
        bookings: prev.bookings.map(booking =>
          booking.id === id ? data : booking
        ),
        isLoading: false,
        error: null,
      }));

      return data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update booking',
      }));
      throw error;
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ id, status: 'CANCELLED' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking');
      }

      // Cancel all notifications for this booking
      await cancelReminders(id);

      setState(prev => ({
        bookings: prev.bookings.map(booking =>
          booking.id === id ? data : booking
        ),
        isLoading: false,
        error: null,
      }));

      return data;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to cancel booking',
      }));
      throw error;
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/bookings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete booking');
      }

      // Cancel all notifications for this booking
      await cancelReminders(id);

      setState(prev => ({
        bookings: prev.bookings.filter(booking => booking.id !== id),
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete booking',
      }));
      throw error;
    }
  };

  return {
    ...state,
    fetchBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    deleteBooking,
  };
} 