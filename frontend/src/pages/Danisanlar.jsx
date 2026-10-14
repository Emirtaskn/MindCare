import React, { useState, useEffect } from 'react';
import { FiUsers, FiMail, FiCalendar } from 'react-icons/fi';

function Danisanlar() {
  const aktifKullanici = JSON.parse(localStorage.getItem('mindcare_aktif_kullanici')) || {};
  const [danisanlar, setDanisanlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const danisanlariGetir = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/terapist-danisanlari/${aktifKullanici.id}`);
        if (response.ok) {
          const data = await response.json();
          setDanisanlar(data);
        }
      } catch (error) {
        console.error("Danışanlar çekilemedi", error);
      } finally {
        setYukleniyor(false);
      }
    };
    if (aktifKullanici.rol === 'terapist') danisanlariGetir();
  }, [aktifKullanici.id]);

  const inisiyalBul = (isim) => {
    if (!isim) return 'M';
    const parcalar = isim.trim().split(' ');
    return parcalar.length > 1 
      ? (parcalar[0][0] + parcalar[parcalar.length - 1][0]).toUpperCase()
      : parcalar[0][0].toUpperCase();
  };

  return (
    <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--hover-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-vurgu-ana)' }}>
          <FiUsers size={24} />
        </div>
        <div>
          <h1 style={{ color: 'var(--text-main)', margin: '0 0 5px 0', fontSize: '24px' }}>Danışanlarım</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Sisteminizde kayıtlı randevulu danışanlarınızın arşivi.</p>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-panel)', padding: '30px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
        {yukleniyor ? (
          <p style={{ color: 'var(--text-muted)' }}>Danışanlar yükleniyor...</p>
        ) : danisanlar.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', backgroundColor: 'var(--input-bg)', borderRadius: '10px' }}>
            Henüz onaylanmış bir danışanınız bulunmuyor.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {danisanlar.map(danisan => (
              <div key={danisan.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', transition: '0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--hover-bg)', color: 'var(--color-vurgu-ana)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid var(--border-color)', overflow: 'hidden' }}>
                    {danisan.avatar ? <img src={danisan.avatar} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}} /> : inisiyalBul(danisan.ad_soyad)}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-main)', fontSize: '16px' }}>{danisan.ad_soyad}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <FiMail /> {danisan.email}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-vurgu-ana)', fontSize: '14px', backgroundColor: 'var(--hover-bg)', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
                  <FiCalendar /> {danisan.toplam_randevu} Toplam Seans
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Danisanlar;