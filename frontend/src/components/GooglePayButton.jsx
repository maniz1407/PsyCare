import React, { useEffect, useRef, useState } from 'react';

const GooglePayButton = ({ amount, invoiceId, onSuccess }) => {
  const buttonContainerRef = useRef(null);
  const [paymentsClient, setPaymentsClient] = useState(null);
  const [error, setError] = useState('');

  // 1. Base configuration for Google Pay
  const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
  };

  const allowedCardNetworks = ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"];
  const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

  const tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      gateway: 'example',
      gatewayMerchantId: 'exampleGatewayMerchantId',
    },
  };

  const baseCardPaymentMethod = {
    type: 'CARD',
    parameters: {
      allowedAuthMethods: allowedCardAuthMethods,
      allowedCardNetworks: allowedCardNetworks,
    },
  };

  const cardPaymentMethod = {
    ...baseCardPaymentMethod,
    tokenizationSpecification: tokenizationSpecification,
  };

  useEffect(() => {
    // 2. Load Google Pay script dynamically
    const scriptId = 'google-pay-script';
    let script = document.getElementById(scriptId);

    const initializeGooglePay = () => {
      try {
        const client = new window.google.payments.api.PaymentsClient({
          environment: 'TEST',
        });
        setPaymentsClient(client);
      } catch (err) {
        console.error('Failed to initialize Google Pay client:', err);
        setError('Google Pay is not available.');
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://pay.google.com/gp/p/js/pay.js';
      script.async = true;
      script.onload = initializeGooglePay;
      script.onerror = () => {
        console.warn('Google Pay script failed to load. Brave Shields or Adblocker might be blocking it.');
        setError('GPay blocked by Brave Shields (Disable shields to enable GPay test button).');
      };
      document.body.appendChild(script);
    } else if (window.google && window.google.payments) {
      initializeGooglePay();
    }

    return () => {
      // Keep script loaded so it doesn't have to reload on every render
    };
  }, []);

  useEffect(() => {
    if (!paymentsClient) return;

    // 3. Check if ready to pay and render button
    const isReadyToPayRequest = {
      ...baseRequest,
      allowedPaymentMethods: [baseCardPaymentMethod],
    };

    paymentsClient
      .isReadyToPay(isReadyToPayRequest)
      .then((response) => {
        if (response.result) {
          const button = paymentsClient.createButton({
            onClick: handlePaymentClick,
            buttonColor: 'default',
            buttonType: 'pay',
          });

          if (buttonContainerRef.current) {
            buttonContainerRef.current.innerHTML = '';
            buttonContainerRef.current.appendChild(button);
          }
        } else {
          setError('Google Pay is not supported on this device/browser.');
        }
      })
      .catch((err) => {
        console.error('Error checking isReadyToPay:', err);
      });
  }, [paymentsClient, amount]);

  // 4. Handle button click and load payment sheet
  const handlePaymentClick = () => {
    if (!paymentsClient) return;

    const paymentDataRequest = {
      ...baseRequest,
      allowedPaymentMethods: [cardPaymentMethod],
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: amount.toFixed(2),
        currencyCode: 'USD',
        countryCode: 'US',
      },
      merchantInfo: {
        merchantName: 'PsyCare Clinic',
        merchantId: '12345678901234567890', // Test merchant ID
      },
    };

    paymentsClient
      .loadPaymentData(paymentDataRequest)
      .then((paymentData) => {
        // Log token details in development/test
        console.log('Payment Success:', paymentData);
        
        // Extract payment method token (mock token in TEST)
        const paymentToken = paymentData.paymentMethodData.tokenizationData.token;
        const transactionId = 'gpay-txn-' + Math.random().toString(36).substring(2, 11);

        onSuccess(transactionId, paymentToken);
      })
      .catch((err) => {
        console.error('Payment failed or cancelled:', err);
      });
  };

  if (error) {
    return <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{error}</span>;
  }

  return (
    <div
      ref={buttonContainerRef}
      style={{ display: 'inline-flex', verticalAlign: 'middle', height: '40px', minWidth: '160px' }}
    />
  );
};

export default GooglePayButton;
