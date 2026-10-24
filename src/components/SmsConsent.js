import React from 'react';

// Public page (no login) documenting how Servfixy collects SMS opt-in consent.
// The consent wording here must match the checkbox on the resident sign-in page word for word.
const link = { color: '#0f766e', textDecoration: 'underline' };
const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '16px' };
const h2 = { fontSize: '16px', fontWeight: '700', color: '#1B3A6B', margin: '0 0 8px' };
const p = { fontSize: '14px', color: '#374151', lineHeight: 1.55, margin: '0 0 8px' };

function SmsConsent() {
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '32px 16px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', color: '#1B3A6B', margin: '0 0 4px' }}>Servfixy SMS Text Message Program</h1>
        <p style={{ ...p, color: '#6b7280' }}>How residents opt in to receive text messages from Servfixy, sent on behalf of their community. Each message begins with the community's name.</p>

        <div style={card}>
          <h2 style={h2}>Who receives messages and why</h2>
          <p style={p}>
            Residents of communities that use Servfixy for maintenance. Messages are limited to updates about the
            resident's own maintenance requests and appointment confirmations (for example: request received,
            technician assigned, technician on the way, work completed, and a short satisfaction survey).
            Servfixy does not send marketing or promotional messages.
          </p>
        </div>

        <div style={card}>
          <h2 style={h2}>How a resident opts in</h2>
          <p style={p}>
            1. The resident signs in to the Servfixy Resident Portal at <strong>https://servfixy-resident.vercel.app</strong>.<br />
            2. To report a maintenance problem, the resident opens the request form, which has an optional
            <strong> Mobile number</strong> field.<br />
            3. Below that field is a checkbox, <strong>unchecked by default</strong>. Text updates are sent only if the
            resident enters a mobile number and selects the checkbox. Submitting a request does <strong>not</strong>{' '}
            require it.<br />
            4. The resident's choice is saved with the request, with the date and time, and Servfixy sends text updates
            for that request only when consent was given.
          </p>
          <p style={{ ...p, fontWeight: '700', color: '#111827', marginTop: '12px' }}>Consent wording shown to the resident, next to the mobile number field:</p>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#ecfdf5', border: '1px solid #99f6e4', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#134e4a', lineHeight: 1.5 }}>
            <input type="checkbox" disabled checked={false} readOnly style={{ marginTop: '3px' }} aria-label="Example of the unchecked consent checkbox" />
            <span>
              <strong>Optional:</strong> I agree to receive SMS text notifications from Servfixy, on behalf of my community, about this maintenance
              request and appointment confirmations. Message frequency varies (typically 1-5 messages per work order).
              Message and data rates may apply. Reply <strong>STOP</strong> to opt out at any time, <strong>HELP</strong> for
              assistance. Mobile information will not be shared with third parties for marketing. See our{' '}
              <a href="https://servfixy.com/privacy" style={link}>Privacy Policy</a> and{' '}
              <a href="https://servfixy.com/terms" style={link}>Terms of Use</a>.
            </span>
          </label>
          <p style={{ ...p, color: '#6b7280', marginTop: '8px', fontSize: '12px' }}>
            Illustration of the checkbox shown on the request form. It is the same wording residents see.
          </p>
        </div>

        <div style={card}>
          <h2 style={h2}>Example messages</h2>
          <p style={p}><strong>Enrollment confirmation:</strong> Crestview at Midtown: You are now enrolled to receive property maintenance notifications including work order updates and appointment confirmations. Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for assistance.</p>
          <p style={p}><strong>Opt-out reply:</strong> You have successfully been unsubscribed. You will not receive any more messages from this number. Reply START to resubscribe.</p>
          <p style={p}><strong>Help reply:</strong> Reply STOP to unsubscribe. Msg&amp;Data Rates May Apply.</p>
        </div>

        <div style={card}>
          <h2 style={h2}>Your choices and policies</h2>
          <p style={p}>
            Reply <strong>STOP</strong> at any time to stop receiving texts, or <strong>HELP</strong> for help. You can also
            email <a href="mailto:support@servfixy.com" style={link}>support@servfixy.com</a>. Mobile numbers and SMS
            opt-in data are never shared with third parties or affiliates for marketing or promotional purposes.
          </p>
          <p style={p}>
            <a href="https://servfixy.com/privacy" style={link}>Privacy Policy</a> ·{' '}
            <a href="https://servfixy.com/terms" style={link}>Terms of Use</a>
          </p>
        </div>

        <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>Servfixy Inc.</p>
      </div>
    </div>
  );
}

export default SmsConsent;
