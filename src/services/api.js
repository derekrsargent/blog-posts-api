const queryStringService = (queryString) => {
    const result = {
        isValid: true,
        errorMessage: '',
        direction: 'asc',
        sortBy: 'id',
    };

    if (!queryString.tags) {
        result.isValid = false;
        result.errorMessage = 'Tags parameter is required';
    }

    if (
        queryString.sortBy &&
        queryString.sortBy !== 'id' &&
        queryString.sortBy !== 'reads' &&
        queryString.sortBy !== 'likes' &&
        queryString.sortBy !== 'popularity'
    ) {
        result.isValid = false;
        result.errorMessage = 'sortBy parameter is invalid';
    } else if (queryString.sortBy) {
        result.sortBy = queryString.sortBy;
    }

    if (
        queryString.direction &&
        queryString.direction !== 'asc' &&
        queryString.direction !== 'desc'
    ) {
        result.isValid = false;
        result.errorMessage = 'direction parameter is invalid';
    } else if (queryString.direction) {
        result.direction = queryString.direction;
    }

    return result;
};

module.exports = queryStringService;
