import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiChevronLeft, FiStar, FiAward, FiBookOpen } from 'react-icons/fi';

function TerapistDetay() {
  const { id } = useParams();

  // Simüle edilmiş veritabanı
  const uzmanVeritabani = {
    'zeynep-taskin': { isim: 'Dr. Zeynep Taşkın', unvan: 'Klinik Psikolog', egitim: 'Boğaziçi Üniversitesi Psikoloji', deneyim: '12 Yıl', hakkinda: 'Anksiyete, depresyon ve yaşam değişikliklerinin üstesinden gelme konusunda uzmanlaşmıştır. Kanıta dayalı terapiler (BDT) uygular.', puan: '4.9', avatar: 'ZT' },
    'seda-yilmaz': { isim: 'Dr. Seda Yılmaz', unvan: 'Anksiyete & Depresyon Uzmanı', egitim: 'ODTÜ Psikoloji', deneyim: '10 Yıl', hakkinda: 'Özellikle panik atak, sosyal anksiyete ve travma sonrası stres bozukluğu (TSSB) üzerine profesyonel seanslar düzenlemektedir.', puan: '4.9', avatar: 'SY' },
    'mert-celik': { isim: 'Dr. Mert Çelik', unvan: 'Stres Yönetimi Uzmanı', egitim: 'Hacettepe Üniversitesi', deneyim: '8 Yıl', hakkinda: 'Kurumsal hayat stresi, tükenmişlik sendromu ve kariyer odaklı krizlerde çözüm odaklı profesyonel terapi sunar.', puan: '4.8', avatar: 'MÇ' }
  };

  // URL'deki id'ye göre doktoru bul, bulamazsa varsayılanı göster
  const doktor = uzmanVeritabani[id] || uzmanVeritabani['zeynep-taskin'];

  return (
    <div style={{ paddingBottom: '30px' }}>
      <div style={{ marginBottom: '20px' }}>
         <Link to="/terapistler" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#469d89', textDecoration: 'none', fontWeight: 'bold' }}>
           <FiChevronLeft size={20} /> Listeye Dön
         </Link>
      </div>

      <div style={{ backgroundColor: '#fff', borderRadius: '15px', border: '1px solid #eee', padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
         <div style={{ display: 'flex', gap: '30px', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '30px', marginBottom: '30px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#e0f2f1', border: '3px solid #469d89', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: '#469d89' }}>{doktor.avatar}</div>
            <div>
               <h1 style={{ fontSize: '28px', color: '#333', margin: '0 0 10px 0' }}>{doktor.isim}</h1>
               <p style={{ fontSize: '16px', color: '#469d89', fontWeight: 'bold', margin: '0 0 10px 0' }}>{doktor.unvan}</p>
               <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#fbbc04', fontSize: '16px' }}><FiStar fill="#fbbc04" /> <span style={{ color: '#666' }}>{doktor.puan}</span></div>
            </div>
         </div>

         <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><FiBookOpen/> Profesyonel Özgeçmiş</h3>
         <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', marginBottom: '30px' }}>{doktor.hakkinda}</p>

         <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
            <div style={{ flex: 1, backgroundColor: '#f8fbfc', padding: '20px', borderRadius: '10px', border: '1px solid #e0f2f1' }}>
               <h4 style={{ color: '#469d89', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><FiAward/> Eğitim</h4>
               <p style={{ color: '#555', margin: 0 }}>{doktor.egitim}</p>
            </div>
            <div style={{ flex: 1, backgroundColor: '#f8fbfc', padding: '20px', borderRadius: '10px', border: '1px solid #e0f2f1' }}>
               <h4 style={{ color: '#469d89', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}><FiAward/> Mesleki Deneyim</h4>
               <p style={{ color: '#555', margin: 0 }}>{doktor.deneyim}</p>
            </div>
         </div>

         <Link to="/randevu" style={{ display: 'block', textAlign: 'center', padding: '15px', backgroundColor: '#4a8deb', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}>
            Bu Uzmandan Randevu Al
         </Link>
      </div>
    </div>
  );
}

export default TerapistDetay;