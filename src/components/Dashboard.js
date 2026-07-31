import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import SubmitRequest from './SubmitRequest';
import RequestCard from './RequestCard';

const API_URL = process.env.REACT_APP_API_URL;
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const PAST_STATUSES = ['completed', 'Completed', 'closed', 'Closed', 'resident_confirmed'];

function Dashboard({ resident, token, onLogout }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);
  const [rvcData, setRvcData] = useState(null);
  const [pendingSurvey, setPendingSurvey] = useState(null);
  const [activeTab, setActiveTab] = useState('requests');
  const [videoRoom, setVideoRoom] = useState(null);
  const videoRef = useRef(null); // eslint-disable-line no-unused-vars

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/residents/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.requests) {
        setRequests(data.requests);
        setActiveRequest(prev => {
          if (!prev) return data.requests.length > 0 ? data.requests[0] : null;
          const updated = data.requests.find(r => r.id === prev.id);
          return updated || prev;
        });
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  useEffect(() => {
    const channel = supabase
      .channel('resident-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, () => { fetchRequests(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'touchpoints' }, () => { fetchRequests(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!resident?.id) return;
    fetch(`${API_URL}/api/surveys/pending/${resident.id}`)
      .then(r => r.json())
      .then(data => { if (data.pending) setPendingSurvey(data.survey); })
      .catch(() => {});
  }, [resident]);

  useEffect(() => {
    const handleVideoCall = async (e) => {
      const { requestId } = e.detail;
      try {
        const res = await fetch(`${API_URL}/api/video/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ serviceRequestId: requestId, techId: 'resident', techName: resident.name })
        });
        const data = await res.json();
        setVideoRoom({ token: data.token, roomName: data.roomName, requestId });
      } catch (err) {
        alert('Could not connect to video call.');
      }
    };
    window.addEventListener('resident-video-call', handleVideoCall);
    return () => window.removeEventListener('resident-video-call', handleVideoCall);
  }, [token, resident.name]);

  const handleNewRequest = (newRequest, rvc) => {
    setRvcData({ request: newRequest, rvc });
    fetchRequests();
    setActiveTab('requests');
  };

  const openRequests = requests.filter(r => !PAST_STATUSES.includes(r.status));
  const pastRequests = requests.filter(r => PAST_STATUSES.includes(r.status));

  const initials = resident.name ? resident.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'R';

  const navItems = [
    { key: 'requests', label: 'My Requests', icon: '📋' },
    { key: 'submit', label: 'New Request', icon: '➕' },
    { key: 'history', label: 'History', icon: '🕐' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F0F4F8', fontFamily: 'Arial, sans-serif' }}>

      {/* Left Sidebar */}
      <div style={{ width: '240px', minWidth: '240px', backgroundColor: '#1B3A6B', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 100 }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <img src="https://i.imgur.com/OKIqq0K.png" alt="Servfixy" style={{ width: '160px', height: 'auto' }} />
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '4px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Resident Portal</div>
        </div>

        {/* Resident info */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>{resident.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Unit {resident.unit_number}</div>
            </div>
          </div>
          <div style={{ marginTop: '10px', background: 'rgba(255,255,255,0.07)', borderRadius: '6px', padding: '8px 10px' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Property</div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginTop: '2px' }}>{resident.property_name}</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {navItems.map(item => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginBottom: '2px',
                  backgroundColor: isActive ? 'rgba(20,184,166,0.15)' : 'transparent',
                  color: isActive ? '#14B8A6' : 'rgba(255,255,255,0.65)',
                  fontSize: '13px', fontWeight: isActive ? '600' : '400',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: '15px' }}>{item.icon}</span>
                {item.label}
                {item.key === 'requests' && openRequests.length > 0 && (
                  <span style={{ marginLeft: 'auto', backgroundColor: '#14B8A6', color: '#fff', borderRadius: '10px', fontSize: '10px', fontWeight: '700', padding: '2px 7px' }}>
                    {openRequests.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sign out */}
        <div style={{ padding: '16px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={onLogout}
            style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: '240px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Top header bar */}
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 28px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <div>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
              {activeTab === 'requests' && 'My Requests'}
              {activeTab === 'submit' && 'Submit a Request'}
              {activeTab === 'history' && 'Request History'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Live updates active</span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, padding: '28px' }}>

          {/* Survey banner */}
          {pendingSurvey && (
            <div
              onClick={() => window.location.href = `/survey?id=${pendingSurvey.service_request_id}`}
              style={{ background: 'linear-gradient(135deg, #0F2A52, #1B3A6B)', borderRadius: '12px', padding: '16px 22px', marginBottom: '20px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 16px rgba(15,42,82,0.2)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '26px' }}>⭐</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#14B8A6', marginBottom: '2px' }}>How did we do?</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Your recent service request is complete. Rate your experience — takes 30 seconds.</div>
                </div>
              </div>
              <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.4)', marginLeft: '12px' }}>›</span>
            </div>
          )}

          {/* RVC card */}
          {rvcData && (
            <div style={{ background: '#fff', border: '2px solid #14B8A6', borderRadius: '12px', padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Request submitted!</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Show this verification code to your technician at the door.</div>
              </div>
              <div style={{ background: '#F0F4F8', borderRadius: '10px', padding: '14px 24px', textAlign: 'center', minWidth: '140px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Verification code</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#1B3A6B', letterSpacing: '0.06em' }}>SERV<br />{rvcData.rvc}</div>
              </div>
              <button onClick={() => setRvcData(null)} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', color: '#6b7280', fontSize: '12px', padding: '6px 12px', cursor: 'pointer' }}>Dismiss</button>
            </div>
          )}

          {/* REQUESTS TAB */}
          {activeTab === 'requests' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', alignItems: 'start' }}>
              {/* Request list */}
              <div>
                {loading ? (
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#9ca3af', border: '1px solid #e5e7eb' }}>Loading...</div>
                ) : openRequests.length === 0 ? (
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '48px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>No active requests</div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>All clear! Submit a new request if something needs attention.</div>
                    <button onClick={() => setActiveTab('submit')} style={{ marginTop: '16px', background: '#1B3A6B', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Submit a Request</button>
                  </div>
                ) : (
                  openRequests.map(r => (
                    <RequestCard key={r.id} request={r} active={activeRequest && activeRequest.id === r.id} onClick={() => setActiveRequest(r)} />
                  ))
                )}
              </div>

              {/* Quick submit panel */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '10px' }}>Quick submit</div>
                <SubmitRequest token={token} resident={resident} onSubmit={handleNewRequest} />
              </div>
            </div>
          )}

          {/* SUBMIT TAB */}
          {activeTab === 'submit' && (
            <div style={{ maxWidth: '620px' }}>
              <SubmitRequest token={token} resident={resident} onSubmit={handleNewRequest} />
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div>
              {pastRequests.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '48px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>🕐</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>No past requests</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Completed requests will appear here.</div>
                </div>
              ) : (
                pastRequests.map(r => (
                  <RequestCard key={r.id} request={r} active={activeRequest && activeRequest.id === r.id} onClick={() => setActiveRequest(r)} past />
                ))
              )}
            </div>
          )}

        </div>
      </div>

      {/* Video call overlay */}
      {videoRoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0f1f3d', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#1B3A6B', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>Video Call — Your Technician</span>
            <button onClick={() => setVideoRoom(null)} style={{ background: '#ef4444', border: 'none', borderRadius: '8px', color: '#fff', padding: '8px 16px', fontWeight: '700', cursor: 'pointer' }}>End Call</button>
          </div>
          <ResidentVideoCall token={videoRoom.token} roomName={videoRoom.roomName} onHangUp={() => setVideoRoom(null)} />
        </div>
      )}
    </div>
  );
}

function ResidentVideoCall({ token, roomName, onHangUp }) {
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const roomRef = useRef(null);
  const [connected, setConnected] = useState(false); // eslint-disable-line no-unused-vars

  useEffect(() => {
    let cancelled = false;
    import('twilio-video').then(TwilioVideo => {
      TwilioVideo.connect(token, { name: roomName, audio: true, video: { width: 640 } })
        .then(room => {
          if (cancelled) { room.disconnect(); return; }
          roomRef.current = room;
          setConnected(true);
          room.localParticipant.videoTracks.forEach(pub => {
            if (localRef.current) localRef.current.appendChild(pub.track.attach());
          });
          room.participants.forEach(participant => {
            participant.videoTracks.forEach(pub => {
              if (pub.track && remoteRef.current) remoteRef.current.appendChild(pub.track.attach());
            });
            participant.on('trackSubscribed', track => {
              if (track.kind === 'video' && remoteRef.current) remoteRef.current.appendChild(track.attach());
            });
          });
          room.on('participantConnected', participant => {
            participant.on('trackSubscribed', track => {
              if (track.kind === 'video' && remoteRef.current) remoteRef.current.appendChild(track.attach());
            });
          });
        })
        .catch(() => { if (!cancelled) onHangUp(); });
    });
    return () => {
      cancelled = true;
      if (roomRef.current) { roomRef.current.disconnect(); roomRef.current = null; }
    };
  }, [token, roomName, onHangUp]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', gap: '12px' }}>
      <div ref={remoteRef} style={{ flex: 1, background: '#1a1a2e', borderRadius: '16px', overflow: 'hidden', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Waiting for technician video...</div>
      </div>
      <div ref={localRef} style={{ width: '100px', height: '75px', background: '#1B3A6B', borderRadius: '10px', overflow: 'hidden', alignSelf: 'flex-end', border: '2px solid #14B8A6' }} />
      <button onClick={onHangUp} style={{ width: '100%', background: '#ef4444', border: 'none', borderRadius: '10px', padding: '14px', color: '#fff', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
        End Call
      </button>
    </div>
  );
}

export default Dashboard;
