import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiCalendar, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

function Randevu() {
  const location = useLocation();
  const navigate = useNavigate();
  const gelenVeri = location.state?.seciliTerapist;

  const [terapistler, setTerapistler] = useState([]);
  const [terapistlerYukleniyor, setTerapistlerYukleniyor] = useState(true);
  const [aktifTerapist, setAktifTerapist] = useState(gelenVeri || null); 

  const aktifKullanici = JSON.parse(localStorage.getItem('mindcare_aktif_kullanici')) || { id: 1, ad_soyad: 'Misafir' };

  const [seciliSaat, setSeciliSaat] = useState(null); 
  
  // --- YENİ DİNAMİK TARİH MOTORU ---
  const suAn = new Date();
  const aylar = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  
  const [ayIndeks, setAyIndeks] = useState(suAn.getMonth()); // Bugünün ayını otomatik seçer
  const [seciliGun, setSeciliGun] = useState(suAn.getDate()); // Bugünün gününü otomatik seçer
  
  const [doluSaatler, setDoluSaatler] = useState([]); 
  const [popupAcik, setPopupAcik] = useState(false);
  const [haftasonuPopupi, setHaftasonuPopupi] = useState(false);
  const [gecmisTarihPopupi, setGecmisTarihPopupi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);

  const saatler = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const oncekiAy = () => { if(ayIndeks > 0) setAyIndeks(ayIndeks - 1); };
  const sonrakiAy = () => { if(ayIndeks < aylar.length - 1) setAyIndeks(ayIndeks + 1); };

  const yil = suAn.getFullYear(); 
  const jsAy = ayIndeks; 

  const ayinGunSayisi = new Date(yil, jsAy + 1, 0).getDate();
  const ayinIlkGunu = new Date(yil, jsAy, 1).getDay();
  const boslukSayisi = (ayinIlkGunu + 6) % 7;

  // Eski Manuel Veriler (Yedek Zırh)
  const tumTerapistler = [
    { id: 1, isim: 'Dr. Zeynep Taşkın', uzmanlik: 'Klinik Psikolog', avatar: 'ZT' },
    { id: 2, isim: 'Dr. Seda Yılmaz', uzmanlik: 'Anksiyete & Depresyon', avatar: 'SY' },
    { id: 3, isim: 'Dr. Mert Çelik', uzmanlik: 'Stres Yönetimi', avatar: 'MÇ' },
    { id: 4, isim: 'Dr. Elif Parkan', uzmanlik: 'İlişki Terapisi', avatar: 'EP' },
    { id: 5, isim: 'Dr. Can Vural', uzmanlik: 'Bilişsel Davranışçı Terapi', avatar: 'CV' }
  ];

  useEffect(() => {
    const terapistleriGetir = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/terapistler');
        const data = await response.json();
        if (response.ok) {
          const formatliData = data.map(t => {
            const eskiVeri = tumTerapistler.find(eski => eski.id === t.id);
            // Veritabanında isim yoksa eski veriden çek, o da yoksa İsimsiz yaz.
            const gercekIsim = t.ad_soyad || t.isim || eskiVeri?.isim || "İsimsiz Terapist";
            
            const p = gercekIsim.trim().split(' ');
            const inisiyal = p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : (p[0]?.[0]?.toUpperCase() || 'T');
            
            return { 
                id: t.id, 
                isim: gercekIsim, 
                uzmanlik: t.uzmanlik || eskiVeri?.uzmanlik || 'Uzman Terapist', 
                avatar: t.avatar || eskiVeri?.avatar || inisiyal,
                puan: '4.9' 
            };
          });
          setTerapistler(formatliData);
          if (!gelenVeri && formatliData.length > 0) setAktifTerapist(formatliData[0]);
        }
      } catch (error) { console.error("Terapistler çekilemedi:", error); } 
      finally { setTerapistlerYukleniyor(false); }
    };
    terapistleriGetir();
  }, [gelenVeri]);

  useEffect(() => {
    if (!aktifTerapist) return;

    const doluSaatleriGetir = async () => {
      const ayNumarasi = String(jsAy + 1).padStart(2, '0');
      const gunNumarasi = String(seciliGun).padStart(2, '0');
      const mysqlTarih = `${yil}-${ayNumarasi}-${gunNumarasi}`;

      try {
        const response = await fetch('http://localhost:5000/api/dolu-saatler', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ terapist_id: aktifTerapist.id, tarih: mysqlTarih })
        });
        const data = await response.json();
        if (response.ok) setDoluSaatler(data); 
      } catch (error) { console.error("Saatler kontrol edilemedi:", error); }
    };
    doluSaatleriGetir();
  }, [aktifTerapist, jsAy, seciliGun, yil]);

  const gunSec = (gun) => {
    const secilenTarih = new Date(yil, jsAy, gun);
    const haftaninGunu = secilenTarih.getDay(); // 0: Pazar, 6: Cumartesi
    
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);

    if (secilenTarih < bugun) {
      setGecmisTarihPopupi(true);
      return; 
    }

    if (haftaninGunu === 0 || haftaninGunu === 6) {
      setHaftasonuPopupi(true);
      return;
    }
    
    setSeciliGun(gun);
    setSeciliSaat(null);
  };

  const randevuyuOnayla = async () => {
    if (!aktifTerapist || !seciliSaat) return; 
    setYukleniyor(true);

    const ayNumarasi = String(jsAy + 1).padStart(2, '0');
    const gunNumarasi = String(seciliGun).padStart(2, '0');
    const mysqlTarih = `${yil}-${ayNumarasi}-${gunNumarasi} ${seciliSaat}:00`;

    try {
      const response = await fetch('http://localhost:5000/api/randevu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ danisan_id: aktifKullanici.id, terapist_id: aktifTerapist.id, randevu_tarihi: mysqlTarih })
      });

      if (response.ok) {
        setPopupAcik(true);
      }
    } catch (error) { console.error(error); } 
    finally { setYukleniyor(false); }
  };

  return (
    <div style={{ paddingBottom: '30px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-vurgu-ana)', textDecoration: 'none', fontWeight: 'bold' }}>
          <FiChevronLeft size={20} /> Ana Sayfaya Dön
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        <div style={{ flex: 1, backgroundColor: 'var(--bg-panel)', borderRadius: '15px', border: '1px solid var(--border-color)', padding: '25px', maxHeight: '650px', overflowY: 'auto', transition: '0.3s' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginTop: 0, marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>Terapist Seçin</h3>
          
          {terapistlerYukleniyor ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Terapistler yükleniyor...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {terapistler.map(terapist => (
                <div 
                  key={terapist.id} 
                  onClick={() => { setAktifTerapist(terapist); setSeciliSaat(null); }}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                    border: aktifTerapist?.id === terapist.id ? '2px solid var(--color-vurgu-ana)' : '1px solid var(--border-color)',
                    backgroundColor: aktifTerapist?.id === terapist.id ? 'var(--hover-bg)' : 'var(--bg-panel)'
                  }}
                >
                  <div style={{ width: '55px', height: '55px', borderRadius: '50%', backgroundColor: 'var(--input-bg)', color: 'var(--color-vurgu-ana)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', border: aktifTerapist?.id === terapist.id ? '2px solid var(--color-vurgu-ana)' : 'none' }}>
                    {terapist.avatar}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', color: 'var(--text-main)' }}>{terapist.isim}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{terapist.uzmanlik}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {aktifTerapist && (
          <div style={{ flex: 2, backgroundColor: 'var(--bg-panel)', borderRadius: '15px', border: '1px solid var(--border-color)', padding: '30px', transition: '0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
              <FiCalendar size={22} color="var(--color-vurgu-ana)" />
              <h2 style={{ fontSize: '20px', color: 'var(--text-main)' }}>Randevu Oluştur</h2>
            </div>

            <h3 style={{ fontSize: '16px', color: 'var(--text-main)', marginBottom: '15px' }}>Bir Tarih Seçin</h3>
            <div style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', borderRadius: '12px', padding: '20px', width: '310px', margin: '0 auto 30px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: 'var(--color-vurgu-ana)', fontWeight: 'bold', alignItems: 'center' }}>
                <span onClick={oncekiAy} style={{ cursor: 'pointer', padding: '5px' }}>&lt;</span> 
                <span>{aylar[ayIndeks]} {yil}</span> 
                <span onClick={sonrakiAy} style={{ cursor: 'pointer', padding: '5px' }}>&gt;</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map(g => <div key={g} style={{ fontWeight: 'bold', color: 'var(--color-vurgu-ana)', fontSize: '14px' }}>{g}</div>)}
                
                {[...Array(boslukSayisi)].map((_, i) => (
                  <div key={`bos-${i}`}></div>
                ))}

                {[...Array(ayinGunSayisi)].map((_, i) => {
                  const gun = i + 1;
                  return (
                    <div 
                      key={gun} 
                      onClick={() => gunSec(gun)} 
                      style={{ 
                        cursor: 'pointer', 
                        backgroundColor: seciliGun === gun ? 'var(--color-vurgu-ana)' : 'transparent', 
                        color: seciliGun === gun ? '#fff' : 'var(--text-main)', 
                        borderRadius: '5px', padding: '4px', transition: '0.2s'
                      }}
                    >
                      {gun}
                    </div>
                  )
                })}
              </div>
            </div>

            <h3 style={{ fontSize: '16px', color: 'var(--text-main)', marginBottom: '15px' }}>Uygun Saatler</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
              {saatler.map(saat => {
                const doluMu = doluSaatler.includes(saat); 
                
                let gecmisSaatMi = false;
                const bugun = new Date();

                if (seciliGun === bugun.getDate() && jsAy === bugun.getMonth() && yil === bugun.getFullYear()) {
                  const [butonSaati, butonDakikasi] = saat.split(':').map(Number);
                  
                  if (butonSaati < bugun.getHours() || (butonSaati === bugun.getHours() && butonDakikasi <= bugun.getMinutes())) {
                    gecmisSaatMi = true;
                  }
                }

                const butonKilitli = doluMu || gecmisSaatMi;

                return (
                  <button 
                    key={saat} 
                    disabled={butonKilitli}
                    onClick={() => setSeciliSaat(saat)} 
                    style={{ 
                      padding: '12px', borderRadius: '8px', 
                      border: seciliSaat === saat ? 'none' : '1px solid var(--border-color)', 
                      
                      backgroundColor: butonKilitli ? 'var(--input-bg)' : (seciliSaat === saat ? 'var(--color-vurgu-ana)' : 'var(--bg-panel)'), 
                      color: butonKilitli ? 'var(--text-muted)' : (seciliSaat === saat ? '#fff' : 'var(--text-main)'), 
                      cursor: butonKilitli ? 'not-allowed' : 'pointer',
                      textDecoration: butonKilitli ? 'line-through' : 'none',
                      transition: '0.2s',
                      opacity: gecmisSaatMi ? 0.5 : 1 
                    }}
                  >
                    {saat} {doluMu ? '(Dolu)' : (gecmisSaatMi ? '(Geçti)' : '')}
                  </button>
                )
              })}
            </div>

            <div style={{ backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '20px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '10px' }}>Randevu Özeti</h4>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                <p><b>Tarih:</b> {seciliGun} {aylar[ayIndeks]} {yil}</p>
                <p><b>Saat:</b> {seciliSaat || 'Lütfen Bir Saat Seçin'}</p>
                <p><b>Terapist:</b> {aktifTerapist.isim}</p>
              </div>
            </div>

            <button 
              onClick={randevuyuOnayla} 
              disabled={yukleniyor || !seciliSaat}
              style={{ width: '100%', padding: '15px', backgroundColor: 'var(--color-vurgu-ana)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: (yukleniyor || !seciliSaat) ? 'not-allowed' : 'pointer', opacity: (yukleniyor || !seciliSaat) ? 0.6 : 1, transition: '0.3s' }}
            >
              {!seciliSaat ? 'Lütfen Bir Saat Seçin' : (yukleniyor ? 'Randevu Kaydediliyor...' : 'Randevuyu Onayla')}
            </button>
          </div>
        )}
      </div>

      {gecmisTarihPopupi && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', padding: '35px', borderRadius: '15px', textAlign: 'center', maxWidth: '350px' }}>
            <FiAlertCircle size={50} color="#e53935" style={{ marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '10px', fontSize: '22px', color: 'var(--text-main)' }}>Geçmişe Yolculuk Yok!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '15px' }}>Maalesef geçmiş bir tarihe randevu alamazsınız. Lütfen ileri bir tarih seçin.</p>
            <button onClick={() => setGecmisTarihPopupi(false)} style={{ padding: '12px 30px', backgroundColor: '#e53935', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
              Tamam, Anladım
            </button>
          </div>
        </div>
      )}

      {haftasonuPopupi && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', padding: '35px', borderRadius: '15px', textAlign: 'center', maxWidth: '350px' }}>
            <FiAlertCircle size={50} color="#e53935" style={{ marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '10px', fontSize: '22px', color: 'var(--text-main)' }}>Hafta Sonu Kapalıyız</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '15px' }}>Terapistlerimiz hafta sonu (Cumartesi ve Pazar) hizmet vermemektedir. Lütfen hafta içi bir gün seçin.</p>
            <button onClick={() => setHaftasonuPopupi(false)} style={{ padding: '12px 30px', backgroundColor: '#e53935', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
              Tamam, Anladım
            </button>
          </div>
        </div>
      )}

      {popupAcik && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', padding: '40px', borderRadius: '15px', textAlign: 'center', maxWidth: '400px' }}>
            <FiCheckCircle size={50} color="var(--color-vurgu-ana)" style={{ marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '10px', color: 'var(--text-main)' }}>Randevu Onaylandı!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>{aktifTerapist?.isim} ile randevunuz başarıyla oluşturuldu.</p>
            <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 30px', backgroundColor: 'var(--color-vurgu-ana)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Randevu;