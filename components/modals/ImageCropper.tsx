
import React, { useState, useEffect, useRef } from 'react';
import { X, Crop, Move } from 'lucide-react';

interface ImageCropperProps {
    src: string;
    onCancel: () => void;
    onCrop: (base64: string) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ src, onCancel, onCrop }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPan, setStartPan] = useState({ x: 0, y: 0 });
    const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => setImgElement(img);
    }, [src]);

    useEffect(() => {
        if (!imgElement || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Canvas Settings (Output Size)
        const size = 300; 
        canvasRef.current.width = size;
        canvasRef.current.height = size;

        // Clear
        ctx.fillStyle = '#f5f5f4'; // stone-100
        ctx.fillRect(0, 0, size, size);

        // Draw Logic
        // Calculate scaling to fit image cover
        const scale = Math.max(size / imgElement.width, size / imgElement.height) * zoom;
        const x = (size - imgElement.width * scale) / 2 + offset.x;
        const y = (size - imgElement.height * scale) / 2 + offset.y;

        ctx.drawImage(imgElement, x, y, imgElement.width * scale, imgElement.height * scale);

    }, [imgElement, zoom, offset]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartPan({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setOffset({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleSave = () => {
        if (canvasRef.current) {
            // High quality jpeg
            onCrop(canvasRef.current.toDataURL('image/jpeg', 0.9));
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-stone-800 flex items-center gap-2"><Crop size={20} className="text-orange-500"/> จัดตำแหน่งรูป (Crop)</h3>
                    <button onClick={onCancel}><X size={20} className="text-stone-400 hover:text-stone-600"/></button>
                </div>
                
                <div className="relative rounded-2xl overflow-hidden border-2 border-stone-200 bg-stone-100 cursor-move h-[300px] w-[300px] mx-auto shadow-inner group">
                    <canvas 
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className="w-full h-full object-cover touch-none"
                    />
                    <div className="absolute inset-0 pointer-events-none border-2 border-orange-400/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Move className="text-white drop-shadow-md opacity-50" size={48} />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-stone-400 uppercase">
                        <span>Zoom</span>
                        <span>{Math.round(zoom * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="0.1" 
                        value={zoom} 
                        onChange={e => setZoom(Number(e.target.value))}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                </div>

                <button onClick={handleSave} className="w-full py-3 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-900 transition-all shadow-lg">
                    บันทึกรูปนี้
                </button>
            </div>
        </div>
    );
};

export default ImageCropper;
