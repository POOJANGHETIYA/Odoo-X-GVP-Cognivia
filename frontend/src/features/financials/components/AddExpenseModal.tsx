import React from 'react';
import { X } from 'lucide-react';

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: any) => void;
}

export function AddExpenseModal({ isOpen, onClose, onCreate }: AddExpenseModalProps) {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = Object.fromEntries(formData.entries());
        onCreate(data);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1d2e] w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white tracking-tight">New Expense</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trip ID</label>
                        <input
                            name="trip_id"
                            required
                            placeholder="e.g. TRP-9283"
                            className="w-full bg-[#23273e] border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3bb273]/50 focus:border-[#3bb273]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Driver</label>
                        <input
                            name="driver"
                            required
                            placeholder="Search driver name..."
                            className="w-full bg-[#23273e] border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3bb273]/50 focus:border-[#3bb273]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fuel Cost</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                <input
                                    name="fuel_cost"
                                    type="number"
                                    required
                                    placeholder="0.00"
                                    className="w-full bg-[#23273e] border border-slate-600 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3bb273]/50 focus:border-[#3bb273]"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Misc Expense</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                                <input
                                    name="misc_expense"
                                    type="number"
                                    required
                                    placeholder="0.00"
                                    className="w-full bg-[#23273e] border border-slate-600 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3bb273]/50 focus:border-[#3bb273]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-600 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-[#3bb273] text-white font-bold rounded-lg hover:bg-[#329a63] transition-colors shadow-lg shadow-[#3bb273]/20"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
