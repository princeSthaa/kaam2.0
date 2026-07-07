window.legacyPageModelData = window.legacyPageModelData || {};

window.legacyPageModelData.crmOrderCustomers = [
    { id: "CUS-1001", name: "Ram Bahadur Thapa", phone: "9841000000", email: "ram@example.com", location: "Kathmandu, Bagmati", type: "Retail", orders: 12 },
    { id: "CUS-1002", name: "Sita Sharma", phone: "9851000000", email: "sita@example.com", location: "Pokhara, Gandaki", type: "Wholesale", orders: 45 },
    { id: "CUS-1003", name: "Hari Khadka", phone: "9801000000", email: "hari@example.com", location: "Biratnagar, Koshi", type: "Distributor", orders: 120 },
    { id: "CUS-1004", name: "Gita Shrestha", phone: "9861000000", email: "gita@example.com", location: "Lalitpur, Bagmati", type: "Retail", orders: 2 },
    { id: "CUS-1005", name: "Bishnu Rai", phone: "9811000000", email: "bishnu@example.com", location: "Dharan, Koshi", type: "Retail", orders: 0 }
];

window.legacyPageModelData.fabrics = [
    { id: "FAB-001", name: "Sunset Orange Cotton", imageUrl: "/images/fabrics/FAB-001.jpg", category: "Cotton" },
    { id: "FAB-002", name: "Lime Green Linen", imageUrl: "/images/fabrics/FAB-002.png", category: "Linen" },
    { id: "FAB-003", name: "Royal Blue Silk", imageUrl: "/images/fabrics/FAB-003.png", category: "Silk" },
    { id: "FAB-004", name: "Sandy Brown Wool", imageUrl: "/images/fabrics/FAB-004.png", category: "Wool" },
    { id: "FAB-005", name: "Violet Velvet", imageUrl: "/images/fabrics/FAB-005.png", category: "Velvet" },
    { id: "FAB-006", name: "Classic White Cotton", imageUrl: "/images/fabrics/FAB-002.png", category: "Cotton" },
    { id: "FAB-007", name: "Ocean Blue Cotton", imageUrl: "/images/fabrics/FAB-003.png", category: "Cotton" },
    { id: "FAB-008", name: "Navy Linen", imageUrl: "/images/fabrics/FAB-004.png", category: "Linen" }
];

window.fabrics = window.legacyPageModelData.fabrics;
window.fabricMasterData = window.legacyPageModelData.fabrics;
window.fabricData = window.legacyPageModelData.fabrics;

window.legacyPageModelData.stockItems = [
    { sku: "RM-001", name: "Cotton Fabric", type: "Raw Material", available: 120, quantity: 120, uom: "kg", location: "Rack A / Bin 01", status: "Available", statusClass: "success" },
    { sku: "FG-001", name: "School Uniform", type: "Finished Goods", available: 45, quantity: 45, uom: "pcs", location: "Rack F / Bin 04", status: "Ready", statusClass: "primary" }
];
