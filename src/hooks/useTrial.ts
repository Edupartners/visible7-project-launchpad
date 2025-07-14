import { usePersistedState } from './usePersistedState';

interface TrialState {
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number;
}

const TRIAL_DURATION_DAYS = 15;

export function useTrial() {
  const [trialState, setTrialState] = usePersistedState<TrialState>('trial_state', {
    isActive: false,
    startDate: null,
    endDate: null,
    daysRemaining: 0,
  });

  const startTrial = () => {
    const now = new Date();
    const endDate = new Date(now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);
    
    setTrialState({
      isActive: true,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      daysRemaining: TRIAL_DURATION_DAYS,
    });
  };

  const checkTrialStatus = (): TrialState => {
    if (!trialState.startDate || !trialState.endDate) {
      return { ...trialState, isActive: false, daysRemaining: 0 };
    }

    const now = new Date();
    const endDate = new Date(trialState.endDate);
    
    if (now > endDate) {
      const expiredState = { ...trialState, isActive: false, daysRemaining: 0 };
      setTrialState(expiredState);
      return expiredState;
    }

    const timeRemaining = endDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
    
    const updatedState = { ...trialState, daysRemaining };
    setTrialState(updatedState);
    return updatedState;
  };

  const endTrial = () => {
    setTrialState({
      isActive: false,
      startDate: null,
      endDate: null,
      daysRemaining: 0,
    });
  };

  const currentStatus = checkTrialStatus();

  return {
    ...currentStatus,
    startTrial,
    endTrial,
    checkTrialStatus,
  };
}