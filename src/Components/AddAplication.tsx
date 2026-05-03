// @ts-nocheck
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (application: any) => void;
  application?: any;
}

export function AddApplicationModal({ isOpen, onClose, onSubmit, application }: AddApplicationModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    platform: 'LinkedIn',
    company: '',
    role: '',
    status: 'Applied',
    emailConsent: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (application) {
        setFormData({
          fullName: application.fullName || '',
          email: application.email || '',
          platform: application.platform || 'LinkedIn',
          company: application.company || '',
          role: application.role || '',
          status: application.status || 'Applied',
          emailConsent: application.emailConsent ?? false,
        });
      } else {
        setFormData({
          fullName: '',
          email: '',
          platform: 'LinkedIn',
          company: '',
          role: '',
          status: 'Applied',
          emailConsent: false,
        });
      }
      setErrors({});
      setSubmitError('');
      setSuccess(false);
    }
  }, [application, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.company.trim()) newErrors.company = 'Company Name is required';
    if (!formData.role.trim()) newErrors.role = 'Job Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? e.target.checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || success) return; // Prevent double trigger
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (application) {
        const updated = await apiClient.updateJob(application.id, formData);
        await onSubmit(updated);
        onClose();
      } else {
        const created = await apiClient.createJob(formData);
        await onSubmit(created); // Updates the table in background
        setSuccess(true); // Shows the "Done" button screen
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {success ? 'Application Saved!' : application ? 'Edit Application' : 'New Application'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!success ? (
            <form id="job-app-form" onSubmit={handleSubmit} className="space-y-5">
              {submitError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {submitError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white outline-none" />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white outline-none" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company *</label>
                  <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role *</label>
                  <input type="text" name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
                  <select name="platform" value={formData.platform} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white outline-none">
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Naukri">Naukri</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-gray-900 dark:text-white outline-none">
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Offer">Offer</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                <input type="checkbox" id="emailConsent" name="emailConsent" checked={formData.emailConsent} onChange={handleChange} className="mt-0.5 h-4 w-4 rounded" />
                <label htmlFor="emailConsent" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  Do you give permission to scan your Gmail for interview updates regarding this job?
                </label>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Job Application Logged!</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Your application to <strong>{formData.company}</strong> has been saved.
                </p>
              </div>
              <button onClick={onClose} className="mt-4 px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                Done
              </button>
            </div>
          )}
        </div>

        {!success && (
          <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-slate-900/50">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button form="job-app-form" type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-70">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {application ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
