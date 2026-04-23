import { useState, useEffect } from 'react';
import { Download, Calendar, Clock, User, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';

const MyPass = () => {
  const { user } = useAuth();
  const [visitor, setVisitor] = useState(null);
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyPass();
  }, []);

  const fetchMyPass = async () => {
    try {
      setLoading(true);
      
      const visitorRes = await api.get('/visitors');
      const visitors = Array.isArray(visitorRes.data) ? visitorRes.data : [];
      
      // Find visitor record matching user's email
      const myVisitor = visitors.find(
        v => v.email?.toLowerCase() === user?.email?.toLowerCase()
      );

      if (!myVisitor) {
        setError('No visitor application found. Please complete visitor registration or contact staff.');
        setLoading(false);
        return;
      }

      setVisitor(myVisitor);

      // If visitor is approved or checked-in, fetch their pass
      if (myVisitor.status === 'approved' || myVisitor.status === 'checked-in') {
        const passRes = await api.get('/pass');
        const passes = Array.isArray(passRes.data) ? passRes.data : [];
        const myPass = passes.find(
          p => p.visitor?._id === myVisitor._id || p.visitor === myVisitor._id
        );
        setPass(myPass || null);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching pass:', error);
      setError(error.response?.data?.message || 'Failed to fetch pass data. Please contact staff.');
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!pass) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a6'
    });

    // Background
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 105, 148, 'F');

    // White card
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(5, 5, 95, 138, 3, 3, 'F');

    // Title
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246);
    doc.text('VISITOR PASS', 52.5, 15, { align: 'center' });

    // Pass Code
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Pass Code: ${pass.passCode}`, 52.5, 25, { align: 'center' });

    // Visitor Name
    doc.setFontSize(14);
    doc.text(visitor.name, 52.5, 35, { align: 'center' });

    // QR Code (canvas-based)
    const qrCanvas = document.createElement('canvas');
    const qrContext = qrCanvas.getContext('2d');
    qrCanvas.width = 200;
    qrCanvas.height = 200;
    
    // Get QR code SVG and convert to canvas
    const qrSvg = document.querySelector('.pass-qr-code svg');
    if (qrSvg) {
      const svgData = new XMLSerializer().serializeToString(qrSvg);
      const img = new Image();
      img.onload = function() {
        qrContext.drawImage(img, 0, 0, 200, 200);
        const qrDataUrl = qrCanvas.toDataURL('image/png');
        doc.addImage(qrDataUrl, 'PNG', 27.5, 45, 50, 50);

        // Details
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        
        const validFrom = new Date(pass.validFrom).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        const validTo = new Date(pass.validTo).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        doc.text(`Valid From: ${validFrom}`, 52.5, 105, { align: 'center' });
        doc.text(`Valid To: ${validTo}`, 52.5, 112, { align: 'center' });
        doc.text(`Purpose: ${visitor.purpose || 'N/A'}`, 52.5, 119, { align: 'center' });
        doc.text(`Host: ${visitor.host || 'N/A'}`, 52.5, 126, { align: 'center' });

        // Footer
        doc.setFontSize(7);
        doc.text('Please present this pass at reception', 52.5, 135, { align: 'center' });

        doc.save(`visitor-pass-${pass.passCode}.pdf`);
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !visitor) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-gray-600 text-lg mb-4">{error || 'No visitor record found'}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Need to register as a visitor?</strong>
          </p>
          <p className="text-sm text-blue-700">
            If you registered as a user but need a visitor pass, please:
          </p>
          <ol className="text-sm text-blue-700 ml-4 mt-2 list-decimal">
            <li>Contact staff to create your visitor application</li>
            <li>Or use the "Visitor Registration" form with photo and ID</li>
            <li>Wait for approval from security/admin</li>
          </ol>
        </div>
      </div>
    );
  }

  // Pending status
  if (visitor.status === 'pending') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Pending</h2>
          <p className="text-gray-600 mb-6">
            Your visitor application is under review. You will receive an email notification once it's processed.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Your Details:</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {visitor.name}</p>
              <p><span className="font-medium">Email:</span> {visitor.email}</p>
              <p><span className="font-medium">Purpose:</span> {visitor.purpose}</p>
              <p><span className="font-medium">Host:</span> {visitor.host}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rejected status
  if (visitor.status === 'rejected') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Rejected</h2>
          <p className="text-gray-600 mb-4">
            Unfortunately, your visitor application has been rejected.
          </p>
          {visitor.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <span className="font-semibold">Reason:</span> {visitor.rejectionReason}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Please contact the administration for more information.
          </p>
        </div>
      </div>
    );
  }

  // Approved - Show Digital Pass
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Digital Pass</h1>
        <p className="text-gray-600">Your approved visitor pass with QR code</p>
      </div>

      {!pass ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Pass is being generated. Please refresh the page in a moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Digital Pass Card */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg p-6 text-white">
            <div className="bg-white rounded-lg p-6 text-gray-900">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-primary-600 mb-1">VISITOR PASS</h2>
                <p className="text-gray-600 text-sm">Pass Code: {pass.passCode}</p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-4 pass-qr-code">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    value={JSON.stringify({
                      passCode: pass.passCode,
                      visitor: visitor.name,
                      validFrom: pass.validFrom,
                      validTo: pass.validTo
                    })}
                    size={180}
                    level="H"
                  />
                </div>
              </div>

              {/* Visitor Info */}
              <div className="space-y-2 text-center">
                <p className="font-semibold text-lg">{visitor.name}</p>
                <p className="text-sm text-gray-600">{visitor.email}</p>
              </div>

              {/* Download Button */}
              <button
                onClick={downloadPDF}
                className="w-full mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                Download PDF Badge
              </button>
            </div>
          </div>

          {/* Pass Details */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-900">Status</h3>
              </div>
              <p className="text-sm text-green-600 font-medium capitalize">{visitor.status}</p>
            </div>

            {/* Validity */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">Validity Period</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Valid From:</p>
                  <p className="font-medium text-gray-900">{formatDate(pass.validFrom)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Valid Until:</p>
                  <p className="font-medium text-gray-900">{formatDate(pass.validTo)}</p>
                </div>
              </div>
            </div>

            {/* Visit Details */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <User className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">Visit Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Purpose:</p>
                  <p className="font-medium text-gray-900">{visitor.purpose || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Host:</p>
                  <p className="font-medium text-gray-900">{visitor.host || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm">Instructions:</h3>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Present this digital pass at the reception desk</li>
                <li>• The QR code will be scanned for check-in</li>
                <li>• Download the PDF badge for offline access</li>
                <li>• Pass is valid only within the specified time period</li>
                <li>• Contact security if you face any issues</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPass;
