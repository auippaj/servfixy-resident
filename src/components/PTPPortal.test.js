import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PTPPortal from './PTPPortal';

jest.mock('./MicTextarea', () => (props) => <textarea aria-label="notes" value={props.value} onChange={e => props.onChange(e.target.value)} />);

const OPEN = {
  state: 'open', message: null, balance: 900, dates: ['2026-10-13', '2026-10-14', '2026-10-15'],
  methods: ['Online Portal', 'Check', 'Money Order', 'Cashiers Check', 'ACH'], max_installments: 3,
  window: { start: '2026-10-13', end: '2026-10-20', open: true },
};

function mockServer(info, submitResponse) {
  const calls = [];
  global.fetch = jest.fn((url, opts) => {
    calls.push({ url, opts });
    const json = (body, ok = true, status = 200) => Promise.resolve({ ok, status, json: () => Promise.resolve(body) });
    if (url.includes('available-dates')) return json(info);
    if (url.includes('my-requests')) return json({ requests: [] });
    if (url.includes('/submit')) return submitResponse ? json(submitResponse.body, submitResponse.ok !== false, submitResponse.status || 200) : json({ success: true });
    return json({});
  });
  return calls;
}

test('open: shows the ledger balance read-only, only offered dates and methods, no cash, no amount box', async () => {
  mockServer(OPEN);
  render(<PTPPortal token="t" />);
  await screen.findByText('$900.00');
  expect(screen.getByText(/by October 20/)).toBeTruthy();
  expect(screen.getAllByRole('button').filter(b => /Oct 1[345]/.test(b.textContent))).toHaveLength(3);
  expect(screen.getByText('ACH')).toBeTruthy();
  expect(screen.queryByText('Cash')).toBeNull();
  expect(screen.queryByText('Other')).toBeNull();
  expect(screen.queryByPlaceholderText('0.00')).toBeNull();
});

test('submit sends only choices, never an amount, unit or property', async () => {
  const calls = mockServer(OPEN);
  render(<PTPPortal token="t" />);
  await screen.findByText('$900.00');
  fireEvent.click(screen.getByText(/Oct 14/));
  fireEvent.click(screen.getByText('ACH'));
  fireEvent.click(screen.getByText(/Submit Request/));
  await waitFor(() => expect(calls.some(c => c.url.includes('/submit'))).toBe(true));
  const body = JSON.parse(calls.find(c => c.url.includes('/submit')).opts.body);
  expect(body).toEqual({ request_type: 'ptp', requested_date: '2026-10-14', payment_method: 'ACH', notes: null, installments: null });
});

test('plan: must add up to the balance before it is sent; split evenly fixes it', async () => {
  const calls = mockServer(OPEN);
  render(<PTPPortal token="t" />);
  await screen.findByText('$900.00');
  fireEvent.click(screen.getByText('Payment Plan'));
  const selects = screen.getAllByRole('combobox');
  fireEvent.change(selects[0], { target: { value: '2026-10-13' } });
  fireEvent.change(selects[1], { target: { value: '2026-10-15' } });
  fireEvent.click(screen.getByText('ACH'));
  fireEvent.click(screen.getByText(/Submit Request/));
  await screen.findByText(/Please complete every payment/);
  fireEvent.click(screen.getByText('Split evenly'));
  await screen.findByText('Adds up to your balance');
  fireEvent.click(screen.getByText(/Submit Request/));
  await waitFor(() => expect(calls.some(c => c.url.includes('/submit'))).toBe(true));
  const body = JSON.parse(calls.find(c => c.url.includes('/submit')).opts.body);
  expect(body.installments).toEqual([{ date: '2026-10-13', amount: '450.00' }, { date: '2026-10-15', amount: '450.00' }]);
});

test('routed (after the 20th): neutral message, no form, no reason shown', async () => {
  mockServer({ ...OPEN, state: 'routed', reason: 'routed', dates: [], balance: null, message: 'This request will be handled by our accounts team. Please contact the office if you have questions.' });
  render(<PTPPortal token="t" />);
  await screen.findByText(/^This request will be handled by our accounts team/);
  expect(screen.queryByText(/Submit Request/)).toBeNull();
  expect(screen.queryByText(/bankruptcy|hold/i)).toBeNull();
});

test('blocked and no_balance show their message and no form', async () => {
  mockServer({ ...OPEN, state: 'blocked', message: 'You already have a payment promise or request in progress.' });
  const { unmount } = render(<PTPPortal token="t" />);
  await screen.findByText(/already have a payment promise/);
  expect(screen.queryByText(/Submit Request/)).toBeNull();
  unmount();
  mockServer({ ...OPEN, state: 'no_balance', message: 'We do not show a balance that needs a payment promise.' });
  render(<PTPPortal token="t" />);
  await screen.findByText(/do not show a balance/);
});

test('server says routed on submit: shows the neutral notice', async () => {
  mockServer(OPEN, { body: { success: true, routed: true, message: 'x' } });
  render(<PTPPortal token="t" />);
  await screen.findByText('$900.00');
  fireEvent.click(screen.getByText(/Oct 14/));
  fireEvent.click(screen.getByText('ACH'));
  fireEvent.click(screen.getByText(/Submit Request/));
  await waitFor(() => expect(global.fetch.mock.calls.filter(c => c[0].includes('available-dates')).length).toBeGreaterThan(1));
});

test('load failure offers Try again instead of a stuck spinner', async () => {
  global.fetch = jest.fn(() => Promise.reject(new Error('down')));
  render(<PTPPortal token="t" />);
  await screen.findByText('Try again');
});

test('server error on submit is shown to the resident', async () => {
  mockServer(OPEN, { ok: false, status: 400, body: { error: 'Please choose one of the available dates.' } });
  render(<PTPPortal token="t" />);
  await screen.findByText('$900.00');
  fireEvent.click(screen.getByText(/Oct 14/));
  fireEvent.click(screen.getByText('ACH'));
  fireEvent.click(screen.getByText(/Submit Request/));
  await screen.findByText('Please choose one of the available dates.');
});
