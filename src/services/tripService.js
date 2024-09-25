// src/services/tripService.js

import { getTrips, getTrip, createTrip, updateTrip, deleteTrip } from './api';

class TripService {
  /**
   * Fetch trips with optional filtering
   * @param {Object} filters - Filters to apply (e.g., status, date range, vehicle)
   * @returns {Promise<Array>} - A promise that resolves with an array of trips
   */
  async getTrips(filters = {}) {
    try {
      const response = await getTrips(filters);
      return this.processTrips(response.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw new Error('Failed to fetch trips. Please try again.');
    }
  }

  /**
   * Fetch a single trip by ID
   * @param {string} tripId - The ID of the trip to fetch
   * @returns {Promise<Object>} - A promise that resolves with the trip details
   */
  async getTripById(tripId) {
    try {
      const response = await getTrip(tripId);
      return this.processTrip(response.data);
    } catch (error) {
      console.error('Error fetching trip:', error);
      throw new Error('Failed to fetch trip details. Please try again.');
    }
  }

  /**
   * Create a new trip
   * @param {Object} tripData - The data for the new trip
   * @returns {Promise<Object>} - A promise that resolves with the created trip
   */
  async createTrip(tripData) {
    try {
      this.validateTripData(tripData);
      const response = await createTrip(tripData);
      return this.processTrip(response.data);
    } catch (error) {
      console.error('Error creating trip:', error);
      throw new Error(`Failed to create trip. ${error.message}`);
    }
  }

  /**
   * Update an existing trip
   * @param {string} tripId - The ID of the trip to update
   * @param {Object} tripData - The updated trip data
   * @returns {Promise<Object>} - A promise that resolves with the updated trip
   */
  async updateTrip(tripId, tripData) {
    try {
      this.validateTripData(tripData);
      const response = await updateTrip(tripId, tripData);
      return this.processTrip(response.data);
    } catch (error) {
      console.error('Error updating trip:', error);
      throw new Error(`Failed to update trip. ${error.message}`);
    }
  }

  /**
   * Delete a trip
   * @param {string} tripId - The ID of the trip to delete
   * @returns {Promise<boolean>} - A promise that resolves with true if deletion was successful
   */
  async deleteTrip(tripId) {
    try {
      await deleteTrip(tripId);
      return true;
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw new Error('Failed to delete trip. Please try again.');
    }
  }

  /**
   * Validate trip data
   * @param {Object} tripData - The trip data to validate
   * @throws {Error} If the trip data is invalid
   */
  validateTripData(tripData) {
    const requiredFields = ['Trip Num', 'Vehicle Id', 'Driver Name', 'Tour Start Date'];
    for (const field of requiredFields) {
      if (!tripData[field]) {
        throw new Error(`${field} is required.`);
      }
    }

    if (!Array.isArray(tripData.Orders) || tripData.Orders.length === 0) {
      throw new Error('At least one order must be assigned to the trip.');
    }

    // Add more validation as needed
  }

  /**
   * Process multiple trips (e.g., add computed properties, format dates)
   * @param {Array} trips - The array of trips to process
   * @returns {Array} - The processed array of trips
   */
  processTrips(trips) {
    return trips.map(trip => this.processTrip(trip));
  }

  /**
   * Process a single trip (e.g., add computed properties, format dates)
   * @param {Object} trip - The trip to process
   * @returns {Object} - The processed trip
   */
  processTrip(trip) {
    return {
      ...trip,
      formattedStartDate: new Date(trip['Tour Start Date']).toLocaleDateString(),
      totalOrders: trip.Orders.length,
      totalVolume: this.calculateTotalVolume(trip.Orders),
      status: trip.Status || 'Planned' // Ensure there's always a status
    };
  }

  /**
   * Calculate the total volume of orders in a trip
   * @param {Array} orders - The orders in the trip
   * @returns {number} - The total volume of all orders
   */
  calculateTotalVolume(orders) {
    return orders.reduce((total, order) => total + parseFloat(order['Order Qty']), 0);
  }

  /**
   * Update the status of a trip
   * @param {string} tripId - The ID of the trip to update
   * @param {string} newStatus - The new status of the trip
   * @returns {Promise<Object>} - A promise that resolves with the updated trip
   */
  async updateTripStatus(tripId, newStatus) {
    try {
      const trip = await this.getTripById(tripId);
      trip.Status = newStatus;
      return await this.updateTrip(tripId, trip);
    } catch (error) {
      console.error('Error updating trip status:', error);
      throw new Error('Failed to update trip status. Please try again.');
    }
  }

  /**
   * Assign an order to a trip
   * @param {string} tripId - The ID of the trip
   * @param {string} orderId - The ID of the order to assign
   * @returns {Promise<Object>} - A promise that resolves with the updated trip
   */
  async assignOrderToTrip(tripId, orderId) {
    try {
      const trip = await this.getTripById(tripId);
      if (!trip.Orders.includes(orderId)) {
        trip.Orders.push(orderId);
        return await this.updateTrip(tripId, trip);
      }
      return trip;
    } catch (error) {
      console.error('Error assigning order to trip:', error);
      throw new Error('Failed to assign order to trip. Please try again.');
    }
  }

  /**
   * Remove an order from a trip
   * @param {string} tripId - The ID of the trip
   * @param {string} orderId - The ID of the order to remove
   * @returns {Promise<Object>} - A promise that resolves with the updated trip
   */
  async removeOrderFromTrip(tripId, orderId) {
    try {
      const trip = await this.getTripById(tripId);
      trip.Orders = trip.Orders.filter(id => id !== orderId);
      return await this.updateTrip(tripId, trip);
    } catch (error) {
      console.error('Error removing order from trip:', error);
      throw new Error('Failed to remove order from trip. Please try again.');
    }
  }

  /**
   * Get trips for a specific date range
   * @param {Date} startDate - The start date of the range
   * @param {Date} endDate - The end date of the range
   * @returns {Promise<Array>} - A promise that resolves with an array of trips within the date range
   */
  async getTripsForDateRange(startDate, endDate) {
    return this.getTrips({
      'Tour Start Date': {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString()
      }
    });
  }
}

export default new TripService();