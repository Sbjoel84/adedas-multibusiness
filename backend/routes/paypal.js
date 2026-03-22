const express = require("express");
const { PayPalClient } = require("../lib/paypal"); // We'll create this lib file
const router = express.Router();

// Create order
router.post("/create-order", async (req, res) => {
  try {
    const { totalAmount, currency } = req.body;
    
    // Validate input
    if (!totalAmount || !currency) {
      return res.status(400).json({ error: "Total amount and currency are required" });
    }

    const request = new PayPalClient.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: totalAmount.toString(),
          },
        },
      ],
      application_context: {
        brand_name: "Honey Gold Store",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
      },
    });

    const order = await PayPalClient.client().execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error("Failed to create order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Capture order
router.post("/capture-order", async (req, res) => {
  try {
    const { orderID } = req.body;
    
    if (!orderID) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const request = new PayPalClient.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await PayPalClient.client().execute(request);
    
    // Check if payment is successful
    if (capture.result.status === "COMPLETED") {
      // Here you would typically save the order to your database
      // For now, we'll just return the capture details
      res.json({
        status: "success",
        orderID: capture.result.id,
        purchase_units: capture.result.purchase_units,
        payer: capture.result.payer,
      });
    } else {
      res.status(400).json({ error: "Payment not completed" });
    }
  } catch (err) {
    console.error("Failed to capture order:", err);
    res.status(500).json({ error: "Failed to capture order" });
  }
});

module.exports = router;