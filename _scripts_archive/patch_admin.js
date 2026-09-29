const fs = require('fs');
let content = fs.readFileSync('frontend/src/app/(dashboard)/admin/bookings/page.tsx', 'utf8');

const targetLines = [
  '            <h4 className="font-bold text-gray-800 border-b pb-1 mb-3 text-sm">💰 Financial Split</h4>',
  '            <div className="grid grid-cols-2 gap-2 text-sm bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">',
  '              <div className="font-bold text-base">Total: ₹{selectedBooking.pricing?.totalPrice || 0}</div>',
  '              <div className="text-right text-gray-600">Advance: ₹{selectedBooking.pricing?.advancePaid || 0}</div>',
  '              <div className="font-bold text-indigo-700 pt-2 border-t border-indigo-200">Platform (15%): ₹{selectedBooking.pricing?.platformFee || 0}</div>',
  '              <div className="font-bold text-green-700 pt-2 border-t border-indigo-200">Seller (85%): ₹{selectedBooking.pricing?.sellerPayout || 0}</div>',
  '              <div className="col-span-2 pt-2 border-t border-indigo-200 flex justify-between items-center">',
  '                <span><strong>Payout:</strong> <span className={selectedBooking.payoutStatus === \'PAID\' ? \'text-green-600\' : \'text-red-600\'}>{selectedBooking.payoutStatus || \'PENDING\'}</span></span>',
  '                {selectedBooking.payoutStatus !== \'PAID\' && selectedBooking.sellerId && (',
  '                  <button onClick={() => handleMarkPaid(selectedBooking._id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Mark PAID</button>',
  '                )}',
  '              </div>',
  '            </div>'
];

const targetStr = targetLines.join('\n');
// Since line endings might be \r\n, let's just do a regex replace or split by line.

let lines = content.split(/\r?\n/);
let startIdx = lines.findIndex(l => l.includes('💰 Financial Split'));

if (startIdx !== -1) {
  lines.splice(startIdx, 13, 
    '            <h4 className="font-bold text-gray-800 border-b pb-1 mb-3 text-sm">💰 Payment Details</h4>',
    '            <div className="flex justify-between items-center text-sm bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">',
    '              <div className="font-bold text-base">Total: ₹{selectedBooking.pricing?.totalPrice || 0}</div>',
    '              <div className="text-right text-gray-600 font-medium">Advance Paid: ₹{selectedBooking.pricing?.advancePaid || 0}</div>',
    '            </div>'
  );
  fs.writeFileSync('frontend/src/app/(dashboard)/admin/bookings/page.tsx', lines.join('\n'));
  console.log("Patched admin bookings UI");
} else {
  console.log("Not found");
}

