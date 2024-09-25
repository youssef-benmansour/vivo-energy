// src/services/orderService.js

import { getOrders, getOrder, createOrder, updateOrder, deleteOrder } from './api';

class OrderService {
  /**
   * Fetch orders with optional filtering
   * @param {Object} filters - Filters to apply (e.g., status, date range, client)
   * @returns {Promise<Array>} - A promise that resolves with an array of orders
   */
  async getOrders(filters = {}) {
    try {
      const response = await getOrders(filters);
      return this.processOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders. Please try again.');
    }
  }

  /**
   * Fetch a single order by ID
   * @param {string} orderId - The ID of the order to fetch
   * @returns {Promise<Object>} - A promise that resolves with the order details
   */
  async getOrderById(orderId) {
    try {
      const response = await getOrder(orderId);
      return this.processOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order details. Please try again.');
    }
  }

  /**
   * Create a new order
   * @param {Object} orderData - The data for the new order
   * @returns {Promise<Object>} - A promise that resolves with the created order
   */
  async createOrder(orderData) {
    try {
      this.validateOrderData(orderData);
      const response = await createOrder(orderData);
      return this.processOrder(response.data);
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error(`Failed to create order. ${error.message}`);
    }
  }

  /**
   * Update an existing order
   * @param {string} orderId - The ID of the order to update
   * @param {Object} orderData - The updated order data
   * @returns {Promise<Object>} - A promise that resolves with the updated order
   */
  async updateOrder(orderId, orderData) {
    try {
      this.validateOrderData(orderData);
      const response = await updateOrder(orderId, orderData);
      return this.processOrder(response.data);
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error(`Failed to update order. ${error.message}`);
    }
  }

  /**
   * Delete an order
   * @param {string} orderId - The ID of the order to delete
   * @returns {Promise<boolean>} - A promise that resolves with true if deletion was successful
   */
  async deleteOrder(orderId) {
    try {
      await deleteOrder(orderId);
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw new Error('Failed to delete order. Please try again.');
    }
  }

  /**
   * Validate order data
   * @param {Object} orderData - The order data to validate
   * @throws {Error} If the order data is invalid
   */
  validateOrderData(orderData) {
    const requiredFields = ['Sales Order', 'Customer', 'Plant', 'Material Code', 'Order Qty', 'Requested delivery date'];
    for (const field of requiredFields) {
      if (!orderData[field]) {
        throw new Error(`${field} is required.`);
      }
    }

    if (isNaN(parseFloat(orderData['Order Qty'])) || parseFloat(orderData['Order Qty']) <= 0) {
      throw new Error('Order quantity must be a positive number.');
    }

    // Add more validation as needed
  }

  /**
   * Process multiple orders (e.g., add computed properties, format dates)
   * @param {Array} orders - The array of orders to process
   * @returns {Array} - The processed array of orders
   */
  processOrders(orders) {
    return orders.map(order => this.processOrder(order));
  }

  /**
   * Process a single order (e.g., add computed properties, format dates)
   * @param {Object} order - The order to process
   * @returns {Object} - The processed order
   */
  processOrder(order) {
    return {
      ...order,
      formattedDeliveryDate: new Date(order['Requested delivery date']).toLocaleDateString(),
      status: order.Status || 'Created', // Ensure there's always a status
      totalValue: this.calculateOrderValue(order)
    };
  }

  /**
   * Calculate the total value of an order
   * @param {Object} order - The order to calculate the value for
   * @returns {number} - The total value of the order
   */
  calculateOrderValue(order) {
    // This is a placeholder. In a real application, you'd use actual pricing data.
    // You might need to fetch price information or have it available in the order data.
    const unitPrice = 10; // Example price
    return parseFloat(order['Order Qty']) * unitPrice;
  }

  /**
   * Update the status of an order
   * @param {string} orderId - The ID of the order to update
   * @param {string} newStatus - The new status of the order
   * @returns {Promise<Object>} - A promise that resolves with the updated order
   */
  async updateOrderStatus(orderId, newStatus) {
    try {
      const order = await this.getOrderById(orderId);
      order.Status = newStatus;
      return await this.updateOrder(orderId, order);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status. Please try again.');
    }
  }

  /**
   * Get orders for a specific client
   * @param {string} clientId - The ID of the client
   * @returns {Promise<Array>} - A promise that resolves with an array of orders for the client
   */
  async getOrdersForClient(clientId) {
    return this.getOrders({ Customer: clientId });
  }

  /**
   * Get orders for a specific date range
   * @param {Date} startDate - The start date of the range
   * @param {Date} endDate - The end date of the range
   * @returns {Promise<Array>} - A promise that resolves with an array of orders within the date range
   */
  async getOrdersForDateRange(startDate, endDate) {
    return this.getOrders({
      'Requested delivery date': {
        $gte: startDate.toISOString(),
        $lte: endDate.toISOString()
      }
    });
  }
}

export default new OrderService();