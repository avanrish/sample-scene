import { shallow } from 'zustand/shallow';
import useStore from '../store';

export default function LoadingScreen() {
  const [displayLoading, hideElement] = useStore(
    (state: any) => [state.displayLoading, state.hideElement],
    shallow
  );

  return (
    <div
      className={`absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-slate-600 text-neutral-800 ${
        hideElement && '!hidden'
      } ${!displayLoading && 'opacity-0 transition-opacity duration-1000 ease-in-out -z-10'}`}
    >
      <span className="text-4xl text-white mb-4">Loading</span>
      <span className="loader scale-150"></span>
    </div>
  );
}
