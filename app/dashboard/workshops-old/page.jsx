"use client";
import { useEffect, useState } from "react";

export default function OldWorkshopsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const WORKSHOPS = {
    w1: "Safe ED Skills",
    w2: "Challenge Cases in DM", 
    w3: "Electrolytes Is Not Just a Number",
    w4: "Gastroenterology Knowledge & Skills",
    w5: "POCUS",
  };

  useEffect(() => {
    fetch("/api/registration/workshops-old", {
      headers: { "x-admin-token": "samoud2025" }
    })
      .then(r => r.json())
      .then(d => { setData(d.items || []); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">تسجيلات ورش نوفمبر ({data.length} مسجل)</h1>
      <table className="w-full border-collapse border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">الاسم</th>
            <th className="border p-2">البريد</th>
            <th className="border p-2">واتساب</th>
            <th className="border p-2">التخصص</th>
            <th className="border p-2">الورشات</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => {
            const ws = (() => { try { return JSON.parse(r.workshops); } catch { return []; } })();
            return (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="border p-2 text-center">{i + 1}</td>
                <td className="border p-2">{r.fullNameAr}</td>
                <td className="border p-2">{r.email}</td>
                <td className="border p-2">{r.whatsapp}</td>
                <td className="border p-2">{r.specialty}</td>
                <td className="border p-2">{ws.map(id => WORKSHOPS[id]).join(" | ")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}