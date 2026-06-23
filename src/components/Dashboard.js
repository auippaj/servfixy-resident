import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import SubmitRequest from './SubmitRequest';
import RequestCard from './RequestCard';

const API_URL = process.env.REACT_APP_API_URL;
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

function Dashboard({ resident, token, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);
  const [rvcData, setRvcData] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/residents/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.requests) {
        setRequests(data.requests);
        if (!activeRequest && data.requests.length > 0) {
          setActiveRequest(data.requests[0]);
        } else if (activeRequest) {
          const updated = data.requests.find(r => r.id === activeRequest.id);
          if (updated) setActiveRequest(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  }, [token, activeRequest]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const channel = supabase
      .channel('resident-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, () => { fetchRequests(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'touchpoints' }, () => { fetchRequests(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchRequests]);

  const handleNewRequest = (newRequest, rvc) => {
    setRvcData({ request: newRequest, rvc });
    fetchRequests();
  };

  const [showRequests, setShowRequests] = useState(false);

  const openRequests = requests.filter(r => !['Completed', 'Closed'].includes(r.status));
  const pastRequests = requests.filter(r => ['Completed', 'Closed'].includes(r.status));

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ background: '#1B3A6B', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>ServiFix</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginTop: '2px' }}>
            {resident.property_name} · Unit {resident.unit_number}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '500', color: '#fff' }}>
            {resident.name.split(' ').map(n => n[0]).join('')}
          </div>
          <button
            onClick={onLogout}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', padding: '6px 10px' }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {rvcData && (
          <div style={{ background: '#1B3A6B', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', color: '#fff' }}>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#14B8A6', marginBottom: '4px' }}>Request received!</div>
            <div style={{ fontSize: '13px', opacity: 0.75, marginBottom: '1rem' }}>Show this code to your technician at the door.</div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.1em', opacity: 0.6, textTransform: 'uppercase' }}>Your verification code</div>
              <div style={{ fontSize: '36px', fontWeight: '500', letterSpacing: '0.06em', margin: '6px 0' }}>
                SERV<br />{rvcData.rvc}
              </div>
            </div>
            <button
              onClick={() => setRvcData(null)}
              style={{ marginTop: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', color: '#fff', fontSize: '13px', padding: '8px 16px', width: '100%' }}
            >
              Dismiss
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1rem' }}>

          <div>
            <button
              onClick={() => setShowRequests(!showRequests)}
              style={{ width: '100%', background: '#1B3A6B', border: 'none', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>📋</span>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>My Requests</span>
                {openRequests.length > 0 && (
                  <span style={{ background: '#14B8A6', color: '#fff', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px' }}>
                    {openRequests.length} active
                  </span>
                )}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px' }}>{showRequests ? '▲' : '▼'}</span>
            </button>

            {showRequests && (
              <div>
                {loading ? (
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '13px', border: '1px solid #e5e7eb' }}>
                    Loading...
                  </div>
                ) : openRequests.length === 0 ? (
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '2rem', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>No active requests</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Submit a new request to get started.</div>
                  </div>
                ) : (
                  openRequests.map(r => (
                    <RequestCard
                      key={r.id}
                      request={r}
                      active={activeRequest && activeRequest.id === r.id}
                      onClick={() => setActiveRequest(r)}
                    />
                  ))
                )}

                {pastRequests.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>Past requests</div>
                    {pastRequests.map(r => (
                      <RequestCard
                        key={r.id}
                        request={r}
                        active={activeRequest && activeRequest.id === r.id}
                        onClick={() => setActiveRequest(r)}
                        past
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '10px' }}>Submit a request</div>
            <SubmitRequest token={token} resident={resident} onSubmit={handleNewRequest} />
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;