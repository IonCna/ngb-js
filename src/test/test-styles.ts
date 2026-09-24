/// <reference types="node" />

import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Lo que en ng-bootstrap hace `files` de `karma.conf.js`: los estilos de test en el documento. Setup de `ngjs test`.
 * Se lee con `fs` y no con `import "./test-styles.css?raw"`: Vitest vacía los `.css` (queda un string vacío).
 */
const style = document.createElement("style");
style.textContent = readFileSync(join(import.meta.dirname, "test-styles.css"), "utf8");
document.head.appendChild(style);
