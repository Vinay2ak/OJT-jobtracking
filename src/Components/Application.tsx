import { useState } from 'react';

import { Search, Filter, Download } from 'lucide-react';
import { ApplicationTable } from './AplicationTable';
import { AddApplicationModal } from './AddAplication';
import FeatureButton from './FeatureButton';
import type { JobApplication } from '../types/application';

export function Applications() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [editingApplication, setEditingApplication] = useState<JobApplication | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddApplication = (newApp: JobApplication) => {
    setApplications([newApp, ...applications]);
  };

  const handleEditApplication = (updatedApp: JobApplication) => {
    setApplications(applications.map(app =>
      app.id === updatedApp.id ? updatedApp : app
    ));
  };

  const handleDeleteApplication = (id: string) => {
    setApplications(applications.filter(app => app.id !== id));
  };

  const toggleFollowUp = (id: string) => {
    setApplications(applications.map(app => app.id === id ? { ...app, followUp: !app.followUp } : app));
  };

  const exportCSV = (items: JobApplication[]) => {
    if (!items || items.length === 0) return;
    const headers = ['id','company','position','status','location','salary','appliedDate','lastUpdate','followUp','contactPerson','contactEmail','jobUrl','notes'];
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



  return (
    <div style={{ padding: '30px', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      {/* Track Job Section */}
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
          Enter your email to track your job applications
        </p>
        <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '500px' }}>
          <input 
            type="email" 
            placeholder="Enter your email address" 
            className="flex-1 rounded-lg border-none px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <button 
            className="rounded-lg bg-gray-900 text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors"
          >
            Track
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        border: '1px solid var(--border)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              width: '20px',
              height: '20px',
              color: '#64748b',
              transform: 'translateY(-50%)'
            }} />
            <input
              type="text"
              placeholder="Search by company, position, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter style={{ width: '20px', height: '20px', color: '#64748b' }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              <option value="all">All Status</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offered">Offered</option>
              <option value="rejected">Rejected</option>
              <option value="accepted">Accepted</option>
            </select>

            {/* Preset buttons with small progress indicators */}
            <div style={{ marginLeft: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
              {(() => {
                const total = applications.length || 1;
                const appliedCount = applications.filter(a => a.status === 'applied').length;
                const interviewingCount = applications.filter(a => a.status === 'interviewing').length;
                const allPct = Math.round((filteredApplications.length / total) * 100);
                const appliedPct = Math.round((appliedCount / total) * 100);
                const interviewingPct = Math.round((interviewingCount / total) * 100);

                return (
                  <>
                    <FeatureButton label="All" onClick={() => { setStatusFilter('all'); setSearchQuery(''); }} progress={allPct} title={`Showing ${filteredApplications.length} of ${applications.length}`} />
                    <FeatureButton label="Applied" onClick={() => setStatusFilter('applied')} progress={appliedPct} title={`${appliedCount} applied`} />
                    <FeatureButton label="Interviewing" onClick={() => setStatusFilter('interviewing')} progress={interviewingPct} title={`${interviewingCount} interviewing`} />
                  </>
                );
              })()}
            </div>

            {/* Export CSV */}
            <button onClick={() => exportCSV(filteredApplications)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 8 }}>
              <Download style={{ width: 16, height: 16 }} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          Showing {filteredApplications.length} of {applications.length} applications
        </p>
      </div>

      {/* Applications Table */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        border: '1px solid var(--border)',
        overflow: 'hidden'
      }}>
        <ApplicationTable
          applications={filteredApplications}
          onEdit={openEditModal}
          onDelete={handleDeleteApplication}
          onToggleFollowUp={toggleFollowUp}
        />
      </div>

      {/* Add/Edit Application Modal */}
      <AddApplicationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingApplication ? handleEditApplication : handleAddApplication}
        application={editingApplication}
      />
    </div>
  );
}