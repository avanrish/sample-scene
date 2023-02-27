import { create } from 'zustand';

const useStore = create((set, get) => ({
  displayLoading: false,
  hideElement: false,
}));

export default useStore;
