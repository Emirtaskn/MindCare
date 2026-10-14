import React, { useState } from 'react';

function Profil() {
  const [gununOzeti, setGununOzeti] = useState('');

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '15px', border: '1px solid #eee', padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px', borderBottom: '1px solid #eee', paddingBottom: '30px', marginBottom: '30px' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#469d89', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold' }}>
          ET
        </div>
        <div>
          <h1 style={{ fontSize: '28px', color: '#333', margin: '0 0 10px 0' }}>Emir Taşkın</h1>
          <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>Danışan Hesabı</p>
          <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>Kayıt Tarihi: Mart 2026</p>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '15px' }}>Bugün Nasıl Hissediyorsunuz? (Günün Özeti)</h3>
        <textarea 
          value={gununOzeti}
          onChange={(e) => setGununOzeti(e.target.value)}
          placeholder="Bugün harika hissediyorum, terapi seansımdan çok verim aldım..."
          style={{ width: '100%', height: '120px', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', backgroundColor: '#f9f9f9', outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '15px', boxSizing: 'border-box' }}
        ></textarea>
        <button style={{ marginTop: '15px', padding: '12px 25px', backgroundColor: '#4a8deb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Notu Kaydet
        </button>
      </div>
    </div>
  );
}

export default Profil;