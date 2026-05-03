// @ts-nocheck
import { useState, useEffect } from 'react';
import { Search, Filter, Download, AlertCircle } from 'lucide-react';
import { ApplicationTable } from './AplicationTable.tsx';
import { AddApplicationModal } from './AddAplication';
import FeatureButton from './FeatureButton';
import { apiClient } from '../services/api';

export function Applications() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [applications, setApplications] = useState([]);
  const [editingApplication, setEditingApplication] = useState(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // New state for the custom delete popup
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await apiClient.getApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const filteredApplications = (applications || []).filter(app => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (app.company || '').toLowerCase().includes(query) || 
                         (app.role || '').toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddApplication = async (newApp: any) => {
    try {
      await fetchData(); 
      console.log("Job added successfully.");
    } catch (error) {
      console.error("Error updating list", error);
    }
  };

  const handleEditApplication = async (updatedApp) => {
    try {
      await apiClient.updateJob(updatedApp.id, updatedApp);
      fetchData();
      setIsModalOpen(false);
    } catch (e) { 
      alert("Update failed"); 
    }
  };

  // Triggers the custom popup instead of window.confirm
  const handleDeleteApplication = (id: any) => {
    setDeleteId(id);
  };

  // The actual deletion logic called when you click "Yes, Delete"
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await apiClient.deleteApplication(deleteId);
      await fetchData();
      setDeleteId(null);
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete application.");
      setDeleteId(null);
    }
  };

  if (isLoading) return <div style={{padding: '50px', textAlign: 'center'}}>Syncing with Database...</div>;

  return (
    <div style={{ padding: '30px', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '40px', borderRadius: '12px', marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: 'bold' }}>Track Your Job</h2>
        <button 
          onClick={() => setIsModalOpen(true)} 
          style={{ background: '#111', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Add New Application
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Search company or role..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} 
        />
      </div>

      <ApplicationTable
        applications={filteredApplications}
        onEdit={(app) => { setEditingApplication(app); setIsModalOpen(true); }}
        onDelete={handleDeleteApplication}
        onToggleFollowUp={() => {}} 
      />

      <AddApplicationModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingApplication(undefined); }}
        onSubmit={editingApplication ? handleEditApplication : handleAddApplication}
        application={editingApplication}
      />

      {/* Custom Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center border border-slate-200 dark:border-slate-800 transition-all">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Are you sure?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              Do you really want to delete this job application? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
