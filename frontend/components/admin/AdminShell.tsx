"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  CreditCard,
  LayoutGrid,
  LogOut,
  Package,
  Store,
  Tags,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { useAdminAuth } from "@/lib/admin-store";
import logoMark from "@/src/img/logo-mark.png";

const navItems: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/admin", label: "Resumen", Icon: LayoutGrid },
  { href: "/admin/productos", label: "Productos", Icon: Package },
  { href: "/admin/categorias", label: "Categorías", Icon: Tags },
  { href: "/admin/pedidos", label: "Pedidos", Icon: ClipboardList },
  { href: "/admin/configuracion", label: "Pagos", Icon: CreditCard },
  { href: "/admin/cuenta", label: "Mi cuenta", Icon: UserCog },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAdminAuth();

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-bg md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <Image
            src={logoMark}
            alt="AMYTRONICS"
            width={28}
            height={28}
            loading="eager"
            className="h-7 w-7"
          />
          <span className="font-display text-sm font-bold uppercase">
            Panel admin
          </span>
        </div>

        <Link
          href="/"
          className="flex items-center gap-2 border-b border-border px-5 py-2.5 text-xs font-medium text-text-muted transition hover:text-accent"
        >
          <Store className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          Ver tienda
        </Link>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={`flex items-center gap-2 px-3 py-2 text-sm transition ${
                isActive(pathname, item.href)
                  ? "bg-accent/10 font-medium text-accent"
                  : "text-text-muted hover:bg-surface hover:text-text"
              }`}
            >
              <item.Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          {user?.email && (
            <p
              className="mb-2 truncate px-1 font-mono text-[11px] text-text-muted"
              title={user.email}
            >
              {user.email}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 border border-border px-3 py-2 text-left text-sm text-text-muted transition hover:border-accent hover:text-accent"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="md:hidden">
          <header className="flex h-14 items-center justify-between border-b border-border bg-bg px-4">
            <span className="flex items-center gap-2">
              <Image
                src={logoMark}
                alt="AMYTRONICS"
                width={24}
                height={24}
                loading="eager"
                className="h-6 w-6"
              />
              <span className="font-display text-sm font-bold uppercase">
                Panel admin
              </span>
            </span>
            <Link
              href="/"
              className="flex items-center gap-1 font-mono text-xs text-accent"
            >
              <Store className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
              Ver tienda
            </Link>
          </header>
          <nav className="flex items-center gap-1 overflow-x-auto border-b border-border bg-bg px-2 py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={`shrink-0 border px-3 py-1.5 text-xs font-medium transition ${
                  isActive(pathname, item.href)
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-text-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="ml-1 shrink-0 border border-border px-3 py-1.5 text-xs font-medium text-text-muted transition hover:border-accent hover:text-accent"
            >
              Salir
            </button>
          </nav>
        </div>

        <main className="flex-1 p-4 sm:p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
