import React, { useState, useEffect } from 'react'; 
import { FiCalendar, FiSmile, FiMeh, FiFrown, FiChevronDown, FiChevronUp, FiX, FiBookOpen, FiTrash2, FiStar, FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [seciliDuygu, setSeciliDuygu] = useState(null);
  const [randevularAcik, setRandevularAcik] = useState(false);
  const [seciliTerapist, setSeciliTerapist] = useState(null); 
  
  const aktifKullanici = JSON.parse(localStorage.getItem('mindcare_aktif_kullanici')) || { id: 1, ad_soyad: 'Misafir', rol: 'danisan' };

  const [randevular, setRandevular] = useState([]);
  const [populerTerapistler, setPopulerTerapistler] = useState([]); 
  const [terapistlerYukleniyor, setTerapistlerYukleniyor] = useState(true);

  const [bildirimler, setBildirimler] = useState([]);
  const [bildirimMenusuAcik, setBildirimMenusuAcik] = useState(false);

  const [tumTerapistler, setTumTerapistler] = useState([]);

  const randevulariGetir = async () => {
    try {
      if (aktifKullanici.rol === 'terapist') {
        const response = await fetch(`http://localhost:5000/api/terapist-randevulari/${aktifKullanici.id}`);
        if (response.ok) {
          const data = await response.json();
          const suAn = new Date();
          
          // GÜNCELLEME: Sadece gelecekteki randevuları filtreliyoruz
          const gelecekRandevular = data.filter(r => {
            if (r.durum === 'kapali_gun') return true; // Kapalı gün uyarıları ekranda kalsın
            const [gun, ay, yil] = r.randevu_tarihi.split('.');
            const [saat, dakika] = r.randevu_saati === 'İptal Edildi' ? ['00', '00'] : r.randevu_saati.split(':');
            const randevuTarihiObj = new Date(yil, ay - 1, gun, saat, dakika);
            return randevuTarihiObj >= suAn; // Geçmişteyse listeye alma!
          });
          
          setRandevular(gelecekRandevular);
        }
      } else {
        // Danışan kısmı aynı kalıyor...
        const response = await fetch(`http://localhost:5000/api/randevular/${aktifKullanici.id}`);
        if (response.ok) {
          const data = await response.json();
          const suAn = new Date().getTime(); 
          const aylar = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
          const gecerliRandevular = data
            .map(r => {
              const d = new Date(r.zaman);
              return {
                ...r,
                zamanMetni: `${d.getDate()} ${aylar[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
                timestamp: d.getTime() 
              };
            })
            .filter(r => r.timestamp > suAn); 
          setRandevular(gecerliRandevular);
        }
      }
    } catch (error) { console.error("Randevular çekilemedi:", error); }
  };

  const bildirimleriGetir = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/bildirimler/${aktifKullanici.id}`);
      if (response.ok) {
        const data = await response.json();
        setBildirimler(data);
      }
    } catch (error) {
      console.error("Bildirimler çekilemedi:", error);
    }
  };

  const tumTerapistleriGetir = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/terapistler');
      if (response.ok) {
        const data = await response.json();
        // API'den gelen 'ad_soyad' verisini bizim frontend'in beklediği 'isim' formatına uyarlıyoruz
        const formatliTerapistler = data.map(t => ({
            id: t.id,
            isim: t.ad_soyad,
            uzmanlik: t.uzmanlik,
            detay: t.detay || t.hakkinda,
            avatar: t.avatar || 'T'
        }));
        setTumTerapistler(formatliTerapistler);
      }
    } catch (error) { console.error("Terapistler çekilemedi:", error); }
  };

  useEffect(() => {
    tumTerapistleriGetir(); // Component yüklenince veritabanından çek
    // ... (diğer useEffect kodların)

    
    randevulariGetir();
    bildirimleriGetir(); 

    
    
    const bildirimInterval = setInterval(() => {
      bildirimleriGetir();
    }, 3000);

    const gercekPuanlariGetir = async () => {
        try {
          const tRes = await fetch('http://localhost:5000/api/terapistler');
          const pRes = await fetch('http://localhost:5000/api/terapist-puanlari');

          if (tRes.ok && pRes.ok) {
            const tData = await tRes.json();
            const puanData = await pRes.json();

            if(puanData.length === 0) {
              setPopulerTerapistler([]);
            } else {
              // SADECE değerlendirmesi/puanı olan terapistleri (puanData'da eşleşenleri) filtrele
              const filtrelenmis = tData
                .filter(t => puanData.some(p => p.terapist_id === t.id))
                .map(t => {
                  const stat = puanData.find(p => p.terapist_id === t.id);
                  const p = (t.ad_soyad || '').trim().split(' ');
                  const inisiyal = p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : (p[0]?.[0]?.toUpperCase() || 'T');

                  return {
                    id: t.id,
                    isim: t.ad_soyad,
                    uzmanlik: t.uzmanlik || 'Uzman Terapist',
                    avatar: t.avatar || inisiyal,
                    puan: stat.gercekPuan
                  };
                });
              setPopulerTerapistler(filtrelenmis);
            }
          }
        } catch (error) { console.error("Terapistler çekilemedi:", error); } 
        finally { setTerapistlerYukleniyor(false); }
      };

    return () => clearInterval(bildirimInterval); 
  }, [aktifKullanici.id, aktifKullanici.rol]);

  // --- GÜNCELLENMİŞ İPTAL ETME FONKSİYONU ---
  const randevuIptalEt = async (randevuId) => {
    if(!window.confirm("Bu randevuyu iptal etmek istediğinize emin misiniz? Karşı tarafa bildirim gönderilecektir.")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/randevu-iptal/${randevuId}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        // Backend'e iptal edenin kim olduğunu gönderiyoruz ki karşı tarafa mesaj atabilsin
        body: JSON.stringify({
          iptalEdenRol: aktifKullanici.rol,
          iptalEdenIsim: aktifKullanici.ad_soyad
        })
      });
      
      if (response.ok) randevulariGetir(); 
    } catch (error) { console.error("İptal hatası:", error); }
  };

  // --- YENİ: DUYGU DURUMU GÜNCELLEME VE BİLDİRİM FONKSİYONU ---
  const duyguGuncelle = async (duygu) => {
    setSeciliDuygu(duygu); // Ekranda anında seçili göster

    if (aktifKullanici.rol !== 'danisan') return;

    try {
      await fetch('http://localhost:5000/api/duygu-bildirimi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          danisan_id: aktifKullanici.id,
          danisan_adi: aktifKullanici.ad_soyad,
          duygu: duygu
        })
      });
      // Bildirim başarıyla fırlatıldı! Sessiz ve profesyonel.
    } catch (error) {
      console.error("Duygu bildirimi gönderilemedi:", error);
    }
  };

  const goruntulenecekRandevular = randevularAcik ? randevular : (randevular.length > 0 ? [randevular[0]] : []);
  const panelStili = { backgroundColor: 'var(--bg-panel)', borderRadius: '15px', border: '1px solid var(--border-color)', padding: '25px', transition: 'background-color 0.3s, color 0.3s' };
  const metinAnaStili = { fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--text-main)' }; 
  const metinSilikStili = { color: 'var(--text-muted)' }; 
  
  const toplamOkunmamis = bildirimler.reduce((acc, b) => acc + b.okunmamis_sayisi, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', paddingBottom: '20px', position: 'relative' }}>
      
      {/* KARŞILAMA VE BİLDİRİM ALANI */}
      <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '15px', padding: '30px', transition: '0.3s', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '28px', marginBottom: '10px', color: 'var(--text-main)' }}>İyi Günler, {aktifKullanici.ad_soyad}</h2>
          <p style={{ fontStyle: 'italic', color: 'var(--color-vurgu-ana)', opacity: 0.9 }}>
            {aktifKullanici.rol === 'terapist' 
              ? `"Danışanlarınıza kattığınız değer, dünyayı daha güzel bir yer yapıyor."` 
              : `"Ruh sağlığınıza özen göstermek, bir öz sevgi ve cesaret eylemidir."`}
          </p>
        </div>

        {/* TEK VE ŞIK BİLDİRİM ÇANI */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setBildirimMenusuAcik(!bildirimMenusuAcik)}
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)', position: 'relative' }}
          >
            <FiBell size={20} />
            {toplamOkunmamis > 0 && (
              <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#e53e3e', color: 'white', fontSize: '11px', fontWeight: 'bold', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {toplamOkunmamis}
              </span>
            )}
          </button>

          {bildirimMenusuAcik && (
            <div style={{ position: 'absolute', top: '55px', right: '0', width: '300px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden' }}>
              <div style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', color: 'var(--text-main)' }}>
                Bildirimler
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {bildirimler.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Yeni bildiriminiz bulunmuyor.
                  </div>
                ) : (
                  bildirimler.map((bildirim, index) => (
                    <div 
                      key={index} 
                      onClick={() => navigate('/mesajlar', { state: { acilacakSohbetId: bildirim.gonderen_id } })}
                      style={{ padding: '15px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e53e3e' }}></div>
                      <div>
                        <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: 'var(--text-main)' }}>
                          <strong>{bildirim.ad_soyad}</strong> kişisinden mesajınız var.
                        </p>
                        <span style={{ fontSize: '12px', color: 'var(--color-vurgu-ana)', fontWeight: 'bold' }}>{bildirim.okunmamis_sayisi} Yeni Mesaj</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {aktifKullanici.rol === 'terapist' ? (
        <div style={panelStili}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
            <FiCalendar size={20} color="var(--color-vurgu-ana)" />
            <h3 style={metinAnaStili}>Danışan Randevularınız</h3>
          </div>
          
          {randevular.length === 0 ? (
            <div style={{ padding: '30px', backgroundColor: 'var(--input-bg)', borderRadius: '8px', color: 'var(--text-muted)', textAlign: 'center', fontWeight: '500', border: '1px dashed var(--border-color)' }}>
              Şu an için aktif randevunuz bulunmamaktadır.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {randevular.map((randevu, index) => (
                <li key={randevu.id} style={{ padding: '15px 20px', backgroundColor: index % 2 === 0 ? 'var(--input-bg)' : 'transparent', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px', marginBottom: '8px' }}>
                  <div>
                    <span style={{ display: 'block', fontWeight: 'bold', fontSize: '16px', color: 'var(--text-main)', marginBottom: '4px' }}>{randevu.danisan_adi}</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'flex', gap: '15px' }}>
                      <span>📅 {randevu.randevu_tarihi}</span>
                      <span>🕒 {randevu.randevu_saati}</span>
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: randevu.durum === 'onaylandi' ? 'rgba(56, 161, 105, 0.2)' : 'rgba(221, 107, 32, 0.2)', color: randevu.durum === 'onaylandi' ? '#38a169' : '#dd6b20' }}>
                      {randevu.durum === 'onaylandi' ? 'Onaylandı' : 'Bekliyor'}
                    </div>
                    {/* GÜNCELLEME: Terapist 'Katıl' Butonu Kaldırıldı */}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
            <div style={{ ...panelStili, flex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiCalendar size={20} color="var(--color-vurgu-ana)" />
                  <h3 style={metinAnaStili}>Sıradaki Randevular</h3>
                </div>
                {randevular.length > 1 && (
                  <button 
                    onClick={() => setRandevularAcik(!randevularAcik)} 
                    style={{ background: 'none', border: 'none', color: 'var(--color-vurgu-ana)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                    {randevularAcik ? 'Daha Az Göster' : `Tümünü Göster (${randevular.length})`} {randevularAcik ? <FiChevronUp/> : <FiChevronDown/>}
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {randevular.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--hover-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                      <FiCalendar size={28} color="var(--color-vurgu-ana)" />
                    </div>
                    <p style={{ ...metinSilikStili, marginBottom: '20px', fontSize: '15px' }}>Planlanmış güncel bir randevunuz bulunmuyor.</p>
                    <button 
                      onClick={() => navigate('/randevu')} 
                      style={{ padding: '12px 25px', backgroundColor: 'var(--color-vurgu-ana)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
                    >
                      <FiCalendar /> Hemen Randevu Alın
                    </button>
                  </div>
                ) : (
                  goruntulenecekRandevular.map((randevu) => (
                    <div key={randevu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: randevularAcik ? '15px' : '0', borderBottom: randevularAcik && randevu.id !== randevular[randevular.length-1].id ? '1px solid var(--border-color)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--hover-bg)', border: '2px solid var(--color-vurgu-ana)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--color-vurgu-ana)' }}>{randevu.avatar}</div>
                        <div>
                          <h4 style={{ ...metinAnaStili, fontSize: '18px', margin: '0 0 5px 0' }}>{randevu.doktor}</h4>
                          <p style={{ ...metinSilikStili, fontSize: '14px', margin: '0 0 5px 0' }}>{randevu.uzmanlik}</p>
                          <p style={{ color: 'var(--color-vurgu-ana)', fontSize: '14px', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}><FiCalendar /> {randevu.zamanMetni}</p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => randevuIptalEt(randevu.id)}
                          style={{ backgroundColor: 'transparent', color: '#e53e3e', border: '1px solid #e53e3e', padding: '10px 15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(229, 62, 62, 0.1)'; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <FiTrash2 size={16} /> İptal
                        </button>
                        {/* GÜNCELLEME: Danışan 'Katıl' Butonu Kaldırıldı */}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ ...panelStili, flex: 1 }}>
              <h3 style={{ ...metinAnaStili, marginBottom: '20px' }}>Bugün Nasıl Hissediyorsun?</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                {['mutlu', 'normal', 'uzgun'].map((duygu) => (
                  <div key={duygu} onClick={() => duyguGuncelle(duygu)} style={{ textAlign: 'center', cursor: 'pointer', opacity: seciliDuygu === duygu || !seciliDuygu ? 1 : 0.4, transition: '0.2s' }}>
                    <div style={{ 
                      width: '50px', height: '50px', borderRadius: '50%', 
                      backgroundColor: seciliDuygu === duygu ? (duygu === 'mutlu' ? '#34a853' : duygu === 'normal' ? 'var(--color-vurgu-sari)' : '#4285f4') : 'var(--input-bg)', 
                      color: seciliDuygu === duygu ? '#fff' : (duygu === 'mutlu' ? '#34a853' : duygu === 'normal' ? 'var(--color-vurgu-sari)' : '#4285f4'),
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', margin: '0 auto' 
                    }}>
                      {duygu === 'mutlu' ? <FiSmile size={24}/> : duygu === 'normal' ? <FiMeh size={24}/> : <FiFrown size={24}/>}
                    </div>
                    <span style={{ fontSize: '12px', ...metinSilikStili, textTransform: 'capitalize' }}>{duygu}</span>
                  </div>
                ))}
              </div>
              <h4 style={{ fontSize: '14px', ...metinSilikStili, marginBottom: '15px' }}>7-Günlük Duygu Özeti</h4>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '60px' }}>
                  {[60, 40, 70, 50, 80, 50, 75].map((h, i) => (<div key={i} style={{ flex: 1, backgroundColor: 'var(--color-vurgu-ana)', height: `${h}%`, borderRadius: '4px 4px 0 0', opacity: 0.8 }}></div>))}
              </div>
            </div>
          </div>

          <div style={panelStili}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={metinAnaStili}>En Çok Tercih Edilen Terapistler</h3>
              <span onClick={() => navigate('/terapistler')} style={{ fontSize: '14px', color: 'var(--color-vurgu-ana)', cursor: 'pointer', fontWeight: 'bold' }}>Hepsini Göster</span>
            </div>
            
            {terapistlerYukleniyor ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Güncel veriler yükleniyor...</div>
            ) : populerTerapistler.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'var(--input-bg)', borderRadius: '10px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
                Henüz değerlendirme alan terapist bulunmuyor. Randevu alıp ilk yorumu siz yapabilirsiniz!
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '20px', overflowX: 'auto' }}>
                {populerTerapistler.map((terapist) => (
                  <div key={terapist.id} style={{ minWidth: '200px', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'var(--hover-bg)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--color-vurgu-ana)', border: '2px solid var(--color-vurgu-ana)', fontSize: '20px' }}>{terapist.avatar}</div>
                    <h4 style={{ fontSize: '15px', ...metinAnaStili, marginBottom: '5px' }}>{terapist.isim}</h4>
                    <p style={{ fontSize: '13px', ...metinSilikStili, marginBottom: '10px' }}>{terapist.uzmanlik}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginBottom: '15px', color: 'var(--color-vurgu-sari)', fontWeight: 'bold', fontSize: '14px' }}>
                        <FiStar fill="var(--color-vurgu-sari)" /> <span style={{ color: 'var(--text-main)' }}>{terapist.puan}</span>
                    </div>

                    <button onClick={() => setSeciliTerapist(terapist)} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--color-vurgu-ana)', color: 'var(--color-vurgu-ana)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Profili İncele</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {seciliTerapist && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-panel)', width: '90%', maxWidth: '600px', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', position: 'relative', border: '1px solid var(--border-color)' }}>
            <button onClick={() => setSeciliTerapist(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <FiX size={24}/>
            </button>
            <div style={{ padding: '40px 30px', textAlign: 'center', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)' }}>
                <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: 'var(--hover-bg)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--color-vurgu-ana)', border: '3px solid var(--color-vurgu-ana)', fontSize: '28px' }}>{seciliTerapist.avatar}</div>
                <h2 style={{ margin: '0 0 5px 0', color: 'var(--text-main)' }}>{seciliTerapist.isim}</h2>
                <p style={{ margin: 0, color: 'var(--color-vurgu-ana)', fontWeight: 'bold' }}>{seciliTerapist.uzmanlik}</p>
            </div>
            <div style={{ padding: '30px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', marginBottom: '8px' }}><FiBookOpen color="var(--color-vurgu-ana)"/> Hakkında</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>{seciliTerapist.detay}</p>
                <button onClick={() => navigate('/randevu', { state: { seciliTerapist: seciliTerapist } })} style={{ width: '100%', padding: '15px', backgroundColor: 'var(--color-vurgu-ana)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}>
                  Randevu Al
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;