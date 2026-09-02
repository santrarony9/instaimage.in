const fs = require('fs');
const path = 'd:/anti gravity/InstaImage_Source_Code (1)/frontend/src/app/(marketing)/page.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find the erroneous SmartConcierge
const idx = lines.findIndex(l => l.includes('{/* Smart Concierge - Placed at bottom per user request */}'));
if (idx !== -1) {
    // Remove the 4 lines
    lines.splice(idx, 4);
}

// Inject it before the final two closing divs
const endIdx = lines.findIndex(l => l.trim() === '</div>' && lines[l+1] && lines[l+1].trim() === '</div>');
// Wait, safer to find `// Reusable Quick Commerce Product Card Component` and go back 3 lines
const targetEnd = lines.findIndex(l => l.includes('// Reusable Quick Commerce Product Card Component'));
if (targetEnd !== -1) {
    // Should be right before `      </div>\n    </div>\n  );\n}`
    lines.splice(targetEnd - 4, 0, 
      '        {/* Smart Concierge - Placed at bottom per user request */}',
      '        <div className="mb-20 px-4 sm:px-0">',
      '          <SmartConcierge />',
      '        </div>'
    );
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log("Moved correctly.");
