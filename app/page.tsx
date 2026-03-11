import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Don Gato</h1>
      <ul>
        <li><Link href="/reservar">Reservar</Link></li>
        <li><Link href="/staff">Staff</Link></li>
        <li><Link href="/staff-public">Staff Public</Link></li>
      </ul>
    </main>
  );
}
