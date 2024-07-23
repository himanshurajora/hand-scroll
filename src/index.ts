import { app, BrowserWindow, nativeImage, ipcMain, Tray, Menu } from "electron";
import { HandPosResult } from "./types";
import { scrollMouse } from "robotjs";
import * as path from "path";
import isDev from "electron-is-dev";

const iconPath = isDev
  ? "./assets/icons/logo.png"
  : path.join(__dirname, `../assets/icons/logo.png}`);

const createWindow = () => {
  console.log({ iconPath });
  const win = new BrowserWindow({
    width: 100,
    height: 100,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
    },
    // NOTE: comment out the line below to see the window
    show: false,
  });

  win.loadFile("index.html");

  let ses = win.webContents.session;
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === "media") return callback(true);
  });
};

app.whenReady().then(() => {
  createWindow();

  const icon = nativeImage.createFromPath(iconPath);
  const tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Toggle scrolling",
      type: "normal",
      toolTip: "Toggle scrolling",
      click: () => {
        isScrollingDisabled = !isScrollingDisabled;
      },
    },
    {
      label: "Quit",
      type: "normal",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip("Hand Scroll");
  tray.setContextMenu(contextMenu);

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
const FINGER_THRESHOLD = 5;

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

  isWristStable =
    diffX < WRIST_STABLE_THRESHOLD && diffY < WRIST_STABLE_THRESHOLD;

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

  if (!isScrollingDisabled && isWristStable && now - lastCheckedAt > 20) {
    const indexFingerDiffY = Math.abs(
      indexFingerTipPos.y - indexFingerLastPos.y
    );
    const middleFingerDiffY = Math.abs(
      middleFingerTipPos.y - middleFingerLastPos.y
    );

    if (indexFingerDiffY > FINGER_THRESHOLD) {
      scrollUp = true;
      scrollDown = false;
    } else if (middleFingerDiffY > FINGER_THRESHOLD) {
      scrollDown = true;
      scrollUp = false;
    }

    if (scrollUp && scrollDown) {
      scrollUp = false;
      scrollDown = false;
    }

    if (scrollUp) {
      scrollMouse(0, 1.8);
    }

    if (scrollDown) {
      scrollMouse(0, -1.8);
    }

    scrollUp = false;
    scrollDown = false;
    indexFingerLastPos = indexFingerTipPos;
    middleFingerLastPos = middleFingerTipPos;
    lastCheckedAt = now;
  }
});
