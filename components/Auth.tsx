
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAlert } from './AlertSystem';
import { Mail, Lock, Eye, EyeOff, Store, ArrowRight, UserPlus, LogIn, HelpCircle, ChevronLeft } from 'lucide-react';

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT';

const AuthScreen: React.FC = () => {
  const { showAlert } = useAlert();
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Used for Shop Name or User Name

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        await showAlert(error.message === 'Invalid login credentials' ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : error.message, 'error');
    } else {
        // Success is handled by onAuthStateChange in App.tsx
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        await showAlert("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร", 'warning');
        return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName // Store name in metadata
            }
        }
    });

    if (error) {
        await showAlert(error.message, 'error');
    } else {
        if (data.user && !data.session) {
            await showAlert("สมัครสมาชิกสำเร็จ! กรุณาเช็คอีเมลเพื่อยืนยันตัวตนก่อนเข้าใช้งาน", 'success', { title: "ยืนยันอีเมล" });
            setMode('LOGIN');
        } else {
            await showAlert("สมัครสมาชิกและเข้าสู่ระบบเรียบร้อย ยินดีต้อนรับครับ!", 'success');
        }
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // Redirect back to app
    });

    if (error) {
        await showAlert(error.message, 'error');
    } else {
        await showAlert("ระบบส่งลิงก์เปลี่ยนรหัสผ่านไปที่อีเมลแล้วครับ", 'success');
        setMode('LOGIN');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF9F2] p-4 font-cute">
      
      {/* Brand Header */}
      <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-24 h-24 bg-orange-400 rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200 rotate-3 hover:rotate-0 transition-transform duration-500">
             <span className="text-5xl drop-shadow-md">🍞</span>
          </div>
          <h1 className="text-4xl font-black text-stone-800 tracking-tight">Toast Master</h1>
          <p className="text-stone-500 font-bold mt-1 text-lg">ระบบจัดการร้านปังปิ้ง Profit Pro</p>
      </div>

      <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-4 border-white w-full max-w-md relative overflow-hidden animate-bounce-in">
        
        {/* Dynamic Background Blob */}
        <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20 transition-colors duration-500 ${mode === 'LOGIN' ? 'bg-orange-400' : mode === 'REGISTER' ? 'bg-blue-400' : 'bg-stone-400'}`}></div>
        
        <div className="relative z-10">
            {/* Header Text */}
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-black text-stone-700">
                    {mode === 'LOGIN' && 'เข้าสู่ระบบ (Sign In)'}
                    {mode === 'REGISTER' && 'เปิดร้านใหม่ (Sign Up)'}
                    {mode === 'FORGOT' && 'ลืมรหัสผ่าน? (Reset)'}
                </h2>
                <p className="text-xs text-stone-400 font-bold mt-1">
                    {mode === 'LOGIN' && 'ยินดีต้อนรับกลับมาครับ! พร้อมรวยหรือยัง?'}
                    {mode === 'REGISTER' && 'เริ่มต้นใช้งานฟรี! ข้อมูลครบ จบในที่เดียว'}
                    {mode === 'FORGOT' && 'กรอกอีเมลเพื่อรับลิงก์ตั้งรหัสใหม่'}
                </p>
            </div>

            {/* FORM */}
            <form onSubmit={mode === 'LOGIN' ? handleLogin : mode === 'REGISTER' ? handleRegister : handleResetPassword} className="space-y-4">
                
                {/* Name Field (Register Only) */}
                {mode === 'REGISTER' && (
                    <div className="space-y-1 animate-in slide-in-from-left-2">
                        <label className="text-xs font-bold text-stone-400 ml-3 uppercase">ชื่อร้าน / ชื่อเล่นของคุณ</label>
                        <div className="relative group">
                            <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input 
                                type="text" 
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="เช่น ปังปิ้ง หอมฉุย"
                                className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:border-blue-400 focus:bg-white font-bold text-stone-600 transition-all"
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Email Field */}
                <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-400 ml-3 uppercase">อีเมล (Email)</label>
                    <div className="relative group">
                        <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${mode === 'REGISTER' ? 'group-focus-within:text-blue-500' : 'group-focus-within:text-orange-500'} text-stone-300`} size={20} />
                        <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className={`w-full pl-12 pr-4 py-3.5 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:bg-white font-bold text-stone-600 transition-all ${mode === 'REGISTER' ? 'focus:border-blue-400' : 'focus:border-orange-400'}`}
                            required
                        />
                    </div>
                </div>

                {/* Password Field */}
                {mode !== 'FORGOT' && (
                    <div className="space-y-1 animate-in slide-in-from-left-2">
                        <label className="text-xs font-bold text-stone-400 ml-3 uppercase">รหัสผ่าน (Password)</label>
                        <div className="relative group">
                            <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${mode === 'REGISTER' ? 'group-focus-within:text-blue-500' : 'group-focus-within:text-orange-500'} text-stone-300`} size={20} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className={`w-full pl-12 pr-12 py-3.5 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:bg-white font-bold text-stone-600 transition-all ${mode === 'REGISTER' ? 'focus:border-blue-400' : 'focus:border-orange-400'}`}
                                required
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                            </button>
                        </div>
                        {mode === 'LOGIN' && (
                            <div className="flex justify-end pt-1">
                                <button type="button" onClick={() => setMode('FORGOT')} className="text-xs font-bold text-stone-400 hover:text-orange-500 transition-colors">
                                    ลืมรหัสผ่าน?
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed ${
                        mode === 'LOGIN' ? 'bg-gradient-to-r from-orange-400 to-pink-500 shadow-orange-200' : 
                        mode === 'REGISTER' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 shadow-blue-200' :
                        'bg-stone-700 hover:bg-stone-800'
                    }`}
                >
                    {loading ? (
                        <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> รอสักครู่...</span>
                    ) : (
                        <>
                            {mode === 'LOGIN' && <><LogIn size={20}/> เข้าสู่ระบบ</>}
                            {mode === 'REGISTER' && <><UserPlus size={20}/> สมัครสมาชิก</>}
                            {mode === 'FORGOT' && <><HelpCircle size={20}/> ส่งลิงก์กู้รหัส</>}
                        </>
                    )}
                </button>

            </form>

            {/* Footer / Switch Mode */}
            <div className="mt-8 text-center space-y-2">
                {mode === 'LOGIN' ? (
                    <p className="text-stone-500 font-medium text-sm">
                        ยังไม่มีบัญชีหรอ? <br/>
                        <button onClick={() => setMode('REGISTER')} className="text-orange-500 font-black hover:underline mt-1 inline-flex items-center gap-1">
                            สมัครสมาชิกฟรี <ArrowRight size={14}/>
                        </button>
                    </p>
                ) : mode === 'REGISTER' ? (
                    <p className="text-stone-500 font-medium text-sm">
                        มีบัญชีอยู่แล้ว? <br/>
                        <button onClick={() => setMode('LOGIN')} className="text-blue-500 font-black hover:underline mt-1 inline-flex items-center gap-1">
                            เข้าสู่ระบบเลย <ArrowRight size={14}/>
                        </button>
                    </p>
                ) : (
                    <button onClick={() => setMode('LOGIN')} className="text-stone-500 font-bold hover:text-stone-700 inline-flex items-center gap-1 text-sm">
                        <ChevronLeft size={16}/> กลับไปหน้าเข้าสู่ระบบ
                    </button>
                )}
            </div>

        </div>
      </div>
      
      <p className="mt-8 text-stone-400 text-xs font-medium text-center max-w-xs">
          © 2024 Toast Master Profit Pro. <br/> ระบบบริหารร้านค้าที่เข้าใจคนทำธุรกิจ
      </p>
    </div>
  );
};

export default AuthScreen;
