document.addEventListener("DOMContentLoaded", () => {

    function updateBadge() {
        fetch("/notifications/api/count")
            .then(res => res.json())
            .then(data => {
                const badge = document.querySelector(".nav-item.active .badge");
                if (badge) {
                    badge.textContent = data.count;
                    badge.style.display = data.count > 0 ? "inline-block" : "none";
                }
            });
    }

    updateBadge(); // initial badge update
    setInterval(updateBadge, 30000);

    document.querySelectorAll(".mark-read-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const card = btn.closest(".notification-card");
            const id = card.dataset.id;

            fetch(`/notifications/api/mark-read/${id}`, { method: "POST" })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        card.classList.remove("unread");
                        btn.outerHTML =
                            '<div class="read-indicator"><i class="fas fa-check-circle"></i></div>';
                        updateBadge();
                    }
                });
        });
    });

    document.querySelector(".mark-all-read")?.addEventListener("click", () => {
        fetch("/notifications/api/mark-all-read", { method: "POST" })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    document.querySelectorAll(".notification-card.unread")
                        .forEach(card => card.classList.remove("unread"));
                    updateBadge();
                }
            });
    });

});
