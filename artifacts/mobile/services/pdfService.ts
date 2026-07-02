import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Linking, Platform } from 'react-native';
import { AppSettings, DailyEntry, MonthlyBill } from '../types';

function getMonthName(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });
}

function buildHTML(
  bill: MonthlyBill,
  entries: DailyEntry[],
  settings: AppSettings
): string {
  const cur = settings.defaultCurrency;
  const entryRows = entries
    .map(
      (e) => `
    <tr>
      <td>${e.date}</td>
      <td style="text-align:center">${e.waterQuantity}</td>
      <td style="text-align:right">${cur}${e.rate}</td>
      <td style="text-align:right">${cur}${e.totalAmount.toFixed(0)}</td>
      <td style="text-align:center;color:${e.paymentStatus === 'paid' ? '#059669' : '#D97706'}">${e.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,Arial,sans-serif;color:#1e293b;background:#fff;font-size:13px}
.wrap{max-width:760px;margin:0 auto;padding:36px}
.hdr{background:#2563EB;color:#fff;padding:24px 28px;border-radius:12px;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
.biz{font-size:22px;font-weight:700}.biz-sub{font-size:12px;opacity:.8;margin-top:3px}
.bill-meta{text-align:right}.bill-no{font-size:17px;font-weight:700}
.bill-dt{font-size:11px;opacity:.8;margin-top:3px}
.badge{display:inline-block;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:600;margin-top:5px}
.paid{background:#D1FAE5;color:#065F46}.pending{background:#FEF3C7;color:#92400E}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
.box{background:#F8FAFC;border-radius:8px;padding:14px;border:1px solid #E2E8F0}
.box-ttl{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#64748B;margin-bottom:8px}
.row{display:flex;gap:6px;margin-bottom:3px}
.lbl{color:#64748B;width:72px;flex-shrink:0;font-size:12px}
.val{font-weight:500;font-size:12px}
.sec{font-size:13px;font-weight:600;margin-bottom:10px}
table{width:100%;border-collapse:collapse;margin-bottom:16px}
th{background:#F1F5F9;padding:8px 10px;font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;text-align:left}
td{padding:8px 10px;border-bottom:1px solid #E2E8F0}
tr:last-child td{border-bottom:none}
.totals{margin-left:auto;width:240px}
.trow{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #E2E8F0;font-size:13px}
.trow:last-child{border:none;border-top:2px solid #2563EB;margin-top:3px;padding-top:10px;font-weight:700;font-size:16px;color:#2563EB}
.footer{text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #E2E8F0;color:#64748B;font-size:11px}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <div>
      <div class="biz">${settings.businessName}</div>
      <div class="biz-sub">Water Supply & Billing</div>
    </div>
    <div class="bill-meta">
      <div class="bill-no">INVOICE #${bill.billNumber}</div>
      <div class="bill-dt">Date: ${bill.billingDate}</div>
      <div class="bill-dt">Period: ${getMonthName(bill.billingMonth)}</div>
      <span class="badge ${bill.status === 'paid' ? 'paid' : 'pending'}">${bill.status === 'paid' ? '✓ Paid' : 'Pending'}</span>
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <div class="box-ttl">Bill To</div>
      <div class="row"><span class="lbl">Name</span><span class="val">${bill.customerName}</span></div>
      <div class="row"><span class="lbl">Mobile</span><span class="val">${bill.customerMobile}</span></div>
      <div class="row"><span class="lbl">Area</span><span class="val">${bill.customerArea}</span></div>
      ${bill.customerAddress ? `<div class="row"><span class="lbl">Address</span><span class="val">${bill.customerAddress}</span></div>` : ''}
    </div>
    <div class="box">
      <div class="box-ttl">Payment Info</div>
      <div class="row"><span class="lbl">Status</span><span class="val" style="color:${bill.status === 'paid' ? '#059669' : '#D97706'};font-weight:600">${bill.status === 'paid' ? 'Paid' : 'Pending'}</span></div>
      ${bill.paidDate ? `<div class="row"><span class="lbl">Paid On</span><span class="val">${bill.paidDate}</span></div>` : ''}
      ${bill.paymentMode ? `<div class="row"><span class="lbl">Mode</span><span class="val">${bill.paymentMode.toUpperCase()}</span></div>` : ''}
      <div class="row"><span class="lbl">Rate</span><span class="val">${cur}${bill.waterRate}/unit</span></div>
    </div>
  </div>

  ${
    entries.length > 0
      ? `<div class="sec">Daily Water Supply Summary</div>
  <table>
    <thead><tr><th>Date</th><th style="text-align:center">Qty (units)</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th><th style="text-align:center">Status</th></tr></thead>
    <tbody>${entryRows}</tbody>
  </table>`
      : ''
  }

  <div class="totals">
    <div class="trow"><span>Water Charges (${bill.totalQuantity} units)</span><span>${cur}${bill.totalAmount.toFixed(0)}</span></div>
    ${bill.previousDue > 0 ? `<div class="trow"><span>Previous Due</span><span style="color:#DC2626">${cur}${bill.previousDue.toFixed(0)}</span></div>` : ''}
    <div class="trow"><span>Grand Total</span><span>${cur}${bill.grandTotal.toFixed(0)}</span></div>
  </div>

  <div class="footer">
    <p style="font-size:14px;font-weight:600;color:#2563EB;margin-bottom:5px">Thank you for your payment!</p>
    <p>For queries, please contact us.</p>
    <p style="margin-top:6px;color:#94A3B8">Generated by ${settings.businessName} · Water Billing System</p>
  </div>
</div>
</body>
</html>`;
}

export async function downloadBillPDF(
  bill: MonthlyBill,
  entries: DailyEntry[],
  settings: AppSettings
): Promise<void> {
  const html = buildHTML(bill, entries, settings);
  if (Platform.OS === 'web') {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
    return;
  }
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  }
}

export async function sendWhatsApp(
  bill: MonthlyBill,
  entries: DailyEntry[],
  settings: AppSettings
): Promise<void> {
  const cur = settings.defaultCurrency;
  const message =
    `Hello ${bill.customerName},\n\n` +
    `Your Water Bill for *${getMonthName(bill.billingMonth)}* has been generated.\n\n` +
    `📋 *Bill No:* ${bill.billNumber}\n` +
    `💧 *Water Used:* ${bill.totalQuantity} units\n` +
    `💰 *Water Charges:* ${cur}${bill.totalAmount.toFixed(0)}\n` +
    (bill.previousDue > 0 ? `⚠️ *Previous Due:* ${cur}${bill.previousDue.toFixed(0)}\n` : '') +
    `🧾 *Grand Total:* ${cur}${bill.grandTotal.toFixed(0)}\n\n` +
    `Please complete your payment before the due date.\n\n` +
    `Thank you.\n— ${settings.businessName}`;

  const phone = bill.customerMobile.replace(/\D/g, '');
  const encoded = encodeURIComponent(message);

  if (Platform.OS !== 'web') {
    const waUrl = `whatsapp://send?phone=${phone}&text=${encoded}`;
    const canOpen = await Linking.canOpenURL(waUrl);
    if (canOpen) {
      await Linking.openURL(waUrl);
      return;
    }
  }
  await Linking.openURL(`https://wa.me/${phone}?text=${encoded}`);
}
