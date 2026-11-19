    "use client";

    import { useFormStatus } from "react-dom";
    import { Loader2 } from "lucide-react";

    export default function TombolKirim({ children, className, teksMemuat = "Memproses..." }) {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className={className + " disabled:opacity-60 disabled:cursor-not-allowed"}>
        {pending ? (
            <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{teksMemuat}</span>
            </>
        ) : (
            children
        )}
        </button>
    );
    }
