
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Users, Key, Copy, Check, LogOut, Shield, ChevronUp, ChevronDown, UserCog, HardHat, Lock, User } from 'lucide-react';
import { useAlert } from '../AlertSystem';
import { ShopMember } from '../../types';

interface TeamManageModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
    role: 'owner' | 'manager' | 'staff';
    activeShopId?: string;
}

const TeamManageModal: React.FC<TeamManageModalProps> = ({ isOpen, onClose, currentUserId, role, activeShopId }) => {
    const { showAlert, showConfirm } = useAlert();
    const [activeTab, setActiveTab] = useState<'profile' | 'team'>('profile'); // Default to profile so they see password change first
    
    const [joinCode, setJoinCode] = useState('');
    const [members, setMembers] = useState<ShopMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    
    // UI State
    const [expandedMember, setExpandedMember] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (isOpen && role === 'owner') {
            fetchMembers();
        }
        // Reset tab to profile when opened if not owner, or team if owner (optional preference)
        // Let's stick to profile as default or let user choose.
    }, [isOpen, role]);

    const fetchMembers = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('shop_members')
            .select('*')
            .eq('owner_id', currentUserId);
            
        if (data) {
            // Map DB response to types
            const mappedMembers = data.map((m: any) => ({
                id: m.id,
                userId: m.user_id,
                ownerId: m.owner_id,
                role: m.role || 'staff',
                joinedAt: m.created_at
            }));
            setMembers(mappedMembers);
        }
        setLoading(false);
    };

    const handleJoin = async () => {
        if (!joinCode) return;
        setLoading(true);
        
        const { error } = await supabase.from('shop_members').insert({
            user_id: currentUserId,
            owner_id: joinCode,
            role: 'staff' // Default role is staff
        });

        if (error) {
            await showAlert("ไม่สามารถเข้าร่วมได้ (รหัสผิด หรือเป็นสมาชิกอยู่แล้ว)", 'error');
        } else {
            await showAlert("เข้าร่วมร้านเรียบร้อย! กรุณารีเฟรชหน้าจอ", 'success');
            window.location.reload();
        }
        setLoading(false);
    };

    const handleLeaveTeam = async () => {
        if (await showConfirm("คุณต้องการออกจากร้านนี้ใช่ไหม?")) {
            await supabase.from('shop_members').delete().eq('user_id', currentUserId);
            window.location.reload();
        }
    };

    const handleKick = async (memberId: string) => {
        if (await showConfirm("ลบพนักงานคนนี้ออกจากทีม?")) {
            await supabase.from('shop_members').delete().eq('id', memberId);
            fetchMembers();
        }
    };

    const handleUpdateRole = async (memberId: string, newRole: 'staff' | 'manager') => {
        setLoading(true);
        const { error } = await supabase.from('shop_members').update({ role: newRole }).eq('id', memberId);
        
        if (error) {
            await showAlert("เกิดข้อผิดพลาดในการเปลี่ยนตำแหน่ง", 'error');
        } else {
            await showAlert(`เปลี่ยนตำแหน่งเรียบร้อยแล้ว!`, 'success');
            fetchMembers();
            setExpandedMember(null);
        }
        setLoading(false);
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 6) {
            await showAlert("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", 'warning');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            await showAlert("ไม่สามารถเปลี่ยนรหัสผ่านได้: " + error.message, 'error');
        } else {
            await showAlert("เปลี่ยนรหัสผ่านเรียบร้อย! ครั้งหน้าเข้าสู่ระบบด้วยรหัสใหม่ได้เลย", 'success');
            setNewPassword('');
        }
        setLoading(false);
    };

    const copyCode = () => {
        navigator.clipboard.writeText(currentUserId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getRoleBadge = (r: string) => {
        switch(r) {
            case 'owner': return <span className="px-2 py-0.5 rounded-lg bg-orange-100 text-orange-600 font-bold text-xs">👑 เจ้าของร้าน</span>;
            case 'manager': return <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-600 font-bold text-xs">🛡️ ผู้จัดการ (Manager)</span>;
            default: return <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-600 font-bold text-xs">👷 พนักงาน (Staff)</span>;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 relative z-10 shadow-2xl border-4 border-white flex flex-col max-h-[90vh] animate-bounce-in">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-stone-100 text-stone-400 z-20"><X size={20}/></button>
                
                {/* Header */}
                <div className="text-center mb-6 shrink-0 pt-2">
                    <h3 className="text-2xl font-black text-stone-800 font-cute">บัญชี & ทีมงาน</h3>
                    <p className="text-stone-500 text-xs mt-1 flex items-center justify-center gap-2">
                        {getRoleBadge(role)}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-stone-100 rounded-xl mb-4 shrink-0">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'profile' ? 'bg-white shadow text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        <User size={14}/> ข้อมูลส่วนตัว
                    </button>
                    <button 
                        onClick={() => setActiveTab('team')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'team' ? 'bg-white shadow text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        <Users size={14}/> จัดการทีม
                    </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 pb-2">
                    
                    {/* === PROFILE TAB (CHANGE PASSWORD) === */}
                    {activeTab === 'profile' && (
                        <div className="space-y-4 animate-in slide-in-from-left-4">
                            <div className="bg-orange-50 p-5 rounded-2xl border-2 border-orange-100 text-center">
                                <div className="w-16 h-16 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-2xl shadow-sm border-2 border-orange-200">
                                    👤
                                </div>
                                <p className="text-xs text-stone-400 font-bold uppercase mb-1">User ID ของคุณ</p>
                                <code className="bg-white px-3 py-1 rounded-lg border border-orange-200 text-orange-600 font-mono text-xs select-all block break-all">
                                    {currentUserId}
                                </code>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border-2 border-stone-100 shadow-sm">
                                <h4 className="font-bold text-stone-700 flex items-center gap-2 mb-3">
                                    <Key size={18} className="text-orange-500"/> เปลี่ยนรหัสผ่านใหม่
                                </h4>
                                <div className="space-y-3">
                                    <input 
                                        type="password" 
                                        placeholder="ตั้งรหัสผ่านใหม่ที่นี่..." 
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-orange-400 transition-all font-bold text-stone-700"
                                    />
                                    <button 
                                        onClick={handleChangePassword}
                                        disabled={loading || !newPassword}
                                        className="w-full bg-stone-800 text-white py-3 rounded-xl text-sm font-bold hover:bg-stone-900 disabled:opacity-50 shadow-lg transition-all"
                                    >
                                        บันทึกรหัสผ่าน
                                    </button>
                                </div>
                                <p className="text-[10px] text-stone-400 mt-3 text-center">
                                    *ใช้สำหรับ Login ครั้งต่อไป (ทั้งบนมือถือและคอมพิวเตอร์)
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => supabase.auth.signOut()}
                                className="w-full py-3 text-red-500 bg-red-50 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <LogOut size={16}/> ออกจากระบบ
                            </button>
                        </div>
                    )}

                    {/* === TEAM TAB === */}
                    {activeTab === 'team' && (
                        <div className="animate-in slide-in-from-right-4 space-y-6">
                            {role === 'owner' ? (
                                <div className="space-y-6">
                                    {/* Owner's Code */}
                                    <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-100 text-center">
                                        <p className="text-xs font-bold text-blue-400 uppercase mb-2">Shop ID ของคุณ (ส่งให้พนักงาน)</p>
                                        <div className="flex items-center gap-2 justify-center">
                                            <code className="bg-white px-4 py-2 rounded-xl border border-blue-200 text-blue-700 font-mono font-bold text-sm select-all break-all">
                                                {currentUserId}
                                            </code>
                                            <button onClick={copyCode} className="p-2 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors shrink-0 text-blue-500">
                                                {copied ? <Check size={16}/> : <Copy size={16}/>}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Member List */}
                                    <div>
                                        <h4 className="font-bold text-stone-700 mb-2 flex items-center justify-between">
                                            <span>รายชื่อพนักงาน ({members.length})</span>
                                            <span className="text-[10px] bg-stone-100 px-2 py-1 rounded text-stone-400">แตะเพื่อจัดการ</span>
                                        </h4>
                                        <div className="space-y-2">
                                            {members.length === 0 ? (
                                                <p className="text-stone-400 text-sm italic text-center py-8 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-100">
                                                    ยังไม่มีพนักงาน<br/>ส่ง Shop ID ให้พวกเขาเพื่อเข้าร่วมทีม
                                                </p>
                                            ) : (
                                                members.map(m => (
                                                    <div key={m.id} className="bg-stone-50 rounded-xl border border-stone-100 overflow-hidden">
                                                        <div 
                                                            className="flex justify-between items-center p-3 cursor-pointer hover:bg-stone-100 transition-colors"
                                                            onClick={() => setExpandedMember(expandedMember === m.id ? null : m.id)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${m.role === 'manager' ? 'bg-purple-500' : 'bg-blue-400'}`}>
                                                                    {m.role === 'manager' ? <Shield size={14}/> : <HardHat size={14}/>}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-stone-600">ID: ...{m.userId.slice(-6)}</p>
                                                                    <div className="flex gap-1 mt-0.5">{getRoleBadge(m.role)}</div>
                                                                </div>
                                                            </div>
                                                            {expandedMember === m.id ? <ChevronUp size={16} className="text-stone-400"/> : <ChevronDown size={16} className="text-stone-400"/>}
                                                        </div>

                                                        {/* Expandable Actions */}
                                                        {expandedMember === m.id && (
                                                            <div className="p-3 bg-white border-t border-stone-100 space-y-2 animate-in slide-in-from-top-2">
                                                                <p className="text-[10px] text-stone-400 font-bold uppercase mb-1">ตั้งค่าบทบาท (Role)</p>
                                                                <div className="flex gap-2">
                                                                    <button 
                                                                        onClick={() => handleUpdateRole(m.id, 'manager')}
                                                                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 ${m.role === 'manager' ? 'bg-purple-50 border-purple-200 text-purple-600 ring-1 ring-purple-300' : 'bg-white border-stone-200 text-stone-500 hover:bg-purple-50 hover:text-purple-500'}`}
                                                                    >
                                                                        <Shield size={12}/> ผู้จัดการ
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleUpdateRole(m.id, 'staff')}
                                                                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1 ${m.role === 'staff' ? 'bg-blue-50 border-blue-200 text-blue-600 ring-1 ring-blue-300' : 'bg-white border-stone-200 text-stone-500 hover:bg-blue-50 hover:text-blue-500'}`}
                                                                    >
                                                                        <HardHat size={12}/> พนักงาน
                                                                    </button>
                                                                </div>
                                                                
                                                                <div className="h-px bg-stone-100 my-2"></div>
                                                                
                                                                <button 
                                                                    onClick={() => handleKick(m.id)}
                                                                    className="w-full py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 border border-transparent hover:border-red-200 transition-colors flex items-center justify-center gap-2"
                                                                >
                                                                    <LogOut size={14}/> ลบออกจากทีม
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Join Others (For Owner) */}
                                    {members.length === 0 && (
                                        <div className="mt-6 pt-6 border-t border-stone-100">
                                            <p className="text-xs font-bold text-stone-400 text-center mb-3">หรือคุณต้องการเข้าร่วมร้านอื่น?</p>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="ใส่ Shop ID ร้านอื่น..." 
                                                    value={joinCode}
                                                    onChange={e => setJoinCode(e.target.value)}
                                                    className="flex-1 px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 outline-none text-sm font-bold focus:border-blue-400"
                                                />
                                                <button 
                                                    onClick={handleJoin}
                                                    disabled={loading || !joinCode}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50"
                                                >
                                                    เข้าร่วม
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className={`p-4 rounded-2xl border text-center ${role === 'manager' ? 'bg-purple-50 border-purple-100' : 'bg-blue-50 border-blue-100'}`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${role === 'manager' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {role === 'manager' ? <Shield size={24}/> : <UserCog size={24}/>}
                                        </div>
                                        <p className={`text-sm font-bold ${role === 'manager' ? 'text-purple-800' : 'text-blue-800'}`}>
                                            คุณคือ {role === 'manager' ? 'ผู้จัดการ (Manager)' : 'พนักงาน (Staff)'}
                                        </p>
                                        <p className="text-xs text-stone-500 mt-1">
                                            {role === 'manager' 
                                                ? "คุณได้รับสิทธิ์ให้ดูข้อมูลเชิงลึกและจัดการร้านได้" 
                                                : "หน้าที่หลักของคุณคือการขายและจัดการออเดอร์"}
                                        </p>
                                        <p className="text-[10px] text-stone-400 mt-2 break-all">Shop ID: {activeShopId}</p>
                                    </div>
                                    
                                    <button 
                                        onClick={handleLeaveTeam}
                                        className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-bold border-2 border-red-100 hover:bg-red-100 flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={20}/> ออกจากร้านนี้
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamManageModal;
