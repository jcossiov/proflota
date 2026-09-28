/**
 * Hecho por JESUS COSSIO DEV
 * Sistema de diseño accesible (WCAG AA/AAA) optimizado para transportistas (30-70 años)
 */
export const theme = {

  // ── COLORES (Alto contraste y legibilidad en cabina) ──
  colors: {
    // Fondos (identidad azul marino NAVIRA)
    bgPrimary:   "#0A1A2F",  // fondo principal
    bgCard:      "#0F2340",  // cards
    bgSection:   "#081527",  // secciones secundarias / inputs sobre card

    // Texto de alto contraste
    textPrimary:   "#F8FAFC", // títulos (blanco nítido)
    textSecondary: "#ADC2DE", // labels legibles (>7:1 ratio)
    textTertiary:  "#8FAECF", // hints y placeholders claros (>4.8:1 ratio)

    // Acciones — azul
    blue:        "#1565FF",  // azul de marca (botones sólidos)
    blueText:    "#60A5FA",  // azul legible para TEXTO sobre fondo oscuro
    blueSoft:    "#132847",  // fondo azul suave (tinte oscuro)
    blueBorder:  "#2A4E82",  // borde azul suave
    blueDark:    "#0A1A2F",  // azul oscuro para gradientes

    // Ganancia — el color más importante
    green:       "#22C55E",  // ganancia, éxito
    greenDeep:   "#12A150",  // verde oscuro para gradientes (FE-34)
    greenSoft:   "#0F2C20",  // fondo verde suave (tinte oscuro)
    greenBorder: "#1E5138",  // borde verde suave

    // Gastos
    red:         "#EF4444",  // gastos, pérdida, eliminar
    redText:     "#FF7B73",  // rojo legible para texto sobre fondo oscuro
    redSoft:     "#2C1517",  // fondo rojo suave (tinte oscuro)
    redBorder:   "#5A2A2C",  // borde rojo suave

    // Advertencia
    amber:       "#F59E0B",  // margen bajo, advertencia
    amberSoft:   "#2A2012",  // fondo amber suave (tinte oscuro)
    amberBorder: "#5A431A",  // borde amber suave

    // Bordes
    border:      "#213A5C",  // borde general
    borderLight: "#193150",  // borde muy suave (hairline visible)
  },

  // ── TIPOGRAFÍA ERGONÓMICA (Legible para rango 30–70 años) ──
  fonts: {
    sizeXs:   "12px",
    sizeSm:   "14px",
    sizeMd:   "16px",
    sizeLg:   "18px",
    sizeXl:   "22px",
    size2xl:  "28px",
    size3xl:  "34px",

    weightNormal:  "400",
    weightMedium:  "500",
    weightSemibold:"600",
    weightBold:    "700",
    weightBlack:   "800",
  },

  // ── NÚMEROS ──
  // Spread this en cualquier cifra de dinero para que los dígitos queden
  // alineados en columna: style={{ ...t.numeric }}
  numeric: {
    fontVariantNumeric: "tabular-nums",
    fontFeatureSettings: '"tnum" 1',
    letterSpacing: "-0.3px",
  },

  // ── ESPACIADO ──
  spacing: {
    xs:  "4px",
    sm:  "8px",
    md:  "12px",
    lg:  "16px",
    xl:  "20px",
    xxl: "24px",
  },

  // ── BORDES (un pelín más redondeados = más moderno) ──
  radius: {
    sm:  "10px",
    md:  "12px",
    lg:  "16px",
    xl:  "20px",
    full:"9999px",
  },

  // ── SOMBRAS (más profundas para que las cards "floten" sobre el oscuro) ──
  shadows: {
    card: "0 10px 30px -18px rgba(0,0,0,0.55)",
    md:   "0 18px 40px -22px rgba(0,0,0,0.60)",
  },
};