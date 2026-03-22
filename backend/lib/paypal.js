const { Environment, PayPalHttpClient } = require('@paypal/paypal-server-sdk');

class PayPalClient {
  constructor() {
    const environment = this.getEnvironment();
    this.client = new PayPalHttpClient(environment);
  }

  getEnvironment() {
    const baseUrl = process.env.PAYPAL_BASE_URL;

    if (baseUrl === 'https://api-m.sandbox.paypal.com') {
      return Environment.Sandbox;
    } else if (baseUrl === 'https://api-m.paypal.com') {
      return Environment.Live;
    } else {
      console.warn('PAYPAL_BASE_URL is not set to a known PayPal endpoint. Defaulting to sandbox.');
      return Environment.Sandbox;
    }
  }

  client() {
    return this.client;
  }
}

module.exports = { PayPalClient };