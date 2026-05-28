const express = require('express');
const auth    = require('../middleware/auth');
const db      = require('../db/db');
const router  = express.Router();

router.post('/mpesa/stk-push', auth, async (req, res) => {
  const { phone, amount, listing_id, package_name } = req.body;
  if (!phone || !amount || !listing_id)
    return res.status(400).json({ message: 'phone, amount, listing_id are required' });

  const listing = await db.get('SELECT id FROM listings WHERE id = ? AND user_id = ?', [listing_id, req.user.id]);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });

  if (!process.env.MPESA_CONSUMER_KEY) {
    console.log(`[M-Pesa Sandbox] STK Push: KES ${amount} to ${phone} for listing ${listing_id} (${package_name})`);
    return res.json({
      CheckoutRequestID: `sandbox-${Date.now()}`,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing (sandbox mode)',
      CustomerMessage: 'Success. Request accepted for processing',
      sandbox: true,
    });
  }

  try {
    const credentials = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const tokenRes    = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: { Authorization: `Basic ${credentials}` },
    });
    const { access_token } = await tokenRes.json();

    const timestamp  = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const password   = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
    const cleanPhone = phone.replace(/^0/, '254').replace(/^\+/, '');

    const stkRes = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: cleanPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: cleanPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL || 'https://maeva.co.ke/api/payments/mpesa/callback',
        AccountReference: `Maeva-${listing_id}`,
        TransactionDesc: `Featured listing: ${package_name || 'Boost'}`,
      }),
    });
    res.json(await stkRes.json());
  } catch (err) {
    console.error('[M-Pesa] STK push error:', err.message);
    res.status(502).json({ message: 'Payment service error. Please try again.' });
  }
});

router.post('/mpesa/callback', (req, res) => {
  try {
    const body = req.body?.Body?.stkCallback;
    if (body?.ResultCode === 0) {
      console.log('[M-Pesa] Payment successful. CheckoutRequestID:', body.CheckoutRequestID);
    } else if (body) {
      console.log('[M-Pesa] Payment failed. ResultDesc:', body.ResultDesc);
    }
  } catch (e) {
    console.error('[M-Pesa] Callback error:', e.message);
  }
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

module.exports = router;
