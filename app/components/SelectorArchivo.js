"use client";

import { useId } from "react";
import { Image as ImageIcon } from "lucide-react";

// Selector de archivo en español: el input nativo queda oculto pero
// enfocable (sigue validando `required`) y el <label> hace de botón.
export function SelectorArchivo({ archivo, texto = "Elegir foto", inputRef, ...inputProps }) {
  const id = useId();
  return (
    <span className="selector-archivo">
      <input ref={inputRef} id={id} type="file" className="selector-archivo__input" {...inputProps} />
      <label htmlFor={id} className="btn-outline-gold selector-archivo__boton">
        <ImageIcon size={15} aria-hidden="true" />
        {texto}
      </label>
      <span className="selector-archivo__nombre" aria-live="polite">
        {archivo?.name ?? "Ningún archivo"}
      </span>
    </span>
  );
}
