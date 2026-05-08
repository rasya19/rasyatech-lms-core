import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  schoolName: string;
  packageName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  banks?: { name: string; account: string; recipient: string }[];
}

export const generateInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF();
  const navyBlue = [1, 33, 105]; // RGB for Navy Blue
  const accentColor = [0, 102, 204];

  // --- Header ---
  doc.setFillColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Rasyacomp', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Solusi Digitalisasi Sekolah Masa Kini', 20, 32);

  doc.setFontSize(18);
  doc.text('INVOICE', 140, 25);
  doc.setFontSize(9);
  doc.text(data.invoiceNumber, 140, 32);

  // --- Invoice Info ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Diterbitkan Untuk:', 20, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(data.schoolName, 20, 62);
  doc.text(`Tanggal: ${format(data.date, 'dd MMMM yyyy')}`, 20, 67);

  doc.setFont('helvetica', 'bold');
  doc.text('Status Pembayaran:', 140, 55);
  doc.setTextColor(data.status === 'Success' ? '#10b981' : '#f59e0b');
  doc.text(data.status.toUpperCase(), 140, 62);
  doc.setTextColor(0,0,0);

  // --- Table ---
  doc.autoTable({
    startY: 80,
    head: [['Deskripsi Layanan', 'Qty', 'Harga Satuan', 'Total']],
    body: [
      [
        `Paket Langganan: ${data.packageName}`,
        '1 Tahun',
        `Rp ${data.amount.toLocaleString()}`,
        `Rp ${data.amount.toLocaleString()}`
      ]
    ],
    headStyles: { fillColor: navyBlue, textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right', fontStyle: 'bold' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // --- Total ---
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL TAGIHAN:', 130, finalY + 5);
  doc.setFontSize(14);
  doc.setTextColor(navyBlue[0], navyBlue[1], navyBlue[2]);
  doc.text(`Rp ${data.amount.toLocaleString()}`, 130, finalY + 15);

  // --- Payment Instructions ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Instruksi Pembayaran:', 20, finalY + 30);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Harap melakukan transfer ke salah satu rekening berikut:', 20, finalY + 37);

  let currentY = finalY + 45;
  if (data.banks && data.banks.length > 0) {
    data.banks.forEach((bank) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${bank.name}:`, 20, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(`${bank.account} a/n ${bank.recipient}`, 50, currentY);
      currentY += 7;
    });
  } else {
    // Default fallback if no banks provided
    doc.setFont('helvetica', 'bold');
    doc.text('BANK MANDIRI:', 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text('123-00-0456-7890 a/n PT ARMILLA NUSA TEKNOLOGI (Rasyacomp)', 50, currentY);
  }

  // --- Footer ---
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const footerText = 'Invoice ini sah dan diproses oleh komputer. Tidak memerlukan tanda tangan basah.';
  const footerX = (210 - doc.getTextWidth(footerText)) / 2;
  doc.text(footerText, footerX, 280);

  doc.save(`${data.invoiceNumber}.pdf`);
};
