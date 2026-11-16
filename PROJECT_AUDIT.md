# Laborator Emanuela - audit de produs

Data auditului: 16 noiembrie 2026

## Verdict

Proiectul este un prototip funcțional conectat la Firebase, nu încă un produs
gata de operare. Site-ul și webadmin-ul se construiesc pentru producție, iar
aplicația mobilă are identitate iOS separată. Totuși, o parte din conținut și
din fluxurile comerciale provin încă din proiectul Cheesecake House.

## Ce funcționează deja

- Site React responsive, catalog, coș, cont client și formulare.
- Aplicație Expo/React Native cu identitate Laborator Emanuela.
- Webadmin pentru catalog, comenzi, rezervări, locații, promoții și clienți.
- Firebase Authentication, Firestore, Storage și două site-uri de Hosting.
- Reguli Firestore/Storage și indexuri de catalog.
- Propunere comercială web și PDF.

## P0 - obligatoriu înainte de utilizare reală

- Eliminarea completă a produselor, locațiilor, poveștii și planurilor de mese
  moștenite din Cheesecake House.
- Soldul, punctele, ștampilele și voucherele trebuie modificate doar de un
  backend sau administrator, nu direct de client.
- Rezervările trebuie să fie cereri confirmate de personal până când există o
  hartă reală a meselor și o sursă reală de disponibilitate.
- Comenzile trebuie validate pe server; totalul trimis de browser nu poate fi
  considerat sursă de adevăr.
- Plățile și alimentarea portofelului trebuie dezactivate până la integrarea cu
  un procesator de plăți și confirmare server-side.
- Datele publice trebuie validate de client: locații, telefoane, program,
  prețuri, alergeni, termeni și politica de confidențialitate.

## P1 - necesar pentru prezentare și pilot

- Catalog Emanuela real, cu imagini locale optimizate și categorii reale.
- Pagină Despre noi bazată doar pe informații publice/verificate.
- Formular Candy Bar fără prețuri inventate; oferta finală este confirmată de
  echipa Emanuela.
- Dashboard admin cu indicatori pe locație, sursă, perioadă și status.
- Stări de încărcare/eroare/empty state consistente în toate aplicațiile.
- Repararea lint-ului și introducerea testelor pentru comenzi, autentificare și
  reguli Firestore.
- Optimizarea bundle-urilor site/admin și lazy loading pentru modulele admin.

## P2 - produs complet

- Plată online, facturare și reconciliere comenzi.
- Disponibilitate și program diferit pe locație; ridicare/livrare pe interval.
- Program de loialitate administrat server-side și istoric de tranzacții.
- Push notifications și campanii segmentate cu acord explicit.
- WhatsApp Business API cu handoff către operator și jurnalizarea conversației.
- Configurator de tort/eveniment cu fișiere, avans și aprobare ofertă.
- Analytics, consent management, observabilitate, backup și proceduri GDPR.
- Publicare App Store/Google Play, conturi de companie și proces de release.

## Gate pentru lansare

Produsul poate intra în pilot după închiderea P0, validarea datelor de către
client și testarea end-to-end pe minimum o locație. Lansarea publică necesită
plăți server-side, documente legale, monitorizare și un responsabil operațional
care gestionează webadmin-ul.

## Progres implementat în acest lot

- Conținutul public și povestea brandului au fost rescrise pentru Emanuela.
- Catalogul seed folosește produse, imagini și locații Emanuela.
- Planurile fictive și selecția de mese au fost eliminate din site și mobil;
  rezervările sunt acum cereri care necesită confirmarea personalului.
- Alimentarea portofelului, acordarea ștampilelor și consumarea voucherelor au
  fost eliminate din clienți, iar regulile Firestore blochează aceste mutații.
- Comanda mobilă este tratată ca solicitare în așteptare, fără plată sau
  recompense simulate în client.
- Lint-ul, build-urile web și exportul iOS trec. Rămân de rezolvat validarea
  comenzilor prin backend, migrarea controlată a datelor live și optimizarea
  bundle-urilor mari.
