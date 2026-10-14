import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  // --- ORTAK VERİ HAFIZALARI ---
  const [adSoyad, setAdSoyad] = useState('');
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [rol, setRol] = useState('danisan'); // 'danisan' veya 'terapist'
  
  // --- TERAPİSTLERE ÖZEL VERİ HAFIZALARI ---
  const [uzmanlik, setUzmanlik] = useState('');
  const [tecrube, setTecrube] = useState('');
  const [slogan, setSlogan] = useState('');
  const [hakkinda, setHakkinda] = useState('');

  const [hata, setHata] = useState('');
  const [basari, setBasari] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault(); 
    setHata('');
    setBasari('');
    setYukleniyor(true);

    try {
      const response = await fetch('http://localhost:5000/api/kayit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ad_soyad: adSoyad, 
          email, 
          sifre, 
          rol,
          // Terapist ise bu veriler de gidecek
          uzmanlik,
          tecrube,
          slogan,
          hakkinda
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBasari('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
  navigate('/'); // Yönlendirmeyi ana dizine (Giriş sayfasına) çevirdik
}, 2000);
      } else {
        setHata(data.mesaj); 
      }
    } catch (err) {
      setHata('Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* SOL TARAF: Görsel (Login ile aynı mantık) */}
      <div style={{ flex: 1, backgroundImage: "url('/login-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', color: 'white' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' }}></div>
        <div style={{ position: 'absolute', bottom: '60px', left: '60px', right: '60px' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🤍 MindCare
          </h2>
          <p style={{ fontSize: '20px', fontStyle: 'italic', lineHeight: '1.6', fontWeight: '300' }}>
            "Birlikte daha güçlü, daha sağlıklı yarınlara..."
          </p>
        </div>
      </div>

      {/* SAĞ TARAF: Dinamik Kayıt Formu */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: '40px 20px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          
          <h1 style={{ color: '#1a202c', marginBottom: '8px', fontSize: '32px' }}>Aramıza Katılın</h1>
          <p style={{ color: '#718096', marginBottom: '30px', fontSize: '15px' }}>Hesabınızı oluşturun ve yolculuğa başlayın</p>

          {hata && <div style={{ padding: '10px', backgroundColor: '#fed7d7', color: '#c53030', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>{hata}</div>}
          {basari && <div style={{ padding: '10px', backgroundColor: '#c6f6d5', color: '#2f855a', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>{basari}</div>}

          <form onSubmit={handleRegister}>
            
            {/* Rol Seçimi */}
            <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '30px', padding: '6px', marginBottom: '25px' }}>
              <div 
                onClick={() => setRol('danisan')} 
                style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: '25px', cursor: 'pointer', transition: '0.3s', backgroundColor: rol === 'danisan' ? '#fff' : 'transparent', boxShadow: rol === 'danisan' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', fontWeight: rol === 'danisan' ? 'bold' : '500', color: rol === 'danisan' ? '#2c3e50' : '#718096' }}>
                Danışan Olarak Kaydol
              </div>
              <div 
                onClick={() => setRol('terapist')} 
                style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: '25px', cursor: 'pointer', transition: '0.3s', backgroundColor: rol === 'terapist' ? '#fff' : 'transparent', boxShadow: rol === 'terapist' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', fontWeight: rol === 'terapist' ? 'bold' : '500', color: rol === 'terapist' ? '#2c3e50' : '#718096' }}>
                Terapist Olarak Kaydol
              </div>
            </div>

            {/* Ortak Alanlar */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#2d3748', fontSize: '14px', fontWeight: '600' }}>Ad Soyad {rol === 'terapist' && "(Örn: Dr. Ahmet Yılmaz)"}</label>
              <input type="text" value={adSoyad} onChange={(e) => setAdSoyad(e.target.value)} required placeholder="Adınız ve Soyadınız" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#2d3748', fontSize: '14px', fontWeight: '600' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="ornek@mail.com" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: rol === 'terapist' ? '15px' : '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#2d3748', fontSize: '14px', fontWeight: '600' }}>Şifre</label>
              <input type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} />
            </div>

            {/* SADECE TERAPİST SEÇİLDİĞİNDE AÇILAN EKSTRA ALANLAR */}
            {rol === 'terapist' && (
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px dashed #cbd5e0', marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#2d3748' }}>Profesyonel Profil Bilgileri</h3>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontSize: '13px', fontWeight: '600' }}>Uzmanlık Alanınız</label>
                    <input type="text" value={uzmanlik} onChange={(e) => setUzmanlik(e.target.value)} required placeholder="Örn: Klinik Psikolog" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none', fontSize: '13px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontSize: '13px', fontWeight: '600' }}>Tecrübeniz</label>
                    <input type="text" value={tecrube} onChange={(e) => setTecrube(e.target.value)} required placeholder="Örn: 5 Yıl" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none', fontSize: '13px' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontSize: '13px', fontWeight: '600' }}>Vitrin Sloganınız</label>
                  <input type="text" value={slogan} onChange={(e) => setSlogan(e.target.value)} required placeholder="Danışanlara ilham verecek kısa bir cümle..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none', fontSize: '13px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#4a5568', fontSize: '13px', fontWeight: '600' }}>Detaylı Özgeçmiş / Hakkında</label>
                  <textarea value={hakkinda} onChange={(e) => setHakkinda(e.target.value)} required placeholder="Eğitiminiz, yaklaşımınız ve vizyonunuzdan bahsedin..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', outline: 'none', resize: 'none', height: '80px', fontSize: '13px', fontFamily: 'sans-serif' }} />
                </div>
              </div>
            )}

            <button type="submit" disabled={yukleniyor} style={{ width: '100%', padding: '16px', backgroundColor: '#4299e1', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: yukleniyor ? 'not-allowed' : 'pointer', marginBottom: '25px', transition: '0.3s', opacity: yukleniyor ? 0.7 : 1 }}>
              {yukleniyor ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '14px', color: '#718096' }}>
            Zaten Hesabınız Var Mı? <Link to="/" style={{ color: '#4299e1', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' }}>Giriş Yapın</Link>
            </div>

        </div>
      </div>
    </div>
  );
}

export default Register;