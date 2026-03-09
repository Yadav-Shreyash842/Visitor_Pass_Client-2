import { useState, useEffect, useRef } from 'react';
import { Download, QrCode, Calendar, CheckCircle, FileDown } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../api/axios';

const Passes = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const badgeRef = useRef(null);

  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pass');
      setPasses(response.data || []);
    } catch (error) {
      console.error('Error fetching passes:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPass = (pass) => {
    // Create a simple pass download (you can enhance this)
    const passInfo = `
      Visitor Pass
      Pass Code: ${pass.passCode}
      Visitor: ${pass.visitor?.name || 'N/A'}
      Valid From: ${new Date(pass.validFrom).toLocaleDateString()}
      Valid To: ${new Date(pass.validTo).toLocaleDateString()}
    `;
    
    const blob = new Blob([passInfo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pass-${pass.passCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadPDFBadge = async (pass) => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a6' // Badge size
      });

      // Add border and styling
      pdf.setDrawColor(0, 149, 233); // Primary blue
      pdf.setLineWidth(1);
      pdf.rect(5, 5, 95, 138);

      // Header background
      pdf.setFillColor(14, 165, 233);
      pdf.rect(5, 5, 95, 30, 'F');

      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(255, 255, 255);
      pdf.text('VISITOR PASS', 52.5, 20, { align: 'center' });

      // Visitor info
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Visitor Name:', 15, 45);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text(pass.visitor?.name || 'N/A', 15, 52);

      // Pass Code
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(10);
      pdf.text('Pass Code:', 15, 62);
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text(pass.passCode, 15, 68);

      // Validity
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(10);
      pdf.text('Valid From:', 15, 78);
      pdf.text(new Date(pass.validFrom).toLocaleDateString(), 15, 83);
      pdf.text('Valid To:', 15, 93);
      pdf.text(new Date(pass.validTo).toLocaleDateString(), 15, 98);

      // QR Code placeholder text
      pdf.setFontSize(10);
      pdf.text('QR Code:', 15, 113);
      pdf.text('(Scan for details)', 15, 118);

      // Note: For actual QR code in PDF, you'd need to convert QRCodeSVG to image
      // This is a simplified version

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Please wear this badge at all times', 52.5, 135, { align: 'center' });

      // Save PDF
      pdf.save(`visitor-badge-${pass.passCode}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF badge');
    }
  };

  const isPassActive = (pass) => {
    const now = new Date();
    return new Date(pass.validFrom) <= now && new Date(pass.validTo) >= now;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Visitor Passes</h1>
        <p className="text-gray-500 mt-1">View and manage visitor passes</p>
      </div>

      {/* Passes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {passes.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No passes found</p>
          </div>
        ) : (
          passes.map((pass) => (
            <div
              key={pass._id}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 card-hover"
            >
              {/* Pass Header */}
              <div className={`p-4 ${isPassActive(pass) ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">
                      {isPassActive(pass) ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <span className="text-sm opacity-90">
                    Pass #{pass.passCode.slice(0, 8)}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div className="p-6 bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <QRCodeSVG
                    value={JSON.stringify({
                      passCode: pass.passCode,
                      visitorId: pass.visitor?._id,
                      validFrom: pass.validFrom,
                      validTo: pass.validTo
                    })}
                    size={160}
                    level="H"
                  />
                </div>
              </div>

              {/* Pass Details */}
              <div className="p-6 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Visitor Name</p>
                  <p className="font-semibold text-gray-900">
                    {pass.visitor?.name || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">
                    {pass.visitor?.email || 'N/A'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Valid From</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(pass.validFrom).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Valid To</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(pass.validTo).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => downloadPDFBadge(pass)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium shadow-md hover:shadow-lg"
                  >
                    <FileDown className="w-4 h-4" />
                    Download PDF Badge
                  </button>
                  <button
                    onClick={() => downloadPass(pass)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download Text
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Passes;
