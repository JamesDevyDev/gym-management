import Navigation from "./Navigation";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <div className=' fixed left-[25px] top-[25px]'>
                <Navigation />
            </div>
            {children}
        </div>
    );
}
