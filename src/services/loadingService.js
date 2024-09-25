// src/services/loadingService.js

import { confirmLoading, getTrip } from './api';

class LoadingService {
  /**
   * Confirm loading for a trip
   * @param {string} tripId - The ID of the trip
   * @param {Object} loadingData - The loading data including seal numbers
   * @returns {Promise<Object>} - A promise that resolves with the confirmation results
   */
  async confirmTripLoading(tripId, loadingData) {
    try {
      this.validateLoadingData(loadingData);
      const response = await confirmLoading(tripId, loadingData);
      return this.processConfirmationResponse(response.data);
    } catch (error) {
      console.error('Error confirming trip loading:', error);
      throw new Error(`Failed to confirm loading. ${error.message}`);
    }
  }

  /**
   * Validate the loading data before confirmation
   * @param {Object} loadingData - The loading data to validate
   * @throws {Error} If the loading data is invalid
   */
  validateLoadingData(loadingData) {
    if (!loadingData.sealNumbers || Object.keys(loadingData.sealNumbers).length === 0) {
      throw new Error('Seal numbers are required for loading confirmation.');
    }

    // Add more validation as needed, e.g., checking if all required compartments have seal numbers
  }

  /**
   * Process the confirmation response from the server
   * @param {Object} responseData - The response data from the server
   * @returns {Object} - Processed confirmation results
   */
  processConfirmationResponse(responseData) {
    // Assuming the server returns an object with confirmation details
    return {
      confirmed: responseData.confirmed || false,
      message: responseData.message || 'Loading confirmation processed.',
      updatedTripStatus: responseData.updatedTripStatus,
      // Add any other relevant information from the response
    };
  }

  /**
   * Get trip details for loading
   * @param {string} tripId - The ID of the trip
   * @returns {Promise<Object>} - A promise that resolves with the trip details
   */
  async getTripDetailsForLoading(tripId) {
    try {
      const response = await getTrip(tripId);
      return this.prepareTripForLoading(response.data);
    } catch (error) {
      console.error('Error fetching trip details for loading:', error);
      throw new Error('Failed to fetch trip details. Please try again.');
    }
  }

  /**
   * Prepare trip data for loading confirmation
   * @param {Object} tripData - The raw trip data from the server
   * @returns {Object} - Prepared trip data for loading confirmation
   */
  prepareTripForLoading(tripData) {
    // Extract relevant information for loading confirmation
    const { id, "Trip Num": tripNum, "Vehicle Id": vehicleId, Orders, truck } = tripData;

    // Prepare compartment information
    const compartments = {};
    for (let i = 1; i <= 9; i++) {
      if (truck[`Comp${i}`] > 0) {
        compartments[`Comp${i}`] = {
          capacity: truck[`Comp${i}`],
          sealNumber: '' // To be filled during loading confirmation
        };
      }
    }

    return {
      tripId: id,
      tripNumber: tripNum,
      vehicleId,
      orders: Orders.map(order => ({
        orderNumber: order["Sales Order"],
        product: order["Material Name"],
        quantity: order["Order Qty"],
        unit: order["Sls.UOM"]
      })),
      compartments
    };
  }

  /**
   * Generate sequential seal numbers
   * @param {number} startNumber - The starting number for the sequence
   * @param {number} count - The number of seal numbers to generate
   * @returns {Array<string>} - An array of sequential seal numbers
   */
  generateSequentialSealNumbers(startNumber, count) {
    return Array.from({ length: count }, (_, i) => (startNumber + i).toString().padStart(6, '0'));
  }
}

export default new LoadingService();