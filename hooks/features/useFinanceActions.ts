
import React from 'react';
import { supabase } from '../../lib/supabase';
import { AppState, LedgerItem } from '../../types';

export const useFinanceActions = (
    state: AppState,
    setState: React.Dispatch<React.SetStateAction<AppState>>,
    targetId: string | undefined
) => {

    const addLedgerItem = async (item: Omit<LedgerItem, 'id'>) => {
        if (!targetId) return;
        const { data } = await supabase.from('ledger').insert({
            user_id: targetId,
            title: item.title,
            amount: item.amount,
            type: item.type,
            category: item.category,
            channel: item.channel,
            transaction_date: item.date,
            slip_image: item.slipImage,
            note: item.note
        }).select().single();

        if (data) {
            setState(prev => ({ ...prev, ledger: [{ 
                id: data.id, title: data.title, amount: data.amount, type: data.type, category: data.category, channel: data.channel, date: data.transaction_date, slipImage: data.slip_image, note: data.note 
            }, ...prev.ledger] }));
        }
    };

    const updateLedgerItem = async (id: string, updates: Partial<LedgerItem>) => {
        if (!targetId) return;
        setState(prev => ({ ...prev, ledger: prev.ledger.map(l => l.id === id ? { ...l, ...updates } : l) }));
        
        const payload: any = {};
        if (updates.title) payload.title = updates.title;
        if (updates.amount) payload.amount = updates.amount;
        if (updates.category) payload.category = updates.category;
        if (updates.date) payload.transaction_date = updates.date;
        if (updates.channel) payload.channel = updates.channel;
        
        await supabase.from('ledger').update(payload).eq('id', id);
    };

    const deleteLedgerItem = async (id: string) => {
        setState(prev => ({ ...prev, ledger: prev.ledger.filter(l => l.id !== id) }));
        if (targetId) await supabase.from('ledger').delete().eq('id', id);
    };

    return {
        addLedgerItem,
        updateLedgerItem,
        deleteLedgerItem
    };
};
