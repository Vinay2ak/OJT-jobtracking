// @ts-nocheck
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function AddApplicationModal({ isOpen, onClose, onSubmit, application }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: 'applied',
    location: '',
    salary: '',
    appliedDate: new Date().toISOString().split('T')[0],
    notes: '',
    contactPerson: '',
    contactEmail: '',
    jobUrl: '',
    followUp: false,
  });

  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company || '',
        position: application.position || '',
        status: application.status || 'applied',
        location: application.location || '',
        salary: application.salary || '',
        appliedDate: application.appliedDate || new Date().toISOString().split('T')[0],
        notes: application.notes || '',
        contactPerson: application.contactPerson || '',
        contactEmail: application.contactEmail || '',
        jobUrl: application.jobUrl || '',
        followUp: application.followUp || false,
      });
    } else {
      setFormData({
        company: '',
        position: '',
        status: 'applied',
        location: '',
        salary: '',
        appliedDate: new Date().toISOString().split('T')[0],
        notes: '',
        contactPerson: '',
        contactEmail: '',
        jobUrl: '',
        followUp: false,
      });
    }
  }, [application, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        id: application?.id || Date.now().toString(),
        ...formData,
        lastUpdate: new Date().toISOString().split('T')[0],
      };

      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-950">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {application ? 'Edit Application' : 'Add New Application'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company *</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position *</label>
                <input type="text" name="position" value={formData.position} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status *</label>
                <select name="status" value={formData.status} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offered">Offered</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${isSubmitting ? 'opacity-50' : ''}`}
            >
              {isSubmitting ? 'Saving...' : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
