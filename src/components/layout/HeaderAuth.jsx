import Logo from "@/components/layout/Logo";

export default function HeaderAuth({ kanan = null }) {
    return (
        <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Logo />
        {kanan}
        </header>
    );
}
