import React, { useState, useEffect } from 'react';
import { FiUser, FiClock, FiSave, FiUpload, FiCheckCircle, FiTrash2 } from 'react-icons/fi';

function Ayarlar() {
  const [aktifSekme, setAktifSekme] = useState('profil'); 
  const aktifLokal = JSON.parse(localStorage.getItem('mindcare_aktif_kullanici')) || { id: 1, ad_soyad: 'Misafir', email: '', rol: 'danisan' };
  
  const [kullanici, setKullanici] = useState({
    ...aktifLokal,
    uzmanlik: '',
    tecrube: '',
    slogan: '',
    hakkinda: ''
  });
  
  const [yeniSifre, setYeniSifre] = useState('');
  const [basariMesaji, setBasariMesaji] = useState('');
  const [gecmisRandevular, setGecmisRandevular] = useState([]);

  const handleChange = (e) => {
    setKullanici({ ...kullanici, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const profiliGetir = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/kullanici/${kullanici.id}`);
        if (response.ok) {
          const data = await response.json();
          setKullanici(prev => ({ ...prev, ...data }));
        }
      } catch (error) { console.error("Profil bilgileri çekilemedi:", error); }
    };
    profiliGetir();
  }, [kullanici.id]);

  // --- AKILLI GEÇMİŞ RANDEVU MOTORU (Hem Terapist hem Danışan için geçmişi süzer) ---
  useEffect(() => {
    if (aktifSekme === 'gecmis') {
      const randevulariGetir = async () => {
        try {
          const url = kullanici.rol === 'terapist' 
            ? `http://localhost:5000/api/terapist-randevulari/${kullanici.id}`
            : `http://localhost:5000/api/randevular/${kullanici.id}`;
            
          const response = await fetch(url);
          const data = await response.json();
          
          if (response.ok) {
            const suAn = new Date().getTime();
            const aylar = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
            
            let formatliList = [];
            
            if (kullanici.rol === 'terapist') {
              // Terapist için veritabanından gelen formatlı nesneleri süzüyoruz
              formatliList = data.map(r => {
                if (r.durum === 'kapali_gun') return null;
                const [gun, ay, yil] = r.randevu_tarihi.split('.');
                const [saat, dakika] = r.randevu_saati === 'İptal Edildi' ? ['00', '00'] : r.randevu_saati.split(':');
                const dObj = new Date(yil, ay - 1, gun, saat, dakika);
                
                return {
                  id: r.id,
                  doktor: r.danisan_adi, // UI şablonuna uyması için doktor değişkenine danışan adını bağlıyoruz
                  uzmanlik: 'Kayıtlı Seans Danışanı',
                  avatar: r.danisan_adi ? r.danisan_adi.charAt(0) : 'D',
                  tarihSaat: `${r.randevu_tarihi} - ${r.randevu_saati}`,
                  timestamp: dObj.getTime()
                };
              }).filter(Boolean);
            } else {
              // Danışan için gelen veriler
              formatliList = data.map(r => {
                const d = new Date(r.zaman);
                return {
                  ...r,
                  tarihSaat: `${d.getDate()} ${aylar[d.getMonth()]} ${d.getFullYear()} - ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
                  timestamp: d.getTime() 
                };
              });
            }
            
            // Sadece geçmişte kalan (tamamlanmış) seansları büyükten küçüğe sırala
            const filtrelenmisGecmis = formatliList
              .filter(r => r.timestamp <= suAn)
              .sort((a, b) => b.timestamp - a.timestamp); 
              
            setGecmisRandevular(filtrelenmisGecmis);
          }
        } catch (error) { console.error("Geçmiş randevular çekilemedi:", error); }
      };
      randevulariGetir();
    }
  }, [aktifSekme, kullanici.id, kullanici.rol]);

  const profiliKaydet = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/kullanici-guncelle/${kullanici.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...kullanici, sifre: yeniSifre }) 
      });
      if (response.ok) {
        localStorage.setItem('mindcare_aktif_kullanici', JSON.stringify({
          ...aktifLokal,
          ad_soyad: kullanici.ad_soyad,
          email: kullanici.email,
          rol: kullanici.rol
        }));
        setBasariMesaji('Profil bilgileriniz başarıyla güncellendi!');
        setYeniSifre('');
        setTimeout(() => setBasariMesaji(''), 3000);
      }
    } catch (error) { console.error("Güncelleme hatası:", error); }
  };

  const fotoYukle = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch(`http://localhost:5000/api/avatar-yukle/${kullanici.id}`, {
        method: 'POST',
        body: formData 
      });
      const data = await response.json();
      if (response.ok) {
        const guncelKullanici = { ...kullanici, avatar: data.avatarUrl };
        setKullanici(guncelKullanici);
        localStorage.setItem('mindcare_aktif_kullanici', JSON.stringify(guncelKullanici));
        setBasariMesaji('Fotoğraf eklendi!');
        setTimeout(() => setBasariMesaji(''), 3000);
      }
    } catch (error) { console.error("Fotoğraf yükleme hatası:", error); }
  };

  const fotoSil = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/avatar-sil/${kullanici.id}`, { method: 'PUT' });
      if (response.ok) {
        const guncelKullanici = { ...kullanici, avatar: null };
        setKullanici(guncelKullanici);
        localStorage.setItem('mindcare_aktif_kullanici', JSON.stringify(guncelKullanici));
        setBasariMesaji('Fotoğraf kaldırıldı!');
        setTimeout(() => setBasariMesaji(''), 3000);
      }
    } catch (error) { console.error("Fotoğraf silme hatası:", error); }
  };

  const sekmeStili = (aktifMi) => ({
    padding: '12px 25px', cursor: 'pointer', borderBottom: aktifMi ? '3px solid var(--color-vurgu-ana)' : '3px solid transparent',
    color: aktifMi ? 'var(--color-vurgu-ana)' : 'var(--text-muted)', fontWeight: aktifMi ? 'bold' : 'normal',
    display: 'flex', alignItems: 'center', gap: '8px', transition: '0.3s', fontSize: '16px'
  });

  const inputStili = {
    width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)',
    backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none', marginTop: '5px', boxSizing: 'border-box'
  };

  const isimParcalari = (kullanici.ad_soyad || '').trim().split(' ');
  const inisiyaller = isimParcalari.length > 1 
    ? (isimParcalari[0][0] + isimParcalari[isimParcalari.length - 1][0]).toUpperCase()
    : (isimParcalari[0] && isimParcalari[0][0] ? isimParcalari[0][0].toUpperCase() : 'M');

  return (
    <div style={{ paddingBottom: '30px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '26px', color: 'var(--text-main)', marginBottom: '30px' }}>Ayarlar</h2>

      <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '15px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--hover-bg)' }}>
          <div onClick={() => setAktifSekme('profil')} style={sekmeStili(aktifSekme === 'profil')}><FiUser size={18} /> Profil Düzenleme</div>
          <div onClick={() => setAktifSekme('gecmis')} style={sekmeStili(aktifSekme === 'gecmis')}><FiClock size={18} /> Geçmiş Randevularım</div>
        </div>

        <div style={{ padding: '30px' }}>
          {aktifSekme === 'profil' && (
            <form onSubmit={profiliKaydet}>
              <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '200px' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--input-bg)', border: '2px dashed var(--color-vurgu-ana)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', color: 'var(--color-vurgu-ana)', overflow: 'hidden' }}>
                     {kullanici.avatar ? (
                       <img src={kullanici.avatar} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     ) : inisiyaller}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer', fontSize: '14px', transition: '0.2s' }}>
                      <FiUpload /> Seç
                      <input type="file" accept="image/*" onChange={fotoYukle} style={{ display: 'none' }} />
                    </label>
                    {kullanici.avatar && (
                      <button type="button" onClick={fotoSil} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 15px', backgroundColor: '#fef2f2', border: '1px solid #e53e3e', color: '#e53e3e', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                        <FiTrash2 /> Sil
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>JPG, PNG. Max 2MB.</p>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 'bold' }}>Ad Soyad</label>
                    <input type="text" name="ad_soyad" value={kullanici.ad_soyad || ''} onChange={handleChange} style={inputStili} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 'bold' }}>E-Posta Adresi</label>
                    <input type="email" name="email" value={kullanici.email || ''} onChange={handleChange} style={inputStili} required />
                  </div>
                  
                  {kullanici.rol === 'terapist' && (
                    <div style={{ marginTop: '10px', paddingTop: '20px', borderTop: '1px dashed var(--border-color)' }}>
                      <h3 style={{ fontSize: '16px', color: 'var(--text-main)', marginBottom: '15px' }}>Profesyonel Vitrin Bilgileri</h3>
                      
                      <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 'bold' }}>Uzmanlık Alanı</label>
                          <input type="text" name="uzmanlik" value={kullanici.uzmanlik || ''} onChange={handleChange} style={inputStili} required />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 'bold' }}>Tecrübe</label>
                          <input type="text" name="tecrube" value={kullanici.tecrube || ''} onChange={handleChange} style={inputStili} required />
                        </div>
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 'bold' }}>Profil Sloganı</label>
                        <input type="text" name="slogan" value={kullanici.slogan || ''} onChange={handleChange} style={inputStili} required />
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 'bold' }}>Hakkında / Özgeçmiş</label>
                        <textarea name="hakkinda" value={kullanici.hakkinda || ''} onChange={handleChange} rows="4" style={{ ...inputStili, resize: 'none', fontFamily: 'inherit' }} required />
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 'bold' }}>Yeni Şifre Belirle <span style={{color: 'var(--text-muted)', fontWeight: 'normal'}}>(Değiştirmek istemiyorsanız boş bırakın)</span></label>
                    <input type="password" placeholder="Yeni şifrenizi girin..." value={yeniSifre} onChange={(e) => setYeniSifre(e.target.value)} style={inputStili} />
                  </div>

                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button type="submit" style={{ padding: '12px 25px', backgroundColor: 'var(--color-vurgu-ana)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
                      <FiSave size={18} /> Değişiklikleri Kaydet
                    </button>
                    {basariMesaji && <span style={{ color: '#34a853', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', fontSize: '14px' }}><FiCheckCircle /> {basariMesaji}</span>}
                  </div>
                </div>
              </div>
            </form>
          )}

          {aktifSekme === 'gecmis' && (
            <div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginTop: 0, marginBottom: '20px' }}>
                {kullanici.rol === 'terapist' ? 'Tamamlanan Danışan Seansları Arşivi' : 'Tamamlanan Randevularınız Arşivi'}
              </h3>
              {gecmisRandevular.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', backgroundColor: 'var(--input-bg)', borderRadius: '10px', border: '1px dashed var(--border-color)' }}>Henüz geçmiş bir randevunuz bulunmamaktadır.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {gecmisRandevular.map(randevu => (
                    <div key={randevu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: 'var(--hover-bg)', color: 'var(--color-vurgu-ana)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid var(--border-color)' }}>{randevu.avatar}</div>
                        <div>
                          <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-main)', fontSize: '16px' }}>{randevu.doktor}</h4>
                          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>{randevu.uzmanlik}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px', backgroundColor: 'var(--bg-panel)', padding: '8px 15px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                        <FiClock /> {randevu.tarihSaat}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Ayarlar;