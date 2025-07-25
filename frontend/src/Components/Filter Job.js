import React, { useState, useEffect } from 'react';

const FilterSortJob = ({ filters, onFilterChange, onReset, jobCount, isLoading }) => {
    const [localFilters, setLocalFilters] = useState(filters);
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleInputChange = (key, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value
        }));

        if (key === 'search') {
            const timeoutId = setTimeout(() => {
                onFilterChange(key, value);
            }, 300);

            return () => clearTimeout(timeoutId);
        } else {
            onFilterChange(key, value);
        }
    };

    const handleSearchChange = (e) => {
        handleInputChange('search', e.target.value);
    };

    const handleReset = () => {
        setLocalFilters({});
        onReset();
    };

    const hasActiveFilters = Object.values(localFilters).some(value => value && value.length > 0);

    return (
        <div className="filter-sort-container">
            <div className="filter-header">
                <h3>Filter & Sort Jobs</h3>
                <div className="filter-summary">
                    {isLoading ? (
                        <span className="loading-text">Loading...</span>
                    ) : (
                        <span className="job-count">
                            {jobCount} job{jobCount !== 1 ? 's' : ''} found
                        </span>
                    )}
                </div>
            </div>

            <div className="filter-controls">
                <div className="filter-group full-width">
                    <label htmlFor="search">Search Jobs</label>
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            id="search"
                            name="search"
                            value={localFilters.search || ''}
                            onChange={handleSearchChange}
                            placeholder="Search by job title or company name..."
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="quick-filters">
                    <div className="filter-group">
                        <label htmlFor="job_type">Job Type</label>
                        <select
                            id="job_type"
                            name="job_type"
                            value={localFilters.job_type || ''}
                            onChange={(e) => handleInputChange('job_type', e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Internship">Internship</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="sort">Sort By</label>
                        <select
                            id="sort"
                            name="sort"
                            value={localFilters.sort || 'posting_date_desc'}
                            onChange={(e) => handleInputChange('sort', e.target.value)}
                        >
                            <option value="posting_date_desc">Newest First</option>
                            <option value="posting_date_asc">Oldest First</option>
                            <option value="title">Title A-Z</option>
                            <option value="company">Company A-Z</option>
                        </select>
                    </div>

                    <div className="filter-actions">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            {showAdvanced ? 'Hide' : 'More'} Filters
                        </button>

                        {hasActiveFilters && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleReset}
                            >
                                Reset All
                            </button>
                        )}
                    </div>
                </div>

                {showAdvanced && (
                    <div className="advanced-filters">
                        <div className="filter-group">
                            <label htmlFor="location">Location</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={localFilters.location || ''}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                placeholder="e.g., New York, Remote"
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="tag">Tags</label>
                            <input
                                type="text"
                                id="tag"
                                name="tag"
                                value={localFilters.tag || ''}
                                onChange={(e) => handleInputChange('tag', e.target.value)}
                                placeholder="e.g., Life, Health, Pricing"
                            />
                        </div>
                    </div>
                )}

                {hasActiveFilters && (
                    <div className="active-filters">
                        <span className="active-filters-label">Active filters:</span>
                        <div className="filter-tags">
                            {localFilters.search && (
                                <span className="filter-tag">
                                    Search: "{localFilters.search}"
                                    <button onClick={() => handleInputChange('search', '')}>×</button>
                                </span>
                            )}
                            {localFilters.job_type && (
                                <span className="filter-tag">
                                    Type: {localFilters.job_type}
                                    <button onClick={() => handleInputChange('job_type', '')}>×</button>
                                </span>
                            )}
                            {localFilters.location && (
                                <span className="filter-tag">
                                    Location: {localFilters.location}
                                    <button onClick={() => handleInputChange('location', '')}>×</button>
                                </span>
                            )}
                            {localFilters.tag && (
                                <span className="filter-tag">
                                    Tag: {localFilters.tag}
                                    <button onClick={() => handleInputChange('tag', '')}>×</button>
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterSortJob;