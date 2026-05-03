import { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { ApplicationTable } from './AplicationTable';
import { AddApplicationModal } from './AddAplication';
import FeatureButton from './FeatureButton';
import type { JobApplication } from '../types/application';
import { apiClient } from '../services/api';

export function Applications() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [editingApplication, setEditingApplication] = useState<JobApplication | undefined>();
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

  const filteredApplications = applications.filter(app => {
    const query = searchQuery.toLowerCase();
    return (app.company?.toLowerCase() || '').includes(query) ||
           (app.role?.toLowerCase() || '').includes(query) ||
           statusFilter === 'All' || app.status === statusFilter;
  });

  const handleAddApplication = async (newApp: any) => {
    try {
      await apiClient.createJob(newApp);
      await fetchData();
      setIsModalOpen(false);
    } catch (e) { alert("Save failed"); }
  };

  const handleEditApplication = async (updatedApp: any) => {
    try {
      await apiClient.updateJob(updatedApp.id, updatedApp);
      await fetchData();
      setIsModalOpen(false);
    } catch (e) { alert("Update failed"); }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm("Delete this?")) return;
    try {
      await apiClient.deleteApplication(id);
      setApplications(applications.filter(a => a.id !== id));
    } catch (e) { alert("Delete failed"); }
  };

  const toggleFollowUp = async (id: string) => {
    const app = applications.find(a => a.id === id);
    if (app) {
      handleEditApplication({ ...app, followUp: !app.followUp });
    }
  };

  if (isLoading) return <div className="p-10 text-center">Syncing with database...</div>;

  return (
    <div style={{ padding: '30px', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
       {/* Track Job Section */}
       <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white', padding: '40px', borderRadius: '12px', marginBottom: '30px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: 'bold' }}>Track Your Job</h2>
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '500px' }}>
          <button onClick={() => setIsModalOpen(true)} className="w-full rounded-lg bg-gray-900 text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors">
            Add New Application
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="surface p-5 rounded-xl border border-gray-200 mb-5">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
          <div className="flex items-center gap-4">
             <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border rounded-lg">
                <option value="All">All Status</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Rejected">Rejected</option>
             </select>
             <div className="flex gap-2">
                <FeatureButton label="All" onClick={() => setStatusFilter('All')} progress={100} />
                <FeatureButton label="Applied" onClick={() => setStatusFilter('Applied')} progress={Math.round((applications.filter(a => a.status === 'Applied').length / (applications.length || 1)) * 100)} />
             </div>
          </div>
        </div>
      </div>

      <div className="surface rounded-xl border border-gray-200 overflow-hidden">
        <ApplicationTable
          applications={filteredApplications}
          onEdit={openEditModal}
          onDelete={handleDeleteApplication}
          onToggleFollowUp={toggleFollowUp} 
        />
      </div>

      <AddApplicationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingApplication ? handleEditApplication : handleAddApplication}
        application={editingApplication}
      />
    </div>
  );
}
