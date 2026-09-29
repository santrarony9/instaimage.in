const fs = require('fs');
let content = fs.readFileSync('frontend/src/app/(dashboard)/admin/settings/page.tsx', 'utf8');

// Remove travel state
content = content.replace(/\/\/ Travel Config State[\s\S]*?\/\/ AI Prompt State/, '// AI Prompt State');

// Remove load settings config logic
content = content.replace(/const config = allSettings\['travelChargeConfig'\];[\s\S]*?const promptData = allSettings\['aiPrompt'\];/, 'const promptData = allSettings[\'aiPrompt\'];');

// Remove handleSaveTravelConfig and handleSaveOffices
content = content.replace(/const handleSaveTravelConfig = async \(\) => \{[\s\S]*?const handleSaveAiPrompt = async \(\) => \{/, 'const handleSaveAiPrompt = async () => {');

// Remove addOffice and removeOffice and updateOffice if they exist
content = content.replace(/const addOffice = \(\) => \{[\s\S]*?return \(/, 'return (');

fs.writeFileSync('frontend/src/app/(dashboard)/admin/settings/page.tsx', content, 'utf8');
console.log("Cleaned unused vars");
