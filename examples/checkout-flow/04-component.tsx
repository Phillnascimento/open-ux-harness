import React from 'react';

export type CheckoutState = 'default' | 'empty' | 'loading' | 'error';

interface CheckoutCardProps {
  state: CheckoutState;
  amount?: number;
  errorMessage?: string;
  onRetry?: () => void;
  onAddPaymentMethod?: () => void;
  onConfirm?: () => void;
}

export const CheckoutPaymentCard: React.FC<CheckoutCardProps> = ({
  state,
  amount = 149.90,
  errorMessage = 'Não foi possível autorizar o cartão. Verifique o limite ou tente outra forma.',
  onRetry,
  onAddPaymentMethod,
  onConfirm
}) => {
  // 1. Estado de Carregamento (Loading / Skeleton)
  if (state === 'loading') {
    return (
      <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col gap-4 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-8 bg-slate-200 rounded w-2/3" />
        <div className="h-12 bg-slate-200 rounded w-full" />
      </div>
    );
  }

  // 2. Estado Vazio (Empty State)
  if (state === 'empty') {
    return (
      <div className="p-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
          💳
        </div>
        <div>
          <h4 className="text-base font-semibold text-slate-900">Nenhum meio de pagamento salvo</h4>
          <p className="text-sm text-slate-600 mt-1">Adicione um cartão de crédito ou use Pix para concluir seu pedido.</p>
        </div>
        <button
          onClick={onAddPaymentMethod}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px]"
        >
          Adicionar Cartão
        </button>
      </div>
    );
  }

  // 3. Estado de Erro (Error State)
  if (state === 'error') {
    return (
      <div className="p-4 rounded-lg border border-red-300 bg-red-50 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="text-red-600 text-xl">⚠️</span>
          <div>
            <h4 className="text-sm font-bold text-red-900">Falha no Pagamento</h4>
            <p className="text-sm text-red-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
        <button
          onClick={onRetry}
          className="self-end px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px]"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // 4. Estado Padrão (Default / Happy Path)
  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-600">Total a Pagar</span>
        <span className="text-xl font-bold text-slate-900">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
        </span>
      </div>
      <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-lg">💳</span>
          <div>
            <p className="text-sm font-medium text-slate-900">Mastercard final 4092</p>
            <p className="text-xs text-slate-500">Expira em 08/29</p>
          </div>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">Principal</span>
      </div>
      <button
        onClick={onConfirm}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-lg shadow-sm transition-colors min-h-[44px]"
      >
        Pagar com 1-Clique
      </button>
    </div>
  );
};
