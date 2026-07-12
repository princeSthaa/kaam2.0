const fs = require('fs');
const filePath = 'app/Production/Plan/ProcessAssignment/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove Stage 01, Stage 02 labels
content = content.replace(/<p className=\"text-kaam-on-surface-variant text-\[11px\] font-kaam-label-md uppercase tracking-wider\">\{stage\.stageCode\}<\/p>/g, '');

// 2. Add Back, Save to Draft, Print buttons to the header area
const actionButtons = `
            <div className=\"flex flex-wrap items-center gap-3\">
              <button onClick={() => router.back()} className=\"flex items-center gap-2 px-4 py-2 border border-kaam-outline-variant rounded-kaam-DEFAULT text-kaam-on-surface-variant font-kaam-label-md hover:bg-kaam-surface-container-high transition-colors\">
                <span className=\"material-symbols-outlined text-[18px]\">arrow_back</span>
                Back
              </button>
              <button onClick={() => window.print()} className=\"flex items-center gap-2 px-4 py-2 border border-kaam-outline-variant bg-kaam-surface rounded-kaam-DEFAULT text-kaam-on-surface font-kaam-label-md hover:bg-kaam-surface-container-high transition-colors\">
                <span className=\"material-symbols-outlined text-[18px]\">print</span>
                Print
              </button>
              <button onClick={() => alert('Plan saved to draft successfully.')} className=\"flex items-center gap-2 px-4 py-2 border border-kaam-outline-variant bg-kaam-surface-container rounded-kaam-DEFAULT text-kaam-on-surface font-kaam-label-md hover:bg-kaam-surface-container-high transition-colors\">
                <span className=\"material-symbols-outlined text-[18px]\">save</span>
                Save to Draft
              </button>
            </div>
`;

content = content.replace(
  /<div className=\"mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4\">/g,
  `<div className=\"mb-8 flex flex-col gap-6\">\n            <div className=\"flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4\">\n              <div className=\"flex flex-col gap-4\">\n                ${actionButtons}\n                <div>\n`
);

content = content.replace(
  /<p className=\"text-kaam-on-surface-variant font-kaam-body-sm text-kaam-body-sm mt-1\">Assign operational teams to manufacturing lifecycle stages\.<\/p>\s*<\/div>/g,
  `<p className=\"text-kaam-on-surface-variant font-kaam-body-sm text-kaam-body-sm mt-1\">Assign operational teams to manufacturing lifecycle stages.</p>\n                </div>\n              </div>`
);

// 3. Fix Finalize Production Plan button & message
const oldFinalize = `  const finalizeAssignments = () => {
    alert("Assignments finalized!");
    router.push("/Production/Plan/PlansDetails");
  };`;

const newFinalize = `  const [batchId, setBatchId] = useState("");
  
  const finalizeAssignments = () => {
    const newBatchId = "BCH-" + Math.floor(10000 + Math.random() * 90000);
    setBatchId(newBatchId);
    alert("Proceeding Plan... \\n\\nProduction Plan Finalized successfully! \\nGenerated Batch ID: " + newBatchId);
    router.push("/Production/Plan/PlansDetails?batchId=" + newBatchId);
  };`;

content = content.replace(oldFinalize, newFinalize);
content = content.replace("Finalize Assignments", "Finalize Production Plan");

// 4. Fix Sticky Teams Dock styling for responsiveness
content = content.replace(
  /<footer className=\"fixed bottom-0 right-0 left-0 md:left-64 bg-kaam-surface-container-lowest border-t border-kaam-outline-variant px-6 py-4 z-50 shadow-\[0_-8px_30px_rgba\(0,0,0,0\.04\)\] w-full\">/g,
  `<footer className=\"sticky bottom-0 -mx-6 px-6 mt-6 bg-kaam-surface-container-lowest border-t border-kaam-outline-variant py-4 z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]\">\n          <div className=\"absolute inset-0 bg-kaam-surface-container-lowest pointer-events-none -z-10\"></div>`
);

fs.writeFileSync(filePath, content);
console.log('Successfully updated ProcessAssignment page!');
