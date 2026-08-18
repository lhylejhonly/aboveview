'use client';
import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Maximize,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCw,
  X,
  Layers,
  Palette,
  Eye,
  Sliders,
  SlidersHorizontal,
  Layout,
  ExternalLink,
  ShieldCheck,
  Zap,
  Image as ImageIcon
} from 'lucide-react';

interface WallpaperGeneratorStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBannerToStore?: (url: string) => void;
}

export type AspectRatioType = '9:16' | '16:9' | '4:1' | '3:4' | '1:1' | '1:4';
export type ImageSizeType = '512px' | '1K' | '2K' | '4K';

interface PresetPrompt {
  id: string;
  title: string;
  aspect: AspectRatioType;
  prompt: string;
  previewSeed: number;
}

const PRESET_PROMPTS: PresetPrompt[] = [
  {
    id: '1',
    title: 'Phone Lockscreen: Earth Sandstone',
    aspect: '9:16',
    prompt: 'Minimalist terracotta sandstone texture phone lockscreen wallpaper, organic earth-tone wash, subtle geometric gold accent lines, luxury aesthetic',
    previewSeed: 9161
  },
  {
    id: '2',
    title: 'Web Banner: Cinematic Desert Dunes',
    aspect: '16:9',
    prompt: 'Cinematic wide horizontal web banner, minimalist atmospheric desert sand dunes at sunset, warm espresso and terracotta tones, luxury high-fashion lookbook',
    previewSeed: 1691
  },
  {
    id: '3',
    title: 'Store Header: Panoramic Linen Texture',
    aspect: '4:1',
    prompt: 'Ultra-wide panoramic store header banner, macro French flax linen weave texture in raw oatmeal and sage hues, high contrast architectural lighting',
    previewSeed: 411
  },
  {
    id: '4',
    title: 'Lookbook Poster: Mineral Garment Dye',
    aspect: '3:4',
    prompt: 'High-fashion portrait lookbook cover poster, moody volcanic mineral clay garment dye texture with soft ambient studio lighting, minimalist silhouette',
    previewSeed: 341
  },
  {
    id: '5',
    title: 'Social Graphic: Minimalist Crest',
    aspect: '1:1',
    prompt: 'Square minimalist social media graphic, high-density embossed organic cotton fabric with elegant monochromatic crest pattern',
    previewSeed: 111
  }
];

export const WallpaperGeneratorStudio: React.FC<WallpaperGeneratorStudioProps> = ({
  isOpen,
  onClose,
  onApplyBannerToStore
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [imageSize, setImageSize] = useState<ImageSizeType>('1K');
  const [stylePreset, setStylePreset] = useState<string>('Luxury Earth-Tone');
  const [promptText, setPromptText] = useState<string>(
    'Minimalist terracotta sandstone phone lockscreen wallpaper with warm organic earth tone gradient'
  );
  const [generating, setGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [appliedStore, setAppliedStore] = useState<boolean>(false);

  // Initial generated wallpaper preview URL
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>(
    'https://picsum.photos/seed/apprlwallpaper916/1080/1920'
  );

  if (!isOpen) return null;

  // Handle Image Generation API Call
  const handleGenerateImage = async () => {
    setGenerating(true);
    setAppliedStore(false);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          aspectRatio,
          imageSize,
          stylePreset
        })
      });

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      }
    } catch (err) {
      console.error('Image Generation Error:', err);
      // Fallback preview update
      const seed = Math.floor(Math.random() * 900000) + 100000;
      const dimMap: Record<string, string> = {
        '9:16': '1080/1920',
        '16:9': '1920/1080',
        '4:1': '2000/500',
        '3:4': '1200/1600',
        '1:1': '1200/1200',
        '1:4': '500/2000'
      };
      setGeneratedImageUrl(`https://picsum.photos/seed/wall${seed}/${dimMap[aspectRatio] || '1080/1920'}`);
    } finally {
      setGenerating(false);
    }
  };

  // Select Preset Prompt
  const handleSelectPreset = (preset: PresetPrompt) => {
    setAspectRatio(preset.aspect);
    setPromptText(preset.prompt);
    const dimMap: Record<string, string> = {
      '9:16': '1080/1920',
      '16:9': '1920/1080',
      '4:1': '2000/500',
      '3:4': '1200/1600',
      '1:1': '1200/1200',
      '1:4': '500/2000'
    };
    setGeneratedImageUrl(`https://picsum.photos/seed/preset${preset.previewSeed}/${dimMap[preset.aspect]}`);
  };

  // Copy Image Link
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedImageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Apply as Store Banner
  const handleApplyBanner = () => {
    if (onApplyBannerToStore) {
      onApplyBannerToStore(generatedImageUrl);
      setAppliedStore(true);
      setTimeout(() => setAppliedStore(false), 3000);
    }
  };

  // Get Aspect Ratio Container Style
  const getFrameAspectClass = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-w-[280px]';
      case '16:9':
        return 'aspect-[16/9] w-full max-w-lg';
      case '4:1':
        return 'aspect-[4/1] w-full max-w-xl';
      case '3:4':
        return 'aspect-[3/4] max-w-[320px]';
      case '1:1':
        return 'aspect-square max-w-[320px]';
      case '1:4':
        return 'aspect-[1/4] max-w-[180px]';
      default:
        return 'aspect-[9/16] max-w-[280px]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2D2926]/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#F4F1EE] border border-[#D6CFC7] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">

        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#D6CFC7] bg-[#E5E0DA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2D2926] text-[#F4F1EE] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-[#F4F1EE]" />
            </div>
            <div>
              <h3 className="font-cinzel text-xs font-black uppercase text-[#2D2926] tracking-widest">
                AI Shape Control & Wallpaper Studio
              </h3>
              <p className="font-sans text-[10px] text-[#4A443F] uppercase tracking-wider font-bold">
                Generate Perfect-Fit Phone Lockscreen Wallpapers & Horizontal Web Banners
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#F4F1EE] border border-[#D6CFC7] text-[#2D2926] hover:bg-[#2D2926] hover:text-[#F4F1EE] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Content Grid */}
        <div className="flex flex-col lg:flex-row overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-[#D6CFC7]">

          {/* Left Column: Shape Controls & Prompt Tooling */}
          <div className="w-full lg:w-1/2 p-6 space-y-6 bg-[#F4F1EE] overflow-y-auto">

            {/* Step 1: Aspect Ratio Shape Selector */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D2926] mb-2 flex items-center justify-between">
                <span>1. Select Exact Image Shape & Aspect Ratio:</span>
                <span className="font-mono text-[#5A5A40] text-[9px]">{aspectRatio} Ratio</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAspectRatio('9:16')}
                  className={`p-3 border text-left flex flex-col justify-between transition-all ${
                    aspectRatio === '9:16'
                      ? 'bg-[#2D2926] text-[#F4F1EE] border-[#2D2926] shadow-md'
                      : 'bg-[#E5E0DA] text-[#4A443F] border-[#D6CFC7] hover:border-[#2D2926]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Smartphone className="w-4 h-4" />
                    <span className="text-[9px] font-mono font-bold">9:16</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider leading-tight">
                    Phone Wallpaper
                  </span>
                  <span className="text-[8px] opacity-70 uppercase tracking-widest mt-0.5">
                    1080 × 1920 PX
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('16:9')}
                  className={`p-3 border text-left flex flex-col justify-between transition-all ${
                    aspectRatio === '16:9'
                      ? 'bg-[#2D2926] text-[#F4F1EE] border-[#2D2926] shadow-md'
                      : 'bg-[#E5E0DA] text-[#4A443F] border-[#D6CFC7] hover:border-[#2D2926]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Monitor className="w-4 h-4" />
                    <span className="text-[9px] font-mono font-bold">16:9</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider leading-tight">
                    Web Banner
                  </span>
                  <span className="text-[8px] opacity-70 uppercase tracking-widest mt-0.5">
                    1920 × 1080 PX
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('4:1')}
                  className={`p-3 border text-left flex flex-col justify-between transition-all ${
                    aspectRatio === '4:1'
                      ? 'bg-[#2D2926] text-[#F4F1EE] border-[#2D2926] shadow-md'
                      : 'bg-[#E5E0DA] text-[#4A443F] border-[#D6CFC7] hover:border-[#2D2926]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Layout className="w-4 h-4" />
                    <span className="text-[9px] font-mono font-bold">4:1</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider leading-tight">
                    Store Header
                  </span>
                  <span className="text-[8px] opacity-70 uppercase tracking-widest mt-0.5">
                    2000 × 500 PX
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('3:4')}
                  className={`p-3 border text-left flex flex-col justify-between transition-all ${
                    aspectRatio === '3:4'
                      ? 'bg-[#2D2926] text-[#F4F1EE] border-[#2D2926] shadow-md'
                      : 'bg-[#E5E0DA] text-[#4A443F] border-[#D6CFC7] hover:border-[#2D2926]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-[9px] font-mono font-bold">3:4</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider leading-tight">
                    Lookbook Poster
                  </span>
                  <span className="text-[8px] opacity-70 uppercase tracking-widest mt-0.5">
                    1200 × 1600 PX
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('1:1')}
                  className={`p-3 border text-left flex flex-col justify-between transition-all ${
                    aspectRatio === '1:1'
                      ? 'bg-[#2D2926] text-[#F4F1EE] border-[#2D2926] shadow-md'
                      : 'bg-[#E5E0DA] text-[#4A443F] border-[#D6CFC7] hover:border-[#2D2926]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Maximize className="w-4 h-4" />
                    <span className="text-[9px] font-mono font-bold">1:1</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider leading-tight">
                    Square Post
                  </span>
                  <span className="text-[8px] opacity-70 uppercase tracking-widest mt-0.5">
                    1080 × 1080 PX
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio('1:4')}
                  className={`p-3 border text-left flex flex-col justify-between transition-all ${
                    aspectRatio === '1:4'
                      ? 'bg-[#2D2926] text-[#F4F1EE] border-[#2D2926] shadow-md'
                      : 'bg-[#E5E0DA] text-[#4A443F] border-[#D6CFC7] hover:border-[#2D2926]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Layers className="w-4 h-4" />
                    <span className="text-[9px] font-mono font-bold">1:4</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider leading-tight">
                    Skyscraper
                  </span>
                  <span className="text-[8px] opacity-70 uppercase tracking-widest mt-0.5">
                    500 × 2000 PX
                  </span>
                </button>
              </div>
            </div>

            {/* Step 2: Resolution / Size Selection */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D2926] mb-2">
                2. Output Resolution / Image Size:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['512px', '1K', '2K', '4K'] as ImageSizeType[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setImageSize(size)}
                    className={`py-2 text-[10px] font-mono font-bold uppercase border transition-all ${
                      imageSize === size
                        ? 'bg-[#5A5A40] text-[#F4F1EE] border-[#5A5A40]'
                        : 'bg-[#E5E0DA] text-[#4A443F] border-[#D6CFC7] hover:border-[#2D2926]'
                    }`}
                  >
                    {size} {size === '1K' ? '(HD)' : size === '2K' ? '(QHD)' : size === '4K' ? '(UHD)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Quick Preset Prompt Selector */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D2926] mb-2">
                3. Curated Shape Presets:
              </label>
              <div className="space-y-1.5">
                {PRESET_PROMPTS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="w-full text-left p-2.5 bg-[#E5E0DA] hover:bg-[#2D2926] hover:text-[#F4F1EE] border border-[#D6CFC7] transition-all group flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider block font-sans">
                        {preset.title}
                      </span>
                      <span className="text-[9px] font-mono text-[#8E8B82] group-hover:text-[#E5E0DA] line-clamp-1">
                        {preset.prompt}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-[#F4F1EE] group-hover:bg-[#5A5A40] group-hover:text-[#F4F1EE] text-[#2D2926] border border-[#D6CFC7] shrink-0 ml-2">
                      {preset.aspect}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Custom Prompt Box */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#2D2926] mb-2">
                4. Custom Image Prompt:
              </label>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={3}
                placeholder="Describe your wallpaper or banner design..."
                className="w-full p-3 bg-[#E5E0DA] border border-[#D6CFC7] font-sans text-xs text-[#2D2926] placeholder-[#8E8B82] focus:outline-none focus:border-[#2D2926] transition-all"
              />
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateImage}
              disabled={generating}
              className="w-full py-4 bg-[#2D2926] hover:bg-[#5A5A40] text-[#F4F1EE] font-sans text-xs font-black uppercase tracking-[0.25em] transition-all shadow-lg flex items-center justify-center gap-2 border border-[#2D2926]"
            >
              {generating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-[#F4F1EE]" />
                  <span>CRAFTING PERFECT-FIT IMAGE...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#F4F1EE]" />
                  <span>GENERATE {aspectRatio} PERFECT-FIT IMAGE</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Live Framing & Interactive Device Preview */}
          <div className="w-full lg:w-1/2 p-6 bg-[#E5E0DA] flex flex-col items-center justify-between overflow-y-auto">

            <div className="w-full flex items-center justify-between text-[10px] font-bold text-[#2D2926] uppercase tracking-widest mb-4">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#5A5A40]" />
                Interactive Shape Preview Frame
              </span>
              <span className="font-mono bg-[#F4F1EE] px-2 py-0.5 border border-[#D6CFC7]">
                {aspectRatio} • {imageSize}
              </span>
            </div>

            {/* Device / Container Framing preview */}
            <div className="w-full flex-1 flex items-center justify-center py-4">

              {aspectRatio === '9:16' ? (
                /* Phone Frame Preview for 9:16 Lockscreen */
                <div className="relative w-full max-w-[260px] aspect-[9/16] rounded-[36px] p-2 bg-[#2D2926] shadow-2xl border-4 border-[#4A443F] flex flex-col justify-between overflow-hidden group">
                  {/* Speaker Notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#1F1A17] rounded-full z-20 flex items-center justify-center">
                    <div className="w-3 h-1 bg-[#4A443F] rounded-full" />
                  </div>

                  {/* Lockscreen Time Overlay */}
                  <div className="absolute top-10 left-0 right-0 z-20 text-center text-[#F4F1EE] drop-shadow-md">
                    <p className="text-[10px] font-sans font-bold tracking-widest uppercase opacity-90">
                      Tuesday, August 11
                    </p>
                    <p className="text-3xl font-mono font-light tracking-tight my-0.5">
                      10:42
                    </p>
                    <p className="text-[8px] font-mono tracking-widest uppercase text-[#F4F1EE]/80">
                      ABOVE APPRL LOCKSCREEN
                    </p>
                  </div>

                  {/* Generated Wallpaper Image */}
                  <div className="w-full h-full rounded-[28px] overflow-hidden bg-[#1F1A17] relative">
                    <img
                      src={generatedImageUrl}
                      alt="Generated Phone Wallpaper"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
                  </div>

                  {/* Phone Bottom Home Bar */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/80 rounded-full z-20" />
                </div>

              ) : aspectRatio === '16:9' || aspectRatio === '4:1' ? (
                /* Web Browser Frame Preview for 16:9 and 4:1 Web Banners */
                <div className={`w-full ${getFrameAspectClass()} bg-[#2D2926] shadow-2xl border border-[#4A443F] flex flex-col overflow-hidden`}>
                  {/* Browser Address Bar Header */}
                  <div className="px-3 py-1.5 bg-[#1F1A17] border-b border-[#4A443F] flex items-center justify-between text-[9px] font-mono text-[#F4F1EE]/80">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500/80" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                      <div className="w-2 h-2 rounded-full bg-green-500/80" />
                      <span className="ml-2 font-bold uppercase tracking-wider">above-apprl.com/hero-banner</span>
                    </div>
                    <span className="uppercase text-[8px] bg-[#5A5A40] text-[#F4F1EE] px-1.5 py-0.5 font-sans">
                      Web Banner
                    </span>
                  </div>

                  {/* Banner Image Content */}
                  <div className="relative flex-1 overflow-hidden">
                    <img
                      src={generatedImageUrl}
                      alt="Generated Web Banner"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center p-4 text-center">
                      <div className="bg-[#2D2926]/90 p-3 border border-[#D6CFC7] max-w-sm">
                        <p className="font-cinzel text-xs font-bold text-[#F4F1EE] uppercase tracking-widest">
                          ABOVE APPRL STOREFRONT
                        </p>
                        <p className="font-sans text-[9px] text-[#D6CFC7] uppercase tracking-wider mt-0.5">
                          Perfect-Fit {aspectRatio} Web Banner
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              ) : (
                /* Card / Poster Frame Preview for 3:4, 1:1, 1:4 */
                <div className={`relative w-full ${getFrameAspectClass()} bg-[#2D2926] shadow-2xl border-2 border-[#4A443F] overflow-hidden flex flex-col justify-between group`}>
                  <img
                    src={generatedImageUrl}
                    alt="Generated Shape Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-[#2D2926]/90 text-[#F4F1EE] border border-[#D6CFC7] text-[8px] font-mono font-bold px-2 py-0.5 uppercase tracking-widest">
                    {aspectRatio} FORMAT
                  </div>
                </div>
              )}

            </div>

            {/* Action Bar for Generated Image */}
            <div className="w-full pt-4 border-t border-[#D6CFC7] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={generatedImageUrl}
                  download={`above_apprl_${aspectRatio.replace(':', 'x')}_wallpaper.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-[#2D2926] text-[#F4F1EE] hover:bg-[#5A5A40] transition-all text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-2.5 bg-[#F4F1EE] border border-[#D6CFC7] text-[#2D2926] hover:bg-[#2D2926] hover:text-[#F4F1EE] transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>

              {/* Store Banner Application Button */}
              {onApplyBannerToStore && (aspectRatio === '16:9' || aspectRatio === '4:1') && (
                <button
                  type="button"
                  onClick={handleApplyBanner}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#5A5A40] text-[#F4F1EE] hover:bg-[#2D2926] transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border border-[#5A5A40]"
                >
                  {appliedStore ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>APPLIED TO STORE HERO!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-yellow-300" />
                      <span>APPLY AS STORE BANNER</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

