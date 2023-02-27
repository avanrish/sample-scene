import { ILoadingScreen } from '@babylonjs/core';
import useStore from './store';

export class CustomLoadingScreen implements ILoadingScreen {
  loadingUIBackgroundColor!: string;
  loadingUIText!: string;

  displayLoadingUI(): void {
    useStore.setState({ displayLoading: true, hideElement: false });
  }
  hideLoadingUI(): void {
    useStore.setState({ displayLoading: false });
  }
}
