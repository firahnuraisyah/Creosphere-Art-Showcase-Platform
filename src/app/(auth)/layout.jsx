    import FooterAuth from "@/components/layout/FooterAuth";

    export default function LayoutAuth({ children }) {
    return (
        <div className="flex-1 flex flex-col justify-between">
        {children}
        <FooterAuth />
        </div>
    );
    }
