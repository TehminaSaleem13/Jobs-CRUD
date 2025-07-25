const JobDetails = ({ job, onClose, onEdit, onDelete }) => {
    if (!job) return null;

    const formatTags = (tags) => {
        if (!tags) return [];
        return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    };

    const handleApply = () => {
        alert('Apply functionality will be implemented soon!');
    };

    return (
        <div className="job-details-overlay" onClick={onClose}>
            <div className="job-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="job-details-header">
                    <div className="job-details-title-section">
                        <h2 className="job-details-title">{job.title}</h2>
                        <p className="job-details-company">{job.company}</p>
                    </div>
                    <button
                        className="job-details-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                <div className="job-details-content">
                    <div className="job-details-section">
                        <h3>Job Information</h3>
                        <div className="job-details-grid">
                            <div className="job-detail-item">
                                <label>Location:</label>
                                <span>{job.location}</span>
                            </div>
                            <div className="job-detail-item">
                                <label>Job Type:</label>
                                <span className="job-type-badge">{job.job_type}</span>
                            </div>
                            {job.posting_date && (
                                <div className="job-detail-item">
                                    <label>Posted:</label>
                                    <span>{job.posting_date}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {job.summary && (
                        <div className="job-details-section">
                            <h3>Job Summary</h3>
                            <div className="job-summary">
                                <p>{job.summary}</p>
                            </div>
                        </div>
                    )}

                    {formatTags(job.tags).length > 0 && (
                        <div className="job-details-section">
                            <h3>Skills & Tags</h3>
                            <div className="job-tags-list">
                                {formatTags(job.tags).map((tag, index) => (
                                    <span key={index} className="job-tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}


                </div>

                <div className="job-details-actions">
                    <div className="job-details-primary-actions">
                        <button
                            className="btn btn-primary btn-large"
                            onClick={handleApply}
                        >
                            Apply to this Job
                        </button>
                    </div>

                    <div className="job-details-secondary-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={onEdit}
                        >
                            Edit Job
                        </button>
                        <button
                            className="btn btn-danger"
                            onClick={onDelete}
                        >
                            Delete Job
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;