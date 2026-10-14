import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiStar, FiX, FiAward, FiBookOpen, FiSmile, FiChevronLeft, FiUsers, FiMessageSquare, FiSend } from 'react-icons/fi';

function Terapistler() {
  const navigate = useNavigate();
  const aktifKullanici = JSON.parse(localStorage.getItem('mindcare_aktif_kullanici')) || { id: 1, ad_soyad: 'Misafir', rol: 'danisan' };

  const [seciliTerapist, setSeciliTerapist] = useState(null); 
  const [terapistDetay, setTerapistDetay] = useState({ yorumlar: [], gercekPuan: '5.0', toplamDanisan: 0 });
  const [detayYukleniyor, setDetayYukleniyor] = useState(false);
  const [terapistListesi, setTerapistListesi] = useState([]);
  const [listeYukleniyor, setListeYukleniyor] = useState(true);
  
  const [yeniPuan, setYeniPuan] = useState(5);
  const [yeniYorum, setYeniYorum] = useState('');
  const [yorumGonderiliyor, setYorumGonderiliyor] = useState(false);
  const [yorumMesaji, setYorumMesaji] = useState('');

  // --- YEDEK ZIRH (Eski Manuel Veriler) ---
  const tumTerapistler = [
    { id: 1, isim: 'Dr. Zeynep Taşkın', uzmanlik: 'Klinik Psikolog', egitim: 'Boğaziçi Üniv. - Psikoloji', tecrube: '12 Yıl', slogan: '"İçsel huzurunuz, atacağınız ilk adımla başlar."', detay: 'Anksiyete ve depresyon alanında uzmanım.', avatar: 'ZT' },
    { id: 2, isim: 'Dr. Seda Yılmaz', uzmanlik: 'Anksiyete & Depresyon', egitim: 'ODTÜ - Klinik Psikoloji', tecrube: '10 Yıl', slogan: '"Her duygu yaşanmayı hak eder."', detay: 'Panik atak ve stres yönetimi üzerine tecrübeliyim.', avatar: 'SY' },
    { id: 3, isim: 'Dr. Mert Çelik', uzmanlik: 'Stres Yönetimi', egitim: 'Hacettepe Üniv. - Psikoloji', tecrube: '8 Yıl', slogan: '"Kariyer ve hayat dengenizi kuralım."', detay: 'İş hayatı stresi ve tükenmişlik sendromunda çözümler sunuyorum.', avatar: 'MÇ' },
    { id: 4, isim: 'Dr. Elif Parkan', uzmanlik: 'İlişki Terapisi', egitim: 'Ankara Üniv. - Psikoloji', tecrube: '15 Yıl', slogan: '"Sağlıklı bağlar, sağlıklı yarınlar yaratır."', detay: 'Çift terapisi ve aile danışmanlığı uzmanıyım.', avatar: 'EP' },
    { id: 5, isim: 'Dr. Can Vural', uzmanlik: 'Bilişsel Davranışçı Terapi', egitim: 'İstanbul Üniv. - Psikoloji', tecrube: '6 Yıl', slogan: '"Düşüncelerinizi değiştirin, dünyanız değişsin."', detay: 'Bilişsel Davranışçı Terapi ile somut çözümler üretiyorum.', avatar: 'CV' }
  ];

  const terapistleriGetir = async () => {
    try {
      const tRes = await fetch('http://localhost:5000/api/terapistler');
      const pRes = await fetch('http://localhost:5000/api/terapist-puanlari');
      
      if (tRes.ok && pRes.ok) {
        const tData = await tRes.json();
        const pData = await pRes.json();
        
        const birlesikListe = tData.map(t => {
          const stat = pData.find(p => p.terapist_id === t.id);
          const eskiVeri = tumTerapistler.find(eski => eski.id === t.id);
          
          const gercekIsim = t.ad_soyad || t.isim || eskiVeri?.isim || "İsimsiz Terapist";
          const p = gercekIsim.trim().split(' ');
          const inisiyal = p.length > 1 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : (p[0]?.[0]?.toUpperCase() || 'T');

          return {
            id: t.id,
            isim: gercekIsim,
            uzmanlik: t.uzmanlik || eskiVeri?.uzmanlik || 'Uzman Terapist',
            egitim: t.egitim || eskiVeri?.egitim || 'Sistemde kayıtlı değil.',
            tecrube: t.tecrube || eskiVeri?.tecrube || 'Yeni Başladı',
            slogan: t.slogan || eskiVeri?.slogan || '"Sizin için buradayız."',
            detay: t.detay || t.hakkinda || eskiVeri?.detay || 'Terapist henüz bir özgeçmiş eklemedi.',
            avatar: t.avatar || eskiVeri?.avatar || inisiyal,
            puan: stat ? stat.gercekPuan : 'Yeni'
          };
        });
        setTerapistListesi(birlesikListe);
      }
    } catch (error) { console.error("Terapistler yüklenirken hata:", error); }
    finally { setListeYukleniyor(false); }
  };

  useEffect(() => {
    terapistleriGetir();
  }, []);

  useEffect(() => {
    if (seciliTerapist) detaylariGetir();
  }, [seciliTerapist]);

  const detaylariGetir = async () => {
    setDetayYukleniyor(true);
    try {
      const response = await fetch(`http://localhost:5000/api/terapist-detay/${seciliTerapist.id}`);
      if (response.ok) {
        const data = await response.json();
        setTerapistDetay(data);
      }
    } catch (error) { console.error("Detaylar çekilemedi", error); } 
    finally { setDetayYukleniyor(false); }
  };

  const yorumGonder = async (e) => {
    e.preventDefault();
    if (!yeniYorum.trim()) return;

    setYorumGonderiliyor(true);
    try {
      const response = await fetch('http://localhost:5000/api/degerlendirme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          terapist_id: seciliTerapist.id,
          danisan_id: aktifKullanici.id,
          puan: yeniPuan,
          yorum: yeniYorum
        })
      });

      if (response.ok) {
        setYorumMesaji('Değerlendirmeniz başarıyla eklendi!');
        setYeniYorum('');
        setYeniPuan(5);
        await terapistleriGetir();
        await detaylariGetir();
        setTimeout(() => setYorumMesaji(''), 3000);
      }
    } catch (error) { console.error("Yorum ekleme hatası", error); } 
    finally { setYorumGonderiliyor(false); }
  };

  return (
    <div style={{ paddingBottom: '30px', position: 'relative' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-vurgu-ana)', textDecoration: 'none', fontWeight: 'bold' }}>
          <FiChevronLeft size={20} /> Ana Sayfaya Dön
        </Link>
      </div>

      <h2 style={{ fontSize: '24px', color: 'var(--text-main)', marginBottom: '25px', marginTop: 0 }}>Tüm Uzman Terapistlerimiz</h2>
      
      {listeYukleniyor ? (
        <p style={{ color: 'var(--text-muted)' }}>Terapist listesi güncelleniyor...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }}>
          {terapistListesi.map((terapist) => (
            <div key={terapist.id} style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '15px', padding: '25px', textAlign: 'center', transition: '0.3s' }}>
               <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--hover-bg)', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--color-vurgu-ana)', border: '2px solid var(--color-vurgu-ana)', fontSize: '24px', overflow: 'hidden' }}>
                  {terapist.avatar.length > 2 ? <img src={terapist.avatar} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : terapist.avatar}
               </div>
               <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '5px' }}>{terapist.isim}</h3>
               <p style={{ fontSize: '14px', color: 'var(--color-vurgu-ana)', marginBottom: '15px', fontWeight: 'bold' }}>{terapist.uzmanlik}</p>
               
               <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginBottom: '20px', color: 'var(--color-vurgu-sari)', fontWeight: 'bold', fontSize: '14px' }}>
                  <FiStar fill="var(--color-vurgu-sari)" /> <span style={{ color: 'var(--text-main)' }}>{terapist.puan}</span>
               </div>
               
               <button onClick={() => setSeciliTerapist(terapist)} style={{ width: '100%', padding: '12px', backgroundColor: 'var(--input-bg)', color: 'var(--color-vurgu-ana)', border: '1px solid var(--color-vurgu-ana)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' }}>
                 Profili İncele
               </button>
            </div>
          ))}
        </div>
      )}

      {seciliTerapist && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-color)', width: '90%', maxWidth: '600px', maxHeight: '90vh', borderRadius: '15px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', position: 'relative' }}>
            
            <button onClick={() => { setSeciliTerapist(null); setYorumMesaji(''); setYeniYorum(''); }} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', zIndex: 10 }}>
              <FiX size={24}/>
            </button>
            
            <div style={{ padding: '30px', textAlign: 'center', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)' }}>
               <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--hover-bg)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--color-vurgu-ana)', border: '3px solid var(--color-vurgu-ana)', fontSize: '24px', overflow: 'hidden' }}>
                 {seciliTerapist.avatar.length > 2 ? <img src={seciliTerapist.avatar} alt="avatar" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : seciliTerapist.avatar}
               </div>
               <h2 style={{ margin: '0 0 5px 0', color: 'var(--text-main)', fontSize: '20px' }}>{seciliTerapist.isim}</h2>
               <p style={{ margin: 0, color: 'var(--color-vurgu-ana)', fontWeight: 'bold', fontSize: '14px' }}>{seciliTerapist.uzmanlik}</p>
               
               <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'var(--hover-bg)', padding: '5px 12px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                    <FiStar fill="var(--color-vurgu-sari)" color="var(--color-vurgu-sari)" />
                    <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{terapistDetay.gercekPuan}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>({terapistDetay.yorumlar.length} Yorum)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: 'var(--hover-bg)', padding: '5px 12px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                    <FiUsers color="var(--color-vurgu-ana)" />
                    <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{terapistDetay.toplamDanisan}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Danışan</span>
                  </div>
               </div>
            </div>

            <div style={{ padding: '25px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div>
                 <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', marginBottom: '8px' }}><FiBookOpen color="var(--color-vurgu-ana)"/> Hakkında</h4>
                 <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{seciliTerapist.detay}</p>
               </div>
               <div style={{ display: 'flex', gap: '15px' }}>
                 <div style={{ flex: 1, backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '10px' }}>
                   <h5 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-main)' }}><FiAward color="var(--color-vurgu-ana)"/> Eğitim</h5>
                   <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{seciliTerapist.egitim}</p>
                 </div>
                 <div style={{ flex: 1, backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '10px' }}>
                   <h5 style={{ margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-main)' }}><FiSmile color="var(--color-vurgu-ana)"/> Tecrübe</h5>
                   <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{seciliTerapist.tecrube}</p>
                 </div>
               </div>

               <div>
                 <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', marginBottom: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                   <FiMessageSquare color="var(--color-vurgu-ana)"/> Danışan Yorumları
                 </h4>
                 
                 {detayYukleniyor ? (
                   <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Yorumlar yükleniyor...</p>
                 ) : terapistDetay.yorumlar.length === 0 ? (
                   <div style={{ backgroundColor: 'var(--hover-bg)', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                     <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>Henüz yorum yapılmamış. İlk değerlendiren siz olun!</p>
                   </div>
                 ) : (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     {terapistDetay.yorumlar.map((y, index) => (
                       <div key={index} style={{ backgroundColor: 'var(--input-bg)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--hover-bg)', color: 'var(--color-vurgu-ana)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', overflow: 'hidden', border: '1px solid var(--color-vurgu-ana)' }}>
                               {y.avatar ? <img src={y.avatar} alt="profil" style={{width:'100%', height:'100%', objectFit:'cover'}} /> : y.ad_soyad.charAt(0)}
                             </div>
                             <span style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '13px' }}>{y.ad_soyad}</span>
                           </div>
                           <div style={{ display: 'flex', color: 'var(--color-vurgu-sari)' }}>
                             {[...Array(5)].map((_, i) => <FiStar key={i} size={12} fill={i < y.puan ? "var(--color-vurgu-sari)" : "transparent"} />)}
                           </div>
                         </div>
                         <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{y.yorum}</p>
                       </div>
                     ))}
                   </div>
                 )}
               </div>

               {aktifKullanici.rol === 'danisan' && (
                 <form onSubmit={yorumGonder} style={{ backgroundColor: 'var(--hover-bg)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                   <h5 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '13px' }}>Puanınız ve Yorumunuz</h5>
                   <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', cursor: 'pointer' }}>
                     {[1, 2, 3, 4, 5].map((yildiz) => (
                       <FiStar 
                         key={yildiz} size={22} 
                         onClick={() => setYeniPuan(yildiz)}
                         fill={yildiz <= yeniPuan ? "var(--color-vurgu-sari)" : "transparent"} 
                         color={yildiz <= yeniPuan ? "var(--color-vurgu-sari)" : "var(--border-color)"} 
                       />
                     ))}
                   </div>
                   <textarea 
                     value={yeniYorum}
                     onChange={(e) => setYeniYorum(e.target.value)}
                     placeholder="Terapistiniz hakkındaki düşünceleriniz neler?"
                     style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--text-main)', outline: 'none', resize: 'none', height: '60px', boxSizing: 'border-box', fontFamily: 'sans-serif', fontSize: '13px' }}
                     required
                   />
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ color: '#34a853', fontSize: '12px', fontWeight: 'bold' }}>{yorumMesaji}</span>
                      <button type="submit" disabled={yorumGonderiliyor} style={{ padding: '8px 15px', backgroundColor: 'var(--color-vurgu-ana)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', cursor: yorumGonderiliyor ? 'not-allowed' : 'pointer', fontSize: '12px' }}>
                        <FiSend size={14} /> {yorumGonderiliyor ? 'Gönderiliyor...' : 'Yorumu Paylaş'}
                      </button>
                   </div>
                 </form>
               )}

               <button 
                 onClick={() => navigate('/randevu', { state: { seciliTerapist: seciliTerapist } })} 
                 style={{ width: '100%', padding: '15px', backgroundColor: 'var(--color-vurgu-ana)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
               >
                 Randevu Al
               </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Terapistler;