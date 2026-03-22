const { Environment, PayPalHttpClient } = require('@paypal/paypal-server-sdk');

class PayPalClient {
  constructor() {
    const environment = this.getEnvironment();
    this.client = new PayPalHttpClient(environment);
  }

  getEnvironment() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_SECRET;
    const baseUrl = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';

    if (!clientId || !clientSecret || clientId === 'your_client_id_here' || clientSecret === 'your_secret_key_here') {
      console.warn('PayPal credentials not properly configured. Using sandbox mode.');
    }

    if (baseUrl === 'https://api-m.paypal.com') {
      return new Environment({
        clientId: clientId || '',
        clientSecret: clientSecret || '',
      });
    } else {
      return new Environment({
        clientId: clientId || '',
        clientSecret: clientSecret || '',
      });
    }
  }

  client() {
    return this.client;
  }
}

module.exports = { PayPalClient };
