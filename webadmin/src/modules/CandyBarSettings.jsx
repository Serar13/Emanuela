import { useEffect, useState } from "react";
import CrudModule from "../components/CrudModule";
import ImageInput from "../components/ImageInput";
import SettingsCard, { SettingField } from "../components/SettingsCard";
import { fetchDocument, saveDocument } from "../services/firestore";
import { COLLECTIONS } from "../services/collections";
import { formatMoney } from "../components/ui";

const DEFAULTS = {
  intro: "Transformăm fiecare petrecere într-o poveste plină de savoare și culoare.",
  recommendedGrams: 150,
  fruitBarGrams: 75,
  fruitBarPrice: 7.5,
  basic100: 16, basic150: 24, basic200: 32,
  premium100: 18, premium150: 27, premium200: 36,
  deluxe100: 24, deluxe150: 36, deluxe200: 48,
  slide1: "/images/candy-bar-01.png",
  slide2: "/images/candy-bar-02.png",
  slide3: "/images/wedding-cake-flowers.jpg",
  slide4: "/images/children-cake-unicorn.webp"
};

export default function CandyBarSettings() {
  const [values, setValues] = useState(DEFAULTS);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { fetchDocument(COLLECTIONS.SITE_CONTENT, "candyBar").then((row) => row && setValues((v) => ({ ...v, ...row }))); }, []);
  const set = (name, value) => setValues((v) => ({ ...v, [name]: value }));
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setSaved(false);
    try { await saveDocument(COLLECTIONS.SITE_CONTENT, "candyBar", values); setSaved(true); window.setTimeout(() => setSaved(false), 2500); }
    finally { setBusy(false); }
  };
  return <div className="settings-stack">
    <SettingsCard title="Calculator Candy Bar" description="Prețurile sunt per invitat, în funcție de pachet și gramaj." onSubmit={submit} busy={busy} saved={saved}>
      <SettingField label="Text introductiv" wide><textarea rows="3" value={values.intro} onChange={(e) => set("intro", e.target.value)} /></SettingField>
      <SettingField label="Gramaj recomandat"><input type="number" value={values.recommendedGrams} onChange={(e) => set("recommendedGrams", Number(e.target.value))} /></SettingField>
      <SettingField label="Fruit bar - grame/invitat"><input type="number" value={values.fruitBarGrams} onChange={(e) => set("fruitBarGrams", Number(e.target.value))} /></SettingField>
      <SettingField label="Fruit bar - lei/invitat"><input type="number" step="0.5" value={values.fruitBarPrice} onChange={(e) => set("fruitBarPrice", Number(e.target.value))} /></SettingField>
      {["basic", "premium", "deluxe"].map((pack) => <div className="setting-group compact" key={pack}><h3>{pack[0].toUpperCase() + pack.slice(1)}</h3>{[100, 150, 200].map((grams) => <SettingField key={grams} label={`${grams} g / invitat`}><input type="number" step="0.5" value={values[`${pack}${grams}`]} onChange={(e) => set(`${pack}${grams}`, Number(e.target.value))} /></SettingField>)}</div>)}
      {[1,2,3,4].map((index) => <SettingField key={index} label={`Imagine broșură ${index}`} wide><ImageInput folder="candy-bar" value={values[`slide${index}`]} onChange={(value) => set(`slide${index}`, value)} /></SettingField>)}
    </SettingsCard>
    <div className="settings-card"><header className="settings-card-head"><div><h2>Produse Candy Bar</h2><p>Produsele și prețurile afișate în secțiunea a-la-carte.</p></div></header>
      <CrudModule collectionName={COLLECTIONS.CANDY_BAR_ITEMS} title="Produse Candy Bar" orderByField="sortOrder" searchKeys={["name", "description"]}
        defaults={{ name: "", description: "", price: 0, unit: "buc", imageUrl: "", active: true, sortOrder: 1 }}
        fields={[{ name: "name", label: "Nume", type: "text", required: true }, { name: "description", label: "Descriere", type: "textarea" }, { name: "price", label: "Preț", type: "number", required: true }, { name: "unit", label: "Unitate", type: "text" }, { name: "imageUrl", label: "Imagine", type: "image", folder: "candy-bar-items" }, { name: "sortOrder", label: "Ordine", type: "number" }, { name: "active", label: "Activ", type: "checkbox" }]}
        fromForm={(v) => ({ ...v, price: Number(v.price) || 0, sortOrder: Number(v.sortOrder) || 0, active: !!v.active })}
        inlineToggles={[{ field: "active", kind: "bool", onLabel: "Activ", offLabel: "Inactiv" }]}
        columns={[{ key: "imageUrl", label: "", render: (r) => r.imageUrl ? <img className="thumb" src={r.imageUrl} alt="" /> : "—" }, { key: "name", label: "Produs", sortable: true }, { key: "price", label: "Preț", render: (r) => formatMoney(r.price) }, { key: "unit", label: "Unitate" }]}
      />
    </div>
  </div>;
}
