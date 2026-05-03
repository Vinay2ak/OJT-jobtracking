import { useState, useEffect } from 'react'; // Added useEffect
import { Search, Filter, Download } from 'lucide-react';
import { ApplicationTable } from './AplicationTable';
import { AddApplicationModal } from './AddAplication';
import FeatureButton from './FeatureButton';
import type { JobApplication } from '../types/application';
import { apiClient } from '../services/api'; // Import our new apiClient

export function Applications() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [editingApplication, setEditingApplication] = useState<JobApplication | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. FETCH JOBS FROM BACKEND ON LOAD
  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await apiClient.getApplications();
        setApplications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load applications", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadJobs();
  }, []);

  const filteredApplications = applications.filter(app => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (app.company?.toLowerCase() || '').includes(query) ||
      (app.role?.toLowerCase() || '').includes(query) ||
      (app.fullName?.toLowerCase() || '').includes(query);

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 2. SAVE NEW JOB TO BACKEND
  const handleAddApplication = async (newApp: any) => {
    try {
      const savedApp = await apiClient.createJob(newApp);
      // Refresh list from backend to ensure data integrity
      const updatedList = await apiClient.getApplications();
      setApplications(updatedList);
      setIsModalOpen(false);
    } catch (error) {
      alert("Error saving job. Please check your internet connection.");
    }
  };

  // 3. UPDATE JOB IN BACKEND
  const handleEditApplication = async (updatedApp: any) => {
    try {
      await apiClient.updateJob(updatedApp.id, updatedApp);
      const updatedList = await apiClient.getApplications();
      setApplications(updatedList);
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to update application");
    }
  };

  // 4. DELETE FROM BACKEND
  const handleDeleteApplication = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      await apiClient.deleteApplication(id);
      setApplications(applications.filter(app => app.id !== id));
    } catch (error) {
      alert("Failed to delete application");
    }
  };

  const exportCSV = (items: JobApplication[]) => {
    // ... CSV logic stays the same ...
    if (!items || items.length === 0) return;
    const headers = ['id','fullName','email','platform','company','role','status','interviewDate','meetingLink'];
    const rows = items.map(it => headers.map(h => {
      const v = it[h as keyof JobApplication];
      return v === undefined || v === null ? '' : String(v).replace(/"/g, '""');
    }).map(cell => `"${cell}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications_export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openEditModal = (app: JobApplication) => {
    setEditingApplication(app);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingApplication(undefined);
  };

  if (isLoading) {
    return <div className="p-10 text-center">Loading your applications...</div>;
  }

  return (
    <div style={{ padding: '30px', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      {/* Header section remains the same */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        padding: '40px',
        borderRadius: '12px',
        marginBottom: '30px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: 'bold' }}>Track Your Job</h2>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '24px' }}>
          Your applications are now synced with the database
        </p>
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '500px' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full rounded-lg bg-gray-900 text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors"
          >
            Add New Application
          </button>
        </div>
      </div>

      {/* Filters, Table, and Modal logic now use the backend-synced state */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        border: '1px solid var(--border)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', width: '20px', height: '20px', color: '#64748b', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by company, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 44px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter style={{ width: '20px', height: '20px', color: '#64748b' }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'var(--bg-surface)' }}
            >
              <option value="All">All Status</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Rejected">Rejected</option>
              <option value="Offer">Offer</option>
            </select>
            
            {/* Export CSV */}
            <button onClick={() => exportCSV(filteredApplications)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 8 }}>
              <Download style={{ width: 16, height: 16 }} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          Showing {filteredApplications.length} of {applications.length} applications (Live from Database)
        </p>
      </div>

      <div style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <ApplicationTable
          applications={filteredApplications}
          onEdit={openEditModal}
          onDelete={handleDeleteApplication}
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
