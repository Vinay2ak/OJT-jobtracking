// @ts-nocheck
import { useState, useEffect } from 'react';
import { Search, Filter, Download, AlertCircle, CheckCircle } from 'lucide-react'; // Added CheckCircle
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
  
  // Gmail connection state
  const [gmailConnected, setGmailConnected] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchData();
    checkGmailStatus(); // Check Gmail status on load
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

  const checkGmailStatus = async () => {
    try {
      const res = await apiClient.getGmailStatus();
      setGmailConnected(res.is_connected);
    } catch (e) {
      console.error("Failed to fetch Gmail status", e);
    }
  };

  // ... (keep filteredApplications, handleAddApplication, handleEditApplication, etc. the same)

  return (
    <div style={{ padding: '30px', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '40px', borderRadius: '12px', marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: 'bold' }}>Track Your Job</h2>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
          <button 
            onClick={() => setIsModalOpen(true)} 
            style={{ background: '#111', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Add New Application
          </button>

          {/* GMAIL BUTTON ADDED HERE */}
          {!gmailConnected ? (
            <button 
              onClick={() => apiClient.connectGmail()}
              style={{ 
                background: '#fff', 
                color: '#111', 
                padding: '12px 24px', 
                borderRadius: '8px', 
                border: '1px solid #ddd', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '16px', height: '16px' }} />
              Connect Gmail
            </button>
          ) : (
            <div style={{ 
              background: 'rgba(255,255,255,0.2)', 
              color: '#fff', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <CheckCircle style={{ width: '18px', height: '18px' }} />
              Gmail Parsing Active
            </div>
          )}
        </div>
      </div>
      
      {/* ... (rest of the component) */}
    </div>
  );
}
