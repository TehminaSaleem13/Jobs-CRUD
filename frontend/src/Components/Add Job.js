import React, { useState, useEffect, useRef } from 'react';
import { validateRequiredFields, sanitizeInput } from '../utils/formatters';

const AddEditJob = ({ job, onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        posting_date: '',
        job_type: 'Full-time',
        tags: '',
        summary: ''
    });

    const [errors, setErrors] = useState({});
    const modalRef = useRef(null);
    const formRef = useRef(null);

    useEffect(() => {
        if (job) {
            setFormData({
                title: job.title || '',
                company: job.company || '',
                location: job.location || '',
                posting_date: job.posting_date_raw || '',
                job_type: job.job_type || 'Full-time',
                tags: job.tags || '',
                summary: job.summary || ''
            });
        }
    }, [job]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onCancel();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onCancel]);

    const scrollToError = (firstErrorField) => {
        if (firstErrorField && formRef.current) {
            modalRef.current?.scrollTo({
                top: 0,
                behavior: 'smooth'
            });

            setTimeout(() => {
                const errorElement = document.getElementById(firstErrorField);
                if (errorElement) {
                    errorElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    errorElement.focus();
                }
            }, 300);
        }
    };

    const validateForm = () => {
        const requiredFields = ['title', 'company', 'location'];
        const { errors: validationErrors, firstErrorField } = validateRequiredFields(formData, requiredFields);

        setErrors(validationErrors);

        if (firstErrorField) {
            scrollToError(firstErrorField);
            return false;
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const cleanedData = Object.keys(formData).reduce((acc, key) => {
            acc[key] = sanitizeInput(formData[key]);
            return acc;
        }, {});

        onSubmit(cleanedData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleReset = () => {
        setFormData({
            title: '',
            company: '',
            location: '',
            posting_date: '',
            job_type: 'Full-time',
            tags: '',
            summary: ''
        });
        setErrors({});
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    return (
        <div className="job-form-overlay" onClick={handleOverlayClick}>
            <div className="job-form" ref={modalRef}>
                <button
                    className="close-button-fixed"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    aria-label="Close form"
                    type="button"
                >
                    &times;
                </button>

                <div className="job-form-header">
                    <h2>{job ? 'Edit Job' : 'Add New Job'}</h2>
                </div>

                <div className="job-form-content">
                    <form onSubmit={handleSubmit} ref={formRef}>
                        <div className="form-group">
                            <label htmlFor="title">Job Title *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={errors.title ? 'error' : ''}
                                placeholder="e.g., Senior Actuary"
                                disabled={isSubmitting}
                            />
                            {errors.title && <span className="error-message">{errors.title}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="company">Company *</label>
                            <input
                                type="text"
                                id="company"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className={errors.company ? 'error' : ''}
                                placeholder="e.g., ABC Insurance"
                                disabled={isSubmitting}
                            />
                            {errors.company && <span className="error-message">{errors.company}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">Location *</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className={errors.location ? 'error' : ''}
                                placeholder="e.g., New York, NY or Remote"
                                disabled={isSubmitting}
                            />
                            {errors.location && <span className="error-message">{errors.location}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="job_type">Job Type</label>
                            <select
                                id="job_type"
                                name="job_type"
                                value={formData.job_type}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="posting_date">Posting Date</label>
                            <input
                                type="date"
                                id="posting_date"
                                name="posting_date"
                                value={formData.posting_date}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="summary">Job Summary</label>
                            <textarea
                                id="summary"
                                name="summary"
                                value={formData.summary}
                                onChange={handleChange}
                                placeholder="Brief description of the job role, responsibilities, and requirements..."
                                disabled={isSubmitting}
                                rows={4}
                            />
                            <small className="form-help">
                                Provide a brief overview of the job that will be displayed in the detailed view
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="tags">Tags (comma-separated)</label>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                placeholder="e.g., Life, Health, Pricing, Remote"
                                disabled={isSubmitting}
                            />
                            <small className="form-help">
                                Enter relevant tags separated by commas (e.g., Life, Health, Pricing)
                            </small>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : (job ? 'Update Job' : 'Add Job')}
                            </button>

                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onCancel}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>

                            {!job && (
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={handleReset}
                                    disabled={isSubmitting}
                                >
                                    Reset Form
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddEditJob;