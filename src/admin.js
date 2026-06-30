document.addEventListener("DOMContentLoaded", () => {
  const pendingCountEl = document.getElementById("pending-count");
  let pendingCount = parseInt(pendingCountEl.textContent);

  // Accept handler
  document.querySelectorAll(".approve-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      if (row) {
        const statusBadge = row.querySelector(".status-badge");
        statusBadge.textContent = "Approved";
        statusBadge.className =
          "px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50 rounded-full text-xs font-bold uppercase tracking-wider status-badge";

        const actions = row.querySelector(".action-container");
        actions.innerHTML =
          '<span class="text-xs font-semibold text-green-600 dark:text-green-400">Verified</span>';

        row.classList.add("bg-green-50/30", "dark:bg-green-900/10");

        pendingCount--;
        pendingCountEl.textContent = pendingCount;
      }
    });
  });

  // Reject handler
  document.querySelectorAll(".reject-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      if (row) {
        const statusBadge = row.querySelector(".status-badge");
        statusBadge.textContent = "Rejected";
        statusBadge.className =
          "px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-full text-xs font-bold uppercase tracking-wider status-badge";

        const actions = row.querySelector(".action-container");
        actions.innerHTML =
          '<span class="text-xs font-semibold text-red-600 dark:text-red-400">Blocked</span>';

        row.classList.add("fade-out", "bg-red-50/30", "dark:bg-red-900/10");

        pendingCount--;
        pendingCountEl.textContent = pendingCount;
      }
    });
  });
});
