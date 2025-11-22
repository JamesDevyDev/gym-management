import Navigation from "./Navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <div className=' fixed left-[25px] top-[25px]'>
                <Navigation />
            </div>
            {children}
        </div>
    );
}