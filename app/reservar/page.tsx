import Script from "next/script";

export default function ReservarPage() {
  return (
    <main className="dg-app" data-page="public">
      <h1>Reservas Don Gato</h1>
      <form id="reservationForm">
        <input name="name" placeholder="Nombre" required />
        <input name="phone" placeholder="Teléfono" required />
        <input name="date" type="date" required />
        <select name="time" id="timeSelect" required />
        <input name="pax" type="number" min="1" max="20" defaultValue="2" required />
        <textarea name="notes" placeholder="Notas" />
        <button type="submit">Reservar</button>
      </form>
      <pre id="result" />
      <link rel="stylesheet" href="/app.css" />
      <Script src="/app.js" strategy="afterInteractive" />
    </main>
  );
}
