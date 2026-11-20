    "use client";

    export default function TombolKonfirmasi({ aksi, nilai = {}, pesan, className, children, judul }) {
    return (
        <form
        action={aksi}
        onSubmit={(e) => {
            if (!confirm(pesan)) e.preventDefault();
        }}
        >
        {Object.entries(nilai).map(([nama, isi]) => (
            <input key={nama} type="hidden" name={nama} value={isi} />
        ))}
        <button type="submit" className={className} title={judul}>
            {children}
        </button>
        </form>
    );
    }
