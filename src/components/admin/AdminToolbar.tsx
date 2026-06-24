"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Admin Toolbar — WordPress-style fixed bar at the top of the page
 * for logged-in users. Shows quick links to admin, new post, profile,
 * and a logout button.
 *
 * Usage: <AdminToolbar />
 */
export default function AdminToolbar() {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      id="wpadminbar"
      className={`fixed top-0 left-0 right-0 z-[99999] transition-all duration-200 ${
        scrolled ? "shadow-lg" : ""
      }`}
      style={{
        background: "linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%)",
        color: "#f8fafc",
        fontSize: "13px",
        height: "40px",
        display: visible ? "flex" : "none",
        alignItems: "center",
        padding: "0 16px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Logo */}
      <span
        style={{
          fontWeight: 700,
          fontSize: "14px",
          marginRight: "20px",
          color: "#3b82f6",
          letterSpacing: "-0.3px",
        }}
      >
        Rake
      </span>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
        <ToolbarLink href="/admin" label="Dashboard" icon="📊" />
        <ToolbarLink href="/admin/posts" label="Posts" icon="📝" />
        <ToolbarLink href="/admin/posts/new" label="New" icon="➕" />
        <ToolbarLink href="/admin/media" label="Media" icon="🖼" />
        <ToolbarLink href="/admin/comments" label="Comments" icon="💬" />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right side */}
      <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
        <ToolbarLink href="/profile" label="Profile" icon="👤" />
        <a
          href="/api/auth/logout"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 10px",
            borderRadius: "4px",
            color: "#f87171",
            fontSize: "12px",
            textDecoration: "none",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(248,113,113,0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          Logout
        </a>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setVisible(!visible)}
        style={{
          position: "fixed",
          top: visible ? "40px" : "0",
          right: "8px",
          background: "#1e1e2e",
          border: "none",
          color: "#94a3b8",
          cursor: "pointer",
          fontSize: "10px",
          padding: "2px 6px",
          borderRadius: "0 0 4px 4px",
          zIndex: 99999,
          transition: "top 0.2s",
        }}
        title={visible ? "Hide toolbar" : "Show toolbar"}
      >
        {visible ? "▲" : "▼"}
      </button>

      {/* Push page content down */}
      <style jsx global>{`
        body {
          padding-top: 40px !important;
        }
        #wpadminbar + * {
          margin-top: 0;
        }
      `}</style>
    </div>
  );
}

function ToolbarLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 10px",
        borderRadius: "4px",
        color: "#cbd5e1",
        fontSize: "12px",
        textDecoration: "none",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
        e.currentTarget.style.color = "#f8fafc";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#cbd5e1";
      }}
    >
      <span style={{ fontSize: "11px" }}>{icon}</span>
      {label}
    </Link>
  );
}
