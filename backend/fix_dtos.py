import os
import re

dir_path = r'D:\kaam2.0\backend\Dto'

# regex to find un-notmapped navigation properties
# like: public CustomerDto? Customer { get; set; }
# pattern: (?!\[NotMapped\]\s*)public\s+[A-Za-z]+Dto\??\s+[A-Za-z]+\s*\{\s*get;\s*set;\s*\}

for root, _, files in os.walk(dir_path):
    for f in files:
        if f.endswith('Dto.cs'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Use negative lookbehind or just a simple pass
            lines = content.split('\n')
            for i in range(len(lines)):
                # If it's a public property of type ending in Dto or Dto? and doesn't have NotMapped on previous line
                match = re.search(r'^\s*public\s+([A-Za-z0-9_]+Dto\??|[A-Za-z0-9_]+Size\??|[A-Za-z0-9_]+Item\??)\s+[A-Za-z0-9_]+\s*\{\s*get;\s*set;\s*\}', lines[i])
                if match:
                    if i == 0 or '[NotMapped]' not in lines[i-1]:
                        # add [NotMapped] above it
                        indent = re.match(r'^\s*', lines[i]).group(0)
                        lines[i] = indent + '[NotMapped]\n' + lines[i]
                        
            new_content = '\n'.join(lines)
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(new_content)
