"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { kelasInput } from "@/lib/gaya";

export default function KolomSandi({ id, name, placeholder, minLength, maxLength }) {
    const [lihat, setLihat] = useState(false);
    return (
        <div className="relative">
        <input
            type={lihat ? "text" : "password"}
            id={id}
            name={name}
            required
            minLength={minLength}
            maxLength={maxLength}
            placeholder={placeholder}
            className={kelasInput + " pr-10"}
        />
        <button
            type="button"
            onClick={() => setLihat(!lihat)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-light-on-surface-variant hover:text-light-on-surface"
            aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        >
            {lihat ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        </div>
    );
}
