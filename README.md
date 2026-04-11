# ⚡ MasterTableros Pro — MVP

Herramienta PWA para diseñar tableros eléctricos de distribución.

## 🚀 Despliegue en 3 minutos

### Opción A — Netlify (recomendado, gratis)

1. Crear cuenta en https://netlify.com
2. Arrastrar la carpeta del proyecto a https://app.netlify.com/drop
3. ¡Listo! URL pública en segundos.

O por CLI:
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=build
```

### Opción B — Vercel (gratis)

```bash
npm install -g vercel
npm run build
vercel --prod
```

### Opción C — Correr localmente

```bash
npm install
npm start
# Abre http://localhost:3000
```

## 📱 Instalar como PWA en Android

1. Abrir la URL en Chrome
2. Tocar los 3 puntitos (menú)
3. Seleccionar "Agregar a pantalla de inicio" o "Instalar aplicación"
4. ¡La app queda instalada como nativa!

## 📱 Instalar en iOS (Safari)

1. Abrir la URL en Safari
2. Tocar el ícono de compartir (□↑)
3. Seleccionar "Agregar a pantalla de inicio"

## ✨ Funcionalidades del MVP

- ✅ 4 rieles DIN con 24 módulos cada uno
- ✅ Biblioteca de 13 componentes eléctricos
- ✅ Arrastrar y soltar con snap automático al riel
- ✅ Etiquetado inline (doble clic) o modal (botón / F2)
- ✅ Exportación a PDF con lista de materiales
- ✅ PWA instalable (manifest + service worker)
- ✅ Funciona offline una vez instalada

## ⌨️ Atajos de teclado

| Tecla | Acción |
|-------|--------|
| Clic | Seleccionar componente |
| Doble clic | Editar etiqueta inline |
| F2 | Abrir modal de etiqueta |
| Delete / Backspace | Eliminar componente seleccionado |

## 🛠️ Stack técnico

- React 18 (CRA)
- SVG puro para el canvas y los componentes
- jsPDF para exportación (cargado dinámicamente)
- PWA: manifest.json + service worker

## 📋 Catálogo incluido

**PROTECCIONES**
- Térmica 1P: 6A, 10A, 16A, 20A
- Térmica 2P: 25A, 32A
- Térmica 4P: 40A, 63A

**DIFERENCIALES**
- Diferencial 2P 25A 30mA
- Diferencial 2P 40A 30mA
- Diferencial 4P 40A 30mA

**ACCESORIOS**
- Borne 6mm²
- Borne 16mm²
- Espacio libre
