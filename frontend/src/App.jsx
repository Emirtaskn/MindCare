import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register'; 
import Dashboard from './pages/Dashboard';
import Randevu from './pages/Randevu';
import Mesajlar from './pages/Mesajlar';
import Profil from './pages/Profil'; 
import Terapistler from './pages/Terapistler';
import TerapistDetay from './pages/TerapistDetay';
import Layout from './components/Layout';
import Ayarlar from './pages/Ayarlar';
import Danisanlar from './pages/Danisanlar';
import Takvim from './pages/Takvim';

function App() {
  return (
    <Routes>
      {/* Kimlik Doğrulama (Auth) Rotası */}
      <Route path="/" element={<Login />} />
      {/* Hata buradaydı: /kayit-ol yerine /register olarak değiştirdik */}
      <Route path="/register" element={<Register />} /> 
      
      {/* Sistemin İçi (Layout ile sarılı sayfalar) */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/randevu" element={<Randevu />} />
        <Route path="/mesajlar" element={<Mesajlar />} />
        <Route path="/profil" element={<Profil />} /> 
        <Route path="/terapistler" element={<Terapistler />} /> 
        <Route path="/terapist/:id" element={<TerapistDetay />} />
        <Route path="/ayarlar" element={<Ayarlar />} />
        <Route path="/danisanlar" element={<Danisanlar />} />
<Route path="/takvim" element={<Takvim />} />
      </Route>
    </Routes>
  );
}

export default App;