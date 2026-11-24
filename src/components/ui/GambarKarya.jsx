"use client";

const CADANGAN = "/images/placeholder-karya.svg";

export default function GambarKarya({ src, alt, className = "", style }) {
    return (
        <img
        src={src || CADANGAN}
        alt={alt || ""}
        className={className}
        style={style}
        onError={(e) => {
            if (!e.currentTarget.src.endsWith(CADANGAN)) e.currentTarget.src = CADANGAN;
        }}
        />
    );
}
