import os
import glob
import re

dir_path = r'D:\kaam2.0\try\app\(modules)\production\components'
for root, _, files in os.walk(dir_path):
    for f in files:
        if f.endswith('.tsx'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            content = content.replace('/Production/Customer/Customers', '/production/demands/catalog/customer')
            content = content.replace('/Production/Outlet/Outlets', '/production/demands/catalog/outlet')
            content = content.replace('/Production/Customer/CreateCustomer?customerId=', '/production/demands/customer?customerId=')
            content = content.replace('/Production/Customer/CreateCustomer', '/production/demands/customer')
            content = content.replace('/Production/Outlet/CreateOutlet?outletId=', '/production/demands/outlet?outletId=')
            content = content.replace('/Production/Outlet/CreateOutlet', '/production/demands/outlet')
            content = content.replace('/Production/Plan/CreateDetails', '/production/plans/new')
            content = content.replace('/Production/Drafts', '/production/drafts')
            content = content.replace('/Production/Create', '/production/demands')
            
            content = re.sub(r'/Production/Plan/Details\?id=\`\$\{([^}]+)\}\`', r'/production/plans/`${\1}`', content)
            content = re.sub(r'/Production/Plan/Edit\?id=\`\$\{([^}]+)\}\`', r'/production/plans/`${\1}`/edit', content)
            content = re.sub(r'/Production/Plan/StageUpdate\?id=\`\$\{([^}]+)\}\`', r'/production/plans/`${\1}`/stage', content)
            content = re.sub(r'/Production/Plan/ProcessAssignment\?planId=\`\$\{([^}]+)\}\`', r'/production/plans/`${\1}`/process', content)

            with open(path, 'w', encoding='utf-8') as file:
                file.write(content)
