import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiChevronLeft, FiChevronRight, FiUser, FiAlertTriangle, FiUnlock } from 'react-icons/fi';

function Takvim() {
  const aktifKullanici = JSON.parse(localStorage.getItem('mindcare_aktif_kullanici')) || {};
  const [randevular, setRandevular] = useState([]);
  const [seciliTarih, setSeciliTarih] = useState(new Date()); 
  const [seciliGun, setSeciliGun] = useState(null); 
  const [islemYapiliyor, setIslemYapiliyor] = useState(false); // Butonlara basılınca bekletmek için

  const randevulariGetir = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/terapist-randevulari/${aktifKullanici.id}`);
      if (response.ok) {
        const data = await response.json();
        setRandevular(data);
      }
    } catch (error) { console.error("Randevular çekilemedi", error); }
  };

  useEffect(() => {
    if (aktifKullanici.rol === 'terapist') randevulariGetir();
  }, [aktifKullanici.id]);

  const yil = seciliTarih.getFullYear();
  const ay = seciliTarih.getMonth();
  const aydakiGunSayisi = new Date(yil, ay + 1, 0).getDate();
  const ayinIlkGunu = new Date(yil, ay, 1).getDay(); 
  
  const baslangicBosluklari = ayinIlkGunu === 0 ? 6 : ayinIlkGunu - 1; 
  const aylarListesi = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const gunIsimleri = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  const ayDegistir = (yon) => {
    setSeciliTarih(new Date(yil, ay + yon, 1));
    setSeciliGun(null); 
  };

  const formatliTarihOlustur = (gun) => {
    return `${String(gun).padStart(2, '0')}.${String(ay + 1).padStart(2, '0')}.${yil}`;
  };

  // Backend'in beklediği veritabanı tarihi (YYYY-MM-DD)
  const dbTarihOlustur = (gun) => {
    return `${yil}-${String(ay + 1).padStart(2, '0')}-${String(gun).padStart(2, '0')}`;
  };

  const gunlukRandevular = seciliGun 
    ? randevular.filter(r => r.randevu_tarihi === formatliTarihOlustur(seciliGun))
    : [];

  // O günün kapalı olup olmadığını kontrol eden değişken
  const gunKapaliMi = gunlukRandevular.some(r => r.durum === 'kapali_gun');

  // --- ZIRHLI: GÜN KAPATMA FONKSİYONU ---
  const gunuKapat = async () => {
    const mesaj = gunlukRandevular.length > 0 
      ? "DİKKAT: Bu günde randevularınız var! Günü kapatırsanız tüm randevularınız İPTAL EDİLECEK ve danışanlara mesaj gönderilecektir. Onaylıyor musunuz?" 
      : "Bu günü tamamen kapatmak istediğinize emin misiniz?";
      
    if(!window.confirm(mesaj)) return;
    setIslemYapiliyor(true);

    try {
      const response = await fetch('http://localhost:5000/api/gun-kapat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          terapist_id: aktifKullanici.id,
          tarih_db: dbTarihOlustur(seciliGun),
          tarih_gosterim: formatliTarihOlustur(seciliGun)
        })
      });
      
      if (!response.ok) {
        // Sunucu HTML veya tanımsız hata dönerse çökmek yerine bizi uyaracak
        const text = await response.text();
        try {
            const errData = JSON.parse(text);
            alert("🚨 İŞLEM BAŞARISIZ: " + errData.mesaj);
        } catch(e) {
            alert("🚨 SUNUCU HATASI: Lütfen backend terminaline gidip CTRL+C yapın ve sunucuyu yeniden başlatın!");
        }
      } else {
        await randevulariGetir(); // İşlem başarılıysa takvimi yenile
      }
    } catch (error) { 
      alert("🚨 BAĞLANTI HATASI: Sunucu kapalı veya ulaşılamıyor.");
      console.error("Kapatma hatası", error); 
    }
    setIslemYapiliyor(false);
  };

  // --- ZIRHLI: GÜN AÇMA FONKSİYONU ---
  const gunuAc = async () => {
    setIslemYapiliyor(true);
    try {
      const response = await fetch('http://localhost:5000/api/gun-ac', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          terapist_id: aktifKullanici.id,
          tarih_db: dbTarihOlustur(seciliGun)
        })
      });
      
      if (!response.ok) {
        const text = await response.text();
        try {
            const errData = JSON.parse(text);
            alert("🚨 İŞLEM BAŞARISIZ: " + errData.mesaj);
        } catch(e) {
            alert("🚨 SUNUCU HATASI: Lütfen backend terminaline gidip CTRL+C yapın ve sunucuyu yeniden başlatın!");
        }
      } else {
        await randevulariGetir(); // İşlem başarılıysa takvimi yenile
      }
    } catch (error) { 
      alert("🚨 BAĞLANTI HATASI: Sunucu kapalı veya ulaşılamıyor.");
      console.error("Açma hatası", error); 
    }
    setIslemYapiliyor(false);
  };

  return (
    <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', gap: '30px' }}>
      
      {/* SOL: BÜYÜK TAKVİM */}
      <div style={{ flex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
          <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--hover-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-vurgu-ana)' }}>
            <FiCalendar size={24} />
          </div>
          <div>
            <h1 style={{ color: 'var(--text-main)', margin: '0 0 5px 0', fontSize: '24px' }}>Randevu Takvimim</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Günlere tıklayarak dolu saatleri görebilirsiniz.</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '30px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button onClick={() => ayDegistir(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><FiChevronLeft size={24}/></button>
            <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '20px' }}>{aylarListesi[ay]} {yil}</h2>
            <button onClick={() => ayDegistir(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><FiChevronRight size={24}/></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center' }}>
            {gunIsimleri.map(isim => (
              <div key={isim} style={{ fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '10px' }}>{isim}</div>
            ))}
            
            {Array.from({ length: baslangicBosluklari }).map((_, i) => (
              <div key={`bos-${i}`} style={{ padding: '15px', backgroundColor: 'transparent' }}></div>
            ))}

            {Array.from({ length: aydakiGunSayisi }).map((_, i) => {
              const gun = i + 1;
              const tarihStr = formatliTarihOlustur(gun);
              const oGuneAitKayıtlar = randevular.filter(r => r.randevu_tarihi === tarihStr);
              
              const seciliMi = seciliGun === gun;
              const oGunKapaliMi = oGuneAitKayıtlar.some(r => r.durum === 'kapali_gun');
              const oGunRandevuVarMi = oGuneAitKayıtlar.some(r => r.durum === 'onaylandi');

              return (
                <div 
                  key={gun} 
                  onClick={() => setSeciliGun(gun)}
                  style={{ 
                    padding: '15px', 
                    borderRadius: '10px', 
                    cursor: 'pointer',
                    border: seciliMi ? '2px solid var(--color-vurgu-ana)' : '1px solid var(--border-color)',
                    backgroundColor: oGunKapaliMi ? 'rgba(229, 62, 62, 0.15)' : (seciliMi ? 'var(--hover-bg)' : 'var(--input-bg)'),
                    position: 'relative',
                    transition: '0.2s',
                    fontWeight: 'bold',
                    color: oGunKapaliMi ? '#e53e3e' : (seciliMi ? 'var(--color-vurgu-ana)' : 'var(--text-main)')
                  }}
                >
                  {gun}
                  {/* Gün kapalıysa ortasına çizgi çekilmiş gibi veya kırmızı simge */}
                  {oGunKapaliMi && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.2 }}>
                      <FiAlertTriangle size={32} />
                    </div>
                  )}
                  {/* O gün standart randevu varsa altına nokta koy */}
                  {oGunRandevuVarMi && !oGunKapaliMi && (
                    <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', width: '6px', height: '6px', backgroundColor: 'var(--color-vurgu-ana)', borderRadius: '50%' }}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SAĞ: GÜNLÜK DETAY VE KAPATMA PANELİ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ backgroundColor: 'var(--bg-panel)', padding: '30px', borderRadius: '15px', border: '1px solid var(--border-color)', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {seciliGun ? (
            <>
              <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                {seciliGun} {aylarListesi[ay]} Programı
              </h3>
              
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {gunKapaliMi ? (
                  <div style={{ textAlign: 'center', color: '#e53e3e', marginTop: '40px', padding: '20px', backgroundColor: 'rgba(229, 62, 62, 0.1)', borderRadius: '10px', border: '1px dashed #e53e3e' }}>
                    <FiAlertTriangle size={48} style={{ marginBottom: '15px' }} />
                    <h4 style={{ margin: '0 0 10px 0' }}>Bu Gün Hizmete Kapalı</h4>
                    <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Randevu alımına kapatılmıştır.</p>
                  </div>
                ) : gunlukRandevular.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>Bu tarihte randevunuz bulunmuyor.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {gunlukRandevular.map(randevu => (
                      <div 
                        key={randevu.id} 
                        title={`Danışan: ${randevu.danisan_adi}\nDurum: Onaylandı`}
                        style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', 
                          backgroundColor: 'rgba(52, 168, 83, 0.1)', border: '1px solid rgba(52, 168, 83, 0.3)', 
                          borderRadius: '8px', cursor: 'help' 
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2f855a', fontWeight: 'bold' }}>
                          <FiClock /> {randevu.randevu_saati}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2f855a', fontSize: '14px' }}>
                          <FiUser /> Dolu
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ALT KISIM: GÜNÜ AÇ/KAPAT BUTONLARI */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                {gunKapaliMi ? (
                  <button 
                    disabled={islemYapiliyor}
                    onClick={gunuAc}
                    style={{ width: '100%', padding: '15px', backgroundColor: 'var(--color-vurgu-ana)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: islemYapiliyor ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <FiUnlock size={18} /> Günü Tekrar Randevuya Aç
                  </button>
                ) : (
                  <button 
                    disabled={islemYapiliyor}
                    onClick={gunuKapat}
                    style={{ width: '100%', padding: '15px', backgroundColor: 'transparent', color: '#e53e3e', border: '1px solid #e53e3e', borderRadius: '8px', fontWeight: 'bold', cursor: islemYapiliyor ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(229, 62, 62, 0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <FiAlertTriangle size={18} /> {gunlukRandevular.length > 0 ? "Tüm Randevuları İptal Et ve Günü Kapat" : "Bu Günü Hizmete Kapat"}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              <FiCalendar size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
              <p>Detayları görmek için takvimden bir gün seçin.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default Takvim;