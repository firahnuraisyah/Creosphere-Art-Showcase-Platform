    import { AlertCircle, CheckCircle2 } from "lucide-react";

    export default function Pemberitahuan({ galat, sukses }) {
    if (!galat && !sukses) return null;
    const adalahGalat = Boolean(galat);
    return (
        <div
        role={adalahGalat ? "alert" : "status"}
        className={
            "flex items-start gap-2.5 p-3.5 rounded-md border text-body-sm " +
            (adalahGalat
            ? "bg-rose-50 border-rose-200 text-rose-800"
            : "bg-emerald-50 border-emerald-200 text-emerald-800")
        }
        >
        {adalahGalat ? <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />}
        <span>{galat || sukses}</span>
        </div>
    );
    }
