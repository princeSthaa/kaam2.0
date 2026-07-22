const fs = require('fs');
let css = fs.readFileSync('C:/Code/Kaam2/frontend/my-app/app/globals.css', 'utf-8');

// Find all --color-kaam-, --font-kaam-, etc and duplicate them without kaam-
const matches = css.match(/--(color|font|spacing|radius|text)-kaam-[^:]+:\s*[^;]+;/g);
if (matches) {
    const newVars = matches.map(m => m.replace('-kaam-', '-'));
    
    // Inject before the closing brace of @theme
    css = css.replace(/@theme\s*{([^}]+)}/, (match, p1) => {
        return `@theme {${p1}\n  ${newVars.join('\n  ')}\n}`;
    });
    
    fs.writeFileSync('C:/Code/Kaam2/frontend/my-app/app/globals.css', css);
    console.log('Successfully added unprefixed variables to globals.css');
} else {
    console.log('No matches found');
}
