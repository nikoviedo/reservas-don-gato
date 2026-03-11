import Script from "next/script";

export default function StaffPage() {
  return (
    <main className="dg-app" data-page="staff">
      <h1>Staff</h1>
      <div id="staffAuth">
        <input type="password" id="staffPassword" placeholder="Password" />
        <button id="staffLoginBtn">Ingresar</button>
      </div>
      <label><input type="checkbox" id="enableTableSelection" /> HABILITAR SELECCIÓN DE MESA</label>
      <div>
        <input id="search" placeholder="Buscar" />
        <select id="statusFilter"><option value="">Todos</option><option value="HOLD">HOLD</option><option value="CONFIRMED">CONFIRMED</option><option value="CANCELLED">CANCELLED</option><option value="NO_SHOW">NO_SHOW</option></select>
      </div>
      <div id="staffList" />
      <link rel="stylesheet" href="/app.css" />
      <Script src="/app.js" strategy="afterInteractive" />
    </main>
  );
}
