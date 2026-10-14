import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiUsers, FiCalendar, FiMessageSquare, FiSettings } from 'react-icons/fi';

function Sidebar() {
  const location = useLocation();
  
  // Aktif kullanıcıyı ve rolünü alıyoruz (Eğer yoksa varsayılan olarak danışan yapıyoruz)
  const aktifKullanici = JSON.parse(localStorage.getItem('mindcare_aktif_kullanici')) || { rol: 'danisan' };

  // YENİ: Hangi linki kimlerin görebileceğini 'roles' dizisiyle belirliyoruz
  const tumLinkler = [
    { path: '/dashboard', label: 'Ana Sayfa', icon: <FiHome />, roles: ['danisan', 'terapist'] },
    
    // SADECE DANIŞANLARIN GÖRECEĞİ LİNKLER
    { path: '/terapistler', label: 'Terapist Bul', icon: <FiSearch />, roles: ['danisan'] },
    { path: '/randevu', label: 'Randevu Al', icon: <FiCalendar />, roles: ['danisan'] },
    
    // SADECE TERAPİSTLERİN GÖRECEĞİ LİNKLER
    // --- GÜNCELLEME: App.jsx'teki rotalarla tam eşleşmesi için path'ler düzeltildi ---
    { path: '/danisanlar', label: 'Danışanlarım', icon: <FiUsers />, roles: ['terapist'] },
    { path: '/takvim', label: 'Randevu Takvimim', icon: <FiCalendar />, roles: ['terapist'] },
    
    // ORTAK LİNKLER
    { path: '/mesajlar', label: 'Mesajlar', icon: <FiMessageSquare />, roles: ['danisan', 'terapist'] },
    { path: '/ayarlar', label: 'Profil Ayarları', icon: <FiSettings />, roles: ['danisan', 'terapist'] }
  ];

  // Kullanıcının rolüne ('danisan' veya 'terapist') uyan linkleri filtrele
  const gorunurLinkler = tumLinkler.filter(item => item.roles.includes(aktifKullanici.rol));

  return (
    <div style={{ width: '250px', backgroundColor: 'var(--bg-panel)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', transition: '0.3s' }}>
      <div style={{ padding: '20px 30px', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ color: 'var(--color-vurgu-ana)', margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🤍 MindCare
        </h2>
      </div>
      <div style={{ padding: '20px 0', flex: 1, overflowY: 'auto' }}>
        {gorunurLinkler.map((link) => {
          const aktif = location.pathname === link.path;
          return (
            <Link 
              key={link.path} 
              to={link.path} 
              style={{
                display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 30px',
                textDecoration: 'none', color: aktif ? 'var(--color-vurgu-ana)' : 'var(--text-muted)',
                backgroundColor: aktif ? 'var(--hover-bg)' : 'transparent',
                borderRight: aktif ? '4px solid var(--color-vurgu-ana)' : '4px solid transparent',
                fontWeight: aktif ? 'bold' : 'normal', transition: '0.2s'
              }}
            >
              {React.cloneElement(link.icon, { size: 20 })}
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;