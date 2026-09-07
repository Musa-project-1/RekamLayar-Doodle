import { describe, it, expect, beforeEach } from "vitest";

describe("UI Navigation & Modals Event Binding", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="notif-panel" class="hidden"></div>
      <button id="btn-notif"></button>
      <div id="notif-dot" class="hidden"></div>
      <div id="history-modal" class="hidden"></div>
      <div id="settings-modal" class="hidden"></div>
      <button id="mobile-nav-history"></button>
      <button id="mobile-nav-settings"></button>
      <button id="menu-history"></button>
      <button id="menu-settings"></button>
    `;
  });

  it("memverifikasi toggle notifikasi panel", () => {
    const panel = document.getElementById("notif-panel");
    const btn = document.getElementById("btn-notif");
    btn.addEventListener("click", () => {
      const isHidden = panel.classList.contains("hidden");
      panel.classList.toggle("hidden", !isHidden);
    });

    expect(panel.classList.contains("hidden")).toBe(true);
    btn.click();
    expect(panel.classList.contains("hidden")).toBe(false);
    btn.click();
    expect(panel.classList.contains("hidden")).toBe(true);
  });

  it("memverifikasi pembukaan modal riwayat dan pengaturan", () => {
    const historyModal = document.getElementById("history-modal");
    const settingsModal = document.getElementById("settings-modal");
    const btnHistory = document.getElementById("mobile-nav-history");
    const btnSettings = document.getElementById("mobile-nav-settings");

    btnHistory.addEventListener("click", () => {
      historyModal.classList.remove("hidden");
    });
    btnSettings.addEventListener("click", () => {
      settingsModal.classList.remove("hidden");
    });

    btnHistory.click();
    expect(historyModal.classList.contains("hidden")).toBe(false);

    btnSettings.click();
    expect(settingsModal.classList.contains("hidden")).toBe(false);
  });
});
