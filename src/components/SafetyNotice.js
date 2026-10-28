import React from 'react';

// Words that suggest a danger to life or property. Used only to show a 911 reminder while the
// resident types. It never blocks or changes a submission; the server's Life Safety check still decides routing.
const EMERGENCY_PATTERN = /\b(smell\w* gas|gas (smell|leak|odor|odour)|rotten egg\w*|natural gas|gas\b(?!\s+(stove|oven|range|dryer|fireplace|grill|log))|fire|smoke|smoking|flood\w*|sparking|sparks|carbon monoxide|electrocut\w*|burning smell|exposed wire\w*)/i;

export const looksLikeEmergency = (text) => EMERGENCY_PATTERN.test(String(text || ''));

// Always-visible reminder for forms that have no footer of their own.
export function Emergency911Notice() {
  return (
    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#4b5563', lineHeight: 1.5 }}>
      <strong style={{ color: '#111827' }}>Call 911 for:</strong> fire, smoke, or gas; a medical emergency or injury; a crime or threat; or electrical danger such as sparking or water near outlets.
    </div>
  );
}

// Red banner that appears when the resident's own words point to an emergency.
export function EmergencyKeywordBanner({ text }) {
  if (!looksLikeEmergency(text)) return null;
  return (
    <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#991b1b', fontWeight: '600', lineHeight: 1.5, marginTop: '8px' }}>
      🚨 If you smell gas, see fire or smoke, or anyone is in danger, call 911 now. You can still send this request.
    </div>
  );
}
