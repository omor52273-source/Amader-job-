import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mail, 
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
  User as UserIcon, 
  CheckCheck, 
  Headphones, 
  X,
  FileText,
  RotateCcw,
  Sparkles
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

  // Periodic polling every 8 seconds for live Messenger chat updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTickets(true);
    }, 8000);
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
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    const text = replyMessage.trim();
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
        return <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-200">অতীব জরুরি</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-200">উচ্চ</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black border border-blue-200">সাধারণ</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">নিম্ন</span>;
    }
  };

  const getStatusBadge = (s: SupportTicket['status']) => {
    switch (s) {
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            {isBn ? 'প্রসেসিং হচ্ছে' : 'In Progress'}
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {isBn ? 'সমাধান হয়েছে' : 'Resolved'}
          </span>
        );
      case 'closed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {isBn ? 'বন্ধ' : 'Closed'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-600" />
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

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-12">
      
      {/* Toast Alert Banner for Admin Reply */}
      {toastAlert && (
        <div className="fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-in slide-in-from-top-3 duration-300">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
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
                <span>{isBn ? 'টিকিট খুলুন' : 'Open Ticket'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title={isBn ? 'ফিরে যান' : 'Back'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black uppercase">
                  <Headphones className="w-3 h-3" />
                  <span>SUPPORT HELPDESK</span>
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">• {isBn ? '২৪/৭ অফিসিয়াল সাপোর্ট' : '24/7 Official Support'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
                <span>{isBn ? 'সাপোর্ট টিকিট ও হেল্পডেস্ক' : 'Support Tickets & Helpdesk'}</span>
                <FacebookVerifiedBadge size="sm" />
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchTickets()}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title={isBn ? 'রিফ্রেশ করুন' : 'Refresh Tickets'}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
            </button>

            <button
              id="compose-ticket-btn"
              onClick={() => {
                setIsCreatingTicket(true);
                setSelectedTicketId(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isBn ? '+ নতুন টিকিট পাঠান' : '+ Open New Ticket'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Messenger-style layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[640px] items-stretch">
        
        {/* Left Column: Tickets Inbox & List (4 cols on lg) */}
        <div className={`lg:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-col overflow-hidden shadow-2xs ${selectedTicketId || isCreatingTicket ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Inbox Header & Search */}
          <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Inbox className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isBn ? 'আপনার টিকিটসমূহ' : 'My Tickets'}</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300">
                  {tickets.length}
                </span>
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'টিকিট আইডি বা বিষয় খুঁজুন...' : 'Search ticket ID or subject...'}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden dark:text-white"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-1 text-[11px] font-black rounded-lg transition ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {isBn ? 'সকল' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('in_progress')}
                className={`flex-1 py-1 text-[11px] font-black rounded-lg transition ${
                  activeTab === 'in_progress'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {isBn ? 'চলমান' : 'Active'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('resolved')}
                className={`flex-1 py-1 text-[11px] font-black rounded-lg transition ${
                  activeTab === 'resolved'
                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {isBn ? 'সমাধান' : 'Resolved'}
              </button>
            </div>
          </div>

          {/* Tickets Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60 max-h-[580px]">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <MessageSquare className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="text-xs font-bold text-slate-500">{isBn ? 'কোনো সাপোর্ট টিকিট পাওয়া যায়নি' : 'No tickets found'}</p>
                <button
                  type="button"
                  onClick={() => setIsCreatingTicket(true)}
                  className="mt-3 text-xs font-black text-emerald-600 hover:underline"
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
                    className={`w-full text-left p-3.5 transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-l-4 border-l-emerald-600'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-black text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">#{ticket.id}</span>
                        {ticket.unreadByUser && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="New admin message"></span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatTicketDate(ticket.updatedAt)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {ticket.subject}
                    </h4>

                    {lastMsg && (
                      <p className={`text-[11px] truncate flex items-center gap-1 ${isAdminLast ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500'}`}>
                        {isAdminLast && <ShieldCheck className="w-3 h-3 shrink-0" />}
                        <span>{lastMsg.message}</span>
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {getCategoryLabel(ticket.category)}
                      </span>
                      {getStatusBadge(ticket.status)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Messenger Conversation View or Compose Form (8 cols on lg) */}
        <div className={`lg:col-span-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex flex-col overflow-hidden shadow-2xs ${!selectedTicketId && !isCreatingTicket ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* View Mode 1: Creating a New Ticket */}
          {isCreatingTicket ? (
            <div className="p-5 sm:p-7 flex-1 overflow-y-auto space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {isBn ? 'নতুন সাপোর্ট টিকিট তৈরি করুন' : 'Create New Support Ticket'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isBn ? 'আমাদের ডেডিকেটেড সাপোর্ট টিম সরাসরি আপনার সহায়তা করবে' : 'Our official support specialists will review and assist promptly'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCreatingTicket(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden dark:text-white"
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
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold dark:text-white"
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
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold dark:text-white"
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
                    rows={6}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={isBn ? 'আপনার সমস্যার বিস্তারিত লিখুন (যেমন: পেমেন্ট নম্বর, TrxID, তারিখ ইত্যাদি)...' : 'Describe your issue in detail (account number, TrxID, timestamps, etc.)...'}
                    className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden dark:text-white leading-relaxed resize-none"
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingTicket(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSending ? (isBn ? 'পাঠানো হচ্ছে...' : 'Submitting...') : (isBn ? 'টিকিট জমা দিন' : 'Submit Ticket')}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : selectedTicket ? (
            
            // View Mode 2: Messenger Conversation Interface
            <div className="flex flex-col h-full min-h-[580px]">
              
              {/* Conversation Top Header Bar */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
                
                {/* Back to list button on mobile */}
                <button
                  type="button"
                  onClick={() => setSelectedTicketId(null)}
                  className="lg:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400">
                      #{selectedTicket.id}
                    </span>
                    {getPriorityBadge(selectedTicket.priority)}
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate mt-0.5">
                    {selectedTicket.subject}
                  </h3>
                </div>

                {/* Status action toggle */}
                <div className="flex items-center gap-2">
                  {selectedTicket.status === 'resolved' || selectedTicket.status === 'closed' ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'open')}
                      className="px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-700 dark:text-emerald-400 text-xs font-black hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1 cursor-pointer transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isBn ? 'পুনরায় ওপেন করুন' : 'Re-open'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-black hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-700 flex items-center gap-1 cursor-pointer transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isBn ? 'সমাধান চিহ্নিত করুন' : 'Mark Resolved'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Message Feed / Messenger Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 max-h-[440px] bg-slate-50/20 dark:bg-slate-900/20">
                
                {/* Official Desk Greeting Banner */}
                <div className="text-center py-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isBn ? 'অফিসিয়াল সাপোর্ট টিম এনক্রিপ্টেড চ্যাট' : 'Official Helpdesk Conversation'}</span>
                  </span>
                </div>

                {/* Messages Loop */}
                {selectedTicket.messages.map((msg, idx) => {
                  const isAdmin = msg.sender === 'admin';

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex gap-3 items-end ${isAdmin ? 'justify-start' : 'justify-end'}`}
                    >
                      {/* Admin Avatar on Left */}
                      {isAdmin && (
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mb-4">
                          <Headphones className="w-4 h-4" />
                        </div>
                      )}

                      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isAdmin ? 'items-start' : 'items-end'}`}>
                        {/* Sender Label */}
                        <span className="text-[10px] font-black text-slate-400 mb-1 px-1 flex items-center gap-1">
                          {isAdmin ? (
                            <>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Amader Job Support</span>
                              <FacebookVerifiedBadge size="sm" />
                            </>
                          ) : (
                            <span>{user.name}</span>
                          )}
                        </span>

                        {/* Speech Bubble */}
                        <div
                          className={`p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                            isAdmin
                              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-2xl rounded-tl-xs shadow-xs'
                              : 'bg-emerald-600 text-white rounded-2xl rounded-tr-xs shadow-xs'
                          }`}
                        >
                          {msg.message}
                        </div>

                        {/* Timestamp */}
                        <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                          <span>{formatMessageTime(msg.timestamp)}</span>
                          {!isAdmin && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                        </span>
                      </div>

                      {/* User Avatar on Right */}
                      {!isAdmin && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 font-black text-xs mb-4">
                          {user.name ? user.name[0].toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Messenger Composer */}
              <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2.5">
                
                {selectedTicket.status === 'resolved' || selectedTicket.status === 'closed' ? (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-center text-xs text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isBn ? 'এই টিকিটটি সমাধান হয়েছে। বার্তা পাঠাতে পুনরায় ওপেন করুন।' : 'This ticket is marked resolved. Click Re-open to send a message.'}</span>
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
                          className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    {/* Chat Textarea Form */}
                    <form onSubmit={handleSendReply} className="flex items-end gap-2">
                      <div className="flex-1 relative">
                        <textarea
                          rows={2}
                          value={replyMessage}
                          onChange={e => setReplyMessage(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply(e);
                            }
                          }}
                          placeholder={isBn ? 'মেসেজ লিখুন (Enter চেপে পাঠান)...' : 'Type your message (Press Enter to send)...'}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden dark:text-white leading-relaxed resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!replyMessage.trim()}
                        className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition disabled:opacity-40 cursor-pointer shadow-xs shrink-0"
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
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-3">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-black text-slate-700 dark:text-slate-200">
                {isBn ? 'একটি টিকিট নির্বাচন করুন' : 'Select a ticket'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                {isBn ? 'বাম পাশের তালিকা থেকে একটি টিকিট নির্বাচন করুন অথবা নতুন টিকিট খুলুন।' : 'Choose a ticket from the left panel to view conversation or open a new ticket.'}
              </p>
              <button
                type="button"
                onClick={() => setIsCreatingTicket(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-xs hover:bg-emerald-700 transition"
              >
                {isBn ? '+ নতুন টিকিট পাঠান' : '+ Open New Ticket'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
