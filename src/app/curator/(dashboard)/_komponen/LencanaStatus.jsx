    import { Check } from "lucide-react";
    import { labelStatus } from "@/lib/challenge";

    export default function LencanaStatus({ status }) {
    if (status === "aktif") {
        return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-success border border-emerald-200">
            {labelStatus.aktif}
        </span>
        );
    }
    if (status === "berakhir") {
        return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
            <Check className="w-3 h-3" /> {labelStatus.berakhir}
        </span>
        );
    }
    return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-info border border-sky-200">
        {labelStatus.belum_mulai}
        </span>
    );
    }
