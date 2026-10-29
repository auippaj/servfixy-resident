import React from 'react';
import LsStatusBanner from './LsStatusBanner';
import { RESIDENT_STATUS, residentStatusKey, isEnRoute, isVisitOver, isStale } from '../residentStatus';

const TOUCH_LABELS = [
  'Request received',
  'Technician assigned',
  'Technician on the way',
  'Work completed',
  'Feedback requested'
];

// What the resident is waiting on next, based on the furthest step reached.
const NEXT_UP = [
  'We are reviewing your request',
  'Waiting for a technician to be assigned',
  'Technician assigned, visit coming up',
  'Technician is on the way',
  'Work is complete, we will ask how it went'
];

function RequestCard({ request, active, onClick, past, token }) {
  const touchpoints = request.touchpoints || [];
  const firedTouches = touchpoints.map(t => t.touch_number);
  const statusInfo = RESIDENT_STATUS[residentStatusKey(request.status)];
  const visitOver = isVisitOver(request.status);
  const enRoute = !past && !visitOver && (isEnRoute(request.status) || (firedTouches.includes(3) && !firedTouches.includes(4)));
  // A technician is on the job only once one is assigned, on the way, or checked in.
  const techAssigned = firedTouches.includes(2) || isEnRoute(request.status) || !!request.tech_checked_in;
  const showCode = !!request.rvc_code && !past && !visitOver && techAssigned;
  const stale = isStale(request, firedTouches, past);

  return (
    <div
      onClick={() => { try { navigator.vibrate && navigator.vibrate([10]); } catch(e){} onClick(); }}
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: active ? '2px solid #14B8A6' : '1px solid #e5e7eb',
        padding: '14px',
        marginBottom: '10px',
        cursor: 'pointer',
        opacity: past ? 0.7 : 1,
        transition: 'border 0.15s'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111' }}>{request.category || request.title || 'Request'}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
            {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 8px', borderRadius: '20px', background: statusInfo.bg, color: statusInfo.text, whiteSpace: 'nowrap' }}>
          {statusInfo.label}
        </span>
      </div>

      {/* En route ETA badge: only while the technician is actually on the way */}
      {enRoute ? (
        <div style={{ background: 'linear-gradient(135deg, #14B8A6, #0F9B85)', borderRadius: '8px', padding: '8px 12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🚗</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'white' }}>Technician is on the way</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>Your verification code is ready to show</div>
          </div>
        </div>
      ) : null}

      {/* Life Safety status (flagged requests only) */}
      {!past && token && request.life_safety_flag && request.ls_flagged_at && <LsStatusBanner request={request} token={token} />}

      {/* Waiting too long with no technician assigned */}
      {stale && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', padding: '8px 12px', marginBottom: '10px', fontSize: '12px', color: '#78350f', lineHeight: 1.5 }}>
          This is taking longer than expected. We are sorry for the wait.
        </div>
      )}

      {/* Description */}
      {request.description && (
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {request.description}
        </div>
      )}

      {/* Touch tracker */}
      {!past && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Progress</div>
            <div style={{ fontSize: '11px', color: '#14B8A6', fontWeight: '600' }}>{firedTouches.length}/5 steps</div>
          </div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#1B3A6B', marginBottom: '8px' }}>
            Right now: {firedTouches.length >= 5 ? 'All done, thank you' : NEXT_UP[Math.max(0, ...firedTouches)]}
          </div>
          <div style={{ height: '4px', background: '#f0f0f0', borderRadius: '2px', marginBottom: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(firedTouches.length/5)*100}%`, background: '#14B8A6', borderRadius: '2px', transition: 'width 0.3s' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {TOUCH_LABELS.map((label, i) => {
              const num = i + 1;
              const fired = firedTouches.includes(num);
              return (
                <div key={num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                    background: fired ? '#14B8A6' : '#e5e7eb'
                  }} />
                  <span style={{ fontSize: '11px', color: fired ? '#374151' : '#9ca3af' }}>
                    {label}
                  </span>
                  {fired && (
                    <span style={{ fontSize: '10px', color: '#14B8A6', marginLeft: 'auto' }}>✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RVC code */}
      {showCode && (
        <div style={{ marginTop: '10px', background: '#1B3A6B', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Verification code</span>
          <span style={{ fontSize: '16px', fontWeight: '500', color: '#fff', letterSpacing: '0.08em' }}>{request.rvc_code}</span>
        </div>
      )}

      {/* Video call button: hidden until a tech is assigned, and again once the visit is over */}
      {!past && !visitOver && techAssigned && (
        <div style={{ marginTop: '10px' }}>
          {request.tech_checked_in ? (
            <button
              onClick={e => { e.stopPropagation(); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('resident-video-call', { detail: { requestId: request.id } })); }}
              style={{ width: '100%', background: '#7c3aed', border: 'none', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              📹 Join Video Call — Tech is Here
            </button>
          ) : (
            <div style={{ width: '100%', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px', color: '#6b7280', fontSize: '12px', textAlign: 'center' }}>
              📹 Video call available when tech checks in
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RequestCard;