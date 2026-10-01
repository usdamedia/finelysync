import React from 'react';
import { Settings, Clock } from 'lucide-react';
import { Logo } from '../components/Logo';

const Maintenance: React.FC = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background aesthetic */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow delay-1000"></div>

            <div className="max-w-md w-full bg-surface/80 backdrop-blur-xl border border-white/10 dark:border-white/5 p-8 md:p-10 rounded-[40px] shadow-2xl relative z-10 text-center animate-scale-in">
                
                <div className="w-24 h-24 mx-auto bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-10 relative">
                    <Logo className="w-12 h-12" />
                    
                    {/* Roda Besar */}
                    <div className="absolute -bottom-5 right-3 w-12 h-12 bg-surface rounded-full flex items-center justify-center shadow-lg border border-outline/10 text-blue-500 z-0">
                        <Settings className="w-6 h-6 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }} />
                    </div>

                    {/* Roda Kecil */}
                    <div className="absolute -bottom-2 -right-3 w-10 h-10 bg-surface rounded-full flex items-center justify-center shadow-xl border border-outline/10 text-orange-500 z-10">
                        <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                </div>

                <h1 className="type-title1 text-onSurface mb-3">
                    Mod Penyelenggaraan
                </h1>
                
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-widest mb-6 border border-orange-200 dark:border-orange-800">
                    <Clock size={14} />
                    Today 3 April 2026
                </div>

                <p className="text-sm text-onSurfaceVariant/80 leading-relaxed mb-8">
                    Sistem FinelySync kini dalam mod penyelenggaraan untuk proses naik taraf pangkalan data dan keselamatan pelayan. Kami memohon maaf atas sebarang kesulitan. Anda tidak dapat mengakses sistem dan log masuk buat masa ini.
                </p>


            </div>
            
            <p className="text-[10px] font-bold text-onSurfaceVariant/40 uppercase tracking-widest mt-12 relative z-10">
                &copy; 2026 FinelySync
            </p>
        </div>
    );
};

export default Maintenance;
