export default {
  // iOS Properties
  dismissButtonStyle: 'cancel',
  preferredBarTintColor: '#453AA4',
  preferredControlTintColor: 'white',
  readerMode: false,
  animated: true,
  modalPresentationStyle: 'fullScreen',
  modalTransitionStyle: 'coverVertical',
  modalEnabled: true,
  enableBarCollapsing: false,
  // Android Properties
  showTitle: true,
  enableUrlBarHiding: true,
  enableDefaultShare: true,
  forceCloseOnRedirection: true,
  animations: {
    startEnter: 'slide_in_right',
    startExit: 'slide_out_left',
    endEnter: 'slide_in_left',
    endExit: 'slide_out_right',
  },
};
