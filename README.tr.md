# Claim Lantern

AI yanıtlarını iddia ve kaynak bazında inceleyen kanıt masası.

**[Uygulamayı aç](https://metealpkarvan.github.io/claim-lantern/)** · [English](README.md) · [İndirilebilir ZIP](https://github.com/metealpkarvan/claim-lantern/releases/latest)

![Claim Lantern ekran görüntüsü](docs/preview.png)

## Nasıl kullanılır?

1. Her satıra bir iddia yapıştır ve inceleme kartları oluştur.
2. Kartı tek bir kontrol edilebilir ifadeye indir.
3. Kaynağı kendin aç; bağlantıyı ve ilgili alıntıyı veya inceleme notunu ekle.
4. Bekliyor, destekleniyor, çelişiyor veya belirsiz durumunu seç. Destek/çelişki için bağlantı ile alıntı ya da not gerekir.
5. İncelemeyi kaydet; Markdown raporu veya JSON yedeği indir.

EN/TR düğmesi dili değiştirir. Örnek düğmesi kurgusal veriler yükler. İlk başarılı çevrimiçi açılıştan sonra uygulama dosyaları aynı tarayıcıda çevrimdışı kullanım için önbelleğe alınır.

## İncelemeyi yedekle ve geri yükle

1. Tarayıcı değiştirmeden veya incelemenin yerini başka verilerle değiştirmeden önce JSON yedeği indir. Dosyayı tekrar bulabileceğin bir yerde sakla.
2. Hedef uygulamada **Yedek yükle** alanından JSON dosyasını seç. Önce uygulama kimliği, sürüm, dosya boyutu ve incelemenin tamamının şeması doğrulanır.
3. İncelemeyi yüklemek için değiştirme onayını ver; mevcut incelemeyi korumak için iptal et. İçe aktarma kartları birleştirmez, incelemenin yerini alır.

1.0.1 sürümünde JSON indirme ve içe aktarma için aynı **10.000.000 baytlık sınır (ondalık 10 MB)** kullanılır; boyut UTF-8 dosya baytlarıyla ölçülür. Bu sürümün dışa aktardığı geçerli incelemeler; uzun kanıt notları, Türkçe ve diğer çok baytlı metinler ile JSON içinde kaçışla yazılan karakterler dahil, kendi içe aktarıcısına sığar. 100 iddia sınırı, alan uzunlukları ve kanıt koşulları korunur. Sürüm 1 yedekleri desteklenmeye devam eder.

Tarayıcının yerel kayıt kotası ayrıdır; yedek geçerli olsa da kayıt alanı dolu veya erişilemez olabilir. Yerel kayıt başarısız olursa indirdiğin JSON dosyasını sakla. Yedek yüklemek, tarayıcıda kalıcı kaydı garanti etmez.

## İndir ve yerelde çalıştır

Canlı demo için hesap veya kurulum gerekmez. Releases bölümündeki **claim-lantern-v1.0.1.zip** dosyasını indir, çıkar ve çıkarılan klasörde çalıştır:

    python3 -m http.server 8080 --bind 127.0.0.1

Tarayıcıda http://127.0.0.1:8080 adresini aç. Modül kısıtlamaları nedeniyle HTML dosyasına çift tıklamak yerine yerel HTTP sunucusu kullanılır. ZIP, kullanıcı kayıtlarını içermez.

## Gizlilik ve sınırlar

Uygulama cihazında çalışır. AI API anahtarı, sunucuya metin yükleme, reklam, analiz veya hesap gerektirmez. Kayıtlar bu tarayıcının yerel deposundadır. JSON yedekleri şifresizdir; önemli kayıtlar için yedek indir. İçe aktarma mevcut kayıtları değiştirmeden önce doğrulama ve onay ister.

Otomatik doğruluk denetimi, kaynak arama veya doğruluk puanı yoktur. Durumlar kullanıcının değerlendirmesidir; kaynağın kendisi de yanlış olabilir.

## Araştırma ve geliştirme

Dayanılan paylaşım: [Teresa Kubacka (@paniterka_ch)](https://x.com/paniterka_ch/status/1599893718214901760) (2022-12-05). X erişim sınırlaması nedeniyle [okunabilir thread kopyası](https://threadreaderapp.com/thread/1599893718214901760.html) da incelendi. Bu seçilmiş küçük bir keşif örneklemidir; pazar araştırması veya ölçülmüş başarı iddiası değildir. Gözlem ile ürün çıkarımı [araştırma notlarında](docs/RESEARCH.md) ayrılır.

Geliştirme için Node.js 22+ gerekir:

    npm test
    npm run build

Testler, mimari tercihler ve kullanım kontrolleri İngilizce teknik belgelerde açıklanır. MIT lisansıyla kullanabilir, değiştirebilir ve katkıda bulunabilirsin.


## Intel ve Apple Silicon

Tarayıcı uygulaması modern tarayıcılarla her iki Mac mimarisinde çalışır. Rosetta gerekmez; ZIP içindeki HTML/CSS/JavaScript dosyaları mimariden bağımsızdır. Otomatik kontroller, yerel Node.js ile Intel ve arm64 macOS çalıştırıcılarında da yürütülür. Bu kural kontrolleri her tarayıcı ve fiziksel cihazın denenmiş olduğu anlamına gelmez.
