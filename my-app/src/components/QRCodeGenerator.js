import React, { useState } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import './QRCodeGenerator.css'; // Import custom CSS file

const QRCodeGenerator = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [qrCodePath, setQrCodePath] = useState('');

  const handleGenerateQRCode = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/generate-qr-code', { email });
      setMessage(response.data.message);
      setQrCodePath(response.data.path);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setMessage('Error generating QR code');
    }
  };

  return (
    <div className="qr-generator-container">
      <Card title="QR Code Generator" className="p-shadow-3 qr-generator-card">
        <div className="p-field">
          <label htmlFor="email">Email Address</label>
          <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button label="Generate QR" icon="pi pi-qrcode" className="p-mt-3 qr-generator-button" onClick={handleGenerateQRCode} />
        {message && <p className="qr-generator-message">{message}</p>}
        {qrCodePath && <img src={`http://localhost:3001/${qrCodePath}`} alt="QR Code" className="qr-code-image" />}
      </Card>
    </div>
  );
};

export default QRCodeGenerator;