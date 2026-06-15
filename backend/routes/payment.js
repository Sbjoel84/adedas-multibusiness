const express = require("express");
const axios = require("axios");

const router = express.Router();

// VERIFY PAYMENT
router.get("/verify-payment/:reference", async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data;

    if (data.data.status === "success") {
      return res.json({
        success: true,
        message: "Payment verified",
        data: data.data,
      });
    } else {
      return res.json({
        success: false,
        message: "Payment not successful",
      });
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Verification failed" });
  }
});

// SEND WHATSAPP NOTIFICATION FOR NEW ORDER
router.post("/notify-order", async (req, res) => {
  const { orderNumber, customerName, customerPhone, total, itemCount, paymentMethod, deliveryAddress } = req.body;

  if (!process.env.WHATSAPP_BUSINESS_ID || !process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_ADMIN_PHONE) {
    return res.status(500).json({ error: "WhatsApp notification is not configured." });
  }

  if (!orderNumber || !customerName || typeof total !== "number" || !itemCount) {
    return res.status(400).json({ error: "Missing required order notification payload." });
  }

  const adminPhone = process.env.WHATSAPP_ADMIN_PHONE.replace(/\D/g, "");
  const message = `New order received!\nOrder: ${orderNumber}\nCustomer: ${customerName}\nPhone: ${customerPhone}\nItems: ${itemCount}\nTotal: ₦${total.toFixed(2)}\nPayment: ${paymentMethod}\nDelivery: ${deliveryAddress}`;

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_BUSINESS_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: adminPhone,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("WhatsApp notify-order failed:", error.response?.data || error.message || error);
    return res.status(500).json({ error: "Failed to send WhatsApp notification." });
  }
});

module.exports = router;
