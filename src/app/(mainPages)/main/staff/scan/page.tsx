'use client';

import { useEffect, useState, useRef } from 'react';
import { Camera, CheckCircle, XCircle } from 'lucide-react';
import useStaffStore from '@/zustand/useStaffStore';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/zustand/useAuthStore';

function Page() {
    // ✅ ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL RETURNS
    const { getAuthUserFunction } = useAuthStore();
    const router = useRouter();
    const { scanQr } = useStaffStore();

    // Auth state
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Scanner state
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState<boolean>(true);
    const [backendMessage, setBackendMessage] = useState<string | null>(null);

    // Keep scanner instance between renders
    const scannerRef = useRef<any>(null);

    // ---------------------------
    // Auth Check Effect
    // ---------------------------
    useEffect(() => {
        const checkRole = async () => {
            const userData: any = await getAuthUserFunction();

            if (!userData || userData.role !== 'staff') {
                router.replace('/main');
                return;
            }

            setUser(userData);
            setLoading(false);
        };

        checkRole();
    }, [router, getAuthUserFunction]);

    // ---------------------------
    // Restartable scanner function
    // ---------------------------
    const startScanner = async () => {
        try {
            const { Html5QrcodeScanner } = await import('html5-qrcode');

            if (scannerRef.current) {
                await scannerRef.current.clear().catch(() => { });
            }

            scannerRef.current = new Html5QrcodeScanner(
                'reader',
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                false
            );

            scannerRef.current.render(onScanSuccess, onScanFailure);
        } catch (error) {
            console.error('Failed to start scanner:', error);
            setScanError('Camera failed to start.');
        }
    };

    // ---------------------------
    // Initialize scanner ONLY after auth passes
    // ---------------------------
    useEffect(() => {
        // Only start scanner if user is authenticated and loading is done
        if (!loading && user) {
            startScanner();
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => { });
            }
        };
    }, [loading, user]);

    // ---------------------------
    // Scan Success
    // ---------------------------
    const onScanSuccess = async (decodedText: string) => {
        setScanResult(decodedText);
        setScanError(null);
        setIsScanning(false);

        if (scannerRef.current) {
            await scannerRef.current.clear().catch(() => { });
        }

        try {
            const data = JSON.parse(decodedText || '{}');
            if (!data.id) throw new Error('No ID found in QR code');

            const result = await scanQr(data.id);

            if (result.success) {
                setBackendMessage(result.message || 'Successfully logged.');
            } else {
                setBackendMessage(result.message || 'Backend returned an error.');
            }
        } catch (err: any) {
            setScanError(err.message || 'Invalid QR code');
        }
    };

    // ---------------------------
    // Scan Failure (ignore minor errors)
    // ---------------------------
    const onScanFailure = (error: string) => {
        if (error.includes('NotFoundException')) return;
        setScanError(error);
    };

    // ---------------------------
    // Scan Again Handler
    // ---------------------------
    const handleScanAgain = async () => {
        setScanResult(null);
        setScanError(null);
        setBackendMessage(null);
        setIsScanning(true);

        await startScanner();
    };

    // Helper: Get parsed JSON
    const parsed = (() => {
        try {
            return scanResult ? JSON.parse(scanResult) : null;
        } catch {
            return null;
        }
    })();

    // ✅ NOW IT'S SAFE TO DO CONDITIONAL RENDERING (AFTER ALL HOOKS)
    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-screen bg-gray-100">
                <p className="text-gray-500 font-semibold">Checking access...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">QR Code Scanner</h1>
                    <p className="text-gray-600">Position the QR code within the frame</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Scanner Section */}
                    {isScanning && (
                        <div className="p-4">
                            <div id="reader" className="rounded-lg overflow-hidden"></div>
                        </div>
                    )}

                    {/* Success Section */}
                    {scanResult && (
                        <div className="p-8">
                            <div className="flex items-center justify-center mb-6">
                                <CheckCircle className="w-16 h-16 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
                                Scan Successful!
                            </h2>

                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-500 mb-2">Scanned ID:</p>
                                <p className="font-mono">{parsed?.id || '—'}</p>

                                <p className="text-sm text-gray-500 mb-2 mt-4">Username:</p>
                                <p className="font-mono">{parsed?.username || '—'}</p>
                            </div>

                            {backendMessage && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                    <p className="text-green-700 text-sm text-center">{backendMessage}</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={handleScanAgain}
                                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition font-medium"
                                >
                                    Scan Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error Section */}
                    {scanError && !scanResult && (
                        <div className="p-8">
                            <div className="flex items-center justify-center mb-6">
                                <XCircle className="w-16 h-16 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
                                Scan Error
                            </h2>
                            <p className="text-gray-600 text-center mb-6">{scanError}</p>

                            <button
                                onClick={handleScanAgain}
                                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Page;
