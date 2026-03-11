(() => {
  const API = "/api/dg/v1";

  async function getConfig() {
    const res = await fetch(`${API}/config`);
    return res.json();
  }

  function byId(id) { return document.getElementById(id); }

  async function initPublic() {
    const form = byId("reservationForm");
    if (!form) return;
    const config = await getConfig();
    const timeSelect = byId("timeSelect");
    config.bookingRules.timeSlots.forEach((s) => {
      const o = document.createElement("option"); o.value = s; o.textContent = s; timeSelect.appendChild(o);
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      payload.pax = Number(payload.pax);
      const res = await fetch(`${API}/public_hold`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      const body = await res.json();
      byId("result").textContent = JSON.stringify(body, null, 2);
    });
  }

  async function loginStaff() {
    const btn = byId("staffLoginBtn");
    if (!btn) return;
    btn.addEventListener("click", async () => {
      const password = byId("staffPassword").value;
      const res = await fetch(`${API}/staff_login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await res.json();
      if (data.token) localStorage.setItem("staffToken", data.token);
      await loadStaff();
    });
  }

  async function loadStaff() {
    const list = byId("staffList");
    if (!list) return;
    const page = document.querySelector(".dg-app")?.dataset.page;
    const headers = {};
    const token = localStorage.getItem("staffToken");
    if (token) headers.Authorization = `Bearer ${token}`;

    const q = byId("search")?.value ?? "";
    const status = byId("statusFilter")?.value ?? "";
    const url = new URL(`${location.origin}${API}/staff_reservations`);
    if (q) url.searchParams.set("q", q);
    if (status) url.searchParams.set("status", status);
    if (page === "staff-public") {
      const t = new URLSearchParams(location.search).get("token");
      if (t) url.searchParams.set("token", t);
    }

    const res = await fetch(url, { headers });
    const body = await res.json();
    if (!res.ok) { list.innerHTML = `<p>${body.error}</p>`; return; }

    list.innerHTML = body.items.map((r) => `
      <details>
        <summary>${r.code} - ${r.name}</summary>
        <div><strong>Tel:</strong> ${r.phone}</div>
        <div><strong>Fecha:</strong> ${new Date(r.date).toISOString().slice(0,10)} ${r.time}</div>
        <div><strong>Pax:</strong> ${r.pax}</div>
        <div><strong>Estado:</strong> 
          <select data-id="${r.id}" class="statusSelect">
            ${["HOLD","PENDING","CONFIRMED","CANCELLED","NO_SHOW"].map((s)=>`<option ${s===r.status?"selected":""}>${s}</option>`).join("")}
          </select>
        </div>
      </details>`).join("");

    document.querySelectorAll(".statusSelect").forEach((el) => el.addEventListener("change", async (ev) => {
      await fetch(`${API}/staff_reservation_status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ id: ev.target.dataset.id, status: ev.target.value })
      });
    }));
  }

  async function initStaff() {
    const checkbox = byId("enableTableSelection");
    if (checkbox) {
      const token = localStorage.getItem("staffToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const r = await fetch(`${API}/staff_settings`, { headers });
      if (r.ok) {
        const s = await r.json();
        checkbox.checked = s.enableTableSelection;
      }
      checkbox.addEventListener("change", async () => {
        await fetch(`${API}/staff_settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({ enableTableSelection: checkbox.checked })
        });
      });
    }

    byId("search")?.addEventListener("input", () => loadStaff());
    byId("statusFilter")?.addEventListener("change", () => loadStaff());
    await loginStaff();
    await loadStaff();
  }

  const page = document.querySelector(".dg-app")?.dataset.page;
  if (page === "public") initPublic();
  if (page === "staff" || page === "staff-public") initStaff();
})();
