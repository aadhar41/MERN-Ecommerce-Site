const mongoose = require('mongoose');

/**
 * Validate a string as a MongoDB ObjectId.
 * Returns true if valid, false otherwise.
 * @param {string} id - The id to validate.
 * @returns {boolean}
 */
function isValidObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    // Ensure it's a 24 hex character string
    return /^[a-fA-F0-9]{24}$/.test(id);
}

module.exports = { isValidObjectId };
