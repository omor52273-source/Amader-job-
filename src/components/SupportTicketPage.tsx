import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Inbox, 
  Send, 
  PlusCircle, 
  Search, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  ChevronRight, 
  RefreshCw, 
  CheckCheck, 
  Headphones, 
  X,
  FileText,
  RotateCcw,
  Sparkles,
  Paperclip,
  Smile,
  ThumbsUp,
  Image as ImageIcon,
  Check,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { UserProfile, Language, SupportTicket, SupportTicketMessage, NotificationItem } from '../types';
import { StorageService } from '../lib/storage';
import { FacebookVerifiedBadge } from './FacebookVerifiedBadge';

interface SupportTicketPageProps {
  user: UserProfile;
  language: Language;
  onBack: () => void;
  onAddNotification?: (notification: NotificationItem) => void;
}

export const SupportTicketPage: React.FC<SupportTicketPageProps> = ({
  user,
  language,
  onBack,
  onAddNotification
}) => {
  const isBn = language === 'bn';

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toastAlert, setToastAlert] = useState<{ title: string; message: string; ticketId: string } | null>(null);

  // Form states for creating a new ticket
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('deposit');
  const [priority, setPriority] = useState<SupportTicket['priority']>('medium');
  const [message, setMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Web Audio chime for notification
  const playNotificationChime = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // Audio context error fallback
    }
  };

  // Fetch tickets from API with StorageService fallback
  const fetchTickets = useCallback(async (quiet = false) => {
    if (!quiet) setIsRefreshing(true);
    try {
      const uid = user.uid || user.id || '84920173';
      const res = await fetch(`/api/tickets?user_id=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.tickets) && data.tickets.length > 0) {
          setTickets(prev => {
            // Check if there are newly arrived admin messages
            data.tickets.forEach((t: SupportTicket) => {
              const prevTicket = prev.find(p => p.id === t.id);
              if (prevTicket && t.messages.length > prevTicket.messages.length) {
                const latest = t.messages[t.messages.length - 1];
                if (latest.sender === 'admin') {
                  playNotificationChime();
                  setToastAlert({
                    title: isBn ? `সাপোর্ট টিকিট #${t.id}-এ অ্যাডমিনের উত্তর` : `Admin reply on ticket #${t.id}`,
                    message: latest.message,
                    ticketId: t.id
                  });
                  if (onAddNotification) {
                    onAddNotification({
                      id: `notif_${Date.now()}`,
                      userId: uid,
                      title: `Admin Reply: #${t.id}`,
                      titleBn: `অ্যাডমিন উত্তর: #${t.id}`,
                      message: latest.message.slice(0, 80),
                      messageBn: latest.message.slice(0, 80),
                      type: 'system',
                      timestamp: new Date().toISOString(),
                      isRead: false
                    });
                  }
                }
              }
            });
            return data.tickets;
          });
          StorageService.saveTickets(data.tickets);
          return;
        }
      }
    } catch (e) {
      // API call failed, fallback to local storage
    } finally {
      if (!quiet) setIsRefreshing(false);
    }

    // Fallback: LocalStorage
    const local = StorageService.getTickets();
    if (local && local.length > 0) {
      setTickets(local);
    }
  }, [user.uid, user.id, isBn, onAddNotification]);

  // Initial fetch
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Select first ticket on desktop if none selected
  useEffect(() => {
    if (tickets.length > 0 && !selectedTicketId && window.innerWidth >= 1024 && !isCreatingTicket) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId, isCreatingTicket]);

  // Periodic polling every 6 seconds for real-time live Messenger chat updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTickets(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedTicketId, tickets]);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // Mark ticket as read by user when opened
  const handleSelectTicket = async (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsCreatingTicket(false);

    setTickets(prev => {
      const updated = prev.map(t => {
        if (t.id === ticketId && t.unreadByUser) {
          return { ...t, unreadByUser: false };
        }
        return t;
      });
      StorageService.saveTickets(updated);
      return updated;
    });

    try {
      await fetch(`/api/tickets/messages?ticket_id=${encodeURIComponent(ticketId)}`);
    } catch (e) {}
  };

  // 1. Create a new support ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSending(true);
    const uid = user.uid || user.id || '84920173';

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          userName: user.name,
          userEmail: user.email || 'user@amaderjob.com',
          userPhone: user.phone || '01XXXXXXXXX',
          subject: subject.trim(),
          category,
          priority,
          message: message.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.ticket) {
          const newTicket = data.ticket;
          setTickets(prev => [newTicket, ...prev]);
          StorageService.saveTickets([newTicket, ...tickets]);
          setSubject('');
          setMessage('');
          setIsCreatingTicket(false);
          setSelectedTicketId(newTicket.id);
          setIsSending(false);
          return;
        }
      }
    } catch (err) {}

    // Fallback if offline
    const ticketId = `TCK-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();
    const fallbackTicket: SupportTicket = {
      id: ticketId,
      userId: uid,
      userName: user.name,
      userEmail: user.email || 'user@amaderjob.com',
      userPhone: user.phone || '01XXXXXXXXX',
      subject: subject.trim(),
      category,
      priority,
      status: 'open',
      createdAt: now,
      updatedAt: now,
      unreadByUser: false,
      unreadByAdmin: true,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'user',
          senderName: user.name,
          message: message.trim(),
          timestamp: now
        }
      ]
    };

    const updated = [fallbackTicket, ...tickets];
    setTickets(updated);
    StorageService.saveTickets(updated);
    setSubject('');
    setMessage('');
    setIsCreatingTicket(false);
    setSelectedTicketId(fallbackTicket.id);
    setIsSending(false);
  };

  // 2. Send user message in conversation
  const handleSendReply = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = (customText || replyMessage).trim();
    if (!text || !selectedTicket) return;

    setReplyMessage('');

    const now = new Date().toISOString();
    const newMsg: SupportTicketMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: user.name,
      message: text,
      timestamp: now
    };

    // Optimistic UI update
    setTickets(prev => {
      const updated = prev.map(t => {
        if (t.id === selectedTicket.id) {
          return {
            ...t,
            status: t.status === 'closed' ? 'open' : t.status,
            updatedAt: now,
            unreadByUser: false,
            unreadByAdmin: true,
            messages: [...t.messages, newMsg]
          };
        }
        return t;
      });
      StorageService.saveTickets(updated);
      return updated;
    });

    try {
      await fetch('/api/tickets/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          sender: 'user',
          sender_name: user.name,
          message: text
        })
      });
    } catch (e) {}
  };

  // 3. Update ticket status (e.g. resolve or reopen)
  const handleUpdateStatus = async (ticketId: string, newStatus: SupportTicket['status']) => {
    const now = new Date().toISOString();
    setTickets(prev => {
      const updated = prev.map(t => {
        if (t.id === ticketId) {
          return { ...t, status: newStatus, updatedAt: now };
        }
        return t;
      });
      StorageService.saveTickets(updated);
      return updated;
    });

    try {
      await fetch('/api/tickets/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId, status: newStatus })
      });
    } catch (e) {}
  };

  // Quick reply options for user
  const quickReplies = isBn
    ? ['👍 ধন্যবাদ, সমাধান হয়েছে', '💳 ট্রানজেকশন আইডি পাঠিয়েছি', '⏳ অনুগ্রহ করে একটু দ্রুত দেখুন', '❓ আরও বিস্তারিত তথ্য জানা প্রয়োজন']
    : ['👍 Thank you, issue resolved', '💳 Transaction ID sent', '⏳ Please check as soon as possible', '❓ Need further assistance'];

  // Filtered tickets
  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'in_progress') {
      if (ticket.status !== 'in_progress' && ticket.status !== 'open') return false;
    } else if (activeTab === 'resolved') {
      if (ticket.status !== 'resolved' && ticket.status !== 'closed') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubject = ticket.subject.toLowerCase().includes(q);
      const matchId = ticket.id.toLowerCase().includes(q);
      const matchContent = ticket.messages?.some(m => m.message.toLowerCase().includes(q));
      return matchSubject || matchId || matchContent;
    }

    return true;
  });

  const getCategoryLabel = (cat: SupportTicket['category']) => {
    switch (cat) {
      case 'deposit': return isBn ? 'ডিপোজিট সমস্যা' : 'Deposit';
      case 'withdrawal': return isBn ? 'উত্তোলন / পেমেন্ট' : 'Withdrawal';
      case 'job_issue': return isBn ? 'কাজের সমস্যা' : 'Job Issue';
      case 'task_approval': return isBn ? 'টাস্ক অনুমোদন' : 'Task Approval';
      case 'account_2fa': return isBn ? 'একাউন্ট ও টু-ফ্যাক্টর' : 'Account & 2FA';
      default: return isBn ? 'সাধারণ সহায়তা' : 'General Support';
    }
  };

  const getPriorityBadge = (p: SupportTicket['priority']) => {
    switch (p) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black border border-rose-500/20">অতীব জরুরি</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black border border-amber-500/20">উচ্চ</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black border border-blue-500/20">সাধারণ</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 text-[10px] font-bold border border-slate-500/20">নিম্ন</span>;
    }
  };

  const getStatusBadge = (s: SupportTicket['status']) => {
    switch (s) {
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            {isBn ? 'প্রসেসিং হচ্ছে' : 'In Progress'}
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            {isBn ? 'সমাধান হয়েছে' : 'Resolved'}
          </span>
        );
      case 'closed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 text-[11px] font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {isBn ? 'বন্ধ' : 'Closed'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-500" />
            {isBn ? 'ওপেন' : 'Open'}
          </span>
        );
    }
  };

  const formatMessageTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatTicketDate = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Check if admin has replied or joined
  const hasAdminJoined = selectedTicket ? selectedTicket.messages.some(m => m.sender === 'admin') : false;

  return (
    <div className={isFullscreen 
      ? "fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 p-2 sm:p-4 flex flex-col h-screen w-screen overflow-hidden" 
      : "w-full max-w-7xl mx-auto flex flex-col h-[calc(100dvh-72px)] sm:h-[calc(100dvh-82px)] gap-2 sm:gap-3"
    }>
      
      {/* Toast Alert Banner for Admin Reply */}
      {toastAlert && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in slide-in-from-top-3 duration-300">
          <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-2xl border border-emerald-500/40 flex items-start gap-3 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{toastAlert.title}</span>
                </h4>
                <button 
                  onClick={() => setToastAlert(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-200 mt-1 line-clamp-2 leading-relaxed">
                {toastAlert.message}
              </p>
              <button
                onClick={() => {
                  handleSelectTicket(toastAlert.ticketId);
                  setToastAlert(null);
                }}
                className="mt-2 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
              >
                <span>{isBn ? 'লাইভ চ্যাট খুলুন' : 'Open Live Chat'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-sm shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title={isBn ? 'ফিরে যান' : 'Back'}
            >
              <ArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>LIVE MESSENGER CHAT</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">• {isBn ? '২৪/৭ অফিসিয়াল সাপোর্ট' : '24/7 Official Support'}</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 mt-0.5">
                <span>{isBn ? 'সাপোর্ট টিকিট ও লাইভ হেল্পডেস্ক' : 'Support Tickets & Live Helpdesk'}</span>
                <FacebookVerifiedBadge size="sm" />
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title={isFullscreen ? (isBn ? 'স্বাভাবিক ভিউ' : 'Exit Full Screen') : (isBn ? 'ফুল স্ক্রিন' : 'Full Screen')}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
              <span className="hidden md:inline">{isFullscreen ? (isBn ? 'ছোট করুন' : 'Exit') : (isBn ? 'ফুল স্ক্রিন' : 'Full Screen')}</span>
            </button>

            <button
              type="button"
              onClick={() => fetchTickets()}
              disabled={isRefreshing}
              className="p-2 sm:p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title={isBn ? 'রিফ্রেশ করুন' : 'Refresh Tickets'}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden md:inline">{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
            </button>

            <button
              id="compose-ticket-btn"
              onClick={() => {
                setIsCreatingTicket(true);
                setSelectedTicketId(null);
              }}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isBn ? '+ নতুন টিকিট' : '+ New Ticket'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Messenger-style layout */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 w-full h-full">
        
        {/* Left Column: Tickets Inbox & List (4 cols on lg) */}
        <div className={`lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm h-full min-h-0 ${selectedTicketId || isCreatingTicket ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Inbox Header & Search */}
          <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-slate-800 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Inbox className="w-3.5 h-3.5" />
                </div>
                <span>{isBn ? 'আপনার টিকিটসমূহ' : 'Conversations'}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                {tickets.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'টিকিট আইডি বা বিষয় খুঁজুন...' : 'Search conversation or ID...'}
                className="w-full pl-9.5 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden dark:text-white transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1.5 text-[11px] font-black rounded-xl transition ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {isBn ? 'সকল' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('in_progress')}
                className={`flex-1 py-1.5 text-[11px] font-black rounded-xl transition ${
                  activeTab === 'in_progress'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {isBn ? 'চলমান' : 'Active'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('resolved')}
                className={`flex-1 py-1.5 text-[11px] font-black rounded-xl transition ${
                  activeTab === 'resolved'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {isBn ? 'সমাধান' : 'Resolved'}
              </button>
            </div>
          </div>

          {/* Tickets Scroll List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-500">{isBn ? 'কোনো সাপোর্ট টিকিট পাওয়া যায়নি' : 'No conversations found'}</p>
                <button
                  type="button"
                  onClick={() => setIsCreatingTicket(true)}
                  className="mt-3 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {isBn ? '+ একটি নতুন টিকিট খুলুন' : '+ Create a new ticket'}
                </button>
              </div>
            ) : (
              filteredTickets.map(ticket => {
                const isSelected = ticket.id === selectedTicketId;
                const lastMsg = ticket.messages[ticket.messages.length - 1];
                const isAdminLast = lastMsg?.sender === 'admin';

                return (
                  <button
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket.id)}
                    className={`w-full text-left p-4 transition cursor-pointer flex flex-col gap-1.5 relative ${
                      isSelected
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-l-4 border-l-emerald-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            <Headphones className="w-4 h-4" />
                          </div>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -bottom-0.5 -right-0.5"></span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1 truncate">
                            <span className="font-mono text-emerald-600 dark:text-emerald-400">#{ticket.id}</span>
                            {ticket.unreadByUser && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-ping"></span>
                            )}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {getCategoryLabel(ticket.category)}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {formatTicketDate(ticket.updatedAt)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                      {ticket.subject}
                    </h4>

                    {lastMsg && (
                      <p className={`text-[11px] truncate flex items-center gap-1.5 ${isAdminLast ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                        {isAdminLast ? <Headphones className="w-3 h-3 shrink-0 text-emerald-500" /> : <CheckCheck className="w-3 h-3 shrink-0 text-slate-400" />}
                        <span className="truncate">{lastMsg.message}</span>
                      </p>
                    )}

                    <div className="flex items-center justify-end mt-1">
                      {getStatusBadge(ticket.status)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Messenger Conversation View or Compose Form (8 cols on lg) */}
        <div className={`lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm h-full min-h-0 ${!selectedTicketId && !isCreatingTicket ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* View Mode 1: Creating a New Ticket */}
          {isCreatingTicket ? (
            <div className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {isBn ? 'নতুন সাপোর্ট টিকিট ও লাইভ চ্যাট' : 'Open Support Ticket & Live Chat'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isBn ? 'আমাদের অফিসিয়াল সাপোর্ট টিম সরাসরি আপনার চ্যাটে যুক্ত হবেন' : 'Our official support specialists will join the chat promptly'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingTicket(false)}
                  className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'টিকিটের বিষয় (Subject)' : 'Ticket Subject'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder={isBn ? 'যেমন: বিকাশ ডিপোজিট ব্যালেন্সে যোগ হয়নি (TrxID BK...)' : 'e.g. Deposit not credited via bKash'}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                      {isBn ? 'সমস্যার ক্যাটাগরি' : 'Category'}
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                      className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold dark:text-white"
                    >
                      <option value="deposit">{isBn ? 'ডিপোজিট সমস্যা (Deposit)' : 'Deposit Issue'}</option>
                      <option value="withdrawal">{isBn ? 'উত্তোলন ও পেমেন্ট (Withdrawal)' : 'Withdrawal Issue'}</option>
                      <option value="task_approval">{isBn ? 'টাস্ক অনুমোদন (Task Approval)' : 'Task Approval'}</option>
                      <option value="job_issue">{isBn ? 'কাজের সমস্যা (Job Issue)' : 'Job Issue'}</option>
                      <option value="account_2fa">{isBn ? 'একাউন্ট বা পাসওয়ার্ড (Account/2FA)' : 'Account & 2FA'}</option>
                      <option value="other">{isBn ? 'অন্যান্য সাহায্য (Other)' : 'Other Support'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                      {isBn ? 'অগ্রাধিকার (Priority)' : 'Priority'}
                    </label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as any)}
                      className="w-full px-3.5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-bold dark:text-white"
                    >
                      <option value="low">{isBn ? 'সাধারণ (Low)' : 'Low'}</option>
                      <option value="medium">{isBn ? 'মাঝারি (Medium)' : 'Medium'}</option>
                      <option value="high">{isBn ? 'উচ্চ (High)' : 'High'}</option>
                      <option value="urgent">{isBn ? 'অতীব জরুরি (Urgent)' : 'Urgent'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'বিস্তারিত বার্তা (Message)' : 'Detailed Message'} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={isBn ? 'আপনার সমস্যার বিস্তারিত লিখুন (যেমন: পেমেন্ট নম্বর, TrxID, তারিখ ইত্যাদি)...' : 'Describe your issue in detail (account number, TrxID, timestamps, etc.)...'}
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden dark:text-white leading-relaxed resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingTicket(false)}
                    className="px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSending ? (isBn ? 'শুরু হচ্ছে...' : 'Starting...') : (isBn ? 'লাইভ চ্যাট শুরু করুন' : 'Start Live Chat')}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : selectedTicket ? (
            
            // View Mode 2: Modern Messenger Live Chat Interface
            <div className="flex flex-col h-full min-h-0 flex-1 overflow-hidden">
              
              {/* Messenger Header Bar */}
              <div className="p-3 sm:p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md shrink-0">
                
                {/* Back to list button on mobile */}
                <button
                  type="button"
                  onClick={() => setSelectedTicketId(null)}
                  className="lg:hidden p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                {/* Agent / Room Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-white flex items-center justify-center font-black shadow-md shadow-emerald-500/20 shrink-0">
                      <Headphones className="w-4 sm:w-5 h-4 sm:h-5" />
                    </div>
                    <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 absolute -bottom-0.5 -right-0.5 shadow-sm"></span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                        Amader Job Support
                      </h3>
                      <FacebookVerifiedBadge size="sm" />
                      <span className="font-mono text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-md">
                        #{selectedTicket.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {hasAdminJoined ? (isBn ? 'অ্যাডমিন যুক্ত আছেন (Active)' : 'Admin Online & Active') : (isBn ? 'অফিসিয়াল হেল্পডেস্ক (Active)' : 'Active Helpdesk')}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate hidden sm:inline">• {selectedTicket.subject}</span>
                    </div>
                  </div>
                </div>

                {/* Status action toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  {selectedTicket.status === 'resolved' || selectedTicket.status === 'closed' ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'open')}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black hover:bg-emerald-500/20 flex items-center gap-1 cursor-pointer transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isBn ? 'রি-ওপেন' : 'Re-open'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="hidden sm:inline">{isBn ? 'সমাধান হয়েছে' : 'Mark Resolved'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Messenger Chat Body */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-5 space-y-3.5 bg-slate-50/40 dark:bg-slate-950/40">
                
                {/* 1. Official Helpdesk Conversation Header Pill */}
                <div className="flex flex-col items-center justify-center gap-1.5 py-2">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{isBn ? 'অফিসিয়াল সিকিউর হেল্পডেস্ক চ্যাট' : 'Official Encrypted Helpdesk'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatTicketDate(selectedTicket.createdAt)}
                  </span>
                </div>

                {/* 2. Admin Joined Live Banner Pill (Requested by user) */}
                {hasAdminJoined && (
                  <div className="flex justify-center my-3 animate-in fade-in zoom-in-95 duration-300">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <Headphones className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{isBn ? '🟢 অ্যাডমিন সাপোর্ট স্পেশালিস্ট চ্যাটে যুক্ত হয়েছেন' : '🟢 Admin Support Agent has joined the chat'}</span>
                    </div>
                  </div>
                )}

                {/* 3. Messages Flow (Messenger-style Rounded Bubbles) */}
                {selectedTicket.messages.map((msg, idx) => {
                  const isAdmin = msg.sender === 'admin';

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex gap-2.5 items-end ${isAdmin ? 'justify-start' : 'justify-end'} group`}
                    >
                      {/* Admin Avatar on Left */}
                      {isAdmin && (
                        <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20 mb-1">
                          <Headphones className="w-4 h-4" />
                        </div>
                      )}

                      <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isAdmin ? 'items-start' : 'items-end'}`}>
                        
                        {/* Sender Label */}
                        <div className="text-[10px] font-bold text-slate-400 mb-1 px-1 flex items-center gap-1">
                          {isAdmin ? (
                            <>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Amader Job Support</span>
                              <FacebookVerifiedBadge size="sm" />
                            </>
                          ) : (
                            <span>{user.name}</span>
                          )}
                        </div>

                        {/* Messenger Styled Speech Bubble */}
                        <div
                          className={`p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                            isAdmin
                              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700/80 rounded-3xl rounded-bl-sm shadow-sm'
                              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl rounded-br-sm shadow-md shadow-emerald-600/15 font-medium'
                          }`}
                        >
                          {msg.message}
                        </div>

                        {/* Timestamp & Status Icon */}
                        <div className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                          <span>{formatMessageTime(msg.timestamp)}</span>
                          {!isAdmin && <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />}
                        </div>
                      </div>

                      {/* User Avatar on Right */}
                      {!isAdmin && (
                        <div className="w-8 h-8 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 font-black text-xs mb-1 shadow-2xs">
                          {user.name ? user.name[0].toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Messenger Floating Action Bar */}
              <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md space-y-2.5">
                
                {selectedTicket.status === 'resolved' || selectedTicket.status === 'closed' ? (
                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-center text-xs text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{isBn ? 'এই চ্যাটটি সমাধান হয়েছে। পুনরায় কথা বলতে "রি-ওপেন" ক্লিক করুন।' : 'This chat is marked resolved. Click Re-open to send a message.'}</span>
                  </div>
                ) : (
                  <>
                    {/* Quick Response Chips */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {quickReplies.map((chip, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setReplyMessage(chip)}
                          className="shrink-0 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-all border border-transparent hover:border-emerald-500/20 active:scale-95"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    {/* Messenger Chat Input Bar */}
                    <form onSubmit={handleSendReply} className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                        <textarea
                          rows={1}
                          value={replyMessage}
                          onChange={e => setReplyMessage(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply(e);
                            }
                          }}
                          placeholder={isBn ? 'একটি মেসেজ লিখুন (Enter চেপে পাঠান)...' : 'Type a message...'}
                          className="flex-1 py-2 bg-transparent text-xs sm:text-sm focus:outline-hidden dark:text-white leading-relaxed resize-none max-h-24"
                        />

                        {/* Quick Thumbs Up / Reaction Button */}
                        {!replyMessage.trim() && (
                          <button
                            type="button"
                            onClick={() => handleSendReply(undefined, '👍')}
                            className="p-2 text-emerald-500 hover:text-emerald-600 transition cursor-pointer active:scale-110"
                            title="Send Thumbs Up"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Send Action Button */}
                      <button
                        type="submit"
                        disabled={!replyMessage.trim()}
                        className="w-11 h-11 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-emerald-500/20 shrink-0 flex items-center justify-center active:scale-95"
                        title={isBn ? 'মেসেজ পাঠান' : 'Send Message'}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          ) : (
            // Empty Selection State
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-inner">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                {isBn ? 'একটি লাইভ চ্যাট নির্বাচন করুন' : 'Select a conversation'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                {isBn ? 'বাম পাশের তালিকা থেকে একটি টিকিট নির্বাচন করুন অথবা নতুন চ্যাট শুরু করুন।' : 'Choose a ticket from the left panel to view conversation or start a new live chat.'}
              </p>
              <button
                type="button"
                onClick={() => setIsCreatingTicket(true)}
                className="mt-5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 transition active:scale-95"
              >
                {isBn ? '+ নতুন লাইভ চ্যাট শুরু করুন' : '+ Start New Live Chat'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

