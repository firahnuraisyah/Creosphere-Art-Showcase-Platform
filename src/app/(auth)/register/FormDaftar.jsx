"use client";

import { useState } from "react";
import { Palette, Award, Info, Check } from "lucide-react";
import Pemberitahuan from "@/components/ui/Pemberitahuan";
import TombolKirim from "@/components/ui/TombolKirim";
import KolomSandi from "@/components/auth/KolomSandi";
import { kelasInput, kelasLabel, kelasTombolUtama } from "@/lib/gaya";

export default function FormDaftar({ aksi, galat }) {
    const [role, setRole] = useState("member");

    return (
        <form action={aksi} className="space-y-5">
            <Pemberitahuan galat={galat} />
            <div>
                <label className="block text-label-lg text-light-on-surface font-medium mb-2">Pilih Peran Anda</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="relative flex flex-col p-4 border border-light-outline-variant bg-light-surface rounded-md cursor-pointer hover:border-sand transition-colors has-[:checked]:border-2 has-[:checked]:border-light-primary has-[:checked]:bg-light-primary-container/20">
                        <input
                            type="radio"
                            name="role"
                            value="member"
                            checked={role === "member"}
                            onChange={() => setRole("member")}
                            className="sr-only"
                        />
                        <div className="flex items-center gap-2 mb-1">
                            <Palette className="w-4 h-4 text-light-primary" />
                            <span className="text-title-md font-semibold text-light-on-surface">Seniman / Member</span>
                        </div>
                        <p className="text-body-sm text-light-on-surface-variant">Unggah karya, ikuti challenge, berinteraksi dengan kreator.</p>
                    </label>
                    <label className="relative flex flex-col p-4 border border-light-outline-variant bg-light-surface rounded-md cursor-pointer hover:border-sand transition-colors has-[:checked]:border-2 has-[:checked]:border-light-primary has-[:checked]:bg-light-primary-container/20">
                        <input
                            type="radio"
                            name="role"
                            value="curator"
                            checked={role === "curator"}
                            onChange={() => setRole("curator")}
                            className="sr-only"
                        />
                        <div className="flex items-center gap-2 mb-1">
                            <Award className="w-4 h-4 text-olive" />
                            <span className="text-title-md font-semibold text-light-on-surface">Curator</span>
                        </div>
                        <p className="text-body-sm text-light-on-surface-variant">Buat challenge, tinjau submisi, tentukan pemenang.</p>
                    </label>
                </div>
                <p className="text-body-sm text-light-on-surface-variant mt-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-info shrink-0" />
                    <span>Akun Curator diverifikasi Admin sebelum dapat mengakses dashboard.</span>
                </p>
            </div>

            <div>
                <label htmlFor="display_name" className={kelasLabel}>
                    Nama Tampilan <span className="text-danger">*</span>
                </label>
                <input type="text" id="display_name" name="display_name" required maxLength={50} placeholder="mis. Maya Lin atau Studio Kroma" className={kelasInput} />
            </div>

            <div>
                <label htmlFor="email" className={kelasLabel}>
                    Alamat Email <span className="text-danger">*</span>
                </label>
                <input type="email" id="email" name="email" required maxLength={100} placeholder="seniman@creosphere.com" className={kelasInput} />
            </div>

            <div>
                <label htmlFor="password" className={kelasLabel}>
                    Kata Sandi <span className="text-danger">*</span>
                </label>
                <KolomSandi id="password" name="password" minLength={8} maxLength={72} placeholder="Minimal 8 karakter, huruf dan angka" />
            </div>

            {role === "curator" && (
                <div className="space-y-4 pt-2 border-t border-light-outline-variant">
                    <div>
                        <label htmlFor="cv" className={kelasLabel}>
                            Unggah CV (PDF / Word) <span className="text-danger">*</span>
                        </label>
                        <input
                            type="file"
                            id="cv"
                            name="cv"
                            required
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            className="w-full text-body-sm text-light-on-surface file:mr-3 file:py-2 file:px-4 file:rounded file:border file:border-light-outline file:text-body-sm file:font-medium file:bg-warm-cream file:text-light-on-surface hover:file:bg-sand/30 cursor-pointer"
                        />
                        <span className="text-xs text-light-on-surface-variant mt-1 block">
                            Format didukung: PDF, DOC, atau DOCX (maksimal 5 MB).
                        </span>
                    </div>
                    <div>
                        <label htmlFor="portfolio_url" className={kelasLabel}>
                            Link Portofolio <span className="text-danger">*</span>
                        </label>
                        <input
                            type="url"
                            id="portfolio_url"
                            name="portfolio_url"
                            required
                            maxLength={255}
                            placeholder="https://portofolio-anda.com"
                            className={kelasInput}
                        />
                    </div>
                </div>
            )}

            <label className="flex items-start gap-2.5 cursor-pointer text-body-sm text-light-on-surface-variant pt-1">
                <input type="checkbox" required className="mt-0.5 rounded border-light-outline text-light-primary focus:ring-light-primary" />
                <span>
                    Saya menyetujui <span className="text-light-primary">Pedoman Komunitas</span> dan menyatakan bahwa karya yang saya unggah menghormati hak kekayaan intelektual.
                </span>
            </label>

            <TombolKirim className={kelasTombolUtama}>
                <span>Selesaikan Pendaftaran</span>
                <Check className="w-4 h-4" />
            </TombolKirim>
        </form>
    );
}
