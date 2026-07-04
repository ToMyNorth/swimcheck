'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface SwimmingBackgroundProps {
  /**
   * 视频URL（可选）。如果提供，将使用视频作为背景
   */
  videoUrl?: string;
  
  /**
   * Poster图片URL（视频加载前显示）
   */
  posterUrl?: string;
  
  /**
   * 备用静态图片URL（当视频不可用时）
   */
  fallbackImageUrl?: string;
  
  /**
   * 遮罩透明度 (0-1)
   */
  overlayOpacity?: number;
  
  /**
   * 是否自动播放视频
   */
  autoPlay?: boolean;
  
  /**
   * 是否循环播放
   */
  loop?: boolean;
  
  /**
   * 是否静音
   */
  muted?: boolean;
}

/**
 * 游泳主题动态背景组件
 * 支持视频、GIF或静态图片作为背景，带半透明遮罩保证文字可读性
 */
export function SwimmingBackground({
  videoUrl,
  posterUrl = '/images/hero-poster.jpg',
  fallbackImageUrl = '/images/examples/freestyle-side.jpg',
  overlayOpacity = 0.65,
  autoPlay = true,
  loop = true,
  muted = true,
}: SwimmingBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 处理视频加载错误，回退到静态图片
  const handleVideoError = () => {
    console.warn('Video failed to load, falling back to static image');
    setHasVideoError(true);
  };

  // 视频加载完成
  const handleVideoLoaded = () => {
    setIsLoaded(true);
  };

  // 确保视频在可见时播放
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoPlay || hasVideoError) return;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.error('Failed to autoplay video:', error);
      }
    };

    playVideo();

    // 清理函数
    return () => {
      if (video && !video.paused) {
        video.pause();
      }
    };
  }, [autoPlay, hasVideoError]);

  // 如果有视频URL且没有错误，显示视频
  if (videoUrl && !hasVideoError) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        {/* 视频层 */}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
          poster={posterUrl}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline
          preload="metadata"
          onError={handleVideoError}
          onLoadedData={handleVideoLoaded}
        />
        
        {/* 渐变遮罩层 - 保证文字可读性 */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-background/90"
          style={{ opacity: overlayOpacity }}
        />
        
        {/* 水波纹效果叠加层（可选） */}
        <div className="absolute inset-0 bg-[url('/patterns/water-ripple.svg')] opacity-10 mix-blend-overlay" />
      </div>
    );
  }

  // 回退到静态图片背景
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 静态图片层 */}
      <Image
        src={fallbackImageUrl}
        alt="Swimming background"
        fill
        className="object-cover"
        loading="lazy"
        sizes="100vw"
      />
      
      {/* 渐变遮罩层 */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-background/90"
        style={{ opacity: overlayOpacity }}
      />
      
      {/* 水波纹效果叠加层 */}
      <div className="absolute inset-0 bg-[url('/patterns/water-ripple.svg')] opacity-10 mix-blend-overlay" />
    </div>
  );
}

/**
 * 简化的背景组件（仅使用CSS动画模拟水波效果）
 * 适合不需要真实视频的场景，性能更好
 */
export function AnimatedWaterBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 基础渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-cyan-700/30 to-teal-600/20" />
      
      {/* 动态水波效果 - 使用CSS动画 */}
      <div className="absolute inset-0 animate-pulse opacity-30">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-cyan-400/20 to-transparent" />
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-blue-500/20 to-transparent" />
      </div>
      
      {/* 浮动气泡效果 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 animate-bounce"
            style={{
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 20 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/50 to-background/80" />
    </div>
  );
}
