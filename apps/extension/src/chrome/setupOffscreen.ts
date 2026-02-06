import { chromeApi } from '../browser';

let creating: Promise<void> | null = null;

export async function setupOffscreenDocument(path: string) {
  const chrome = chromeApi();

  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return;
  }

  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: path,
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Playing alarm sounds when timers finish'
    });
    await creating;
    creating = null;
  }
}
