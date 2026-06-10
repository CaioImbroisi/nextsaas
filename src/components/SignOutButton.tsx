"use client"

import { signOut } from "next-auth/react"

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "0.5rem",
        borderRadius: 6,
        fontSize: 14,
        color: "#ef4444",
        background: "none",
        border: "none",
        cursor: "pointer",
      }}
    >
      Sair
    </button>
  )
}