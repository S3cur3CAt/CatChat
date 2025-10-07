import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, Check } from "lucide-react";

const ImageCropper = ({ imageUrl, onSave, onCancel }) => {
  console.log("🎨 ImageCropper montado con imagen:", imageUrl?.substring(0, 50) + "...");
  
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  // Manejar inicio del arrastre
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // Manejar movimiento del mouse
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart.x, dragStart.y]);

  // Manejar fin del arrastre
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Manejar eventos táctiles para móviles
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  }, [isDragging, dragStart.x, dragStart.y]);

  // Ajustar zoom
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  // Aplicar los cambios y crear imagen recortada
  const handleSave = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = imageRef.current;
    const container = containerRef.current;
    
    // Configurar dimensiones del canvas (imagen cuadrada)
    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;
    
    // Limpiar canvas con fondo transparente
    ctx.clearRect(0, 0, outputSize, outputSize);
    
    // Obtener las dimensiones reales del contenedor
    const containerRect = container.getBoundingClientRect();
    const containerSize = containerRect.width;
    
    // Calcular la escala relativa
    const scale = outputSize / containerSize;
    
    // Calcular las dimensiones de la imagen con zoom aplicado
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    
    // Calcular el aspecto ratio para mantener proporciones
    const aspectRatio = imageWidth / imageHeight;
    let drawWidth, drawHeight;
    
    if (aspectRatio > 1) {
      // Imagen horizontal
      drawHeight = containerSize;
      drawWidth = containerSize * aspectRatio;
    } else {
      // Imagen vertical
      drawWidth = containerSize;
      drawHeight = containerSize / aspectRatio;
    }
    
    // Aplicar zoom y escala
    drawWidth *= zoom * scale;
    drawHeight *= zoom * scale;
    
    // Calcular la posición con el desplazamiento aplicado
    const drawX = (outputSize / 2) - (drawWidth / 2) + (position.x * scale);
    const drawY = (outputSize / 2) - (drawHeight / 2) + (position.y * scale);
    
    // Crear el recorte circular
    ctx.save();
    
    // Crear máscara circular
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    
    // Dibujar la imagen
    ctx.drawImage(
      image,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );
    
    ctx.restore();
    
    // Convertir a base64 con fondo transparente (usar PNG para mantener transparencia)
    const croppedImage = canvas.toDataURL('image/png');
    onSave(croppedImage);
  };

  useEffect(() => {
    // Agregar event listeners globales
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
      <div className="bg-base-200 rounded-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h3 className="text-lg font-semibold">Adjust Profile Picture</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-base-300 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Container */}
        <div className="p-6">
          <div
            ref={containerRef}
            className="relative w-80 h-80 mx-auto bg-base-300 rounded-full cursor-move"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{ 
              touchAction: 'none',
              overflow: 'visible' // Permitir que la imagen se vea fuera del contenedor
            }}
          >
            {/* Máscara circular que cubre todo excepto el círculo central */}
            <div 
              className="absolute inset-0 pointer-events-none z-20"
              style={{
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                borderRadius: '50%'
              }}
            />
            
            {/* Borde del círculo */}
            <div className="absolute inset-0 border-4 border-primary/50 rounded-full pointer-events-none z-30" />
            
            {/* Contenedor de la imagen con overflow visible */}
            <div 
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{ zIndex: 10 }}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Profile"
                className="absolute"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transformOrigin: 'center',
                  width: '100%',
                  height: 'auto',
                  minHeight: '100%',
                  minWidth: '100%',
                  objectFit: 'contain',
                  userSelect: 'none',
                  WebkitUserDrag: 'none',
                  pointerEvents: isDragging ? 'none' : 'auto',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-50%',
                  marginTop: '-50%'
                }}
                draggable={false}
                crossOrigin="anonymous"
              />
            </div>
          </div>

          {/* Instructions */}
          <p className="text-sm text-zinc-400 text-center mt-4">
            Drag to reposition • Use zoom controls to adjust size
          </p>

          {/* Zoom Controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-base-300 hover:bg-base-100 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Zoom:</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-32 range range-sm range-primary"
              />
              <span className="text-sm font-medium w-12 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            
            <button
              onClick={handleZoomIn}
              className="p-2 bg-base-300 hover:bg-base-100 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-base-300">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-base-300 hover:bg-base-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Apply Changes
          </button>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCropper;
