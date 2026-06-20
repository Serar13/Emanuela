from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "emanuela-propunere.pdf"
APP_SCREEN = ROOT / "public" / "proposal-screens" / "app-emanuela.png"
ADMIN_SCREEN = ROOT / "public" / "proposal-screens" / "webadmin-emanuela.png"
SITE_SCREEN = ROOT / "public" / "proposal-screens" / "site-home-emanuela.png"
LOGO = ROOT / "public" / "logo-emanuela.webp"
FONT_REGULAR = Path("/System/Library/Fonts/Supplemental/Arial.ttf")
FONT_BOLD = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")

PRIMARY = colors.HexColor("#E92D79")
PRIMARY_DARK = colors.HexColor("#862875")
INK = colors.HexColor("#241A1C")
MUTED = colors.HexColor("#6b5050")
LINE = colors.HexColor("#f0e0e8")
SOFT = colors.HexColor("#FFF8F2")
WHITE = colors.HexColor("#ffffff")
GREEN = colors.HexColor("#0f9d58")
RED = colors.HexColor("#b34b3a")


PACKAGES = [
    {
        "name": "Servicii la bucată",
        "positioning": "Pentru implementare strict modulară, fără reduceri de pachet.",
        "development": "Site web: 500 € · Aplicație mobilă: 2.500 €",
        "launch_offer": "Social media / promovare doar la cerere, fără discount-uri de pachet.",
        "month7": "Mentenanță și funcționalități noi estimate separat, în funcție de volum.",
        "discount": "Nu se aplică reduceri.",
    },
    {
        "name": "Pachet Lite Accelerator",
        "positioning": "Intrare controlată în ecosistemul digital complet.",
        "development": "1.800 € plată unică (Site 300 € + App 1.500 €) · economie 1.200 €",
        "launch_offer": "750 € / lună pentru primele 6 luni (350 € social media + 400 € Ads + mentenanță inclusă)",
        "month7": "1.250 € / lună din luna 7 (750 € social media + 400 € Ads + 100 € mentenanță)",
        "discount": "Reducerea se aplică doar în pachetul complet.",
    },
    {
        "name": "Pachet Launch Accelerator",
        "positioning": "Varianta recomandată pentru impact vizibil și lansare agresivă.",
        "development": "1.500 € plată unică (site inclus + app 1.500 €) · economie 1.500 €",
        "launch_offer": "1.000 € / lună pentru primele 6 luni (600 € social media + 400 € Ads + mentenanță inclusă)",
        "month7": "1.500 € / lună din luna 7 (1.000 € social media + 400 € Ads + 100 € mentenanță)",
        "discount": "Reducerea se aplică doar în pachetul complet.",
    },
]

CUSTOM_STEPS = [
    ("300 €", "Start Local", "4 postări · 6 stories · 1 reel · 1 platformă"),
    ("400 €", "Essential", "6 postări · 8 stories · 1 reel · 1 platformă"),
    ("500 €", "Social Focus", "8 postări · 12 stories · 2 reels · 2 platforme"),
    ("600 €", "Growth", "10 postări · 14 stories · 2 reels · 2 platforme + 1 ședință"),
    ("700 €", "Growth Plus", "10 postări · 16 stories · 3 reels · 2 platforme + 1 ședință"),
]


def money(text):
    return f"<font color='{PRIMARY_DARK}'><b>{text}</b></font>"


def paragraph(text, style):
    return Paragraph(text, style)


def section_title(text, styles):
    return [
        Spacer(1, 7 * mm),
        Paragraph(text, styles["section"]),
        Spacer(1, 2.2 * mm),
        HRFlowable(width="100%", thickness=1, color=LINE),
        Spacer(1, 3 * mm),
    ]


def bullet_list(items, styles, bullet_color=PRIMARY_DARK):
    flows = []
    for item in items:
        flows.append(
            Paragraph(
                f"<font color='{bullet_color}'><b>•</b></font> {item}",
                styles["body"],
            )
        )
        flows.append(Spacer(1, 1.4 * mm))
    return flows


def screenshot_label(text, styles):
    return Paragraph(f"<b>{text}</b>", styles["body_small"])


def screenshot_overview(styles):
    items = []
    if APP_SCREEN.exists():
        items.append(
            [
                Image(str(APP_SCREEN), width=58 * mm, height=40 * mm),
                screenshot_label("Aplicație mobilă", styles),
            ]
        )
    if ADMIN_SCREEN.exists():
        items.append(
            [
                Image(str(ADMIN_SCREEN), width=58 * mm, height=40 * mm),
                screenshot_label("Webadmin securizat", styles),
            ]
        )
    if SITE_SCREEN.exists():
        items.append(
            [
                Image(str(SITE_SCREEN), width=58 * mm, height=40 * mm),
                screenshot_label("Site public live", styles),
            ]
        )

    if not items:
        return []

    cells = []
    for image, label in items:
        cells.append(
            Table(
                [[image], [Spacer(1, 1.5 * mm)], [label]],
                colWidths=[60 * mm],
            )
        )

    table = Table([cells], colWidths=[58 * mm] * len(cells))
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return [table]


def cover_block(styles):
    story = []
    if LOGO.exists():
        story.append(Image(str(LOGO), width=38 * mm, height=18 * mm))
        story.append(Spacer(1, 3 * mm))
    story.append(Paragraph("Propunere de Parteneriat Digital", styles["title"]))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph("Laborator Emanuela", styles["subtitle"]))
    story.append(Spacer(1, 5 * mm))
    story.append(
        Paragraph(
            "Site web premium, aplicație mobilă iOS & Android, webadmin operațional și pachet de lansare pentru promovare.",
            styles["lead_center"],
        )
    )
    story.append(Spacer(1, 7 * mm))

    highlight = Table(
        [
            [
                Paragraph("<b>Zero risc pe dezvoltare</b><br/>Plata dezvoltării se face doar după aprobarea finală a platformei.", styles["callout_title"]),
                Paragraph("<b>Ofertă de lansare 6 luni</b><br/>Preț promoțional + mentenanță inclusă + buget Ads integrat în pachetele Lite / Launch.", styles["callout_title"]),
            ]
        ],
        colWidths=[82 * mm, 82 * mm],
    )
    highlight.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), SOFT),
                ("BOX", (0, 0), (-1, -1), 1, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 1, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ]
        )
    )
    story.append(highlight)
    story.append(Spacer(1, 8 * mm))
    story.extend(screenshot_overview(styles))
    story.append(Spacer(1, 6 * mm))

    story.append(
        Paragraph(
            "Document comercial pregătit pentru prezentarea clară a livrabilelor, costurilor, etapelor de lucru și reducerilor aplicabile.",
            styles["meta"],
        )
    )
    return story


def build_styles():
    base = getSampleStyleSheet()
    regular_font = "Helvetica"
    bold_font = "Helvetica-Bold"
    if FONT_REGULAR.exists() and FONT_BOLD.exists():
        pdfmetrics.registerFont(TTFont("ProposalArial", str(FONT_REGULAR)))
        pdfmetrics.registerFont(TTFont("ProposalArialBold", str(FONT_BOLD)))
        regular_font = "ProposalArial"
        bold_font = "ProposalArialBold"
    styles = {
        "title": ParagraphStyle(
            "Title",
            parent=base["Title"],
            fontName=bold_font,
            fontSize=24,
            leading=30,
            alignment=TA_CENTER,
            textColor=INK,
            spaceAfter=0,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            parent=base["Heading2"],
            fontName=bold_font,
            fontSize=16,
            leading=20,
            alignment=TA_CENTER,
            textColor=PRIMARY_DARK,
        ),
        "lead_center": ParagraphStyle(
            "LeadCenter",
            parent=base["BodyText"],
            fontName=regular_font,
            fontSize=11.5,
            leading=16,
            alignment=TA_CENTER,
            textColor=MUTED,
        ),
        "section": ParagraphStyle(
            "Section",
            parent=base["Heading2"],
            fontName=bold_font,
            fontSize=16,
            leading=20,
            textColor=INK,
        ),
        "h3": ParagraphStyle(
            "H3",
            parent=base["Heading3"],
            fontName=bold_font,
            fontSize=12.5,
            leading=15,
            textColor=INK,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName=regular_font,
            fontSize=10.2,
            leading=14.2,
            textColor=MUTED,
            alignment=TA_LEFT,
        ),
        "body_small": ParagraphStyle(
            "BodySmall",
            parent=base["BodyText"],
            fontName=regular_font,
            fontSize=8.6,
            leading=11.6,
            textColor=MUTED,
        ),
        "meta": ParagraphStyle(
            "Meta",
            parent=base["BodyText"],
            fontName=regular_font,
            fontSize=9.2,
            leading=12,
            alignment=TA_CENTER,
            textColor=MUTED,
        ),
        "callout_title": ParagraphStyle(
            "CalloutTitle",
            parent=base["BodyText"],
            fontName=regular_font,
            fontSize=10,
            leading=14,
            textColor=INK,
        ),
    }
    return styles


def package_table(styles):
    header = [
        Paragraph("<b>Pachet</b>", styles["body_small"]),
        Paragraph("<b>Poziționare</b>", styles["body_small"]),
        Paragraph("<b>Dezvoltare</b>", styles["body_small"]),
        Paragraph("<b>Primele 6 luni</b>", styles["body_small"]),
        Paragraph("<b>Din luna 7</b>", styles["body_small"]),
    ]
    rows = [header]
    for package in PACKAGES:
        rows.append(
            [
                Paragraph(f"<b>{package['name']}</b><br/>{package['discount']}", styles["body_small"]),
                Paragraph(package["positioning"], styles["body_small"]),
                Paragraph(package["development"], styles["body_small"]),
                Paragraph(package["launch_offer"], styles["body_small"]),
                Paragraph(package["month7"], styles["body_small"]),
            ]
        )

    table = Table(rows, colWidths=[29 * mm, 35 * mm, 35 * mm, 38 * mm, 35 * mm], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("BACKGROUND", (0, 1), (-1, -1), WHITE),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, SOFT]),
                ("BOX", (0, 0), (-1, -1), 1, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.7, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def custom_table(styles):
    rows = [
        [
            Paragraph("<b>Buget</b>", styles["body_small"]),
            Paragraph("<b>Pachet</b>", styles["body_small"]),
            Paragraph("<b>Volum lunar orientativ</b>", styles["body_small"]),
            Paragraph("<b>Regulă comercială</b>", styles["body_small"]),
        ]
    ]
    for price, name, deliverables in CUSTOM_STEPS:
        rows.append(
            [
                Paragraph(f"<b>{price}</b>", styles["body_small"]),
                Paragraph(name, styles["body_small"]),
                Paragraph(deliverables, styles["body_small"]),
                Paragraph("Nu se cumulează cu reducerile Lite / Launch.", styles["body_small"]),
            ]
        )

    table = Table(rows, colWidths=[22 * mm, 34 * mm, 70 * mm, 42 * mm], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_DARK),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, SOFT]),
                ("BOX", (0, 0), (-1, -1), 1, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.7, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    return table


def visual_summary(styles):
    text = [
        Paragraph("Ce se livrează efectiv", styles["h3"]),
        *bullet_list(
            [
                "Site public complet: homepage, meniu, comandă, rezervări, locații, loyalty, traduceri și SEO mobil.",
                "Aplicație mobilă iOS & Android: meniu, rezervări, wallet, card de fidelitate, notificări push, cont client.",
                "Webadmin securizat: produse, categorii, promoții, comenzi, rezervări, mese, locații, recenzii, utilizatori și raportare.",
                "Sincronizare centralizată prin Firebase: date unice pentru site, mobile și panoul de administrare.",
                "Rezultatul final nu este o prezentare statică, ci o platformă reală cu date, conturi și fluxuri live.",
            ],
            styles,
        ),
    ]
    return text


def add_page_number(canvas, doc):
    canvas.saveState()
    footer_font = "Helvetica"
    if "ProposalArial" in pdfmetrics.getRegisteredFontNames():
        footer_font = "ProposalArial"
    canvas.setFont(footer_font, 9)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(196 * mm, 9 * mm, f"Pagina {doc.page}")
    canvas.drawString(14 * mm, 9 * mm, "Propunere comercială · Laborator Emanuela")
    canvas.restoreState()


def build_story(styles):
    story = []
    story.extend(cover_block(styles))
    story.append(PageBreak())

    story.extend(section_title("1. Rezumat executiv", styles))
    story.extend(
        bullet_list(
            [
                "Propunerea unifică site-ul, aplicația mobilă și webadmin-ul într-un singur ecosistem operațional.",
                "Obiectivul este control total din admin asupra produselor, promoțiilor, rezervărilor, comenzilor și bazei de clienți.",
                "Clientul păstrează proprietatea pe cod, GitHub, Firebase și datele comerciale.",
                f"Dezvoltarea se plătește doar după aprobarea finală a produsului: {money('dacă platforma nu este acceptată, costul dezvoltării este 0 €')}.",
            ],
            styles,
        )
    )

    story.extend(section_title("2. Domeniul proiectului", styles))
    story.extend(visual_summary(styles))

    story.extend(section_title("3. Ce include fiecare componentă", styles))
    component_table = Table(
        [
            [
                Paragraph("<b>Componentă</b>", styles["body_small"]),
                Paragraph("<b>Livrabile principale</b>", styles["body_small"]),
            ],
            [
                Paragraph("<b>Site web public</b>", styles["body_small"]),
                Paragraph(
                    "Pagini de prezentare, meniu dinamic, checkout, cont client, rezervări cu selecție de mese, integrare locații, traduceri RO/EN/HU, bannere promo și SEO mobil.",
                    styles["body_small"],
                ),
            ],
            [
                Paragraph("<b>Aplicație mobilă</b>", styles["body_small"]),
                Paragraph(
                    "Autentificare, meniu sincronizat, comenzi, rezervări, card de fidelitate, portofel digital, vouchere, QR, istoricul comenzilor și notificări push.",
                    styles["body_small"],
                ),
            ],
            [
                Paragraph("<b>Webadmin</b>", styles["body_small"]),
                Paragraph(
                    "Acces doar pentru administratori, CRUD produse/categorii/promoții, vizualizare comenzi și rezervări, gestiune mese și locații, utilizatori, loialitate și panou de rezultate.",
                    styles["body_small"],
                ),
            ],
            [
                Paragraph("<b>Backoffice operațional</b>", styles["body_small"]),
                Paragraph(
                    "Firestore/Firebase, structură de date comună, roluri admin, rapoarte lunare, întreținere și suport pentru lansare.",
                    styles["body_small"],
                ),
            ],
        ],
        colWidths=[37 * mm, 131 * mm],
        repeatRows=1,
    )
    component_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, SOFT]),
                ("BOX", (0, 0), (-1, -1), 1, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.7, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    story.append(component_table)

    story.extend(section_title("4. Pachete și reduceri", styles))
    story.append(package_table(styles))
    story.append(Spacer(1, 5 * mm))
    story.append(
        Paragraph(
            f"<b>Regulă importantă:</b> reducerile Lite și Launch se aplică strict ofertelor bundle. "
            f"Pachetele custom social media {money('de 700 € în jos')} nu beneficiază de reduceri suplimentare și nu se cumulează cu alte discount-uri.",
            styles["body"],
        )
    )

    story.extend(section_title("5. Configuratorul custom social media", styles))
    story.append(custom_table(styles))
    story.append(Spacer(1, 4 * mm))
    story.extend(
        bullet_list(
            [
                "Pachetele custom sunt gândite pentru flexibilitate și negociere rapidă pe buget.",
                "Bugetul de Ads pentru pachetele custom se stabilește separat, în funcție de obiectivele campaniei.",
                "Pentru custom nu se aplică economia de pachet din Lite / Launch.",
            ],
            styles,
        )
    )

    story.extend(section_title("6. Cum se plătește", styles))
    payment_box = Table(
        [
            [
                Paragraph(
                    "<b>Dezvoltare tehnică</b><br/>"
                    "Plata se face după aprobarea finală a platformei livrate. Dacă produsul final nu este aprobat, costul dezvoltării rămâne 0 €.",
                    styles["body_small"],
                ),
                Paragraph(
                    "<b>Abonamente lunare</b><br/>"
                    "Serviciile recurente (social media, Ads, mentenanță) se facturează lunar, la începutul fiecărei luni active de colaborare.",
                    styles["body_small"],
                ),
                Paragraph(
                    "<b>Promoțiile de lansare</b><br/>"
                    "Prețurile promoționale Lite / Launch sunt valabile pentru primele 6 luni. Din luna 7 intră prețul standard de operare.",
                    styles["body_small"],
                ),
            ]
        ],
        colWidths=[56 * mm, 56 * mm, 56 * mm],
    )
    payment_box.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), SOFT),
                ("BOX", (0, 0), (-1, -1), 1, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 1, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ]
        )
    )
    story.append(payment_box)
    story.append(Spacer(1, 4 * mm))
    story.append(
        Paragraph(
            "Bugetul de Ads inclus în pachetele Lite și Launch este transparent și utilizat exclusiv pentru promovarea brandului. Rezultatele și conturile de promovare rămân vizibile clientului.",
            styles["body"],
        )
    )

    story.extend(section_title("7. Ce cumpără efectiv Laborator Emanuela", styles))
    story.extend(
        bullet_list(
            [
                "Un sistem comercial unificat în care același produs, aceeași promoție și aceeași rezervare se văd peste tot: site, mobil, webadmin.",
                "Un canal direct către clienți prin push notifications, fără dependență exclusivă de algoritmii social media.",
                "Un panou de control care scoate proiectul din zona de dummy/demo și îl mută în operare reală, cu date live.",
                "Un cadru clar de lansare: dezvoltare, activare promoțională, mentenanță și scalare după primele 6 luni.",
            ],
            styles,
        )
    )

    story.extend(section_title("8. Pașii următori", styles))
    story.append(
        KeepTogether(
            [
                Paragraph("1. Confirmarea pachetului ales", styles["h3"]),
                Paragraph("Alegem varianta: servicii la bucată, Lite Accelerator, Launch Accelerator sau un custom social media.", styles["body"]),
                Spacer(1, 2 * mm),
                Paragraph("2. Kick-off operațional", styles["h3"]),
                Paragraph("Validăm direcția vizuală, fluxurile de comenzi/rezervări, accesul la conturi și calendarul de lansare.", styles["body"]),
                Spacer(1, 2 * mm),
                Paragraph("3. Livrare și aprobare", styles["h3"]),
                Paragraph("Lansăm platforma, verificăm final și doar după aprobare se închide componenta de dezvoltare.", styles["body"]),
            ]
        )
    )

    story.append(Spacer(1, 8 * mm))
    story.append(
        Paragraph(
            "Document confidențial pregătit pentru Laborator Emanuela. Toate valorile sunt exprimate în EUR și pot fi confirmate în forma finală de colaborare.",
            styles["meta"],
        )
    )

    return story


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    styles = build_styles()
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=14 * mm,
        rightMargin=14 * mm,
        topMargin=14 * mm,
        bottomMargin=16 * mm,
        title="Propunere Laborator Emanuela",
        author="Codex",
    )
    story = build_story(styles)
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(OUTPUT)


if __name__ == "__main__":
    main()
