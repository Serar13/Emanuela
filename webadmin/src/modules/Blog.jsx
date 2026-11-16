import CrudModule from "../components/CrudModule";
import { COLLECTIONS } from "../services/collections";
import { Badge } from "../components/ui";

export default function Blog() {
  return (
    <CrudModule
      collectionName={COLLECTIONS.ARTICLES}
      title="Articole"
      orderByField="sortOrder"
      idField="slug"
      searchKeys={["title", "excerpt", "category", "author"]}
      defaults={{ slug: "", title: "", excerpt: "", content: "", category: "Din laborator", author: "Echipa Emanuela", imageUrl: "", seoTitle: "", seoDescription: "", published: false, publishedAt: new Date().toISOString().slice(0, 16), sortOrder: 1 }}
      fields={[
        { name: "slug", label: "Adresă articol (slug)", type: "text", required: true, help: "ex: cum-alegi-tortul-perfect" },
        { name: "title", label: "Titlu", type: "text", required: true },
        { name: "excerpt", label: "Rezumat", type: "textarea", required: true },
        { name: "content", label: "Conținut", type: "textarea", required: true, help: "Separă paragrafele cu o linie liberă." },
        { name: "category", label: "Categorie", type: "text" },
        { name: "author", label: "Autor", type: "text" },
        { name: "imageUrl", label: "Imagine principală", type: "image", folder: "blog" },
        { name: "publishedAt", label: "Data publicării", type: "datetime" },
        { name: "sortOrder", label: "Ordine", type: "number", step: "1" },
        { name: "seoTitle", label: "Titlu SEO", type: "text" },
        { name: "seoDescription", label: "Descriere SEO", type: "textarea" },
        { name: "published", label: "Publicat", type: "checkbox" }
      ]}
      fromForm={(v) => ({ ...v, sortOrder: Number(v.sortOrder) || 0, published: !!v.published })}
      inlineToggles={[{ field: "published", kind: "bool", onLabel: "Publicat", offLabel: "Draft" }]}
      columns={[
        { 
          key: "imageUrl", 
          label: "", 
          render: (r) => r.imageUrl ? (
            <img 
              className="thumb" 
              src={r.imageUrl} 
              alt="" 
              onError={(e) => {
                if (r.imageUrl?.startsWith('/images/')) {
                  e.target.src = `https://laborator-emanuela.web.app${r.imageUrl}`;
                }
              }} 
            />
          ) : "—" 
        },
        { key: "title", label: "Titlu", sortable: true },
        { key: "category", label: "Categorie", sortable: true },
        { key: "author", label: "Autor" },
        { key: "published", label: "Stare", render: (r) => <Badge tone={r.published ? "ok" : "default"}>{r.published ? "Publicat" : "Draft"}</Badge> }
      ]}
    />
  );
}
