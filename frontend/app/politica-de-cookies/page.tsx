import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Política de Cookies | AMYTRONICS",
  description:
    "Cómo AMYTRONICS usa cookies y almacenamiento local en su tienda: solo almacenamiento técnico propio, sin publicidad ni rastreadores de terceros.",
};

const LAST_UPDATED = "2 de setiembre de 2026";
const WHATSAPP = "https://wa.me/51934665410";

const storageRows: { name: string; type: string; purpose: string; duration: string }[] = [
  {
    name: "electro_cart",
    type: "Técnica / funcional (propia)",
    purpose:
      "Guarda los productos que agregas al carrito para que sigan ahí mientras navegas y al recargar la página.",
    duration:
      "Hasta que vacías el carrito o borras los datos de navegación de tu equipo.",
  },
  {
    name: "electro_admin_token",
    type: "Técnica / funcional (propia)",
    purpose:
      "Mantiene la sesión iniciada en el panel de administración. Solo se crea para el personal de AMYTRONICS que gestiona el catálogo y los pedidos.",
    duration: "7 días, o hasta cerrar sesión.",
  },
  {
    name: "amytronics_wa_name",
    type: "Personalización (propia)",
    purpose:
      "Recuerda el nombre que escribiste en el chat de WhatsApp para no volver a pedírtelo en una próxima visita.",
    duration:
      "Persistente, hasta que borras los datos de navegación de tu equipo.",
  },
  {
    name: "amytronics_cookie_consent",
    type: "Técnica (propia)",
    purpose:
      "Recuerda que ya viste este aviso, para no mostrártelo en cada página.",
    duration:
      "Persistente, hasta que borras los datos de navegación de tu equipo.",
  },
];

const browserLinks: { label: string; href: string }[] = [
  {
    label: "Google Chrome",
    href: "https://support.google.com/chrome/answer/95647?hl=es",
  },
  {
    label: "Mozilla Firefox",
    href: "https://support.mozilla.org/es/kb/Deshabilitar%20cookies%20de%20terceros",
  },
  {
    label: "Microsoft Edge",
    href: "https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09",
  },
  {
    label: "Safari",
    href: "https://support.apple.com/es-pe/guide/safari/sfri11471/mac",
  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-bold text-text">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-text-muted">
        {children}
      </div>
    </section>
  );
}

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <Breadcrumb items={[{ label: "Política de cookies" }]} />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">
            Política de Cookies
          </h1>
          <p className="mt-2 font-mono text-xs text-text-muted">
            Última actualización: {LAST_UPDATED}
          </p>

          <p className="mt-6 text-sm leading-relaxed text-text-muted">
            Esta política explica cómo <strong>AMYTRONICS</strong> utiliza
            cookies y tecnologías de almacenamiento similares en su tienda en
            línea. Al usar este sitio aceptas el uso del almacenamiento técnico
            que se describe a continuación, necesario para que la tienda
            funcione.
          </p>

          <Section title="¿Qué son las cookies y el almacenamiento local?">
            <p>
              Las cookies son pequeños archivos de texto que un sitio web guarda
              en tu navegador. El «almacenamiento local» (localStorage) cumple
              una función parecida: permite guardar información en tu propio
              equipo para recuperarla en visitas o páginas siguientes, sin
              enviarla a servidores externos.
            </p>
            <p>
              AMYTRONICS usa principalmente almacenamiento local del navegador.
              En esta política los llamamos «almacenamiento» de forma general.
            </p>
          </Section>

          <Section title="¿Qué usa AMYTRONICS?">
            <p>
              Solo usamos <strong>almacenamiento técnico y funcional propio</strong>,
              es decir, el mínimo necesario para que puedas comprar y para
              recordar preferencias básicas. En concreto:
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>
                <strong>No</strong> usamos cookies ni herramientas de publicidad.
              </li>
              <li>
                <strong>No</strong> usamos analítica de terceros (Google
                Analytics, Meta Pixel u otros).
              </li>
              <li>
                <strong>No</strong> compartimos tu información de navegación con
                terceros ni elaboramos perfiles publicitarios.
              </li>
            </ul>
          </Section>

          <Section title="Detalle del almacenamiento que usamos">
            <div className="overflow-x-auto">
              <table className="mt-1 w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border font-mono uppercase tracking-wider text-text-muted">
                    <th className="py-2 pr-3 font-medium">Nombre</th>
                    <th className="py-2 pr-3 font-medium">Tipo</th>
                    <th className="py-2 pr-3 font-medium">Finalidad</th>
                    <th className="py-2 font-medium">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  {storageRows.map((row) => (
                    <tr
                      key={row.name}
                      className="border-b border-border align-top text-text-muted"
                    >
                      <td className="py-2 pr-3 font-mono text-text">{row.name}</td>
                      <td className="py-2 pr-3">{row.type}</td>
                      <td className="py-2 pr-3">{row.purpose}</td>
                      <td className="py-2">{row.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Cookies de terceros">
            <p>
              AMYTRONICS <strong>no utiliza cookies de terceros</strong>. Los
              pagos se realizan por Yape o Plin fuera de este sitio, y el enlace
              a WhatsApp solo se abre cuando tú decides usarlo.
            </p>
          </Section>

          <Section title="¿Cómo desactivar o eliminar el almacenamiento?">
            <p>
              Puedes permitir, bloquear o eliminar el almacenamiento guardado en
              tu equipo desde la configuración de tu navegador. Ten en cuenta
              que, si lo bloqueas, es posible que el carrito y otras funciones
              dejen de funcionar correctamente.
            </p>
            <ul className="ml-4 list-disc space-y-1">
              {browserLinks.map((b) => (
                <li key={b.label}>
                  <a
                    href={b.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent transition hover:underline"
                  >
                    {b.label}
                  </a>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Base legal y consentimiento">
            <p>
              El almacenamiento que usamos es estrictamente necesario para
              prestar el servicio que solicitas (comprar en la tienda) o para
              recordar preferencias que tú mismo configuras. Por su naturaleza
              técnica, está exceptuado del consentimiento previo, pero te
              informamos de su uso mediante el aviso que aparece al entrar al
              sitio.
            </p>
            <p>
              El tratamiento de datos personales que puedas facilitar (por
              ejemplo, al hacer un pedido) se rige por la Ley N.º 29733, Ley de
              Protección de Datos Personales del Perú, y su reglamento.
            </p>
          </Section>

          <Section title="Cambios en esta política">
            <p>
              Podemos actualizar esta política si cambian las funciones del
              sitio o la normativa aplicable. La fecha de la última
              actualización figura al inicio de esta página.
            </p>
          </Section>

          <Section title="Contacto">
            <p>
              Si tienes dudas sobre esta política de cookies, escríbenos por{" "}
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent transition hover:underline"
              >
                WhatsApp al +51 934 665 410
              </a>
              .
            </p>
          </Section>

          <div className="mt-10 border-t border-border pt-6">
            <Link
              href="/"
              className="text-sm font-medium text-accent transition hover:underline"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
