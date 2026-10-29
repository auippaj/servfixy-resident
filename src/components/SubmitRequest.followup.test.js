import React from 'react';
import { render, screen } from '@testing-library/react';
import SubmitRequest from './SubmitRequest';

jest.mock('./FloorplanPicker', () => () => null);

const props = { token: 't', resident: { unit_number: '101', property_name: 'X' }, onSubmit: () => {}, onBack: () => {} };

test.each([
  ['today', /We'll follow up today\./],
  ['next_business_day', /We'll follow up the next business day\./],
])('shows the server follow-up (%s), never "within 1 hour"', async (value, re) => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ follow_up: value }) }));
  render(<SubmitRequest {...props} />);
  await screen.findByText(re);
  expect(screen.queryByText(/within 1 hour/)).toBeNull();
});

test('if the server cannot be reached it says the cautious one', async () => {
  global.fetch = jest.fn(() => Promise.reject(new Error('down')));
  render(<SubmitRequest {...props} />);
  await screen.findByText(/We'll follow up the next business day\./);
});
