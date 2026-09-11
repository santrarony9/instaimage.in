const fs = require('fs');
const path = 'd:/anti gravity/InstaImage_Source_Code (1)/frontend/src/app/(booking)/booking/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `  useEffect(() => {
    if (useBookingStore.getState().currentStep === 8) return;`;

const replacement = `  const router = useRouter();
  useEffect(() => {
    if (useBookingStore.getState().currentStep === 8) return;
    
    // Safety redirect if no service is selected
    const serviceId = searchParams.get('serviceId');
    if (!serviceId && cartItems.length === 0) {
      router.push('/#shop');
      return;
    }`;

content = content.replace("import { useCartStore } from '@/hooks/use-cart-store';", "import { useCartStore } from '@/hooks/use-cart-store';\nimport { useRouter } from 'next/navigation';");
content = content.replace(target, replacement);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed Booking Page Redirect');
