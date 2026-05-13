"use client";
import { useState } from 'react';
import Navbar from './Navbar';

export default function NavbarWrapper() {
  const [lang, setLang] = useState('ar');
  return <Navbar lang={lang} setLang={setLang} />;
}