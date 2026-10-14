import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiVideo, FiSend, FiShield } from 'react-icons/fi';

function Mesajlar() {
  const aktifKullanici = JSON.parse(localStorage.getItem('mindcare_aktif_kullanici')) || {};
  const [kisiler, setKisiler] = useState([]);
  const [seciliKisi, setSeciliKisi] = useState(null);
  const [mesajlar, setMesajlar] = useState([]);
  const [yeniMesaj, setYeniMesaj] = useState('');
  const mesajSonuRef = useRef(null);

  // 1. İletişim Kurulabilecek Kişileri Çek
  useEffect(() => {
    const kisileriGetir = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/mesaj-kisileri/${aktifKullanici.id}/${aktifKullanici.rol}`);
        if (response.ok) {
          const data = await response.json();
          setKisiler(data);
        }
      } catch (error) { console.error("Kişiler çekilemedi:", error); }
    };
    kisileriGetir();
  }, [aktifKullanici.id, aktifKullanici.rol]);

  // 2. Seçili Kişiyle Olan Mesajları Çek
  useEffect(() => {
    const mesajlariGetir = async () => {
      if (!seciliKisi) return;
      try {
        const response = await fetch(`http://localhost:5000/api/mesajlar/${aktifKullanici.id}/${seciliKisi.id}`);
        if (response.ok) {
          const data = await response.json();
          setMesajlar(data);
        }
        await fetch(`http://localhost:5000/api/mesajlar/okundu/${seciliKisi.id}/${aktifKullanici.id}`, { method: 'PUT' });
      } catch (error) { console.error("Mesajlar çekilemedi:", error); }
    };
    mesajlariGetir();
  }, [seciliKisi, aktifKullanici.id]);

  // 3. Yeni mesaj geldiğinde en alta kaydır
  useEffect(() => {
    mesajSonuRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mesajlar]);

  // 4. Mesaj Gönderme Fonksiyonu
  const mesajGonder = async (e) => {
    e.preventDefault();
    if (!yeniMesaj.trim() || !seciliKisi) return;

    try {
      const response = await fetch('http://localhost:5000/api/mesaj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gonderen_id: aktifKullanici.id,
          alici_id: seciliKisi.id,
          icerik: yeniMesaj
        })
      });

      if (response.ok) {
        setMesajlar([...mesajlar, { 
          id: Date.now(), 
          gonderen_id: aktifKullanici.id, 
          icerik: yeniMesaj, 
          olusturulma_tarihi: new Date().toISOString() 
        }]);
        setYeniMesaj('');
      }
    } catch (error) { console.error("Mesaj gönderilemedi:", error); }
  };

  const inisiyalBul = (isim) => {
    if (!isim) return 'M';
    const p = isim.trim().split(' ');
    return p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0][0].toUpperCase();
  };

  const saatFormatla = (tarihString) => {
    if (!tarihString) return '';
    const d = new Date(tarihString);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div style={{ flex: 1, padding: '30px', overflow: 'hidden', display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', backgroundColor: 'var(--bg-panel)', borderRadius: '15px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        
        {/* SOL PANEL: KİŞİLER LİSTESİ */}
        <div style={{ width: '320px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--input-bg)', borderRadius: '25px', padding: '10px 15px', border: '1px solid var(--border-color)' }}>
              <FiSearch color="var(--text-muted)" size={18} />
              <input 
                type="text" 
                placeholder="Mesajlarda ara..." 
                style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', marginLeft: '10px', width: '100%', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {kisiler.map(kisi => (
              <div 
                key={kisi.id} 
                onClick={() => setSeciliKisi(kisi)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', 
                  cursor: 'pointer', transition: '0.2s',
                  backgroundColor: seciliKisi?.id === kisi.id ? 'var(--hover-bg)' : 'transparent',
                  borderLeft: seciliKisi?.id === kisi.id ? '4px solid var(--color-vurgu-ana)' : '4px solid transparent'
                }}
              >
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--hover-bg)', color: 'var(--color-vurgu-ana)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  {kisi.avatar ? <img src={kisi.avatar} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : inisiyalBul(kisi.ad_soyad)}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-main)', fontSize: '15px' }}>{kisi.ad_soyad}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Sistem Onaylı İletişim</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SAĞ PANEL: SOHBET ALANI */}
        {seciliKisi ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--hover-bg)', color: 'var(--color-vurgu-ana)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                   {seciliKisi.avatar ? <img src={seciliKisi.avatar} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : inisiyalBul(seciliKisi.ad_soyad)}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-main)', fontSize: '16px' }}>{seciliKisi.ad_soyad}</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#38a169', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FiShield /> Güvenli Bağlantı Aktif
                  </p>
                </div>
              </div>
              <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <FiVideo size={24} />
              </button>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'var(--input-bg)' }}>
              {mesajlar.map((msg, index) => {
                const benimMesajim = msg.gonderen_id === aktifKullanici.id;
                
                if (msg.icerik.includes("🚨 SİSTEM BİLDİRİMİ")) {
                  return (
                    <div key={msg.id || index} style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                      <div style={{ backgroundColor: 'rgba(229, 62, 62, 0.1)', border: '1px dashed rgba(229, 62, 62, 0.3)', color: '#fc8181', padding: '12px 20px', borderRadius: '10px', fontSize: '13px', textAlign: 'center', maxWidth: '80%' }}>
                        {msg.icerik}
                        <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '5px' }}>{saatFormatla(msg.olusturulma_tarihi)}</div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id || index} style={{ display: 'flex', flexDirection: 'column', alignItems: benimMesajim ? 'flex-end' : 'flex-start' }}>
                    <div style={{ 
                      maxWidth: '70%', 
                      padding: '12px 18px', 
                      borderRadius: '20px',
                      borderBottomRightRadius: benimMesajim ? '5px' : '20px',
                      borderBottomLeftRadius: !benimMesajim ? '5px' : '20px',
                      backgroundColor: benimMesajim ? 'var(--color-vurgu-ana)' : 'var(--bg-panel)',
                      color: benimMesajim ? '#fff' : 'var(--text-main)',
                      border: benimMesajim ? 'none' : '1px solid var(--border-color)',
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {msg.icerik}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', margin: benimMesajim ? '0 5px 0 0' : '0 0 0 5px' }}>
                      {saatFormatla(msg.olusturulma_tarihi)}
                    </span>
                  </div>
                );
              })}
              <div ref={mesajSonuRef} />
            </div>

            <form onSubmit={mesajGonder} style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '15px', backgroundColor: 'var(--bg-panel)' }}>
              <input 
                type="text" 
                value={yeniMesaj}
                onChange={(e) => setYeniMesaj(e.target.value)}
                placeholder="Bir mesaj yazın..." 
                style={{ flex: 1, padding: '15px 20px', borderRadius: '25px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none' }}
              />
              <button type="submit" disabled={!yeniMesaj.trim()} style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: yeniMesaj.trim() ? 'var(--color-vurgu-ana)' : 'var(--border-color)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: yeniMesaj.trim() ? 'pointer' : 'not-allowed', transition: '0.2s' }}>
                <FiSend size={20} style={{ marginLeft: '-2px', marginTop: '2px' }} />
              </button>
            </form>

          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <FiSend size={32} color="var(--color-vurgu-ana)" />
            </div>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>Mesajlaşmaya Başlayın</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>Sohbet etmek için sol taraftan bir kişi seçin.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Mesajlar;