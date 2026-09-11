const fs = require('fs');
const path = 'd:/anti gravity/InstaImage_Source_Code (1)/frontend/src/components/booking/Step1Services.tsx';
let content = fs.readFileSync(path, 'utf8');

// Use simple string replacement
const target1 = "const setService = (id: string) => updateData({ serviceId: id });";
content = content.replace(target1, "");

const target2 = `  const handleSelect = (serviceId: string) => {
    setService(serviceId);
    nextStep();
  };`;

const target2Windows = target2.split('\n').join('\r\n');

const replacement = `  const handleSelect = (serviceId: string) => {
    const svc = services.find(s => s._id === serviceId);
    updateData({ 
      serviceId, 
      deliveryMethod: svc?.deliveryMethod || 'ON_SPOT',
      pricingMode: svc?.flexiblePrice ? 'flexible' : 'fixed' 
    });
    nextStep();
  };`;

content = content.replace(target2, replacement);
content = content.replace(target2Windows, replacement);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed Step1Services');
