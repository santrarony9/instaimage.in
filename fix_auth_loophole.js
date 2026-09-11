const fs = require('fs');
const path = 'd:/anti gravity/InstaImage_Source_Code (1)/backend/apps/api/src/modules/auth/auth.service.ts';
let content = fs.readFileSync(path, 'utf8');

// Remove automatic wallet credit in register
const targetRegister = `    if (user.role === Role.CUSTOMER) {
      await this.usersService.addWalletBalance(
        user._id.toString(),
        500,
        'Welcome Bonus',
      );
    }`;

content = content.replace(targetRegister, `    // REMOVED: No automatic wallet credit here to prevent abuse.
    // They must verify their email via the dashboard to get 500.`);

// There is a second instance for sellers or something? Let's check
const targetSeller = `      if (user.role === Role.SELLER) {
        // Sellers also get bonus?
      }`; // Need to see exactly what's there if there's another

fs.writeFileSync(path, content, 'utf8');
console.log('Removed legacy auto 500 wallet credit loophole');
