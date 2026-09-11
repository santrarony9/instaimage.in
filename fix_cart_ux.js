const fs = require('fs');
const path = 'd:/anti gravity/InstaImage_Source_Code (1)/frontend/src/components/cart/CartSidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import
if (!content.includes('useAuthStore')) {
  content = content.replace("import { Trash2, X, ShoppingBag } from 'lucide-react';", "import { Trash2, X, ShoppingBag } from 'lucide-react';\nimport { useAuthStore } from '@/hooks/use-auth-store';");
}

// 2. Add hook
content = content.replace(
  "  const isSidebarOpen = useCartStore((state) => state.isSidebarOpen);",
  "  const isSidebarOpen = useCartStore((state) => state.isSidebarOpen);\n  const user = useAuthStore((state) => state.user);"
);

// 3. Update state initialization
content = content.replace(
  "const [customerName, setCustomerName] = useState('');\n  const [phoneNumber, setPhoneNumber] = useState('');",
  "const [customerName, setCustomerName] = useState(user?.name || '');\n  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');\n\n  useEffect(() => {\n    if (user) {\n      if (user.name) setCustomerName(user.name);\n      if (user.phone) setPhoneNumber(user.phone);\n    }\n  }, [user]);"
);

// 4. Update UI
const oldUi = `<div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
              <p className="text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">Want more discount?</p>
              <p className="text-emerald-700 text-xs font-medium mb-3">Send us your wishlist! Our team will call you back with a custom one-time discount coupon.</p>
              
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input 
                  type="tel" 
                  placeholder="Your Phone Number" 
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>`;

const oldUiWin = oldUi.split('\n').join('\r\n');

const newUi = `<div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
              <p className="text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">Want more discount?</p>
              
              {user ? (
                <p className="text-emerald-700 text-xs font-medium mb-1">Send us your wishlist! Our team will call you back at <strong className="font-bold">{user.phone || 'your registered number'}</strong> with a custom one-time discount coupon.</p>
              ) : (
                <>
                  <p className="text-emerald-700 text-xs font-medium mb-3">Send us your wishlist! Our team will call you back with a custom one-time discount coupon.</p>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input 
                      type="tel" 
                      placeholder="Your Phone Number" 
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      className="w-full text-sm px-3 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}
            </div>`;

content = content.replace(oldUi, newUi);
content = content.replace(oldUiWin, newUi);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed Cart Sidebar UX');
