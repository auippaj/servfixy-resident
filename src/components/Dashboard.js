import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [videoRoom, setVideoRoom] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const videoRef = useRef(null);

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

      {/* Resident video call screen */}
      {videoRoom && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0f1f3d', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#1B3A6B', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: '15px' }}>📹 Video Call — Your Technician</span>
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px' }}>
      <div ref={remoteRef} style={{ flex: 1, background: '#1a1a2e', borderRadius: '16px', overflow: 'hidden', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Waiting for technician video...</div>
      </div>
      <div ref={localRef} style={{ width: '100px', height: '75px', background: '#1B3A6B', borderRadius: '10px', overflow: 'hidden', alignSelf: 'flex-end', border: '2px solid #14B8A6' }} />
      <button onClick={onHangUp} style={{ width: '100%', background: '#ef4444', border: 'none', borderRadius: '10px', padding: '14px', color: '#fff', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
        📵 End Call
      </button>
    </div>
  );
}
export default Dashboard;