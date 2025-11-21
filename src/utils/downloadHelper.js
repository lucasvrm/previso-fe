// src/utils/downloadHelper.js
// Utility functions for downloading files in the browser

/**
 * Download data as a blob file
 * @param {string|Blob} data - The data to download
 * @param {string} filename - The name of the file to download
 * @param {string} contentType - MIME type of the file
 */
export const downloadBlob = (data, filename, contentType) => {
  const blob = data instanceof Blob ? data : new Blob([data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Get MIME content type for common file formats
 * @param {string} format - File format (csv, json, excel, etc.)
 * @returns {string} MIME type
 */
export const getContentType = (format) => {
  const contentTypes = {
    csv: 'text/csv',
    json: 'application/json',
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pdf: 'application/pdf',
    txt: 'text/plain',
    xml: 'application/xml'
  };
  
  return contentTypes[format.toLowerCase()] || 'application/octet-stream';
};
