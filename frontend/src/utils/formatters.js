export const formatTags = (tags) => {
    if (!tags) return [];
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
};

export const formatPostingDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    return dateString;
};

export const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return input.trim();
    }
    return input;
};

export const validateRequiredFields = (data, requiredFields) => {
    const errors = {};
    let firstErrorField = null;

    requiredFields.forEach(field => {
        if (!data[field] || !data[field].toString().trim()) {
            errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
            if (!firstErrorField) {
                firstErrorField = field;
            }
        }
    });

    return { errors, firstErrorField };
};