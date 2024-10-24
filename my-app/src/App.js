import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import QRCodeScanner from './components/QRCodeScanner';
import QRCodeGenerator from './components/QRCodeGenerator';
import 'primereact/resources/themes/saga-blue/theme.css';  // Thema
import 'primereact/resources/primereact.min.css';          // PrimeReact CSS
import 'primeicons/primeicons.css';                        // PrimeIcons
import 'primeflex/primeflex.css';                          // PrimeFlex
import './App.css'; // Importieren der benutzerdefinierten CSS-Datei

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <Link to="/scan" className="nav-link">Scan</Link>
          <Link to="/generate" className="nav-link">Generate</Link>
        </nav>
        <Routes>
          <Route path="/scan" element={<QRCodeScanner />} />
          <Route path="/generate" element={<QRCodeGenerator />} />
          <Route path="/" element={<QRCodeScanner />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;