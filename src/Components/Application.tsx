// @ts-nocheck
import { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await apiClient.getApplications();
      setApplications(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const filteredApplications = (applications || []).filter(app => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (app.company || '').toLowerCase().includes(query) || (app.role || '').toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // @ts-nocheck
// ... inside your Applications component ...

const handleAddApplication = async (newApp) => {
  try {
    await apiClient.createJob(newApp);
    // 1. Refresh the list
    await fetchData(); 
    // 2. DO NOT call setIsModalOpen(false) here! 
    // This allows the "Done" button to stay on screen.
  } catch (error) {
    alert("Failed to save job");
  }
};


  const handleEditApplication = async (updatedApp) => {
    try {
      await apiClient.updateJob(updatedApp.id, updatedApp);
      fetchData();
      setIsModalOpen(false);
    } catch (e) { alert("Update failed"); }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm("Delete this?")) return;
    try {
      await apiClient.deleteApplication(id);
      fetchData();
    } catch (e) { alert("Delete failed"); }
  };

  if (isLoading) return <div style={{padding: '50px', textAlign: 'center'}}>Syncing with Database...</div>;

  return (
    <div style={{ padding: '30px', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '40px', borderRadius: '12px', marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: 'bold' }}>Track Your Job</h2>
        <button onClick={() => setIsModalOpen(true)} style={{ background: '#111', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Add New Application
        </button>
      </div>

      <div style={{ background: 'var(--bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px' }}>
        <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
      </div>

      <ApplicationTable
        applications={filteredApplications}
        onEdit={(app) => { setEditingApplication(app); setIsModalOpen(true); }}
        onDelete={handleDeleteApplication}
        onToggleFollowUp={(id) => {}} 
      />

      <AddApplicationModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingApplication(undefined); }}
        onSubmit={editingApplication ? handleEditApplication : handleAddApplication}
        application={editingApplication}
      />
    </div>
  );
}
