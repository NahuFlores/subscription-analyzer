# Guía para Crear Formas SVG Morphing

Para crear tus propias formas animadas con AnimeJS, necesitas obtener el atributo `d` (los datos del trazado) de un SVG. Aquí te explico cómo hacerlo paso a paso.

## 1. Crear la forma
Puedes usar cualquier herramienta de diseño vectorial:
- **Figma** (Recomendado)
- Adobe Illustrator
- Inkscape
- Editor SVG online (como [yqnn.github.io/svg-path-editor/](https://yqnn.github.io/svg-path-editor/))

> **💡 Tip importante:** Todas las formas deben "caber" en el mismo espacio (ViewBox). En nuestro caso, usamos un cuadrado de **40x40 píxeles**.

## 2. Reglas para un buen morphing
Para que la animación sea suave y no haga cosas extrañas:
1. **Un solo `path`**: Si tu icono tiene varias partes separadas, debes unirlas en una sola forma compuesta (Compound Path).
   - En Figma: Selecciona todo -> `Object` -> `Outline Stroke` (si son líneas) -> `Boolean Groups` -> `Union` -> `Flatten`.
2. **Mismo ViewBox**: Asegúrate de que todas tus formas se exporten con las mismas dimensiones (40x40).
3. **Complejidad similar**: Intenta que las formas tengan una cantidad similar de puntos (nodos). AnimeJS es muy bueno interpolando, pero resultados extremos pueden verse raros.

## 3. Obtener el código (Path Data)

### Desde Figma:
1. Dibuja tu icono en un frame de 40x40.
2. Haz click derecho en el icono -> **Copy/Paste as** -> **Copy as SVG**.
3. Pega el código en un editor de texto. Se verá así:
   ```html
   <svg width="40" height="40" viewBox="0 0 40 40" ...>
       <path d="M10 12C10 9.79086 11.7909... H14Z" fill="..."/>
   </svg>
   ```
4. Lo único que necesitas es lo que está dentro de las comillas de `d="..."`.
   - Copia esa larga cadena de texto: `M10 12C10 9.79086...`

## 4. Agregarlo a tu código

Abre el archivo `frontend/js/magic-navbar.js` y busca la clase `LogoMorph`.

```javascript
// Agrega tu nueva forma
this.myNewShape = "PEGA_AQUI_EL_CODIGO_QUE_COPIASTE";

// Úsala en la animación
this.anim = anime({
    targets: this.path,
    d: [
        { value: this.shape1 },
        { value: this.myNewShape }, // <--- Tu nueva forma
        { value: this.shape2 }
    ],
    // ...
});
```

## Ejemplo Práctico: Crear un Círculo
Si quisieras agregar un círculo simple centrado:

1. **Código SVG del círculo (40x40):**
   `M20 20 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0`
   *(Esto es un círculo de radio 10 en la posición 20,20)*

2. **En magic-navbar.js:**
   ```javascript
   this.circleShape = "M20 20 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0";
   ```

3. **Agregar a la secuencia:**
   ```javascript
   d: [
       { value: this.shape1 },
       { value: this.circleShape }, // El morph pasará por el círculo
       { value: this.shape2 }
   ]
   ```
