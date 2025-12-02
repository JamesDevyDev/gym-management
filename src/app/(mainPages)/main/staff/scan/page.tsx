'use client';

import { useEffect, useState } from 'react';
import { Camera, CheckCircle, XCircle } from 'lucide-react';
import useStaffStore from '@/zustand/useStaffStore';

/* --- END OF LOCAL TYPES --- */

function Page() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState<boolean>(true);
    const [backendMessage, setBackendMessage] = useState<string | null>(null);

    const { scanQr } = useStaffStore();

    useEffect(() => {
        let qrCodeScanner: import('html5-qrcode').Html5QrcodeScanner | null = null;

        const initScanner = async () => {
            try {
                const { Html5QrcodeScanner } = await import('html5-qrcode');

                qrCodeScanner = new Html5QrcodeScanner(
                    'reader',
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    false
                );

                qrCodeScanner.render(onScanSuccess, onScanFailure);
            } catch (error) {
                console.error('Failed to initialize scanner:', error);
                setScanError('Camera initialization failed.');
            }
        };

        const onScanSuccess = async (decodedText: string) => {
            setScanResult(decodedText);
            setScanError(null);
            setIsScanning(false);

            if (qrCodeScanner) qrCodeScanner.clear();

            try {
                // Parse QR JSON
                const data = JSON.parse(decodedText || '{}');
                if (!data.id) throw new Error('No ID found in QR code');

                // Send to backend using Zustand action
                const result = await scanQr(data.id);

                if (result.success) {
                    setBackendMessage(result.message || 'Successfully sent to backend');
                } else {
                    setBackendMessage(result.message || 'Backend returned an error');
                }
            } catch (err: any) {
                console.error('Error handling scanned QR:', err.message || err);
                setScanError(err.message || 'Invalid QR code');
            }
        };

        const onScanFailure = (error: string) => {
            if (error.includes('NotFoundException')) return;
            setScanError(error);
        };

        initScanner();

        return () => {
            if (qrCodeScanner) qrCodeScanner.clear().catch(console.error);
        };
    }, [scanQr]);

    const handleScanAgain = () => {
        setScanResult(null);
        setScanError(null);
        setBackendMessage(null);
        setIsScanning(true);
    };

    const copyToClipboard = () => {
        if (scanResult) navigator.clipboard.writeText(scanResult);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
                        <Camera className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">QR Code Scanner</h1>
                    <p className="text-gray-600">Position the QR code within the frame</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {isScanning && (
                        <div className="p-4">
                            <div id="reader" className="rounded-lg overflow-hidden"></div>
                        </div>
                    )}

                    {scanResult && (
                        <div className="p-8">
                            <div className="flex items-center justify-center mb-6">
                                <CheckCircle className="w-16 h-16 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
                                Scan Successful!
                            </h2>

                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <p className="text-sm text-gray-500 mb-2">Scanned QR ID:</p>
                                <p className="text-gray-800 break-all font-mono text-sm">
                                    {(() => {
                                        try {
                                            const data = JSON.parse(scanResult || '{}');
                                            return data.id || 'No ID found';
                                        } catch {
                                            return 'Invalid JSON';
                                        }
                                    })()}
                                </p>
                            </div>

                            {backendMessage && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                    <p className="text-green-700 text-sm text-center">{backendMessage}</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={copyToClipboard}
                                    className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                >
                                    Copy to Clipboard
                                </button>
                                <button
                                    onClick={handleScanAgain}
                                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                >
                                    Scan Again
                                </button>
                            </div>
                        </div>
                    )}

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
                                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-6 bg-white/50 backdrop-blur rounded-xl p-6">
                    <h3 className="font-semibold text-gray-800 mb-3">How to use:</h3>
                    <ul className="space-y-2 text-gray-600 text-sm">
                        <li className="flex items-start">
                            <span className="text-indigo-600 mr-2">•</span>
                            Allow camera access when prompted
                        </li>
                        <li className="flex items-start">
                            <span className="text-indigo-600 mr-2">•</span>
                            Position the QR code within the scanning frame
                        </li>
                        <li className="flex items-start">
                            <span className="text-indigo-600 mr-2">•</span>
                            Hold steady until the code is detected
                        </li>
                        <li className="flex items-start">
                            <span className="text-indigo-600 mr-2">•</span>
                            The result will appear automatically
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Page;
