(function () {
    "use strict";

    const form = document.getElementById("addCustomerForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const data = Object.fromEntries(new FormData(form).entries());
        const existing = JSON.parse(localStorage.getItem("kaam.customers") || "[]");
        existing.push({
            id: `LOCAL-${Date.now()}`,
            ...data,
            createdAt: new Date().toISOString()
        });

        localStorage.setItem("kaam.customers", JSON.stringify(existing));
        form.reset();
        alert("Customer saved locally for this Next.js frontend demo.");
    });
})();
