import React, { useState, useEffect, useCallback } from 'react';
import { jobAPI } from './api';
import AddEditJob from './Components/Add Job';
import DeleteJob from './Components/Delete Job';
import FilterSortJob from './Components/Filter Job';
import Pagination from './Components/Pagination';
import JobDetails from './Components/Job Details';
import { formatTags } from './utils/formatters';
import './App.css';

const JobCard = ({ job, onEdit, onDelete, onJobClick }) => {
  const handleCardClick = (e) => {
    if (e.target.closest('.job-actions')) return;
    onJobClick(job);
  };

  return (
    <div className="job-card" onClick={handleCardClick}>
      <div className="job-card-header">
        <h3 className="job-title">{job.title}</h3>
        <div className="job-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(job);
            }}
          >
            Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(job);
            }}
          >
            Delete
          </button>
        </div>
      </div>
      <div className="job-details">
        <p className="company"><strong>{job.company}</strong></p>
        <p className="location">{job.location}</p>
        <p className="job-type">{job.job_type}</p>
        {job.posting_date && <p className="posting-date">Posted: {job.posting_date}</p>}
        {formatTags(job.tags).length > 0 && (
          <div className="tags">
            <span className="tags-label">Tags:</span>
            <div className="tag-list">
              {formatTags(job.tags).map((tag, i) => <span key={i} className="tag">{tag}</span>)}
            </div>
          </div>
        )}
      </div>
      <div className="click-hint">Click to view details</div>
    </div>
  );
};

const NoJobsFound = ({ hasFilters, onClearFilters }) => (
  <div className="no-jobs">
    <h3>No Jobs Found</h3>
    {hasFilters ? (
      <>
        <p>No jobs match your current filters.</p>
        <button className="btn btn-primary" onClick={onClearFilters}>Clear All Filters</button>
      </>
    ) : (
      <>
        <p>No jobs have been added yet.</p>
        <p>Click "Add New Job" to get started!</p>
      </>
    )}
  </div>
);

const ErrorMessage = ({ error, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="message error">
      <span className="message-icon">Error:</span> {error}
      <button className="message-close" onClick={onClose}>×</button>
    </div>
  );
};

const SuccessMessage = ({ success, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="message success">
      <span className="message-icon">Success:</span> {success}
      <button className="message-close" onClick={onClose}>×</button>
    </div>
  );
};

function App() {
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingJob, setDeletingJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedJob, setSelectedJob] = useState(null);

  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const jobsData = await jobAPI.getAllJobs(filters);
      setFilteredJobs(jobsData);
      setCurrentPage(1);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load jobs. Please try again.';
      setError(errorMessage);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleJobSubmit = async (jobData) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (editingJob) {
        await jobAPI.updateJob(editingJob.id, jobData);
        setSuccess('Job updated successfully!');
      } else {
        await jobAPI.createJob(jobData);
        setSuccess('Job added successfully!');
      }
      setShowForm(false);
      setEditingJob(null);
      fetchJobs();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to save job';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJobDelete = async (jobId) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await jobAPI.deleteJob(jobId);
      setSuccess('Job deleted successfully!');
      setShowDeleteModal(false);
      setDeletingJob(null);
      fetchJobs();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete job';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowForm(true);
  };

  const handleDeleteJob = (job) => {
    setDeletingJob(job);
    setShowDeleteModal(true);
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  const handleCloseJobDetails = () => setSelectedJob(null);

  const handleEditFromDetails = () => {
    if (selectedJob) {
      setEditingJob(selectedJob);
      setShowForm(true);
      setSelectedJob(null);
    }
  };

  const handleDeleteFromDetails = () => {
    if (selectedJob) {
      setDeletingJob(selectedJob);
      setShowDeleteModal(true);
      setSelectedJob(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => setFilters({});

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingJob(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingJob(null);
  };

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const currentJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const hasActiveFilters = Object.values(filters).some(value => value && value.length > 0);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>Job Listing Board</h1>
          <p className="header-subtitle">Find and manage actuarial job opportunities</p>
        </div>
        <button
          className="btn btn-primary btn-large"
          onClick={() => {
            setEditingJob(null);
            setShowForm(true);
          }}
          disabled={loading}
        >
          Add New Job
        </button>
      </header>

      {error && <ErrorMessage error={error} onClose={() => setError('')} />}
      {success && <SuccessMessage success={success} onClose={() => setSuccess('')} />}

      <FilterSortJob
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        jobCount={filteredJobs.length}
        isLoading={loading}
      />

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading jobs...</p>
        </div>
      ) : (
        <main className="jobs-container">
          {filteredJobs.length === 0 ? (
            <NoJobsFound
              hasFilters={hasActiveFilters}
              onClearFilters={handleResetFilters}
            />
          ) : (
            <>
              <div className="jobs-grid">
                {currentJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onEdit={handleEditJob}
                    onDelete={handleDeleteJob}
                    onJobClick={handleJobClick}
                  />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredJobs.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          )}
        </main>
      )}

      {showForm && (
        <AddEditJob
          job={editingJob}
          onSubmit={handleJobSubmit}
          onCancel={handleCloseForm}
          isSubmitting={isSubmitting}
        />
      )}

      {selectedJob && (
        <JobDetails
          job={selectedJob}
          onClose={handleCloseJobDetails}
          onEdit={handleEditFromDetails}
          onDelete={handleDeleteFromDetails}
        />
      )}

      {showDeleteModal && deletingJob && (
        <DeleteJob
          job={deletingJob}
          isDeleting={isSubmitting}
          onConfirm={handleJobDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default App;
