const { request } = require("express");
const { body } = require("express-validator");

/**
 * Generates a unique, time-based batch ID in the format SB-YYYYMMDD_HHmmssSSS.
 * This function uses a consistent, machine-readable format suitable for
 * unique identifiers in a database.
 * @returns {string} The formatted batch ID (e.g., SB-20251112_115817456).
 */
function generateBatchId() {
    const dateObject = new Date();
    // console.log(request.query);
    const year = dateObject.getFullYear();
    // Month is 0-indexed, so add 1
    const month = String(dateObject.getMonth() + 1).padStart(2, '0');
    const day = String(dateObject.getDate()).padStart(2, '0');
    const hours = String(dateObject.getHours()).padStart(2, '0');
    const minutes = String(dateObject.getMinutes()).padStart(2, '0');
    const seconds = String(dateObject.getSeconds()).padStart(2, '0');
    // Milliseconds provides the highest level of uniqueness
    const milliseconds = String(dateObject.getMilliseconds()).padStart(3, '0');

    // Combine date and time parts
    const timeStampPart = `${year}${month}${day}_${hours}${minutes}${seconds}${milliseconds}`;
    return `Batch-${timeStampPart}`;
}

// Use module.exports to make the function accessible everywhere in Node.js
module.exports = {
    generateBatchId
};