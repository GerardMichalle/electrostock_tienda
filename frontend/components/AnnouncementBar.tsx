const MESSAGE = "Envío a todo el Perú por compras mayores a S/150";

export default function AnnouncementBar() {
  return (
    <div className="overflow-hidden border-b border-border bg-accent text-white">
      {/* Un solo texto que cruza toda la pantalla de derecha a izquierda y
          vuelve a empezar. El pl-[100%] lo arranca fuera del borde derecho.
          Pausa al pasar el cursor; se detiene con prefers-reduced-motion. */}
      <div className="group py-1.5 font-mono text-[11px] tracking-wide select-none motion-reduce:hidden">
        <span className="announce-track inline-block pl-[100%] whitespace-nowrap group-hover:[animation-play-state:paused]">
          {MESSAGE}
        </span>
      </div>

      {/* Fallback estático para quien reduce el movimiento */}
      <p className="hidden py-1.5 text-center font-mono text-[11px] tracking-wide motion-reduce:block">
        {MESSAGE}
      </p>
    </div>
  );
}
