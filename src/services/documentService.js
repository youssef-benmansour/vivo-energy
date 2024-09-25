// src/services/documentService.js

import { generateDeliveryNote, generateInvoice } from './api';

class DocumentService {
  /**
   * Generate a delivery note for a given order
   * @param {string} orderId - The ID of the order
   * @returns {Promise<Blob>} - A promise that resolves with the document as a Blob
   */
  async generateDeliveryNote(orderId) {
    try {
      const response = await generateDeliveryNote(orderId);
      return new Blob([response.data], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error generating delivery note:', error);
      throw new Error('Failed to generate delivery note. Please try again.');
    }
  }

  /**
   * Generate an invoice for a given order
   * @param {string} orderId - The ID of the order
   * @returns {Promise<Blob>} - A promise that resolves with the document as a Blob
   */
  async generateInvoice(orderId) {
    try {
      const response = await generateInvoice(orderId);
      return new Blob([response.data], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error generating invoice:', error);
      throw new Error('Failed to generate invoice. Please try again.');
    }
  }

  /**
   * Download a generated document
   * @param {Blob} documentBlob - The document as a Blob
   * @param {string} fileName - The name to give the downloaded file
   */
  downloadDocument(documentBlob, fileName) {
    const url = window.URL.createObjectURL(documentBlob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generate and download a delivery note
   * @param {string} orderId - The ID of the order
   * @param {string} fileName - The name to give the downloaded file
   */
  async generateAndDownloadDeliveryNote(orderId, fileName) {
    try {
      const documentBlob = await this.generateDeliveryNote(orderId);
      this.downloadDocument(documentBlob, fileName);
    } catch (error) {
      console.error('Error in generate and download delivery note:', error);
      throw error;
    }
  }

  /**
   * Generate and download an invoice
   * @param {string} orderId - The ID of the order
   * @param {string} fileName - The name to give the downloaded file
   */
  async generateAndDownloadInvoice(orderId, fileName) {
    try {
      const documentBlob = await this.generateInvoice(orderId);
      this.downloadDocument(documentBlob, fileName);
    } catch (error) {
      console.error('Error in generate and download invoice:', error);
      throw error;
    }
  }

  /**
   * Preview a generated document
   * @param {Blob} documentBlob - The document as a Blob
   * @returns {string} - URL of the document for previewing
   */
  previewDocument(documentBlob) {
    const url = window.URL.createObjectURL(documentBlob);
    // You might want to open this URL in a new window or tab, 
    // or use it with an embedded PDF viewer in your application
    return url;
  }
}

export default new DocumentService();