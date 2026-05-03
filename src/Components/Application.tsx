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
        appliedDate: application.appliedDate || '',
        notes: application.notes || '',
        contactPerson: application.contactPerson || '',
        contactEmail: application.contactEmail || '',
        jobUrl: application.jobUrl || '',
        followUp: application.followUp || false,
      });
    }
  }, [application, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...application,
        ...formData,
        id: application?.id || Date.now().toString(),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{application ? 'Edit' : 'Add'} Application</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            className="w-full p-2 border rounded" 
            placeholder="Company" 
            value={formData.company} 
            onChange={e => setFormData({...formData, company: e.target.value})} 
            required 
          />
          <input 
            className="w-full p-2 border rounded" 
            placeholder="Position" 
            value={formData.position} 
            onChange={e => setFormData({...formData, position: e.target.value})} 
            required 
          />
          <select 
            className="w-full p-2 border rounded" 
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value})}
          >
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="rejected">Rejected</option>
          </select>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Saving...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
