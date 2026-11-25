"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import Pemberitahuan from "@/components/ui/Pemberitahuan";
import { kelasLabel, kelasInputIkon, kelasTombolUtama } from "@/lib/gaya";

export default function FormLogin({ next, pesanAwal }) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [lihat, setLihat] = useState(false);
    const [galat, setGalat] = useState("");
    const [memuat, setMemuat] = useState(false);

    async function kirim(e) {
        e.preventDefault();
        setGalat("");
        setMemuat(true);
        try {
        const respons = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, next }),
        });
        const data = await respons.json();
        if (!respons.ok) {
            setGalat(data.message || "Gagal masuk.");
            setMemuat(false);
            return;
        }
        router.replace(data.tujuan);
        router.refresh();
        } catch {
        setGalat("Tidak dapat menghubungi server.");
        setMemuat(false);
        }
    }

    return (
        <form onSubmit={kirim} className="space-y-5">
        <Pemberitahuan galat={galat} sukses={galat ? "" : pesanAwal} />
        <div>
            <label htmlFor="email" className={kelasLabel}>
            Alamat Email <span className="text-danger">*</span>
            </label>
            <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-light-on-surface-variant">
                <Mail className="w-4 h-4" />
            </span>
            <input
                type="email" id="email" name="email" required placeholder="seniman@creosphere.com"
                value={email} onChange={(e) => setEmail(e.target.value)} className={kelasInputIkon}
            />
            </div>
        </div>
        <div>
            <label htmlFor="password" className="block text-label-lg text-light-on-surface font-medium mb-1.5">
            Kata Sandi <span className="text-danger">*</span>
            </label>
            <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-light-on-surface-variant">
                <Lock className="w-4 h-4" />
            </span>
            <input
                type={lihat ? "text" : "password"} id="password" name="password" required placeholder="••••••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-DEFAULT bg-light-surface border border-light-outline text-light-on-surface placeholder:text-light-on-surface-variant/50 focus:border-light-primary focus:ring-1 focus:ring-light-primary text-body-md transition-colors"
            />
            <button
                type="button" onClick={() => setLihat(!lihat)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-light-on-surface-variant hover:text-light-on-surface"
                aria-label="Tampilkan atau sembunyikan kata sandi"
            >
                {lihat ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            </div>
        </div>
        <button type="submit" disabled={memuat} className={kelasTombolUtama + " disabled:opacity-60 disabled:cursor-not-allowed"}>
            {memuat ? (
            <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
            </>
            ) : (
            <>
                <span>Masuk ke Creosphere</span>
                <ArrowRight className="w-4 h-4" />
            </>
            )}
        </button>
        </form>
    );
}
