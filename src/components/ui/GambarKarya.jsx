    export default function GambarKarya({ src, alt, className = "" }) {
    return <img src={src || "/images/placeholder-karya.svg"} alt={alt || ""} className={className} />;
    }
