import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Upload, Download, RefreshCw, Type, Image as ImageIcon, Settings, 
  Layers, Sparkles, Plus, Minus, Eye, Palette, Search, Check, 
  Shuffle, Sliders, Maximize2, ZoomIn, ZoomOut, Terminal, Activity, 
  Cpu, Feather, Zap, Brush, Eraser, DownloadCloud, PenTool, Layout
} from 'lucide-react';

const FALLBACK_WORDS = [
  'CYBERPUNK', 'NEON', 'MATRIX', 'GRID', 'SYNTH', 'QUANTUM', 'SYSTEM', 
  'VECTOR', 'PIXEL', 'CODE', 'SIGNAL', 'CORE', 'DATA', 'NODE', 'FLOW', 
  'PULSE', 'GLITCH', 'ECHO', 'BINARY', 'CIRCUIT', 'TERMINAL', 'LIGHT'
];

const PRESET_FONTS = [
  'Space Mono', 'Inter', 'Cinzel', 'Playfair Display', 'Press Start 2P',
  'Permanent Marker', 'Bungee', 'Fira Code', 'Oswald', 'Rubik Glitch'
];

const PRESET_STYLES = [
  {
    name: 'Cyberpunk Neon', theme: 'cyberpunk', detectMode: 'Combined',
    textColorMode: 'Cyberpunk Gradient', bgColor: '#050505', 
    colorA: '#00ffff', colorB: '#10b981', monoColor: '#00ffff',
    blockSize: 10, threshold: 128, fontSizeBase: 12, fontSizeVariance: 8, fontName: 'Space Mono'
  },
  {
    name: 'Monochrome Noir', theme: 'shadow architecture', detectMode: 'Dark',
    textColorMode: 'Monochrome', bgColor: '#080808', 
    colorA: '#ffffff', colorB: '#ffffff', monoColor: '#ffffff',
    blockSize: 8, threshold: 140, fontSizeBase: 10, fontSizeVariance: 4, fontName: 'Cinzel'
  },
  {
    name: 'Original RGB Density', theme: 'nature elements', detectMode: 'Bright',
    textColorMode: 'Original Pixel', bgColor: '#000000', 
    colorA: '#10b981', colorB: '#00ffff', monoColor: '#10b981',
    blockSize: 9, threshold: 90, fontSizeBase: 11, fontSizeVariance: 6, fontName: 'Inter'
  },
  {
    name: 'Matrix Stream', theme: 'hacker code', detectMode: 'Combined',
    textColorMode: 'Matrix Green', bgColor: '#020b05', 
    colorA: '#10b981', colorB: '#10b981', monoColor: '#10b981',
    blockSize: 12, threshold: 110, fontSizeBase: 13, fontSizeVariance: 5, fontName: 'Fira Code'
  }
];

const RESOLUTIONS = {
  'Auto (Match Image)': { w: 'auto', h: 'auto' },
  'Square 1:1 (1080x1080)': { w: 1080, h: 1080 },
  'Portrait 4:5 (1080x1350)': { w: 1080, h: 1350 },
  'Landscape 16:9 (1920x1080)': { w: 1920, h: 1080 },
  'Instagram Story (1080x1920)': { w: 1080, h: 1920 },
  'Poster (2400x3000)': { w: 2400, h: 3000 }
};

const escapeXml = (unsafe) => unsafe.replace(/[<>&'"]/g, c => ({'<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'}[c]));

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 255, b: 255 };
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const Accordion = ({ title, children, isOpen, onToggle, icon: Icon, badge }) => (
  <div className="border border-[#222] bg-[#0a0a0a] rounded-lg overflow-hidden mb-3 transition-all duration-200 shadow-sm hover:border-[#333]">
    <button
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center justify-between bg-[#111] hover:bg-[#161616] transition-colors font-mono text-xs tracking-wider uppercase text-gray-300"
    >
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="w-4 h-4 text-cyan-400" />}
        <span className="font-semibold text-gray-100 flex items-center gap-2">{title}</span>
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 font-normal">
            {badge}
          </span>
        )}
      </div>
      <div className="p-1 rounded bg-[#1a1a1a] text-cyan-400">
        {isOpen ? <Minus className="w-3.5 h-3.5 text-cyan-400" /> : <Plus className="w-3.5 h-3.5 text-gray-400" />}
      </div>
    </button>
    {isOpen && (
      <div className="p-4 border-t border-[#1f1f1f] space-y-4 bg-[#0a0a0a]/90 backdrop-blur">
        {children}
      </div>
    )}
  </div>
);

const Slider = ({ label, value, min, max, step = 1, onChange, unit = "" }) => (
  <div className="space-y-1.5 font-mono">
    <div className="flex justify-between items-center text-xs">
      <span className="text-gray-400">{label}</span>
      <span className="text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-900/40">
        {value}{unit}
      </span>
    </div>
    <div className="relative flex items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all border border-[#2a2a2a]"
      />
    </div>
  </div>
);

const ToggleButton = ({ label, active, onClick, icon: Icon, description }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-lg border text-xs font-mono transition-all duration-200 ${
      active
        ? "border-cyan-500/60 bg-cyan-950/30 text-cyan-300 shadow-[0_0_12px_rgba(0,255,255,0.08)]"
        : "border-[#222] bg-[#111] text-gray-400 hover:border-[#333] hover:text-gray-200"
    }`}
  >
    <div className="flex items-center gap-2.5 text-left">
      {Icon && <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-gray-500'}`} />}
      <div>
        <div className="font-semibold tracking-wide">{label}</div>
        {description && <div className="text-[10px] text-gray-500 font-normal mt-0.5">{description}</div>}
      </div>
    </div>
    <div className={`w-3.5 h-3.5 rounded-full border transition-all flex items-center justify-center ${
      active ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_#00ffff]' : 'border-gray-600 bg-transparent'
    }`}>
      {active && <div className="w-1 h-1 bg-black rounded-full" />}
    </div>
  </button>
);

const ButtonGroup = ({ options, value, onChange }) => (
  <div className="grid grid-cols-2 gap-1.5 bg-[#080808] p-1.5 rounded-lg border border-[#222]">
    {options.map((opt) => (
      <button
        key={opt.id}
        onClick={() => onChange(opt.id)}
        className={`px-3 py-2 text-[11px] font-mono rounded-md transition-all text-center flex items-center justify-center gap-1.5 ${
          value === opt.id
            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm font-semibold"
            : "text-gray-400 hover:text-gray-200 hover:bg-[#141414] border border-transparent"
        }`}
      >
        {opt.icon && <opt.icon className="w-3.5 h-3.5" />}
        <span>{opt.label}</span>
      </button>
    ))}
  </div>
);

export default function App() {
  const [openSections, setOpenSections] = useState({
    source: true, words: true, font: true, pixel: true, masking: true, styling: true
  });

  // Source & Image
  const [imageSrc, setImageSrc] = useState(null);
  const [imageBrightness, setImageBrightness] = useState(100);
  const [imageContrast, setImageContrast] = useState(100);
  const [imageInvert, setImageInvert] = useState(false);
  const [bgImageOpacity, setBgImageOpacity] = useState(0);
  const [canvasResolution, setCanvasResolution] = useState('Auto (Match Image)');

  // Theme & Words
  const [themeInput, setThemeInput] = useState('cyberpunk');
  const [themeWords, setThemeWords] = useState(FALLBACK_WORDS);
  const [customWord, setCustomWord] = useState('');
  const [isFetchingWords, setIsFetchingWords] = useState(false);
  const [isSingleCharMode, setIsSingleCharMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [useSemanticMapping, setUseSemanticMapping] = useState(false);

  // Font
  const [fontInput, setFontInput] = useState('Space Mono');
  const [activeFont, setActiveFont] = useState('Space Mono');
  const [isLoadingFont, setIsLoadingFont] = useState(false);
  const [isFontReady, setIsFontReady] = useState(true);

  // Pixel Analysis Engine
  const [blockSize, setBlockSize] = useState(10);
  const [threshold, setThreshold] = useState(120);
  const [detectMode, setDetectMode] = useState('Combined');

  // Interactive Masking
  const [maskMode, setMaskMode] = useState('off'); 
  const [maskBrushSize, setMaskBrushSize] = useState(30);
  const [enableMaskFiltering, setEnableMaskFiltering] = useState(false);
  const [maskUpdateTrigger, setMaskUpdateTrigger] = useState(0);
  const isDrawingMaskRef = useRef(false);
  const lastPosRef = useRef(null);

  // Typography & Color
  const [fontSizeBase, setFontSizeBase] = useState(12);
  const [fontSizeVariance, setFontSizeVariance] = useState(6);
  const [textOpacity, setTextOpacity] = useState(0.9);
  const [textColorMode, setTextColorMode] = useState('Cyberpunk Gradient');
  const [monochromeColor, setMonochromeColor] = useState('#00FFFF');
  const [colorA, setColorA] = useState('#00FFFF');
  const [colorB, setColorB] = useState('#10B981');
  const [bgColor, setBgColor] = useState('#050505');
  const [rotationJitter, setRotationJitter] = useState(0);
  const [positionJitter, setPositionJitter] = useState(0);
  const [isUppercase, setIsUppercase] = useState(true);

  // Viewport & Export
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showSourceOverlay, setShowSourceOverlay] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.3);
  const [renderedStats, setRenderedStats] = useState({ nodes: 0, renderTime: 0 });
  const [svgExportData, setSvgExportData] = useState('');

  // DOM Refs
  const canvasRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const maskDisplayRef = useRef(null);
  const fileInputRef = useRef(null);
  const viewportRef = useRef(null);

  const renderConfig = useMemo(() => ({
    imageSrc, imageBrightness, imageContrast, imageInvert, bgImageOpacity, canvasResolution,
    blockSize, threshold, detectMode, 
    fontSizeBase, fontSizeVariance, textOpacity, textColorMode, monochromeColor, 
    colorA, colorB, bgColor, activeFont, themeWords, customWord, rotationJitter, isUppercase,
    isSingleCharMode, positionJitter, enableMaskFiltering, maskUpdateTrigger, useSemanticMapping
  }), [
    imageSrc, imageBrightness, imageContrast, imageInvert, bgImageOpacity, canvasResolution,
    blockSize, threshold, detectMode, 
    fontSizeBase, fontSizeVariance, textOpacity, textColorMode, monochromeColor, 
    colorA, colorB, bgColor, activeFont, themeWords, customWord, rotationJitter, isUppercase,
    isSingleCharMode, positionJitter, enableMaskFiltering, maskUpdateTrigger, useSemanticMapping
  ]);

  const debouncedConfig = useDebounce(renderConfig, 200);

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const generateDefaultPattern = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 600;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 600, 600);
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';

    ctx.beginPath(); ctx.arc(300, 300, 220, 0, Math.PI * 2); ctx.lineWidth = 14; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(300, 100); ctx.lineTo(500, 300); ctx.lineTo(300, 500); ctx.lineTo(100, 300);
    ctx.closePath(); ctx.lineWidth = 8; ctx.stroke();

    const grad = ctx.createRadialGradient(260, 260, 20, 300, 300, 140);
    grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.5, '#888888'); grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(300, 300, 130, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('CYBER', 300, 220); ctx.fillText('CORE', 300, 380);

    return canvas.toDataURL();
  }, []);

  useEffect(() => {
    const defaultDataUrl = generateDefaultPattern();
    setImageSrc(defaultDataUrl);
  }, [generateDefaultPattern]);

  const processSemanticText = () => {
    if (!bulkText.trim()) return;
    const words = bulkText.toUpperCase().replace(/[^\w\s-]/g, '').split(/\s+/).filter(w => w.length > 2);
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    const sortedWords = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
    setThemeWords(sortedWords.length > 0 ? sortedWords : FALLBACK_WORDS);
    setUseSemanticMapping(true);
  };

  const fetchThemeWords = async (themeName) => {
    if (!themeName.trim()) return;
    setIsFetchingWords(true);
    try {
      const response = await fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(themeName.trim())}&max=50`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const words = data.map(w => w.word.toUpperCase()).filter(w => w.length > 1 && !w.includes(' '));
        setThemeWords(words.length > 0 ? words : FALLBACK_WORDS);
      } else {
        setThemeWords(FALLBACK_WORDS);
      }
    } catch (err) {
      setThemeWords(FALLBACK_WORDS);
    } finally {
      setIsFetchingWords(false);
    }
  };

  const loadGoogleFont = async (fontName) => {
    if (!fontName.trim()) return;
    setIsLoadingFont(true);
    setIsFontReady(false);
    try {
      const fontSlug = fontName.trim().replace(/ /g, '+');
      const linkId = 'dynamic-google-font-stylesheet';
      let link = document.getElementById(linkId);

      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = `https://fonts.googleapis.com/css2?family=${fontSlug}:wght@300;400;700;900&display=swap`;

      if (document.fonts) {
        await document.fonts.ready;
        try {
          await document.fonts.load(`16px "${fontName}"`);
        } catch (e) {
          console.warn("Font load check fallback:", e);
        }
      }
      setActiveFont(fontName);
      setIsFontReady(true);
    } catch (err) {
      console.error('Failed to load Google Font:', err);
      setIsFontReady(true);
    } finally {
      setIsLoadingFont(false);
    }
  };

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { x, y };
  };

  const paintMask = (e, isDown = false) => {
    if (!maskCanvasRef.current || !maskDisplayRef.current || !canvasRef.current) return;
    const pos = getCanvasPos(e);
    
    const mCtx = maskCanvasRef.current.getContext('2d');
    const dCtx = maskDisplayRef.current.getContext('2d');
    
    const drawStroke = (ctx, isVisual) => {
      ctx.globalCompositeOperation = maskMode === 'erase' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = maskMode === 'erase' ? 'rgba(0,0,0,1)' : (isVisual ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 0, 0, 1)');
      ctx.fillStyle = ctx.strokeStyle;
      ctx.lineWidth = maskBrushSize * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      if (isDown || !lastPosRef.current) {
        ctx.arc(pos.x, pos.y, maskBrushSize, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    };

    drawStroke(mCtx, false);
    drawStroke(dCtx, true);
    lastPosRef.current = pos;
  };

  const handleMaskPointerDown = (e) => {
    if (maskMode === 'off') return;
    if (e.cancelable) e.preventDefault();
    isDrawingMaskRef.current = true;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch(err){}
    paintMask(e, true);
  };

  const handleMaskPointerMove = (e) => {
    if (maskMode === 'off' || !isDrawingMaskRef.current) return;
    if (e.cancelable) e.preventDefault();
    paintMask(e, false);
  };

  const handleMaskPointerUp = (e) => {
    if (maskMode !== 'off' && isDrawingMaskRef.current) {
      isDrawingMaskRef.current = false;
      lastPosRef.current = null;
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(err){}
      setMaskUpdateTrigger(prev => prev + 1); 
    }
  };

  const clearMask = () => {
    if (!maskCanvasRef.current || !maskDisplayRef.current) return;
    const mCtx = maskCanvasRef.current.getContext('2d');
    const dCtx = maskDisplayRef.current.getContext('2d');
    mCtx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
    dCtx.clearRect(0, 0, maskDisplayRef.current.width, maskDisplayRef.current.height);
    setMaskUpdateTrigger(prev => prev + 1);
  };

  const randomizeAll = () => {
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomBool = () => Math.random() > 0.5;

    const detectModes = ['Dark', 'Bright', 'Contrast', 'Combined'];
    const textColors = ['Monochrome', 'Original Pixel', 'Cyberpunk Gradient', 'Matrix Green'];
    const randomThemes = ['cyberpunk', 'space', 'hacker', 'ocean', 'nature', 'robot', 'geometry'];

    setDetectMode(randomItem(detectModes));
    setTextColorMode(randomItem(textColors));
    setBlockSize(randomInt(5, 20));
    setThreshold(randomInt(50, 180));
    setFontSizeBase(randomInt(8, 24));
    setFontSizeVariance(randomInt(0, 15));
    
    setRotationJitter(randomBool() ? 0 : randomInt(1, 45));
    setPositionJitter(randomBool() ? 0 : randomInt(1, 10));
    
    setIsSingleCharMode(randomBool());
    setIsUppercase(randomBool());

    const randomFont = randomItem(PRESET_FONTS);
    setFontInput(randomFont);
    loadGoogleFont(randomFont);

    const randTheme = randomItem(randomThemes);
    setThemeInput(randTheme);
    fetchThemeWords(randTheme);
  };

  const renderTypographyCanvas = useCallback((config) => {
    if (!config.imageSrc || !canvasRef.current || !hiddenCanvasRef.current || !isFontReady) return;

    const startTime = performance.now();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const hiddenCanvas = hiddenCanvasRef.current;
    const hiddenCtx = hiddenCanvas.getContext('2d', { willReadFrequently: true });
    const maskCtx = maskCanvasRef.current?.getContext('2d', { willReadFrequently: true });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = config.imageSrc;

    img.onload = () => {
      let targetWidth, targetHeight;
      if (!config.canvasResolution || config.canvasResolution === 'Auto (Match Image)') {
        const maxCanvasWidth = 800;
        const aspect = img.height / img.width;
        targetWidth = Math.min(img.width, maxCanvasWidth);
        targetHeight = Math.round(targetWidth * aspect);
      } else {
        targetWidth = RESOLUTIONS[config.canvasResolution].w;
        targetHeight = RESOLUTIONS[config.canvasResolution].h;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      hiddenCanvas.width = targetWidth;
      hiddenCanvas.height = targetHeight;

      if (maskCanvasRef.current && maskDisplayRef.current) {
        if (maskCanvasRef.current.width !== targetWidth || maskCanvasRef.current.height !== targetHeight) {
          maskCanvasRef.current.width = targetWidth;
          maskCanvasRef.current.height = targetHeight;
          maskDisplayRef.current.width = targetWidth;
          maskDisplayRef.current.height = targetHeight;
        }
      }

      const imgRatio = img.width / img.height;
      const canvasRatio = targetWidth / targetHeight;
      let sWidth = img.width, sHeight = img.height, sx = 0, sy = 0;

      if (imgRatio > canvasRatio) {
        sWidth = img.height * canvasRatio;
        sx = (img.width - sWidth) / 2;
      } else {
        sHeight = img.width / canvasRatio;
        sy = (img.height - sHeight) / 2;
      }

      hiddenCtx.save();
      hiddenCtx.filter = `brightness(${config.imageBrightness}%) contrast(${config.imageContrast}%) ${config.imageInvert ? 'invert(100%)' : ''}`;
      hiddenCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
      hiddenCtx.restore();

      const imgData = hiddenCtx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imgData.data;
      let maskData = null;
      if (config.enableMaskFiltering && maskCtx) {
        if (maskCanvasRef.current.width === targetWidth) {
          maskData = maskCtx.getImageData(0, 0, targetWidth, targetHeight).data;
        }
      }

      let minLum = 255;
      let maxLum = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 20) continue;
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (lum < minLum) minLum = lum;
        if (lum > maxLum) maxLum = lum;
      }
      if (maxLum === minLum) maxLum = minLum + 1;

      ctx.fillStyle = config.bgColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      const activeWordList = config.customWord.trim() !== '' 
        ? [config.customWord.trim()] 
        : config.themeWords.length > 0 ? config.themeWords : FALLBACK_WORDS;

      let renderedNodeCount = 0;
      let wordIndex = 0;
      const step = Math.max(4, config.blockSize);

      const svgBuilder = [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${targetWidth} ${targetHeight}" width="${targetWidth}" height="${targetHeight}">`,
        `<rect width="100%" height="100%" fill="${config.bgColor}" />`
      ];

      if (config.bgImageOpacity > 0) {
        ctx.save();
        ctx.globalAlpha = config.bgImageOpacity / 100;
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
        ctx.restore();
        svgBuilder.push(`<image href="${config.imageSrc}" width="100%" height="100%" opacity="${config.bgImageOpacity / 100}" preserveAspectRatio="xMidYMid slice" />`);
      }

      for (let y = 0; y < targetHeight; y += step) {
        for (let x = 0; x < targetWidth; x += step) {
          const pixelIndex = (y * targetWidth + x) * 4;
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];
          const a = data[pixelIndex + 3];

          if (a < 20) continue;
          if (config.enableMaskFiltering && maskData) {
            const maskAlpha = maskData[pixelIndex + 3];
            if (maskAlpha === 0) continue;
          }

          let rawLuminance = 0.299 * r + 0.587 * g + 0.114 * b;
          const normalizedLuminance = ((rawLuminance - minLum) / (maxLum - minLum)) * 255;

          let intensity = 0;
          let isActive = false;

          if (config.detectMode === 'Dark') {
            isActive = normalizedLuminance < config.threshold;
            intensity = isActive ? (config.threshold - normalizedLuminance) / config.threshold : 0;
          } else if (config.detectMode === 'Bright') {
            isActive = normalizedLuminance > (255 - config.threshold);
            intensity = isActive ? (normalizedLuminance - (255 - config.threshold)) / config.threshold : 0;
          } else if (config.detectMode === 'Contrast') {
            const rightIdx = (y * targetWidth + Math.min(x + step, targetWidth - 1)) * 4;
            const rRight = data[rightIdx], gRight = data[rightIdx + 1], bRight = data[rightIdx + 2];
            let rawRight = 0.299 * rRight + 0.587 * gRight + 0.114 * bRight;
            const rightLum = ((rawRight - minLum) / (maxLum - minLum)) * 255;
            
            const bottomIdx = (Math.min(y + step, targetHeight - 1) * targetWidth + x) * 4;
            const rBot = data[bottomIdx], gBot = data[bottomIdx + 1], bBot = data[bottomIdx + 2];
            let rawBot = 0.299 * rBot + 0.587 * gBot + 0.114 * bBot;
            const bottomLum = ((rawBot - minLum) / (maxLum - minLum)) * 255;

            const edgeStrength = Math.max(Math.abs(normalizedLuminance - rightLum), Math.abs(normalizedLuminance - bottomLum));
            isActive = edgeStrength > (config.threshold / 2);
            intensity = isActive ? Math.min(1, edgeStrength / 128) : 0;
          } else if (config.detectMode === 'Combined') {
            const midPointDist = Math.abs(normalizedLuminance - 128);
            isActive = midPointDist > (128 - (config.threshold / 2));
            intensity = isActive ? midPointDist / 128 : 0;
          }
          
          intensity = Math.max(0, Math.min(1, intensity));

          if (isActive) {
            renderedNodeCount++;

            let textToDraw = "";
            let currentWord = activeWordList[wordIndex % activeWordList.length];
            if (config.isUppercase) currentWord = currentWord.toUpperCase();
            
            if (config.isSingleCharMode) {
              const charPool = currentWord + "0123456789@#$%&*";
              const charIndex = (x * 17 + y * 31) % charPool.length;
              textToDraw = charPool[charIndex];
            } else if (config.useSemanticMapping && activeWordList.length > 0) {
              const maxIdx = activeWordList.length - 1;
              const mappedIdx = Math.max(0, Math.min(maxIdx, Math.floor((1 - intensity) * maxIdx)));
              textToDraw = activeWordList[mappedIdx];
            } else { 
              textToDraw = currentWord; wordIndex++; 
            }

            const computedFontSize = config.fontSizeBase + (intensity * config.fontSizeVariance * 2);
            const weight = intensity > 0.75 ? 900 : (intensity > 0.4 ? 700 : 300);
            
            ctx.font = `${weight} ${computedFontSize}px "${config.activeFont}", monospace, sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

            let skipBlocks = 0;
            if (!config.isSingleCharMode) {
              const textWidth = ctx.measureText(textToDraw).width;
              if (textWidth > step) {
                skipBlocks = Math.max(0, Math.floor((textWidth - step) / step));
              }
            }

            let fillStyleColor = config.monochromeColor;
            if (config.textColorMode === 'Original Pixel') {
              fillStyleColor = `rgba(${r}, ${g}, ${b}, ${config.textOpacity})`;
            } else if (config.textColorMode === 'Cyberpunk Gradient') {
              const ratio = (x / targetWidth);
              const rgbA = hexToRgb(config.colorA);
              const rgbB = hexToRgb(config.colorB);
              const cr = Math.round(rgbA.r * (1 - ratio) + rgbB.r * ratio);
              const cg = Math.round(rgbA.g * (1 - ratio) + rgbB.g * ratio);
              const cb = Math.round(rgbA.b * (1 - ratio) + rgbB.b * ratio);
              fillStyleColor = `rgba(${cr}, ${cg}, ${cb}, ${config.textOpacity * intensity})`;
            } else if (config.textColorMode === 'Matrix Green') {
              const greenIntensity = Math.round(150 + (normalizedLuminance / 255) * 105);
              fillStyleColor = `rgba(16, ${greenIntensity}, 129, ${config.textOpacity * intensity})`;
            } else {
              ctx.globalAlpha = config.textOpacity;
            }

            ctx.fillStyle = fillStyleColor;

            let finalX = x;
            let finalY = y;
            if (config.positionJitter > 0) {
              finalX += (Math.random() - 0.5) * config.positionJitter;
              finalY += (Math.random() - 0.5) * config.positionJitter;
            }

            ctx.save();
            ctx.translate(finalX, finalY);
            let finalRotation = 0;
            if (config.rotationJitter > 0) {
              finalRotation = (Math.random() - 0.5) * (config.rotationJitter * Math.PI / 180);
              ctx.rotate(finalRotation);
            }
            ctx.fillText(textToDraw, 0, 0);
            ctx.restore();
            ctx.globalAlpha = 1.0;

            const svgColor = fillStyleColor.replace(/rgba\((.*?),\s*(.*?),\s*(.*?),\s*(.*?)\)/, 'rgba($1,$2,$3,$4)');
            const rotDeg = finalRotation * (180 / Math.PI);
            const transform = rotDeg !== 0 ? `transform="rotate(${rotDeg}, ${finalX}, ${finalY})"` : "";
            svgBuilder.push(
              `<text x="${finalX}" y="${finalY}" font-family="${config.activeFont}, monospace" font-size="${computedFontSize}px" font-weight="${weight}" fill="${svgColor}" text-anchor="middle" dominant-baseline="central" ${transform}>${escapeXml(textToDraw)}</text>`
            );

            x += skipBlocks * step;
          }
        }
      }

      svgBuilder.push('</svg>');
      setSvgExportData(svgBuilder.join('\n'));

      const endTime = performance.now();
      setRenderedStats({ nodes: renderedNodeCount, renderTime: Math.round(endTime - startTime) });
    };
  }, [isFontReady]);

  useEffect(() => {
    if (isFontReady) {
      renderTypographyCanvas(debouncedConfig);
    }
  }, [debouncedConfig, renderTypographyCanvas, isFontReady]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImageSrc(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const applyStylePreset = (preset) => {
    setThemeInput(preset.theme); setDetectMode(preset.detectMode);
    setTextColorMode(preset.textColorMode); setBgColor(preset.bgColor);
    setColorA(preset.colorA); setColorB(preset.colorB);
    setMonochromeColor(preset.monoColor); setBlockSize(preset.blockSize);
    setThreshold(preset.threshold); setFontSizeBase(preset.fontSizeBase);
    setFontSizeVariance(preset.fontSizeVariance); setFontInput(preset.fontName);
    loadGoogleFont(preset.fontName); fetchThemeWords(preset.theme);
  };

  const exportHighResPNG = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `typocore-engine-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
  };

  const exportHighResSVG = () => {
    if (!svgExportData) return;
    const blob = new Blob([svgExportData], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `typocore-vector-${Date.now()}.svg`;
    link.click();
  };

  return (
    <div className="flex h-screen w-screen bg-[#050505] text-gray-200 font-sans overflow-hidden select-none">
      <canvas ref={hiddenCanvasRef} className="hidden" />

      {/* SIDEBAR PANEL */}
      <aside className="w-[420px] min-w-[420px] h-full bg-[#0a0a0a] border-r border-[#1f1f1f] flex flex-col z-20 shadow-2xl">
        <div className="p-4 border-b border-[#1f1f1f] bg-[#080808] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.15)]">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-mono font-bold text-sm text-cyan-50 tracking-wider flex items-center gap-2">
                  TYPO ENGINE <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">v4.0</span>
                </h1>
                <p className="text-[10px] font-mono text-gray-500">MEGA STUDIO / BLUEPRINT</p>
              </div>
            </div>
            <button onClick={() => setImageSrc(generateDefaultPattern())} className="p-2 rounded bg-[#141414] hover:bg-[#1f1f1f] text-gray-400 hover:text-cyan-400 transition-colors border border-[#262626]" title="Reset Default Pattern">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <button onClick={randomizeAll} className="w-full py-2 px-3 rounded border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-900/40 hover:border-emerald-400 text-emerald-400 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_10px_rgba(16,185,129,0.05)] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Shuffle className="w-3.5 h-3.5" /> Randomize All Options
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          <Accordion title="1. Source & Presets" icon={ImageIcon} isOpen={openSections.source} onToggle={() => toggleSection('source')}>
            <div className="space-y-3">
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-2.5 px-3 rounded-lg border border-dashed border-cyan-500/40 bg-cyan-950/10 hover:bg-cyan-950/30 text-cyan-300 font-mono text-xs flex items-center justify-center gap-2 transition-all group">
                <Upload className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Upload Target Image</span>
              </button>
              <div className="pt-2">
                <label className="text-[11px] font-mono text-gray-400 mb-1.5 block">Style Blueprint Presets</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_STYLES.map((preset) => (
                    <button key={preset.name} onClick={() => applyStylePreset(preset)} className="px-2.5 py-1.5 rounded border border-[#222] bg-[#111] hover:border-cyan-500/40 hover:bg-[#161616] text-[10px] font-mono text-gray-300 text-left transition-all truncate">
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-[#1f1f1f]">
                <Slider label="Image Contrast" value={imageContrast} min={50} max={200} onChange={setImageContrast} unit="%" />
                <Slider label="Image Brightness" value={imageBrightness} min={50} max={200} onChange={setImageBrightness} unit="%" />
                <Slider label="Background Image Opacity" value={bgImageOpacity} min={0} max={100} onChange={setBgImageOpacity} unit="%" />
                <ToggleButton label="Invert Target Image" active={imageInvert} onClick={() => setImageInvert(!imageInvert)} icon={Zap} />
              </div>
            </div>
          </Accordion>

          <Accordion title="2. Theme & Lexicon" icon={Search} badge={`${themeWords.length} Words`} isOpen={openSections.words} onToggle={() => toggleSection('words')}>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-gray-400 mb-1 block">Datamuse Typography Theme</label>
                <div className="flex gap-1.5">
                  <input type="text" value={themeInput} onChange={(e) => setThemeInput(e.target.value)} placeholder="e.g. cyberpunk, matrix" className="flex-1 bg-[#121212] border border-[#262626] rounded px-2.5 py-1.5 text-xs font-mono text-gray-200 focus:outline-none focus:border-cyan-500" />
                  <button onClick={() => fetchThemeWords(themeInput)} disabled={isFetchingWords} className="px-3 py-1.5 bg-cyan-950/80 border border-cyan-500/40 hover:bg-cyan-900/60 text-cyan-300 font-mono text-xs rounded transition-colors flex items-center gap-1.5">
                    {isFetchingWords ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Fetch'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-mono text-gray-400 mb-1 block">Custom Override Word</label>
                <input type="text" value={customWord} onChange={(e) => setCustomWord(e.target.value)} placeholder="Single custom word (optional)" className="w-full bg-[#121212] border border-[#262626] rounded px-2.5 py-1.5 text-xs font-mono text-gray-200 focus:outline-none focus:border-cyan-500" />
              </div>
              <div className="pt-2 border-t border-[#1f1f1f]">
                <label className="text-[11px] font-mono text-gray-400 mb-1 block">Linguistic Text Analyzer (Lyrics/Poetry)</label>
                <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder="Paste full lyrics or poetry here..." className="w-full bg-[#121212] border border-[#262626] rounded px-2.5 py-1.5 text-xs font-mono text-gray-200 focus:outline-none focus:border-cyan-500 min-h-[70px] custom-scrollbar" />
                <button onClick={processSemanticText} className="mt-1.5 w-full py-1.5 bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/60 text-emerald-300 font-mono text-[10px] rounded transition-colors flex items-center justify-center gap-1.5">
                  <Activity className="w-3.5 h-3.5"/> Analyze Semantic Frequency
                </button>
              </div>
              <ToggleButton active={useSemanticMapping} label="SEMANTIC INTENSITY MAPPING" onClick={() => setUseSemanticMapping(!useSemanticMapping)} icon={Layers} description="Kata dominan = Tebal/Gelap. Kata hubung = Tipis/Terang." />
              <ToggleButton active={isSingleCharMode} label="SINGLE CHAR MODE (PHOTOREAL)" onClick={() => setIsSingleCharMode(!isSingleCharMode)} icon={Layers} description="Renders individual characters for higher density details." />
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-mono text-gray-500">Active Lexicon Stream</span>
                  <button onClick={() => setThemeWords([...themeWords].sort(() => Math.random() - 0.5))} className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1">
                    <Shuffle className="w-2.5 h-2.5" /> Shuffle
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-[#080808] border border-[#1f1f1f] rounded text-[10px] font-mono text-gray-400 custom-scrollbar">
                  {themeWords.map((w, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-[#141414] border border-[#222] text-cyan-300/80">{w}</span>
                  ))}
                </div>
              </div>
            </div>
          </Accordion>

          <Accordion title="3. Dynamic Google Fonts" icon={Type} badge={activeFont} isOpen={openSections.font} onToggle={() => toggleSection('font')}>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-gray-400 mb-1 block">Google Font Name</label>
                <div className="flex gap-1.5">
                  <input type="text" value={fontInput} onChange={(e) => setFontInput(e.target.value)} placeholder="e.g. Space Mono, Cinzel" className="flex-1 bg-[#121212] border border-[#262626] rounded px-2.5 py-1.5 text-xs font-mono text-gray-200 focus:outline-none focus:border-cyan-500" />
                  <button onClick={() => loadGoogleFont(fontInput)} disabled={isLoadingFont} className="px-3 py-1.5 bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900/60 text-emerald-300 font-mono text-xs rounded transition-colors flex items-center gap-1.5">
                    {isLoadingFont ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Load Font'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono text-gray-500 mb-1.5 block">Preset Fonts Quick Load</label>
                <div className="flex flex-wrap gap-1">
                  {PRESET_FONTS.map((font) => (
                    <button key={font} onClick={() => { setFontInput(font); loadGoogleFont(font); }} className={`px-2 py-1 rounded text-[10px] font-mono border transition-all ${activeFont === font ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold' : 'bg-[#121212] text-gray-400 border-[#222] hover:border-gray-600'}`}>{font}</button>
                  ))}
                </div>
              </div>
              <ToggleButton label="FORCE UPPERCASE LEXICON" active={isUppercase} onClick={() => setIsUppercase(!isUppercase)} icon={Feather} />
            </div>
          </Accordion>

          <Accordion title="4. Pixel Analysis Engine" icon={Cpu} isOpen={openSections.pixel} onToggle={() => toggleSection('pixel')}>
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-mono text-gray-400 mb-1.5 block">Detection Mode Algorithm</label>
                <ButtonGroup
                  options={[
                    { id: 'Dark', label: 'Dark Nodes' }, { id: 'Bright', label: 'Bright Nodes' },
                    { id: 'Contrast', label: 'Contrast Edges' }, { id: 'Combined', label: 'Combined Dual' }
                  ]}
                  value={detectMode} onChange={setDetectMode}
                />
              </div>
              <Slider label="Block Grid Density (BlockSize)" value={blockSize} min={5} max={25} onChange={setBlockSize} unit="px" />
              <Slider label="Luminance Threshold" value={threshold} min={10} max={240} onChange={setThreshold} />
            </div>
          </Accordion>

          <Accordion title="5. Interactive Masking & Brush" icon={PenTool} isOpen={openSections.masking} onToggle={() => toggleSection('masking')}>
            <div className="space-y-3.5">
              <ToggleButton label="ENABLE MASK FILTERING" active={enableMaskFiltering} onClick={() => setEnableMaskFiltering(!enableMaskFiltering)} icon={Layers} description="Restrict rendering strictly to painted mask area." />
              <div>
                <label className="text-[11px] font-mono text-gray-400 mb-1.5 block">Canvas Brush Mode</label>
                <ButtonGroup
                  options={[
                    { id: 'off', label: 'Disabled', icon: Settings },
                    { id: 'draw', label: 'Draw Mask', icon: Brush },
                    { id: 'erase', label: 'Erase Mask', icon: Eraser },
                  ]}
                  value={maskMode} onChange={setMaskMode}
                />
              </div>
              <Slider label="Brush Size" value={maskBrushSize} min={5} max={100} onChange={setMaskBrushSize} unit="px" />
              <button onClick={clearMask} className="w-full py-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] rounded text-[11px] font-mono text-gray-300 transition-colors">
                Clear Existing Mask Data
              </button>
            </div>
          </Accordion>

          <Accordion title="6. Typography & Colors" icon={Palette} isOpen={openSections.styling} onToggle={() => toggleSection('styling')}>
            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] font-mono text-gray-400 mb-1.5 block">Text Color Mode</label>
                <ButtonGroup
                  options={[
                    { id: 'Monochrome', label: 'Monochrome' }, { id: 'Original Pixel', label: 'Original RGB' },
                    { id: 'Cyberpunk Gradient', label: 'Custom Gradient' }, { id: 'Matrix Green', label: 'Matrix Code' }
                  ]}
                  value={textColorMode} onChange={setTextColorMode}
                />
              </div>
              
              {textColorMode === 'Cyberpunk Gradient' && (
                <div className="flex items-center justify-between bg-[#111] p-2 rounded border border-[#222]">
                  <span className="text-xs font-mono text-gray-400">Gradient Colors</span>
                  <div className="flex gap-2">
                    <input type="color" value={colorA} onChange={(e) => setColorA(e.target.value)} className="w-8 h-8 rounded border border-gray-700 bg-transparent cursor-pointer" />
                    <input type="color" value={colorB} onChange={(e) => setColorB(e.target.value)} className="w-8 h-8 rounded border border-gray-700 bg-transparent cursor-pointer" />
                  </div>
                </div>
              )}
              
              {textColorMode === 'Monochrome' && (
                <div className="flex items-center justify-between bg-[#111] p-2 rounded border border-[#222]">
                  <span className="text-xs font-mono text-gray-400">Solid Text Color</span>
                  <input type="color" value={monochromeColor} onChange={(e) => setMonochromeColor(e.target.value)} className="w-8 h-8 rounded border border-gray-700 bg-transparent cursor-pointer" />
                </div>
              )}
              <div className="flex items-center justify-between bg-[#111] p-2 rounded border border-[#222]">
                <span className="text-xs font-mono text-gray-400">Canvas Background</span>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded border border-gray-700 bg-transparent cursor-pointer" />
              </div>
              
              <Slider label="Base Font Size" value={fontSizeBase} min={6} max={30} onChange={setFontSizeBase} unit="px" />
              <Slider label="Font Size Variance" value={fontSizeVariance} min={0} max={20} onChange={setFontSizeVariance} unit="px" />
              <Slider label="Position Jitter (Distortion)" value={positionJitter} min={0} max={20} onChange={setPositionJitter} unit="px" />
              <Slider label="Rotation Jitter Angle" value={rotationJitter} min={0} max={90} onChange={setRotationJitter} unit="°" />
              <Slider label="Text Opacity" value={Math.round(textOpacity * 100)} min={10} max={100} onChange={(v) => setTextOpacity(v / 100)} unit="%" />
            </div>
          </Accordion>
        </div>

        {/* EXPORT BUTTONS */}
        <div className="p-4 border-t border-[#1f1f1f] bg-[#080808] flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-mono text-gray-400 mb-1.5 block">Canvas Resolution (Export Size)</label>
            <select value={canvasResolution} onChange={(e) => setCanvasResolution(e.target.value)} className="w-full bg-[#111] border border-[#333] text-gray-300 text-xs font-mono p-2.5 rounded-lg outline-none cursor-pointer focus:border-cyan-500 mb-2">
              {Object.keys(RESOLUTIONS).map(res => (
                <option key={res} value={res}>{res}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={exportHighResPNG} className="flex-1 py-3 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Download className="w-4 h-4" /> Export PNG
            </button>
            <button onClick={exportHighResSVG} className="flex-1 py-3 px-2 rounded-lg border border-cyan-500/50 bg-cyan-950/50 hover:bg-cyan-900 text-cyan-300 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)] hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]">
              <DownloadCloud className="w-4 h-4" /> Export SVG
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE VIEWPORT */}
      <main className="flex-1 h-full bg-[#050505] flex flex-col relative overflow-hidden">
        <div className="h-12 border-b border-[#1f1f1f] bg-[#080808] px-6 flex items-center justify-between z-10 font-mono text-xs text-gray-400">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className={`w-4 h-4 ${isFontReady ? 'text-cyan-400 animate-pulse' : 'text-gray-600'}`} />
              <span className="text-gray-300">STUDIO CANVAS VIEWPORT</span>
            </div>
            <div className="hidden md:flex items-center gap-4 text-[11px] text-gray-500">
              <span>Nodes: <strong className="text-cyan-400">{renderedStats.nodes}</strong></span>
              <span>Render: <strong className="text-emerald-400">{renderedStats.renderTime}ms</strong></span>
              <span>Font: <strong className="text-gray-300">{activeFont} {isFontReady ? '' : '(Loading...)'}</strong></span>
              {maskMode !== 'off' && <span className="text-pink-400 font-bold ml-2">BRUSH MODE: {maskMode.toUpperCase()}</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSourceOverlay(!showSourceOverlay)} className={`px-3 py-1.5 rounded border text-[11px] flex items-center gap-1.5 transition-colors ${showSourceOverlay ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50' : 'bg-[#121212] text-gray-400 border-[#222] hover:text-gray-200'}`}>
              <Eye className="w-3.5 h-3.5" /> Source Overlay
            </button>
            <div className="flex items-center gap-1 bg-[#121212] p-1 rounded border border-[#222]">
              <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} className="p-1 hover:bg-[#222] rounded text-gray-400"><ZoomOut className="w-3.5 h-3.5" /></button>
              <span className="text-[10px] px-1.5 text-cyan-400 min-w-[40px] text-center">{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))} className="p-1 hover:bg-[#222] rounded text-gray-400"><ZoomIn className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[radial-gradient(#1f1f1f_1px,transparent_1px)] [background-size:20px_20px] relative select-none">
          <div
            ref={viewportRef}
            className={`relative transition-transform duration-150 ease-out shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-[#222] overflow-hidden bg-black flex items-center justify-center ${maskMode !== 'off' ? 'cursor-crosshair' : ''}`}
            style={{ 
              transform: `scale(${zoomLevel / 100})`, 
              touchAction: 'none'
            }}
            onPointerDown={handleMaskPointerDown}
            onPointerMove={handleMaskPointerMove}
            onPointerUp={handleMaskPointerUp}
            onPointerCancel={handleMaskPointerUp}
          >
            <canvas ref={canvasRef} className="block w-auto h-auto max-w-full max-h-[75vh] object-contain pointer-events-none" />
            <canvas ref={maskDisplayRef} className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-200 ${maskMode !== 'off' ? 'opacity-100' : 'opacity-0'}`} />
            {showSourceOverlay && imageSrc && (
              <img src={imageSrc} alt="Target Overlay" className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-200" style={{ opacity: overlayOpacity }} />
            )}
          </div>
        </div>

        {showSourceOverlay && (
          <div className="absolute top-16 right-6 bg-[#0a0a0a]/95 backdrop-blur border border-[#222] p-3 rounded-lg w-64 shadow-2xl z-20">
            <Slider label="Overlay Opacity" value={Math.round(overlayOpacity * 100)} min={10} max={100} onChange={(v) => setOverlayOpacity(v / 100)} unit="%" />
          </div>
        )}

        <div className="h-8 border-t border-[#1f1f1f] bg-[#080808] px-4 flex items-center justify-between font-mono text-[10px] text-gray-500 z-10">
          <div className="flex items-center gap-3">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>STATUS: {isFontReady ? 'ENGINE ONLINE' : 'AWAITING FONT LOAD...'}</span>
            <span className="text-[#333]">|</span>
            <span>LEXICON SIZE: {themeWords.length} WORDS</span>
          </div>
          <div className="flex items-center gap-3">
            <span>MODE: {detectMode.toUpperCase()} {enableMaskFiltering && '(MASK ACTIVE)'}</span>
            <span className="text-[#333]">|</span>
            <span className="text-cyan-400">MEGA STUDIO BLUEPRINT EDITION V4</span>
          </div>
        </div>
      </main>
    </div>
  );
}