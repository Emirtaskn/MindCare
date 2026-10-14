import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar'; 
import { FiMoon, FiSun } from 'react-icons/fi'; 

function Layout() {
  const [menuAcik, setMenuAcik] = useState(false);
  
  const [koyuTema, setKoyuTema] = useState(localStorage.getItem('mindcare_tema') === 'dark');
  const navigate = useNavigate();

  // Avatar null olarak başlayabilir diye varsayılan veriye ekledik
  const aktifKullanici = JSON.parse(localStorage.getItem('mindcare_aktif_kullanici')) || { ad_soyad: 'Misafir', rol: 'danisan', avatar: null };

  const isimParcalari = aktifKullanici.ad_soyad.trim().split(' ');
  const inisiyaller = isimParcalari.length > 1 
    ? (isimParcalari[0][0] + isimParcalari[isimParcalari.length - 1][0]).toUpperCase()
    : (isimParcalari[0][0] ? isimParcalari[0][0].toUpperCase() : 'M');

  const formatliRol = aktifKullanici.rol === 'danisan' ? 'Danışan' : 'Terapist';

  const cikisYap = () => {
    setMenuAcik(false);
    localStorage.removeItem('mindcare_aktif_kullanici');
    navigate('/'); 
  };

  useEffect(() => {
    if (koyuTema) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('mindcare_tema', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('mindcare_tema', 'light');
    }
  }, [koyuTema]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-body)', fontFamily: 'sans-serif', transition: 'background-color 0.3s' }}>
      
      <style>{`
        :root {
          --bg-body: #f8fbfc;
          --bg-panel: #fff;
          --text-main: #333;
          --text-muted: #666;
          --border-color: #eee;
          --hover-bg: #f1f5f9;
          --input-bg: #f9f9f9;
          --color-vurgu-ana: #469d89; 
          --color-vurgu-sari: #fbbc04; 
        }
        
        [data-theme="dark"] {
          --bg-body: #161819;   
          --bg-panel: #1E2022;  
          --text-main: #E1E2E4; 
          --text-muted: #9AA0A6; 
          --border-color: #2D3135;
          --hover-bg: #282C2F;   
          --input-bg: #111213;   
          --color-vurgu-ana: #5fb4a2; 
        }
        
        body {
          background-color: var(--bg-body);
          margin: 0;
          transition: background-color 0.3s, color 0.3s;
        }
      `}</style>

      <Sidebar />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ height: '70px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 30px', backgroundColor: 'var(--bg-panel)', justifyContent: 'space-between', transition: '0.3s' }}>
          <input type="text" placeholder="Terapist, kaynak veya makale ara..." style={{ padding: '10px 20px', width: '400px', borderRadius: '20px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none', transition: '0.3s' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
             
             <div onClick={() => setKoyuTema(!koyuTema)} style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '50%', backgroundColor: 'var(--hover-bg)', transition: '0.3s' }}>
                {koyuTema ? <FiSun size={20} color="#fbbc04" /> : <FiMoon size={20} />}
             </div>

             
             
             <div 
               onClick={() => setMenuAcik(!menuAcik)} 
               style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '5px', borderRadius: '8px', transition: '0.2s' }}
               onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
               onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
             >
               <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)' }}>{aktifKullanici.ad_soyad}</div>
                 <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatliRol}</div>
               </div>
               
               {/* 4. ADIM: FOTOĞRAF VEYA İNİSİYAL GÖSTERİM ALANI */}
               <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-vurgu-ana)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden' }}>
                 {aktifKullanici.avatar ? (
                   <img src={aktifKullanici.avatar} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   inisiyaller
                 )}
               </div>

             </div>

             {menuAcik && (
               <div style={{ position: 'absolute', top: '60px', right: '0', width: '150px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 100 }}>
                 <div 
                   onClick={() => { setMenuAcik(false); navigate('/ayarlar'); }} 
                   style={{ padding: '12px 15px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', fontSize: '14px', color: 'var(--text-main)' }}
                 >
                   👤 Profil & Ayarlar
                 </div>
                 <div 
                   onClick={cikisYap} 
                   style={{ padding: '12px 15px', cursor: 'pointer', fontSize: '14px', color: '#e53e3e', fontWeight: 'bold' }}
                 >
                   🚪 Çıkış Yap
                 </div>
               </div>
             )}
          </div>
        </div>

        <div style={{ padding: '30px', overflowY: 'auto' }}>
          <Outlet /> 
        </div>

      </div>
    </div>
  );
}

export default Layout;