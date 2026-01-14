import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import { Upload, CheckCircle, AlertCircle, Loader2, Clock, Brain, Video, Zap, MousePointer, Target, Sparkles, Award, RotateCcw, Share2, Download, Save, Plus, X, ChevronRight, ChevronLeft, Home, Users, FileVideo, Lightbulb, Clipboard, FileText, BookOpen, BarChart3, TrendingUp, Bell, Settings, Search, Calendar, Edit, Trash2, Eye, PlayCircle, Send, Timer, ArrowUp, ArrowDown, ArrowRight, Play, Pause, StopCircle, User, Hash, Palette, Link2, RefreshCw, Check, Database, Tag } from 'lucide-react';
import logo from './assets/logo.png';
import DrillDetailPage from './DrillDetailPage';
import FormationCreator from './Formationcreator';
import DrillsPage from './DrillsPage';
import { drillsData } from './DrillData';
import ManualTaggingPage from './ManualTaggingPage';

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
        <SidebarItem icon={Tag} label="Manual Tagging" active={currentPage === 'manualTagging'} onClick={() => setCurrentPage('manualTagging')} badge="New" />
        <SidebarItem icon={Lightbulb} label="AI Coach" active={currentPage === 'assistant'} onClick={() => setCurrentPage('assistant')} />
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
  
  // Manual tagging state
  const [taggedGames, setTaggedGames] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [gamePlayers, setGamePlayers] = useState([]);
  const [gameEvents, setGameEvents] = useState([]);
  const [gameInsights, setGameInsights] = useState([]);
  
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
  const gameVideoRef = useRef(null);

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
    setTaggedGames(loadFromStorage('tagged_games', user.id, []));
    
    // Then sync from database (authoritative)
    if (!dataSynced) {
      syncDataFromDB(false);
    }
  }
}, [user?.id, dataSynced]);

  const syncDataFromDB = async (forceRefresh = false) => {
    if (!user?.id) return;
    if (!forceRefresh && dataSynced) return;
    
    setDataLoading(true);
    try {
      const data = await apiCall('/api/sync', user.id);
      setUserProfile(data.user);
      
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
      
      if (data.taggedGames && data.taggedGames.length > 0) {
        setTaggedGames(data.taggedGames);
      }
      
      setDataSynced(true);
      console.log('✅ Data synced from database');
    } catch (err) {
      console.warn('Database sync failed, using local data:', err.message);
      setDataSynced(true);
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
  useEffect(() => { if (user?.id) saveToStorage('tagged_games', user.id, taggedGames); }, [taggedGames, user?.id]);

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
    
    const existingTeam = teams.find(t => 
      String(t.teamsnapId) === String(teamInfo?.id) || 
      String(t.teamsnap_id) === String(teamInfo?.id) ||
      String(t.id) === String(teamInfo?.id)
    );
    
    const localTeam = existingTeam || {
      id: teamInfo?.id || Date.now(),
      name: teamInfo?.name || 'Imported Team',
      divisionName: teamInfo?.divisionName,
      seasonName: teamInfo?.seasonName,
      teamsnapId: String(teamInfo?.id),
      source: 'teamsnap'
    };
    
    if (!existingTeam && teamInfo) {
      setTeams(prev => [...prev, localTeam]);
    }
    
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
    
    if (newPlayers.length > 0) {
      setPlayers(prev => [...prev, ...newPlayers]);
    }
    
    console.log(`✅ Imported ${newPlayers.length} players locally`);
    
    if (user?.id && teamInfo) {
      try {
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
  // MODALS (AddPlayerModal, SelectPlayerModal, AddSessionModal, etc.)
  // I'll abbreviate these for space - they're identical to what you had
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
      
      if (editingItem) {
        setPlayers(players.map(p => p.id === editingItem.id ? { ...p, ...playerData } : p));
      } else {
        setPlayers(prev => [...prev, playerData]);
      }
      
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
    const [mode, setMode] = useState('existing');
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
        age: 0,
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

  // I'll skip the other modals (AddSessionModal, GenerateReportModal, etc.) for space
  // They're identical to what you had. Just add them back from your original file.

  // ============================================
  // PAGES - I'll include the full Dashboard and Manual Tagging pages
  // Other pages (PlayersPage, VideosPage, etc.) are identical to what you had
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
      
      <div onClick={() => setCurrentPage('manualTagging')} className="group bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-3xl p-8 cursor-pointer hover:border-blue-500/50 transition-all mb-8">
        <div className="flex items-center justify-between">
          <div><div className="flex items-center space-x-2 mb-3"><Tag className="w-6 h-6 text-blue-400" /><span className="font-bold text-lg text-blue-400">Manual Game Tagging</span><span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">NEW</span></div><h2 className="text-2xl font-bold text-white mb-3">Tag events while watching games</h2><p className="text-gray-400 mb-6 max-w-lg">Upload full games, manually tag players and events, then let AI analyze patterns.</p><button className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg shadow-blue-500/25"><Tag className="w-5 h-5" /><span>Start Tagging</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></button></div>
          <div className="hidden lg:block"><div className="w-40 h-40 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform"><FileVideo className="w-16 h-16 text-blue-400" /></div></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => setCurrentPage('players')} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition-all cursor-pointer group"><div className="flex items-center justify-between mb-4"><div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Users className="w-6 h-6 text-emerald-400" /></div>{players.length === 0 && <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded">Setup needed</span>}</div><div className="text-3xl font-bold text-white mb-1">{players.length}</div><div className="text-gray-500 text-sm group-hover:text-gray-300">Players</div></div>
        <div onClick={() => setCurrentPage('videos')} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all cursor-pointer group"><div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4"><FileVideo className="w-6 h-6 text-amber-400" /></div><div className="text-3xl font-bold text-white mb-1">{videos.length}</div><div className="text-gray-500 text-sm group-hover:text-gray-300">Videos Analyzed</div></div>
        <div onClick={() => setCurrentPage('manualTagging')} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all cursor-pointer group"><div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4"><Tag className="w-6 h-6 text-blue-400" /></div><div className="text-3xl font-bold text-white mb-1">{taggedGames.length}</div><div className="text-gray-500 text-sm group-hover:text-gray-300">Tagged Games</div></div>
      </div>
      {players.length === 0 && <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-2xl"><h3 className="font-bold text-white mb-2">🚀 Quick Start Guide</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"><button onClick={() => setShowModal('player')} className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-emerald-500/30 transition-all"><div className="flex items-center space-x-3 mb-2"><div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">1</div><span className="font-medium text-white">Add Your Players</span></div><p className="text-gray-400 text-sm">Include jersey numbers & colors.</p></button><button onClick={() => { setCurrentPage('upload'); setUploadState('idle'); }} className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-emerald-500/30 transition-all"><div className="flex items-center space-x-3 mb-2"><div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">2</div><span className="font-medium text-white">Upload a Video</span></div><p className="text-gray-400 text-sm">Track specific players.</p></button><button onClick={() => setCurrentPage('manualTagging')} className="p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-blue-500/30 transition-all"><div className="flex items-center space-x-3 mb-2"><div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">3</div><span className="font-medium text-white">Tag a Game</span></div><p className="text-gray-400 text-sm">Manual event tagging.</p></button></div></div>}
    </PageWrapper>
  );

  // ============================================
  // MANUAL TAGGING PAGE
  // ============================================
  
  const ManualTaggingPage = () => {
    const [uploadingGame, setUploadingGame] = useState(false);
    const [taggingMode, setTaggingMode] = useState(false);
    const [analyzingGame, setAnalyzingGame] = useState(false);
    const gameUploadInputRef = useRef(null);
    
    const handleUploadGame = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setUploadingGame(true);
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('date', new Date().toISOString().split('T')[0]);
      
      try {
        const response = await fetch(`${API_BASE}/api/tagged-games`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.id}`
          },
          body: formData
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const result = await response.json();
        setTaggedGames([result, ...taggedGames]);
        setCurrentGame(result);
        setGameEvents([]);
        setGameInsights([]);
        setTaggingMode(true);
      } catch (err) {
        alert('Upload failed: ' + err.message);
      }
      setUploadingGame(false);
    };
    
    const addEventTag = async (eventType) => {
      if (!gameVideoRef.current || !currentGame) return;
      const timestamp = gameVideoRef.current.currentTime;
      
      try {
        const response = await fetch(`${API_BASE}/api/tagged-games/${currentGame.id}/events`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.id}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            gamePlayerId: null,
            timestamp,
            eventType,
            notes: ''
          })
        });
        
        if (!response.ok) throw new Error('Failed to add tag');
        
        const event = await response.json();
        setGameEvents([...gameEvents, event]);
        
        // Update tags count in local state
        setTaggedGames(prev => prev.map(g => 
          g.id === currentGame.id ? { ...g, tags_count: (g.tags_count || 0) + 1 } : g
        ));
        setCurrentGame(prev => ({ ...prev, tags_count: (prev.tags_count || 0) + 1 }));
      } catch (err) {
        alert('Failed to add tag: ' + err.message);
      }
    };
    
    const deleteEventTag = async (eventId) => {
      if (!window.confirm('Delete this tag?')) return;
      
      try {
        await fetch(`${API_BASE}/api/tagged-games/${currentGame.id}/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.id}`
          }
        });
        
        setGameEvents(gameEvents.filter(e => e.id !== eventId));
        setTaggedGames(prev => prev.map(g => 
          g.id === currentGame.id ? { ...g, tags_count: Math.max(0, (g.tags_count || 1) - 1) } : g
        ));
        setCurrentGame(prev => ({ ...prev, tags_count: Math.max(0, (prev.tags_count || 1) - 1) }));
      } catch (err) {
        alert('Failed to delete tag');
      }
    };
    
    const analyzeGame = async () => {
      if (!currentGame || gameEvents.length === 0) {
        alert('Add some event tags before analyzing');
        return;
      }
      
      setAnalyzingGame(true);
      try {
        const response = await fetch(`${API_BASE}/api/tagged-games/${currentGame.id}/analyze`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.id}`
          }
        });
        
        if (!response.ok) throw new Error('Analysis failed');
        
        const result = await response.json();
        setGameInsights(result.insights || []);
        setCurrentGame(prev => ({ ...prev, analyzed: true }));
        setTaggedGames(prev => prev.map(g => 
          g.id === currentGame.id ? { ...g, analyzed: true } : g
        ));
      } catch (err) {
        alert('AI analysis failed: ' + err.message);
      }
      setAnalyzingGame(false);
    };
    
    const loadGameData = async (game) => {
      setCurrentGame(game);
      setTaggingMode(true);
      
      try {
        const response = await fetch(`${API_BASE}/api/tagged-games/${game.id}`, {
          headers: {
            'Authorization': `Bearer ${user.id}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to load game data');
        
        const data = await response.json();
        setGameEvents(data.events || []);
        setGameInsights(data.insights || []);
      } catch (err) {
        console.error('Failed to load game data:', err);
      }
    };
    
    const deleteGame = async (gameId) => {
      if (!window.confirm('Delete this tagged game?')) return;
      
      try {
        await fetch(`${API_BASE}/api/tagged-games/${gameId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.id}`
          }
        });
        
        setTaggedGames(prev => prev.filter(g => g.id !== gameId));
        if (currentGame?.id === gameId) {
          setCurrentGame(null);
          setTaggingMode(false);
        }
      } catch (err) {
        alert('Failed to delete game');
      }
    };
    
    return (
      <PageWrapper title="Manual Tagging" sidebarCollapsed={sidebarCollapsed} currentPage="manualTagging" setCurrentPage={setCurrentPage}>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Manual Game Tagging</h2>
          <p className="text-gray-400">Upload game footage, tag players and events while watching, then let AI analyze patterns.</p>
        </div>
        
        {!taggingMode ? (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <input 
                type="file" 
                accept="video/*" 
                onChange={handleUploadGame} 
                className="hidden" 
                id="game-upload" 
                ref={gameUploadInputRef}
              />
              <label htmlFor="game-upload" className="flex flex-col items-center cursor-pointer">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                  {uploadingGame ? <Loader2 className="w-8 h-8 text-blue-400 animate-spin" /> : <Upload className="w-8 h-8 text-blue-400" />}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Upload Game Video</h3>
                <p className="text-gray-400 mb-4">Click to select a full game or match footage</p>
                {uploadingGame && <p className="text-blue-400 text-sm">Uploading...</p>}
              </label>
            </div>
            
            {taggedGames.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Your Tagged Games</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {taggedGames.map(game => (
                    <div key={game.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 cursor-pointer" onClick={() => loadGameData(game)}>{game.title}</h4>
                          <p className="text-gray-400 text-sm mb-2">{game.date}</p>
                          <div className="flex items-center space-x-2">
                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-semibold">{game.tags_count || 0} tags</span>
                            {game.analyzed && <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-semibold">✓ Analyzed</span>}
                          </div>
                        </div>
                        <button onClick={() => deleteGame(game.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button onClick={() => loadGameData(game)} className="w-full py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 font-medium text-sm">
                        Open & Tag
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{currentGame?.title}</h3>
                <p className="text-gray-400 text-sm">{currentGame?.date} • {gameEvents.length} events tagged</p>
              </div>
              <button onClick={() => { setTaggingMode(false); setCurrentGame(null); }} className="text-gray-400 hover:text-white flex items-center space-x-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Back to list</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video Player */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <video ref={gameVideoRef} src={currentGame?.video_url} className="w-full" controls />
                <div className="p-4">
                  <h4 className="text-white font-semibold mb-3">Tag Event</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => addEventTag('pass')} className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm font-medium">Pass</button>
                    <button onClick={() => addEventTag('shot')} className="px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 text-sm font-medium">Shot</button>
                    <button onClick={() => addEventTag('tackle')} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm font-medium">Tackle</button>
                    <button onClick={() => addEventTag('turnover')} className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 text-sm font-medium">Turnover</button>
                    <button onClick={() => addEventTag('goal')} className="px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 text-sm font-medium">Goal</button>
                    <button onClick={() => addEventTag('dribble')} className="px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 text-sm font-medium">Dribble</button>
                  </div>
                </div>
              </div>
              
              {/* Tagged Events & Insights */}
              <div className="space-y-4">
                {/* Events List */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-white">Tagged Events ({gameEvents.length})</h4>
                    {gameEvents.length > 0 && (
                      <button 
                        onClick={analyzeGame} 
                        disabled={analyzingGame}
                        className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 text-white rounded-lg text-sm font-semibold"
                      >
                        {analyzingGame ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /><span>Analyzing...</span></>
                        ) : (
                          <><Brain className="w-4 h-4" /><span>AI Analyze</span></>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {gameEvents.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No events tagged yet. Play the video and click buttons to tag events.</p>
                      </div>
                    ) : (
                      gameEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg group">
                          <div className="flex-1">
                            <span className="text-white font-medium capitalize">{event.event_type}</span>
                            <span className="text-gray-400 text-sm ml-2">{formatTime(event.timestamp)}</span>
                          </div>
                          <button onClick={() => deleteEventTag(event.id)} className="p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* AI Insights */}
                {gameInsights.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      <span>AI Insights</span>
                    </h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {gameInsights.map((insight, i) => (
                        <div key={i} className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">
                            {insight.insight_type}
                          </p>
                          <p className="text-gray-300 text-sm">{insight.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </PageWrapper>
    );
  };

  // ============================================
  // OTHER PAGES (abbreviated for space)
  // Include PlayersPage, VideosPage, AICoachPage, etc. from your original file
  // They're identical to what you had
  // ============================================

  // Page Router
  const renderPage = () => {
    switch(currentPage) {
        case 'manualTagging': 
  return (
    <ManualTaggingPage 
      user={user}
      sidebarCollapsed={sidebarCollapsed}
      setCurrentPage={setCurrentPage}
      taggedGames={taggedGames}
      setTaggedGames={setTaggedGames}
    />
  );
      case 'manualTagging': return <ManualTaggingPage />;
      // Add all your other pages here...
      // case 'players': return <PlayersPage />;
      // case 'videos': return <VideosPage />;
      // etc.
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d]">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} playerCount={players.length} setUploadState={setUploadState} />
      {renderPage()}
      {showModal === 'player' && <AddPlayerModal />}
      {showModal === 'selectPlayer' && <SelectPlayerModal />}
      {/* Add other modals here */}
    </div>
  );
}
