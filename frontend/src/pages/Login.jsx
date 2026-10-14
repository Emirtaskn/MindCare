import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi'; // Modal kapatma çarpısı için

function Login() {
  const navigate = useNavigate();

  // --- BACKEND İÇİN VERİ HAFIZALARI (STATE) ---
  const [hata, setHata] = useState('');
  const [basari, setBasari] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  // --- GÜVENLİK VE SAYAÇ STATE'LERİ ---
  const [hataliDeneme, setHataliDeneme] = useState(0);
  const [kalanSaniye, setKalanSaniye] = useState(0);

  // --- ŞİFRE SIFIRLAMA STATE'LERİ ---
  const [sifirlamaEkraniAcik, setSifirlamaEkraniAcik] = useState(false);
  const [sifirlaEmail, setSifirlaEmail] = useState('');
  const [sifirlaYeniSifre, setSifirlaYeniSifre] = useState('');
  const [sifirlaMesaj, setSifirlaMesaj] = useState('');

  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [rol, setRol] = useState('danisan'); // Rol seçimi için state

  // --- GERİ SAYIM MOTORU ---
  useEffect(() => {
    let timer;
    if (kalanSaniye > 0) {
      timer = setInterval(() => {
        setKalanSaniye((prev) => prev - 1);
      }, 1000);
    } else if (kalanSaniye === 0 && hataliDeneme >= 3) {
      setHataliDeneme(0);
      setHata('Süre doldu, tekrar giriş yapmayı deneyebilirsiniz.');
    }
    return () => clearInterval(timer);
  }, [kalanSaniye, hataliDeneme]);

  // --- GİRİŞ YAP BUTONUNA BASILINCA ÇALIŞACAK FONKSİYON ---
  const handleLogin = async (e) => {
    e.preventDefault(); 
    
    if (kalanSaniye > 0) return; // Kilitliyse işlem yapmasına izin verme

    setHata('');
    setBasari('');
    setYukleniyor(true);

    try {
      const response = await fetch('http://localhost:5000/api/giris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sifre, rol }), // Rol bilgisi de gönderiliyor
      });

      const data = await response.json();

      if (response.ok) {
        setHataliDeneme(0); 
        setBasari(data.mesaj); 
        
        localStorage.setItem('mindcare_aktif_kullanici', JSON.stringify(data.kullanici));

        setTimeout(() => {
          navigate('/dashboard'); 
        }, 1500);
      } else {
        const yeniHataSayisi = hataliDeneme + 1;
        setHataliDeneme(yeniHataSayisi);
        
        if (yeniHataSayisi >= 3) {
          setKalanSaniye(60); 
          setHata('Art arda 3 kez hatalı giriş yaptınız. Güvenlik gereği hesabınız 1 dakikalığına kilitlendi.');
        } else {
          setHata(data.mesaj); 
        }
      }
    } catch (err) {
      setHata('Sunucuya bağlanılamadı. Lütfen bağlantınızı kontrol edin.');
    } finally {
      setYukleniyor(false);
    }
  };

  // --- ŞİFRE SIFIRLAMA İŞLEMİ ---
  const handleSifreSifirla = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/sifre-sifirla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sifirlaEmail, yeniSifre: sifirlaYeniSifre })
      });
      const data = await response.json();

      if (response.ok) {
        setSifirlaMesaj({ tip: 'basari', metin: data.mesaj });
        setTimeout(() => {
          setSifirlamaEkraniAcik(false);
          setSifirlaMesaj('');
          setSifirlaEmail('');
          setSifirlaYeniSifre('');
          setHataliDeneme(0); 
          setKalanSaniye(0);
          setHata('');
          setBasari('Yeni şifrenizle giriş yapabilirsiniz.');
        }, 3000);
      } else {
        setSifirlaMesaj({ tip: 'hata', metin: data.mesaj });
      }
    } catch (error) {
      setSifirlaMesaj({ tip: 'hata', metin: 'Sıfırlama işlemi sırasında bir hata oluştu.' });
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* SOL TARAF: Görsel ve Alıntı */}
      <div style={{ flex: 1, backgroundImage: "url('/login-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', color: 'white' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' }}></div>
        
        <div style={{ position: 'absolute', bottom: '60px', left: '60px', right: '60px' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🤍 MindCare
          </h2>
          <p style={{ fontSize: '20px', fontStyle: 'italic', lineHeight: '1.6', fontWeight: '300' }}>
            "Ruh sağlığınıza özen göstermek, bir cesaret ve öz sevgi eylemidir."
          </p>
          <p style={{ fontSize: '14px', marginTop: '15px', opacity: 0.8 }}>— İyileşme Yolculuğunuz Burada Başlıyor</p>
        </div>
      </div>

      {/* SAĞ TARAF: Giriş Formu */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <div style={{ width: '60%', maxWidth: '420px' }}>
          
          <h1 style={{ color: '#1a202c', marginBottom: '8px', fontSize: '32px' }}>Hoş Geldiniz</h1>
          <p style={{ color: '#718096', marginBottom: '40px', fontSize: '15px' }}>Yolculuğunuza devam etmek için giriş yapın</p>

          {/* HATA VE BAŞARI MESAJLARI */}
          {hata && <div style={{ padding: '10px', backgroundColor: '#fed7d7', color: '#c53030', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', lineHeight: '1.5' }}>{hata}</div>}
          {basari && <div style={{ padding: '10px', backgroundColor: '#c6f6d5', color: '#2f855a', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>{basari}</div>}

          {/* FORM BAŞLANGICI */}
          <form onSubmit={handleLogin}>
            
            {/* Rol Seçimi (Tek Blok) */}
            <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '30px', padding: '6px', marginBottom: '25px' }}>
              <div 
                onClick={() => setRol('danisan')} 
                style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: '25px', cursor: 'pointer', transition: '0.3s', backgroundColor: rol === 'danisan' ? '#fff' : 'transparent', boxShadow: rol === 'danisan' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', fontWeight: rol === 'danisan' ? 'bold' : '500', color: rol === 'danisan' ? '#2c3e50' : '#718096' }}>
                Danışan Girişi
              </div>
              <div 
                onClick={() => setRol('terapist')} 
                style={{ flex: 1, textAlign: 'center', padding: '12px', borderRadius: '25px', cursor: 'pointer', transition: '0.3s', backgroundColor: rol === 'terapist' ? '#fff' : 'transparent', boxShadow: rol === 'terapist' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', fontWeight: rol === 'terapist' ? 'bold' : '500', color: rol === 'terapist' ? '#2c3e50' : '#718096' }}>
                Terapist Girişi
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#2d3748', fontSize: '14px', fontWeight: '600' }}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={kalanSaniye > 0} 
                placeholder="ornek@mail.com" 
                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: kalanSaniye > 0 ? '#edf2f7' : '#f8fafc', boxSizing: 'border-box', outline: 'none', fontSize: '15px' }} 
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                 <label style={{ color: '#2d3748', fontSize: '14px', fontWeight: '600' }}>Şifre</label>
                 <span onClick={() => setSifirlamaEkraniAcik(true)} style={{ fontSize: '13px', color: '#4299e1', cursor: 'pointer', fontWeight: '500' }}>
                   Şifrenizi mi Unuttunuz?
                 </span>
              </div>
              <input 
                type="password" 
                value={sifre} 
                onChange={(e) => setSifre(e.target.value)} 
                required 
                disabled={kalanSaniye > 0} 
                placeholder="••••••••" 
                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: kalanSaniye > 0 ? '#edf2f7' : '#f8fafc', boxSizing: 'border-box', outline: 'none', fontSize: '15px' }} 
              />
            </div>

            <button 
              type="submit" 
              disabled={yukleniyor || kalanSaniye > 0} 
              style={{ width: '100%', padding: '16px', backgroundColor: kalanSaniye > 0 ? '#a0aec0' : '#4299e1', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: (yukleniyor || kalanSaniye > 0) ? 'not-allowed' : 'pointer', marginBottom: '25px', transition: 'background-color 0.3s', opacity: yukleniyor ? 0.7 : 1 }}
            >
              {kalanSaniye > 0 ? `Kilitli (${kalanSaniye} saniye)` : (yukleniyor ? 'Giriş Yapılıyor...' : 'Giriş Yap')}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '14px', color: '#718096' }}>
            Hesabınız Yok Mu? <Link to="/register" style={{ color: '#4299e1', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' }}>Hemen Kayıt Olun</Link>
          </div>

        </div>
      </div>

      {/* --- ŞİFRE SIFIRLAMA MODALI --- */}
      {sifirlamaEkraniAcik && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setSifirlamaEkraniAcik(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
              <FiX size={24} />
            </button>

            <h2 style={{ margin: '0 0 20px 0', color: '#1a202c', fontSize: '22px' }}>Şifre Sıfırlama</h2>
            
            {sifirlaMesaj && (
              <div style={{ padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', backgroundColor: sifirlaMesaj.tip === 'basari' ? '#c6f6d5' : '#fed7d7', color: sifirlaMesaj.tip === 'basari' ? '#2f855a' : '#c53030' }}>
                {sifirlaMesaj.metin}
              </div>
            )}

            <form onSubmit={handleSifreSifirla} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontSize: '13px', fontWeight: 'bold' }}>Kayıtlı E-Posta Adresiniz</label>
                <input 
                  type="email" 
                  value={sifirlaEmail}
                  onChange={(e) => setSifirlaEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} 
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568', fontSize: '13px', fontWeight: 'bold' }}>Yeni Şifreniz</label>
                <input 
                  type="password" 
                  value={sifirlaYeniSifre}
                  onChange={(e) => setSifirlaYeniSifre(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', boxSizing: 'border-box', outline: 'none' }} 
                  required 
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#4299e1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                Şifremi Yenile
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Login;