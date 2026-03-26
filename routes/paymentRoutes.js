const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const supabase = require('../config/supabase');

const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) ? new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
}) : null;

router.post('/create-order', async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ error: 'Razorpay keys missing in .env (Needs Secret Key)' });
    }
    
    // Convert price to minimum currency unit (Paise for INR)
    const options = {
      amount: parseInt(req.body.amount) * 100,
      currency: "INR",
      receipt: `rs_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };
    
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ error: "Failed to create order. Verify API keys." });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, session_id } = req.body;
    
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                               .update(sign.toString())
                               .digest("hex");

    if (razorpay_signature === expectedSign) {
       // Payment valid! Automatically activate the escrow session in database
       if (session_id) {
         await supabase.from('sessions')
           .update({ status: 'Accepted', is_paid: true })
           .eq('id', session_id);
       }
       res.json({ success: true, message: "Payment verified successfully!" });
    } else {
       res.status(400).json({ success: false, message: "Invalid digital signature." });
    }
  } catch (err) {
    console.error("Verification Error:", err);
    res.status(500).json({ error: "Internal Verification Error" });
  }
});

module.exports = router;
