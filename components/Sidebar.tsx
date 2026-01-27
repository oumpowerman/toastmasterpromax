
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Store, Settings, Package, Tag, Users, Sparkles, Loader2, Save, LogOut, Wallet, ClipboardCheck, Box, Map, LayoutDashboard, Coffee, ChevronDown, ChevronUp, PieChart, UserPlus, PanelLeftClose, PanelLeftOpen, FlaskConical, TrendingUp, Database, ArrowLeft } from 'lucide-react';
import TeamManageModal from './modals/TeamManageModal';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  saving: boolean;
  profit: number;
  onOpenMigration?: () => void;
  session?: any; 
  userRole?: 'owner' | 'manager' | 'staff';
  activeShopId?: string;
  appMode: 'real' | 'sim'; // NEW PROP
  onChangeMode: () => void; // Callback to switch mode
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, saving, profit, onOpenMigration, session, userRole = 'owner', activeShopId, appMode, onChangeMode }) => {
  const [isCollapsed, setIsCollapsed] = useState(false); 
  const [isHovered, setIsHovered] = useState(false);     
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['main', 'setup']);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const isExpandedVisual = !isCollapsed || isHovered;

  // --- DYNAMIC MENUS BASED ON MODE ---
  const menuGroups = appMode === 'real' ? [
    {
      id: 'main',
      title: 'จัดการร้าน (Operation)', // Updated Title
      subtitle: 'ขาย & จัดการ',
      theme: 'green',
      icon: Store,
      items: [
        { id: 'dashboard', label: 'ภาพรวมวันนี้', icon: LayoutDashboard },
        { id: 'pos', label: 'หน้าขาย (POS)', icon: Coffee }, 
        { id: 'checklist', label: 'เช็คลิสต์เปิดร้าน', icon: ClipboardCheck },
      ]
    },
    {
      id: 'back',
      title: 'หลังร้าน (Back)',
      subtitle: 'สต็อก & บัญชี',
      theme: 'blue',
      icon: Box,
      items: [
        { id: 'product', label: 'จัดการเมนู/สูตร', icon: Package }, // Added to Real Mode
        { id: 'inventory', label: 'คลังสินค้า', icon: Box },
        { id: 'shopping', label: 'จ่ายตลาด', icon: Map },
        { id: 'accounting', label: 'บัญชี & รายงาน', icon: TrendingUp },
      ]
    }
  ] : [
    {
      id: 'main',
      title: 'วางแผน (Sandbox)', // Updated Title
      subtitle: 'Simulation Lab',
      theme: 'purple',
      icon: FlaskConical,
      items: [
        { id: 'dashboard', label: 'วิเคราะห์กำไร', icon: LayoutDashboard },
        { id: 'product', label: 'สูตร & ต้นทุน', icon: Package },
        { id: 'pricing', label: 'ตั้งราคาขาย', icon: Tag },
        { id: 'traffic', label: 'จำลอง Traffic', icon: Users },
      ]
    },
    {
      id: 'setup',
      title: 'ตั้งค่า (Setup)',
      subtitle: 'โครงสร้างร้าน',
      theme: 'orange',
      icon: Settings,
      items: [
        { id: 'master', label: 'ตั้งค่าร้าน/อุปกรณ์', icon: Settings },
        { id: 'inventory', label: 'ฐานข้อมูลสินค้า', icon: Box }, // Inventory access in Sim too
      ]
    }
  ];

  useEffect(() => {
      const activeGroup = menuGroups.find(g => g.items.some(i => i.id === activeTab));
      if (activeGroup && !expandedGroups.includes(activeGroup.id)) {
          setExpandedGroups(prev => [...prev, activeGroup.id]);
      }
  }, [activeTab, appMode]);

  const toggleGroup = (groupId: string) => {
      setExpandedGroups(prev => 
          prev.includes(groupId) 
          ? prev.filter(id => id !== groupId) 
          : [...prev, groupId]
      );
  };

  const getThemeStyle = (theme: string, type: 'bg' | 'text' | 'border' | 'soft-bg') => {
      const map: any = {
          green: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', 'soft-bg': 'bg-emerald-50' },
          blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', 'soft-bg': 'bg-blue-50' },
          orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', 'soft-bg': 'bg-orange-50' },
          purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', 'soft-bg': 'bg-purple-50' }
      };
      return map[theme][type];
  };

  const modeColor = appMode === 'real' ? 'text-green-600' : 'text-purple-600';
  const modeBg = appMode === 'real' ? 'bg-green-50 border-green-100' : 'bg-purple-50 border-purple-100';

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        bg-white border-r-2 border-stone-100 p-4 shrink-0 flex flex-col shadow-sm z-50 h-screen sticky top-0 overflow-y-auto transition-all duration-300 ease-in-out
        ${isExpandedVisual ? 'w-full md:w-80' : 'w-[5.5rem]'}
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-stone-100
        [&::-webkit-scrollbar-thumb]:rounded-full
      `}
    >
        {/* Header Area */}
        <div className={`flex items-center mb-6 px-1 shrink-0 transition-all ${isExpandedVisual ? 'justify-between' : 'flex-col gap-4'}`}>
            
            <div className={`flex items-center gap-3 ${isExpandedVisual ? '' : 'justify-center'}`}>
                {/* Back Button / Logo */}
                <button onClick={onChangeMode} className="bg-stone-100 p-2 rounded-xl hover:bg-stone-200 text-stone-500 transition-colors" title="เปลี่ยนโหมด">
                    {isExpandedVisual ? <ArrowLeft size={20}/> : <Store size={24}/>}
                </button>
                
                {isExpandedVisual && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                        <h1 className={`text-xl font-black leading-none font-cute tracking-tight ${modeColor}`}>Toast Master</h1>
                        <span className="text-[10px] font-bold text-stone-400 tracking-widest mt-0.5 inline-block">
                            {appMode === 'real' ? 'OPERATION MODE' : 'SIMULATION LAB'}
                        </span>
                    </div>
                )}
            </div>

            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`text-stone-300 hover:text-stone-600 hover:bg-stone-50 p-2 rounded-xl transition-all ${isExpandedVisual ? '' : ''}`}
            >
                {isCollapsed ? <PanelLeftOpen size={20} className={isHovered ? 'animate-pulse text-orange-400' : ''} /> : <PanelLeftClose size={20} />}
            </button>
        </div>
        
        {/* Role Badge */}
        {isExpandedVisual && userRole && (
            <div className={`mb-6 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between border ${modeBg}`}>
                <span className="opacity-80 text-stone-500">สถานะ:</span>
                <span className={modeColor}>{userRole === 'owner' ? '👑 เจ้าของร้าน' : '👷 พนักงาน'}</span>
            </div>
        )}

        <nav className="space-y-6 flex-1">
          {menuGroups.map((group) => {
            const isOpen = expandedGroups.includes(group.id);
            const GroupIcon = group.icon;

            return (
                <div key={group.id} className={`transition-all duration-300 ${isExpandedVisual ? 'bg-white rounded-3xl' : 'flex flex-col items-center gap-2 pb-4 border-b border-stone-100 last:border-0'}`}>
                
                {isExpandedVisual ? (
                    <button 
                        onClick={() => toggleGroup(group.id)}
                        className={`w-full flex items-center justify-between px-2 mb-2 group select-none`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${getThemeStyle(group.theme, 'bg')} ${getThemeStyle(group.theme, 'text')}`}>
                                <GroupIcon size={16} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <span className={`block text-xs font-black uppercase tracking-wider ${getThemeStyle(group.theme, 'text')}`}>{group.title}</span>
                                <span className="block text-[10px] text-stone-400 font-bold">{group.subtitle}</span>
                            </div>
                        </div>
                        <div className={`text-stone-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                            <ChevronDown size={14} />
                        </div>
                    </button>
                ) : (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 ${getThemeStyle(group.theme, 'bg')} ${getThemeStyle(group.theme, 'text')}`}>
                        <GroupIcon size={20} />
                    </div>
                )}
                
                <div className={`space-y-1 overflow-hidden transition-all duration-300 ${isExpandedVisual && !isOpen ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
                    {group.items.map(item => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsCollapsed(true);
                                }}
                                title={isExpandedVisual ? '' : item.label}
                                className={`
                                    transition-all duration-200 font-cute flex items-center group relative w-full
                                    ${isExpandedVisual 
                                        ? 'px-4 py-3 rounded-2xl text-sm gap-3' 
                                        : 'justify-center p-2' 
                                    }
                                    ${isActive
                                        ? `${getThemeStyle(group.theme, 'soft-bg')} ${getThemeStyle(group.theme, 'text')} font-bold shadow-sm ring-1 ring-inset ${getThemeStyle(group.theme, 'border')}`
                                        : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800 border border-transparent'
                                    }
                                `}
                            >
                                <item.icon 
                                    size={isExpandedVisual ? 18 : 20} 
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={`transition-colors ${isActive ? '' : 'text-stone-400 group-hover:text-stone-600'}`}
                                />
                                {isExpandedVisual && <span className="truncate">{item.label}</span>}
                                {isActive && isExpandedVisual && (
                                    <div className={`absolute right-3 w-1.5 h-1.5 rounded-full ${getThemeStyle(group.theme, 'text').replace('text', 'bg')}`}></div>
                                )}
                            </button>
                        );
                    })}
                </div>
                </div>
            );
          })}
        </nav>

        <div className={`mt-4 pt-4 border-t-2 border-stone-100 space-y-3 shrink-0 ${isExpandedVisual ? '' : 'flex flex-col items-center'}`}>
           
           {isExpandedVisual ? (
               <div className="flex items-center justify-between text-xs font-bold text-stone-400 px-4 bg-stone-50 py-2.5 rounded-xl border border-stone-100">
                  <span className="flex items-center gap-2"><Database size={12}/> สถานะระบบ:</span>
                  <div className="flex items-center gap-1">
                    {saving ? (
                        <><Loader2 size={12} className="animate-spin text-orange-400"/> <span className="text-orange-400">Saving...</span></>
                    ) : (
                        <><Save size={12} className="text-green-500" /> <span className="text-green-600">Online</span></>
                    )}
                  </div>
               </div>
           ) : (
                saving ? <Loader2 size={16} className="animate-spin text-orange-400"/> : <div className="w-2 h-2 rounded-full bg-green-500"></div>
           )}

           <button 
                onClick={() => setShowTeamModal(true)}
                className={`w-full py-2.5 bg-white text-stone-600 rounded-xl font-bold text-xs hover:bg-stone-50 hover:text-stone-800 transition-all flex items-center justify-center gap-2 border border-stone-200 shadow-sm ${isExpandedVisual ? '' : 'p-0 w-10 h-10'}`}
                title="ทีม & โปรไฟล์"
           >
               <UserPlus size={16} /> {isExpandedVisual && "จัดการทีม & ผู้ใช้"}
           </button>

           {/* Exit Sim Button */}
           {appMode === 'sim' && isExpandedVisual && (
               <button 
                   onClick={onChangeMode}
                   className="w-full py-3 rounded-2xl font-bold text-sm bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
               >
                   <LogOut size={16} /> ออกจาก Sandbox
               </button>
           )}
           
           <button onClick={() => supabase.auth.signOut()} className={`flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 font-bold transition-all ${isExpandedVisual ? 'w-full gap-2 py-3 rounded-2xl text-xs hover:shadow-inner' : 'w-10 h-10 rounded-full'}`}>
              <LogOut size={isExpandedVisual ? 14 : 18} /> {isExpandedVisual && 'ออกจากระบบ'}
           </button>
        </div>

        {session && (
            <TeamManageModal 
                isOpen={showTeamModal} 
                onClose={() => setShowTeamModal(false)}
                currentUserId={session.user.id}
                role={userRole}
                activeShopId={activeShopId}
            />
        )}
      </aside>
  );
};

export default Sidebar;
