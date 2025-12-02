'use client';

import { useEffect, useState } from 'react';
import { Camera, CheckCircle, XCircle } from 'lucide-react';


/* --- END OF LOCAL TYPES --- */


function Page() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState<boolean>(true);

    useEffect(() => {
        // Fully typed scanner instance
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
                    /* verbose = */ false
                );

                qrCodeScanner.render(onScanSuccess, onScanFailure);
            } catch (error) {
                console.error('Failed to initialize scanner:', error);
                setScanError('Camera initialization failed.');
            }
        };

        const onScanSuccess = (decodedText: string) => {
            setScanResult(decodedText);
            setScanError(null);
            setIsScanning(false);

            if (qrCodeScanner) qrCodeScanner.clear();
        };

        const onScanFailure = (error: string) => {
            // Ignore "no QR found" spam
            if (error.includes('NotFoundException')) return;
            setScanError(error);
        };

        initScanner();

        return () => {
            if (qrCodeScanner) qrCodeScanner.clear().catch(console.error);
        };
    }, []);

    const handleScanAgain = () => {
        setScanResult(null);
        setScanError(null);
        setIsScanning(true);
        window.location.reload(); // simplest reset
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
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-500 mb-2">Scanned Content:</p>
                                <p className="text-gray-800 break-all font-mono text-sm">{scanResult}</p>
                            </div>
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
