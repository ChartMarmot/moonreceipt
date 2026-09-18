// MOONRECEIPT — interactions
(function () {
  "use strict";

  /* -----------------------------------------------------------
     Simple printer "beep" using Web Audio API (no external assets)
  ----------------------------------------------------------- */
  function playPrintSound() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const now = ctx.currentTime;

      // three quick clicks, like a thermal printer feeding paper
      [0, 0.09, 0.18].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(320, now + offset);
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.05, now + offset + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.06);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.08);
      });

      // close the context shortly after to free resources
      setTimeout(() => ctx.close().catch(() => {}), 500);
    } catch (e) {
      // audio isn't critical to the experience — fail silently
    }
  }

  /* -----------------------------------------------------------
     "Print my receipt" button
  ----------------------------------------------------------- */
  const printBtn = document.getElementById("print-btn");
  const printStatus = document.getElementById("print-status");
  const irBar = document.querySelector(".ir-bar-fill");
  const txNumberEl = document.getElementById("tx-number");
  const irStatusEl = document.getElementById("ir-status");

  let printCount = 0;

  if (printBtn) {
    printBtn.addEventListener("click", function () {
      printCount += 1;

      // animate the FOMO bar filling
      if (irBar) {
        irBar.classList.remove("filled");
        // force reflow so the animation can retrigger
        void irBar.offsetWidth;
        irBar.classList.add("filled");
      }

      // bump the transaction number
      if (txNumberEl) {
        const txId = String(printCount).padStart(6, "0");
        txNumberEl.textContent = "TRANSACTION #" + txId;
      }

      if (irStatusEl) {
        irStatusEl.textContent = "STILL HERE";
      }

      // brief physical "shake" on the receipt card
      const card = document.querySelector(".interactive-receipt");
      if (card) {
        card.style.transition = "transform 0.12s ease";
        card.style.transform = "translateY(2px)";
        setTimeout(() => {
          card.style.transform = "translateY(0)";
        }, 120);
      }

      playPrintSound();

      if (printStatus) {
        printStatus.textContent = "RECEIPT PRINTED \u2713";
        printStatus.style.opacity = "1";
        clearTimeout(printStatus._fadeTimer);
        printStatus._fadeTimer = setTimeout(() => {
          printStatus.style.transition = "opacity 0.6s ease";
          printStatus.style.opacity = "0";
        }, 2200);
      }
    });
  }

  /* -----------------------------------------------------------
     Scroll cue in the hero scrolls to the next section
  ----------------------------------------------------------- */
  const scrollCue = document.getElementById("scroll-cue");
  if (scrollCue) {
    scrollCue.addEventListener("click", function () {
      const target = document.getElementById("the-receipt");
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* -----------------------------------------------------------
     Hide the scroll cue once the visitor starts scrolling
  ----------------------------------------------------------- */
  let cueHidden = false;
  window.addEventListener(
    "scroll",
    function () {
      if (cueHidden || !scrollCue) return;
      if (window.scrollY > 80) {
        scrollCue.style.transition = "opacity 0.3s ease";
        scrollCue.style.opacity = "0";
        scrollCue.style.pointerEvents = "none";
        cueHidden = true;
      }
    },
    { passive: true }
  );
})();
