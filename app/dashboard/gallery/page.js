"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Upload, Image as ImageIcon, ArrowRight, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function GalleryManager() {
    const [images, setImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const auth = localStorage.getItem('adminAuth');
        if (auth !== 'true') {
            router.push('/dashboard');
        } else {
            setIsAuthenticated(true);
        }

        const saved = JSON.parse(localStorage.getItem('conference_gallery')) || [];
        setImages(saved);
    }, [router]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert("يرجى اختيار ملف صورة فقط");
            return;
        }

        setIsUploading(true);

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.src = reader.result;

            img.onload = () => {
                // --- عملية ضغط الصورة لضمان ظهور أكثر من صورة ---
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // تصغير العرض لتوفير مساحة
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // تحويلها لـ Base64 بجودة متوسطة (0.7)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

                // التحديث: إضافة الصورة الجديدة للمصفوفة الحالية (Spread Operator)
                setImages(prevImages => {
                    const newList = [...prevImages, compressedBase64];
                    localStorage.setItem('conference_gallery', JSON.stringify(newList));
                    return newList;
                });

                setIsUploading(false);
            };
        };

        reader.readAsDataURL(file);
    };

    const handleDelete = (index) => {
        const newList = images.filter((_, i) => i !== index);
        setImages(newList);
        localStorage.setItem('conference_gallery', JSON.stringify(newList));
    };

    if (!isAuthenticated) return null;

    return (
        <div style={{ padding: '30px', direction: 'rtl', minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: '#1B365D', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                    <ImageIcon size={30} /> إدارة ألبوم الصور
                </h1>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#C8102E', textDecoration: 'none', fontWeight: 'bold' }}>
                    العودة للوحة التحكم <ArrowRight size={18} />
                </Link>
            </div>

            <div style={{ background: 'white', padding: '40px', borderRadius: '20px', textAlign: 'center', border: '2px dashed #1B365D', marginBottom: '30px', position: 'relative' }}>
                <input type="file" id="fileInput" hidden accept="image/*" onChange={handleFileUpload} />
                <label htmlFor="fileInput" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    {isUploading ? <Loader2 className="animate-spin" size={50} color="#1B365D" /> : <Plus size={50} color="#1B365D" />}
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1B365D' }}>
                        {isUploading ? "جاري المعالجة..." : "أضف صورة جديدة للألبوم"}
                    </div>
                </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
                {images.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative', height: '140px', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', border: '4px solid white' }}>
                        <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button onClick={() => handleDelete(idx)} style={{ position: 'absolute', top: '8px', left: '8px', background: '#C8102E', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}