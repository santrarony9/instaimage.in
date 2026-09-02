const fs = require('fs');
const path = 'd:/anti gravity/InstaImage_Source_Code (1)/frontend/src/app/(marketing)/page.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

const idx = lines.findIndex(l => l.includes('{/* Smart Concierge - Placed at bottom per user request */}'));
if (idx !== -1) {
    const chunk = lines.splice(idx, 4);
    // Put it right before the first `</div>` (which is at the current idx - 1)
    // Wait, let's just find `})}` which is at 448
    const mapEnd = lines.findIndex(l => l.trim() === '})}' && l.includes(' ')); 
    // Just find the LAST `})}` in the file.
    let lastMapEnd = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '})}') lastMapEnd = i;
    }
    
    if (lastMapEnd !== -1) {
        lines.splice(lastMapEnd + 1, 0, ...chunk);
    }
}

fs.writeFileSync(path, lines.join('\n'), 'utf8');
console.log("Moved perfectly.");
