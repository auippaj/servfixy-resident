import React from 'react';

const TOUCH_LABELS = [
  'Request acknowledged',
  'Tech assigned',
  'En route',
  'Completion summary',
  'Survey sent'
];

const STATUS_COLORS = {
  'Submitted': { bg: '#e6f1fb', text: '#185FA5' },
  'Assigned': { bg: '#e6f1fb', text: '#185FA5' },
  'In Progress': { bg: '#faeeda', text: '#633806' },
  'Completed': { bg: '#e1f5ee', text: '#0F6E56' },
  'Closed': { bg: '#f3f4f6', text: '#6b7280' }
};

function RequestCard({ request, active, onClick, past }) {
  const colors = STATUS_COLORS[request.status] || STATUS_COLORS['Submitted'];
  const touchpoints = request.touchpoints || [];
  const firedTouches = touchpoints.map(t => t.touch_number);

  return (
    <div
      onClick={onClick}
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
        <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 8px', borderRadius: '20px', background: colors.bg, color: colors.text, whiteSpace: 'nowrap' }}>
          {request.status}
        </span>
      </div>

      {/* Description */}
      {request.description && (
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {request.description}
        </div>
      )}

      {/* Touch tracker */}
      {!past && (
        <div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>5-touch tracker</div>
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
                    Touch {num} — {label}
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
      {request.rvc_code && !past && (
        <div style={{ marginTop: '10px', background: '#1B3A6B', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Verification code</span>
          <span style={{ fontSize: '16px', fontWeight: '500', color: '#fff', letterSpacing: '0.08em' }}>{request.rvc_code}</span>
        </div>
      )}
    </div>
  );
}

export default RequestCard;