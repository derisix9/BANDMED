import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { OperationStatusModal } from '../components/OperationStatusModal';
import { hasPermission } from '../utils/permissions';
import { dbService } from '../services/db';
import { UserRole } from '../types';

export class PermissionDeniedError extends Error {
  constructor(message = 'Acesso não autorizado: Esta operação está desabilitada para o seu perfil nas permissões do sistema.') {
    super(message);
    this.name = 'PermissionDeniedError';
  }
}

export interface GlobalOperationOptions {
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  errorDetails?: string;
  minDuration?: number;
  successDuration?: number;
  errorDuration?: number;
  requiredRule?: string;
  userRole?: string | UserRole;
  onSuccess?: () => void;
  onError?: (err: any) => void;
}

interface OperationState {
  isOpen: boolean;
  status: 'loading' | 'success' | 'error' | 'idle';
  loadingMessage: string;
  successMessage: string;
  errorMessage?: string;
  errorDetails?: string;
}

type OperationListener = (state: OperationState) => void;

class OperationEventManager {
  private listeners: Set<OperationListener> = new Set();
  private currentState: OperationState = {
    isOpen: false,
    status: 'idle',
    loadingMessage: 'A processar operação...',
    successMessage: 'Operação feita com sucesso!',
    errorMessage: 'Operação Não Realizada'
  };

  public subscribe(listener: OperationListener) {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify(newState: Partial<OperationState>) {
    this.currentState = { ...this.currentState, ...newState };
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentState);
      } catch (err) {
        console.error('Erro ao notificar listener de operação:', err);
      }
    });
  }

  public getState() {
    return this.currentState;
  }
}

export const operationManager = new OperationEventManager();

/**
 * Função global para executar qualquer operação de inserção, alteração ou eliminação
 * com efeito de carregamento visual circular e mensagem de confirmação de sucesso (verde)
 * ou erro / bloqueio por permissão (vermelho: "Operação Não Realizada").
 */
export async function runGlobalOperation<T>(
  action: () => Promise<T> | T,
  options?: GlobalOperationOptions
): Promise<T> {
  const loadingMessage = options?.loadingMessage || 'A processar operação...';
  const successMessage = options?.successMessage || 'Operação feita com sucesso!';
  const errorMessage = options?.errorMessage || 'Operação Não Realizada';
  const minDuration = options?.minDuration ?? 650;
  const successDuration = options?.successDuration ?? 1200;
  const errorDuration = options?.errorDuration ?? 2200;

  // 1. Iniciar carregamento circular visual
  operationManager.notify({
    isOpen: true,
    status: 'loading',
    loadingMessage,
    successMessage,
    errorMessage
  });

  const startTime = Date.now();

  // 2. Verificação de permissões RBAC se especificada
  if (options?.requiredRule) {
    const role = options.userRole || dbService.getDatabase()?.currentUser?.role || 'admin';
    const isAllowed = hasPermission(role, options.requiredRule);

    if (!isAllowed) {
      // Manter o carregamento circular pelo tempo mínimo
      const elapsed = Date.now() - startTime;
      if (elapsed < minDuration) {
        await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed));
      }

      // Apresentar modal vermelho com "Operação Não Realizada"
      operationManager.notify({
        isOpen: true,
        status: 'error',
        loadingMessage,
        successMessage: '',
        errorMessage: 'Operação Não Realizada',
        errorDetails:
          options?.errorDetails ||
          `Acesso bloqueado: A permissão [${options.requiredRule}] está desabilitada para o perfil [${role}].`
      });

      await new Promise((resolve) => setTimeout(resolve, errorDuration));

      operationManager.notify({
        isOpen: false,
        status: 'idle'
      });

      const err = new PermissionDeniedError(
        `Ação não permitida: A permissão [${options.requiredRule}] está desabilitada.`
      );
      if (options?.onError) {
        options.onError(err);
      }
      throw err;
    }
  }

  let result: T;

  try {
    result = await action();
    const elapsed = Date.now() - startTime;
    if (elapsed < minDuration) {
      await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed));
    }

    // Sucesso verde
    operationManager.notify({
      isOpen: true,
      status: 'success',
      loadingMessage,
      successMessage,
      errorMessage: ''
    });

    await new Promise((resolve) => setTimeout(resolve, successDuration));

    operationManager.notify({
      isOpen: false,
      status: 'idle'
    });

    if (options?.onSuccess) {
      options.onSuccess();
    }

    return result;
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    if (elapsed < minDuration) {
      await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed));
    }

    // Erro vermelho: "Operação Não Realizada"
    operationManager.notify({
      isOpen: true,
      status: 'error',
      loadingMessage,
      successMessage: '',
      errorMessage: options?.errorMessage || 'Operação Não Realizada',
      errorDetails: error?.message || options?.errorDetails || 'Não foi possível concluir a ação pretendida.'
    });

    await new Promise((resolve) => setTimeout(resolve, errorDuration));

    operationManager.notify({
      isOpen: false,
      status: 'idle'
    });

    if (options?.onError) {
      options.onError(error);
    }
    throw error;
  }
}

interface OperationContextType {
  runOperation: <T>(action: () => Promise<T> | T, options?: GlobalOperationOptions) => Promise<T>;
  isOperating: boolean;
  status: 'loading' | 'success' | 'error' | 'idle';
  loadingMessage: string;
  successMessage: string;
  errorMessage?: string;
  errorDetails?: string;
}

const OperationContext = createContext<OperationContextType>({
  runOperation: runGlobalOperation,
  isOperating: false,
  status: 'idle',
  loadingMessage: 'A processar operação...',
  successMessage: 'Operação feita com sucesso!',
  errorMessage: 'Operação Não Realizada'
});

export const OperationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [opState, setOpState] = useState<OperationState>(() => operationManager.getState());

  useEffect(() => {
    return operationManager.subscribe((state) => {
      setOpState(state);
    });
  }, []);

  const runOperation = useCallback(
    <T,>(action: () => Promise<T> | T, options?: GlobalOperationOptions) => {
      return runGlobalOperation<T>(action, options);
    },
    []
  );

  return (
    <OperationContext.Provider
      value={{
        runOperation,
        isOperating: opState.status === 'loading',
        status: opState.status,
        loadingMessage: opState.loadingMessage,
        successMessage: opState.successMessage,
        errorMessage: opState.errorMessage,
        errorDetails: opState.errorDetails
      }}
    >
      {children}

      <OperationStatusModal
        isOpen={opState.isOpen && opState.status !== 'idle'}
        status={opState.status === 'loading' ? 'loading' : opState.status === 'error' ? 'error' : 'success'}
        loadingMessage={opState.loadingMessage}
        successMessage={opState.successMessage}
        errorMessage={opState.errorMessage}
        errorDetails={opState.errorDetails}
      />
    </OperationContext.Provider>
  );
};

export const useGlobalOperation = () => useContext(OperationContext);

export { AsyncButton } from '../components/AsyncButton';
