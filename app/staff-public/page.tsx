import Script from "next/script";

export default function StaffPublicPage() {
  return (
    <main className="dg-app" data-page="staff-public">
      <h1>Staff Public</h1>
      <div id="staffList" />
      <link rel="stylesheet" href="/app.css" />
      <Script src="/app.js" strategy="afterInteractive" />
    </main>
  );
}
