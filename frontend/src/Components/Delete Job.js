const DeleteJob = ({ job, onConfirm, onCancel, isDeleting }) => {
    if (!job) return null;

    const handleConfirm = () => {
        onConfirm(job.id);
    };

    return (
        <div className="delete-job-overlay">
            <div className="delete-job-modal">
                <div className="delete-job-header">
                    <h3>Delete Job Confirmation</h3>
                </div>

                <div className="delete-job-content">
                    <div className="warning-section">
                        <p>Are you sure you want to delete this job posting?</p>
                    </div>

                    <div className="job-preview">
                        <h4>{job.title}</h4>
                        <p><strong>Company:</strong> {job.company}</p>
                        <p><strong>Location:</strong> {job.location}</p>
                        <p><strong>Type:</strong> {job.job_type}</p>
                    </div>

                    <div className="warning-text">
                        <strong>This action cannot be undone.</strong> The job will be permanently removed from the database.
                    </div>
                </div>

                <div className="delete-job-actions">
                    <button
                        className="btn btn-danger"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete Job'}
                    </button>

                    <button
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export const confirmDeleteJob = (job, onConfirm) => {
    const message = `Are you sure you want to delete this job?\n\nTitle: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\n\nThis action cannot be undone.`;

    if (window.confirm(message)) {
        onConfirm(job.id);
    }
};

export default DeleteJob;