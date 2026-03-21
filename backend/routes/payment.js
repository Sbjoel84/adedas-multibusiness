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

module.exports = router;
