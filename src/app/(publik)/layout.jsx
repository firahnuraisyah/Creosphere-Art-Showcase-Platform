    import NavbarPublik from "@/components/layout/NavbarPublik";
    import FooterPublik from "@/components/layout/FooterPublik";

    export default function LayoutPublik({ children }) {
    return (
        <>
        <NavbarPublik />
        <div className="flex-1 flex flex-col">{children}</div>
        <FooterPublik />
        </>
    );
    }
