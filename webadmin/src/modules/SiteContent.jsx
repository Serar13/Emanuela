import { useEffect, useState } from "react";
import ImageInput from "../components/ImageInput";
import SettingsCard, { SettingField } from "../components/SettingsCard";
import { fetchDocument, saveDocument } from "../services/firestore";
import { COLLECTIONS } from "../services/collections";

const HOME_DEFAULTS = {
  eyebrow: "Laborator de prăjituri · Târgu Mureș",
  heroTitle: "Momentele mari încep cu o linguriță.",
  heroLead: "Deserturi artizanale, torturi și candy bar-uri create pentru zilele pe care vrei să le ții minte.",
  heroImage: "/images/hero-events-wide.jpeg",
  heroDetailImage: "/images/mousse-baby-pink.jpeg",
  yearsValue: "19+",
  yearsLabel: "ani de pasiune",
  locationsValue: "4",
  locationsLabel: "experiențe Emanuela",
  careValue: "100%",
  careLabel: "pregătit cu grijă",
  collection1Title: "Torturi cu poveste",
  collection1Text: "Aniversări, nunți și zile care merită un tort creat doar pentru ele.",
  collection1Image: "/images/editorial/cake-square-02.jpeg",
  collection2Title: "Candy bar",
  collection2Text: "Un colț dulce construit în jurul oamenilor, temei și atmosferei evenimentului.",
  collection2Image: "/images/candy-bar-01.png",
  collection3Title: "Mici bunătăți",
  collection3Text: "Monoporții, macarons și prăjituri artizanale pentru momentele de zi cu zi.",
  collection3Image: "/images/editorial/event-wide.jpeg",
  storyTitle: "Nu facem doar deserturi. Facem parte din poveste.",
  storyText: "Botezul, nunta, aniversarea sau desertul de duminică sunt amintiri. Noi venim cu texturile, culorile și gustul care le rămân alături.",
  storyQuote: "Lingurițe de bunătate, pregătite cu mult drag.",
  storyImage: "/images/editorial/atelier-seasonal.jpg",
  eventTitle: "Un Candy Bar care atrage toate privirile. Și poftele.",
  eventText: "Alege numărul de invitați, gramajul și stilul evenimentului. Calculatorul îți oferă o estimare, iar echipa Emanuela construiește oferta finală.",
  eventImage: "/images/candy-bar-01.png",
  eventDetailImage: "/images/wedding-cake-flowers.jpg"
};

const GLOBAL_DEFAULTS = {
  brandDescription: "Laborator de prăjituri din Târgu Mureș — torturi, candy bar și deserturi fine pentru fiecare moment special.",
  eventsPhone: "0755 047 191",
  contactEmail: "",
  facebookUrl: "https://www.facebook.com/laboratoremanuela/",
  instagramUrl: "https://www.instagram.com/laboratoremanuela/",
  appStoreUrl: "https://apps.apple.com/ro/app/laborator-emanuela",
  playStoreUrl: "https://play.google.com/store/apps/details?id=ro.laboratoremanuela.app"
};

function useSettings(id, defaults) {
  const [values, setValues] = useState(defaults);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    fetchDocument(COLLECTIONS.SITE_CONTENT, id)
      .then((row) => row && setValues((current) => ({ ...current, ...row })))
      .catch(console.error);
  }, [id]);
  const set = (name, value) => setValues((current) => ({ ...current, [name]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setSaved(false);
    try {
      await saveDocument(COLLECTIONS.SITE_CONTENT, id, values);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } finally {
      setBusy(false);
    }
  };
  return { values, set, busy, saved, submit };
}

function Text({ model, name, label, wide, multiline, help }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <SettingField label={label} wide={wide} help={help}>
      <Tag value={model.values[name] || ""} rows={multiline ? 4 : undefined} onChange={(e) => model.set(name, e.target.value)} />
    </SettingField>
  );
}

function Image({ model, name, label }) {
  return (
    <SettingField label={label} wide>
      <ImageInput folder="site-content" value={model.values[name]} onChange={(value) => model.set(name, value)} />
    </SettingField>
  );
}

export default function SiteContent() {
  const home = useSettings("home", HOME_DEFAULTS);
  const global = useSettings("global", GLOBAL_DEFAULTS);
  return (
    <div className="settings-stack">
      <SettingsCard title="Homepage" description="Textele și imaginile principale ale site-ului public." onSubmit={home.submit} busy={home.busy} saved={home.saved}>
        <Text model={home} name="eyebrow" label="Text deasupra titlului" />
        <Text model={home} name="heroTitle" label="Titlu principal" />
        <Text model={home} name="heroLead" label="Descriere principală" wide multiline />
        <Image model={home} name="heroImage" label="Imagine hero principală" />
        <Image model={home} name="heroDetailImage" label="Imagine hero secundară" />
        {[["yearsValue", "Ani - valoare"], ["yearsLabel", "Ani - etichetă"], ["locationsValue", "Locații - valoare"], ["locationsLabel", "Locații - etichetă"], ["careValue", "Calitate - valoare"], ["careLabel", "Calitate - etichetă"]].map(([name, label]) => <Text key={name} model={home} name={name} label={label} />)}
        {[1, 2, 3].map((index) => <div className="setting-group" key={index}><h3>Colecția {index}</h3><Text model={home} name={`collection${index}Title`} label="Titlu" /><Text model={home} name={`collection${index}Text`} label="Descriere" wide multiline /><Image model={home} name={`collection${index}Image`} label="Imagine" /></div>)}
        <div className="setting-group"><h3>Povestea laboratorului</h3><Text model={home} name="storyTitle" label="Titlu" wide /><Text model={home} name="storyText" label="Text" wide multiline /><Text model={home} name="storyQuote" label="Citat" wide /><Image model={home} name="storyImage" label="Imagine" /></div>
        <div className="setting-group"><h3>Secțiunea evenimente</h3><Text model={home} name="eventTitle" label="Titlu" wide /><Text model={home} name="eventText" label="Text" wide multiline /><Image model={home} name="eventImage" label="Imagine principală" /><Image model={home} name="eventDetailImage" label="Imagine secundară" /></div>
      </SettingsCard>

      <SettingsCard title="Date globale" description="Contact, social media și linkurile aplicației." onSubmit={global.submit} busy={global.busy} saved={global.saved}>
        <Text model={global} name="brandDescription" label="Descriere brand" wide multiline />
        <Text model={global} name="eventsPhone" label="Telefon evenimente" />
        <Text model={global} name="contactEmail" label="Email contact" />
        <Text model={global} name="facebookUrl" label="Facebook" wide />
        <Text model={global} name="instagramUrl" label="Instagram" wide />
        <Text model={global} name="appStoreUrl" label="App Store" wide />
        <Text model={global} name="playStoreUrl" label="Google Play" wide />
      </SettingsCard>
    </div>
  );
}
