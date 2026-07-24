# Configuración de build del sitio

Este documento declara la configuración operacional del build del sitio
canónico del Observatorio Datos México en Cloudflare Workers Builds.

## Build command requerido

El sitio consume el corpus pregunta-respuesta del repositorio público
`Datos-Mexico/observatorio` en build time. Por esa razón, el build
command debe clonar el corpus antes de instalar dependencias y construir
el proyecto.

```
git clone --depth 1 https://github.com/Datos-Mexico/observatorio.git .observatorio && npm ci && npx opennextjs-cloudflare build
```

El clone es superficial (`--depth 1`) y siempre toma el HEAD de la rama
`main` del repositorio del observatorio. No se requiere autenticación:
ambos repositorios son públicos.

El directorio `.observatorio/` se crea durante el build y se consume
desde `lib/preguntas/loader.ts` mediante lectura del filesystem. El
directorio está incluido en `.gitignore` y no debe versionarse en este
repositorio.

Quirk conocido: un build local regenera
`lib/preguntas/registry.generated.ts` contra el HEAD vigente del corpus
y puede dejar el archivo modificado en el working tree con cambios
ajenos a la rama de trabajo. Antes de commitear, restaurar el archivo
(`git checkout -- lib/preguntas/registry.generated.ts`) salvo que la
actualización del corpus sea el objeto del commit (registrado en el
cierre de la Ola 4 del mapa).

## Deploy command

El deploy command no requiere modificaciones respecto a la
configuración previa:

```
npx opennextjs-cloudflare deploy
```

## Trigger del rebuild ante cambios en el corpus

Cada merge a `main` del repositorio `Datos-Mexico/observatorio` dispara
un rebuild automático del sitio. El mecanismo es un Deploy Hook URL de
Cloudflare Workers Builds invocado por un webhook configurado en el
repositorio del observatorio.

La configuración del Deploy Hook y del webhook reside en consolas web
(Cloudflare dashboard y GitHub repo settings); este repositorio no
contiene los secrets ni la URL del hook.

## Notas sobre rutas y dependencias

- `lib/preguntas/loader.ts` lee de `.observatorio/preguntas/*.md` y de
  `.observatorio/templates/banner-*.md` en build time.
- La ruta `/preguntas/[slug]` se preconstruye estáticamente vía
  `generateStaticParams()`.
- Si un archivo del corpus tiene frontmatter inválido contra
  `SCHEMA.md` del observatorio, el build falla explícitamente y reporta
  el archivo y el campo problemático.
- El sitio no escribe en `.observatorio/`. La verdad del corpus reside
  en el repositorio del observatorio.

## Validación local

Para reproducir el comportamiento del build localmente:

```
git clone --depth 1 https://github.com/Datos-Mexico/observatorio.git .observatorio
npm ci
npm run build
```

Para inspeccionar el sitio en modo desarrollo tras el clone:

```
npm run dev
```

Las rutas relevantes son `/preguntas` y `/preguntas/{slug}` para cada
artículo presente en `.observatorio/preguntas/`.
