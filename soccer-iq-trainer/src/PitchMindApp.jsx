import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { Upload, CheckCircle, AlertCircle, Loader2, Clock, Brain, Video, Zap, MousePointer, Target, Sparkles, Award, RotateCcw, Share2, Download, Save, Plus, X, ChevronRight, ChevronLeft, Home, Users, FileVideo, Lightbulb, Clipboard, FileText, BookOpen, BarChart3, TrendingUp, Bell, Settings, Search, Calendar, Edit, Trash2, Eye, PlayCircle, Send, Timer, ArrowUp, ArrowDown, ArrowRight, Play, Pause, StopCircle, User, Hash, Palette, Link2, RefreshCw, Check, Database } from 'lucide-react';
import logo from './assets/logo.png';
import DrillDetailPage from './DrillDetailPage';
import FormationCreator from './Formationcreator';
import DrillsPage from './DrillsPage';
import { drillsData } from './DrillData';

const API_BASE = 'https://pitchmind-backend-production-483d.up.railway.app';

// API Helper
const apiCall = async (endpoint, clerkUserId, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${clerkUserId}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  if (!response.ok) throw new Error(`API call failed: ${response.statusText}`);
  return response.json();
};

const loadFromStorage = (key, userId, defaultValue = []) => {
  if (!userId) return defaultValue;
  try {
    const saved = localStorage.getItem(`pitchmind_${key}_${userId}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key, userId, data) => {
  if (!userId) return;
  localStorage.setItem(`pitchmind_${key}_${userId}`, JSON.stringify(data));
};
// Jersey color options
const JERSEY_COLORS = [
  { name: 'Red', value: '#ef4444', light: '#fecaca' },
  { name: 'Blue', value: '#3b82f6', light: '#bfdbfe' },
  { name: 'Green', value: '#22c55e', light: '#bbf7d0' },
  { name: 'Yellow', value: '#eab308', light: '#fef08a' },
  { name: 'Orange', value: '#f97316', light: '#fed7aa' },
  { name: 'Purple', value: '#a855f7', light: '#e9d5ff' },
  { name: 'Pink', value: '#ec4899', light: '#fbcfe8' },
  { name: 'White', value: '#ffffff', light: '#f5f5f5' },
  { name: 'Black', value: '#1f2937', light: '#9ca3af' },
  { name: 'Navy', value: '#1e3a5f', light: '#93c5fd' },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

const timestampToSeconds = (timestamp) => {
  if (typeof timestamp === 'number') return timestamp;
  const str = String(timestamp);
  if (!str.includes(':')) return parseFloat(str) || 0;
  const parts = str.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};

const formatTime = (seconds) => {
  const secs = Math.floor(seconds);
  const hrs = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const remainingSecs = secs % 60;
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
};

// ============================================
// PDF REPORT GENERATOR (Individual Player)
// ============================================

const generatePlayerPDFReport = async (player, analyses, userName) => {
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;
  
  const checkPageBreak = (h) => {
    if (yPos + h > pageHeight - margin) { doc.addPage(); yPos = margin; return true; }
    return false;
  };

  // Header with player info
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Jersey circle with number
  const jerseyColor = player.jerseyColor || '#10b981';
  const r = parseInt(jerseyColor.slice(1,3), 16);
  const g = parseInt(jerseyColor.slice(3,5), 16);
  const b = parseInt(jerseyColor.slice(5,7), 16);
  doc.setFillColor(r, g, b);
  doc.circle(margin + 15, 25, 12, 'F');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  if (player.jerseyNumber) {
    doc.text(String(player.jerseyNumber), margin + 15 - (player.jerseyNumber > 9 ? 5 : 3), 29);
  }
  
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(player.name, margin + 35, 22);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${player.position} • Age ${player.age}`, margin + 35, 35);
  
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin - 50, 22);
  doc.text('Player Development Report', pageWidth - margin - 50, 35);
  
  yPos = 65;
  
  // Current Stats Box
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, yPos, pageWidth - 2*margin, 40, 3, 3, 'F');
  
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(String(player.rating || 70), margin + 20, yPos + 25);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Decision IQ', margin + 15, yPos + 35);
  
  const totalAnalyses = analyses?.length || 0;
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246);
  doc.text(String(totalAnalyses), margin + 70, yPos + 25);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Sessions', margin + 65, yPos + 35);
  
  const totalDecisions = analyses?.reduce((acc, a) => acc + (a.decisionCount || 0), 0) || 0;
  doc.setFontSize(24);
  doc.setTextColor(245, 158, 11);
  doc.text(String(totalDecisions), margin + 120, yPos + 25);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Decisions', margin + 115, yPos + 35);
  
  // Trend indicator
  if (analyses && analyses.length >= 2) {
    const recent = analyses.slice(-3);
    const avgRecent = recent.reduce((a, b) => a + (b.avgRating || 0), 0) / recent.length;
    const older = analyses.slice(0, -3);
    const avgOlder = older.length > 0 ? older.reduce((a, b) => a + (b.avgRating || 0), 0) / older.length : avgRecent;
    const trend = avgRecent > avgOlder ? '↑ Improving' : avgRecent < avgOlder ? '↓ Needs Focus' : '→ Stable';
    const trendColor = avgRecent > avgOlder ? [16, 185, 129] : avgRecent < avgOlder ? [239, 68, 68] : [100, 100, 100];
    doc.setFontSize(12);
    doc.setTextColor(...trendColor);
    doc.text(trend, pageWidth - margin - 40, yPos + 25);
  }
  
  yPos += 55;
  
  // Session History
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Analysis History', margin, yPos);
  yPos += 8;
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(2);
  doc.line(margin, yPos, margin + 40, yPos);
  yPos += 15;
  
  if (!analyses || analyses.length === 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('No video analyses yet. Upload match footage to track this player.', margin, yPos);
    yPos += 20;
  } else {
    analyses.slice(-10).reverse().forEach((analysis, i) => {
      checkPageBreak(35);
      
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(margin, yPos, pageWidth - 2*margin, 28, 2, 2, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(analysis.videoName || `Session ${analyses.length - i}`, margin + 10, yPos + 12);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(analysis.date || 'Unknown date', margin + 10, yPos + 22);
      
      // Decision count
      doc.setFontSize(10);
      doc.setTextColor(59, 130, 246);
      doc.text(`${analysis.decisionCount || 0} decisions`, pageWidth - margin - 80, yPos + 12);
      
      // Rating
      if (analysis.avgRating) {
        doc.setTextColor(245, 158, 11);
        doc.text(`${analysis.avgRating.toFixed(1)}/5 avg`, pageWidth - margin - 80, yPos + 22);
      }
      
      yPos += 33;
    });
  }
  
  // Recommendations
  checkPageBreak(50);
  yPos += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Development Recommendations', margin, yPos);
  yPos += 8;
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(2);
  doc.line(margin, yPos, margin + 60, yPos);
  yPos += 15;
  
  const recommendations = [];
  if (player.rating < 60) {
    recommendations.push('Focus on fundamental decision-making drills');
    recommendations.push('Review video clips with coach to understand better options');
  } else if (player.rating < 75) {
    recommendations.push('Work on quick decision-making under pressure');
    recommendations.push('Practice scanning before receiving the ball');
  } else {
    recommendations.push('Maintain high decision quality in competitive matches');
    recommendations.push('Help mentor younger players on decision-making');
  }
  recommendations.push(`Continue tracking progress across ${player.position.toLowerCase()} scenarios`);
  
  recommendations.forEach(rec => {
    checkPageBreak(12);
    doc.setFillColor(16, 185, 129);
    doc.circle(margin + 5, yPos - 1, 3, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(rec, margin + 15, yPos);
    yPos += 12;
  });
  
  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`PitchMind Player Report • ${player.name} • ${new Date().toLocaleString()}`, margin, pageHeight - 10);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 25, pageHeight - 10);
  }
  
  const fileName = `PitchMind_${player.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  return fileName;
};

// Session PDF Report (unchanged from before)
const generatePDFReport = async (analysisResults, videoFileName, players, userName, trackedPlayer) => {
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;
  
  const checkPageBreak = (h) => {
    if (yPos + h > pageHeight - margin) { doc.addPage(); yPos = margin; return true; }
    return false;
  };

  // Header
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // If tracking a specific player, show jersey
  if (trackedPlayer) {
    const jerseyColor = trackedPlayer.jerseyColor || '#ffffff';
    const r = parseInt(jerseyColor.slice(1,3), 16) || 255;
    const g = parseInt(jerseyColor.slice(3,5), 16) || 255;
    const b = parseInt(jerseyColor.slice(5,7), 16) || 255;
    doc.setFillColor(r, g, b);
    doc.circle(margin + 12, 25, 10, 'F');
    if (trackedPlayer.jerseyNumber) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(jerseyColor === '#ffffff' ? 0 : 255, jerseyColor === '#ffffff' ? 0 : 255, jerseyColor === '#ffffff' ? 0 : 255);
      doc.text(String(trackedPlayer.jerseyNumber), margin + 12 - (trackedPlayer.jerseyNumber > 9 ? 4 : 2), 28);
    }
  }
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('PitchMind', trackedPlayer ? margin + 30 : margin, 20);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  if (trackedPlayer) {
    doc.text(`Analysis: ${trackedPlayer.name} (#${trackedPlayer.jerseyNumber || '?'})`, margin + 30, 32);
  } else {
    doc.text('AI Video Analysis Report', margin, 32);
  }
  
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin - 60, 20);
  if (userName) doc.text(`Coach: ${userName}`, pageWidth - margin - 60, 32);
  
  yPos = 65;
  
  // Video info box
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin, yPos, pageWidth - 2*margin, 35, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('VIDEO ANALYZED', margin + 10, yPos + 12);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(videoFileName || 'Match Footage', margin + 10, yPos + 25);
  
  const decisionCount = analysisResults?.decision_points?.length || 0;
  doc.setFontSize(24);
  doc.setTextColor(16, 185, 129);
  doc.text(String(decisionCount), pageWidth - margin - 45, yPos + 22);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Decision Points', pageWidth - margin - 50, yPos + 32);
  
  yPos += 50;
  
  // Rest of report...
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Decision Points Analysis', margin, yPos);
  yPos += 8;
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(2);
  doc.line(margin, yPos, margin + 50, yPos);
  yPos += 15;
  
  const points = analysisResults?.decision_points || [];
  
  points.forEach((point, i) => {
    checkPageBreak(70);
    
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, yPos, pageWidth - 2*margin, 55, 3, 3, 'F');
    
    const type = (point.type || point.scenario_type || '').toLowerCase();
    let color = [16, 185, 129];
    if (type.includes('goal') || type.includes('chance')) color = [245, 158, 11];
    else if (type.includes('defensive') || type.includes('mistake')) color = [239, 68, 68];
    else if (type.includes('pass')) color = [59, 130, 246];
    
    doc.setFillColor(...color);
    doc.rect(margin, yPos, 4, 55, 'F');
    
    doc.circle(margin + 18, yPos + 15, 10, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), margin + 14 + (i < 9 ? 1 : 0), yPos + 19);
    
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    const title = point.type || point.scenario_type || `Decision Point ${i + 1}`;
    doc.text(title.charAt(0).toUpperCase() + title.slice(1), margin + 35, yPos + 15);
    
    const ts = point.timestamp || point.time;
    if (ts !== undefined) {
      const timeStr = typeof ts === 'number' ? formatTime(ts) : String(ts);
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(pageWidth - margin - 40, yPos + 6, 35, 14, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(timeStr, pageWidth - margin - 36, yPos + 16);
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const desc = point.description || point.analysis || 'Decision analyzed';
    const descLines = doc.splitTextToSize(desc, pageWidth - 2*margin - 50);
    doc.text(descLines.slice(0, 2).join(' '), margin + 35, yPos + 30);
    
    if (point.rating !== undefined) {
      doc.setTextColor(245, 158, 11);
      doc.text('Rating: ' + '★'.repeat(point.rating) + '☆'.repeat(5 - point.rating), margin + 35, yPos + 50);
    }
    
    yPos += 60;
    
    if (point.recommendation) {
      checkPageBreak(28);
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(margin + 5, yPos, pageWidth - 2*margin - 5, 25, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text('RECOMMENDATION', margin + 10, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      const recLines = doc.splitTextToSize(point.recommendation, pageWidth - 2*margin - 25);
      doc.text(recLines.slice(0, 2).join(' '), margin + 10, yPos + 20);
      yPos += 30;
    }
    yPos += 5;
  });
  
  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated by PitchMind AI • ${new Date().toLocaleString()}`, margin, pageHeight - 10);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 25, pageHeight - 10);
  }
  
  const fileName = `PitchMind_${trackedPlayer ? trackedPlayer.name.replace(/\s+/g, '_') + '_' : ''}Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  return fileName;
};

// ============================================
// COMPONENTS
// ============================================

const Logo = ({ size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };
  return <img src={logo} alt="PitchMind" className={`${sizes[size]} object-contain`} />;
};

// Jersey Badge Component
const JerseyBadge = ({ number, color, size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
  const isLight = color === '#ffffff' || color === '#fef08a' || color === '#fed7aa';
  return (
    <div 
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold border-2 border-white/20`}
      style={{ backgroundColor: color || '#10b981', color: isLight ? '#1f2937' : '#ffffff' }}
    >
      {number || '?'}
    </div>
  );
};

const Sidebar = ({ currentPage, setCurrentPage, sidebarCollapsed, setSidebarCollapsed, playerCount, setUploadState }) => {
  const SidebarItem = ({ icon: Icon, label, active, onClick, count, badge }) => (
    <button onClick={onClick} title={sidebarCollapsed ? label : ''} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-medium group ${active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
      <div className="flex items-center space-x-3"><Icon className={`w-5 h-5 ${active ? 'text-emerald-400' : 'group-hover:text-emerald-400'} transition-colors`} />{!sidebarCollapsed && <span>{label}</span>}</div>
      {!sidebarCollapsed && count > 0 && <span className="bg-white/10 text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>}
      {!sidebarCollapsed && badge && <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">{badge}</span>}
    </button>
  );
  return (
    <div className={`fixed left-0 top-0 h-screen bg-[#0d1210] border-r border-white/10 flex flex-col z-50 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="h-16 border-b border-white/10 flex items-center px-4 justify-between">
        <div className="flex items-center space-x-3"><Logo size="md" />{!sidebarCollapsed && <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">PitchMind</span>}</div>
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">{sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}</button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <SidebarItem icon={Home} label="Dashboard" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
        <SidebarItem icon={Users} label="Player Profiles" active={currentPage === 'players' || currentPage === 'playerDetail'} onClick={() => setCurrentPage('players')} count={playerCount} />
        <SidebarItem icon={FileVideo} label="Video Library" active={currentPage === 'videos'} onClick={() => setCurrentPage('videos')} />
        <SidebarItem icon={Lightbulb} label="AI Coach" active={currentPage === 'assistant'} onClick={() => setCurrentPage('assistant')} badge="New" />
        <SidebarItem icon={Clipboard} label="Session Planner" active={currentPage === 'planner'} onClick={() => setCurrentPage('planner')} />
        <SidebarItem icon={FileText} label="Auto Reports" active={currentPage === 'reports'} onClick={() => setCurrentPage('reports')} />
        <SidebarItem icon={BookOpen} label="Drill Library" active={currentPage === 'drills' || currentPage === 'drillDetail'} onClick={() => setCurrentPage('drills')} />
        {!sidebarCollapsed && <div className="pt-4 pb-2"><div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Analytics</div></div>}
        <SidebarItem icon={Target} label="Formations" active={currentPage === 'formations'} onClick={() => setCurrentPage('formations')} />
        <SidebarItem icon={BarChart3} label="Team Stats" active={currentPage === 'stats'} onClick={() => setCurrentPage('stats')} />
        <SidebarItem icon={TrendingUp} label="Progress" active={currentPage === 'progress'} onClick={() => setCurrentPage('progress')} />
        <SidebarItem icon={Target} label="Benchmarks" active={currentPage === 'benchmarks'} onClick={() => setCurrentPage('benchmarks')} />
      </nav>
      <div className="p-3 border-t border-white/10">
        <button onClick={() => { setCurrentPage('upload'); setUploadState('idle'); }} className={`w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
          <Upload className="w-5 h-5" />{!sidebarCollapsed && <span>Upload Video</span>}
        </button>
      </div>
    </div>
  );
};

const TopBar = ({ title, showSearch = false, searchQuery, setSearchQuery, sidebarCollapsed, currentPage, setCurrentPage }) => (
  <div className={`fixed top-0 right-0 h-16 bg-[#0a0f0d]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-40 transition-all duration-300 ${sidebarCollapsed ? 'left-20' : 'left-64'}`}>
    <div className="flex items-center space-x-4">
      {currentPage !== 'dashboard' && <button onClick={() => setCurrentPage(currentPage === 'drillDetail' ? 'drills' : currentPage === 'playerDetail' ? 'players' : 'dashboard')} className="text-gray-400 hover:text-white font-medium flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"><ChevronLeft className="w-4 h-4" /><span>Back</span></button>}
      <h1 className="text-xl font-bold text-white">{title}</h1>
    </div>
    <div className="flex items-center space-x-3">
      {showSearch && <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-all" /></div>}
      <button className="relative p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Bell className="w-5 h-5" /><span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span></button>
      <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Settings className="w-5 h-5" /></button>
      <div className="pl-2 border-l border-white/10"><UserButton afterSignOutUrl="/" /></div>
    </div>
  </div>
);

const PageWrapper = ({ children, title, showSearch, searchQuery, setSearchQuery, sidebarCollapsed, currentPage, setCurrentPage }) => (
  <div className={`pt-16 min-h-screen bg-[#0a0f0d] transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
    <TopBar title={title} showSearch={showSearch} searchQuery={searchQuery} setSearchQuery={setSearchQuery} sidebarCollapsed={sidebarCollapsed} currentPage={currentPage} setCurrentPage={setCurrentPage} />
    <div className="fixed inset-0 pointer-events-none overflow-hidden"><div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" /><div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px]" /></div>
    <div className="relative p-8">{children}</div>
  </div>
);

const Modal = ({ title, children, onClose, wide }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <div className={`relative ${wide ? 'max-w-2xl' : 'max-w-lg'} w-full bg-[#0d1210] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col`}>
      <div className="flex items-center justify-between p-6 border-b border-white/10"><h2 className="text-xl font-bold text-white">{title}</h2><button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"><X className="w-5 h-5" /></button></div>
      <div className="p-6 overflow-y-auto flex-1">{children}</div>
    </div>
  </div>
);

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
    <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6"><Icon className="w-10 h-10 text-gray-500" /></div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-400 max-w-md mb-6">{description}</p>
    {actionLabel && <button onClick={onAction} className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all"><span>{actionLabel}</span></button>}
  </div>
);

// Decision Point Card
const DecisionPointCard = ({ point, index, onPlayClip, isPlaying, isActive }) => {
  const timestamp = point.timestamp || point.time;
  const seconds = timestamp !== undefined ? timestampToSeconds(timestamp) : null;
  
  const getTypeStyles = () => {
    const type = (point.type || point.scenario_type || '').toLowerCase();
    if (type.includes('goal') || type.includes('chance') || type.includes('opportunity')) return { bg: 'bg-amber-500/20', border: 'border-amber-500/40', icon: '⚽', color: 'text-amber-400' };
    if (type.includes('defensive') || type.includes('mistake') || type.includes('error')) return { bg: 'bg-red-500/20', border: 'border-red-500/40', icon: '🛡️', color: 'text-red-400' };
    if (type.includes('pass') || type.includes('assist')) return { bg: 'bg-blue-500/20', border: 'border-blue-500/40', icon: '🎯', color: 'text-blue-400' };
    if (type.includes('press') || type.includes('tactical')) return { bg: 'bg-purple-500/20', border: 'border-purple-500/40', icon: '📋', color: 'text-purple-400' };
    return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', icon: '💡', color: 'text-emerald-400' };
  };

  const styles = getTypeStyles();
  const title = point.type || point.scenario_type || `Decision Point ${index + 1}`;

  return (
    <div className={`rounded-xl border-2 transition-all overflow-hidden ${isActive ? `${styles.bg} ${styles.border} ring-2 ring-emerald-500/50 shadow-lg` : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
      <div className={`flex items-center justify-between p-4 ${isActive ? styles.bg : 'bg-white/5'}`}>
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{styles.icon}</span>
          <div>
            <h4 className={`font-bold ${isActive ? styles.color : 'text-white'}`}>{title.charAt(0).toUpperCase() + title.slice(1)}</h4>
            {point.player_action && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{point.player_action}</p>}
          </div>
        </div>
        {seconds !== null && (
          <button onClick={() => onPlayClip(seconds, index)} className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all ${isPlaying && isActive ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}>
            {isPlaying && isActive ? (<><Pause className="w-4 h-4" /><span>Playing...</span></>) : (<><Play className="w-4 h-4" /><span>{formatTime(seconds)}</span></>)}
          </button>
        )}
      </div>
      <div className="p-4 space-y-3">
        {(point.description || point.analysis) && <p className="text-gray-300 text-sm leading-relaxed">{point.description || point.analysis}</p>}
        {point.recommendation && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">💡 Better Option</p>
            <p className="text-emerald-300 text-sm">{point.recommendation}</p>
          </div>
        )}
        {point.rating !== undefined && (
          <div className="flex items-center space-x-2 pt-2">
            <span className="text-xs text-gray-500">Rating:</span>
            <div className="flex">{[1,2,3,4,5].map(star => <span key={star} className={`text-lg ${star <= point.rating ? 'text-amber-400' : 'text-gray-600'}`}>★</span>)}</div>
          </div>
        )}
      </div>
      {isPlaying && isActive && <div className="h-1 bg-emerald-500/30"><div className="h-full bg-emerald-500 animate-pulse w-full" /></div>}
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================

export default function PitchMindApp() {
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadState, setUploadState] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  
  // Player tracking for video analysis
  const [trackedPlayer, setTrackedPlayer] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  
  // Clip playback
  const [isPlayingClip, setIsPlayingClip] = useState(false);
  const [activeClipIndex, setActiveClipIndex] = useState(null);
  const clipTimeoutRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState('');

  const [savedFormations, setSavedFormations] = useState(() => {
  if (user?.id) {
    const saved = localStorage.getItem('pitchmind_formations_' + user.id);
    return saved ? JSON.parse(saved) : [];
  }
  return [];
});

  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [videos, setVideos] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [reports, setReports] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all');
  const [userProfile, setUserProfile] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataSynced, setDataSynced] = useState(false);
  const [localDataLoaded, setLocalDataLoaded] = useState(false);
  
  const [showModal, setShowModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [selectedDrillId, setSelectedDrillId] = useState(null);
  
  // TeamSnap integration state
  const [teamsnapToken, setTeamsnapToken] = useState(() => localStorage.getItem('teamsnap_token'));
  const [teamsnapTeams, setTeamsnapTeams] = useState([]);
  const [teamsnapLoading, setTeamsnapLoading] = useState(false);
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync data from database on mount
  // Load data when user is available
useEffect(() => {
  if (user?.id) {
    // Load from user-specific localStorage first (fast)
    setPlayers(loadFromStorage('players', user.id, []));
    setTeams(loadFromStorage('teams', user.id, []));
    setVideos(loadFromStorage('videos', user.id, []));
    setSessions(loadFromStorage('sessions', user.id, []));
    setReports(loadFromStorage('reports', user.id, []));
    setChatHistory(loadFromStorage('chat_history', user.id, []));
    
    // Then sync from database (authoritative)
    if (!dataSynced) {
      syncDataFromDB(false);
    }
  }
}, [user?.id, dataSynced]);

  const syncDataFromDB = async (forceRefresh = false) => {
    if (!user?.id) return;
    if (!forceRefresh && dataSynced) return; // Skip if already synced unless forced
    
    setDataLoading(true);
    try {
      const data = await apiCall('/api/sync', user.id);
      setUserProfile(data.user);
      
      // Only update if we got data back (don't overwrite with empty)
      if (data.teams && data.teams.length > 0) {
        setTeams(data.teams.map(t => ({
          ...t,
          divisionName: t.division_name,
          seasonName: t.season_name,
          jerseyColor: t.jersey_color,
          teamsnapId: t.teamsnap_id
        })));
      }
      
      if (data.players && data.players.length > 0) {
        setPlayers(data.players.map(p => ({
          ...p,
          teamId: p.team_id,
          teamName: p.team_name,
          jerseyNumber: p.jersey_number,
          jerseyColor: p.jersey_color,
          teamsnapId: p.teamsnap_id,
          importedFrom: p.imported_from,
          analyses: []
        })));
      }
      
      if (data.sessions && data.sessions.length > 0) {
        setSessions(data.sessions.map(s => ({
          ...s,
          drills: typeof s.drills === 'string' ? JSON.parse(s.drills) : s.drills
        })));
      }
      
      if (data.chatHistory && data.chatHistory.length > 0) {
        setChatHistory(data.chatHistory);
      }
      
      setDataSynced(true);
      console.log('✅ Data synced from database:', data.teams?.length || 0, 'teams,', data.players?.length || 0, 'players');
    } catch (err) {
      console.warn('Database sync failed, using local data:', err.message);
      // Keep existing localStorage data - don't overwrite
      setDataSynced(true); // Mark as synced so we don't keep retrying
    }
    setDataLoading(false);
  };

  // Save to localStorage as backup
  useEffect(() => { if (user?.id) saveToStorage('players', user.id, players); }, [players, user?.id]);
  useEffect(() => { if (user?.id) saveToStorage('teams', user.id, teams); }, [teams, user?.id]);
  useEffect(() => { if (user?.id) saveToStorage('videos', user.id, videos); }, [videos, user?.id]);
  useEffect(() => { if (user?.id) saveToStorage('sessions', user.id, sessions); }, [sessions, user?.id]);
  useEffect(() => { if (user?.id) saveToStorage('reports', user.id, reports); }, [reports, user?.id]);
  useEffect(() => { if (user?.id) saveToStorage('chat_history', user.id, chatHistory); }, [chatHistory, user?.id]);
  

  // TeamSnap OAuth callback handler
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('teamsnap_token');
    const error = params.get('teamsnap_error');
    
    if (token) {
      setTeamsnapToken(token);
      localStorage.setItem('teamsnap_token', token);
      window.history.replaceState({}, '', window.location.pathname);
      setShowModal('teamsnapImport');
    }
    
    if (error) {
      console.error('TeamSnap error:', error);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // TeamSnap functions
  const connectTeamSnap = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/teamsnap/auth`);
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        alert('TeamSnap integration not configured. Add credentials to backend.');
      }
    } catch (err) {
      console.error('TeamSnap auth error:', err);
    }
  };

  const fetchTeamsnapTeams = async () => {
    if (!teamsnapToken) return;
    setTeamsnapLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/teamsnap/teams`, {
        headers: { 'Authorization': `Bearer ${teamsnapToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTeamsnapTeams(data.teams || []);
      } else if (response.status === 401) {
        localStorage.removeItem('teamsnap_token');
        setTeamsnapToken(null);
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    }
    setTeamsnapLoading(false);
  };

  const fetchTeamsnapRoster = async (teamId) => {
    if (!teamsnapToken) return [];
    try {
      const response = await fetch(`${API_BASE}/api/teamsnap/roster/${teamId}`, {
        headers: { 'Authorization': `Bearer ${teamsnapToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        return data.players || [];
      }
    } catch (err) {
      console.error('Failed to fetch roster:', err);
    }
    return [];
  };

  const importTeamsnapPlayers = async (teamsnapPlayers, selectedIds, teamInfo) => {
    const toImport = teamsnapPlayers.filter(p => selectedIds.includes(p.id));
    
    // Check if team already exists locally
    const existingTeam = teams.find(t => 
      String(t.teamsnapId) === String(teamInfo?.id) || 
      String(t.teamsnap_id) === String(teamInfo?.id) ||
      String(t.id) === String(teamInfo?.id)
    );
    
    // Create local team first
    const localTeam = existingTeam || {
      id: teamInfo?.id || Date.now(),
      name: teamInfo?.name || 'Imported Team',
      divisionName: teamInfo?.divisionName,
      seasonName: teamInfo?.seasonName,
      teamsnapId: String(teamInfo?.id),
      source: 'teamsnap'
    };
    
    // Add team to state if new
    if (!existingTeam && teamInfo) {
      setTeams(prev => [...prev, localTeam]);
    }
    
    // Create local players
    const existingTeamsnapIds = players.filter(p => p.teamsnapId).map(p => String(p.teamsnapId));
    const newPlayers = toImport
      .filter(p => !existingTeamsnapIds.includes(String(p.id)))
      .map(p => ({
        id: Date.now() + Math.random(),
        name: p.name,
        position: mapTeamsnapPosition(p.position),
        age: p.birthday ? calculateTeamsnapAge(p.birthday) : 0,
        jerseyNumber: p.jerseyNumber,
        jerseyColor: '#10b981',
        rating: 70,
        trend: 'same',
        teamsnapId: String(p.id),
        importedFrom: 'teamsnap',
        teamId: localTeam.id,
        teamName: localTeam.name,
        analyses: []
      }));
    
    // Add players to state immediately
    if (newPlayers.length > 0) {
      setPlayers(prev => [...prev, ...newPlayers]);
    }
    
    console.log(`✅ Imported ${newPlayers.length} players locally`);
    
    // Try to save to database in background
    if (user?.id && teamInfo) {
      try {
        // Create team in DB if not exists
        let dbTeam = null;
        if (!existingTeam) {
          dbTeam = await apiCall('/api/teams', user.id, {
            method: 'POST',
            body: JSON.stringify({
              name: teamInfo.name,
              divisionName: teamInfo.divisionName,
              seasonName: teamInfo.seasonName,
              teamsnapId: String(teamInfo.id),
              source: 'teamsnap'
            })
          });
          console.log('Team saved to DB:', dbTeam);
        }
        
        // Create players in DB
        const dbTeamId = dbTeam?.id || existingTeam?.id;
        if (dbTeamId && newPlayers.length > 0) {
          await apiCall('/api/players/bulk', user.id, {
            method: 'POST',
            body: JSON.stringify({ 
              players: newPlayers.map(p => ({
                name: p.name,
                position: p.position,
                age: p.age,
                jerseyNumber: p.jerseyNumber,
                jerseyColor: p.jerseyColor,
                teamsnapId: p.teamsnapId,
                importedFrom: 'teamsnap',
                teamId: dbTeamId
              })), 
              teamId: dbTeamId 
            })
          });
          console.log('Players saved to DB');
        }
      } catch (err) {
        console.warn('Could not save to database, data saved locally:', err.message);
      }
    }
    
    return newPlayers.length;
  };

  const mapTeamsnapPosition = (pos) => {
    if (!pos) return 'Midfielder';
    const p = pos.toLowerCase();
    if (p.includes('goal') || p.includes('keeper')) return 'Goalkeeper';
    if (p.includes('def') || p.includes('back')) return 'Defender';
    if (p.includes('forward') || p.includes('striker') || p.includes('wing')) return 'Forward';
    return 'Midfielder';
  };

  const calculateTeamsnapAge = (birthday) => {
    if (!birthday) return 0;
    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age > 0 ? age : 0;
  };

  const disconnectTeamSnap = () => {
    localStorage.removeItem('teamsnap_token');
    setTeamsnapToken(null);
    setTeamsnapTeams([]);
  };

  useEffect(() => { return () => { if (clipTimeoutRef.current) clearTimeout(clipTimeoutRef.current); }; }, []);

  const playClip = useCallback((startSeconds, index) => {
    if (!videoRef.current) return;
    if (clipTimeoutRef.current) clearTimeout(clipTimeoutRef.current);
    videoRef.current.currentTime = startSeconds;
    videoRef.current.play();
    setIsPlayingClip(true);
    setActiveClipIndex(index);
    clipTimeoutRef.current = setTimeout(() => { videoRef.current.pause(); setIsPlayingClip(false); setActiveClipIndex(null); }, 10000);
  }, []);

  const stopClip = useCallback(() => {
    if (videoRef.current) videoRef.current.pause();
    if (clipTimeoutRef.current) clearTimeout(clipTimeoutRef.current);
    setIsPlayingClip(false);
    setActiveClipIndex(null);
  }, []);

  // Save analysis to player profile
  const saveAnalysisToPlayer = (playerId, results, videoName) => {
    const analysis = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      videoName: videoName,
      decisionCount: results.decision_points?.length || 0,
      avgRating: results.decision_points?.length > 0 
        ? results.decision_points.reduce((acc, p) => acc + (p.rating || 3), 0) / results.decision_points.length 
        : null,
      summary: results.summary,
    };
    
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        const analyses = [...(p.analyses || []), analysis];
        // Update rating based on recent analyses
        const recentAnalyses = analyses.slice(-5);
        const avgRatings = recentAnalyses.filter(a => a.avgRating).map(a => a.avgRating);
        const newRating = avgRatings.length > 0 
          ? Math.round((avgRatings.reduce((a,b) => a+b, 0) / avgRatings.length) * 20)
          : p.rating;
        return { ...p, analyses, rating: Math.max(40, Math.min(100, newRating)) };
      }
      return p;
    }));
  };

  const handleExportReport = async () => {
    try {
      await generatePDFReport(analysisResults, videoFile?.name, players, user?.firstName, trackedPlayer);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to generate PDF. Run: npm install jspdf');
    }
  };

  const handleExportPlayerReport = async (player) => {
    try {
      await generatePlayerPDFReport(player, player.analyses, user?.firstName);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to generate PDF. Run: npm install jspdf');
    }
  };

  // ============================================
  // MODALS
  // ============================================

  const AddPlayerModal = () => {
    const [form, setForm] = useState(editingItem || { name: '', position: 'Midfielder', age: '', jerseyNumber: '', jerseyColor: '#10b981' });
    const [saving, setSaving] = useState(false);
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!form.name || !form.age) return;
      setSaving(true);
      
      const playerData = {
        id: editingItem?.id || Date.now(),
        name: form.name,
        position: form.position,
        age: parseInt(form.age),
        jerseyNumber: form.jerseyNumber ? parseInt(form.jerseyNumber) : null,
        jerseyColor: form.jerseyColor || '#10b981',
        rating: editingItem?.rating || 70,
        trend: editingItem?.trend || 'same',
        analyses: editingItem?.analyses || []
      };
      
      // Update local state immediately
      if (editingItem) {
        setPlayers(players.map(p => p.id === editingItem.id ? { ...p, ...playerData } : p));
      } else {
        setPlayers(prev => [...prev, playerData]);
      }
      
      // Try to save to database in background
      if (user?.id) {
        try {
          if (editingItem) {
            await apiCall(`/api/players/${editingItem.id}`, user.id, {
              method: 'PUT',
              body: JSON.stringify(playerData)
            });
          } else {
            const dbPlayer = await apiCall('/api/players', user.id, {
              method: 'POST',
              body: JSON.stringify(playerData)
            });
            // Update with DB id if we got one
            if (dbPlayer?.id) {
              setPlayers(prev => prev.map(p => p.id === playerData.id ? { ...p, id: dbPlayer.id } : p));
            }
          }
          console.log('✅ Player saved to database');
        } catch (err) {
          console.warn('Could not save to database, saved locally:', err.message);
        }
      }
      
      setSaving(false);
      setShowModal(null);
      setEditingItem(null);
    };
    return (
      <Modal title={editingItem ? 'Edit Player' : 'Add New Player'} onClose={() => { setShowModal(null); setEditingItem(null); }} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingItem && (
            <div className="mb-4">
              {teamsnapToken ? (
                <button type="button" onClick={() => setShowModal('teamsnapImport')} className="w-full flex items-center justify-center space-x-3 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/20 transition-all">
                  <Link2 className="w-5 h-5" /><span className="font-semibold">Import from TeamSnap</span>
                </button>
              ) : (
                <button type="button" onClick={connectTeamSnap} className="w-full flex items-center justify-center space-x-3 p-4 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all">
                  <Link2 className="w-5 h-5" /><span>Connect TeamSnap to import roster</span>
                </button>
              )}
              <div className="flex items-center my-4"><div className="flex-1 border-t border-white/10"></div><span className="px-4 text-gray-500 text-sm">or add manually</span><div className="flex-1 border-t border-white/10"></div></div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Full Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Enter player name" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Position *</label>
              <select value={form.position} onChange={(e) => setForm({...form, position: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50">
                <option value="Goalkeeper">Goalkeeper</option><option value="Defender">Defender</option><option value="Midfielder">Midfielder</option><option value="Forward">Forward</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Age *</label>
              <input type="number" value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} placeholder="Age" min="5" max="50" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Jersey Number</label>
              <input type="number" value={form.jerseyNumber} onChange={(e) => setForm({...form, jerseyNumber: e.target.value})} placeholder="#" min="1" max="99" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Jersey Color</label>
              <div className="flex flex-wrap gap-2">
                {JERSEY_COLORS.map(c => (
                  <button key={c.value} type="button" onClick={() => setForm({...form, jerseyColor: c.value})} 
                    className={`w-8 h-8 rounded-full border-2 transition-all ${form.jerseyColor === c.value ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c.value }} title={c.name} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Preview */}
          <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
            <JerseyBadge number={form.jerseyNumber || '?'} color={form.jerseyColor} size="lg" />
            <div>
              <p className="font-bold text-white">{form.name || 'Player Name'}</p>
              <p className="text-gray-400 text-sm">{form.position} • #{form.jerseyNumber || '?'}</p>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={() => { setShowModal(null); setEditingItem(null); }} className="flex-1 py-3 border border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/5 transition-all">Cancel</button>
            <button type="submit" className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all flex items-center justify-center space-x-2"><Save className="w-4 h-4" /><span>{editingItem ? 'Save' : 'Add'}</span></button>
          </div>
        </form>
      </Modal>
    );
  };

  // Player Selection Modal for Video Analysis
  const SelectPlayerModal = () => {
    const [mode, setMode] = useState('existing'); // 'existing' or 'new'
    const [newPlayer, setNewPlayer] = useState({ name: '', position: 'Midfielder', jerseyNumber: '', jerseyColor: '#10b981' });
    
    const handleSelectExisting = (player) => {
      setTrackedPlayer(player);
      setShowModal(null);
      setUploadState('selecting');
    };
    
    const handleAddNew = () => {
      if (!newPlayer.name) return;
      const player = {
        id: Date.now(),
        name: newPlayer.name,
        position: newPlayer.position,
        age: 0, // Unknown
        jerseyNumber: newPlayer.jerseyNumber ? parseInt(newPlayer.jerseyNumber) : null,
        jerseyColor: newPlayer.jerseyColor,
        rating: 70,
        trend: 'same',
        avatar: newPlayer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        createdAt: new Date().toISOString(),
        analyses: []
      };
      setPlayers([...players, player]);
      setTrackedPlayer(player);
      setShowModal(null);
      setUploadState('selecting');
    };
    
    return (
      <Modal title="Who are you tracking?" onClose={() => { setShowModal(null); setUploadState('idle'); }} wide>
        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex space-x-2 p-1 bg-white/5 rounded-xl">
            <button onClick={() => setMode('existing')} className={`flex-1 py-2 rounded-lg font-medium transition-all ${mode === 'existing' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              Select from Roster
            </button>
            <button onClick={() => setMode('new')} className={`flex-1 py-2 rounded-lg font-medium transition-all ${mode === 'new' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              New Player
            </button>
          </div>
          
          {mode === 'existing' ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {players.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No players in roster yet.</p>
                  <button onClick={() => setMode('new')} className="mt-3 text-emerald-400 hover:underline">Add a new player</button>
                </div>
              ) : (
                players.map(player => (
                  <button key={player.id} onClick={() => handleSelectExisting(player)} className="w-full flex items-center space-x-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left group">
                    <JerseyBadge number={player.jerseyNumber || '?'} color={player.jerseyColor} />
                    <div className="flex-1">
                      <p className="font-bold text-white group-hover:text-emerald-400">{player.name}</p>
                      <p className="text-gray-400 text-sm">{player.position} • {player.analyses?.length || 0} sessions</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-400" />
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Player Name *</label>
                <input type="text" value={newPlayer.name} onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})} placeholder="Enter name" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Position</label>
                  <select value={newPlayer.position} onChange={(e) => setNewPlayer({...newPlayer, position: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white">
                    <option value="Goalkeeper">Goalkeeper</option><option value="Defender">Defender</option><option value="Midfielder">Midfielder</option><option value="Forward">Forward</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Jersey #</label>
                  <input type="number" value={newPlayer.jerseyNumber} onChange={(e) => setNewPlayer({...newPlayer, jerseyNumber: e.target.value})} placeholder="#" min="1" max="99" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Jersey Color</label>
                <div className="flex flex-wrap gap-2">
                  {JERSEY_COLORS.map(c => (
                    <button key={c.value} type="button" onClick={() => setNewPlayer({...newPlayer, jerseyColor: c.value})} 
                      className={`w-8 h-8 rounded-full border-2 transition-all ${newPlayer.jerseyColor === c.value ? 'border-white scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c.value }} title={c.name} />
                  ))}
                </div>
              </div>
              
              {/* Preview */}
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl">
                <JerseyBadge number={newPlayer.jerseyNumber || '?'} color={newPlayer.jerseyColor} size="lg" />
                <div>
                  <p className="font-bold text-white">{newPlayer.name || 'Player Name'}</p>
                  <p className="text-gray-400 text-sm">{newPlayer.position} • #{newPlayer.jerseyNumber || '?'}</p>
                </div>
              </div>
              
              <button onClick={handleAddNew} disabled={!newPlayer.name} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 text-white rounded-xl font-semibold transition-all disabled:cursor-not-allowed">
                Continue with this player
              </button>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  const AddSessionModal = () => {
    const [form, setForm] = useState(editingItem || { title: '', date: '', time: '', type: 'Technical', drills: [] });
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!form.title || !form.date || !form.time) return;
      const newSession = { id: editingItem?.id || Date.now(), ...form, players: players.length, status: 'scheduled', createdAt: editingItem?.createdAt || new Date().toISOString() };
      if (editingItem) { setSessions(sessions.map(s => s.id === editingItem.id ? newSession : s)); } else { setSessions([...sessions, newSession]); }
      setShowModal(null); setEditingItem(null);
    };
    return (
      <Modal title={editingItem ? 'Edit Session' : 'New Training Session'} onClose={() => { setShowModal(null); setEditingItem(null); }}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-400 mb-2">Session Title *</label><input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="e.g., Morning Training" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-400 mb-2">Date *</label><input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50" required /></div>
            <div><label className="block text-sm font-medium text-gray-400 mb-2">Time *</label><input type="time" value={form.time} onChange={(e) => setForm({...form, time: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50" required /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-400 mb-2">Type</label><select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"><option value="Technical">Technical</option><option value="Tactical">Tactical</option><option value="Physical">Physical</option><option value="Match Prep">Match Prep</option><option value="Recovery">Recovery</option></select></div>
          <div className="flex space-x-3 pt-4"><button type="button" onClick={() => { setShowModal(null); setEditingItem(null); }} className="flex-1 py-3 border border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/5 transition-all">Cancel</button><button type="submit" className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all">{editingItem ? 'Save' : 'Create'}</button></div>
        </form>
      </Modal>
    );
  };

  const GenerateReportModal = () => {
    const [form, setForm] = useState({ type: 'Team', player: '' });
    const [generating, setGenerating] = useState(false);
    const handleGenerate = async (e) => {
      e.preventDefault(); 
      setGenerating(true);
      
      if (form.type === 'Individual' && form.player) {
        const player = players.find(p => p.id === parseInt(form.player));
        if (player) {
          await handleExportPlayerReport(player);
        }
      } else {
        // Team report
        const newReport = { id: Date.now(), title: `${form.type} Performance Report`, type: form.type, date: new Date().toISOString().split('T')[0], status: 'ready', createdAt: new Date().toISOString() };
        setReports([newReport, ...reports]);
      }
      
      setGenerating(false); 
      setShowModal(null);
    };
    return (
      <Modal title="Generate Report" onClose={() => setShowModal(null)}>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-400 mb-2">Report Type</label><select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50"><option value="Team">Team Report</option><option value="Individual">Individual Player Report</option></select></div>
          {form.type === 'Individual' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Select Player</label>
              <select value={form.player} onChange={(e) => setForm({...form, player: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50" required>
                <option value="">Choose a player...</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name} (#{p.jerseyNumber || '?'})</option>)}
              </select>
            </div>
          )}
          <div className="flex space-x-3 pt-4"><button type="button" onClick={() => setShowModal(null)} className="flex-1 py-3 border border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/5 transition-all">Cancel</button><button type="submit" disabled={generating || (form.type === 'Individual' && !form.player)} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-2">{generating ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Generating...</span></> : <span>Generate PDF</span>}</button></div>
        </form>
      </Modal>
    );
  };

  const AddToSessionModal = () => {
    const drill = selectedDrill;
    if (!drill) return null;
    const handleAddToSession = (sessionId) => {
      setSessions(sessions.map(s => {
        if (s.id === sessionId) { const drills = s.drills || []; if (!drills.find(d => d.id === drill.id)) { return { ...s, drills: [...drills, drill] }; } }
        return s;
      }));
      setShowModal(null); setSelectedDrill(null);
    };
    return (
      <Modal title="Add Drill to Session" onClose={() => { setShowModal(null); setSelectedDrill(null); }}>
        <div className="mb-4 p-4 bg-white/5 rounded-xl"><div className="flex items-center space-x-3"><span className="text-2xl">{drill.icon}</span><div><h4 className="font-bold text-white">{drill.name}</h4><p className="text-gray-400 text-sm">{drill.category} • {drill.duration}</p></div></div></div>
        {sessions.length === 0 ? <div className="text-center py-8"><p className="text-gray-400 mb-4">No sessions created yet.</p><button onClick={() => { setShowModal('session'); setSelectedDrill(null); }} className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium">Create a Session First</button></div>
        : <div className="space-y-2"><p className="text-sm text-gray-400 mb-3">Select a session:</p>{sessions.map(session => (<button key={session.id} onClick={() => handleAddToSession(session.id)} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"><div className="flex items-center justify-between"><div><h4 className="font-medium text-white group-hover:text-emerald-400">{session.title}</h4><p className="text-gray-500 text-sm">{session.date} at {session.time}</p></div><Plus className="w-5 h-5 text-gray-400 group-hover:text-emerald-400" /></div></button>))}</div>}
      </Modal>
    );
  };

  // TeamSnap Import Modal
  const TeamSnapImportModal = () => {
    const [step, setStep] = useState('teams');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [roster, setRoster] = useState([]);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [loadingRoster, setLoadingRoster] = useState(false);
    const [importedCount, setImportedCount] = useState(0);
    
    useEffect(() => {
      if (teamsnapToken && teamsnapTeams.length === 0) fetchTeamsnapTeams();
    }, [teamsnapToken]);
    
    const handleSelectTeam = async (team) => {
      setSelectedTeam(team);
      setLoadingRoster(true);
      const players = await fetchTeamsnapRoster(team.id);
      setRoster(players);
      setSelectedPlayers(players.map(p => p.id));
      setLoadingRoster(false);
      setStep('roster');
    };
    
    const togglePlayer = (id) => setSelectedPlayers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleAll = () => setSelectedPlayers(selectedPlayers.length === roster.length ? [] : roster.map(p => p.id));
    
    const handleImport = async () => {
      setStep('importing');
      try {
        const count = await importTeamsnapPlayers(roster, selectedPlayers, selectedTeam);
        setImportedCount(count);
        setStep('done');
      } catch (err) {
        console.error('Import failed:', err);
        setStep('teams');
      }
    };
    
    return (
      <Modal title="Import from TeamSnap" onClose={() => setShowModal(null)} wide>
        {step === 'teams' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center"><Check className="w-5 h-5 text-emerald-400" /></div>
              <div><p className="font-semibold text-white">Connected to TeamSnap</p><p className="text-sm text-gray-400">Select a team to import players</p></div>
            </div>
            {teamsnapLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>
            ) : teamsnapTeams.length === 0 ? (
              <div className="text-center py-12"><Users className="w-12 h-12 text-gray-500 mx-auto mb-3" /><p className="text-gray-400">No teams found</p><button onClick={fetchTeamsnapTeams} className="mt-4 text-emerald-400 hover:underline">Refresh</button></div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {teamsnapTeams.map(team => (
                  <button key={team.id} onClick={() => handleSelectTeam(team)} className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left group">
                    <div><p className="font-bold text-white group-hover:text-emerald-400">{team.name}</p><p className="text-gray-400 text-sm">{[team.divisionName, team.seasonName].filter(Boolean).join(' • ')}</p></div>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-emerald-400" />
                  </button>
                ))}
              </div>
            )}
            <div className="pt-4 border-t border-white/10 flex justify-between"><button onClick={disconnectTeamSnap} className="text-gray-400 hover:text-red-400 text-sm">Disconnect</button><button onClick={() => setShowModal(null)} className="px-4 py-2 border border-white/20 text-gray-300 rounded-xl hover:bg-white/5">Cancel</button></div>
          </div>
        )}
        {step === 'roster' && (
          <div className="space-y-4">
            <button onClick={() => setStep('teams')} className="flex items-center space-x-2 text-gray-400 hover:text-white"><ChevronLeft className="w-4 h-4" /><span>Back</span></button>
            <div className="p-4 bg-white/5 rounded-xl"><h3 className="font-bold text-white">{selectedTeam?.name}</h3><p className="text-gray-400 text-sm">{roster.length} players</p></div>
            {loadingRoster ? <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div> : roster.length === 0 ? <div className="text-center py-12 text-gray-400">No players found</div> : (
              <>
                <div className="flex items-center justify-between"><button onClick={toggleAll} className="text-sm text-emerald-400 hover:underline">{selectedPlayers.length === roster.length ? 'Deselect All' : 'Select All'}</button><span className="text-sm text-gray-400">{selectedPlayers.length} selected</span></div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {roster.map(player => {
                    const isSelected = selectedPlayers.includes(player.id);
                    const alreadyImported = players.some(p => p.teamsnapId === player.id);
                    return (
                      <button key={player.id} onClick={() => !alreadyImported && togglePlayer(player.id)} disabled={alreadyImported} className={`w-full flex items-center space-x-4 p-3 rounded-xl transition-all text-left ${alreadyImported ? 'bg-white/5 opacity-50' : isSelected ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5 border border-white/10 hover:border-white/20'}`}>
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500'}`}>{isSelected && <Check className="w-4 h-4 text-white" />}</div>
                        <JerseyBadge number={player.jerseyNumber || '?'} color="#10b981" size="sm" />
                        <div className="flex-1"><p className="font-medium text-white">{player.name}</p><p className="text-gray-400 text-xs">{player.position || 'No position'}{player.jerseyNumber && ` • #${player.jerseyNumber}`}</p></div>
                        {alreadyImported && <span className="text-xs text-gray-500 bg-white/10 px-2 py-1 rounded">Imported</span>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
            <div className="flex space-x-3 pt-4"><button onClick={() => setShowModal(null)} className="flex-1 py-3 border border-white/20 text-gray-300 rounded-xl hover:bg-white/5">Cancel</button><button onClick={handleImport} disabled={selectedPlayers.length === 0} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 text-white rounded-xl font-semibold">Import {selectedPlayers.length} Players</button></div>
          </div>
        )}
        {step === 'importing' && <div className="text-center py-12"><Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" /><p className="text-white font-semibold">Importing...</p></div>}
        {step === 'done' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><Check className="w-8 h-8 text-emerald-400" /></div>
            <h3 className="text-xl font-bold text-white mb-2">Import Complete!</h3>
            <p className="text-gray-400 mb-6">Imported {importedCount} player{importedCount !== 1 ? 's' : ''}</p>
            <div className="flex space-x-3 justify-center"><button onClick={() => { setShowModal(null); setCurrentPage('players'); }} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold">View Players</button><button onClick={() => setShowModal(null)} className="px-6 py-2.5 border border-white/20 text-gray-300 rounded-xl hover:bg-white/5">Close</button></div>
          </div>
        )}
      </Modal>
    );
  };

  // ============================================
  // PAGES
  // ============================================

  const Dashboard = () => (
    <PageWrapper title="Dashboard" sidebarCollapsed={sidebarCollapsed} currentPage="dashboard" setCurrentPage={setCurrentPage}>
      <div className="mb-8"><h1 className="text-3xl font-bold text-white mb-2">Welcome{user?.firstName ? `, ${user.firstName}` : ''}! 👋</h1><p className="text-gray-400">{players.length === 0 && videos.length === 0 ? "Let's get started by adding your team or uploading your first video." : "Here's your team overview."}</p></div>
      <div onClick={() => { setCurrentPage('upload'); setUploadState('idle'); }} className="group bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-3xl p-8 cursor-pointer hover:border-emerald-500/50 transition-all mb-8">
        <div className="flex items-center justify-between">
          <div><div className="flex items-center space-x-2 mb-3"><Brain className="w-6 h-6 text-emerald-400" /><span className="font-bold text-lg text-emerald-400">AI Video Analysis</span></div><h2 className="text-2xl font-bold text-white mb-3">Track individual player decisions</h2><p className="text-gray-400 mb-6 max-w-lg">Upload match footage, select which player to track, and build individual development profiles.</p><button className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg shadow-emerald-500/25"><Upload className="w-5 h-5" /><span>Upload Video</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></button></div>
          <div className="hidden lg:block"><div className="w-40 h-40 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform"><Video className="w-16 h-16 text-emerald-400" /></div></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => setCurrentPage('players')} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all cursor-pointer group"><div className="flex items-center justify-between mb-4"><div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Users className="w-6 h-6 text-emerald-400" /></div>{players.length === 0 && <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded">Setup needed</span>}</div><div className="text-3xl font-bold text-white mb-1">{players.length}</div><div className="text-gray-500 text-sm group-hover:text-gray-300">Players</div></div>
        <div onClick={() => setCurrentPage('videos')} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all cursor-pointer group"><div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4"><FileVideo className="w-6 h-6 text-amber-400" /></div><div className="text-3xl font-bold text-white mb-1">{videos.length}</div><div className="text-gray-500 text-sm group-hover:text-gray-300">Videos Analyzed</div></div>
        <div onClick={() => setCurrentPage('planner')} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all cursor-pointer group"><div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4"><Calendar className="w-6 h-6 text-purple-400" /></div><div className="text-3xl font-bold text-white mb-1">{sessions.length}</div><div className="text-gray-500 text-sm group-hover:text-gray-300">Sessions Planned</div></div>
      </div>
      {players.length === 0 && <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl"><h3 className="font-bold text-white mb-2">🚀 Quick Start Guide</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"><button onClick={() => setShowModal('player')} className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-emerald-500/30 transition-all"><div className="flex items-center space-x-3 mb-2"><div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">1</div><span className="font-medium text-white">Add Your Players</span></div><p className="text-gray-400 text-sm">Include jersey numbers & colors.</p></button><button onClick={() => { setCurrentPage('upload'); setUploadState('idle'); }} className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-emerald-500/30 transition-all"><div className="flex items-center space-x-3 mb-2"><div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">2</div><span className="font-medium text-white">Upload a Video</span></div><p className="text-gray-400 text-sm">Track specific players.</p></button><button onClick={() => setShowModal('session')} className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-emerald-500/30 transition-all"><div className="flex items-center space-x-3 mb-2"><div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">3</div><span className="font-medium text-white">Plan a Session</span></div><p className="text-gray-400 text-sm">Schedule training.</p></button></div></div>}
    </PageWrapper>
  );

  // Enhanced Players Page with Jersey Info
  const PlayersPage = () => {
    const deletePlayer = async (id) => { 
      if (window.confirm('Delete this player?')) { 
        if (user?.id) {
          try {
            await apiCall(`/api/players/${id}`, user.id, { method: 'DELETE' });
          } catch (err) {
            console.error('Failed to delete from DB:', err);
          }
        }
        setPlayers(players.filter(p => p.id !== id)); 
      } 
    };
    const deleteTeam = async (teamId) => { 
      if (window.confirm('Delete this team and unassign all players from it?')) { 
        if (user?.id) {
          try {
            await apiCall(`/api/teams/${teamId}`, user.id, { method: 'DELETE' });
          } catch (err) {
            console.error('Failed to delete team from DB:', err);
          }
        }
        setTeams(teams.filter(t => t.id !== teamId)); 
        setPlayers(players.map(p => p.teamId === teamId ? {...p, teamId: null, teamName: 'Unassigned'} : p));
        if (selectedTeamFilter === teamId) setSelectedTeamFilter('all');
      } 
    };
    
    // Filter by search and team
    const filteredPlayers = players.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.position.toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedTeamFilter === 'all') return matchesSearch;
      if (selectedTeamFilter === 'unassigned') return matchesSearch && !p.teamId && !p.teamName;
      // Match by team id or name
      const selectedTeam = teams.find(t => t.id === selectedTeamFilter);
      const matchesTeam = p.teamId === selectedTeamFilter || 
        String(p.teamId) === String(selectedTeamFilter) ||
        (selectedTeam && p.teamName === selectedTeam.name);
      return matchesSearch && matchesTeam;
    });
    
    // Group players by team for display - use teamName as grouping key for consistency
    const playersByTeam = {};
    filteredPlayers.forEach(p => {
      // Find the team this player belongs to
      const playerTeamName = p.teamName || 
        teams.find(t => t.id === p.teamId || String(t.id) === String(p.teamId))?.name || 
        'unassigned';
      const teamKey = playerTeamName === 'unassigned' || !p.teamId ? 'unassigned' : playerTeamName;
      if (!playersByTeam[teamKey]) playersByTeam[teamKey] = [];
      playersByTeam[teamKey].push(p);
    });
    
    const getTeamName = (teamKey) => {
      if (teamKey === 'unassigned' || !teamKey) return 'Unassigned Players';
      return teamKey; // teamKey is now the actual team name
    };
    
    // Get teams with player counts, filter out empty duplicates
    const teamsWithCounts = teams.map(team => {
      const count = players.filter(p => 
        p.teamId === team.id || 
        String(p.teamId) === String(team.id) ||
        p.teamId === team.teamsnapId ||
        String(p.teamId) === String(team.teamsnapId) ||
        p.teamName === team.name
      ).length;
      return { ...team, playerCount: count };
    });
    
    // Remove duplicate teams (keep ones with players, or unique names)
    const uniqueTeams = teamsWithCounts.reduce((acc, team) => {
      const existing = acc.find(t => t.name === team.name);
      if (!existing) {
        acc.push(team);
      } else if (team.playerCount > existing.playerCount) {
        // Replace with the one that has more players
        const idx = acc.indexOf(existing);
        acc[idx] = team;
      }
      return acc;
    }, []);
    
    return (
      <PageWrapper title="Player Profiles" showSearch sidebarCollapsed={sidebarCollapsed} searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentPage="players" setCurrentPage={setCurrentPage}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Players</h2>
            <p className="text-gray-400 mt-1">{players.length} player{players.length !== 1 ? 's' : ''} across {uniqueTeams.filter(t => t.playerCount > 0).length} team{uniqueTeams.filter(t => t.playerCount > 0).length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowModal('player')} className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all"><Plus className="w-5 h-5" /><span>Add Player</span></button>
        </div>
        
        {/* Team Filter Tabs */}
        {uniqueTeams.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setSelectedTeamFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedTeamFilter === 'all' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
              All Teams ({players.length})
            </button>
            {uniqueTeams.map(team => (
              <div key={team.id} className="flex items-center">
                <button onClick={() => setSelectedTeamFilter(team.id)} className={`px-4 py-2 ${team.playerCount === 0 ? 'rounded-l-xl' : 'rounded-xl'} text-sm font-medium transition-all flex items-center space-x-2 ${selectedTeamFilter === team.id ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  <span>{team.name}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{team.playerCount}</span>
                </button>
                {team.playerCount === 0 && (
                  <button onClick={() => deleteTeam(team.id)} className="px-2 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-r-xl text-sm" title="Delete empty team">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {players.some(p => !p.teamId) && (
              <button onClick={() => setSelectedTeamFilter('unassigned')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedTeamFilter === 'unassigned' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                Unassigned ({players.filter(p => !p.teamId).length})
              </button>
            )}
            {uniqueTeams.filter(t => t.playerCount === 0).length > 1 && (
              <button 
                onClick={() => {
                  if (window.confirm(`Delete all ${uniqueTeams.filter(t => t.playerCount === 0).length} empty teams?`)) {
                    const emptyTeamIds = uniqueTeams.filter(t => t.playerCount === 0).map(t => t.id);
                    emptyTeamIds.forEach(id => {
                      if (user?.id) {
                        apiCall(`/api/teams/${id}`, user.id, { method: 'DELETE' }).catch(console.error);
                      }
                    });
                    setTeams(teams.filter(t => !emptyTeamIds.includes(t.id)));
                  }
                }} 
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
              >
                Clean up empty teams
              </button>
            )}
          </div>
        )}
        
        {players.length === 0 ? <EmptyState icon={Users} title="No players yet" description="Add your first player with jersey number and color to start tracking." actionLabel="Add Your First Player" onAction={() => setShowModal('player')} />
        : selectedTeamFilter === 'all' && uniqueTeams.length > 0 ? (
          // Show grouped by team
          <div className="space-y-8">
            {Object.keys(playersByTeam).map(teamId => (
              <div key={teamId}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-white">{getTeamName(teamId)}</h3>
                    <span className="text-gray-400 text-sm">({playersByTeam[teamId].length} players)</span>
                  </div>
                  {teamId !== 'unassigned' && (
                    <button onClick={() => deleteTeam(teamId)} className="text-gray-500 hover:text-red-400 text-sm">Remove Team</button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playersByTeam[teamId].map((player) => (
                    <div key={player.id} onClick={() => { setSelectedPlayerId(player.id); setCurrentPage('playerDetail'); }} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <JerseyBadge number={player.jerseyNumber || '?'} color={player.jerseyColor} size="lg" />
                          <div>
                            <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{player.name}</h3>
                            <p className="text-gray-400 text-sm">{player.position} • Age {player.age || '?'}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                          <button onClick={() => { setEditingItem(player); setShowModal('player'); }} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => deletePlayer(player.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider">Decision IQ</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-2xl font-bold text-white">{player.rating}</span>
                            {player.trend === 'up' && <ArrowUp className="w-4 h-4 text-emerald-400" />}
                            {player.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-400" />}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500 text-xs uppercase tracking-wider">Sessions</p>
                          <p className="text-xl font-bold text-emerald-400 mt-1">{player.analyses?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Show flat list when filtered to specific team
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredPlayers.map((player) => (
            <div key={player.id} onClick={() => { setSelectedPlayerId(player.id); setCurrentPage('playerDetail'); }} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <JerseyBadge number={player.jerseyNumber || '?'} color={player.jerseyColor} size="lg" />
                  <div>
                    <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{player.name}</h3>
                    <p className="text-gray-400 text-sm">{player.position} • Age {player.age || '?'}</p>
                  </div>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                  <button onClick={() => { setEditingItem(player); setShowModal('player'); }} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deletePlayer(player.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Decision IQ</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-2xl font-bold text-white">{player.rating}</span>
                    {player.trend === 'up' && <ArrowUp className="w-4 h-4 text-emerald-400" />}
                    {player.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-400" />}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs uppercase tracking-wider">Sessions</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{player.analyses?.length || 0}</p>
                </div>
              </div>
            </div>
          ))}</div>
        )}
      </PageWrapper>
    );
  };

  // Player Detail Page
  const PlayerDetailPage = () => {
    const player = players.find(p => p.id === selectedPlayerId);
    if (!player) return <PageWrapper title="Player Not Found" sidebarCollapsed={sidebarCollapsed} currentPage="playerDetail" setCurrentPage={setCurrentPage}><EmptyState icon={User} title="Player not found" description="This player may have been deleted." /></PageWrapper>;
    
    const analyses = player.analyses || [];
    
    return (
      <PageWrapper title={player.name} sidebarCollapsed={sidebarCollapsed} currentPage="playerDetail" setCurrentPage={setCurrentPage}>
        {/* Header */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <JerseyBadge number={player.jerseyNumber || '?'} color={player.jerseyColor} size="lg" />
              <div>
                <h1 className="text-2xl font-bold text-white">{player.name}</h1>
                <p className="text-gray-400">{player.position} • Age {player.age || '?'} • #{player.jerseyNumber || '?'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => { setEditingItem(player); setShowModal('player'); }} className="flex items-center space-x-2 px-4 py-2 border border-white/20 text-gray-300 rounded-xl hover:bg-white/5"><Edit className="w-4 h-4" /><span>Edit</span></button>
              <button onClick={() => handleExportPlayerReport(player)} className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold"><Download className="w-4 h-4" /><span>Export Report</span></button>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-500 text-sm mb-2">Decision IQ</p>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-white">{player.rating}</span>
              {player.trend === 'up' && <ArrowUp className="w-5 h-5 text-emerald-400" />}
              {player.trend === 'down' && <ArrowDown className="w-5 h-5 text-red-400" />}
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-500 text-sm mb-2">Sessions Analyzed</p>
            <span className="text-3xl font-bold text-emerald-400">{analyses.length}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-500 text-sm mb-2">Total Decisions</p>
            <span className="text-3xl font-bold text-blue-400">{analyses.reduce((acc, a) => acc + (a.decisionCount || 0), 0)}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-500 text-sm mb-2">Avg Rating</p>
            <span className="text-3xl font-bold text-amber-400">
              {analyses.length > 0 && analyses.some(a => a.avgRating) 
                ? (analyses.filter(a => a.avgRating).reduce((acc, a) => acc + a.avgRating, 0) / analyses.filter(a => a.avgRating).length).toFixed(1)
                : '-'}
            </span>
          </div>
        </div>
        
        {/* Analysis History */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Analysis History</h2>
            <button onClick={() => { setCurrentPage('upload'); setUploadState('idle'); }} className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30">
              <Plus className="w-4 h-4" /><span>New Analysis</span>
            </button>
          </div>
          {analyses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No video analyses yet for {player.name}.</p>
              <button onClick={() => { setCurrentPage('upload'); setUploadState('idle'); }} className="mt-3 text-emerald-400 hover:underline">Upload match footage to track this player</button>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.slice().reverse().map((analysis, i) => (
                <div key={analysis.id || i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Video className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{analysis.videoName || 'Match Footage'}</p>
                      <p className="text-gray-500 text-sm">{analysis.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Decisions</p>
                      <p className="font-bold text-blue-400">{analysis.decisionCount || 0}</p>
                    </div>
                    {analysis.avgRating && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Rating</p>
                        <p className="font-bold text-amber-400">{analysis.avgRating.toFixed(1)}/5</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
    );
  };

  // Videos Page
  const VideosPage = () => {
    const deleteVideo = (id) => { if (window.confirm('Delete?')) { setVideos(videos.filter(v => v.id !== id)); } };
    return (
      <PageWrapper title="Video Library" showSearch sidebarCollapsed={sidebarCollapsed} searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentPage="videos" setCurrentPage={setCurrentPage}>
        <div className="flex items-center justify-between mb-8"><div><h2 className="text-2xl font-bold text-white">Video Library</h2><p className="text-gray-400 mt-1">{videos.length} video{videos.length !== 1 ? 's' : ''}</p></div><button onClick={() => { setCurrentPage('upload'); setUploadState('idle'); }} className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold transition-all"><Upload className="w-5 h-5" /><span>Upload</span></button></div>
        {videos.length === 0 ? <EmptyState icon={FileVideo} title="No videos yet" description="Upload match footage to start tracking players." actionLabel="Upload First Video" onAction={() => { setCurrentPage('upload'); setUploadState('idle'); }} />
        : <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{videos.map((video) => (
          <div key={video.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all group">
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all"><PlayCircle className="w-8 h-8 text-white group-hover:text-emerald-400" /></div>
              <div className="absolute bottom-3 right-3 bg-black/60 px-2 py-1 rounded-lg text-xs text-white">{video.duration}</div>
              {video.playerName && (
                <div className="absolute top-3 left-3 flex items-center space-x-2 bg-black/60 px-2 py-1 rounded-lg">
                  <JerseyBadge number={video.jerseyNumber || '?'} color={video.jerseyColor} size="sm" />
                  <span className="text-white text-sm font-medium">{video.playerName}</span>
                </div>
              )}
              <button onClick={() => deleteVideo(video.id)} className="absolute top-3 right-3 p-2 bg-black/60 text-gray-400 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-white group-hover:text-emerald-400">{video.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-500 text-sm">{video.date}</p>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg">{video.decisions} decisions</span>
              </div>
            </div>
          </div>
        ))}</div>}
      </PageWrapper>
    );
  };

  // AI Coach Page
  const AICoachPage = () => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);
    const suggestions = ["How can I improve my team's passing?", "What drills help with decision-making?", "Create a training plan for midfielders", "How should we defend counter-attacks?"];
    const sendMessage = async (text) => {
      if (!text.trim()) return;
      setChatHistory(prev => [...prev, { role: 'user', content: text, timestamp: new Date().toISOString() }]);
      setMessage(''); setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/coach`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, context: { playerCount: players.length, players: players.map(p => ({ name: p.name, position: p.position, rating: p.rating, jerseyNumber: p.jerseyNumber })), recentSessions: sessions.slice(0, 3) } }) });
        let aiResponse;
        if (response.ok) { const data = await response.json(); aiResponse = data.response || data.message; } else { aiResponse = "Connection issue. Please check the backend."; }
        setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() }]);
      } catch (err) { setChatHistory(prev => [...prev, { role: 'assistant', content: "Connection error.", timestamp: new Date().toISOString() }]); }
      setIsLoading(false);
    };
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);
    return (
      <PageWrapper title="AI Coach" sidebarCollapsed={sidebarCollapsed} currentPage="assistant" setCurrentPage={setCurrentPage}>
        <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
          {chatHistory.length === 0 ? <div className="flex-1 flex flex-col items-center justify-center"><div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6"><Brain className="w-12 h-12 text-emerald-400" /></div><h2 className="text-3xl font-bold text-white mb-3">AI Coach</h2><p className="text-gray-400 text-lg mb-8">Get personalized tactical advice.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">{suggestions.map((s, i) => (<button key={i} onClick={() => sendMessage(s)} className="text-left p-4 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:border-emerald-500/30 hover:bg-emerald-500/5">{s}</button>))}</div></div>
          : <div className="flex-1 overflow-y-auto space-y-4 mb-4">{chatHistory.map((msg, i) => (<div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-500 text-white' : 'bg-white/5 border border-white/10 text-gray-200'}`}><p className="whitespace-pre-wrap">{msg.content}</p></div></div>))}{isLoading && <div className="flex justify-start"><div className="bg-white/5 border border-white/10 rounded-2xl p-4"><Loader2 className="w-5 h-5 text-emerald-400 animate-spin" /></div></div>}<div ref={chatEndRef} /></div>}
          <div className="relative"><textarea value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(message); } }} placeholder="Ask anything..." rows={2} className="w-full p-4 pr-24 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none" /><button onClick={() => sendMessage(message)} disabled={!message.trim() || isLoading} className="absolute right-3 bottom-3 p-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 text-white rounded-xl"><Send className="w-5 h-5" /></button></div>
          {chatHistory.length > 0 && <button onClick={() => setChatHistory([])} className="mt-3 text-gray-500 hover:text-gray-300 text-sm">Clear</button>}
        </div>
      </PageWrapper>
    );
  };

  // Session Planner
  const SessionPlannerPage = () => {
    const deleteSession = (id) => { if (window.confirm('Delete?')) { setSessions(sessions.filter(s => s.id !== id)); } };
    const removeDrill = (sid, did) => { setSessions(sessions.map(s => s.id === sid ? { ...s, drills: (s.drills || []).filter(d => d.id !== did) } : s)); };
    const fmtDate = (date, time) => { const d = new Date(date + 'T' + time); const now = new Date(); const tmrw = new Date(now); tmrw.setDate(tmrw.getDate() + 1); if (d.toDateString() === now.toDateString()) return `Today, ${time}`; if (d.toDateString() === tmrw.toDateString()) return `Tomorrow, ${time}`; return `${date}, ${time}`; };
    return (
      <PageWrapper title="Session Planner" sidebarCollapsed={sidebarCollapsed} currentPage="planner" setCurrentPage={setCurrentPage}>
        <div className="flex items-center justify-between mb-8"><div><h2 className="text-2xl font-bold text-white">Training Sessions</h2><p className="text-gray-400 mt-1">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p></div><button onClick={() => setShowModal('session')} className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold"><Plus className="w-5 h-5" /><span>New Session</span></button></div>
        {sessions.length === 0 ? <EmptyState icon={Calendar} title="No sessions" description="Create your first training session." actionLabel="Create Session" onAction={() => setShowModal('session')} />
        : <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><div className="lg:col-span-2 space-y-4">{sessions.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time)).map(s => (<div key={s.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30"><div className="flex items-center justify-between mb-4"><div className="flex items-center space-x-4"><div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Calendar className="w-6 h-6 text-emerald-400" /></div><div><h3 className="font-bold text-white">{s.title}</h3><p className="text-gray-400 text-sm">{fmtDate(s.date, s.time)}</p></div></div><div className="flex items-center space-x-3"><span className="bg-white/10 text-gray-300 text-xs font-medium px-3 py-1 rounded-lg">{s.type}</span><button onClick={() => { setEditingItem(s); setShowModal('session'); }} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"><Edit className="w-4 h-4" /></button><button onClick={() => deleteSession(s.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></div>{s.drills?.length > 0 && <div className="mt-4 pt-4 border-t border-white/10"><p className="text-sm text-gray-400 mb-2">Drills ({s.drills.length})</p><div className="flex flex-wrap gap-2">{s.drills.map(d => (<div key={d.id} className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-lg"><span>{d.icon}</span><span className="text-sm text-gray-300">{d.name}</span><button onClick={() => removeDrill(s.id, d.id)} className="text-gray-500 hover:text-red-400"><X className="w-3 h-3" /></button></div>))}</div></div>}</div>))}</div><div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-fit"><h3 className="font-bold text-white mb-4">Quick Stats</h3><div className="space-y-4"><div className="flex items-center justify-between p-3 bg-white/5 rounded-xl"><span className="text-gray-400">This Week</span><span className="font-bold text-white">{sessions.filter(s => { const d = new Date(s.date); const now = new Date(); const wk = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); return d >= now && d <= wk; }).length}</span></div><div className="flex items-center justify-between p-3 bg-white/5 rounded-xl"><span className="text-gray-400">Total Drills</span><span className="font-bold text-white">{sessions.reduce((a, s) => a + (s.drills?.length || 0), 0)}</span></div><div className="flex items-center justify-between p-3 bg-white/5 rounded-xl"><span className="text-gray-400">Players</span><span className="font-bold text-emerald-400">{players.length}</span></div></div></div></div>}
      </PageWrapper>
    );
  };

  // Reports Page
  const ReportsPage = () => {
    const deleteReport = (id) => { if (window.confirm('Delete?')) { setReports(reports.filter(r => r.id !== id)); } };
    return (
      <PageWrapper title="Reports" sidebarCollapsed={sidebarCollapsed} currentPage="reports" setCurrentPage={setCurrentPage}>
        <div className="flex items-center justify-between mb-8"><div><h2 className="text-2xl font-bold text-white">Generated Reports</h2><p className="text-gray-400 mt-1">{reports.length} report{reports.length !== 1 ? 's' : ''}</p></div><button onClick={() => setShowModal('report')} className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-semibold"><FileText className="w-5 h-5" /><span>Generate Report</span></button></div>
        {reports.length === 0 ? <EmptyState icon={FileText} title="No reports" description="Generate player development reports." actionLabel="Generate Report" onAction={() => setShowModal('report')} />
        : <div className="space-y-4">{reports.map(r => (<div key={r.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 group"><div className="flex items-center justify-between"><div className="flex items-center space-x-4"><div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center"><FileText className="w-6 h-6 text-amber-400" /></div><div><h3 className="font-bold text-white group-hover:text-emerald-400">{r.title}</h3><p className="text-gray-400 text-sm">{r.date}</p></div></div><div className="flex items-center space-x-3"><span className="bg-white/10 text-gray-300 text-xs font-medium px-3 py-1 rounded-lg">{r.type}</span><button onClick={() => deleteReport(r.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button></div></div></div>))}</div>}
      </PageWrapper>
    );
  };

  // Stats, Progress, Benchmarks (abbreviated)
  const TeamStatsPage = () => {
    const avg = players.length > 0 ? Math.round(players.reduce((a, p) => a + p.rating, 0) / players.length) : 0;
    return (
      <PageWrapper title="Team Stats" sidebarCollapsed={sidebarCollapsed} currentPage="stats" setCurrentPage={setCurrentPage}>
        {players.length === 0 ? <EmptyState icon={Target} title="No data" description="Add players first." actionLabel="Add Players" onAction={() => setCurrentPage('players')} />
        : <><div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"><div className="bg-white/5 border border-white/10 rounded-2xl p-6"><p className="text-gray-500 text-sm mb-2">Avg Decision IQ</p><span className="text-3xl font-bold text-white">{avg}</span></div><div className="bg-white/5 border border-white/10 rounded-2xl p-6"><p className="text-gray-500 text-sm mb-2">Players</p><span className="text-3xl font-bold text-white">{players.length}</span></div><div className="bg-white/5 border border-white/10 rounded-2xl p-6"><p className="text-gray-500 text-sm mb-2">Videos</p><span className="text-3xl font-bold text-white">{videos.length}</span></div><div className="bg-white/5 border border-white/10 rounded-2xl p-6"><p className="text-gray-500 text-sm mb-2">Sessions</p><span className="text-3xl font-bold text-white">{sessions.length}</span></div></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="bg-white/5 border border-white/10 rounded-2xl p-6"><h3 className="font-bold text-white mb-4">Position Distribution</h3><div className="space-y-4">{['Goalkeeper', 'Defender', 'Midfielder', 'Forward'].map((pos, i) => { const count = players.filter(p => p.position === pos).length; const pct = players.length > 0 ? Math.round((count / players.length) * 100) : 0; const colors = ['bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500']; return (<div key={pos}><div className="flex justify-between text-sm mb-1"><span className="text-gray-400">{pos}</span><span className="text-white font-medium">{count} ({pct}%)</span></div><div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className={`h-full ${colors[i]} rounded-full`} style={{ width: `${pct}%` }} /></div></div>); })}</div></div><div className="bg-white/5 border border-white/10 rounded-2xl p-6"><h3 className="font-bold text-white mb-4">Top Performers</h3><div className="space-y-4">{players.sort((a, b) => b.rating - a.rating).slice(0, 5).map((p, i) => (<div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl"><div className="flex items-center space-x-3"><JerseyBadge number={p.jerseyNumber || '?'} color={p.jerseyColor} size="sm" /><div><p className="font-medium text-white">{p.name}</p><p className="text-gray-500 text-xs">{p.position}</p></div></div><span className="text-xl font-bold text-emerald-400">{p.rating}</span></div>))}</div></div></div></>}
      </PageWrapper>
    );
  };

  const ProgressPage = () => (
    <PageWrapper title="Progress" sidebarCollapsed={sidebarCollapsed} currentPage="progress" setCurrentPage={setCurrentPage}>
      {players.length === 0 ? <EmptyState icon={TrendingUp} title="No data" description="Add players and analyze videos." actionLabel="Get Started" onAction={() => setCurrentPage('upload')} />
      : <><div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"><div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-6"><div className="flex items-center space-x-3"><div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-emerald-400" /></div><div><p className="text-emerald-400 text-sm">Players</p><p className="text-3xl font-bold text-white">{players.length}</p></div></div></div><div className="bg-white/5 border border-white/10 rounded-2xl p-6"><div className="flex items-center space-x-3"><div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center"><Video className="w-6 h-6 text-amber-400" /></div><div><p className="text-gray-400 text-sm">Videos</p><p className="text-3xl font-bold text-white">{videos.length}</p></div></div></div><div className="bg-white/5 border border-white/10 rounded-2xl p-6"><div className="flex items-center space-x-3"><div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center"><Target className="w-6 h-6 text-purple-400" /></div><div><p className="text-gray-400 text-sm">Total Analyses</p><p className="text-3xl font-bold text-white">{players.reduce((a, p) => a + (p.analyses?.length || 0), 0)}</p></div></div></div></div><div className="bg-white/5 border border-white/10 rounded-2xl p-6"><h3 className="font-bold text-white mb-4">Player Ratings</h3><div className="space-y-3">{players.map(p => (<div key={p.id} className="flex items-center space-x-4"><JerseyBadge number={p.jerseyNumber || '?'} color={p.jerseyColor} size="sm" /><div className="w-20 text-sm text-gray-400 truncate">{p.name}</div><div className="flex-1 h-4 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${p.rating}%` }} /></div><div className="w-12 text-right text-white font-bold">{p.rating}</div></div>))}</div></div></>}
    </PageWrapper>
  );

  const BenchmarksPage = () => {
    const avg = players.length > 0 ? Math.round(players.reduce((a, p) => a + p.rating, 0) / players.length) : 0;
    const benchmarks = [{ category: 'Decision IQ', team: avg, elite: 92, icon: Brain }, { category: 'Pass Accuracy', team: Math.min(avg + 5, 100), elite: 95, icon: Target }, { category: 'Spatial Awareness', team: Math.max(avg - 7, 0), elite: 88, icon: Eye }, { category: 'Under Pressure', team: Math.max(avg - 10, 0), elite: 85, icon: Zap }];
    return (
      <PageWrapper title="Benchmarks" sidebarCollapsed={sidebarCollapsed} currentPage="benchmarks" setCurrentPage={setCurrentPage}>
        {players.length === 0 ? <EmptyState icon={Target} title="No data" description="Add players to compare." actionLabel="Add Players" onAction={() => setCurrentPage('players')} />
        : <div className="space-y-6">{benchmarks.map((b, i) => (<div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6"><div className="flex items-center justify-between mb-4"><div className="flex items-center space-x-3"><div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><b.icon className="w-5 h-5 text-emerald-400" /></div><span className="font-bold text-white">{b.category}</span></div><div className="flex items-center space-x-6"><div className="text-right"><p className="text-gray-500 text-xs">Your Team</p><p className="text-xl font-bold text-white">{b.team}%</p></div><div className="text-right"><p className="text-gray-500 text-xs">Elite</p><p className="text-xl font-bold text-amber-400">{b.elite}%</p></div></div></div><div className="relative h-4 bg-white/10 rounded-full overflow-hidden"><div className="absolute h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${b.team}%` }} /><div className="absolute h-full w-1 bg-amber-400" style={{ left: `${b.elite}%` }} /></div></div>))}</div>}
      </PageWrapper>
    );
  };

  // ============================================
  // UPLOAD PAGE
  // ============================================

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setTrackedPlayer(null);
      setShowModal('selectPlayer'); // Show player selection modal
      setError(null);
    }
  };
  
  const handleVideoClick = (e) => {
    if (uploadState !== 'selecting') return;
    const video = videoRef.current;
    const rect = video.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * video.videoWidth;
    const y = ((e.clientY - rect.top) / rect.height) * video.videoHeight;
    setClickPosition({ x, y, timestamp: video.currentTime, displayX: e.clientX - rect.left, displayY: e.clientY - rect.top });
  };
  
  const resetUpload = () => {
    setUploadState('idle');
    setVideoFile(null);
    setVideoUrl(null);
    setClickPosition(null);
    setAnalysisResults(null);
    setTrackedPlayer(null);
    setError(null);
    setUploadProgress(0);
    stopClip();
  };
  
  const startAnalysis = async () => {
  if (videoRef.current) videoRef.current.pause();
  if (!videoFile || !clickPosition) return;
  
  setUploadState('uploading');
  setProgress(0);
  setStatusMessage('Starting upload...');
  setError(null);
  
  try {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('clickX', String(clickPosition.x));
    formData.append('clickY', String(clickPosition.y));
    formData.append('clickTimestamp', String(clickPosition.timestamp));

    const response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.id}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const { jobId } = await response.json();
    
    setUploadState('analyzing');
    
    // Poll for progress
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`${API_BASE}/api/analyze-status/${jobId}`);
        const status = await statusResponse.json();
        
        setProgress(status.progress || 0);
        setStatusMessage(status.message || 'Processing...');
        setElapsedTime(status.elapsed || '0m 0s');
        
        if (status.status === 'completed') {
          clearInterval(pollInterval);
          const results = status.results;
          
          setAnalysisResults(results);
          
          // Save to video library
          const newVideo = {
            id: Date.now(),
            title: videoFile.name.replace(/\.[^/.]+$/, ''),
            date: new Date().toISOString().split('T')[0],
            duration: videoRef.current ? formatTime(videoRef.current.duration) : '00:00',
            decisions: results.decision_points?.length || 0,
            playerName: trackedPlayer?.name,
            playerId: trackedPlayer?.id,
            jerseyNumber: trackedPlayer?.jerseyNumber,
            jerseyColor: trackedPlayer?.jerseyColor
          };
          setVideos([newVideo, ...videos]);
          
          // Save analysis to player profile
          if (trackedPlayer) {
            saveAnalysisToPlayer(trackedPlayer.id, results, videoFile.name);
          }
          
          setUploadState('complete');
        } else if (status.status === 'failed') {
          clearInterval(pollInterval);
          setError(status.error || 'Analysis failed');
          setUploadState('selecting');
        }
      } catch (err) {
        console.error('Status poll error:', err);
      }
    }, 2000);
    
  } catch (err) {
    setError(err.message || 'Something went wrong');
    setUploadState('selecting');
  }
};

  const UploadPage = () => (
    <div className={`pt-16 min-h-screen bg-[#0a0f0d] transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
      <TopBar title="Upload Video" sidebarCollapsed={sidebarCollapsed} currentPage="upload" setCurrentPage={setCurrentPage} />
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {uploadState === 'idle' && (
            <div onClick={() => fileInputRef.current?.click()} className="group bg-white/5 border-2 border-dashed border-white/20 hover:border-emerald-500/50 rounded-3xl p-16 text-center cursor-pointer hover:bg-emerald-500/5">
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
              <div className="inline-flex p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6 group-hover:scale-110 transition-all"><Upload className="w-12 h-12 text-emerald-400" /></div>
              <h2 className="text-2xl font-bold text-white mb-2">Upload Match Footage</h2>
              <p className="text-gray-400 mb-4">You'll select which player to track after uploading</p>
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500"><span className="flex items-center space-x-2"><Video className="w-4 h-4 text-emerald-400" /><span>MP4, MOV, AVI</span></span><span className="flex items-center space-x-2"><Clock className="w-4 h-4 text-emerald-400" /><span>Up to 10 min</span></span></div>
            </div>
          )}

          {uploadState === 'selecting' && videoUrl && trackedPlayer && (
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border-b border-emerald-500/20 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <JerseyBadge number={trackedPlayer.jerseyNumber || '?'} color={trackedPlayer.jerseyColor} />
                    <div>
                      <p className="text-white font-bold">Tracking: {trackedPlayer.name}</p>
                      <p className="text-emerald-400 text-sm">Click on this player in the video</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal('selectPlayer')} className="text-gray-400 hover:text-white text-sm">Change player</button>
                </div>
              </div>
              <div className="relative bg-black"><video ref={videoRef} src={videoUrl} className="w-full cursor-crosshair" controls onClick={handleVideoClick} />{clickPosition && <div className="absolute w-14 h-14 border-4 border-emerald-400 rounded-full animate-pulse pointer-events-none" style={{ left: clickPosition.displayX - 28, top: clickPosition.displayY - 28 }}><div className="absolute inset-2 bg-emerald-400/30 rounded-full" /></div>}</div>
              <div className="p-6 bg-white/5 border-t border-white/10"><div className="flex items-center justify-between"><div>{clickPosition ? <div className="flex items-center space-x-2 text-emerald-400"><CheckCircle className="w-5 h-5" /><span className="font-semibold">Player selected at {formatTime(clickPosition.timestamp)}</span></div> : <div className="flex items-center space-x-2 text-amber-400"><AlertCircle className="w-5 h-5" /><span>Click on {trackedPlayer.name} in the video</span></div>}</div><div className="flex space-x-3"><button onClick={resetUpload} className="px-5 py-2.5 border border-white/20 text-gray-300 rounded-xl font-medium hover:bg-white/5">Cancel</button><button onClick={startAnalysis} disabled={!clickPosition} className={`px-6 py-2.5 rounded-xl font-semibold flex items-center space-x-2 ${clickPosition ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}><Brain className="w-5 h-5" /><span>Start Analysis</span></button></div></div>{error && <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center space-x-2"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}</div>
            </div>
          )}

          {['uploading', 'analyzing'].includes(uploadState) && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12">
              <div className="text-center mb-8">
                <div className="inline-flex p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {uploadState === 'uploading' ? 'Starting Analysis...' : 'Analyzing Video'}
                </h2>
                {trackedPlayer && (
                  <p className="text-emerald-400 mb-2">
                    Tracking: {trackedPlayer.name} (#{trackedPlayer.jerseyNumber || '?'})
                  </p>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="max-w-md mx-auto mb-6">
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div 
                    className="bg-emerald-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                {/* Progress Text */}
                <p className="text-center text-lg font-semibold mb-2 text-white">
                  {progress}% Complete
                </p>
                
                {/* Status Message */}
                <p className="text-center text-gray-400 mb-2">
                  {statusMessage || 'Processing...'}
                </p>
                
                {/* Elapsed Time */}
                <p className="text-center text-sm text-gray-500">
                  Elapsed: {elapsedTime || '0m 0s'}
                </p>
                
                {/* Estimated Time for Long Videos */}
                {progress < 10 && (
                  <p className="text-center text-xs text-gray-400 mt-4">
                    Long videos may take 12-15 minutes to process
                  </p>
                )}
              </div>
            </div>
          )}

          {uploadState === 'complete' && analysisResults && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {trackedPlayer && <JerseyBadge number={trackedPlayer.jerseyNumber || '?'} color={trackedPlayer.jerseyColor} size="lg" />}
                    <div>
                      <div className="flex items-center space-x-2 mb-1"><Sparkles className="w-5 h-5 text-emerald-400" /><h2 className="text-xl font-bold text-white">Analysis Complete!</h2></div>
                      <p className="text-gray-400">Found {analysisResults.decision_points?.length || 0} decisions for {trackedPlayer?.name || 'the tracked player'}. {trackedPlayer && 'This has been saved to their profile.'}</p>
                    </div>
                  </div>
                  <button onClick={resetUpload} className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white border border-white/20 rounded-xl hover:bg-white/5"><RotateCcw className="w-4 h-4" /><span>New Analysis</span></button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-semibold text-white flex items-center space-x-2"><Video className="w-4 h-4 text-emerald-400" /><span>Video Playback</span></h3>
                    {isPlayingClip && <button onClick={stopClip} className="flex items-center space-x-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm"><StopCircle className="w-4 h-4" /><span>Stop</span></button>}
                  </div>
                  <div className="relative bg-black">
                    <video ref={videoRef} src={videoUrl} className="w-full" controls />
                    {isPlayingClip && <div className="absolute top-3 left-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse flex items-center space-x-2"><Play className="w-4 h-4" /><span>10s clip</span></div>}
                  </div>
                  <div className="p-4 bg-white/5"><p className="text-sm text-gray-400">💡 Click any decision point to watch the 10-second clip</p></div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col max-h-[600px]">
                  <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex-shrink-0"><h3 className="font-semibold text-white flex items-center space-x-2"><Brain className="w-4 h-4 text-emerald-400" /><span>Decision Points ({analysisResults.decision_points?.length || 0})</span></h3></div>
                  <div className="p-4 space-y-4 overflow-y-auto flex-1">
                    {analysisResults.decision_points?.length > 0 ? analysisResults.decision_points.map((point, index) => (
                      <DecisionPointCard key={index} point={point} index={index} onPlayClip={(seconds, idx) => { if (isPlayingClip && activeClipIndex === idx) { stopClip(); } else { playClip(seconds, idx); } }} isPlaying={isPlayingClip} isActive={activeClipIndex === index} />
                    )) : <div className="text-center py-8 text-gray-400">No decision points found.</div>}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center space-x-4">
                  {trackedPlayer && (
                    <button onClick={() => { setSelectedPlayerId(trackedPlayer.id); setCurrentPage('playerDetail'); }} className="flex items-center space-x-2 px-4 py-2 text-emerald-400 hover:text-emerald-300">
                      <User className="w-4 h-4" /><span>View {trackedPlayer.name}'s Profile</span>
                    </button>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button onClick={resetUpload} className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white"><RotateCcw className="w-4 h-4" /><span>Analyze Another</span></button>
                  <button onClick={handleExportReport} className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-400 hover:to-amber-500"><Download className="w-4 h-4" /><span>Export Report</span></button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Page Router
  const renderPage = () => {
    switch(currentPage) {
      case 'players': return <PlayersPage />;
      case 'playerDetail': return <PlayerDetailPage />;
      case 'videos': return <VideosPage />;
      case 'assistant': return <AICoachPage />;
      case 'planner': return <SessionPlannerPage />;
      case 'reports': return <ReportsPage />;
      case 'drills': return (<PageWrapper title="Drill Library" showSearch sidebarCollapsed={sidebarCollapsed} searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentPage="drills" setCurrentPage={setCurrentPage}><DrillsPage sessions={sessions} setCurrentPage={setCurrentPage} setSelectedDrillId={setSelectedDrillId} setShowModal={setShowModal} searchQuery={searchQuery} /></PageWrapper>);
      case 'formations': return (
  <PageWrapper title="Formation Creator" sidebarCollapsed={sidebarCollapsed} currentPage="formations" setCurrentPage={setCurrentPage}>
    <FormationCreator 
      teams={teams}
      players={players}
      savedFormations={savedFormations || []}
      onSave={(formation) => {
        setSavedFormations(prev => [...(prev || []), formation]);
        localStorage.setItem('pitchmind_formations_' + user?.id, JSON.stringify([...(savedFormations || []), formation]));
      }}
      onDeleteFormation={(id) => {
        const updated = (savedFormations || []).filter(f => f.id !== id);
        setSavedFormations(updated);
        localStorage.setItem('pitchmind_formations_' + user?.id, JSON.stringify(updated));
      }}
    />
  </PageWrapper>
);
      case 'drillDetail': return (<PageWrapper title="Drill Details" sidebarCollapsed={sidebarCollapsed} currentPage="drillDetail" setCurrentPage={setCurrentPage}><DrillDetailPage drillId={selectedDrillId} onBack={() => setCurrentPage('drills')} sessions={sessions} setSessions={setSessions} setShowModal={setShowModal} setSelectedDrill={setSelectedDrill} /></PageWrapper>);
      case 'stats': return <TeamStatsPage />;
      case 'progress': return <ProgressPage />;
      case 'benchmarks': return <BenchmarksPage />;
      case 'upload': return <UploadPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d]">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} playerCount={players.length} setUploadState={setUploadState} />
      {renderPage()}
      {showModal === 'player' && <AddPlayerModal />}
      {showModal === 'selectPlayer' && <SelectPlayerModal />}
      {showModal === 'session' && <AddSessionModal />}
      {showModal === 'report' && <GenerateReportModal />}
      {showModal === 'addToSession' && <AddToSessionModal />}
      {showModal === 'teamsnapImport' && <TeamSnapImportModal />}
    </div>
  );
}
