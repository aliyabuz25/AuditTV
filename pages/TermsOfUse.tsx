import React from 'react';

const TermsOfUsePage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 md:p-12 shadow-sm space-y-8">
          <header className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">İstifadə Şərtləri</h1>
            <p className="text-sm text-slate-500 font-medium">
              Son yenilənmə: 24 Fevral 2026
            </p>
          </header>

          <section className="space-y-4 text-slate-700 leading-relaxed">
            <h2 className="text-xl font-black text-slate-900">1. Ümumi müddəalar</h2>
            <p>
              audit.tv platformasından istifadə etməklə bu şərtlərlə razı olduğunuzu təsdiq edirsiniz. Şərtlərlə razı
              olmadığınız halda platformadan istifadə etməməyiniz tövsiyə olunur.
            </p>
          </section>

          <section className="space-y-4 text-slate-700 leading-relaxed">
            <h2 className="text-xl font-black text-slate-900">2. Xidmətə çıxış və hesab məsuliyyəti</h2>
            <p>
              Tədris məzmununa çıxış kurs əsaslı təsdiq mexanizmi ilə təmin olunur. Hesab məlumatlarının məxfiliyinə
              istifadəçi cavabdehdir. İcazəsiz istifadə hallarında platforma çıxışı məhdudlaşdıra bilər.
            </p>
          </section>

          <section className="space-y-4 text-slate-700 leading-relaxed">
            <h2 className="text-xl font-black text-slate-900">3. İntellektual mülkiyyət hüquqları</h2>
            <p>
              Saytda yerləşdirilən məzmun, o cümlədən mətn, video, qrafik materiallar və sənədlər audit.tv və ya
              lisenziya sahibi tərəflərin hüquqları ilə qorunur. Yazılı icazə olmadan kopyalama və yayım qadağandır.
            </p>
          </section>

          <section className="space-y-4 text-slate-700 leading-relaxed">
            <h2 className="text-xl font-black text-slate-900">4. Qadağan olunmuş fəaliyyətlər</h2>
            <p>
              Platformanın işinə müdaxilə, icazəsiz giriş cəhdləri, texniki istismar, spam və ya digər qanunsuz
              fəaliyyətlər qəti şəkildə qadağandır və hüquqi tədbirlərə səbəb ola bilər.
            </p>
          </section>

          <section className="space-y-4 text-slate-700 leading-relaxed">
            <h2 className="text-xl font-black text-slate-900">5. Məsuliyyətin məhdudlaşdırılması</h2>
            <p>
              audit.tv xidmətlərin fasiləsizliyini təmin etməyə çalışsa da texniki nasazlıqlar, üçüncü tərəf xidmət
              kəsintiləri və ya istifadəçi tərəfli xətalar üzrə tam məsuliyyət daşımır.
            </p>
          </section>

          <section className="space-y-4 text-slate-700 leading-relaxed">
            <h2 className="text-xl font-black text-slate-900">6. Dəyişikliklər və qüvvəyə minmə</h2>
            <p>
              Şərtlər əvvəlcədən xəbərdarlıq edilmədən yenilənə bilər. Yenilənmiş mətnin platformada dərc olunması ilə
              yeni redaksiya qüvvəyə minmiş hesab olunur.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUsePage;
