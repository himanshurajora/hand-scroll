import { app, BrowserWindow, ipcMain, Result } from "electron";
import { HandPosResult } from "./types";
import { scrollMouse } from "robotjs";
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");

  let ses = win.webContents.session;
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true);
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("ready", () => {
  console.log("ready");
});

let isWristStable = false;
let wristLastPos = { x: 0, y: 0 };

// index finger diff between mcp and tip between last 500 miliseconds
const FINGER_THRESHOLD = 20;

let indexFingerLastPos = { x: 0, y: 0 };
let middleFingerLastPos = { x: 0, y: 0 };

let scrollDown = false;
let scrollUp = false;

const WRIST_STABLE_THRESHOLD = 4;

let lastCheckedAt = Date.now();
let isScrollingDisabled = false;

ipcMain.on("hands", (event, args: HandPosResult[]) => {
  let now = Date.now();
  // if difference between last wrist position and current wrist position is less than WRIST_STABLE_THRESHOLD, then wrist is stable
  const wristPos = args?.[0]?.wrist;
  if (!wristPos) {
    isWristStable = false;
    return;
  }

  const diffX = Math.abs(wristLastPos.x - wristPos.x);
  const diffY = Math.abs(wristLastPos.y - wristPos.y);

  if (diffX < WRIST_STABLE_THRESHOLD && diffY < WRIST_STABLE_THRESHOLD) {
    isWristStable = true;
  } else {
    isWristStable = false;
  }

  wristLastPos = wristPos;

  // if index finger tip is moving up, scroll up
  const indexFingerTipPos = args?.[0]?.index_finger_tip;
  if (!indexFingerTipPos) {
    return;
  }

  // if middle finger tip is moving down, scroll down
  const middleFingerTipPos = args?.[0]?.middle_finger_tip;
  if (!middleFingerTipPos) {
    return;
  }

  if (Math.abs(indexFingerTipPos.z3D) < 0.025) {
    return;
  }

  if (!isScrollingDisabled && isWristStable && now - lastCheckedAt > 100) {
    if (
      Math.abs(indexFingerTipPos.y - indexFingerLastPos.y) > FINGER_THRESHOLD
    ) {
      scrollUp = true;
      scrollDown = false;
    }
    if (
      Math.abs(middleFingerTipPos.y - middleFingerLastPos.y) > FINGER_THRESHOLD
    ) {
      scrollDown = true;
      scrollUp = false;
    }

    if (scrollUp && scrollDown) {
      scrollUp = false;
      scrollDown = false;
    }

    if (scrollUp) {
      scrollMouse(0, 3);
    }

    if (scrollDown) {
      scrollMouse(0, -3);
    }

    scrollUp = false;
    scrollDown = false;
    indexFingerLastPos = indexFingerTipPos;
    middleFingerLastPos = middleFingerTipPos;
    lastCheckedAt = now;
  }
});
