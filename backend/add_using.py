import os

dir_path = r'D:\kaam2.0\backend\Dto'
for root, _, files in os.walk(dir_path):
    for f in files:
        if f.endswith('.cs'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            if 'using System.ComponentModel.DataAnnotations.Schema;' not in content:
                content = 'using System.ComponentModel.DataAnnotations.Schema;\n' + content
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
