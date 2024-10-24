import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import axios from 'axios';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import './QRCodeScanner.css'; // Import custom CSS file

const QRCodeScanner = () => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [qrCodeResult, setQrCodeResult] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [participated, setParticipated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    qrScannerRef.current = new QrScanner(
      videoRef.current,
      result => {
        //setQrCodeResult(`QR code detected: ${result}`);
        sendQRCodeData(result); // Change result.data to result
        qrScannerRef.current.stop(); // Stop scanner after first scan
      },
      {
        onDecodeError: error => {
          console.error('Error decoding QR code:', error);
        },
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    qrScannerRef.current.start()
      .then(() => {
        console.log('QR scanner started');
      })
      .catch(e => {
        console.error('QR scanner could not be started:', e);
        setQrCodeResult('Camera could not be started. Please check permissions.');
      });

    return () => {
      qrScannerRef.current.stop();
    };
  }, []);

  const sendQRCodeData = async (result) => { // Change data to result
    try {
      console.log("result: " + result.data);
      const response = await axios.post('http://localhost:3001/api/qr-code', { data: result.data }); // Change { data } to { data: result.data }
      console.log('Server response:', response.data);
      setQrCodeResult(`Name: ${response.data.name}`);
      setUserName(response.data.name);
      setEmail(response.data.data);
      setParticipated(response.data.participated);
      setErrorMessage('');
    } catch (error) {
      console.error('Error sending QR code data:', error);
      if (error.response && error.response.status === 404) {
        setErrorMessage('Email not found in the database');
      } else {
        setErrorMessage('Error sending QR code data');
      }
    }
  };

  useEffect(() => {
    if (participated) {
      setTimeout(() => {
        window.location.reload(); // Reload page after 1 second
      }, 1000);
    }
  }, [participated]);
  
  const handleConfirmParticipation = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/confirm-participation', { email });
      console.log('Participation confirmed:', response.data);
      setParticipated(true);
    } catch (error) {
      console.error('Error confirming participation:', error);
    }
  };

  const resetScanner = () => {
    setQrCodeResult('');
    setUserName('');
    setEmail('');
    setParticipated(false);
    setErrorMessage('');
    qrScannerRef.current.start()
      .then(() => {
        console.log('QR scanner restarted');
      })
      .catch(e => {
        console.error('QR scanner could not be restarted:', e);
      });
  };

  const handleRestartScanner = () => {
    resetScanner();
  };

  return (
    <div className="qr-scanner-container">
      <Card title="QR Code Scanner" className="p-shadow-3 qr-scanner-card">
        <video ref={videoRef} width="300" height="200" className="qr-scanner-video"></video>
        <div id="output" className="qr-scanner-output">
          {qrCodeResult && (
            <Message severity={qrCodeResult.includes('Name:') ? 'success' : 'error'} text={qrCodeResult} />
          )}
          {errorMessage && (
            <Message severity="error" text={errorMessage} />
          )}
          {userName && (
            <div>
              {participated ? (
                <Message severity="success" text="Participation confirmed" />
              ) : (
                <div>
                  <Button label="Confirm Participation" icon="pi pi-check" className="p-mt-3 qr-scanner-button" onClick={handleConfirmParticipation} />
                  <Button label="Restart Scanner" icon="pi pi-refresh" className="p-mt-3 qr-scanner-button" onClick={handleRestartScanner} />
                </div>
              )}
            </div>
          )}
        </div>
        {!userName && (
          <Button label="Restart Scanner" icon="pi pi-refresh" className="p-mt-3 qr-scanner-button" onClick={handleRestartScanner} />
        )}
      </Card>
    </div>
  );
};

export default QRCodeScanner;