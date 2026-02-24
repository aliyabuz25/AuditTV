import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 md:p-12 shadow-sm space-y-8">
          <header className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Məxfilik Siyasəti</h1>
            <p className="text-sm text-slate-500 font-medium">
              Son yenilənmə: 24 Fevral 2026
            </p>
          </header>

          <section className="space-y-4 text-slate-700 leading-relaxed">
            <h2 className="text-xl font-black text-slate-900">1. Toplanan məlumatlar</h2>
            <p>
              audit.tv platforması istifadəçi sorğularının idarə olunması, tədris xidmətlərinin təqdim edilməsi və
              kommunikasiya məqsədləri üçün ad, e-poçt ünvanı, telefon nömrəsi, müraciət məzmunu və texniki giriş
              məlumatlarını toplaya bilər.
            </p>
          </section>

          <section className="space-y-4 text-slate-700 leading-relaxed">
            <h2 className="text-xl font-black text-slate-900">2. Məlumatların istifadə məqsədi</h2>
            <p>
              Toplanan məlumatlar yalnız xidmətin təmin edilməsi, istifadəçi dəstəyi, təhlükəsizlik nəzarəti, hüquqi
              öhdəliklərin yerinə yetirilməsi və platformanın inkişafı məqsədilə emal olunur.
            </p>
          </section>

          <section className="space-y-4 text-slate-700 leading-relaxed">
            <h2 className="text-xl font-black text-slate-900">3. Məlumatların paylaşılması</h2>
            <p>
              Şəxsi məlumatlar qanunvericiliklə tələb edilən hallar istisna olmaqla üçüncü şəxslərə satılmır və icazəsiz
              şəkildə ötürülmür. Texniki infrastruktur və xidmət təminatı məqsədilə yalnız zəruri həcmdə tərəfdaş
              sistemlərdən istifadə edilə bilər.
            </p>
          </section>

          <section className="space-y-4 text-slate-700 leading-relaxed">
            <h2 className="text-xl font-black text-slate-900">4. Saxlama müddəti və təhlükəsizlik</h2>
            <p>
              Məlumatlar yalnız xidmət məqsədləri üçün lazım olan müddətdə saxlanılır. audit.tv məlumatların
              təhlükəsizliyini təmin etmək üçün texniki və inzibati tədbirlər tətbiq edir.
            </p>
          </section>

          <section className="space-y-4 text-slate-700 leading-relaxed">
            <h2 className="text-xl font-black text-slate-900">5. İstifadəçi hüquqları</h2>
            <p>
              İstifadəçilər öz şəxsi məlumatlarının yenilənməsi, düzəldilməsi və ya silinməsi barədə sorğu göndərə
              bilərlər. Sorğular əlaqə kanalları vasitəsilə qəbul edilir və mümkün ən qısa müddətdə cavablandırılır.
            </p>
          </section>

          <section className="space-y-4 text-slate-700 leading-relaxed">
            <h2 className="text-xl font-black text-slate-900">6. Dəyişikliklər</h2>
            <p>
              Bu siyasət zaman-zaman yenilənə bilər. Yenilənmiş mətn platformada dərc edildiyi andan etibarən qüvvəyə
              minir.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
