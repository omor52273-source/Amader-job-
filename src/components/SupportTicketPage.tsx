import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Plus, 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  RefreshCw, 
  CheckCheck, 
  Headphones, 
  X,
  Paperclip,
  Smile,
  CreditCard,
  Briefcase,
  Phone,
  UserCheck,
  Gift,
  Star,
  MoreVertical,
  RotateCcw,
  Check,
  Copy,
  ChevronRight
} from 'lucide-react';
import { UserProfile, Language, SupportTicket, SupportTicketMessage, NotificationItem } from '../types';
import { StorageService } from '../lib/storage';

interface SupportTicketPageProps {
  user: UserProfile;
  language: Language;
  onBack: () => void;
  onAddNotification?: (notification: NotificationItem) => void;
}

// Category icons helper matching screenshot style
const getCategoryIcon = (category: string, className = 'w-5 h-5') => {
  switch (category) {
    case 'deposit':
    case 'withdrawal':
    case 'payment':
      return {
        icon: <CreditCard className={className} />,
        bg: 'bg-purple-500 text-white dark:bg-purple-600',
        lightBg: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40'
      };
    case 'job_issue':
    case 'task_approval':
      return {
        icon: <Briefcase className={className} />,
        bg: 'bg-amber-500 text-white dark:bg-amber-600',
        lightBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40'
      };
    case 'phone_change':
      return {
        icon: <Phone className={className} />,
        bg: 'bg-rose-400 text-white dark:bg-rose-500',
        lightBg: 'bg-rose-100 text-rose-500 dark:bg-rose-900/40'
      };
    case 'account_2fa':
    case 'kyc':
      return {
        icon: <UserCheck className={className} />,
        bg: 'bg-blue-500 text-white dark:bg-blue-600',
        lightBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40'
      };
    case 'referral':
      return {
        icon: <Gift className={className} />,
        bg: 'bg-emerald-500 text-white dark:bg-emerald-600',
        lightBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40'
      };
    default:
      return {
        icon: <MessageSquare className={className} />,
        bg: 'bg-teal-500 text-white dark:bg-teal-600',
        lightBg: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40'
      };
  }
};

export const SupportTicketPage: React.FC<SupportTicketPageProps> = ({
  user,
  language,
  onBack,
  onAddNotification
}) => {
  const isBn = language === 'bn';

  // Seed realistic tickets matching the exact screenshot
  const getDefaultSampleTickets = useCallback((): SupportTicket[] => {
    const uid = user.uid || user.id || '84920173';
    return [
      {
        id: 'TCK-32697',
        userId: uid,
        userName: user.name || 'Rakib Hasan',
        userEmail: user.email || 'user@amaderjob.com',
        subject: 'Hello help me',
        category: 'job_issue',
        priority: 'high',
        status: 'open',
        createdAt: '2026-09-14T07:53:00Z',
        updatedAt: '2026-09-14T08:06:00Z',
        unreadByUser: false,
        unreadByAdmin: false,
        messages: [
          {
            id: 'msg_1',
            sender: 'user',
            senderName: user.name || 'Rakib Hasan',
            message: 'Hello help me',
            timestamp: '2026-09-14T07:53:00Z'
          },
          {
            id: 'msg_2',
            sender: 'admin',
            senderName: 'Amader Job Support',
            message: 'Hello! 👋\nThank you for contacting Amader Job Support. Please describe your issue in detail so we can assist you better.',
            timestamp: '2026-09-14T08:01:00Z'
          },
          {
            id: 'msg_3',
            sender: 'user',
            senderName: user.name || 'Rakib Hasan',
            message: 'I want to withdraw my balance. Can you tell me how to do it?',
            timestamp: '2026-09-14T08:05:00Z'
          },
          {
            id: 'msg_4',
            sender: 'admin',
            senderName: 'Amader Job Support',
            message: 'Sure! You can withdraw from your account by going to:\n\nAccount → Withdraw → Add Method → Submit Request.\n\nIf you face any issue, please let us know. We are always here to help you. 😊',
            timestamp: '2026-09-14T08:06:00Z'
          }
        ]
      },
      {
        id: 'TCK-29481',
        userId: uid,
        userName: user.name || 'Rakib Hasan',
        userEmail: user.email || 'user@amaderjob.com',
        subject: 'Payment not received',
        category: 'deposit',
        priority: 'urgent',
        status: 'in_progress',
        createdAt: '2026-09-13T14:15:00Z',
        updatedAt: '2026-09-13T14:15:00Z',
        unreadByUser: false,
        unreadByAdmin: true,
        messages: [
          {
            id: 'msg_p1',
            sender: 'user',
            senderName: user.name || 'Rakib Hasan',
            message: 'I have deposited but balance not updated yet. bKash TrxID: 9X82KD71LQ',
            timestamp: '2026-09-13T14:15:00Z'
          }
        ]
      },
      {
        id: 'TCK-28104',
        userId: uid,
        userName: user.name || 'Rakib Hasan',
        userEmail: user.email || 'user@amaderjob.com',
        subject: 'Job approval issue',
        category: 'task_approval',
        priority: 'medium',
        status: 'open',
        createdAt: '2026-09-12T10:20:00Z',
        updatedAt: '2026-09-12T10:20:00Z',
        unreadByUser: false,
        unreadByAdmin: false,
        messages: [
          {
            id: 'msg_j1',
            sender: 'user',
            senderName: user.name || 'Rakib Hasan',
            message: 'My submission is pending for more than 48 hours for YouTube subscriber job.',
            timestamp: '2026-09-12T10:20:00Z'
          }
        ]
      },
      {
        id: 'TCK-27512',
        userId: uid,
        userName: user.name || 'Rakib Hasan',
        userEmail: user.email || 'user@amaderjob.com',
        subject: 'Change phone number',
        category: 'phone_change' as any,
        priority: 'low',
        status: 'resolved',
        createdAt: '2026-09-11T20:45:00Z',
        updatedAt: '2026-09-11T20:45:00Z',
        unreadByUser: false,
        unreadByAdmin: false,
        messages: [
          {
            id: 'msg_ph1',
            sender: 'user',
            senderName: user.name || 'Rakib Hasan',
            message: 'I want to change my mobile number from 017... to 019...',
            timestamp: '2026-09-11T20:45:00Z'
          },
          {
            id: 'msg_ph2',
            sender: 'admin',
            senderName: 'Amader Job Support',
            message: 'Your phone number has been updated successfully upon OTP verification. Thank you!',
            timestamp: '2026-09-11T21:10:00Z'
          }
        ]
      },
      {
        id: 'TCK-26340',
        userId: uid,
        userName: user.name || 'Rakib Hasan',
        userEmail: user.email || 'user@amaderjob.com',
        subject: 'Account verification',
        category: 'kyc' as any,
        priority: 'medium',
        status: 'closed',
        createdAt: '2026-09-10T16:30:00Z',
        updatedAt: '2026-09-10T16:30:00Z',
        unreadByUser: false,
        unreadByAdmin: false,
        messages: [
          {
            id: 'msg_k1',
            sender: 'user',
            senderName: user.name || 'Rakib Hasan',
            message: 'KYC verification problem with NID front photo blur.',
            timestamp: '2026-09-10T16:30:00Z'
          }
        ]
      },
      {
        id: 'TCK-25199',
        userId: uid,
        userName: user.name || 'Rakib Hasan',
        userEmail: user.email || 'user@amaderjob.com',
        subject: 'Referral bonus',
        category: 'referral' as any,
        priority: 'low',
        status: 'resolved',
        createdAt: '2026-09-09T11:22:00Z',
        updatedAt: '2026-09-09T11:22:00Z',
        unreadByUser: false,
        unreadByAdmin: false,
        messages: [
          {
            id: 'msg_r1',
            sender: 'user',
            senderName: user.name || 'Rakib Hasan',
            message: "I didn't receive my referral bonus for user #49281.",
            timestamp: '2026-09-09T11:22:00Z'
          },
          {
            id: 'msg_r2',
            sender: 'admin',
            senderName: 'Amader Job Support',
            message: 'Referral bonus ৳50 credited to your main balance after user first deposit.',
            timestamp: '2026-09-09T11:45:00Z'
          }
        ]
      }
    ];
  }, [user]);

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = StorageService.getTickets();
    if (saved && saved.length > 0) return saved;
    return getDefaultSampleTickets();
  });

  // When selectedTicketId is set, CHAT PAGE IS FULL SCREEN
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // New ticket modal form states
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<string>('job_issue');
  const [newPriority, setNewPriority] = useState<string>('medium');
  const [newMessage, setNewMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch tickets from API
  const fetchTickets = useCallback(async (quiet = false) => {
    if (!quiet) setIsRefreshing(true);
    try {
      const uid = user.uid || user.id || '84920173';
      const res = await fetch(`/api/tickets?user_id=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.tickets) && data.tickets.length > 0) {
          setTickets(data.tickets);
          StorageService.saveTickets(data.tickets);
          return;
        }
      }
    } catch {
      // Fallback to local
    } finally {
      if (!quiet) setIsRefreshing(false);
    }
  }, [user.uid, user.id]);

  useEffect(() => {
    fetchTickets(true);
  }, [fetchTickets]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (selectedTicketId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicketId, tickets]);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;

  // Stats calculation
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const awaitingReplyCount = tickets.filter(t => {
    if (t.status === 'resolved' || t.status === 'closed') return false;
    const last = t.messages[t.messages.length - 1];
    return last && last.sender === 'user';
  }).length;

  // Search filtered tickets
  const filteredTickets = tickets.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.subject.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.messages?.some(m => m.message.toLowerCase().includes(q))
    );
  });

  // Handle select ticket (Opens full screen chat)
  const handleSelectTicket = (id: string) => {
    setSelectedTicketId(id);
    setIsCreatingTicket(false);
    setShowOptionsMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close full screen chat and return to tickets list
  const handleBackToTicketList = () => {
    setSelectedTicketId(null);
    setShowOptionsMenu(false);
  };

  // Handle Send Reply Message
  const handleSendReply = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = (customText || replyMessage).trim();
    if (!text || !selectedTicket) return;

    setReplyMessage('');
    const now = new Date().toISOString();
    const newMsg: SupportTicketMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      senderName: user.name || 'User',
      message: text,
      timestamp: now
    };

    const updated = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: t.status === 'closed' ? 'open' : t.status,
          updatedAt: now,
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    });

    setTickets(updated);
    StorageService.saveTickets(updated);

    // Call API
    try {
      await fetch('/api/tickets/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          sender: 'user',
          sender_name: user.name || 'User',
          message: text
        })
      });
    } catch {}

    // Simulated quick support auto-reply for rich demo experience
    if (selectedTicket.messages.length === 1 || text.toLowerCase().includes('help') || text.toLowerCase().includes('withdraw')) {
      setTimeout(() => {
        const replyTime = new Date().toISOString();
        const autoReplyMsg: SupportTicketMessage = {
          id: `msg_admin_${Date.now()}`,
          sender: 'admin',
          senderName: 'Amader Job Support',
          message: isBn 
            ? 'ধন্যবাদ! আপনার বার্তাটি আমরা পেয়েছি। আমাদের সাপোর্ট টিম দ্রুত বিষয়টি পর্যালোচনা করে ব্যবস্থা নিচ্ছেন।'
            : 'Thank you! We have received your message. Our support specialist is actively looking into your request.',
          timestamp: replyTime
        };

        setTickets(prev => {
          const autoUpdated = prev.map(t => {
            if (t.id === selectedTicket.id) {
              return {
                ...t,
                updatedAt: replyTime,
                messages: [...t.messages, autoReplyMsg]
              };
            }
            return t;
          });
          StorageService.saveTickets(autoUpdated);
          return autoUpdated;
        });

        if (onAddNotification) {
          onAddNotification({
            id: `notif_${Date.now()}`,
            userId: user.uid || user.id,
            title: `Support Reply: #${selectedTicket.id}`,
            titleBn: `সাপোর্ট টিকিট উত্তর: #${selectedTicket.id}`,
            message: autoReplyMsg.message.slice(0, 75),
            messageBn: autoReplyMsg.message.slice(0, 75),
            type: 'system',
            timestamp: replyTime,
            isRead: false
          });
        }
      }, 1500);
    }
  };

  // Handle Create New Ticket
  const handleCreateNewTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;

    const ticketId = `TCK-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();
    const newTicket: SupportTicket = {
      id: ticketId,
      userId: user.uid || user.id || '84920173',
      userName: user.name || 'User',
      userEmail: user.email || 'user@amaderjob.com',
      subject: newSubject.trim(),
      category: newCategory as any,
      priority: newPriority as any,
      status: 'open',
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: 'user',
          senderName: user.name || 'User',
          message: newMessage.trim(),
          timestamp: now
        }
      ]
    };

    const updated = [newTicket, ...tickets];
    setTickets(updated);
    StorageService.saveTickets(updated);
    setSelectedTicketId(ticketId); // Opens directly into full-screen chat
    setIsCreatingTicket(false);
    setNewSubject('');
    setNewMessage('');

    // API Call
    try {
      await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid || user.id,
          userName: user.name,
          userEmail: user.email,
          subject: newSubject.trim(),
          category: newCategory,
          priority: newPriority,
          message: newMessage.trim()
        })
      });
    } catch {}
  };

  // Toggle Ticket Status
  const handleToggleStatus = (status: SupportTicket['status']) => {
    if (!selectedTicket) return;
    const now = new Date().toISOString();
    const updated = tickets.map(t => {
      if (t.id === selectedTicket.id) {
        return { ...t, status, updatedAt: now };
      }
      return t;
    });
    setTickets(updated);
    StorageService.saveTickets(updated);
    setShowOptionsMenu(false);
  };

  // Copy Ticket ID
  const handleCopyTicketId = () => {
    if (!selectedTicket) return;
    navigator.clipboard.writeText(selectedTicket.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Format date helper: "Sep 14, 07:53 AM"
  const formatDateTime = (ts: string) => {
    try {
      const d = new Date(ts);
      const month = d.toLocaleString('en-US', { month: 'short' });
      const day = d.getDate().toString().padStart(2, '0');
      const time = d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${month} ${day}, ${time}`;
    } catch {
      return ts;
    }
  };

  // Status badge styling helper matching screenshot
  const renderStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            {isBn ? 'Open' : 'Open'}
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            {isBn ? 'In Progress' : 'In Progress'}
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            {isBn ? 'Resolved' : 'Resolved'}
          </span>
        );
      case 'closed':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
            {isBn ? 'Closed' : 'Closed'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  // User avatar letter
  const userInitial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'R';

  // -------------------------------------------------------------
  // FULL SCREEN CHAT VIEW (When a ticket is clicked/open)
  // "Chat open korle chat page full screen hoye jabe ei page ar kichu takhbe na just chat page takhbe"
  // -------------------------------------------------------------
  if (selectedTicket) {
    const selectedCatStyle = getCategoryIcon(selectedTicket.category);

    return (
      <div className="w-full max-w-4xl mx-auto pb-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col min-h-[82vh] max-h-[92vh]">
          
          {/* 1. Full Screen Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 sticky top-0 z-20 shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              
              {/* Back Button to return to tickets list */}
              <button
                type="button"
                onClick={handleBackToTicketList}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm font-bold shadow-2xs active:scale-95"
                title={isBn ? 'টিকিট লিস্টে ফিরে যান' : 'Back to tickets'}
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">{isBn ? 'টিকিট লিস্ট' : 'Back'}</span>
              </button>

              {/* Circular Category Icon */}
              <div className={`w-10 h-10 rounded-full ${selectedCatStyle.bg} flex items-center justify-center shrink-0 shadow-2xs`}>
                {selectedCatStyle.icon}
              </div>

              {/* Ticket Titles & Metadata */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>#{selectedTicket.id}</span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  {selectedTicket.subject}
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Created: {formatDateTime(selectedTicket.createdAt)}
                </p>
              </div>
            </div>

            {/* Right Actions: Status Pill + 3 Dots Menu */}
            <div className="flex items-center gap-2 relative shrink-0">
              {renderStatusBadge(selectedTicket.status)}

              {/* 3 dots dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {showOptionsMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-1.5 z-30 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <button
                      type="button"
                      onClick={handleCopyTicketId}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>{copiedId ? (isBn ? 'আইডি কপি হয়েছে!' : 'Copied ID!') : (isBn ? 'টিকিট আইডি কপি করুন' : 'Copy Ticket ID')}</span>
                    </button>

                    {selectedTicket.status === 'open' || selectedTicket.status === 'in_progress' ? (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus('resolved')}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isBn ? 'সমাধান হয়েছে হিসেবে চিহ্নিত করুন' : 'Mark as Resolved'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus('open')}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4 text-slate-400" />
                        <span>{isBn ? 'পুনরায় ওপেন করুন' : 'Re-open Ticket'}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Full Screen Chat Conversation Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
            {selectedTicket.messages.map((msg, index) => {
              const isAdmin = msg.sender === 'admin';

              return (
                <div
                  key={msg.id || index}
                  className={`flex gap-2.5 ${isAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  {/* Left: Support Agent Icon */}
                  {isAdmin && (
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                      <Headphones className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isAdmin ? 'items-start' : 'items-end'}`}>
                    
                    {/* Support Agent Label */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Amader Job Support
                        </span>
                        <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                          Support
                        </span>
                      </div>
                    )}

                    {/* Speech Bubble */}
                    <div
                      className={`p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        isAdmin
                          ? 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-2xl rounded-tl-xs shadow-2xs'
                          : 'bg-emerald-700 text-white rounded-2xl rounded-tr-xs font-medium shadow-md shadow-emerald-700/20'
                      }`}
                    >
                      {msg.message}
                    </div>

                    {/* Timestamp + Read Checks */}
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1 font-medium">
                      <span>{formatDateTime(msg.timestamp)}</span>
                      {!isAdmin && (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                  </div>

                  {/* Right: User Avatar Circle */}
                  {!isAdmin && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0 mt-1">
                      {userInitial}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* 3. Full Screen Chat Bottom Input Bar */}
          <div className="p-3.5 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              
              {/* Paperclip attachment button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 cursor-pointer transition"
                title="Attach File"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={() => {
                  setReplyMessage(prev => prev ? `${prev} [Attachment Attached]` : '[Attachment Attached]');
                }}
              />

              {/* Input Box */}
              <div className="flex-1 flex items-center bg-slate-100/90 dark:bg-slate-800 rounded-2xl px-3.5 py-1.5 border border-slate-200/80 dark:border-slate-700 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  placeholder={isBn ? 'Type your message...' : 'Type your message...'}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none py-1.5"
                />
                <button
                  type="button"
                  onClick={() => setReplyMessage(prev => `${prev} 😊`)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!replyMessage.trim()}
                className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUPPORT CENTER OVERVIEW (When no ticket is currently open)
  // -------------------------------------------------------------
  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 pb-12 sm:pb-8">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-transparent">
        <div className="flex items-center gap-3">
          {/* Headphones in circle */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-800 dark:text-white shadow-2xs shrink-0">
            <Headphones className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isBn ? 'সাপোর্ট সেন্টার (Support Center)' : 'Support Center'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              {isBn ? 'আমরা আপনাকে সাহায্য করার জন্য ২৪/৭ প্রস্তুত আছি' : 'We are here to help you 24/7'}
            </p>
          </div>
        </div>

        {/* Top Actions: Refresh & + New Ticket */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => fetchTickets()}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isBn ? 'রিফ্রেশ করুন' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            id="new-ticket-btn"
            type="button"
            onClick={() => setIsCreatingTicket(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isBn ? '+ New Ticket' : '+ New Ticket'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Stats Bar (4 cards in responsive grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        
        {/* Total Tickets */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 fill-blue-600/20" />
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {totalCount}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isBn ? 'মোট টিকিট' : 'Total Tickets'}
            </div>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {openCount}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isBn ? 'চলমান টিকিট' : 'Open Tickets'}
            </div>
          </div>
        </div>

        {/* Resolved */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {resolvedCount}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isBn ? 'সমাধানকৃত' : 'Resolved'}
            </div>
          </div>
        </div>

        {/* Awaiting Reply */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-amber-500/30" />
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {awaitingReplyCount}
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isBn ? 'উত্তরের অপেক্ষায়' : 'Awaiting Reply'}
            </div>
          </div>
        </div>

      </div>

      {/* 3. Search Bar + Tickets List Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'Search tickets...' : 'Search tickets...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition shadow-2xs"
            />
          </div>
        </div>

        {/* Ticket List Items */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold">{isBn ? 'কোনো টিকিট পাওয়া যায়নি' : 'No tickets found'}</p>
              <button
                type="button"
                onClick={() => setIsCreatingTicket(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isBn ? 'নতুন টিকিট তৈরি করুন' : 'Open a New Ticket'}</span>
              </button>
            </div>
          ) : (
            filteredTickets.map(t => {
              const catStyle = getCategoryIcon(t.category);
              const lastMessage = t.messages[t.messages.length - 1];

              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTicket(t.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Category Icon */}
                    <div className={`w-11 h-11 rounded-full ${catStyle.bg} flex items-center justify-center shrink-0 shadow-2xs mt-0.5 group-hover:scale-105 transition-transform`}>
                      {catStyle.icon}
                    </div>

                    {/* Content */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          #{t.id}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                          {t.subject}
                        </h4>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                        {lastMessage ? lastMessage.message : 'No message yet'}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        {renderStatusBadge(t.status)}
                        <span className="text-[11px] text-slate-400 font-medium">
                          {formatDateTime(t.updatedAt || t.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Arrow */}
                  <div className="shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              );
            })
          )}
        </div>

      </div>

      {/* 4. Modal for Creating a New Ticket */}
      {isCreatingTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {isBn ? 'নতুন সাপোর্ট টিকিট তৈরি করুন' : 'Create New Support Ticket'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isBn ? 'আপনার সমস্যার বিষয়টি বিস্তারিত জানান' : 'Describe your issue in detail'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatingTicket(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateNewTicket} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'বিষয় (Subject)' : 'Subject'} *
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder={isBn ? 'যেমন: পেমেন্ট ডিপোজিট সমস্যা' : 'e.g. Payment not received / Job issue'}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'ক্যাটাগরি' : 'Category'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="job_issue">{isBn ? 'কাজের সমস্যা' : 'Job Issue'}</option>
                    <option value="deposit">{isBn ? 'পেমেন্ট / ডিপোজিট' : 'Payment / Deposit'}</option>
                    <option value="withdrawal">{isBn ? 'উত্তোলন' : 'Withdrawal'}</option>
                    <option value="phone_change">{isBn ? 'ফোন নম্বর পরিবর্তন' : 'Change Phone Number'}</option>
                    <option value="kyc">{isBn ? 'একাউন্ট ভেরিফিকেশন' : 'Account Verification'}</option>
                    <option value="referral">{isBn ? 'রেফারেল বোনাস' : 'Referral Bonus'}</option>
                    <option value="other">{isBn ? 'সাধারণ সাহায্য' : 'General Support'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isBn ? 'অগ্রাধিকার' : 'Priority'}
                  </label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="low">{isBn ? 'নিম্ন (Low)' : 'Low'}</option>
                    <option value="medium">{isBn ? 'সাধারণ (Medium)' : 'Medium'}</option>
                    <option value="high">{isBn ? 'উচ্চ (High)' : 'High'}</option>
                    <option value="urgent">{isBn ? 'জরুরি (Urgent)' : 'Urgent'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isBn ? 'বিস্তারিত বার্তা' : 'Detailed Message'} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={isBn ? 'আপনার সমস্যার বিস্তারিত লিখুন...' : 'Describe your problem in detail...'}
                  className="w-full p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/30 focus:outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingTicket(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isBn ? 'টিকিট সাবমিট করুন' : 'Submit Ticket'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
