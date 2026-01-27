"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cuboid } from "lucide-react";
import clsx from "clsx";

const nav = [
  { href: "/block-status", icon: Cuboid, label: "Block Status" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "group fixed inset-y-0 left-0 z-40",
        "flex w-16 hover:w-56",
        "transition-[width] duration-300 ease-in-out",
        "bg-background border-r",
      )}
    >
      <nav className="flex flex-col gap-2 p-2 w-full">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-md px-3 py-2",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-muted transition-colors",
                active && "bg-muted text-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span
                className={clsx(
                  "whitespace-nowrap overflow-hidden",
                  "opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-200",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
